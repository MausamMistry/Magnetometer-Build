"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const responseMiddleware_1 = __importDefault(require("../../helper/responseMiddleware"));
const log4js_1 = __importDefault(require("log4js"));
const logger = log4js_1.default.getLogger();
const our_contact_us_model_1 = __importDefault(require("../../models/our-contact-us-model"));
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ============================================= Over Here Include Library =============================================
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// *******************************************************************************************
// =========================== Get Data With Pagination And Filter ===========================
// *******************************************************************************************
const get = (async (req, res) => {
    try {
        const data = await our_contact_us_model_1.default.find();
        let fees_map = {};
        fees_map = await new Map(data.map((values) => [
            values.key, values.value
        ]));
        let feesMapArray = await Object.fromEntries(fees_map.entries());
        const sendResponse = {
            data: feesMapArray,
            message: "Our Contact Us get successfully",
        };
        return responseMiddleware_1.default.sendSuccess(req, res, sendResponse);
    }
    catch (err) {
        const sendResponse = {
            message: err.message,
        };
        logger.info("Our Contact Us get");
        logger.info(err);
        return responseMiddleware_1.default.sendError(res, sendResponse);
    }
});
// *******************************************************************************************
// ================================= Store Record In Database =================================
// *******************************************************************************************
const store = (async (req, res) => {
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const { contact_no, email, website, location, admin_email } = req.body;
        // await OurContactUs.create({ key: 'contact_no' ,value: contact_no });
        // await OurContactUs.create({ key: 'email', value: email });
        // await OurContactUs.create({ key: 'website',value: website });
        // await OurContactUs.create({ key: 'location', value: location });
        // await OurContactUs.create({key:'admin_email',value: admin_email })
        await our_contact_us_model_1.default.updateOne({ key: 'contact_no' }, { $set: { value: contact_no } });
        await our_contact_us_model_1.default.updateOne({ key: 'email' }, { $set: { value: email } });
        await our_contact_us_model_1.default.updateOne({ key: 'website' }, { $set: { value: website } });
        await our_contact_us_model_1.default.updateOne({ key: 'location' }, { $set: { value: location } });
        await our_contact_us_model_1.default.updateOne({ key: 'admin_email' }, { $set: { value: admin_email } });
        await session.commitTransaction();
        await session.endSession();
        const sendResponse = {
            'message': 'store Our Contact Us data successfully',
        };
        return responseMiddleware_1.default.sendSuccess(req, res, sendResponse);
    }
    catch (err) {
        const sendResponse = {
            message: err.message,
        };
        logger.info("Our Contact Us data store in db");
        logger.info(err);
        await session.abortTransaction();
        session.endSession();
        return responseMiddleware_1.default.sendError(res, sendResponse);
    }
});
// Export default
exports.default = {
    get,
    store,
};
