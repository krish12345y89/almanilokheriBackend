import { isUUID } from "validator";
import { DeviceRecordModel } from "../dataBase/models/device.js";
import { DailyDeviceRecordModel } from "../dataBase/models/deviceRecord.js";
export const insertDeviceRecord = async (req, res) => {
    const { DeviceId } = req.body;
    try {
        if (isUUID(DeviceId)) {
            const id = process.env.PrivetKey;
            const { count } = await DeviceRecordModel.findOne({ _id: id });
            const currentRec = parseInt(count);
            await DeviceRecordModel.findByIdAndUpdate(id, { count: currentRec + 1 });
        }
    }
    catch (error) {
        res.status(400).json({ err: error.message });
    }
};
export const getDeviceRecord = async (req, res) => {
    try {
        const id = process.env.PrivetKey;
        const data = await DeviceRecordModel.findOne({ _id: id });
        res.status(200).json({ data: data });
    }
    catch (error) {
        res.status(400).json({ err: error.message });
    }
};
export const insertdeviceDailyRecord = async (req, res) => {
    const { DeviceId } = req.body;
    try {
        if (isUUID(DeviceId)) {
            const now = new Date();
            const year = now.getFullYear();
            const day = now.getDate();
            const months = [
                "Jan",
                "Feb",
                "Mar",
                "Apr",
                "May",
                "Jun",
                "Jul",
                "Aug",
                "Sep",
                "Oct",
                "Nov",
                "Dec",
            ];
            const currentMonth = months[now.getMonth()];
            const count = await DailyDeviceRecordModel.findOne({
                day: day,
                year: year,
                month: currentMonth,
            });
            if (count) {
                const currentRec = parseInt(count.count);
                await DailyDeviceRecordModel.findOneAndUpdate({
                    day: day,
                    year: year,
                    month: currentMonth,
                }, { count: currentRec + 1 });
                res.status(200).json({ count });
            }
            else {
                const data = new DailyDeviceRecordModel({
                    day: day,
                    year: year,
                    month: currentMonth,
                    count: "1",
                });
                await data.save();
                res.status(200).json({ msg: "first  entry of day" });
            }
        }
    }
    catch (error) {
        res.status(400).json({ err: error.message });
    }
};
