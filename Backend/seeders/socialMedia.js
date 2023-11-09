'use strict';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require('dotenv').config({ path: 'D:/oct/iAudiMeter/iAudioMeter-Backend' + '/.env' });
const social_media_model_1 = __importDefault(require("../models/social-media-model"));
const mongoose_1 = __importDefault(require("mongoose"));
const data = [
    {
        name: 'Facebook',
        value: 'www.facebook.com',
        is_active: true,
    },
    {
        name: 'Twitter',
        value: 'www.twitter.com',
        is_active: true,
    },
    {
        name: 'Linkedin',
        value: 'www.linkedin.com',
        is_active: true,
    },
];
const seedDB = async () => {
    if (process.env.MONGO_URI) {
        await mongoose_1.default.connect(process.env.MONGO_URI);
        await social_media_model_1.default.deleteMany({});
        await social_media_model_1.default.create(data);
    }
};
seedDB().then(() => {
    mongoose_1.default.connection.close();
});
