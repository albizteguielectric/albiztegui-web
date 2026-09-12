'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../app/lib/supabase'
import Image from 'next/image'
import Link from 'next/link'

interface ImagenCarrusel {
  id: number;
  imagen_url: string;
  orden: number;
  activa: boolean;
}

export default function Home() {
  const [imagenes, setImagenes] = useState<ImagenCarrusel[]>([])
  const [currentSlide, setCurrentSlide] = useState(0)

  // Array de categorías con la nueva sección "Cajas y Registros" enseguida de Tubería
  const categorias = [
    { 
      id: 'tuberia',
      nombre: 'Tubería', 
      descripcion: 'PVC, conduit, poliducto y accesorios para una canalización segura.',
      imagen: 'https://raw.githubusercontent.com/albizteguielectric/catalogo-electrico-imagenes/refs/heads/main/Tuberia.png',
      link: '/catalogo/tuberia'
    },
    { 
      id: 'cajas-registros',
      nombre: 'Cajas y Registros', 
      descripcion: 'Chalupas 2x4, registros 4x4, octagonales, plásticas, para exterior intemperie, canaleta y tapas ciegas.',
      imagen: 'https://raw.githubusercontent.com/albizteguielectric/catalogo-electrico-imagenes/refs/heads/main/cajas-y-registros.jpg',
      link: '/catalogo/cajas-y-registros'
    },
    { 
      id: 'cableado',
      nombre: 'Cableado', 
      descripcion: 'Cables para construcción, calibres para breakers, cable automotriz.',
      imagen: 'https://raw.githubusercontent.com/albizteguielectric/catalogo-electrico-imagenes/refs/heads/main/cables.jpg',
      link: '/catalogo/cableado'
    },
    { 
      id: 'iluminacion',
      nombre: 'Iluminación', 
      descripcion: 'Focos LED, reflectores, plafones y luminarias para todo proyecto.',
      imagen: 'https://raw.githubusercontent.com/albizteguielectric/catalogo-electrico-imagenes/refs/heads/main/iluminacion.jpg',
      link: '/catalogo/iluminacion'
    },
    { 
      id: 'control',
      nombre: 'Control y Fuerza', 
      descripcion: 'Contactores, centros de carga, brakers, relevadores y equipos para la automatización de motores.',
      imagen: 'https://raw.githubusercontent.com/albizteguielectric/catalogo-electrico-imagenes/refs/heads/main/controles.jpg',
      link: '/catalogo/control-y-fuerza'
    },
    { 
      id: 'placas-apagadores',
      nombre: 'Placas y Apagadores', 
      descripcion: 'Tomacorrientes, apagadores sencillos y de tres vías, placas decorativas, dimmers y accesorios.',
      imagen: 'https://raw.githubusercontent.com/albizteguielectric/catalogo-electrico-imagenes/refs/heads/main/tomas.jpg',
      link: '/catalogo/placas-y-apagadores'
    },
    { 
      id: 'media-tension',
      nombre: 'Media Tensión', 
      descripcion: 'Cuchillas, apartarrayos, cortacircuitos fusible, trasformadores, crucetas y accesorios de estructura.',
      imagen: 'https://raw.githubusercontent.com/albizteguielectric/catalogo-electrico-imagenes/refs/heads/main/media-tension.jpg',
      link: '/catalogo/media-tension'
    },
    { 
      id: 'electronica',
      nombre: 'Electrónica', 
      descripcion: 'Bocinas, cables RCA, cargadores de teléfono, pilas, accesorios y más.',
      imagen: 'https://raw.githubusercontent.com/albizteguielectric/catalogo-electrico-imagenes/refs/heads/main/electronica.jpg',
      link: '/catalogo/electronica'
    },
    { 
      id: 'temporada',
      nombre: 'Productos de Temporada', 
      descripcion: 'Ventiladores, calentones eléctricos, artículos navideños y más.',
      imagen: 'https://raw.githubusercontent.com/albizteguielectric/catalogo-electrico-imagenes/refs/heads/main/temporada.jpg',
      link: '/catalogo/temporada'
    }
  ];

  useEffect(() => {
    const fetchCarrusel = async () => {
      const { data } = await supabase
        .from('carrusel_inicio')
        .select('*')
        .eq('activa', true)
        .order('orden', { ascending: true })
      
      if (data) setImagenes(data)
    }
    fetchCarrusel()
  }, [])

  const totalSlides = imagenes.length + 1; 

  useEffect(() => {
    if (totalSlides <= 1) return

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev === totalSlides - 1 ? 0 : prev + 1))
    }, 5000) 

    return () => clearInterval(interval)
  }, [totalSlides])

  return (
    <div className="flex flex-col min-h-screen">
      
      {/* 1. SECCIÓN: CARRUSEL ADAPTABLE */}
      <section className="relative w-full bg-blue-900 overflow-hidden border-b-8 border-orange-500 h-[360px] sm:h-[450px] md:aspect-[24/10] md:h-auto max-h-[750px]">
        
        {/* POSICIÓN 1 (Slide 0): Texto Fijo de Bienvenida */}
        <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-1000 ease-in-out ${currentSlide === 0 ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
          <div className="absolute inset-0 bg-blue-950 opacity-90"></div> 
          <div className="relative z-10 text-center px-4 sm:px-6 max-w-4xl mx-auto">
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-3 sm:mb-6 text-white leading-tight">
              Soluciones Eléctricas para tus Proyectos
            </h1>
            <p className="text-sm sm:text-lg md:text-xl text-gray-200 mb-6 max-w-2xl mx-auto line-clamp-3 sm:line-clamp-none">
              Calidad, experiencia y confianza a tu servicio. Explora nuestro catálogo educativo de materiales en iluminación, cableado, tubería y más.
            </p>
          </div>
        </div>

        {/* POSICIÓN 2 EN ADELANTE: Imágenes de Supabase */}
        {imagenes.map((img, index) => {
          const slideIndex = index + 1;
          return (
            <div 
              key={img.id}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${currentSlide === slideIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
            >
              <Image 
                src={img.imagen_url} 
                alt={`Banner ${slideIndex}`} 
                fill={true}
                className="object-cover object-center"
                priority={slideIndex === 1}
                unoptimized={true}
              />
              <div className="absolute inset-0 bg-black/10 pointer-events-none"></div>
            </div>
          )
        })}

        {/* Indicadores de Navegación */}
        {totalSlides > 1 && (
          <div className="absolute bottom-3 sm:bottom-6 left-0 right-0 flex justify-center gap-2 z-20">
            {Array.from({ length: totalSlides }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-2 sm:h-3 rounded-full transition-all duration-300 shadow-md ${index === currentSlide ? 'bg-orange-500 w-6 sm:w-10' : 'bg-white/70 hover:bg-white w-2 sm:w-3'}`}
                aria-label={`Ver diapositiva ${index + 1}`}
              />
            ))}
          </div>
        )}
      </section>

      {/* 2. SECCIÓN DEL CATÁLOGO */}
      <section 
        className="flex-grow w-full py-12 sm:py-20 bg-cover bg-center bg-fixed relative"
        style={{ backgroundImage: "url('https://raw.githubusercontent.com/albizteguielectric/catalogo-electrico-imagenes/refs/heads/main/fondo-WEB.jpg')" }}
      >
        <div className="absolute inset-0 bg-blue-900/10"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-16 bg-white/90 max-w-2xl mx-auto p-5 sm:p-8 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-blue-900 mb-2 sm:mb-4">
              Familias de Productos
            </h2>
            <p className="text-sm sm:text-lg text-blue-900/80 font-medium">
              Explora nuestras categorías para conocer especificaciones, capacidades y detalles técnicos antes de realizar tu cotización.
            </p>
          </div>
          
          {/* Rejilla Móvil de Tarjetas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {categorias.map((cat) => (
              <Link key={cat.id} href={cat.link} className="block group">
                <div className="bg-white rounded-2xl shadow-md sm:shadow-lg border-2 border-transparent group-hover:border-orange-500 flex flex-col group-hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden h-full">
                  
                  {/* Espacio para la imagen optimizado para 1024x1024 */}
                  <div className="w-full aspect-square bg-white flex-shrink-0 relative p-1 border-b border-gray-100 flex items-center justify-center">
                    {cat.imagen ? (
                      <div className="relative w-full h-full">
                        <Image 
                          src={cat.imagen} 
                          alt={cat.nombre} 
                          fill={true} 
                          className="object-contain transform group-hover:scale-105 transition-transform duration-300 p-1" 
                          unoptimized={true}
                        />
                      </div>
                    ) : (
                      <div className="w-full h-full bg-black rounded-lg"></div>
                    )}
                  </div>
                  
                  {/* Información de la tarjeta */}
                  <div className="p-6 sm:p-8 flex flex-col items-center text-center flex-grow justify-between">
                    <div>
                      <h3 className="text-xl sm:text-2xl font-bold text-blue-900 mb-2 sm:mb-3 group-hover:text-orange-500 transition-colors">
                        {cat.nombre}
                      </h3>
                      <p className="text-sm sm:text-base text-gray-600">
                        {cat.descripcion}
                      </p>
                    </div>
                    <div className="mt-4 sm:mt-6">
                      <span className="text-xs sm:text-sm font-semibold text-orange-500 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                        Explorar familia &rarr;
                      </span>
                    </div>
                  </div>

                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}