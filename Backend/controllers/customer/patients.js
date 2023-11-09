"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const responseMiddleware_1 = __importDefault(require("../../helper/responseMiddleware"));
const log4js_1 = __importDefault(require("log4js"));
const mongoose_1 = __importDefault(require("mongoose"));
const patient_model_1 = __importDefault(require("../../models/patient-model"));
const logger = log4js_1.default.getLogger();
const store = (async (req, res) => {
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    try {
        let id = req.body.id;
        const { clinic_id, clinicians_id, name, email, dob, address, phone_no, city, zipcode, insurance_company_name, gender } = req.body;
        const doctor_id = req.user._id;
        console.log(req.user._id);
        let languageData = {};
        let message;
        if (id) {
            languageData = await patient_model_1.default.findOne({ _id: id });
            message = 'Language updated successfully';
        }
        else {
            const mobileExists = await patient_model_1.default.findOne({ phone_no: phone_no });
            if (mobileExists) {
                return responseMiddleware_1.default.sendError(res, { message: 'Mobile number already exists.' });
            }
            languageData = await new patient_model_1.default();
            message = 'Language added successfully';
            // languageData.unique_id = uniqid();
        }
        languageData.doctor_id = doctor_id;
        languageData.clinic_id = clinic_id;
        languageData.clinicians_id = clinicians_id;
        languageData.name = name;
        languageData.email = email;
        languageData.dob = dob;
        languageData.address = address;
        languageData.phone_no = phone_no;
        languageData.city = city;
        languageData.zipcode = zipcode;
        languageData.insurance_company_name = insurance_company_name;
        languageData.gender = gender;
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
const getAll = async (req, res) => {
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    try {
        let id = req.body.id;
        let limit = parseInt(req.body.limit) || 50; // Default limit is 50
        let page = parseInt(req.body.page) || 1; // Default page is 1
        let skip = (page - 1) * limit;
        // Calculate total count of data
        let totalCount;
        if (id) {
            totalCount = await patient_model_1.default.countDocuments({ _id: id });
        }
        else {
            totalCount = await patient_model_1.default.countDocuments();
        }
        let data;
        if (id) {
            data = await patient_model_1.default.find({ _id: id });
        }
        else {
            data = await patient_model_1.default.find().skip(skip).limit(limit);
        }
        let dataStore = {
            totalCount: totalCount,
            totalPages: Math.ceil(totalCount / limit),
            data: data,
        };
        await session.commitTransaction();
        await session.endSession();
        let responseData;
        if (!data[0]) {
            responseData = {
                message: "Data not found",
                data: dataStore
            };
            return responseMiddleware_1.default.sendError(res, responseData);
        }
        else {
            responseData = {
                message: process.env.APP_GET_MESSAGE,
                data: dataStore,
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
};
const destroy = async (req, res) => {
    const session = await mongoose_1.default.startSession();
    try {
        session.startTransaction();
        let id = req.body.id;
        const data = await patient_model_1.default.findOneAndDelete({ _id: id });
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
exports.default = {
    store,
    getAll,
    destroy,
};
