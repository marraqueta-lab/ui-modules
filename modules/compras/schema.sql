-- =====================================================================
-- Módulo: compras
-- Requiere: esquema base (empresas + perfiles) y el módulo `ingredientes`.
-- =====================================================================

create table if not exists compras (
  id             uuid primary key default gen_random_uuid(),
  empresa_id     uuid not null references empresas(id) on delete cascade,
  ingrediente_id uuid not null references ingredientes(id) on delete restrict,
  fecha          date not null default current_date,
  cantidad       numeric(10,3) not null check (cantidad > 0),
  unidad         text not null,
  precio_total   numeric(10,0) not null,
  -- Columna generada: el precio unitario nunca puede quedar desincronizado
  -- del total y la cantidad. El check de cantidad > 0 evita la división por cero.
  precio_unit    numeric(10,2) generated always as (precio_total / cantidad) stored,
  notas          text,
  created_at     timestamptz not null default now()
);

create index if not exists compras_empresa_idx      on compras (empresa_id);
create index if not exists compras_ingrediente_idx  on compras (ingrediente_id);
create index if not exists compras_fecha_idx        on compras (fecha);

alter table compras enable row level security;

drop policy if exists "compras por empresa" on compras;
create policy "compras por empresa"
  on compras for all
  to authenticated
  using (empresa_id in (select empresa_id from perfiles where id = auth.uid()))
  with check (empresa_id in (select empresa_id from perfiles where id = auth.uid()));

-- Mantiene el precio unitario del ingrediente al día con la última compra.
-- SECURITY DEFINER para que el update funcione sin importar las policies del
-- usuario, con search_path fijo y tablas calificadas: sin eso, una función
-- definer puede ser secuestrada vía objetos en un esquema anterior del path.
create or replace function public.sync_precio_ingrediente()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.ingredientes
  set precio_unit = new.precio_unit
  where id = new.ingrediente_id
    and empresa_id = new.empresa_id;  -- nunca cruzar empresas
  return new;
end;
$$;

drop trigger if exists trigger_sync_precio_ingrediente on compras;
create trigger trigger_sync_precio_ingrediente
  after insert on compras
  for each row execute function public.sync_precio_ingrediente();
