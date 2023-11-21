"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const responseMiddleware_1 = __importDefault(require("../../helper/responseMiddleware"));
const log4js_1 = __importDefault(require("log4js"));
const logger = log4js_1.default.getLogger();
const cms_model_1 = __importDefault(require("../../models/cms-model"));
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ============================================= Over Here Include Library =============================================
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// *******************************************************************************************
// =========================== Get Data With Pagination And Filter ===========================
// *******************************************************************************************
const get = (async (req, res) => {
    try {
        const data = await cms_model_1.default.find();
        let fees_map = {};
        fees_map = await new Map(data.map((values) => [
            values.key, values.value
        ]));
        let feesMapArray = await Object.fromEntries(fees_map.entries());
        const sendResponse = {
            data: feesMapArray ? feesMapArray : {},
            message: 'CMS' + process.env.APP_GET_MESSAGE,
        };
        return responseMiddleware_1.default.sendSuccess(req, res, sendResponse);
    }
    catch (err) {
        const sendResponse = {
            message: err.message,
        };
        logger.info('CMS' + process.env.APP_GET_MESSAGE);
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
        const { about_us, who_we_are, terms_condition, privacy_policy, our_services, mission, brochure, vision, get_our_mobile_app, training_matirial } = req.body;
        await cms_model_1.default.updateOne({ key: 'about_us' }, { $set: { value: about_us } });
        await cms_model_1.default.updateOne({ key: 'who_we_are' }, { $set: { value: who_we_are } });
        await cms_model_1.default.updateOne({ key: 'terms_condition' }, { $set: { value: terms_condition } });
        await cms_model_1.default.updateOne({ key: 'privacy_policy' }, { $set: { value: privacy_policy } });
        await cms_model_1.default.updateOne({ key: 'our_services' }, { $set: { value: our_services } });
        await cms_model_1.default.updateOne({ key: 'vision' }, { $set: { value: vision } });
        await cms_model_1.default.updateOne({ key: 'mission' }, { $set: { value: mission } });
        await cms_model_1.default.updateOne({ key: 'brochure' }, { $set: { value: brochure } });
        await cms_model_1.default.updateOne({ key: 'get_our_mobile_app' }, { $set: { value: get_our_mobile_app } });
        await cms_model_1.default.updateOne({ key: 'training_matirial' }, { $set: { value: training_matirial } });
        await session.commitTransaction();
        await session.endSession();
        const sendResponse = {
            message: 'CMS' + process.env.APP_UPDATE_MESSAGE
        };
        return responseMiddleware_1.default.sendSuccess(req, res, sendResponse);
    }
    catch (err) {
        const sendResponse = {
            message: err.message,
        };
        logger.info('CMS' + process.env.APP_UPDATE_MESSAGE);
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
