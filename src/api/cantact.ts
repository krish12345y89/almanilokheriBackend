import { Request, Response, NextFunction, Router } from "express";
import upload from "../utils/multerS3.js";
import { ErrorHandle } from "../utils/errorHandling.js";
import { Contact, IContact } from "../dataBase/models/cantact.js";
import { v4 as uuid } from "uuid"
import { UserAuth } from "../utils/userAuth.js";
import { AdminUser } from "../dataBase/models/adminUser.js";
import { ContactService } from "../service/contact.js";
const app = Router();
const auth = new UserAuth();
const contactService = new ContactService();
app.post("/createContact", upload.single("file"), async (req: Request<{}, {}, { name: string, phoneNumber: string, email: string, query: string }>, res: Response, next: NextFunction) => {
    try {
        const { name, email, phoneNumber, query } = req.body;
        if (!name || !email || !phoneNumber || !phoneNumber) {
            return next(new ErrorHandle("please provide all data", 400))
        }
        let data: IContact;
        let file: Express.MulterS3.File | any = req.file;
        if (file) {
            data.document.publicId = uuid()
            data.document.fileName = file.originalname,
                data.document.file = file.originalname
        }
        data.name = name;
        data.email = email;
        data.phoneNumber = phoneNumber;
        data.query = query

    } catch (error) {
        console.error(error);
        return next(new ErrorHandle("failed to create contact", 500))
    }
});
app.get("/readContact/:id", auth.isAuthorised, async (req: Request<{ _id: string }>, res: Response, next: NextFunction) => {
    try {
        const { _id } = req.params;
        if (!_id) {
            return next(new ErrorHandle("please provide id to delete contact", 400))
        }
        const contact = await Contact.findById(_id);
        if (!contact) {
            return next(new ErrorHandle("contact not found", 400))
        }
        if ((req as any).user) {
            let id = (req as any).user;
            const admin = await AdminUser.findById(id);
            if (admin) {
                contact.readedByAdmin = true;
            }
        }
    } catch (error) {
        console.error(error);
        return next(new ErrorHandle("failed to create contact", 500))
    }
});
app.put("/updateContact/:id", upload.single("file"), async (req: Request<{ _id: string }, {}, { name: string, phoneNumber: string, email: string, query: string }>, res: Response, next: NextFunction) => {
    try {
        const { name, email, phoneNumber, query } = req.body;
        const { _id } = req.params;
        if (!_id) {
            return next(new ErrorHandle("please provide id to delete contact", 400))
        }
        if (!name || !email || !phoneNumber || !phoneNumber) {
            return next(new ErrorHandle("please provide all data", 400))
        }
        let data: IContact;
        let file: Express.MulterS3.File | any = req.file;
        if (file) {
            data.document.publicId = uuid()
            data.document.fileName = file.originalname,
                data.document.file = file.originalname
        }
        data.name = name;
        data.email = email;
        data.phoneNumber = phoneNumber;
        data.query = query

    } catch (error) {
        console.error(error);
        return next(new ErrorHandle("failed to create contact", 500))
    }
});
app.delete("/deleteContact/:id", async (req: Request<{ _id: string }>, res: Response, next: NextFunction) => {
    try {
        const { _id } = req.params;
        if (!_id) {
            return next(new ErrorHandle("please provide id to delete contact", 400))
        }

    } catch (error) {
        console.error(error);
        return next(new ErrorHandle("failed to create contact", 500))
    }
});
app.get("/allContact", async (req: Request<{}, {}, {}, { limit?: number, page?: number, readedByAdmin?: boolean, createdFrom?: Date, createdTill?: Date, name?: string, email?: string, phoneNumber?: string }>, res: Response, next: NextFunction) => {
    try {
        const { name, email, phoneNumber, createdFrom, createdTill, limit, page, readedByAdmin } = req.query
        let data: any[];
        let query: { limit?: number, skip?: number } = {}
        if (name) {
            data.push({ name: { $regex: new RegExp(name, "i") } })
        };
        if (email) {
            data.push({ email: { $regex: new RegExp(email, "i") } })
        };
        if (phoneNumber) {
            data.push({ phoneNumber: { $regex: new RegExp(phoneNumber, "i") } })
        };
        if (createdFrom) {
            data.push({ createdAt: { $gte: createdFrom } })
        };
        if (createdTill) {
            data.push({ createdAt: { $lte: createdTill } })
        };
        if (readedByAdmin) {
            data.push({ readedByAdmin: readedByAdmin })
        }
        query.limit = limit || 10;
        query.skip = ((page || 1) - 1) * limit;
        const result = await contactService.getAllContact(data, query, next);
        if(!result){
            return next(new ErrorHandle("contact not found", 500))
        }
        if (result) {
            res.status(200).json({
                message: "all contects",
                succes: true,
                result
            })
        }
    } catch (error) {
        console.error(error);
        return next(new ErrorHandle("failed to get all contacts", 500))
    }
});
