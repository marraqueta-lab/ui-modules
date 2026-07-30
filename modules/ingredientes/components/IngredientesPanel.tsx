"use client";

import { useState, useTransition } from "react";
import { accionGuardarIngrediente, accionDesactivarIngrediente } from "../actions";
import type { Ingrediente, IngredienteInput } from "../types";

const VACIO: IngredienteInput = { nombre: "", unidad: "kg", precio_unit: 0, stock: 0 };

export function IngredientesPanel({ ingredientes }: { ingredientes: Ingrediente[] }) {
  const [form, setForm] = useState<IngredienteInput | null>(null);
  const [pending, startTransition] = useTransition();

  function editar(i: Ingrediente) {
    setForm({
      id: i.id,
      nombre: i.nombre,
      unidad: i.unidad,
      precio_unit: i.precio_unit,
      stock: i.stock,
    });
  }

  function guardar() {
    if (!form) return;
    startTransition(async () => {
      await accionGuardarIngrediente(form);
      setForm(null);
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Ingredientes</h1>
          <p className="text-sm text-muted-foreground">Materias primas y su stock actual.</p>
        </div>
        <button
          onClick={() => setForm({ ...VACIO })}
          className="rounded-lg bg-primary px-3 py-2 text-sm text-primary-foreground"
        >
          + Nuevo ingrediente
        </button>
      </div>

      {form && (
        <div className="rounded-lg border border-border p-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
            <Campo label="Nombre" value={form.nombre} onChange={(v) => setForm({ ...form, nombre: v })} />
            <Campo label="Unidad" value={form.unidad} onChange={(v) => setForm({ ...form, unidad: v })} />
            <Campo
              label="Precio unitario"
              type="number"
              value={String(form.precio_unit)}
              onChange={(v) => setForm({ ...form, precio_unit: Number(v) || 0 })}
            />
            <Campo
              label="Stock"
              type="number"
              value={String(form.stock)}
              onChange={(v) => setForm({ ...form, stock: Number(v) || 0 })}
            />
          </div>
          <div className="mt-4 flex gap-2">
            <button
              onClick={guardar}
              disabled={pending || !form.nombre || !form.unidad}
              className="rounded-lg bg-primary px-3 py-2 text-sm text-primary-foreground disabled:opacity-50"
            >
              {pending ? "Guardando…" : "Guardar"}
            </button>
            <button onClick={() => setForm(null)} className="rounded-lg px-3 py-2 text-sm text-muted-foreground">
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div className="rounded-lg border border-border">
        {ingredientes.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">Aún no hay ingredientes.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted-foreground">
                <th className="px-4 py-2">Nombre</th>
                <th>Unidad</th>
                <th className="text-right">Precio unit.</th>
                <th className="text-right">Stock</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {ingredientes.map((i) => (
                <tr key={i.id} className="border-b border-border/60">
                  <td className="px-4 py-2 font-medium">{i.nombre}</td>
                  <td className="text-muted-foreground">{i.unidad}</td>
                  <td className="text-right">{i.precio_unit}</td>
                  <td className="text-right">{i.stock}</td>
                  <td className="px-4 text-right">
                    <button onClick={() => editar(i)} className="text-primary hover:underline">
                      Editar
                    </button>
                    <button
                      onClick={() => startTransition(() => accionDesactivarIngrediente(i.id))}
                      className="ml-3 text-muted-foreground hover:text-destructive"
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
      <span className="text-muted-foreground">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-lg border border-input px-3 py-2"
      />
    </label>
  );
}
