import {
  EMPRESA,
  estadosPostulacion,
  miPostulacion,
  PAISES,
  postular,
  supabase,
  type NuevaPostulacion,
  type Postulacion,
  type TipoInstitucion,
} from '@plastinex/shared'
import { Check } from 'lucide-react'
import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useCatalogo } from '../catalogo'
import { useIdioma } from '../idioma'
import { useSesion } from '../sesion'

/** Panel donde la clínica aprobada atiende sus solicitudes (mismo usuario y contraseña). */
const urlPanel = (import.meta.env.VITE_URL_ADMIN as string | undefined) ?? 'https://plastinex-admin.vercel.app'

const LENGUAS = ['Español', 'Inglés', 'Portugués', 'Francés', 'Alemán', 'Italiano', 'Árabe', 'Turco', 'Coreano', 'Japonés', 'Chino']

const vacio: NuevaPostulacion = {
  nombre: '',
  telefono: '',
  especialidad: 'Cirugía plástica, estética y reconstructiva',
  registro_profesional: '',
  autoridad_registro: '',
  sociedad: '',
  bio: '',
  pais: 'CO',
  ciudad_id: '',
  ciudad_otra: '',
  institucion_nombre: '',
  institucion_tipo: 'clinica',
  institucion_registro: '',
  sitio_web: '',
  idiomas: ['Español'],
  procedimientos: [],
  valoracion_virtual: false,
  declara: false,
}

/**
 * Registro de cirujanos y clínicas (dentro de «Para clínicas»): cuenta, perfil profesional y estado de la revisión.
 * Nada se publica hasta que PLASTINEX verifica el registro profesional y la habilitación de la clínica.
 */
export default function RegistroMedico() {
  const { sesion, cargando } = useSesion()
  const { tx } = useIdioma()
  const [postulacion, setPostulacion] = useState<Postulacion | null | undefined>(undefined)
  const [editando, setEditando] = useState(false)

  useEffect(() => {
    if (!sesion) return setPostulacion(undefined)
    let vivo = true
    miPostulacion()
      .then((p) => vivo && setPostulacion(p))
      .catch(() => vivo && setPostulacion(null))
    return () => {
      vivo = false
    }
  }, [sesion])

  const pasos: [string, string][] = [
    [tx('Crea tu cuenta', 'Create your account'), tx('Con tu correo profesional.', 'With your professional email.')],
    [tx('Completa tu perfil', 'Complete your profile'), tx('Registro profesional, clínica y procedimientos.', 'License, clinic and procedures.')],
    [tx('Verificamos', 'We verify'), tx('Revisamos tus registros antes de publicar.', 'We check your credentials before publishing.')],
    [tx('Recibe solicitudes', 'Receive requests'), tx('Las atiendes desde tu panel.', 'You handle them from your dashboard.')],
  ]
  const paso = !sesion ? 0 : !postulacion || editando ? 1 : postulacion.estado === 'aprobada' ? 3 : 2

  return (
    <>
      <section className="bg-espresso text-marfil">
        <div className="contenedor pt-48 pb-16">
          <Link to="/para-clinicas" className="rotulo !text-marfil/50 hover:!text-marfil">
            {tx('Para clínicas y cirujanos', 'For clinics and surgeons')} · {tx('Registro', 'Registration')}
          </Link>
          <h1 className="display mt-6 max-w-4xl text-4xl md:text-5xl">
            {tx(
              <>
                Regístrate y llega más lejos <em>con tus leads.</em>
              </>,
              <>
                Sign up and take your leads <em>further.</em>
              </>,
            )}
          </h1>
          <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-marfil/70">
            {tx(
              'Para cirujanos plásticos con registro vigente y clínicas habilitadas, en cualquier país. Tu perfil se publica solo después de verificar tus documentos.',
              'For plastic surgeons with a current license and accredited clinics, in any country. Your profile is published only after we verify your documents.',
            )}
          </p>
          <ol className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {pasos.map(([t, d], i) => (
              <li key={t} className={`border-t pt-4 ${i <= paso ? 'border-marfil' : 'border-marfil/20 text-marfil/40'}`}>
                <span className="flex items-center gap-2 text-[11px] font-medium tracking-[0.2em] uppercase">
                  {i < paso ? <Check size={14} strokeWidth={2} /> : <span>{String(i + 1).padStart(2, '0')}</span>} {t}
                </span>
                <span className="mt-2 block text-[13px] text-current opacity-70">{d}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <div className="contenedor py-20">
        <div className="mx-auto max-w-3xl">
          {cargando || (sesion && postulacion === undefined) ? (
            <p className="text-sm text-piedra">{tx('Cargando…', 'Loading…')}</p>
          ) : !sesion ? (
            <CuentaMedico />
          ) : postulacion && !editando ? (
            <Estado p={postulacion} onEditar={() => setEditando(true)} />
          ) : (
            <Formulario
              inicial={postulacion}
              email={sesion.user.email ?? ''}
              onEnviado={(p) => {
                setPostulacion(p)
                setEditando(false)
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
            />
          )}
        </div>
      </div>
    </>
  )
}

/** Crear cuenta o ingresar sin salir del registro. */
function CuentaMedico() {
  const { tx } = useIdioma()
  const [modo, setModo] = useState<'registro' | 'entrar'>('registro')
  const [email, setEmail] = useState('')
  const [clave, setClave] = useState('')
  const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null)
  const [enviando, setEnviando] = useState(false)

  const enviar = async (e: FormEvent) => {
    e.preventDefault()
    setMsg(null)
    setEnviando(true)
    try {
      if (modo === 'entrar') {
        const { error } = await supabase.auth.signInWithPassword({ email, password: clave })
        if (error) throw new Error(error.message === 'Invalid login credentials' ? tx('Correo o contraseña incorrectos.', 'Incorrect email or password.') : error.message)
      } else {
        const { data, error } = await supabase.auth.signUp({ email, password: clave, options: { emailRedirectTo: `${window.location.origin}/para-clinicas/registro` } })
        if (error) throw error
        if (!data.session)
          setMsg({
            ok: true,
            t: tx('Te enviamos un correo para confirmar tu cuenta. Ábrelo y continúa el registro desde ese enlace.', 'We sent you an email to confirm your account. Open it and continue your registration from that link.'),
          })
      }
    } catch (err) {
      setMsg({ ok: false, t: err instanceof Error ? err.message : String(err) })
    } finally {
      setEnviando(false)
    }
  }

  return (
    <form onSubmit={enviar} className="border border-linea p-8 md:p-12">
      <div className="rotulo">{tx('Paso 1', 'Step 1')}</div>
      <h2 className="display mt-3 text-3xl">{modo === 'registro' ? tx('Crea tu cuenta profesional', 'Create your professional account') : tx('Ingresa para continuar', 'Sign in to continue')}</h2>
      <p className="mt-3 text-sm text-piedra">
        {tx(
          'Usarás este mismo correo y contraseña para entrar a tu panel cuando tu registro sea aprobado.',
          'You will use this same email and password to access your dashboard once your registration is approved.',
        )}
      </p>
      <div className="mt-10 grid gap-8 sm:grid-cols-2">
        <label>
          <span className="etiqueta">{tx('Correo', 'Email')}</span>
          <input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="campo" />
        </label>
        <label>
          <span className="etiqueta">{tx('Contraseña', 'Password')}</span>
          <input
            type="password"
            required
            minLength={8}
            autoComplete={modo === 'registro' ? 'new-password' : 'current-password'}
            value={clave}
            onChange={(e) => setClave(e.target.value)}
            className="campo"
          />
        </label>
      </div>
      {msg && <p className={`mt-6 text-sm ${msg.ok ? 'text-espresso' : 'text-red-800'}`}>{msg.t}</p>}
      <div className="mt-10 flex flex-wrap items-center justify-between gap-4">
        <button type="button" onClick={() => (setModo(modo === 'registro' ? 'entrar' : 'registro'), setMsg(null))} className="enlace text-sm text-piedra">
          {modo === 'registro' ? tx('Ya tengo cuenta', 'I already have an account') : tx('Crear una cuenta nueva', 'Create a new account')}
        </button>
        <button disabled={enviando} className="btn">
          {enviando ? tx('Un momento…', 'One moment…') : modo === 'registro' ? tx('Crear cuenta', 'Create account') : tx('Ingresar', 'Sign in')}
        </button>
      </div>
    </form>
  )
}

function Formulario({ inicial, email, onEnviado }: { inicial: Postulacion | null | undefined; email: string; onEnviado: (p: Postulacion) => void }) {
  const { datos } = useCatalogo()
  const { tx, loc, lengua, pais: nombrePais, ciudad: nombreCiudad, tipoInstitucion } = useIdioma()
  const [f, setF] = useState<NuevaPostulacion>(() =>
    inicial
      ? {
          ...vacio,
          ...Object.fromEntries(Object.entries(inicial).filter(([, v]) => v != null)),
          anios_experiencia: inicial.anios_experiencia ?? undefined,
          ciudad_id: inicial.ciudad_id ?? (inicial.ciudad_otra ? 'otra' : ''),
          declara: false,
        }
      : vacio,
  )
  const [error, setError] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)
  const set = <K extends keyof NuevaPostulacion>(k: K, v: NuevaPostulacion[K]) => setF((x) => ({ ...x, [k]: v }))
  const alternar = (k: 'idiomas' | 'procedimientos', v: string) => set(k, f[k].includes(v) ? f[k].filter((x) => x !== v) : [...f[k], v])

  const paises = useMemo(() => Object.keys(PAISES).sort((a, b) => nombrePais(a).localeCompare(nombrePais(b))), [nombrePais])
  const ciudades = (datos?.ciudades ?? []).filter((c) => c.pais === f.pais)

  const enviar = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setEnviando(true)
    try {
      const otra = f.ciudad_id === 'otra'
      onEnviado(
        await postular({
          ...f,
          ciudad_id: otra ? undefined : f.ciudad_id || undefined,
          ciudad_otra: otra ? f.ciudad_otra : undefined,
          anios_experiencia: f.anios_experiencia || undefined,
        }),
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setEnviando(false)
    }
  }

  return (
    <form onSubmit={enviar} className="space-y-16">
      {inicial?.estado === 'rechazada' && inicial.motivo && (
        <p className="border-l-2 border-arcilla pl-5 text-sm text-piedra">
          <b className="text-espresso">{tx('Lo que debes corregir:', 'What you need to fix:')}</b> {inicial.motivo}
        </p>
      )}

      <Bloque n="01" t={tx('Tus datos', 'Your details')}>
        <div className="grid gap-8 sm:grid-cols-2">
          <label className="sm:col-span-2">
            <span className="etiqueta">{tx('Nombre completo, como figura en tu registro', 'Full name, as it appears on your license')}</span>
            <input required minLength={3} maxLength={120} autoComplete="name" value={f.nombre} onChange={(e) => set('nombre', e.target.value)} className="campo" />
          </label>
          <label>
            <span className="etiqueta">{tx('Teléfono / WhatsApp', 'Phone / WhatsApp')}</span>
            <input required minLength={7} maxLength={30} autoComplete="tel" value={f.telefono} onChange={(e) => set('telefono', e.target.value)} className="campo" />
          </label>
          <label>
            <span className="etiqueta">{tx('Correo de la cuenta', 'Account email')}</span>
            <input value={email} readOnly className="campo text-piedra" />
          </label>
        </div>
      </Bloque>

      <Bloque n="02" t={tx('Formación y registro', 'Training and license')}>
        <div className="grid gap-8 sm:grid-cols-2">
          <label className="sm:col-span-2">
            <span className="etiqueta">{tx('Especialidad', 'Specialty')}</span>
            <input required maxLength={120} value={f.especialidad} onChange={(e) => set('especialidad', e.target.value)} className="campo" />
          </label>
          <label>
            <span className="etiqueta">{tx('Número de registro o licencia', 'License or registration number')}</span>
            <input required minLength={3} maxLength={60} value={f.registro_profesional} onChange={(e) => set('registro_profesional', e.target.value)} className="campo" />
          </label>
          <label>
            <span className="etiqueta">{tx('Entidad que lo emite', 'Issuing authority')}</span>
            <input maxLength={120} placeholder={tx('ReTHUS, Medical Board, Colegio…', 'ReTHUS, Medical Board, College…')} value={f.autoridad_registro} onChange={(e) => set('autoridad_registro', e.target.value)} className="campo" />
          </label>
          <label>
            <span className="etiqueta">{tx('Sociedad científica (opcional)', 'Scientific society (optional)')}</span>
            <input maxLength={120} placeholder="SCCP, ASPS, ISAPS…" value={f.sociedad} onChange={(e) => set('sociedad', e.target.value)} className="campo" />
          </label>
          <label>
            <span className="etiqueta">{tx('Años de experiencia', 'Years of experience')}</span>
            <input type="number" min={0} max={60} value={f.anios_experiencia ?? ''} onChange={(e) => set('anios_experiencia', e.target.value ? Number(e.target.value) : undefined)} className="campo" />
          </label>
        </div>
        <div className="mt-8">
          <span className="etiqueta">{tx('Idiomas en los que atiendes', 'Languages you consult in')}</span>
          <Chips opciones={LENGUAS.map((l) => [l, lengua(l)])} elegidas={f.idiomas} onAlternar={(v) => alternar('idiomas', v)} />
        </div>
      </Bloque>

      <Bloque n="03" t={tx('Dónde atiendes', 'Where you operate')}>
        <div className="grid gap-8 sm:grid-cols-2">
          <label>
            <span className="etiqueta">{tx('País', 'Country')}</span>
            <select value={f.pais} onChange={(e) => (set('pais', e.target.value), set('ciudad_id', ''))} className="campo">
              {paises.map((p) => (
                <option key={p} value={p}>
                  {nombrePais(p)}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="etiqueta">{tx('Ciudad', 'City')}</span>
            <select required value={f.ciudad_id} onChange={(e) => set('ciudad_id', e.target.value)} className="campo">
              <option value="">{tx('Elige una ciudad', 'Choose a city')}</option>
              {ciudades.map((c) => (
                <option key={c.id} value={c.id}>
                  {nombreCiudad(c)}
                </option>
              ))}
              <option value="otra">{tx('Otra ciudad', 'Another city')}</option>
            </select>
          </label>
          {f.ciudad_id === 'otra' && (
            <label className="sm:col-span-2">
              <span className="etiqueta">{tx('Nombre de la ciudad', 'City name')}</span>
              <input required maxLength={80} value={f.ciudad_otra} onChange={(e) => set('ciudad_otra', e.target.value)} className="campo" />
            </label>
          )}
          <label>
            <span className="etiqueta">{tx('Clínica o consultorio', 'Clinic or practice')}</span>
            <input required minLength={3} maxLength={120} value={f.institucion_nombre} onChange={(e) => set('institucion_nombre', e.target.value)} className="campo" />
          </label>
          <label>
            <span className="etiqueta">{tx('Tipo', 'Type')}</span>
            <select value={f.institucion_tipo} onChange={(e) => set('institucion_tipo', e.target.value as TipoInstitucion)} className="campo">
              {(['clinica', 'institucion', 'consultorio'] as TipoInstitucion[]).map((t) => (
                <option key={t} value={t}>
                  {tipoInstitucion(t)}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="etiqueta">{tx('Habilitación sanitaria (REPS u otra)', 'Health facility license (REPS or other)')}</span>
            <input maxLength={60} value={f.institucion_registro} onChange={(e) => set('institucion_registro', e.target.value)} className="campo" />
          </label>
          <label>
            <span className="etiqueta">{tx('Sitio web (opcional)', 'Website (optional)')}</span>
            <input type="url" maxLength={200} placeholder="https://" value={f.sitio_web} onChange={(e) => set('sitio_web', e.target.value)} className="campo" />
          </label>
        </div>
      </Bloque>

      <Bloque n="04" t={tx('Qué ofreces', 'What you offer')}>
        <span className="etiqueta">{tx('Procedimientos que realizas', 'Procedures you perform')}</span>
        <Chips opciones={(datos?.procedimientos ?? []).map((p) => [p.id, loc(p, 'nombre')])} elegidas={f.procedimientos} onAlternar={(v) => alternar('procedimientos', v)} />
        <label className="mt-8 flex cursor-pointer items-center gap-3 text-sm">
          <input type="checkbox" checked={f.valoracion_virtual} onChange={(e) => set('valoracion_virtual', e.target.checked)} className="accent-espresso" />
          {tx('Ofrezco valoración virtual para pacientes del exterior', 'I offer virtual consultations for international patients')}
        </label>
        <label className="mt-8 block">
          <span className="etiqueta">{tx('Presentación para los pacientes (opcional)', 'Introduction for patients (optional)')}</span>
          <textarea maxLength={1500} rows={5} value={f.bio} onChange={(e) => set('bio', e.target.value)} className="campo resize-y" />
        </label>
        <p className="mt-3 text-xs text-niebla">{tx('Los precios y fotos se agregan con el equipo de PLASTINEX después de la verificación.', 'Prices and photos are added with the PLASTINEX team after verification.')}</p>
      </Bloque>

      <div className="border-y border-linea py-8">
        <label className="flex cursor-pointer gap-4">
          <input type="checkbox" required checked={f.declara} onChange={(e) => set('declara', e.target.checked)} className="mt-1 accent-espresso" />
          <span className="text-sm leading-relaxed text-piedra">
            {tx(
              <>
                Declaro que la información es verídica, que tengo título y registro vigentes para ejercer la cirugía plástica en mi país y que la
                clínica está habilitada por la autoridad sanitaria. Autorizo a {EMPRESA.razonSocial} a verificar estos datos y acepto los{' '}
                <Link to="/terminos" target="_blank" className="enlace">
                  términos
                </Link>{' '}
                y el{' '}
                <Link to="/privacidad" target="_blank" className="enlace">
                  aviso de privacidad
                </Link>
                . Entiendo que el perfil se publica solo después de la verificación.
              </>,
              <>
                I declare that this information is true, that I hold a current degree and license to practice plastic surgery in my country, and that
                the clinic is licensed by the health authority. I authorize {EMPRESA.razonSocial} to verify this information and accept the{' '}
                <Link to="/terminos" target="_blank" className="enlace">
                  terms
                </Link>{' '}
                and the{' '}
                <Link to="/privacidad" target="_blank" className="enlace">
                  privacy notice
                </Link>
                . I understand the profile is published only after verification.
              </>,
            )}
          </span>
        </label>
      </div>

      {error && <p className="text-sm text-red-800">{error}</p>}
      <div className="flex justify-end">
        <button disabled={enviando || !f.declara} className="btn">
          {enviando ? tx('Enviando…', 'Sending…') : inicial ? tx('Enviar de nuevo', 'Resubmit') : tx('Enviar registro', 'Submit registration')}
        </button>
      </div>
    </form>
  )
}

function Estado({ p, onEditar }: { p: Postulacion; onEditar: () => void }) {
  const { tx, fecha, pais: nombrePais, ciudadDe, idioma } = useIdioma()
  const e = estadosPostulacion[p.estado]
  const texto: Record<Postulacion['estado'], string> = {
    nueva: tx('Recibimos tu registro. Un coordinador lo revisará y te escribirá si necesita algún documento.', 'We received your registration. A coordinator will review it and contact you if any document is needed.'),
    en_revision: tx('Estamos verificando tu registro profesional y la habilitación de tu clínica.', 'We are verifying your professional license and your clinic’s accreditation.'),
    aprobada: tx(
      'Tu registro fue aprobado. Ya puedes entrar al panel con este mismo correo y contraseña para atender tus solicitudes. Publicaremos tu perfil cuando completemos precios y fotos contigo.',
      'Your registration was approved. You can now sign in to the dashboard with this same email and password to handle your requests. We will publish your profile once we complete prices and photos with you.',
    ),
    rechazada: tx('Tu registro necesita cambios antes de continuar.', 'Your registration needs changes before we can continue.'),
  }
  return (
    <div className="border border-linea p-8 md:p-12">
      <div className="rotulo">{tx('Estado de tu registro', 'Registration status')}</div>
      <h2 className="display mt-3 text-3xl">{idioma === 'en' ? e.en : e.es}</h2>
      <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-piedra">{texto[p.estado]}</p>
      {p.estado === 'rechazada' && p.motivo && <p className="mt-4 border-l-2 border-arcilla pl-5 text-sm">{p.motivo}</p>}

      <dl className="mt-10 grid gap-x-8 gap-y-5 border-t border-linea pt-8 text-sm sm:grid-cols-2">
        {[
          [tx('Profesional', 'Professional'), p.nombre],
          [tx('Registro', 'License'), [p.registro_profesional, p.autoridad_registro].filter(Boolean).join(' · ')],
          [tx('Clínica', 'Clinic'), p.institucion_nombre],
          [tx('Ubicación', 'Location'), `${p.ciudad_id ? ciudadDe(p.ciudad_id) : p.ciudad_otra}, ${nombrePais(p.pais)}`],
          [tx('Enviado', 'Submitted'), fecha(p.actualizado_en)],
        ].map(([t, v]) => (
          <div key={t}>
            <dt className="etiqueta">{t}</dt>
            <dd className="mt-1">{v}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-10 flex flex-wrap gap-4">
        {p.estado === 'aprobada' ? (
          <a href={urlPanel} className="btn">
            {tx('Ir a mi panel', 'Go to my dashboard')}
          </a>
        ) : (
          (p.estado === 'nueva' || p.estado === 'rechazada') && (
            <button onClick={onEditar} className="btn-linea">
              {p.estado === 'rechazada' ? tx('Corregir y enviar de nuevo', 'Fix and resubmit') : tx('Editar mis datos', 'Edit my details')}
            </button>
          )
        )}
      </div>
    </div>
  )
}

function Bloque({ n, t, children }: { n: string; t: string; children: ReactNode }) {
  return (
    <section>
      <div className="flex items-baseline gap-4 border-b border-espresso pb-3">
        <span className="font-serif text-lg text-arcilla">{n}</span>
        <h2 className="text-[13px] font-medium tracking-[0.2em] uppercase">{t}</h2>
      </div>
      <div className="mt-8">{children}</div>
    </section>
  )
}

function Chips({ opciones, elegidas, onAlternar }: { opciones: [string, string][]; elegidas: string[]; onAlternar: (v: string) => void }) {
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {opciones.map(([v, t]) => {
        const on = elegidas.includes(v)
        return (
          <button
            key={v}
            type="button"
            aria-pressed={on}
            onClick={() => onAlternar(v)}
            className={`border px-3.5 py-1.5 text-xs transition ${on ? 'border-espresso bg-espresso text-marfil' : 'border-linea text-piedra hover:border-espresso'}`}
          >
            {t}
          </button>
        )
      })}
    </div>
  )
}
