import mongoose from "mongoose";

const metaSchema = mongoose.Schema(
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
      default: "meta Adds",
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

const Meta = mongoose.model("Meta", metaSchema);
export { Meta };
