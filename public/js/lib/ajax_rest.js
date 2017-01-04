function decorateAjaxRest(obj, type, ajax_endpoint, callbacks) {

    // Test contract
    console.assert(typeof(obj) === "object", "Cannot decorate " + obj + " - is not an object");
    console.assert(typeof(obj.valuesOnly) === "function", "Cannot decorate " + obj + " - has no valuesOnly fn");

    // Process callbacks
    callbacks = (typeof(callbacks) === "object" && callbacks) ? callbacks : {};

    // Deleting
    obj.del = function () {
        $.ajax({
            url: ajax_endpoint + obj.id,
            method: "delete",
            success: function (result) {
                if (typeof(callbacks.del) === "function") {
                    callbacks.del(obj, result);
                }
            }
        });
    };

    obj.add = function () {
        // Test contract
        $.ajax({
            url: ajax_endpoint,
            method: "post",
            contentType: "application/json",
            data: obj.valuesOnly(),
            success: function (result) {
                if (result.success)
                {
                    obj.id = result.data.id;
                    obj.validationResults = {};
                    if (typeof(callbacks.add) === "function") {
                        callbacks.add(obj, result);
                    }
                }
                else
                {
                    for (var error of result.errors) {
                        obj.validationResults[error.field] = errorToString(error, type);
                    }
                }
            },
            error: function (result) {
                alert("AJAX request failed. See console for details");
                console.log(result);
            }
        });
    };

    // Updating
    obj.editing = false;
    obj.disableUpdates = false;
    obj.update = function () {
        if (obj.id !== null && ! obj.disableUpdates) {
            $.ajax({
                url: ajax_endpoint + obj.id,
                method: "patch",
                contentType: "application/json",
                data: obj.valuesOnly(),
                success: function (result) {
                    if (result.success) {
                        obj.validationResults = {};
                        obj.deleting = false;
                        obj.editing = false;
                        obj.updateFromObject(result.data);
                        if (typeof(callbacks.update) === "function") {
                            callbacks.update(obj, result);
                        }
                    } else {
                        for (var error of result.errors) {
                            obj.validationResults[error.field] = errorToString(error, type);
                        }
                        obj.editing = true;
                    }
                }
            });
        }
    };

    // Validation
    obj.validationResults = {};
    obj.validation = function (fieldName) {
        return obj.validationResults[fieldName];
    };
}