# ui-modules

Biblioteca de módulos reutilizables de Marraqueta Lab. Cada app de cliente
la consume como dependencia, fijada a un tag específico — nunca a `main`.

```json
{
  "dependencies": {
    "@marraqueta/ui-modules": "github:marraqueta-lab/ui-modules#v0.3.0"
  }
}
```

Al mejorar un módulo se sube un tag nuevo y se actualiza a mano la línea
del `package.json` de cada cliente que corresponda. Ningún cliente se
actualiza solo — evita romper la producción de un cliente por un cambio
pensado para otro. El detalle de esta decisión está en el handoff de
infraestructura del proyecto.

## Qué trae

- `types.ts` — el contrato (`ModuleConfig`) que describe cada módulo.
- `_TEMPLATE/` — punto de partida para crear un módulo nuevo.
- `modules/` — el catálogo. Cada carpeta es un módulo autocontenido:
  schema, tipos, acceso a datos, Server Actions y UI.
- `docs/COMO-CREAR-UN-MODULO.md` — el contrato en detalle y el criterio de
  graduación (cuándo algo entra acá y cuándo no).

## Módulos disponibles

| Módulo | Qué hace | Requiere |
|---|---|---|
| [`clientes`](modules/clientes) | Ficha de clientes: contacto y notas | — |
| [`productos`](modules/productos) | Catálogo de lo que vende la pyme | — |
| [`ingredientes`](modules/ingredientes) | Materias primas: unidad, precio y stock | — |
| [`compras`](modules/compras) | Compras de insumos; actualiza el precio del ingrediente | `ingredientes` |
| [`stock`](modules/stock) | Conteos periódicos de inventario | `ingredientes` |
| [`recetas`](modules/recetas) | Composición de un producto y su costo | `productos`, `ingredientes` |
| [`pedidos`](modules/pedidos) | Pedidos de clientes con líneas y total | `clientes`, `productos` |

Los `schema.sql` se corren en orden de dependencia: primero los módulos sin
requisitos, después los que dependen de ellos.

### Cálculos que hace la base, no la app

Varios módulos delegan totales a Postgres a propósito — un total que llega
calculado desde el cliente es un total en el que no se puede confiar:

- `compras.precio_unit` — columna generada (`precio_total / cantidad`).
- `pedido_items.subtotal` — columna generada (`cantidad x precio_unit`).
- `pedidos.total` — trigger que suma las líneas ante cualquier cambio.
- `ingredientes.precio_unit` — trigger desde la última compra.
- `ingredientes.stock` — trigger desde el último conteo.

## Qué NO trae

- **El `core`** (auth, sesión, multi-empresa, cliente de Supabase) — vive en
  `template-app`, porque toda app lo necesita desde el día uno, no es algo
  que se gradúa. Los módulos de acá asumen que existe en la app que los
  consume, vía imports `@core/...`.
- **Módulos sin código real.** Si algo aparece en `docs/` como candidato
  pero no en `modules/`, es porque todavía no cumple el criterio de
  graduación — no es una promesa de que se va a construir.

## Qué necesita la app consumidora

Verificado consumiendo `clientes` desde `template-app` de punta a punta.
Sin las cuatro, o el build falla o la app se ve rota:

1. **`transpilePackages` en `next.config.ts`:**

   ```ts
   const nextConfig: NextConfig = {
     transpilePackages: ["@marraqueta/ui-modules"],
   };
   ```

   Sin esto Turbopack tira `Module not found` al resolver el subpath —
   Next.js no compila `node_modules` por defecto y acá se distribuye
   TypeScript sin compilar.

2. **Alias `@core/*` en `tsconfig.json`**, apuntando a la carpeta `core/`
   de la app:

   ```json
   "paths": { "@core/*": ["./core/*"] }
   ```

   Los módulos importan `@core/supabase/server`, `@core/auth/session`,
   etc. `template-app` ya lo trae.

3. **`@source` en `globals.css`**, apuntando al paquete:

   ```css
   @source "../node_modules/@marraqueta/ui-modules";
   ```

   Tailwind no escanea `node_modules` por defecto. Sin esta línea las
   clases de los paneles **no generan CSS** y se renderizan sin estilos.
   Ojo: el build, el typecheck y el lint pasan igual — el error solo se
   ve en pantalla.

4. **Variables de Supabase presentes al construir**
   (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`), incluido
   el CI. Los módulos las leen al crear el cliente.

Las páginas que consumen un módulo quedan **dinámicas** automáticamente
(`ƒ` en el output del build), porque el cliente de Supabase lee cookies.
Es lo correcto para pantallas autenticadas — no hay que forzar nada.

## Nota sobre instalación local

Si pruebas la biblioteca con una dependencia de path, usa
`npm install ../ui-modules --install-links`. Sin `--install-links` npm crea
un symlink y Turbopack no resuelve el paquete. Un install real desde
`github:` copia los archivos, así que este problema es solo del flujo
local.
