"use strict";
/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseAllowedColor = exports.parseAllowedFontSize = void 0;
const MIN_ALLOWED_FONT_SIZE = 8;
const MAX_ALLOWED_FONT_SIZE = 72;
const parseAllowedFontSize = (input) => {
    const match = input.match(/^(\d+(?:\.\d+)?)px$/);
    if (match) {
        const n = Number(match[1]);
        if (n >= MIN_ALLOWED_FONT_SIZE && n <= MAX_ALLOWED_FONT_SIZE) {
            return input;
        }
    }
    return '';
};
exports.parseAllowedFontSize = parseAllowedFontSize;
function parseAllowedColor(input) {
    return /^rgb\(\d+, \d+, \d+\)$/.test(input) ? input : '';
}
exports.parseAllowedColor = parseAllowedColor;
