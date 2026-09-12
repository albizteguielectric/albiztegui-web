'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'
import Image from 'next/image'
import React from 'react'

interface ImagenCarrusel {
  id: number;
  imagen_url: string;
  orden: number;
  activa: boolean;
}

interface MensajeContacto {
  id: number;
  nombre: string;
  telefono: string;
  mensaje: string;
  leido: boolean;
  created_at: string;
}

// 1. NUEVA INTERFAZ DE MARCA
interface Marca {
  id: number;
  nombre: string;
  logo_url: string;
  sitio_web: string;
}

export default function Dashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('carrusel')

  // ESTADOS EXISTENTES
  const [imagenes, setImagenes] = useState<ImagenCarrusel[]>([])
  const [nuevaImagen, setNuevaImagen] = useState('')
  const [mensajes, setMensajes] = useState<MensajeContacto[]>([])

  // 2. NUEVOS ESTADOS PARA MARCAS
  const [marcas, setMarcas] = useState<Marca[]>([])
  const [nombreMarca, setNombreMarca] = useState('')
  const [archivoLogo, setArchivoLogo] = useState<File | null>(null)
  const [sitioWebMarca, setSitioWebMarca] = useState('')
  const [subiendoMarca, setSubiendoMarca] = useState(false)

  const [alerta, setAlerta] = useState({ mostrar: false, mensaje: '', tipo: 'exito' })
  const [modal, setModal] = useState({ mostrar: false, id: 0, tipo: '' })

  const mostrarAlerta = (mensaje: string, tipo: 'exito' | 'error') => {
    setAlerta({ mostrar: true, mensaje, tipo })
    setTimeout(() => setAlerta({ mostrar: false, mensaje: '', tipo: 'exito' }), 4000)
  }

  const cargarImagenes = async () => {
    const { data } = await supabase.from('carrusel_inicio').select('*').order('orden', { ascending: true })
    if (data) setImagenes(data)
  }

  const cargarMensajes = async () => {
    const { data } = await supabase.from('buzon_contacto').select('*').order('created_at', { ascending: false })
    if (data) setMensajes(data)
  }

  // 3. FUNCIÓN DE CARGA DE MARCAS
  const cargarMarcas = async () => {
    const { data } = await supabase.from('marcas').select('*').order('id', { ascending: false })
    if (data) setMarcas(data)
  }

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/admin')
      } else {
        setLoading(false)
        cargarImagenes()
        cargarMensajes()
        cargarMarcas()
      }
    }
    checkUser()
  }, [router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/admin')
  }

  const agregarImagen = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nuevaImagen) return
    const { error } = await supabase.from('carrusel_inicio').insert([{ imagen_url: nuevaImagen, orden: imagenes.length + 1 }])
    if (!error) {
      setNuevaImagen('') 
      cargarImagenes()
      mostrarAlerta('Imagen agregada exitosamente.', 'exito')
    } else {
      mostrarAlerta('Error al guardar la imagen.', 'error')
    }
  }

  // 4. SUBIDA DE MARCA A SUPABASE STORAGE Y TABLA (SIN TIPOS ANY)
const agregarMarca = async (e: React.FormEvent) => {
  e.preventDefault()
  if (!nombreMarca || !archivoLogo || !sitioWebMarca) {
    mostrarAlerta('Por favor completa todos los campos de la marca.', 'error')
    return
  }

  setSubiendoMarca(true)

  try {
    const fileExt = archivoLogo.name.split('.').pop()
    const fileName = `${Date.now()}.${fileExt}`
    const filePath = `logos/${fileName}`

    // Subida al Bucket 'marcas-logos'
    const { error: uploadError } = await supabase.storage
      .from('marcas-logos')
      .upload(filePath, archivoLogo, { cacheControl: '3600', upsert: false })

    if (uploadError) throw uploadError

    const { data: publicUrlData } = supabase.storage
      .from('marcas-logos')
      .getPublicUrl(filePath)

    const logoPublicUrl = publicUrlData.publicUrl

    const { error: insertError } = await supabase.from('marcas').insert([
      { 
        nombre: nombreMarca, 
        logo_url: logoPublicUrl, 
        sitio_web: sitioWebMarca 
      }
    ])

    if (insertError) throw insertError

    setNombreMarca('')
    setSitioWebMarca('')
    setArchivoLogo(null)

    const fileInput = document.getElementById('logoInputDashboard') as HTMLInputElement
    if (fileInput) fileInput.value = ''

    cargarMarcas()
    mostrarAlerta('Marca agregada exitosamente.', 'exito')

  } catch (err: unknown) {
    // Manejo estricto de errores para evitar la regla 'no-explicit-any'
    const mensajeError = err instanceof Error ? err.message : 'Error al agregar la marca'
    mostrarAlerta(mensajeError, 'error')
  } finally {
    setSubiendoMarca(false)
  }
}

  const alternarLeido = async (id: number, estadoActual: boolean) => {
    const { error } = await supabase.from('buzon_contacto').update({ leido: !estadoActual }).eq('id', id)
    if (!error) cargarMensajes()
  }

  // 5. ELIMINACIÓN AMPLIADA PARA CUBRIR MARCAS
  const ejecutarEliminacion = async () => {
    if (modal.tipo === 'imagen') {
      const { error } = await supabase.from('carrusel_inicio').delete().eq('id', modal.id)
      if (!error) {
        cargarImagenes()
        mostrarAlerta('Imagen eliminada.', 'exito')
      }
    } else if (modal.tipo === 'mensaje') {
      const { error } = await supabase.from('buzon_contacto').delete().eq('id', modal.id)
      if (!error) {
        cargarMensajes()
        mostrarAlerta('Mensaje eliminado.', 'exito')
      }
    } else if (modal.tipo === 'marca') {
      const { error } = await supabase.from('marcas').delete().eq('id', modal.id)
      if (!error) {
        cargarMarcas()
        mostrarAlerta('Marca eliminada.', 'exito')
      }
    }
    setModal({ mostrar: false, id: 0, tipo: '' })
  }

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <p className="text-xl font-bold text-blue-900 animate-pulse">Cargando panel...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row border-t border-gray-200 relative">
      
      {/* NOTIFICACIÓN FLOTANTE */}
      <div className={`fixed top-6 right-6 z-50 px-6 py-4 rounded-xl shadow-2xl font-bold text-white flex items-center gap-3 transition-all transform duration-500 ${alerta.mostrar ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0 pointer-events-none'} ${alerta.tipo === 'exito' ? 'bg-green-500' : 'bg-red-500'}`}>
        <span>{alerta.mensaje}</span>
      </div>

      {/* MODAL DE CONFIRMACIÓN */}
      {modal.mostrar && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity">
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-2xl max-w-sm w-full mx-4 border-t-4 border-red-500 transform transition-all">
            <h3 className="text-2xl font-extrabold text-blue-900 mb-3">¿Estás seguro?</h3>
            <p className="text-gray-600 mb-8 font-medium">
              Esta acción eliminará definitivamente {
                modal.tipo === 'imagen' ? 'esta imagen del carrusel' : 
                modal.tipo === 'mensaje' ? 'este mensaje' : 'esta marca comercial'
              }. No podrás recuperar la información.
            </p>
            <div className="flex justify-end gap-4">
              <button 
                onClick={() => setModal({ mostrar: false, id: 0, tipo: '' })}
                className="px-5 py-2 text-gray-500 font-bold hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={ejecutarEliminacion}
                className="px-5 py-2 bg-red-500 text-white font-bold hover:bg-red-600 rounded-lg shadow-md transition-colors"
              >
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MENÚ LATERAL */}
      <aside className="w-full md:w-64 bg-blue-950 text-white flex flex-col shadow-lg z-10">
        <div className="p-6 border-b border-blue-900/50">
          <h2 className="text-xl font-extrabold text-orange-500">Panel Web</h2>
          <p className="text-xs text-gray-400 mt-1">Albiztegui Electric</p>
        </div>
        
        <nav className="flex-grow p-4 space-y-2">
          <button 
            onClick={() => setActiveTab('carrusel')}
            className={`w-full text-left px-4 py-3 rounded-lg font-bold transition-colors shadow-sm ${activeTab === 'carrusel' ? 'bg-blue-900 text-white' : 'text-gray-300 hover:bg-blue-900 hover:text-white'}`}
          >
            Carrusel de Inicio
          </button>
          
          {/* NUEVO BOTÓN PARA PESTAÑA MARCAS */}
          <button 
            onClick={() => setActiveTab('marcas')}
            className={`w-full text-left px-4 py-3 rounded-lg font-bold transition-colors shadow-sm ${activeTab === 'marcas' ? 'bg-blue-900 text-white' : 'text-gray-300 hover:bg-blue-900 hover:text-white'}`}
          >
            Marcas Oficiales
          </button>

          <button 
            onClick={() => setActiveTab('buzon')}
            className={`w-full text-left flex justify-between items-center px-4 py-3 rounded-lg font-bold transition-colors shadow-sm ${activeTab === 'buzon' ? 'bg-blue-900 text-white' : 'text-gray-300 hover:bg-blue-900 hover:text-white'}`}
          >
            <span>Buzón</span>
            {mensajes.filter(m => !m.leido).length > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {mensajes.filter(m => !m.leido).length}
              </span>
            )}
          </button>
        </nav>
        
        <div className="p-4 border-t border-blue-900/50 mb-16 md:mb-0">
          <button onClick={handleLogout} className="w-full text-center px-4 py-2 rounded-lg border border-red-500/50 text-red-400 font-bold hover:bg-red-500 hover:text-white transition-colors">
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* ÁREA PRINCIPAL DINÁMICA */}
      <main className="flex-grow p-4 sm:p-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-10 min-h-[500px]">
          
          {/* PESTAÑA: CARRUSEL */}
          {activeTab === 'carrusel' && (
            <div>
              <h1 className="text-3xl font-extrabold text-blue-900 mb-6">Imágenes del Carrusel</h1>
              
              <form onSubmit={agregarImagen} className="mb-8 flex flex-col sm:flex-row gap-4">
                <input 
                  type="url" 
                  required
                  placeholder="Pega aquí la URL de la imagen (Ej. https://.../imagen.jpg)"
                  value={nuevaImagen}
                  onChange={(e) => setNuevaImagen(e.target.value)}
                  className="flex-grow px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none text-gray-900"
                />
                <button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-2 rounded-lg transition-colors">
                  Agregar
                </button>
              </form>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {imagenes.length === 0 ? (
                  <p className="text-gray-500 col-span-full">No hay imágenes en el carrusel.</p>
                ) : (
                  imagenes.map((img) => (
                    <div key={img.id} className="border border-gray-200 rounded-xl overflow-hidden shadow-sm group">
                      <div className="h-40 bg-gray-100 relative">
                        <Image src={img.imagen_url} alt="Carrusel" fill={true} className="object-cover" unoptimized={true} />
                      </div>
                      <div className="p-4 bg-gray-50 flex justify-between items-center">
                        <span className="text-xs font-bold text-gray-500">Orden: {img.orden}</span>
                        <button 
                          onClick={() => setModal({ mostrar: true, id: img.id, tipo: 'imagen' })} 
                          className="text-red-500 hover:text-red-700 text-sm font-bold"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* NUEVA PESTAÑA: MARCAS */}
          {activeTab === 'marcas' && (
            <div>
              <h1 className="text-3xl font-extrabold text-blue-900 mb-6">Administrar Marcas Comerciales</h1>

              {/* FORMULARIO DE REGISTRO */}
              <form onSubmit={agregarMarca} className="mb-8 bg-gray-50 p-6 rounded-xl border border-gray-200 space-y-4">
                <h3 className="font-bold text-blue-950 text-base">Registrar Nueva Marca</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">Nombre</label>
                    <input 
                      type="text" 
                      required
                      placeholder="Ej. Condumex"
                      value={nombreMarca}
                      onChange={(e) => setNombreMarca(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">Logotipo (Imagen)</label>
                    <input 
                      id="logoInputDashboard"
                      type="file" 
                      accept="image/*"
                      required
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setArchivoLogo(e.target.files[0])
                        }
                      }}
                      className="w-full border border-gray-300 p-1.5 rounded-lg text-xs text-gray-700 bg-white file:mr-2 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-bold file:bg-orange-100 file:text-orange-700"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">Sitio Web</label>
                    <input 
                      type="url" 
                      required
                      placeholder="Ej. https://marca.com"
                      value={sitioWebMarca}
                      onChange={(e) => setSitioWebMarca(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white"
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={subiendoMarca}
                  className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-2 rounded-lg text-sm transition-colors disabled:opacity-50"
                >
                  {subiendoMarca ? 'Subiendo imagen...' : 'Guardar Marca'}
                </button>
              </form>

              {/* LISTADO DE MARCAS */}
              <div className="overflow-x-auto rounded-xl border border-gray-200">
                <table className="w-full text-left text-sm text-gray-700">
                  <thead className="bg-blue-950 text-white text-xs uppercase">
                    <tr>
                      <th className="py-3 px-4 font-bold">Marca</th>
                      <th className="py-3 px-4 font-bold">Sitio Oficial</th>
                      <th className="py-3 px-4 font-bold text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {marcas.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="py-6 text-center text-gray-500">
                          No hay marcas registradas.
                        </td>
                      </tr>
                    ) : (
                      marcas.map((m) => (
                        <tr key={m.id} className="hover:bg-gray-50">
                          <td className="py-3 px-4 font-bold text-blue-900 flex items-center gap-3">
                            <div className="w-8 h-8 relative bg-gray-50 border rounded p-1 flex items-center justify-center">
                              <img src={m.logo_url} alt={m.nombre} className="w-full h-full object-contain" />
                            </div>
                            {m.nombre}
                          </td>
                          
                          {/* CELDA MODIFICADA PARA CORTAR LA URL */}
                          <td className="py-3 px-4 text-orange-500 font-medium max-w-[180px] sm:max-w-[250px]">
                            <a 
                              href={m.sitio_web} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="hover:underline truncate block"
                              title={m.sitio_web}
                            >
                              {m.sitio_web}
                            </a>
                          </td>

                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => setModal({ mostrar: true, id: m.id, tipo: 'marca' })}
                              className="text-red-500 hover:text-red-700 font-bold text-xs"
                            >
                              Eliminar
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* PESTAÑA: BUZÓN */}
          {activeTab === 'buzon' && (
            <div>
              <h1 className="text-3xl font-extrabold text-blue-900 mb-6">Bandeja de Entrada</h1>
              
              {mensajes.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                  <p className="text-gray-500 text-lg">Tu buzón está vacío por ahora.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {mensajes.map((msj) => (
                    <div 
                      key={msj.id} 
                      className={`p-5 rounded-xl border transition-all ${msj.leido ? 'bg-gray-50 border-gray-200 opacity-75' : 'bg-white border-blue-200 shadow-md border-l-4 border-l-orange-500'}`}
                    >
                      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-3 gap-2">
                        <div>
                          <h3 className={`text-lg ${msj.leido ? 'font-semibold text-gray-700' : 'font-extrabold text-blue-900'}`}>
                            {msj.nombre}
                          </h3>
                          <a href={`tel:${msj.telefono}`} className="text-orange-500 font-medium hover:underline text-sm">
                            📞 {msj.telefono}
                          </a>
                        </div>
                        <span className="text-xs text-gray-400 font-medium">
                          {new Date(msj.created_at).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute:'2-digit' })}
                        </span>
                      </div>
                      
                      <p className={`text-sm mb-4 ${msj.leido ? 'text-gray-600' : 'text-gray-900 font-medium'}`}>
                        {msj.mensaje}
                      </p>
                      
                      <div className="flex gap-4 border-t border-gray-100 pt-3">
                        <button 
                          onClick={() => alternarLeido(msj.id, msj.leido)}
                          className={`text-sm font-bold ${msj.leido ? 'text-gray-500 hover:text-blue-900' : 'text-blue-900 hover:text-orange-500'}`}
                        >
                          {msj.leido ? 'Marcar como no leído' : 'Marcar como leído'}
                        </button>
                        <button 
                          onClick={() => setModal({ mostrar: true, id: msj.id, tipo: 'mensaje' })}
                          className="text-sm font-bold text-red-400 hover:text-red-600"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </main>
    </div>
  )
}