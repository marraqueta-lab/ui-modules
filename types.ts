/** Contrato que describe cada módulo de la biblioteca. */
export type CategoriaModulo =
  | "Comercial / Ventas"
  | "Operaciones / Producción"
  | "Inventario y Auditoría"
  | "IA y Documentos"
  | "Cumplimiento y Casos";

export type ModuleConfig = {
  /** identificador en kebab-case, coincide con la carpeta y la ruta */
  slug: string;
  /** nombre visible en la navegación */
  nombre: string;
  categoria: CategoriaModulo;
  /** una línea: qué hace el módulo */
  descripcion: string;
  /** ruta dentro del dashboard, ej. "/clientes" */
  ruta: string;
  /** apps de donde proviene el código/patrón */
  origen: string[];
};
