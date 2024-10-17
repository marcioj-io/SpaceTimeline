import 'dotenv/config';
import { existsSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import multipart from '@fastify/multipart';
import { memoriesRoutes } from './routes/memories';
import { authRoutes } from './routes/auth';
import { uploadRoutes } from './routes/upload';

// Crie a pasta 'uploads' se não existir
const uploadDir = resolve(__dirname, '../uploads');
if (!existsSync(uploadDir)) {
  mkdirSync(uploadDir);
}

const app = fastify();

app.register(multipart);
app.register(require('@fastify/static'), {
  root: uploadDir,
  prefix: '/uploads',
});
app.register(cors, {
  origin: true,
});
app.register(jwt, {
  secret: 'spacetime',
});

app.register(authRoutes);
app.register(uploadRoutes);
app.register(memoriesRoutes);

app.get('/', async (request, resp) => {
  return resp.send({ message: "Ok" });
});

const port = process.env.PORT || 3333;
if (!app.server.listening) {
  app.listen({ port: Number(port), host: '0.0.0.0' }).then(() => {
    console.log(`🚀 HTTP server running on port ${port}`);
  });
}

export default app;