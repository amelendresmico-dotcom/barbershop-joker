import { useState, useEffect } from 'react';
import { supabase } from '../../supabase';

export default function ClientePerfil({ usuarioId }) {
  const [usuario, setUsuario] = useState(null);
  const [editando, setEditando] = useState(false);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    cargarPerfil();
  }, [usuarioId]);

  async function cargarPerfil() {
    if (!usuarioId) return;
    try {
      const { data } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', usuarioId)
        .single();
      setUsuario(data);
      setForm(data);
    } catch (e) {
      setError(e.message);
    }
  }

  async function guardar() {
    setLoading(true);
    try {
      await supabase.from('usuarios').update(form).eq('id', usuarioId);
      setUsuario(form);
      setEditando(false);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  if (!usuario) return <div className="text-zinc-400">Cargando perfil...</div>;

  return (
    <section className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-zinc-100">Mi Perfil</h3>
          <p className="text-sm text-zinc-400">Gestiona tu información personal.</p>
        </div>
        <button
          onClick={() => (editando ? guardar() : setEditando(true))}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold rounded-2xl transition"
        >
          {editando ? 'Guardar' : 'Editar'}
        </button>
      </div>

      {error && <div className="rounded-2xl border border-red-600 bg-red-950/40 p-4 text-sm text-red-200">{error}</div>}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-2">Nombre</label>
          <input
            type="text"
            value={form.nombre || ''}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            disabled={!editando}
            className="w-full rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-zinc-100 disabled:opacity-50"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-2">Correo</label>
          <input
            type="email"
            value={form.correo || ''}
            onChange={(e) => setForm({ ...form, correo: e.target.value })}
            disabled={!editando}
            className="w-full rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-zinc-100 disabled:opacity-50"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-2">Teléfono</label>
          <input
            type="tel"
            value={form.telefono || ''}
            onChange={(e) => setForm({ ...form, telefono: e.target.value })}
            disabled={!editando}
            className="w-full rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-zinc-100 disabled:opacity-50"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-2">Fecha de Registro</label>
          <input
            type="text"
            value={usuario.fecha_registro ? new Date(usuario.fecha_registro).toLocaleString('es-BO') : '—'}
            disabled
            className="w-full rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-zinc-100 disabled:opacity-50"
          />
        </div>
      </div>
    </section>
  );
}
