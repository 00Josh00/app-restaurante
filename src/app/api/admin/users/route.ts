import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

type AppRole = 'admin' | 'waiter' | 'cook'

const ROLES: AppRole[] = ['admin', 'waiter', 'cook']

async function getAdminUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null
  const { data } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  return data?.role === 'admin' ? user : null
}

function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 })
}

export async function POST(req: Request) {
  const adminUser = await getAdminUser()
  if (!adminUser) {
    return NextResponse.json({ error: 'Sin permiso' }, { status: 403 })
  }

  const body = (await req.json()) as {
    email?: string
    password?: string
    role?: string
    full_name?: string
  }

  const email = body.email?.trim().toLowerCase() ?? ''
  const password = body.password ?? ''
  const role = (body.role ?? 'waiter') as AppRole
  const full_name = body.full_name?.trim() ?? ''

  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return badRequest('Email inválido')
  if (password.length < 6) return badRequest('La contraseña debe tener al menos 6 caracteres')
  if (!ROLES.includes(role)) return badRequest('Rol inválido')

  const admin = createAdminClient()

  const { data: created, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name },
  })

  if (error) return badRequest(error.message)

  const { error: roleError } = await admin
    .from('profiles')
    .update({ role, full_name: full_name || null })
    .eq('id', created.user.id)

  if (roleError) return badRequest(roleError.message)

  return NextResponse.json({ ok: true, id: created.user.id })
}

export async function PUT(req: Request) {
  const adminUser = await getAdminUser()
  if (!adminUser) {
    return NextResponse.json({ error: 'Sin permiso' }, { status: 403 })
  }

  const body = (await req.json()) as { id?: string; role?: AppRole; full_name?: string }
  if (!body.id) return badRequest('Falta el usuario')
  if (body.role && !ROLES.includes(body.role)) return badRequest('Rol inválido')

  // Un admin no puede cambiar su propio rol (evita lock-out)
  if (body.id === adminUser.id && body.role && body.role !== 'admin') {
    return badRequest('No puedes cambiar tu propio rol')
  }

  const admin = createAdminClient()
  const payload: { role?: AppRole; full_name?: string | null } = {}
  if (body.role) payload.role = body.role
  if (body.full_name !== undefined) payload.full_name = body.full_name.trim() || null

  const { error } = await admin.from('profiles').update(payload).eq('id', body.id)
  if (error) return badRequest(error.message)

  return NextResponse.json({ ok: true })
}

export async function DELETE(req: Request) {
  const adminUser = await getAdminUser()
  if (!adminUser) {
    return NextResponse.json({ error: 'Sin permiso' }, { status: 403 })
  }

  const body = (await req.json()) as { id?: string }
  if (!body.id) return badRequest('Falta el usuario')
  if (body.id === adminUser.id) return badRequest('No puedes eliminar tu propia cuenta')

  const admin = createAdminClient()
  const { error } = await admin.auth.admin.deleteUser(body.id)
  if (error) return badRequest(error.message)

  return NextResponse.json({ ok: true })
}