export default function ProximamentePlaceholder({ modulo }) {
  return (
    <div className="flex flex-col items-center justify-center h-64 text-center space-y-3 text-zinc-500">
      <div className="text-5xl opacity-30">🚧</div>
      <p className="text-lg font-semibold text-zinc-400">Módulo en desarrollo</p>
      <p className="text-sm">
        La sección <span className="text-amber-500 font-medium">{modulo}</span> estará disponible próximamente.
      </p>
    </div>
  );
}