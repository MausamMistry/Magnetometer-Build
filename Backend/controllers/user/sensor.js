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
const allFiled = [
    "_id",
    "devicetoken",
    "sensordata",
    "address"
];
let project = {};
const getAllFiled = async () => {
    await allFiled.map(function async(item) {
        project[item] = 1;
    });
};
getAllFiled();
const getData = (async (devicetoken) => {
    const sensorDatas = await sensor_model_1.default.aggregate([
        { $match: { "devicetoken": devicetoken } },
        { $project: project }
    ]);
    return sensorDatas.length > 0 ? sensorDatas[0] : {};
});
const store = async (req, res) => {
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const { sensordata, address, devicetoken } = req.body;
        const sensorData = {
            sensordata: sensordata,
            address: address,
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
        session.endSession();
        return responseMiddleware_1.default.sendSuccess(req, res, responseData);
        // if (devicetoken) {
        //     const data = await getData(devicetoken);
        //     if (Object.keys(data).length !== 0 && data.constructor === Object) {
        //         const updateData: any = [];
        //         data.sensordata.map((key: any) => {
        //             updateData.push(key);
        //         })
        //         sensordata.map((key: any) => {
        //             updateData.push(key);
        //         })
        //         await SensorModel.findOneAndUpdate({devicetoken: devicetoken}, { $set: { sensordata: updateData, address: address ? address :  data.address }});
        //         const responseData = {
        //             message: process.env.APP_SUCCESS_MESSAGE,
        //             data: await getData(devicetoken)
        //         };
        //         await session.commitTransaction();
        //         session.endSession();
        //         return response.sendSuccess(req, res, responseData);
        //     } else {
        //         const sensorReq: any = await SensorModel.create(sensorData);
        //         if (!sensorReq) {
        //             const sendResponse: any = {
        //                 message: process.env.APP_SR_NOT_MESSAGE,
        //             };
        //             return response.sendError(res, sendResponse);
        //         }
        //         const responseData = {
        //             message: process.env.APP_SUCCESS_MESSAGE,
        //             data: sensorReq
        //         };
        //         await session.commitTransaction();
        //         session.endSession();
        //         return response.sendSuccess(req, res, responseData);
        //     }
        //     // const responseData: any = {
        //     //     message: 'Sensor data' + process.env.APP_UPDATE_MESSAGE,
        //     //     data: await getData(devicetoken),
        //     // };
        //     // await session.commitTransaction();
        //     // session.endSession();
        //     // return response.sendSuccess(req, res, responseData);
        // }
        // await session.commitTransaction();
        // await session.endSession();
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
        // const matchStage = {
        //     $match: { $or: [{ devicetoken: devicetoken }, { address: address }] }
        // };
        const pipeline = [
            matchStage
        ];
        let sensorData = await sensor_model_1.default.aggregate(pipeline).exec();
        sensorData = JSON.parse(JSON.stringify(sensorData));
        if (!sensorData[0]) {
            const responseData = {
                message: "Data not Found.",
            };
            return await responseMiddleware_1.default.sendError(res, responseData);
        }
        const responseData = {
            message: "Sensor Details get successfully",
            data: sensorData,
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
const destroy = (async (req, res) => {
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    const { devicetoken } = req.body;
    try {
        await sensor_model_1.default.deleteMany({ devicetoken: devicetoken, });
        const responseData = {
            message: 'Sensor' + process.env.APP_DELETE_MESSAGE,
            data: [],
        };
        await session.commitTransaction();
        session.endSession();
        return responseMiddleware_1.default.sendSuccess(req, res, responseData);
    }
    catch (err) {
        const sendResponse = {
            message: err.message,
        };
        logger.info('Sensor' + process.env.APP_DELETE_MESSAGE);
        logger.info(err);
        await session.abortTransaction();
        session.endSession();
        return responseMiddleware_1.default.sendError(res, sendResponse);
    }
});
exports.default = {
    store,
    getSensorData,
    destroy
};
