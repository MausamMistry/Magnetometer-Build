"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const admin_guard_1 = require("../middleware/admin-guard");
const decryptData_1 = __importDefault(require("../helper/decryptData"));
const auth_1 = __importDefault(require("../controllers/admin/auth"));
const common_validation_1 = __importDefault(require("../validation/common-validation"));
const category_1 = __importDefault(require("../controllers/admin/category"));
const category_validation_1 = __importDefault(require("../validation/admin/category-validation"));
const user_1 = __importDefault(require("../controllers/admin/user"));
const user_validation_1 = __importDefault(require("../validation/admin/user-validation"));
const faq_1 = __importDefault(require("../controllers/admin/faq"));
const faq_validation_1 = __importDefault(require("../validation/admin/faq-validation"));
const setting_1 = __importDefault(require("../controllers/admin/setting"));
const setting_validation_1 = __importDefault(require("../validation/admin/setting-validation"));
const cms_1 = __importDefault(require("../controllers/admin/cms"));
const cms_validation_1 = __importDefault(require("../validation/admin/cms-validation"));
const ourContactUs_1 = __importDefault(require("../controllers/admin/ourContactUs"));
const ourContactUs_validation_1 = __importDefault(require("../validation/admin/ourContactUs-validation"));
const contactUs_1 = __importDefault(require("../controllers/admin/contactUs"));
const contactUs_validation_1 = __importDefault(require("../validation/admin/contactUs-validation"));
const socialMedia_1 = __importDefault(require("../controllers/admin/socialMedia"));
const socialMedia_validation_1 = __importDefault(require("../validation/admin/socialMedia-validation"));
const language_1 = __importDefault(require("../controllers/admin/language"));
// Constants
const adminRouter = (0, express_1.Router)();
adminRouter.use(decryptData_1.default.DecryptedData);
adminRouter.use(admin_guard_1.authAdmin);
adminRouter.post("/change-password", auth_1.default.changePassword);
adminRouter.post("/logout", auth_1.default.logout);
adminRouter.post("/profile-update", auth_1.default.updateProfile);
adminRouter.get("/profile", auth_1.default.getProfile);
// *******************************************************************************************
// ================================== Start Setting  Route =======================================
// *******************************************************************************************
adminRouter.get("/setting/get", setting_1.default.get);
adminRouter.post("/setting/store", setting_validation_1.default.store, setting_1.default.store);
adminRouter.get("/setting/edit-get", common_validation_1.default.idRequiredQuery, setting_1.default.edit);
adminRouter.delete("/setting/delete", common_validation_1.default.idRequiredQuery, setting_1.default.destroy);
adminRouter.post("/setting/change-status", common_validation_1.default.idRequired, setting_1.default.changeStatus);
// *******************************************************************************************
// ================================== End Setting  Route =========================================
// *******************************************************************************************
// *******************************************************************************************
// ================================== Start Socila Media  Route =======================================
// *******************************************************************************************
adminRouter.get("/social-media/get", socialMedia_1.default.get);
adminRouter.post("/social-media/store", socialMedia_validation_1.default.store, socialMedia_1.default.store);
adminRouter.get("/social-media/edit-get", common_validation_1.default.idRequiredQuery, socialMedia_1.default.edit);
adminRouter.delete("/social-media/delete", common_validation_1.default.idRequiredQuery, socialMedia_1.default.destroy);
adminRouter.post("/social-media/change-status", common_validation_1.default.idRequired, socialMedia_1.default.changeStatus);
// *******************************************************************************************
// ================================== End Socila Media  Route =========================================
// *******************************************************************************************
// *******************************************************************************************
// ================================== Start Faqs Route =======================================
// *******************************************************************************************
adminRouter.get("/faq/get", faq_1.default.get);
adminRouter.post("/faq/store", faq_validation_1.default.store, faq_1.default.store);
adminRouter.get("/faq/edit-get", common_validation_1.default.idRequiredQuery, faq_1.default.edit);
adminRouter.delete("/faq/delete", common_validation_1.default.idRequiredQuery, faq_1.default.destroy);
adminRouter.post("/faq/change-status", common_validation_1.default.idRequired, faq_1.default.changeStatus);
// *******************************************************************************************
// ================================== End Faqs Route =========================================
// *******************************************************************************************
// *******************************************************************************************
// ================================== Start category Route =======================================
// *******************************************************************************************
adminRouter.get("/category/get", category_1.default.get);
adminRouter.post("/category/store", category_validation_1.default.store, category_1.default.store);
adminRouter.get("/category/edit-get", common_validation_1.default.idRequiredQuery, category_1.default.edit);
adminRouter.delete("/category/delete", common_validation_1.default.idRequiredQuery, category_1.default.destroy);
adminRouter.post("/category/change-status", common_validation_1.default.idRequired, category_1.default.changeStatus);
// *******************************************************************************************
// ================================== End category Route =========================================
// *******************************************************************************************
// *******************************************************************************************
// ================================== Start customer Route =======================================
// *******************************************************************************************
adminRouter.get("/user/getAll", user_1.default.getAll);
adminRouter.get("/user/get", user_1.default.get);
adminRouter.post("/user/store", user_validation_1.default.store, user_1.default.store);
adminRouter.get("/user/edit-get", common_validation_1.default.idRequiredQuery, user_1.default.edit);
adminRouter.delete("/user/delete", common_validation_1.default.idRequiredQuery, user_1.default.destroy);
adminRouter.post("/user/change-status", common_validation_1.default.idRequired, user_1.default.changeStatus);
adminRouter.post("/user/change-status-firebase", common_validation_1.default.idRequired, user_1.default.changeStatusFirebase);
adminRouter.post("/user/change-status-email", common_validation_1.default.idRequired, user_1.default.changeStatusEmail);
// *******************************************************************************************
// ================================== End customer Route =========================================
// *******************************************************************************************
// *******************************************************************************************
// ================================== Start setting Route =======================================
// *******************************************************************************************
adminRouter.get("/setting/get", setting_1.default.get);
adminRouter.post("/setting/store", setting_validation_1.default.store, setting_1.default.store);
// *******************************************************************************************
// ================================== End setting Route =========================================
// *******************************************************************************************
// *******************************************************************************************
// ================================== Start cms Route =======================================
// *******************************************************************************************
adminRouter.get("/cms/get", cms_1.default.get);
adminRouter.post("/cms/store", cms_validation_1.default.store, cms_1.default.store);
// *******************************************************************************************
// ================================== End cms Route =========================================
// *******************************************************************************************
// *******************************************************************************************
// ================================== Start our-contact-us Route =======================================
// *******************************************************************************************
adminRouter.get("/our-contact-us/get", ourContactUs_1.default.get);
adminRouter.post("/our-contact-us/store", ourContactUs_validation_1.default.store, ourContactUs_1.default.store);
// *******************************************************************************************
// ================================== End our-contact-us Route =========================================
// *******************************************************************************************
// *******************************************************************************************
// ================================== Start contact_us Route =======================================
// *******************************************************************************************
adminRouter.get("/contact-us/get", contactUs_1.default.get);
adminRouter.post("/contact-us/store", contactUs_validation_1.default.store, contactUs_1.default.store);
adminRouter.get("/contact-us/edit-get", common_validation_1.default.idRequiredQuery, contactUs_1.default.edit);
adminRouter.delete("/contact-us/delete", common_validation_1.default.idRequiredQuery, contactUs_1.default.destroy);
adminRouter.post("/contact-us/change-status", common_validation_1.default.idRequired, contactUs_1.default.changeStatus);
// *******************************************************************************************
// ================================== End contact_us Route =========================================
// *******************************************************************************************
// *******************************************************************************************
// ================================== start language Route =========================================
// *******************************************************************************************
adminRouter.post("/add-language", language_1.default.store);
adminRouter.post("/get", language_1.default.getAll);
adminRouter.post("/delete", language_1.default.deleteData);
adminRouter.post("/change-status", language_1.default.changeStatusLanguage);
// *******************************************************************************************
// ================================== End language Route =========================================
// *******************************************************************************************
// Export default
exports.default = adminRouter;
