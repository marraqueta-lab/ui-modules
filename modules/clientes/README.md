# Clientes

Ficha de clientes de la pyme: datos de contacto y notas.

## Origen

Extraído comparando dos implementaciones reales e independientes:

- **`la-casa-de-las-nueces`**: campos simples (nombre, teléfono, dirección,
  notas), probados en uso real, pero sin `empresa_id` — la app fue
  construida single-tenant a propósito ("uso interno familiar").
- **`marraqueta-kit` (Tomás)**: traía el shape de tenancy correcto
  (`empresa_id` + RLS por `perfiles`), pero con un bug real: la matriz de
  permisos por rol (`puede()`) nunca se llamaba desde `actions.ts` — un
  usuario `solo_lectura` podía invocar el Server Action de borrado
  directamente.

Este módulo toma el patrón de tenancy de Tomás, el set de campos mínimo de
Nueces (no se agregó `rut`/`email`/`tipo` porque ningún cliente real los ha
pedido todavía — se agregan cuando alguno lo pida, no antes), y corrige el
bug: `actions.ts` verifica el permiso en el servidor antes de ejecutar,
en vez de solo esconder el botón en la UI.

## Requiere del `core` del app consumidor

- `@core/supabase/server` — cliente de Supabase en servidor
- `@core/multi-empresa/empresa` — `empresaActivaId()`
- `@core/auth/session` — `getPerfil()`
- `@core/auth/roles` — `puede()`

## Instalación en un cliente

1. Corre `schema.sql` en el SQL Editor de Supabase del cliente, después del
   esquema base (`empresas` + `perfiles`).
2. Importa `ClientesPanel` desde `modules/clientes/components/ClientesPanel`
   en la página del dashboard que corresponda, pasándole
   `await listarClientes()` como prop.

## Baja lógica

`desactivarCliente` marca `activo = false`, nunca borra la fila — un
cliente puede tener pedidos asociados y perder ese historial sería peor
que dejarlo inactivo.
