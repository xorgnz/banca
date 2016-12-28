const _     = require('lodash');
const check = require('../lib/check-types-wrapper.js').check;

class BancaObject {
    toJSON() {
        var v = {};
        _.forIn(this, function (value, key) {
            v[key.substr(1)] = value;
        });
        return v;
    }

    assertEquivalence(obj) { this.assertEquivalenceIgnoreFields_internal(obj, []); }
    assertEquivalenceIgnoreFields(obj, ignore) { this.assertEquivalenceIgnoreFields_internal(obj, ignore); }
    assertEquivalenceIgnoreFields_internal(obj, ignore) {
        if (check.string(ignore))
            ignore = [ ignore ];

        _.forIn(this, function (value, key) {
            key = key.substr(0,1) == "_" ? key.substr(1) : key;
            if (_.indexOf(ignore, key) == -1) {
                key = key.substr(0,1) == "_" ? key.substr(1) : key;
                check.assert.not.undefined(obj[key], "Objects not equivalent - property '" + key + "' is missing");
                check.assert.equal(value, obj[key], "Objects not equivalent - property '" + key + "' does not match");
            }
        });
    }
}
exports.BancaObject = BancaObject;