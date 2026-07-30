"use client";

import { useState, useTransition } from "react";
import { accionGuardarPedido, accionAgregarItem, accionQuitarItem } from "../actions";
import {
  ESTADOS_PEDIDO,
  ESTADO_LABEL,
  type EstadoPedido,
  type Pedido,
  type PedidoInput,
} from "../types";

type OpcionCliente = { id: string; nombre: string };
type OpcionProducto = { id: string; nombre: string; precio: number };

const hoy = () => new Date().toISOString().slice(0, 10);

export function PedidosPanel({
  pedidos,
  clientes,
  productos,
}: {
  pedidos: Pedido[];
  clientes: OpcionCliente[];
  productos: OpcionProducto[];
}) {
  const [form, setForm] = useState<PedidoInput | null>(null);
  const [abierto, setAbierto] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function nuevo() {
    setForm({
      cliente_id: clientes[0]?.id ?? null,
      fecha: hoy(),
      fecha_entrega: null,
      estado: "pendiente",
      pagado: false,
      notas: null,
    });
  }

  function guardar() {
    if (!form) return;
    startTransition(async () => {
      await accionGuardarPedido(form);
      setForm(null);
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Pedidos</h1>
          <p className="text-sm text-neutral-500">
            El total se calcula solo a partir de las líneas.
          </p>
        </div>
        <button
          onClick={nuevo}
          disabled={productos.length === 0}
          className="rounded-lg bg-neutral-900 px-3 py-2 text-sm text-white disabled:opacity-50"
        >
          + Nuevo pedido
        </button>
      </div>

      {productos.length === 0 && (
        <p className="rounded-lg border border-neutral-200 p-4 text-sm text-neutral-500">
          Primero crea al menos un producto.
        </p>
      )}

      {form && (
        <div className="rounded-lg border border-neutral-200 p-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <label className="text-sm">
              <span className="text-neutral-500">Cliente</span>
              <select
                value={form.cliente_id ?? ""}
                onChange={(e) => setForm({ ...form, cliente_id: e.target.value || null })}
                className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2"
              >
                <option value="">Sin cliente</option>
                {clientes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </label>
            <Campo label="Fecha" type="date" value={form.fecha} onChange={(v) => setForm({ ...form, fecha: v })} />
            <Campo
              label="Fecha de entrega"
              type="date"
              value={form.fecha_entrega ?? ""}
              onChange={(v) => setForm({ ...form, fecha_entrega: v || null })}
            />
            <label className="text-sm">
              <span className="text-neutral-500">Estado</span>
              <select
                value={form.estado}
                onChange={(e) => setForm({ ...form, estado: e.target.value as EstadoPedido })}
                className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2"
              >
                {ESTADOS_PEDIDO.map((e) => (
                  <option key={e} value={e}>
                    {ESTADO_LABEL[e]}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex items-end gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.pagado}
                onChange={(e) => setForm({ ...form, pagado: e.target.checked })}
                className="mb-3"
              />
              <span className="mb-2 text-neutral-500">Pagado</span>
            </label>
            <Campo
              label="Notas"
              value={form.notas ?? ""}
              onChange={(v) => setForm({ ...form, notas: v || null })}
            />
          </div>
          <div className="mt-4 flex gap-2">
            <button
              onClick={guardar}
              disabled={pending}
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

      <div className="space-y-3">
        {pedidos.length === 0 ? (
          <p className="rounded-lg border border-neutral-200 py-8 text-center text-sm text-neutral-500">
            Aún no hay pedidos.
          </p>
        ) : (
          pedidos.map((p) => (
            <div key={p.id} className="rounded-lg border border-neutral-200">
              <div className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium">{p.cliente?.nombre ?? "Sin cliente"}</p>
                  <p className="text-sm text-neutral-500">
                    {p.fecha}
                    {p.fecha_entrega ? ` · entrega ${p.fecha_entrega}` : ""} ·{" "}
                    {ESTADO_LABEL[p.estado]}
                    {p.pagado ? " · pagado" : ""}
                  </p>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <p className="font-medium">${Math.round(p.total)}</p>
                  <button
                    onClick={() => setAbierto(abierto === p.id ? null : p.id)}
                    className="text-amber-700 hover:underline"
                  >
                    {abierto === p.id ? "Cerrar" : "Líneas"}
                  </button>
                </div>
              </div>
              {abierto === p.id && <LineasDelPedido pedido={p} productos={productos} />}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function LineasDelPedido({
  pedido,
  productos,
}: {
  pedido: Pedido;
  productos: OpcionProducto[];
}) {
  const [productoId, setProductoId] = useState(productos[0]?.id ?? "");
  const [cantidad, setCantidad] = useState("");
  const [pending, startTransition] = useTransition();

  const producto = productos.find((p) => p.id === productoId);

  function agregar() {
    const n = Number(cantidad);
    if (!productoId || !n || !producto) return;
    startTransition(async () => {
      await accionAgregarItem({
        pedido_id: pedido.id,
        producto_id: productoId,
        cantidad: n,
        // Se congela el precio del producto al momento del pedido: si el
        // precio sube después, el pedido histórico no cambia.
        precio_unit: producto.precio,
      });
      setCantidad("");
    });
  }

  return (
    <div className="border-t border-neutral-200 p-4">
      <table className="w-full text-sm">
        <tbody>
          {(pedido.pedido_items ?? []).map((it) => (
            <tr key={it.id} className="border-b border-neutral-100">
              <td className="py-2">{it.producto?.nombre ?? "—"}</td>
              <td className="text-right text-neutral-500">
                {it.cantidad} x ${it.precio_unit}
              </td>
              <td className="text-right">${Math.round(it.subtotal)}</td>
              <td className="text-right">
                <button
                  onClick={() => startTransition(() => accionQuitarItem(it.id))}
                  className="text-neutral-400 hover:text-red-600"
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
          <span className="text-neutral-500">Producto</span>
          <select
            value={productoId}
            onChange={(e) => setProductoId(e.target.value)}
            className="mt-1 rounded-lg border border-neutral-300 px-3 py-2"
          >
            {productos.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          <span className="text-neutral-500">Cantidad</span>
          <input
            type="number"
            value={cantidad}
            onChange={(e) => setCantidad(e.target.value)}
            className="mt-1 w-28 rounded-lg border border-neutral-300 px-3 py-2"
          />
        </label>
        <button
          onClick={agregar}
          disabled={pending || !cantidad}
          className="rounded-lg bg-neutral-900 px-3 py-2 text-sm text-white disabled:opacity-50"
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
