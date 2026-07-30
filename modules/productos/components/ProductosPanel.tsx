"use client";

import { useState, useTransition } from "react";
import { accionGuardarProducto, accionDesactivarProducto } from "../actions";
import type { Producto, ProductoInput } from "../types";

const VACIO: ProductoInput = {
  nombre: "",
  descripcion: null,
  categoria: null,
  precio: 0,
  precio_mayorista: 0,
};

export function ProductosPanel({ productos }: { productos: Producto[] }) {
  const [form, setForm] = useState<ProductoInput | null>(null);
  const [pending, startTransition] = useTransition();

  function editar(p: Producto) {
    setForm({
      id: p.id,
      nombre: p.nombre,
      descripcion: p.descripcion,
      categoria: p.categoria,
      precio: p.precio,
      precio_mayorista: p.precio_mayorista,
    });
  }

  function guardar() {
    if (!form) return;
    startTransition(async () => {
      await accionGuardarProducto(form);
      setForm(null);
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Productos</h1>
          <p className="text-sm text-neutral-500">Catálogo de lo que vende la pyme.</p>
        </div>
        <button
          onClick={() => setForm({ ...VACIO })}
          className="rounded-lg bg-neutral-900 px-3 py-2 text-sm text-white"
        >
          + Nuevo producto
        </button>
      </div>

      {form && (
        <div className="rounded-lg border border-neutral-200 p-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Campo label="Nombre" value={form.nombre} onChange={(v) => setForm({ ...form, nombre: v })} />
            <Campo
              label="Categoría"
              value={form.categoria ?? ""}
              onChange={(v) => setForm({ ...form, categoria: v || null })}
            />
            <Campo
              label="Precio"
              type="number"
              value={String(form.precio)}
              onChange={(v) => setForm({ ...form, precio: Number(v) || 0 })}
            />
            <Campo
              label="Precio mayorista"
              type="number"
              value={String(form.precio_mayorista)}
              onChange={(v) => setForm({ ...form, precio_mayorista: Number(v) || 0 })}
            />
            <div className="sm:col-span-2">
              <Campo
                label="Descripción"
                value={form.descripcion ?? ""}
                onChange={(v) => setForm({ ...form, descripcion: v || null })}
              />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              onClick={guardar}
              disabled={pending || !form.nombre}
              className="rounded-lg bg-neutral-900 px-3 py-2 text-sm text-white disabled:opacity-50"
            >
              {pending ? "Guardando…" : "Guardar"}
            </button>
            <button onClick={() => setForm(null)} className="rounded-lg px-3 py-2 text-sm text-neutral-500">
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div className="rounded-lg border border-neutral-200">
        {productos.length === 0 ? (
          <p className="py-8 text-center text-sm text-neutral-500">Aún no hay productos.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200 text-left text-neutral-500">
                <th className="px-4 py-2">Nombre</th>
                <th>Categoría</th>
                <th className="text-right">Precio</th>
                <th className="text-right">Mayorista</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {productos.map((p) => (
                <tr key={p.id} className="border-b border-neutral-100">
                  <td className="px-4 py-2 font-medium">{p.nombre}</td>
                  <td className="text-neutral-500">{p.categoria ?? "—"}</td>
                  <td className="text-right">{p.precio}</td>
                  <td className="text-right">{p.precio_mayorista}</td>
                  <td className="px-4 text-right">
                    <button onClick={() => editar(p)} className="text-amber-700 hover:underline">
                      Editar
                    </button>
                    <button
                      onClick={() => startTransition(() => accionDesactivarProducto(p.id))}
                      className="ml-3 text-neutral-400 hover:text-red-600"
                    >
                      Eliminar
                    </button>
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

function Campo({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <label className="text-sm">
      <span className="text-neutral-500">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2"
      />
    </label>
  );
}
