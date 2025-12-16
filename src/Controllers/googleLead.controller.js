import mongoose from "mongoose";
import { Google } from "../models/googleLead.model.js";

import { ApiError } from "../Utils/ApiError.js";
import { ApiResponse } from "../Utils/ApiResponse.js";
import { asyncHandler } from "../Utils/asyncHandler.js";
import { sendEmail } from "../Utils/sendEmail.js";

const addGoogleLeads = asyncHandler(async (req, res) => {
  const { name, contact, email, service, status, source } = req.body;
  console.log(req.body);

  if (!name || !contact || !email || !service) {
    throw new ApiError(400, "All fields are required");
  }

  const lead = await Google.create({
    name,
    contact,
    email,
    service,
    status,
    source,
  });

  if (!lead) {
    throw new ApiError(500, "Lead creation failed");
  }

  await sendEmail({
    to: process.env.ADMIN_EMAIL,
    subject: "🚀 New Google Lead Received",
    html: `
      <h3>New Lead Generated</h3>
      <p><b>Source:</b> ${source}</p>
      <p><b>Name:</b> ${name}</p>
      <p><b>Contact:</b> ${contact}</p>
      <p><b>Email:</b> ${email}</p>
      <p><b>Service:</b> ${service}</p>
    `,
  });
  req.io.emit("websiteLeadCreated", lead);
  res
    .status(201)
    .json(new ApiResponse(201, lead, "Google lead added successfully"));
});

const getGoogleLeads = asyncHandler(async (req, res) => {
  const googleLeadsList = await Google.find({});
  if (!googleLeadsList) {
    throw new ApiError(404, " Google Lead not found");
  }

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        googleLeadsList,
        "Get Google lead List successfully",
      ),
    );
});

const updateGoogleStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid lead ID");
  }

  if (!status) {
    throw new ApiError(400, "Status is required");
  }

  const updatedLead = await Google.findByIdAndUpdate(
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

const deleteGoogleLeads = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid lead ID");
  }

  const deletedLead = await Google.findByIdAndDelete(id);

  if (!deletedLead) {
    throw new ApiError(404, "Lead not found");
  }

  req.io.emit("website-lead-deleted", { id });

  res.status(200).json(new ApiResponse(200, {}, "Lead deleted successfully"));
});

export {
  addGoogleLeads,
  getGoogleLeads,
  updateGoogleStatus,
  deleteGoogleLeads,
};
