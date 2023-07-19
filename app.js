require("dotenv").config();
require("express-async-errors");

// extra security package
const helmet = require("helmet");
const cors = require("cors");
const xss = require("xss-clean"); // corss site scripting
const rateLimiter = require("express-rate-limit");

const express = require("express");
const app = express();

// connect DB
const connectDB = require("./db/connect");

// routers
const authRouter = require("./routes/auth");
const jobsRouter = require("./routes/jobs");

// error handler middlewares
const notFoundMiddleware = require("./middleware/not-found");
const errorHandlerMiddleware = require("./middleware/error-handler");

// auth middleware
const authenticateUser = require("./middleware/authentication");

app.set("trust proxy", 1); // due to limiter go and check on its npm
app.use(
  rateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  })
);
app.use(express.json());
app.use(helmet());
app.use(cors());
app.use(xss());

app.get("/", (req, res) => {
  res.send("jobs api");
});

// routes
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/jobs", authenticateUser, jobsRouter);

// custom error handlers middlewares
app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 8080;

const startServer = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    app.listen(port, () =>
      console.log(`DB is connected and Server is listening on port ${port}...`)
    );
  } catch (error) {
    console.log(error);
  }
};

startServer();
