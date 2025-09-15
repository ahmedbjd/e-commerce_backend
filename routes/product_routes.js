import express from "express";
import {
  addProduct,
  listProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from "../controllers/product_controller.js";
import upload from "../middlewares/upload.js";

const router = express.Router();

router.post("/products", upload.single("image"), addProduct);
router.get("/products", listProducts);
router.get("/products/:id", getProductById);
router.put("/products/:id", updateProduct);
router.delete("/products/:id", deleteProduct);

export default router;
