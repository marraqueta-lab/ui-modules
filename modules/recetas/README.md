# Recetas

Qué ingredientes lleva cada producto, y cuánto cuesta producirlo.

## Qué hace

- Listar recetas activas con sus ingredientes y el precio de cada uno.
- Crear y editar recetas; agregar y quitar ingredientes.
- Calcular el costo total de la receta y el costo por unidad producida.
- Verifica el permiso por rol en el servidor antes de cada acción.

## Requiere

- Esquema base (`empresas` + `perfiles`).
- Los módulos **`productos`** e **`ingredientes`** instalados.

## Instalación en una app cliente

1. Corre los `schema.sql` de `productos` e `ingredientes` primero, y
   después el de este módulo.
2. Monta el panel:

```tsx
import { RecetasPanel } from "@marraqueta/ui-modules/modules/recetas/components/RecetasPanel";
import { listarRecetas } from "@marraqueta/ui-modules/modules/recetas/lib/recetas-db";
import { listarProductos } from "@marraqueta/ui-modules/modules/productos/lib/productos-db";
import { listarIngredientes } from "@marraqueta/ui-modules/modules/ingredientes/lib/ingredientes-db";

export default async function Page() {
  const [recetas, productos, ingredientes] = await Promise.all([
    listarRecetas(),
    listarProductos(),
    listarIngredientes(),
  ]);
  return <RecetasPanel recetas={recetas} productos={productos} ingredientes={ingredientes} />;
}
```

## Requiere del `core` de la app consumidora

- `@core/supabase/server`
- `@core/multi-empresa/empresa` — `empresaActivaId()`
- `@core/auth/session` — `getPerfil()`
- `@core/auth/roles` — `puede()`

## Costeo

`types.ts` exporta dos funciones puras, usables donde se necesiten:

```ts
costoReceta(receta)    // suma de precio_unit x cantidad de cada ingrediente
costoUnitario(receta)  // costo / rinde; null si la receta no declara rinde
```

El costo sale del `precio_unit` actual de cada ingrediente — que el módulo
`compras` mantiene al día con la última compra. O sea: registrar una compra
actualiza el costo de todas las recetas que usan ese ingrediente.

## Tablas

| Tabla | Qué guarda |
|---|---|
| `recetas` | cabecera: producto, nombre, cuánto rinde, notas |
| `receta_ingredientes` | una fila por ingrediente, con su cantidad |

`receta_ingredientes` no lleva `empresa_id` propio: su RLS hereda de la
receta padre. Así no puede existir una línea cuya empresa contradiga la de
su receta.
