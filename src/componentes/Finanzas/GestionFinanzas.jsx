import { useState, useEffect } from 'react';
import { supabase } from '../../supabase';
import ModalMovimiento from './ModalMovimiento';
import ModalConfirmarEliminar from '../Servicios/ModalConfirmarEliminar';

const hoy = new Date();
const primerDiaMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1).toISOString().split('T')[0];
const ultimoDiaMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0).toISOString().split('T')[0];

export default function GestionFinanzas() {
  const [movimientos, setMovimientos]       = useState([]);
  const [cargando, setCargando]             = useState(true);
  const [modalAbierto, setModalAbierto]     = useState(false);
  const [movEditar, setMovEditar]           = useState(null);
  const [movEliminar, setMovEliminar]       = useState(null);
  const [eliminando, setEliminando]         = useState(false);
  const [errorEliminar, setErrorEliminar]   = useState(null);
  const [filtroTipo, setFiltroTipo]         = useState('todos');
  const [fechaDesde, setFechaDesde]         = useState(primerDiaMes);
  const [fechaHasta, setFechaHasta]         = useState(ultimoDiaMes);

  const cargarMovimientos = async () => {
    setCargando(true);
    let query = supabase
      .from('finanzas')
      .select('id, tipo, concepto, monto, categoria, fecha, fecha_registro')
      .gte('fecha', fechaDesde)
      .lte('fecha', fechaHasta)
      .order('fecha', { ascending: false });

    if (filtroTipo !== 'todos') query = query.eq('tipo', filtroTipo);

    const { data } = await query;
    setMovimientos(data || []);
    setCargando(false);
  };

  useEffect(() => { cargarMovimientos(); }, [filtroTipo, fechaDesde, fechaHasta]);

  const totalIngresos = movimientos.filter(m => m.tipo === 'ingreso').reduce((s, m) => s + Number(m.monto), 0);
  const totalEgresos  = movimientos.filter(m => m.tipo === 'egreso').reduce((s, m) => s + Number(m.monto), 0);
  const balance       = totalIngresos - totalEgresos;

  const abrirNuevo  = () => { setMovEditar(null); setModalAbierto(true); };
  const abrirEditar = (m) => { setMovEditar(m); setModalAbierto(true); };

  const confirmarEliminar = async () => {
    setEliminando(true);
    setErrorEliminar(null);
    const { error } = await supabase.from('finanzas').delete().eq('id', movEliminar.id);
    setEliminando(false);
    if (error) { setErrorEliminar('No se pudo eliminar: ' + error.message); }
    else { setMovEliminar(null); cargarMovimientos(); }
  };

  const fmt = (n) => `Bs. ${Number(n).toFixed(2)}`;
  const fmtFecha = (f) => f ? new Date(f + 'T00:00:00').toLocaleDateString('es-BO', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—';

  return (
    <section className="space-y-4">
      {modalAbierto && (
        <ModalMovimiento
          movimiento={movEditar}
          onClose={() => setModalAbierto(false)}
          onGuardado={cargarMovimientos}
        />
      )}
      {movEliminar && (
        <ModalConfirmarEliminar
          nombre={movEliminar.concepto}
          loading={eliminando}
          error={errorEliminar}
          onClose={() => { setMovEliminar(null); setErrorEliminar(null); }}
          onConfirmar={confirmarEliminar}
        />
      )}

      {/* Tarjetas resumen */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <p className="text-xs text-zinc-400 font-medium uppercase tracking-wider">Ingresos</p>
          <p className="text-3xl font-black text-emerald-400 mt-2">{fmt(totalIngresos)}</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <p className="text-xs text-zinc-400 font-medium uppercase tracking-wider">Egresos</p>
          <p className="text-3xl font-black text-red-400 mt-2">{fmt(totalEgresos)}</p>
        </div>
        <div className={`rounded-2xl p-5 border ${balance >= 0 ? 'bg-emerald-950/30 border-emerald-800' : 'bg-red-950/30 border-red-800'}`}>
          <p className="text-xs text-zinc-400 font-medium uppercase tracking-wider">Balance</p>
          <p className={`text-3xl font-black mt-2 ${balance >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{fmt(balance)}</p>
        </div>
      </div>

      {/* Tabla principal */}
      <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6 space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold text-zinc-100">Movimientos</h3>
            <p className="text-xs text-zinc-400">Registro de ingresos y egresos.</p>
          </div>
          <button
            onClick={abrirNuevo}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-sm rounded-xl transition-all shadow-lg shadow-amber-500/10"
          >
            + Nuevo Movimiento
          </button>
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex gap-2">
            {[['todos','Todos'], ['ingreso','Ingresos'], ['egreso','Egresos']].map(([val, lbl]) => (
              <button
                key={val}
                onClick={() => setFiltroTipo(val)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                  filtroTipo === val
                    ? val === 'ingreso' ? 'bg-emerald-600 text-white'
                      : val === 'egreso' ? 'bg-red-600 text-white'
                      : 'bg-amber-500 text-zinc-950'
                    : 'border border-zinc-700 text-zinc-400 hover:bg-zinc-800'
                }`}
              >
                {lbl}
              </button>
            ))}
          </div>
          <div className="flex gap-2 items-center ml-auto">
            <label className="text-xs text-zinc-500">Desde</label>
            <input type="date" value={fechaDesde} onChange={e => setFechaDesde(e.target.value)}
              className="px-2 py-1.5 bg-zinc-800 border border-zinc-700 text-zinc-100 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-amber-500" />
            <label className="text-xs text-zinc-500">Hasta</label>
            <input type="date" value={fechaHasta} onChange={e => setFechaHasta(e.target.value)}
              className="px-2 py-1.5 bg-zinc-800 border border-zinc-700 text-zinc-100 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-amber-500" />
          </div>
        </div>

        {/* Tabla */}
        {cargando ? (
          <p className="text-sm text-zinc-500 animate-pulse">Cargando movimientos...</p>
        ) : movimientos.length === 0 ? (
          <p className="text-sm text-zinc-500">No hay movimientos en este período.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-zinc-500 uppercase text-xs tracking-wider border-b border-zinc-800">
                  <th className="py-3 pr-4 font-medium">Fecha</th>
                  <th className="py-3 pr-4 font-medium">Concepto</th>
                  <th className="py-3 pr-4 font-medium">Categoría</th>
                  <th className="py-3 pr-4 font-medium">Tipo</th>
                  <th className="py-3 pr-4 font-medium">Monto</th>
                  <th className="py-3 pr-4 font-medium text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {movimientos.map((m) => (
                  <tr key={m.id} className="text-zinc-200">
                    <td className="py-3 pr-4 text-zinc-400 text-xs">{fmtFecha(m.fecha)}</td>
                    <td className="py-3 pr-4 font-medium">{m.concepto}</td>
                    <td className="py-3 pr-4 text-zinc-400 text-xs">{m.categoria || '—'}</td>
                    <td className="py-3 pr-4">
                      <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${
                        m.tipo === 'ingreso'
                          ? 'bg-emerald-950/50 text-emerald-300 border border-emerald-800'
                          : 'bg-red-950/50 text-red-300 border border-red-800'
                      }`}>
                        {m.tipo === 'ingreso' ? '📈 Ingreso' : '📉 Egreso'}
                      </span>
                    </td>
                    <td className={`py-3 pr-4 font-bold ${m.tipo === 'ingreso' ? 'text-emerald-400' : 'text-red-400'}`}>
                      {m.tipo === 'egreso' ? '- ' : '+ '}{fmt(m.monto)}
                    </td>
                    <td className="py-3 pr-4 text-right space-x-2">
                      <button
                        onClick={() => abrirEditar(m)}
                        className="px-3 py-1.5 text-xs font-medium rounded-lg border border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100 transition-all"
                      >
                        ✏️ Editar
                      </button>
                      <button
                        onClick={() => setMovEliminar(m)}
                        className="px-3 py-1.5 text-xs font-medium rounded-lg border border-red-900 text-red-400 hover:bg-red-950/30 hover:text-red-300 transition-all"
                      >
                        🗑️ Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}