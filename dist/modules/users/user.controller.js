"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const user_service_1 = require("./user.service");
class UserController {
    static async getAllUsers(_req, res) {
        try {
            const users = await user_service_1.UserService.getAll();
            return res.status(200).json(users);
        }
        catch (err) {
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
    static async getUserById(req, res) {
        try {
            const user = await user_service_1.UserService.getById(req.params.id);
            return res.status(200).json(user);
        }
        catch (err) {
            if (err instanceof user_service_1.NotFoundError)
                return res.status(404).json({ error: err.message });
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
    static async updateUser(req, res) {
        try {
            // Only allow self-update or admin
            if (req.user.id !== req.params.id && req.user.role !== 'admin') {
                return res.status(403).json({ error: 'Forbidden' });
            }
            const user = await user_service_1.UserService.update(req.params.id, req.body);
            return res.status(200).json(user);
        }
        catch (err) {
            if (err instanceof user_service_1.NotFoundError)
                return res.status(404).json({ error: err.message });
            if (err instanceof user_service_1.ConflictError)
                return res.status(409).json({ error: err.message });
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
    static async deleteUser(req, res) {
        try {
            await user_service_1.UserService.delete(req.params.id);
            return res.status(204).send();
        }
        catch (err) {
            if (err instanceof user_service_1.NotFoundError)
                return res.status(404).json({ error: err.message });
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
}
exports.UserController = UserController;
//# sourceMappingURL=user.controller.js.map