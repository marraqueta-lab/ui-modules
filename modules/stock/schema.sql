-- =====================================================================
-- Módulo: stock
-- Requiere: esquema base (empresas + perfiles) y el módulo `ingredientes`.
-- =====================================================================

create table if not exists conteos_stock (
  id             uuid primary key default gen_random_uuid(),
  empresa_id     uuid not null references empresas(id) on delete cascade,
  ingrediente_id uuid not null references ingredientes(id) on delete cascade,
  fecha          date not null default current_date,
  cantidad       numeric(12,3) not null,
  notas          text,
  created_at     timestamptz not null default now()
);

create index if not exists conteos_stock_empresa_idx     on conteos_stock (empresa_id);
create index if not exists conteos_stock_ingrediente_idx on conteos_stock (ingrediente_id);
create index if not exists conteos_stock_fecha_idx       on conteos_stock (fecha desc);

alter table conteos_stock enable row level security;

drop policy if exists "conteos_stock por empresa" on conteos_stock;
create policy "conteos_stock por empresa"
  on conteos_stock for all
  to authenticated
  using (empresa_id in (select empresa_id from perfiles where id = auth.uid()))
  with check (empresa_id in (select empresa_id from perfiles where id = auth.uid()));

-- Deja el stock del ingrediente igual al último conteo registrado.
-- search_path fijo + tablas calificadas, y el update acotado a la misma
-- empresa para que un conteo nunca toque datos de otro cliente.
create or replace function public.sync_stock_ingrediente()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.ingredientes
  set stock = new.cantidad
  where id = new.ingrediente_id
    and empresa_id = new.empresa_id;
  return new;
end;
$$;

drop trigger if exists trigger_sync_stock_ingrediente on conteos_stock;
create trigger trigger_sync_stock_ingrediente
  after insert on conteos_stock
  for each row execute function public.sync_stock_ingrediente();

-- Permisos de tabla. La RLS filtra QUE filas se ven, pero primero el rol
-- necesita permiso sobre la tabla: sin esto, la consulta muere con
-- "permission denied" antes de evaluar ninguna policy. No se hereda de las
-- default privileges: las del rol `postgres` en `public` solo dan
-- TRUNCATE/REFERENCES/TRIGGER, no SELECT/INSERT/UPDATE/DELETE.
grant select, insert, update, delete on table conteos_stock to authenticated;
