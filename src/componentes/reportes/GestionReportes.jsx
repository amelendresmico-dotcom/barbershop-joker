import { useEffect, useMemo, useState, useRef } from 'react';
import { supabase } from '../../supabase';

const TAB_DEFINITIONS = [
  { id: 'ingresos', label: 'Ingresos' },
  { id: 'egresos', label: 'Egresos' },
  { id: 'cortes', label: 'Cortes' },
  { id: 'barbero', label: 'Por Barbero' },
  { id: 'servicio', label: 'Por Servicio' },
  { id: 'resumen', label: 'Resumen' },
];

function formatCurrency(value) {
  if (value == null || Number.isNaN(Number(value))) return '-';
  return Number(value).toLocaleString(undefined, { style: 'currency', currency: 'USD' });
}

function formatDate(value) {
  if (!value) return '-';
  return new Date(value).toLocaleString();
}

function groupItems(items, keyFn) {
  return items.reduce((acc, item) => {
    const key = keyFn(item) || 'Sin especificar';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
}

export default function GestionReportes() {
  const [tab, setTab] = useState('ingresos');
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [movimientos, setMovimientos] = useState([]);
  const [cortes, setCortes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const reportRef = useRef(null);

  useEffect(() => {
    cargarDatos();
  }, [tab, desde, hasta]);

  async function cargarDatos() {
    setLoading(true);
    setError('');
    try {
      const necesitaMovimientos = ['ingresos', 'egresos', 'resumen'].includes(tab);
      const necesitaCortes = ['cortes', 'barbero', 'servicio', 'resumen'].includes(tab);

      if (necesitaMovimientos) {
        await cargarMovimientos();
      } else {
        setMovimientos([]);
      }

      if (necesitaCortes) {
        await cargarCortes();
      } else {
        setCortes([]);
      }
    } catch (e) {
      const message = e?.message || String(e);
      setError(`No se pudo cargar el reporte: ${message}`);
    } finally {
      setLoading(false);
    }
  }

  async function cargarMovimientos() {
    let query = supabase.from('movimientos').select('*').order('fecha', { ascending: false });
    if (tab === 'ingresos') query = query.eq('tipo', 'ingreso');
    if (tab === 'egresos') query = query.eq('tipo', 'egreso');
    if (desde) query = query.gte('fecha', desde);
    if (hasta) query = query.lte('fecha', hasta);

    const { data, error } = await query;
    if (error) throw error;
    setMovimientos(data || []);
  }

  async function cargarCortes() {
    let query = supabase
      .from('citas')
      .select('id, cliente, barbero, servicio, precio, fecha, estado')
      .order('fecha', { ascending: false })
      .eq('estado', 'completado');

    if (desde) query = query.gte('fecha', desde);
    if (hasta) query = query.lte('fecha', hasta);

    const { data, error } = await query;
    if (error) throw error;
    setCortes(data || []);
  }

  const ingresos = movimientos.filter((m) => m.tipo === 'ingreso');
  const egresos = movimientos.filter((m) => m.tipo === 'egreso');
  const totalIngresos = ingresos.reduce((sum, m) => sum + Number(m.monto || 0), 0);
  const totalEgresos = egresos.reduce((sum, m) => sum + Number(m.monto || 0), 0);
  const totalBalance = totalIngresos - totalEgresos;
  const totalCortes = cortes.reduce((sum, c) => sum + Number(c.precio || 0), 0);

  const cortesPorBarbero = useMemo(() => groupItems(cortes, (c) => c.barbero), [cortes]);
  const cortesPorServicio = useMemo(() => groupItems(cortes, (c) => c.servicio), [cortes]);
  const cortesPorFecha = useMemo(
    () => groupItems(cortes, (c) => new Date(c.fecha).toLocaleDateString()),
    [cortes]
  );

  function exportarPDF() {
    const content = reportRef.current?.innerHTML;
    if (!content) return;

    const w = window.open('', '_blank');
    if (!w) return;

    w.document.write('<!doctype html><html><head><meta charset="utf-8"><title>Reporte</title>');
    w.document.write('<style>body{font-family:Inter,ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,"Helvetica Neue",Arial;color:#111827;padding:20px;background:#f8fafc;} h1,h2,h3{margin:0 0 14px;} table{width:100%;border-collapse:collapse;margin-top:14px;} th,td{padding:10px;border:1px solid #e2e8f0;text-align:left;font-size:13px;} th{background:#f1f5f9;} .text-right{text-align:right;} .badge{display:inline-flex;padding:4px 10px;border-radius:9999px;background:#fde68a;color:#92400e;font-size:12px;margin-right:6px;}.card{background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;padding:18px;margin-bottom:16px;box-shadow:0 8px 24px rgba(15,23,42,0.08);}.grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:16px;} .grid-single{display:grid;grid-template-columns:minmax(0,1fr);gap:16px;}</style>');
    w.document.write('</head><body>');
    w.document.write(`<h1>Reporte de barbería</h1><p>Generado: ${new Date().toLocaleString()}</p>`);
    w.document.write(content);
    w.document.write('</body></html>');
    w.document.close();
    w.focus();
    setTimeout(() => {
      w.print();
      w.close();
    }, 300);
  }

  return (
    <section className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6 space-y-5">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h3 className="text-xl font-bold text-zinc-100">Reportes</h3>
          <p className="text-sm text-zinc-400 max-w-2xl">
            Controla ingresos, egresos, cortes completados y genera resúmenes rápidos. Usa los filtros para cualquier rango de fechas.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {TAB_DEFINITIONS.map((item) => (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`px-3 py-2 rounded-2xl text-sm font-semibold transition ${tab === item.id ? 'bg-amber-500 text-zinc-950' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'}`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-[220px_1fr] xl:grid-cols-[280px_1fr]">
        <div className="space-y-3 rounded-3xl border border-zinc-800 bg-zinc-950 p-4">
          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">Desde</label>
            <input
              type="date"
              value={desde}
              onChange={(e) => setDesde(e.target.value)}
              className="w-full rounded-2xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-zinc-100 outline-none focus:border-amber-500"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">Hasta</label>
            <input
              type="date"
              value={hasta}
              onChange={(e) => setHasta(e.target.value)}
              className="w-full rounded-2xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-zinc-100 outline-none focus:border-amber-500"
            />
          </div>
          <div className="flex flex-col gap-3 pt-2">
            <button onClick={cargarDatos} className="w-full rounded-2xl bg-amber-500 px-4 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-amber-400">
              Aplicar Filtro
            </button>
            <button onClick={exportarPDF} className="w-full rounded-2xl border border-zinc-700 bg-transparent px-4 py-3 text-sm font-semibold text-zinc-100 transition hover:bg-zinc-800">
              Exportar a PDF
            </button>
          </div>
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-4 text-sm text-zinc-400">
            <p className="font-semibold text-zinc-200">Consejo</p>
            <p className="mt-2">Usa los tabs para comparar ingresos y egresos, ver cortes diarios y ver el detalle por barbero o servicio.</p>
          </div>
        </div>

        <div ref={reportRef} className="space-y-5">
          {error && <div className="rounded-3xl border border-red-600 bg-red-950/50 p-4 text-sm text-red-200">{error}</div>}

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Ingresos</p>
              <p className="mt-3 text-2xl font-semibold text-emerald-300">{formatCurrency(totalIngresos)}</p>
            </div>
            <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Egresos</p>
              <p className="mt-3 text-2xl font-semibold text-rose-300">{formatCurrency(totalEgresos)}</p>
            </div>
            <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Balance</p>
              <p className="mt-3 text-2xl font-semibold text-amber-300">{formatCurrency(totalBalance)}</p>
            </div>
            <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Cortes</p>
              <p className="mt-3 text-2xl font-semibold text-zinc-200">{cortes.length}</p>
            </div>
          </div>

          {loading ? (
            <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6 text-center text-zinc-400">Cargando reporte...</div>
          ) : (
            <>
              {(tab === 'ingresos' || tab === 'egresos' || tab === 'resumen') && (
                <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-5">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h4 className="text-lg font-semibold text-zinc-100">Movimientos</h4>
                      <p className="text-sm text-zinc-500">{tab === 'ingresos' ? 'Ingresos registrados' : tab === 'egresos' ? 'Egresos registrados' : 'Movimientos generales'}</p>
                    </div>
                    <span className="rounded-full bg-zinc-800 px-3 py-1 text-xs uppercase tracking-[0.2em] text-zinc-400">{movimientos.length} items</span>
                  </div>

                  <div className="mt-4 overflow-x-auto">
                    <table className="min-w-full border-separate border-spacing-y-2">
                      <thead>
                        <tr className="text-left text-xs uppercase tracking-[0.2em] text-zinc-500">
                          <th className="pb-3">Fecha</th>
                          <th className="pb-3">Tipo</th>
                          <th className="pb-3">Categoría</th>
                          <th className="pb-3">Descripción</th>
                          <th className="pb-3 text-right">Monto</th>
                        </tr>
                      </thead>
                      <tbody>
                        {movimientos.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="py-8 text-center text-zinc-500">No hay movimientos para este filtro.</td>
                          </tr>
                        ) : (
                          movimientos.map((mov) => (
                            <tr key={mov.id} className="border-y border-zinc-800">
                              <td className="py-3 text-sm text-zinc-200">{formatDate(mov.fecha)}</td>
                              <td className="py-3 text-sm text-zinc-200">{mov.tipo}</td>
                              <td className="py-3 text-sm text-zinc-200">{mov.categoria || '-'}</td>
                              <td className="py-3 text-sm text-zinc-200">{mov.descripcion || '-'}</td>
                              <td className="py-3 text-right text-sm text-zinc-200">{formatCurrency(mov.monto)}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {(tab === 'cortes' || tab === 'resumen') && (
                <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-5">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h4 className="text-lg font-semibold text-zinc-100">Cortes completados</h4>
                      <p className="text-sm text-zinc-500">Registros de citas completadas en el rango seleccionado.</p>
                    </div>
                    <span className="rounded-full bg-zinc-800 px-3 py-1 text-xs uppercase tracking-[0.2em] text-zinc-400">{cortes.length} items</span>
                  </div>

                  <div className="mt-4 overflow-x-auto">
                    <table className="min-w-full border-separate border-spacing-y-2">
                      <thead>
                        <tr className="text-left text-xs uppercase tracking-[0.2em] text-zinc-500">
                          <th className="pb-3">Fecha</th>
                          <th className="pb-3">Cliente</th>
                          <th className="pb-3">Barbero</th>
                          <th className="pb-3">Servicio</th>
                          <th className="pb-3 text-right">Precio</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cortes.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="py-8 text-center text-zinc-500">No hay cortes completados para este filtro.</td>
                          </tr>
                        ) : (
                          cortes.map((corte) => (
                            <tr key={corte.id} className="border-y border-zinc-800">
                              <td className="py-3 text-sm text-zinc-200">{formatDate(corte.fecha)}</td>
                              <td className="py-3 text-sm text-zinc-200">{corte.cliente || '-'}</td>
                              <td className="py-3 text-sm text-zinc-200">{corte.barbero || '-'}</td>
                              <td className="py-3 text-sm text-zinc-200">{corte.servicio || '-'}</td>
                              <td className="py-3 text-right text-sm text-zinc-200">{formatCurrency(corte.precio)}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {tab === 'barbero' && (
                <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-5">
                  <h4 className="text-lg font-semibold text-zinc-100">Cortes por barbero</h4>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {Object.entries(cortesPorBarbero).length === 0 ? (
                      <div className="text-zinc-500">No hay datos de barbero para este filtro.</div>
                    ) : (
                      Object.entries(cortesPorBarbero).map(([barbero, cantidad]) => (
                        <div key={barbero} className="rounded-3xl border border-zinc-800 bg-zinc-900 p-4">
                          <p className="text-sm text-zinc-400">{barbero}</p>
                          <p className="mt-3 text-3xl font-semibold text-zinc-100">{cantidad}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {tab === 'servicio' && (
                <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-5">
                  <h4 className="text-lg font-semibold text-zinc-100">Cortes por servicio</h4>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {Object.entries(cortesPorServicio).length === 0 ? (
                      <div className="text-zinc-500">No hay servicios registrados para este filtro.</div>
                    ) : (
                      Object.entries(cortesPorServicio).map(([servicio, cantidad]) => (
                        <div key={servicio} className="rounded-3xl border border-zinc-800 bg-zinc-900 p-4">
                          <p className="text-sm text-zinc-400">{servicio}</p>
                          <p className="mt-3 text-3xl font-semibold text-zinc-100">{cantidad}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {tab === 'resumen' && (
                <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-5">
                  <h4 className="text-lg font-semibold text-zinc-100">Resumen del periodo</h4>
                  <div className="mt-4 grid gap-4 lg:grid-cols-2">
                    <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-5">
                      <p className="text-sm text-zinc-400">Total ingresos</p>
                      <p className="mt-3 text-2xl font-semibold text-emerald-300">{formatCurrency(totalIngresos)}</p>
                      <p className="mt-2 text-sm text-zinc-500">{ingresos.length} registros</p>
                    </div>
                    <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-5">
                      <p className="text-sm text-zinc-400">Total egresos</p>
                      <p className="mt-3 text-2xl font-semibold text-rose-300">{formatCurrency(totalEgresos)}</p>
                      <p className="mt-2 text-sm text-zinc-500">{egresos.length} registros</p>
                    </div>
                    <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-5">
                      <p className="text-sm text-zinc-400">Cortes completados</p>
                      <p className="mt-3 text-2xl font-semibold text-zinc-100">{cortes.length}</p>
                      <p className="mt-2 text-sm text-zinc-500">Total generado {formatCurrency(totalCortes)}</p>
                    </div>
                    <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-5">
                      <p className="text-sm text-zinc-400">Balance neto</p>
                      <p className="mt-3 text-2xl font-semibold text-amber-300">{formatCurrency(totalBalance)}</p>
                      <p className="mt-2 text-sm text-zinc-500">Calculado entre ingresos y egresos.</p>
                    </div>
                  </div>

                  <div className="mt-6 rounded-3xl border border-zinc-800 bg-zinc-900 p-5">
                    <p className="text-sm uppercase tracking-[0.2em] text-zinc-500">Cortes por día</p>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                      {Object.entries(cortesPorFecha).length === 0 ? (
                        <div className="text-zinc-500">No hay cortes para agrupar.</div>
                      ) : (
                        Object.entries(cortesPorFecha).map(([fecha, cantidad]) => (
                          <div key={fecha} className="rounded-3xl border border-zinc-800 bg-zinc-950 p-4">
                            <p className="text-sm text-zinc-400">{fecha}</p>
                            <p className="mt-3 text-2xl font-semibold text-zinc-100">{cantidad}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}
