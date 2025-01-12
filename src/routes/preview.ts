import { Router } from "express";
import { PreviewService } from "../services/preview";

const router = Router();
const previewService = new PreviewService();

router.get("/challenge/:id", (req, res) => {
  previewService.handlePreviewRequest(req.params.id, res);
});

export default router;
