import { Link } from 'react-router-dom'

export default function NoEncontrado({ texto = 'No encontramos esta página.' }: { texto?: string }) {
  return (
    <div className="contenedor flex min-h-[70vh] flex-col items-center justify-center pt-24 text-center">
      <h1 className="display text-5xl md:text-6xl">{texto}</h1>
      <Link to="/explorar" className="btn mt-10">
        Explorar opciones
      </Link>
    </div>
  )
}
