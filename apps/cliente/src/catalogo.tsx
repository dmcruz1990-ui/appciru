import { cargarCatalogo, useCarga, type Catalogo } from '@plastinex/shared'
import { createContext, useContext, type ReactNode } from 'react'

const Ctx = createContext<ReturnType<typeof useCarga<Catalogo>> | null>(null)

export function CatalogoProvider({ children }: { children: ReactNode }) {
  const estado = useCarga(cargarCatalogo)
  return <Ctx.Provider value={estado}>{children}</Ctx.Provider>
}

export function useCatalogo() {
  const v = useContext(Ctx)
  if (!v) throw new Error('useCatalogo fuera de CatalogoProvider')
  return v
}
