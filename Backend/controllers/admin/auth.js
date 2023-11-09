"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jwt_1 = __importDefault(require("../../helper/jwt"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const mongoose_1 = __importDefault(require("mongoose"));
const responseMiddleware_1 = __importDefault(require("../../helper/responseMiddleware"));
const log4js_1 = __importDefault(require("log4js"));
const logger = log4js_1.default.getLogger();
const admin_model_1 = __importDefault(require("../../models/admin-model"));
const admin_token_model_1 = __importDefault(require("../../models/admin-token-model"));
const otp_model_1 = __importDefault(require("../../models/otp-model"));
const commonFunction_1 = __importDefault(require("../../helper/commonFunction"));
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ============================================= Over Here Include Library =============================================
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const adminsDataGet = (async (id) => {
    const adminData = await admin_model_1.default.findById(id).select("_id first_name last_name email role_id profile_photo");
    return adminData;
});
const login = (async (req, res) => {
    try {
        const { email, password, firebase_token } = req.body;
        const adminData = await admin_model_1.default.findOne({
            email,
            deleted_by: null
        });
        if (adminData) {
            if (!adminData.password) {
                const sendResponse = {
                    message: "Invalid password",
                };
                return responseMiddleware_1.default.sendError(res, sendResponse);
            }
            const ispasswordmatch = await bcrypt_1.default.compare(password, adminData.password);
            if (!ispasswordmatch) {
                const sendResponse = {
                    message: "Invalid password",
                };
                return responseMiddleware_1.default.sendError(res, sendResponse);
            }
            else {
                const token = await jwt_1.default.sign({
                    email: email,
                    mobilenumber: adminData.mobile,
                    admin_id: adminData._id?.toString()
                });
                if (adminData && adminData._id) {
                    await admin_token_model_1.default.create({
                        token: token,
                        firebase_token: firebase_token,
                        admin_id: adminData._id,
                    });
                }
                const sendData = await adminsDataGet(adminData._id);
                let AdminsData = sendData.toJSON();
                AdminsData['access_token'] = token;
                const sendResponse = {
                    data: AdminsData ? AdminsData : {},
                    message: "you are logged in successfully",
                };
                return responseMiddleware_1.default.sendSuccess(req, res, sendResponse);
            }
        }
        else {
            const sendResponse = {
                message: "The email or password is incorrect.",
            };
            return responseMiddleware_1.default.sendError(res, sendResponse);
        }
    }
    catch (err) {
        const sendResponse = {
            message: err.message,
        };
        logger.info("Login");
        logger.info(err);
        return responseMiddleware_1.default.sendError(res, sendResponse);
    }
});
const changePassword = (async (req, res) => {
    try {
        const { old_password, password } = req.body;
        // @ts-ignore
        const admin_id = req?.admin?._id;
        const adminData = await admin_model_1.default.findOne({
            _id: new mongoose_1.default.Types.ObjectId(admin_id)
        });
        if (adminData) {
            const isComparePassword = await bcrypt_1.default.compare(old_password, adminData.password);
            if (isComparePassword) {
                const passwordhash = await bcrypt_1.default.hash(password, Number(10));
                await admin_model_1.default.findByIdAndUpdate(new mongoose_1.default.Types.ObjectId(admin_id), {
                    password: passwordhash,
                    updated_by: adminData.first_name,
                    updated_on: new Date()
                }, {
                    new: true
                });
                const sendResponse = {
                    message: "password changed successfully",
                };
                return responseMiddleware_1.default.sendSuccess(req, res, sendResponse);
            }
            else {
                const sendResponse = {
                    message: 'Oops, provide password is incorrect-+',
                };
                return responseMiddleware_1.default.sendError(res, sendResponse);
            }
        }
        else {
            const sendResponse = {
                message: 'Admin not found',
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
});
const getProfile = (async (req, res) => {
    try {
        // @ts-ignore
        const admin_id = req?.admin?._id;
        const adminData = await admin_model_1.default.findOne({
            _id: new mongoose_1.default.Types.ObjectId(admin_id)
        });
        const sendResponse = {
            data: adminData,
            message: 'get profile successfully',
        };
        return responseMiddleware_1.default.sendSuccess(req, res, sendResponse);
    }
    catch (err) {
        const sendResponse = {
            message: err.message,
        };
        logger.info("get Profile");
        logger.info(err);
        return responseMiddleware_1.default.sendError(res, sendResponse);
    }
});
const updateProfile = (async (req, res) => {
    try {
        const { first_name, last_name, email, profile_photo, mobile_no } = req.body;
        // @ts-ignore
        const admin_id = req?.admin?._id;
        await admin_model_1.default.findByIdAndUpdate(admin_id, {
            profile_photo: profile_photo,
            first_name: first_name,
            last_name: last_name,
            email: email,
            mobile_no: mobile_no
        });
        const adminData = await admin_model_1.default.findOne({
            _id: new mongoose_1.default.Types.ObjectId(admin_id)
        });
        const sendResponse = {
            data: adminData,
            message: 'update profile successfully',
        };
        return responseMiddleware_1.default.sendSuccess(req, res, sendResponse);
    }
    catch (err) {
        const sendResponse = {
            message: err.message,
        };
        logger.info("update Profile");
        logger.info(err);
        return responseMiddleware_1.default.sendError(res, sendResponse);
    }
});
const logout = (async (req, res) => {
    try {
        // @ts-ignore
        const admin_id = req?.admin?._id;
        const token = req.headers['authorization']?.split(" ")[1];
        let getToken = await admin_token_model_1.default.findOne({
            admin_id: new mongoose_1.default.Types.ObjectId(admin_id),
            token: token
        });
        if (getToken) {
            await admin_token_model_1.default.deleteOne(new mongoose_1.default.Types.ObjectId(getToken._id.toString()), {
                is_active: false
            });
            const sendResponse = {
                message: 'logout Admin successfully',
            };
            return responseMiddleware_1.default.sendSuccess(req, res, sendResponse);
        }
        else {
            const sendResponse = {
                message: "Invalid token",
            };
            return responseMiddleware_1.default.sendError(res, sendResponse);
        }
    }
    catch (err) {
        const sendResponse = {
            message: err.message,
        };
        logger.info("Logout");
        logger.info(err);
        return responseMiddleware_1.default.sendError(res, sendResponse);
    }
});
const forgetPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const admin = await admin_model_1.default.findOne({ email: email });
        if (!admin) {
            const sendResponse = {
                message: "admin with given email doesn't exist",
            };
            return responseMiddleware_1.default.sendError(res, sendResponse);
        }
        const otp = Math.floor(1000 + Math.random() * 9000).toString(); //four digit otp
        const expiry = new Date();
        expiry.setMinutes(expiry.getMinutes() + 10);
        const token = await jwt_1.default.sign({
            email: email,
            admin_id: admin._id,
            expiry: expiry,
        });
        await otp_model_1.default.create([
            {
                otp: otp,
                token: token,
                admin_id: admin._id,
                is_active: true,
                expiry: expiry,
            },
        ]);
        logger.info("token");
        logger.info(token);
        try {
            let to = admin.email;
            let subject = process.env.APP_NAME + ' Reset Password Link';
            let template = 'forget-code-admin';
            let sendEmailTemplatedata = {
                name: admin.first_name + admin.last_name,
                token: token,
                app_name: process.env.APP_NAME,
                reset_button: process.env.ADMIN_LINK + 'reset-password/' + token,
            };
            let datta = {
                to: to,
                subject: subject,
                template: template,
                sendEmailTemplatedata: sendEmailTemplatedata
            };
            await commonFunction_1.default.sendEmailTemplate(datta);
        }
        catch (err) {
            logger.info("Forget Password send email  ");
            logger.info(err);
        }
        // Email Services write down
        const sendResponse = {
            message: "Link sent on the registred Mail Id",
        };
        return responseMiddleware_1.default.sendSuccess(req, res, sendResponse);
    }
    catch (err) {
        const sendResponse = {
            message: err.message,
        };
        return responseMiddleware_1.default.sendError(res, sendResponse);
    }
};
const resetPassword = async (req, res) => {
    try {
        const { password, confirm_password, token } = req.body;
        if (!token) {
            const sendResponse = {
                message: "token is not valid or missing",
            };
            return responseMiddleware_1.default.sendError(res, sendResponse);
        }
        const clientData = await jwt_1.default.decode(token);
        const expired = new Date(clientData.expiry) <= new Date();
        if (expired) {
            const sendResponse = {
                message: "Otp is not valid",
            };
            return responseMiddleware_1.default.sendError(res, sendResponse);
        }
        const passwordHash = await bcrypt_1.default.hash(password, Number(10));
        await admin_model_1.default.findByIdAndUpdate(clientData.admin_id, {
            password: passwordHash,
        });
        const sendResponse = {
            message: "Password Successfully Changed",
            data: {}
        };
        return responseMiddleware_1.default.sendSuccess(req, res, sendResponse);
    }
    catch (err) {
        const sendResponse = {
            message: err.message,
        };
        return responseMiddleware_1.default.sendError(res, sendResponse);
    }
};
// Export default
exports.default = {
    login,
    changePassword,
    getProfile,
    updateProfile,
    forgetPassword,
    resetPassword,
    logout
};
