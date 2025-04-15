import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import postsRoutes from "./route/posts.js";
import userRoutes from "./route/users.js";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";
import fs from "fs";

const app = express();
dotenv.config();

const logDir = '/app/logs';
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}
// Log file: /app/logs/la-moments.log → mapped to /root/la-moments.log on host
const logStream = fs.createWriteStream('/app/logs/la-moments.log', { flags: 'a' });

app.set('trust proxy', 1);

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again after 15 minutes",
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(cors());
app.use('/posts', apiLimiter);
app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
app.use("/posts", postsRoutes);
app.use("/user", userRoutes);

const PORT = process.env.PORT || 3000;

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    const msg = `✅ [${new Date().toISOString()}] MongoDB connected.`;
    console.log(msg);
    logStream.write(msg + '\n');

    app.listen(PORT, () => {
      const startMsg = `🚀 [${new Date().toISOString()}] Server running on port: ${PORT}`;
      console.log(startMsg);
      logStream.write(startMsg + '\n');
    });
  })
  .catch((error) => {
    const errMsg = `❌ [${new Date().toISOString()}] MongoDB connection error: ${error.message}`;
    console.error(errMsg);
    logStream.write(errMsg + '\n');
  });
