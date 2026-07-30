# Clientes

Ficha de clientes de la pyme: datos de contacto y notas.

## Qué hace

- Listar los clientes activos de la empresa.
- Crear, editar y dar de baja (baja lógica — no borra la fila).
- Verifica el permiso por rol en el servidor antes de cada acción.

## Instalación en una app cliente

1. Corre `schema.sql` en el SQL Editor de Supabase, después del esquema
   base (`empresas` + `perfiles`).
2. Importa el panel y la función de listado en la página del dashboard:

```tsx
import { ClientesPanel } from "@marraqueta/ui-modules/modules/clientes/components/ClientesPanel";
import { listarClientes } from "@marraqueta/ui-modules/modules/clientes/lib/clientes-db";

export default async function Page() {
  const clientes = await listarClientes();
  return <ClientesPanel clientes={clientes} />;
}
```

## Requiere del `core` de la app consumidora

- `@core/supabase/server`
- `@core/multi-empresa/empresa` — `empresaActivaId()`
- `@core/auth/session` — `getPerfil()`
- `@core/auth/roles` — `puede()`

## Campos

| Campo | Tipo | Notas |
|---|---|---|
| `nombre` | text | obligatorio |
| `telefono` | text | opcional |
| `direccion` | text | opcional |
| `notas` | text | opcional |

Sin `rut` / `email` / `tipo` — se agregan si un cliente concreto los pide.
