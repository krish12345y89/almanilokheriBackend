import { model, Schema } from "mongoose";
const schema = new Schema({
  day: {
    type: String,
  },
  month: {
    type: String,
  },
  year: {
    type: String,
  },
  count: {
    type: String,
  },
});
export const DailyDeviceRecordModel = model("DeviceModel", schema);
