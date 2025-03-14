import express, { NextFunction } from "express";
import { Request, Response } from "express";
import { v4 as uuid } from "uuid";
import { DeviceRecordModel } from "../dataBase/models/device.js";
import { DailyDeviceRecordModel } from "../dataBase/models/deviceRecord.js";
import validator from "validator";
import { ErrorHandle } from "../utils/errorHandling.js";
import { Types } from "mongoose";
const { isUUID } = validator;
const router = express.Router();

router.post(
  "/deviceRecord",
  async (req: Request, res: Response, next: NextFunction) => {
    const { DeviceId } = req.body;

    if (!DeviceId) {
      return next(new ErrorHandle("Please provide DeviceId", 400));
    }

    if (!validator.isUUID(DeviceId)) {
      return res.status(400).json({ error: "Invalid Device ID" });
    }

    try {
      const id = "67d4084697355ae0b7f5ea25";

      const device = await DeviceRecordModel.findById(id);
      console.log("Device Found:", device);

      if (!device) {
        return res.status(404).json({ error: "Device record not found" });
      }

      device.count = String((Number(device.count) || 0) + 1);
      await device.save();

      res
        .status(200)
        .json({ message: "Device record updated", count: device.count });
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ error: error.message });
    }
  }
);

router.get("/deviceRecord", async (req: Request, res: Response) => {
  try {
    const id = process.env.PrivetKey;
    const data = await DeviceRecordModel.findById(id);

    if (!data) {
      return res.status(404).json({ error: "Device record not found" });
    }

    res.status(200).json({ data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post(
  "/deviceDailyRecord",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { DeviceId } = req.body;
      console.log(uuid());
      if (!DeviceId) {
        return next(new ErrorHandle("please provide deviceId", 400));
      }
      if (!isUUID(DeviceId)) {
        return res.status(400).json({ error: "Invalid Device ID" });
      }
      const now = new Date();
      const year = now.getFullYear();
      const day = now.getDate();
      const month = now.toLocaleString("en-US", { month: "short" });

      const record = await DailyDeviceRecordModel.findOne({ day, year, month });

      if (record) {
        record.count = String((Number(record.count) || 0) + 1);
        await record.save();
        return res
          .status(200)
          .json({ message: "Daily record updated", count: record.count });
      }

      await new DailyDeviceRecordModel({ day, year, month, count: 1 }).save();
      res.status(201).json({ message: "First entry of the day", count: 1 });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

export default router;
