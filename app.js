const express = require("express");
const mongoose = require("mongoose");
const ErrorHandler = require("./middleware/error");
const app = express();
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const cors = require("cors");
// const connectDataBase = require("./db/Database");
const cloudinary = require("cloudinary");
const path = require("path");

//config
if (process.env.NODE_ENV !== "PRODUCTION") {
  require("dotenv").config({
    path: "./config/.env",
  });
}



// Load .env only in local development
// if (process.env.NODE_ENV !== "production") {
//   require("dotenv").config({
//     path: path.resolve(__dirname, "config", ".env"),
//   });
// }

// Database connection
const connectDatabase = () => {
  mongoose
    .connect(process.env.DB_URL)
    .then((data) => {
      console.log(`mongodb connected with server: ${data.connection.host}`);
    });
};

connectDatabase();


// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});


const allowedOrigins = [
  "http://localhost:3000",
  "https://e-shop-frontend-six.vercel.app",
];

const corsOptions = {
  origin: function (origin, callback) {
    if (allowedOrigins.includes(origin) || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cookieParser());
// app.use("/uploads", express.static(path.join(__dirname, "../uploads")));



// Load .env only in local development
// if (process.env.NODE_ENV !== "production") {
//   require("dotenv").config({
//     path: path.resolve(__dirname, "config", ".env"),
//   });
// }






// app.use(cors({
//     origin: [
//       "http://localhost:3000",
//       "https://e-shop-frontend-six.vercel.app/",
//     ],
//     credentials : true,
// }));


// import routes
const user = require("./controller/user");
const shop = require("./controller/shop");
const product = require("./controller/product");
const event = require("./controller/event");
const coupon = require("./controller/coupounCode");
const payment = require("./controller/payment");
const order = require("./controller/order");
const message = require("./controller/messages");
const conversation = require("./controller/conversation");


app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Backend is running",
  });
});


app.use("/api/v2/user", user);
app.use("/api/v2/shop", shop);
app.use("/api/v2/product", product);
app.use("/api/v2/event", event);
app.use("/api/v2/coupon", coupon);
app.use("/api/v2/payment", payment);
app.use("/api/v2/order", order);
app.use("/api/v2/conversation", conversation);
app.use("/api/v2/message", message);
app.use("/uploads", express.static("uploads"));

// it's for ErrorHandling
app.use(ErrorHandler);

module.exports = app;
