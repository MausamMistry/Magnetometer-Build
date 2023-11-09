"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv").config();
const express = require("express");
const http = require("http");
const bodyParser = require("body-parser");
const cron = require("node-cron");
const cors = require("cors");
const log4js = require("log4js");
const mongoose = require("mongoose");
const index_1 = __importDefault(require("./routes/index"));
const cron_1 = __importDefault(require("./controllers/common/cron"));
const morgan = require("morgan");
const stripe = require('stripe')(process.env.STRIPE_KEY);
// config();
var port = process.env.PORT;
log4js.configure({
    appenders: {
        everything: {
            type: "dateFile",
            filename: "./logger/all-the-logs.log",
            maxLogSize: 10485760,
            backups: 3,
            compress: true,
        },
    },
    categories: {
        default: { appenders: ["everything"], level: "debug" },
    },
});
// Router Prefix Setup
express.application.prefix = express.Router.prefix = function (path, configure) {
    var router = express.Router();
    this.use(path, router);
    configure(router);
    return router;
};
// prefix Over
const app = express();
app.use(morgan(":method :url :response-time"));
// prefix start
// body mathi data get  karva start
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
// body mathi data get  karva over
app.set("view engine", "ejs");
const corsOptions = {
    origin: "*",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
    optionSuccessStatus: 200,
};
app.use(cors(corsOptions)); // Use this after the variable declaration
// start route
app.get("/api/", function (req, res) {
    res.send("Hello World!123");
});
app.use("/api", index_1.default);
const server = http.createServer(app);
server.listen(port, async (req, res) => {
    if (process.env.MONGO_URI) {
        await mongoose
            .connect(process.env.MONGO_URI, {})
            .then(() => {
            console.log('Mongodb Connection ✅');
        })
            .catch((err) => {
            console.log(err);
        });
    }
    console.log("Server is running on Port: " + port);
    // logger.info('Express server started on port: ' + port);
});
server.timeout = 90000;
cron.schedule("0 0 */3 * *", async () => {
    await cron_1.default.removeLogger();
});
cron.schedule("0 12 * * *", async () => {
    await cron_1.default.databaseBackup();
});
