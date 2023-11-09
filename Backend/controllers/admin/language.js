"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const responseMiddleware_1 = __importDefault(require("../../helper/responseMiddleware"));
const log4js_1 = __importDefault(require("log4js"));
const mongoose_1 = __importDefault(require("mongoose"));
const language_model_1 = __importDefault(require("../../models/language-model"));
const logger = log4js_1.default.getLogger();
const store = (async (req, res) => {
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    try {
        let id = req.body.id;
        const { key, value, is_active } = req.body;
        let languageData = {};
        let message;
        if (id) {
            languageData = await language_model_1.default.findOne({ _id: id });
            message = 'Language updated successfully';
        }
        else {
            languageData = await new language_model_1.default();
            message = 'Language added successfully';
            // languageData.unique_id = uniqid();
        }
        languageData.key = key;
        languageData.value = value;
        const data = await languageData.save();
        await session.commitTransaction();
        await session.endSession();
        const responseData = {
            'message': message,
            'data': data,
        };
        return responseMiddleware_1.default.sendSuccess(req, res, responseData);
    }
    catch (err) {
        const sendResponse = {
            message: err.message,
        };
        logger.info("store language Data");
        logger.info(err);
        await session.abortTransaction();
        session.endSession();
        return responseMiddleware_1.default.sendError(res, sendResponse);
    }
});
const getAll = (async (req, res) => {
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    try {
        let id = req.body.id;
        let data;
        if (id) {
            data = await language_model_1.default.find({ _id: id });
        }
        else {
            data = await language_model_1.default.find();
        }
        await session.commitTransaction();
        await session.endSession();
        let responseData;
        if (!data[0]) {
            responseData = {
                message: "Data not found",
                data: data,
            };
            return responseMiddleware_1.default.sendError(res, responseData);
        }
        else {
            responseData = {
                message: process.env.APP_GET_MESSAGE,
                data: data,
            };
            return responseMiddleware_1.default.sendSuccess(req, res, responseData);
        }
    }
    catch (err) {
        const sendResponse = {
            message: err.message,
        };
        logger.info("store language Data");
        logger.info(err);
        await session.abortTransaction();
        session.endSession();
        return responseMiddleware_1.default.sendError(res, sendResponse);
    }
});
const deleteData = async (req, res) => {
    const session = await mongoose_1.default.startSession();
    try {
        session.startTransaction();
        let id = req.body.id;
        const data = await language_model_1.default.findOneAndDelete({ _id: id });
        await session.commitTransaction();
        session.endSession();
        let responseData = {
            message: "Data deleted successfully",
            data: {},
        };
        return responseMiddleware_1.default.sendResponse(res, responseData);
    }
    catch (err) {
        const sendResponse = {
            message: err,
        };
        logger.info("Error deleting language data");
        logger.error(err);
        await session.abortTransaction();
        session.endSession();
        return responseMiddleware_1.default.sendError(res, sendResponse);
    }
};
const changeStatusLanguage = (async (req, res) => {
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    try {
        let id = req.body.id;
        let status = req.body.status;
        const languageData = await language_model_1.default.findOne({ _id: id });
        languageData.is_active = status;
        await languageData.save();
        const message = `Language ${(status === "true") ? 'On' : 'Off'} successfully`;
        const responseData = {
            'message': message,
            'data': true,
        };
        await session.commitTransaction();
        session.endSession();
        return responseMiddleware_1.default.sendSuccess(req, res, responseData);
    }
    catch (err) {
        const sendResponse = {
            message: err.message,
        };
        logger.info(err.message);
        logger.info(err);
        await session.abortTransaction();
        session.endSession();
        return responseMiddleware_1.default.sendError(res, sendResponse);
    }
});
exports.default = {
    store,
    getAll,
    deleteData,
    changeStatusLanguage
};
