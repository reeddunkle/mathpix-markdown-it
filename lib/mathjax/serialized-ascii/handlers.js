"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handle = exports.getAttributes = exports.FindSymbolToAM = exports.FindSymbolReplace = exports.SymbolToAM = void 0;
var helperA_1 = require("./helperA");
var regW = /^\w/;
var isFirstChild = function (node) {
    return node.parent && node.parent.childNodes[0] && node.parent.childNodes[0] === node;
};
var isLastChild = function (node) {
    return node.parent && node.parent.childNodes && node.parent.childNodes[node.parent.childNodes.length - 1] === node;
};
var needFirstSpase = function (node) {
    try {
        if (isFirstChild(node)) {
            return false;
        }
        else {
            var index = node.parent.childNodes.findIndex(function (item) { return item === node; });
            var prev = node.parent.childNodes[index - 1];
            if (prev.kind === 'mi' || prev.kind === 'mo') {
                var text = prev.childNodes[0] ? prev.childNodes[0].text : '';
                return regW.test(text[0]);
            }
            else {
                return false;
            }
        }
    }
    catch (e) {
        return false;
    }
};
var needLastSpase = function (node) {
    var haveSpace = false;
    try {
        if (node.parent.kind === "msubsup") {
            return false;
        }
        if (isLastChild(node)) {
            return false;
        }
        else {
            var index = node.parent.childNodes.findIndex(function (item) { return item === node; });
            var next = node.parent.childNodes[index + 1];
            if (next.childNodes[0].kind === 'text' && next.childNodes[0].text === '\u2061' && !isLastChild(next)) {
                next = node.parent.childNodes[index + 2];
                haveSpace = true;
            }
            if (next.kind === 'mi' || next.kind === 'mo') {
                var text = next.childNodes[0] ? next.childNodes[0].text : '';
                if (next.childNodes[0] && next.childNodes[0].kind === 'text' && next.childNodes[0].text === '\u2061') {
                    return true;
                }
                var abs = exports.SymbolToAM(next.kind, text);
                return regW.test(abs);
            }
            else {
                if (next.kind === 'mrow') {
                    return false;
                }
                return haveSpace;
            }
        }
    }
    catch (e) {
        return haveSpace;
    }
};
exports.SymbolToAM = function (tag, output, atr, showStyle) {
    if (atr === void 0) { atr = null; }
    if (showStyle === void 0) { showStyle = false; }
    var tags = null;
    var atrsNames = atr ? Object.getOwnPropertyNames(atr) : [];
    output = tag !== 'mtext' ? output.split(' ').join('') : output;
    if (showStyle && atr && atrsNames.length > 0) {
        var _loop_1 = function (atname, atval) {
            tags = helperA_1.AMsymbols.find(function (item) { return (item.tag === "mstyle" && item.atname === atname && item.atval === atval); });
            if (tags) {
                return "break";
            }
        };
        for (var _i = 0, _a = Object.entries(atr); _i < _a.length; _i++) {
            var _b = _a[_i], atname = _b[0], atval = _b[1];
            var state_1 = _loop_1(atname, atval);
            if (state_1 === "break")
                break;
        }
        if (tags && tags.input) {
            return tags.input + '(' + output + ')';
        }
    }
    if (!tags) {
        tags = helperA_1.AMsymbols.find(function (item) {
            if (tag === 'mo' || tag === 'mi') {
                return (item.tag === 'mo' || item.tag === 'mi') && item.output === output;
            }
            else {
                return item.tag === tag && item.output === output;
            }
        });
    }
    //need split
    if (!tags && atr && atrsNames.length > 0 && Object.getOwnPropertyNames(atr) && atr.stretchy === false) {
        var sp_1 = output.split('');
        var res = '';
        var _loop_2 = function (i) {
            var tags_1 = helperA_1.AMsymbols.find(function (item) {
                if (tag === 'mo' || tag === 'mi') {
                    return (item.tag === 'mo' || item.tag === 'mi') && item.output === sp_1[i];
                }
                else {
                    return item.tag === tag && item.output === sp_1[i];
                }
            });
            res += i > 0 ? ' ' : '';
            res += tags_1 && tags_1.input ? tags_1.input : sp_1[i];
        };
        for (var i = 0; i < sp_1.length; i++) {
            _loop_2(i);
        }
        return res;
    }
    return tags ? tags.input : output;
};
exports.FindSymbolReplace = function (str) {
    return str.replace(/\u00A0/g, ' ');
};
exports.FindSymbolToAM = function (tag, output, atr) {
    if (atr === void 0) { atr = null; }
    output = output.split(' ').join('');
    var tags = null;
    if (atr && atr.stretchy) {
        tags = helperA_1.AMsymbols.find(function (item) {
            if (tag === 'mo' || tag === 'mi') {
                return (item.tag === 'mo' || item.tag === 'mi') && item.output === output && item.stretchy;
            }
            else {
                return item.tag === tag && item.output === output && item.stretchy;
            }
        });
    }
    if (!tags) {
        tags = helperA_1.AMsymbols.find(function (item) {
            if (tag === 'mo' || tag === 'mi') {
                return (item.tag === 'mo' || item.tag === 'mi') && item.output === output;
            }
            else {
                return item.tag === tag && item.output === output;
            }
        });
    }
    return tags ? tags.input : '';
};
var getChilrenText = function (node) {
    var text = '';
    try {
        node.childNodes.forEach(function (child) {
            text += child.text;
        });
        return text;
    }
    catch (e) {
        return text;
    }
};
var defHandle = function (node, serialize) {
    return handlerApi.handleAll(node, serialize);
};
exports.getAttributes = function (node) {
    return node.attributes.getAllAttributes();
};
var menclose = function (handlerApi) {
    return function (node, serialize) {
        var mml = '';
        try {
            var atr = exports.getAttributes(node);
            var isLeft = false;
            var isRight = false;
            var isBottom = false;
            if (atr && atr.notation) {
                isLeft = atr.notation.toString().indexOf('left') > -1;
                isRight = atr.notation.toString().indexOf('right') > -1;
                isBottom = atr.notation.toString().indexOf('bottom') > -1;
            }
            mml += isLeft ? '[' : '';
            mml += handlerApi.handleAll(node, serialize);
            mml += isBottom ? ',[hline]' : '';
            mml += isRight ? ']' : '';
            return mml;
        }
        catch (e) {
            console.error('mml => menclose =>', e);
            return mml;
        }
    };
};
var mtable = function () {
    return function (node, serialize) {
        var mml = '';
        try {
            for (var i = 0; i < node.childNodes.length; i++) {
                if (i > 0) {
                    mml += ',';
                }
                mml += serialize.visitNode(node.childNodes[i], '');
            }
            return mml;
        }
        catch (e) {
            console.error('mml => mtable =>', e);
            return mml;
        }
    };
};
var mtr = function () {
    return function (node, serialize) {
        var mml = '';
        try {
            mml += node.parent.childNodes.length > 1 || serialize.options.extraBrackets ? '[' : '';
            for (var i = 0; i < node.childNodes.length; i++) {
                if (i > 0) {
                    mml += ',';
                }
                mml += serialize.visitNode(node.childNodes[i], '');
            }
            mml += node.parent.childNodes.length > 1 || serialize.options.extraBrackets ? ']' : '';
            return mml;
        }
        catch (e) {
            console.error('mml => mtr =>', e);
            return mml;
        }
    };
};
var mpadded = function (handlerApi) {
    return function (node, serialize) {
        var mml = '';
        try {
            mml += '"';
            mml += handlerApi.handleAll(node, serialize, mml);
            mml += '"';
            return mml;
        }
        catch (e) {
            console.error('mml => mpadded =>', e);
            return mml;
        }
    };
};
var mover = function (handlerApi) {
    return function (node, serialize) {
        var mml = '';
        try {
            var firstChild = node.childNodes[0] ? node.childNodes[0] : '';
            var secondChild = node.childNodes[1] ? node.childNodes[1] : '';
            if (secondChild && secondChild.kind === 'mo') {
                var t = serialize.visitNode(secondChild, '');
                var asc = exports.FindSymbolToAM('mover', t, exports.getAttributes(secondChild));
                if (asc) {
                    mml += ' ' + asc + '(';
                    mml += serialize.visitNode(firstChild, '').trim();
                    mml += ')';
                }
                else {
                    mml += serialize.visitNode(firstChild, '');
                    mml += '^';
                    mml += serialize.options.extraBrackets ? '(' : '';
                    mml += serialize.visitNode(secondChild, '');
                    mml += serialize.options.extraBrackets ? ')' : '';
                }
            }
            else {
                mml += handlerApi.handleAll(node, serialize);
            }
            return mml;
        }
        catch (e) {
            console.error('mml => mover =>', e);
            return mml;
        }
    };
};
var munder = function (handlerApi) {
    return function (node, serialize) {
        var mml = '';
        try {
            var firstChild = node.childNodes[0] ? node.childNodes[0] : null;
            var secondChild = node.childNodes[1] ? node.childNodes[1] : null;
            if (secondChild && secondChild.kind === 'mo') {
                var t = serialize.visitNode(secondChild, '');
                var asc = exports.FindSymbolToAM(node.kind, t);
                if (asc) {
                    mml += asc + '(';
                    mml += serialize.visitNode(firstChild, '');
                    mml += ')';
                }
                else {
                    mml += handlerApi.handleAll(node, serialize);
                }
            }
            else {
                mml += firstChild ? serialize.visitNode(firstChild, '') : '';
                mml += '_';
                mml += serialize.options.extraBrackets ? '(' : '';
                mml += secondChild ? serialize.visitNode(secondChild, '') : '';
                mml += serialize.options.extraBrackets ? ')' : '';
            }
            return mml;
        }
        catch (e) {
            console.error('mml => munder =>', e);
            return mml;
        }
    };
};
var munderover = function () {
    return function (node, serialize) {
        var mml = '';
        try {
            var firstChild = node.childNodes[0] ? node.childNodes[0] : null;
            var secondChild = node.childNodes[1] ? node.childNodes[1] : null;
            var thirdChild = node.childNodes[2] ? node.childNodes[2] : null;
            mml += firstChild ? serialize.visitNode(firstChild, '') : null;
            mml += '_';
            mml += serialize.options.extraBrackets ? '(' : '';
            mml += secondChild ? serialize.visitNode(secondChild, '') : null;
            mml += serialize.options.extraBrackets ? ')' : '';
            mml += '^';
            mml += serialize.options.extraBrackets ? '(' : '';
            mml += thirdChild ? serialize.visitNode(thirdChild, '') : null;
            mml += serialize.options.extraBrackets ? ')' : '';
            return mml;
        }
        catch (e) {
            console.error('mml => munderover =>', e);
            return mml;
        }
    };
};
var msub = function () {
    return function (node, serialize) {
        var mml = '';
        try {
            var firstChild = node.childNodes[0] ? node.childNodes[0] : null;
            var secondChild = node.childNodes[1] ? node.childNodes[1] : null;
            mml += firstChild ? serialize.visitNode(firstChild, '') : '';
            mml += '_';
            mml += serialize.options.extraBrackets ? '(' : '';
            mml += secondChild ? serialize.visitNode(secondChild, '') : '';
            mml += serialize.options.extraBrackets ? ')' : '';
            return mml;
        }
        catch (e) {
            console.error('mml => msub =>', e);
            return mml;
        }
    };
};
var msup = function () {
    return function (node, serialize) {
        var mml = '';
        try {
            var firstChild = node.childNodes[0] ? node.childNodes[0] : null;
            var secondChild = node.childNodes[1] ? node.childNodes[1] : null;
            mml += firstChild ? serialize.visitNode(firstChild, '') : '';
            mml += '^';
            mml += serialize.options.extraBrackets ? '(' : '';
            mml += secondChild ? serialize.visitNode(secondChild, '') : '';
            mml += serialize.options.extraBrackets ? ')' : '';
            return mml;
        }
        catch (e) {
            console.error('mml => msup =>', e);
            return mml;
        }
    };
};
var msubsup = function () {
    return function (node, serialize) {
        var mml = '';
        try {
            var firstChild = node.childNodes[0] ? node.childNodes[0] : null;
            var secondChild = node.childNodes[1] ? node.childNodes[1] : null;
            var thirdChild = node.childNodes[2] ? node.childNodes[2] : null;
            mml += firstChild ? serialize.visitNode(firstChild, '') : '';
            mml += '_';
            mml += '(';
            mml += secondChild ? serialize.visitNode(secondChild, '') : '';
            mml += ')';
            mml += '^';
            mml += '(';
            mml += thirdChild ? serialize.visitNode(thirdChild, '') : '';
            mml += ')';
            return mml;
        }
        catch (e) {
            console.error('mml => msubsup =>', e);
            return mml;
        }
    };
};
var msqrt = function (handlerApi) {
    return function (node, serialize) {
        var mml = '';
        try {
            var firstChild = node.childNodes[0] ? node.childNodes[0] : null;
            mml += 'sqrt';
            mml += serialize.visitNode(firstChild, '');
            return mml;
        }
        catch (e) {
            console.error('mml => msqrt =>', e);
            return mml;
        }
    };
};
var mroot = function () {
    return function (node, serialize) {
        var mml = '';
        try {
            var firstChild = node.childNodes[0] ? node.childNodes[0] : null;
            var secondChild = node.childNodes[1] ? node.childNodes[1] : null;
            mml += 'root';
            mml += secondChild ? '(' + serialize.visitNode(secondChild, '') + ')' : '';
            mml += firstChild ? '(' + serialize.visitNode(firstChild, '') + ')' : '';
            return mml;
        }
        catch (e) {
            console.error('mml => mroot =>', e);
            return mml;
        }
    };
};
var mfrac = function () {
    return function (node, serialize) {
        var mml = '';
        try {
            var firstChild = node.childNodes[0] ? node.childNodes[0] : null;
            var secondChild = node.childNodes[1] ? node.childNodes[1] : null;
            if ((firstChild && firstChild.kind === "mrow" && firstChild.childNodes.length > 1) || serialize.options.extraBrackets) {
                mml += '(';
                mml += serialize.visitNode(firstChild, '');
                mml += ')';
            }
            else {
                mml += serialize.visitNode(firstChild, '');
            }
            mml += '/';
            if ((secondChild && secondChild.kind === "mrow" && secondChild.childNodes.length > 1) || serialize.options.extraBrackets) {
                mml += '(';
                mml += serialize.visitNode(secondChild, '');
                mml += ')';
            }
            else {
                mml += serialize.visitNode(secondChild, '');
            }
            return mml;
        }
        catch (e) {
            console.error('mml => mfrac =>', e);
            return mml;
        }
    };
};
var mtext = function () {
    return function (node, serialize) {
        var mml = '';
        try {
            if (!node.childNodes || node.childNodes.length === 0) {
                return mml;
            }
            var firstChild = node.childNodes[0];
            var value = exports.FindSymbolReplace(firstChild.text);
            var asc = exports.FindSymbolToAM(node.kind, value);
            if (asc) {
                mml += asc;
                return mml;
            }
            if (value[0] === '(') {
                mml += value;
            }
            else {
                mml += '"' + value + '"';
            }
            return mml;
        }
        catch (e) {
            console.error('mml => mtext =>', e);
            return mml;
        }
    };
};
var mi = function () {
    return function (node, serialize) {
        var mml = '';
        try {
            if (!node.childNodes || node.childNodes.length === 0) {
                return mml;
            }
            var firstChild = node.childNodes[0];
            var value = firstChild.text;
            var atr = serialize.options.showStyle
                ? exports.getAttributes(node)
                : null;
            var abs = exports.SymbolToAM(node.kind, value, atr);
            if (abs && abs.length > 1 && regW.test(abs[0])) {
                mml += needFirstSpase(node) ? ' ' : '';
                mml += abs;
                mml += needLastSpase(node) ? ' ' : '';
            }
            else {
                mml += abs;
            }
            return mml;
        }
        catch (e) {
            console.error('mml => mi =>', e);
            return mml;
        }
    };
};
var mo = function () {
    return function (node, serialize) {
        var mml = '';
        try {
            var value = getChilrenText(node);
            if (value === '\u2061') {
                return mml;
            }
            var atr = exports.getAttributes(node);
            if (atr && atr.hasOwnProperty('fence') && atr.fence) {
                mml += node.texClass === 4 ? '{:' : '';
                mml += node.texClass === 5 ? ':}' : '';
            }
            var abs = exports.SymbolToAM(node.kind, value, atr, serialize.options.showStyle);
            if (abs && abs.length > 1) {
                mml += regW.test(abs[0]) && needFirstSpase(node) ? ' ' : '';
                mml += abs;
                mml += regW.test(abs[abs.length - 1]) && needLastSpase(node) ? ' ' : '';
            }
            else {
                mml += abs;
            }
            return mml;
        }
        catch (e) {
            console.error('mml => mo =>', e);
            return mml;
        }
    };
};
var mspace = function (handlerApi) {
    return function (node, serialize) {
        var mml = '';
        try {
            var atr = exports.getAttributes(node);
            if (atr && atr.width === "2em") {
                mml += node.parent.parent && needFirstSpase(node.parent.parent) ? ' ' : '';
                mml += 'qquad';
                mml += node.parent.parent && needLastSpase(node.parent.parent) ? ' ' : '';
                return mml;
            }
            if (atr && atr.width === "1em") {
                mml += node.parent.parent && needFirstSpase(node.parent.parent) ? ' ' : '';
                mml += 'quad';
                mml += node.parent.parent && needLastSpase(node.parent.parent) ? ' ' : '';
                return mml;
            }
            mml += handlerApi.handleAll(node, serialize, mml);
            return mml;
        }
        catch (e) {
            console.error('mml => mspace =>', e);
            return mml;
        }
    };
};
exports.handle = function (node, serialize) {
    var handler = handlers[node.kind] || defHandle;
    return handler(node, serialize);
};
var handleAll = function (node, serialize, mml) {
    if (mml === void 0) { mml = ''; }
    for (var _i = 0, _a = node.childNodes; _i < _a.length; _i++) {
        var child = _a[_i];
        mml += serialize.visitNode(child, '');
    }
    return mml;
};
var handlerApi = {
    handle: exports.handle,
    handleAll: handleAll
};
var handlers = {
    mi: mi(),
    mo: mo(),
    mn: mo(),
    mfrac: mfrac(),
    msup: msup(),
    msub: msub(),
    msubsup: msubsup(),
    msqrt: msqrt(handlerApi),
    mover: mover(handlerApi),
    munder: munder(handlerApi),
    munderover: munderover(),
    mspace: mspace(handlerApi),
    mtext: mtext(),
    mtable: mtable(),
    mtr: mtr(),
    mpadded: mpadded(handlerApi),
    mroot: mroot(),
    menclose: menclose(handlerApi),
};
//# sourceMappingURL=handlers.js.map