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
const user_model_1 = __importDefault(require("../../models/user-model"));
const user_token_model_1 = __importDefault(require("../../models/user-token-model"));
const otp_model_1 = __importDefault(require("../../models/otp-model"));
const notification_model_1 = __importDefault(require("../../models/notification-model"));
const commonFunction_1 = __importDefault(require("../../helper/commonFunction"));
const stripe = require('stripe')(process.env.STRIPE_KEY);
const uniqid_1 = __importDefault(require("uniqid"));
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ============================================= Over Here Include Library =============================================
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const userDataGet = async (id) => {
    const userData = await user_model_1.default.findById(id).select("_id first_name last_name email role_id profile_photo user_name type mobile_no date_of_birth location service_type_id company_name upload_brochure");
    return userData ? userData : {};
};
const register1 = async (req, res) => {
    try {
        const { email, first_name, last_name, type, user_name, date_of_birth, password, location, profile_photo, firebase_token, service_type_id, company_name, token } = req.body;
        const passwordHash = await bcrypt_1.default.hash(password, Number(10));
        if (!token) {
            const sendResponse = {
                message: "token is not valid or missing",
            };
            return responseMiddleware_1.default.sendError(res, sendResponse);
        }
        const clientData = await jwt_1.default.decode(token);
        if (!clientData.mobile_no) {
            const sendResponse = {
                message: "token is not valid or missing",
            };
            return responseMiddleware_1.default.sendError(res, sendResponse);
        }
        // const userFound = User.findOne({mobile_no:clientData.mobile_no})
        // const userData: any = await User.findOneAndUpdate({
        // 	mobile_no: clientData.mobile_no
        // }, {
        // 	unique_id: uniqid(),
        // 	first_name: first_name,
        // 	last_name: last_name,
        // 	user_name: user_name,
        // 	type: type,
        // 	email: email,
        // 	profile_photo: profile_photo,
        // 	location: location,
        // 	date_of_birth: date_of_birth,
        // 	password: passwordHash,
        // 	is_verified: true,
        // });
        let updateData = {
            unique_id: (0, uniqid_1.default)(),
            profile_photo: profile_photo,
            first_name: first_name,
            last_name: last_name,
            user_name: user_name,
            type: type,
            email: email,
            date_of_birth: date_of_birth,
            location: location,
            password: passwordHash,
            is_verified: true,
        };
        if (Number(type) === 2) {
            updateData.company_name = company_name;
            updateData.service_type_id = new mongoose_1.default.Types.ObjectId(service_type_id);
        }
        const userData = await user_model_1.default.findOneAndUpdate({ mobile_no: clientData.mobile_no }, updateData);
        let balance = 0;
        const customerInStripe = await stripe.customers.create({
            description: 'Create New Customer ' + email,
            balance: balance,
            email: email,
            name: first_name + last_name,
            phone: clientData.mobile_no,
        });
        userData.stripe_user_id = customerInStripe.id;
        userData.stripe_payload = JSON.stringify(customerInStripe);
        userData.wallet_amount = balance;
        userData.save();
        const tokenLogin = await jwt_1.default.sign({
            email: email,
            mobilenumber: userData.mobile,
            user_id: userData._id?.toString(),
        });
        if (userData && userData._id) {
            await user_token_model_1.default.create({
                token: tokenLogin,
                firebase_token: firebase_token,
                user_id: userData._id,
            });
        }
        let userName = 'user';
        if (Number(type) === 2) {
            userName = 'Service Provider';
        }
        // if (userData && userData._id) {
        // 	if (userData) {
        // 		// start here Push 
        // 		let pushTitle: any = first_name + last_name + ' register successfully';
        // 		let message: any = 'new' + userName + 'registered successfully';
        // 		let payload: any = userData;
        // 		await Notification.create({
        // 			user_id: userData._id,
        // 			title: pushTitle,
        // 			message: message,
        // 			payload: JSON.stringify(payload),
        // 		})
        // 		const userNotification = await User.findOne({
        // 			_id: new mongoose.Types.ObjectId(userData._id)
        // 		});
        // 		let getToken: any = (await UserToken.find({
        // 			user_id: new mongoose.Types.ObjectId(userData._id)
        // 		})).map(value => value.firebase_token);
        // 		if (userNotification && userNotification.firebase_is_active) {
        // 			try {
        // 				let dataStore: any = getToken;
        // 				let notificationData = {
        // 					"type": 1,
        // 					"title": pushTitle,
        // 					"message": message,
        // 					"extraData": JSON.stringify(payload),
        // 					"updatedAt": new Date().toString(),
        // 				};
        // 				let fcmData: any = {
        // 					"subject": pushTitle,
        // 					"content": message,
        // 					"data": notificationData,
        // 					"image": ""
        // 				};
        // 				let token: any = dataStore
        // 				await FirebaseFunction.sendPushNotification(token, fcmData)
        // 			}
        // 			catch (err) {
        // 				logger.info("sendPushNotification");
        // 				logger.info(err);
        // 			}
        // 		}
        // 	}
        // 	// end here push 
        // }
        const sendData = await userDataGet(userData._id);
        let customersData = sendData.toJSON();
        customersData["access_token"] = tokenLogin;
        const sendResponse = {
            data: customersData,
            message: "you are Registerd successfully",
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
const register = async (req, res) => {
    try {
        const { email, name, type, clinic_name, date_of_birth, password, location, profile_photo, } = req.body;
        // Check if the email already exists in the database
        const existingUser = await user_model_1.default.findOne({ email });
        if (existingUser) {
            // Email is not unique, return an error response
            const sendResponse = {
                message: 'Email already exists. Please choose a different email.',
            };
            return responseMiddleware_1.default.sendError(res, sendResponse);
        }
        // If the email is unique, proceed with registration
        const passwordHash = await bcrypt_1.default.hash(password, Number(10));
        // Create a new user in the database
        const newUser = new user_model_1.default({
            email,
            name,
            type,
            clinic_name,
            date_of_birth,
            password: passwordHash,
            location,
            profile_photo,
        });
        // Save the new user to the database
        await newUser.save();
        // Return a success response
        const sendResponse = {
            message: 'Registration successful!',
        };
        return responseMiddleware_1.default.sendSuccess(req, res, sendResponse);
    }
    catch (err) {
        // Handle any other errors that might occur during registration
        const sendResponse = {
            message: err.message,
        };
        return responseMiddleware_1.default.sendError(res, sendResponse);
    }
};
const forgetPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await user_model_1.default.findOne({ email: email });
        if (!user) {
            const sendResponse = {
                message: "user with given email doesn't exist",
            };
            return responseMiddleware_1.default.sendError(res, sendResponse);
        }
        const otp = Math.floor(1000 + Math.random() * 9000).toString(); //four digit otp
        const expiry = new Date();
        expiry.setMinutes(expiry.getMinutes() + 10);
        const token = await jwt_1.default.sign({
            email: email,
            user_id: user._id,
            expiry: expiry,
        });
        await otp_model_1.default.create([
            {
                otp: otp,
                token: token,
                user_id: user._id,
                is_active: true,
                expiry: expiry,
            },
        ]);
        try {
            let message = process.env.APP_NAME + " is your Otp  " + otp;
            //start  send email
            await commonFunction_1.default.smsGatway(user.mobile_no, message);
        }
        catch (err) {
            logger.info("EmailwithMessage");
            logger.info(err);
        }
        try {
            let to = user.email;
            let subject = process.env.APP_NAME + ' Forgot Password Otp';
            let template = 'customer-forget-password';
            let sendEmailTemplatedata = {
                name: user.first_name + user.last_name,
                otp: otp,
                app_name: process.env.APP_NAME,
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
            data: {
                token: token,
                otp: otp,
            },
            message: "Otp sent on the registred Email Address",
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
                message: "OTP is incorrect",
            };
            return responseMiddleware_1.default.sendError(res, sendResponse);
        }
        const passwordHash = await bcrypt_1.default.hash(password, Number(10));
        await user_model_1.default.findByIdAndUpdate(clientData.user_id, {
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
const login = async (req, res) => {
    try {
        const { email, password, firebase_token } = req.body;
        const userData = await user_model_1.default.findOne({
            $or: [{ 'email': email }, { 'user_name': email }],
            deleted_by: null,
        });
        if (userData) {
            if (!userData.password) {
                const sendResponse = {
                    message: "Invalid password",
                };
                return responseMiddleware_1.default.sendError(res, sendResponse);
            }
            if (!userData.is_active) {
                const sendResponse = {
                    message: "your account is blocked please contact to admin",
                };
                return responseMiddleware_1.default.sendError(res, sendResponse);
            }
            const ispasswordmatch = await bcrypt_1.default.compare(password, userData.password);
            if (!ispasswordmatch) {
                const sendResponse = {
                    message: "Wrong Password",
                };
                return responseMiddleware_1.default.sendError(res, sendResponse);
            }
            else {
                const token = await jwt_1.default.sign({
                    email: userData.email,
                    mobilenumber: userData.mobile,
                    user_id: userData._id?.toString(),
                });
                if (userData && userData._id) {
                    await user_token_model_1.default.create({
                        token: token,
                        firebase_token: firebase_token,
                        user_id: userData._id,
                    });
                }
                const sendData = await userDataGet(userData._id);
                let customersData = sendData.toJSON();
                customersData["access_token"] = token;
                const sendResponse = {
                    data: customersData ? customersData : {},
                    message: "you are logged in successfully",
                };
                return responseMiddleware_1.default.sendSuccess(req, res, sendResponse);
            }
        }
        else {
            const sendResponse = {
                message: "The username or email or password is incorrect.",
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
};
const changePassword = async (req, res) => {
    try {
        const { old_password, password } = req.body;
        // @ts-ignore
        const user_id = req?.user?._id;
        const userData = await user_model_1.default.findOne({
            _id: new mongoose_1.default.Types.ObjectId(user_id),
        });
        if (userData) {
            const isComparePassword = await bcrypt_1.default.compare(old_password, userData.password);
            if (isComparePassword) {
                const passwordhash = await bcrypt_1.default.hash(password, Number(10));
                await user_model_1.default.findByIdAndUpdate(new mongoose_1.default.Types.ObjectId(user_id), {
                    password: passwordhash,
                    updated_by: userData.first_name,
                    updated_on: new Date(),
                }, {
                    new: true,
                });
                const sendResponse = {
                    message: "password changed successfully",
                    data: {}
                };
                return responseMiddleware_1.default.sendSuccess(req, res, sendResponse);
            }
            else {
                const sendResponse = {
                    message: "oops, old password is incorrect",
                };
                return responseMiddleware_1.default.sendError(res, sendResponse);
            }
        }
        else {
            const sendResponse = {
                message: "Admin not found",
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
const readNotification = async (req, res) => {
    try {
        // @ts-ignore
        const user_id = req?.user?._id;
        await notification_model_1.default.updateMany({
            "user_id": new mongoose_1.default.Types.ObjectId(user_id)
        }, {
            is_read: true,
        });
        const sendResponse = {
            data: {},
            message: "read all notification successfully",
        };
        return responseMiddleware_1.default.sendSuccess(req, res, sendResponse);
    }
    catch (err) {
        const sendResponse = {
            message: err.message,
        };
        logger.info("read notification");
        logger.info(err);
        return responseMiddleware_1.default.sendError(res, sendResponse);
    }
};
const getCountNotification = async (req, res) => {
    try {
        // @ts-ignore
        const user_id = req?.user?._id;
        const notificationData = await notification_model_1.default.count([
            { $match: { user_id: new mongoose_1.default.Types.ObjectId(user_id) } },
        ]);
        const sendResponse = {
            data: (notificationData.length) > 0 ? notificationData : {},
            message: "get count notification successfully",
        };
        return responseMiddleware_1.default.sendSuccess(req, res, sendResponse);
    }
    catch (err) {
        const sendResponse = {
            message: err.message,
        };
        logger.info("get count notification");
        logger.info(err);
        return responseMiddleware_1.default.sendError(res, sendResponse);
    }
};
const getNotification = async (req, res) => {
    try {
        // @ts-ignore
        const user_id = req?.user?._id;
        const { page, per_page } = req.body;
        let perPage = per_page == undefined ? 10 : Number(per_page);
        let skipPage = (page && page > 0) ? (Number(Number(page - 1)) * Number(perPage)) : 0;
        let filterText = {};
        filterText = {
            user_id: new mongoose_1.default.Types.ObjectId(user_id),
        };
        let countData = await notification_model_1.default.count(filterText);
        const notificationData = await notification_model_1.default.aggregate([
            {
                $lookup: {
                    from: "users",
                    localField: "user_id",
                    foreignField: "_id",
                    as: "userData",
                },
            },
            { $unwind: { path: "$userData", preserveNullAndEmptyArrays: true } },
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
                    user_id: 1,
                    type: 1,
                    title: 1,
                    message: 1,
                    notification: 1,
                    is_active: 1,
                    createdAt: 1,
                    // payload:1,
                    "userData.first_name": 1,
                    "userData.last_name": 1,
                    "userData.profile_photo": 1,
                    createdAtFormatted: {
                        $dateToString: { format: "%d/%m/%Y", date: "$createdAt" },
                    },
                },
            },
            { $sort: { 'createdAt': -1 } },
            { $skip: parseInt(skipPage) },
            { $limit: parseInt(perPage) },
        ]);
        const sendResponse = {
            data: {
                data: notificationData,
                total: countData,
            },
            message: "get notification successfully",
        };
        return responseMiddleware_1.default.sendSuccess(req, res, sendResponse);
    }
    catch (err) {
        const sendResponse = {
            message: err.message,
        };
        logger.info("get notification");
        logger.info(err);
        return responseMiddleware_1.default.sendError(res, sendResponse);
    }
};
const getProfile = async (req, res) => {
    try {
        // @ts-ignore
        const user_id = req?.user._id;
        const sendResponse = {
            data: await userDataGet(user_id),
            message: "get profile successfully",
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
};
const updateProfile = async (req, res) => {
    try {
        const { first_name, last_name, email, profile_photo, user_name, date_of_birth, mobile_no, location, company_name, upload_brochure, service_type_id, } = req.body;
        // @ts-ignore
        const user_id = req?.user?._id;
        // @ts-ignore
        const type = req?.user?.type;
        let updateData = {
            profile_photo: profile_photo,
            first_name: first_name,
            last_name: last_name,
            user_name: user_name,
            email: email,
            date_of_birth: date_of_birth,
            location: location,
            mobile_no: mobile_no,
        };
        if (Number(type) === 2) {
            updateData.upload_brochure = upload_brochure;
            updateData.company_name = company_name;
            updateData.service_type_id = new mongoose_1.default.Types.ObjectId(service_type_id);
        }
        await user_model_1.default.findByIdAndUpdate(user_id, updateData);
        const userData = await userDataGet(user_id);
        const sendResponse = {
            data: userData ? userData : {},
            message: "update profile successfully",
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
};
const logout = async (req, res) => {
    try {
        // @ts-ignore
        const user_id = req?.user?._id;
        const token = req.headers["authorization"]?.split(" ")[1];
        let getToken = await user_token_model_1.default.findOne({
            user_id: new mongoose_1.default.Types.ObjectId(user_id),
            token: token,
        });
        if (getToken) {
            await user_token_model_1.default.deleteOne(new mongoose_1.default.Types.ObjectId(getToken._id.toString()), {
                is_active: false,
            });
            const sendResponse = {
                message: "logout successfully",
                data: {}
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
};
const mobileVerification = async (req, res) => {
    try {
        const { mobile_no } = req.body;
        const user = await user_model_1.default.findOne({ mobile_no: mobile_no });
        const otp = Math.floor(1000 + Math.random() * 9000).toString(); //four digit otp
        console.log(otp);
        if (user) {
            if (user.is_verified) {
                const sendResponse = {
                    message: "User With This Mobile Already Exist",
                    data: {}
                };
                return responseMiddleware_1.default.sendError(res, sendResponse);
            }
        }
        else {
            try {
                let message = process.env.APP_NAME + " is your Otp  " + otp;
                //start  send email
                const smsGatwayData = await commonFunction_1.default.smsGatway(mobile_no, message);
                // if (smsGatwayData === false) {
                // 	const sendResponse: any = {
                // 		message: `The number ${mobile_no} is not a valid phone number`,
                // 	};
                // 	return response.sendError(res, sendResponse);
                // }
            }
            catch (err) {
                logger.info("EmailwithMessage");
                logger.info(err);
            }
            await user_model_1.default.create({ mobile_no: mobile_no });
        }
        const expiry = new Date();
        expiry.setMinutes(expiry.getMinutes() + 10);
        const token = await jwt_1.default.sign({
            mobile_no: mobile_no,
            expiry: expiry,
        });
        await otp_model_1.default.create([
            {
                otp: otp,
                token: token,
                isActive: true,
                expiry: expiry,
            },
        ]);
        console.log('otp', otp);
        const sendResponse = {
            data: {
                token: token,
                otp: otp,
            },
            message: "Otp sent on the registred Phone",
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
    register,
    forgetPassword,
    resetPassword,
    getNotification,
    login,
    changePassword,
    getProfile,
    updateProfile,
    logout,
    mobileVerification,
    getCountNotification,
    readNotification,
};
