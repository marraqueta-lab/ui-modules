import { createClient } from "@core/supabase/server";
import { empresaActivaId } from "@core/multi-empresa/empresa";
import type { Item, ItemInput } from "../types";

const SELECT = "id, empresa_id, nombre, activo";

/** Lista los ítems activos de la empresa del usuario. */
export async function listarItems(): Promise<Item[]> {
  const supabase = await createClient();
  const empresaId = await empresaActivaId();

  let query = supabase.from("_template_items").select(SELECT).eq("activo", true).order("nombre");
  if (empresaId) query = query.eq("empresa_id", empresaId);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as Item[];
}

/** Crea o actualiza un ítem (upsert por id). */
export async function guardarItem(input: ItemInput): Promise<Item> {
  const supabase = await createClient();
  const empresaId = await empresaActivaId();

  const payload = {
    ...(input.id ? { id: input.id } : {}),
    empresa_id: empresaId,
    nombre: input.nombre,
  };

  const { data, error } = await supabase
    .from("_template_items")
    .upsert(payload)
    .select(SELECT)
    .single();

  if (error) throw error;
  return data as Item;
}

/** Baja lógica: nunca borrar filas con historial de negocio detrás. */
export async function desactivarItem(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("_template_items").update({ activo: false }).eq("id", id);
  if (error) throw error;
}
