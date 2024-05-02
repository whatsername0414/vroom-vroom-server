import express from "express";
import { joinRoom } from "../controllers/socket.js";

const router = express.Router();

router.post("/room/:room", joinRoom);

export default router;
