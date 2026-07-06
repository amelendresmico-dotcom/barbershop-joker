import { useState, useEffect } from 'react';
import { supabase } from '../../supabase';

export default function ClientePagos({ usuarioId }) {
  const [pagos, setPagos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [form, setForm] = useState({
    tipo: 'tarjeta_credito',
    numero: '',
    titular: '',
    vencimiento: '',
    cvv: '',
    banco: '',
    descripcion: '',
  });

  useEffect(() => {
    cargarPagos();
  }, [usuarioId]);

  async function cargarPagos() {
    if (!usuarioId) return;
    setLoading(true);
    try {
      const { data } = await supabase
        .from('cliente_metodos_pago')
        .select('*')
        .eq('cliente_id', usuarioId)
        .order('fecha_creacion', { ascending: false });
      setPagos(data || []);
    } catch (e) {
      console.error('Error:', e.message);
    } finally {
      setLoading(false);
    }
  }

  async function guardarPago() {
    try {
      if (form.tipo === 'tarjeta_credito' && (!form.numero || !form.titular || !form.vencimiento || !form.cvv)) {
        alert('Completa todos los campos de la tarjeta.');
        return;
      }
      if (form.tipo === 'transferencia' && !form.banco) {
        alert('Especifica el banco.');
        return;
      }

      await supabase.from('cliente_metodos_pago').insert({
        cliente_id: usuarioId,
        tipo: form.tipo,
        numero: form.numero ? form.numero.slice(-4) : null,
        titular: form.titular || null,
        vencimiento: form.vencimiento || null,
        banco: form.banco || null,
        descripcion: form.descripcion || null,
      });

      setModalAbierto(false);
      setForm({
        tipo: 'tarjeta_credito',
        numero: '',
        titular: '',
        vencimiento: '',
        cvv: '',
        banco: '',
        descripcion: '',
      });
      cargarPagos();
    } catch (e) {
      console.error('Error:', e.message);
      alert('Error al guardar el método de pago.');
    }
  }

  async function eliminarPago(id) {
    if (confirm('¿Eliminar este método de pago?')) {
      try {
        await supabase.from('cliente_metodos_pago').delete().eq('id', id);
        cargarPagos();
      } catch (e) {
        console.error('Error:', e.message);
      }
    }
  }

  return (
    <section className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-zinc-100">Métodos de Pago</h3>
          <p className="text-sm text-zinc-400">Guarda tus formas de pago favoritas.</p>
        </div>
        <button
          onClick={() => setModalAbierto(true)}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold rounded-2xl transition text-sm"
        >
          + Agregar Método
        </button>
      </div>

      {loading ? (
        <p className="text-zinc-500">Cargando...</p>
      ) : pagos.length === 0 ? (
        <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-8 text-center">
          <p className="text-zinc-400">No has guardado ningún método de pago aún.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {pagos.map((pago) => (
            <div key={pago.id} className="rounded-3xl border border-zinc-800 bg-zinc-950 p-5 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {pago.tipo === 'tarjeta_credito' && (
                    <>
                      <p className="text-lg font-semibold text-amber-400">💳 Tarjeta Crédito</p>
                      <p className="text-zinc-400 text-sm">{pago.titular}</p>
                      <p className="text-zinc-500 text-xs mt-1">**** **** **** {pago.numero}</p>
                      <p className="text-zinc-500 text-xs">Vence: {pago.vencimiento}</p>
                    </>
                  )}
                  {pago.tipo === 'transferencia' && (
                    <>
                      <p className="text-lg font-semibold text-green-400">🏦 Transferencia</p>
                      <p className="text-zinc-400 text-sm">{pago.banco}</p>
                      <p className="text-zinc-500 text-xs mt-1">{pago.descripcion || 'Sin descripción'}</p>
                    </>
                  )}
                  {pago.tipo === 'efectivo' && (
                    <>
                      <p className="text-lg font-semibold text-emerald-400">💰 Efectivo</p>
                      <p className="text-zinc-400 text-sm">{pago.descripcion || 'Pago en efectivo'}</p>
                    </>
                  )}
                </div>
                <button
                  onClick={() => eliminarPago(pago.id)}
                  className="text-red-400 hover:text-red-300 text-sm font-medium"
                >
                  ✕
                </button>
              </div>
              <p className="text-xs text-zinc-600">
                Agregado: {new Date(pago.fecha_creacion).toLocaleDateString('es-BO')}
              </p>
            </div>
          ))}
        </div>
      )}

      {modalAbierto && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 rounded-3xl border border-zinc-800 p-6 max-w-sm w-full space-y-4 max-h-96 overflow-y-auto">
            <h4 className="text-lg font-bold text-zinc-100">Agregar Método de Pago</h4>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-zinc-400">Tipo</label>
              <select
                value={form.tipo}
                onChange={(e) => setForm({ ...form, tipo: e.target.value })}
                className="w-full rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-zinc-100 text-sm"
              >
                <option value="tarjeta_credito">Tarjeta de Crédito</option>
                <option value="transferencia">Transferencia Bancaria</option>
                <option value="efectivo">Efectivo</option>
              </select>
            </div>

            {form.tipo === 'tarjeta_credito' && (
              <>
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-zinc-400">Número de Tarjeta</label>
                  <input
                    type="text"
                    value={form.numero}
                    onChange={(e) => setForm({ ...form, numero: e.target.value.replace(/\D/g, '').slice(0, 16) })}
                    placeholder="1234567890123456"
                    className="w-full rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-zinc-100 text-sm"
                    maxLength="16"
                  />
                </div>
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-zinc-400">Titular</label>
                  <input
                    type="text"
                    value={form.titular}
                    onChange={(e) => setForm({ ...form, titular: e.target.value })}
                    placeholder="Tu Nombre Completo"
                    className="w-full rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-zinc-100 text-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-zinc-400">Vencimiento</label>
                    <input
                      type="text"
                      value={form.vencimiento}
                      onChange={(e) => setForm({ ...form, vencimiento: e.target.value })}
                      placeholder="MM/YY"
                      className="w-full rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-zinc-100 text-sm"
                      maxLength="5"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-zinc-400">CVV</label>
                    <input
                      type="text"
                      value={form.cvv}
                      onChange={(e) => setForm({ ...form, cvv: e.target.value.replace(/\D/g, '').slice(0, 3) })}
                      placeholder="123"
                      className="w-full rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-zinc-100 text-sm"
                      maxLength="3"
                    />
                  </div>
                </div>
              </>
            )}

            {form.tipo === 'transferencia' && (
              <>
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-zinc-400">Banco</label>
                  <input
                    type="text"
                    value={form.banco}
                    onChange={(e) => setForm({ ...form, banco: e.target.value })}
                    placeholder="Ej: Banco de Crédito"
                    className="w-full rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-zinc-100 text-sm"
                  />
                </div>
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-zinc-400">Descripción</label>
                  <input
                    type="text"
                    value={form.descripcion}
                    onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                    placeholder="Ej: Número de cuenta"
                    className="w-full rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-zinc-100 text-sm"
                  />
                </div>
              </>
            )}

            {form.tipo === 'efectivo' && (
              <div className="space-y-3">
                <label className="block text-sm font-medium text-zinc-400">Descripción (opcional)</label>
                <input
                  type="text"
                  value={form.descripcion}
                  onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                  placeholder="Notas"
                  className="w-full rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-zinc-100 text-sm"
                />
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => {
                  setModalAbierto(false);
                  setForm({
                    tipo: 'tarjeta_credito',
                    numero: '',
                    titular: '',
                    vencimiento: '',
                    cvv: '',
                    banco: '',
                    descripcion: '',
                  });
                }}
                className="flex-1 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-semibold rounded-2xl transition text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={guardarPago}
                className="flex-1 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold rounded-2xl transition text-sm"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
