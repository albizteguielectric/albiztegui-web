import { NextResponse } from 'next/server'
import { Octokit } from '@octokit/rest'
import sharp from 'sharp'

// Forzar el runtime Node.js necesario para módulos nativos como sharp
export const runtime = 'nodejs'

export async function POST(req: Request) {
  try {
    const token = process.env.GITHUB_TOKEN_ADMIN
    if (!token) {
      return NextResponse.json(
        { error: 'No se ha configurado la variable GITHUB_TOKEN_ADMIN en el servidor.' },
        { status: 500 }
      )
    }

    const octokit = new Octokit({ auth: token })
    const formData = await req.formData()
    const codigo = formData.get('codigo') as string | null
    const file = formData.get('imagen') as File | null

    if (!codigo || !file) {
      return NextResponse.json({ error: 'Código e imagen son requeridos' }, { status: 400 })
    }

    const codigoLimpio = codigo.trim().toUpperCase()

    // 1. Convertir la imagen enviada a Buffer
    const arrayBuffer = await file.arrayBuffer()
    const inputBuffer = Buffer.from(arrayBuffer)

    // 2. Procesar con Sharp (Aplanar sobre fondo blanco puro y convertir a JPEG)
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

    // 3. Buscar si el archivo ya existe para obtener el SHA de actualización
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
      // Si el archivo no existe aún, se procederá a crearlo
    }

    // 4. Subir la imagen al repositorio catalogo-img
    await octokit.repos.createOrUpdateFileContents({
      owner: repoOwner,
      repo: repoName,
      path: fileName,
      message: `auto: actualización de imagen para producto ${codigoLimpio}`,
      content: contentBase64,
      branch: 'main',
      ...(sha ? { sha } : {}),
    })

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