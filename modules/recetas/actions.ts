"use server";

import { revalidatePath } from "next/cache";
import { getPerfil } from "@core/auth/session";
import { puede, type Accion } from "@core/auth/roles";
import {
  guardarReceta,
  desactivarReceta,
  guardarIngredienteDeReceta,
  quitarIngredienteDeReceta,
} from "./lib/recetas-db";
import type { RecetaInput, RecetaIngredienteInput } from "./types";

async function requiere(accion: Accion): Promise<void> {
  const perfil = await getPerfil();
  if (!perfil || !puede(perfil.rol, accion)) {
    throw new Error("No tienes permiso para realizar esta acción.");
  }
}

export async function accionGuardarReceta(input: RecetaInput) {
  await requiere(input.id ? "editar" : "crear");
  const receta = await guardarReceta(input);
  revalidatePath("/recetas");
  return receta;
}

export async function accionDesactivarReceta(id: string) {
  await requiere("eliminar");
  await desactivarReceta(id);
  revalidatePath("/recetas");
}

export async function accionGuardarIngredienteDeReceta(input: RecetaIngredienteInput) {
  await requiere("editar");
  await guardarIngredienteDeReceta(input);
  revalidatePath("/recetas");
}

export async function accionQuitarIngredienteDeReceta(id: string) {
  await requiere("editar");
  await quitarIngredienteDeReceta(id);
  revalidatePath("/recetas");
}
