import express from "express";
import cors from "cors";
import routes from "./routes/index.js";
import { notFound, errorHandler } from "./middlewares/errorHandler.js";

const app = express();

app.use(cors()); // se restringe al dominio del frontend en el día 4
app.use(express.json({ limit: "100kb" }));

app.use("/api/v1", routes);

app.use(notFound);
app.use(errorHandler);

export default app;
