"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const user_service_1 = require("../users/user.service");
const auth_service_1 = require("./auth.service");
class AuthController {
    static async register(req, res) {
        try {
            const user = await auth_service_1.AuthService.register(req.body);
            return res.status(201).json(user);
        }
        catch (err) {
            if (err instanceof user_service_1.ConflictError)
                return res.status(409).json({ error: err.message });
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
    static async login(req, res) {
        try {
            const { email, password } = req.body;
            const token = await auth_service_1.AuthService.login(email, password);
            return res.status(200).json({ token });
        }
        catch (err) {
            if (err instanceof user_service_1.AuthenticationError)
                return res.status(401).json({ error: err.message });
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
    static async me(req, res) {
        try {
            const user = await user_service_1.UserService.getById(req.user.id);
            return res.status(200).json(user);
        }
        catch (err) {
            if (err instanceof user_service_1.NotFoundError)
                return res.status(404).json({ error: err.message });
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
}
exports.AuthController = AuthController;
//# sourceMappingURL=auth.controller.js.map