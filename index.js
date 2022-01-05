const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const helmet = require("helmet");
const morgan = require("morgan");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 2022;
dotenv.config();

mongoose.connect(process.env.MONGODB_URL, () =>
  console.log("Connected to MongoDB...")
);

app.use(express.json());
app.use(helmet());
app.use(cors());
app.use(morgan("dev"));

// Test and Throw error

app.use((req, res, next) => {
  const error = new Error("Not Found");
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message,
    },
  });
});

// Start Server
app.listen(PORT, () => console.log("Server is running ..."));