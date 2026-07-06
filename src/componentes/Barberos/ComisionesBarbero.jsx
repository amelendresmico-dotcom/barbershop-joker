import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../../supabase';

function formatCurrency(value) {
  if (value == null || Number.isNaN(Number(value))) return '-';
  return Number(value).toLocaleString('es-BO', { style: 'currency', currency: 'BOB' });
}

function formatDateTime(value) {
  if (!value) return '-';
  return new Date(value).toLocaleString('es-BO', { dateStyle: 'short', timeStyle: 'short' });
}

export default function ComisionesBarbero({ usuarioId }) {
  const [cortes, setCortes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [porcentaje, setPorcentaje] = useState(30);

  useEffect(() => {
    cargarDatos();
  }, [usuarioId, desde, hasta]);

  async function cargarDatos() {
    if (!usuarioId) return;
    setLoading(true);
    setError('');

    try {
      // Cargar porcentaje de comisión del barbero
      const { data: barbero } = await supabase
        .from('usuarios')
        .select('porcentaje_comision')
        .eq('id', usuarioId)
        .single();

      if (barbero?.porcentaje_comision !== null && barbero?.porcentaje_comision !== undefined) {
        setPorcentaje(barbero.porcentaje_comision);
      }

      // Cargar comisiones
      cargarComisiones();
    } catch (err) {
      setError(err.message || 'No se pudo cargar los datos.');
    } finally {
      setLoading(false);
    }
  }

  async function cargarComisiones() {
    if (!usuarioId) return;

    try {
      let query = supabase
        .from('citas')
        .select(
          `id, fecha_hora, estado, cliente:usuarios!citas_cliente_id_fkey (nombre), barbero:usuarios!citas_barbero_id_fkey (nombre), servicios!servicio_id (nombre, precio)`
        )
        .eq('estado', 'completado')
        .eq('barbero_id', usuarioId)
        .order('fecha_hora', { ascending: false });

      if (desde) query = query.gte('fecha_hora', desde);
      if (hasta) query = query.lte('fecha_hora', hasta);

      const { data, error } = await query;
      if (error) throw error;
      setCortes(data || []);
    } catch (err) {
      setError(err.message || 'No se pudo cargar las comisiones.');
    }
  }

  const cortesConComision = useMemo(
    () => cortes.map((corte) => {
      const precio = Number(corte.servicios?.precio || 0);
      const comision = precio * (porcentaje / 100);
      return { ...corte, precio, comision };
    }),
    [cortes, porcentaje]
  );

  const totalVentas = cortesConComision.reduce((sum, corte) => sum + corte.precio, 0);
  const totalComision = cortesConComision.reduce((sum, corte) => sum + corte.comision, 0);
  const totalCortes = cortesConComision.length;

  return (
    <section className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h3 className="text-xl font-bold text-zinc-100">Mis Comisiones</h3>
          <p className="text-sm text-zinc-400">Detalle de comisiones por cortes completados.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(0,220px)_minmax(0,220px)]">
          <label className="block text-xs uppercase tracking-[0.2em] text-zinc-500">Fecha desde</label>
          <input
            type="date"
            value={desde}
            onChange={(e) => setDesde(e.target.value)}
            className="w-full rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-zinc-100 outline-none focus:border-amber-500"
          />
          <label className="block text-xs uppercase tracking-[0.2em] text-zinc-500">Fecha hasta</label>
          <input
            type="date"
            value={hasta}
            onChange={(e) => setHasta(e.target.value)}
            className="w-full rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-zinc-100 outline-none focus:border-amber-500"
          />
          <label className="block text-xs uppercase tracking-[0.2em] text-zinc-500">% Comisión</label>
          <div className="w-full rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-zinc-100 flex items-center">
            <span className="text-lg font-semibold text-amber-400">{porcentaje}%</span>
            <span className="text-xs text-zinc-500 ml-2">(Fijo por administrador)</span>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Cortes completados</p>
          <p className="mt-3 text-3xl font-semibold text-zinc-100">{totalCortes}</p>
        </div>
        <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Total ventas</p>
          <p className="mt-3 text-3xl font-semibold text-emerald-300">{formatCurrency(totalVentas)}</p>
        </div>
        <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Total comisión</p>
          <p className="mt-3 text-3xl font-semibold text-amber-300">{formatCurrency(totalComision)}</p>
        </div>
      </div>

      {error && (
        <div className="rounded-3xl border border-red-600 bg-red-950/40 p-4 text-sm text-red-200">{error}</div>
      )}

      <div className="overflow-x-auto rounded-3xl border border-zinc-800 bg-zinc-950">
        <table className="min-w-full border-separate border-spacing-y-2 text-left text-sm">
          <thead>
            <tr className="bg-zinc-900 text-xs uppercase tracking-wider text-zinc-400">
              <th className="px-4 py-4">Fecha</th>
              <th className="px-4 py-4">Cliente</th>
              <th className="px-4 py-4">Servicio</th>
              <th className="px-4 py-4 text-right">Precio</th>
              <th className="px-4 py-4 text-right">Comisión</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {loading ? (
              <tr>
                <td colSpan="5" className="px-4 py-10 text-center text-zinc-500">Cargando cortes...</td>
              </tr>
            ) : cortesConComision.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-4 py-10 text-center text-zinc-500">No hay cortes completados para este período.</td>
              </tr>
            ) : (
              cortesConComision.map((corte) => (
                <tr key={corte.id} className="hover:bg-zinc-900/40 transition-colors">
                  <td className="px-4 py-4 text-zinc-200">{formatDateTime(corte.fecha_hora)}</td>
                  <td className="px-4 py-4 text-zinc-200">{corte.cliente?.nombre || 'Cliente'}</td>
                  <td className="px-4 py-4 text-zinc-200">{corte.servicios?.nombre || 'Servicio'}</td>
                  <td className="px-4 py-4 text-right text-emerald-300 font-semibold">{formatCurrency(corte.precio)}</td>
                  <td className="px-4 py-4 text-right text-amber-300 font-semibold">{formatCurrency(corte.comision)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
