import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './index.css'
import { CatalogoProvider } from './catalogo'
import { SesionProvider } from './sesion'
import Layout from './Layout'
import Inicio from './paginas/Inicio'
import Explorar from './paginas/Explorar'
import Planear from './paginas/Planear'
import ProcedimientoPagina from './paginas/Procedimiento'
import InstitucionPagina from './paginas/Institucion'
import ProfesionalPagina from './paginas/Profesional'
import Solicitar from './paginas/Solicitar'
import Confirmacion from './paginas/Confirmacion'
import Ingresar from './paginas/Ingresar'
import CompletarPerfil from './paginas/CompletarPerfil'
import NuevaClave from './paginas/NuevaClave'
import Cuenta from './paginas/Cuenta'
import ParaClinicas from './paginas/ParaClinicas'
import Privacidad from './paginas/Privacidad'
import Terminos from './paginas/Terminos'
import NoEncontrado from './componentes/NoEncontrado'
import { capturarUTM } from './utm'

capturarUTM()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <SesionProvider>
        <CatalogoProvider>
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<Inicio />} />
              <Route path="explorar" element={<Explorar />} />
              <Route path="planear" element={<Planear />} />
              <Route path="procedimiento/:id" element={<ProcedimientoPagina />} />
              <Route path="institucion/:id" element={<InstitucionPagina />} />
              <Route path="profesional/:id" element={<ProfesionalPagina />} />
              <Route path="solicitar" element={<Solicitar />} />
              <Route path="solicitud-enviada" element={<Confirmacion />} />
              <Route path="ingresar" element={<Ingresar />} />
              <Route path="cuenta" element={<Cuenta />} />
              <Route path="cuenta/completar" element={<CompletarPerfil />} />
              <Route path="cuenta/nueva-clave" element={<NuevaClave />} />
              <Route path="para-clinicas" element={<ParaClinicas />} />
              <Route path="privacidad" element={<Privacidad />} />
              <Route path="terminos" element={<Terminos />} />
              <Route path="*" element={<NoEncontrado />} />
            </Route>
          </Routes>
        </CatalogoProvider>
      </SesionProvider>
    </BrowserRouter>
  </StrictMode>,
)
