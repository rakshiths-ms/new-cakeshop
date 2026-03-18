import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import connectDB from "./db.js";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 5000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// connect DB
connectDB();

app.use(cors());
app.use(express.json());

// Serve frontend files (index.html, styles.css, script.js, images, etc.)
app.use(express.static(__dirname));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "login.html"));
});

// ===== ADD YOUR NEW ROUTES HERE =====

// 1. Login endpoint
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  if (username === "username" && password === "rakshith1234") {
    res.json({ success: true, message: "Login successful" });
  } else {
    res.json({ success: false, message: "Invalid credentials" });
  }
});

// 2. Get menu cakes
app.get("/api/cakes", (req, res) => {
  const cakes = [
    {
      id: 1,
      name: "Chocolate Cake",
      price: 20,
      category: "Classic",
      description: "Rich cocoa sponge with silky chocolate ganache.",
      image: "/cake-chocolate.svg",
      popular: true
    },
    {
      id: 2,
      name: "Strawberry Cake",
      price: 25,
      category: "Fruit",
      description: "Fresh strawberry layers with light cream frosting.",
      image: "/cake-strawberry.svg",
      popular: true
    },
    {
      id: 3,
      name: "Vanilla Cake",
      price: 18,
      category: "Specialty",
      description: "Classic vanilla bean cake with buttercream swirl.",
      image: "/cake-vanilla.svg",
      popular: false
    }
  ];
  res.json(cakes);
});

// 3. Register endpoint
app.post("/api/register", (req, res) => {
  const { username, password } = req.body;

  // For now, just a dummy check
  if(!username || !password) {
    return res.json({ success: false, message: "Username and password required" });
  }

  // In a real app, you would save this to MongoDB
  console.log("Registered user:", username);

  res.json({ success: true, message: "Registration successful" });
});

// ===== END OF ROUTES =====

function startServer(port, allowFallback = true) {
  const server = app.listen(port, () => {
    const actualPort = server.address()?.port ?? port;
    console.log(`Server running on http://localhost:${actualPort}`);
  });

  server.on("error", (err) => {
    if (err?.code === "EADDRINUSE" && allowFallback) {
      console.warn(`Port ${port} is in use. Starting on a free port...`);
      startServer(0, false); // 0 = let OS choose a free port
      return;
    }

    console.error("Server failed to start:", err?.message || err);
    process.exit(1);
  });
}

startServer(PORT, true);
