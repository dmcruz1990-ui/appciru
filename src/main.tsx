import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './index.css'

import ClienteLayout from './cliente/ClienteLayout'
import Inicio from './cliente/pages/Inicio'
import Buscar from './cliente/pages/Buscar'
import ProcedimientoDetalle from './cliente/pages/ProcedimientoDetalle'
import MedicoDetalle from './cliente/pages/MedicoDetalle'
import ClinicaDetalle from './cliente/pages/ClinicaDetalle'
import ArmarPlan from './cliente/pages/ArmarPlan'
import Confirmacion from './cliente/pages/Confirmacion'
import MisSolicitudes from './cliente/pages/MisSolicitudes'

import AdminLayout from './admin/AdminLayout'
import Dashboard from './admin/pages/Dashboard'
import Pedidos from './admin/pages/Pedidos'
import PedidoDetalle from './admin/pages/PedidoDetalle'
import Catalogo from './admin/pages/Catalogo'
import Configuracion from './admin/pages/Configuracion'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<ClienteLayout />}>
          <Route index element={<Inicio />} />
          <Route path="buscar" element={<Buscar />} />
          <Route path="procedimiento/:id" element={<ProcedimientoDetalle />} />
          <Route path="medico/:id" element={<MedicoDetalle />} />
          <Route path="clinica/:id" element={<ClinicaDetalle />} />
          <Route path="plan/:ofertaId" element={<ArmarPlan />} />
          <Route path="confirmacion/:pedidoId" element={<Confirmacion />} />
          <Route path="mis-solicitudes" element={<MisSolicitudes />} />
        </Route>
        <Route path="admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="pedidos" element={<Pedidos />} />
          <Route path="pedidos/:id" element={<PedidoDetalle />} />
          <Route path="catalogo" element={<Catalogo />} />
          <Route path="catalogo/:tab" element={<Catalogo />} />
          <Route path="configuracion" element={<Configuracion />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
