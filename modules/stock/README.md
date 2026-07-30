# Stock

Conteos periódicos de inventario. Cada conteo deja el stock del
ingrediente igual a lo contado.

## Qué hace

- Registrar un conteo de varios ingredientes de una vez (los que quedan en
  blanco no se cuentan).
- Listar el historial de conteos.
- Sincronizar el stock del ingrediente vía trigger.

Los conteos son un registro histórico: no se editan ni se borran. Si un
conteo quedó mal, se hace uno nuevo.

## Requiere

- Esquema base (`empresas` + `perfiles`).
- El módulo **`ingredientes`** instalado — `conteos_stock.ingrediente_id`
  tiene FK a esa tabla.

## Instalación en una app cliente

1. Corre el `schema.sql` de `ingredientes` primero, y después el de este
   módulo.
2. Monta el panel:

```tsx
import { StockPanel } from "@marraqueta/ui-modules/modules/stock/components/StockPanel";
import { listarConteos } from "@marraqueta/ui-modules/modules/stock/lib/stock-db";
import { listarIngredientes } from "@marraqueta/ui-modules/modules/ingredientes/lib/ingredientes-db";

export default async function Page() {
  const [conteos, ingredientes] = await Promise.all([
    listarConteos(),
    listarIngredientes(),
  ]);
  return <StockPanel conteos={conteos} ingredientes={ingredientes} />;
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
| `ingrediente_id` | uuid | FK a `ingredientes` |
| `fecha` | date | por defecto hoy |
| `cantidad` | numeric(12,3) | lo contado |
| `notas` | text | opcional |

`listarConteos()` trae los últimos 200 conteos. Si un cliente necesita el
histórico completo con filtros, se agrega paginación entonces.
