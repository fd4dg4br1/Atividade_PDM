"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("cors"));
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const routes_1 = require("./routes");
const app = (0, express_1.default)();
const port = Number(process.env.PORT ?? 3000);
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(routes_1.routes);
app.use((error, _request, response, _next) => {
    console.error(error);
    response.status(500).json({ error: 'Erro interno do servidor' });
});
app.listen(port, () => {
    console.log(`gestao-financeira-api running on port ${port}`);
});
