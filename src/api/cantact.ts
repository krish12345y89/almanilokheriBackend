import { Request, Response, NextFunction, Router } from "express";
import { upload } from "../utils/multerS3.js";
import { ErrorHandle } from "../utils/errorHandling.js";
import { Contact, IContact } from "../dataBase/models/cantact.js";
import { v4 as uuid } from "uuid";
import { UserAuth } from "../utils/userAuth.js";
import { AdminUser } from "../dataBase/models/adminUser.js";
import { ContactService } from "../service/contact.js";

const app = Router();
const auth = new UserAuth();
const contactService = new ContactService();

app.post("/createContact", upload.single("file"), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, email, phoneNumber, query } = req.body;
        if (!name || !email || !phoneNumber) {
            return next(new ErrorHandle("Please provide all required fields", 400));
        }

        let file: Express.MulterS3.File | any = req.file;
        let data = {
            name,
            email,
            phoneNumber,
            query,
            document: file ? {
                publicId: uuid(),
                fileName: file.originalname,
                file: file.originalname
            } : undefined
        };

        await Contact.create(data);
        res.status(201).json({ message: "Contact created successfully", success: true });

    } catch (error) {
        console.error(error);
        return next(new ErrorHandle("Failed to create contact", 500));
    }
});

app.get("/readContact/:id", auth.isAuthorised, async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        if (!id) {
            return next(new ErrorHandle("Please provide an ID", 400));
        }

        const contact = await Contact.findById(id);
        if (!contact) {
            return next(new ErrorHandle("Contact not found", 404));
        }

        if ((req as any).user) {
            let userId = (req as any).user;
            const admin = await AdminUser.findById(userId);
            if (admin) {
                contact.readedByAdmin = true;
                await contact.save();
            }
        }

        res.status(200).json(contact);
    } catch (error) {
        console.error(error);
        return next(new ErrorHandle("Failed to read contact", 500));
    }
});

app.delete("/deleteContact/:id", async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        if (!id) {
            return next(new ErrorHandle("Please provide an ID to delete contact", 400));
        }

        const deletedContact = await Contact.findByIdAndDelete(id);
        if (!deletedContact) {
            return next(new ErrorHandle("Contact not found", 400));
        }

        res.status(200).json({ message: "Contact deleted successfully", success: true });
    } catch (error) {
        console.error(error);
        return next(new ErrorHandle("Failed to delete contact", 500));
    }
});

export default app;
