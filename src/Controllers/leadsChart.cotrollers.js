import { Google } from "../models/googleLead.model.js";
import { Meta } from "../models/metaLead.model.js";
import { Website } from "../models/websiteLead.model.js";
import { ApiResponse } from "../Utils/ApiResponse.js";
import { asyncHandler } from "../Utils/asyncHandler.js";

const getWeeklyLeadsChart = asyncHandler(async (req, res) => {
  const today = new Date();
  const startDate = new Date();
  startDate.setDate(today.getDate() - 6);

  const initMap = () => {
    const map = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);

      const key = d.toLocaleDateString("en-US", { weekday: "short" });
      map[key] = { website: 0, meta: 0, google: 0 };
    }
    return map;
  };

  const chartMap = initMap();

  const aggregateLeads = async (Model, sourceKey) => {
    const data = await Model.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: today },
        },
      },
      {
        $group: {
          _id: {
            day: { $dayOfMonth: "$createdAt" },
            month: { $month: "$createdAt" },
            year: { $year: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
    ]);

    data.forEach((item) => {
      const date = new Date(item._id.year, item._id.month - 1, item._id.day);

      const dayKey = date.toLocaleDateString("en-US", { weekday: "short" });

      if (chartMap[dayKey]) {
        chartMap[dayKey][sourceKey] = item.count;
      }
    });
  };

  await Promise.all([
    aggregateLeads(Website, "website"),
    aggregateLeads(Meta, "meta"),
    aggregateLeads(Google, "google"),
  ]);

  const response = Object.entries(chartMap).map(([name, values]) => ({
    name,
    ...values,
  }));

  return res
    .status(200)
    .json(
      new ApiResponse(200, response, "Weekly leads chart fetched successfully"),
    );
});

const getSourceDistribution = asyncHandler(async (req, res) => {
  const [website, meta, google] = await Promise.all([
    Website.countDocuments(),
    Meta.countDocuments(),
    Google.countDocuments(),
  ]);

  const data = [
    { name: "Website", value: website },
    { name: "Meta Ads", value: meta },
    { name: "Google Ads", value: google },
  ];

  return res
    .status(200)
    .json(
      new ApiResponse(200, data, "Source distribution fetched successfully"),
    );
});

export { getWeeklyLeadsChart, getSourceDistribution };
