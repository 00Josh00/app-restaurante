-- ============================================================
-- Evitar que un admin se degrade a sí mismo (lock-out)
-- Bloquea cambios de rol sobre el propio perfil vía RLS
-- (auth.uid()). La API con service role agrega su propio guard
-- en /api/admin/users porque auth.uid() es null en ese contexto.
-- ============================================================

create or replace function public.profiles_prevent_self_role_change()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.role is distinct from old.role and auth.uid() = old.id then
    raise exception 'No puedes cambiar tu propio rol';
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_prevent_self_role_change on public.profiles;
create trigger profiles_prevent_self_role_change
  before update on public.profiles
  for each row execute function public.profiles_prevent_self_role_change();

revoke all on function public.profiles_prevent_self_role_change() from anon, public, authenticated;