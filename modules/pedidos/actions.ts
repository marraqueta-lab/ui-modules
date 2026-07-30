"use server";

import { revalidatePath } from "next/cache";
import { getPerfil } from "@core/auth/session";
import { puede, type Accion } from "@core/auth/roles";
import { guardarPedido, agregarItem, quitarItem } from "./lib/pedidos-db";
import type { PedidoInput, PedidoItemInput } from "./types";

async function requiere(accion: Accion): Promise<void> {
  const perfil = await getPerfil();
  if (!perfil || !puede(perfil.rol, accion)) {
    throw new Error("No tienes permiso para realizar esta acción.");
  }
}

export async function accionGuardarPedido(input: PedidoInput) {
  await requiere(input.id ? "editar" : "crear");
  const pedido = await guardarPedido(input);
  revalidatePath("/pedidos");
  return pedido;
}

export async function accionAgregarItem(input: PedidoItemInput) {
  await requiere("editar");
  await agregarItem(input);
  revalidatePath("/pedidos");
}

export async function accionQuitarItem(id: string) {
  await requiere("editar");
  await quitarItem(id);
  revalidatePath("/pedidos");
}
