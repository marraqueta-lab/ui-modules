-- =====================================================================
-- Módulo: clientes
-- Ejecuta este SQL en el SQL Editor de Supabase del cliente, después del
-- esquema base (empresas + perfiles).
-- =====================================================================

create table if not exists clientes (
  id          uuid primary key default gen_random_uuid(),
  empresa_id  uuid not null references empresas(id) on delete cascade,
  nombre      text not null,
  telefono    text,
  direccion   text,
  notas       text,
  activo      boolean not null default true,
  created_at  timestamptz not null default now()
);

create index if not exists clientes_empresa_idx on clientes (empresa_id);
create index if not exists clientes_nombre_idx  on clientes (nombre);

alter table clientes enable row level security;

drop policy if exists "clientes por empresa" on clientes;
create policy "clientes por empresa"
  on clientes for all
  to authenticated
  using (empresa_id in (select empresa_id from perfiles where id = auth.uid()))
  with check (empresa_id in (select empresa_id from perfiles where id = auth.uid()));

-- Permisos de tabla. La RLS filtra QUE filas se ven, pero primero el rol
-- necesita permiso sobre la tabla: sin esto, la consulta muere con
-- "permission denied" antes de evaluar ninguna policy. No se hereda de las
-- default privileges: las del rol `postgres` en `public` solo dan
-- TRUNCATE/REFERENCES/TRIGGER, no SELECT/INSERT/UPDATE/DELETE.
grant select, insert, update, delete on table clientes to authenticated;
