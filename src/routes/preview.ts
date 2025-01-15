import { Router } from "express";
import previewService from "../services/preview"; // Import the singleton instance directly

const router = Router();

// Initialize the preview service when the router is created
(async () => {
  try {
    await previewService.initialize();
  } catch (error) {
    console.error("Failed to initialize preview service:", error);
  }
})();

// Handle graceful shutdown
process.on("SIGTERM", async () => {
  await previewService.cleanup();
});

router.get("/challenge/:id", (req, res) => {
  previewService.handlePreviewRequest(req.params.id, res);
});

router.get("/match/:id", (req, res) => {
  previewService.handlePreviewRequest(req.params.id, res);
});

export default router;
