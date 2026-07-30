export type Cliente = {
  id: string;
  empresa_id: string | null;
  nombre: string;
  telefono: string | null;
  direccion: string | null;
  notas: string | null;
  activo: boolean;
};

export type ClienteInput = Omit<Cliente, "id" | "empresa_id" | "activo"> & { id?: string };
