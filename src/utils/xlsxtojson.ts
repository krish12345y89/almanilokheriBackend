import { v4 as uuidv4 } from "uuid";
import xlsx from "xlsx";
import { NextFunction, Request, Response } from "express";
import fs from "fs";
import { ErrorHandle } from "./errorHandling.js";
export const handleInstituteCollection = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.file) {
      return next(new ErrorHandle("please upload xlsx file", 400));
    }
    const file = req.file.path;
    const workBook = xlsx.readFile(file);

    const sheetsData: any[] = [];
    for (let sheetName of workBook.SheetNames) {
      const sheet = workBook.Sheets[sheetName];
      const jsonData = xlsx.utils.sheet_to_json(sheet);
      sheetsData.push(...jsonData);
    }

    console.log("First Entry:", sheetsData[0]);

    const updatedData = sheetsData.map((entry: any) => {
      return {
        name: entry["__EMPTY_1"] || "N/A",
        email: entry["__EMPTY_3"] || "N/A",
        rollNo: entry["__EMPTY"] || "N/A",
        phoneNumber: entry["__EMPTY_2"] || "N/A",
        state: entry["__EMPTY_4"] || "N/A",
        uuid: uuidv4(),
        status: "Approved",
      };
    });

    console.log("Processed Data:");
    updatedData.shift();

    fs.unlinkSync(file);

    return res.status(200).send({
      message: "File processed successfully.",
      data: updatedData,
    });
  } catch (error) {
    console.error("Error handling institute collection:", error.message);
    return next(new ErrorHandle("failed to  add users", 500));
  }
}
