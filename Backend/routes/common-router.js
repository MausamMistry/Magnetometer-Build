"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const common_1 = __importDefault(require("../controllers/common/common"));
const decryptData_1 = __importDefault(require("../helper/decryptData"));
// Constants
const commonRouter = (0, express_1.Router)();
commonRouter.use(decryptData_1.default.DecryptedData);
commonRouter.get('/category', common_1.default.getCategory);
commonRouter.post('/admin-active', common_1.default.GetActiveAdmin);
commonRouter.post('/vendor-active', common_1.default.GetActiveVendor);
commonRouter.post('/customer-active', common_1.default.GetActiveCustomer);
commonRouter.get("/social-media-get", common_1.default.getSocialMedia);
commonRouter.post("/our-contact-us-get", common_1.default.getOurContactUs);
commonRouter.post('/service-type-active', common_1.default.getServiceType);
// Export default
exports.default = commonRouter;
