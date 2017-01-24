class Budget extends AjaxRestObject {
    constructor(obj) {
        super("/rest/budget/", "budget");

        var self        = this;

        // Storage
        this.id     = ko.observable(obj.id);
        this.code   = ko.observable(obj.code);
        this.type   = ko.observable(obj.type);
        this.amount = ko.observable("" + obj.amount.toFixed(2));

        // Nice field values
        // this.typeNice = ko.computed(function () {
        //     if (viewModel) {
        //         var t = _.find(viewModel.budgetTypes, {id: self.type()});
        //         return (t && t.description) ? t.description : "Unknown";
        //     }
        //     return "Not loaded yet";
        // });

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