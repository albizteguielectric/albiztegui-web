'use client'

import { useState, useRef, useEffect } from 'react'
import { supabase } from '../app/lib/supabase'

// 1. Interfaz estricta basada en tus columnas de Supabase
interface Producto {
  id?: number
  codigo?: string
  descripcion: string
  medida?: string
  precio?: number
  existencias: number
}

// 2. Interfaz para el mensaje sin utilizar 'any'
interface Mensaje {
  id: number
  texto: string
  remitente: 'bot' | 'usuario'
  productos?: Producto[]
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [input, setInput] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [mensajes, setMensajes] = useState<Mensaje[]>([
    {
      id: 1,
      texto: '¡Hola! ⚡ Soy el asistente de Albiztegui Electric. Ingresa el código del producto o su descripción para consultar precio y existencia.',
      remitente: 'bot'
    }
  ])

  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mensajes, isOpen])

  const handleSend = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userQuery = input.trim()
    const userMsgId = Date.now()

    setMensajes(prev => [
      ...prev,
      { id: userMsgId, texto: userQuery, remitente: 'usuario' }
    ])

    setInput('')
    setLoading(true)

    try {
      const { data, error } = await supabase
        .from('productos')
        .select('*')
        .or(`codigo.ilike.%${userQuery}%,descripcion.ilike.%${userQuery}%`)
        .limit(5)

      if (error) throw error

      if (data && data.length > 0) {
        // 3. Reemplazo de 'any' en la iteración por la interfaz Producto o Record<string, unknown>
        const productosConsultados: Producto[] = data.map((item: Producto) => ({
          id: item.id,
          codigo: item.codigo,
          descripcion: item.descripcion,
          medida: item.medida,
          precio: item.precio,
          existencias: Number(item.existencias ?? 0)
        }))

        setMensajes(prev => [
          ...prev,
          {
            id: Date.now(),
            texto: `Resultados para "${userQuery}":`,
            remitente: 'bot',
            productos: productosConsultados
          }
        ])
      } else {
        setMensajes(prev => [
          ...prev,
          {
            id: Date.now(),
            texto: `No encontré resultados con el código o descripción "${userQuery}". Intenta con otra clave o palabra.`,
            remitente: 'bot'
          }
        ])
      }
    } catch (err) {
      setMensajes(prev => [
        ...prev,
        {
          id: Date.now(),
          texto: 'Ocurrió un error al consultar el catálogo. Verifica la conexión e intenta de nuevo.',
          remitente: 'bot'
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {isOpen && (
        <div className="bg-white w-80 sm:w-96 h-[480px] rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden mb-4 transition-all">
          <div className="bg-blue-950 p-4 text-white flex justify-between items-center border-b-4 border-orange-500">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <div>
                <h3 className="font-extrabold text-sm tracking-wide">
                  ALBIZTEGUI <span className="text-orange-500">BOT</span>
                </h3>
                <p className="text-[10px] text-gray-300">Buscador por Código o Descripción</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-300 hover:text-white text-lg font-bold p-1"
              aria-label="Cerrar chat"
            >
              ✕
            </button>
          </div>

          <div className="flex-grow p-4 overflow-y-auto space-y-3 bg-gray-50 text-xs sm:text-sm">
            {mensajes.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.remitente === 'usuario' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-3 ${
                    msg.remitente === 'usuario'
                      ? 'bg-orange-500 text-white rounded-br-none font-medium'
                      : 'bg-white text-gray-800 border border-gray-200 shadow-sm rounded-bl-none'
                  }`}
                >
                  <p className="leading-relaxed">{msg.texto}</p>

                  {msg.productos && (
                    <div className="mt-3 space-y-2">
                      {msg.productos.map((prod, idx) => (
                        <div 
                          key={prod.id ? `prod-${prod.id}-${idx}` : `prod-${idx}`} 
                          className="bg-blue-50 p-2.5 rounded-lg border border-blue-100 text-left"
                        >
                          {prod.codigo && (
                            <span className="text-[10px] bg-blue-200 text-blue-900 font-bold px-1.5 py-0.5 rounded mr-1">
                              Cód: {prod.codigo}
                            </span>
                          )}
                          <p className="font-extrabold text-blue-950 text-xs mt-1">{prod.descripcion}</p>
                          {prod.medida && (
                            <p className="text-[11px] text-gray-600">{prod.medida}</p>
                          )}
                          <div className="mt-2 flex justify-between items-center border-t border-blue-100 pt-1.5">
                            <span className="text-xs font-black text-orange-600">
                              {prod.precio ? `$${prod.precio} MXN` : 'Consultar mostrador'}
                            </span>
                            <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${prod.existencias > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                              {prod.existencias > 0 ? `Stock: ${prod.existencias}` : 'Agotado'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 p-3 rounded-2xl text-gray-400 text-xs flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                  Buscando en inventario...
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <form onSubmit={handleSend} className="p-3 bg-white border-t border-gray-200 flex gap-2">
            <input
              type="text"
              placeholder="Código o nombre (ej. 10203 o Cople)..."
              value={input}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value)}
              className="flex-grow text-xs sm:text-sm border border-gray-300 rounded-xl px-3 py-2 text-gray-900 bg-white placeholder-gray-400 focus:outline-none focus:border-orange-500"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-900 hover:bg-orange-500 text-white font-bold px-4 py-2 rounded-xl text-xs transition-colors shadow-sm"
            >
              Buscar
            </button>
          </form>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-blue-900 hover:bg-orange-500 text-white p-4 rounded-full shadow-2xl transition-all duration-300 flex items-center justify-center border-2 border-orange-500 hover:scale-110 group"
        aria-label="Abrir asistente de catálogo"
      >
        <span className="text-xl">💬</span>
        <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-500 ease-in-out text-xs font-bold ml-0 group-hover:ml-2">
          Consultar Precios
        </span>
      </button>
    </div>
  )
}