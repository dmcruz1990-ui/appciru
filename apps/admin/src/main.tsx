import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import './index.css'
import { SesionProvider, useSesion } from './sesion'
import { DatosProvider } from './datos'
import Layout from './Layout'
import Ingreso, { Pendiente } from './paginas/Ingreso'
import Resumen from './paginas/Resumen'
import Solicitudes from './paginas/Solicitudes'
import SolicitudDetalle from './paginas/SolicitudDetalle'
import Catalogo from './paginas/Catalogo'
import Verificacion from './paginas/Verificacion'
import Registros from './paginas/Registros'
import Clientes from './paginas/Clientes'
import Usuarios from './paginas/Usuarios'

function App() {
  const { sesion, perfil, cargando, esAdmin } = useSesion()
  if (cargando) return <div className="p-10 text-sm text-stone-500">Cargando…</div>
  if (!sesion) return <Ingreso />
  if (!perfil) return <div className="p-10 text-sm text-stone-500">Cargando perfil…</div>
  if (perfil.rol === 'pendiente') return <Pendiente />

  return (
    <DatosProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Resumen />} />
          <Route path="solicitudes" element={<Solicitudes />} />
          <Route path="solicitudes/:id" element={<SolicitudDetalle />} />
          <Route path="catalogo" element={<Navigate to="/catalogo/ofertas" replace />} />
          <Route path="catalogo/:tab" element={<Catalogo />} />
          <Route path="registros" element={<Registros />} />
          <Route path="verificacion" element={<Verificacion />} />
          {esAdmin && <Route path="clientes" element={<Clientes />} />}
          {esAdmin && <Route path="usuarios" element={<Usuarios />} />}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </DatosProvider>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <SesionProvider>
        <App />
      </SesionProvider>
    </BrowserRouter>
  </StrictMode>,
)
