import { ContactService } from "../../service/contact.js";
import { ErrorHandle } from "../../utils/errorHandling.js";
import { Contact, IContact } from "../models/cantact.js";
import { NextFunction } from "express";

export class ContactRepository {
    private contactService: ContactService;
    constructor() {
        this.contactService = new ContactService();
    }

    async createContact(data: IContact, next: NextFunction) {
        try {
            if (!data) {
                return next(new ErrorHandle("please provide data to create conntact", 400))
            }
            const result = await Contact.create(data);
            if (result) {
                return result;
            }
        } catch (error) {
            console.error(error);
            return next(new ErrorHandle("failed to create contact", 500))
        }
    }
    async updateContact(data: IContact, _id: string, next: NextFunction) {
        try {
            const contact = await Contact.findById(_id);
            if (!contact) {
                return next(new ErrorHandle("contact not found", 500))
            }
            const result = await Contact.findByIdAndUpdate(_id, data, { new: true });
            return result
        } catch (error) {
            console.error(error);
            return next(new ErrorHandle("failed to update contact", 500))
        }
    }
    async getContact(_id:string,next:NextFunction){
        try {
            const result = await Contact.findById(_id);
            if(!result){
                return next(new ErrorHandle("contact not found", 500))
            }
            return result;
        } catch (error) {
            console.error(error);
            return next(new ErrorHandle("failed to update contact", 500))
        }
    }
    async getAllContact(data:any[],query:{limit:number,skip:number},next:NextFunction){
        try {
            const result=await Contact.find({...data}).limit(query.limit).skip(query.skip);
            if(!result){
                return next(new ErrorHandle("contacts not found", 400))
            }
            return result;
        } catch (error) {
            console.error(error)
            return next(new ErrorHandle("failed to get all contacts", 500))
        }
    }
}