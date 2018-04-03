"use strict";

class Assert {
	private callback = null;

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

	async isEqual(expectedResult) {
		let res = null;
		try {
			res = await this.callback();
		}
		catch (e) {
			console.log(e)
		}
		return res == expectedResult;
	}
}

class Tester {

	private assert = null;
	private name = null;
	private tests = [];

	constructor() {
		this.assert = new Assert();
	}

	expects(fn) {
		this.assert.setCallback(fn);
		return this.assert;
	}

	assertTest(name, result) {
		this.tests.push({name: name, result: result});
	}

	results() {
		var errors = 0;
		var success = 0;
		var errored = [];
		for (var i in this.tests) {
			if (!this.tests.hasOwnProperty(i)) {
				continue;
			}
			if (this.tests[i].result) {
				success++;
			} else {
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

export default Tester;
