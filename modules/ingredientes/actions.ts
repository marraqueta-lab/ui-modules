"use server";

import { revalidatePath } from "next/cache";
import { getPerfil } from "@core/auth/session";
import { puede, type Accion } from "@core/auth/roles";
import { guardarIngrediente, desactivarIngrediente } from "./lib/ingredientes-db";
import type { IngredienteInput } from "./types";

async function requiere(accion: Accion): Promise<void> {
  const perfil = await getPerfil();
  if (!perfil || !puede(perfil.rol, accion)) {
    throw new Error("No tienes permiso para realizar esta acción.");
  }
}

export async function accionGuardarIngrediente(input: IngredienteInput) {
  await requiere(input.id ? "editar" : "crear");
  const ingrediente = await guardarIngrediente(input);
  revalidatePath("/ingredientes");
  return ingrediente;
}

export async function accionDesactivarIngrediente(id: string) {
  await requiere("eliminar");
  await desactivarIngrediente(id);
  revalidatePath("/ingredientes");
}
