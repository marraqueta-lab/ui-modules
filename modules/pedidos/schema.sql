-- =====================================================================
-- Módulo: pedidos
-- Requiere: esquema base, y los módulos `clientes` y `productos`.
-- =====================================================================

create table if not exists pedidos (
  id            uuid primary key default gen_random_uuid(),
  empresa_id    uuid not null references empresas(id) on delete cascade,
  cliente_id    uuid references clientes(id) on delete set null,
  fecha         date not null default current_date,
  fecha_entrega date,
  estado        text not null default 'pendiente'
                check (estado in ('pendiente','confirmado','entregado','cancelado')),
  pagado        boolean not null default false,
  total         numeric(10,2) not null default 0,
  notas         text,
  created_at    timestamptz not null default now()
);

create index if not exists pedidos_empresa_idx on pedidos (empresa_id);
create index if not exists pedidos_cliente_idx on pedidos (cliente_id);
create index if not exists pedidos_fecha_idx   on pedidos (fecha desc);
create index if not exists pedidos_estado_idx  on pedidos (estado);

create table if not exists pedido_items (
  id           uuid primary key default gen_random_uuid(),
  pedido_id    uuid not null references pedidos(id) on delete cascade,
  producto_id  uuid not null references productos(id) on delete restrict,
  cantidad     numeric(10,3) not null check (cantidad > 0),
  precio_unit  numeric(10,2) not null,
  -- Generada: el subtotal no puede contradecir cantidad x precio.
  subtotal     numeric(12,2) generated always as (cantidad * precio_unit) stored,
  created_at   timestamptz not null default now()
);

create index if not exists pedido_items_pedido_idx on pedido_items (pedido_id);

alter table pedidos enable row level security;
alter table pedido_items enable row level security;

drop policy if exists "pedidos por empresa" on pedidos;
create policy "pedidos por empresa"
  on pedidos for all
  to authenticated
  using (empresa_id in (select empresa_id from perfiles where id = auth.uid()))
  with check (empresa_id in (select empresa_id from perfiles where id = auth.uid()));

-- Igual que receta_ingredientes: las líneas heredan el aislamiento de su
-- pedido en vez de llevar empresa_id propio, que podría contradecirlo.
drop policy if exists "pedido_items via pedido" on pedido_items;
create policy "pedido_items via pedido"
  on pedido_items for all
  to authenticated
  using (
    pedido_id in (
      select id from pedidos
      where empresa_id in (select empresa_id from perfiles where id = auth.uid())
    )
  )
  with check (
    pedido_id in (
      select id from pedidos
      where empresa_id in (select empresa_id from perfiles where id = auth.uid())
    )
  );

-- Mantiene pedidos.total igual a la suma de sus líneas, ante cualquier
-- insert/update/delete. Así el total nunca se calcula mal desde el cliente.
create or replace function public.sync_total_pedido()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  pid uuid := coalesce(new.pedido_id, old.pedido_id);
begin
  update public.pedidos
  set total = coalesce(
    (select sum(subtotal) from public.pedido_items where pedido_id = pid), 0
  )
  where id = pid;
  return coalesce(new, old);
end;
$$;

drop trigger if exists trigger_sync_total_pedido on pedido_items;
create trigger trigger_sync_total_pedido
  after insert or update or delete on pedido_items
  for each row execute function public.sync_total_pedido();
