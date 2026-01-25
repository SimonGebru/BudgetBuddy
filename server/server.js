import "dotenv/config";
import app from "./app.js";
import { connectDB } from "./config/db.js";

const PORT = process.env.PORT || 8080;

async function startServer() {
  try {
    await connectDB(process.env.MONGO_URI);

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err.message);
    process.exit(1);
  }
}

startServer();