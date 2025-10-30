"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userDAL = void 0;

const uuid_1 = require("uuid");

const users = [];
exports.userDAL = {
    async create(data) {
        const now = new Date();
        const user = {
            ...data,
            id: (0, uuid_1.v4)(),
            createdAt: now,
            updatedAt: now,
        };
        users.push(user);
        return user;
    },
    async findByEmail(email) {
        return users.find(u => u.email === email);
    },
    async findById(id) {
        return users.find(u => u.id === id);
    },
    async findAll() {
        return [...users];
    },
    async update(id, data) {
        const user = users.find(u => u.id === id);
        if (!user)
            return undefined;
        Object.assign(user, data, { updatedAt: new Date() });
        return user;
    },
    async delete(id) {
        const idx = users.findIndex(u => u.id === id);
        if (idx === -1)
            return false;
        users.splice(idx, 1);
        return true;
    },
    async isEmailTaken(email) {
        return users.some(u => u.email === email);
    },
};
//# sourceMappingURL=user.model.js.map