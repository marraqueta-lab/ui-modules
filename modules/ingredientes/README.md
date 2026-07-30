# Ingredientes

Materias primas de la pyme: unidad de medida, precio unitario y stock.

## Qué hace

- Listar los ingredientes activos de la empresa.
- Crear, editar y dar de baja (baja lógica).
- Verifica el permiso por rol en el servidor antes de cada acción.

## Instalación en una app cliente

1. Corre `schema.sql` en el SQL Editor de Supabase, después del esquema
   base (`empresas` + `perfiles`).
2. Monta el panel en la página del dashboard:

```tsx
import { IngredientesPanel } from "@marraqueta/ui-modules/modules/ingredientes/components/IngredientesPanel";
import { listarIngredientes } from "@marraqueta/ui-modules/modules/ingredientes/lib/ingredientes-db";

export default async function Page() {
  const ingredientes = await listarIngredientes();
  return <IngredientesPanel ingredientes={ingredientes} />;
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
| `unidad` | text | obligatorio — `kg`, `lt`, `un`, lo que use el negocio |
| `precio_unit` | numeric(10,4) | 4 decimales: insumos con precio por gramo |
| `stock` | numeric(12,3) | cantidad actual |

## Lo usan

`compras` (actualiza `precio_unit` con la última compra) y `recetas`
(calcula el costo de la receta desde el precio de sus ingredientes).
