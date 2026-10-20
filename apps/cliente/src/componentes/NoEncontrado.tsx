import { Link } from 'react-router-dom'
import { useIdioma } from '../idioma'

export default function NoEncontrado({ texto }: { texto?: string }) {
  const { tx } = useIdioma()
  return (
    <div className="contenedor flex min-h-[70vh] flex-col items-center justify-center pt-24 text-center">
      <h1 className="display normal-case text-5xl md:text-6xl">{texto ?? tx('No encontramos esta página.', 'We couldn’t find this page.')}</h1>
      <Link to="/explorar" className="btn mt-10">
        {tx('Explorar opciones', 'Explore options')}
      </Link>
    </div>
  )
}
