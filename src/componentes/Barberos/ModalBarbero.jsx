import { useState } from 'react';
import { supabase } from '../../supabase';

export default function ModalBarbero({ barbero, onClose, onGuardado }) {
  const esEdicion = !!barbero;
  const [form, setForm] = useState({
    nombre: barbero?.nombre || '',
    correo: barbero?.correo || '',
    telefono: barbero?.telefono || '',
    estado: barbero?.estado || 'activo',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!form.nombre.trim() || !form.correo.trim()) {
      setError('Nombre y correo son obligatorios.');
      return;
    }
    setLoading(true);

    if (esEdicion) {
      const { error: dbError } = await supabase
        .from('usuarios')
        .update({
          nombre: form.nombre.trim(),
          correo: form.correo.trim(),
          telefono: form.telefono.trim() || null,
          estado: form.estado,
        })
        .eq('id', barbero.id);
      setLoading(false);
      if (dbError) { setError('Error al guardar: ' + dbError.message); return; }
    } else {
      // Crear usuario en Supabase Auth primero
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: form.correo.trim(),
        password: 'Joker2024!',
        email_confirm: true,
      });
      if (authError) {
        setLoading(false);
        setError('Error al crear cuenta: ' + authError.message);
        return;
      }
      const { error: dbError } = await supabase
        .from('usuarios')
        .insert({
          auth_id: authData.user.id,
          nombre: form.nombre.trim(),
          correo: form.correo.trim(),
          telefono: form.telefono.trim() || null,
          rol_id: 2,
          estado: 'activo',
        });
      setLoading(false);
      if (dbError) { setError('Error al registrar: ' + dbError.message); return; }
    }

    onGuardado();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-zinc-800">
          <div>
            <h3 className="text-lg font-bold text-zinc-100">{esEdicion ? 'Editar Barbero' : 'Nuevo Barbero'}</h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              {esEdicion ? 'Actualiza los datos del barbero' : 'Completa los datos para registrar un barbero'}
            </p>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-200 transition-colors text-xl font-bold w-8 h-8 flex items-center justify-center rounded-lg hover:bg-zinc-800">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Nombre completo</label>
            <input
              type="text" name="nombre" value={form.nombre} onChange={handleChange}
              placeholder="Ej. Juan Pérez"
              className="w-full px-3 py-3 bg-zinc-800 border border-zinc-700 text-zinc-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Correo electrónico</label>
            <input
              type="email" name="correo" value={form.correo} onChange={handleChange}
              placeholder="correo@ejemplo.com"
              disabled={esEdicion}
              className="w-full px-3 py-3 bg-zinc-800 border border-zinc-700 text-zinc-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            />
            {esEdicion && <p className="text-[10px] text-zinc-500 mt-1">El correo no se puede modificar.</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Teléfono</label>
            <input
              type="text" name="telefono" value={form.telefono} onChange={handleChange}
              placeholder="Ej. 70012345"
              className="w-full px-3 py-3 bg-zinc-800 border border-zinc-700 text-zinc-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
            />
          </div>
          {esEdicion && (
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">Estado</label>
              <select
                name="estado" value={form.estado} onChange={handleChange}
                className="w-full px-3 py-3 bg-zinc-800 border border-zinc-700 text-zinc-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
              >
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
              </select>
            </div>
          )}
          {!esEdicion && (
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-3">
              <p className="text-xs text-zinc-400">🔑 Se creará la cuenta con contraseña temporal <span className="text-amber-400 font-mono">Joker2024!</span>. El barbero podrá cambiarla al iniciar sesión.</p>
            </div>
          )}
          {error && (
            <div className="bg-red-900/30 border border-red-500 text-red-200 p-3 rounded-xl text-sm text-center">{error}</div>
          )}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-3 px-4 text-sm font-medium rounded-xl border border-zinc-700 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 transition-all">Cancelar</button>
            <button type="submit" disabled={loading} className="flex-1 py-3 px-4 text-sm font-bold rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? 'Guardando...' : esEdicion ? 'Guardar Cambios' : 'Registrar Barbero'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}