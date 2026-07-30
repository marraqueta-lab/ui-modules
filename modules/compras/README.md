# Compras

Registro de compras de insumos. Al registrar una compra, el precio
unitario del ingrediente queda actualizado con el de esa compra.

## Qué hace

- Listar las compras de la empresa, más recientes primero.
- Registrar una compra nueva.
- Calcular el precio unitario solo (columna generada en la base).
- Sincronizar el precio del ingrediente vía trigger.

Las compras no se editan ni se borran: son un registro histórico. Si una
quedó mal, se registra la corrección.

## Requiere

- Esquema base (`empresas` + `perfiles`).
- El módulo **`ingredientes`** instalado — `compras.ingrediente_id` tiene
  FK a esa tabla.

## Instalación en una app cliente

1. Corre el `schema.sql` de `ingredientes` primero, y después el de este
   módulo.
2. Monta el panel, pasándole también los ingredientes disponibles:

```tsx
import { ComprasPanel } from "@marraqueta/ui-modules/modules/compras/components/ComprasPanel";
import { listarCompras } from "@marraqueta/ui-modules/modules/compras/lib/compras-db";
import { listarIngredientes } from "@marraqueta/ui-modules/modules/ingredientes/lib/ingredientes-db";

export default async function Page() {
  const [compras, ingredientes] = await Promise.all([
    listarCompras(),
    listarIngredientes(),
  ]);
  return <ComprasPanel compras={compras} ingredientes={ingredientes} />;
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
| `cantidad` | numeric(10,3) | obligatoria, mayor que cero |
| `unidad` | text | se precarga con la del ingrediente |
| `precio_total` | numeric(10,0) | lo que se pagó |
| `precio_unit` | numeric(10,2) | **generado**: `precio_total / cantidad` |
| `notas` | text | opcional |

`precio_unit` es una columna generada, no un campo que se escriba: así no
puede quedar desincronizado del total y la cantidad.
