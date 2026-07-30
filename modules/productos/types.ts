export type Producto = {
  id: string;
  empresa_id: string | null;
  nombre: string;
  descripcion: string | null;
  categoria: string | null;
  precio: number;
  precio_mayorista: number;
  activo: boolean;
};

export type ProductoInput = Omit<Producto, "id" | "empresa_id" | "activo"> & { id?: string };
