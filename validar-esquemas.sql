-- =====================================================================
-- Validación del esquema base + los 7 módulos
-- Se corre contra el Supabase local, después de aplicar todos los schema.
-- Cada bloque falla ruidosamente si el comportamiento no es el esperado.
-- =====================================================================

\set ON_ERROR_STOP on

-- ── Datos de prueba: dos empresas, un usuario en cada una ────────────
-- Insertar en auth.users dispara handle_new_user(), que crea el perfil.

insert into auth.users (id, instance_id, aud, role, email, encrypted_password,
                        email_confirmed_at, created_at, updated_at,
                        raw_app_meta_data, raw_user_meta_data)
values
  ('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000000',
   'authenticated', 'authenticated', 'ana@empresa-a.cl', crypt('x', gen_salt('bf')),
   now(), now(), now(), '{}', '{"nombre":"Ana"}'),
  ('22222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000000',
   'authenticated', 'authenticated', 'beto@empresa-b.cl', crypt('x', gen_salt('bf')),
   now(), now(), now(), '{}', '{"nombre":"Beto"}');

-- ¿El trigger creó los perfiles?
do $$
declare n int;
begin
  select count(*) into n from perfiles
   where id in ('11111111-1111-1111-1111-111111111111',
                '22222222-2222-2222-2222-222222222222');
  if n <> 2 then
    raise exception 'FALLA: handle_new_user no creo los 2 perfiles (creo %)', n;
  end if;
  raise notice 'OK  trigger handle_new_user crea perfiles';
end $$;

-- ¿Los creó sin empresa, como esperamos?
do $$
declare n int;
begin
  select count(*) into n from perfiles
   where id = '11111111-1111-1111-1111-111111111111' and empresa_id is null;
  if n <> 1 then
    raise exception 'FALLA: el perfil nuevo deberia nacer sin empresa';
  end if;
  raise notice 'OK  perfil nace sin empresa (requiere aprovisionamiento)';
end $$;

-- Aprovisionar, como hace provisionar.sql
insert into empresas (id, nombre, rut) values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Empresa A', '11.111.111-1'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Empresa B', '22.222.222-2');

update perfiles set empresa_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', rol = 'admin'
 where id = '11111111-1111-1111-1111-111111111111';
update perfiles set empresa_id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', rol = 'admin'
 where id = '22222222-2222-2222-2222-222222222222';

-- Datos de negocio de cada empresa
insert into clientes (empresa_id, nombre) values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Cliente de A'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Cliente de B');

insert into productos (empresa_id, nombre, precio) values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Producto de A', 1000),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Producto de B', 2000);

insert into ingredientes (id, empresa_id, nombre, unidad) values
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Harina', 'kg'),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Azucar', 'kg');


-- ── AISLAMIENTO: lo que de verdad importa ────────────────────────────
-- Ana (empresa A) NO debe ver nada de la empresa B.

begin;
set local role authenticated;
set local request.jwt.claims = '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}';

do $$
declare n int; nombre_visto text;
begin
  select count(*) into n from clientes;
  if n <> 1 then
    raise exception 'FALLA RLS clientes: Ana ve % filas, deberia ver 1', n;
  end if;
  select nombre into nombre_visto from clientes;
  if nombre_visto <> 'Cliente de A' then
    raise exception 'FALLA RLS clientes: Ana ve "%"', nombre_visto;
  end if;
  raise notice 'OK  RLS clientes aisla por empresa';
end $$;

do $$
declare n int;
begin
  select count(*) into n from productos;
  if n <> 1 then raise exception 'FALLA RLS productos: ve % filas', n; end if;
  select count(*) into n from ingredientes;
  if n <> 1 then raise exception 'FALLA RLS ingredientes: ve % filas', n; end if;
  select count(*) into n from empresas;
  if n <> 1 then raise exception 'FALLA RLS empresas: ve % filas', n; end if;
  select count(*) into n from perfiles;
  if n <> 1 then raise exception 'FALLA RLS perfiles: ve % filas', n; end if;
  raise notice 'OK  RLS aisla productos, ingredientes, empresas y perfiles';
end $$;

-- Escribir en la empresa ajena debe fallar (with check)
do $$
begin
  begin
    insert into clientes (empresa_id, nombre)
    values ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Intruso');
    raise exception 'FALLA: Ana pudo insertar un cliente en la empresa B';
  exception when insufficient_privilege or check_violation then
    raise notice 'OK  RLS bloquea escribir en empresa ajena';
  end;
end $$;

-- Tampoco debe poder cambiarse de empresa (no hay policy de UPDATE en perfiles)
do $$
declare n int;
begin
  -- Puede fallar de dos formas, ambas correctas: sin privilegio de UPDATE
  -- en la tabla (excepcion), o con privilegio pero sin policy (0 filas).
  begin
    update perfiles set empresa_id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'
     where id = '11111111-1111-1111-1111-111111111111';
    get diagnostics n = row_count;
    if n > 0 then
      raise exception 'FALLA: Ana pudo cambiarse de empresa';
    end if;
    raise notice 'OK  nadie puede reasignarse de empresa (sin policy)';
  exception when insufficient_privilege then
    raise notice 'OK  nadie puede reasignarse de empresa (sin privilegio)';
  end;
end $$;

rollback;


-- ── TRIGGERS Y COLUMNAS GENERADAS ────────────────────────────────────

-- compras: precio_unit generado + trigger que actualiza el ingrediente
insert into compras (empresa_id, ingrediente_id, cantidad, unidad, precio_total)
values ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        'cccccccc-cccc-cccc-cccc-cccccccccccc', 4, 'kg', 8000);

do $$
declare pu numeric; ing_pu numeric;
begin
  select precio_unit into pu from compras limit 1;
  if pu <> 2000 then raise exception 'FALLA: precio_unit generado = % (esperaba 2000)', pu; end if;
  raise notice 'OK  compras.precio_unit se genera solo';

  select precio_unit into ing_pu from ingredientes
   where id = 'cccccccc-cccc-cccc-cccc-cccccccccccc';
  if ing_pu <> 2000 then
    raise exception 'FALLA: el trigger no actualizo el precio del ingrediente (quedo en %)', ing_pu;
  end if;
  raise notice 'OK  trigger sincroniza precio del ingrediente';
end $$;

-- El trigger NO debe cruzar empresas
do $$
declare otro numeric;
begin
  select precio_unit into otro from ingredientes
   where id = 'dddddddd-dddd-dddd-dddd-dddddddddddd';
  if otro <> 0 then
    raise exception 'FALLA GRAVE: el trigger toco el ingrediente de otra empresa (%)', otro;
  end if;
  raise notice 'OK  el trigger de compras no cruza empresas';
end $$;

-- stock: trigger que deja el stock igual al ultimo conteo
insert into conteos_stock (empresa_id, ingrediente_id, cantidad)
values ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        'cccccccc-cccc-cccc-cccc-cccccccccccc', 37.5);

do $$
declare s numeric;
begin
  select stock into s from ingredientes where id = 'cccccccc-cccc-cccc-cccc-cccccccccccc';
  if s <> 37.5 then raise exception 'FALLA: stock quedo en % (esperaba 37.5)', s; end if;
  raise notice 'OK  trigger de stock sincroniza el ingrediente';
end $$;

-- pedidos: subtotal generado + trigger de total
do $$
declare pedido uuid; producto uuid; t numeric;
begin
  select id into producto from productos where empresa_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

  insert into pedidos (empresa_id) values ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa')
  returning id into pedido;

  insert into pedido_items (pedido_id, producto_id, cantidad, precio_unit)
  values (pedido, producto, 3, 1500);

  select total into t from pedidos where id = pedido;
  if t <> 4500 then raise exception 'FALLA: total del pedido = % (esperaba 4500)', t; end if;
  raise notice 'OK  trigger de total del pedido (insert)';

  insert into pedido_items (pedido_id, producto_id, cantidad, precio_unit)
  values (pedido, producto, 1, 500);
  select total into t from pedidos where id = pedido;
  if t <> 5000 then raise exception 'FALLA: total tras 2da linea = % (esperaba 5000)', t; end if;

  delete from pedido_items where pedido_id = pedido and precio_unit = 500;
  select total into t from pedidos where id = pedido;
  if t <> 4500 then raise exception 'FALLA: total tras borrar linea = % (esperaba 4500)', t; end if;
  raise notice 'OK  trigger de total del pedido (update y delete)';
end $$;

-- recetas: costeo desde el precio del ingrediente
do $$
declare receta uuid; producto uuid; costo numeric;
begin
  select id into producto from productos where empresa_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
  insert into recetas (empresa_id, producto_id, nombre, rinde)
  values ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', producto, 'Receta A', 10)
  returning id into receta;

  insert into receta_ingredientes (receta_id, ingrediente_id, cantidad)
  values (receta, 'cccccccc-cccc-cccc-cccc-cccccccccccc', 2.5);

  -- 2.5 kg x 2000 (precio que dejo la compra) = 5000
  select sum(ri.cantidad * i.precio_unit) into costo
    from receta_ingredientes ri join ingredientes i on i.id = ri.ingrediente_id
   where ri.receta_id = receta;
  if costo <> 5000 then raise exception 'FALLA: costo de receta = % (esperaba 5000)', costo; end if;
  raise notice 'OK  costeo de receta usa el precio vigente del ingrediente';
end $$;

-- Detalle hereda aislamiento de su cabecera
begin;
set local role authenticated;
set local request.jwt.claims = '{"sub":"22222222-2222-2222-2222-222222222222","role":"authenticated"}';
do $$
declare n int;
begin
  select count(*) into n from pedido_items;
  if n <> 0 then
    raise exception 'FALLA GRAVE: Beto ve % lineas de pedidos de la empresa A', n;
  end if;
  select count(*) into n from receta_ingredientes;
  if n <> 0 then
    raise exception 'FALLA GRAVE: Beto ve % ingredientes de recetas de la empresa A', n;
  end if;
  raise notice 'OK  pedido_items y receta_ingredientes heredan el aislamiento';
end $$;
rollback;

select '=== TODAS LAS VALIDACIONES PASARON ===' as resultado;
