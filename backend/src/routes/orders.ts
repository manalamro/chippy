import { Router } from "express";
import { createOrderWithPayment, getUserOrders } from "../controllers/orderController";
import { authenticate } from "../middleware/auth";

const router = Router();

router.post("/", authenticate, createOrderWithPayment);
router.get("/", authenticate, getUserOrders);

export default router;
