import 'dotenv/config';
import { existsSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import fastify, { FastifyRequest, FastifyReply } from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import multipart from '@fastify/multipart';
import { memoriesRoutes } from './routes/memories';
import { authRoutes } from './routes/auth';
import { uploadRoutes } from './routes/upload';

const uploadDir = resolve(__dirname, '../uploads');
if (!existsSync(uploadDir)) {
  mkdirSync(uploadDir);
}

const app = fastify({
  logger: true,
  bodyLimit: 10485760, // Limit defined at 10 MB at global level
})

app.register(cors, {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
});

app.register(multipart);

app.register(require('@fastify/static'), {
  root: uploadDir,
  prefix: '/uploads',
});

app.register(jwt, {
  secret: 'spacetime',
});

app.register(authRoutes);
app.register(uploadRoutes);
app.register(memoriesRoutes);

app.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
  return reply.send({ message: "Ok" });
});

const port = process.env.PORT || 3333;
app.listen({ port: Number(port) }).catch(err => {
  app.log.error(err);
  process.exit(1);
});
