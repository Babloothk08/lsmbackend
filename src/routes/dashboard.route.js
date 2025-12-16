import { Router } from "express";
import { getDashboardStats } from "../Controllers/dashboard.controller.js";
import { getSourceDistribution, getWeeklyLeadsChart } from "../Controllers/leadsChart.cotrollers.js";

const router = Router();

router.route("/").get(getDashboardStats);
router.route("/weekly-leads").get(getWeeklyLeadsChart);
router.route("/source-distribution").get(getSourceDistribution);

export default router;
