export type RecetaIngrediente = {
  id: string;
  receta_id: string;
  ingrediente_id: string;
  cantidad: number;
  ingrediente?: { id: string; nombre: string; unidad: string; precio_unit: number } | null;
};

export type Receta = {
  id: string;
  empresa_id: string | null;
  producto_id: string;
  nombre: string;
  rinde: number | null;
  rinde_unidad: string | null;
  notas: string | null;
  activo: boolean;
  producto?: { id: string; nombre: string; precio: number } | null;
  receta_ingredientes?: RecetaIngrediente[];
};

export type RecetaInput = {
  id?: string;
  producto_id: string;
  nombre: string;
  rinde: number | null;
  rinde_unidad: string | null;
  notas: string | null;
};

export type RecetaIngredienteInput = {
  receta_id: string;
  ingrediente_id: string;
  cantidad: number;
};

/**
 * Costo total de la receta: suma de (precio del ingrediente x cantidad).
 * Devuelve 0 si la receta viene sin sus ingredientes cargados.
 */
export function costoReceta(receta: Receta): number {
  return (receta.receta_ingredientes ?? []).reduce((suma, ri) => {
    return suma + (ri.ingrediente?.precio_unit ?? 0) * ri.cantidad;
  }, 0);
}

/** Costo por unidad producida. Null si la receta no declara cuánto rinde. */
export function costoUnitario(receta: Receta): number | null {
  if (!receta.rinde || receta.rinde <= 0) return null;
  return costoReceta(receta) / receta.rinde;
}
