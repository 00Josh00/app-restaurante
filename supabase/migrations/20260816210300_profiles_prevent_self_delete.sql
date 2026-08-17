-- ============================================================
-- Regla de negocio: un usuario no puede eliminar su propia cuenta
-- (previene lock-out del propio admin). Complementa el guard de
-- la API; funciona cuando auth.uid() está presente (RLS).
-- El borrado por service role (admin.auth.deleteUser) tiene
-- auth.uid() = null, por lo que no se bloquea.
-- ============================================================

create or replace function public.profiles_prevent_self_delete()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if auth.uid() = old.id then
    raise exception 'No puedes eliminar tu propia cuenta';
  end if;
  return old;
end;
$$;

drop trigger if exists profiles_prevent_self_delete on public.profiles;
create trigger profiles_prevent_self_delete
  before delete on public.profiles
  for each row execute function public.profiles_prevent_self_delete();

revoke all on function public.profiles_prevent_self_delete() from anon, public, authenticated;
