import { ErrorHandle } from "../utils/errorHandling.js";
import { ContactRepository } from "../dataBase/repository/contact.js";
export class ContactService {
    constructor() {
        this.contactRepository = new ContactRepository();
    }
    async createContact(data, next) {
        try {
            if (!data) {
                return next(new ErrorHandle("please provide contact data to delete", 400));
            }
        }
        catch (error) {
            console.error(error);
            return next(new ErrorHandle("failed to create contact", 400));
        }
    }
    async updateContact(data, _id, next) {
        try {
            if (!_id) {
                return next(new ErrorHandle("please provide contact id to update", 400));
            }
            ;
            if (!data) {
                return next(new ErrorHandle("please provide contact data to update", 400));
            }
        }
        catch (error) {
            console.error(error);
            return next(new ErrorHandle("failed to update contact", 500));
        }
    }
    async deleteContact(_id, next) {
        try {
            if (_id) {
                return next(new ErrorHandle("please provide id to delete contact", 400));
            }
        }
        catch (error) {
            console.error(error);
            return next(new ErrorHandle("failed to delete contact", 500));
        }
    }
    async getAllContact(data, query, next) {
        try {
            if (!data || !query) {
                return next(new ErrorHandle("please provide query data to search", 400));
            }
            const result = await this.contactRepository.getAllContact(data, query, next);
            return result;
        }
        catch (error) {
            console.error(error);
            return next(new ErrorHandle("failed to get contacts", 500));
        }
    }
}
