function decorateAjaxRest(obj, type, ajax_endpoint, callbacks) {
    // Ensure parameters meet contract
    if (!obj)
        throw "Cannot decorate " + obj;
    callbacks = (typeof(callbacks) === "object" && callbacks) ? callbacks : {};

    // Deleting
    obj.deleting = ko.observable(false);
    obj.cancelDel = function ()  { this.deleting(false); };
    obj.del = function () { this.deleting(true); };
    obj.delReally = function (obj) {
        $.ajax({
            url: ajax_endpoint + obj.id(),
            method: "delete",
            success: function (result) {
                if (typeof(callbacks.del) === "function") {
                    callbacks.del(obj, result);
                }
            }
        });
    };

    obj.add = function () {
        $.ajax({
            url: ajax_endpoint,
            method: "post",
            contentType: "application/json",
            data: ko.toJSON(typeof(obj.valuesOnly) === "function" ? obj.valuesOnly() : obj),
            success: function (result) {
                if (result.success)
                {
                    obj.id(result.data.id);
                    obj.validationResults({});
                    if (typeof(callbacks.add) === "function") {
                        callbacks.add(obj, result);
                    }
                }
                else
                {
                    var results = {};
                    for (var error of result.errors) {
                        results[error.field] = errorToString(error, type);
                    }
                    obj.validationResults(results);
                }
            },
            error: function (result) {
                alert("AJAX request failed. See console for details");
                console.log(result);
            }
        });
    };

    // Updating
    obj.editing = ko.observable(false);
    obj.disableUpdates = ko.observable(false);
    obj.update = function () {
        if (obj.id() !== null && ! obj.disableUpdates()) {
            $.ajax({
                url: ajax_endpoint + obj.id(),
                method: "patch",
                contentType: "application/json",
                data: ko.toJSON(typeof(obj.valuesOnly) === "function" ? obj.valuesOnly() : obj),
                success: function (result) {
                    if (result.success) {
                        obj.validationResults({});
                        obj.deleting(false);
                        obj.editing(false);
                        obj.fullsneakyUpdate(result.data);
                        if (typeof(callbacks.update) === "function") {
                            callbacks.update(obj, result);
                        }
                    } else {
                        var results = {};
                        for (var error of result.errors) {
                            results[error.field] = errorToString(error, type);
                        }
                        obj.validationResults(results);
                        obj.editing(true);
                    }
                }
            });
        }
    };

    // Validation
    obj.validationResults = ko.observable({});
    obj.validation = function (fieldName) {
        return ko.computed(function() { return obj.validationResults()[fieldName]; });
    };

    obj.sneakyUpdate = function(observable, value) {
        var u = obj.disableUpdates();
        obj.disableUpdates(true);
        observable(value);
        obj.disableUpdates(u);
    };

    obj.fullsneakyUpdate = function (newObj) {
        var u = obj.disableUpdates();
        obj.disableUpdates(true);
        obj.updateFromObject(newObj);
        obj.disableUpdates(u);
    }
}