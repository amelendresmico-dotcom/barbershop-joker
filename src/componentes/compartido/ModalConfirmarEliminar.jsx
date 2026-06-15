export default function ModalConfirmarEliminar({ mensaje, onConfirmar, onCancelar }) {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4 text-center">
        <div className="text-4xl">⚠️</div>
        <p className="text-zinc-100 font-semibold">¿Confirmar eliminación?</p>
        <p className="text-zinc-400 text-sm">{mensaje || 'Esta acción no se puede deshacer.'}</p>
        <div className="flex gap-3 pt-2">
          <button
            onClick={onCancelar}
            className="flex-1 py-3 text-sm font-medium rounded-xl border border-zinc-700 text-zinc-400 hover:bg-zinc-800 transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirmar}
            className="flex-1 py-3 text-sm font-bold rounded-xl bg-red-600 hover:bg-red-500 text-white transition-all"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}