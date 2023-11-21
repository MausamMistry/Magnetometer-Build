"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const schema = new mongoose_1.Schema({
    user_id: { type: mongoose_1.Schema.Types.Mixed },
    sensordata: { type: String },
    devicetoken: { type: String },
    updated_by: { type: String }
}, {
    timestamps: true,
});
const SensorModel = (0, mongoose_1.model)("sensors", schema);
exports.default = SensorModel;
