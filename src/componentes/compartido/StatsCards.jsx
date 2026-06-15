import { useState, useEffect } from 'react';
import { supabase } from '../../supabase';

function StatCard({ label, value, color = 'text-zinc-100' }) {
  return (
    <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800">
      <p className="text-sm text-zinc-400 font-medium">{label}</p>
      <p className={`text-4xl font-black mt-2 ${color}`}>{value}</p>
    </div>
  );
}

export default function StatsCards({ rol, usuarioId }) {
  const [stats, setStats] = useState({ citas: 0, barberos: 0, servicios: 0 });

  useEffect(() => {
    const cargar = async () => {
      if (rol === 'Administrador') {
        const hoy = new Date().toISOString().split('T')[0];
        const [{ count: citas }, { count: barberos }, { count: servicios }] = await Promise.all([
          supabase.from('citas').select('*', { count: 'exact', head: true }).gte('fecha_hora', hoy),
          supabase.from('usuarios').select('*', { count: 'exact', head: true }).eq('rol_id', 2),
          supabase.from('citas').select('*', { count: 'exact', head: true }).eq('estado', 'completado').gte('fecha_hora', hoy),
        ]);
        setStats({ citas: citas || 0, barberos: barberos || 0, servicios: servicios || 0 });
      } else if (rol === 'Barbero') {
        const hoy = new Date().toISOString().split('T')[0];
        const { count } = await supabase
          .from('citas')
          .select('*', { count: 'exact', head: true })
          .eq('barbero_id', usuarioId)
          .gte('fecha_hora', hoy);
        setStats({ citas: count || 0 });
      }
    };
    if (usuarioId) cargar();
  }, [rol, usuarioId]);

  if (rol === 'Administrador') return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <StatCard label="Citas Programadas Hoy" value={stats.citas} color="text-amber-500" />
      <StatCard label="Barberos Activos" value={stats.barberos} />
      <StatCard label="Servicios Completados Hoy" value={stats.servicios} />
    </div>
  );

  if (rol === 'Barbero') return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <StatCard label="Mis Citas Hoy" value={stats.citas} color="text-amber-500" />
    </div>
  );

  return null;
}