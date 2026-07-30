-- =====================================================================
-- Módulo: recetas
-- Requiere: esquema base, y los módulos `productos` e `ingredientes`.
-- =====================================================================

create table if not exists recetas (
  id          uuid primary key default gen_random_uuid(),
  empresa_id  uuid not null references empresas(id) on delete cascade,
  producto_id uuid not null references productos(id) on delete cascade,
  nombre      text not null,
  rinde       numeric(10,3),
  rinde_unidad text,
  notas       text,
  activo      boolean not null default true,
  created_at  timestamptz not null default now()
);

create index if not exists recetas_empresa_idx  on recetas (empresa_id);
create index if not exists recetas_producto_idx on recetas (producto_id);

create table if not exists receta_ingredientes (
  id             uuid primary key default gen_random_uuid(),
  receta_id      uuid not null references recetas(id) on delete cascade,
  ingrediente_id uuid not null references ingredientes(id) on delete restrict,
  cantidad       numeric(12,4) not null,
  created_at     timestamptz not null default now(),
  unique (receta_id, ingrediente_id)
);

create index if not exists receta_ing_receta_idx      on receta_ingredientes (receta_id);
create index if not exists receta_ing_ingrediente_idx on receta_ingredientes (ingrediente_id);

alter table recetas enable row level security;
alter table receta_ingredientes enable row level security;

drop policy if exists "recetas por empresa" on recetas;
create policy "recetas por empresa"
  on recetas for all
  to authenticated
  using (empresa_id in (select empresa_id from perfiles where id = auth.uid()))
  with check (empresa_id in (select empresa_id from perfiles where id = auth.uid()));

-- receta_ingredientes no lleva empresa_id propio: hereda el aislamiento de
-- su receta. Así no puede quedar una línea cuya empresa contradiga la de su
-- receta padre.
drop policy if exists "receta_ingredientes via receta" on receta_ingredientes;
create policy "receta_ingredientes via receta"
  on receta_ingredientes for all
  to authenticated
  using (
    receta_id in (
      select id from recetas
      where empresa_id in (select empresa_id from perfiles where id = auth.uid())
    )
  )
  with check (
    receta_id in (
      select id from recetas
      where empresa_id in (select empresa_id from perfiles where id = auth.uid())
    )
  );
