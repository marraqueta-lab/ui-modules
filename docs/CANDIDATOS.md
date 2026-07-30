# Candidatos a módulo

Backlog de módulos identificados pero **no construidos**. Estar acá no es
promesa de que se van a hacer: es un mapa de qué necesita una pyme y —lo
más útil— **dónde ya existe código real** de cada cosa.

Cuando un cliente pida algo de esta lista, el primer paso es mirar la app
de origen antes de escribir nada.

## De dónde viene esto

Del catálogo que armó Tomás en el Marraqueta Kit (julio 2026), destilando
tres desarrollos propios:

| App | Rubro | Módulos que aporta |
|---|---|---|
| **almuerzops** | Gestión y catering | 13 |
| **Atenea** | IA y cumplimiento normativo | 7 |
| **S-CAN** | Inventario y auditoría | 7 |

Se conserva acá porque el valor no era el andamiaje de código —eran
carpetas casi vacías— sino saber en qué app buscar cuando toque
construir cada uno.

## Ya graduados

Estos salieron del catálogo y hoy existen en `modules/`:
`clientes-crm` (como `clientes`), `pedidos`, `recetas`, `compras`,
`insumos-materiales` (como `ingredientes`). Todos se construyeron
tomando el código real de `la-casa-de-las-nueces`.

## Pendientes

### Base / Transversales

| Módulo | Qué hace | Dónde hay código |
|---|---|---|
| `dashboard-kpis` | Tableros de indicadores con gráficos y drill-down | S-CAN, almuerzops |
| `equipo-usuarios` | Alta de usuarios, cargos y asignación de permisos | almuerzops, Atenea |

### Comercial / Ventas

| Módulo | Qué hace | Dónde hay código |
|---|---|---|
| `cobranza` | Estados de cuenta y cobros por empresa | almuerzops |
| `ventas` | Registro y consulta de ventas | almuerzops |
| `planes-suscripciones` | Cobros recurrentes con generación mensual | almuerzops |
| `vouchers` | Emisión y canje de vouchers | almuerzops |

### Operaciones / Producción

| Módulo | Qué hace | Dónde hay código |
|---|---|---|
| `planificacion-produccion` | Qué producir, cuánto y cuándo | almuerzops |
| `ordenes-preparacion` | Instrucciones y estimación de tiempos | almuerzops |
| `logistica-reparto` | Listas de reparto y rutas por cliente | almuerzops |

### Inventario y Auditoría

| Módulo | Qué hace | Dónde hay código |
|---|---|---|
| `inventario-captura` | Conteo por ubicación y SKU con validaciones | S-CAN |
| `ubicaciones-bodega` | Mapa de ubicaciones, contado o pendiente | S-CAN |
| `maestro-materiales` | Catálogo de SKU con familia y unidad | S-CAN |
| `analisis-diferencias` | Faltantes y sobrantes valorizados | S-CAN |
| `importar-exportar` | Carga masiva y reportes en Excel/PDF | S-CAN |
| `sincronizacion-fuentes` | Conexión con Google Sheets y planillas | S-CAN |

### IA y Documentos

| Módulo | Qué hace | Dónde hay código |
|---|---|---|
| `asistente-ia` | Chat que responde sobre el negocio | Atenea, almuerzops |
| `busqueda-rag` | Responde citando documentos o normativa propia | Atenea |
| `generacion-documentos` | Documentos desde plantillas con variables | Atenea |
| `revision-ia` | Revisa textos por normativa y coherencia | Atenea |
| `generacion-pdf` | Exporta comunicados e informes a PDF | Atenea, S-CAN |
| `integracion-whatsapp` | Recibe y responde mensajes por WhatsApp | almuerzops |

### Cumplimiento y Casos

| Módulo | Qué hace | Dónde hay código |
|---|---|---|
| `casos-expedientes` | Casos con etapas, plazos y seguimiento | Atenea |
| `calendario-obligaciones` | Avisa vencimientos y su estado | Atenea |

## Antes de construir uno

Vale el mismo criterio de graduación de siempre (ver
[`COMO-CREAR-UN-MODULO.md`](COMO-CREAR-UN-MODULO.md)): entra a la
biblioteca cuando lo necesita un segundo cliente **y** está desacoplado
del primero. Si lo pide un solo cliente, se construye en su repo y se
gradúa después.

Los de **IA y Documentos** además traen una consideración propia: llevan
claves de API y llamadas a servicios externos. Todo eso va en el servidor,
nunca con prefijo `NEXT_PUBLIC_`, y con límite de uso — una clave expuesta
en el navegador se traduce en facturación ajena.
