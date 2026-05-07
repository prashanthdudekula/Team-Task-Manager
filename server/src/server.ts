import "dotenv/config";
import app from "./app.js";
import { prisma } from "./config/database.js";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    console.log("Starting server in", process.env.NODE_ENV, "mode...");
    if (!process.env.DATABASE_URL) {
      console.warn("⚠ DATABASE_URL is not defined in process.env!");
    } else {
      console.log("✓ DATABASE_URL found (length:", process.env.DATABASE_URL.length, ")");
    }
    
    // Test database connection
    await prisma.$connect();
    console.log("✓ Database connected successfully");

    app.listen(PORT, () => {
      console.log(`✓ Server is running on port ${PORT}`);
      console.log(
        `✓ API docs available at http://localhost:${PORT}/api-docs`
      );
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("Shutting down gracefully...");
  await prisma.$disconnect();
  process.exit(0);
});
