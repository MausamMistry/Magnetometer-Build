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
    "address",
    "createdAt"
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
        const { sensordata, address, devicetoken, day } = req.body;
        const sensorData = {
            sensordata: sensordata,
            address: address,
            devicetoken: devicetoken,
            day
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
        const { devicetoken, sort } = req.body;
        // const matchStage = {
        //     $match: { devicetoken: devicetoken }
        // };
        // const matchStage = {
        //     $match: { $or: [{ devicetoken: devicetoken }, { address: address }] }
        // };
        const matchStage = {
            $match: { $and: [{ devicetoken: devicetoken }, { day: sort }] }
        };
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
const get = (async (req, res) => {
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const { per_page, page, sort_field, sort_direction, type } = req.query;
        let filterText = {
            type: type,
        };
        let filter = req.query.search;
        filter = filter ? filter.replace(" 91", "") : "";
        filter = filter ? filter.replace("%", "") : "";
        let filterTextValue = filter;
        let orders = {};
        let pageFind = page ? (Number(page) - 1) : 0;
        let perPage = per_page == undefined ? 10 : Number(per_page);
        if (sort_field) {
            orders[sort_field] = sort_direction == "ascend" ? 1 : -1;
        }
        else {
            orders = { 'createdAt': -1 };
        }
        if (filterTextValue) {
            let filterTextField = [];
            await allFiled.map(function async(filed) {
                let filedData = {
                    [filed]: {
                        $regex: `${filterTextValue}`, $options: "i"
                    }
                };
                filterTextField.push(filedData);
            });
            filterText = {
                ...filterText,
                $or: filterTextField
            };
        }
        const sensorData = await sensor_model_1.default.aggregate([
            {
                $addFields: {
                    "_id": { $toString: "$_id" }
                }
            },
            { $project: project },
            { $match: filterText },
            { $sort: orders },
            {
                $facet: {
                    total: [{ $count: 'createdAt' }],
                    docs: [{ $addFields: { _id: '$_id' } }],
                },
            },
            { $unwind: '$total' },
            {
                $project: {
                    docs: {
                        $slice: ['$docs', perPage * pageFind, {
                                $ifNull: [perPage, '$total.createdAt']
                            }]
                    },
                    total: '$total.createdAt',
                    limit: { $literal: perPage },
                    page: { $literal: (pageFind + 1) },
                    pages: { $ceil: { $divide: ['$total.createdAt', perPage] } },
                },
            },
        ]);
        console.log("sensorData", sensorData);
        const sendResponse = {
            message: process.env.APP_GET_MESSAGE,
            data: sensorData.length > 0 ? sensorData[0] : {},
        };
        await session.commitTransaction();
        session.endSession();
        return responseMiddleware_1.default.sendSuccess(req, res, sendResponse);
    }
    catch (err) {
        const sendResponse = {
            message: err.message,
        };
        logger.info('Sensor' + ' ' + process.env.APP_GET_MESSAGE);
        logger.info(err);
        await session.abortTransaction();
        session.endSession();
        return responseMiddleware_1.default.sendError(res, sendResponse);
    }
});
const destroy = (async (req, res) => {
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    const { devicetoken } = req.body;
    try {
        await sensor_model_1.default.deleteMany({ devicetoken: devicetoken, });
        const responseData = {
            message: 'Sensor' + ' ' + process.env.APP_DELETE_MESSAGE,
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
        logger.info('Sensor' + ' ' + process.env.APP_DELETE_MESSAGE);
        logger.info(err);
        await session.abortTransaction();
        session.endSession();
        return responseMiddleware_1.default.sendError(res, sendResponse);
    }
});
exports.default = {
    store,
    getSensorData,
    get,
    destroy
};
