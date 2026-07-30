import { createClient } from "@core/supabase/server";
import { empresaActivaId } from "@core/multi-empresa/empresa";
import type { Receta, RecetaInput, RecetaIngredienteInput } from "../types";

const SELECT = `
  id, empresa_id, producto_id, nombre, rinde, rinde_unidad, notas, activo,
  producto:productos(id, nombre, precio),
  receta_ingredientes(
    id, receta_id, ingrediente_id, cantidad,
    ingrediente:ingredientes(id, nombre, unidad, precio_unit)
  )
`;

/** Lista las recetas activas de la empresa, con sus ingredientes y precios. */
export async function listarRecetas(): Promise<Receta[]> {
  const supabase = await createClient();
  const empresaId = await empresaActivaId();

  let query = supabase.from("recetas").select(SELECT).eq("activo", true).order("nombre");
  if (empresaId) query = query.eq("empresa_id", empresaId);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as unknown as Receta[];
}

/** Crea o actualiza la cabecera de una receta (no sus ingredientes). */
export async function guardarReceta(input: RecetaInput): Promise<Receta> {
  const supabase = await createClient();
  const empresaId = await empresaActivaId();

  const payload = {
    ...(input.id ? { id: input.id } : {}),
    empresa_id: empresaId,
    producto_id: input.producto_id,
    nombre: input.nombre,
    rinde: input.rinde,
    rinde_unidad: input.rinde_unidad,
    notas: input.notas,
  };

  const { data, error } = await supabase.from("recetas").upsert(payload).select(SELECT).single();
  if (error) throw error;
  return data as unknown as Receta;
}

/** Agrega o actualiza un ingrediente de la receta (upsert por receta+ingrediente). */
export async function guardarIngredienteDeReceta(input: RecetaIngredienteInput): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("receta_ingredientes")
    .upsert(
      {
        receta_id: input.receta_id,
        ingrediente_id: input.ingrediente_id,
        cantidad: input.cantidad,
      },
      { onConflict: "receta_id,ingrediente_id" }
    );
  if (error) throw error;
}

/** Saca un ingrediente de la receta. Acá sí se borra: es una línea, no historial. */
export async function quitarIngredienteDeReceta(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("receta_ingredientes").delete().eq("id", id);
  if (error) throw error;
}

/** Baja lógica de la receta. */
export async function desactivarReceta(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("recetas").update({ activo: false }).eq("id", id);
  if (error) throw error;
}
