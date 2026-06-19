import { useState } from 'react';
import { supabase } from '../../supabase';

const CATEGORIAS = ['Cuidado del cabello', 'Afeitado', 'Cuidado de barba', 'Herramientas', 'Otros'];

export default function ModalProducto({ producto, onClose, onGuardado }) {
  const esEdicion = !!producto;
  const [form, setForm] = useState({
    nombre: producto?.nombre || '',
    stock_actual: producto?.stock_actual ?? '',
    stock_minimo: producto?.stock_minimo ?? '',
    precio: producto?.precio ?? '',
    categoria: producto?.categoria || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!form.nombre.trim() || form.stock_actual === '' || form.stock_minimo === '' || form.precio === '') {
      setError('Completa todos los campos obligatorios.');
      return;
    }
    if (Number(form.precio) < 0 || Number(form.stock_actual) < 0 || Number(form.stock_minimo) < 0) {
      setError('Los valores numéricos no pueden ser negativos.');
      return;
    }

    setLoading(true);
    const payload = {
      nombre: form.nombre.trim(),
      stock_actual: parseInt(form.stock_actual),
      stock_minimo: parseInt(form.stock_minimo),
      precio: Number(form.precio),
      categoria: form.categoria || null,
      ultima_actualizacion: new Date().toISOString(),
    };

    const { error: dbError } = esEdicion
      ? await supabase.from('inventario').update(payload).eq('id', producto.id)
      : await supabase.from('inventario').insert(payload);

    setLoading(false);
    if (dbError) {
      setError('Error al guardar: ' + dbError.message);
    } else {
      onGuardado();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-zinc-800">
          <div>
            <h3 className="text-lg font-bold text-zinc-100">{esEdicion ? 'Editar Producto' : 'Nuevo Producto'}</h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              {esEdicion ? 'Actualiza los datos del producto' : 'Completa los datos para agregar al inventario'}
            </p>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-200 transition-colors text-xl font-bold w-8 h-8 flex items-center justify-center rounded-lg hover:bg-zinc-800">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Nombre del producto <span className="text-red-400">*</span></label>
            <input
              type="text"
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              placeholder="Ej. Pomada fijadora"
              className="w-full px-3 py-3 bg-zinc-800 border border-zinc-700 text-zinc-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">Stock actual <span className="text-red-400">*</span></label>
              <input
                type="number"
                name="stock_actual"
                value={form.stock_actual}
                onChange={handleChange}
                min="0"
                placeholder="0"
                className="w-full px-3 py-3 bg-zinc-800 border border-zinc-700 text-zinc-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">Stock mínimo <span className="text-red-400">*</span></label>
              <input
                type="number"
                name="stock_minimo"
                value={form.stock_minimo}
                onChange={handleChange}
                min="0"
                placeholder="0"
                className="w-full px-3 py-3 bg-zinc-800 border border-zinc-700 text-zinc-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">Precio unitario (Bs.) <span className="text-red-400">*</span></label>
              <input
                type="number"
                name="precio"
                value={form.precio}
                onChange={handleChange}
                min="0"
                step="0.5"
                placeholder="0.00"
                className="w-full px-3 py-3 bg-zinc-800 border border-zinc-700 text-zinc-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
              />
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
                {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {error && (
            <div className="bg-red-900/30 border border-red-500 text-red-200 p-3 rounded-xl text-sm text-center">{error}</div>
          )}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-3 px-4 text-sm font-medium rounded-xl border border-zinc-700 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 transition-all">Cancelar</button>
            <button type="submit" disabled={loading} className="flex-1 py-3 px-4 text-sm font-bold rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? 'Guardando...' : esEdicion ? 'Guardar Cambios' : 'Agregar Producto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}