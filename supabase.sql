-- =============================================================================
-- Laureles Campestre — estado compartido de los lotes
--
-- YA ESTÁ APLICADO en el proyecto de Supabase (10-09-2026) como la migración
-- "laureles_estado_lotes". Se deja aquí para poder rehacerlo en otro proyecto.
--
-- La tabla se llama laureles_lotes, no lotes, para no chocar con nada del resto
-- del proyecto. Nace con RLS puesta: lectura pública —el mapa es de consulta— y
-- escritura sólo para asesores autenticados. La llave anónima que va en el sitio
-- público sólo puede LEER; para cambiar un estado hay que iniciar sesión.
-- =============================================================================

create table if not exists public.laureles_lotes (
  lote         integer primary key,
  estado       text not null default 'disponible'
                 check (estado in ('disponible','separado','vendido','reservado')),
  notas        text,
  actualizado  timestamptz not null default now(),
  actualizado_por uuid references auth.users(id)
);

comment on table public.laureles_lotes is
  'Estado comercial de cada lote de la parcelación Laureles Campestre. La geometría y las áreas NO viven aquí: salen del plano 038 y viajan en lotes.js.';

-- semilla: los 88 lotes en disponible
insert into public.laureles_lotes (lote)
select generate_series(1,88)
on conflict (lote) do nothing;

alter table public.laureles_lotes enable row level security;

-- cualquiera puede leer (el mapa es de consulta)
drop policy if exists laureles_lectura_publica on public.laureles_lotes;
create policy laureles_lectura_publica
  on public.laureles_lotes for select
  to anon, authenticated
  using (true);

-- sólo un asesor autenticado puede cambiar el estado
drop policy if exists laureles_escritura_asesores on public.laureles_lotes;
create policy laureles_escritura_asesores
  on public.laureles_lotes for update
  to authenticated
  using (true) with check (true);

drop policy if exists laureles_insercion_asesores on public.laureles_lotes;
create policy laureles_insercion_asesores
  on public.laureles_lotes for insert
  to authenticated
  with check (true);

-- deja constancia de quién y cuándo
create or replace function public.laureles_sello() returns trigger
language plpgsql security definer
set search_path = public, pg_temp
as $$
begin
  new.actualizado := now();
  new.actualizado_por := auth.uid();
  return new;
end $$;

drop trigger if exists laureles_sello_t on public.laureles_lotes;
create trigger laureles_sello_t before insert or update on public.laureles_lotes
  for each row execute function public.laureles_sello();

-- bitácora, para saber qué pasó con un lote
create table if not exists public.laureles_historial (
  id bigserial primary key,
  lote integer not null,
  estado_anterior text,
  estado_nuevo text,
  cuando timestamptz not null default now(),
  quien uuid
);
alter table public.laureles_historial enable row level security;
drop policy if exists laureles_historial_lectura on public.laureles_historial;
create policy laureles_historial_lectura on public.laureles_historial
  for select to authenticated using (true);

create or replace function public.laureles_bitacora() returns trigger
language plpgsql security definer
set search_path = public, pg_temp
as $$
begin
  if (tg_op='UPDATE' and new.estado is distinct from old.estado) then
    insert into public.laureles_historial(lote,estado_anterior,estado_nuevo,quien)
    values (new.lote, old.estado, new.estado, auth.uid());
  end if;
  return new;
end $$;

drop trigger if exists laureles_bitacora_t on public.laureles_lotes;
create trigger laureles_bitacora_t after update on public.laureles_lotes
  for each row execute function public.laureles_bitacora();

-- =============================================================================
-- DOS ROLES: visitante y ventas   (aplicado el 11-09-2026)
--
-- No hay un "usuario visitante": visitante es NO tener sesión. La llave que
-- viaja en index.html es la publicable y el rol anon sólo tiene la política de
-- SELECT sobre laureles_lotes. Cambiar un estado exige un token de sesión, y
-- ese token lo entrega Supabase Auth contra un correo y una contraseña que no
-- están en el repositorio.
--
-- Las cuentas de ventas se crean en el panel de Supabase:
--   Authentication -> Users -> Add user  (correo + contraseña, "Auto Confirm")
-- Una cuenta por asesor, para que la bitácora diga quién movió cada lote.
-- =============================================================================

-- Información comercial que el rol ventas envía desde el mapa.
-- Un visitante no puede ni leerla: son datos de personas, no del proyecto.
create table if not exists public.laureles_prospectos (
  id          bigserial primary key,
  lote        integer,
  nombre      text not null,
  telefono    text,
  correo      text,
  etapa       integer,
  precio_cop  bigint,
  origen      text default 'mapa-web',
  notas       text,
  asesor      uuid default auth.uid(),
  creado      timestamptz not null default now()
);

create index if not exists laureles_prospectos_lote_idx on public.laureles_prospectos(lote);

alter table public.laureles_prospectos enable row level security;

drop policy if exists laureles_prospectos_lectura on public.laureles_prospectos;
create policy laureles_prospectos_lectura on public.laureles_prospectos
  for select to authenticated using (true);

drop policy if exists laureles_prospectos_insercion on public.laureles_prospectos;
create policy laureles_prospectos_insercion on public.laureles_prospectos
  for insert to authenticated with check (true);

drop policy if exists laureles_prospectos_update on public.laureles_prospectos;
create policy laureles_prospectos_update on public.laureles_prospectos
  for update to authenticated using (true) with check (true);

-- =============================================================================
-- VISITANTES Y VISITAS   (aplicado el 20-09-2026 como migración
-- "laureles_visitantes_y_visitas")
--
-- laureles_visitantes: nombre, correo y teléfono de quien entra como visitante,
--   con su autorización de tratamiento de datos (Ley 1581 de 2012). El rol anon
--   sólo puede INSERTAR y sólo con acepta_politica = true (lo exige la RLS, no
--   sólo el formulario); leer exige sesión de administrador.
-- laureles_visitas: solicitud de visita presencial (fecha y franja). Mismo
--   esquema: el visitante inserta, la administración lee y gestiona.
-- La cuenta de administrador se crea en Supabase: Authentication -> Users ->
-- Add user (correo + contraseña, Auto Confirm). "Olvidé mi contraseña" usa el
-- correo de recuperación de Supabase Auth; el Site URL del proyecto debe ser
-- https://www.laurelescampestre.co para que el enlace vuelva a la página.
-- =============================================================================
create table if not exists public.laureles_visitantes (
  id bigserial primary key,
  nombre text not null check (char_length(nombre) between 2 and 120),
  correo text not null check (correo ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  telefono text check (telefono is null or char_length(telefono) between 7 and 20),
  acepta_politica boolean not null,
  version_politica text not null default '2026-09-20',
  idioma text, origen text not null default 'web', navegador text,
  creado timestamptz not null default now(),
  constraint laureles_visitantes_acepta check (acepta_politica = true)
);
alter table public.laureles_visitantes enable row level security;
create policy laureles_visitantes_insercion on public.laureles_visitantes
  for insert to anon, authenticated with check (acepta_politica = true);
create policy laureles_visitantes_lectura on public.laureles_visitantes
  for select to authenticated using (true);

create table if not exists public.laureles_visitas (
  id bigserial primary key,
  nombre text not null, correo text not null, telefono text,
  lote integer check (lote is null or lote between 1 and 88),
  fecha date not null check (fecha >= current_date),
  franja text not null check (franja in ('manana','tarde')),
  notas text, estado text not null default 'solicitada'
    check (estado in ('solicitada','confirmada','realizada','cancelada')),
  atendida_por uuid references auth.users(id),
  creado timestamptz not null default now()
);
alter table public.laureles_visitas enable row level security;
create policy laureles_visitas_insercion on public.laureles_visitas for insert to anon, authenticated with check (true);
create policy laureles_visitas_lectura   on public.laureles_visitas for select to authenticated using (true);
create policy laureles_visitas_gestion   on public.laureles_visitas for update to authenticated using (true) with check (true);

-- =============================================================================
-- 2026-09-21 · Configurador de casas con IA (sólo administradores)
-- -----------------------------------------------------------------------------
-- Tabla public.laureles_ia_uso: una fila por consulta (usuario, lote, tokens,
-- ok/error). RLS: sólo la Edge Function escribe (service role); cada
-- administrador lee sus filas. Sirve para el cupo diario por persona y el tope
-- mensual del proyecto.
--
-- Edge Function `laureles-ia` (supabase/functions/laureles-ia/index.ts):
--   · exige JWT de Supabase Auth (verify_jwt = true) → sólo administradores;
--   · lee la llave de Anthropic del secreto ANTHROPIC_API_KEY (nunca en la web);
--   · variables opcionales: LAURELES_IA_MODELO (claude-sonnet-4-5),
--     LAURELES_IA_CUPO_DIA (40 por persona/día), LAURELES_IA_CUPO_MES (1500/mes).
-- La página (ia.js) manda la ficha real del lote y recibe bloques en metros;
-- las áreas y el 30 % los recalcula la página, no la IA.
-- =============================================================================

-- 2026-09-21 · public.laureles_ia_casas: una fila por propuesta de casa
-- aplicada con la IA (lote, conversación, bloques en metros dentro de la
-- envolvente, cifras validadas por la página). RLS: insertan y leen sólo los
-- administradores autenticados. La última por lote es la que entra al
-- Análisis del lote y al PDF (hoja "La casa que pediste").
