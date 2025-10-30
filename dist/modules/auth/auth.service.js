"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_model_1 = require("../users/user.model");
const user_service_1 = require("../users/user.service");
const JWT_SECRET = process.env.JWT_SECRET || 'changeme';
class AuthService {
    static excludePasswordHash(user) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { passwordHash, ...rest } = user;
        return rest;
    }
    static async register(data) {
        if (await user_model_1.userDAL.isEmailTaken(data.email)) {
            console.log('Register failed: Email already taken');
            throw new user_service_1.ConflictError('Email already taken');
        }
        const passwordHash = await bcryptjs_1.default.hash(data.password, 10);
        const user = await user_model_1.userDAL.create({
            name: data.name,
            email: data.email,
            passwordHash,
            role: data.role || 'member',
            position: data.position,
            jobDescription: data.jobDescription ?? null,
        });
        console.log('User registered:', user.email);
        return this.excludePasswordHash(user);
    }
    static async login(email, password) {
        const user = await user_model_1.userDAL.findByEmail(email);
        if (!user) {
            console.log('Login failed: User not found');
            throw new user_service_1.AuthenticationError('Invalid credentials');
        }
        const valid = await bcryptjs_1.default.compare(password, user.passwordHash);
        if (!valid) {
            console.log('Login failed: Invalid password');
            throw new user_service_1.AuthenticationError('Invalid credentials');
        }
        const token = jsonwebtoken_1.default.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
        console.log('User logged in:', user.email);
        return token;
    }
    static async getMe(id) {
        const user = await user_model_1.userDAL.findById(id);
        if (!user) {
            console.log('GetMe failed: User not found');
            throw new user_service_1.NotFoundError('User not found');
        }
        return this.excludePasswordHash(user);
    }
}
exports.AuthService = AuthService;
//# sourceMappingURL=auth.service.js.map