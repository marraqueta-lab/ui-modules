"use client";

import { useState, useTransition } from "react";
import { accionGuardarCliente, accionDesactivarCliente } from "../actions";
import type { Cliente, ClienteInput } from "../types";

const VACIO: ClienteInput = { nombre: "", telefono: null, direccion: null, notas: null };

export function ClientesPanel({ clientes }: { clientes: Cliente[] }) {
  const [form, setForm] = useState<ClienteInput | null>(null);
  const [pending, startTransition] = useTransition();

  function editar(c: Cliente) {
    setForm({ id: c.id, nombre: c.nombre, telefono: c.telefono, direccion: c.direccion, notas: c.notas });
  }

  function guardar() {
    if (!form) return;
    startTransition(async () => {
      await accionGuardarCliente(form);
      setForm(null);
    });
  }

  function desactivar(id: string) {
    startTransition(() => accionDesactivarCliente(id));
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Clientes</h1>
          <p className="text-sm text-muted-foreground">Ficha de clientes de la pyme.</p>
        </div>
        <button
          onClick={() => setForm({ ...VACIO })}
          className="rounded-lg bg-primary px-3 py-2 text-sm text-primary-foreground"
        >
          + Nuevo cliente
        </button>
      </div>

      {form && (
        <div className="rounded-lg border border-border p-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Campo label="Nombre" value={form.nombre} onChange={(v) => setForm({ ...form, nombre: v })} />
            <Campo
              label="Teléfono"
              value={form.telefono ?? ""}
              onChange={(v) => setForm({ ...form, telefono: v || null })}
            />
            <Campo
              label="Dirección"
              value={form.direccion ?? ""}
              onChange={(v) => setForm({ ...form, direccion: v || null })}
            />
            <Campo
              label="Notas"
              value={form.notas ?? ""}
              onChange={(v) => setForm({ ...form, notas: v || null })}
            />
          </div>
          <div className="mt-4 flex gap-2">
            <button
              onClick={guardar}
              disabled={pending || !form.nombre}
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
        {clientes.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Aún no hay clientes. Crea el primero con “+ Nuevo cliente”.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted-foreground">
                <th className="px-4 py-2">Nombre</th>
                <th>Contacto</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {clientes.map((c) => (
                <tr key={c.id} className="border-b border-border/60">
                  <td className="px-4 py-2 font-medium">{c.nombre}</td>
                  <td className="text-muted-foreground">{c.telefono ?? c.direccion ?? "—"}</td>
                  <td className="px-4 text-right">
                    <button onClick={() => editar(c)} className="text-primary hover:underline">
                      Editar
                    </button>
                    <button
                      onClick={() => desactivar(c.id)}
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

function Campo({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="text-sm">
      <span className="text-muted-foreground">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-lg border border-input px-3 py-2"
      />
    </label>
  );
}
