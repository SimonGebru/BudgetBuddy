import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, "Name is required"],
      minlength: 2,
      maxlength: 80,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      required: [true, "Email is required"],
    },
    passwordHash: {
      type: String,
      required: [true, "Password hash is required"],
      select: false, 
    },
    householdId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Household",
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);