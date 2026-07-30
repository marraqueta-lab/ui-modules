import { createClient } from "@core/supabase/server";
import { empresaActivaId } from "@core/multi-empresa/empresa";
import type { Cliente, ClienteInput } from "../types";

const SELECT = "id, empresa_id, nombre, telefono, direccion, notas, activo";

/** Lista los clientes activos de la empresa del usuario. */
export async function listarClientes(): Promise<Cliente[]> {
  const supabase = await createClient();
  const empresaId = await empresaActivaId();

  let query = supabase.from("clientes").select(SELECT).eq("activo", true).order("nombre");
  if (empresaId) query = query.eq("empresa_id", empresaId);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as Cliente[];
}

/** Crea o actualiza un cliente (upsert por id). */
export async function guardarCliente(input: ClienteInput): Promise<Cliente> {
  const supabase = await createClient();
  const empresaId = await empresaActivaId();

  const payload = {
    ...(input.id ? { id: input.id } : {}),
    empresa_id: empresaId,
    nombre: input.nombre,
    telefono: input.telefono,
    direccion: input.direccion,
    notas: input.notas,
  };

  const { data, error } = await supabase
    .from("clientes")
    .upsert(payload)
    .select(SELECT)
    .single();

  if (error) throw error;
  return data as Cliente;
}

/** Baja lógica: marca el cliente como inactivo, nunca se borra (queda historial en pedidos). */
export async function desactivarCliente(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("clientes").update({ activo: false }).eq("id", id);
  if (error) throw error;
}
