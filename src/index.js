import dotenv from "dotenv";
import { app, server } from "./app.js";
import colors from "colors";
import { connectDB } from "./Config/db.js";

dotenv.config();

const startServer = async () => {
  try {
    await connectDB();
    console.log(colors.green("Database connected successfully"));

    const PORT = process.env.PORT || 5000;

    server.listen(PORT, () => {
      console.log(colors.cyan(`Server is running on port ${PORT}`));
    });

    process.on("SIGINT", async () => {
      console.log(colors.yellow("Server shutting down..."));
      process.exit(0);
    });
  } catch (error) {
    console.error(
      colors.red("Failed to start the server:"),
      colors.red(error.message),
    );
    process.exit(1);
  }
};

startServer();
