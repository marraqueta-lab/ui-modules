"use client";

import { useState, useTransition } from "react";
import { accionRegistrarConteo } from "../actions";
import type { ConteoStock } from "../types";

type OpcionIngrediente = { id: string; nombre: string; unidad: string; stock: number };

export function StockPanel({
  conteos,
  ingredientes,
}: {
  conteos: ConteoStock[];
  ingredientes: OpcionIngrediente[];
}) {
  const [contando, setContando] = useState(false);
  const [valores, setValores] = useState<Record<string, string>>({});
  const [pending, startTransition] = useTransition();

  function iniciar() {
    setValores({});
    setContando(true);
  }

  function guardar() {
    const items = Object.entries(valores)
      .filter(([, v]) => v.trim() !== "" && !Number.isNaN(Number(v)))
      .map(([ingrediente_id, v]) => ({ ingrediente_id, cantidad: Number(v) }));

    if (items.length === 0) return;

    startTransition(async () => {
      await accionRegistrarConteo(items);
      setContando(false);
      setValores({});
    });
  }

  const cuantos = Object.values(valores).filter((v) => v.trim() !== "").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Stock</h1>
          <p className="text-sm text-neutral-500">
            Conteo de inventario. Deja en blanco lo que no cuentes.
          </p>
        </div>
        {!contando && (
          <button
            onClick={iniciar}
            disabled={ingredientes.length === 0}
            className="rounded-lg bg-neutral-900 px-3 py-2 text-sm text-white disabled:opacity-50"
          >
            + Nuevo conteo
          </button>
        )}
      </div>

      {ingredientes.length === 0 && (
        <p className="rounded-lg border border-neutral-200 p-4 text-sm text-neutral-500">
          Primero crea al menos un ingrediente.
        </p>
      )}

      {contando && (
        <div className="rounded-lg border border-neutral-200 p-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200 text-left text-neutral-500">
                <th className="py-2">Ingrediente</th>
                <th className="text-right">Stock actual</th>
                <th className="w-40 text-right">Contado</th>
              </tr>
            </thead>
            <tbody>
              {ingredientes.map((i) => (
                <tr key={i.id} className="border-b border-neutral-100">
                  <td className="py-2 font-medium">{i.nombre}</td>
                  <td className="text-right text-neutral-500">
                    {i.stock} {i.unidad}
                  </td>
                  <td className="py-1 text-right">
                    <input
                      type="number"
                      value={valores[i.id] ?? ""}
                      onChange={(e) => setValores({ ...valores, [i.id]: e.target.value })}
                      placeholder="—"
                      className="w-28 rounded-lg border border-neutral-300 px-2 py-1 text-right"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-4 flex items-center gap-2">
            <button
              onClick={guardar}
              disabled={pending || cuantos === 0}
              className="rounded-lg bg-neutral-900 px-3 py-2 text-sm text-white disabled:opacity-50"
            >
              {pending ? "Guardando…" : `Guardar conteo (${cuantos})`}
            </button>
            <button
              onClick={() => setContando(false)}
              className="rounded-lg px-3 py-2 text-sm text-neutral-500"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div className="rounded-lg border border-neutral-200">
        {conteos.length === 0 ? (
          <p className="py-8 text-center text-sm text-neutral-500">Aún no hay conteos registrados.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200 text-left text-neutral-500">
                <th className="px-4 py-2">Fecha</th>
                <th>Ingrediente</th>
                <th className="text-right">Cantidad</th>
              </tr>
            </thead>
            <tbody>
              {conteos.map((c) => (
                <tr key={c.id} className="border-b border-neutral-100">
                  <td className="px-4 py-2">{c.fecha}</td>
                  <td className="font-medium">{c.ingrediente?.nombre ?? "—"}</td>
                  <td className="px-4 text-right">
                    {c.cantidad} {c.ingrediente?.unidad ?? ""}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
