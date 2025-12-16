import { Router } from "express";
import {
  addGoogleLeads,
  deleteGoogleLeads,
  getGoogleLeads,
  updateGoogleStatus,
} from "../Controllers/googleLead.controller.js";
const router = Router();
router.route("/").post(addGoogleLeads).get(getGoogleLeads);
router.route("/:id").patch(updateGoogleStatus).delete(deleteGoogleLeads);

export default router;
