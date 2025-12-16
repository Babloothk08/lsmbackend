import mongoose from "mongoose";

const websiteSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    contact: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    service: {
      type: String,
      required: true,
    },
    source: {
      type: String,
      default: "website",
    },
    status: {
      type: String,
      enum: ["new", "contacted", "qualified", "lost", "converted"],
      default: "new",
    },
  },
  {
    timestamps: true,
  },
);

const Website = mongoose.model("Website", websiteSchema);
export { Website };
