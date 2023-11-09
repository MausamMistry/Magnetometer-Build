"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const schema = new mongoose_1.Schema({
    key: { type: String },
    value: { type: String },
    is_active: { type: Boolean, default: false },
}, {
    timestamps: true
});
const languageModel = (0, mongoose_1.model)('languages', schema);
exports.default = languageModel;
