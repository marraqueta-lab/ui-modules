"use server";

import { revalidatePath } from "next/cache";
import { getPerfil } from "@core/auth/session";
import { puede, type Accion } from "@core/auth/roles";
import { registrarConteo } from "./lib/stock-db";
import type { ConteoStockInput } from "./types";

async function requiere(accion: Accion): Promise<void> {
  const perfil = await getPerfil();
  if (!perfil || !puede(perfil.rol, accion)) {
    throw new Error("No tienes permiso para realizar esta acción.");
  }
}

export async function accionRegistrarConteo(items: ConteoStockInput[], fecha?: string) {
  await requiere("crear");
  await registrarConteo(items, fecha);
  revalidatePath("/stock");
  revalidatePath("/ingredientes"); // el trigger actualizó el stock del ingrediente
}
