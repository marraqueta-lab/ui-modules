"use server";

import { revalidatePath } from "next/cache";
import { getPerfil } from "@core/auth/session";
import { puede, type Accion } from "@core/auth/roles";
import { guardarCliente, desactivarCliente } from "./lib/clientes-db";
import type { ClienteInput } from "./types";

/**
 * Verifica el permiso en el servidor antes de ejecutar la acción. Esconder
 * el botón en el cliente no basta: cualquiera puede llamar un Server Action
 * directamente, así que el control real va aquí.
 */
async function requiere(accion: Accion): Promise<void> {
  const perfil = await getPerfil();
  if (!perfil || !puede(perfil.rol, accion)) {
    throw new Error("No tienes permiso para realizar esta acción.");
  }
}

export async function accionGuardarCliente(input: ClienteInput) {
  await requiere(input.id ? "editar" : "crear");
  const cliente = await guardarCliente(input);
  revalidatePath("/clientes");
  return cliente;
}

export async function accionDesactivarCliente(id: string) {
  await requiere("eliminar");
  await desactivarCliente(id);
  revalidatePath("/clientes");
}
