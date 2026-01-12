const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { apiLimiter } = require("./middleware/rateLimiter");
const errorHandler = require("./middleware/errorHandler");
const AppError = require("./utils/AppError");

const app = express();

app.use(helmet());

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// attach socket.io instance to every request
app.use((req, res, next) => {
  req.io = app.get("io");
  next();
});

app.use("/api", apiLimiter);

app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/auth",        require("./routes/auth.routes"));
app.use("/api/users",       require("./routes/user.routes"));
app.use("/api/restaurants", require("./routes/restaurant.routes"));
app.use("/api/menu-items",  require("./routes/menuItem.routes"));
app.use("/api/cart",        require("./routes/cart.routes"));
app.use("/api/orders",      require("./routes/order.routes"));
app.use("/api/reviews",     require("./routes/review.routes"));
app.use("/api/addresses",   require("./routes/address.routes"));
app.use("/api/payment",     require("./routes/payment.routes"));
app.use("/api/promo",       require("./routes/promo.routes"));
app.use("/api/admin",       require("./routes/admin.routes"));

app.all("*", (req, res, next) => {
  next(new AppError(`Route ${req.originalUrl} not found.`, 404));
});

app.use(errorHandler);

module.exports = app;
