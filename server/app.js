import express from "express";
import cors from "cors";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check 
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});


app.use((req, res) => {
  res.status(404).json({ error: "NotFound", message: "Route not found" });
});

export default app;