"use server";

import { revalidatePath } from "next/cache";
import { getPerfil } from "@core/auth/session";
import { puede, type Accion } from "@core/auth/roles";
import { crearCompra } from "./lib/compras-db";
import type { CompraInput } from "./types";

async function requiere(accion: Accion): Promise<void> {
  const perfil = await getPerfil();
  if (!perfil || !puede(perfil.rol, accion)) {
    throw new Error("No tienes permiso para realizar esta acción.");
  }
}

export async function accionCrearCompra(input: CompraInput) {
  await requiere("crear");
  const compra = await crearCompra(input);
  revalidatePath("/compras");
  revalidatePath("/ingredientes"); // el trigger actualizó el precio del ingrediente
  return compra;
}
