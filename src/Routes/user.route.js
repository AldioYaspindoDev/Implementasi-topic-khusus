import express from "express";
import { 
    getAllUser,
    getUserById,
    createUser,
    updatedUser,
    login
 } from "../Controllers/user.controller.js";


export const UserRoute = express.Router();

UserRoute.get("/", getAllUser);
UserRoute.get("/:id", getUserById);
UserRoute.post("/create", createUser);
UserRoute.post("/login", login);
UserRoute.patch("/update/:id", updatedUser);