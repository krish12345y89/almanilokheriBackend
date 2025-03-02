import express, { NextFunction, Request } from "express";
import cluster from "cluster";
import { v4 as uuidv4 } from "uuid";
import { config } from "dotenv";
import userRoutes from "./api/user.js";
import adminRoutes from "./api/admin.js";
import tempUserRoutes from "./api/tempUser.js";
import cors from "cors";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import http from "http";
import https from "https";
import fs from "fs";
import path from "path";
import os from "os";
import { connectDB } from "./utils/connectionDB.js";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { ErrorHandle, errorHandler, errorHandler2 } from "./utils/errorHandling.js";
import { TempUser } from "./dataBase/models/tempUser.js";
import { handleInstituteCollection } from "./utils/xlsxtojson.js";
import upload from "./utils/multerS3.js";
import uploadStorage from "./utils/multerStorage.js";
config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const cpuLength = os.cpus().length;
const PORT = process.env.PORT || 5000;
const app = express();
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.resolve(__dirname, "./public")));
app.use("/api/tempUsers", tempUserRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.post("/dataInsert",uploadStorage.single("file"),handleInstituteCollection)

let server: any;

const connectServer = async () => {
  try {
    await connectDB().then(() => {
      if (process.env.NODE_ENV === "Production") {
        const keyPath = path.resolve(__dirname, "private.key");
        const certPath = path.resolve(__dirname, "certificate.crt");
        const options = {
          key: fs.readFileSync(keyPath),
          cert: fs.readFileSync(certPath),
        };
        server = https.createServer(options, app);
      } else {
        server = http.createServer(app);
      }

      // if (cluster.isPrimary) {
      //   console.log(`Master ${process.pid} is running`);
      //   for (let i = 0; i < cpuLength; i++) {
      //     cluster.fork();
      //   }
      //   cluster.on("exit", (worker, code, signal) => {
      //     console.log(`Worker ${worker.process.pid} died with code: ${code}, and signal: ${signal}`);
      //     cluster.fork();
      //   });
      // } else {
      //   server.listen(PORT, () => {
      //     console.log(`Worker ${process.pid} started and listening on Port --> ${PORT}`);
      //   });
      // }
      server.listen(PORT, () => {
        console.log(
          `Worker ${process.pid} started and listening on Port --> ${PORT}`
        );
      });
    });
    
  } catch (err) {
    let next:NextFunction;
    errorHandler2(err,next)
    console.error(`Error creating the server --> ${err}`);
  }
};

app.use(errorHandler)

await connectServer();
