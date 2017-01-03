class Account {
    constructor(obj, viewModel) {
        this._viewModel = viewModel;
        var self = this;

        // Storage
        this.id          = ko.observable(obj.id);
        this.name        = ko.observable(obj.name);
        this.description = ko.observable(obj.description);

        // Register for AJAX calls
        decorateAjaxRest(
            self, "account", "/rest/account/",
            {
                del:    function () {
                    self._viewModel.accounts.remove(self);
                    console.log("Account " + self.name() + " removed.");
                },
                add:    function () {
                    self._viewModel.accounts.push(self);
                    self._viewModel.blankNewAccount();
                    console.log(self);
                    console.log("Account " + self.name() + " added.");
                },
                update: function () {
                    console.log("Account " + self.name() + " updated.");
                }
            }
        );

        // Subscribe to exposed update fields
        this.name.subscribe(function (newValue) { self.update(); });
        this.description.subscribe(function (newValue) { self.update(); });
    }

    updateFromObject(obj) {
        this.id(obj.id);
        this.name(obj.name);
        this.description(obj.description);
    }

    valuesOnly () {
        return {
            id:          this.id(),
            name:        this.name(),
            description: this.description(),
        };
    }
}