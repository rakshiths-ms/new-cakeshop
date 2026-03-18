import mongoose from "mongoose";
import dns from "dns";

export async function connectDB() {
  const disableDB = String(process.env.DISABLE_DB || "").toLowerCase() === "true";
  if (disableDB) {
    console.log("Database disabled (DISABLE_DB=true).");
    return;
  }

  // Optional workaround for DNS issues on some networks.
  // Example: set MONGO_DNS_SERVERS=8.8.8.8,8.8.4.4 in .env
  const dnsServers = (process.env.MONGO_DNS_SERVERS || "")
    .split(",")
    .map(s => s.trim())
    .filter(Boolean);
  if (dnsServers.length) {
    dns.setServers(dnsServers);
  }

  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.log("MONGO_URI is missing. Starting without MongoDB.");
    return;
  }

  await mongoose.connect(uri);
  console.log("MongoDB connected!");
}

