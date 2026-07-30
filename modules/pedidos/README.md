# Pedidos

Pedidos de clientes, con sus líneas de productos, estado y total.

## Qué hace

- Listar pedidos de la empresa, más recientes primero.
- Crear y editar pedidos; agregar y quitar líneas.
- Calcular el total solo, vía trigger, a partir de las líneas.
- Verifica el permiso por rol en el servidor antes de cada acción.

## Requiere

- Esquema base (`empresas` + `perfiles`).
- Los módulos **`clientes`** y **`productos`** instalados.

## Instalación en una app cliente

1. Corre los `schema.sql` de `clientes` y `productos` primero, y después
   el de este módulo.
2. Monta el panel:

```tsx
import { PedidosPanel } from "@marraqueta/ui-modules/modules/pedidos/components/PedidosPanel";
import { listarPedidos } from "@marraqueta/ui-modules/modules/pedidos/lib/pedidos-db";
import { listarClientes } from "@marraqueta/ui-modules/modules/clientes/lib/clientes-db";
import { listarProductos } from "@marraqueta/ui-modules/modules/productos/lib/productos-db";

export default async function Page() {
  const [pedidos, clientes, productos] = await Promise.all([
    listarPedidos(),
    listarClientes(),
    listarProductos(),
  ]);
  return <PedidosPanel pedidos={pedidos} clientes={clientes} productos={productos} />;
}
```

## Requiere del `core` de la app consumidora

- `@core/supabase/server`
- `@core/multi-empresa/empresa` — `empresaActivaId()`
- `@core/auth/session` — `getPerfil()`
- `@core/auth/roles` — `puede()`

## Estados

`pendiente` → `confirmado` → `entregado`, más `cancelado`. El módulo no
impone transiciones: cualquier estado puede pasar a cualquier otro, porque
las reglas varían mucho entre negocios. Si un cliente necesita un flujo
estricto, se agrega en su app.

## Totales y precios

- `pedido_items.subtotal` es **columna generada**: `cantidad x precio_unit`.
- `pedidos.total` lo mantiene un **trigger** ante cualquier alta, cambio o
  baja de línea.

Ninguno de los dos se escribe desde la app: un total que llega calculado
desde el cliente es un total en el que no se puede confiar.

`precio_unit` se copia del producto al momento de agregar la línea, no se
lee en vivo. Si el precio del producto sube después, los pedidos viejos
conservan lo que se cobró.

## Lo que no trae

Sin método de pago ni boleta/factura. En la fuente original (`Nueces`) eso
vivía en tablas aparte; acá se dejó fuera hasta que un cliente real lo
pida, para que el módulo se pueda instalar solo.
