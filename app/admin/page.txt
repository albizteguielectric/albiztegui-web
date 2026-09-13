'use client'

import { useState } from 'react'

export default function AdminPage() {
  const [codigo, setCodigo] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [cargando, setCargando] = useState(false)
  const [resultado, setResultado] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!codigo || !file) {
      setError('Debes ingresar el código y seleccionar una imagen.')
      return
    }

    setCargando(true)
    setError(null)
    setResultado(null)

    try {
      const formData = new FormData()
      formData.append('codigo', codigo)
      formData.append('imagen', file)

      // Llamada a la API Route de subida
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Error al subir la imagen')
      }

      setResultado(data.imagen_url)
      setCodigo('')
      setFile(null)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al procesar la solicitud'
      setError(msg)
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 pt-24">
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 max-w-md w-full">
        <h1 className="text-2xl font-black text-blue-900 mb-2 text-center">
          Panel de Administración
        </h1>
        <p className="text-sm text-gray-600 mb-6 text-center">
          Subida y procesamiento automático de imágenes a GitHub
        </p>

        <form onSubmit={handleUpload} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
              Código del Producto
            </label>
            <input
              type="text"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              placeholder="Ej: THHW-10"
              className="w-full px-4 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-orange-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
              Imagen del Producto
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
            />
          </div>

          <button
            type="submit"
            disabled={cargando}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 rounded-xl text-sm transition-colors disabled:opacity-50"
          >
            {cargando ? 'Procesando y Subiendo...' : 'Subir Imagen a GitHub'}
          </button>
        </form>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-medium text-center">
            {error}
          </div>
        )}

        {resultado && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-xl text-xs font-medium text-center break-all">
            <p className="font-bold mb-1">¡Imagen subida con éxito!</p>
            <a href={resultado} target="_blank" rel="noopener noreferrer" className="underline">
              {resultado}
            </a>
          </div>
        )}
      </div>
    </div>
  )
}