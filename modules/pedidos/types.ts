export type EstadoPedido = "pendiente" | "confirmado" | "entregado" | "cancelado";

export const ESTADOS_PEDIDO: EstadoPedido[] = [
  "pendiente",
  "confirmado",
  "entregado",
  "cancelado",
];

export const ESTADO_LABEL: Record<EstadoPedido, string> = {
  pendiente: "Pendiente",
  confirmado: "Confirmado",
  entregado: "Entregado",
  cancelado: "Cancelado",
};

export type PedidoItem = {
  id: string;
  pedido_id: string;
  producto_id: string;
  cantidad: number;
  precio_unit: number;
  /** Columna generada en la base: cantidad x precio_unit. */
  subtotal: number;
  producto?: { id: string; nombre: string } | null;
};

export type Pedido = {
  id: string;
  empresa_id: string | null;
  cliente_id: string | null;
  fecha: string;
  fecha_entrega: string | null;
  estado: EstadoPedido;
  pagado: boolean;
  /** Lo mantiene un trigger a partir de las líneas; no se escribe a mano. */
  total: number;
  notas: string | null;
  cliente?: { id: string; nombre: string } | null;
  pedido_items?: PedidoItem[];
};

export type PedidoInput = {
  id?: string;
  cliente_id: string | null;
  fecha: string;
  fecha_entrega: string | null;
  estado: EstadoPedido;
  pagado: boolean;
  notas: string | null;
};

export type PedidoItemInput = {
  pedido_id: string;
  producto_id: string;
  cantidad: number;
  precio_unit: number;
};
