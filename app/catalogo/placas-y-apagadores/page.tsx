'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

// 1. Datos para la Guía Técnica
const tiposPlacasApagadores = [
  {
    id: 'linea-tradicional',
    nombre: 'Línea Tradicional y Decorato (Eaton / Leviton)',
    uso: 'Mecanismos estándar intercambiables para casas, oficinas y comercios.',
    norma: 'Compatibilidad con caja 2x4 estándar, terminales de tornillo con mordaza y plástico autoextinguible.',
    medidas: [
      { modelo: 'Apagadores de Palanquita y Tomacorrientes', capacidad: '15A / 125V~ (Sencillos, Escalera y Dúplex)', usoComun: 'Instalaciones eléctricas estándar' },
      { modelo: 'Módulos Tipo Decorato (Eaton / Leviton)', capacidad: '15A a 20A / 125V~ (Línea Rectangular)', usoComun: 'Residencias y proyectos modernos' },
      { modelo: 'Contactos GFCI (Falla a Tierra)', capacidad: '15A / 20A con botón de Test/Reset', usoComun: 'Baños, cocinas y áreas húmedas' }
    ]
  },
  {
    id: 'tapas-marcos',
    nombre: 'Placas y Tapas de Registro (2x4, 4x4, 4x6)',
    uso: 'Cubiertas de protección y acabado estético para cajas galvanizadas o plásticas.',
    norma: 'Troquelado estándar para 1, 2 y 3 ventanas en formato palanca o Decorato.',
    medidas: [
      { modelo: 'Placas 2x4 (1, 2 y 3 Ventanas)', capacidad: 'Plástico de alto impacto / Nylon irrompible', usoComun: 'Cajas de muro tradicionales' },
      { modelo: 'Placas 4x4 Dobles', capacidad: 'Capacidad para 2 a 4 módulos', usoComun: 'Puntos de alta concentración de contactos' },
      { modelo: 'Placas 4x6 de 3 Ventanas Decorato', capacidad: 'Formato amplio para 3 dispositivos Decorato', usoComun: 'Control centralizado de alumbrado' }
    ]
  },
  {
    id: 'linea-lucek-basica-premium',
    nombre: 'Línea Arquitectónica Básica y Premium (Lucek)',
    uso: 'Placas completas y modulares de diseño contemporáneo con fácil ensamble a presión.',
    norma: 'Chasis de acero galvanizado interior con placas de policarbonato o aluminio.',
    medidas: [
      { modelo: 'Línea Básica Lucek', capacidad: '15A / 125V~ (Blanco y Marfil clásico)', usoComun: 'Remodelaciones de presupuesto accesible' },
      { modelo: 'Línea Premium Lucek', capacidad: 'Acabados Aluminio, Cepillado y Titanio', usoComun: 'Casas modernas y oficinas corporativas' },
      { modelo: 'Módulos Especiales (USB / RJ45 / TV)', capacidad: 'Carga rápida 2.1A / 3.0A USB-A y Tipo C', usoComun: 'Recámaras y escritorios de trabajo' }
    ]
  },
  {
    id: 'linea-lucek-flat-cristal',
    nombre: 'Línea de Lujo: Flat y Cristal Templado (Lucek)',
    uso: 'Acabados arquitectónicos de alta gama para interiores elegantes.',
    norma: 'Frente de cristal templado inalterable contra rayaduras e iluminación nocturna LED.',
    medidas: [
      { modelo: 'Línea Flat (Extraplana)', capacidad: 'Botón amplio al ras de muro', usoComun: 'Espacios de arquitectura minimalista' },
      { modelo: 'Línea Cristal Templado (Blanco / Negro / Plata)', capacidad: 'Placa de cristal de 4mm refractario', usoComun: 'Residencias de lujo y hoteles' },
      { modelo: 'Apagadores Táctiles (Touch)', capacidad: 'Mando touch capacitivo con luz guía', usoComun: 'Proyectos de automatización' }
    ]
  }
]

// 2. Sub-Pestañas de Categorías
const categoriasPlacas = [
  { id: 'tradicional-eaton', nombre: 'Tradicional y Decorato (Eaton/Leviton)' },
  { id: 'tapas-registro', nombre: 'Placas y Tapas (2x4, 4x4, 4x6)' },
  { id: 'lucek-basica-premium', nombre: 'Lucek Básica y Premium' },
  { id: 'lucek-flat-cristal', nombre: 'Lucek Flat y Cristal' }
]

// 3. Tarjetas Interactivas de Productos
const accesorios = [
  // --- CATEGORÍA 1: TRADICIONAL (EATON / LEVITON) ---
  {
    id: 1,
    categoriaId: 'tradicional-eaton',
    nombre: 'Apagadores y Tomacorrientes Tradicionales',
    imagen: 'https://raw.githubusercontent.com/albizteguielectric/catalogo-electrico-imagenes/refs/heads/main/tomas-sensillas.jpg',
    descripcion: 'Módulos individuales de palanquita y contactos dobles para reemplazo en instalaciones estándar.',
    medidas: 'Apagadores Sencillos / 3 Vías (Escalera) | Contactos Dúplex 15A 125V~',
    material: 'Cuerpo de Termoplástico y Contactos de Latón'
  },
  {
    id: 2,
    categoriaId: 'tradicional-eaton',
    nombre: 'Módulos Decorativos Tipo Decorato (Eaton / Leviton)',
    imagen: 'https://raw.githubusercontent.com/albizteguielectric/catalogo-electrico-imagenes/refs/heads/main/tomas-decorato.jpg',
    descripcion: 'Dispositivos de botón plano estilo Decorato, dimmers y tomas de corriente reforzadas para placa rectangular.',
    medidas: '15A y 20A / 125V~ (Formatos Sencillos, Dúplex y Atenuadores)',
    material: 'Policarbonato de Alta Resistencia al Impacto'
  },

  // --- CATEGORÍA 2: TAPAS Y PLACAS ---
  {
    id: 3,
    categoriaId: 'tapas-registro',
    nombre: 'Placas de Plástico y Nylon (2X4 y 4X4)',
    imagen: 'https://raw.githubusercontent.com/albizteguielectric/catalogo-electrico-imagenes/refs/heads/main/tapas-registro.jpg',
    descripcion: 'Tapas de acabado para cajas metálicas de registro en formato palanca tradicional, contacto o Decorato.',
    medidas: '2x4 (1, 2 y 3 Mod/Ventanas) | 4x4 Dobles',
    material: 'Nylon Irrompible / Plástico ABS en Blanco y Marfil'
  },
  {
    id: 4,
    categoriaId: 'tapas-registro',
    nombre: 'Placas Especiales 4X6 de 3 Ventanas Decorato',
    imagen: 'https://raw.githubusercontent.com/albizteguielectric/catalogo-electrico-imagenes/refs/heads/main/placas-especiales.jpg',
    descripcion: 'Tapas de gran formato diseñadas para albergar hasta 3 dispositivos tipo Decorato en un solo punto de control.',
    medidas: 'Formato 4x6 pulgadas (3 Ventanas Decorato amplia)',
    material: 'Plástico Reforzado Acabado Mate / Brillante'
  },

  // --- CATEGORÍA 3: LUCEK BÁSICA Y PREMIUM ---
  {
    id: 5,
    categoriaId: 'lucek-basica-premium',
    nombre: 'Placas Armadas Lucek Básica y Premium',
    imagen: 'https://raw.githubusercontent.com/albizteguielectric/catalogo-electrico-imagenes/refs/heads/main/basica-premium.jpg',
    descripcion: 'Juegos de placa y chasis completo listos para instalar. Disponibles con combinaciones de apagadores, contactos y USB.',
    medidas: 'Línea Básica (Blanco/Marfil) y Línea Premium (Aluminio/Acero)',
    material: 'Chasis de Acero con Frente de Policarbonato / Aluminio'
  },

  // --- CATEGORÍA 4: LUCEK FLAT Y CRISTAL ---
  {
    id: 6,
    categoriaId: 'lucek-flat-cristal',
    nombre: 'Placas Lucek Línea Flat y Cristal Templado',
    imagen: 'https://raw.githubusercontent.com/albizteguielectric/catalogo-electrico-imagenes/refs/heads/main/flat-cristal.jpg',
    descripcion: 'Placas arquitectónicas de lujo. Opción Flat ultra plana u opción Cristal Templado con apagadores capacitivos o mecánicos.',
    medidas: 'Formato Estándar 2X4 (Cristal Blanco, Negro y Plata)',
    material: 'Frente de Cristal Templado de 4mm / Botones Metalizados'
  }
]

export default function PlacasApagadoresPage() {
  const [tipoActivo, setTipoActivo] = useState(tiposPlacasApagadores[0].id)
  const [catAccesorioActiva, setCatAccesorioActiva] = useState(categoriasPlacas[0].id)
  const [flippedCards, setFlippedCards] = useState<{ [key: number]: boolean }>({})

  const toggleFlip = (id: number) => {
    setFlippedCards(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const tipoSeleccionado = tiposPlacasApagadores.find(t => t.id === tipoActivo) || tiposPlacasApagadores[0]
  const accesoriosFiltrados = accesorios.filter(a => a.categoriaId === catAccesorioActiva)

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8 pt-20">
      <div className="max-w-7xl mx-auto">
        
        {/* ENCABEZADO */}
        <div className="mb-8">
          <Link href="/" className="text-orange-500 hover:text-orange-600 font-bold text-sm flex items-center gap-1 mb-2">
            &larr; Volver al Inicio
          </Link>
          <h1 className="text-3xl sm:text-5xl font-black text-blue-900 tracking-tight">
            Placas, Apagadores y Tomacorrientes
          </h1>
          <p className="text-gray-600 text-base sm:text-lg mt-2">
           Línea tradicional, placas 2x4, 4x4 y 4x6, formato Decorato (Eaton/Leviton) y líneas Lucek (Básica, Premium, Flat y Cristal).
          </p>
        </div>

        {/* MUESTRARIO DESTACADO */}
        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden mb-12 grid grid-cols-1 lg:grid-cols-12 gap-8 p-6 sm:p-10 items-center">
          <div className="lg:col-span-5 bg-gray-50 rounded-2xl p-4 flex items-center justify-center border border-gray-200">
            <div className="relative w-full h-[320px] sm:h-[380px] flex items-center justify-center">
              <Image 
                src="https://raw.githubusercontent.com/albizteguielectric/catalogo-electrico-imagenes/refs/heads/main/tomas.jpg"
                alt="Muestrario de Placas y Apagadores"
                fill={true}
                className="object-contain p-2"
                priority={true}
                unoptimized={true}
              />
            </div>
          </div>

          <div className="lg:col-span-7 space-y-6">
            <div className="inline-block bg-orange-100 text-orange-600 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Diseño y Conectividad
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-blue-900">
              Mecanismos Tradicionales y Arquitectura de Lujo
            </h2>
            <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
              Contamos con todo el rango de accesorios para pared. Desde las tomas y palancas convencionales con sus tapas de registro hasta las líneas de cristal templado y botones planos de alta gama.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-gray-100 pt-6">
              <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                <h3 className="font-bold text-blue-900 text-sm mb-1">✓ Marcas Líderes</h3>
                <p className="text-xs text-gray-600">Disponibilidad de Eaton, Leviton y toda la familia Lucek.</p>
              </div>
              <div className="bg-orange-50/50 p-4 rounded-xl border border-orange-100">
                <h3 className="font-bold text-blue-900 text-sm mb-1">✓ Todas las Medidas de Tapas</h3>
                <p className="text-xs text-gray-600">Línea tradicional, placas 2x4, 4x4 y 4x6, formato Decorato (Eaton/Leviton) y líneas Lucek (Básica, Premium, Flat y Cristal).</p>
              </div>
            </div>
          </div>
        </div>

        {/* TABLA GUÍA TÉCNICA */}
        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6 sm:p-10 mb-16">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-blue-900">
              Guía de Selección de Placas y Mecanismos
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Compara las características de cada línea de productos.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-8">
            {tiposPlacasApagadores.map((tipo) => (
              <button
                key={tipo.id}
                onClick={() => setTipoActivo(tipo.id)}
                className={`px-5 py-3 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-sm ${
                  tipoActivo === tipo.id 
                    ? 'bg-blue-900 text-white shadow-md scale-105' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tipo.nombre}
              </button>
            ))}
          </div>

          <div className="bg-gray-50 rounded-2xl p-6 mb-8 border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-xs font-bold text-orange-500 uppercase tracking-wider block mb-1">Aplicación Principal</span>
                <p className="text-sm text-gray-800 font-medium">{tipoSeleccionado.uso}</p>
              </div>
              <div>
                <span className="text-xs font-bold text-blue-900 uppercase tracking-wider block mb-1">Compatibilidad y Materiales</span>
                <p className="text-sm text-gray-800 font-medium">{tipoSeleccionado.norma}</p>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full text-left text-sm text-gray-700">
              <thead className="bg-blue-950 text-white text-xs uppercase">
                <tr>
                  <th className="py-3.5 px-4 font-extrabold">Serie / Modelo</th>
                  <th className="py-3.5 px-4 font-extrabold">Capacidad / Formato</th>
                  <th className="py-3.5 px-4 font-extrabold">Uso Común</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {tipoSeleccionado.medidas.map((item, idx) => (
                  <tr key={idx} className="hover:bg-blue-50/40 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-blue-900">{item.modelo}</td>
                    <td className="py-3.5 px-4 font-bold text-orange-600">{item.capacidad}</td>
                    <td className="py-3.5 px-4 text-gray-800">{item.usoComun}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* TARJETAS INTERACTIVAS */}
        <div className="mb-16">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <span className="bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Catálogo de Mecanismos
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-blue-900 mt-3">
              Modelos y Estilos Disponibles
            </h2>
            <p className="text-gray-500 text-sm mt-2">
              Haz clic sobre la tarjeta para consultar especificaciones, acabados y formatos.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-10">
            {categoriasPlacas.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCatAccesorioActiva(cat.id)}
                className={`px-4 py-2.5 rounded-lg font-extrabold text-xs sm:text-sm transition-all ${
                  catAccesorioActiva === cat.id
                    ? 'bg-orange-500 text-white shadow-md'
                    : 'bg-white text-blue-900 hover:bg-orange-100 border border-gray-200'
                }`}
              >
                {cat.nombre}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {accesoriosFiltrados.map((item) => {
              const isFlipped = flippedCards[item.id] || false;
              return (
                <div 
                  key={item.id}
                  onClick={() => toggleFlip(item.id)}
                  className="h-[420px] w-full cursor-pointer [perspective:1000px] group"
                >
                  <div className={`relative h-full w-full rounded-2xl shadow-md transition-all duration-700 [transform-style:preserve-3d] ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`}>
                    
                    {/* FRENTE OPTIMIZADO PARA IMÁGENES 1024x1024 */}
                    <div className="absolute inset-0 h-full w-full rounded-2xl bg-white p-4 border border-gray-200 [backface-visibility:hidden] flex flex-col items-center justify-between">
                      <div className="w-full aspect-square bg-gray-50 rounded-xl relative overflow-hidden border border-gray-100 flex items-center justify-center p-2">
                        <Image 
                          src={item.imagen} 
                          alt={item.nombre} 
                          fill={true} 
                          className="object-contain p-1" 
                          unoptimized={true}
                        />
                      </div>
                      <div className="text-center my-auto px-1">
                        <h3 className="text-base font-extrabold text-blue-900 group-hover:text-orange-500 transition-colors line-clamp-2">
                          {item.nombre}
                        </h3>
                        <p className="text-[11px] text-gray-500 mt-1">Haz clic para ver ficha 🔄</p>
                      </div>
                    </div>

                    {/* REVERSO */}
                    <div className="absolute inset-0 h-full w-full rounded-2xl bg-blue-950 p-6 text-white [transform:rotateY(180deg)] [backface-visibility:hidden] flex flex-col justify-between border-2 border-orange-500">
                      <div>
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-xs font-bold text-orange-500 uppercase tracking-wider">Ficha Técnica</span>
                          <span className="text-xs text-gray-400">🔄 Volver</span>
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2">{item.nombre}</h3>
                        <p className="text-xs text-gray-300 mb-4 leading-relaxed">
                          {item.descripcion}
                        </p>
                      </div>

                      <div className="border-t border-blue-900 pt-3 space-y-2">
                        <div>
                          <span className="text-[10px] uppercase text-gray-400 block">Capacidades / Formatos:</span>
                          <span className="text-xs font-bold text-orange-400">{item.medidas}</span>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase text-gray-400 block">Materiales / Acabado:</span>
                          <span className="text-xs font-bold text-gray-200">{item.material}</span>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* COTIZADOR */}
        <div className="bg-gradient-to-r from-blue-950 to-blue-900 rounded-3xl p-8 sm:p-12 text-center text-white border-b-8 border-orange-500">
          <h2 className="text-2xl sm:text-3xl font-extrabold mb-3">¿Surtido de placas y apagadores para obras o desarrollos?</h2>
          <p className="text-gray-300 text-sm sm:text-base max-w-2xl mx-auto mb-6">
            Cotizamos paquetes completos de placas Lucek, Eaton y Leviton por volumen para viviendas, residenciales y proyectos comerciales.
          </p>
          <Link 
            href="/contacto" 
            className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-3.5 rounded-xl transition-all shadow-lg hover:shadow-xl text-sm"
          >
            Solicitar Cotización de Placas
          </Link>
        </div>

      </div>
    </div>
  )
}