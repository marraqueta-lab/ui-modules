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

-- Permisos de tabla. La RLS filtra QUE filas se ven, pero primero el rol
-- necesita permiso sobre la tabla: sin esto, la consulta muere con
-- "permission denied" antes de evaluar ninguna policy. No se hereda de las
-- default privileges: las del rol `postgres` en `public` solo dan
-- TRUNCATE/REFERENCES/TRIGGER, no SELECT/INSERT/UPDATE/DELETE.
grant select, insert, update, delete on table ingredientes to authenticated;
