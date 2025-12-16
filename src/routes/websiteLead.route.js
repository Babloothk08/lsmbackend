import { Router } from "express";
import {
  createWebsiteLead,
  deleteLeads,
  getWebsiteLead,
  updateStatus,
} from "../Controllers/websiteLead.controller.js";
const router = Router();
router.route("/").post(createWebsiteLead).get(getWebsiteLead);
router.route("/:id").patch(updateStatus).delete(deleteLeads);

export default router;
