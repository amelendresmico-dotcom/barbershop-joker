export default function ModalConfirmarEliminar({ nombre, loading, error, onClose, onConfirmar }) {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl w-full max-w-sm">
        <div className="p-6 space-y-4">
          <div>
            <h3 className="text-lg font-bold text-zinc-100">¿Desactivar barbero?</h3>
            <p className="text-sm text-zinc-400 mt-1">
              El barbero <span className="text-zinc-200 font-semibold">{nombre}</span> quedará inactivo y no podrá acceder al sistema.
            </p>
          </div>
          {error && (
            <div className="bg-red-900/30 border border-red-500 text-red-200 p-3 rounded-xl text-sm text-center">{error}</div>
          )}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 px-4 text-sm font-medium rounded-xl border border-zinc-700 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 transition-all"
            >Cancelar</button>
            <button
              onClick={onConfirmar}
              disabled={loading}
              className="flex-1 py-3 px-4 text-sm font-bold rounded-xl bg-red-600 hover:bg-red-500 text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Desactivando...' : 'Desactivar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}