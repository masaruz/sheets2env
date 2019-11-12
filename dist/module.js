"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var colors_1 = require("colors");
var googleapis_1 = require("googleapis");
var service_1 = require("./service");
var SheetEnv = (function () {
    function SheetEnv(credentials, config, token) {
        if (token === void 0) { token = {
            access_token: '',
            expiry_date: 0,
            refresh_token: '',
            scope: '',
            token_type: ''
        }; }
        this.credentials = credentials;
        this.config = config;
        this.token = token;
    }
    SheetEnv.prototype.sync = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, client_secret, client_id, redirect_uris, _b, gsheets, tabs, sheetdata, e_1, data;
            var _this = this;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _a = this.credentials.installed, client_secret = _a.client_secret, client_id = _a.client_id, redirect_uris = _a.redirect_uris;
                        this.oAuth2Client = new googleapis_1.google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
                        if (!this.token.access_token) return [3, 1];
                        this.oAuth2Client.setCredentials(this.token);
                        return [3, 3];
                    case 1:
                        _b = this;
                        return [4, service_1.getNewToken(this.oAuth2Client)];
                    case 2:
                        _b.oAuth2Client = _c.sent();
                        _c.label = 3;
                    case 3:
                        gsheets = googleapis_1.google.sheets({ version: 'v4', auth: this.oAuth2Client });
                        tabs = this.config.projects.map(function (project) { return project.tab + "!A2:F"; });
                        console.log(colors_1.yellow("Retreiving data from sheets " + tabs + " ..."));
                        _c.label = 4;
                    case 4:
                        _c.trys.push([4, 6, , 7]);
                        return [4, gsheets.spreadsheets.values.batchGet({
                                ranges: tabs,
                                spreadsheetId: this.config.sheetId
                            })];
                    case 5:
                        sheetdata = _c.sent();
                        return [3, 7];
                    case 6:
                        e_1 = _c.sent();
                        throw new Error(e_1);
                    case 7:
                        data = sheetdata.data.valueRanges;
                        if (data.length <= 0) {
                            throw new Error('No data found.');
                        }
                        data.forEach(function (range) {
                            var project = range.range.split("!")[0].replace(/\'/g, '');
                            var rows = range.values;
                            var pconfig = _this.config.projects.find(function (p) { return p.tab === project; });
                            service_1.createDotEnv(rows.map(function (row) {
                                var key = row[0];
                                var value = row[pconfig.column];
                                if (!value) {
                                    throw new Error("Value of " + key + " is not defined");
                                }
                                return { key: key, value: value };
                            }), pconfig.dest);
                        });
                        return [2];
                }
            });
        });
    };
    return SheetEnv;
}());
exports.SheetEnv = SheetEnv;
//# sourceMappingURL=module.js.map