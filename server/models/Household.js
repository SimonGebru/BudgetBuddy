import mongoose from "mongoose";

const memberSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    monthlyIncome: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
  },
  { _id: false }
);

const householdSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, "Household name is required"],
      minlength: 2,
      maxlength: 80,
    },
    members: {
      type: [memberSchema],
      default: [],
    },
  },
  { timestamps: true }
);

export default mongoose.model("Household", householdSchema);