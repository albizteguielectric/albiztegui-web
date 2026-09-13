import { NextResponse } from 'next/server'
import { Octokit } from '@octokit/rest'
import sharp from 'sharp'

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
    const file = formData.get('imagen') as File

    if (!codigo || !file) {
      return NextResponse.json({ error: 'Código e imagen son requeridos' }, { status: 400 })
    }

    const codigoLimpio = codigo.trim().toUpperCase()

    // 1. Convertir la imagen cargada a Buffer
    const arrayBuffer = await file.arrayBuffer()
    const inputBuffer = Buffer.from(arrayBuffer)

    // 2. Procesamiento con Sharp: redimensionar a 600x600 px, aplanar sobre fondo blanco puro y convertir a JPEG (85% calidad)
    const processedBuffer = await sharp(inputBuffer)
      .resize(600, 600, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 1 },
      })
      .flatten({ background: '#FFFFFF' })
      .jpeg({ quality: 85 })
      .toBuffer()

    const contentBase64 = processedBuffer.toString('base64')
    const fileName = `${codigoLimpio}.jpg`
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
      message: `auto: actualización de imagen para producto ${codigoLimpio}`,
      content: contentBase64,
      branch: 'main',
      ...(sha ? { sha } : {}),
    })

    // URL pública raw lista para guardarse en la BD y desplegarse en la tienda web
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