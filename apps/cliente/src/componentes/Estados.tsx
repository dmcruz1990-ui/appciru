export function Cargando() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center text-sm text-piedra">
      <span className="mr-3 h-4 w-4 animate-spin rounded-full border-2 border-oro border-t-transparent" />
      Cargando…
    </div>
  )
}

export function ErrorCarga({ mensaje, reintentar }: { mensaje: string; reintentar?: () => void }) {
  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center">
      <h2 className="titulo text-2xl">No pudimos cargar la información</h2>
      <p className="mt-2 text-sm text-piedra">{mensaje}</p>
      {reintentar && (
        <button onClick={reintentar} className="btn-tinta mt-6">
          Reintentar
        </button>
      )}
    </div>
  )
}
