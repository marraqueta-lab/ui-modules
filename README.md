# ui-modules

Biblioteca de módulos reutilizables de Marraqueta Lab. Cada app de cliente
la consume como dependencia, fijada a un tag específico — nunca a `main`.

```json
{
  "dependencies": {
    "@marraqueta/ui-modules": "github:marraqueta-lab/ui-modules#v0.1.0"
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

| Módulo | Qué hace | Origen |
|---|---|---|
| [`clientes`](modules/clientes) | Ficha de clientes: contacto y notas | la-casa-de-las-nueces + marraqueta-kit |

## Qué NO trae

- **El `core`** (auth, sesión, multi-empresa, cliente de Supabase) — vive en
  `template-app`, porque toda app lo necesita desde el día uno, no es algo
  que se gradúa. Los módulos de acá asumen que existe en la app que los
  consume, vía imports `@core/...`.
- **Módulos sin código real.** Si algo aparece en `docs/` como candidato
  pero no en `modules/`, es porque todavía no cumple el criterio de
  graduación — no es una promesa de que se va a construir.

## Cómo se consume `@core/...` dentro de un módulo

Los módulos importan rutas como `@core/supabase/server` asumiendo que la
app consumidora define ese alias en su propio `tsconfig.json` (apuntando a
su carpeta `core/`) y agrega este paquete a `transpilePackages` en
`next.config.ts` — porque `ui-modules` se distribuye como TypeScript sin
compilar, no como paquete publicado. `template-app` trae esa configuración
una vez que el `core` del kit se incorpore ahí.
