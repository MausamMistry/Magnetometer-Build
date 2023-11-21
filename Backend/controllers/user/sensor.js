"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const responseMiddleware_1 = __importDefault(require("../../helper/responseMiddleware"));
const log4js_1 = __importDefault(require("log4js"));
const logger = log4js_1.default.getLogger();
const sensor_model_1 = __importDefault(require("../../models/sensor-model"));
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ===========================================  sensor Create on sensot Request =====================================//
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const store = async (req, res) => {
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const { sensordata, devicetoken } = req.body;
        const sensorData = {
            sensordata: sensordata,
            devicetoken: devicetoken
        };
        const sensorReq = await sensor_model_1.default.create(sensorData);
        if (!sensorReq) {
            const sendResponse = {
                message: process.env.APP_SR_NOT_MESSAGE,
            };
            return responseMiddleware_1.default.sendError(res, sendResponse);
        }
        const responseData = {
            message: process.env.APP_SUCCESS_MESSAGE,
            data: sensorReq
        };
        await session.commitTransaction();
        await session.endSession();
        return responseMiddleware_1.default.sendSuccess(req, res, responseData);
    }
    catch (err) {
        const sendResponse = {
            message: err.message,
        };
        logger.info('sensor' + process.env.APP_ERROR_MESSAGE);
        logger.info(err);
        await session.abortTransaction();
        session.endSession();
        return responseMiddleware_1.default.sendError(res, sendResponse);
    }
};
const getSensorData = async (req, res) => {
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const { devicetoken } = req.body;
        const matchStage = {
            $match: { devicetoken: devicetoken }
        };
        const pipeline = [
            matchStage,
        ];
        let sensorData = await sensor_model_1.default.aggregate(pipeline).exec();
        sensorData = JSON.parse(JSON.stringify(sensorData));
        if (!sensorData[0]) {
            const responseData = {
                message: "Data not Found with this token",
            };
            return await responseMiddleware_1.default.sendError(res, responseData);
        }
        const responseData = {
            message: "Sensor Details get successfully",
            data: sensorData[0],
        };
        return await responseMiddleware_1.default.sendSuccess(req, res, responseData);
    }
    catch (err) {
        const sendResponse = {
            message: err.message,
        };
        logger.info(err);
        await session.abortTransaction();
        session.endSession();
        return responseMiddleware_1.default.sendError(res, sendResponse);
    }
};
exports.default = {
    store,
    getSensorData
};
