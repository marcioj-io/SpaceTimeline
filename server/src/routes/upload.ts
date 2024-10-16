import { randomUUID } from 'node:crypto';
import { extname, resolve } from 'node:path';
import { FastifyInstance } from 'fastify';
import { createWriteStream, mkdirSync, existsSync } from 'node:fs';
import { pipeline } from 'node:stream';
import { promisify } from 'node:util';

const pump = promisify(pipeline);

export async function uploadRoutes(app: FastifyInstance) {
  app.post('/upload', async (request, reply) => {
    const upload = await request.file({
      limits: {
        fileSize: 5_242_880, // 5MB
      },
    });

    if (!upload) {
      return reply.status(400).send();
    }

    const mimeTypeRegex = /^(image|video)\/[a-zA-Z]+/;
    const isValidFileFormat = mimeTypeRegex.test(upload.mimetype);

    if (!isValidFileFormat) {
      return reply.status(400).send();
    }

    const fileId = randomUUID();
    const extension = extname(upload.filename);
    const fileName = fileId.concat(extension);

    // Verifique se o diretório 'uploads' existe, se não, crie-o.
    const uploadDir = resolve(__dirname, '..', '..', 'uploads');
    if (!existsSync(uploadDir)) {
      mkdirSync(uploadDir, { recursive: true });
    }

    const writeStream = createWriteStream(resolve(uploadDir, fileName));

    try {
      await pump(upload.file, writeStream);
    } catch (error) {
      console.error('Error during file upload:', error);
      return reply.status(500).send();
    }

    const fullUrl = request.protocol.concat('://').concat(request.hostname);
    const fileUrl = new URL(`/uploads/${fileName}`, fullUrl).toString();

    return { fileUrl };
  });
}
