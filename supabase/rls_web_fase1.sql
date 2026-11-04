-- Fase 1: tablas exclusivas del sitio público y perfiles de acceso.
-- Se dejan fuera productos, cotizaciones, inventario, guías y configuración
-- que utiliza la PWA en producción.
-- Aplicada directamente en Supabase el 2026-11-04; este archivo documenta el SQL,
-- pero la ejecución por MCP no crea una entrada en el historial de migraciones.
begin;

create schema if not exists albiz_private;
revoke all on schema albiz_private from public, anon, authenticated;
grant usage on schema albiz_private to authenticated;

create or replace function albiz_private.current_app_role()
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select lower(btrim(u.puesto))
  from public.usuarios as u
  where u.id = (select auth.uid())
    and u.activo is true
  limit 1
$$;

create or replace function albiz_private.is_admin_or_it()
returns boolean
language sql
stable
set search_path = ''
as $$
  select coalesce((select albiz_private.current_app_role()) in ('it', 'admin', 'administrador'), false)
$$;

revoke all on function albiz_private.current_app_role() from public, anon;
revoke all on function albiz_private.is_admin_or_it() from public, anon;
grant execute on function albiz_private.current_app_role() to authenticated;
grant execute on function albiz_private.is_admin_or_it() to authenticated;

-- Reemplaza las políticas permisivas previas en este primer grupo.
do $$
declare
  p record;
begin
  for p in
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and tablename = any (array[
        'usuarios', 'carrusel_inicio', 'marcas', 'buzon_contacto',
        'productos_cableado', 'productos_cajas', 'productos_control',
        'productos_electronica', 'productos_iluminacion',
        'productos_media_tension', 'productos_placas',
        'productos_temporada', 'productos_tuberia'
      ])
  loop
    execute format('drop policy %I on %I.%I', p.policyname, p.schemaname, p.tablename);
  end loop;
end;
$$;

revoke all privileges on table
  public.usuarios, public.carrusel_inicio, public.marcas, public.buzon_contacto,
  public.productos_cableado, public.productos_cajas, public.productos_control,
  public.productos_electronica, public.productos_iluminacion,
  public.productos_media_tension, public.productos_placas,
  public.productos_temporada, public.productos_tuberia
from public, anon, authenticated;

grant select on public.usuarios to authenticated;
grant update (url_imagen) on public.usuarios to authenticated;
grant select on public.carrusel_inicio, public.marcas,
  public.productos_cableado, public.productos_cajas, public.productos_control,
  public.productos_electronica, public.productos_iluminacion,
  public.productos_media_tension, public.productos_placas,
  public.productos_temporada, public.productos_tuberia to anon, authenticated;
grant insert, update, delete on public.carrusel_inicio, public.marcas,
  public.productos_cableado, public.productos_cajas, public.productos_control,
  public.productos_electronica, public.productos_iluminacion,
  public.productos_media_tension, public.productos_placas,
  public.productos_temporada, public.productos_tuberia to authenticated;
grant insert on public.buzon_contacto to anon, authenticated;
grant select, update, delete on public.buzon_contacto to authenticated;

alter table public.usuarios enable row level security;
create policy profile_select_self_or_admin on public.usuarios
  for select to authenticated
  using (id = (select auth.uid()) or (select albiz_private.is_admin_or_it()));
create policy profile_update_own_avatar on public.usuarios
  for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

alter table public.carrusel_inicio enable row level security;
create policy carousel_public_read_active on public.carrusel_inicio
  for select to anon using (coalesce(activa, true));
create policy carousel_authenticated_read_active on public.carrusel_inicio
  for select to authenticated
  using (coalesce(activa, true) or (select albiz_private.is_admin_or_it()));
create policy carousel_admin_insert on public.carrusel_inicio
  for insert to authenticated
  with check ((select albiz_private.is_admin_or_it()));
create policy carousel_admin_update on public.carrusel_inicio
  for update to authenticated
  using ((select albiz_private.is_admin_or_it()))
  with check ((select albiz_private.is_admin_or_it()));
create policy carousel_admin_delete on public.carrusel_inicio
  for delete to authenticated
  using ((select albiz_private.is_admin_or_it()));

alter table public.marcas enable row level security;
create policy brands_public_read on public.marcas
  for select to anon, authenticated using (true);
create policy brands_admin_insert on public.marcas
  for insert to authenticated
  with check ((select albiz_private.is_admin_or_it()));
create policy brands_admin_update on public.marcas
  for update to authenticated
  using ((select albiz_private.is_admin_or_it()))
  with check ((select albiz_private.is_admin_or_it()));
create policy brands_admin_delete on public.marcas
  for delete to authenticated
  using ((select albiz_private.is_admin_or_it()));

alter table public.buzon_contacto enable row level security;
create policy contact_public_insert on public.buzon_contacto
  for insert to anon, authenticated
  with check (
    length(btrim(nombre)) between 2 and 160
    and length(btrim(telefono)) between 7 and 40
    and length(btrim(mensaje)) between 2 and 5000
  );
create policy contact_admin_read on public.buzon_contacto
  for select to authenticated
  using ((select albiz_private.is_admin_or_it()));
create policy contact_admin_update on public.buzon_contacto
  for update to authenticated
  using ((select albiz_private.is_admin_or_it()))
  with check ((select albiz_private.is_admin_or_it()));
create policy contact_admin_delete on public.buzon_contacto
  for delete to authenticated
  using ((select albiz_private.is_admin_or_it()));

do $$
declare
  t text;
begin
  foreach t in array array[
    'productos_cableado', 'productos_cajas', 'productos_control',
    'productos_electronica', 'productos_iluminacion',
    'productos_media_tension', 'productos_placas',
    'productos_temporada', 'productos_tuberia'
  ] loop
    execute format('alter table public.%I enable row level security', t);
    execute format(
      'create policy web_catalog_public_read on public.%I for select to anon, authenticated using (true)', t
    );
    execute format(
      'create policy web_catalog_admin_insert on public.%I for insert to authenticated with check ((select albiz_private.is_admin_or_it()))', t
    );
    execute format(
      'create policy web_catalog_admin_update on public.%I for update to authenticated using ((select albiz_private.is_admin_or_it())) with check ((select albiz_private.is_admin_or_it()))', t
    );
    execute format(
      'create policy web_catalog_admin_delete on public.%I for delete to authenticated using ((select albiz_private.is_admin_or_it()))', t
    );
  end loop;
end;
$$;

commit;
