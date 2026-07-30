"use client";

import { useTransition } from "react";
import { accionDesactivarItem } from "../actions";
import type { Item } from "../types";

export function Panel({ items }: { items: Item[] }) {
  const [pending, startTransition] = useTransition();

  function desactivar(id: string) {
    startTransition(() => accionDesactivarItem(id));
  }

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold">Nombre del módulo</h1>
      {items.length === 0 ? (
        <p className="text-sm text-neutral-500">Aún no hay ítems.</p>
      ) : (
        <ul className="divide-y divide-neutral-200">
          {items.map((item) => (
            <li key={item.id} className="flex items-center justify-between py-2">
              <span>{item.nombre}</span>
              <button
                onClick={() => desactivar(item.id)}
                disabled={pending}
                className="text-sm text-neutral-400 hover:text-red-600"
              >
                Eliminar
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
