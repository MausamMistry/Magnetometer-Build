"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const schema = new mongoose_1.Schema({
    doctor_id: { type: mongoose_1.Schema.Types.ObjectId },
    clinic_id: { type: mongoose_1.Schema.Types.ObjectId },
    clinicians_id: { type: mongoose_1.Schema.Types.ObjectId },
    name: { type: String },
    email: { type: String },
    dob: { type: String },
    address: { type: String },
    phone_no: { type: String },
    city: { type: String },
    zipcode: { type: String },
    insurance_company_name: { type: String },
    gender: { type: String },
    is_active: { type: Boolean, default: false },
}, {
    timestamps: true
});
const patientModel = (0, mongoose_1.model)('patients', schema);
exports.default = patientModel;
