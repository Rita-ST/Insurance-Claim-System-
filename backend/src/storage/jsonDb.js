"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.readDb = readDb;
exports.writeDb = writeDb;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const types_1 = require("../events/types");
const DB_PATH = path_1.default.join(__dirname, '../../data.json');
const defaultData = {
    claims: [],
    eventLog: [],
    notifications: [],
};
function readDb() {
    if (!fs_1.default.existsSync(DB_PATH)) {
        fs_1.default.writeFileSync(DB_PATH, JSON.stringify(defaultData, null, 2));
        return defaultData;
    }
    return JSON.parse(fs_1.default.readFileSync(DB_PATH, 'utf-8'));
}
function writeDb(data) {
    fs_1.default.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}
//# sourceMappingURL=jsonDb.js.map