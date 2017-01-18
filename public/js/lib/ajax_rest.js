class AjaxRestObject {
    constructor(ajax_endpoint, type) {
        // Storage
        this.ajax_endpoint     = ajax_endpoint;
        this.callbacks         = {};
        this.locked            = false;
        this.editing           = false;
        this.type              = type;
        this.validationResults = {};
    }

    del() {
        if (this.locked)
            console.log("Cannot delete - object is locked");

        else {
            var self    = this;
            this.locked = true;
            $.ajax({
                url:     this.ajax_endpoint + this.idWrapper(),
                method:  "delete",
                success: function (result) {
                    self.doCallback(self.callbacks.del, result);
                    self.locked = false;
                }
            });
        }
    };

    add() {
        if (this.locked) {
            console.log("Cannot add - object is locked");
        }
        else {
            var self    = this;
            this.locked = true;
            $.ajax({
                url:         this.ajax_endpoint,
                method:      "post",
                contentType: "application/json",
                data:        JSON.stringify(this.valuesOnly()),
                success:     function (result) {
                    if (result.success) {
                        self.id                = result.data.id;
                        self.validationResults = {};
                    }
                    else {
                        self.validationResults = {};
                        _.forEach(result.errors, (e) => {
                            self.validationResults[e.field] = errorToString(e, self.type);
                        });
                    }
                    self.doCallback(self.callbacks.add, result);
                    self.locked = false;
                },
                error:       function (result) {
                    alert("AJAX request failed. See console for details");
                    console.log(result);
                }
            });
        }
    }

    // Updating
    update() {
        var self = this;
        if (this.locked) {
            console.log("Cannot update - object is locked");
        }
        else {
            this.locked = true;
            if (this.idWrapper() !== null) {
                $.ajax({
                    url:         this.ajax_endpoint + this.idWrapper(),
                    method:      "patch",
                    contentType: "application/json",
                    data:        JSON.stringify(this.valuesOnly()),
                    success:     function (result) {
                        if (result.success) {
                            self.updateFromObject(result.data);
                            self.validationResults = {};
                            self.editing = false;
                        } else {
                            self.validationResults = {};
                            _.forEach(result.errors, (e) => {
                                self.validationResults[e.field] = errorToString(e, self.type);
                            });
                            self.editing = true;
                        }
                        self.doCallback(self.callbacks.update, result);
                        self.locked = false;
                    },
                    error:       function (result) {
                        alert("AJAX request failed. See console for details");
                        console.log(result);
                    }
                });
            }
        }
    };

    doCallback(cb, arg) {
        if (typeof(cb) === "function") {
            cb(arg);
        }
    }

    idWrapper() {
        if (this.id !== undefined)
            return this.id;
        else
            throw new Error("AjaxRestObject.id not defined");
    }

    valid(field) {
        return !_.hasIn(this.validationResults, field);
    }

    validationString(field) {
        return this.validationResults[field];
    }

    valuesOnly() {
        throw new Error("AjaxRestObject.valuesOnly not defined");
    }
}