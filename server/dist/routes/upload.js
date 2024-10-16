"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadRoutes = void 0;
const node_crypto_1 = require("node:crypto");
const node_path_1 = require("node:path");
const node_fs_1 = require("node:fs");
const node_stream_1 = require("node:stream");
const node_util_1 = require("node:util");
const pump = (0, node_util_1.promisify)(node_stream_1.pipeline);
function uploadRoutes(app) {
    return __awaiter(this, void 0, void 0, function* () {
        app.post('/upload', (request, reply) => __awaiter(this, void 0, void 0, function* () {
            const upload = yield request.file({
                limits: {
                    fileSize: 5242880, // 5MB
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
            // Verifique se o diretório 'uploads' existe, se não, crie-o.
            const uploadDir = (0, node_path_1.resolve)(__dirname, '..', '..', 'uploads');
            if (!(0, node_fs_1.existsSync)(uploadDir)) {
                (0, node_fs_1.mkdirSync)(uploadDir, { recursive: true });
            }
            const writeStream = (0, node_fs_1.createWriteStream)((0, node_path_1.resolve)(uploadDir, fileName));
            try {
                yield pump(upload.file, writeStream);
            }
            catch (error) {
                console.error('Error during file upload:', error);
                return reply.status(500).send();
            }
            const fullUrl = request.protocol.concat('://').concat(request.hostname);
            const fileUrl = new URL(`/uploads/${fileName}`, fullUrl).toString();
            return { fileUrl };
        }));
    });
}
exports.uploadRoutes = uploadRoutes;
//# sourceMappingURL=upload.js.map