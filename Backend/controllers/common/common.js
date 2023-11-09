"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const responseMiddleware_1 = __importDefault(require("../../helper/responseMiddleware"));
const fs_1 = __importDefault(require("fs"));
const aws_1 = __importDefault(require("../../helper/aws"));
const jwt_1 = __importDefault(require("../../helper/jwt"));
const mongoose_1 = __importDefault(require("mongoose"));
const category_model_1 = __importDefault(require("../../models/category-model"));
const contactus_model_1 = __importDefault(require("../../models/contactus-model"));
const admin_model_1 = __importDefault(require("../../models/admin-model"));
const user_model_1 = __importDefault(require("../../models/user-model"));
const chat_model_1 = __importDefault(require("../../models/chat-model"));
const sizeImage_1 = require("../../helper/sizeImage");
const cms_model_1 = __importDefault(require("../../models/cms-model"));
const faq_model_1 = __importDefault(require("../../models/faq-model"));
const social_media_model_1 = __importDefault(require("../../models/social-media-model"));
const our_contact_us_model_1 = __importDefault(require("../../models/our-contact-us-model"));
const otp_model_1 = __importDefault(require("../../models/otp-model"));
const commonFunction_1 = __importDefault(require("../../helper/commonFunction"));
const service_type_model_1 = __importDefault(require("../../models/service-type-model"));
const log4js = require("log4js");
const logger = log4js.getLogger();
const otpVerification = async (req, res) => {
    try {
        const { otp, token } = req.body;
        if (!token) {
            const sendResponse = {
                message: "token is not valid or missing",
            };
            return responseMiddleware_1.default.sendAuthError(res, sendResponse);
        }
        const clientData = await jwt_1.default.decode(token);
        const getOtp = await otp_model_1.default.findOne({
            // user_id: new mongoose.Types.ObjectId(clientData.user_id),
            token: token,
        });
        const matchOtp = getOtp.otp == otp;
        if (!matchOtp) {
            const sendResponse = {
                message: "OTP is incorrect",
                data: {},
            };
            return responseMiddleware_1.default.sendAuthError(res, sendResponse);
        }
        const expired = new Date(clientData.expiry) <= new Date();
        if (expired) {
            const sendResponse = {
                message: "OTP is incorrect or Expired",
                data: {},
            };
            return responseMiddleware_1.default.sendAuthError(res, sendResponse);
        }
        const passwordResetToken = await jwt_1.default.sign({
            otp: otp,
            user_id: clientData.user_id,
            mobile_no: clientData.mobile_no,
        });
        // await OtpModel.findByIdAndUpdate(getOtp._id, {
        //     token: passwordResetToken,
        //     isVerified: true,
        //     isActive: false,
        // });
        await otp_model_1.default.findByIdAndDelete(getOtp._id);
        const sendResponse = {
            // data: null,
            token: passwordResetToken,
            message: "OTP Verified",
            data: {}
        };
        return responseMiddleware_1.default.sendSuccess(req, res, sendResponse);
    }
    catch (err) {
        const sendResponse = {
            // data: err.message,
            message: "OTP Expired",
        };
        return responseMiddleware_1.default.sendError(res, sendResponse);
    }
};
const uploadFiles = async (req, res) => {
    try {
        const imagePath = req.files[0].path;
        const blob = fs_1.default.readFileSync(imagePath);
        const originalFile = req.files[0].originalname;
        if (imagePath && blob) {
            let imageName = "file/" + Date.now() + originalFile;
            const uploadedImageData = await aws_1.default.uploadFileToS3(imageName, blob);
            fs_1.default.unlinkSync(req.files[0].path);
            const responseData = {
                data: {
                    url: uploadedImageData.Location,
                },
                message: "upload files successfully",
            };
            return responseMiddleware_1.default.sendResponse(res, responseData);
        }
    }
    catch (err) {
        const sendResponse = {
            message: err.message,
        };
        logger.info("uploadImage");
        logger.info(err);
        return responseMiddleware_1.default.sendError(res, sendResponse);
    }
};
const uploadVideo = async (req, res) => {
    try {
        const imagePath = req.files[0].path;
        const type = req.query.type;
        const blob = fs_1.default.readFileSync(imagePath);
        const originalFile = req.files[0].originalname;
        if (imagePath && blob) {
            let imageName = "admin/" + Date.now() + originalFile;
            if (Number(type) === 11) {
                imageName = "chat/video/" + Date.now() + originalFile;
            }
            if (Number(type) === 12) {
                imageName = "chat/audio/" + Date.now() + originalFile;
            }
            const uploadedImageData = await aws_1.default.uploadFileToS3(imageName, blob);
            fs_1.default.unlinkSync(req.files[0].path);
            const responseData = {
                data: {
                    image_url: uploadedImageData.Location,
                },
                message: "upload video successfully",
            };
            return responseMiddleware_1.default.sendResponse(res, responseData);
        }
    }
    catch (err) {
        const sendResponse = {
            message: err.message,
        };
        logger.info("uploadImage");
        logger.info(err);
        return responseMiddleware_1.default.sendError(res, sendResponse);
    }
};
const uploadImage = async (req, res) => {
    try {
        const imagePath = req.files[0].path;
        const type = req.query.type;
        const blob = fs_1.default.readFileSync(imagePath);
        const originalFile = req.files[0].originalname;
        if (imagePath && blob) {
            let imageName = "admin/" + Date.now() + originalFile;
            if (Number(type) === 1) {
                imageName = "admin/" + Date.now() + originalFile;
            }
            if (Number(type) === 2) {
                imageName = "chat/" + Date.now() + originalFile;
            }
            if (Number(type) === 3) {
                imageName = "customer/" + Date.now() + originalFile;
            }
            if (Number(type) === 4) {
                imageName = "vendor/" + Date.now() + originalFile;
            }
            if (Number(type) === 5) {
                imageName = "contact_us/" + Date.now() + originalFile;
            }
            if (Number(type) === 6) {
                imageName = "service_request/" + Date.now() + originalFile;
            }
            if (Number(type) === 7) {
                imageName = "bid_signature/" + Date.now() + originalFile;
            }
            if (Number(type) === 11) {
                imageName = "bid_photo/" + Date.now() + originalFile;
            }
            if (Number(type) === 8) {
                imageName = "our_services/" + Date.now() + originalFile;
            }
            if (Number(type) === 9) {
                imageName = "social_icon/" + Date.now() + originalFile;
            }
            if (Number(type) === 10) {
                imageName = "dispute/" + Date.now() + originalFile;
            }
            if (Number(type) === 11) {
                imageName = "accomplishment_report/" + Date.now() + originalFile;
            }
            if (Number(type) === 12) {
                imageName = "service_type/" + Date.now() + originalFile;
            }
            let comparessedImageData = await (0, sizeImage_1.reSizeImage)(blob, 400, 400);
            if (Number(type) === 7) {
                comparessedImageData = await (0, sizeImage_1.nonReSizeImage)(blob);
            }
            const uploadedImageData = await aws_1.default.uploadImageToS3(imageName, comparessedImageData);
            fs_1.default.unlinkSync(req.files[0].path);
            const responseData = {
                data: {
                    image_url: uploadedImageData.Location,
                },
                message: "upload image successfully",
            };
            return responseMiddleware_1.default.sendResponse(res, responseData);
        }
    }
    catch (err) {
        const sendResponse = {
            message: err.message,
        };
        logger.info("uploadImage");
        logger.info(err);
        return responseMiddleware_1.default.sendError(res, sendResponse);
    }
};
const uploadImageMulti = async (req, res) => {
    try {
        let imgData = [];
        req.files.map(async (val, i) => {
            const imagePath = req.files[i].path;
            const type = req.query.type;
            const blob = fs_1.default.readFileSync(imagePath);
            const originalFile = req.files[i].originalname;
            if (imagePath && blob) {
                let imageName = "admin/" + Date.now() + originalFile;
                if (Number(type) === 1) {
                    imageName = "admin/" + Date.now() + originalFile;
                }
                if (Number(type) === 2) {
                    imageName = "chat/" + Date.now() + originalFile;
                }
                if (Number(type) === 3) {
                    imageName = "customer/" + Date.now() + originalFile;
                }
                if (Number(type) === 4) {
                    imageName = "vendor/" + Date.now() + originalFile;
                }
                if (Number(type) === 5) {
                    imageName = "contact_us/" + Date.now() + originalFile;
                }
                if (Number(type) === 6) {
                    imageName = "service_request/" + Date.now() + originalFile;
                }
                if (Number(type) === 7) {
                    imageName = "bid_signature/" + Date.now() + originalFile;
                }
                if (Number(type) === 8) {
                    imageName = "our_services/" + Date.now() + originalFile;
                }
                if (Number(type) === 9) {
                    imageName = "social_icon/" + Date.now() + originalFile;
                }
                // const uploadedImageData: any = await aws.uploadImageToS3(imageName, blob);
                const comparessedImageData = await (0, sizeImage_1.reSizeImage)(blob, 400, 400);
                const uploadedImageData = await aws_1.default.uploadImageToS3(imageName, comparessedImageData);
                imgData.push(uploadedImageData.Location);
                fs_1.default.unlinkSync(req.files[i].path);
            }
            if (imgData.length === req.files.length) {
                const responseData = {
                    data: imgData,
                    message: "upload image successfully",
                };
                return responseMiddleware_1.default.sendResponse(res, responseData);
            }
        });
    }
    catch (err) {
        const sendResponse = {
            message: err.message,
        };
        logger.info("upload Image Multipal ");
        logger.info(err);
        return responseMiddleware_1.default.sendError(res, sendResponse);
    }
};
const getCategory = async (req, res) => {
    try {
        const categoryData = await category_model_1.default.aggregate([
            commonFunction_1.default.isActive(),
            {
                $project: {
                    _id: 1,
                    is_active: 1,
                    parent_id: 1,
                    name: 1,
                },
            },
        ]);
        const sendResponse = {
            message: process.env.APP_GET_MESSAGE,
            data: categoryData,
        };
        return responseMiddleware_1.default.sendSuccess(req, res, sendResponse);
    }
    catch (err) {
        const sendResponse = {
            message: err.message,
        };
        logger.info("get Category");
        logger.info(err);
        return responseMiddleware_1.default.sendError(res, sendResponse);
    }
};
const GetActiveAdmin = async (req, res) => {
    try {
        const adminData = await admin_model_1.default.aggregate([
            commonFunction_1.default.isActive(),
            {
                $project: {
                    _id: 1,
                    first_name: 1,
                    last_name: 1,
                    user_name: 1,
                    mobile_no: 1,
                    email: 1,
                    profile_photo: 1,
                    location: 1,
                    is_active: 1,
                },
            },
        ]);
        const sendResponse = {
            message: process.env.APP_GET_MESSAGE,
            data: adminData,
        };
        return responseMiddleware_1.default.sendSuccess(req, res, sendResponse);
    }
    catch (err) {
        const sendResponse = {
            message: err.message,
        };
        logger.info("get GetActiveVendor");
        logger.info(err);
        return responseMiddleware_1.default.sendError(res, sendResponse);
    }
};
const GetActiveVendor = async (req, res) => {
    try {
        const vendorData = await user_model_1.default.aggregate([
            commonFunction_1.default.isActive(),
            {
                $project: {
                    _id: 1,
                    first_name: 1,
                    last_name: 1,
                    user_name: 1,
                    mobile_no: 1,
                    email: 1,
                    profile_photo: 1,
                    location: 1,
                    is_active: 1,
                },
            },
        ]);
        const sendResponse = {
            message: process.env.APP_GET_MESSAGE,
            data: vendorData,
        };
        return responseMiddleware_1.default.sendSuccess(req, res, sendResponse);
    }
    catch (err) {
        const sendResponse = {
            message: err.message,
        };
        logger.info("get GetActiveVendor");
        logger.info(err);
        return responseMiddleware_1.default.sendError(res, sendResponse);
    }
};
const GetActiveCustomer = async (req, res) => {
    try {
        const customerData = await user_model_1.default.aggregate([
            commonFunction_1.default.isActive(),
            {
                $project: {
                    _id: 1,
                    first_name: 1,
                    last_name: 1,
                    user_name: 1,
                    mobile_no: 1,
                    email: 1,
                    profile_photo: 1,
                    location: 1,
                    is_active: 1,
                },
            },
        ]);
        const sendResponse = {
            message: process.env.APP_GET_MESSAGE,
            data: customerData,
        };
        return responseMiddleware_1.default.sendSuccess(req, res, sendResponse);
    }
    catch (err) {
        const sendResponse = {
            message: err.message,
        };
        logger.info("get GetActiveVendor");
        logger.info(err);
        return responseMiddleware_1.default.sendError(res, sendResponse);
    }
};
// *******************************************************************************************
// ================================= Store Record In Database =================================
// *******************************************************************************************
const getChat = async (req, res) => {
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const { admin_id, vendor_id, user_id, type, search } = req.body;
        let filterText = {};
        if (Number(type) === 1) {
            filterText = {
                admin_id: new mongoose_1.default.Types.ObjectId(admin_id),
            };
        }
        if (Number(type) === 2) {
            filterText = {
                vendor_id: new mongoose_1.default.Types.ObjectId(vendor_id),
            };
        }
        if (Number(type) === 3) {
            filterText = {
                user_id: new mongoose_1.default.Types.ObjectId(user_id),
            };
        }
        if (search) {
            filterText = {
                ...filterText,
                $or: [
                    { "customerData.first_name": { $regex: `${search}`, $options: "i" } },
                    { "customerData.last_name": { $regex: `${search}`, $options: "i" } },
                    { "vendorData.first_name": { $regex: `${search}`, $options: "i" } },
                    { "vendorData.last_name": { $regex: `${search}`, $options: "i" } },
                    { "adminData.first_name": { $regex: `${search}`, $options: "i" } },
                    { "adminData.last_name": { $regex: `${search}`, $options: "i" } },
                ],
            };
        }
        const ChatStatus = await chat_model_1.default.aggregate([
            {
                $lookup: {
                    from: "users",
                    localField: "user_id",
                    foreignField: "_id",
                    as: "customerData",
                },
            },
            { $unwind: { path: "$customerData", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "users",
                    localField: "vendor_id",
                    foreignField: "_id",
                    as: "vendorData",
                },
            },
            { $unwind: { path: "$vendorData", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "admins",
                    localField: "admin_id",
                    foreignField: "_id",
                    as: "adminData",
                },
            },
            { $unwind: { path: "$adminData", preserveNullAndEmptyArrays: true } },
            { $match: filterText },
            {
                $project: {
                    _id: 1,
                    admin_id: 1,
                    vendor_id: 1,
                    user_id: 1,
                    type: 1,
                    room_id: 1,
                    "customerData.first_name": 1,
                    "adminData.first_name": 1,
                    "vendorData.first_name": 1,
                    "customerData.last_name": 1,
                    "adminData.last_name": 1,
                    "vendorData.last_name": 1,
                    "customerData.profile_photo": 1,
                    "adminData.profile_photo": 1,
                    "vendorData.profile_photo": 1,
                    is_active: 1,
                    createdAt: 1,
                },
            },
        ]);
        await session.commitTransaction();
        await session.endSession();
        const responseData = {
            message: "Chat Joined",
            data: ChatStatus,
        };
        return responseMiddleware_1.default.sendSuccess(req, res, responseData);
    }
    catch (err) {
        const sendResponse = {
            message: err.message,
        };
        logger.info("store chat Data");
        logger.info(err);
        await session.abortTransaction();
        session.endSession();
        return responseMiddleware_1.default.sendError(res, sendResponse);
    }
};
const storeContactUs = async (req, res) => {
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const { email, name, mobile_no, message, user_id, images, location, subject } = req.body;
        let contactUsData = await new contactus_model_1.default();
        contactUsData.email = email;
        contactUsData.name = name;
        contactUsData.mobile_no = mobile_no;
        contactUsData.location = location;
        contactUsData.subject = subject;
        contactUsData.message = message;
        if (user_id) {
            contactUsData.user_id = new mongoose_1.default.Types.ObjectId(user_id);
        }
        contactUsData.images = JSON.stringify(images);
        await contactUsData.save();
        await session.commitTransaction();
        await session.endSession();
        const responseData = {
            message: "Thank you for contacting us",
            data: {},
        };
        return responseMiddleware_1.default.sendSuccess(req, res, responseData);
    }
    catch (err) {
        const sendResponse = {
            message: err.message,
        };
        logger.info("store chat Data");
        logger.info(err);
        await session.abortTransaction();
        session.endSession();
        return responseMiddleware_1.default.sendError(res, sendResponse);
    }
};
const storeChat = async (req, res) => {
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const { admin_id, vendor_id, user_id, type } = req.body;
        let filterText = {};
        // type
        // 1 admin and vendor chat
        // 2 admin and customer chat
        // 3 customer and customer chat
        // 4 customer and vendor chat
        if (Number(type) === 1) {
            filterText = {
                admin_id: new mongoose_1.default.Types.ObjectId(admin_id),
            };
        }
        if (Number(type) === 2) {
            filterText = {
                admin_id: new mongoose_1.default.Types.ObjectId(admin_id),
                vendor_id: new mongoose_1.default.Types.ObjectId(vendor_id),
            };
        }
        if (Number(type) === 3) {
            filterText = {
                admin_id: new mongoose_1.default.Types.ObjectId(admin_id),
                user_id: new mongoose_1.default.Types.ObjectId(user_id),
            };
        }
        if (Number(type) === 4) {
            filterText = {
                vendor_id: new mongoose_1.default.Types.ObjectId(vendor_id),
                user_id: new mongoose_1.default.Types.ObjectId(user_id),
            };
        }
        const chatFindData = await chat_model_1.default.findOne(filterText).count();
        if (chatFindData <= 0) {
            const storeChatData = await new chat_model_1.default();
            if (admin_id) {
                storeChatData.admin_id = new mongoose_1.default.Types.ObjectId(admin_id);
            }
            if (user_id) {
                storeChatData.user_id = new mongoose_1.default.Types.ObjectId(user_id);
            }
            if (vendor_id) {
                storeChatData.vendor_id = new mongoose_1.default.Types.ObjectId(vendor_id);
            }
            storeChatData.type = type;
            storeChatData.room_id = await commonFunction_1.default.makeIdString(15);
            await storeChatData.save();
        }
        const chatData = await chat_model_1.default.findOne(filterText);
        await session.commitTransaction();
        await session.endSession();
        const responseData = {
            message: "Chat Joined",
            data: chatData,
        };
        return responseMiddleware_1.default.sendSuccess(req, res, responseData);
    }
    catch (err) {
        const sendResponse = {
            message: err.message,
        };
        logger.info("store chat Data");
        logger.info(err);
        await session.abortTransaction();
        session.endSession();
        return responseMiddleware_1.default.sendError(res, sendResponse);
    }
};
function replaceMulti(haystack, needle, replacement) {
    return haystack.split(needle).join(replacement);
}
const getCms = async (req, res) => {
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    try {
        let slug = req.query.slug;
        slug = slug.replace(/\`|\~|\!|\@|\#|\||\$|\%|\^|\&|\*|\(|\)|\+|\=|\,|\.|\/|\?|\>|\<|\'|\"|\:|\;|/gi, "");
        slug = replaceMulti(slug, '-', '_');
        const cmsData = await cms_model_1.default.aggregate([{ $match: { key: slug } }]);
        await session.commitTransaction();
        await session.endSession();
        const responseData = {
            message: "cms Get SuccessFully",
            data: cmsData[0],
        };
        return responseMiddleware_1.default.sendSuccess(req, res, responseData);
    }
    catch (err) {
        const sendResponse = {
            message: err.message,
        };
        logger.info("getPost ");
        logger.info(err);
        await session.abortTransaction();
        session.endSession();
        return responseMiddleware_1.default.sendError(res, sendResponse);
    }
};
const getFaq = async (req, res) => {
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const faqData = await faq_model_1.default.aggregate([
            {
                $project: {
                    _id: 1,
                    question: 1,
                    answer: 1,
                    is_active: 1,
                },
            },
        ]);
        await session.commitTransaction();
        await session.endSession();
        const responseData = {
            message: "Faq Get SuccessFully",
            data: faqData,
        };
        return responseMiddleware_1.default.sendSuccess(req, res, responseData);
    }
    catch (err) {
        const sendResponse = {
            message: err.message,
        };
        logger.info("get Faq ");
        logger.info(err);
        await session.abortTransaction();
        session.endSession();
        return responseMiddleware_1.default.sendError(res, sendResponse);
    }
};
const getSocialMedia = async (req, res) => {
    try {
        const socialMediaData = await social_media_model_1.default.aggregate([
            {
                $project: {
                    _id: 1,
                    name: 1,
                    icon: 1,
                    value: 1
                },
            },
        ]);
        const sendResponse = {
            message: process.env.APP_GET_MESSAGE,
            data: socialMediaData,
        };
        return responseMiddleware_1.default.sendSuccess(req, res, sendResponse);
    }
    catch (err) {
        const sendResponse = {
            message: err.message,
        };
        logger.info("get assets uses");
        logger.info(err);
        return responseMiddleware_1.default.sendError(res, sendResponse);
    }
};
const checkDataField = async (req, res) => {
    try {
        const { field, filed_value } = req.body;
        const userData = await user_model_1.default.aggregate([
            {
                $match: {
                    [field]: filed_value
                }
            },
            {
                $project: {
                    "_id": 1,
                    "first_name": 1,
                    "last_name": 1,
                    "user_name": 1,
                    "mobile_no": 1,
                    "email": 1,
                    "type": 1
                }
            },
        ]);
        if (userData.length === 0) {
            const sendResponse = {
                data: {},
                message: 'This ' + field + ' is available',
            };
            return responseMiddleware_1.default.sendSuccess(req, res, sendResponse);
        }
        else {
            const sendResponse = {
                message: 'This ' + field + ' is already registered ',
            };
            return responseMiddleware_1.default.sendError(res, sendResponse);
        }
    }
    catch (err) {
        const sendResponse = {
            message: err.message,
        };
        logger.info("field Checking api ");
        logger.info(err);
        return responseMiddleware_1.default.sendError(res, sendResponse);
    }
};
const getOurContactUs = (async (req, res) => {
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
const getServiceType = async (req, res) => {
    try {
        const serviceTypeData = await service_type_model_1.default.aggregate([
            commonFunction_1.default.isActive(),
            {
                $project: {
                    _id: 1,
                    is_active: 1,
                    name: 1,
                },
            },
        ]);
        const sendResponse = {
            message: process.env.APP_GET_MESSAGE,
            data: serviceTypeData,
        };
        return responseMiddleware_1.default.sendSuccess(req, res, sendResponse);
    }
    catch (err) {
        const sendResponse = {
            message: err.message,
        };
        logger.info("get ServiceType");
        logger.info(err);
        return responseMiddleware_1.default.sendError(res, sendResponse);
    }
};
exports.default = {
    uploadFiles,
    uploadImage,
    uploadVideo,
    getCategory,
    GetActiveAdmin,
    GetActiveVendor,
    GetActiveCustomer,
    storeChat,
    getChat,
    storeContactUs,
    getCms,
    getFaq,
    otpVerification,
    getSocialMedia,
    checkDataField,
    uploadImageMulti,
    getOurContactUs,
    getServiceType
};
