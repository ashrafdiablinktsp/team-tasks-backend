"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
router.post("/login", (req, res) => {
    res.send("Login endpoint");
});
router.post("/register", (req, res) => {
    res.send("Register endpoint");
});
exports.default = router;
//# sourceMappingURL=auth.routes.js.map