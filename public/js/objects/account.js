class Account {
    constructor(obj, viewModel) {
        this._viewModel = viewModel;
        var self = this;

        // Storage
        this.id          = obj.id;
        this.name        = obj.name;
        this.description = obj.description;

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
    }

    expressAsPanel() {
        var div = document.createElement("div");
        div.className = "width-12 data_panel";
        div.append(domsugar_h(1, "Account Information"));
        div.append(domsugar_text(this.name, true));
        div.append(domsugar_br());
        div.append(domsugar_text(this.description));
        return div;
    }

    updateFromObject(obj) {
        this.id = obj.id;
        this.name = obj.name;
        this.description = obj.description;
    }

    valuesOnly () {
        return {
            id:          this.id,
            name:        this.name,
            description: this.description,
        };
    }
}