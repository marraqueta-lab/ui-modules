"use client";

import { useState, useTransition } from "react";
import { accionCrearCompra } from "../actions";
import type { Compra, CompraInput } from "../types";

type OpcionIngrediente = { id: string; nombre: string; unidad: string };

const hoy = () => new Date().toISOString().slice(0, 10);

export function ComprasPanel({
  compras,
  ingredientes,
}: {
  compras: Compra[];
  ingredientes: OpcionIngrediente[];
}) {
  const [form, setForm] = useState<CompraInput | null>(null);
  const [pending, startTransition] = useTransition();

  function nueva() {
    const primero = ingredientes[0];
    setForm({
      ingrediente_id: primero?.id ?? "",
      fecha: hoy(),
      cantidad: 0,
      unidad: primero?.unidad ?? "",
      precio_total: 0,
      notas: null,
    });
  }

  function elegirIngrediente(id: string) {
    if (!form) return;
    const ing = ingredientes.find((i) => i.id === id);
    setForm({ ...form, ingrediente_id: id, unidad: ing?.unidad ?? form.unidad });
  }

  function guardar() {
    if (!form) return;
    startTransition(async () => {
      await accionCrearCompra(form);
      setForm(null);
    });
  }

  const valido = form && form.ingrediente_id && form.cantidad > 0 && form.precio_total > 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Compras</h1>
          <p className="text-sm text-muted-foreground">
            Al registrar una compra se actualiza el precio del ingrediente.
          </p>
        </div>
        <button
          onClick={nueva}
          disabled={ingredientes.length === 0}
          className="rounded-lg bg-primary px-3 py-2 text-sm text-primary-foreground disabled:opacity-50"
        >
          + Nueva compra
        </button>
      </div>

      {ingredientes.length === 0 && (
        <p className="rounded-lg border border-border p-4 text-sm text-muted-foreground">
          Primero crea al menos un ingrediente.
        </p>
      )}

      {form && (
        <div className="rounded-lg border border-border p-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
            <label className="text-sm sm:col-span-2">
              <span className="text-muted-foreground">Ingrediente</span>
              <select
                value={form.ingrediente_id}
                onChange={(e) => elegirIngrediente(e.target.value)}
                className="mt-1 w-full rounded-lg border border-input px-3 py-2"
              >
                {ingredientes.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.nombre}
                  </option>
                ))}
              </select>
            </label>
            <Campo
              label="Fecha"
              type="date"
              value={form.fecha}
              onChange={(v) => setForm({ ...form, fecha: v })}
            />
            <Campo
              label="Cantidad"
              type="number"
              value={String(form.cantidad)}
              onChange={(v) => setForm({ ...form, cantidad: Number(v) || 0 })}
            />
            <Campo label="Unidad" value={form.unidad} onChange={(v) => setForm({ ...form, unidad: v })} />
            <Campo
              label="Precio total"
              type="number"
              value={String(form.precio_total)}
              onChange={(v) => setForm({ ...form, precio_total: Number(v) || 0 })}
            />
            <div className="sm:col-span-2">
              <Campo
                label="Notas"
                value={form.notas ?? ""}
                onChange={(v) => setForm({ ...form, notas: v || null })}
              />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              onClick={guardar}
              disabled={pending || !valido}
              className="rounded-lg bg-primary px-3 py-2 text-sm text-primary-foreground disabled:opacity-50"
            >
              {pending ? "Guardando…" : "Registrar compra"}
            </button>
            <button onClick={() => setForm(null)} className="rounded-lg px-3 py-2 text-sm text-muted-foreground">
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div className="rounded-lg border border-border">
        {compras.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">Aún no hay compras registradas.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted-foreground">
                <th className="px-4 py-2">Fecha</th>
                <th>Ingrediente</th>
                <th className="text-right">Cantidad</th>
                <th className="text-right">Total</th>
                <th className="text-right">Precio unit.</th>
              </tr>
            </thead>
            <tbody>
              {compras.map((c) => (
                <tr key={c.id} className="border-b border-border/60">
                  <td className="px-4 py-2">{c.fecha}</td>
                  <td className="font-medium">{c.ingrediente?.nombre ?? "—"}</td>
                  <td className="text-right">
                    {c.cantidad} {c.unidad}
                  </td>
                  <td className="text-right">{c.precio_total}</td>
                  <td className="px-4 text-right text-muted-foreground">{c.precio_unit}</td>
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
