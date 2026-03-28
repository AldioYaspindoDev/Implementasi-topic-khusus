import {
  createAdmin,
  getAllAdmin,
  getAdminById,
  updateAdmin,
  deleteAdmin,
  loginAdmin
} from "../Controllers/admin.controller.js";
import express from "express";
import { upload } from "../middleware/uploadImage.js";
import { cacheMiddleware } from "../middleware/redisCache.js";

export const routeAdmin = express.Router();

routeAdmin.post("/create", upload.single("imageAdmin"), createAdmin);
routeAdmin.post("/login", loginAdmin);
routeAdmin.get("/", cacheMiddleware("admin"), getAllAdmin);
routeAdmin.get("/:id", cacheMiddleware("admin"), getAdminById);
routeAdmin.put("/:id", updateAdmin);
routeAdmin.delete("/:id", deleteAdmin);
