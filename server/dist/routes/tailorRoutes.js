"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const tailorController_1 = require("../controllers/tailorController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// Public routes
router.get('/', tailorController_1.getTailors);
router.get('/:id', tailorController_1.getTailorDetails);
// Protected Tailor routes
router.get('/my/services', authMiddleware_1.protect, (0, authMiddleware_1.authorize)('tailor'), tailorController_1.getMyServices);
router.post('/my/services', authMiddleware_1.protect, (0, authMiddleware_1.authorize)('tailor'), tailorController_1.createService);
router.put('/my/services/:id', authMiddleware_1.protect, (0, authMiddleware_1.authorize)('tailor'), tailorController_1.updateService);
router.delete('/my/services/:id', authMiddleware_1.protect, (0, authMiddleware_1.authorize)('tailor'), tailorController_1.deleteService);
exports.default = router;
