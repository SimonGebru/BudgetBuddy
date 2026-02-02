import mongoose from "mongoose";

const budgetCategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const splitSchema = new mongoose.Schema(
  {
    // Default: proportionellt mot inkomst
    mode: {
      type: String,
      enum: ["income", "equal", "topEarnsMore"],
      default: "income",
    },

    // används bara för topEarnsMore (B-alternativet)
    // ex: 20 betyder "tjänar mest betalar 20% mer"
    percentMore: {
      type: Number,
      min: 0,
      max: 200,
      default: 0,
    },
  },
  { _id: false }
);

const budgetPlanSchema = new mongoose.Schema(
  {
    householdId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Household",
      required: true,
      index: true,
    },
    month: {
      type: String, // "YYYY-MM"
      required: true,
      index: true,
    },
    categories: {
      type: [budgetCategorySchema],
      default: [],
    },
    split: {
      type: splitSchema,
      default: () => ({ mode: "income", percentMore: 0 }),
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

// Unik per hushåll + månad
budgetPlanSchema.index({ householdId: 1, month: 1 }, { unique: true });

const BudgetPlan = mongoose.model("BudgetPlan", budgetPlanSchema);
export default BudgetPlan;