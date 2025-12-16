import mongoose from "mongoose";
import { Meta } from "../models/metaLead.model.js";
import { ApiError } from "../Utils/ApiError.js";
import { ApiResponse } from "../Utils/ApiResponse.js";
import { asyncHandler } from "../Utils/asyncHandler.js";
import { sendEmail } from "../Utils/sendEmail.js";

const addMetaLeads = asyncHandler(async (req, res) => {
  const entry = req.body.entry?.[0];
  const change = entry?.changes?.[0];
  const value = change?.value;

  const leadId = value?.leadgen_id;

  if (!leadId) {
    throw new ApiError(400, "Lead ID not found");
  }

  const alreadyExists = await Meta.findOne({ leadId });
  if (alreadyExists) {
    return res
      .status(200)
      .json(new ApiResponse(200, "Lead already exists, ignored"));
  }

  let fbRes;
  try {
    fbRes = await axios.get(`https://graph.facebook.com/v19.0/${leadId}`, {
      params: {
        access_token: process.env.META_ACCESS_TOKEN,
        fields: "created_time,field_data",
      },
    });
  } catch (err) {
    throw new ApiError(500, "Failed to fetch Meta lead data");
  }

  const fields = fbRes.data.field_data || [];

  const getValue = (name) =>
    fields.find((f) => f.name === name)?.values?.[0] || "";

  const name = getValue("full_name");
  const email = getValue("email");
  const contact = getValue("phone_number");
  const service = getValue("service");

  //   const source = value.platform === "instagram" ? "instagram" : "facebook";

  const newLead = await Meta.create({
    leadId,
    name,
    email,
    contact,
    service,
    source: "meta",
    status: "new",
  });

  req.io.emit("websiteLeadCreated", newLead);
  await sendEmail({
    to: process.env.ADMIN_EMAIL,
    subject: "🚀 New Meta Lead Received",
    html: `
      <h3>New Lead Generated</h3>
      <p><b>Source:</b> ${source}</p>
      <p><b>Name:</b> ${name}</p>
      <p><b>Contact:</b> ${contact}</p>
      <p><b>Email:</b> ${email}</p>
      <p><b>Service:</b> ${service}</p>
    `,
  });

  res
    .status(201)
    .json(new ApiResponse(201, newLead, "Meta lead added successfully"));
});

const getMetaLeads = asyncHandler(async (req, res) => {
  const metaLeadsList = await Meta.find({});
  if (!metaLeadsList) {
    throw new ApiError(404, " Meta Lead not found");
  }

  res
    .status(200)
    .json(
      new ApiResponse(200, metaLeadsList, "Get Meta lead List successfully"),
    );
});

const updateMetaStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid lead ID");
  }

  if (!status) {
    throw new ApiError(400, "Status is required");
  }

  const updatedLead = await Meta.findByIdAndUpdate(
    id,
    { status },
    { new: true },
  );

  if (!updatedLead) {
    throw new ApiError(404, "Lead not found");
  }

  req.io.emit("website-lead-status-updated", updatedLead);

  res
    .status(200)
    .json(
      new ApiResponse(200, updatedLead, "Lead status updated successfully"),
    );
});

const deleteMetaLeads = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid lead ID");
  }

  const deletedLead = await Meta.findByIdAndDelete(id);

  if (!deletedLead) {
    throw new ApiError(404, "Lead not found");
  }

  req.io.emit("website-lead-deleted", { id });

  res.status(200).json(new ApiResponse(200, {}, "Lead deleted successfully"));
});

export { addMetaLeads, getMetaLeads, updateMetaStatus, deleteMetaLeads };
