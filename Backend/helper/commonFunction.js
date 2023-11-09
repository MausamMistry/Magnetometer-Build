"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const log4js_1 = __importDefault(require("log4js"));
const logger = log4js_1.default.getLogger();
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const nodemailer = require("nodemailer");
const hbs = require('nodemailer-express-handlebars');
const path = require('path');
const sendEmail = ((msg) => {
    logger.info("msg");
    logger.info(msg);
    logger.info(sgMail);
    sgMail
        .send(msg)
        .then((response) => {
        logger.info("sendEmail");
        logger.info(response);
    })
        .catch((error) => {
        logger.info("sendEmail");
        logger.info(error);
    });
    return true;
});
const sendEmailTemplate = (async (data) => {
    try {
        // let transporter = nodemailer.createTransport({
        //     host: 'smtp.sendgrid.net',
        //     port: 587,
        //     auth: {
        //         user: "apikey",
        //         pass: process.env.SENDGRID_API_KEY
        //     }
        // })
        var transporter = nodemailer.createTransport({
            host: "smtp.mailtrap.io",
            port: 2525,
            auth: {
                user: "066b538e8236c0",
                pass: "93517838974074"
            }
        });
        const pathUrl = process.env.APP_BASE_EMAIL_TEMP;
        logger.info(process.env.SENDGRID_API_KEY);
        logger.info(pathUrl);
        const handlebarOptions = {
            viewEngine: {
                partialsDir: pathUrl,
                defaultLayout: false,
            },
            viewPath: pathUrl,
        };
        // use a template file with nodemailer
        transporter.use('compile', hbs(handlebarOptions));
        const pathImg = pathUrl + `logo.png`;
        let attech = [{
                filename: 'logo.jpg',
                path: pathImg,
                cid: 'logo1' //same cid value as in the html img src
            }];
        if (data.attachments) {
            attech = [...attech, data.attachments];
        }
        var mailOptions = {
            from: 'master.app.testing@gmail.com',
            to: data.to,
            subject: data.subject,
            template: data.template,
            context: data.sendEmailTemplatedata,
            attachments: attech
        };
        // trigger the sending of the E-mail
        await transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                logger.info(error);
                return true;
            }
            console.log('Message sent: ' + info.response);
        });
    }
    catch (err) {
        logger.info("sendEmailTemplate");
        logger.info(err);
        return;
    }
});
const makeIdString = ((length) => {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
});
const stripePaymentIntentStatus = ((status) => {
    var result = 0;
    if (status === 'amount_capturable_updated') {
        result = 1;
    }
    if (status === 'canceled') {
        result = 2;
    }
    if (status === 'created') {
        result = 3;
    }
    if (status === 'partially_funded') {
        result = 4;
    }
    if (status === 'payment_failed') {
        result = 5;
    }
    if (status === 'processing') {
        result = 6;
    }
    if (status === 'requires_action') {
        result = 7;
    }
    if (status === 'succeeded') {
        result = 8;
    }
    return result;
});
const generateOtp = (() => {
    logger.info("generateOtp");
    return Math.floor(1000 + Math.random() * 9000);
});
const smsGatway = (async (to, message) => {
    try {
        const accountSid = process.env.TWILIO_ACCOUNT_SID;
        const authToken = process.env.TWILIO_AUTH_TOKEN;
        const client = require('twilio')(accountSid, authToken);
        const data = await client.messages
            .create({
            body: message,
            from: 'MGdb42291fc9749ed57ddcc8140d4cb4f7',
            to: to
        })
            .then((message) => {
            logger.info("smsGatway");
            logger.info(message.sid);
        });
        return data;
    }
    catch (err) {
        logger.info(" smsGatway Issue ");
        logger.info(err);
        logger.info(err);
        return false;
    }
});
const titleToSlug = (title) => {
    let slug;
    // convert to lower case
    slug = title.toLowerCase();
    // remove special characters
    slug = slug.replace(/\`|\~|\!|\@|\#|\||\$|\%|\^|\&|\*|\(|\)|\+|\=|\,|\.|\/|\?|\>|\<|\'|\"|\:|\;|_/gi, '');
    // The /gi modifier is used to do a case insensitive search of all occurrences of a regular expression in a string
    // replace spaces with dash symbols
    slug = slug.replace(/ /gi, "-");
    // remove consecutive dash symbols 
    slug = slug.replace(/\-\-\-\-\-/gi, '-');
    slug = slug.replace(/\-\-\-\-/gi, '-');
    slug = slug.replace(/\-\-\-/gi, '-');
    slug = slug.replace(/\-\-/gi, '-');
    // remove the unwanted dash symbols at the beginning and the end of the slug
    slug = '@' + slug + '@';
    slug = slug.replace(/\@\-|\-\@|\@/gi, '');
    return slug;
};
const isActive = () => {
    return { $match: { is_active: true } };
};
exports.default = {
    sendEmailTemplate,
    generateOtp,
    smsGatway,
    makeIdString,
    sendEmail,
    titleToSlug,
    isActive,
    stripePaymentIntentStatus,
};
