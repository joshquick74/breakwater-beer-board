import express, { type Express } from "express";
import cors from "cors";
import path from "path";
import router from "./routes";
import { uploadDir } from "./routes/upload";

const app: Express = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/uploads", express.static(uploadDir));

app.use("/api", router);

const clientDistPath = path.resolve(__dirname, "../../beer-board/dist/public");
console.log("Serving static files from:", clientDistPath);
app.use(express.static(clientDistPath));
app.get("*", (_req, res) => {
  res.sendFile(path.join(clientDistPath, "index.html"));
});

export default app;
