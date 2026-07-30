"use client";

import { useState, useTransition } from "react";
import {
  accionGuardarReceta,
  accionDesactivarReceta,
  accionGuardarIngredienteDeReceta,
  accionQuitarIngredienteDeReceta,
} from "../actions";
import { costoReceta, costoUnitario, type Receta, type RecetaInput } from "../types";

type OpcionProducto = { id: string; nombre: string };
type OpcionIngrediente = { id: string; nombre: string; unidad: string };

export function RecetasPanel({
  recetas,
  productos,
  ingredientes,
}: {
  recetas: Receta[];
  productos: OpcionProducto[];
  ingredientes: OpcionIngrediente[];
}) {
  const [form, setForm] = useState<RecetaInput | null>(null);
  const [abierta, setAbierta] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function nueva() {
    setForm({
      producto_id: productos[0]?.id ?? "",
      nombre: "",
      rinde: null,
      rinde_unidad: null,
      notas: null,
    });
  }

  function guardar() {
    if (!form) return;
    startTransition(async () => {
      await accionGuardarReceta(form);
      setForm(null);
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Recetas</h1>
          <p className="text-sm text-muted-foreground">
            Qué ingredientes lleva cada producto y cuánto cuesta producirlo.
          </p>
        </div>
        <button
          onClick={nueva}
          disabled={productos.length === 0}
          className="rounded-lg bg-primary px-3 py-2 text-sm text-primary-foreground disabled:opacity-50"
        >
          + Nueva receta
        </button>
      </div>

      {productos.length === 0 && (
        <p className="rounded-lg border border-border p-4 text-sm text-muted-foreground">
          Primero crea al menos un producto.
        </p>
      )}

      {form && (
        <div className="rounded-lg border border-border p-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="text-sm">
              <span className="text-muted-foreground">Producto</span>
              <select
                value={form.producto_id}
                onChange={(e) => setForm({ ...form, producto_id: e.target.value })}
                className="mt-1 w-full rounded-lg border border-input px-3 py-2"
              >
                {productos.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre}
                  </option>
                ))}
              </select>
            </label>
            <Campo label="Nombre" value={form.nombre} onChange={(v) => setForm({ ...form, nombre: v })} />
            <Campo
              label="Rinde"
              type="number"
              value={form.rinde === null ? "" : String(form.rinde)}
              onChange={(v) => setForm({ ...form, rinde: v === "" ? null : Number(v) })}
            />
            <Campo
              label="Unidad del rinde"
              value={form.rinde_unidad ?? ""}
              onChange={(v) => setForm({ ...form, rinde_unidad: v || null })}
            />
          </div>
          <div className="mt-4 flex gap-2">
            <button
              onClick={guardar}
              disabled={pending || !form.nombre || !form.producto_id}
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

      <div className="space-y-3">
        {recetas.length === 0 ? (
          <p className="rounded-lg border border-border py-8 text-center text-sm text-muted-foreground">
            Aún no hay recetas.
          </p>
        ) : (
          recetas.map((r) => {
            const costo = costoReceta(r);
            const unitario = costoUnitario(r);
            return (
              <div key={r.id} className="rounded-lg border border-border">
                <div className="flex items-center justify-between p-4">
                  <div>
                    <p className="font-medium">{r.nombre}</p>
                    <p className="text-sm text-muted-foreground">
                      {r.producto?.nombre ?? "—"}
                      {r.rinde ? ` · rinde ${r.rinde} ${r.rinde_unidad ?? ""}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="text-right">
                      <p className="font-medium">${Math.round(costo)}</p>
                      {unitario !== null && (
                        <p className="text-muted-foreground">${Math.round(unitario)} c/u</p>
                      )}
                    </div>
                    <button
                      onClick={() => setAbierta(abierta === r.id ? null : r.id)}
                      className="text-primary hover:underline"
                    >
                      {abierta === r.id ? "Cerrar" : "Ingredientes"}
                    </button>
                    <button
                      onClick={() => startTransition(() => accionDesactivarReceta(r.id))}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>

                {abierta === r.id && (
                  <IngredientesDeReceta receta={r} ingredientes={ingredientes} />
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function IngredientesDeReceta({
  receta,
  ingredientes,
}: {
  receta: Receta;
  ingredientes: OpcionIngrediente[];
}) {
  const [ingredienteId, setIngredienteId] = useState(ingredientes[0]?.id ?? "");
  const [cantidad, setCantidad] = useState("");
  const [pending, startTransition] = useTransition();

  function agregar() {
    const n = Number(cantidad);
    if (!ingredienteId || !n) return;
    startTransition(async () => {
      await accionGuardarIngredienteDeReceta({
        receta_id: receta.id,
        ingrediente_id: ingredienteId,
        cantidad: n,
      });
      setCantidad("");
    });
  }

  return (
    <div className="border-t border-border p-4">
      <table className="w-full text-sm">
        <tbody>
          {(receta.receta_ingredientes ?? []).map((ri) => (
            <tr key={ri.id} className="border-b border-border/60">
              <td className="py-2">{ri.ingrediente?.nombre ?? "—"}</td>
              <td className="text-right text-muted-foreground">
                {ri.cantidad} {ri.ingrediente?.unidad ?? ""}
              </td>
              <td className="text-right">
                ${Math.round((ri.ingrediente?.precio_unit ?? 0) * ri.cantidad)}
              </td>
              <td className="text-right">
                <button
                  onClick={() => startTransition(() => accionQuitarIngredienteDeReceta(ri.id))}
                  className="text-muted-foreground hover:text-destructive"
                >
                  Quitar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-3 flex items-end gap-2">
        <label className="text-sm">
          <span className="text-muted-foreground">Ingrediente</span>
          <select
            value={ingredienteId}
            onChange={(e) => setIngredienteId(e.target.value)}
            className="mt-1 rounded-lg border border-input px-3 py-2"
          >
            {ingredientes.map((i) => (
              <option key={i.id} value={i.id}>
                {i.nombre}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          <span className="text-muted-foreground">Cantidad</span>
          <input
            type="number"
            value={cantidad}
            onChange={(e) => setCantidad(e.target.value)}
            className="mt-1 w-28 rounded-lg border border-input px-3 py-2"
          />
        </label>
        <button
          onClick={agregar}
          disabled={pending || !cantidad}
          className="rounded-lg bg-primary px-3 py-2 text-sm text-primary-foreground disabled:opacity-50"
        >
          Agregar
        </button>
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
