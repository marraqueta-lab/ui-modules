-- =====================================================================
-- Módulo: productos
-- Ejecuta este SQL después del esquema base (empresas + perfiles).
-- =====================================================================

create table if not exists productos (
  id              uuid primary key default gen_random_uuid(),
  empresa_id      uuid not null references empresas(id) on delete cascade,
  nombre          text not null,
  descripcion     text,
  -- Texto libre a propósito: un módulo `categorias` administrable no se
  -- justifica hasta que un cliente lo pida.
  categoria       text,
  precio          numeric(10,2) not null default 0,
  precio_mayorista numeric(10,2) not null default 0,
  activo          boolean not null default true,
  created_at      timestamptz not null default now()
);

create index if not exists productos_empresa_idx on productos (empresa_id);
create index if not exists productos_nombre_idx  on productos (nombre);

alter table productos enable row level security;

drop policy if exists "productos por empresa" on productos;
create policy "productos por empresa"
  on productos for all
  to authenticated
  using (empresa_id in (select empresa_id from perfiles where id = auth.uid()))
  with check (empresa_id in (select empresa_id from perfiles where id = auth.uid()));
