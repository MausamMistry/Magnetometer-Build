"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const responseMiddleware_1 = __importDefault(require("../../helper/responseMiddleware"));
const log4js_1 = __importDefault(require("log4js"));
const logger = log4js_1.default.getLogger();
const user_model_1 = __importDefault(require("../../models/user-model"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const uniqid_1 = __importDefault(require("uniqid"));
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ============================================= Over Here Include Library =============================================
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// *******************************************************************************************
// =========================== Get Data With Pagination And Filter ===========================
// *******************************************************************************************
const allFiled = [
    "_id",
    "first_name",
    "last_name",
    "user_name",
    "mobile_no",
    "email",
    "type",
    "profile_photo",
    "location",
    "date_of_birth",
    "password",
    "unique_id",
    "is_active",
    "email_is_active",
    "firebase_is_active",
    "current_commission",
    "commission_sing",
    "createdAt",
    "company_name",
    "upload_brochure",
    "serviceTypeData._id",
    "serviceTypeData.name",
];
let project = {};
const getAllFiled = async () => {
    await allFiled.map(function async(item) {
        project[item] = 1;
    });
};
getAllFiled();
const getAll = (async (req, res) => {
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const userData = await user_model_1.default.aggregate([
            {
                $project: {
                    "_id": 1,
                    "first_name": 1,
                    "last_name": 1,
                    "user_name": 1,
                    "type": 1,
                    "mobile_no": 1,
                    "email": 1,
                    "profile_photo": 1,
                    "location": 1,
                    "is_active": 1,
                }
            },
        ]);
        const sendResponse = {
            'message': process.env.APP_GET_MESSAGE,
            'data': userData.length > 0 ? userData : {},
        };
        await session.commitTransaction();
        session.endSession();
        return responseMiddleware_1.default.sendSuccess(req, res, sendResponse);
    }
    catch (err) {
        const sendResponse = {
            message: err.message,
        };
        logger.info("User Data get");
        logger.info(err);
        await session.abortTransaction();
        session.endSession();
        return responseMiddleware_1.default.sendError(res, sendResponse);
    }
});
const get = (async (req, res) => {
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const { per_page, page, sort_field, sort_direction, type } = req.query;
        let filterText = {
            type: type,
        };
        let filter = req.query.search;
        filter = filter.replace(" 91", "");
        filter = filter.replace("%", "");
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
            if (mongoose_1.default.Types.ObjectId.isValid(filterTextValue)) {
                filterText = {
                    $or: [
                        { _id: new mongoose_1.default.Types.ObjectId(filterTextValue) },
                    ],
                };
            }
        }
        const userData = await user_model_1.default.aggregate([
            {
                $lookup: {
                    from: "service_types",
                    localField: "service_type_id",
                    foreignField: "_id",
                    as: "serviceTypeData",
                },
            },
            {
                $unwind: { path: "$serviceTypeData", preserveNullAndEmptyArrays: true },
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
        const sendResponse = {
            'message': process.env.APP_GET_MESSAGE,
            'data': userData.length > 0 ? userData[0] : {},
        };
        await session.commitTransaction();
        session.endSession();
        return responseMiddleware_1.default.sendSuccess(req, res, sendResponse);
    }
    catch (err) {
        const sendResponse = {
            message: err.message,
        };
        logger.info("User Data get");
        logger.info(err);
        await session.abortTransaction();
        session.endSession();
        return responseMiddleware_1.default.sendError(res, sendResponse);
    }
});
// *******************************************************************************************
// ===================================== Delete Record  ======================================
// *******************************************************************************************
const destroy = (async (req, res) => {
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    try {
        await user_model_1.default.deleteMany({ _id: req.query.id, });
        const responseData = {
            'message': 'User record has been deleted',
            'data': {},
        };
        await session.commitTransaction();
        session.endSession();
        return responseMiddleware_1.default.sendSuccess(req, res, responseData);
    }
    catch (err) {
        const sendResponse = {
            message: err.message,
        };
        logger.info("User destroy");
        logger.info(err);
        await session.abortTransaction();
        session.endSession();
        return responseMiddleware_1.default.sendError(res, sendResponse);
    }
});
// *******************************************************************************************
// =================================== Edit the Record Data ==================================
// *******************************************************************************************
const getData = (async (id) => {
    const userData = await user_model_1.default.aggregate([
        { $match: { "_id": new mongoose_1.default.Types.ObjectId(id) } },
        { $project: project },
    ]);
    return userData.length > 0 ? userData[0] : {};
});
const edit = (async (req, res) => {
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    try {
        let id = req.query.id;
        const responseData = {
            'message': 'User edit data get successfully',
            'data': await getData(id),
        };
        await session.commitTransaction();
        session.endSession();
        return responseMiddleware_1.default.sendSuccess(req, res, responseData);
    }
    catch (err) {
        const sendResponse = {
            message: err.message,
        };
        logger.info("User data has been get successfully");
        logger.info(err);
        await session.abortTransaction();
        session.endSession();
        return responseMiddleware_1.default.sendError(res, sendResponse);
    }
});
// *******************************************************************************************
// ================================= Change Status of Record =================================
// *******************************************************************************************
const changeStatus = (async (req, res) => {
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    try {
        let id = req.body.id;
        let status = req.body.status;
        const userData = await user_model_1.default.findOne({ _id: id });
        userData.is_active = status;
        await userData.save();
        const message = `User status ${(status === "true") ? 'Approved' : 'Rejected'} successfully`;
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
const changeStatusFirebase = (async (req, res) => {
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    try {
        let id = req.body.id;
        let status = req.body.status;
        const userData = await user_model_1.default.findOne({ _id: id });
        userData.firebase_is_active = status;
        await userData.save();
        const message = `User Firebase Notification status ${(status === "true") ? 'Approved' : 'Not Allowed'} successfully`;
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
const changeStatusEmail = (async (req, res) => {
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    try {
        let id = req.body.id;
        let status = req.body.status;
        const userData = await user_model_1.default.findOne({ _id: id });
        userData.email_is_active = status;
        await userData.save();
        const message = `User Email Notifcation status ${(status === "true") ? 'Allowed' : 'Not Allowed'} successfully`;
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
// *******************************************************************************************
// ================================= Store Record In Database =================================
// *******************************************************************************************
const store = (async (req, res) => {
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    try {
        let id = req.body.id;
        const { first_name, last_name, user_name, mobile_no, email, profile_photo, location, date_of_birth } = req.body;
        let userData = {};
        let message;
        if (id) {
            userData = await user_model_1.default.findOne({ _id: id });
            message = 'User updated successfully';
        }
        else {
            userData = await new user_model_1.default();
            message = 'User added successfully';
            userData.unique_id = (0, uniqid_1.default)();
        }
        userData.first_name = first_name;
        userData.last_name = last_name;
        userData.user_name = user_name;
        userData.mobile_no = mobile_no;
        userData.email = email;
        userData.profile_photo = profile_photo;
        userData.location = location;
        userData.date_of_birth = date_of_birth;
        await userData.save();
        await session.commitTransaction();
        await session.endSession();
        const responseData = {
            'message': message,
            'data': await getData(userData._id),
        };
        return responseMiddleware_1.default.sendSuccess(req, res, responseData);
    }
    catch (err) {
        const sendResponse = {
            message: err.message,
        };
        logger.info("store User Data");
        logger.info(err);
        await session.abortTransaction();
        session.endSession();
        return responseMiddleware_1.default.sendError(res, sendResponse);
    }
});
const changeUserPassword = async (req, res) => {
    try {
        const { user_id, password, updated_by } = req.body;
        // @ts-ignore
        // const user_id = req?.customer?._id;
        const userData = await user_model_1.default.findOne({
            _id: new mongoose_1.default.Types.ObjectId(user_id),
        });
        if (userData) {
            const passwordhash = await bcrypt_1.default.hash(password, Number(10));
            await user_model_1.default.findByIdAndUpdate(new mongoose_1.default.Types.ObjectId(user_id), {
                password: passwordhash,
                updated_by: updated_by,
            }, {
                new: true,
            });
            const sendResponse = {
                message: "password changed successfully",
            };
            return responseMiddleware_1.default.sendSuccess(req, res, sendResponse);
        }
        else {
            const sendResponse = {
                message: "Oops, provide password is incorrect-+",
            };
            return responseMiddleware_1.default.sendError(res, sendResponse);
        }
    }
    catch (err) {
        const sendResponse = {
            message: err.message,
        };
        logger.info("change Password");
        logger.info(err);
        return responseMiddleware_1.default.sendError(res, sendResponse);
    }
};
// Export default
exports.default = {
    get,
    getAll,
    store,
    changeStatus,
    changeStatusFirebase,
    changeStatusEmail,
    edit,
    destroy,
    changeUserPassword
};
