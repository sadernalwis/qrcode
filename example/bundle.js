(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define('qrcode', ['exports'], factory) :
    (global = global || self, factory(global.QRCode = {}));
}(this, function (exports) { 'use strict';

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation. All rights reserved.
    Licensed under the Apache License, Version 2.0 (the "License"); you may not use
    this file except in compliance with the License. You may obtain a copy of the
    License at http://www.apache.org/licenses/LICENSE-2.0

    THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
    KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
    WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
    MERCHANTABLITY OR NON-INFRINGEMENT.

    See the Apache Version 2.0 License for specific language governing permissions
    and limitations under the License.
    ***************************************************************************** */
    /* global Reflect, Promise */

    var extendStatics = function(d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };

    function __extends(d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    }

    var __assign = function() {
        __assign = Object.assign || function __assign(t) {
            for (var s, i = 1, n = arguments.length; i < n; i++) {
                s = arguments[i];
                for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
            }
            return t;
        };
        return __assign.apply(this, arguments);
    };

    /**
     * @module Mode
     * @author nuintun
     * @author Kazuhiko Arase
     */
    var Mode;
    (function (Mode) {
        // number
        Mode[Mode["Numeric"] = 1] = "Numeric";
        // alphabet and number
        Mode[Mode["Alphanumeric"] = 2] = "Alphanumeric";
        // 8 bit byte
        Mode[Mode["Byte"] = 4] = "Byte";
        // KANJI
        Mode[Mode["Kanji"] = 8] = "Kanji";
    })(Mode || (Mode = {}));
    var Mode$1 = Mode;

    /**
     * @module QRData
     * @author nuintun
     * @author Kazuhiko Arase
     */
    var QRData = /** @class */ (function () {
        function QRData(mode, data) {
            this.mode = mode;
            this.data = data;
        }
        QRData.prototype.getMode = function () {
            return this.mode;
        };
        QRData.prototype.getData = function () {
            return this.data;
        };
        QRData.prototype.getLengthInBits = function (version) {
            var mode = this.mode;
            var error = "illegal mode: " + mode;
            if (1 <= version && version < 10) {
                // 1 - 9
                switch (mode) {
                    case Mode$1.Numeric:
                        return 10;
                    case Mode$1.Alphanumeric:
                        return 9;
                    case Mode$1.Byte:
                        return 8;
                    case Mode$1.Kanji:
                        return 8;
                    default:
                        throw error;
                }
            }
            else if (version < 27) {
                // 10 - 26
                switch (mode) {
                    case Mode$1.Numeric:
                        return 12;
                    case Mode$1.Alphanumeric:
                        return 11;
                    case Mode$1.Byte:
                        return 16;
                    case Mode$1.Kanji:
                        return 10;
                    default:
                        throw error;
                }
            }
            else if (version < 41) {
                // 27 - 40
                switch (mode) {
                    case Mode$1.Numeric:
                        return 14;
                    case Mode$1.Alphanumeric:
                        return 13;
                    case Mode$1.Byte:
                        return 16;
                    case Mode$1.Kanji:
                        return 12;
                    default:
                        throw error;
                }
            }
            else {
                throw "illegal version: " + version;
            }
        };
        return QRData;
    }());

    /**
     * @module UTF8
     * @author nuintun
     */
    /**
     * @function UTF8
     * @param {string} str
     * @returns {number[]}
     * @see https://github.com/google/closure-library/blob/master/closure/goog/crypt/crypt.js
     */
    function UTF8(str) {
        var pos = 0;
        var bytes = [];
        for (var i = 0; i < str.length; i++) {
            var code = str.charCodeAt(i);
            if (code < 128) {
                bytes[pos++] = code;
            }
            else if (code < 2048) {
                bytes[pos++] = (code >> 6) | 192;
                bytes[pos++] = (code & 63) | 128;
            }
            else if ((code & 0xfc00) === 0xd800 && i + 1 < str.length && (str.charCodeAt(i + 1) & 0xfc00) === 0xdc00) {
                // Surrogate Pair
                code = 0x10000 + ((code & 0x03ff) << 10) + (str.charCodeAt(++i) & 0x03ff);
                bytes[pos++] = (code >> 18) | 240;
                bytes[pos++] = ((code >> 12) & 63) | 128;
                bytes[pos++] = ((code >> 6) & 63) | 128;
                bytes[pos++] = (code & 63) | 128;
            }
            else {
                bytes[pos++] = (code >> 12) | 224;
                bytes[pos++] = ((code >> 6) & 63) | 128;
                bytes[pos++] = (code & 63) | 128;
            }
        }
        return bytes;
    }

    /**
     * @module QR8BitByte
     * @author nuintun
     * @author Kazuhiko Arase
     */
    var QRByte = /** @class */ (function (_super) {
        __extends(QRByte, _super);
        /**
         * @constructor
         * @param {string} data
         */
        function QRByte(data) {
            return _super.call(this, Mode$1.Byte, data) || this;
        }
        /**
         * @public
         * @method write
         * @param {BitBuffer} buffer
         */
        QRByte.prototype.write = function (buffer) {
            var data = UTF8(this.getData());
            var length = data.length;
            for (var i = 0; i < length; i++) {
                buffer.put(data[i], 8);
            }
        };
        /**
         * @public
         * @method getLength
         * @returns {number}
         */
        QRByte.prototype.getLength = function () {
            return UTF8(this.getData()).length;
        };
        return QRByte;
    }(QRData));

    /**
     * @module ErrorCorrectLevel
     * @author nuintun
     * @author Kazuhiko Arase
     */
    /**
     * @readonly
     * @enum {L, M, Q, H}
     */
    var ErrorCorrectLevel;
    (function (ErrorCorrectLevel) {
        // 7%
        ErrorCorrectLevel[ErrorCorrectLevel["L"] = 1] = "L";
        // 15%
        ErrorCorrectLevel[ErrorCorrectLevel["M"] = 0] = "M";
        // 25%
        ErrorCorrectLevel[ErrorCorrectLevel["Q"] = 3] = "Q";
        // 30%
        ErrorCorrectLevel[ErrorCorrectLevel["H"] = 2] = "H";
    })(ErrorCorrectLevel || (ErrorCorrectLevel = {}));
    var ErrorCorrectLevel$1 = ErrorCorrectLevel;

    /**
     * @module RSBlock
     * @author nuintun
     * @author Kazuhiko Arase
     */
    var RSBlock = /** @class */ (function () {
        function RSBlock(totalCount, dataCount) {
            this.dataCount = dataCount;
            this.totalCount = totalCount;
        }
        RSBlock.prototype.getDataCount = function () {
            return this.dataCount;
        };
        RSBlock.prototype.getTotalCount = function () {
            return this.totalCount;
        };
        RSBlock.getRSBlocks = function (version, errorCorrectLevel) {
            var rsBlocks = [];
            var rsBlock = RSBlock.getRSBlockTable(version, errorCorrectLevel);
            var length = rsBlock.length / 3;
            for (var i = 0; i < length; i++) {
                var count = rsBlock[i * 3 + 0];
                var totalCount = rsBlock[i * 3 + 1];
                var dataCount = rsBlock[i * 3 + 2];
                for (var j = 0; j < count; j++) {
                    rsBlocks.push(new RSBlock(totalCount, dataCount));
                }
            }
            return rsBlocks;
        };
        RSBlock.getRSBlockTable = function (version, errorCorrectLevel) {
            switch (errorCorrectLevel) {
                case ErrorCorrectLevel$1.L:
                    return RSBlock.RS_BLOCK_TABLE[(version - 1) * 4 + 0];
                case ErrorCorrectLevel$1.M:
                    return RSBlock.RS_BLOCK_TABLE[(version - 1) * 4 + 1];
                case ErrorCorrectLevel$1.Q:
                    return RSBlock.RS_BLOCK_TABLE[(version - 1) * 4 + 2];
                case ErrorCorrectLevel$1.H:
                    return RSBlock.RS_BLOCK_TABLE[(version - 1) * 4 + 3];
                default:
                    throw "illegal error correct level: " + errorCorrectLevel;
            }
        };
        RSBlock.RS_BLOCK_TABLE = [
            // L
            // M
            // Q
            // H
            // 1
            [1, 26, 19],
            [1, 26, 16],
            [1, 26, 13],
            [1, 26, 9],
            // 2
            [1, 44, 34],
            [1, 44, 28],
            [1, 44, 22],
            [1, 44, 16],
            // 3
            [1, 70, 55],
            [1, 70, 44],
            [2, 35, 17],
            [2, 35, 13],
            // 4
            [1, 100, 80],
            [2, 50, 32],
            [2, 50, 24],
            [4, 25, 9],
            // 5
            [1, 134, 108],
            [2, 67, 43],
            [2, 33, 15, 2, 34, 16],
            [2, 33, 11, 2, 34, 12],
            // 6
            [2, 86, 68],
            [4, 43, 27],
            [4, 43, 19],
            [4, 43, 15],
            // 7
            [2, 98, 78],
            [4, 49, 31],
            [2, 32, 14, 4, 33, 15],
            [4, 39, 13, 1, 40, 14],
            // 8
            [2, 121, 97],
            [2, 60, 38, 2, 61, 39],
            [4, 40, 18, 2, 41, 19],
            [4, 40, 14, 2, 41, 15],
            // 9
            [2, 146, 116],
            [3, 58, 36, 2, 59, 37],
            [4, 36, 16, 4, 37, 17],
            [4, 36, 12, 4, 37, 13],
            // 10
            [2, 86, 68, 2, 87, 69],
            [4, 69, 43, 1, 70, 44],
            [6, 43, 19, 2, 44, 20],
            [6, 43, 15, 2, 44, 16],
            // 11
            [4, 101, 81],
            [1, 80, 50, 4, 81, 51],
            [4, 50, 22, 4, 51, 23],
            [3, 36, 12, 8, 37, 13],
            // 12
            [2, 116, 92, 2, 117, 93],
            [6, 58, 36, 2, 59, 37],
            [4, 46, 20, 6, 47, 21],
            [7, 42, 14, 4, 43, 15],
            // 13
            [4, 133, 107],
            [8, 59, 37, 1, 60, 38],
            [8, 44, 20, 4, 45, 21],
            [12, 33, 11, 4, 34, 12],
            // 14
            [3, 145, 115, 1, 146, 116],
            [4, 64, 40, 5, 65, 41],
            [11, 36, 16, 5, 37, 17],
            [11, 36, 12, 5, 37, 13],
            // 15
            [5, 109, 87, 1, 110, 88],
            [5, 65, 41, 5, 66, 42],
            [5, 54, 24, 7, 55, 25],
            [11, 36, 12, 7, 37, 13],
            // 16
            [5, 122, 98, 1, 123, 99],
            [7, 73, 45, 3, 74, 46],
            [15, 43, 19, 2, 44, 20],
            [3, 45, 15, 13, 46, 16],
            // 17
            [1, 135, 107, 5, 136, 108],
            [10, 74, 46, 1, 75, 47],
            [1, 50, 22, 15, 51, 23],
            [2, 42, 14, 17, 43, 15],
            // 18
            [5, 150, 120, 1, 151, 121],
            [9, 69, 43, 4, 70, 44],
            [17, 50, 22, 1, 51, 23],
            [2, 42, 14, 19, 43, 15],
            // 19
            [3, 141, 113, 4, 142, 114],
            [3, 70, 44, 11, 71, 45],
            [17, 47, 21, 4, 48, 22],
            [9, 39, 13, 16, 40, 14],
            // 20
            [3, 135, 107, 5, 136, 108],
            [3, 67, 41, 13, 68, 42],
            [15, 54, 24, 5, 55, 25],
            [15, 43, 15, 10, 44, 16],
            // 21
            [4, 144, 116, 4, 145, 117],
            [17, 68, 42],
            [17, 50, 22, 6, 51, 23],
            [19, 46, 16, 6, 47, 17],
            // 22
            [2, 139, 111, 7, 140, 112],
            [17, 74, 46],
            [7, 54, 24, 16, 55, 25],
            [34, 37, 13],
            // 23
            [4, 151, 121, 5, 152, 122],
            [4, 75, 47, 14, 76, 48],
            [11, 54, 24, 14, 55, 25],
            [16, 45, 15, 14, 46, 16],
            // 24
            [6, 147, 117, 4, 148, 118],
            [6, 73, 45, 14, 74, 46],
            [11, 54, 24, 16, 55, 25],
            [30, 46, 16, 2, 47, 17],
            // 25
            [8, 132, 106, 4, 133, 107],
            [8, 75, 47, 13, 76, 48],
            [7, 54, 24, 22, 55, 25],
            [22, 45, 15, 13, 46, 16],
            // 26
            [10, 142, 114, 2, 143, 115],
            [19, 74, 46, 4, 75, 47],
            [28, 50, 22, 6, 51, 23],
            [33, 46, 16, 4, 47, 17],
            // 27
            [8, 152, 122, 4, 153, 123],
            [22, 73, 45, 3, 74, 46],
            [8, 53, 23, 26, 54, 24],
            [12, 45, 15, 28, 46, 16],
            // 28
            [3, 147, 117, 10, 148, 118],
            [3, 73, 45, 23, 74, 46],
            [4, 54, 24, 31, 55, 25],
            [11, 45, 15, 31, 46, 16],
            // 29
            [7, 146, 116, 7, 147, 117],
            [21, 73, 45, 7, 74, 46],
            [1, 53, 23, 37, 54, 24],
            [19, 45, 15, 26, 46, 16],
            // 30
            [5, 145, 115, 10, 146, 116],
            [19, 75, 47, 10, 76, 48],
            [15, 54, 24, 25, 55, 25],
            [23, 45, 15, 25, 46, 16],
            // 31
            [13, 145, 115, 3, 146, 116],
            [2, 74, 46, 29, 75, 47],
            [42, 54, 24, 1, 55, 25],
            [23, 45, 15, 28, 46, 16],
            // 32
            [17, 145, 115],
            [10, 74, 46, 23, 75, 47],
            [10, 54, 24, 35, 55, 25],
            [19, 45, 15, 35, 46, 16],
            // 33
            [17, 145, 115, 1, 146, 116],
            [14, 74, 46, 21, 75, 47],
            [29, 54, 24, 19, 55, 25],
            [11, 45, 15, 46, 46, 16],
            // 34
            [13, 145, 115, 6, 146, 116],
            [14, 74, 46, 23, 75, 47],
            [44, 54, 24, 7, 55, 25],
            [59, 46, 16, 1, 47, 17],
            // 35
            [12, 151, 121, 7, 152, 122],
            [12, 75, 47, 26, 76, 48],
            [39, 54, 24, 14, 55, 25],
            [22, 45, 15, 41, 46, 16],
            // 36
            [6, 151, 121, 14, 152, 122],
            [6, 75, 47, 34, 76, 48],
            [46, 54, 24, 10, 55, 25],
            [2, 45, 15, 64, 46, 16],
            // 37
            [17, 152, 122, 4, 153, 123],
            [29, 74, 46, 14, 75, 47],
            [49, 54, 24, 10, 55, 25],
            [24, 45, 15, 46, 46, 16],
            // 38
            [4, 152, 122, 18, 153, 123],
            [13, 74, 46, 32, 75, 47],
            [48, 54, 24, 14, 55, 25],
            [42, 45, 15, 32, 46, 16],
            // 39
            [20, 147, 117, 4, 148, 118],
            [40, 75, 47, 7, 76, 48],
            [43, 54, 24, 22, 55, 25],
            [10, 45, 15, 67, 46, 16],
            // 40
            [19, 148, 118, 6, 149, 119],
            [18, 75, 47, 31, 76, 48],
            [34, 54, 24, 34, 55, 25],
            [20, 45, 15, 61, 46, 16]
        ];
        return RSBlock;
    }());

    /**
     * @module QRMath
     * @author nuintun
     * @author Kazuhiko Arase
     */
    var EXP_TABLE = [];
    var LOG_TABLE = [];
    for (var i = 0; i < 256; i++) {
        LOG_TABLE[i] = 0;
        EXP_TABLE[i] = i < 8 ? 1 << i : EXP_TABLE[i - 4] ^ EXP_TABLE[i - 5] ^ EXP_TABLE[i - 6] ^ EXP_TABLE[i - 8];
    }
    for (var i = 0; i < 255; i++) {
        LOG_TABLE[EXP_TABLE[i]] = i;
    }
    function glog(n) {
        if (n < 1) {
            throw "illegal log: " + n;
        }
        return LOG_TABLE[n];
    }
    function gexp(n) {
        while (n < 0) {
            n += 255;
        }
        while (n >= 256) {
            n -= 255;
        }
        return EXP_TABLE[n];
    }

    /**
     * @module Polynomial
     * @author nuintun
     * @author Kazuhiko Arase
     */
    var Polynomial = /** @class */ (function () {
        function Polynomial(num, shift) {
            if (shift === void 0) { shift = 0; }
            this.num = [];
            var offset = 0;
            while (offset < num.length && num[offset] === 0) {
                offset++;
            }
            var length = num.length - offset;
            for (var i = 0; i < length; i++) {
                this.num.push(num[offset + i]);
            }
            for (var i = 0; i < shift; i++) {
                this.num.push(0);
            }
        }
        Polynomial.prototype.getAt = function (index) {
            return this.num[index];
        };
        Polynomial.prototype.getLength = function () {
            return this.num.length;
        };
        Polynomial.prototype.toString = function () {
            var buffer = '';
            var length = this.getLength();
            for (var i = 0; i < length; i++) {
                if (i > 0) {
                    buffer += ',';
                }
                buffer += this.getAt(i);
            }
            return buffer;
        };
        Polynomial.prototype.multiply = function (e) {
            var num = [];
            var eLength = e.getLength();
            var tLength = this.getLength();
            var dLength = tLength + eLength - 1;
            for (var i = 0; i < dLength; i++) {
                num.push(0);
            }
            for (var i = 0; i < tLength; i++) {
                for (var j = 0; j < eLength; j++) {
                    num[i + j] ^= gexp(glog(this.getAt(i)) + glog(e.getAt(j)));
                }
            }
            return new Polynomial(num);
        };
        Polynomial.prototype.mod = function (e) {
            var eLength = e.getLength();
            var tLength = this.getLength();
            if (tLength - eLength < 0) {
                return this;
            }
            var ratio = glog(this.getAt(0)) - glog(e.getAt(0));
            // create copy
            var num = [];
            for (var i = 0; i < tLength; i++) {
                num.push(this.getAt(i));
            }
            // subtract and calc rest.
            for (var i = 0; i < eLength; i++) {
                num[i] ^= gexp(glog(e.getAt(i)) + ratio);
            }
            // call recursively
            return new Polynomial(num).mod(e);
        };
        return Polynomial;
    }());

    /**
     * @module MaskPattern
     * @author nuintun
     * @author Kazuhiko Arase
     */
    var MaskPattern;
    (function (MaskPattern) {
        // mask pattern 000
        MaskPattern[MaskPattern["PATTERN000"] = 0] = "PATTERN000";
        // mask pattern 001
        MaskPattern[MaskPattern["PATTERN001"] = 1] = "PATTERN001";
        // mask pattern 010
        MaskPattern[MaskPattern["PATTERN010"] = 2] = "PATTERN010";
        // mask pattern 011
        MaskPattern[MaskPattern["PATTERN011"] = 3] = "PATTERN011";
        // mask pattern 100
        MaskPattern[MaskPattern["PATTERN100"] = 4] = "PATTERN100";
        // mask pattern 101
        MaskPattern[MaskPattern["PATTERN101"] = 5] = "PATTERN101";
        // mask pattern 110
        MaskPattern[MaskPattern["PATTERN110"] = 6] = "PATTERN110";
        // mask pattern 111
        MaskPattern[MaskPattern["PATTERN111"] = 7] = "PATTERN111";
    })(MaskPattern || (MaskPattern = {}));
    var MaskPattern$1 = MaskPattern;

    /**
     * @module QRUtil
     * @author nuintun
     * @author Kazuhiko Arase
     */
    var ALIGNMENT_PATTERN_TABLE = [
        [],
        [6, 18],
        [6, 22],
        [6, 26],
        [6, 30],
        [6, 34],
        [6, 22, 38],
        [6, 24, 42],
        [6, 26, 46],
        [6, 28, 50],
        [6, 30, 54],
        [6, 32, 58],
        [6, 34, 62],
        [6, 26, 46, 66],
        [6, 26, 48, 70],
        [6, 26, 50, 74],
        [6, 30, 54, 78],
        [6, 30, 56, 82],
        [6, 30, 58, 86],
        [6, 34, 62, 90],
        [6, 28, 50, 72, 94],
        [6, 26, 50, 74, 98],
        [6, 30, 54, 78, 102],
        [6, 28, 54, 80, 106],
        [6, 32, 58, 84, 110],
        [6, 30, 58, 86, 114],
        [6, 34, 62, 90, 118],
        [6, 26, 50, 74, 98, 122],
        [6, 30, 54, 78, 102, 126],
        [6, 26, 52, 78, 104, 130],
        [6, 30, 56, 82, 108, 134],
        [6, 34, 60, 86, 112, 138],
        [6, 30, 58, 86, 114, 142],
        [6, 34, 62, 90, 118, 146],
        [6, 30, 54, 78, 102, 126, 150],
        [6, 24, 50, 76, 102, 128, 154],
        [6, 28, 54, 80, 106, 132, 158],
        [6, 32, 58, 84, 110, 136, 162],
        [6, 26, 54, 82, 110, 138, 166],
        [6, 30, 58, 86, 114, 142, 170]
    ];
    var G15_MASK = (1 << 14) | (1 << 12) | (1 << 10) | (1 << 4) | (1 << 1);
    var G15 = (1 << 10) | (1 << 8) | (1 << 5) | (1 << 4) | (1 << 2) | (1 << 1) | (1 << 0);
    var G18 = (1 << 12) | (1 << 11) | (1 << 10) | (1 << 9) | (1 << 8) | (1 << 5) | (1 << 2) | (1 << 0);
    function getAlignmentPattern(version) {
        return ALIGNMENT_PATTERN_TABLE[version - 1];
    }
    function getErrorCorrectPolynomial(errorCorrectLength) {
        var e = new Polynomial([1]);
        for (var i = 0; i < errorCorrectLength; i++) {
            e = e.multiply(new Polynomial([1, gexp(i)]));
        }
        return e;
    }
    function getMaskFunc(maskPattern) {
        switch (maskPattern) {
            case MaskPattern$1.PATTERN000:
                return function (x, y) { return (x + y) % 2 === 0; };
            case MaskPattern$1.PATTERN001:
                return function (x, y) { return x % 2 === 0; };
            case MaskPattern$1.PATTERN010:
                return function (x, y) { return y % 3 === 0; };
            case MaskPattern$1.PATTERN011:
                return function (x, y) { return (x + y) % 3 === 0; };
            case MaskPattern$1.PATTERN100:
                return function (x, y) { return (((x / 2) >>> 0) + ((y / 3) >>> 0)) % 2 === 0; };
            case MaskPattern$1.PATTERN101:
                return function (x, y) { return ((x * y) % 2) + ((x * y) % 3) === 0; };
            case MaskPattern$1.PATTERN110:
                return function (x, y) { return (((x * y) % 2) + ((x * y) % 3)) % 2 === 0; };
            case MaskPattern$1.PATTERN111:
                return function (x, y) { return (((x * y) % 3) + ((x + y) % 2)) % 2 === 0; };
            default:
                throw "illegal mask: " + maskPattern;
        }
    }
    /**
     * @function getPenaltyScore
     * @param {QRCode} qrcode
     * @see https://www.jianshu.com/p/cfa2bae198ea
     * @see https://www.thonky.com/qr-code-tutorial/data-masking
     */
    function getPenaltyScore(qrcode) {
        var score = 0;
        var moduleCount = qrcode.getModuleCount();
        // penalty rule 1
        for (var row = 0; row < moduleCount; row++) {
            for (var col = 0; col < moduleCount; col++) {
                var sameCount = 0;
                var dark = qrcode.isDark(row, col);
                for (var r = -1; r <= 1; r++) {
                    if (row + r < 0 || moduleCount <= row + r) {
                        continue;
                    }
                    for (var c = -1; c <= 1; c++) {
                        if (col + c < 0 || moduleCount <= col + c) {
                            continue;
                        }
                        if (r === 0 && c === 0) {
                            continue;
                        }
                        if (dark === qrcode.isDark(row + r, col + c)) {
                            sameCount++;
                        }
                    }
                }
                if (sameCount > 5) {
                    score += 3 + sameCount - 5;
                }
            }
        }
        // penalty rule 2
        for (var row = 0; row < moduleCount - 1; row++) {
            for (var col = 0; col < moduleCount - 1; col++) {
                var count = 0;
                if (qrcode.isDark(row, col)) {
                    count++;
                }
                if (qrcode.isDark(row + 1, col)) {
                    count++;
                }
                if (qrcode.isDark(row, col + 1)) {
                    count++;
                }
                if (qrcode.isDark(row + 1, col + 1)) {
                    count++;
                }
                if (count === 0 || count === 4) {
                    score += 3;
                }
            }
        }
        // penalty rule 3
        for (var row = 0; row < moduleCount; row++) {
            for (var col = 0; col < moduleCount - 6; col++) {
                // vertical
                var _a = [
                    qrcode.isDark(row, col),
                    qrcode.isDark(row, col + 1),
                    qrcode.isDark(row, col + 2),
                    qrcode.isDark(row, col + 3),
                    qrcode.isDark(row, col + 4),
                    qrcode.isDark(row, col + 5),
                    qrcode.isDark(row, col + 6)
                ], r0 = _a[0], r1 = _a[1], r2 = _a[2], r3 = _a[3], r4 = _a[4], r5 = _a[5], r6 = _a[6];
                // dark - light - dark - dark - dark - light - dark
                if (r0 && !r1 && r2 && r3 && r4 && !r5 && r6) {
                    score += 40;
                }
                // horizontal
                var _b = [
                    qrcode.isDark(col, row),
                    qrcode.isDark(col + 1, row),
                    qrcode.isDark(col + 2, row),
                    qrcode.isDark(col + 3, row),
                    qrcode.isDark(col + 4, row),
                    qrcode.isDark(col + 5, row),
                    qrcode.isDark(col + 6, row)
                ], c0 = _b[0], c1 = _b[1], c2 = _b[2], c3 = _b[3], c4 = _b[4], c5 = _b[5], c6 = _b[6];
                // dark - light - dark - dark - dark - light - dark
                if (c0 && !c1 && c2 && c3 && c4 && !c5 && c6) {
                    score += 40;
                }
            }
        }
        // penalty rule 4
        var darkCount = 0;
        for (var col = 0; col < moduleCount; col++) {
            for (var row = 0; row < moduleCount; row++) {
                if (qrcode.isDark(row, col)) {
                    darkCount++;
                }
            }
        }
        score += 10 * Math.floor(Math.abs((darkCount / (moduleCount * moduleCount)) * 100 - 50) / 5);
        return score;
    }
    function getBCHDigit(data) {
        var digit = 0;
        while (data !== 0) {
            digit++;
            data >>>= 1;
        }
        return digit;
    }
    function getBCHVersion(data) {
        var offset = data << 12;
        while (getBCHDigit(offset) - getBCHDigit(G18) >= 0) {
            offset ^= G18 << (getBCHDigit(offset) - getBCHDigit(G18));
        }
        return (data << 12) | offset;
    }
    function getBCHVersionInfo(data) {
        var offset = data << 10;
        while (getBCHDigit(offset) - getBCHDigit(G15) >= 0) {
            offset ^= G15 << (getBCHDigit(offset) - getBCHDigit(G15));
        }
        return ((data << 10) | offset) ^ G15_MASK;
    }

    /**
     * @module BitBuffer
     * @author nuintun
     * @author Kazuhiko Arase
     */
    var BitBuffer = /** @class */ (function () {
        function BitBuffer() {
            this.length = 0;
            this.buffer = [];
        }
        BitBuffer.prototype.getBuffer = function () {
            return this.buffer;
        };
        BitBuffer.prototype.getLengthInBits = function () {
            return this.length;
        };
        BitBuffer.prototype.toString = function () {
            var buffer = '';
            var length = this.length;
            for (var i = 0; i < length; i++) {
                buffer += this.getBit(i) ? '1' : '0';
            }
            return buffer;
        };
        BitBuffer.prototype.getBit = function (index) {
            return ((this.buffer[(index / 8) >>> 0] >>> (7 - (index % 8))) & 1) === 1;
        };
        BitBuffer.prototype.put = function (num, length) {
            for (var i = 0; i < length; i++) {
                this.putBit(((num >>> (length - i - 1)) & 1) === 1);
            }
        };
        BitBuffer.prototype.putBit = function (bit) {
            if (this.length === this.buffer.length * 8) {
                this.buffer.push(0);
            }
            if (bit) {
                this.buffer[(this.length / 8) >>> 0] |= 0x80 >>> this.length % 8;
            }
            this.length++;
        };
        return BitBuffer;
    }());

    /**
     * @module InputStream
     * @author nuintun
     * @author Kazuhiko Arase
     */
    var InputStream = /** @class */ (function () {
        function InputStream() {
        }
        return InputStream;
    }());

    /**
     * @module ByteArrayInputStream
     * @author nuintun
     * @author Kazuhiko Arase
     */
    var ByteArrayInputStream = /** @class */ (function (_super) {
        __extends(ByteArrayInputStream, _super);
        function ByteArrayInputStream(bytes) {
            var _this = _super.call(this) || this;
            _this.pos = 0;
            _this.bytes = bytes;
            return _this;
        }
        ByteArrayInputStream.prototype.readByte = function () {
            if (this.pos < this.bytes.length) {
                var byte = this.bytes[this.pos++];
                return byte;
            }
            return -1;
        };
        ByteArrayInputStream.prototype.close = function () {
            this.pos = 0;
            this.bytes = [];
        };
        return ByteArrayInputStream;
    }(InputStream));

    /**
     * @module OutputStream
     * @author nuintun
     * @author Kazuhiko Arase
     */
    var OutputStream = /** @class */ (function () {
        function OutputStream() {
        }
        OutputStream.prototype.writeBytes = function (bytes) {
            var length = bytes.length;
            for (var i = 0; i < length; i++) {
                this.writeByte(bytes[i]);
            }
        };
        OutputStream.prototype.flush = function () {
            // flush
        };
        OutputStream.prototype.close = function () {
            this.flush();
        };
        return OutputStream;
    }());

    /**
     * @module ByteArrayOutputStream
     * @author nuintun
     * @author Kazuhiko Arase
     */
    var ByteArrayOutputStream = /** @class */ (function (_super) {
        __extends(ByteArrayOutputStream, _super);
        function ByteArrayOutputStream() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.bytes = [];
            return _this;
        }
        ByteArrayOutputStream.prototype.writeByte = function (byte) {
            this.bytes.push(byte);
        };
        ByteArrayOutputStream.prototype.toByteArray = function () {
            return this.bytes;
        };
        return ByteArrayOutputStream;
    }(OutputStream));

    /**
     * @module Base64DecodeInputStream
     * @author nuintun
     * @author Kazuhiko Arase
     */
    var Base64DecodeInputStream = /** @class */ (function (_super) {
        __extends(Base64DecodeInputStream, _super);
        function Base64DecodeInputStream(stream) {
            var _this = _super.call(this) || this;
            _this.buffer = 0;
            _this.bufLength = 0;
            _this.stream = stream;
            return _this;
        }
        Base64DecodeInputStream.prototype.readByte = function () {
            var stream = this.stream;
            while (this.bufLength < 8) {
                var byte_1 = stream.readByte();
                if (byte_1 === -1) {
                    if (this.bufLength === 0) {
                        return -1;
                    }
                    throw "unexpected end of stream";
                }
                else if (byte_1 === 0x3d) {
                    this.bufLength = 0;
                    return -1;
                }
                else if (Base64DecodeInputStream.isWhitespace(byte_1)) {
                    // ignore if whitespace.
                    continue;
                }
                this.buffer = (this.buffer << 6) | Base64DecodeInputStream.decode(byte_1);
                this.bufLength += 6;
            }
            var byte = (this.buffer >>> (this.bufLength - 8)) & 0xff;
            this.bufLength -= 8;
            return byte;
        };
        Base64DecodeInputStream.isWhitespace = function (ch) {
            // \v \t \r \n
            return ch === 0x0b || ch === 0x09 || ch === 0x0d || ch === 0x0a;
        };
        Base64DecodeInputStream.decode = function (ch) {
            if (0x41 <= ch && ch <= 0x5a) {
                // A - Z
                return ch - 0x41;
            }
            else if (0x61 <= ch && ch <= 0x7a) {
                // a - z
                return ch - 0x61 + 26;
            }
            else if (0x30 <= ch && ch <= 0x39) {
                // 0 - 9
                return ch - 0x30 + 52;
            }
            else if (ch === 0x2b) {
                // +
                return 62;
            }
            else if (ch === 0x2f) {
                // /
                return 63;
            }
            else {
                throw "illegal char: " + String.fromCharCode(ch);
            }
        };
        Base64DecodeInputStream.prototype.close = function () {
            this.buffer = 0;
            this.bufLength = 0;
            this.stream = null;
        };
        return Base64DecodeInputStream;
    }(InputStream));

    /**
     * @module Base64EncodeOutputStream
     * @author nuintun
     * @author Kazuhiko Arase
     */
    var Base64EncodeOutputStream = /** @class */ (function (_super) {
        __extends(Base64EncodeOutputStream, _super);
        function Base64EncodeOutputStream(stream) {
            var _this = _super.call(this) || this;
            _this.buffer = 0;
            _this.length = 0;
            _this.bufLength = 0;
            _this.stream = stream;
            return _this;
        }
        Base64EncodeOutputStream.prototype.writeByte = function (byte) {
            this.buffer = (this.buffer << 8) | (byte & 0xff);
            this.bufLength += 8;
            this.length++;
            while (this.bufLength >= 6) {
                this.writeEncoded(this.buffer >>> (this.bufLength - 6));
                this.bufLength -= 6;
            }
        };
        /**
         * @override
         */
        Base64EncodeOutputStream.prototype.flush = function () {
            if (this.bufLength > 0) {
                this.writeEncoded(this.buffer << (6 - this.bufLength));
                this.buffer = 0;
                this.bufLength = 0;
            }
            if (this.length % 3 != 0) {
                // padding
                var pad = 3 - (this.length % 3);
                for (var i = 0; i < pad; i++) {
                    // =
                    this.stream.writeByte(0x3d);
                }
            }
        };
        Base64EncodeOutputStream.prototype.writeEncoded = function (byte) {
            this.stream.writeByte(Base64EncodeOutputStream.encode(byte & 0x3f));
        };
        Base64EncodeOutputStream.encode = function (ch) {
            if (ch >= 0) {
                if (ch < 26) {
                    // A
                    return 0x41 + ch;
                }
                else if (ch < 52) {
                    // a
                    return 0x61 + (ch - 26);
                }
                else if (ch < 62) {
                    // 0
                    return 0x30 + (ch - 52);
                }
                else if (ch === 62) {
                    // +
                    return 0x2b;
                }
                else if (ch === 63) {
                    // /
                    return 0x2f;
                }
            }
            throw "illegal char: " + String.fromCharCode(ch);
        };
        return Base64EncodeOutputStream;
    }(OutputStream));

    /**
     * @module Base64
     * @author nuintun
     * @author Kazuhiko Arase
     */
    function encode(data) {
        var output = new ByteArrayOutputStream();
        try {
            var stream = new Base64EncodeOutputStream(output);
            try {
                stream.writeBytes(data);
            }
            finally {
                stream.close();
            }
        }
        finally {
            output.close();
        }
        return output.toByteArray();
    }

    /**
     * @module GIF Image (B/W)
     * @author nuintun
     * @author Kazuhiko Arase
     */
    var LZWTable = /** @class */ (function () {
        function LZWTable() {
            this.size = 0;
            this.map = {};
        }
        LZWTable.prototype.add = function (key) {
            if (!this.contains(key)) {
                this.map[key] = this.size++;
            }
        };
        LZWTable.prototype.getSize = function () {
            return this.size;
        };
        LZWTable.prototype.indexOf = function (key) {
            return this.map[key];
        };
        LZWTable.prototype.contains = function (key) {
            return this.map.hasOwnProperty(key);
        };
        return LZWTable;
    }());
    var BitOutputStream = /** @class */ (function () {
        function BitOutputStream(output) {
            this.output = output;
            this.bitLength = 0;
        }
        BitOutputStream.prototype.write = function (data, length) {
            if (data >>> length !== 0) {
                throw 'length overflow';
            }
            while (this.bitLength + length >= 8) {
                this.output.writeByte(0xff & ((data << this.bitLength) | this.bitBuffer));
                length -= 8 - this.bitLength;
                data >>>= 8 - this.bitLength;
                this.bitBuffer = 0;
                this.bitLength = 0;
            }
            this.bitBuffer = (data << this.bitLength) | this.bitBuffer;
            this.bitLength = this.bitLength + length;
        };
        BitOutputStream.prototype.flush = function () {
            if (this.bitLength > 0) {
                this.output.writeByte(this.bitBuffer);
            }
            this.output.flush();
        };
        BitOutputStream.prototype.close = function () {
            this.flush();
            this.output.close();
        };
        return BitOutputStream;
    }());
    var GIFImage = /** @class */ (function () {
        function GIFImage(width, height) {
            this.data = [];
            this.width = width;
            this.height = height;
            var size = width * height;
            for (var i = 0; i < size; i++) {
                this.data[i] = 0;
            }
        }
        GIFImage.prototype.setPixel = function (x, y, pixel) {
            if (x < 0 || this.width <= x)
                throw "illegal x axis: " + x;
            if (y < 0 || this.height <= y)
                throw "illegal y axis: " + y;
            this.data[y * this.width + x] = pixel;
        };
        GIFImage.prototype.getPixel = function (x, y) {
            if (x < 0 || this.width <= x)
                throw "illegal x axis: " + x;
            if (y < 0 || this.height <= y)
                throw "illegal x axis: " + y;
            return this.data[y * this.width + x];
        };
        GIFImage.prototype.write = function (output) {
            // GIF Signature
            output.writeByte(0x47); // G
            output.writeByte(0x49); // I
            output.writeByte(0x46); // F
            output.writeByte(0x38); // 8
            output.writeByte(0x37); // 7
            output.writeByte(0x61); // a
            // Screen Descriptor
            this.writeWord(output, this.width);
            this.writeWord(output, this.height);
            output.writeByte(0x80); // 2bit
            output.writeByte(0);
            output.writeByte(0);
            // Global Color Map
            // black
            output.writeByte(0x00);
            output.writeByte(0x00);
            output.writeByte(0x00);
            // white
            output.writeByte(0xff);
            output.writeByte(0xff);
            output.writeByte(0xff);
            // Image Descriptor
            output.writeByte(0x2c); // ,
            this.writeWord(output, 0);
            this.writeWord(output, 0);
            this.writeWord(output, this.width);
            this.writeWord(output, this.height);
            output.writeByte(0);
            // Local Color Map
            // Raster Data
            var lzwMinCodeSize = 2;
            var raster = this.getLZWRaster(lzwMinCodeSize);
            output.writeByte(lzwMinCodeSize);
            var offset = 0;
            while (raster.length - offset > 255) {
                output.writeByte(255);
                this.writeBytes(output, raster, offset, 255);
                offset += 255;
            }
            output.writeByte(raster.length - offset);
            this.writeBytes(output, raster, offset, raster.length - offset);
            output.writeByte(0x00);
            // GIF Terminator
            output.writeByte(0x3b); // ;
        };
        GIFImage.prototype.getLZWRaster = function (lzwMinCodeSize) {
            var clearCode = 1 << lzwMinCodeSize;
            var endCode = (1 << lzwMinCodeSize) + 1;
            // Setup LZWTable
            var table = new LZWTable();
            for (var i = 0; i < clearCode; i++) {
                table.add(String.fromCharCode(i));
            }
            table.add(String.fromCharCode(clearCode));
            table.add(String.fromCharCode(endCode));
            var byteOutput = new ByteArrayOutputStream();
            var bitOutput = new BitOutputStream(byteOutput);
            var bitLength = lzwMinCodeSize + 1;
            try {
                // clear code
                bitOutput.write(clearCode, bitLength);
                var dataIndex = 0;
                var s = String.fromCharCode(this.data[dataIndex++]);
                while (dataIndex < this.data.length) {
                    var c = String.fromCharCode(this.data[dataIndex++]);
                    if (table.contains(s + c)) {
                        s = s + c;
                    }
                    else {
                        bitOutput.write(table.indexOf(s), bitLength);
                        if (table.getSize() < 0xfff) {
                            if (table.getSize() === 1 << bitLength) {
                                bitLength++;
                            }
                            table.add(s + c);
                        }
                        s = c;
                    }
                }
                bitOutput.write(table.indexOf(s), bitLength);
                // end code
                bitOutput.write(endCode, bitLength);
            }
            finally {
                bitOutput.close();
            }
            return byteOutput.toByteArray();
        };
        GIFImage.prototype.writeWord = function (output, i) {
            output.writeByte(i & 0xff);
            output.writeByte((i >>> 8) & 0xff);
        };
        GIFImage.prototype.writeBytes = function (output, bytes, off, length) {
            for (var i = 0; i < length; i++) {
                output.writeByte(bytes[i + off]);
            }
        };
        GIFImage.prototype.toDataURL = function () {
            var output = new ByteArrayOutputStream();
            this.write(output);
            var bytes = encode(output.toByteArray());
            output.close();
            var length = bytes.length;
            var url = 'data:image/gif;base64,';
            for (var i = 0; i < length; i++) {
                url += String.fromCharCode(bytes[i]);
            }
            return url;
        };
        return GIFImage;
    }());

    /**
     * @module QRCode
     * @author nuintun
     * @author Kazuhiko Arase
     */
    var toString = Object.prototype.toString;
    function createNumArray(length) {
        var array = [];
        for (var i = 0; i < length; i++) {
            array[i] = 0;
        }
        return array;
    }
    var QRCode = /** @class */ (function () {
        function QRCode() {
            this.version = 0;
            this.moduleCount = 0;
            this.dataList = [];
            this.modules = [];
            this.autoVersion = this.version === 0;
            this.errorCorrectLevel = ErrorCorrectLevel$1.L;
        }
        /**
         * @public
         * @method getModules
         * @returns {boolean[][]}
         */
        QRCode.prototype.getModules = function () {
            return this.modules;
        };
        /**
         * @public
         * @method getModuleCount
         */
        QRCode.prototype.getModuleCount = function () {
            return this.moduleCount;
        };
        /**
         * @public
         * @method getVersion
         * @returns {number}
         */
        QRCode.prototype.getVersion = function () {
            return this.version;
        };
        /**
         * @public
         * @method setVersion
         * @param {number} version
         */
        QRCode.prototype.setVersion = function (version) {
            this.version = Math.min(40, Math.max(0, version >>> 0));
            this.autoVersion = this.version === 0;
        };
        /**
         * @public
         * @method getErrorCorrectLevel
         * @returns {ErrorCorrectLevel}
         */
        QRCode.prototype.getErrorCorrectLevel = function () {
            return this.errorCorrectLevel;
        };
        /**
         * @public
         * @method setErrorCorrectLevel
         * @param {ErrorCorrectLevel} errorCorrectLevel
         */
        QRCode.prototype.setErrorCorrectLevel = function (errorCorrectLevel) {
            switch (errorCorrectLevel) {
                case ErrorCorrectLevel$1.L:
                case ErrorCorrectLevel$1.M:
                case ErrorCorrectLevel$1.Q:
                case ErrorCorrectLevel$1.H:
                    this.errorCorrectLevel = errorCorrectLevel;
            }
        };
        /**
         * @public
         * @method write
         * @param {QRData} data
         */
        QRCode.prototype.write = function (data) {
            if (data instanceof QRData) {
                this.dataList.push(data);
            }
            else {
                var type = toString.call(data);
                if (type === '[object String]') {
                    this.dataList.push(new QRByte(data));
                }
                else {
                    throw "illegal data: " + data;
                }
            }
        };
        /**
         * @public
         * @method reset
         */
        QRCode.prototype.reset = function () {
            this.modules = [];
            this.dataList = [];
            this.moduleCount = 0;
            if (this.autoVersion) {
                this.version = 0;
            }
        };
        /**
         * @public
         * @method isDark
         * @param {number} row
         * @param {number} col
         * @returns {boolean}
         */
        QRCode.prototype.isDark = function (row, col) {
            if (this.modules[row][col] !== null) {
                return this.modules[row][col];
            }
            else {
                return false;
            }
        };
        QRCode.prototype.setupFinderPattern = function (row, col) {
            for (var r = -1; r <= 7; r++) {
                for (var c = -1; c <= 7; c++) {
                    if (row + r <= -1 || this.moduleCount <= row + r || col + c <= -1 || this.moduleCount <= col + c) {
                        continue;
                    }
                    if ((0 <= r && r <= 6 && (c === 0 || c === 6)) ||
                        (0 <= c && c <= 6 && (r === 0 || r === 6)) ||
                        (2 <= r && r <= 4 && 2 <= c && c <= 4)) {
                        this.modules[row + r][col + c] = true;
                    }
                    else {
                        this.modules[row + r][col + c] = false;
                    }
                }
            }
        };
        QRCode.prototype.setupAlignmentPattern = function () {
            var pos = getAlignmentPattern(this.version);
            var length = pos.length;
            for (var i = 0; i < length; i++) {
                for (var j = 0; j < length; j++) {
                    var row = pos[i];
                    var col = pos[j];
                    if (this.modules[row][col] !== null) {
                        continue;
                    }
                    for (var r = -2; r <= 2; r++) {
                        for (var c = -2; c <= 2; c++) {
                            if (r === -2 || r === 2 || c === -2 || c === 2 || (r === 0 && c === 0)) {
                                this.modules[row + r][col + c] = true;
                            }
                            else {
                                this.modules[row + r][col + c] = false;
                            }
                        }
                    }
                }
            }
        };
        QRCode.prototype.setupTimingPattern = function () {
            for (var i = 8; i < this.moduleCount - 8; i++) {
                var mod = i % 2 === 0;
                // vertical
                if (this.modules[i][6] === null) {
                    this.modules[i][6] = mod;
                }
                // horizontal
                if (this.modules[6][i] === null) {
                    this.modules[6][i] = mod;
                }
            }
        };
        QRCode.prototype.setupFormatInfo = function (test, maskPattern) {
            var data = (this.errorCorrectLevel << 3) | maskPattern;
            var bits = getBCHVersionInfo(data);
            for (var i = 0; i < 15; i++) {
                var mod = !test && ((bits >> i) & 1) === 1;
                // vertical
                if (i < 6) {
                    this.modules[i][8] = mod;
                }
                else if (i < 8) {
                    this.modules[i + 1][8] = mod;
                }
                else {
                    this.modules[this.moduleCount - 15 + i][8] = mod;
                }
                // horizontal
                if (i < 8) {
                    this.modules[8][this.moduleCount - i - 1] = mod;
                }
                else if (i < 9) {
                    this.modules[8][15 - i - 1 + 1] = mod;
                }
                else {
                    this.modules[8][15 - i - 1] = mod;
                }
            }
            // fixed
            this.modules[this.moduleCount - 8][8] = !test;
        };
        QRCode.prototype.setupVersionInfo = function (test) {
            var bits = getBCHVersion(this.version);
            for (var i = 0; i < 18; i++) {
                var mod = !test && ((bits >> i) & 1) === 1;
                this.modules[(i / 3) >>> 0][(i % 3) + this.moduleCount - 8 - 3] = mod;
                this.modules[(i % 3) + this.moduleCount - 8 - 3][(i / 3) >>> 0] = mod;
            }
        };
        QRCode.prepareData = function (version, errorCorrectLevel, dataList) {
            var dLength = dataList.length;
            var buffer = new BitBuffer();
            var rsBlocks = RSBlock.getRSBlocks(version, errorCorrectLevel);
            for (var i = 0; i < dLength; i++) {
                var data = dataList[i];
                buffer.put(data.getMode(), 4);
                buffer.put(data.getLength(), data.getLengthInBits(version));
                data.write(buffer);
            }
            // calc max data count
            var maxDataCount = 0;
            var rLength = rsBlocks.length;
            for (var i = 0; i < rLength; i++) {
                maxDataCount += rsBlocks[i].getDataCount();
            }
            maxDataCount *= 8;
            return [buffer, rsBlocks, maxDataCount];
        };
        QRCode.createBytes = function (buffer, rsBlocks) {
            var offset = 0;
            var maxDcCount = 0;
            var maxEcCount = 0;
            var maxTotalCount = 0;
            var dcData = [];
            var ecData = [];
            var rLength = rsBlocks.length;
            for (var r = 0; r < rLength; r++) {
                var dcCount = rsBlocks[r].getDataCount();
                var ecCount = rsBlocks[r].getTotalCount() - dcCount;
                dcData[r] = [];
                ecData[r] = [];
                maxDcCount = Math.max(maxDcCount, dcCount);
                maxEcCount = Math.max(maxEcCount, ecCount);
                dcData[r] = createNumArray(dcCount);
                for (var i = 0; i < dcCount; i++) {
                    dcData[r][i] = 0xff & buffer.getBuffer()[i + offset];
                }
                offset += dcCount;
                var rsPoly = getErrorCorrectPolynomial(ecCount);
                var rawPoly = new Polynomial(dcData[r], rsPoly.getLength() - 1);
                var modPoly = rawPoly.mod(rsPoly);
                var ecLength = rsPoly.getLength() - 1;
                ecData[r] = createNumArray(ecLength);
                for (var i = 0; i < ecLength; i++) {
                    var modIndex = i + modPoly.getLength() - ecData[r].length;
                    ecData[r][i] = modIndex >= 0 ? modPoly.getAt(modIndex) : 0;
                }
                maxTotalCount += rsBlocks[r].getTotalCount();
            }
            var index = 0;
            var data = createNumArray(maxTotalCount);
            for (var i = 0; i < maxDcCount; i++) {
                for (var r = 0; r < rLength; r++) {
                    if (i < dcData[r].length) {
                        data[index++] = dcData[r][i];
                    }
                }
            }
            for (var i = 0; i < maxEcCount; i++) {
                for (var r = 0; r < rLength; r++) {
                    if (i < ecData[r].length) {
                        data[index++] = ecData[r][i];
                    }
                }
            }
            return data;
        };
        QRCode.createData = function (buffer, rsBlocks, maxDataCount) {
            if (buffer.getLengthInBits() > maxDataCount) {
                throw "data overflow: " + buffer.getLengthInBits() + " > " + maxDataCount;
            }
            // end
            if (buffer.getLengthInBits() + 4 <= maxDataCount) {
                buffer.put(0, 4);
            }
            // padding
            while (buffer.getLengthInBits() % 8 !== 0) {
                buffer.putBit(false);
            }
            // padding
            while (true) {
                if (buffer.getLengthInBits() >= maxDataCount) {
                    break;
                }
                buffer.put(QRCode.PAD0, 8);
                if (buffer.getLengthInBits() >= maxDataCount) {
                    break;
                }
                buffer.put(QRCode.PAD1, 8);
            }
            return QRCode.createBytes(buffer, rsBlocks);
        };
        QRCode.prototype.mapData = function (data, maskPattern) {
            var inc = -1;
            var bitIndex = 7;
            var byteIndex = 0;
            var row = this.moduleCount - 1;
            var maskFunc = getMaskFunc(maskPattern);
            for (var col = this.moduleCount - 1; col > 0; col -= 2) {
                if (col === 6) {
                    col--;
                }
                while (true) {
                    for (var c = 0; c < 2; c++) {
                        if (this.modules[row][col - c] === null) {
                            var dark = false;
                            if (byteIndex < data.length) {
                                dark = ((data[byteIndex] >>> bitIndex) & 1) === 1;
                            }
                            var mask = maskFunc(row, col - c);
                            if (mask) {
                                dark = !dark;
                            }
                            this.modules[row][col - c] = dark;
                            if (--bitIndex === -1) {
                                byteIndex++;
                                bitIndex = 7;
                            }
                        }
                    }
                    row += inc;
                    if (row < 0 || this.moduleCount <= row) {
                        row -= inc;
                        inc = -inc;
                        break;
                    }
                }
            }
        };
        QRCode.prototype.makeImpl = function (test, data, maskPattern) {
            // initialize modules
            this.modules = [];
            for (var row = 0; row < this.moduleCount; row++) {
                this.modules[row] = [];
                for (var col = 0; col < this.moduleCount; col++) {
                    this.modules[row][col] = null;
                }
            }
            // setup finder pattern
            this.setupFinderPattern(0, 0);
            this.setupFinderPattern(this.moduleCount - 7, 0);
            this.setupFinderPattern(0, this.moduleCount - 7);
            // setup alignment pattern
            this.setupAlignmentPattern();
            // setup timing pattern
            this.setupTimingPattern();
            // setup format info
            this.setupFormatInfo(test, maskPattern);
            // setup version info
            if (this.version >= 7) {
                this.setupVersionInfo(test);
            }
            this.mapData(data, maskPattern);
        };
        QRCode.prototype.getBestMaskPattern = function (data) {
            var minimum = 0;
            var pattern = 0;
            for (var i = 0; i < 8; i++) {
                this.makeImpl(true, data, i);
                var score = getPenaltyScore(this);
                if (i === 0 || minimum > score) {
                    pattern = i;
                    minimum = score;
                }
            }
            return pattern;
        };
        /**
         * @public
         * @method make
         */
        QRCode.prototype.make = function () {
            var _a, _b;
            var buffer;
            var rsBlocks;
            var maxDataCount;
            var dataList = this.dataList;
            var errorCorrectLevel = this.errorCorrectLevel;
            if (this.autoVersion) {
                for (this.version = 1; this.version <= 40; this.version++) {
                    _a = QRCode.prepareData(this.version, errorCorrectLevel, dataList), buffer = _a[0], rsBlocks = _a[1], maxDataCount = _a[2];
                    if (buffer.getLengthInBits() <= maxDataCount)
                        break;
                }
            }
            else {
                _b = QRCode.prepareData(this.version, errorCorrectLevel, dataList), buffer = _b[0], rsBlocks = _b[1], maxDataCount = _b[2];
            }
            // calc module count
            this.moduleCount = this.version * 4 + 17;
            // create data
            var data = QRCode.createData(buffer, rsBlocks, maxDataCount);
            this.makeImpl(false, data, this.getBestMaskPattern(data));
        };
        /**
         * @public
         * @method toDataURL
         * @param {number} moduleSize
         * @param {number} margin
         * @returns {string}
         */
        QRCode.prototype.toDataURL = function (moduleSize, margin) {
            if (moduleSize === void 0) { moduleSize = 2; }
            if (margin === void 0) { margin = moduleSize * 4; }
            moduleSize = Math.max(1, moduleSize >>> 0);
            margin = Math.max(0, margin >>> 0);
            var mods = this.moduleCount;
            var size = moduleSize * mods + margin * 2;
            var gif = new GIFImage(size, size);
            for (var y = 0; y < size; y++) {
                for (var x = 0; x < size; x++) {
                    if (margin <= x &&
                        x < size - margin &&
                        margin <= y &&
                        y < size - margin &&
                        this.isDark(((y - margin) / moduleSize) >>> 0, ((x - margin) / moduleSize) >>> 0)) {
                        gif.setPixel(x, y, 0);
                    }
                    else {
                        gif.setPixel(x, y, 1);
                    }
                }
            }
            return gif.toDataURL();
        };
        QRCode.PAD0 = 0xec;
        QRCode.PAD1 = 0x11;
        return QRCode;
    }());

    /**
     * @module GenericGF
     * @author nuintun
     * @author Cosmo Wolfe
     */
    function addOrSubtractGF(a, b) {
        return a ^ b;
    }
    var GenericGF = /** @class */ (function () {
        function GenericGF(primitive, size, generatorBase) {
            this.primitive = primitive;
            this.size = size;
            this.generatorBase = generatorBase;
            this.expTable = [];
            this.logTable = [];
            var x = 1;
            for (var i = 0; i < this.size; i++) {
                this.logTable[i] = 0;
                this.expTable[i] = x;
                x = x * 2;
                if (x >= this.size) {
                    x = (x ^ this.primitive) & (this.size - 1);
                }
            }
            for (var i = 0; i < this.size - 1; i++) {
                this.logTable[this.expTable[i]] = i;
            }
            this.zero = new GenericGFPoly(this, Uint8ClampedArray.from([0]));
            this.one = new GenericGFPoly(this, Uint8ClampedArray.from([1]));
        }
        GenericGF.prototype.multiply = function (a, b) {
            if (a === 0 || b === 0) {
                return 0;
            }
            return this.expTable[(this.logTable[a] + this.logTable[b]) % (this.size - 1)];
        };
        GenericGF.prototype.inverse = function (a) {
            if (a === 0) {
                throw "can't invert 0";
            }
            return this.expTable[this.size - this.logTable[a] - 1];
        };
        GenericGF.prototype.buildMonomial = function (degree, coefficient) {
            if (degree < 0) {
                throw 'invalid monomial degree less than 0';
            }
            if (coefficient === 0) {
                return this.zero;
            }
            var coefficients = new Uint8ClampedArray(degree + 1);
            coefficients[0] = coefficient;
            return new GenericGFPoly(this, coefficients);
        };
        GenericGF.prototype.log = function (a) {
            if (a === 0) {
                throw "can't take log(0)";
            }
            return this.logTable[a];
        };
        GenericGF.prototype.exp = function (a) {
            return this.expTable[a];
        };
        return GenericGF;
    }());

    /**
     * @module GenericGFPoly
     * @author nuintun
     * @author Cosmo Wolfe
     */
    var GenericGFPoly = /** @class */ (function () {
        function GenericGFPoly(field, coefficients) {
            if (coefficients.length === 0) {
                throw 'no coefficients';
            }
            this.field = field;
            var coefficientsLength = coefficients.length;
            if (coefficientsLength > 1 && coefficients[0] === 0) {
                // Leading term must be non-zero for anything except the constant polynomial "0"
                var firstNonZero = 1;
                while (firstNonZero < coefficientsLength && coefficients[firstNonZero] === 0) {
                    firstNonZero++;
                }
                if (firstNonZero === coefficientsLength) {
                    this.coefficients = field.zero.coefficients;
                }
                else {
                    this.coefficients = new Uint8ClampedArray(coefficientsLength - firstNonZero);
                    for (var i = 0; i < this.coefficients.length; i++) {
                        this.coefficients[i] = coefficients[firstNonZero + i];
                    }
                }
            }
            else {
                this.coefficients = coefficients;
            }
        }
        GenericGFPoly.prototype.degree = function () {
            return this.coefficients.length - 1;
        };
        GenericGFPoly.prototype.isZero = function () {
            return this.coefficients[0] === 0;
        };
        GenericGFPoly.prototype.getCoefficient = function (degree) {
            return this.coefficients[this.coefficients.length - 1 - degree];
        };
        GenericGFPoly.prototype.addOrSubtract = function (other) {
            var _a;
            if (this.isZero()) {
                return other;
            }
            if (other.isZero()) {
                return this;
            }
            var smallerCoefficients = this.coefficients;
            var largerCoefficients = other.coefficients;
            if (smallerCoefficients.length > largerCoefficients.length) {
                _a = [largerCoefficients, smallerCoefficients], smallerCoefficients = _a[0], largerCoefficients = _a[1];
            }
            var sumDiff = new Uint8ClampedArray(largerCoefficients.length);
            var lengthDiff = largerCoefficients.length - smallerCoefficients.length;
            for (var i = 0; i < lengthDiff; i++) {
                sumDiff[i] = largerCoefficients[i];
            }
            for (var i = lengthDiff; i < largerCoefficients.length; i++) {
                sumDiff[i] = addOrSubtractGF(smallerCoefficients[i - lengthDiff], largerCoefficients[i]);
            }
            return new GenericGFPoly(this.field, sumDiff);
        };
        GenericGFPoly.prototype.multiply = function (scalar) {
            if (scalar === 0) {
                return this.field.zero;
            }
            if (scalar === 1) {
                return this;
            }
            var size = this.coefficients.length;
            var product = new Uint8ClampedArray(size);
            for (var i = 0; i < size; i++) {
                product[i] = this.field.multiply(this.coefficients[i], scalar);
            }
            return new GenericGFPoly(this.field, product);
        };
        GenericGFPoly.prototype.multiplyPoly = function (other) {
            if (this.isZero() || other.isZero()) {
                return this.field.zero;
            }
            var aCoefficients = this.coefficients;
            var aLength = aCoefficients.length;
            var bCoefficients = other.coefficients;
            var bLength = bCoefficients.length;
            var product = new Uint8ClampedArray(aLength + bLength - 1);
            for (var i = 0; i < aLength; i++) {
                var aCoeff = aCoefficients[i];
                for (var j = 0; j < bLength; j++) {
                    product[i + j] = addOrSubtractGF(product[i + j], this.field.multiply(aCoeff, bCoefficients[j]));
                }
            }
            return new GenericGFPoly(this.field, product);
        };
        GenericGFPoly.prototype.multiplyByMonomial = function (degree, coefficient) {
            if (degree < 0) {
                throw 'invalid degree less than 0';
            }
            if (coefficient === 0) {
                return this.field.zero;
            }
            var size = this.coefficients.length;
            var product = new Uint8ClampedArray(size + degree);
            for (var i = 0; i < size; i++) {
                product[i] = this.field.multiply(this.coefficients[i], coefficient);
            }
            return new GenericGFPoly(this.field, product);
        };
        GenericGFPoly.prototype.evaluateAt = function (a) {
            var result = 0;
            if (a === 0) {
                // Just return the x^0 coefficient
                return this.getCoefficient(0);
            }
            var size = this.coefficients.length;
            if (a === 1) {
                // Just the sum of the coefficients
                this.coefficients.forEach(function (coefficient) {
                    result = addOrSubtractGF(result, coefficient);
                });
                return result;
            }
            result = this.coefficients[0];
            for (var i = 1; i < size; i++) {
                result = addOrSubtractGF(this.field.multiply(a, result), this.coefficients[i]);
            }
            return result;
        };
        return GenericGFPoly;
    }());

    /**
     * @module index
     * @author nuintun
     * @author Cosmo Wolfe
     */
    function runEuclideanAlgorithm(field, a, b, R) {
        var _a;
        // Assume a's degree is >= b's
        if (a.degree() < b.degree()) {
            _a = [b, a], a = _a[0], b = _a[1];
        }
        var rLast = a;
        var r = b;
        var tLast = field.zero;
        var t = field.one;
        // Run Euclidean algorithm until r's degree is less than R/2
        while (r.degree() >= R / 2) {
            var rLastLast = rLast;
            var tLastLast = tLast;
            rLast = r;
            tLast = t;
            // Divide rLastLast by rLast, with quotient in q and remainder in r
            if (rLast.isZero()) {
                // Euclidean algorithm already terminated?
                return null;
            }
            r = rLastLast;
            var q = field.zero;
            var denominatorLeadingTerm = rLast.getCoefficient(rLast.degree());
            var dltInverse = field.inverse(denominatorLeadingTerm);
            while (r.degree() >= rLast.degree() && !r.isZero()) {
                var degreeDiff = r.degree() - rLast.degree();
                var scale = field.multiply(r.getCoefficient(r.degree()), dltInverse);
                q = q.addOrSubtract(field.buildMonomial(degreeDiff, scale));
                r = r.addOrSubtract(rLast.multiplyByMonomial(degreeDiff, scale));
            }
            t = q.multiplyPoly(tLast).addOrSubtract(tLastLast);
            if (r.degree() >= rLast.degree()) {
                return null;
            }
        }
        var sigmaTildeAtZero = t.getCoefficient(0);
        if (sigmaTildeAtZero === 0) {
            return null;
        }
        var inverse = field.inverse(sigmaTildeAtZero);
        return [t.multiply(inverse), r.multiply(inverse)];
    }
    function findErrorLocations(field, errorLocator) {
        // This is a direct application of Chien's search
        var numErrors = errorLocator.degree();
        if (numErrors === 1) {
            return [errorLocator.getCoefficient(1)];
        }
        var errorCount = 0;
        var result = new Array(numErrors);
        for (var i = 1; i < field.size && errorCount < numErrors; i++) {
            if (errorLocator.evaluateAt(i) === 0) {
                result[errorCount] = field.inverse(i);
                errorCount++;
            }
        }
        if (errorCount !== numErrors) {
            return null;
        }
        return result;
    }
    function findErrorMagnitudes(field, errorEvaluator, errorLocations) {
        // This is directly applying Forney's Formula
        var s = errorLocations.length;
        var result = new Array(s);
        for (var i = 0; i < s; i++) {
            var denominator = 1;
            var xiInverse = field.inverse(errorLocations[i]);
            for (var j = 0; j < s; j++) {
                if (i !== j) {
                    denominator = field.multiply(denominator, addOrSubtractGF(1, field.multiply(errorLocations[j], xiInverse)));
                }
            }
            result[i] = field.multiply(errorEvaluator.evaluateAt(xiInverse), field.inverse(denominator));
            if (field.generatorBase !== 0) {
                result[i] = field.multiply(result[i], xiInverse);
            }
        }
        return result;
    }
    function decode(bytes, twoS) {
        var outputBytes = new Uint8ClampedArray(bytes.length);
        outputBytes.set(bytes);
        var field = new GenericGF(0x011d, 256, 0); // x^8 + x^4 + x^3 + x^2 + 1
        var poly = new GenericGFPoly(field, outputBytes);
        var syndromeCoefficients = new Uint8ClampedArray(twoS);
        var error = false;
        for (var s = 0; s < twoS; s++) {
            var evaluation = poly.evaluateAt(field.exp(s + field.generatorBase));
            syndromeCoefficients[syndromeCoefficients.length - 1 - s] = evaluation;
            if (evaluation !== 0) {
                error = true;
            }
        }
        if (!error) {
            return outputBytes;
        }
        var syndrome = new GenericGFPoly(field, syndromeCoefficients);
        var sigmaOmega = runEuclideanAlgorithm(field, field.buildMonomial(twoS, 1), syndrome, twoS);
        if (sigmaOmega === null) {
            return null;
        }
        var errorLocations = findErrorLocations(field, sigmaOmega[0]);
        if (errorLocations == null) {
            return null;
        }
        var errorMagnitudes = findErrorMagnitudes(field, sigmaOmega[1], errorLocations);
        for (var i = 0; i < errorLocations.length; i++) {
            var position = outputBytes.length - 1 - field.log(errorLocations[i]);
            if (position < 0) {
                return null;
            }
            outputBytes[position] = addOrSubtractGF(outputBytes[position], errorMagnitudes[i]);
        }
        return outputBytes;
    }

    /**
     * @module BitMatrix
     * @author nuintun
     * @author Cosmo Wolfe
     */
    var BitMatrix = /** @class */ (function () {
        function BitMatrix(data, width) {
            this.data = data;
            this.width = width;
            this.height = data.length / width;
        }
        BitMatrix.createEmpty = function (width, height) {
            return new BitMatrix(new Uint8ClampedArray(width * height), width);
        };
        BitMatrix.prototype.get = function (x, y) {
            if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
                return false;
            }
            return !!this.data[y * this.width + x];
        };
        BitMatrix.prototype.set = function (x, y, v) {
            this.data[y * this.width + x] = v ? 1 : 0;
        };
        BitMatrix.prototype.setRegion = function (left, top, width, height, v) {
            for (var y = top; y < top + height; y++) {
                for (var x = left; x < left + width; x++) {
                    this.set(x, y, !!v);
                }
            }
        };
        return BitMatrix;
    }());

    /**
     * @module Version
     * @author nuintun
     * @author Cosmo Wolfe
     */
    var VERSIONS = [
        {
            infoBits: null,
            versionNumber: 1,
            alignmentPatternCenters: [],
            errorCorrectionLevels: [
                {
                    ecCodewordsPerBlock: 7,
                    ecBlocks: [{ numBlocks: 1, dataCodewordsPerBlock: 19 }]
                },
                {
                    ecCodewordsPerBlock: 10,
                    ecBlocks: [{ numBlocks: 1, dataCodewordsPerBlock: 16 }]
                },
                {
                    ecCodewordsPerBlock: 13,
                    ecBlocks: [{ numBlocks: 1, dataCodewordsPerBlock: 13 }]
                },
                {
                    ecCodewordsPerBlock: 17,
                    ecBlocks: [{ numBlocks: 1, dataCodewordsPerBlock: 9 }]
                }
            ]
        },
        {
            infoBits: null,
            versionNumber: 2,
            alignmentPatternCenters: [6, 18],
            errorCorrectionLevels: [
                {
                    ecCodewordsPerBlock: 10,
                    ecBlocks: [{ numBlocks: 1, dataCodewordsPerBlock: 34 }]
                },
                {
                    ecCodewordsPerBlock: 16,
                    ecBlocks: [{ numBlocks: 1, dataCodewordsPerBlock: 28 }]
                },
                {
                    ecCodewordsPerBlock: 22,
                    ecBlocks: [{ numBlocks: 1, dataCodewordsPerBlock: 22 }]
                },
                {
                    ecCodewordsPerBlock: 28,
                    ecBlocks: [{ numBlocks: 1, dataCodewordsPerBlock: 16 }]
                }
            ]
        },
        {
            infoBits: null,
            versionNumber: 3,
            alignmentPatternCenters: [6, 22],
            errorCorrectionLevels: [
                {
                    ecCodewordsPerBlock: 15,
                    ecBlocks: [{ numBlocks: 1, dataCodewordsPerBlock: 55 }]
                },
                {
                    ecCodewordsPerBlock: 26,
                    ecBlocks: [{ numBlocks: 1, dataCodewordsPerBlock: 44 }]
                },
                {
                    ecCodewordsPerBlock: 18,
                    ecBlocks: [{ numBlocks: 2, dataCodewordsPerBlock: 17 }]
                },
                {
                    ecCodewordsPerBlock: 22,
                    ecBlocks: [{ numBlocks: 2, dataCodewordsPerBlock: 13 }]
                }
            ]
        },
        {
            infoBits: null,
            versionNumber: 4,
            alignmentPatternCenters: [6, 26],
            errorCorrectionLevels: [
                {
                    ecCodewordsPerBlock: 20,
                    ecBlocks: [{ numBlocks: 1, dataCodewordsPerBlock: 80 }]
                },
                {
                    ecCodewordsPerBlock: 18,
                    ecBlocks: [{ numBlocks: 2, dataCodewordsPerBlock: 32 }]
                },
                {
                    ecCodewordsPerBlock: 26,
                    ecBlocks: [{ numBlocks: 2, dataCodewordsPerBlock: 24 }]
                },
                {
                    ecCodewordsPerBlock: 16,
                    ecBlocks: [{ numBlocks: 4, dataCodewordsPerBlock: 9 }]
                }
            ]
        },
        {
            infoBits: null,
            versionNumber: 5,
            alignmentPatternCenters: [6, 30],
            errorCorrectionLevels: [
                {
                    ecCodewordsPerBlock: 26,
                    ecBlocks: [{ numBlocks: 1, dataCodewordsPerBlock: 108 }]
                },
                {
                    ecCodewordsPerBlock: 24,
                    ecBlocks: [{ numBlocks: 2, dataCodewordsPerBlock: 43 }]
                },
                {
                    ecCodewordsPerBlock: 18,
                    ecBlocks: [{ numBlocks: 2, dataCodewordsPerBlock: 15 }, { numBlocks: 2, dataCodewordsPerBlock: 16 }]
                },
                {
                    ecCodewordsPerBlock: 22,
                    ecBlocks: [{ numBlocks: 2, dataCodewordsPerBlock: 11 }, { numBlocks: 2, dataCodewordsPerBlock: 12 }]
                }
            ]
        },
        {
            infoBits: null,
            versionNumber: 6,
            alignmentPatternCenters: [6, 34],
            errorCorrectionLevels: [
                {
                    ecCodewordsPerBlock: 18,
                    ecBlocks: [{ numBlocks: 2, dataCodewordsPerBlock: 68 }]
                },
                {
                    ecCodewordsPerBlock: 16,
                    ecBlocks: [{ numBlocks: 4, dataCodewordsPerBlock: 27 }]
                },
                {
                    ecCodewordsPerBlock: 24,
                    ecBlocks: [{ numBlocks: 4, dataCodewordsPerBlock: 19 }]
                },
                {
                    ecCodewordsPerBlock: 28,
                    ecBlocks: [{ numBlocks: 4, dataCodewordsPerBlock: 15 }]
                }
            ]
        },
        {
            infoBits: 0x07c94,
            versionNumber: 7,
            alignmentPatternCenters: [6, 22, 38],
            errorCorrectionLevels: [
                {
                    ecCodewordsPerBlock: 20,
                    ecBlocks: [{ numBlocks: 2, dataCodewordsPerBlock: 78 }]
                },
                {
                    ecCodewordsPerBlock: 18,
                    ecBlocks: [{ numBlocks: 4, dataCodewordsPerBlock: 31 }]
                },
                {
                    ecCodewordsPerBlock: 18,
                    ecBlocks: [{ numBlocks: 2, dataCodewordsPerBlock: 14 }, { numBlocks: 4, dataCodewordsPerBlock: 15 }]
                },
                {
                    ecCodewordsPerBlock: 26,
                    ecBlocks: [{ numBlocks: 4, dataCodewordsPerBlock: 13 }, { numBlocks: 1, dataCodewordsPerBlock: 14 }]
                }
            ]
        },
        {
            infoBits: 0x085bc,
            versionNumber: 8,
            alignmentPatternCenters: [6, 24, 42],
            errorCorrectionLevels: [
                {
                    ecCodewordsPerBlock: 24,
                    ecBlocks: [{ numBlocks: 2, dataCodewordsPerBlock: 97 }]
                },
                {
                    ecCodewordsPerBlock: 22,
                    ecBlocks: [{ numBlocks: 2, dataCodewordsPerBlock: 38 }, { numBlocks: 2, dataCodewordsPerBlock: 39 }]
                },
                {
                    ecCodewordsPerBlock: 22,
                    ecBlocks: [{ numBlocks: 4, dataCodewordsPerBlock: 18 }, { numBlocks: 2, dataCodewordsPerBlock: 19 }]
                },
                {
                    ecCodewordsPerBlock: 26,
                    ecBlocks: [{ numBlocks: 4, dataCodewordsPerBlock: 14 }, { numBlocks: 2, dataCodewordsPerBlock: 15 }]
                }
            ]
        },
        {
            infoBits: 0x09a99,
            versionNumber: 9,
            alignmentPatternCenters: [6, 26, 46],
            errorCorrectionLevels: [
                {
                    ecCodewordsPerBlock: 30,
                    ecBlocks: [{ numBlocks: 2, dataCodewordsPerBlock: 116 }]
                },
                {
                    ecCodewordsPerBlock: 22,
                    ecBlocks: [{ numBlocks: 3, dataCodewordsPerBlock: 36 }, { numBlocks: 2, dataCodewordsPerBlock: 37 }]
                },
                {
                    ecCodewordsPerBlock: 20,
                    ecBlocks: [{ numBlocks: 4, dataCodewordsPerBlock: 16 }, { numBlocks: 4, dataCodewordsPerBlock: 17 }]
                },
                {
                    ecCodewordsPerBlock: 24,
                    ecBlocks: [{ numBlocks: 4, dataCodewordsPerBlock: 12 }, { numBlocks: 4, dataCodewordsPerBlock: 13 }]
                }
            ]
        },
        {
            infoBits: 0x0a4d3,
            versionNumber: 10,
            alignmentPatternCenters: [6, 28, 50],
            errorCorrectionLevels: [
                {
                    ecCodewordsPerBlock: 18,
                    ecBlocks: [{ numBlocks: 2, dataCodewordsPerBlock: 68 }, { numBlocks: 2, dataCodewordsPerBlock: 69 }]
                },
                {
                    ecCodewordsPerBlock: 26,
                    ecBlocks: [{ numBlocks: 4, dataCodewordsPerBlock: 43 }, { numBlocks: 1, dataCodewordsPerBlock: 44 }]
                },
                {
                    ecCodewordsPerBlock: 24,
                    ecBlocks: [{ numBlocks: 6, dataCodewordsPerBlock: 19 }, { numBlocks: 2, dataCodewordsPerBlock: 20 }]
                },
                {
                    ecCodewordsPerBlock: 28,
                    ecBlocks: [{ numBlocks: 6, dataCodewordsPerBlock: 15 }, { numBlocks: 2, dataCodewordsPerBlock: 16 }]
                }
            ]
        },
        {
            infoBits: 0x0bbf6,
            versionNumber: 11,
            alignmentPatternCenters: [6, 30, 54],
            errorCorrectionLevels: [
                {
                    ecCodewordsPerBlock: 20,
                    ecBlocks: [{ numBlocks: 4, dataCodewordsPerBlock: 81 }]
                },
                {
                    ecCodewordsPerBlock: 30,
                    ecBlocks: [{ numBlocks: 1, dataCodewordsPerBlock: 50 }, { numBlocks: 4, dataCodewordsPerBlock: 51 }]
                },
                {
                    ecCodewordsPerBlock: 28,
                    ecBlocks: [{ numBlocks: 4, dataCodewordsPerBlock: 22 }, { numBlocks: 4, dataCodewordsPerBlock: 23 }]
                },
                {
                    ecCodewordsPerBlock: 24,
                    ecBlocks: [{ numBlocks: 3, dataCodewordsPerBlock: 12 }, { numBlocks: 8, dataCodewordsPerBlock: 13 }]
                }
            ]
        },
        {
            infoBits: 0x0c762,
            versionNumber: 12,
            alignmentPatternCenters: [6, 32, 58],
            errorCorrectionLevels: [
                {
                    ecCodewordsPerBlock: 24,
                    ecBlocks: [{ numBlocks: 2, dataCodewordsPerBlock: 92 }, { numBlocks: 2, dataCodewordsPerBlock: 93 }]
                },
                {
                    ecCodewordsPerBlock: 22,
                    ecBlocks: [{ numBlocks: 6, dataCodewordsPerBlock: 36 }, { numBlocks: 2, dataCodewordsPerBlock: 37 }]
                },
                {
                    ecCodewordsPerBlock: 26,
                    ecBlocks: [{ numBlocks: 4, dataCodewordsPerBlock: 20 }, { numBlocks: 6, dataCodewordsPerBlock: 21 }]
                },
                {
                    ecCodewordsPerBlock: 28,
                    ecBlocks: [{ numBlocks: 7, dataCodewordsPerBlock: 14 }, { numBlocks: 4, dataCodewordsPerBlock: 15 }]
                }
            ]
        },
        {
            infoBits: 0x0d847,
            versionNumber: 13,
            alignmentPatternCenters: [6, 34, 62],
            errorCorrectionLevels: [
                {
                    ecCodewordsPerBlock: 26,
                    ecBlocks: [{ numBlocks: 4, dataCodewordsPerBlock: 107 }]
                },
                {
                    ecCodewordsPerBlock: 22,
                    ecBlocks: [{ numBlocks: 8, dataCodewordsPerBlock: 37 }, { numBlocks: 1, dataCodewordsPerBlock: 38 }]
                },
                {
                    ecCodewordsPerBlock: 24,
                    ecBlocks: [{ numBlocks: 8, dataCodewordsPerBlock: 20 }, { numBlocks: 4, dataCodewordsPerBlock: 21 }]
                },
                {
                    ecCodewordsPerBlock: 22,
                    ecBlocks: [{ numBlocks: 12, dataCodewordsPerBlock: 11 }, { numBlocks: 4, dataCodewordsPerBlock: 12 }]
                }
            ]
        },
        {
            infoBits: 0x0e60d,
            versionNumber: 14,
            alignmentPatternCenters: [6, 26, 46, 66],
            errorCorrectionLevels: [
                {
                    ecCodewordsPerBlock: 30,
                    ecBlocks: [{ numBlocks: 3, dataCodewordsPerBlock: 115 }, { numBlocks: 1, dataCodewordsPerBlock: 116 }]
                },
                {
                    ecCodewordsPerBlock: 24,
                    ecBlocks: [{ numBlocks: 4, dataCodewordsPerBlock: 40 }, { numBlocks: 5, dataCodewordsPerBlock: 41 }]
                },
                {
                    ecCodewordsPerBlock: 20,
                    ecBlocks: [{ numBlocks: 11, dataCodewordsPerBlock: 16 }, { numBlocks: 5, dataCodewordsPerBlock: 17 }]
                },
                {
                    ecCodewordsPerBlock: 24,
                    ecBlocks: [{ numBlocks: 11, dataCodewordsPerBlock: 12 }, { numBlocks: 5, dataCodewordsPerBlock: 13 }]
                }
            ]
        },
        {
            infoBits: 0x0f928,
            versionNumber: 15,
            alignmentPatternCenters: [6, 26, 48, 70],
            errorCorrectionLevels: [
                {
                    ecCodewordsPerBlock: 22,
                    ecBlocks: [{ numBlocks: 5, dataCodewordsPerBlock: 87 }, { numBlocks: 1, dataCodewordsPerBlock: 88 }]
                },
                {
                    ecCodewordsPerBlock: 24,
                    ecBlocks: [{ numBlocks: 5, dataCodewordsPerBlock: 41 }, { numBlocks: 5, dataCodewordsPerBlock: 42 }]
                },
                {
                    ecCodewordsPerBlock: 30,
                    ecBlocks: [{ numBlocks: 5, dataCodewordsPerBlock: 24 }, { numBlocks: 7, dataCodewordsPerBlock: 25 }]
                },
                {
                    ecCodewordsPerBlock: 24,
                    ecBlocks: [{ numBlocks: 11, dataCodewordsPerBlock: 12 }, { numBlocks: 7, dataCodewordsPerBlock: 13 }]
                }
            ]
        },
        {
            infoBits: 0x10b78,
            versionNumber: 16,
            alignmentPatternCenters: [6, 26, 50, 74],
            errorCorrectionLevels: [
                {
                    ecCodewordsPerBlock: 24,
                    ecBlocks: [{ numBlocks: 5, dataCodewordsPerBlock: 98 }, { numBlocks: 1, dataCodewordsPerBlock: 99 }]
                },
                {
                    ecCodewordsPerBlock: 28,
                    ecBlocks: [{ numBlocks: 7, dataCodewordsPerBlock: 45 }, { numBlocks: 3, dataCodewordsPerBlock: 46 }]
                },
                {
                    ecCodewordsPerBlock: 24,
                    ecBlocks: [{ numBlocks: 15, dataCodewordsPerBlock: 19 }, { numBlocks: 2, dataCodewordsPerBlock: 20 }]
                },
                {
                    ecCodewordsPerBlock: 30,
                    ecBlocks: [{ numBlocks: 3, dataCodewordsPerBlock: 15 }, { numBlocks: 13, dataCodewordsPerBlock: 16 }]
                }
            ]
        },
        {
            infoBits: 0x1145d,
            versionNumber: 17,
            alignmentPatternCenters: [6, 30, 54, 78],
            errorCorrectionLevels: [
                {
                    ecCodewordsPerBlock: 28,
                    ecBlocks: [{ numBlocks: 1, dataCodewordsPerBlock: 107 }, { numBlocks: 5, dataCodewordsPerBlock: 108 }]
                },
                {
                    ecCodewordsPerBlock: 28,
                    ecBlocks: [{ numBlocks: 10, dataCodewordsPerBlock: 46 }, { numBlocks: 1, dataCodewordsPerBlock: 47 }]
                },
                {
                    ecCodewordsPerBlock: 28,
                    ecBlocks: [{ numBlocks: 1, dataCodewordsPerBlock: 22 }, { numBlocks: 15, dataCodewordsPerBlock: 23 }]
                },
                {
                    ecCodewordsPerBlock: 28,
                    ecBlocks: [{ numBlocks: 2, dataCodewordsPerBlock: 14 }, { numBlocks: 17, dataCodewordsPerBlock: 15 }]
                }
            ]
        },
        {
            infoBits: 0x12a17,
            versionNumber: 18,
            alignmentPatternCenters: [6, 30, 56, 82],
            errorCorrectionLevels: [
                {
                    ecCodewordsPerBlock: 30,
                    ecBlocks: [{ numBlocks: 5, dataCodewordsPerBlock: 120 }, { numBlocks: 1, dataCodewordsPerBlock: 121 }]
                },
                {
                    ecCodewordsPerBlock: 26,
                    ecBlocks: [{ numBlocks: 9, dataCodewordsPerBlock: 43 }, { numBlocks: 4, dataCodewordsPerBlock: 44 }]
                },
                {
                    ecCodewordsPerBlock: 28,
                    ecBlocks: [{ numBlocks: 17, dataCodewordsPerBlock: 22 }, { numBlocks: 1, dataCodewordsPerBlock: 23 }]
                },
                {
                    ecCodewordsPerBlock: 28,
                    ecBlocks: [{ numBlocks: 2, dataCodewordsPerBlock: 14 }, { numBlocks: 19, dataCodewordsPerBlock: 15 }]
                }
            ]
        },
        {
            infoBits: 0x13532,
            versionNumber: 19,
            alignmentPatternCenters: [6, 30, 58, 86],
            errorCorrectionLevels: [
                {
                    ecCodewordsPerBlock: 28,
                    ecBlocks: [{ numBlocks: 3, dataCodewordsPerBlock: 113 }, { numBlocks: 4, dataCodewordsPerBlock: 114 }]
                },
                {
                    ecCodewordsPerBlock: 26,
                    ecBlocks: [{ numBlocks: 3, dataCodewordsPerBlock: 44 }, { numBlocks: 11, dataCodewordsPerBlock: 45 }]
                },
                {
                    ecCodewordsPerBlock: 26,
                    ecBlocks: [{ numBlocks: 17, dataCodewordsPerBlock: 21 }, { numBlocks: 4, dataCodewordsPerBlock: 22 }]
                },
                {
                    ecCodewordsPerBlock: 26,
                    ecBlocks: [{ numBlocks: 9, dataCodewordsPerBlock: 13 }, { numBlocks: 16, dataCodewordsPerBlock: 14 }]
                }
            ]
        },
        {
            infoBits: 0x149a6,
            versionNumber: 20,
            alignmentPatternCenters: [6, 34, 62, 90],
            errorCorrectionLevels: [
                {
                    ecCodewordsPerBlock: 28,
                    ecBlocks: [{ numBlocks: 3, dataCodewordsPerBlock: 107 }, { numBlocks: 5, dataCodewordsPerBlock: 108 }]
                },
                {
                    ecCodewordsPerBlock: 26,
                    ecBlocks: [{ numBlocks: 3, dataCodewordsPerBlock: 41 }, { numBlocks: 13, dataCodewordsPerBlock: 42 }]
                },
                {
                    ecCodewordsPerBlock: 30,
                    ecBlocks: [{ numBlocks: 15, dataCodewordsPerBlock: 24 }, { numBlocks: 5, dataCodewordsPerBlock: 25 }]
                },
                {
                    ecCodewordsPerBlock: 28,
                    ecBlocks: [{ numBlocks: 15, dataCodewordsPerBlock: 15 }, { numBlocks: 10, dataCodewordsPerBlock: 16 }]
                }
            ]
        },
        {
            infoBits: 0x15683,
            versionNumber: 21,
            alignmentPatternCenters: [6, 28, 50, 72, 94],
            errorCorrectionLevels: [
                {
                    ecCodewordsPerBlock: 28,
                    ecBlocks: [{ numBlocks: 4, dataCodewordsPerBlock: 116 }, { numBlocks: 4, dataCodewordsPerBlock: 117 }]
                },
                {
                    ecCodewordsPerBlock: 26,
                    ecBlocks: [{ numBlocks: 17, dataCodewordsPerBlock: 42 }]
                },
                {
                    ecCodewordsPerBlock: 28,
                    ecBlocks: [{ numBlocks: 17, dataCodewordsPerBlock: 22 }, { numBlocks: 6, dataCodewordsPerBlock: 23 }]
                },
                {
                    ecCodewordsPerBlock: 30,
                    ecBlocks: [{ numBlocks: 19, dataCodewordsPerBlock: 16 }, { numBlocks: 6, dataCodewordsPerBlock: 17 }]
                }
            ]
        },
        {
            infoBits: 0x168c9,
            versionNumber: 22,
            alignmentPatternCenters: [6, 26, 50, 74, 98],
            errorCorrectionLevels: [
                {
                    ecCodewordsPerBlock: 28,
                    ecBlocks: [{ numBlocks: 2, dataCodewordsPerBlock: 111 }, { numBlocks: 7, dataCodewordsPerBlock: 112 }]
                },
                {
                    ecCodewordsPerBlock: 28,
                    ecBlocks: [{ numBlocks: 17, dataCodewordsPerBlock: 46 }]
                },
                {
                    ecCodewordsPerBlock: 30,
                    ecBlocks: [{ numBlocks: 7, dataCodewordsPerBlock: 24 }, { numBlocks: 16, dataCodewordsPerBlock: 25 }]
                },
                {
                    ecCodewordsPerBlock: 24,
                    ecBlocks: [{ numBlocks: 34, dataCodewordsPerBlock: 13 }]
                }
            ]
        },
        {
            infoBits: 0x177ec,
            versionNumber: 23,
            alignmentPatternCenters: [6, 30, 54, 74, 102],
            errorCorrectionLevels: [
                {
                    ecCodewordsPerBlock: 30,
                    ecBlocks: [{ numBlocks: 4, dataCodewordsPerBlock: 121 }, { numBlocks: 5, dataCodewordsPerBlock: 122 }]
                },
                {
                    ecCodewordsPerBlock: 28,
                    ecBlocks: [{ numBlocks: 4, dataCodewordsPerBlock: 47 }, { numBlocks: 14, dataCodewordsPerBlock: 48 }]
                },
                {
                    ecCodewordsPerBlock: 30,
                    ecBlocks: [{ numBlocks: 11, dataCodewordsPerBlock: 24 }, { numBlocks: 14, dataCodewordsPerBlock: 25 }]
                },
                {
                    ecCodewordsPerBlock: 30,
                    ecBlocks: [{ numBlocks: 16, dataCodewordsPerBlock: 15 }, { numBlocks: 14, dataCodewordsPerBlock: 16 }]
                }
            ]
        },
        {
            infoBits: 0x18ec4,
            versionNumber: 24,
            alignmentPatternCenters: [6, 28, 54, 80, 106],
            errorCorrectionLevels: [
                {
                    ecCodewordsPerBlock: 30,
                    ecBlocks: [{ numBlocks: 6, dataCodewordsPerBlock: 117 }, { numBlocks: 4, dataCodewordsPerBlock: 118 }]
                },
                {
                    ecCodewordsPerBlock: 28,
                    ecBlocks: [{ numBlocks: 6, dataCodewordsPerBlock: 45 }, { numBlocks: 14, dataCodewordsPerBlock: 46 }]
                },
                {
                    ecCodewordsPerBlock: 30,
                    ecBlocks: [{ numBlocks: 11, dataCodewordsPerBlock: 24 }, { numBlocks: 16, dataCodewordsPerBlock: 25 }]
                },
                {
                    ecCodewordsPerBlock: 30,
                    ecBlocks: [{ numBlocks: 30, dataCodewordsPerBlock: 16 }, { numBlocks: 2, dataCodewordsPerBlock: 17 }]
                }
            ]
        },
        {
            infoBits: 0x191e1,
            versionNumber: 25,
            alignmentPatternCenters: [6, 32, 58, 84, 110],
            errorCorrectionLevels: [
                {
                    ecCodewordsPerBlock: 26,
                    ecBlocks: [{ numBlocks: 8, dataCodewordsPerBlock: 106 }, { numBlocks: 4, dataCodewordsPerBlock: 107 }]
                },
                {
                    ecCodewordsPerBlock: 28,
                    ecBlocks: [{ numBlocks: 8, dataCodewordsPerBlock: 47 }, { numBlocks: 13, dataCodewordsPerBlock: 48 }]
                },
                {
                    ecCodewordsPerBlock: 30,
                    ecBlocks: [{ numBlocks: 7, dataCodewordsPerBlock: 24 }, { numBlocks: 22, dataCodewordsPerBlock: 25 }]
                },
                {
                    ecCodewordsPerBlock: 30,
                    ecBlocks: [{ numBlocks: 22, dataCodewordsPerBlock: 15 }, { numBlocks: 13, dataCodewordsPerBlock: 16 }]
                }
            ]
        },
        {
            infoBits: 0x1afab,
            versionNumber: 26,
            alignmentPatternCenters: [6, 30, 58, 86, 114],
            errorCorrectionLevels: [
                {
                    ecCodewordsPerBlock: 28,
                    ecBlocks: [{ numBlocks: 10, dataCodewordsPerBlock: 114 }, { numBlocks: 2, dataCodewordsPerBlock: 115 }]
                },
                {
                    ecCodewordsPerBlock: 28,
                    ecBlocks: [{ numBlocks: 19, dataCodewordsPerBlock: 46 }, { numBlocks: 4, dataCodewordsPerBlock: 47 }]
                },
                {
                    ecCodewordsPerBlock: 28,
                    ecBlocks: [{ numBlocks: 28, dataCodewordsPerBlock: 22 }, { numBlocks: 6, dataCodewordsPerBlock: 23 }]
                },
                {
                    ecCodewordsPerBlock: 30,
                    ecBlocks: [{ numBlocks: 33, dataCodewordsPerBlock: 16 }, { numBlocks: 4, dataCodewordsPerBlock: 17 }]
                }
            ]
        },
        {
            infoBits: 0x1b08e,
            versionNumber: 27,
            alignmentPatternCenters: [6, 34, 62, 90, 118],
            errorCorrectionLevels: [
                {
                    ecCodewordsPerBlock: 30,
                    ecBlocks: [{ numBlocks: 8, dataCodewordsPerBlock: 122 }, { numBlocks: 4, dataCodewordsPerBlock: 123 }]
                },
                {
                    ecCodewordsPerBlock: 28,
                    ecBlocks: [{ numBlocks: 22, dataCodewordsPerBlock: 45 }, { numBlocks: 3, dataCodewordsPerBlock: 46 }]
                },
                {
                    ecCodewordsPerBlock: 30,
                    ecBlocks: [{ numBlocks: 8, dataCodewordsPerBlock: 23 }, { numBlocks: 26, dataCodewordsPerBlock: 24 }]
                },
                {
                    ecCodewordsPerBlock: 30,
                    ecBlocks: [{ numBlocks: 12, dataCodewordsPerBlock: 15 }, { numBlocks: 28, dataCodewordsPerBlock: 16 }]
                }
            ]
        },
        {
            infoBits: 0x1cc1a,
            versionNumber: 28,
            alignmentPatternCenters: [6, 26, 50, 74, 98, 122],
            errorCorrectionLevels: [
                {
                    ecCodewordsPerBlock: 30,
                    ecBlocks: [{ numBlocks: 3, dataCodewordsPerBlock: 117 }, { numBlocks: 10, dataCodewordsPerBlock: 118 }]
                },
                {
                    ecCodewordsPerBlock: 28,
                    ecBlocks: [{ numBlocks: 3, dataCodewordsPerBlock: 45 }, { numBlocks: 23, dataCodewordsPerBlock: 46 }]
                },
                {
                    ecCodewordsPerBlock: 30,
                    ecBlocks: [{ numBlocks: 4, dataCodewordsPerBlock: 24 }, { numBlocks: 31, dataCodewordsPerBlock: 25 }]
                },
                {
                    ecCodewordsPerBlock: 30,
                    ecBlocks: [{ numBlocks: 11, dataCodewordsPerBlock: 15 }, { numBlocks: 31, dataCodewordsPerBlock: 16 }]
                }
            ]
        },
        {
            infoBits: 0x1d33f,
            versionNumber: 29,
            alignmentPatternCenters: [6, 30, 54, 78, 102, 126],
            errorCorrectionLevels: [
                {
                    ecCodewordsPerBlock: 30,
                    ecBlocks: [{ numBlocks: 7, dataCodewordsPerBlock: 116 }, { numBlocks: 7, dataCodewordsPerBlock: 117 }]
                },
                {
                    ecCodewordsPerBlock: 28,
                    ecBlocks: [{ numBlocks: 21, dataCodewordsPerBlock: 45 }, { numBlocks: 7, dataCodewordsPerBlock: 46 }]
                },
                {
                    ecCodewordsPerBlock: 30,
                    ecBlocks: [{ numBlocks: 1, dataCodewordsPerBlock: 23 }, { numBlocks: 37, dataCodewordsPerBlock: 24 }]
                },
                {
                    ecCodewordsPerBlock: 30,
                    ecBlocks: [{ numBlocks: 19, dataCodewordsPerBlock: 15 }, { numBlocks: 26, dataCodewordsPerBlock: 16 }]
                }
            ]
        },
        {
            infoBits: 0x1ed75,
            versionNumber: 30,
            alignmentPatternCenters: [6, 26, 52, 78, 104, 130],
            errorCorrectionLevels: [
                {
                    ecCodewordsPerBlock: 30,
                    ecBlocks: [{ numBlocks: 5, dataCodewordsPerBlock: 115 }, { numBlocks: 10, dataCodewordsPerBlock: 116 }]
                },
                {
                    ecCodewordsPerBlock: 28,
                    ecBlocks: [{ numBlocks: 19, dataCodewordsPerBlock: 47 }, { numBlocks: 10, dataCodewordsPerBlock: 48 }]
                },
                {
                    ecCodewordsPerBlock: 30,
                    ecBlocks: [{ numBlocks: 15, dataCodewordsPerBlock: 24 }, { numBlocks: 25, dataCodewordsPerBlock: 25 }]
                },
                {
                    ecCodewordsPerBlock: 30,
                    ecBlocks: [{ numBlocks: 23, dataCodewordsPerBlock: 15 }, { numBlocks: 25, dataCodewordsPerBlock: 16 }]
                }
            ]
        },
        {
            infoBits: 0x1f250,
            versionNumber: 31,
            alignmentPatternCenters: [6, 30, 56, 82, 108, 134],
            errorCorrectionLevels: [
                {
                    ecCodewordsPerBlock: 30,
                    ecBlocks: [{ numBlocks: 13, dataCodewordsPerBlock: 115 }, { numBlocks: 3, dataCodewordsPerBlock: 116 }]
                },
                {
                    ecCodewordsPerBlock: 28,
                    ecBlocks: [{ numBlocks: 2, dataCodewordsPerBlock: 46 }, { numBlocks: 29, dataCodewordsPerBlock: 47 }]
                },
                {
                    ecCodewordsPerBlock: 30,
                    ecBlocks: [{ numBlocks: 42, dataCodewordsPerBlock: 24 }, { numBlocks: 1, dataCodewordsPerBlock: 25 }]
                },
                {
                    ecCodewordsPerBlock: 30,
                    ecBlocks: [{ numBlocks: 23, dataCodewordsPerBlock: 15 }, { numBlocks: 28, dataCodewordsPerBlock: 16 }]
                }
            ]
        },
        {
            infoBits: 0x209d5,
            versionNumber: 32,
            alignmentPatternCenters: [6, 34, 60, 86, 112, 138],
            errorCorrectionLevels: [
                {
                    ecCodewordsPerBlock: 30,
                    ecBlocks: [{ numBlocks: 17, dataCodewordsPerBlock: 115 }]
                },
                {
                    ecCodewordsPerBlock: 28,
                    ecBlocks: [{ numBlocks: 10, dataCodewordsPerBlock: 46 }, { numBlocks: 23, dataCodewordsPerBlock: 47 }]
                },
                {
                    ecCodewordsPerBlock: 30,
                    ecBlocks: [{ numBlocks: 10, dataCodewordsPerBlock: 24 }, { numBlocks: 35, dataCodewordsPerBlock: 25 }]
                },
                {
                    ecCodewordsPerBlock: 30,
                    ecBlocks: [{ numBlocks: 19, dataCodewordsPerBlock: 15 }, { numBlocks: 35, dataCodewordsPerBlock: 16 }]
                }
            ]
        },
        {
            infoBits: 0x216f0,
            versionNumber: 33,
            alignmentPatternCenters: [6, 30, 58, 86, 114, 142],
            errorCorrectionLevels: [
                {
                    ecCodewordsPerBlock: 30,
                    ecBlocks: [{ numBlocks: 17, dataCodewordsPerBlock: 115 }, { numBlocks: 1, dataCodewordsPerBlock: 116 }]
                },
                {
                    ecCodewordsPerBlock: 28,
                    ecBlocks: [{ numBlocks: 14, dataCodewordsPerBlock: 46 }, { numBlocks: 21, dataCodewordsPerBlock: 47 }]
                },
                {
                    ecCodewordsPerBlock: 30,
                    ecBlocks: [{ numBlocks: 29, dataCodewordsPerBlock: 24 }, { numBlocks: 19, dataCodewordsPerBlock: 25 }]
                },
                {
                    ecCodewordsPerBlock: 30,
                    ecBlocks: [{ numBlocks: 11, dataCodewordsPerBlock: 15 }, { numBlocks: 46, dataCodewordsPerBlock: 16 }]
                }
            ]
        },
        {
            infoBits: 0x228ba,
            versionNumber: 34,
            alignmentPatternCenters: [6, 34, 62, 90, 118, 146],
            errorCorrectionLevels: [
                {
                    ecCodewordsPerBlock: 30,
                    ecBlocks: [{ numBlocks: 13, dataCodewordsPerBlock: 115 }, { numBlocks: 6, dataCodewordsPerBlock: 116 }]
                },
                {
                    ecCodewordsPerBlock: 28,
                    ecBlocks: [{ numBlocks: 14, dataCodewordsPerBlock: 46 }, { numBlocks: 23, dataCodewordsPerBlock: 47 }]
                },
                {
                    ecCodewordsPerBlock: 30,
                    ecBlocks: [{ numBlocks: 44, dataCodewordsPerBlock: 24 }, { numBlocks: 7, dataCodewordsPerBlock: 25 }]
                },
                {
                    ecCodewordsPerBlock: 30,
                    ecBlocks: [{ numBlocks: 59, dataCodewordsPerBlock: 16 }, { numBlocks: 1, dataCodewordsPerBlock: 17 }]
                }
            ]
        },
        {
            infoBits: 0x2379f,
            versionNumber: 35,
            alignmentPatternCenters: [6, 30, 54, 78, 102, 126, 150],
            errorCorrectionLevels: [
                {
                    ecCodewordsPerBlock: 30,
                    ecBlocks: [{ numBlocks: 12, dataCodewordsPerBlock: 121 }, { numBlocks: 7, dataCodewordsPerBlock: 122 }]
                },
                {
                    ecCodewordsPerBlock: 28,
                    ecBlocks: [{ numBlocks: 12, dataCodewordsPerBlock: 47 }, { numBlocks: 26, dataCodewordsPerBlock: 48 }]
                },
                {
                    ecCodewordsPerBlock: 30,
                    ecBlocks: [{ numBlocks: 39, dataCodewordsPerBlock: 24 }, { numBlocks: 14, dataCodewordsPerBlock: 25 }]
                },
                {
                    ecCodewordsPerBlock: 30,
                    ecBlocks: [{ numBlocks: 22, dataCodewordsPerBlock: 15 }, { numBlocks: 41, dataCodewordsPerBlock: 16 }]
                }
            ]
        },
        {
            infoBits: 0x24b0b,
            versionNumber: 36,
            alignmentPatternCenters: [6, 24, 50, 76, 102, 128, 154],
            errorCorrectionLevels: [
                {
                    ecCodewordsPerBlock: 30,
                    ecBlocks: [{ numBlocks: 6, dataCodewordsPerBlock: 121 }, { numBlocks: 14, dataCodewordsPerBlock: 122 }]
                },
                {
                    ecCodewordsPerBlock: 28,
                    ecBlocks: [{ numBlocks: 6, dataCodewordsPerBlock: 47 }, { numBlocks: 34, dataCodewordsPerBlock: 48 }]
                },
                {
                    ecCodewordsPerBlock: 30,
                    ecBlocks: [{ numBlocks: 46, dataCodewordsPerBlock: 24 }, { numBlocks: 10, dataCodewordsPerBlock: 25 }]
                },
                {
                    ecCodewordsPerBlock: 30,
                    ecBlocks: [{ numBlocks: 2, dataCodewordsPerBlock: 15 }, { numBlocks: 64, dataCodewordsPerBlock: 16 }]
                }
            ]
        },
        {
            infoBits: 0x2542e,
            versionNumber: 37,
            alignmentPatternCenters: [6, 28, 54, 80, 106, 132, 158],
            errorCorrectionLevels: [
                {
                    ecCodewordsPerBlock: 30,
                    ecBlocks: [{ numBlocks: 17, dataCodewordsPerBlock: 122 }, { numBlocks: 4, dataCodewordsPerBlock: 123 }]
                },
                {
                    ecCodewordsPerBlock: 28,
                    ecBlocks: [{ numBlocks: 29, dataCodewordsPerBlock: 46 }, { numBlocks: 14, dataCodewordsPerBlock: 47 }]
                },
                {
                    ecCodewordsPerBlock: 30,
                    ecBlocks: [{ numBlocks: 49, dataCodewordsPerBlock: 24 }, { numBlocks: 10, dataCodewordsPerBlock: 25 }]
                },
                {
                    ecCodewordsPerBlock: 30,
                    ecBlocks: [{ numBlocks: 24, dataCodewordsPerBlock: 15 }, { numBlocks: 46, dataCodewordsPerBlock: 16 }]
                }
            ]
        },
        {
            infoBits: 0x26a64,
            versionNumber: 38,
            alignmentPatternCenters: [6, 32, 58, 84, 110, 136, 162],
            errorCorrectionLevels: [
                {
                    ecCodewordsPerBlock: 30,
                    ecBlocks: [{ numBlocks: 4, dataCodewordsPerBlock: 122 }, { numBlocks: 18, dataCodewordsPerBlock: 123 }]
                },
                {
                    ecCodewordsPerBlock: 28,
                    ecBlocks: [{ numBlocks: 13, dataCodewordsPerBlock: 46 }, { numBlocks: 32, dataCodewordsPerBlock: 47 }]
                },
                {
                    ecCodewordsPerBlock: 30,
                    ecBlocks: [{ numBlocks: 48, dataCodewordsPerBlock: 24 }, { numBlocks: 14, dataCodewordsPerBlock: 25 }]
                },
                {
                    ecCodewordsPerBlock: 30,
                    ecBlocks: [{ numBlocks: 42, dataCodewordsPerBlock: 15 }, { numBlocks: 32, dataCodewordsPerBlock: 16 }]
                }
            ]
        },
        {
            infoBits: 0x27541,
            versionNumber: 39,
            alignmentPatternCenters: [6, 26, 54, 82, 110, 138, 166],
            errorCorrectionLevels: [
                {
                    ecCodewordsPerBlock: 30,
                    ecBlocks: [{ numBlocks: 20, dataCodewordsPerBlock: 117 }, { numBlocks: 4, dataCodewordsPerBlock: 118 }]
                },
                {
                    ecCodewordsPerBlock: 28,
                    ecBlocks: [{ numBlocks: 40, dataCodewordsPerBlock: 47 }, { numBlocks: 7, dataCodewordsPerBlock: 48 }]
                },
                {
                    ecCodewordsPerBlock: 30,
                    ecBlocks: [{ numBlocks: 43, dataCodewordsPerBlock: 24 }, { numBlocks: 22, dataCodewordsPerBlock: 25 }]
                },
                {
                    ecCodewordsPerBlock: 30,
                    ecBlocks: [{ numBlocks: 10, dataCodewordsPerBlock: 15 }, { numBlocks: 67, dataCodewordsPerBlock: 16 }]
                }
            ]
        },
        {
            infoBits: 0x28c69,
            versionNumber: 40,
            alignmentPatternCenters: [6, 30, 58, 86, 114, 142, 170],
            errorCorrectionLevels: [
                {
                    ecCodewordsPerBlock: 30,
                    ecBlocks: [{ numBlocks: 19, dataCodewordsPerBlock: 118 }, { numBlocks: 6, dataCodewordsPerBlock: 119 }]
                },
                {
                    ecCodewordsPerBlock: 28,
                    ecBlocks: [{ numBlocks: 18, dataCodewordsPerBlock: 47 }, { numBlocks: 31, dataCodewordsPerBlock: 48 }]
                },
                {
                    ecCodewordsPerBlock: 30,
                    ecBlocks: [{ numBlocks: 34, dataCodewordsPerBlock: 24 }, { numBlocks: 34, dataCodewordsPerBlock: 25 }]
                },
                {
                    ecCodewordsPerBlock: 30,
                    ecBlocks: [{ numBlocks: 20, dataCodewordsPerBlock: 15 }, { numBlocks: 61, dataCodewordsPerBlock: 16 }]
                }
            ]
        }
    ];

    /**
     * @module BitStream
     * @author nuintun
     * @author Cosmo Wolfe
     */
    var BitStream = /** @class */ (function () {
        function BitStream(bytes) {
            this.byteOffset = 0;
            this.bitOffset = 0;
            this.bytes = bytes;
        }
        BitStream.prototype.readBits = function (numBits) {
            if (numBits < 1 || numBits > 32 || numBits > this.available()) {
                throw "can't read " + numBits + " bits";
            }
            var result = 0;
            // First, read remainder from current byte
            if (this.bitOffset > 0) {
                var bitsLeft = 8 - this.bitOffset;
                var toRead = numBits < bitsLeft ? numBits : bitsLeft;
                var bitsToNotRead = bitsLeft - toRead;
                var mask = (0xff >> (8 - toRead)) << bitsToNotRead;
                result = (this.bytes[this.byteOffset] & mask) >> bitsToNotRead;
                numBits -= toRead;
                this.bitOffset += toRead;
                if (this.bitOffset === 8) {
                    this.bitOffset = 0;
                    this.byteOffset++;
                }
            }
            // Next read whole bytes
            if (numBits > 0) {
                while (numBits >= 8) {
                    result = (result << 8) | (this.bytes[this.byteOffset] & 0xff);
                    this.byteOffset++;
                    numBits -= 8;
                }
                // Finally read a partial byte
                if (numBits > 0) {
                    var bitsToNotRead = 8 - numBits;
                    var mask = (0xff >> bitsToNotRead) << bitsToNotRead;
                    result = (result << numBits) | ((this.bytes[this.byteOffset] & mask) >> bitsToNotRead);
                    this.bitOffset += numBits;
                }
            }
            return result;
        };
        BitStream.prototype.available = function () {
            return 8 * (this.bytes.length - this.byteOffset) - this.bitOffset;
        };
        return BitStream;
    }());

    /**
     * @module SJIS
     * @author nuintun
     * @author Kazuhiko Arase
     */
    var _a;
    function toBytes(str) {
        var bytes = [];
        var length = str.length;
        for (var i = 0; i < length; i++) {
            bytes.push(str.charCodeAt(i));
        }
        return bytes;
    }
    function readByte(input) {
        var byte = input.readByte();
        if (byte === -1)
            throw 'unexpected end of stream';
        return byte;
    }
    /**
     * @function createSJISTable
     * @param unicodeData base64 string of byte array. [16bit Unicode],[16bit Bytes], ...
     * @param numChars number of char
     */
    function createSJISTable(unicodeData, numChars) {
        var SJIS2UTFTable = {};
        var UTF2SJISTable = {};
        var input = new Base64DecodeInputStream(new ByteArrayInputStream(toBytes(unicodeData)));
        var count = 0;
        while (true) {
            var b0 = input.readByte();
            if (b0 === -1)
                break;
            var b1 = readByte(input);
            var b2 = readByte(input);
            var b3 = readByte(input);
            var k = (b0 << 8) | b1;
            var v = (b2 << 8) | b3;
            SJIS2UTFTable[k] = v;
            UTF2SJISTable[v] = k;
            count++;
        }
        if (count !== numChars) {
            throw "expect " + numChars + " unicode map, but got " + count;
        }
        return { SJIS2UTFTable: SJIS2UTFTable, UTF2SJISTable: UTF2SJISTable };
    }
    var UNICODE_DATA = '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MIWC4zCGguQwh4LlMIiC5jCJgucwioLoMIuC6TCMguowjYLrMI6C7DCPgu0wkILuMJGC7zCSgvAwk4LxMJuBSjCcgUswnYFUMJ6BVTChg0AwooNBMKODQjCkg0MwpYNEMKaDRTCng0YwqINHMKmDSDCqg0kwq4NKMKyDSzCtg0wwroNNMK+DTjCwg08wsYNQMLKDUTCzg1IwtINTMLWDVDC2g1Uwt4NWMLiDVzC5g1gwuoNZMLuDWjC8g1swvYNcML6DXTC/g14wwINfMMGDYDDCg2Eww4NiMMSDYzDFg2QwxoNlMMeDZjDIg2cwyYNoMMqDaTDLg2owzINrMM2DbDDOg20wz4NuMNCDbzDRg3Aw0oNxMNODcjDUg3Mw1YN0MNaDdTDXg3Yw2IN3MNmDeDDag3kw24N6MNyDezDdg3ww3oN9MN+DfjDgg4Aw4YOBMOKDgjDjg4Mw5IOEMOWDhTDmg4Yw54OHMOiDiDDpg4kw6oOKMOuDizDsg4ww7YONMO6DjjDvg48w8IOQMPGDkTDyg5Iw84OTMPSDlDD1g5Uw9oOWMPuBRTD8gVsw/YFSMP6BU04AiOpOAZKaTgOOtU4HlpxOCI/kTgmOT04Kj+NOC4m6Tg2Vc04Ol15OEJigThGJTk4Uio5OFZihThaQok4XmcBOGIt1ThmVuE4ej+VOIZe8TiaVwE4qmKJOLZKGTjGYo04yi/hONpikTjiK2045kk9OO47lTjyYpU4/mKZOQpinTkOUVE5Fi3ZOS5RWTk2T4U5OjMFOT5ZSTlXlaE5WmKhOV4/mTliYqU5ZibNOXYvjTl6M7k5fludOYpukTnGXkE5zk/tOfoqjToCLVE6CmKpOhZirToaXuU6Il1xOiZGIToqYrU6LjpZOjJPxTo6YsE6RiV1OkozdTpSM3E6ViOROmJhqTpmYaU6bjbFOnIifTp6YsU6fmLJOoJizTqGWU06imLROpIzwTqWI5U6mlpJOqIucTquLnU6si55OrZLgTq6Xuk6wmLVOs5i2TraYt066kGxOwI9ZTsGQbU7CmLxOxJi6TsaYu07Hi3dOyo2hTsuJ7k7NmLlOzpi4Ts+Vp07UjmVO1Y5kTtaRvE7XmL1O2JV0TtmQ5U7dgVdO3pi+Tt+YwE7jkeNO5JffTuWIyE7tmL9O7om8TvCLwk7ykodO9oyPTveYwU77lENPAYrpTwmYwk8KiMlPDYzeTw6K6k8PlZpPEJSwTxGLeE8aie9PHJjlTx2TYE8vlIxPMJjETzSUuk82l+BPOJBMTzqOZk88jpdPPYm+T0OSz09GkkFPR5jIT02Iyk9OkuFPT49aT1CNsk9Rl0NPU5HMT1WJvU9XmMdPWZddT1qYw09bmMVPXI3sT12Yxk9em0NPaZjOT2+Y0U9wmM9Pc4nAT3WVuU92mMlPe5jNT3yM8U9/jmdPg4qkT4aY0k+ImMpPi5fhT42OmE+PmMtPkZjQT5aY00+YmMxPm4ufT52Iy0+gi6BPoYm/T6ubRE+tlplPrpWOT6+M8k+1kE5Ptpe1T7+V1k/CjFdPw5GjT8SJ4k/Kj3JPzpjXT9CY3E/RmNpP1JjVT9eRrU/YmNhP2pjbT9uY2U/dldtP35jWT+GQTU/jlpNP5JjdT+WY3k/uj0NP75jrT/OUb0/1lVVP9pjmT/iV7k/6ibRP/pjqUAWY5FAGmO1QCZFxUAuMwlANlHtQD+DFUBGY7FASk3xQFJjhUBaM9FAZjPNQGpjfUB+O2FAhmOdQI5XtUCSSbFAlmONQJoyRUCiY4FApmOhQKpjiUCuXz1AsmOlQLZhgUDaL5FA5jJBQQ5juUEeY71BImPNQSYjMUE+VzlBQmPJQVZjxUFaY9VBamPRQXJLiUGWMklBsmPZQco7DUHSRpFB1kuNQdov0UHiY91B9i1VQgJj4UIWY+lCNllRQkYyGUJiOUFCZlPVQmpj5UKyNw1Ctl2JQspj8ULOZQlC0mPtQtY3CULePnVC+jFhQwplDUMWLzVDJmUBQyplBUM2TrVDPkZxQ0YuhUNWWbFDWmURQ2pe7UN6ZRVDjmUhQ5ZlGUOeRbVDtmUdQ7plJUPWZS1D5mUpQ+5XGUQCLVlEBmU1RAplOUQSJrVEJmUxREo7yURSZUVEVmVBRFplPURiY1FEamVJRH4+eUSGZU1Eql0RRMpbXUTeZVVE6mVRRO5lXUTyZVlE/mVhRQJlZUUGI8lFDjLNRRIxaUUWPW1FGkptRR4uiUUiQ5lFJjPVRS42OUUyZW1FNlsZRTpNlUVCOmVFSmVpRVJlcUVqTfVFcipVRYpldUWWT/FFokVNRaZlfUWqZYFFrlKpRbIz2UW2YWlFumWFRcYukUXWVulF2kbRRd4vvUXiTVFF8jJNRgJliUYKZY1GFk+BRhol+UYmZZlGKjftRjJllUY2NxFGPmWdRkOPsUZGZaFGSlmBRk5lpUZWZalGWmWtRl4/nUZmOylGgiqVRopluUaSZbFGllrtRppltUaiVeVGpmW9RqplwUauZcVGsk35RsJl1UbGZc1GymXRRs5lyUbSN4VG1mXZRtpboUbeX4lG9mXdRxJCmUcWZeFHGj3lRyZl5UcuSnFHMl71RzZOAUdaZw1HbmXpR3OqjUd2Lw1HgmXtR4ZZ9UeaPiFHnkfpR6Zl9UeqT4lHtmX5R8JmAUfGKTVH1mYFR9oulUfiTylH5iZpR+o9vUf2Un1H+mYJSAJOBUgOQblIEmYNSBpWqUgeQ2FIIiqBSCoqnUguZhFIOmYZSEYxZUhSZhVIXl/FSHY+JUiSUu1IllcpSJ5mHUimXmFIqmYhSLpmJUjCTnlIzmYpSNpCnUjeN/FI4jJRSOZmLUjqOaFI7jY9SQ5LkUkSZjVJHkaVSSo3tUkuZjlJMmY9STZFPUk+ZjFJUmZFSVpZVUluNhFJemZBSY4yVUmSN3FJllI1SaZmUUmqZklJvlZtScI/oUnGZm1JyioRSc5mVUnSZk1J1kW5SfZmXUn+ZllKDimNSh4yAUoiZnFKJl6tSjZmYUpGZnVKSmZpSlJmZUpuXzVKfjPdSoInBUqOX8lKpj5VSqpN3UquNhVKsmaBSrZmhUrGX41K0mEpStZmjUrmM+FK8maJSvopOUsGZpFLDlnVSxZK6UseXRVLJlddSzZmlUtLo01LVk65S15mmUtiKqFLZlrFS3Y+fUt6Zp1LfleVS4JmrUuKQqFLjmahS5IvOUuaZqVLniqlS8oxNUvOZrFL1ma1S+JmuUvmZr1L6jtlS/oz5Uv+W3FMBluZTApP1UwWV71MGmbBTCJmxUw2Zs1MPmbVTEJm0UxWZtlMWibtTF5ZrUxmN+lMambdTHZF4UyCPoFMhi6dTI5m4UyqU2VMvmblTMZm6UzOZu1M4mbxTOZVDUzqL5lM7iONTP5O9U0CZvVNBj1xTQ5DnU0WZv1NGmb5TR4+hU0iM31NJmcFTSpS8U02ZwlNRlNpTUpGyU1OR7FNUi6ZTV5PsU1iSUFNalI5TXJZtU16ZxFNgkOhTZoxUU2mZxVNumcZTb4lLU3CI81NxiutTc5GmU3SLcFN1l5FTd5nJU3iJtVN7mchTf4uoU4KZylOElu9TlpnLU5iX0FOajPpTn4y0U6CZzFOlmc5TppnNU6iQflOpiVhTrYl9U66Zz1OwmdBTs4y1U7aZ0VO7i45Two5RU8OZ0lPIlpRTyY2zU8qLeVPLl0ZTzJFvU82UvVPOjvtT1I9mU9aO5lPXjvNT2Y+WU9uUvlPfmdVT4YliU+KRcFPjjPtT5IzDU+WL5VPomdlT6ZJAU+qR/FPri6lT7I+iU+2Z2lPumdhT74nCU/CR5FPxjrZT8o5qU/OJRVP2ipBT942GU/iOaVP6mdtUAZncVAOLaFQEimVUCI2HVAmLZ1QKkt1UC4lEVAyTr1QNlrxUDo1AVA+XmVQQk2ZUEYz8VBuMTlQdmeVUH4vhVCCWaVQmlNtUKZnkVCuK3FQsmd9ULZngVC6Z4lQ2meNUOIt6VDmQgVQ7latUPJnhVD2Z3VQ+jOFUQJneVEKYQ1RGlfBUSJLmVEmM4FRKjZBUTpnmVFGT21RfmepUaI78VGqO9FRwme1UcZnrVHOWoVR1mehUdpnxVHeZ7FR7me9UfIzEVH2WvVSAmfBUhJnyVIaZ9FSLje5UjJhhVI6Z6VSPmedUkJnzVJKZ7lSimfZUpJpCVKWZ+FSomfxUq5pAVKyZ+VSvml1Uso3nVLOKUFS4mfdUvJpEVL2I9FS+mkNUwIijVMGVaVTCmkFUxJn6VMeZ9VTImftUyY3GVNiaRVThiPVU4ppOVOWaRlTmmkdU6I+jVOmWiVTtmkxU7ppLVPKTTlT6mk1U/ZpKVQSJU1UGjbRVB5BPVQ+aSFUQk4JVFJpJVRaIoFUumlNVL5dCVTGPpVUzmllVOJpYVTmaT1U+kcFVQJpQVUSR7VVFmlVVRo+kVUyaUlVPluJVU4xbVVaaVlVXmldVXJpUVV2aWlVjmlFVe5pgVXyaZVV+mmFVgJpcVYOaZlWEkVBVh5poVYmNQVWKml5Vi5KdVZiaYlWZmltVmoqrVZyK7FWdioVVnppjVZ+aX1WnjJZVqJppVamaZ1WqkXJVq4tpVayLqlWummRVsIvyVbaJY1XEmm1VxZprVceapVXUmnBV2ppqVdyablXfmmxV445rVeSab1X3mnJV+Zp3Vf2adVX+mnRWBpJRVgmJw1YUmnFWFppzVhePplYYiVJWG5p2VimJ3FYvmoJWMY/6VjKafVY0mntWNpp8VjiaflZCiVxWTJFYVk6aeFZQmnlWW4qaVmSagVZoiu1WapqEVmuagFZsmoNWdJWsVniT01Z6lLZWgJqGVoaahVaHimRWipqHVo+ailaUmolWoJqIVqKUWFalmotWrpqMVrSajla2mo1WvJqQVsCak1bBmpFWwpqPVsOaklbImpRWzpqVVtGallbTmpdW15qYVtiZZFbajvpW245sVt6J8VbgiPZW45JjVu6amVbwjaJW8ojNVvOQfVb5mppW+ozFVv2NkVb/mpxXAJqbVwOV3lcEmp1XCJqfVwmanlcLmqBXDZqhVw+Ml1cSiYBXE5qiVxaapFcYmqNXHJqmVx+TeVcmmqdXJ4izVyiN3VctjFxXMJJuVzeaqFc4mqlXO5qrV0CarFdCjeJXR4vPV0qWVldOmqpXT5qtV1CNv1dRjUJXYZqxV2SNo1dmklJXaZquV2qS2Fd/mrJXgpCCV4iasFeJmrNXi4xeV5OatFegmrVXoo1DV6OKX1ekmrdXqpq4V7CauVezmrZXwJqvV8OaulfGmrtXy5aEV86P6VfSmr1X05q+V9SavFfWmsBX3JRXV9+I5lfglXVX45rBV/SP+1f3jrdX+ZR8V/qK7lf8jelYAJZ4WAKTsFgFjJhYBpHNWAqav1gLmsJYFZHCWBmaw1gdmsRYIZrGWCSS51gqiqxYL+qfWDCJgVgxlfFYNI/qWDWTZ1g6jeRYPZrMWECVu1hBl9tYSonyWEuayFhRkVlYUprLWFSTg1hXk2hYWJOEWFmUt1hakstYXo3HWGKax1hpiZZYa5NVWHCayVhymsVYdZBvWHmazVh+j21Yg4urWIWazliTleZYl5GdWJySxFifmtBYqJZuWKua0ViumtZYs5WtWLia1Vi5ms9YuprSWLua1Fi+jaRYwZXHWMWa11jHkmRYyonzWMyP61jRmtlY05rYWNWNiFjXmtpY2JrcWNma21jcmt5Y3prTWN+a4Fjkmt9Y5ZrdWOuObVjskHBY7pFzWO+a4VjwkLpY8YjrWPKUhFj3ktlY+ZrjWPqa4lj7muRY/JrlWP2a5lkCmudZCZXPWQqa6FkPicRZEJrpWRWXW1kWik9ZGJnHWRmPZ1kakb1ZG5rqWRyW6VkilrJZJZrsWSeR5Vkpk1ZZKpG+WSuVdlksmu1ZLZruWS6Jm1kxjrhZMprvWTeIzlk4mvBZPprxWUSJgllHiu9ZSJPeWUmV8llOmvVZT5F0WVCa9FlRjF9ZVJZ6WVWa81lXk4VZWJr3WVqa9llgmvlZYpr4WWWJnFlnmvpZaI+nWWma/FlqkkRZbJr7WW6VsVlzj5dZdJN6WXibQFl9jURZgZtBWYKUQFmDlNxZhJbPWYqURFmNm0pZk4tXWZaXZFmZlq1Zm5uqWZ2bQlmjm0VZpZHDWaiWV1msk2lZsptGWbmWhVm7jchZvo+oWcabR1nJjm9Zy45uWdCIt1nRjMZZ05CpWdSIz1nZm0tZ2ptMWdybSVnliVdZ5oqtWeibSFnqlsNZ65VQWfaIpln7iPdZ/45wWgGI0FoDiKFaCZtRWhGbT1oYlrpaGptSWhybUFofm05aIJBQWiWbTVopldhaL4ziWjWbVlo2m1daPI+pWkCbU1pBmEtaRpRrWkmbVVpajaVaYptYWmaVd1pqm1labJtUWn+WuVqSlH1amptaWpuVUVq8m1tavZtfWr6bXFrBicVawpteWsmOuVrLm11azIyZWtCba1rWm2Ra15thWuGShFrjm2Ba5ptiWumbY1r6m2Va+5tmWwmK8FsLm2hbDJtnWxabaVsij+xbKptsWyyS2lswiWRbMptqWzabbVs+m25bQJtxW0Obb1tFm3BbUI5xW1GbcltUjUVbVZtzW1eOmltYkbZbWpt0W1ubdVtcjnlbXY1GW1+W0Ftji0dbZIzHW2WbdltmindbaZt3W2uRt1twm3hbcZuhW3ObeVt1m3pbeJt7W3qbfVuAm35bg5uAW4WR7luHiUZbiI7nW4mIwFuLkXZbjIquW42Os1uPjUdblZOGW5ePQFuYiq9bmZKIW5qS6FubiLZbnItYW52V81ufjsBbootxW6OQ6VukjrpbpZdHW6abgVuui3tbsI3JW7OKUVu0iYNbtY+qW7aJxlu4m4JbuZdlW7+PaFvCjuJbw5uDW8SK8VvFk9BbxpanW8ebhFvJm4VbzJV4W9Cbh1vSiqZb04v1W9SbhlvbirBb3ZBRW96bi1vfjkBb4YnHW+Kbilvkm4hb5ZuMW+abiVvnlEpb6J7LW+mQUlvrm41b7pe+W/Cbjlvzm5Bb9ZKeW/abj1v4kKFb+o6bW/6Rzlv/jvVcAZWVXAKQ6lwEjstcBZuRXAaPq1wHm5JcCJuTXAmI0VwKkbhcC5BxXA2blFwOk7FcD4+sXBGPrVwTm5VcFpDrXBqPrlwgm5ZcIpuXXCSW3lwom5hcLYvEXDGPQVw4m5lcOZuaXDqO2lw7kEtcPJPyXD2Qc1w+lPZcP5RBXECLx1xBm5tcRYuPXEabnFxIi/xcSpPNXEuJrlxNjnJcTpudXE+boFxQm59cUYv7XFObnlxVk1dcXpGuXGCTalxhjsZcZJF3XGWXmlxsm6JcbpujXG+T1FxxjlJcdpulXHmbplyMm6dckIryXJGbqFyUm6lcoYmqXKiRWlypiuJcq5urXKyWplyxkdBcs4p4XLabrVy3m69cuIrdXLubrFy8m65cvpuxXMWbsFzHm7Jc2ZuzXOCTu1zhi6xc6InjXOmbtFzqm7lc7Zu3XO+V9VzwlfRc9pOHXPqbtlz7j3Nc/Zu1XQeQkl0Lm7pdDo3oXRGbwF0Um8FdFZu7XRaKUl0Xm7xdGJvFXRmbxF0am8NdG5u/XR+bvl0im8JdKZX2XUubyV1Mm8ZdTpvIXVCXkl1Sm8ddXJu9XWmQk11sm8pdb421XXOby112m8xdgpvPXYSbzl2Hm81di5OIXYybuF2Qm9VdnZvRXaKb0F2sm9JdrpvTXbeb1l26l+RdvJvXXb2b1F3Jm9hdzIreXc2b2V3Sm9td05vaXdab3F3bm91d3ZDsXd6PQl3hj4Rd45GDXeWNSF3mjbZd541JXeiLkF3rm95d7o23XfGMyF3ym99d85akXfSUYl31m+Bd941KXfuKql39kkZd/ovQXgKOc14DlXpeBpS/Xgub4V4MivNeEZvkXhaSn14Zm+NeGpviXhub5V4dkuleJZCDXiuOdF4tkMheL5HRXjCLQV4zkqBeNpvmXjeb5144j+1ePZZYXkCb6l5Dm+leRJvoXkWVnV5Hm/FeTJZ5Xk6b615Um+1eVZaLXleb7F5fm+5eYZSmXmKb715jlbxeZJvwXnKKsV5zlb1edJROXnWb8l52m/NeeI1LXnmKsl56m/Ree4y2XnyXY159l0hefor0Xn+b9l6BkqFeg41MXoSPr16HlN1eio+wXo+PmF6VkupelpX3XpeTWF6ajU1enJV7XqCb916mk3hep43AXquMyV6tkutetYjBXraPjl63jU5euJdmXsGb+F7Cm/lew5RwXsib+l7Jl/VeyphMXs+b/F7Qm/te04pmXtacQF7anENe25xEXt2cQl7flV9e4I+xXuGcRl7inEVe45xBXuicR17pnEhe7JxJXvCcTF7xnEpe85xLXvScTV72iYRe95LsXvicTl76jJpe+4n0XvyUVV7+nE9e/5P5XwGV2V8DnFBfBJhNXwmcUV8Klb5fC5xUXwyYn18NmK9fD46uXxCT818RnFVfE4t8XxSSol8ViPhfFpxWXxeVpF8YjU9fG5JvXx+S7V8llu1fJoy3XyeMyl8pnFdfLZxYXy+cXl8xjuNfNZKjXzeLrV84nFlfPJVKXz6SZV9BnFpfSJxbX0qLrl9MnFxfTpxdX1GcX19Tk5ZfVpxgX1ecYV9ZnGJfXJxTX12cUl9hnGNfYoxgX2aVRl9pjcpfapVWX2uSpF9slWpfbZxkX3CPsl9xiWVfc5xlX3ecZl95lvBffJTeX3+caV+AiZ1fgZCqX4KcaF+DnGdfhIxhX4WR0l+HnG1fiJxrX4qcal+Ll6VfjIzjX5CPmV+RnGxfkpNrX5OPXV+Xk75fmJxwX5mcb1+enG5foJxxX6GM5F+onHJfqZWcX6qPel+tnHNfrpT3X7OTv1+0kqVfuZNPX7ycdF+9i0pfw5BTX8WVS1/MivVfzZRFX9acdV/XjnVf2JZZX9mWWl/ciZ5f3Zx6X+CSiV/knHdf64n1X/Ccq1/xnHlf9ZRPX/iceF/7nHZf/Y2aX/+cfGAOnINgD5yJYBCcgWASk3tgFZyGYBaVfGAZnIBgG5yFYByX5WAdjnZgIJHTYCGcfWAli31gJpyIYCeQq2AoiYVgKZyCYCqJ9mArnIdgL4uvYDGchGA6nIpgQZyMYEKclmBDnJRgRpyRYEqckGBLl/ZgTZySYFCLsGBSjVBgVY+aYFmcmWBanItgX5yPYGCcfmBiifhgY5yTYGSclWBlknBgaI2mYGmJtmBqnI1ga5yYYGycl2Bti7Fgb5GnYHCKhmB1jGJgd5yOYIGcmmCDnJ1ghJyfYImOu2CLnKVgjJLuYI2cm2CSnKNglIn3YJacoWCXnKJgmpyeYJucoGCfjOVgoJdJYKOKs2CmiXhgp5ykYKmUWWCqiKtgspTfYLOce2C0nKpgtZyuYLaW42C4nKdgvJOJYL2crGDFj+5gxpytYMeT1WDRmGZg05ypYNicr2DajZtg3JDJYN+I0mDgnKhg4ZymYOOReWDnnJxg6I5TYPCRxGDxnLtg85F6YPSctmD2nLNg95y0YPmO5GD6nLdg+5y6YQCctWEBj0RhA5y4YQacsmEIlvphCZb5YQ2cvGEOnL1hD4jTYRWcsWEai/BhG4ikYR+KtGEhnLlhJ5zBYSicwGEsnMVhNJzGYTycxGE9nMdhPpy/YT+cw2FCnMhhRJzJYUecvmFIjpxhSpzCYUuR1GFMjVFhTZywYU6QVGFTnNZhVZXnYViczGFZnM1hWpzOYV2c1WFfnNRhYpadYWOKtWFlnNJhZ4xkYWiKU2FrnM9hbpe2YW+c0WFwiNRhcZzTYXOcymF0nNBhdZzXYXaMY2F3nMthfpd8YYKXSmGHnNphipzeYY6RnmGQl/dhkZzfYZSc3GGWnNlhmZzYYZqc3WGkla5hp5OyYamMZWGrnOBhrJzbYa6c4WGyjJthtomvYbqc6WG+irZhw5znYcac6GHHjadhyJzmYcmc5GHKnONhy5zqYcyc4mHNnOxh0In5YeOc7mHmnO1h8pKmYfSc8WH2nO9h95zlYfiMnGH6nPBh/Jz0Yf2c82H+nPVh/5zyYgCc9mIInPdiCZz4YgqV6GIMnPpiDZz5Yg6PXmIQkKxiEYnkYhKJ+mIUnPtiFoi9YhqQymIbnPxiHebBYh6dQGIfjIFiIZ1BYiaQ7WIqnUJiLp1DYi+LWWIwnURiMp1FYjOdRmI0kdViOIzLYjuW32I/lltiQI+KYkGdR2JHkO5iSOe7YkmU4GJLjuhiTY3LYk6dSGJTkcViVZWlYliR72JbnUtiXp1JYmCdTGJjnUpiaJ1NYm6Vr2JxiLVidpV9YnmU4WJ8nU5ifp1RYn+Ps2KAi1pigp1PYoOdVmKEj7RiiZ1QYoqUY2KRl31ikp1SYpOdU2KUnVdilZOKYpadVGKXjVJimJDcYpudZWKclLJinpHwYquU4mKsnatisZX4YrWS72K5lpViu51aYryJn2K9kopiwp1jYsWSU2LGnV1ix51kYsidX2LJnWZiyp1iYsydYWLNlI9iz51bYtCJ+2LRnVli0ouRYtOR8WLUnVVi151YYtiNU2LZkNli24+1YtydYGLdlHFi4IuSYuGKZ2Lsiodi7ZBAYu6daGLvnW1i8Z1pYvOMnWL1nW5i9o5BYveNiWL+j0Vi/51cYwGOnWMCnWtjB453YwidbGMJiMJjDJ1nYxGSp2MZi5NjH4uyYyedamMoiKVjK43BYy+QVWM6kvBjPZTSYz6dcGM/kX1jSZGoY0yOSmNNnXFjT51zY1Cdb2NVld9jV5K7Y1yRe2NnlfljaI7MY2mdgGNrnX5jbpCYY3KMnmN2nXhjd4+3Y3qT5mN7lFBjgJ12Y4ORfGOIjvZjiZ17Y4yPtmOOnXVjj516Y5KUcmOWnXRjmIxAY5uKfGOfnXxjoJepY6GNzGOiklRjo515Y6WQ2mOnjVRjqJCEY6mJhmOqkVtjq513Y6yLZGOyjGZjtJLNY7WdfWO7kX5jvp2BY8Cdg2PDkbVjxJ2JY8adhGPJnYZjz5VgY9CS8WPSnYdj1pdLY9qXZ2Pbirdj4YisY+OdhWPpnYJj7or2Y/SJh2P2nYhj+pdoZAadjGQNkblkD52TZBOdjWQWnYpkF52RZBydcmQmnY5kKJ2SZCyUwGQtk4tkNJ2LZDadj2Q6jGdkPo3vZEKQ22ROnZdkWJNFZGedlGRploBkb52VZHadlmR4lsxkepCgZIOMgmSInZ1kko5UZJOdmmSVnZlkmpRRZJ6Ts2Skk1BkpZ2bZKmdnGSrlY9krZRkZK6OQmSwkO9kspZvZLmKaGS7naNkvJ2eZMGXaWTCnaVkxZ2hZMedomTNkYBk0p2gZNSdXmTYnaRk2p2fZOCdqWThnapk4pNGZOOdrGTmjkNk552nZOyLW2Tvna1k8Z2mZPKdsWT0nbBk9p2vZPqdsmT9nbRk/o/vZQCds2UFnbdlGJ21ZRydtmUdnZBlI525ZSSduGUqnZhlK526ZSydrmUvjnhlNJ27ZTWdvGU2nb5lN529ZTidv2U5ifxlO41VZT6V+mU/kK1lRYzMZUidwWVNncRlT5VxZVGLfmVVncNlVp3CZVeUc2VYncVlWYuzZV2dx2VencZlYoq4ZWOOVWVmk9ZlbIxoZXCQlGVynchldJCuZXWTR2V3lX5leJ3JZYKdymWDnctlh5W2ZYibfGWJkMRljJVrZY6N1mWQlONlkZTBZZeTbGWZl79lm53NZZyOzmWfnc5loYi0ZaSL0mWlkMtlp5WAZaudz2WsjmFlrZJmZa+OemWwkFZlt53QZbmV+2W8iZdlvY57ZcGd02XDndFlxJ3UZcWXt2XGndJly5D5Zcyd1WXPkbBl0p3WZdeK+GXZndhl253XZeCd2WXhndpl4or5ZeWT+mXmklVl54uMZeiOfGXpkYFl7I97Ze2IrmXxndtl+omgZfud32YCjVZmA53eZgaNqWYHj7hmCp3dZgyPuWYOlr5mD42oZhOI1WYUkMxmHJ3kZh+Qr2YgiWZmJY90ZieWhmYojfBmLY+6Zi+QpWY0neNmNZ3hZjad4mY8kotmP55FZkGd6GZCjp5mQ41XZkSd5mZJnedmS5BXZk+d5WZSjk5mXZ3qZl6d6WZfne5mYp3vZmSd62ZmikFmZ53sZmid7WZplNNmbpWBZm+MaWZwnfBmdJCwZnaPu2Z6knFmgYvFZoOd8WaEnfVmh4nJZoid8maJnfRmjp3zZpGPi2aWkmdml4jDZpid9madnfdmopKoZqaX72arjmJmrpXpZrSWXGa4nkFmuZ35Zryd/Ga+nftmwZ34ZsSeQGbHk9xmyZ36ZtaeQmbZj4xm2p5DZtyXambdlJhm4J5EZuaeRmbpnkdm8J5IZvKLyGbziWdm9I1YZvWeSWb3nkpm+I+RZvmRgmb8mdZm/ZFdZv6RXGb/kdZnAI3FZwOY8GcIjI5nCZdMZwuV/GcNlZ5nD55LZxSN8WcVkr1nFp5MZxeYTmcbll1nHZKpZx6eTWcfivpnJp5OZyeeT2colthnKpaiZyuWlmcslntnLY5EZy6eUWcxjulnNJZwZzaeU2c3nlZnOJ5VZzqK92c9i4BnP55SZ0GeVGdGnldnSZCZZ06Xm2dPiMdnUI3eZ1GRumdTjttnVo/xZ1meWmdck21nXp5YZ1+RqWdgnllnYY/wZ2KW22djnltnZJ5cZ2WXiGdqnmFnbY1ZZ2+UdGdwnl5ncZOMZ3Kd3GdzneBndYtuZ3eUZmd8nmBnfo+8Z3+UwmeFnmZnh5T4Z4meXWeLnmNnjJ5iZ5CQzWeVlo1nl5fRZ5qWh2ecicpnnY59Z6CYZ2ehnmVnopCVZ6aeZGepnl9nr4zNZ7Oea2e0nmlntonLZ7eeZ2e4nm1nuZ5zZ8GRxmfElb9nxp51Z8qVQWfOnnRnz5SQZ9CWXmfRirln05D1Z9SPX2fYktFn2pdNZ92ecGfenm9n4p5xZ+SebmfnnnZn6Z5sZ+yeamfunnJn755oZ/GSjGfzlvZn9I7EZ/WN8mf7jbhn/paPZ/+KYGgCksxoA5PIaASJaGgTkPBoFpCyaBeMSWgennhoIY1aaCKKnGgpnnpoKoqUaCuegWgynn1oNJDxaDiKamg5japoPIppaD2NzWhAnntoQYyFaEKMamhDk41oRp55aEiIxGhNnnxoTp5+aFCLy2hRjEtoU4q6aFSLamhZnoJoXI33aF2WkWhfjlZoY56DaGeVT2h0no9odomxaHeehGh+npVof56FaIGXwGiDnoxohZR+aI2elGiPnodok4iyaJSeiWiXjVtom56LaJ2eimifnoZooJ6RaKKPvWimmutop4zmaKiXnGitnohor5LyaLCKQmixjatos56AaLWekGi2ioFouZ6OaLqekmi8k45oxIr8aMaesGjJlsdoyp6XaMuK+2jNnp5o0pZfaNSen2jVnqFo156laNiemWjakklo35OPaOCeqWjhnpxo456maOeeoGjukFho756qaPKQsWj5nqho+oq7aQCYb2kBnpZpBJ6kaQWI1mkInphpC5a4aQyenWkNkEFpDpLFaQ+ek2kSnqNpGZCaaRqerWkbipFpHIyfaSGer2kinpppI56uaSWep2kmnptpKJ6raSqerGkwnr1pNJPMaTaeomk5nrlpPZ67aT+S1mlKl2tpU5WWaVSetmlVkchpWZ68aVqRXmlcnrNpXZ7AaV6ev2lgk+1pYZ6+aWKT6GlqnsJpa561aW2Lxmlunrhpb498aXOUgGl0nrppdYvJaXeesml4nrRpeZ6xaXyYT2l9inlpfp63aYGewWmCilRpio3laY6JfGmRntJplJhQaZWe1WmbkFlpnJ7UaaCe02mnntBprp7EabGe4WmynsNptJ7Wabuezmm+nslpv57GacGex2nDns9px+qgacqezGnLjVxpzJLGac2RhGnOnspp0J7FadOeyGnYl2xp2ZaKad2ezWnentdp557faeie2GnrnuVp7Z7jafKe3mn5nt1p+5LOaf2RhWn/nttqAp7ZagWe4GoKnuZqC5Tzagye7GoSnudqE57qahSe5GoXkpRqGZVXahue2moenuJqH4++aiGWzWoinvZqI57paimMoGoqiaFqK4p+ai6e0Wo1j79qNp7uajie9Wo5jvdqOoqSaj2STWpEnutqR57wakie9GpLi7RqWItralme8mpfi0BqYZPJamKe8WpmnvNqcp7tanie72p/ioBqgJJoaoSe+mqNnvhqjoznapCe92qXn0BqnJ53aqCe+Wqinvtqo578aqqfS2qsn0dqrp6NarOfRmq4n0Vqu59CasGe6GrCn0Rqw59DatGfSWrTmEVq2p9MatuL+Wren0hq359KauiUpWrqn01q+p9RavufTmsEl5NrBZ9Pawqe3GsSn1JrFp9Tax2JVGsfn1VrIIyHayGOn2sji9NrJ4miazKXfms3n1drOJ9WazmfWWs6i1xrPYvUaz6KvGtDn1xrR59ba0mfXWtMicxrTpJWa1CfXmtTir1rVJ9ga1mfX2tbn2FrX59ia2GfY2tijn5rY5Cza2SNn2tmlZBraZXga2qYY2tvjpVrc43Oa3SX8Gt4n2RreZ9la3uOgGt/n2ZrgJ9na4OfaWuEn2hrhpZ3a4mPfWuKjupri45ja42famuVn2xrlpBCa5ifa2uen21rpJ9ua6qfb2urn3Brr59xa7Gfc2uyn3Jrs590a7SJo2u1kmlrt591a7qORWu7imtrvJ92a7+TYWvAmsprxYtCa8afd2vLn3hrzZXqa86WiGvSk8Vr0595a9SU5GvYlPlr25bRa9+femvrn3xr7J97a++ffmvzn31sCJ+BbA+OgWwRlq9sE5+CbBSfg2wXi0NsG5+EbCOfhmwkn4VsNJCFbDeVWGw4iWlsPpTDbECS82xBj2BsQouBbE6UxGxQjqxsVZ+IbFeKvmxaiZhsXZPwbF6fh2xfjV1sYJJybGKfiWxon5Fsap+KbHCRv2xyi4Jsc5+SbHqMiGx9i0Rsfp+QbIGfjmyCn4tsg5eAbIiSvmyMk9dsjZ+MbJCflGySn5Nsk4xCbJaJq2yZjblsmp+NbJufj2yhlnZsopHybKuWl2yun5xssZ+dbLOJzWy4laZsuZb7bLqfn2y7jqFsvI/AbL2fmGy+n55sv4mIbMGLtWzEn5VsxZ+abMmQ8mzKlJFszJTlbNOfl2zVlkBs15+ZbNmfomzbn6Bs3Z+bbOGWQWzilGds44uDbOWTRGzoko1s6p+jbO+foWzwkdds8Z+WbPOJam0Ll21tDJ+ubRKfrW0XkPRtGZ+qbRuXjG0ek7RtH5+kbSWSw20piWttKo1ebSufp20yj0ZtM5+sbTWfq202n6ZtOJ+pbTuKiG09n6htPpRobUGXrG1Ej/JtRZDzbVmftG1an7JtXJVsbWOfr21kn7FtZolZbWmNX21qmFFtbIpcbW6Vgm10l4Ftd4pDbXiQWm15n7NthZ+4bYiPwW2Ml09tjp+1bZOfsG2Vn7ZtmZfcbZuTk22ck8Btr4pVbbKJdG21n7xtuJ+/bbyXwW3Al4RtxZ/GbcafwG3Hn71ty5fS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hWmToIVqlZOFbeVKhXflUIV+5VGFgOVEhYSUloWH5U6FiOVGhYrlSIWQ5VKFkeVHhZTlS4WXiZKFmZPjhZvlTIWc5U+FpOVFhaaRRYWo5UmFqY5GhaqQZIWrjE+FrJbyha6W94Wvj5KFueVWhbrlVIXBmG2FyeVThc2XlYXP5VWF0OVXhdXlWIXc5VuF3eVZheSToYXl5VqF6ZTLherlTYX3j5OF+eVchfrlYYX7kZSF/uVghgLlQYYG5WKGB5FohgrlXYYL5V+GE+VehhafUIYXn0GGGuVkhiLlY4Ytl5aGL+G6hjDlZYY/5WaGTeVnhk6M1YZQi3OGVOVphlWZfIZai5WGXJe4hl6L8YZf5WqGZ+VrhmuSjoZx5WyGeZP4hnuIuIaKieGGi+VxhozlcoaT5W2GlY5chqPlboaklGGGqeVvhqrlcIar5XqGr+V0hrDld4a25XOGxOV1hsbldobHjtaGyeV4hsuSYIbNjHWGzophhtTle4bZil6G2+WBht7lfIbf5YCG5JS4hunlfYbs5X6G7ZVnhu6U2Ibv5YKG+JH7hvnljIb75YiG/onphwDlhocClkmHA+WHhwblhIcI5YWHCeWKhwrljYcN5YuHEeWJhxLlg4cYkneHGuWUhxyWqIcl5ZKHKeWThzTljoc35ZCHO+WRhz/lj4dJkOSHS5hYh0zlmIdO5ZmHU+Wfh1WQSYdX5ZuHWeWeh1/llodg5ZWHY+Wgh2aJ2odo5ZyHauWhh27lnYd05ZqHdpKxh3jll4d/lIiHguWlh42XWoef5aSHouWjh6vlrIev5aaHs+Wuh7qXhoe75bGHveWoh8DlqYfE5a2HxuWwh8flr4fL5aeH0OWqh9Llu4fg5bSH7+Wyh/Lls4f25biH9+W5h/mKSYf7i2GH/uW3iAXloogN5baIDuW6iA/ltYgR5byIFeW+iBblvYgh5cCIIuW/iCPleYgn5cSIMeXBiDblwog55cOIO+XFiECMjIhC5ceIROXGiEaPT4hMjXOITZ+liFLlyIhTj3CIV4pYiFnlyYhbiXGIXY/ViF7lyohhjXSIYuXLiGOI34holVyIa+XMiHCQiohy5dOIdeXQiHeSj4h95dGIfuXOiH+L3IiB5c2IguXUiIiMVYiLkdyIjeXaiJLl1oiWkbOIl+XViJnl2Iie5c+IouXZiKTl24irlO2IruXX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ljKWaJY7kWqWP4iilkCRyZZC6JiWRJWNlkvom5ZM6JmWTY1+lk/ompZQjMCWW5XDllzonZZd6J+WXuiell/ooJZiiUCWY5B3lmSPnJZliteWZuihlmqUhpZs6KOWcIlBlnLoopZzksKWdZfLlnaTqZZ36JyWeJeklnqMr5Z9l3qWhYv3loaXspaIjEeWipHglovkQJaN6KSWjopLlo+Qj5aUinWWleimlpfop5aY6KWWmYyElpuN25acj+GWoIlClqOX15an6KmWqOeslqroqJaw6KyWseiqlrLoq5a06K2WtuiulreX6pa46K+WueiwlruQx5a8lLmWwJCdlsGK5ZbEl1mWxYnrlsaPV5bHjNmWyeizlsvospbMjpOWzei0ls7osZbRjkeW1ei4ltblq5bZmdSW25CXltzotpbil6OW45PvluiJSpbqkOGW6460lvCVtZbyiV+W9pfrlveXi5b56LmW+5NklwCO+ZcE6LqXBui7lweQa5cI6LyXCpfslw3ot5cO6L6XD+jAlxHov5cT6L2XFujBlxnowpcckZqXHonglyTow5cnlraXKujElzDoxZcymEmXOJ5Qlznoxpc96MeXPujIl0LozJdE6MmXRujKl0joy5dJ6M2XUpDCl1aW9ZdZkMOXXOjOl16U8Zdg6M+XYepyl2KWypdk6NCXZujRl2jo0pdpinaXa+jUl22QeJdx6NWXdIxDl3no1pd66NqXfOjYl4Ho2ZeEipOXhejXl4bo25eL6NyXjYjGl4/o3ZeQ6N6XmI/il5zo35egi2aXo+jil6bo4Zeo6OCXq+aRl62V2pez6OOXtOjkl8Po5ZfG6OaXyOjnl8vo6JfTitiX3Ojpl+3o6pfulEKX8ujsl/OJuZf16O+X9ujul/uJQ5f/i7+YAZXFmAKSuJgDjaCYBY2AmAaPh5gIkHuYDOjxmA/o8JgQl2GYEYrmmBKU0JgTk9qYF5CcmBiXzJgajHqYIej0mCTo85gslmqYLZOqmDSJb5g36PWYOOjymDuVcJg8l4qYPej2mEbo95hL6PmYTJHomE2KephOinuYT+j4mFSK55hVjLCYWIromFuTXphel96YZ4zamGvo+phv6PuYcOj8mHHpQJhz6UKYdOlBmKiVl5iq6UOYr+lEmLHpRZi26UaYw+lImMTpR5jG6UmY25TymNzjypjfkEiY4otRmOnpSpjr6UuY7ZmqmO6fWpjvlNGY8oj5mPSIuZj8jpSY/ZZPmP6P/JkD6UyZBZbdmQnpTZkKl3uZDIlhmRCOYJkS6U6ZE4nsmRTpT5kY6VCZHelSmR7pU5kg6VWZIelRmSTpVJkoitmZLOlWmS7pV5k96ViZPulZmULpWplF6VyZSelbmUvpXplM6WGZUOldmVHpX5lS6WCZVelimVeLwJmWjvGZl+ljmZjpZJmZjYGZpellmaiKXZmslG6Zrelmma7pZ5mzknmZtJPpmbzpaJnBlJ2ZxJHKmcWJd5nGi+yZyIvtmdCSk5nR6W2Z0ovumdWJ7ZnY6WyZ2+lqmd3pa5nf6WmZ4ul3me3pbpnu6W+Z8elwmfLpcZn46XOZ++lymf+PeJoB6XSaBel2mg6LUpoP6XWaEpGbmhOMsZoZ6XiaKJHLmivpeZowk6uaN+l6mj7pgJpA6X2aQul8mkPpfppF6XuaTemCmlXpgZpX6YSaWovBmlvpg5pf6YWaYumGmmTpiJpl6YeaaemJmmrpi5pr6YqaqI2cmq3pjJqw6Y2auIpbmrzpjprA6Y+axJCRms/pkJrR6ZGa0+mSmtTpk5rYjYKa3umUmt/plZri6Zaa4+mXmubpmJrqlK+a6+mamu2VRZru6Zua7+mZmvHpnZr06Zya9+memvvpn5sG6aCbGOmhmxrpopsf6aObIumkmyPppZsl6aabJ+mnmyjpqJsp6ambKumqmy7pq5sv6aybMZ9UmzLprZs74vabPItTm0GKQJtCjbCbQ+mvm0TprptFlqObTemxm07psptP6bCbUemzm1SWgptY6bSbWoubm2+YRJt06bWbg+m3m46IvJuR6bibkpWpm5PptpuW6bmbl+m6m5/pu5ug6bybqOm9m6qWjpurjkybrY34m66RTpu06b6buenBm8Dpv5vG6cKbyYzvm8rpwJvP6cOb0enEm9LpxZvU6cmb1o5Jm9uR4pvh6cqb4unHm+Ppxpvk6cib6Ix+m/Dpzpvx6c2b8unMm/WIsZwE6dicBunUnAjp1ZwJ6dGcCunXnAzp05wNioKcEJhrnBLp1pwT6dKcFOnQnBXpz5wb6dqcIendnCTp3Jwl6ducLZVonC7p2ZwviPGcMOnenDLp4Jw5io+cOunLnDuJVpw+6eKcRunhnEfp35xIkkycUpaQnFeX2Jxa6eOcYOnknGfp5Zx26eaceOnnnOWSuZzn6eic6ZS1nOvp7Zzs6emc8OnqnPOWUJz0lsKc9pPOnQPp7p0G6e+dB5O8nQjp7J0J6eudDomonRLp950V6fadG4mVnR/p9J0j6fOdJunxnSiKm50q6fCdK46wnSyJp507jYOdPun6nT/p+Z1B6fidROn1nUbp+51I6fydUOpEnVHqQ51Z6kWdXIlMnV3qQJ1e6kGdYI2UnWGWt51k6kKdbJZRnW/qSp1y6kadeupLnYfqSJ2J6kedj4x7nZrqTJ2k6k2dqepOnavqSZ2v6fKdsupPnbSS35246lOduupUnbvqUp3B6lGdwupXncTqUJ3G6lWdz+pWndPqWZ3Z6lid5upbne3qXJ3v6l2d8phonfjqWp35kemd+o3rnf3qXp4a6l+eG+pgnh7qYZ516mKeeIyynnnqY5596mSef46tnoHqZZ6I6maei+pnnozqaJ6R6muekuppnpOYW56V6mqel5ftnp3qbJ6fl9mepeptnqaUnp6p6m6equpwnq3qcZ646m+euY2NnrqWy567loOevJv1nr6fgJ6/lpuexImpnszqc57Ni2+ezup0ns/qdZ7Q6nae0o2VntTqd57Y4NKe2ZbZntuR4Z7c6nie3ep6nt7qeZ7g6nue5ep8nujqfZ7v6n6e9OqAnvbqgZ736oKe+eqDnvvqhJ786oWe/eqGnwfqh58I6oifDpNDnxOM258V6oqfIJFsnyHqi58s6oyfO5VAnz7qjZ9K6o6fS+JWn07m2J9P6OufUuqPn1TqkJ9f6pKfYOqTn2HqlJ9il+6fY+qRn2bqlZ9n6pafauqYn2zql59y6pqfduqbn3fqmZ+Nl7Sfleqcn5zqnZ+d4nOfoOqe/wGBSf8DgZT/BIGQ/wWBk/8GgZX/CIFp/wmBav8KgZb/C4F7/wyBQ/8OgUT/D4Fe/xCCT/8RglD/EoJR/xOCUv8UglP/FYJU/xaCVf8Xglb/GIJX/xmCWP8agUb/G4FH/xyBg/8dgYH/HoGE/x+BSP8ggZf/IYJg/yKCYf8jgmL/JIJj/yWCZP8mgmX/J4Jm/yiCZ/8pgmj/KoJp/yuCav8sgmv/LYJs/y6Cbf8vgm7/MIJv/zGCcP8ygnH/M4Jy/zSCc/81gnT/NoJ1/zeCdv84gnf/OYJ4/zqCef87gW3/PIFf/z2Bbv8+gU//P4FR/0CBTf9BgoH/QoKC/0OCg/9EgoT/RYKF/0aChv9Hgof/SIKI/0mCif9Kgor/S4KL/0yCjP9Ngo3/ToKO/0+Cj/9QgpD/UYKR/1KCkv9TgpP/VIKU/1WClf9Wgpb/V4KX/1iCmP9Zgpn/WoKa/1uBb/9cgWL/XYFw/2EAof9iAKL/YwCj/2QApP9lAKX/ZgCm/2cAp/9oAKj/aQCp/2oAqv9rAKv/bACs/20Arf9uAK7/bwCv/3AAsP9xALH/cgCy/3MAs/90ALT/dQC1/3YAtv93ALf/eAC4/3kAuf96ALr/ewC7/3wAvP99AL3/fgC+/38Av/+AAMD/gQDB/4IAwv+DAMP/hADE/4UAxf+GAMb/hwDH/4gAyP+JAMn/igDK/4sAy/+MAMz/jQDN/44Azv+PAM//kADQ/5EA0f+SANL/kwDT/5QA1P+VANX/lgDW/5cA1/+YANj/mQDZ/5oA2v+bANv/nADc/50A3f+eAN7/nwDf/+OBUP/lgY8=';
    // SJISTables
    var SJIS2UTFTable = (_a = createSJISTable(UNICODE_DATA, 7070), _a.SJIS2UTFTable), UTF2SJISTable = _a.UTF2SJISTable;
    /**
     * @function SJIS
     * @param {string} str
     * @returns {number[]}
     */
    function SJIS(str) {
        var bytes = [];
        var length = str.length;
        for (var i = 0; i < length; i++) {
            var code = str.charCodeAt(i);
            if (code < 128) {
                bytes.push(code);
            }
            else {
                var byte = SJIS2UTFTable[code];
                if (byte != null) {
                    if ((byte & 0xff) === byte) {
                        // 1byte
                        bytes.push(byte);
                    }
                    else {
                        // 2bytes
                        bytes.push(byte >>> 8);
                        bytes.push(byte & 0xff);
                    }
                }
                else {
                    throw "illegal char: " + String.fromCharCode(code);
                }
            }
        }
        return bytes;
    }

    /**
     * @module index
     * @author nuintun
     * @author Cosmo Wolfe
     */
    var Mode$2;
    (function (Mode) {
        Mode["Numeric"] = "numeric";
        Mode["Alphanumeric"] = "alphanumeric";
        Mode["StructuredAppend"] = "structuredappend";
        Mode["Byte"] = "byte";
        Mode["Kanji"] = "kanji";
        Mode["ECI"] = "eci";
    })(Mode$2 || (Mode$2 = {}));
    var ModeByte;
    (function (ModeByte) {
        ModeByte[ModeByte["Terminator"] = 0] = "Terminator";
        ModeByte[ModeByte["Numeric"] = 1] = "Numeric";
        ModeByte[ModeByte["Alphanumeric"] = 2] = "Alphanumeric";
        ModeByte[ModeByte["StructuredAppend"] = 3] = "StructuredAppend";
        ModeByte[ModeByte["Byte"] = 4] = "Byte";
        ModeByte[ModeByte["Kanji"] = 8] = "Kanji";
        ModeByte[ModeByte["ECI"] = 7] = "ECI";
        // FNC1FirstPosition = 0x5,
        // FNC1SecondPosition = 0x9
    })(ModeByte || (ModeByte = {}));
    function decodeNumeric(stream, size) {
        var text = '';
        var bytes = [];
        var characterCountSize = [10, 12, 14][size];
        var length = stream.readBits(characterCountSize);
        // Read digits in groups of 3
        while (length >= 3) {
            var num = stream.readBits(10);
            if (num >= 1000) {
                throw 'invalid numeric value above 999';
            }
            var a = Math.floor(num / 100);
            var b = Math.floor(num / 10) % 10;
            var c = num % 10;
            bytes.push(48 + a, 48 + b, 48 + c);
            text += a.toString() + b.toString() + c.toString();
            length -= 3;
        }
        // If the number of digits aren't a multiple of 3, the remaining digits are special cased.
        if (length === 2) {
            var num = stream.readBits(7);
            if (num >= 100) {
                throw 'invalid numeric value above 99';
            }
            var a = Math.floor(num / 10);
            var b = num % 10;
            bytes.push(48 + a, 48 + b);
            text += a.toString() + b.toString();
        }
        else if (length === 1) {
            var num = stream.readBits(4);
            if (num >= 10) {
                throw 'invalid numeric value above 9';
            }
            bytes.push(48 + num);
            text += num.toString();
        }
        return { bytes: bytes, text: text };
    }
    // prettier-ignore
    var AlphanumericCharacterCodes = [
        '0', '1', '2', '3', '4', '5', '6', '7', '8',
        '9', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H',
        'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q',
        'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
        ' ', '$', '%', '*', '+', '-', '.', '/', ':'
    ];
    function decodeAlphanumeric(stream, size) {
        var text = '';
        var bytes = [];
        var characterCountSize = [9, 11, 13][size];
        var length = stream.readBits(characterCountSize);
        while (length >= 2) {
            var v = stream.readBits(11);
            var a = Math.floor(v / 45);
            var b = v % 45;
            bytes.push(AlphanumericCharacterCodes[a].charCodeAt(0), AlphanumericCharacterCodes[b].charCodeAt(0));
            text += AlphanumericCharacterCodes[a] + AlphanumericCharacterCodes[b];
            length -= 2;
        }
        if (length === 1) {
            var a = stream.readBits(6);
            bytes.push(AlphanumericCharacterCodes[a].charCodeAt(0));
            text += AlphanumericCharacterCodes[a];
        }
        return { bytes: bytes, text: text };
    }
    /**
     * @function bytesToUTF8
     * @param {number[]} bytes
     * @returns {string}
     * @see https://github.com/google/closure-library/blob/master/closure/goog/crypt/crypt.js
     */
    function bytesToUTF8(bytes) {
        // TODO(user): Use native implementations if/when available
        var pos = 0;
        var output = '';
        while (pos < bytes.length) {
            var c1 = bytes[pos++];
            if (c1 < 128) {
                output += String.fromCharCode(c1);
            }
            else if (c1 > 191 && c1 < 224) {
                var c2 = bytes[pos++];
                output += String.fromCharCode(((c1 & 31) << 6) | (c2 & 63));
            }
            else if (c1 > 239 && c1 < 365) {
                // Surrogate Pair
                var c2 = bytes[pos++];
                var c3 = bytes[pos++];
                var c4 = bytes[pos++];
                var u = (((c1 & 7) << 18) | ((c2 & 63) << 12) | ((c3 & 63) << 6) | (c4 & 63)) - 0x10000;
                output += String.fromCharCode(0xd800 + (u >> 10));
                output += String.fromCharCode(0xdc00 + (u & 1023));
            }
            else {
                var c2 = bytes[pos++];
                var c3 = bytes[pos++];
                output += String.fromCharCode(((c1 & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
            }
        }
        return output;
    }
    function decodeByte(stream, size) {
        var bytes = [];
        var characterCountSize = [8, 16, 16][size];
        var length = stream.readBits(characterCountSize);
        for (var i = 0; i < length; i++) {
            bytes.push(stream.readBits(8));
        }
        return { bytes: bytes, text: bytesToUTF8(bytes) };
    }
    function decodeKanji(stream, size) {
        var text = '';
        var bytes = [];
        var characterCountSize = [8, 10, 12][size];
        var length = stream.readBits(characterCountSize);
        for (var i = 0; i < length; i++) {
            var k = stream.readBits(13);
            var c = (Math.floor(k / 0xc0) << 8) | k % 0xc0;
            if (c < 0x1f00) {
                c += 0x8140;
            }
            else {
                c += 0xc140;
            }
            bytes.push(c >> 8, c & 0xff);
            text += String.fromCharCode(UTF2SJISTable[c]);
        }
        return { bytes: bytes, text: text };
    }
    function decode$1(data, version) {
        var _a, _b, _c, _d;
        var stream = new BitStream(data);
        // There are 3 'sizes' based on the version. 1-9 is small (0), 10-26 is medium (1) and 27-40 is large (2).
        var size = version <= 9 ? 0 : version <= 26 ? 1 : 2;
        var result = { text: '', bytes: [], chunks: [] };
        while (stream.available() >= 4) {
            var mode = stream.readBits(4);
            if (mode === ModeByte.Terminator) {
                return result;
            }
            else if (mode === ModeByte.ECI) {
                if (stream.readBits(1) === 0) {
                    result.chunks.push({
                        type: Mode$2.ECI,
                        assignmentNumber: stream.readBits(7)
                    });
                }
                else if (stream.readBits(1) === 0) {
                    result.chunks.push({
                        type: Mode$2.ECI,
                        assignmentNumber: stream.readBits(14)
                    });
                }
                else if (stream.readBits(1) === 0) {
                    result.chunks.push({
                        type: Mode$2.ECI,
                        assignmentNumber: stream.readBits(21)
                    });
                }
                else {
                    // ECI data seems corrupted
                    result.chunks.push({
                        type: Mode$2.ECI,
                        assignmentNumber: -1
                    });
                }
            }
            else if (mode === ModeByte.Numeric) {
                var numericResult = decodeNumeric(stream, size);
                result.text += numericResult.text;
                (_a = result.bytes).push.apply(_a, numericResult.bytes);
                result.chunks.push({
                    type: Mode$2.Numeric,
                    text: numericResult.text
                });
            }
            else if (mode === ModeByte.Alphanumeric) {
                var alphanumericResult = decodeAlphanumeric(stream, size);
                result.text += alphanumericResult.text;
                (_b = result.bytes).push.apply(_b, alphanumericResult.bytes);
                result.chunks.push({
                    type: Mode$2.Alphanumeric,
                    text: alphanumericResult.text
                });
            }
            else if (mode === ModeByte.StructuredAppend) {
                // QR Standard section 9.2:
                // > The 4-bit patterns shall be the binary equivalents of (m - 1) and (n - 1) respectively.
                var structuredAppend = {
                    M: stream.readBits(4) + 1,
                    N: stream.readBits(4) + 1,
                    parity: stream.readBits(8)
                };
                result.chunks.push(__assign({ type: Mode$2.StructuredAppend }, structuredAppend));
            }
            else if (mode === ModeByte.Byte) {
                var byteResult = decodeByte(stream, size);
                result.text += byteResult.text;
                (_c = result.bytes).push.apply(_c, byteResult.bytes);
                result.chunks.push({
                    type: Mode$2.Byte,
                    bytes: byteResult.bytes,
                    text: byteResult.text
                });
            }
            else if (mode === ModeByte.Kanji) {
                var kanjiResult = decodeKanji(stream, size);
                result.text += kanjiResult.text;
                (_d = result.bytes).push.apply(_d, kanjiResult.bytes);
                result.chunks.push({
                    type: Mode$2.Kanji,
                    bytes: kanjiResult.bytes,
                    text: kanjiResult.text
                });
            }
        }
        // If there is no data left, or the remaining bits are all 0, then that counts as a termination marker
        if (stream.available() === 0 || stream.readBits(stream.available()) === 0) {
            return result;
        }
    }

    /**
     * @module index
     * @author nuintun
     * @author Cosmo Wolfe
     */
    function numBitsDiffering(x, y) {
        var z = x ^ y;
        var bitCount = 0;
        while (z) {
            bitCount++;
            z &= z - 1;
        }
        return bitCount;
    }
    function pushBit(bit, byte) {
        return (byte << 1) | bit;
    }
    var FORMAT_INFO_TABLE = [
        { bits: 0x5412, formatInfo: { errorCorrectionLevel: 1, dataMask: 0 } },
        { bits: 0x5125, formatInfo: { errorCorrectionLevel: 1, dataMask: 1 } },
        { bits: 0x5e7c, formatInfo: { errorCorrectionLevel: 1, dataMask: 2 } },
        { bits: 0x5b4b, formatInfo: { errorCorrectionLevel: 1, dataMask: 3 } },
        { bits: 0x45f9, formatInfo: { errorCorrectionLevel: 1, dataMask: 4 } },
        { bits: 0x40ce, formatInfo: { errorCorrectionLevel: 1, dataMask: 5 } },
        { bits: 0x4f97, formatInfo: { errorCorrectionLevel: 1, dataMask: 6 } },
        { bits: 0x4aa0, formatInfo: { errorCorrectionLevel: 1, dataMask: 7 } },
        { bits: 0x77c4, formatInfo: { errorCorrectionLevel: 0, dataMask: 0 } },
        { bits: 0x72f3, formatInfo: { errorCorrectionLevel: 0, dataMask: 1 } },
        { bits: 0x7daa, formatInfo: { errorCorrectionLevel: 0, dataMask: 2 } },
        { bits: 0x789d, formatInfo: { errorCorrectionLevel: 0, dataMask: 3 } },
        { bits: 0x662f, formatInfo: { errorCorrectionLevel: 0, dataMask: 4 } },
        { bits: 0x6318, formatInfo: { errorCorrectionLevel: 0, dataMask: 5 } },
        { bits: 0x6c41, formatInfo: { errorCorrectionLevel: 0, dataMask: 6 } },
        { bits: 0x6976, formatInfo: { errorCorrectionLevel: 0, dataMask: 7 } },
        { bits: 0x1689, formatInfo: { errorCorrectionLevel: 3, dataMask: 0 } },
        { bits: 0x13be, formatInfo: { errorCorrectionLevel: 3, dataMask: 1 } },
        { bits: 0x1ce7, formatInfo: { errorCorrectionLevel: 3, dataMask: 2 } },
        { bits: 0x19d0, formatInfo: { errorCorrectionLevel: 3, dataMask: 3 } },
        { bits: 0x0762, formatInfo: { errorCorrectionLevel: 3, dataMask: 4 } },
        { bits: 0x0255, formatInfo: { errorCorrectionLevel: 3, dataMask: 5 } },
        { bits: 0x0d0c, formatInfo: { errorCorrectionLevel: 3, dataMask: 6 } },
        { bits: 0x083b, formatInfo: { errorCorrectionLevel: 3, dataMask: 7 } },
        { bits: 0x355f, formatInfo: { errorCorrectionLevel: 2, dataMask: 0 } },
        { bits: 0x3068, formatInfo: { errorCorrectionLevel: 2, dataMask: 1 } },
        { bits: 0x3f31, formatInfo: { errorCorrectionLevel: 2, dataMask: 2 } },
        { bits: 0x3a06, formatInfo: { errorCorrectionLevel: 2, dataMask: 3 } },
        { bits: 0x24b4, formatInfo: { errorCorrectionLevel: 2, dataMask: 4 } },
        { bits: 0x2183, formatInfo: { errorCorrectionLevel: 2, dataMask: 5 } },
        { bits: 0x2eda, formatInfo: { errorCorrectionLevel: 2, dataMask: 6 } },
        { bits: 0x2bed, formatInfo: { errorCorrectionLevel: 2, dataMask: 7 } }
    ];
    var DATA_MASKS = [
        function (p) { return (p.y + p.x) % 2 === 0; },
        function (p) { return p.y % 2 === 0; },
        function (p) { return p.x % 3 === 0; },
        function (p) { return (p.y + p.x) % 3 === 0; },
        function (p) { return (Math.floor(p.y / 2) + Math.floor(p.x / 3)) % 2 === 0; },
        function (p) { return ((p.x * p.y) % 2) + ((p.x * p.y) % 3) === 0; },
        function (p) { return (((p.y * p.x) % 2) + ((p.y * p.x) % 3)) % 2 === 0; },
        function (p) { return (((p.y + p.x) % 2) + ((p.y * p.x) % 3)) % 2 === 0; }
    ];
    function buildFunctionPatternMask(version) {
        var dimension = 17 + 4 * version.versionNumber;
        var matrix = BitMatrix.createEmpty(dimension, dimension);
        matrix.setRegion(0, 0, 9, 9, true); // Top left finder pattern + separator + format
        matrix.setRegion(dimension - 8, 0, 8, 9, true); // Top right finder pattern + separator + format
        matrix.setRegion(0, dimension - 8, 9, 8, true); // Bottom left finder pattern + separator + format
        // Alignment patterns
        for (var _i = 0, _a = version.alignmentPatternCenters; _i < _a.length; _i++) {
            var x = _a[_i];
            for (var _b = 0, _c = version.alignmentPatternCenters; _b < _c.length; _b++) {
                var y = _c[_b];
                if (!((x === 6 && y === 6) || (x === 6 && y === dimension - 7) || (x === dimension - 7 && y === 6))) {
                    matrix.setRegion(x - 2, y - 2, 5, 5, true);
                }
            }
        }
        matrix.setRegion(6, 9, 1, dimension - 17, true); // Vertical timing pattern
        matrix.setRegion(9, 6, dimension - 17, 1, true); // Horizontal timing pattern
        if (version.versionNumber > 6) {
            matrix.setRegion(dimension - 11, 0, 3, 6, true); // Version info, top right
            matrix.setRegion(0, dimension - 11, 6, 3, true); // Version info, bottom left
        }
        return matrix;
    }
    function readCodewords(matrix, version, formatInfo) {
        var dimension = matrix.height;
        var dataMask = DATA_MASKS[formatInfo.dataMask];
        var functionPatternMask = buildFunctionPatternMask(version);
        var bitsRead = 0;
        var currentByte = 0;
        var codewords = [];
        // Read columns in pairs, from right to left
        var readingUp = true;
        for (var columnIndex = dimension - 1; columnIndex > 0; columnIndex -= 2) {
            if (columnIndex === 6) {
                // Skip whole column with vertical alignment pattern;
                columnIndex--;
            }
            for (var i = 0; i < dimension; i++) {
                var y = readingUp ? dimension - 1 - i : i;
                for (var columnOffset = 0; columnOffset < 2; columnOffset++) {
                    var x = columnIndex - columnOffset;
                    if (!functionPatternMask.get(x, y)) {
                        bitsRead++;
                        var bit = matrix.get(x, y);
                        if (dataMask({ y: y, x: x })) {
                            bit = !bit;
                        }
                        currentByte = pushBit(bit, currentByte);
                        if (bitsRead === 8) {
                            // Whole bytes
                            codewords.push(currentByte);
                            bitsRead = 0;
                            currentByte = 0;
                        }
                    }
                }
            }
            readingUp = !readingUp;
        }
        return codewords;
    }
    function readVersion(matrix) {
        var dimension = matrix.height;
        var provisionalVersion = Math.floor((dimension - 17) / 4);
        if (provisionalVersion <= 6) {
            // 6 and under dont have version info in the QR code
            return VERSIONS[provisionalVersion - 1];
        }
        var topRightVersionBits = 0;
        for (var y = 5; y >= 0; y--) {
            for (var x = dimension - 9; x >= dimension - 11; x--) {
                topRightVersionBits = pushBit(matrix.get(x, y), topRightVersionBits);
            }
        }
        var bottomLeftVersionBits = 0;
        for (var x = 5; x >= 0; x--) {
            for (var y = dimension - 9; y >= dimension - 11; y--) {
                bottomLeftVersionBits = pushBit(matrix.get(x, y), bottomLeftVersionBits);
            }
        }
        var bestVersion;
        var bestDifference = Infinity;
        for (var _i = 0, VERSIONS_1 = VERSIONS; _i < VERSIONS_1.length; _i++) {
            var version = VERSIONS_1[_i];
            if (version.infoBits === topRightVersionBits || version.infoBits === bottomLeftVersionBits) {
                return version;
            }
            var difference = numBitsDiffering(topRightVersionBits, version.infoBits);
            if (difference < bestDifference) {
                bestVersion = version;
                bestDifference = difference;
            }
            difference = numBitsDiffering(bottomLeftVersionBits, version.infoBits);
            if (difference < bestDifference) {
                bestVersion = version;
                bestDifference = difference;
            }
        }
        // We can tolerate up to 3 bits of error since no two version info codewords will
        // differ in less than 8 bits.
        if (bestDifference <= 3) {
            return bestVersion;
        }
    }
    function readFormatInformation(matrix) {
        var topLeftFormatInfoBits = 0;
        for (var x = 0; x <= 8; x++) {
            if (x !== 6) {
                // Skip timing pattern bit
                topLeftFormatInfoBits = pushBit(matrix.get(x, 8), topLeftFormatInfoBits);
            }
        }
        for (var y = 7; y >= 0; y--) {
            if (y !== 6) {
                // Skip timing pattern bit
                topLeftFormatInfoBits = pushBit(matrix.get(8, y), topLeftFormatInfoBits);
            }
        }
        var dimension = matrix.height;
        var topRightBottomRightFormatInfoBits = 0;
        for (var y = dimension - 1; y >= dimension - 7; y--) {
            // bottom left
            topRightBottomRightFormatInfoBits = pushBit(matrix.get(8, y), topRightBottomRightFormatInfoBits);
        }
        for (var x = dimension - 8; x < dimension; x++) {
            // top right
            topRightBottomRightFormatInfoBits = pushBit(matrix.get(x, 8), topRightBottomRightFormatInfoBits);
        }
        var bestDifference = Infinity;
        var bestFormatInfo = null;
        for (var _i = 0, FORMAT_INFO_TABLE_1 = FORMAT_INFO_TABLE; _i < FORMAT_INFO_TABLE_1.length; _i++) {
            var _a = FORMAT_INFO_TABLE_1[_i], bits = _a.bits, formatInfo = _a.formatInfo;
            if (bits === topLeftFormatInfoBits || bits === topRightBottomRightFormatInfoBits) {
                return formatInfo;
            }
            var difference = numBitsDiffering(topLeftFormatInfoBits, bits);
            if (difference < bestDifference) {
                bestFormatInfo = formatInfo;
                bestDifference = difference;
            }
            if (topLeftFormatInfoBits !== topRightBottomRightFormatInfoBits) {
                // also try the other option
                difference = numBitsDiffering(topRightBottomRightFormatInfoBits, bits);
                if (difference < bestDifference) {
                    bestFormatInfo = formatInfo;
                    bestDifference = difference;
                }
            }
        }
        // Hamming distance of the 32 masked codes is 7, by construction, so <= 3 bits differing means we found a match
        if (bestDifference <= 3) {
            return bestFormatInfo;
        }
        return null;
    }
    function getDataBlocks(codewords, version, ecLevel) {
        var dataBlocks = [];
        var ecInfo = version.errorCorrectionLevels[ecLevel];
        var totalCodewords = 0;
        ecInfo.ecBlocks.forEach(function (block) {
            for (var i = 0; i < block.numBlocks; i++) {
                dataBlocks.push({ numDataCodewords: block.dataCodewordsPerBlock, codewords: [] });
                totalCodewords += block.dataCodewordsPerBlock + ecInfo.ecCodewordsPerBlock;
            }
        });
        // In some cases the QR code will be malformed enough that we pull off more or less than we should.
        // If we pull off less there's nothing we can do.
        // If we pull off more we can safely truncate
        if (codewords.length < totalCodewords) {
            return null;
        }
        codewords = codewords.slice(0, totalCodewords);
        var shortBlockSize = ecInfo.ecBlocks[0].dataCodewordsPerBlock;
        // Pull codewords to fill the blocks up to the minimum size
        for (var i = 0; i < shortBlockSize; i++) {
            for (var _i = 0, dataBlocks_1 = dataBlocks; _i < dataBlocks_1.length; _i++) {
                var dataBlock = dataBlocks_1[_i];
                dataBlock.codewords.push(codewords.shift());
            }
        }
        // If there are any large blocks, pull codewords to fill the last element of those
        if (ecInfo.ecBlocks.length > 1) {
            var smallBlockCount = ecInfo.ecBlocks[0].numBlocks;
            var largeBlockCount = ecInfo.ecBlocks[1].numBlocks;
            for (var i = 0; i < largeBlockCount; i++) {
                dataBlocks[smallBlockCount + i].codewords.push(codewords.shift());
            }
        }
        // Add the rest of the codewords to the blocks. These are the error correction codewords.
        while (codewords.length > 0) {
            for (var _a = 0, dataBlocks_2 = dataBlocks; _a < dataBlocks_2.length; _a++) {
                var dataBlock = dataBlocks_2[_a];
                dataBlock.codewords.push(codewords.shift());
            }
        }
        return dataBlocks;
    }
    function decodeMatrix(matrix) {
        var version = readVersion(matrix);
        if (!version) {
            return null;
        }
        var formatInfo = readFormatInformation(matrix);
        if (!formatInfo) {
            return null;
        }
        var codewords = readCodewords(matrix, version, formatInfo);
        var dataBlocks = getDataBlocks(codewords, version, formatInfo.errorCorrectionLevel);
        if (!dataBlocks) {
            return null;
        }
        // Count total number of data bytes
        var totalBytes = dataBlocks.reduce(function (a, b) { return a + b.numDataCodewords; }, 0);
        var resultBytes = new Uint8ClampedArray(totalBytes);
        var resultIndex = 0;
        for (var _i = 0, dataBlocks_3 = dataBlocks; _i < dataBlocks_3.length; _i++) {
            var dataBlock = dataBlocks_3[_i];
            var correctedBytes = decode(dataBlock.codewords, dataBlock.codewords.length - dataBlock.numDataCodewords);
            if (!correctedBytes) {
                return null;
            }
            for (var i = 0; i < dataBlock.numDataCodewords; i++) {
                resultBytes[resultIndex++] = correctedBytes[i];
            }
        }
        try {
            return decode$1(resultBytes, version.versionNumber);
        }
        catch (_a) {
            return null;
        }
    }
    function decode$2(matrix) {
        if (matrix == null) {
            return null;
        }
        var result = decodeMatrix(matrix);
        if (result) {
            return result;
        }
        // Decoding didn't work, try mirroring the QR across the topLeft -> bottomRight line.
        for (var x = 0; x < matrix.width; x++) {
            for (var y = x + 1; y < matrix.height; y++) {
                if (matrix.get(x, y) !== matrix.get(y, x)) {
                    matrix.set(x, y, !matrix.get(x, y));
                    matrix.set(y, x, !matrix.get(y, x));
                }
            }
        }
        return decodeMatrix(matrix);
    }

    /**
     * @module locator
     * @author nuintun
     * @author Cosmo Wolfe
     */
    var MIN_QUAD_RATIO = 0.5;
    var MAX_QUAD_RATIO = 1.5;
    var MAX_FINDERPATTERNS_TO_SEARCH = 4;
    var distance = function (a, b) { return Math.sqrt(Math.pow((b.x - a.x), 2) + Math.pow((b.y - a.y), 2)); };
    function sum(values) {
        return values.reduce(function (a, b) { return a + b; });
    }
    // Takes three finder patterns and organizes them into topLeft, topRight, etc
    function reorderFinderPatterns(pattern1, pattern2, pattern3) {
        var _a, _b, _c, _d;
        // Find distances between pattern centers
        var oneTwoDistance = distance(pattern1, pattern2);
        var twoThreeDistance = distance(pattern2, pattern3);
        var oneThreeDistance = distance(pattern1, pattern3);
        var bottomLeft;
        var topLeft;
        var topRight;
        // Assume one closest to other two is B; A and C will just be guesses at first
        if (twoThreeDistance >= oneTwoDistance && twoThreeDistance >= oneThreeDistance) {
            _a = [pattern2, pattern1, pattern3], bottomLeft = _a[0], topLeft = _a[1], topRight = _a[2];
        }
        else if (oneThreeDistance >= twoThreeDistance && oneThreeDistance >= oneTwoDistance) {
            _b = [pattern1, pattern2, pattern3], bottomLeft = _b[0], topLeft = _b[1], topRight = _b[2];
        }
        else {
            _c = [pattern1, pattern3, pattern2], bottomLeft = _c[0], topLeft = _c[1], topRight = _c[2];
        }
        // Use cross product to figure out whether bottomLeft (A) and topRight (C) are correct or flipped in relation to topLeft (B)
        // This asks whether BC x BA has a positive z component, which is the arrangement we want. If it's negative, then
        // we've got it flipped around and should swap topRight and bottomLeft.
        if ((topRight.x - topLeft.x) * (bottomLeft.y - topLeft.y) - (topRight.y - topLeft.y) * (bottomLeft.x - topLeft.x) < 0) {
            _d = [topRight, bottomLeft], bottomLeft = _d[0], topRight = _d[1];
        }
        return { bottomLeft: bottomLeft, topLeft: topLeft, topRight: topRight };
    }
    // Computes the dimension (number of modules on a side) of the QR Code based on the position of the finder patterns
    function computeDimension(topLeft, topRight, bottomLeft, matrix) {
        var moduleSize = (sum(countBlackWhiteRun(topLeft, bottomLeft, matrix, 5)) / 7 + // Divide by 7 since the ratio is 1:1:3:1:1
            sum(countBlackWhiteRun(topLeft, topRight, matrix, 5)) / 7 +
            sum(countBlackWhiteRun(bottomLeft, topLeft, matrix, 5)) / 7 +
            sum(countBlackWhiteRun(topRight, topLeft, matrix, 5)) / 7) /
            4;
        if (moduleSize < 1) {
            throw 'invalid module size';
        }
        var topDimension = Math.round(distance(topLeft, topRight) / moduleSize);
        var sideDimension = Math.round(distance(topLeft, bottomLeft) / moduleSize);
        var dimension = Math.floor((topDimension + sideDimension) / 2) + 7;
        switch (dimension % 4) {
            case 0:
                dimension++;
                break;
            case 2:
                dimension--;
                break;
        }
        return { dimension: dimension, moduleSize: moduleSize };
    }
    // Takes an origin point and an end point and counts the sizes of the black white run from the origin towards the end point.
    // Returns an array of elements, representing the pixel size of the black white run.
    // Uses a variant of http://en.wikipedia.org/wiki/Bresenham's_line_algorithm
    function countBlackWhiteRunTowardsPoint(origin, end, matrix, length) {
        var switchPoints = [{ x: Math.floor(origin.x), y: Math.floor(origin.y) }];
        var steep = Math.abs(end.y - origin.y) > Math.abs(end.x - origin.x);
        var fromX;
        var fromY;
        var toX;
        var toY;
        if (steep) {
            fromX = Math.floor(origin.y);
            fromY = Math.floor(origin.x);
            toX = Math.floor(end.y);
            toY = Math.floor(end.x);
        }
        else {
            fromX = Math.floor(origin.x);
            fromY = Math.floor(origin.y);
            toX = Math.floor(end.x);
            toY = Math.floor(end.y);
        }
        var dx = Math.abs(toX - fromX);
        var dy = Math.abs(toY - fromY);
        var error = Math.floor(-dx / 2);
        var xStep = fromX < toX ? 1 : -1;
        var yStep = fromY < toY ? 1 : -1;
        var currentPixel = true;
        // Loop up until x == toX, but not beyond
        for (var x = fromX, y = fromY; x !== toX + xStep; x += xStep) {
            // Does current pixel mean we have moved white to black or vice versa?
            // Scanning black in state 0,2 and white in state 1, so if we find the wrong
            // color, advance to next state or end if we are in state 2 already
            var realX = steep ? y : x;
            var realY = steep ? x : y;
            if (matrix.get(realX, realY) !== currentPixel) {
                currentPixel = !currentPixel;
                switchPoints.push({ x: realX, y: realY });
                if (switchPoints.length === length + 1) {
                    break;
                }
            }
            error += dy;
            if (error > 0) {
                if (y === toY) {
                    break;
                }
                y += yStep;
                error -= dx;
            }
        }
        var distances = [];
        for (var i = 0; i < length; i++) {
            if (switchPoints[i] && switchPoints[i + 1]) {
                distances.push(distance(switchPoints[i], switchPoints[i + 1]));
            }
            else {
                distances.push(0);
            }
        }
        return distances;
    }
    // Takes an origin point and an end point and counts the sizes of the black white run in the origin point
    // along the line that intersects with the end point. Returns an array of elements, representing the pixel sizes
    // of the black white run. Takes a length which represents the number of switches from black to white to look for.
    function countBlackWhiteRun(origin, end, matrix, length) {
        var _a;
        var rise = end.y - origin.y;
        var run = end.x - origin.x;
        var towardsEnd = countBlackWhiteRunTowardsPoint(origin, end, matrix, Math.ceil(length / 2));
        var awayFromEnd = countBlackWhiteRunTowardsPoint(origin, { x: origin.x - run, y: origin.y - rise }, matrix, Math.ceil(length / 2));
        var middleValue = towardsEnd.shift() + awayFromEnd.shift() - 1; // Substract one so we don't double count a pixel
        return (_a = awayFromEnd.concat(middleValue)).concat.apply(_a, towardsEnd);
    }
    // Takes in a black white run and an array of expected ratios. Returns the average size of the run as well as the "error" -
    // that is the amount the run diverges from the expected ratio
    function scoreBlackWhiteRun(sequence, ratios) {
        var averageSize = sum(sequence) / sum(ratios);
        var error = 0;
        ratios.forEach(function (ratio, i) {
            error += Math.pow((sequence[i] - ratio * averageSize), 2);
        });
        return { averageSize: averageSize, error: error };
    }
    // Takes an X,Y point and an array of sizes and scores the point against those ratios.
    // For example for a finder pattern takes the ratio list of 1:1:3:1:1 and checks horizontal, vertical and diagonal ratios
    // against that.
    function scorePattern(point, ratios, matrix) {
        try {
            var horizontalRun = countBlackWhiteRun(point, { x: -1, y: point.y }, matrix, ratios.length);
            var verticalRun = countBlackWhiteRun(point, { x: point.x, y: -1 }, matrix, ratios.length);
            var topLeftPoint = {
                x: Math.max(0, point.x - point.y) - 1,
                y: Math.max(0, point.y - point.x) - 1
            };
            var topLeftBottomRightRun = countBlackWhiteRun(point, topLeftPoint, matrix, ratios.length);
            var bottomLeftPoint = {
                x: Math.min(matrix.width, point.x + point.y) + 1,
                y: Math.min(matrix.height, point.y + point.x) + 1
            };
            var bottomLeftTopRightRun = countBlackWhiteRun(point, bottomLeftPoint, matrix, ratios.length);
            var horzError = scoreBlackWhiteRun(horizontalRun, ratios);
            var vertError = scoreBlackWhiteRun(verticalRun, ratios);
            var diagDownError = scoreBlackWhiteRun(topLeftBottomRightRun, ratios);
            var diagUpError = scoreBlackWhiteRun(bottomLeftTopRightRun, ratios);
            var ratioError = Math.sqrt(horzError.error * horzError.error +
                vertError.error * vertError.error +
                diagDownError.error * diagDownError.error +
                diagUpError.error * diagUpError.error);
            var avgSize = (horzError.averageSize + vertError.averageSize + diagDownError.averageSize + diagUpError.averageSize) / 4;
            var sizeError = (Math.pow((horzError.averageSize - avgSize), 2) +
                Math.pow((vertError.averageSize - avgSize), 2) +
                Math.pow((diagDownError.averageSize - avgSize), 2) +
                Math.pow((diagUpError.averageSize - avgSize), 2)) /
                avgSize;
            return ratioError + sizeError;
        }
        catch (_a) {
            return Infinity;
        }
    }
    function locate(matrix) {
        var _a;
        var finderPatternQuads = [];
        var activeFinderPatternQuads = [];
        var alignmentPatternQuads = [];
        var activeAlignmentPatternQuads = [];
        var _loop_1 = function (y) {
            var length_1 = 0;
            var lastBit = false;
            var scans = [0, 0, 0, 0, 0];
            var _loop_2 = function (x) {
                var v = matrix.get(x, y);
                if (v === lastBit) {
                    length_1++;
                }
                else {
                    scans = [scans[1], scans[2], scans[3], scans[4], length_1];
                    length_1 = 1;
                    lastBit = v;
                    // Do the last 5 color changes ~ match the expected ratio for a finder pattern? 1:1:3:1:1 of b:w:b:w:b
                    var averageFinderPatternBlocksize = sum(scans) / 7;
                    var validFinderPattern = Math.abs(scans[0] - averageFinderPatternBlocksize) < averageFinderPatternBlocksize &&
                        Math.abs(scans[1] - averageFinderPatternBlocksize) < averageFinderPatternBlocksize &&
                        Math.abs(scans[2] - 3 * averageFinderPatternBlocksize) < 3 * averageFinderPatternBlocksize &&
                        Math.abs(scans[3] - averageFinderPatternBlocksize) < averageFinderPatternBlocksize &&
                        Math.abs(scans[4] - averageFinderPatternBlocksize) < averageFinderPatternBlocksize &&
                        !v; // And make sure the current pixel is white since finder patterns are bordered in white
                    // Do the last 3 color changes ~ match the expected ratio for an alignment pattern? 1:1:1 of w:b:w
                    var averageAlignmentPatternBlocksize = sum(scans.slice(-3)) / 3;
                    var validAlignmentPattern = Math.abs(scans[2] - averageAlignmentPatternBlocksize) < averageAlignmentPatternBlocksize &&
                        Math.abs(scans[3] - averageAlignmentPatternBlocksize) < averageAlignmentPatternBlocksize &&
                        Math.abs(scans[4] - averageAlignmentPatternBlocksize) < averageAlignmentPatternBlocksize &&
                        v; // Is the current pixel black since alignment patterns are bordered in black
                    if (validFinderPattern) {
                        // Compute the start and end x values of the large center black square
                        var endX_1 = x - scans[3] - scans[4];
                        var startX_1 = endX_1 - scans[2];
                        var line = { startX: startX_1, endX: endX_1, y: y };
                        // Is there a quad directly above the current spot? If so, extend it with the new line. Otherwise, create a new quad with
                        // that line as the starting point.
                        var matchingQuads = activeFinderPatternQuads.filter(function (q) {
                            return (startX_1 >= q.bottom.startX && startX_1 <= q.bottom.endX) ||
                                (endX_1 >= q.bottom.startX && startX_1 <= q.bottom.endX) ||
                                (startX_1 <= q.bottom.startX &&
                                    endX_1 >= q.bottom.endX &&
                                    (scans[2] / (q.bottom.endX - q.bottom.startX) < MAX_QUAD_RATIO &&
                                        scans[2] / (q.bottom.endX - q.bottom.startX) > MIN_QUAD_RATIO));
                        });
                        if (matchingQuads.length > 0) {
                            matchingQuads[0].bottom = line;
                        }
                        else {
                            activeFinderPatternQuads.push({ top: line, bottom: line });
                        }
                    }
                    if (validAlignmentPattern) {
                        // Compute the start and end x values of the center black square
                        var endX_2 = x - scans[4];
                        var startX_2 = endX_2 - scans[3];
                        var line = { startX: startX_2, y: y, endX: endX_2 };
                        // Is there a quad directly above the current spot? If so, extend it with the new line. Otherwise, create a new quad with
                        // that line as the starting point.
                        var matchingQuads = activeAlignmentPatternQuads.filter(function (q) {
                            return (startX_2 >= q.bottom.startX && startX_2 <= q.bottom.endX) ||
                                (endX_2 >= q.bottom.startX && startX_2 <= q.bottom.endX) ||
                                (startX_2 <= q.bottom.startX &&
                                    endX_2 >= q.bottom.endX &&
                                    (scans[2] / (q.bottom.endX - q.bottom.startX) < MAX_QUAD_RATIO &&
                                        scans[2] / (q.bottom.endX - q.bottom.startX) > MIN_QUAD_RATIO));
                        });
                        if (matchingQuads.length > 0) {
                            matchingQuads[0].bottom = line;
                        }
                        else {
                            activeAlignmentPatternQuads.push({ top: line, bottom: line });
                        }
                    }
                }
            };
            for (var x = -1; x <= matrix.width; x++) {
                _loop_2(x);
            }
            finderPatternQuads.push.apply(finderPatternQuads, activeFinderPatternQuads.filter(function (q) { return q.bottom.y !== y && q.bottom.y - q.top.y >= 2; }));
            activeFinderPatternQuads = activeFinderPatternQuads.filter(function (q) { return q.bottom.y === y; });
            alignmentPatternQuads.push.apply(alignmentPatternQuads, activeAlignmentPatternQuads.filter(function (q) { return q.bottom.y !== y; }));
            activeAlignmentPatternQuads = activeAlignmentPatternQuads.filter(function (q) { return q.bottom.y === y; });
        };
        for (var y = 0; y <= matrix.height; y++) {
            _loop_1(y);
        }
        finderPatternQuads.push.apply(finderPatternQuads, activeFinderPatternQuads.filter(function (q) { return q.bottom.y - q.top.y >= 2; }));
        alignmentPatternQuads.push.apply(alignmentPatternQuads, activeAlignmentPatternQuads);
        var finderPatternGroups = finderPatternQuads
            .filter(function (q) { return q.bottom.y - q.top.y >= 2; }) // All quads must be at least 2px tall since the center square is larger than a block
            .map(function (q) {
            // Initial scoring of finder pattern quads by looking at their ratios, not taking into account position
            var x = (q.top.startX + q.top.endX + q.bottom.startX + q.bottom.endX) / 4;
            var y = (q.top.y + q.bottom.y + 1) / 2;
            if (!matrix.get(Math.round(x), Math.round(y))) {
                return;
            }
            var lengths = [q.top.endX - q.top.startX, q.bottom.endX - q.bottom.startX, q.bottom.y - q.top.y + 1];
            var size = sum(lengths) / lengths.length;
            var score = scorePattern({ x: Math.round(x), y: Math.round(y) }, [1, 1, 3, 1, 1], matrix);
            return { score: score, x: x, y: y, size: size };
        })
            .filter(function (q) { return !!q; }) // Filter out any rejected quads from above
            .sort(function (a, b) { return a.score - b.score; })
            // Now take the top finder pattern options and try to find 2 other options with a similar size.
            .map(function (point, i, finderPatterns) {
            if (i > MAX_FINDERPATTERNS_TO_SEARCH) {
                return null;
            }
            var otherPoints = finderPatterns
                .filter(function (p, ii) { return i !== ii; })
                .map(function (p) { return ({ x: p.x, y: p.y, score: p.score + Math.pow((p.size - point.size), 2) / point.size, size: p.size }); })
                .sort(function (a, b) { return a.score - b.score; });
            if (otherPoints.length < 2) {
                return null;
            }
            var score = point.score + otherPoints[0].score + otherPoints[1].score;
            return { points: [point].concat(otherPoints.slice(0, 2)), score: score };
        })
            .filter(function (q) { return !!q; }) // Filter out any rejected finder patterns from above
            .sort(function (a, b) { return a.score - b.score; });
        if (finderPatternGroups.length === 0) {
            return null;
        }
        var _b = reorderFinderPatterns(finderPatternGroups[0].points[0], finderPatternGroups[0].points[1], finderPatternGroups[0].points[2]), topRight = _b.topRight, topLeft = _b.topLeft, bottomLeft = _b.bottomLeft;
        // Now that we've found the three finder patterns we can determine the blockSize and the size of the QR code.
        // We'll use these to help find the alignment pattern but also later when we do the extraction.
        var dimension;
        var moduleSize;
        try {
            (_a = computeDimension(topLeft, topRight, bottomLeft, matrix), dimension = _a.dimension, moduleSize = _a.moduleSize);
        }
        catch (e) {
            return null;
        }
        // Now find the alignment pattern
        var bottomRightFinderPattern = {
            // Best guess at where a bottomRight finder pattern would be
            x: topRight.x - topLeft.x + bottomLeft.x,
            y: topRight.y - topLeft.y + bottomLeft.y
        };
        var modulesBetweenFinderPatterns = (distance(topLeft, bottomLeft) + distance(topLeft, topRight)) / 2 / moduleSize;
        var correctionToTopLeft = 1 - 3 / modulesBetweenFinderPatterns;
        var expectedAlignmentPattern = {
            x: topLeft.x + correctionToTopLeft * (bottomRightFinderPattern.x - topLeft.x),
            y: topLeft.y + correctionToTopLeft * (bottomRightFinderPattern.y - topLeft.y)
        };
        var alignmentPatterns = alignmentPatternQuads
            .map(function (q) {
            var x = (q.top.startX + q.top.endX + q.bottom.startX + q.bottom.endX) / 4;
            var y = (q.top.y + q.bottom.y + 1) / 2;
            if (!matrix.get(Math.floor(x), Math.floor(y))) {
                return;
            }
            // const lengths = [q.top.endX - q.top.startX, q.bottom.endX - q.bottom.startX, q.bottom.y - q.top.y + 1];
            // const size = sum(lengths) / lengths.length;
            var sizeScore = scorePattern({ x: Math.floor(x), y: Math.floor(y) }, [1, 1, 1], matrix);
            var score = sizeScore + distance({ x: x, y: y }, expectedAlignmentPattern);
            return { x: x, y: y, score: score };
        })
            .filter(function (v) { return !!v; })
            .sort(function (a, b) { return a.score - b.score; });
        // If there are less than 15 modules between finder patterns it's a version 1 QR code and as such has no alignmemnt pattern
        // so we can only use our best guess.
        var alignmentPattern = modulesBetweenFinderPatterns >= 15 && alignmentPatterns.length ? alignmentPatterns[0] : expectedAlignmentPattern;
        return {
            alignmentPattern: { x: alignmentPattern.x, y: alignmentPattern.y },
            bottomLeft: { x: bottomLeft.x, y: bottomLeft.y },
            dimension: dimension,
            topLeft: { x: topLeft.x, y: topLeft.y },
            topRight: { x: topRight.x, y: topRight.y }
        };
    }

    /**
     * @module extractor
     * @author nuintun
     * @author Cosmo Wolfe
     */
    function squareToQuadrilateral(p1, p2, p3, p4) {
        var dx3 = p1.x - p2.x + p3.x - p4.x;
        var dy3 = p1.y - p2.y + p3.y - p4.y;
        if (dx3 === 0 && dy3 === 0) {
            // Affine
            return {
                a11: p2.x - p1.x,
                a12: p2.y - p1.y,
                a13: 0,
                a21: p3.x - p2.x,
                a22: p3.y - p2.y,
                a23: 0,
                a31: p1.x,
                a32: p1.y,
                a33: 1
            };
        }
        else {
            var dx1 = p2.x - p3.x;
            var dx2 = p4.x - p3.x;
            var dy1 = p2.y - p3.y;
            var dy2 = p4.y - p3.y;
            var denominator = dx1 * dy2 - dx2 * dy1;
            var a13 = (dx3 * dy2 - dx2 * dy3) / denominator;
            var a23 = (dx1 * dy3 - dx3 * dy1) / denominator;
            return {
                a11: p2.x - p1.x + a13 * p2.x,
                a12: p2.y - p1.y + a13 * p2.y,
                a13: a13,
                a21: p4.x - p1.x + a23 * p4.x,
                a22: p4.y - p1.y + a23 * p4.y,
                a23: a23,
                a31: p1.x,
                a32: p1.y,
                a33: 1
            };
        }
    }
    function quadrilateralToSquare(p1, p2, p3, p4) {
        // Here, the adjoint serves as the inverse:
        var sToQ = squareToQuadrilateral(p1, p2, p3, p4);
        return {
            a11: sToQ.a22 * sToQ.a33 - sToQ.a23 * sToQ.a32,
            a12: sToQ.a13 * sToQ.a32 - sToQ.a12 * sToQ.a33,
            a13: sToQ.a12 * sToQ.a23 - sToQ.a13 * sToQ.a22,
            a21: sToQ.a23 * sToQ.a31 - sToQ.a21 * sToQ.a33,
            a22: sToQ.a11 * sToQ.a33 - sToQ.a13 * sToQ.a31,
            a23: sToQ.a13 * sToQ.a21 - sToQ.a11 * sToQ.a23,
            a31: sToQ.a21 * sToQ.a32 - sToQ.a22 * sToQ.a31,
            a32: sToQ.a12 * sToQ.a31 - sToQ.a11 * sToQ.a32,
            a33: sToQ.a11 * sToQ.a22 - sToQ.a12 * sToQ.a21
        };
    }
    function times(a, b) {
        return {
            a11: a.a11 * b.a11 + a.a21 * b.a12 + a.a31 * b.a13,
            a12: a.a12 * b.a11 + a.a22 * b.a12 + a.a32 * b.a13,
            a13: a.a13 * b.a11 + a.a23 * b.a12 + a.a33 * b.a13,
            a21: a.a11 * b.a21 + a.a21 * b.a22 + a.a31 * b.a23,
            a22: a.a12 * b.a21 + a.a22 * b.a22 + a.a32 * b.a23,
            a23: a.a13 * b.a21 + a.a23 * b.a22 + a.a33 * b.a23,
            a31: a.a11 * b.a31 + a.a21 * b.a32 + a.a31 * b.a33,
            a32: a.a12 * b.a31 + a.a22 * b.a32 + a.a32 * b.a33,
            a33: a.a13 * b.a31 + a.a23 * b.a32 + a.a33 * b.a33
        };
    }
    function extract(image, location) {
        var qToS = quadrilateralToSquare({ x: 3.5, y: 3.5 }, { x: location.dimension - 3.5, y: 3.5 }, { x: location.dimension - 6.5, y: location.dimension - 6.5 }, { x: 3.5, y: location.dimension - 3.5 });
        var sToQ = squareToQuadrilateral(location.topLeft, location.topRight, location.alignmentPattern, location.bottomLeft);
        var transform = times(sToQ, qToS);
        var matrix = BitMatrix.createEmpty(location.dimension, location.dimension);
        var mappingFunction = function (x, y) {
            var denominator = transform.a13 * x + transform.a23 * y + transform.a33;
            return {
                x: (transform.a11 * x + transform.a21 * y + transform.a31) / denominator,
                y: (transform.a12 * x + transform.a22 * y + transform.a32) / denominator
            };
        };
        for (var y = 0; y < location.dimension; y++) {
            for (var x = 0; x < location.dimension; x++) {
                var xValue = x + 0.5;
                var yValue = y + 0.5;
                var sourcePixel = mappingFunction(xValue, yValue);
                matrix.set(x, y, image.get(Math.floor(sourcePixel.x), Math.floor(sourcePixel.y)));
            }
        }
        return {
            matrix: matrix,
            mappingFunction: mappingFunction
        };
    }

    /**
     * @module binarizer
     * @author nuintun
     * @author Cosmo Wolfe
     */
    var REGION_SIZE = 8;
    var MIN_DYNAMIC_RANGE = 24;
    function numBetween(value, min, max) {
        return value < min ? min : value > max ? max : value;
    }
    // Like BitMatrix but accepts arbitry Uint8 values
    var Matrix = /** @class */ (function () {
        function Matrix(width, height) {
            this.width = width;
            this.data = new Uint8ClampedArray(width * height);
        }
        Matrix.prototype.get = function (x, y) {
            return this.data[y * this.width + x];
        };
        Matrix.prototype.set = function (x, y, value) {
            this.data[y * this.width + x] = value;
        };
        return Matrix;
    }());
    function binarize(data, width, height, returnInverted) {
        if (data.length !== width * height * 4) {
            throw 'malformed data passed to binarizer';
        }
        // Convert image to greyscale
        var greyscalePixels = new Matrix(width, height);
        for (var x = 0; x < width; x++) {
            for (var y = 0; y < height; y++) {
                var r = data[(y * width + x) * 4 + 0];
                var g = data[(y * width + x) * 4 + 1];
                var b = data[(y * width + x) * 4 + 2];
                greyscalePixels.set(x, y, 0.2126 * r + 0.7152 * g + 0.0722 * b);
            }
        }
        var horizontalRegionCount = Math.ceil(width / REGION_SIZE);
        var verticalRegionCount = Math.ceil(height / REGION_SIZE);
        var blackPoints = new Matrix(horizontalRegionCount, verticalRegionCount);
        for (var verticalRegion = 0; verticalRegion < verticalRegionCount; verticalRegion++) {
            for (var hortizontalRegion = 0; hortizontalRegion < horizontalRegionCount; hortizontalRegion++) {
                var sum = 0;
                var min = Infinity;
                var max = 0;
                for (var y = 0; y < REGION_SIZE; y++) {
                    for (var x = 0; x < REGION_SIZE; x++) {
                        var pixelLumosity = greyscalePixels.get(hortizontalRegion * REGION_SIZE + x, verticalRegion * REGION_SIZE + y);
                        sum += pixelLumosity;
                        min = Math.min(min, pixelLumosity);
                        max = Math.max(max, pixelLumosity);
                    }
                }
                var average = sum / Math.pow(REGION_SIZE, 2);
                if (max - min <= MIN_DYNAMIC_RANGE) {
                    // If variation within the block is low, assume this is a block with only light or only
                    // dark pixels. In that case we do not want to use the average, as it would divide this
                    // low contrast area into black and white pixels, essentially creating data out of noise.
                    //
                    // Default the blackpoint for these blocks to be half the min - effectively white them out
                    average = min / 2;
                    if (verticalRegion > 0 && hortizontalRegion > 0) {
                        // Correct the "white background" assumption for blocks that have neighbors by comparing
                        // the pixels in this block to the previously calculated black points. This is based on
                        // the fact that dark barcode symbology is always surrounded by some amount of light
                        // background for which reasonable black point estimates were made. The bp estimated at
                        // the boundaries is used for the interior.
                        // The (min < bp) is arbitrary but works better than other heuristics that were tried.
                        var averageNeighborBlackPoint = (blackPoints.get(hortizontalRegion, verticalRegion - 1) +
                            2 * blackPoints.get(hortizontalRegion - 1, verticalRegion) +
                            blackPoints.get(hortizontalRegion - 1, verticalRegion - 1)) /
                            4;
                        if (min < averageNeighborBlackPoint) {
                            average = averageNeighborBlackPoint;
                        }
                    }
                }
                blackPoints.set(hortizontalRegion, verticalRegion, average);
            }
        }
        var inverted = null;
        var binarized = BitMatrix.createEmpty(width, height);
        if (returnInverted) {
            inverted = BitMatrix.createEmpty(width, height);
        }
        for (var verticalRegion = 0; verticalRegion < verticalRegionCount; verticalRegion++) {
            for (var hortizontalRegion = 0; hortizontalRegion < horizontalRegionCount; hortizontalRegion++) {
                var left = numBetween(hortizontalRegion, 2, horizontalRegionCount - 3);
                var top_1 = numBetween(verticalRegion, 2, verticalRegionCount - 3);
                var sum = 0;
                for (var xRegion = -2; xRegion <= 2; xRegion++) {
                    for (var yRegion = -2; yRegion <= 2; yRegion++) {
                        sum += blackPoints.get(left + xRegion, top_1 + yRegion);
                    }
                }
                var threshold = sum / 25;
                for (var xRegion = 0; xRegion < REGION_SIZE; xRegion++) {
                    for (var yRegion = 0; yRegion < REGION_SIZE; yRegion++) {
                        var x = hortizontalRegion * REGION_SIZE + xRegion;
                        var y = verticalRegion * REGION_SIZE + yRegion;
                        var lum = greyscalePixels.get(x, y);
                        binarized.set(x, y, lum <= threshold);
                        if (returnInverted) {
                            inverted.set(x, y, !(lum <= threshold));
                        }
                    }
                }
            }
        }
        if (returnInverted) {
            return { binarized: binarized, inverted: inverted };
        }
        return { binarized: binarized };
    }

    /**
     * @module QRCode
     * @author nuintun
     * @author Cosmo Wolfe
     */
    function scan(matrix) {
        var location = locate(matrix);
        if (!location) {
            return null;
        }
        var extracted = extract(matrix, location);
        var decoded = decode$2(extracted.matrix);
        if (!decoded) {
            return null;
        }
        return {
            data: decoded.text,
            binary: decoded.bytes,
            chunks: decoded.chunks,
            location: {
                topLeftFinderPattern: location.topLeft,
                topRightFinderPattern: location.topRight,
                bottomLeftFinderPattern: location.bottomLeft,
                bottomRightAlignmentPattern: location.alignmentPattern,
                topLeftCorner: extracted.mappingFunction(0, 0),
                topRightCorner: extracted.mappingFunction(location.dimension, 0),
                bottomLeftCorner: extracted.mappingFunction(0, location.dimension),
                bottomRightCorner: extracted.mappingFunction(location.dimension, location.dimension)
            }
        };
    }
    var defaultOptions = {
        inversionAttempts: 'attemptBoth'
    };
    function disposeImageEvents(image) {
        image.onload = null;
        image.onerror = null;
    }
    var QRCode$1 = /** @class */ (function () {
        function QRCode() {
            this.options = defaultOptions;
        }
        /**
         * @public
         * @method setOptions
         * @param {object} options
         */
        QRCode.prototype.setOptions = function (options) {
            if (options === void 0) { options = {}; }
            options = options || {};
            Object.keys(defaultOptions).forEach(function (key) {
                // Sad implementation of Object.assign since we target es5 not es6
                options[key] = key in options ? options[key] : defaultOptions[key];
            });
            this.options = options;
        };
        /**
         * @public
         * @method decode
         * @param {Uint8ClampedArray} data
         * @param {number} width
         * @param {number} height
         * @returns {DecoderResult}
         */
        QRCode.prototype.decode = function (data, width, height) {
            var options = this.options;
            var shouldInvert = options.inversionAttempts === 'attemptBoth' || options.inversionAttempts === 'invertFirst';
            var tryInvertedFirst = options.inversionAttempts === 'onlyInvert' || options.inversionAttempts === 'invertFirst';
            var _a = binarize(data, width, height, shouldInvert), binarized = _a.binarized, inverted = _a.inverted;
            var result = scan(tryInvertedFirst ? inverted : binarized);
            if (!result && (options.inversionAttempts === 'attemptBoth' || options.inversionAttempts === 'invertFirst')) {
                result = scan(tryInvertedFirst ? binarized : inverted);
            }
            return result;
        };
        /**
         * @public
         * @method scan
         * @param {string} src
         * @returns {Promise}
         */
        QRCode.prototype.scan = function (src) {
            var _this = this;
            return new Promise(function (resolve, reject) {
                var image = new Image();
                // image cross origin
                image.crossOrigin = 'anonymous';
                image.onload = function () {
                    disposeImageEvents(image);
                    var width = image.width;
                    var height = image.height;
                    var canvas = document.createElement('canvas');
                    var context = canvas.getContext('2d');
                    canvas.width = width;
                    canvas.height = height;
                    context.drawImage(image, 0, 0);
                    var data = context.getImageData(0, 0, width, height).data;
                    var result = _this.decode(data, width, height);
                    if (result) {
                        return resolve(result);
                    }
                    return reject('failed to decode image');
                };
                image.onerror = function () {
                    disposeImageEvents(image);
                    reject("failed to load image: " + src);
                };
                image.src = src;
            });
        };
        return QRCode;
    }());

    /**
     * @module QRKanji
     * @author nuintun
     * @author Kazuhiko Arase
     * @description SJIS only
     */
    function createCharError(index, data) {
        return "illegal char: " + String.fromCharCode(data[index]);
    }
    var QRKanji = /** @class */ (function (_super) {
        __extends(QRKanji, _super);
        /**
         * @constructor
         * @param {string} data
         */
        function QRKanji(data) {
            return _super.call(this, Mode$1.Kanji, data) || this;
        }
        /**
         * @public
         * @method write
         * @param {BitBuffer} buffer
         */
        QRKanji.prototype.write = function (buffer) {
            var index = 0;
            var data = SJIS(this.getData());
            var length = data.length;
            while (index + 1 < length) {
                var code = ((0xff & data[index]) << 8) | (0xff & data[index + 1]);
                if (0x8140 <= code && code <= 0x9ffc) {
                    code -= 0x8140;
                }
                else if (0xe040 <= code && code <= 0xebbf) {
                    code -= 0xc140;
                }
                else {
                    throw createCharError(index, data);
                }
                code = ((code >>> 8) & 0xff) * 0xc0 + (code & 0xff);
                buffer.put(code, 13);
                index += 2;
            }
            if (index < data.length) {
                throw createCharError(index, data);
            }
        };
        /**
         * @public
         * @method getLength
         * @returns {number}
         */
        QRKanji.prototype.getLength = function () {
            return SJIS(this.getData()).length / 2;
        };
        return QRKanji;
    }(QRData));

    /**
     * @module QRNumeric
     * @author nuintun
     * @author Kazuhiko Arase
     */
    var QRNumeric = /** @class */ (function (_super) {
        __extends(QRNumeric, _super);
        /**
         * @constructor
         * @param {string} data
         */
        function QRNumeric(data) {
            return _super.call(this, Mode$1.Numeric, data) || this;
        }
        /**
         * @public
         * @method write
         * @param {BitBuffer} buffer
         */
        QRNumeric.prototype.write = function (buffer) {
            var i = 0;
            var data = this.getData();
            var length = data.length;
            while (i + 2 < length) {
                buffer.put(QRNumeric.strToNum(data.substring(i, i + 3)), 10);
                i += 3;
            }
            if (i < length) {
                if (length - i === 1) {
                    buffer.put(QRNumeric.strToNum(data.substring(i, i + 1)), 4);
                }
                else if (length - i === 2) {
                    buffer.put(QRNumeric.strToNum(data.substring(i, i + 2)), 7);
                }
            }
        };
        /**
         * @public
         * @method getLength
         * @returns {number}
         */
        QRNumeric.prototype.getLength = function () {
            return this.getData().length;
        };
        QRNumeric.strToNum = function (str) {
            var num = 0;
            var length = str.length;
            for (var i = 0; i < length; i++) {
                num = num * 10 + QRNumeric.charToNum(str.charAt(i));
            }
            return num;
        };
        QRNumeric.charToNum = function (ch) {
            if ('0' <= ch && ch <= '9') {
                // 0
                return ch.charCodeAt(0) - 0x30;
            }
            throw "illegal char: " + ch;
        };
        return QRNumeric;
    }(QRData));

    /**
     * @module QRAlphanumeric
     * @author nuintun
     * @author Kazuhiko Arase
     */
    var QRAlphanumeric = /** @class */ (function (_super) {
        __extends(QRAlphanumeric, _super);
        /**
         * @constructor
         * @param {string} data
         */
        function QRAlphanumeric(data) {
            return _super.call(this, Mode$1.Alphanumeric, data) || this;
        }
        /**
         * @public
         * @method write
         * @param {BitBuffer} buffer
         */
        QRAlphanumeric.prototype.write = function (buffer) {
            var i = 0;
            var data = this.getData();
            var length = data.length;
            while (i + 1 < length) {
                buffer.put(QRAlphanumeric.getCode(data.charAt(i)) * 45 + QRAlphanumeric.getCode(data.charAt(i + 1)), 11);
                i += 2;
            }
            if (i < data.length) {
                buffer.put(QRAlphanumeric.getCode(data.charAt(i)), 6);
            }
        };
        /**
         * @public
         * @method getLength
         * @returns {number}
         */
        QRAlphanumeric.prototype.getLength = function () {
            return this.getData().length;
        };
        QRAlphanumeric.getCode = function (ch) {
            if ('0' <= ch && ch <= '9') {
                // 0
                return ch.charCodeAt(0) - 0x30;
            }
            else if ('A' <= ch && ch <= 'Z') {
                // A
                return ch.charCodeAt(0) - 0x41 + 10;
            }
            else {
                switch (ch) {
                    case ' ':
                        return 36;
                    case '$':
                        return 37;
                    case '%':
                        return 38;
                    case '*':
                        return 39;
                    case '+':
                        return 40;
                    case '-':
                        return 41;
                    case '.':
                        return 42;
                    case '/':
                        return 43;
                    case ':':
                        return 44;
                    default:
                        throw "illegal char: " + ch;
                }
            }
        };
        return QRAlphanumeric;
    }(QRData));

    /**
     * @module QR8BitByte
     * @author nuintun
     * @author Kazuhiko Arase
     */

    exports.Decoder = QRCode$1;
    exports.Encoder = QRCode;
    exports.ErrorCorrectLevel = ErrorCorrectLevel$1;
    exports.QRAlphanumeric = QRAlphanumeric;
    exports.QRByte = QRByte;
    exports.QRKanji = QRKanji;
    exports.QRNumeric = QRNumeric;

    Object.defineProperty(exports, '__esModule', { value: true });

}));
