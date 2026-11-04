import { NextResponse } from 'next/server'
import { Octokit } from '@octokit/rest'
import sharp from 'sharp'
import { createClient } from '@supabase/supabase-js'

async function validarAdmin(req: Request) {
  const token = req.headers.get('authorization')?.match(/^Bearer\s+(.+)$/i)?.[1]
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!token || !url || !anonKey) return false

  const auth = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  })
  const { data: { user }, error } = await auth.auth.getUser(token)
  if (error || !user) return false

  const { data: perfil } = await auth.from('usuarios').select('puesto, activo').eq('id', user.id).maybeSingle()
  const puesto = perfil?.puesto?.toLowerCase().trim()
  return perfil?.activo === true && ['it', 'admin', 'administrador'].includes(puesto || '')
}

// Método GET para verificación manual en navegador (evita error HTTP 405)
export async function GET() {
  return NextResponse.json({
    status: 'online',
    message: 'API Route activa. Envía una petición POST con formData (codigo e imagen) para subir archivos.',
  })
}

// Método POST para procesar imagen con Sharp y subirla a GitHub (catalogo-img)
export async function POST(req: Request) {
  try {
    if (!await validarAdmin(req)) {
      return NextResponse.json({ error: 'Se requieren permisos de IT o administrador.' }, { status: 403 })
    }

    const token = process.env.GITHUB_TOKEN_ADMIN
    if (!token) {
      return NextResponse.json(
        { error: 'No se ha configurado la variable GITHUB_TOKEN_ADMIN en las variables de entorno.' },
        { status: 500 }
      )
    }

    const octokit = new Octokit({ auth: token })
    const formData = await req.formData()
    const codigo = formData.get('codigo') as string
    const nombrePersonalizado = formData.get('nombre_personalizado') as string | null
    const file = formData.get('imagen') as File

    if ((!codigo && !nombrePersonalizado) || !file) {
      return NextResponse.json({ error: 'Código (o nombre personalizado) e imagen son requeridos' }, { status: 400 })
    }

    if (file.size > 8 * 1024 * 1024 || !file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'La imagen debe ser válida y pesar máximo 8 MB.' }, { status: 400 })
    }

    const codigoLimpio = codigo ? codigo.trim().toUpperCase() : ''
    
    // Determinar el nombre final del archivo (Ej. 012E.1.jpg o 012E.jpg)
    const fileName = nombrePersonalizado 
      ? nombrePersonalizado.trim()
      : `${codigoLimpio}.jpg`

    if (!/^[a-zA-Z0-9._-]+\.jpg$/i.test(fileName)) {
      return NextResponse.json({ error: 'Nombre de archivo inválido.' }, { status: 400 })
    }

    // 1. Convertir la imagen cargada a Buffer
    const arrayBuffer = await file.arrayBuffer()
    const inputBuffer = Buffer.from(arrayBuffer)

    let processedBuffer: Buffer

    // 2. Procesamiento con Sharp
    if (nombrePersonalizado) {
      // Si es foto de galería real: solo optimizar calidad sin forzar lienzo cuadrado ni fondo blanco
      processedBuffer = await sharp(inputBuffer)
        .jpeg({ quality: 85 })
        .toBuffer()
    } else {
      // Si es la foto principal del catálogo: redimensionar a 600x600 px sobre fondo blanco
      processedBuffer = await sharp(inputBuffer)
        .resize(600, 600, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 1 },
        })
        .flatten({ background: '#FFFFFF' })
        .jpeg({ quality: 85 })
        .toBuffer()
    }

    const contentBase64 = processedBuffer.toString('base64')
    const repoOwner = 'albizteguielectric'
    const repoName = 'catalogo-img'

    // 3. Verificar si el archivo ya existe en el repositorio para obtener su SHA (necesario para sobrescribir)
    let sha: string | undefined = undefined
    try {
      const { data: fileData } = await octokit.repos.getContent({
        owner: repoOwner,
        repo: repoName,
        path: fileName,
      })
      if (!Array.isArray(fileData) && fileData.sha) {
        sha = fileData.sha
      }
    } catch {
      // Si la foto no existe aún en GitHub, continuará la creación sin SHA
    }

    // 4. Subir o actualizar el archivo en la rama main de catalogo-img
    await octokit.repos.createOrUpdateFileContents({
      owner: repoOwner,
      repo: repoName,
      path: fileName,
      message: `auto: actualización de imagen ${fileName}`,
      content: contentBase64,
      branch: 'main',
      ...(sha ? { sha } : {}),
    })

    // URL pública raw lista para guardarse en la BD
    const rawImageUrl = `https://raw.githubusercontent.com/${repoOwner}/${repoName}/main/${fileName}`

    return NextResponse.json({
      success: true,
      imagen_url: rawImageUrl,
    })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Error interno al procesar la imagen'
    console.error('Error en API subir-imagen:', error)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
