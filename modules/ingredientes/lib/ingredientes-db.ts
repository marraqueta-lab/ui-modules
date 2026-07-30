import { createClient } from "@core/supabase/server";
import { empresaActivaId } from "@core/multi-empresa/empresa";
import type { Ingrediente, IngredienteInput } from "../types";

const SELECT = "id, empresa_id, nombre, unidad, precio_unit, stock, activo";

/** Lista los ingredientes activos de la empresa del usuario. */
export async function listarIngredientes(): Promise<Ingrediente[]> {
  const supabase = await createClient();
  const empresaId = await empresaActivaId();

  let query = supabase.from("ingredientes").select(SELECT).eq("activo", true).order("nombre");
  if (empresaId) query = query.eq("empresa_id", empresaId);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as Ingrediente[];
}

/** Crea o actualiza un ingrediente (upsert por id). */
export async function guardarIngrediente(input: IngredienteInput): Promise<Ingrediente> {
  const supabase = await createClient();
  const empresaId = await empresaActivaId();

  const payload = {
    ...(input.id ? { id: input.id } : {}),
    empresa_id: empresaId,
    nombre: input.nombre,
    unidad: input.unidad,
    precio_unit: input.precio_unit,
    stock: input.stock,
  };

  const { data, error } = await supabase
    .from("ingredientes")
    .upsert(payload)
    .select(SELECT)
    .single();

  if (error) throw error;
  return data as Ingrediente;
}

/** Baja lógica: el ingrediente puede estar referenciado por recetas y compras. */
export async function desactivarIngrediente(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("ingredientes").update({ activo: false }).eq("id", id);
  if (error) throw error;
}
