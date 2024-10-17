"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const node_fs_1 = require("node:fs");
const node_path_1 = require("node:path");
const fastify_1 = __importDefault(require("fastify"));
const cors_1 = __importDefault(require("@fastify/cors"));
const jwt_1 = __importDefault(require("@fastify/jwt"));
const multipart_1 = __importDefault(require("@fastify/multipart"));
const memories_1 = require("./routes/memories");
const auth_1 = require("./routes/auth");
const upload_1 = require("./routes/upload");
const uploadDir = (0, node_path_1.resolve)(__dirname, '../uploads');
if (!(0, node_fs_1.existsSync)(uploadDir)) {
    (0, node_fs_1.mkdirSync)(uploadDir);
}
const app = (0, fastify_1.default)();
app.register(multipart_1.default);
app.register(require('@fastify/static'), {
    root: uploadDir,
    prefix: '/uploads',
});
app.register(cors_1.default, {
    origin: true,
});
app.register(jwt_1.default, {
    secret: 'spacetime',
});
app.register(auth_1.authRoutes);
app.register(upload_1.uploadRoutes);
app.register(memories_1.memoriesRoutes);
app.get('/', async (request, reply) => {
    return reply.send({ message: "Ok" });
});
const port = process.env.PORT || 3333;
app.listen({ port: Number(port) }).catch(err => {
    app.log.error(err);
    process.exit(1);
});
