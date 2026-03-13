"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.datetime = exports.sliceWords = exports.makePath = exports.isActive = exports.createPath = exports.toPath = void 0;
/**
 * Text to pathname
 * @param str
 * @returns {string}
 */
function toPath(str) {
    return str.replace(/\s/g, '-').replace(/(?!-|\/)([\W])/g, '').toLowerCase();
}
exports.toPath = toPath;
/**
 * Page and post path
 * @param path The path as array
 * @returns {string}
 */
function createPath(path) {
    return toPath([''].concat(path.filter(v => v)).join('/'));
}
exports.createPath = createPath;
/**
 * Active menu
 * @param item
 * @param name
 */
function isActive(item, name) {
    if (item.name) {
        const path = toPath(item.name);
        if (path) {
            if (item.root === name || path === name) {
                return 'active';
            }
        }
    }
}
exports.isActive = isActive;
/**
 * Make path
 */
function makePath(item) {
    if (item.root) {
        return createPath([item.root]);
    }
    if (item.name) {
        return createPath(['panel', item.name]);
    }
    return '';
}
exports.makePath = makePath;
/**
 * Limit the words
 * @param words
 * @param limit
 * @returns {string}
 */
function sliceWords(words, limit = 20) {
    if (words) {
        return words.split(/\s/g).slice(0, limit).join(' ');
    }
    return words;
}
exports.sliceWords = sliceWords;
/**
 * Format date
 * @param ts
 */
function datetime(ts) {
    var today = new Date();
    var date = new Date(ts);
    return {
        date,
        today,
        /**
         * Get day of the week
         * @example Sat
         */
        getDay() {
            return date.toDateString().substring(0, 3);
        },
        /**
         * Get date
         * @example Jul 2 2023
         */
        getDate() {
            return date.toDateString().substring(4);
        },
        /**
         * Get time without senconds
         * @example 04:20 AM
         */
        getTime() {
            return date.toLocaleTimeString().replace(/:(\d+)\s/g, ' ');
        },
        /**
         * Get formatted full date and time
         * @example Sat, Jul 2 2023 at 5:41 PM
         */
        getDateTime() {
            return this.getFullDateTime().slice(5);
        },
        /**
         * Get formatted full date
         * @example Sat, Jul 2 2023
         */
        getFullDate() {
            return date.toDateString().replace(/^(\w+)\s(\w+)(\s0){1}/g, '$1, $2 ');
        },
        /**
         * Get formatted full date and time
         * @example Sat, Jul 2 2023 at 5:41 PM
         */
        getFullDateTime(div = 'at') {
            return `${this.getFullDate()} ${div} ${this.getTime()}`;
        },
    };
}
exports.datetime = datetime;
