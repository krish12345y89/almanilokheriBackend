import { ContactService } from "../../service/contact.js";
import { ErrorHandle } from "../../utils/errorHandling.js";
import { Contact } from "../models/cantact.js";
export class ContactRepository {
    constructor() {
        this.contactService = new ContactService();
    }
    async createContact(data, next) {
        try {
            if (!data) {
                return next(new ErrorHandle("please provide data to create conntact", 400));
            }
            const result = await Contact.create(data);
            if (result) {
                return result;
            }
        }
        catch (error) {
            console.error(error);
            return next(new ErrorHandle("failed to create contact", 500));
        }
    }
    async updateContact(data, _id, next) {
        try {
            const contact = await Contact.findById(_id);
            if (!contact) {
                return next(new ErrorHandle("contact not found", 500));
            }
            const result = await Contact.findByIdAndUpdate(_id, data, { new: true });
            return result;
        }
        catch (error) {
            console.error(error);
            return next(new ErrorHandle("failed to update contact", 500));
        }
    }
    async getContact(_id, next) {
        try {
            const result = await Contact.findById(_id);
            if (!result) {
                return next(new ErrorHandle("contact not found", 500));
            }
            return result;
        }
        catch (error) {
            console.error(error);
            return next(new ErrorHandle("failed to update contact", 500));
        }
    }
    async getAllContact(data, query, next) {
        try {
            const result = await Contact.find({ ...data }).limit(query.limit).skip(query.skip);
            if (!result) {
                return next(new ErrorHandle("contacts not found", 400));
            }
            return result;
        }
        catch (error) {
            console.error(error);
            return next(new ErrorHandle("failed to get all contacts", 500));
        }
    }
}
