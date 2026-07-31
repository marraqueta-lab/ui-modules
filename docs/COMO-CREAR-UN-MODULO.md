# Cómo crear (o extraer) un módulo

Todos los módulos siguen el mismo contrato, para que cualquiera del equipo
pueda tomar uno y adaptarlo sin sorpresas.

## Anatomía de un módulo

```
modules/<slug>/
├─ module.config.ts          metadatos (slug, nombre, categoría, ruta, origen)
├─ README.md                 qué hace, de dónde salió, qué decisiones se tomaron
├─ schema.sql                tablas del módulo (empresa_id + RLS, siempre)
├─ types.ts                  tipos de dominio
├─ lib/<slug>-db.ts          acceso a datos (SERVIDOR)
├─ actions.ts                Server Actions — verifican permisos, no solo el cliente
└─ components/<X>Panel.tsx   UI (CLIENTE)
```

## Reglas

1. **Multi-empresa siempre.** Toda tabla lleva `empresa_id` y RLS filtrando
   por la empresa del usuario. Copia el patrón de `modules/clientes/schema.sql`.

   Y **el `grant` al final no es opcional**:

   ```sql
   grant select, insert, update, delete on table <tabla> to authenticated;
   ```

   La RLS decide *qué filas* se ven; el `grant` decide si el rol puede
   tocar la tabla siquiera. Sin él, la consulta muere con
   `permission denied` antes de evaluar ninguna policy — y no se hereda:
   las default privileges del rol `postgres` en `public` solo otorgan
   TRUNCATE/REFERENCES/TRIGGER.
2. **Lógica en el servidor.** Acceso a datos y reglas de negocio viven en
   `lib/*-db.ts` y `actions.ts`, no en el componente cliente.
3. **Permisos verificados en el servidor, dentro de cada action** — no solo
   ocultando botones en la UI. Un Server Action es un endpoint público:
   cualquiera con sesión puede invocarlo directo. Usa
   `puede(rol, accion)` de `@core/auth/roles` **dentro** de `actions.ts`
   antes de ejecutar la mutación (mira `modules/clientes/actions.ts`).
   Ocultar el botón es además, no en vez de.
4. **Baja lógica, no borrado.** Marca `activo = false` en vez de borrar,
   para no perder histórico.
5. **Campos mínimos primero.** No agregues campos porque "podrían servir".
   Si el módulo sale de una app real, parte con los campos que esa app
   realmente usa. Se agregan cuando un cliente real los pide.

6. **Solo tokens semánticos en la UI, nunca colores fijos.** Cada app de
   cliente lleva su propia paleta partiendo de la misma base: si un panel
   usa `neutral-200`, se queda gris cuando el cliente cambia su tema, y
   hay que corregirlo app por app.

   | En vez de | Usa |
   |---|---|
   | `border-neutral-200` | `border-border` |
   | `border-neutral-300` (inputs) | `border-input` |
   | `text-neutral-500` / `-400` | `text-muted-foreground` |
   | `bg-neutral-900` + `text-white` | `bg-primary` + `text-primary-foreground` |
   | `text-amber-700` (acciones) | `text-primary` |
   | `hover:text-red-600` | `hover:text-destructive` |

   Lo mismo con el radio: `rounded-lg` sale de `--radius`, no lo fijes en
   píxeles.

## Criterio de graduación

Antes de que algo entre a `modules/`, tiene que cumplir las dos condiciones
del `CONTRIBUTING.md` de `template-app`:

1. **Se necesita en un segundo cliente** — o hay evidencia retroactiva
   fuerte: dos apps reales construidas por separado llegaron al mismo
   concepto sin coordinarse (así entró `clientes`).
2. **Está desacoplado** de nombres de tablas y reglas de negocio propias
   del cliente original.

Si un módulo no cumple ambas, no entra — queda anotado como candidato en
lugar de código.

## Paso a paso (partiendo de `_TEMPLATE`)

1. Copia `_TEMPLATE/` a `modules/<slug>/`.
2. Edita `module.config.ts`: `slug`, `nombre`, `categoria`, `ruta`, `origen`.
3. Define las tablas en `schema.sql` siguiendo el patrón de `clientes`.
4. Escribe `types.ts` y `lib/<slug>-db.ts`.
5. Escribe `actions.ts` con la verificación de permisos por acción.
6. Arma la UI en `components/Panel.tsx`.
7. Documenta en el `README.md` del módulo: qué hace, cómo se instala en
   una app cliente (el SQL a correr, cómo se importa), qué requiere del
   `core`, y sus campos. Nada de crónica de decisiones — eso va en el
   commit, no en el README que alguien lee para usar el módulo. Mira
   `modules/clientes/README.md` como formato.

## Referencia viva

El módulo `clientes` implementa todo el contrato con código real. Cuando
dudes de cómo hacer algo — la forma del `schema.sql`, cómo se ve un
`actions.ts` con permisos, el formato del README — mira ese módulo primero.
