import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async () => {
  try {
    if (process.env.DISABLE_DB === "true") {
      console.log("Database disabled");
      return;
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected (Atlas)");
  } catch (error) {
    console.error("DB Error:", error.message);
    process.exit(1);
  }
};

export default connectDB;
