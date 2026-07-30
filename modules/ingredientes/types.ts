export type Ingrediente = {
  id: string;
  empresa_id: string | null;
  nombre: string;
  unidad: string;
  precio_unit: number;
  stock: number;
  activo: boolean;
};

export type IngredienteInput = Omit<Ingrediente, "id" | "empresa_id" | "activo"> & { id?: string };
