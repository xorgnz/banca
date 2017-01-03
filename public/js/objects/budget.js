class Budget {
    constructor(obj, viewModel) {
        this._viewModel = viewModel;
        var self        = this;

        // Storage
        this.id     = ko.observable(obj.id);
        this.code   = ko.observable(obj.code);
        this.type   = ko.observable(obj.type);
        this.amount = ko.observable("" + obj.amount.toFixed(2));

        // Nice field values
        this.typeNice = ko.computed(function () {
            if (viewModel) {
                var t = _.find(viewModel.budgetTypes, {id: self.type()});
                return (t && t.description) ? t.description : "Unknown";
            }
            return "Not loaded yet";
        });

        // Decorate as rest managed object
        decorateAjaxRest(self, "budget", "/rest/budget/", {
            del:    function (obj) {
                viewModel.budgets.remove(self);
                console.log("Budget " + self.code() + " removed.");
            },
            add:    function (obj) {
                viewModel.budgets.push(self);
                viewModel.blankNewBudget();
                console.log(obj);
                obj.sneakyUpdate(obj.amount, "" + Number.parseFloat(obj.amount()).toFixed(2));
                console.log("Budget " + self.code() + " added.");
            },
            update: function (obj, result) {
                console.log("Budget " + self.code() + " updated.");
            }
        });

        // Subscribe to exposed update fields
        this.code.subscribe(function (newValue) { self.update(); });
        this.type.subscribe(function (newValue) { self.update(); });
        this.amount.subscribe(function (newValue) { self.update(); });
    }

    updateFromObject(obj) {
        console.log(obj);
        this.id(obj.id);
        this.code(obj.code);
        this.type(obj.type);
        this.amount("" + obj.amount.toFixed(2));
    }

    valuesOnly() {
        return {
            id:     this.id(),
            code:   this.code(),
            type:   this.type(),
            amount: this.amount()
        }
    }
}