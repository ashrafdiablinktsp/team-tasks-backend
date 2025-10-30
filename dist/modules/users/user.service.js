"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = exports.NotFoundError = exports.ConflictError = exports.AuthenticationError = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const user_model_1 = require("./user.model");
class AuthenticationError extends Error {
}
exports.AuthenticationError = AuthenticationError;
class ConflictError extends Error {
}
exports.ConflictError = ConflictError;
class NotFoundError extends Error {
}
exports.NotFoundError = NotFoundError;
class UserService {
    static async getById(id) {
        const user = await user_model_1.userDAL.findById(id);
        if (!user) {
            console.log('GetById failed: User not found');
            throw new NotFoundError('User not found');
        }
        const { passwordHash, ...rest } = user;
        return rest;
    }
    static async getAll() {
        const users = await user_model_1.userDAL.findAll();
        return users.map(({ passwordHash, ...rest }) => rest);
    }
    static async update(id, data) {
        const user = await user_model_1.userDAL.findById(id);
        if (!user) {
            console.log('Update failed: User not found');
            throw new NotFoundError('User not found');
        }
        if (data.email && data.email !== user.email && await user_model_1.userDAL.isEmailTaken(data.email)) {
            console.log('Update failed: Email already taken');
            throw new ConflictError('Email already taken');
        }
        let updateData = { ...data };
        if (data.password) {
            updateData.passwordHash = await bcryptjs_1.default.hash(data.password, 10);
            delete updateData.password;
        }
        const updated = await user_model_1.userDAL.update(id, updateData);
        if (!updated) {
            throw new NotFoundError('User not found after update');
        }
        console.log('User updated:', updated.email);
        const { passwordHash, ...rest } = updated;
        return rest;
    }
    static async delete(id) {
        const ok = await user_model_1.userDAL.delete(id);
        if (!ok) {
            console.log('Delete failed: User not found');
            throw new NotFoundError('User not found');
        }
        console.log('User deleted:', id);
    }
}
exports.UserService = UserService;
//# sourceMappingURL=user.service.js.map