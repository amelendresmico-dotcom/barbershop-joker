import { useState } from 'react';
import { supabase } from '../../supabase';

const CATEGORIAS_INGRESO = ['Cortes', 'Servicios especiales', 'Venta de productos', 'Otros ingresos'];
const CATEGORIAS_EGRESO  = ['Compra de insumos', 'Salarios', 'Arriendo', 'Servicios básicos', 'Mantenimiento', 'Otros gastos'];

export default function ModalMovimiento({ movimiento, onClose, onGuardado }) {
  const esEdicion = !!movimiento;
  const [form, setForm] = useState({
    tipo:      movimiento?.tipo      || 'ingreso',
    concepto:  movimiento?.concepto  || '',
    monto:     movimiento?.monto     ?? '',
    categoria: movimiento?.categoria || '',
    fecha:     movimiento?.fecha     || new Date().toISOString().split('T')[0],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value, ...(name === 'tipo' ? { categoria: '' } : {}) }));
  };

  const categorias = form.tipo === 'ingreso' ? CATEGORIAS_INGRESO : CATEGORIAS_EGRESO;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!form.concepto.trim() || form.monto === '' || !form.fecha) {
      setError('Completa todos los campos obligatorios.');
      return;
    }
    if (Number(form.monto) <= 0) {
      setError('El monto debe ser mayor a 0.');
      return;
    }
    setLoading(true);
    const payload = {
      tipo:             form.tipo,
      concepto:         form.concepto.trim(),
      monto:            Number(form.monto),
      categoria:        form.categoria || null,
      fecha:            form.fecha,
      fecha_registro:   new Date().toISOString(),
    };
    const { error: dbError } = esEdicion
      ? await supabase.from('finanzas').update(payload).eq('id', movimiento.id)
      : await supabase.from('finanzas').insert(payload);
    setLoading(false);
    if (dbError) { setError('Error al guardar: ' + dbError.message); }
    else { onGuardado(); onClose(); }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-zinc-800">
          <div>
            <h3 className="text-lg font-bold text-zinc-100">{esEdicion ? 'Editar Movimiento' : 'Nuevo Movimiento'}</h3>
            <p className="text-xs text-zinc-400 mt-0.5">Registra un ingreso o egreso</p>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-200 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-zinc-800 text-xl font-bold">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Tipo */}
          <div className="grid grid-cols-2 gap-2">
            {['ingreso', 'egreso'].map(t => (
              <button
                key={t}
                type="button"
                onClick={() => setForm(prev => ({ ...prev, tipo: t, categoria: '' }))}
                className={`py-3 rounded-xl text-sm font-bold transition-all capitalize ${
                  form.tipo === t
                    ? t === 'ingreso' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
                    : 'border border-zinc-700 text-zinc-400 hover:bg-zinc-800'
                }`}
              >
                {t === 'ingreso' ? '📈 Ingreso' : '📉 Egreso'}
              </button>
            ))}
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Concepto <span className="text-red-400">*</span></label>
            <input
              type="text"
              name="concepto"
              value={form.concepto}
              onChange={handleChange}
              placeholder="Ej. Corte de cabello cliente #5"
              className="w-full px-3 py-3 bg-zinc-800 border border-zinc-700 text-zinc-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">Monto (Bs.) <span className="text-red-400">*</span></label>
              <input
                type="number"
                name="monto"
                value={form.monto}
                onChange={handleChange}
                min="0"
                step="0.5"
                placeholder="0.00"
                className="w-full px-3 py-3 bg-zinc-800 border border-zinc-700 text-zinc-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">Fecha <span className="text-red-400">*</span></label>
              <input
                type="date"
                name="fecha"
                value={form.fecha}
                onChange={handleChange}
                className="w-full px-3 py-3 bg-zinc-800 border border-zinc-700 text-zinc-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Categoría</label>
            <select
              name="categoria"
              value={form.categoria}
              onChange={handleChange}
              className="w-full px-3 py-3 bg-zinc-800 border border-zinc-700 text-zinc-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
            >
              <option value="">Sin categoría</option>
              {categorias.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {error && <div className="bg-red-900/30 border border-red-500 text-red-200 p-3 rounded-xl text-sm text-center">{error}</div>}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-3 px-4 text-sm font-medium rounded-xl border border-zinc-700 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 transition-all">Cancelar</button>
            <button type="submit" disabled={loading} className="flex-1 py-3 px-4 text-sm font-bold rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50">
              {loading ? 'Guardando...' : esEdicion ? 'Guardar Cambios' : 'Registrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}