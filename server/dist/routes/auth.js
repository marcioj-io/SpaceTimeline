"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRoutes = void 0;
const axios_1 = __importDefault(require("axios"));
const zod_1 = require("zod");
const prisma_1 = require("../lib/prisma");
async function authRoutes(app) {
    app.post('/register', async (request) => {
        try {
            // Validação do corpo da requisição
            const bodySchema = zod_1.z.object({
                code: zod_1.z.string().nonempty("O código é obrigatório"), // Verifica se o código não está vazio
            });
            const { code } = bodySchema.parse(request.body);
            // Solicitação do token de acesso ao GitHub
            const accessTokenResponse = await axios_1.default.post('https://github.com/login/oauth/access_token', null, {
                params: {
                    client_id: process.env.GITHUB_CLIENT_ID,
                    client_secret: process.env.GITHUB_CLIENT_SECRET,
                    code,
                },
                headers: {
                    Accept: 'application/json',
                },
            });
            if (!accessTokenResponse.data.access_token) {
                console.error('Failed to retrieve access token:', accessTokenResponse.data);
                throw new Error('Failed to retrieve access token');
            }
            const { access_token } = accessTokenResponse.data;
            // Solicitação das informações do usuário
            const userResponse = await axios_1.default.get('https://api.github.com/user', {
                headers: {
                    Authorization: `Bearer ${access_token}`,
                },
            });
            const userSchema = zod_1.z.object({
                id: zod_1.z.number(),
                login: zod_1.z.string(),
                name: zod_1.z.string(),
                avatar_url: zod_1.z.string().url(),
            });
            const userInfo = userSchema.parse(userResponse.data);
            let user = await prisma_1.prisma.user.findUnique({
                where: {
                    githubId: userInfo.id,
                },
            });
            if (!user) {
                user = await prisma_1.prisma.user.create({
                    data: {
                        githubId: userInfo.id,
                        login: userInfo.login,
                        name: userInfo.name,
                        avatarUrl: userInfo.avatar_url,
                    },
                });
            }
            const token = app.jwt.sign({
                name: user.name,
                avatarUrl: user.avatarUrl,
            }, {
                sub: user.id,
                expiresIn: '30 days',
            });
            return {
                token,
            };
        }
        catch (error) {
            console.error('Error in /register route:', error);
            return {
                statusCode: 500,
                error: 'Internal Server Error',
                message: error instanceof Error ? error.message : 'Erro desconhecido',
            };
        }
    });
}
exports.authRoutes = authRoutes;
