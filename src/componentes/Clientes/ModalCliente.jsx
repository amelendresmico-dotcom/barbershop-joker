import { useState } from 'react';
import { supabase } from '../../supabase';

const inputClass = "w-full px-3 py-3 bg-zinc-800 border border-zinc-700 text-zinc-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all placeholder-zinc-500";
const labelClass = "block text-sm font-medium text-zinc-300 mb-1";

export default function ModalCliente({ cliente, onClose, onGuardado }) {
  const [form, setForm] = useState({
    nombre: cliente?.nombre || '',
    telefono: cliente?.telefono || '',
    estado: cliente?.estado || 'activo',
  });
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleGuardar = async (e) => {
    e.preventDefault();
    setError(null);
    if (!form.nombre.trim()) { setError('El nombre es obligatorio.'); return; }

    setGuardando(true);
    const { error: err } = await supabase
      .from('usuarios')
      .update({
        nombre: form.nombre.trim(),
        telefono: form.telefono.trim(),
        estado: form.estado,
      })
      .eq('id', cliente.id);
    setGuardando(false);

    if (err) { setError('Error: ' + err.message); }
    else { onGuardado(); onClose(); }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-zinc-800">
          <div>
            <h3 className="text-lg font-bold text-zinc-100">Editar Cliente</h3>
            <p className="text-xs text-zinc-400 mt-0.5">{cliente?.correo}</p>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-200 transition-colors text-xl font-bold w-8 h-8 flex items-center justify-center rounded-lg hover:bg-zinc-800">✕</button>
        </div>
        <form onSubmit={handleGuardar} className="p-6 space-y-4">
          <div>
            <label className={labelClass}>Nombre completo</label>
            <input type="text" name="nombre" value={form.nombre} onChange={handleChange} placeholder="Nombre del cliente" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Teléfono</label>
            <input type="tel" name="telefono" value={form.telefono} onChange={handleChange} placeholder="Ej: 70012345" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Estado</label>
            <select name="estado" value={form.estado} onChange={handleChange} className={inputClass}>
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
            </select>
          </div>
          {error && <div className="bg-red-900/30 border border-red-500 text-red-200 p-3 rounded-xl text-sm text-center">{error}</div>}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-3 px-4 text-sm font-medium rounded-xl border border-zinc-700 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 transition-all">Cancelar</button>
            <button type="submit" disabled={guardando} className="flex-1 py-3 px-4 text-sm font-bold rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50">
              {guardando ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}