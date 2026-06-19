import { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import AgendaCitas from './AgendaCitas';
import ModalNuevaCita from './ModalNuevaCita';
import StatsCards from './compartido/StatsCards';
import ProximamentePlaceholder from './compartido/ProximamentePlaceholder';
import GestionServicios from './Servicios/GestionServicios';
import GestionBarberos from './Barberos/GestionBarberos';
import GestionClientes from './Clientes/GestionClientes';
import GestionInventario from './Inventario/GestionInventario';
import GestionFinanzas from './Finanzas/GestionFinanzas';
// ── Menú por rol ──────────────────────────────────────────────
const MENUS = {
  Administrador: [
    { id: 'citas',      icon: '📅', label: 'Citas del Día' },
    { id: 'clientes',   icon: '👤', label: 'Clientes' },
    { id: 'barberos',   icon: '👥', label: 'Barberos' },
    { id: 'servicios',  icon: '✂️',  label: 'Servicios' },
    { id: 'inventario', icon: '📦', label: 'Inventario' },
    { id: 'finanzas',   icon: '💰', label: 'Finanzas' },
    { id: 'reportes',   icon: '📊', label: 'Reportes' },
  ],
  Barbero: [
    { id: 'citas',      icon: '📅', label: 'Mis Citas' },
    { id: 'asistencia', icon: '🕐', label: 'Mi Asistencia' },
    { id: 'comisiones', icon: '💵', label: 'Mis Comisiones' },
  ],
  Cliente: [
    { id: 'citas',      icon: '📅', label: 'Mis Citas' },
    { id: 'reservar',   icon: '➕', label: 'Reservar Cita' },
  ],
};

// ── Router de módulos ─────────────────────────────────────────
function Contenido({ modulo, rol, usuarioId }) {
  const [modalAbierto, setModalAbierto] = useState(false);
  const [refrescar, setRefrescar] = useState(0);

  if (modulo === 'citas') {
    return (
      <>
        {modalAbierto && (
          <ModalNuevaCita
            onClose={() => setModalAbierto(false)}
            onCitaCreada={() => setRefrescar(r => r + 1)}
          />
        )}
        <section className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl font-bold text-zinc-100">
                {rol === 'Cliente' ? 'Mis Citas' : rol === 'Barbero' ? 'Mis Citas del Día' : 'Agenda de Citas'}
              </h3>
              <p className="text-xs text-zinc-400">Sincronizado en tiempo real con la base de datos.</p>
            </div>
            {(rol === 'Administrador' || rol === 'Cliente') && (
              <button
                onClick={() => setModalAbierto(true)}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-sm rounded-xl transition-all shadow-lg shadow-amber-500/10"
              >
                + Nueva Cita
              </button>
            )}
          </div>
          <AgendaCitas key={refrescar} rol={rol} usuarioId={usuarioId} />
        </section>
      </>
    );
  }

  if (modulo === 'servicios' && rol === 'Administrador') {
    return <GestionServicios />;
  }

  if (modulo === 'barberos' && rol === 'Administrador') {
    return <GestionBarberos />;
  }

  if (modulo === 'clientes' && rol === 'Administrador') {
    return <GestionClientes />;
  }

  if (modulo === 'inventario' && rol === 'Administrador') {
    return <GestionInventario />;
  }

  if (modulo === 'finanzas' && rol === 'Administrador') {
    return <GestionFinanzas />;
  }

  const labels = {
    barberos: 'Barberos', servicios: 'Servicios', inventario: 'Inventario',
    finanzas: 'Finanzas', reportes: 'Reportes', asistencia: 'Mi Asistencia',
    comisiones: 'Mis Comisiones', reservar: 'Reservar Cita',
  };

  return <ProximamentePlaceholder modulo={labels[modulo] || modulo} />;
}

// ── Componente principal ──────────────────────────────────────
export default function Dashboard() {
  const [usuario, setUsuario] = useState(null);
  const [rol, setRol] = useState(null);
  const [moduloActivo, setModuloActivo] = useState('citas');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarUsuario = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { window.location.assign('/'); return; }

      const { data: perfil } = await supabase
        .from('usuarios')
        .select('id, nombre, correo, roles(nombre)')
        .eq('auth_id', user.id)
        .single();

      if (perfil) {
        setUsuario(perfil);
        setRol(perfil.roles?.nombre || 'Cliente');
      }
      setLoading(false);
    };
    cargarUsuario();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.assign('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <p className="text-zinc-400 text-sm animate-pulse">Cargando panel...</p>
      </div>
    );
  }

  const menu = MENUS[rol] || MENUS.Cliente;

  return (
    <div className="flex min-h-screen bg-zinc-950 text-zinc-100">
      {/* Sidebar */}
      <aside className="w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col justify-between p-4">
        <div className="space-y-6">
          <div className="px-2 py-4 border-b border-zinc-800">
            <h1 className="text-2xl font-black tracking-wider text-amber-500 font-serif">JOKER</h1>
            <p className="text-[10px] uppercase text-zinc-500 tracking-widest">
              {rol === 'Administrador' ? 'Admin Panel' : rol === 'Barbero' ? 'Panel Barbero' : 'Mi Cuenta'}
            </p>
          </div>
          <nav className="space-y-2">
            {menu.map((item) => (
              <button
                key={item.id}
                onClick={() => setModuloActivo(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium text-left ${
                  moduloActivo === item.id
                    ? 'bg-amber-500 text-zinc-950 font-bold'
                    : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100'
                }`}
              >
                <span>{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>
        </div>
        <div className="space-y-3 border-t border-zinc-800 pt-4">
          <div className="px-2">
            <p className="text-xs text-zinc-500 uppercase tracking-widest">Sesión activa</p>
            <p className="text-sm font-semibold text-zinc-200 truncate mt-1">{usuario?.nombre || usuario?.correo}</p>
            <span className="text-[10px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full border border-zinc-700 uppercase tracking-wider">{rol}</span>
          </div>
          <button onClick={handleLogout} className="w-full text-left px-4 py-3 text-red-400 hover:bg-red-950/20 hover:text-red-300 rounded-xl transition-all font-medium text-sm">
            🚪 Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Contenido principal */}
      <main className="flex-1 p-8 space-y-6 overflow-y-auto">
        <header className="flex justify-between items-center border-b border-zinc-800 pb-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              {menu.find(m => m.id === moduloActivo)?.label || 'Panel'}
            </h2>
            <p className="text-sm text-zinc-400">
              Bienvenido, <span className="text-zinc-200 font-medium">{usuario?.nombre || 'Usuario'}</span>
            </p>
          </div>
          <div className="bg-zinc-900 px-4 py-2 rounded-xl border border-zinc-800 text-sm">
            📍 <span className="text-amber-500 font-medium">Sucre, BO</span>
          </div>
        </header>
        <StatsCards rol={rol} usuarioId={usuario?.id} />
        <Contenido modulo={moduloActivo} rol={rol} usuarioId={usuario?.id} />
      </main>
    </div>
  );
}