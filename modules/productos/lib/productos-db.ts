import { createClient } from "@core/supabase/server";
import { empresaActivaId } from "@core/multi-empresa/empresa";
import type { Producto, ProductoInput } from "../types";

const SELECT =
  "id, empresa_id, nombre, descripcion, categoria, precio, precio_mayorista, activo";

/** Lista los productos activos de la empresa del usuario. */
export async function listarProductos(): Promise<Producto[]> {
  const supabase = await createClient();
  const empresaId = await empresaActivaId();

  let query = supabase.from("productos").select(SELECT).eq("activo", true).order("nombre");
  if (empresaId) query = query.eq("empresa_id", empresaId);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as Producto[];
}

/** Crea o actualiza un producto (upsert por id). */
export async function guardarProducto(input: ProductoInput): Promise<Producto> {
  const supabase = await createClient();
  const empresaId = await empresaActivaId();

  const payload = {
    ...(input.id ? { id: input.id } : {}),
    empresa_id: empresaId,
    nombre: input.nombre,
    descripcion: input.descripcion,
    categoria: input.categoria,
    precio: input.precio,
    precio_mayorista: input.precio_mayorista,
  };

  const { data, error } = await supabase
    .from("productos")
    .upsert(payload)
    .select(SELECT)
    .single();

  if (error) throw error;
  return data as Producto;
}

/** Baja lógica: el producto puede estar referenciado por pedidos y recetas. */
export async function desactivarProducto(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("productos").update({ activo: false }).eq("id", id);
  if (error) throw error;
}
