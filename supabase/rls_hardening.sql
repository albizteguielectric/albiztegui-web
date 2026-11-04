-- Initial RLS hardening for Albiztegui Electric.
-- Review this script before running it in Supabase SQL Editor. It is not applied automatically.
-- This is the broader plan for tables shared with the PWA. Do not run it as the website-only phase;
-- website phase 1 was applied and is documented in rls_web_fase1.sql.
-- It does not change application data and does not alter Supabase-managed storage tables except policies on storage.objects.

begin;

create schema if not exists albiz_private;
revoke all on schema albiz_private from public, anon, authenticated;
grant usage on schema albiz_private to authenticated;

create or replace function albiz_private.current_app_role()
returns text language sql stable security definer set search_path = ''
as $$
  select lower(btrim(u.puesto))
  from public.usuarios u
  where u.id = (select auth.uid()) and coalesce(u.activo, true)
  limit 1
$$;

create or replace function albiz_private.is_active_staff()
returns boolean language sql stable security definer set search_path = ''
as $$ select coalesce(albiz_private.current_app_role() in (
  'it', 'admin', 'administrador', 'cotizador bodega', 'bodega', 'vendedor mp', 'vendedor tec'
), false) $$;

create or replace function albiz_private.is_admin_or_it()
returns boolean language sql stable security definer set search_path = ''
as $$ select coalesce(albiz_private.current_app_role() in ('admin', 'administrador', 'it'), false) $$;

create or replace function albiz_private.is_it()
returns boolean language sql stable security definer set search_path = ''
as $$ select coalesce(albiz_private.current_app_role() = 'it', false) $$;

create or replace function albiz_private.is_bodega()
returns boolean language sql stable security definer set search_path = ''
as $$ select coalesce(albiz_private.current_app_role() in ('bodega', 'cotizador bodega'), false) $$;

create or replace function albiz_private.is_sales_mp()
returns boolean language sql stable security definer set search_path = ''
as $$ select coalesce(albiz_private.current_app_role() = 'vendedor mp', false) $$;

create or replace function albiz_private.is_sales_tec()
returns boolean language sql stable security definer set search_path = ''
as $$ select coalesce(albiz_private.current_app_role() = 'vendedor tec', false) $$;

revoke all on function albiz_private.current_app_role() from public, anon;
revoke all on function albiz_private.is_active_staff() from public, anon;
revoke all on function albiz_private.is_admin_or_it() from public, anon;
revoke all on function albiz_private.is_it() from public, anon;
revoke all on function albiz_private.is_bodega() from public, anon;
revoke all on function albiz_private.is_sales_mp() from public, anon;
revoke all on function albiz_private.is_sales_tec() from public, anon;
grant execute on all functions in schema albiz_private to authenticated;

-- The existing DDL event-trigger helper is not an application API.
revoke execute on function public.rls_auto_enable() from public, anon, authenticated;

-- Remove the broad policies found in the current project.
drop policy if exists "Permitir accesos del administrador" on public.carrusel_inicio;
drop policy if exists "Permitir lectura publica" on public.carrusel_inicio;
drop policy if exists "Acceso total cotizaciones" on public.cotizaciones;
drop policy if exists "Acceso total articulos" on public.cotizaciones_articulos;
drop policy if exists "Lectura pública de guia_motores" on public.guia_motores;
drop policy if exists "Acceso Total Marcas" on public.marcas;
drop policy if exists "Permitir lectura publica de productos" on public.productos;
drop policy if exists "Lectura publica en productos_cajas" on public.productos_cajas;
drop policy if exists "Lectura publica en productos_control" on public.productos_control;
drop policy if exists "Lectura publica en productos_electronica" on public.productos_electronica;
drop policy if exists "Lectura publica en productos_iluminacion" on public.productos_iluminacion;
drop policy if exists "Lectura publica en productos_media_tension" on public.productos_media_tension;
drop policy if exists "Lectura publica en productos_placas" on public.productos_placas;
drop policy if exists "Lectura publica en productos_temporada" on public.productos_temporada;
drop policy if exists "Lectura publica en productos_tuberia" on public.productos_tuberia;
drop policy if exists "Permitir todo en soporte" on public.soporte_tickets;
drop policy if exists "Permitir subir archivos en marcas-logos" on storage.objects;
drop policy if exists "Permitir subir fotos" on storage.objects;
drop policy if exists "Permitir ver archivos en marcas-logos" on storage.objects;
drop policy if exists "Permitir ver fotos" on storage.objects;

-- Remove every existing policy from these application tables before defining
-- the reviewed policy set. PostgreSQL combines permissive policies with OR,
-- so leaving an unknown old policy in place could reopen an access path.
do $$
declare
  table_name text;
  policy_name text;
begin
  foreach table_name in array array[
    'ampacidad', 'buzon_contacto', 'carrusel_inicio', 'clientes_bodega',
    'configuracion_sistema', 'configuracion_tienda', 'cotizaciones',
    'cotizaciones_articulos', 'cotizaciones_articulos_bodega', 'cotizaciones_bodega',
    'dashboard_mensajes', 'existencias_mp', 'guia_cables', 'guia_motores', 'marcas',
    'paquetes', 'productos', 'productos_cableado', 'productos_cajas',
    'productos_control', 'productos_electronica', 'productos_iluminacion',
    'productos_media_tension', 'productos_placas', 'productos_temporada',
    'productos_tuberia', 'productostec', 'promociones', 'soporte_tickets', 'usuarios'
  ] loop
    for policy_name in
      select polname from pg_policy where polrelid = format('public.%I', table_name)::regclass
    loop
      execute format('drop policy %I on public.%I', policy_name, table_name);
    end loop;
  end loop;

  for policy_name in
    select polname from pg_policy where polrelid = 'storage.objects'::regclass
  loop
    execute format('drop policy %I on storage.objects', policy_name);
  end loop;
end;
$$;

alter table public.ampacidad enable row level security;
alter table public.buzon_contacto enable row level security;
alter table public.carrusel_inicio enable row level security;
alter table public.clientes_bodega enable row level security;
alter table public.configuracion_sistema enable row level security;
alter table public.configuracion_tienda enable row level security;
alter table public.cotizaciones enable row level security;
alter table public.cotizaciones_articulos enable row level security;
alter table public.cotizaciones_articulos_bodega enable row level security;
alter table public.cotizaciones_bodega enable row level security;
alter table public.dashboard_mensajes enable row level security;
alter table public.existencias_mp enable row level security;
alter table public.guia_cables enable row level security;
alter table public.guia_motores enable row level security;
alter table public.marcas enable row level security;
alter table public.paquetes enable row level security;
alter table public.productos enable row level security;
alter table public.productos_cableado enable row level security;
alter table public.productos_cajas enable row level security;
alter table public.productos_control enable row level security;
alter table public.productos_electronica enable row level security;
alter table public.productos_iluminacion enable row level security;
alter table public.productos_media_tension enable row level security;
alter table public.productos_placas enable row level security;
alter table public.productos_temporada enable row level security;
alter table public.productos_tuberia enable row level security;
alter table public.productostec enable row level security;
alter table public.promociones enable row level security;
alter table public.soporte_tickets enable row level security;
alter table public.usuarios enable row level security;

revoke all on all tables in schema public from public, anon, authenticated;
grant usage on schema public to anon, authenticated;

-- Public fields only. No public or general authenticated SELECT grant on productos.mayoreo.
grant select (codigo, descripcion, precio, existencias, url_imagen) on public.productos to anon, authenticated;
grant select (codigo, existencias) on public.existencias_mp to anon, authenticated;
grant select (codigo, descripcion, precio, existencias, ur_imagen) on public.productostec to anon;
grant select (codigo, existencias) on public.productostec to authenticated;
grant select on public.productos_cableado, public.productos_cajas, public.productos_control,
  public.productos_electronica, public.productos_iluminacion, public.productos_media_tension,
  public.productos_placas, public.productos_temporada, public.productos_tuberia,
  public.marcas, public.carrusel_inicio to anon, authenticated;
grant insert on public.buzon_contacto to anon, authenticated;
grant select (id, modo_mantenimiento) on public.configuracion_sistema to anon, authenticated;

-- Authenticated staff reads.
grant select on public.usuarios, public.clientes_bodega, public.configuracion_tienda,
  public.cotizaciones, public.cotizaciones_articulos, public.cotizaciones_bodega,
  public.cotizaciones_articulos_bodega, public.dashboard_mensajes, public.ampacidad,
  public.guia_cables, public.guia_motores, public.paquetes, public.soporte_tickets to authenticated;
grant update (url_imagen) on public.usuarios to authenticated;
grant select (codigo, descripcion, precio, existencias, url_imagen) on public.productos to authenticated;
grant select (codigo, descripcion, precio, existencias, ur_imagen) on public.productostec to authenticated;
grant select on public.promociones, public.existencias_mp to authenticated;

-- RLS limits these writes to Admin/IT (or IT for tickets below).
grant insert, update, delete on public.carrusel_inicio, public.marcas,
  public.productos_cableado, public.productos_cajas, public.productos_control,
  public.productos_electronica, public.productos_iluminacion, public.productos_media_tension,
  public.productos_placas, public.productos_temporada, public.productos_tuberia,
  public.productos, public.productostec, public.promociones, public.clientes_bodega,
  public.configuracion_sistema, public.configuracion_tienda, public.dashboard_mensajes,
  public.paquetes, public.ampacidad, public.guia_cables, public.guia_motores,
  public.buzon_contacto, public.soporte_tickets, public.cotizaciones,
  public.cotizaciones_articulos, public.cotizaciones_bodega,
  public.cotizaciones_articulos_bodega to authenticated;
grant insert, update, delete on public.existencias_mp to authenticated;

grant usage on sequence
  public.carrusel_inicio_id_seq,
  public.marcas_id_seq,
  public.productos_cableado_id_seq,
  public.productos_cajas_id_seq,
  public.productos_control_id_seq,
  public.productos_electronica_id_seq,
  public.productos_iluminacion_id_seq,
  public.productos_media_tension_id_seq,
  public.productos_placas_id_seq,
  public.productos_temporada_id_seq,
  public.productos_tuberia_id_seq,
  public.ampacidad_id_seq,
  public.paquetes_id_seq,
  public.buzon_contacto_id_seq to authenticated;
grant usage on sequence public.buzon_contacto_id_seq to anon;

-- Public website catalogue; Admin/IT maintain records.
create policy public_catalog_read on public.productos_cableado for select to anon, authenticated using (true);
create policy public_catalog_admin_write on public.productos_cableado for all to authenticated using ((select albiz_private.is_admin_or_it())) with check ((select albiz_private.is_admin_or_it()));
create policy public_catalog_read on public.productos_cajas for select to anon, authenticated using (true);
create policy public_catalog_admin_write on public.productos_cajas for all to authenticated using ((select albiz_private.is_admin_or_it())) with check ((select albiz_private.is_admin_or_it()));
create policy public_catalog_read on public.productos_control for select to anon, authenticated using (true);
create policy public_catalog_admin_write on public.productos_control for all to authenticated using ((select albiz_private.is_admin_or_it())) with check ((select albiz_private.is_admin_or_it()));
create policy public_catalog_read on public.productos_electronica for select to anon, authenticated using (true);
create policy public_catalog_admin_write on public.productos_electronica for all to authenticated using ((select albiz_private.is_admin_or_it())) with check ((select albiz_private.is_admin_or_it()));
create policy public_catalog_read on public.productos_iluminacion for select to anon, authenticated using (true);
create policy public_catalog_admin_write on public.productos_iluminacion for all to authenticated using ((select albiz_private.is_admin_or_it())) with check ((select albiz_private.is_admin_or_it()));
create policy public_catalog_read on public.productos_media_tension for select to anon, authenticated using (true);
create policy public_catalog_admin_write on public.productos_media_tension for all to authenticated using ((select albiz_private.is_admin_or_it())) with check ((select albiz_private.is_admin_or_it()));
create policy public_catalog_read on public.productos_placas for select to anon, authenticated using (true);
create policy public_catalog_admin_write on public.productos_placas for all to authenticated using ((select albiz_private.is_admin_or_it())) with check ((select albiz_private.is_admin_or_it()));
create policy public_catalog_read on public.productos_temporada for select to anon, authenticated using (true);
create policy public_catalog_admin_write on public.productos_temporada for all to authenticated using ((select albiz_private.is_admin_or_it())) with check ((select albiz_private.is_admin_or_it()));
create policy public_catalog_read on public.productos_tuberia for select to anon, authenticated using (true);
create policy public_catalog_admin_write on public.productos_tuberia for all to authenticated using ((select albiz_private.is_admin_or_it())) with check ((select albiz_private.is_admin_or_it()));

create policy public_brand_read on public.marcas for select to anon, authenticated using (true);
create policy admin_brand_write on public.marcas for all to authenticated using ((select albiz_private.is_admin_or_it())) with check ((select albiz_private.is_admin_or_it()));
create policy public_carousel_read on public.carrusel_inicio for select to anon using (coalesce(activa, true));
create policy staff_carousel_read on public.carrusel_inicio for select to authenticated using (coalesce(activa, true) or (select albiz_private.is_admin_or_it()));
create policy admin_carousel_write on public.carrusel_inicio for all to authenticated using ((select albiz_private.is_admin_or_it())) with check ((select albiz_private.is_admin_or_it()));

create policy public_contact_insert on public.buzon_contacto for insert to anon, authenticated with check (
  length(btrim(nombre)) between 2 and 160 and length(btrim(telefono)) between 7 and 40
  and length(btrim(mensaje)) between 2 and 5000
);
create policy admin_contact_read on public.buzon_contacto for select to authenticated using ((select albiz_private.is_admin_or_it()));
create policy admin_contact_update on public.buzon_contacto for update to authenticated using ((select albiz_private.is_admin_or_it())) with check ((select albiz_private.is_admin_or_it()));
create policy admin_contact_delete on public.buzon_contacto for delete to authenticated using ((select albiz_private.is_admin_or_it()));

create policy own_profile_read_or_admin on public.usuarios for select to authenticated using (
  id = (select auth.uid()) or (select albiz_private.is_admin_or_it())
);
create policy own_avatar_update on public.usuarios for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));

create policy staff_read_products on public.productos for select to authenticated using ((select albiz_private.is_active_staff()));
create policy public_read_products on public.productos for select to anon using (true);
create policy admin_write_products on public.productos for all to authenticated using ((select albiz_private.is_admin_or_it())) with check ((select albiz_private.is_admin_or_it()));
create policy allowed_read_productostec on public.productostec for select to authenticated using (
  (select albiz_private.current_app_role()) in ('vendedor tec', 'admin', 'administrador', 'it')
);
create policy public_read_productostec_stock on public.productostec for select to anon using (true);
create policy admin_write_productostec on public.productostec for all to authenticated using ((select albiz_private.is_admin_or_it())) with check ((select albiz_private.is_admin_or_it()));
create policy staff_read_stock on public.existencias_mp for select to authenticated using ((select albiz_private.is_active_staff()));
create policy public_read_stock on public.existencias_mp for select to anon using (true);
create policy admin_write_stock on public.existencias_mp for all to authenticated using ((select albiz_private.is_admin_or_it())) with check ((select albiz_private.is_admin_or_it()));
create policy bodega_read_promotions on public.promociones for select to authenticated using (
  (select albiz_private.current_app_role()) in ('cotizador bodega', 'bodega', 'admin', 'administrador', 'it')
);
create policy admin_write_promotions on public.promociones for all to authenticated using ((select albiz_private.is_admin_or_it())) with check ((select albiz_private.is_admin_or_it()));

create policy public_read_maintenance on public.configuracion_sistema for select to anon using (id = 1);
create policy staff_read_maintenance on public.configuracion_sistema for select to authenticated using (
  (select albiz_private.is_active_staff()) or (select albiz_private.current_app_role()) = 'invitado'
);
create policy admin_write_system_config on public.configuracion_sistema for all to authenticated using ((select albiz_private.is_admin_or_it())) with check ((select albiz_private.is_admin_or_it()));
create policy staff_read_store_config on public.configuracion_tienda for select to authenticated using ((select albiz_private.is_active_staff()));
create policy admin_write_store_config on public.configuracion_tienda for all to authenticated using ((select albiz_private.is_admin_or_it())) with check ((select albiz_private.is_admin_or_it()));
create policy staff_read_dashboard_messages on public.dashboard_mensajes for select to authenticated using ((select albiz_private.is_active_staff()));
create policy admin_write_dashboard_messages on public.dashboard_mensajes for all to authenticated using ((select albiz_private.is_admin_or_it())) with check ((select albiz_private.is_admin_or_it()));
create policy staff_read_packages on public.paquetes for select to authenticated using ((select albiz_private.is_active_staff()));
create policy admin_write_packages on public.paquetes for all to authenticated using ((select albiz_private.is_admin_or_it())) with check ((select albiz_private.is_admin_or_it()));
create policy staff_read_clients on public.clientes_bodega for select to authenticated using (
  (select albiz_private.current_app_role()) in ('cotizador bodega', 'bodega', 'vendedor mp', 'vendedor tec', 'admin', 'administrador', 'it')
);
create policy admin_write_clients on public.clientes_bodega for all to authenticated using ((select albiz_private.is_admin_or_it())) with check ((select albiz_private.is_admin_or_it()));
create policy staff_read_ampacity on public.ampacidad for select to authenticated using ((select albiz_private.is_active_staff()));
create policy admin_write_ampacity on public.ampacidad for all to authenticated using ((select albiz_private.is_admin_or_it())) with check ((select albiz_private.is_admin_or_it()));
create policy staff_read_cable_guide on public.guia_cables for select to authenticated using ((select albiz_private.is_active_staff()));
create policy admin_write_cable_guide on public.guia_cables for all to authenticated using ((select albiz_private.is_admin_or_it())) with check ((select albiz_private.is_admin_or_it()));
create policy staff_read_motor_guide on public.guia_motores for select to authenticated using ((select albiz_private.is_active_staff()));
create policy admin_write_motor_guide on public.guia_motores for all to authenticated using ((select albiz_private.is_admin_or_it())) with check ((select albiz_private.is_admin_or_it()));

create policy staff_create_support_ticket on public.soporte_tickets for insert to authenticated with check ((select albiz_private.is_active_staff()));
create policy it_read_support_tickets on public.soporte_tickets for select to authenticated using ((select albiz_private.is_it()));
create policy it_update_support_tickets on public.soporte_tickets for update to authenticated using ((select albiz_private.is_it())) with check ((select albiz_private.is_it()));
create policy it_delete_support_tickets on public.soporte_tickets for delete to authenticated using ((select albiz_private.is_it()));

create policy quote_read_branch on public.cotizaciones for select to authenticated using (
  (select albiz_private.is_admin_or_it())
  or ((select albiz_private.is_sales_mp()) and lower(coalesce(sucursal, '')) not like '%tec%')
  or ((select albiz_private.is_sales_tec()) and lower(coalesce(sucursal, '')) like '%tec%')
);
create policy quote_create_branch on public.cotizaciones for insert to authenticated with check (
  (select albiz_private.is_admin_or_it())
  or ((select albiz_private.is_sales_mp()) and lower(coalesce(sucursal, '')) not like '%tec%')
  or ((select albiz_private.is_sales_tec()) and lower(coalesce(sucursal, '')) like '%tec%')
);
create policy quote_update_branch on public.cotizaciones for update to authenticated using (
  (select albiz_private.is_admin_or_it())
  or ((select albiz_private.is_sales_mp()) and lower(coalesce(sucursal, '')) not like '%tec%')
  or ((select albiz_private.is_sales_tec()) and lower(coalesce(sucursal, '')) like '%tec%')
) with check (
  (select albiz_private.is_admin_or_it())
  or ((select albiz_private.is_sales_mp()) and lower(coalesce(sucursal, '')) not like '%tec%')
  or ((select albiz_private.is_sales_tec()) and lower(coalesce(sucursal, '')) like '%tec%')
);
create policy admin_delete_quotes on public.cotizaciones for delete to authenticated using ((select albiz_private.is_admin_or_it()));
create policy quote_items_read on public.cotizaciones_articulos for select to authenticated using (exists (select 1 from public.cotizaciones c where c.id = cotizacion_id));
create policy quote_items_create on public.cotizaciones_articulos for insert to authenticated with check (
  exists (select 1 from public.cotizaciones c where c.id = cotizacion_id)
);
create policy quote_items_update_branch on public.cotizaciones_articulos for update to authenticated using (
  exists (select 1 from public.cotizaciones c where c.id = cotizacion_id)
) with check (
  exists (select 1 from public.cotizaciones c where c.id = cotizacion_id)
);
create policy branch_delete_quote_items on public.cotizaciones_articulos for delete to authenticated using (
  (select albiz_private.is_admin_or_it()) or exists (select 1 from public.cotizaciones c where c.id = cotizacion_id)
);

create policy bodega_read_quotes on public.cotizaciones_bodega for select to authenticated using ((select albiz_private.is_admin_or_it()) or (select albiz_private.is_bodega()));
create policy bodega_create_quotes on public.cotizaciones_bodega for insert to authenticated with check ((select albiz_private.is_admin_or_it()) or (select albiz_private.is_bodega()));
create policy bodega_update_quotes on public.cotizaciones_bodega for update to authenticated using ((select albiz_private.is_admin_or_it()) or (select albiz_private.is_bodega())) with check ((select albiz_private.is_admin_or_it()) or (select albiz_private.is_bodega()));
create policy admin_delete_bodega_quotes on public.cotizaciones_bodega for delete to authenticated using ((select albiz_private.is_admin_or_it()));
create policy bodega_read_quote_items on public.cotizaciones_articulos_bodega for select to authenticated using (exists (select 1 from public.cotizaciones_bodega c where c.id = cotizacion_id));
create policy bodega_create_quote_items on public.cotizaciones_articulos_bodega for insert to authenticated with check (exists (select 1 from public.cotizaciones_bodega c where c.id = cotizacion_id));
create policy bodega_update_quote_items on public.cotizaciones_articulos_bodega for update to authenticated using (exists (select 1 from public.cotizaciones_bodega c where c.id = cotizacion_id)) with check (exists (select 1 from public.cotizaciones_bodega c where c.id = cotizacion_id));
create policy bodega_delete_quote_items on public.cotizaciones_articulos_bodega for delete to authenticated using (
  (select albiz_private.is_admin_or_it()) or ((select albiz_private.is_bodega()) and exists (select 1 from public.cotizaciones_bodega c where c.id = cotizacion_id))
);

-- Public PWA catalogue: public price and stock only; no wholesale price or internal promotions.
-- This fixed projection deliberately uses the view owner's privileges so an
-- authenticated "invitado" can use it without receiving access to source tables.
create or replace view public.vista_productos_publica
with (security_invoker = false, security_barrier = true)
as
select p.codigo, p.descripcion, p.precio, p.existencias,
  coalesce(emp.existencias, 0::numeric) as existencias_tienda,
  coalesce(pt.existencias, 0::numeric) as existencias_otra,
  p.url_imagen, false as es_promo
from public.productos p
left join public.existencias_mp emp on emp.codigo = p.codigo
left join public.productostec pt on pt.codigo = p.codigo
union all
select pt.codigo, pt.descripcion, pt.precio, pt.existencias,
  coalesce(emp.existencias, 0::numeric) as existencias_tienda,
  coalesce(p.existencias, 0::numeric) as existencias_otra,
  pt.ur_imagen as url_imagen, false as es_promo
from public.productostec pt
left join public.existencias_mp emp on emp.codigo = pt.codigo
left join public.productos p on p.codigo = pt.codigo;

-- Staff views expose mayoreo only to Bodega/Admin/IT. They are SECURITY DEFINER
-- projections by design; the role predicate and fixed projection are the boundary.
create or replace view public.vista_productos
with (security_invoker = false, security_barrier = true)
as
select p.codigo, p.descripcion,
  case when (select albiz_private.current_app_role()) in ('cotizador bodega', 'bodega', 'admin', 'administrador', 'it')
    then p.mayoreo else null::numeric end as mayoreo,
  case when (select albiz_private.current_app_role()) in ('admin', 'administrador', 'it') then p.msi else null::numeric end as msi,
  p.precio, p.existencias,
  coalesce(emp.existencias, 0::numeric) as existencias_tienda,
  coalesce(pt.existencias, 0::numeric) as existencias_otra,
  p.url_imagen, false as es_promo
from public.productos p
left join public.existencias_mp emp on emp.codigo = p.codigo
left join public.productostec pt on pt.codigo = p.codigo
where (select albiz_private.current_app_role()) in ('cotizador bodega', 'bodega', 'vendedor mp', 'admin', 'administrador', 'it')
union all
select pr.p_codigo as codigo, pr.descripcion, pr.mayoreo, pr.mayoreo as msi, pr.mayoreo as precio,
  0::numeric as existencias, coalesce(emp.existencias, 0::numeric) as existencias_tienda,
  coalesce(pt.existencias, 0::numeric) as existencias_otra, ''::text as url_imagen, true as es_promo
from public.promociones pr
left join public.existencias_mp emp on emp.codigo = pr.p_codigo
left join public.productostec pt on pt.codigo = pr.p_codigo
where (select albiz_private.current_app_role()) in ('cotizador bodega', 'bodega', 'admin', 'administrador', 'it');

create or replace view public.vista_productostec
with (security_invoker = false, security_barrier = true)
as
select pt.codigo, pt.descripcion, null::numeric as mayoreo,
  case when (select albiz_private.current_app_role()) in ('admin', 'administrador', 'it') then pt.msi else null::numeric end as msi,
  pt.precio, pt.existencias,
  coalesce(emp.existencias, 0::numeric) as existencias_tienda,
  coalesce(p.existencias, 0::numeric) as existencias_otra,
  pt.ur_imagen as url_imagen, false as es_promo
from public.productostec pt
left join public.existencias_mp emp on emp.codigo = pt.codigo
left join public.productos p on p.codigo = pt.codigo
where (select albiz_private.current_app_role()) in ('vendedor tec', 'admin', 'administrador', 'it');

grant select on public.vista_productos_publica to anon, authenticated;
grant select on public.vista_productos, public.vista_productostec to authenticated;
revoke all on public.vista_productos, public.vista_productostec from anon;

-- Atomic IT imports. SECURITY INVOKER keeps table grants and RLS in force;
-- each delete-and-insert runs in one transaction when called through RPC.
create or replace function public.importar_ampacidad(p_rows jsonb)
returns integer language plpgsql security invoker set search_path = ''
as $$
declare v_count integer;
begin
  if not coalesce((select albiz_private.is_admin_or_it()), false) then
    raise exception 'Se requieren permisos de IT o administrador' using errcode = '42501';
  end if;
  if jsonb_typeof(p_rows) is distinct from 'array' or jsonb_array_length(p_rows) = 0 then
    raise exception 'La importación debe contener al menos una fila';
  end if;
  delete from public.ampacidad;
  insert into public.ampacidad (cable, cobre, aluminio, pulgadas_cu, pulgadas_au, caida_voltaje)
  select r.cable, r.cobre, r.aluminio, r.pulgadas_cu, r.pulgadas_au, r.caida_voltaje
  from jsonb_to_recordset(p_rows) as r(cable text, cobre numeric, aluminio numeric, pulgadas_cu text, pulgadas_au text, caida_voltaje text);
  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

create or replace function public.importar_guia_motores(p_rows jsonb)
returns integer language plpgsql security invoker set search_path = ''
as $$
declare v_count integer;
begin
  if not coalesce((select albiz_private.is_admin_or_it()), false) then
    raise exception 'Se requieren permisos de IT o administrador' using errcode = '42501';
  end if;
  if jsonb_typeof(p_rows) is distinct from 'array' or jsonb_array_length(p_rows) = 0 then
    raise exception 'La importación debe contener al menos una fila';
  end if;
  delete from public.guia_motores;
  insert into public.guia_motores (hp, voltaje, contactor, relevador, corriente, "c-weg", "r-weg", "c-cbcl", "r-cbcl")
  select r.hp, r.voltaje, r.contactor, r.relevador, r.corriente, r."c-weg", r."r-weg", r."c-cbcl", r."r-cbcl"
  from jsonb_to_recordset(p_rows) as r(hp text, voltaje text, contactor text, relevador text, corriente text, "c-weg" text, "r-weg" text, "c-cbcl" text, "r-cbcl" text);
  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

create or replace function public.importar_promociones(p_rows jsonb)
returns integer language plpgsql security invoker set search_path = ''
as $$
declare v_count integer;
begin
  if not coalesce((select albiz_private.is_admin_or_it()), false) then
    raise exception 'Se requieren permisos de IT o administrador' using errcode = '42501';
  end if;
  if jsonb_typeof(p_rows) is distinct from 'array' or jsonb_array_length(p_rows) = 0 then
    raise exception 'La importación debe contener al menos una fila';
  end if;
  delete from public.promociones;
  insert into public.promociones (p_codigo, descripcion, mayoreo, categoria)
  select r.p_codigo, r.descripcion, r.mayoreo, r.categoria
  from jsonb_to_recordset(p_rows) as r(p_codigo text, descripcion text, mayoreo numeric, categoria text);
  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

create or replace function public.importar_productostec(p_rows jsonb)
returns integer language plpgsql security invoker set search_path = ''
as $$
declare v_count integer;
begin
  if not coalesce((select albiz_private.is_admin_or_it()), false) then
    raise exception 'Se requieren permisos de IT o administrador' using errcode = '42501';
  end if;
  if jsonb_typeof(p_rows) is distinct from 'array' or jsonb_array_length(p_rows) = 0 then
    raise exception 'La importación debe contener al menos una fila';
  end if;
  delete from public.productostec;
  insert into public.productostec (codigo, descripcion, msi, precio, existencias, ur_imagen)
  select r.codigo, r.descripcion, r.msi, r.precio, r.existencias, r.ur_imagen
  from jsonb_to_recordset(p_rows) as r(codigo text, descripcion text, msi numeric, precio numeric, existencias numeric, ur_imagen text);
  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

create or replace function public.importar_productos(p_rows jsonb)
returns integer language plpgsql security invoker set search_path = ''
as $$
declare v_count integer;
begin
  if not coalesce((select albiz_private.is_admin_or_it()), false) then
    raise exception 'Se requieren permisos de IT o administrador' using errcode = '42501';
  end if;
  if jsonb_typeof(p_rows) is distinct from 'array' or jsonb_array_length(p_rows) = 0 then
    raise exception 'La importación debe contener al menos una fila';
  end if;
  delete from public.productos;
  insert into public.productos (codigo, descripcion, mayoreo, msi, precio, existencias, url_imagen)
  select r.codigo, r.descripcion, r.mayoreo, r.msi, r.precio, r.existencias, r.url_imagen
  from jsonb_to_recordset(p_rows) as r(codigo text, descripcion text, mayoreo numeric, msi numeric, precio numeric, existencias numeric, url_imagen text);
  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

-- Quote RPCs keep the header and all lines in one RLS-protected transaction.
create or replace function public.guardar_cotizacion(p_quote jsonb, p_items jsonb)
returns uuid language plpgsql security invoker set search_path = ''
as $$
declare v_id uuid;
begin
  if jsonb_typeof(p_items) is distinct from 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'La cotización requiere al menos un artículo';
  end if;
  insert into public.cotizaciones (folio, cliente_id, cliente, vendedor, estado, subtotal, total, sucursal, nota)
  select r.folio, r.cliente_id, r.cliente, r.vendedor, r.estado, r.subtotal, r.total, r.sucursal, r.nota
  from jsonb_to_record(p_quote) as r(folio text, cliente_id uuid, cliente text, vendedor text, estado text, subtotal numeric, total numeric, sucursal varchar, nota text)
  returning id into v_id;
  insert into public.cotizaciones_articulos (cotizacion_id, codigo, descripcion, cantidad, precio_unitario, subtotal)
  select v_id, r.codigo, r.descripcion, r.cantidad, r.precio_unitario, r.subtotal
  from jsonb_to_recordset(p_items) as r(codigo text, descripcion text, cantidad numeric, precio_unitario numeric, subtotal numeric);
  return v_id;
end;
$$;

create or replace function public.actualizar_cotizacion(p_id uuid, p_quote jsonb, p_items jsonb)
returns void language plpgsql security invoker set search_path = ''
as $$
declare v_updated integer;
begin
  if jsonb_typeof(p_items) is distinct from 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'La cotización requiere al menos un artículo';
  end if;
  update public.cotizaciones set cliente = r.cliente, vendedor = r.vendedor,
    subtotal = r.subtotal, total = r.total, nota = r.nota
  from jsonb_to_record(p_quote) as r(cliente text, vendedor text, subtotal numeric, total numeric, nota text)
  where id = p_id;
  get diagnostics v_updated = row_count;
  if v_updated = 0 then raise exception 'Cotización no encontrada o sin permiso' using errcode = '42501'; end if;
  delete from public.cotizaciones_articulos where cotizacion_id = p_id;
  insert into public.cotizaciones_articulos (cotizacion_id, codigo, descripcion, cantidad, precio_unitario, subtotal)
  select p_id, r.codigo, r.descripcion, r.cantidad, r.precio_unitario, r.subtotal
  from jsonb_to_recordset(p_items) as r(codigo text, descripcion text, cantidad numeric, precio_unitario numeric, subtotal numeric);
end;
$$;

create or replace function public.guardar_cotizacion_bodega(p_quote jsonb, p_items jsonb)
returns uuid language plpgsql security invoker set search_path = ''
as $$
declare v_id uuid;
begin
  if jsonb_typeof(p_items) is distinct from 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'La cotización requiere al menos un artículo';
  end if;
  insert into public.cotizaciones_bodega (folio, cliente, vendedor, estado, subtotal, total, tasa_iva, nota)
  select r.folio, r.cliente, r.vendedor, r.estado, r.subtotal, r.total, r.tasa_iva, r.nota
  from jsonb_to_record(p_quote) as r(folio text, cliente text, vendedor text, estado text, subtotal numeric, total numeric, tasa_iva integer, nota text)
  returning id into v_id;
  insert into public.cotizaciones_articulos_bodega (cotizacion_id, codigo, descripcion, cantidad, precio_unitario, subtotal)
  select v_id, r.codigo, r.descripcion, r.cantidad, r.precio_unitario, r.subtotal
  from jsonb_to_recordset(p_items) as r(codigo text, descripcion text, cantidad numeric, precio_unitario numeric, subtotal numeric);
  return v_id;
end;
$$;

create or replace function public.actualizar_cotizacion_bodega(p_id uuid, p_quote jsonb, p_items jsonb)
returns void language plpgsql security invoker set search_path = ''
as $$
declare v_updated integer;
begin
  if jsonb_typeof(p_items) is distinct from 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'La cotización requiere al menos un artículo';
  end if;
  update public.cotizaciones_bodega set cliente = r.cliente, vendedor = r.vendedor,
    subtotal = r.subtotal, total = r.total, tasa_iva = r.tasa_iva, nota = r.nota
  from jsonb_to_record(p_quote) as r(cliente text, vendedor text, subtotal numeric, total numeric, tasa_iva integer, nota text)
  where id = p_id;
  get diagnostics v_updated = row_count;
  if v_updated = 0 then raise exception 'Cotización no encontrada o sin permiso' using errcode = '42501'; end if;
  delete from public.cotizaciones_articulos_bodega where cotizacion_id = p_id;
  insert into public.cotizaciones_articulos_bodega (cotizacion_id, codigo, descripcion, cantidad, precio_unitario, subtotal)
  select p_id, r.codigo, r.descripcion, r.cantidad, r.precio_unitario, r.subtotal
  from jsonb_to_recordset(p_items) as r(codigo text, descripcion text, cantidad numeric, precio_unitario numeric, subtotal numeric);
end;
$$;

revoke all on function public.importar_ampacidad(jsonb) from public, anon;
revoke all on function public.importar_guia_motores(jsonb) from public, anon;
revoke all on function public.importar_promociones(jsonb) from public, anon;
revoke all on function public.importar_productostec(jsonb) from public, anon;
revoke all on function public.importar_productos(jsonb) from public, anon;
revoke all on function public.guardar_cotizacion(jsonb, jsonb) from public, anon;
revoke all on function public.actualizar_cotizacion(uuid, jsonb, jsonb) from public, anon;
revoke all on function public.guardar_cotizacion_bodega(jsonb, jsonb) from public, anon;
revoke all on function public.actualizar_cotizacion_bodega(uuid, jsonb, jsonb) from public, anon;
grant execute on function public.importar_ampacidad(jsonb) to authenticated;
grant execute on function public.importar_guia_motores(jsonb) to authenticated;
grant execute on function public.importar_promociones(jsonb) to authenticated;
grant execute on function public.importar_productostec(jsonb) to authenticated;
grant execute on function public.importar_productos(jsonb) to authenticated;
grant execute on function public.guardar_cotizacion(jsonb, jsonb) to authenticated;
grant execute on function public.actualizar_cotizacion(uuid, jsonb, jsonb) to authenticated;
grant execute on function public.guardar_cotizacion_bodega(jsonb, jsonb) to authenticated;
grant execute on function public.actualizar_cotizacion_bodega(uuid, jsonb, jsonb) to authenticated;

-- Public reads for images; authenticated uploads are restricted by bucket and role/path.
create policy public_read_brand_logos on storage.objects for select to anon, authenticated using (bucket_id = 'marcas-logos');
create policy public_read_profile_photos on storage.objects for select to anon, authenticated using (bucket_id = 'perfiles');
create policy admin_upload_brand_logos on storage.objects for insert to authenticated with check (bucket_id = 'marcas-logos' and (select albiz_private.is_admin_or_it()));
create policy admin_update_brand_logos on storage.objects for update to authenticated using (bucket_id = 'marcas-logos' and (select albiz_private.is_admin_or_it())) with check (bucket_id = 'marcas-logos' and (select albiz_private.is_admin_or_it()));
create policy admin_delete_brand_logos on storage.objects for delete to authenticated using (bucket_id = 'marcas-logos' and (select albiz_private.is_admin_or_it()));
create policy own_avatar_upload on storage.objects for insert to authenticated with check (bucket_id = 'perfiles' and name like ('avatar-' || (select auth.uid())::text || '-%'));
create policy admin_upload_profile_photos on storage.objects for insert to authenticated with check (bucket_id = 'perfiles' and (select albiz_private.is_admin_or_it()));
create policy own_avatar_update on storage.objects for update to authenticated using (bucket_id = 'perfiles' and name like ('avatar-' || (select auth.uid())::text || '-%')) with check (bucket_id = 'perfiles' and name like ('avatar-' || (select auth.uid())::text || '-%'));
create policy admin_update_profile_photos on storage.objects for update to authenticated using (bucket_id = 'perfiles' and (select albiz_private.is_admin_or_it())) with check (bucket_id = 'perfiles' and (select albiz_private.is_admin_or_it()));
create policy admin_delete_profile_photos on storage.objects for delete to authenticated using (bucket_id = 'perfiles' and (select albiz_private.is_admin_or_it()));

commit;

-- Verify the RLS flags, policies, and role behavior in Supabase before relying on this in production.

