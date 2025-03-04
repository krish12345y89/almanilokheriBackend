import { Schema, model } from "mongoose";
const schema = new Schema({
    count: String,
});
export const DeviceRecordModel = model("DeviceRecordModel", schema);
