import { useState, useEffect } from 'react';
import { supabase } from '../../supabase';

function formatDateTime(value) {
  if (!value) return '-';
  return new Date(value).toLocaleString('es-BO', { dateStyle: 'short', timeStyle: 'short' });
}

export default function ClienteHistorialCitas({ usuarioId }) {
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filtro, setFiltro] = useState('todas');

  useEffect(() => {
    cargarCitas();
  }, [usuarioId, filtro]);

  async function cargarCitas() {
    if (!usuarioId) return;
    setLoading(true);
    try {
      let query = supabase
        .from('citas')
        .select(`
          id, fecha_hora, estado, 
          cliente:usuarios!citas_cliente_id_fkey (nombre),
          barbero:usuarios!citas_barbero_id_fkey (nombre),
          servicios!servicio_id (nombre, precio)
        `)
        .eq('cliente_id', usuarioId)
        .order('fecha_hora', { ascending: false });

      if (filtro !== 'todas') {
        query = query.eq('estado', filtro);
      }

      const { data, error } = await query;
      if (error) throw error;
      setCitas(data || []);
    } catch (e) {
      console.error('Error:', e.message);
    } finally {
      setLoading(false);
    }
  }

  const estadoColor = {
    pendiente: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    en_proceso: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    completado: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    cancelado: 'bg-red-500/10 text-red-400 border-red-500/20',
  };

  return (
    <section className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6 space-y-6">
      <div>
        <h3 className="text-xl font-bold text-zinc-100">Mi Historial de Citas</h3>
        <p className="text-sm text-zinc-400">Todas tus citas pasadas y futuras.</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {['todas', 'pendiente', 'en_proceso', 'completado', 'cancelado'].map((estado) => (
          <button
            key={estado}
            onClick={() => setFiltro(estado)}
            className={`px-4 py-2 rounded-2xl text-sm font-semibold transition ${
              filtro === estado
                ? 'bg-amber-500 text-zinc-950'
                : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
            }`}
          >
            {estado === 'todas' ? 'Todas' : estado.charAt(0).toUpperCase() + estado.slice(1)}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto rounded-3xl border border-zinc-800">
        <table className="min-w-full border-separate border-spacing-y-2 text-left text-sm">
          <thead>
            <tr className="bg-zinc-950 text-xs uppercase tracking-wider text-zinc-400">
              <th className="px-4 py-4">Fecha y Hora</th>
              <th className="px-4 py-4">Barbero</th>
              <th className="px-4 py-4">Servicio</th>
              <th className="px-4 py-4 text-right">Precio</th>
              <th className="px-4 py-4">Estado</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="px-4 py-10 text-center text-zinc-500">Cargando citas...</td>
              </tr>
            ) : citas.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-4 py-10 text-center text-zinc-500">No hay citas para este filtro.</td>
              </tr>
            ) : (
              citas.map((cita) => (
                <tr key={cita.id} className="hover:bg-zinc-900/40 transition-colors border-y border-zinc-800">
                  <td className="px-4 py-4 text-zinc-200 font-mono">{formatDateTime(cita.fecha_hora)}</td>
                  <td className="px-4 py-4 text-zinc-200">{cita.barbero?.nombre || '—'}</td>
                  <td className="px-4 py-4 text-zinc-200">{cita.servicios?.nombre || '—'}</td>
                  <td className="px-4 py-4 text-right text-amber-300 font-semibold">
                    Bs. {Number(cita.servicios?.precio || 0).toFixed(2)}
                  </td>
                  <td className="px-4 py-4">
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border uppercase ${estadoColor[cita.estado] || 'bg-zinc-800 text-zinc-400 border-zinc-700'}`}>
                      {cita.estado || 'pendiente'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
