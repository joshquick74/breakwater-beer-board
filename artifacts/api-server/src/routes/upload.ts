import { Router, type IRouter } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { eq } from "drizzle-orm";
import { db, boardSettingsTable } from "@workspace/db";

const uploadDir = path.resolve(import.meta.dirname, "..", "..", "..", "..", "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `background${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = [".jpg", ".jpeg", ".png", ".webp"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Only jpg, jpeg, png, webp files are allowed"));
    }
  },
});

const router: IRouter = Router();

router.post("/upload/background", upload.single("image"), async (req, res): Promise<void> => {
  if (!req.file) {
    res.status(400).json({ error: "No file uploaded" });
    return;
  }

  const url = `/api/uploads/${req.file.filename}`;

  let [settings] = await db.select().from(boardSettingsTable);
  if (!settings) {
    [settings] = await db.insert(boardSettingsTable).values({ backgroundImageUrl: url }).returning();
  } else {
    await db
      .update(boardSettingsTable)
      .set({ backgroundImageUrl: url })
      .where(eq(boardSettingsTable.id, settings.id));
  }

  res.json({ url });
});

const logoStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `logo${ext}`);
  },
});

const logoUpload = multer({
  storage: logoStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = [".jpg", ".jpeg", ".png", ".webp", ".svg"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Only jpg, jpeg, png, webp, svg files are allowed"));
    }
  },
});

router.post("/upload/logo", logoUpload.single("image"), async (req, res): Promise<void> => {
  if (!req.file) {
    res.status(400).json({ error: "No file uploaded" });
    return;
  }

  const url = `/api/uploads/${req.file.filename}`;

  let [settings] = await db.select().from(boardSettingsTable);
  if (!settings) {
    [settings] = await db.insert(boardSettingsTable).values({ logoImageUrl: url }).returning();
  } else {
    await db
      .update(boardSettingsTable)
      .set({ logoImageUrl: url })
      .where(eq(boardSettingsTable.id, settings.id));
  }

  res.json({ url });
});

export { uploadDir };
export default router;
