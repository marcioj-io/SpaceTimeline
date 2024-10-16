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
exports.memoriesRoutes = void 0;
const zod_1 = require("zod");
const prisma_1 = require("../lib/prisma");
function memoriesRoutes(app) {
    return __awaiter(this, void 0, void 0, function* () {
        app.addHook('preHandler', (request) => __awaiter(this, void 0, void 0, function* () {
            yield request.jwtVerify();
        }));
        app.get('/memories', (request) => __awaiter(this, void 0, void 0, function* () {
            const memories = yield prisma_1.prisma.memory.findMany({
                where: {
                    userId: request.user.sub,
                },
                orderBy: {
                    createdAt: 'asc',
                },
            });
            return memories.map((memory) => {
                return {
                    id: memory.id,
                    coverUrl: memory.coverUrl,
                    excerpt: memory.content.substring(0, 115).concat('...'),
                    createdAt: memory.createdAt,
                };
            });
        }));
        app.get('/memories/:id', (request, reply) => __awaiter(this, void 0, void 0, function* () {
            const paramsSchema = zod_1.z.object({
                id: zod_1.z.string().uuid(),
            });
            const { id } = paramsSchema.parse(request.params);
            const memory = yield prisma_1.prisma.memory.findUniqueOrThrow({
                where: {
                    id,
                },
            });
            if (!memory.isPublic && memory.userId !== request.user.sub) {
                return reply.status(401).send();
            }
            return memory;
        }));
        app.post('/memories', (request) => __awaiter(this, void 0, void 0, function* () {
            const bodySchema = zod_1.z.object({
                content: zod_1.z.string(),
                coverUrl: zod_1.z.string(),
                isPublic: zod_1.z.coerce.boolean().default(false),
            });
            const { content, coverUrl, isPublic } = bodySchema.parse(request.body);
            const memory = yield prisma_1.prisma.memory.create({
                data: {
                    content,
                    coverUrl,
                    isPublic,
                    userId: request.user.sub,
                },
            });
            return memory;
        }));
        app.put('/memories/:id', (request, reply) => __awaiter(this, void 0, void 0, function* () {
            const paramsSchema = zod_1.z.object({
                id: zod_1.z.string().uuid(),
            });
            const { id } = paramsSchema.parse(request.params);
            const bodySchema = zod_1.z.object({
                content: zod_1.z.string(),
                coverUrl: zod_1.z.string(),
                isPublic: zod_1.z.coerce.boolean().default(false),
            });
            const { content, coverUrl, isPublic } = bodySchema.parse(request.body);
            let memory = yield prisma_1.prisma.memory.findUniqueOrThrow({
                where: {
                    id,
                },
            });
            if (memory.userId !== request.user.sub) {
                return reply.status(401).send();
            }
            memory = yield prisma_1.prisma.memory.update({
                where: {
                    id,
                },
                data: {
                    content,
                    coverUrl,
                    isPublic,
                },
            });
            return memory;
        }));
        app.delete('/memories/:id', (request, reply) => __awaiter(this, void 0, void 0, function* () {
            const paramsSchema = zod_1.z.object({
                id: zod_1.z.string().uuid(),
            });
            const { id } = paramsSchema.parse(request.params);
            const memory = yield prisma_1.prisma.memory.findUniqueOrThrow({
                where: {
                    id,
                },
            });
            if (memory.userId !== request.user.sub) {
                return reply.status(401).send();
            }
            yield prisma_1.prisma.memory.delete({
                where: {
                    id,
                },
            });
        }));
    });
}
exports.memoriesRoutes = memoriesRoutes;
//# sourceMappingURL=memories.js.map