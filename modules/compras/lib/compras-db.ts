import { createClient } from "@core/supabase/server";
import { empresaActivaId } from "@core/multi-empresa/empresa";
import type { Compra, CompraInput } from "../types";

const SELECT =
  "id, empresa_id, ingrediente_id, fecha, cantidad, unidad, precio_total, precio_unit, notas, ingrediente:ingredientes(id, nombre, unidad)";

/** Lista las compras de la empresa, más recientes primero. */
export async function listarCompras(): Promise<Compra[]> {
  const supabase = await createClient();
  const empresaId = await empresaActivaId();

  let query = supabase.from("compras").select(SELECT).order("fecha", { ascending: false });
  if (empresaId) query = query.eq("empresa_id", empresaId);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as unknown as Compra[];
}

/**
 * Registra una compra. El precio unitario lo calcula la base (columna
 * generada) y un trigger actualiza el precio del ingrediente — no se
 * escriben acá para que no puedan quedar desincronizados.
 */
export async function crearCompra(input: CompraInput): Promise<Compra> {
  const supabase = await createClient();
  const empresaId = await empresaActivaId();

  const { data, error } = await supabase
    .from("compras")
    .insert({
      empresa_id: empresaId,
      ingrediente_id: input.ingrediente_id,
      fecha: input.fecha,
      cantidad: input.cantidad,
      unidad: input.unidad,
      precio_total: input.precio_total,
      notas: input.notas,
    })
    .select(SELECT)
    .single();

  if (error) throw error;
  return data as unknown as Compra;
}
