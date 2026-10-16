import { Link } from 'react-router-dom'

export default function NoEncontrado({ texto = 'No encontramos esta página.' }: { texto?: string }) {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <h1 className="titulo text-3xl">{texto}</h1>
      <Link to="/explorar" className="btn-tinta mt-6">
        Explorar opciones
      </Link>
    </div>
  )
}
