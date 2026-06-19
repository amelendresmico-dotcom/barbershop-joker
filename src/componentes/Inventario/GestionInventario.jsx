import { useState, useEffect } from 'react';
import { supabase } from '../../supabase';
import ModalProducto from './ModalProducto';
import ModalConfirmarEliminar from '../Servicios/ModalConfirmarEliminar';

export default function GestionInventario() {
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [productoEditar, setProductoEditar] = useState(null);
  const [productoEliminar, setProductoEliminar] = useState(null);
  const [eliminando, setEliminando] = useState(false);
  const [errorEliminar, setErrorEliminar] = useState(null);
  const [filtro, setFiltro] = useState('todos');

  const cargarProductos = async () => {
    setCargando(true);
    const { data } = await supabase
      .from('inventario')
      .select('id, nombre, stock_actual, stock_minimo, precio, categoria, ultima_actualizacion')
      .order('nombre', { ascending: true });
    setProductos(data || []);
    setCargando(false);
  };

  useEffect(() => { cargarProductos(); }, []);

  const abrirNuevo = () => { setProductoEditar(null); setModalAbierto(true); };
  const abrirEditar = (p) => { setProductoEditar(p); setModalAbierto(true); };

  const confirmarEliminar = async () => {
    setEliminando(true);
    setErrorEliminar(null);
    const { error } = await supabase.from('inventario').delete().eq('id', productoEliminar.id);
    setEliminando(false);
    if (error) {
      setErrorEliminar('No se pudo eliminar: ' + error.message);
    } else {
      setProductoEliminar(null);
      cargarProductos();
    }
  };

  const stockBajo = productos.filter(p => p.stock_actual <= p.stock_minimo);

  const productosFiltrados = filtro === 'stock_bajo'
    ? productos.filter(p => p.stock_actual <= p.stock_minimo)
    : productos;

  const formatFecha = (ts) => ts
    ? new Date(ts).toLocaleDateString('es-BO', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : '—';

  return (
    <section className="space-y-4">
      {modalAbierto && (
        <ModalProducto
          producto={productoEditar}
          onClose={() => setModalAbierto(false)}
          onGuardado={cargarProductos}
        />
      )}
      {productoEliminar && (
        <ModalConfirmarEliminar
          nombre={productoEliminar.nombre}
          loading={eliminando}
          error={errorEliminar}
          onClose={() => { setProductoEliminar(null); setErrorEliminar(null); }}
          onConfirmar={confirmarEliminar}
        />
      )}

      {/* Alerta stock bajo */}
      {stockBajo.length > 0 && (
        <div className="bg-red-950/40 border border-red-800 rounded-2xl p-4 flex items-start gap-3">
          <span className="text-2xl">⚠️</span>
          <div>
            <p className="text-sm font-bold text-red-300">{stockBajo.length} producto{stockBajo.length > 1 ? 's' : ''} con stock bajo</p>
            <p className="text-xs text-red-400 mt-0.5">
              {stockBajo.map(p => p.nombre).join(', ')}
            </p>
          </div>
        </div>
      )}

      {/* Cabecera */}
      <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6 space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold text-zinc-100">Inventario</h3>
            <p className="text-xs text-zinc-400">Productos y materiales de la barbería.</p>
          </div>
          <button
            onClick={abrirNuevo}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-sm rounded-xl transition-all shadow-lg shadow-amber-500/10"
          >
            + Nuevo Producto
          </button>
        </div>

        {/* Filtros */}
        <div className="flex gap-2">
          <button
            onClick={() => setFiltro('todos')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${filtro === 'todos' ? 'bg-amber-500 text-zinc-950' : 'border border-zinc-700 text-zinc-400 hover:bg-zinc-800'}`}
          >
            Todos ({productos.length})
          </button>
          <button
            onClick={() => setFiltro('stock_bajo')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${filtro === 'stock_bajo' ? 'bg-red-600 text-white' : 'border border-zinc-700 text-zinc-400 hover:bg-zinc-800'}`}
          >
            Stock bajo ({stockBajo.length})
          </button>
        </div>

        {/* Tabla */}
        {cargando ? (
          <p className="text-sm text-zinc-500 animate-pulse">Cargando inventario...</p>
        ) : productosFiltrados.length === 0 ? (
          <p className="text-sm text-zinc-500">No hay productos registrados aún.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-zinc-500 uppercase text-xs tracking-wider border-b border-zinc-800">
                  <th className="py-3 pr-4 font-medium">Producto</th>
                  <th className="py-3 pr-4 font-medium">Categoría</th>
                  <th className="py-3 pr-4 font-medium">Stock</th>
                  <th className="py-3 pr-4 font-medium">Precio</th>
                  <th className="py-3 pr-4 font-medium">Actualizado</th>
                  <th className="py-3 pr-4 font-medium text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {productosFiltrados.map((p) => {
                  const stockBajoItem = p.stock_actual <= p.stock_minimo;
                  return (
                    <tr key={p.id} className="text-zinc-200">
                      <td className="py-3 pr-4 font-medium">{p.nombre}</td>
                      <td className="py-3 pr-4 text-zinc-400 text-xs">{p.categoria || '—'}</td>
                      <td className="py-3 pr-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold ${
                          stockBajoItem
                            ? 'bg-red-950/50 text-red-300 border border-red-800'
                            : 'bg-zinc-800 text-zinc-300'
                        }`}>
                          {stockBajoItem && '⚠️ '}
                          {p.stock_actual} / {p.stock_minimo}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-amber-500 font-semibold">Bs. {Number(p.precio).toFixed(2)}</td>
                      <td className="py-3 pr-4 text-zinc-500 text-xs">{formatFecha(p.ultima_actualizacion)}</td>
                      <td className="py-3 pr-4 text-right space-x-2">
                        <button
                          onClick={() => abrirEditar(p)}
                          className="px-3 py-1.5 text-xs font-medium rounded-lg border border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100 transition-all"
                        >
                          ✏️ Editar
                        </button>
                        <button
                          onClick={() => setProductoEliminar(p)}
                          className="px-3 py-1.5 text-xs font-medium rounded-lg border border-red-900 text-red-400 hover:bg-red-950/30 hover:text-red-300 transition-all"
                        >
                          🗑️ Eliminar
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}