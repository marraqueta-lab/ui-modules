"use server";

import { revalidatePath } from "next/cache";
import { getPerfil } from "@core/auth/session";
import { puede, type Accion } from "@core/auth/roles";
import { guardarItem, desactivarItem } from "./lib/db";
import type { ItemInput } from "./types";

/**
 * Verifica el permiso en el servidor antes de ejecutar la acción — no basta
 * con esconder el botón en el cliente. Lanza si el rol actual no puede.
 */
async function requiere(accion: Accion): Promise<void> {
  const perfil = await getPerfil();
  if (!perfil || !puede(perfil.rol, accion)) {
    throw new Error("No tienes permiso para realizar esta acción.");
  }
}

export async function accionGuardarItem(input: ItemInput) {
  await requiere(input.id ? "editar" : "crear");
  const item = await guardarItem(input);
  revalidatePath("/slug");
  return item;
}

export async function accionDesactivarItem(id: string) {
  await requiere("eliminar");
  await desactivarItem(id);
  revalidatePath("/slug");
}
