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
