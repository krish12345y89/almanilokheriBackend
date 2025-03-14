import multer from "multer";
import multerS3 from "multer-s3";
import { DeleteObjectCommand, S3Client } from "@aws-sdk/client-s3";
import dotenv from "dotenv";
import { ErrorHandle } from "./errorHandling.js";
import { NodeHttpHandler } from "@aws-sdk/node-http-handler";
dotenv.config();
const accessKey = process.env.AWS_ACCESS_KEY;
const secretKey = process.env.AWS_SECRET_KEY;
const region = process.env.AWS_REGION;
const bucket = process.env.AWS_S3_BUCKET;
if (!accessKey || !secretKey || !region || !bucket) {
    throw new Error("AWS S3 credentials are missing from environment variables");
}
const s3Client = new S3Client({
    region: region,
    credentials: {
        accessKeyId: accessKey,
        secretAccessKey: secretKey,
    },
    requestHandler: new NodeHttpHandler({
        connectionTimeout: 300000,
        requestTimeout: 300000,
    }),
});
const s3Storage = multerS3({
    s3: s3Client,
    bucket: bucket,
    metadata: (req, file, cb) => {
        cb(null, { fieldName: file.fieldname });
    },
    key: (req, file, cb) => {
        const fileName = `${Date.now()}-${file.originalname}`;
        cb(null, fileName);
    }
});
export const upload = multer({
    storage: s3Storage,
    limits: {
        fileSize: 1 * 1024 * 1024,
    },
});
const deleteFile = async (fileKey) => {
    try {
        const command = new DeleteObjectCommand({
            Bucket: bucket,
            Key: fileKey,
        });
        const result = await s3Client.send(command);
        if (result) {
            console.log(`File deleted: ${fileKey}`);
            return true;
        }
    }
    catch (error) {
        console.error("S3 Delete Error:", error);
        return false;
    }
};
export async function deleteS3Files(urls, next) {
    try {
        if (!urls || urls.length === 0) {
            return next(new ErrorHandle("No files provided for deletion", 400));
        }
        await Promise.all(urls.map((url) => deleteFile(decodeURIComponent(new URL(url).pathname.substring(1)))));
    }
    catch (error) {
        console.error("Error deleting files from S3:", error);
        return next(new ErrorHandle("Failed to delete files from S3", 500));
    }
}
