"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("./user.controller");
const user_validation_1 = require("./user.validation");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const auth_middleware_2 = require("../../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.get('/api/users', auth_middleware_1.authMiddleware, auth_middleware_2.adminMiddleware, user_controller_1.UserController.getAllUsers);
router.get('/api/users/:id', auth_middleware_1.authMiddleware, user_controller_1.UserController.getUserById);
router.patch('/api/users/:id', auth_middleware_1.authMiddleware, (0, user_validation_1.validate)(user_validation_1.UpdateSchema), user_controller_1.UserController.updateUser);
router.delete('/api/users/:id', auth_middleware_1.authMiddleware, auth_middleware_2.adminMiddleware, user_controller_1.UserController.deleteUser);
exports.default = router;
//# sourceMappingURL=user.routes.js.map