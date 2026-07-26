-- Corrige a RPC create_missing_profile removendo tenant_id (coluna inexistente)
create or replace function create_missing_profile(
  p_user_id uuid,
  p_email text,
  p_name text,
  p_church_name text
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_church_id uuid;
  v_slug text;
  v_existing_church_id uuid;
begin
  select church_id into v_existing_church_id from public.users where id = p_user_id;
  if v_existing_church_id is not null then
    return jsonb_build_object('ok', true, 'church_id', v_existing_church_id, 'created', false);
  end if;

  v_slug := lower(regexp_replace(coalesce(p_church_name, 'igreja'), '[^a-z0-9]+', '-', 'gi'))
            || '-' || substring(gen_random_uuid()::text, 1, 6);

  insert into public.churches (name, slug, plan, created_by)
  values (coalesce(p_church_name, 'Minha Igreja'), v_slug, 'free', p_user_id)
  returning id into v_church_id;

  insert into public.users (id, church_id, email, name, role, created_by)
  values (p_user_id, v_church_id, coalesce(p_email, ''), coalesce(p_name, 'Usuário'), 'church_admin', p_user_id)
  on conflict (id) do update set
    church_id = excluded.church_id,
    email = excluded.email,
    name = excluded.name;

  return jsonb_build_object('ok', true, 'church_id', v_church_id, 'created', true);
end;
$$;
