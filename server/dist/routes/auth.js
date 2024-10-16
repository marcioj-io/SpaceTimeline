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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRoutes = void 0;
const axios_1 = __importDefault(require("axios"));
const zod_1 = require("zod");
const prisma_1 = require("../lib/prisma");
function authRoutes(app) {
    return __awaiter(this, void 0, void 0, function* () {
        app.get('/', (request) => __awaiter(this, void 0, void 0, function* () {
            return 'Express Typescript on Vercel';
        }));
        app.post('/register', (request) => __awaiter(this, void 0, void 0, function* () {
            const bodySchema = zod_1.z.object({
                code: zod_1.z.string(),
            });
            const { code } = bodySchema.parse(request.body);
            const accessTokenResponse = yield axios_1.default.post('https://github.com/login/oauth/access_token', null, {
                params: {
                    client_id: process.env.GITHUB_CLIENT_ID,
                    client_secret: process.env.GITHUB_CLIENT_SECRET,
                    code,
                },
                headers: {
                    Accept: 'application/json',
                },
            });
            const { access_token } = accessTokenResponse.data;
            const userResponse = yield axios_1.default.get('https://api.github.com/user', {
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
            let user = yield prisma_1.prisma.user.findUnique({
                where: {
                    githubId: userInfo.id,
                },
            });
            if (!user) {
                user = yield prisma_1.prisma.user.create({
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
        }));
    });
}
exports.authRoutes = authRoutes;
//# sourceMappingURL=auth.js.map