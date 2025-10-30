"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateSchema = void 0;
exports.validate = validate;
const zod_1 = require("zod");
exports.UpdateSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).optional(),
    email: zod_1.z.string().email().optional(),
    password: zod_1.z.string()
        .min(8)
        .regex(/[A-Z]/, 'Must contain an uppercase letter')
        .regex(/[a-z]/, 'Must contain a lowercase letter')
        .regex(/[0-9]/, 'Must contain a number')
        .regex(/[^A-Za-z0-9]/, 'Must contain a symbol')
        .optional(),
    role: zod_1.z.enum(['admin', 'member']).optional(),
    position: zod_1.z.string().min(1).optional(),
    jobDescription: zod_1.z.string().nullable().optional(),
}).refine(data => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
});
function validate(schema) {
    return (req, res, next) => {
        const result = schema.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({ errors: result.error.issues });
        }
        req.body = result.data;
        next();
    };
}
//# sourceMappingURL=user.validation.js.map