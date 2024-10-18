import { FastifyInstance } from 'fastify'
import { randomUUID } from 'node:crypto'
import { extname } from 'node:path'

export async function uploadRoutes(app: FastifyInstance) {
  app.post('/upload', async (request, reply) => {
    const upload = await request.file({
      limits: {
        fileSize: 5_242_880, // 5MB
      },
    })

    if (!upload) {
      return reply.status(400).send()
    }

    const mimeTypeRegex = /^(image|video)\/[a-zA-Z]+/
    const isValidFileFormat = mimeTypeRegex.test(upload.mimetype)

    if (!isValidFileFormat) {
      return reply.status(400).send()
    }

    const fileId = randomUUID()
    const extension = extname(upload.filename)
    const fileName = fileId.concat(extension)

    // Converta a imagem para base64
    const chunks: Uint8Array[] = []
    for await (const chunk of upload.file) {
      chunks.push(chunk)
    }

    const buffer = Buffer.concat(chunks)
    const base64Image = `data:${upload.mimetype};base64,${buffer.toString('base64')}`

    return { fileUrl: base64Image }
  })
}
