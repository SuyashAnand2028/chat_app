import express from "express";
import { getMessages, getUsersForSidebar, markMessageAsSeen, sendMessage } from "../controllers/messageController.js";
import { protectRoute } from "../middleware/auth.js";

const messageRouter = express.Router();

messageRouter.get("/users",protectRoute, getUsersForSidebar);
messageRouter.get("/:id",protectRoute, getMessages);
messageRouter.post("/send/:id",protectRoute, sendMessage);
messageRouter.put("/mark/:id",protectRoute,markMessageAsSeen);
export default messageRouter;
