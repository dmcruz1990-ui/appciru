import { Link } from 'react-router-dom'

export default function NoEncontrado({ texto = 'No encontramos lo que buscas.' }: { texto?: string }) {
  return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center">
      <p className="text-lg text-slate-600">{texto}</p>
      <Link to="/" className="mt-4 inline-block text-brand-700 hover:underline">
        Volver al inicio
      </Link>
    </div>
  )
}
