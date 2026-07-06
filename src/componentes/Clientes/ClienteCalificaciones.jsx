import { useState, useEffect } from 'react';
import { supabase } from '../../supabase';

function formatDateTime(value) {
  if (!value) return '-';
  return new Date(value).toLocaleString('es-BO', { dateStyle: 'short', timeStyle: 'short' });
}

export default function ClienteCalificaciones({ usuarioId }) {
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    cargarCitas();
  }, [usuarioId]);

  async function cargarCitas() {
    if (!usuarioId) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('citas')
        .select(`
          id, fecha_hora, estado,
          barbero:usuarios!citas_barbero_id_fkey (nombre),
          servicios!servicio_id (nombre)
        `)
        .eq('cliente_id', usuarioId)
        .eq('estado', 'completado')
        .order('fecha_hora', { ascending: false });

      if (!error) {
        setCitas(data || []);
      }
    } catch (e) {
      console.error('Error:', e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6 space-y-6">
      <div>
        <h3 className="text-xl font-bold text-zinc-100">Mis Cortes Realizados</h3>
        <p className="text-sm text-zinc-400">Historial de servicios completados.</p>
      </div>

      <div className="overflow-x-auto rounded-3xl border border-zinc-800">
        <table className="min-w-full border-separate border-spacing-y-2 text-left text-sm">
          <thead>
            <tr className="bg-zinc-950 text-xs uppercase tracking-wider text-zinc-400">
              <th className="px-4 py-4">Fecha</th>
              <th className="px-4 py-4">Barbero</th>
              <th className="px-4 py-4">Servicio</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="3" className="px-4 py-10 text-center text-zinc-500">Cargando...</td>
              </tr>
            ) : citas.length === 0 ? (
              <tr>
                <td colSpan="3" className="px-4 py-10 text-center text-zinc-500">No hay cortes completados.</td>
              </tr>
            ) : (
              citas.map((cita) => (
                <tr key={cita.id} className="hover:bg-zinc-900/40 transition-colors border-y border-zinc-800">
                  <td className="px-4 py-4 text-zinc-200 font-mono">{formatDateTime(cita.fecha_hora)}</td>
                  <td className="px-4 py-4 text-zinc-200">{cita.barbero?.nombre || '—'}</td>
                  <td className="px-4 py-4 text-zinc-200">{cita.servicios?.nombre || '—'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
