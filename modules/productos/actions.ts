"use server";

import { revalidatePath } from "next/cache";
import { getPerfil } from "@core/auth/session";
import { puede, type Accion } from "@core/auth/roles";
import { guardarProducto, desactivarProducto } from "./lib/productos-db";
import type { ProductoInput } from "./types";

async function requiere(accion: Accion): Promise<void> {
  const perfil = await getPerfil();
  if (!perfil || !puede(perfil.rol, accion)) {
    throw new Error("No tienes permiso para realizar esta acción.");
  }
}

export async function accionGuardarProducto(input: ProductoInput) {
  await requiere(input.id ? "editar" : "crear");
  const producto = await guardarProducto(input);
  revalidatePath("/productos");
  return producto;
}

export async function accionDesactivarProducto(id: string) {
  await requiere("eliminar");
  await desactivarProducto(id);
  revalidatePath("/productos");
}
