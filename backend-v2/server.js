require("dotenv").config();
const http = require("http");
const mongoose = require("mongoose");
const { Server } = require("socket.io");
const app = require("./app");

const PORT = process.env.PORT || 8001;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/hungryhub";

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  },
});

app.set("io", io);

io.on("connection", (socket) => {
  socket.on("join-order-room", (orderId) => {
    socket.join(`order-${orderId}`);
  });

  socket.on("join-restaurant-room", (restaurantId) => {
    socket.join(`restaurant-${restaurantId}`);
  });

  socket.on("disconnect", () => {});
});

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB:", MONGO_URI);
    server.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  });
