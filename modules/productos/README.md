# Productos

Catálogo de productos que la pyme vende, con precio normal y mayorista.

## Qué hace

- Listar los productos activos de la empresa.
- Crear, editar y dar de baja (baja lógica).
- Verifica el permiso por rol en el servidor antes de cada acción.

## Instalación en una app cliente

1. Corre `schema.sql` en el SQL Editor de Supabase, después del esquema
   base (`empresas` + `perfiles`).
2. Monta el panel en la página del dashboard:

```tsx
import { ProductosPanel } from "@marraqueta/ui-modules/modules/productos/components/ProductosPanel";
import { listarProductos } from "@marraqueta/ui-modules/modules/productos/lib/productos-db";

export default async function Page() {
  const productos = await listarProductos();
  return <ProductosPanel productos={productos} />;
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
| `descripcion` | text | opcional |
| `categoria` | text | texto libre, no una tabla aparte |
| `precio` | numeric(10,2) | precio de venta |
| `precio_mayorista` | numeric(10,2) | opcional según el negocio |

`categoria` es texto libre a propósito. Un módulo de categorías
administrables no se justifica hasta que un cliente lo pida — si llega ese
caso, se gradúa entonces.

## Lo usan

`pedidos` (líneas del pedido) y `recetas` (qué producto produce la receta).
