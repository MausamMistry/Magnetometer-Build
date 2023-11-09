"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_guard_1 = require("../middleware/user-guard");
const decryptData_1 = __importDefault(require("../helper/decryptData"));
const auth_1 = __importDefault(require("../controllers/customer/auth"));
const auth_validation_1 = __importDefault(require("../validation/customer/auth-validation"));
const patients_1 = __importDefault(require("../controllers/customer/patients"));
// Constants
const userRouter = (0, express_1.Router)();
userRouter.use(decryptData_1.default.DecryptedData);
userRouter.use(user_guard_1.authUser);
userRouter.post("/change-password", auth_validation_1.default.changePassword, auth_1.default.changePassword);
userRouter.post("/logout", auth_1.default.logout);
userRouter.post("/profile-update", auth_validation_1.default.profile, auth_1.default.updateProfile);
userRouter.get("/profile", auth_1.default.getProfile);
userRouter.post("/notification", auth_1.default.getNotification);
userRouter.get("/notification/count", auth_1.default.getCountNotification);
userRouter.get("/notification/read", auth_1.default.readNotification);
//patient module
userRouter.post("/patient/add", patients_1.default.store);
userRouter.post("/patient/get", patients_1.default.getAll);
userRouter.post("/patient/delete", patients_1.default.destroy);
// Export default
exports.default = userRouter;
