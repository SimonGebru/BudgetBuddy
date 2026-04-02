import mongoose from "mongoose";

// Subschema för inkomster
const incomeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: true }
);

// Subschema för utgifter
const expenseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: true }
);

// Huvudschema
const personalBudgetPlanSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    month: {
      type: String,
      required: true, // format: YYYY-MM
    },
    incomes: {
      type: [incomeSchema],
      default: [],
    },
    expenses: {
      type: [expenseSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Säkerställer EN budget per user per månad
personalBudgetPlanSchema.index(
  { userId: 1, month: 1 },
  { unique: true }
);

export default mongoose.model(
  "PersonalBudgetPlan",
  personalBudgetPlanSchema
);