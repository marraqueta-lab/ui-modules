export type ConteoStock = {
  id: string;
  empresa_id: string | null;
  ingrediente_id: string;
  fecha: string;
  cantidad: number;
  notas: string | null;
  ingrediente?: { id: string; nombre: string; unidad: string } | null;
};

export type ConteoStockInput = {
  ingrediente_id: string;
  cantidad: number;
  notas?: string | null;
};
