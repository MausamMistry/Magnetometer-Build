"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const log4js = require("log4js");
const logger = log4js.getLogger();
const child_process_1 = require("child_process");
const moment_1 = __importDefault(require("moment"));
const commonFunction_1 = __importDefault(require("../../helper/commonFunction"));
const admin_token_model_1 = __importDefault(require("../../models/admin-token-model"));
const user_token_model_1 = __importDefault(require("../../models/user-token-model"));
const archiver = require('archiver');
const destroyToken = async () => {
    try {
        var date = new Date();
        date.setDate(date.getDate() - 1);
        await admin_token_model_1.default.deleteMany({
            createdAt: { $lte: date },
        });
        await user_token_model_1.default.deleteMany({
            createdAt: { $lte: date },
        });
        return;
    }
    catch (err) {
        const sendResponse = {
            message: err.message,
        };
        logger.info("destroyToken");
        logger.info(sendResponse);
    }
};
const removeLogger = async () => {
    try {
        var uploadsDir = __dirname + "/logger";
        fs.rmdir(uploadsDir, { recursive: true }, (err) => {
            if (err) {
                throw err;
            }
            console.log(`${uploadsDir} is deleted!`);
        });
        return;
    }
    catch (err) {
        const sendResponse = {
            message: err.message,
        };
        logger.info("removeLogger");
        logger.info(sendResponse);
    }
};
const databaseBackup = async () => {
    const mongodbUri = process.env.MONGO_URI; // db url
    const backupPath = `${process.cwd() + '/src/database/'}`;
    const currentDate = (0, moment_1.default)().format("MM-DD-YYYY--HH-mm-ss-a");
    const backupFile = `backup-${currentDate}.zip`;
    const cmd = `mongodump --uri=${mongodbUri} --out=${backupPath} && zip -r ${backupFile} ${backupPath}`;
    (0, child_process_1.exec)(cmd, async (error) => {
        if (error) {
            console.error(`exec error: ${error}`);
            return;
        }
    });
    try {
        const output = fs.createWriteStream(backupPath + backupFile);
        const archive = archiver('zip', {
            zlib: { level: 9 } // compression level
        });
        archive.directory(backupPath + 'live-maintenance-master', false);
        await sendEmailDatabase(backupFile, backupPath);
        output.on('close', async () => {
            console.log('Zip file created successfully!');
        });
        archive.pipe(output);
        archive.finalize();
    }
    catch (error) {
        console.log('errrr', error);
    }
};
const sendEmailDatabase = async (backupFiles, backupPaths) => {
    let backupFile = backupFiles;
    let backupPath = backupPaths;
    let template = 'database';
    let datta = {
        to: 'abhishekg.ebiz@gmail.com',
        subject: 'database backup',
        template: template,
        sendEmailTemplatedata: {
            app_name: process.env.APP_NAME,
            attachment: backupPath + backupFile,
            filename: "Database"
        },
        attachments: {
            filename: backupFile,
            path: backupPath + backupFile,
        }
    };
    await commonFunction_1.default.sendEmailTemplate(datta);
};
exports.default = {
    destroyToken,
    removeLogger,
    databaseBackup
};
