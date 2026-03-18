import dotenv from "dotenv";
import { MongoClient } from "mongodb";

dotenv.config();

const uri = process.env.MONGO_URI;
if (!uri) {
  console.error("MONGO_URI is missing. Add it to .env");
  process.exit(1);
}

const dbName = process.env.MONGO_DB || "cakeDB";
const collName = process.env.MONGO_COLLECTION || "test";

const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    console.log("MongoClient connected!");

    const database = client.db(dbName);
    const collection = database.collection(collName);

    const sample = { hello: "world", time: new Date() };
    await collection.insertOne(sample);
    console.log(`Inserted into ${dbName}.${collName}`);

    const docs = await collection.find().limit(5).toArray();
    console.log("Sample docs:");
    docs.forEach(d => console.dir(d, { depth: null }));
  } finally {
    await client.close();
  }
}

run().catch((err) => {
  console.error("Mongo test failed:", err?.message || err);
  process.exit(1);
});

