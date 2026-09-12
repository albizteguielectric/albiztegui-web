'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

// 1. Datos para la Tabla de Especificaciones por Tipo de Caja
const tiposCajas = [
  {
    id: 'metalicas-std',
    nombre: 'Cajas Metálicas Galvanizadas',
    uso: 'Instalaciones ocultas en muros de tabique, concreto o tabla roca para alojar mecanismos y empalmes.',
    norma: 'Fabricadas en chapa de acero galvanizado con nocouts (K.O.) de 1/2" y 3/4".',
    medidas: [
      { medida: 'Chalupa 2" x 4"', salida: '1/2" y 3/4"', usoComun: 'Alojamiento de 1 apagador o contacto residencial' },
      { medida: 'Registro 4" x 4"', salida: '1/2" y 3/4"', usoComun: 'Caja de paso, derivación y doble mecanismo' },
      { medida: 'Registro 4-11/16"', salida: '3/4" y 1"', usoComun: 'Alimentadores industriales y mayor volumen de cables' },
      { medida: 'Octagonal 4"', salida: '1/2" y 3/4"', usoComun: 'Montaje de centro de salida para luminarias y plafones' }
    ]
  },
  {
    id: 'plasticas-reparacion',
    nombre: 'Cajas Plásticas y Reparación',
    uso: 'Instalaciones en tablaroca, muros falsos o canalización visible con canaleta de superficie.',
    norma: 'Material termoplástico no conductor, autoextinguible y de alta resistencia al impacto.',
    medidas: [
      { medida: 'Chalupa Plástica 2x4', salida: 'Entrada directa', usoComun: 'Vivienda y muro seco convencional' },
      { medida: 'Caja de Reparación (Old Work)', salida: 'Grapas de presión', usoComun: 'Instalación posterior sobre muro de tablaroca existente' },
      { medida: 'Caja para Canaleta Superficie', salida: '1/2" y 3/4"', usoComun: 'Remodelaciones sin romper muro' }
    ]
  },
  {
    id: 'intemperie-nema',
    nombre: 'Cajas Intemperie y Reforzadas',
    uso: 'Instalaciones exteriores expuestas a lluvia, chorros de agua, polvo y ambientes corrosivos.',
    norma: 'Aluminio libre de cobre inyectado a presión con sello de empaque de neopreno (IP65 / NEMA 3R).',
    medidas: [
      { medida: 'Caja Intemperie 1 Pandilla', salida: '1/2" y 3/4" (3 a 5 orificios)', usoComun: 'Contactos GFCI e interruptores exteriores' },
      { medida: 'Caja Intemperie 2 Pandillas', salida: '1/2", 3/4" y 1"', usoComun: 'Combinación de contactos múltiples exteriores' },
      { medida: 'Registro Reforzado NEMA', salida: 'A perforar', usoComun: 'Protección de empalmes industriales pesados' }
    ]
  }
]

// 2. Sub-Pestañas para filtrar las Tarjetas de Cajas y Tapas
const categoriasAccesorios = [
  { id: 'cajas-metalicas', nombre: 'Metálicas y Registros' },
  { id: 'cajas-plasticas', nombre: 'Plásticas y Canaleta' },
  { id: 'cajas-intemperie', nombre: 'Intemperie y Reforzadas' },
  { id: 'tapas-accesorios', nombre: 'Tapas y Complementos' }
]

// 3. Lista Completa de Tarjetas Interactivas
const accesorios = [
  // --- METÁLICAS Y REGISTROS ---
  {
    id: 1,
    categoriaId: 'cajas-metalicas',
    nombre: 'Chalupa Metálica 2x4',
    imagen: 'https://raw.githubusercontent.com/albizteguielectric/catalogo-electrico-imagenes/refs/heads/main/2x4.jpg',
    descripcion: 'Alojamiento estándar metálico para apagadores, contactos e interruptores en muro.',
    medidas: '2x4", 2x5" sensillas y reforzadas (Salidas de 1/2" y 3/4")',
    material: 'Acero Galvanizado'
  },
  {
    id: 2,
    categoriaId: 'cajas-metalicas',
    nombre: 'Caja Registro 4x4',
    imagen: 'https://raw.githubusercontent.com/albizteguielectric/catalogo-electrico-imagenes/refs/heads/main/4x4.jpg',
    descripcion: 'Caja de paso cuadrada para empalmes de conductores y montaje de placas dobles.',
    medidas: '4x4", 5x5", 6x6", 8x" (Profundidad 1-1/2" y 2-1/8")',
    material: 'Acero Galvanizado'
  },
  {
    id: 3,
    categoriaId: 'cajas-metalicas',
    nombre: 'Caja Octagonal 4"',
    imagen: 'https://raw.githubusercontent.com/albizteguielectric/catalogo-electrico-imagenes/refs/heads/main/octagonal.jpg',
    descripcion: 'Diseñada para remate de losa y sujeción de luminarias, portalámparas o candiles.',
    medidas: '4" Octagonal (Salidas 1/2" y 3/4")',
    material: 'Acero Galvanizado'
  },
  {
    id: 4,
    categoriaId: 'cajas-metalicas',
    nombre: 'Caja Registro 4-11/16"',
    imagen: 'https://raw.githubusercontent.com/albizteguielectric/catalogo-electrico-imagenes/refs/heads/main/americana.jpg',
    descripcion: 'Caja de gran capacidad volumétrica para tuberías de mayor calibre y distribución comercial.',
    medidas: '4-11/16" x 4-11/16" (Salidas 3/4" y 1")',
    material: 'Acero Galvanizado Pesado'
  },

  // --- PLÁSTICAS Y CANALETA ---
  {
    id: 5,
    categoriaId: 'cajas-plasticas',
    nombre: 'Chalupa Plástica Residencial',
    imagen: 'https://raw.githubusercontent.com/albizteguielectric/catalogo-electrico-imagenes/refs/heads/main/2x4-plastica.jpg',
    descripcion: 'Caja liviana anticorrosiva aislante para viviendas y muros de ladrillo o concreto.',
    medidas: '2" x 4" (Entradas de 1/2" y 3/4")',
    material: 'PVC / Polímero Térmico'
  },
  {
    id: 6,
    categoriaId: 'cajas-plasticas',
    nombre: 'Caja de Reparación (Old Work)',
    imagen: 'https://raw.githubusercontent.com/albizteguielectric/catalogo-electrico-imagenes/refs/heads/main/caja-reparacion.jpg',
    descripcion: 'Incluye orejas/grapas de sujeción para fijarse a presión en muros de tablaroca ya terminados.',
    medidas: '1 Pandilla (2x4) y 2 Pandillas (4x4)',
    material: 'Termoplástico de Alto Impacto'
  },
 {
    id: 7,
    categoriaId: 'cajas-plasticas',
    nombre: 'Caja Estanca (Lisa / Con Conos)',
    imagen: 'https://raw.githubusercontent.com/albizteguielectric/catalogo-electrico-imagenes/refs/heads/main/estaca.jpg',
    descripcion: 'Gabinete plástico de derivación con protección IP65/NEMA para empalmes y paso de cable, disponible en paredes lisas o con conos escalonados de goma para prensaestopas.',
    medidas: '80x80, 100x100, 150x110, 200x150 mm',
    material: 'ABS / Termoplástico Autoextinguible'
  },

  // --- INTEMPERIE Y REFORZADAS ---
  {
    id: 8,
    categoriaId: 'cajas-intemperie',
    nombre: 'Cajas Intemperie 2x4 y 4x4',
    imagen: 'https://raw.githubusercontent.com/albizteguielectric/catalogo-electrico-imagenes/refs/heads/main/interperie.jpg',
    descripcion: 'Resistente a la intemperie con roscas reforzadas y tapones para orificios no utilizados.',
    medidas: '3 o 5 orificios (1/2" y 3/4")',
    material: 'Aluminio Fundido a Presión'
  },
  {
    id: 9,
    categoriaId: 'cajas-intemperie',
    nombre: 'Caja Metálica Tipo Zapato',
    imagen: 'https://raw.githubusercontent.com/albizteguielectric/catalogo-electrico-imagenes/refs/heads/main/zapato.jpg',
    descripcion: 'Caja metálica cuadrada reforzada para intemperie sin doble fondo, diseñada para alojamiento y paso de conductores en exteriores e instalaciones comerciales.',
    medidas: '4" x 4" (Con perforaciones/nocouts para conector)',
    material: 'Lámina de Acero Galvanizado / Pintura Electrostática'
  },
  {
    id: 10,
    categoriaId: 'cajas-intemperie',
    nombre: 'Armarios y Gabinetes de Distribución',
    imagen: 'https://raw.githubusercontent.com/albizteguielectric/catalogo-electrico-imagenes/refs/heads/main/armarios.jpg',
    descripcion: 'Gabinete hermético reforzado con doble fondo y riel DIN integrado, ideal para el montaje de breakers, contactores, arrancadores y termomagnéticos de mayor tamaño.',
    medidas: '20x20, 30x30, 40x30, 50x40 cm (Diversas profundidades)',
    material: 'Lámina de Acero / Poliester con Fibra de Vidrio / IP65'
  },

  // --- TAPAS Y COMPLEMENTOS ---
  {
    id: 11,
    categoriaId: 'tapas-accesorios',
    nombre: 'Tapas Ciegas Galvanizadas',
    imagen: 'https://raw.githubusercontent.com/albizteguielectric/catalogo-electrico-imagenes/refs/heads/main/tapa-ciega.jpg',
    descripcion: 'Cubiertas metálicas planas o realzadas para sellar y proteger registros donde solo se realizan empalmes de cable.',
    medidas: '2"x4", 4"x4", Octagonales y 4-11/16"',
    material: 'Acero Galvanizado'
  },
  {
    id: 12,
    categoriaId: 'tapas-accesorios',
    nombre: 'Tapas Galvanizadas para Dispositivos',
    imagen: 'https://raw.githubusercontent.com/albizteguielectric/catalogo-electrico-imagenes/refs/heads/main/tapas.jpg',
    descripcion: 'Tapas metálicas estampadas con troquel para fijación directa de tomacorrientes (sencillos/dobles) y apagadores en cajas de registro.',
    medidas: '4" x 4" (Sencilla, Doble, Combinada)',
    material: 'Acero Galvanizado'
  },
  {
    id: 13,
    categoriaId: 'tapas-accesorios',
    nombre: 'Tapas para Exterior / Intemperie',
    imagen: 'https://raw.githubusercontent.com/albizteguielectric/catalogo-electrico-imagenes/refs/heads/main/tapa-exterior.jpg',
    descripcion: 'Tapas herméticas con empaque de neopreno y puertas/ventanas abatibles para protección contra agua y polvo en contactos exteriores.',
    medidas: '2" x 4" (1 Pandilla) y 4" x 4" (2 Pandillas)',
    material: 'Aluminio Fundido / Policarbonato con Protección UV'
  },
  {
    id: 14,
    categoriaId: 'tapas-accesorios',
    nombre: 'Tapas Especiales y Reducciones',
    imagen: 'https://raw.githubusercontent.com/albizteguielectric/catalogo-electrico-imagenes/refs/heads/main/tapas-extras.jpg',
    descripcion: 'Tapas troqueladas para requerimientos específicos: tomas de 220V, cuadradas para 4 tomacorrientes, combinadas de apagador y contacto, y reducciones de 4x4 a 2x4.',
    medidas: 'Adaptaciones en 4"x4" y Reductores a 2"x4"',
    material: 'Acero Galvanizado'
  }
]

export default function CajasRegistrosPage() {
  const [tipoActivo, setTipoActivo] = useState(tiposCajas[0].id)
  const [catAccesorioActiva, setCatAccesorioActiva] = useState(categoriasAccesorios[0].id)
  const [flippedCards, setFlippedCards] = useState<{ [key: number]: boolean }>({})

  const toggleFlip = (id: number) => {
    setFlippedCards(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const tipoSeleccionado = tiposCajas.find(t => t.id === tipoActivo) || tiposCajas[0]
  const accesoriosFiltrados = accesorios.filter(a => a.categoriaId === catAccesorioActiva)

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8 pt-20">
      <div className="max-w-7xl mx-auto">
        
        {/* NAVEGACIÓN Y ENCABEZADO */}
        <div className="mb-8">
          <Link href="/" className="text-orange-500 hover:text-orange-600 font-bold text-sm flex items-center gap-1 mb-2">
            &larr; Volver al Inicio
          </Link>
          <h1 className="text-3xl sm:text-5xl font-black text-blue-900 tracking-tight">
            Cajas y Registros Eléctricos
          </h1>
          <p className="text-gray-600 text-base sm:text-lg mt-2">
            Alojamientos para mecanismos, derivaciones y protección de empalmes en instalaciones ocultas, fijas e intemperie.
          </p>
        </div>

        {/* MUESTRARIO GENERAL */}
        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden mb-12 grid grid-cols-1 lg:grid-cols-12 gap-8 p-6 sm:p-10 items-center">
          <div className="lg:col-span-5 bg-gray-50 rounded-2xl p-4 flex items-center justify-center border border-gray-200">
            <div className="relative w-full h-[320px] sm:h-[380px]">
              <Image 
                src="https://raw.githubusercontent.com/albizteguielectric/catalogo-electrico-imagenes/refs/heads/main/cajas-y-registros.jpg"
                alt="Muestrario de Cajas y Registros"
                fill={true}
                className="object-cover rounded-xl"
                priority={true}
                unoptimized={true}
              />
            </div>
          </div>

          <div className="lg:col-span-7 space-y-6">
            <div className="inline-block bg-orange-100 text-orange-600 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Soluciones de Alojamiento
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-blue-900">
              Chalupas, Registros de Paso y Cajas de Intemperie
            </h2>
            <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
              Disponemos de todas las variantes de cajas para vivienda, comercio e industria. Desde chalupas tradicionales galvanizadas y plásticas hasta cajas a prueba de agua (NEMA 3R / IP65) y sistemas de montaje en tablaroca.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-gray-100 pt-6">
              <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                <h3 className="font-bold text-blue-900 text-sm mb-1">✓ Materiales Certificados</h3>
                <p className="text-xs text-gray-600">Lámina galvanizada reforzada, PVC autoextinguible y aluminio inyectado a presión.</p>
              </div>
              <div className="bg-orange-50/50 p-4 rounded-xl border border-orange-100">
                <h3 className="font-bold text-blue-900 text-sm mb-1">✓ Compatibilidad Total</h3>
                <p className="text-xs text-gray-600">Nocouts con medidas estándar para tuberías de 1/2, 3/4 y 1 pulgada.</p>
              </div>
            </div>
          </div>
        </div>

        {/* TABLA DE ESPECIFICACIONES */}
        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6 sm:p-10 mb-16">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-blue-900">
              Guía Técnica de Cajas y Registros
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Selecciona el tipo de caja para revisar sus capacidades de salida y aplicación recomendada.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-8">
            {tiposCajas.map((tipo) => (
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
                <span className="text-xs font-bold text-blue-900 uppercase tracking-wider block mb-1">Norma de Fabricación</span>
                <p className="text-sm text-gray-800 font-medium">{tipoSeleccionado.norma}</p>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full text-left text-sm text-gray-700">
              <thead className="bg-blue-950 text-white text-xs uppercase">
                <tr>
                  <th className="py-3.5 px-4 font-extrabold">Modelo / Medida</th>
                  <th className="py-3.5 px-4 font-extrabold">Entradas / Nocouts</th>
                  <th className="py-3.5 px-4 font-extrabold">Uso Común</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {tipoSeleccionado.medidas.map((item, idx) => (
                  <tr key={idx} className="hover:bg-blue-50/40 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-blue-900">{item.medida}</td>
                    <td className="py-3.5 px-4 text-gray-600 font-medium">{item.salida}</td>
                    <td className="py-3.5 px-4 text-gray-800">{item.usoComun}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* TARJETAS INTERACTIVAS SUB-FILTRADAS */}
        <div className="mb-16">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <span className="bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Catálogo de Modelos
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-blue-900 mt-3">
              Cajas, Registros y Tapas
            </h2>
            <p className="text-gray-500 text-sm mt-2">
              Selecciona la categoría para visualizar los modelos disponibles.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-10">
            {categoriasAccesorios.map((cat) => (
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
                  className="h-80 w-full cursor-pointer [perspective:1000px] group"
                >
                  <div className={`relative h-full w-full rounded-2xl shadow-md transition-all duration-700 [transform-style:preserve-3d] ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`}>
                    
                    {/* FRENTE */}
                    <div className="absolute inset-0 h-full w-full rounded-2xl bg-white p-6 border border-gray-200 [backface-visibility:hidden] flex flex-col items-center justify-between">
                      <div className="w-full h-40 bg-gray-50 rounded-xl relative overflow-hidden border border-gray-100">
                        <Image 
                          src={item.imagen} 
                          alt={item.nombre} 
                          fill={true} 
                          className="object-cover w-full h-full" 
                          unoptimized={true}
                        />
                      </div>
                      <div className="text-center mt-2">
                        <h3 className="text-base sm:text-lg font-extrabold text-blue-900 group-hover:text-orange-500 transition-colors">
                          {item.nombre}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">Haz clic para ver ficha 🔄</p>
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
                          <span className="text-[10px] uppercase text-gray-400 block">Medidas / Salidas:</span>
                          <span className="text-xs font-bold text-orange-400">{item.medidas}</span>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase text-gray-400 block">Material:</span>
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
          <h2 className="text-2xl sm:text-3xl font-extrabold mb-3">¿Requieres cajas especiales o volumen para obra?</h2>
          <p className="text-gray-300 text-sm sm:text-base max-w-2xl mx-auto mb-6">
            Cotizamos cajas metálicas de registro pesado, gabinetes IP65 y cajas de intemperie al mayoreo.
          </p>
          <Link 
            href="/contacto" 
            className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-3.5 rounded-xl transition-all shadow-lg hover:shadow-xl text-sm"
          >
            Solicitar Cotización de Cajas
          </Link>
        </div>

      </div>
    </div>
  )
}