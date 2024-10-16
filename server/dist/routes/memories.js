"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.memoriesRoutes = void 0;
const zod_1 = require("zod");
const prisma_1 = require("../lib/prisma");
async function memoriesRoutes(app) {
    app.addHook('preHandler', async (request) => {
        await request.jwtVerify();
    });
    app.get('/memories', async (request) => {
        const memories = await prisma_1.prisma.memory.findMany({
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
    });
    app.get('/memories/:id', async (request, reply) => {
        const paramsSchema = zod_1.z.object({
            id: zod_1.z.string().uuid(),
        });
        const { id } = paramsSchema.parse(request.params);
        const memory = await prisma_1.prisma.memory.findUniqueOrThrow({
            where: {
                id,
            },
        });
        if (!memory.isPublic && memory.userId !== request.user.sub) {
            return reply.status(401).send();
        }
        return memory;
    });
    app.post('/memories', async (request) => {
        const bodySchema = zod_1.z.object({
            content: zod_1.z.string(),
            coverUrl: zod_1.z.string(),
            isPublic: zod_1.z.coerce.boolean().default(false),
        });
        const { content, coverUrl, isPublic } = bodySchema.parse(request.body);
        const memory = await prisma_1.prisma.memory.create({
            data: {
                content,
                coverUrl,
                isPublic,
                userId: request.user.sub,
            },
        });
        return memory;
    });
    app.put('/memories/:id', async (request, reply) => {
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
        let memory = await prisma_1.prisma.memory.findUniqueOrThrow({
            where: {
                id,
            },
        });
        if (memory.userId !== request.user.sub) {
            return reply.status(401).send();
        }
        memory = await prisma_1.prisma.memory.update({
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
    });
    app.delete('/memories/:id', async (request, reply) => {
        const paramsSchema = zod_1.z.object({
            id: zod_1.z.string().uuid(),
        });
        const { id } = paramsSchema.parse(request.params);
        const memory = await prisma_1.prisma.memory.findUniqueOrThrow({
            where: {
                id,
            },
        });
        if (memory.userId !== request.user.sub) {
            return reply.status(401).send();
        }
        await prisma_1.prisma.memory.delete({
            where: {
                id,
            },
        });
    });
}
exports.memoriesRoutes = memoriesRoutes;
