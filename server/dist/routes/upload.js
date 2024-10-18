"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadRoutes = void 0;
const node_crypto_1 = require("node:crypto");
const node_path_1 = require("node:path");
async function uploadRoutes(app) {
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
        const fileId = (0, node_crypto_1.randomUUID)();
        const extension = (0, node_path_1.extname)(upload.filename);
        const fileName = fileId.concat(extension);
        // Converta a imagem para base64
        const chunks = [];
        for await (const chunk of upload.file) {
            chunks.push(chunk);
        }
        const buffer = Buffer.concat(chunks);
        const base64Image = `data:${upload.mimetype};base64,${buffer.toString('base64')}`;
        return { fileUrl: base64Image };
    });
}
exports.uploadRoutes = uploadRoutes;
