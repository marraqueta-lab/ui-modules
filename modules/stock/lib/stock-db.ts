import { createClient } from "@core/supabase/server";
import { empresaActivaId } from "@core/multi-empresa/empresa";
import type { ConteoStock, ConteoStockInput } from "../types";

const SELECT =
  "id, empresa_id, ingrediente_id, fecha, cantidad, notas, ingrediente:ingredientes(id, nombre, unidad)";

/** Lista los conteos de stock de la empresa, más recientes primero. */
export async function listarConteos(): Promise<ConteoStock[]> {
  const supabase = await createClient();
  const empresaId = await empresaActivaId();

  let query = supabase
    .from("conteos_stock")
    .select(SELECT)
    .order("fecha", { ascending: false })
    .limit(200);
  if (empresaId) query = query.eq("empresa_id", empresaId);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as unknown as ConteoStock[];
}

/**
 * Registra un conteo por cada ingrediente contado, en una sola operación.
 * Un trigger deja el stock del ingrediente igual al último conteo.
 */
export async function registrarConteo(items: ConteoStockInput[], fecha?: string): Promise<void> {
  if (items.length === 0) return;

  const supabase = await createClient();
  const empresaId = await empresaActivaId();
  const dia = fecha ?? new Date().toISOString().slice(0, 10);

  const filas = items.map((item) => ({
    empresa_id: empresaId,
    ingrediente_id: item.ingrediente_id,
    fecha: dia,
    cantidad: item.cantidad,
    notas: item.notas ?? null,
  }));

  const { error } = await supabase.from("conteos_stock").insert(filas);
  if (error) throw error;
}
