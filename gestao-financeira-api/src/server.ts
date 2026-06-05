import cors from 'cors';
import 'dotenv/config';
import express, { NextFunction, Request, Response } from 'express';

import { routes } from './routes';

const app = express();
const port = Number(process.env.PORT ?? 3000);

app.use(cors());
app.use(express.json());
app.use(routes);

app.use((error: Error, _request: Request, response: Response, _next: NextFunction) => {
  console.error(error);
  response.status(500).json({ error: 'Erro interno do servidor' });
});

app.listen(port, () => {
  console.log(`gestao-financeira-api running on port ${port}`);
});
