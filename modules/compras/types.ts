export type Compra = {
  id: string;
  empresa_id: string | null;
  ingrediente_id: string;
  fecha: string;
  cantidad: number;
  unidad: string;
  precio_total: number;
  /** Columna generada en la base: precio_total / cantidad. */
  precio_unit: number;
  notas: string | null;
  ingrediente?: { id: string; nombre: string; unidad: string } | null;
};

export type CompraInput = Omit<
  Compra,
  "id" | "empresa_id" | "precio_unit" | "ingrediente"
>;
