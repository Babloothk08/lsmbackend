import { asyncHandler } from "../Utils/asyncHandler.js";
import { ApiResponse } from "../Utils/ApiResponse.js";
import { Google } from "../models/googleLead.model.js";
import { Website } from "../models/websiteLead.model.js";
import { Meta } from "../models/metaLead.model.js";

export const getDashboardStats = asyncHandler(async (req, res) => {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const [
    websiteTotal,
    googleTotal,
    metaTotal,

    websiteToday,
    googleToday,
    metaToday,

    websiteQualified,
    googleQualified,
    metaQualified,

    websiteConverted,
    googleConverted,
    metaConverted,

    websiteLeads,
    Googles,
    Metas,
  ] = await Promise.all([
    Website.countDocuments(),
    Google.countDocuments(),
    Meta.countDocuments(),

    Website.countDocuments({
      createdAt: { $gte: todayStart, $lte: todayEnd },
    }),
    Google.countDocuments({
      createdAt: { $gte: todayStart, $lte: todayEnd },
    }),
    Meta.countDocuments({
      createdAt: { $gte: todayStart, $lte: todayEnd },
    }),

    Website.countDocuments({ status: "qualified" }),
    Google.countDocuments({ status: "qualified" }),
    Meta.countDocuments({ status: "qualified" }),

    Website.countDocuments({ status: "converted" }),
    Google.countDocuments({ status: "converted" }),
    Meta.countDocuments({ status: "converted" }),

    Website.find().lean(),
    Google.find().lean(),
    Meta.find().lean(),
  ]);

  const allLeads = [
    ...websiteLeads.map((l) => ({ ...l, source: "website" })),
    ...Googles.map((l) => ({ ...l, source: "google" })),
    ...Metas.map((l) => ({ ...l, source: "meta" })),
  ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const latestLeads = allLeads.slice(0, 5);

  const totalLeads = websiteTotal + googleTotal + metaTotal;
  const todayLeads = websiteToday + googleToday + metaToday;
  const qualifiedLeads = websiteQualified + googleQualified + metaQualified;
  const convertedLeads = websiteConverted + googleConverted + metaConverted;

  const conversionRate =
    totalLeads > 0 ? ((convertedLeads / totalLeads) * 100).toFixed(2) : "0.00";

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        totalLeads,
        todayLeads,

        sourceWise: {
          website: websiteTotal,
          google: googleTotal,
          meta: metaTotal,
        },

        qualifiedLeads,
        convertedLeads,
        conversionRate: `${conversionRate}%`,

        latestLeads,
        allLeads,
      },
      "Dashboard stats fetched successfully",
    ),
  );
});
