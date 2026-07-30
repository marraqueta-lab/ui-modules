import { createClient } from "@core/supabase/server";
import { empresaActivaId } from "@core/multi-empresa/empresa";
import type { Pedido, PedidoInput, PedidoItemInput } from "../types";

const SELECT = `
  id, empresa_id, cliente_id, fecha, fecha_entrega, estado, pagado, total, notas,
  cliente:clientes(id, nombre),
  pedido_items(id, pedido_id, producto_id, cantidad, precio_unit, subtotal,
    producto:productos(id, nombre))
`;

/** Lista los pedidos de la empresa, más recientes primero. */
export async function listarPedidos(): Promise<Pedido[]> {
  const supabase = await createClient();
  const empresaId = await empresaActivaId();

  let query = supabase
    .from("pedidos")
    .select(SELECT)
    .order("fecha", { ascending: false })
    .limit(200);
  if (empresaId) query = query.eq("empresa_id", empresaId);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as unknown as Pedido[];
}

/** Crea o actualiza la cabecera de un pedido. El total lo lleva el trigger. */
export async function guardarPedido(input: PedidoInput): Promise<Pedido> {
  const supabase = await createClient();
  const empresaId = await empresaActivaId();

  const payload = {
    ...(input.id ? { id: input.id } : {}),
    empresa_id: empresaId,
    cliente_id: input.cliente_id,
    fecha: input.fecha,
    fecha_entrega: input.fecha_entrega,
    estado: input.estado,
    pagado: input.pagado,
    notas: input.notas,
  };

  const { data, error } = await supabase.from("pedidos").upsert(payload).select(SELECT).single();
  if (error) throw error;
  return data as unknown as Pedido;
}

/** Agrega una línea al pedido. El subtotal y el total del pedido salen solos. */
export async function agregarItem(input: PedidoItemInput): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("pedido_items").insert({
    pedido_id: input.pedido_id,
    producto_id: input.producto_id,
    cantidad: input.cantidad,
    precio_unit: input.precio_unit,
  });
  if (error) throw error;
}

/** Quita una línea del pedido. */
export async function quitarItem(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("pedido_items").delete().eq("id", id);
  if (error) throw error;
}
