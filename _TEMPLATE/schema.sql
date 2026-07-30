-- =====================================================================
-- Módulo: _TEMPLATE
-- Ejecuta este SQL en el SQL Editor de Supabase del cliente.
-- Toda tabla lleva empresa_id + RLS. Copia el patrón de modules/clientes.
-- =====================================================================

create table if not exists _template_items (
  id          uuid primary key default gen_random_uuid(),
  empresa_id  uuid not null references empresas(id) on delete cascade,
  nombre      text not null,
  activo      boolean not null default true,
  created_at  timestamptz not null default now()
);

create index if not exists _template_items_empresa_idx on _template_items (empresa_id);

alter table _template_items enable row level security;

drop policy if exists "_template_items por empresa" on _template_items;
create policy "_template_items por empresa"
  on _template_items for all
  to authenticated
  using (empresa_id in (select empresa_id from perfiles where id = auth.uid()))
  with check (empresa_id in (select empresa_id from perfiles where id = auth.uid()));
