import multer from "multer";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        const uploadPath = path.resolve(__dirname, "../../uploads");
        callback(null, uploadPath); 
    },
    filename: (req, file, callback) => {
        const uniqueName = `${Date.now()}-${file.originalname}`;
        callback(null, uniqueName); 
    }
});

const uploadStorage = multer({
    storage
});

export default uploadStorage;

