import { Router } from "express";
import {
  addMetaLeads,
  deleteMetaLeads,
  getMetaLeads,
  updateMetaStatus,
} from "../Controllers/metaLead.controller.js";

const router = Router();

router.route("/").post(addMetaLeads).get(getMetaLeads);
router.route("/:id").patch(updateMetaStatus).delete(deleteMetaLeads);
export default router;
