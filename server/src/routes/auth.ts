import { FastifyInstance } from 'fastify'
import axios from 'axios'
import { z } from 'zod'
import { prisma } from '../lib/prisma'

export async function authRoutes(app: FastifyInstance) {
  app.post('/register', async (request) => {
    try {

      const bodySchema = z.object({
        code: z.string().nonempty("O código é obrigatório"),
      });

      const { code } = bodySchema.parse(request.body);

      const accessTokenResponse = await axios.post(
        'https://github.com/login/oauth/access_token',
        null,
        {
          params: {
            client_id: process.env.GITHUB_CLIENT_ID,
            client_secret: process.env.GITHUB_CLIENT_SECRET,
            code,
          },
          headers: {
            Accept: 'application/json',
          },
        },
      );

      if (!accessTokenResponse.data.access_token) {
        console.error('Failed to retrieve access token:', accessTokenResponse.data);
        throw new Error('Failed to retrieve access token');
      }

      const { access_token } = accessTokenResponse.data;

      // Solicitação das informações do usuário
      const userResponse = await axios.get('https://api.github.com/user', {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      });

      const userSchema = z.object({
        id: z.number(),
        login: z.string(),
        name: z.string(),
        avatar_url: z.string().url(),
      });

      const userInfo = userSchema.parse(userResponse.data);

      let user = await prisma.user.findUnique({
        where: {
          githubId: userInfo.id,
        },
      });

      if (!user) {
        user = await prisma.user.create({
          data: {
            githubId: userInfo.id,
            login: userInfo.login,
            name: userInfo.name,
            avatarUrl: userInfo.avatar_url,
          },
        });
      }

      const token = app.jwt.sign(
        {
          name: user.name,
          avatarUrl: user.avatarUrl,
        },
        {
          sub: user.id,
          expiresIn: '30 days',
        },
      );

      console.log('bb', token);;

      return {
        token,
      };
    } catch (error) {
      console.error('Error in /register route:', error);
      return {
        statusCode: 500,
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Erro desconhecido',
      };
    }
  });
}

