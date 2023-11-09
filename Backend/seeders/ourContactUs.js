'use strict';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require('dotenv').config({ path: 'D:/oct/iAudiMeter/iAudioMeter-Backend' + '/.env' });
const our_contact_us_model_1 = __importDefault(require("../models/our-contact-us-model"));
const mongoose_1 = __importDefault(require("mongoose"));
const contactUsData = [
    {
        key: 'email',
        value: 'juhi@gmail.com'
    },
    {
        key: 'contact_no',
        value: '123456789'
    },
    {
        key: 'location',
        value: '{"address":"Sydney NSW, Australia","latitude":-33.8688197,"longitude":-33.8688197}'
    },
    {
        key: 'website',
        value: 'www.google.com'
    },
    {
        key: 'admin_email',
        value: 'maintance.master.app@gmail.com'
    },
];
const seedDB = async () => {
    if (process.env.MONGO_URI) {
        await mongoose_1.default.connect(process.env.MONGO_URI);
        await our_contact_us_model_1.default.deleteMany({});
        await our_contact_us_model_1.default.create(contactUsData);
    }
};
seedDB().then(() => {
    mongoose_1.default.connection.close();
});
