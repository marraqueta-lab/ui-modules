-- =====================================================================
-- Módulo: ingredientes
-- Ejecuta este SQL después del esquema base (empresas + perfiles).
-- =====================================================================

create table if not exists ingredientes (
  id           uuid primary key default gen_random_uuid(),
  empresa_id   uuid not null references empresas(id) on delete cascade,
  nombre       text not null,
  unidad       text not null,
  precio_unit  numeric(10,4) not null default 0,
  stock        numeric(12,3) not null default 0,
  activo       boolean not null default true,
  created_at   timestamptz not null default now()
);

create index if not exists ingredientes_empresa_idx on ingredientes (empresa_id);
create index if not exists ingredientes_nombre_idx  on ingredientes (nombre);

alter table ingredientes enable row level security;

drop policy if exists "ingredientes por empresa" on ingredientes;
create policy "ingredientes por empresa"
  on ingredientes for all
  to authenticated
  using (empresa_id in (select empresa_id from perfiles where id = auth.uid()))
  with check (empresa_id in (select empresa_id from perfiles where id = auth.uid()));
