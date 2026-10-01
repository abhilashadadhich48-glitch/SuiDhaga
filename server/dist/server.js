"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const db_1 = require("./config/db");
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const tailorRoutes_1 = __importDefault(require("./routes/tailorRoutes"));
const orderRoutes_1 = __importDefault(require("./routes/orderRoutes"));
const appointmentRoutes_1 = __importDefault(require("./routes/appointmentRoutes"));
const adminRoutes_1 = __importDefault(require("./routes/adminRoutes"));
const categoryRoutes_1 = __importDefault(require("./routes/categoryRoutes"));
const aiRoutes_1 = __importDefault(require("./routes/aiRoutes"));
dotenv_1.default.config();
// Connect to database
(0, db_1.connectDB)();
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Ensure static uploads directory exists and serve it
const uploadsPath = path_1.default.join(__dirname, '..', 'uploads');
if (!fs_1.default.existsSync(uploadsPath)) {
    fs_1.default.mkdirSync(uploadsPath, { recursive: true });
}
app.use('/uploads', express_1.default.static(uploadsPath));
// Mounting application endpoints
app.use('/api/auth', authRoutes_1.default);
app.use('/api/tailors', tailorRoutes_1.default);
app.use('/api/orders', orderRoutes_1.default);
app.use('/api/appointments', appointmentRoutes_1.default);
app.use('/api/admin', adminRoutes_1.default);
app.use('/api/categories', categoryRoutes_1.default);
app.use('/api/ai', aiRoutes_1.default);
app.get('/', (req, res) => {
    res.send('SuiDhaga API running successfully...');
});
// Global Error Handler
app.use((err, req, res, next) => {
    console.error('Unhandled Error:', err.message);
    res.status(500).json({ message: err.message || 'An internal server error occurred.' });
});
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode.`);
});
exports.default = app;
