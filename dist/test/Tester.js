"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
class Assert {
    constructor() {
        this.callback = null;
    }
    setCallback(fn) {
        this.callback = fn;
    }
    toBe(conditionType, expectedResult) {
        switch (conditionType) {
            case 'equal':
                return this.isEqual(expectedResult);
            default:
                return null;
        }
    }
    isEqual(expectedResult) {
        return __awaiter(this, void 0, void 0, function* () {
            let res = null;
            try {
                res = yield this.callback();
            }
            catch (e) {
                console.log(e);
            }
            return res == expectedResult;
        });
    }
}
class Tester {
    constructor() {
        this.assert = null;
        this.name = null;
        this.tests = [];
        this.assert = new Assert();
    }
    expects(fn) {
        this.assert.setCallback(fn);
        return this.assert;
    }
    assertTest(name, result) {
        this.tests.push({ name: name, result: result });
    }
    results() {
        var errors = 0;
        var success = 0;
        var errored = [];
        for (var i in this.tests) {
            if (!this.tests.hasOwnProperty(i))
                continue;
            if (this.tests[i].result)
                success++;
            else {
                errors++;
                errored.push(this.tests[i].name);
            }
        }
        console.log('\n\nTEST RESULTS:\n' +
            'successful: ' + success + '\n' +
            'Errors:' + errors + '\n' +
            'Failed: ' + errored.join('; '));
    }
}
exports.default = Tester;
