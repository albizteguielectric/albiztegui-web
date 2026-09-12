'use client'

import { useState } from 'react'
import { supabase } from '../lib/supabase'
import Link from 'next/link'

export default function Contacto() {
  const [nombre, setNombre] = useState('')
  const [telefono, setTelefono] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [alerta, setAlerta] = useState({ mostrar: false, tipo: '', texto: '' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setEnviando(true)
    setAlerta({ mostrar: false, tipo: '', texto: '' })

    const { error } = await supabase
      .from('buzon_contacto')
      .insert([{ nombre, telefono, mensaje }])

    if (error) {
      setAlerta({ mostrar: true, tipo: 'error', texto: 'Hubo un error al enviar tu mensaje. Intenta de nuevo o contáctanos por WhatsApp.' })
      setEnviando(false)
      return
    }

    setAlerta({ mostrar: true, tipo: 'exito', texto: '¡Mensaje enviado con éxito! Nos pondremos en contacto contigo pronto.' })
    setNombre('')
    setTelefono('')
    setMensaje('')
    setEnviando(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 sm:py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Encabezado */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-blue-900 mb-3 sm:mb-4">Contáctanos</h1>
          <p className="text-sm sm:text-lg text-gray-600 max-w-xl mx-auto">
            ¿Tienes dudas sobre un producto o necesitas una cotización? Déjanos tus datos y te atenderemos.
          </p>
          <div className="w-16 sm:w-24 h-1 bg-orange-500 mx-auto mt-4 sm:mt-6 rounded-full"></div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row border border-gray-100">
          
          {/* Panel Lateral de Información */}
          <div className="bg-blue-950 text-white p-6 sm:p-8 md:w-1/3 flex flex-col justify-between border-b-4 md:border-b-0 md:border-r-4 border-orange-500">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Información</h2>
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <h3 className="text-orange-500 font-semibold mb-1 text-xs sm:text-sm">Dirección</h3>
                  <p className="text-gray-300 text-xs sm:text-sm">
                    Visita cualquiera de nuestras{' '}
                    <Link href="/sucursales" className="text-orange-500 underline decoration-orange-500 hover:text-orange-400 font-semibold transition-colors">
                      sucursales
                    </Link>{' '}
                    para atención personalizada.
                  </p>
                </div>
                <div>
                  <h3 className="text-orange-500 font-semibold mb-1 text-xs sm:text-sm">Horario</h3>
                  <p className="text-gray-300 text-xs sm:text-sm">
                    Lunes a Viernes: 8:00 AM - 7:00 PM<br/>
                    Sábados: 8:00 AM - 2:00 PM
                  </p>
                </div>
                <div>
                  <h3 className="text-orange-500 font-semibold mb-1 text-xs sm:text-sm">WhatsApp Directo</h3>
                  <p className="text-gray-300 text-xs sm:text-sm">Respuesta rápida para cotizaciones urgentes.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Formulario */}
          <div className="p-6 sm:p-8 md:p-12 md:w-2/3">
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              
              {alerta.mostrar && (
                <div className={`p-3 sm:p-4 rounded-lg text-xs sm:text-sm font-bold text-center ${alerta.tipo === 'exito' ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'}`}>
                  {alerta.texto}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-blue-900 mb-1 sm:mb-2">Nombre Completo</label>
                  <input 
                    type="text" 
                    required
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    className="w-full px-3 py-2.5 sm:px-4 sm:py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none text-gray-900 text-sm transition-all"
                    placeholder="Ej. Juan Pérez"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-blue-900 mb-1 sm:mb-2">Teléfono / Celular</label>
                  <input 
                    type="tel" 
                    required
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    className="w-full px-3 py-2.5 sm:px-4 sm:py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none text-gray-900 text-sm transition-all"
                    placeholder="Ej. 636 123 4567"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-bold text-blue-900 mb-1 sm:mb-2">Mensaje o Materiales a Cotizar</label>
                <textarea 
                  required
                  rows={4}
                  value={mensaje}
                  onChange={(e) => setMensaje(e.target.value)}
                  className="w-full px-3 py-2.5 sm:px-4 sm:py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none text-gray-900 text-sm transition-all resize-none"
                  placeholder="Escribe aquí los productos que buscas..."
                ></textarea>
              </div>

              <button 
                type="submit"
                disabled={enviando}
                className={`w-full font-bold py-3 sm:py-4 rounded-lg transition-all shadow-md text-white text-base sm:text-lg ${
                  enviando ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-900 hover:bg-orange-500 hover:shadow-lg transform hover:-translate-y-0.5'
                }`}
              >
                {enviando ? 'Enviando...' : 'Enviar Mensaje'}
              </button>
            </form>
          </div>
          
        </div>
      </div>
    </div>
  )
}