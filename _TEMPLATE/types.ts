export type Item = {
  id: string;
  empresa_id: string | null;
  nombre: string;
  activo: boolean;
};

export type ItemInput = Omit<Item, "id" | "empresa_id" | "activo"> & { id?: string };
