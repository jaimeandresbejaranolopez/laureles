-- =============================================================================
-- CENTURY 21 / EJE CAFETERO · Cerrar el acceso público a las tablas del CRM
--
-- POR QUÉ:
--   La llave publicable del proyecto viaja hoy en un repositorio público de
--   GitHub y en www.laurelescampestre.co. Con esa llave, y tal como están las
--   políticas, cualquiera puede LEER, MODIFICAR y BORRAR:
--     leads (12 filas), historial (15), tareas (41), negocios, plantillas,
--     mensajes_programados, config
--   y escribir libremente en cinco tablas que no tienen RLS:
--     agentes_comerciales, emails_agentes, telefonos_agentes,
--     rotacion_comercial, ruteo_ciudad
--
-- ANTES DE EJECUTAR, LEA ESTO:
--   Este archivo CIERRA esas tablas al rol anónimo. Si alguna herramienta suya
--   escribe en ellas usando la llave publicable, dejará de funcionar en el acto.
--   Muévala primero a la llave de servicio (service_role), del lado servidor,
--   o a una sesión de usuario autenticado.
--
--   Las tablas de Laureles (laureles_lotes, laureles_prospectos,
--   laureles_historial) NO se tocan aquí: ya están bien.
--
-- CÓMO EJECUTARLO: Supabase -> SQL Editor -> pegar -> Run.
-- =============================================================================

begin;

-- ---------------------------------------------------------------- 1. RLS en las cinco que no la tienen
alter table public.agentes_comerciales  enable row level security;
alter table public.emails_agentes       enable row level security;
alter table public.telefonos_agentes    enable row level security;
alter table public.rotacion_comercial   enable row level security;
alter table public.ruteo_ciudad         enable row level security;

-- ---------------------------------------------------------------- 2. Quitar las políticas abiertas
drop policy if exists "Acceso completo leads"     on public.leads;
drop policy if exists "Acceso completo historial" on public.historial;
drop policy if exists "Acceso completo negocios"  on public.negocios;
drop policy if exists "Acceso completo plantillas" on public.plantillas;
drop policy if exists "Acceso completo mensajes"  on public.mensajes_programados;
drop policy if exists tareas_lectura    on public.tareas;
drop policy if exists tareas_insertar   on public.tareas;
drop policy if exists tareas_actualizar on public.tareas;
drop policy if exists tareas_eliminar   on public.tareas;
drop policy if exists config_lectura    on public.config;
drop policy if exists config_escritura  on public.config;
drop policy if exists config_actualizar on public.config;

-- ---------------------------------------------------------------- 3. Sólo usuarios autenticados
--    Misma regla que ya rige en Laureles: leer y escribir exige sesión.
do $$
declare t text;
begin
  foreach t in array array['leads','historial','negocios','plantillas',
                           'mensajes_programados','tareas','config',
                           'agentes_comerciales','emails_agentes','telefonos_agentes',
                           'rotacion_comercial','ruteo_ciudad']
  loop
    execute format('create policy %I on public.%I for select to authenticated using (true)',
                   t||'_sel_auth', t);
    execute format('create policy %I on public.%I for insert to authenticated with check (true)',
                   t||'_ins_auth', t);
    execute format('create policy %I on public.%I for update to authenticated using (true) with check (true)',
                   t||'_upd_auth', t);
    execute format('create policy %I on public.%I for delete to authenticated using (true)',
                   t||'_del_auth', t);
  end loop;
end $$;

-- ---------------------------------------------------------------- 4. Quitarle también el permiso de tabla al rol anónimo
--    La RLS filtra filas; esto le quita el permiso de entrada, que es un
--    candado más y además hace que el error sea claro en vez de "0 filas".
revoke all on public.leads, public.historial, public.negocios, public.plantillas,
              public.mensajes_programados, public.tareas, public.config,
              public.agentes_comerciales, public.emails_agentes, public.telefonos_agentes,
              public.rotacion_comercial, public.ruteo_ciudad
  from anon;

commit;

-- =============================================================================
-- COMPROBACIÓN — ejecútela aparte después del commit.
-- Debe devolver 0 filas leídas y 0 actualizadas en cada tabla.
-- =============================================================================
-- set local role anon;
-- select 'leads' as tabla, count(*)::text as filas_que_ve_anon from public.leads
-- union all select 'tareas', count(*)::text from public.tareas
-- union all select 'historial', count(*)::text from public.historial;
