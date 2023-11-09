"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const schema = new mongoose_1.Schema({
    clinic_name: { type: String },
    name: { type: String },
    type: { type: String },
    date_of_birth: { type: String },
    location: { type: String },
    mobile_no: { type: String },
    email: { type: String },
    password: { type: String },
    profile_photo: { type: String },
    email_is_active: { type: Boolean, default: true },
    is_active: { type: Boolean, default: true },
    doctor_id: { type: mongoose_1.Schema.Types.ObjectId },
    is_verified: { type: Boolean, default: false },
    added_by: { type: mongoose_1.Schema.Types.ObjectId },
    updated_by: { type: String },
    //for clincian
    Certification_name: { type: String },
    Degree_name: { type: String }
}, {
    timestamps: true,
});
const UserModel = (0, mongoose_1.model)("users", schema);
exports.default = UserModel;
