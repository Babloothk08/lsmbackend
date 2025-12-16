import mongoose from "mongoose";

const googleSchema = mongoose.Schema(
  {
    name: {
      type: String,
    },
    contact: {
      type: String,
    },
    email: {
      type: String,
    },
    service: {
      type: String,
    },
    source: {
      type: String,
      default: "google Adds",
    },
    status: {
      type: String,
      default: "new",
      enum: ["new", "contacted", "qualified", "lost", "converted"],
    },
  },
  {
    timestamps: true,
  },
);

const Google = mongoose.model("Google", googleSchema);
export { Google };
