import { useState } from 'react';
import { supabase } from '../../supabase';

export default function ModalServicio({ servicio, onClose, onGuardado }) {
  const esEdicion = !!servicio;
  const [form, setForm] = useState({
    nombre: servicio?.nombre || '',
    precio: servicio?.precio ?? '',
    duracion_minutos: servicio?.duracion_minutos ?? '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!form.nombre.trim() || form.precio === '' || form.duracion_minutos === '') {
      setError('Completa todos los campos.');
      return;
    }
    if (Number(form.precio) <= 0 || Number(form.duracion_minutos) <= 0) {
      setError('Precio y duración deben ser mayores a 0.');
      return;
    }
    setLoading(true);
    const payload = {
      nombre: form.nombre.trim(),
      precio: Number(form.precio),
      duracion_minutos: parseInt(form.duracion_minutos),
    };
    const { error: dbError } = esEdicion
      ? await supabase.from('servicios').update(payload).eq('id', servicio.id)
      : await supabase.from('servicios').insert(payload);
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
            <h3 className="text-lg font-bold text-zinc-100">{esEdicion ? 'Editar Servicio' : 'Nuevo Servicio'}</h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              {esEdicion ? 'Actualiza los datos del servicio' : 'Completa los datos para crear un servicio'}
            </p>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-200 transition-colors text-xl font-bold w-8 h-8 flex items-center justify-center rounded-lg hover:bg-zinc-800">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Nombre del servicio</label>
            <input
              type="text" name="nombre" value={form.nombre} onChange={handleChange}
              placeholder="Ej. Corte clásico"
              className="w-full px-3 py-3 bg-zinc-800 border border-zinc-700 text-zinc-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">Precio (Bs.)</label>
              <input
                type="number" name="precio" value={form.precio} onChange={handleChange}
                min="0" step="0.5" placeholder="0.00"
                className="w-full px-3 py-3 bg-zinc-800 border border-zinc-700 text-zinc-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">Duración (min)</label>
              <input
                type="number" name="duracion_minutos" value={form.duracion_minutos} onChange={handleChange}
                min="0" step="5" placeholder="30"
                className="w-full px-3 py-3 bg-zinc-800 border border-zinc-700 text-zinc-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
              />
            </div>
          </div>
          {error && (
            <div className="bg-red-900/30 border border-red-500 text-red-200 p-3 rounded-xl text-sm text-center">{error}</div>
          )}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-3 px-4 text-sm font-medium rounded-xl border border-zinc-700 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 transition-all">Cancelar</button>
            <button type="submit" disabled={loading} className="flex-1 py-3 px-4 text-sm font-bold rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? 'Guardando...' : esEdicion ? 'Guardar Cambios' : 'Crear Servicio'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}