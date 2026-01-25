import mongoose from "mongoose";

export async function connectDB(mongoUri) {
  if (!mongoUri) {
    throw new Error("MONGO_URI is missing. Add it to your .env file.");
  }

  mongoose.connection.on("connected", () => {
    console.log("MongoDB connected");
  });

  mongoose.connection.on("error", (err) => {
    console.error("MongoDB connection error:", err.message);
  });

  await mongoose.connect(mongoUri);
}