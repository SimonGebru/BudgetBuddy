import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    householdId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Household",
      required: true,
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["income", "expense"],
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 1,
    },
    category: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 40,
      index: true,
    },
    date: {
      type: Date,
      required: true,
      index: true,
    },
    note: {
      type: String,
      trim: true,
      maxlength: 200,
      default: "",
    },
    currency: {
      type: String,
      default: "SEK",
      maxlength: 5,
    },
  },
  { timestamps: true }
);

// Bra index för filter: hushåll + datum
transactionSchema.index({ householdId: 1, date: -1 });

export default mongoose.model("Transaction", transactionSchema);