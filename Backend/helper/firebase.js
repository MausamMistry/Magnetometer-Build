"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendPushNotification = void 0;
const firebase_admin_1 = __importDefault(require("firebase-admin"));
const log4js_1 = __importDefault(require("log4js"));
const logger = log4js_1.default.getLogger();
// var serviceAccount = require("../maintenance-master-5145c-firebase-adminsdk-94pz4-54fff8a476.json");
// initializeApp({
//     credential: admin.credential.cert(serviceAccount),
// });
const sendPushNotification = async (token, obj) => {
    if (token.length) {
        let dataSend = {
            "type": obj.data.type.toString(),
            "title": obj.data.title,
            "message": obj.data.message,
            "updatedAt": obj.data.updatedAt,
            "data": obj.data.extraData
        };
        await firebase_admin_1.default.messaging().sendMulticast({
            data: dataSend,
            notification: {
                title: obj.data.title,
                body: obj.data.message,
            },
            tokens: token,
        }).then((value) => {
            console.log('Successfully sent message:', value);
            console.log(value.responses);
            logger.info("Admin :: Successfully sent message Issue");
            logger.info(value.responses);
        }).catch((error) => {
            console.log('Error sending message:', error);
            throw error;
        });
    }
    else {
        console.log('null pass token on');
        logger.info("null pass token on");
    }
};
exports.sendPushNotification = sendPushNotification;
exports.default = {
    sendPushNotification: exports.sendPushNotification,
};
