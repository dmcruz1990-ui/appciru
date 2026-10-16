import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './index.css'
import { CatalogoProvider } from './catalogo'
import Layout from './Layout'
import Inicio from './paginas/Inicio'
import Explorar from './paginas/Explorar'
import ProcedimientoPagina from './paginas/Procedimiento'
import InstitucionPagina from './paginas/Institucion'
import ProfesionalPagina from './paginas/Profesional'
import Solicitar from './paginas/Solicitar'
import Confirmacion from './paginas/Confirmacion'
import Seguimiento from './paginas/Seguimiento'
import ParaClinicas from './paginas/ParaClinicas'
import Privacidad from './paginas/Privacidad'
import NoEncontrado from './componentes/NoEncontrado'
import { capturarUTM } from './utm'

capturarUTM()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <CatalogoProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Inicio />} />
            <Route path="explorar" element={<Explorar />} />
            <Route path="procedimiento/:id" element={<ProcedimientoPagina />} />
            <Route path="institucion/:id" element={<InstitucionPagina />} />
            <Route path="profesional/:id" element={<ProfesionalPagina />} />
            <Route path="solicitar" element={<Solicitar />} />
            <Route path="solicitud-enviada" element={<Confirmacion />} />
            <Route path="seguimiento" element={<Seguimiento />} />
            <Route path="para-clinicas" element={<ParaClinicas />} />
            <Route path="privacidad" element={<Privacidad />} />
            <Route path="*" element={<NoEncontrado />} />
          </Route>
        </Routes>
      </CatalogoProvider>
    </BrowserRouter>
  </StrictMode>,
)
