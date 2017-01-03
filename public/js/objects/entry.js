class Entry {
    constructor(obj, budget_allocations, viewModel) {
        this._viewModel = viewModel;
        var self        = this;

        // Storage
        this.id                 = ko.observable(obj.id);
        this.account_id         = ko.observable(obj.account_id);
        this.amount             = ko.observable("" + obj.amount.toFixed(2));
        this.date               = ko.observable(formatDateIso8601(obj.date));
        this.bank_note          = ko.observable(obj.bank_note);
        this.note               = ko.observable(obj.note);
        this.tag                = ko.observable(obj.tag);
        this.what               = ko.observable(obj.what);
        this.where              = ko.observable(obj.where);
        this.budget_allocations = ko.observableArray(budget_allocations);

        // Nice field values
        this.tagColor   = ko.computed(function () {
            var tc = tag_colors[self.tag()];
            if (tc && tc.color) {
                return tc.color;
            } else {
                return "black";
            }
        });
        this.tagBGColor = ko.computed(function () {
            var tc = tag_colors[self.tag()];
            if (tc && tc.bgcolor) {
                return tc.bgcolor;
            } else {
                return "white";
            }
        });

        // Decorate as rest managed object
        decorateAjaxRest(
            self, "entry", "/rest/entry/",
            {
                del:    function (obj, result) {
                    viewModel.entries.remove(self);
                    console.log("Entry " + self.date() + " - " + self.amount() + " removed.");
                },
                add:    function (obj, result) {
                    viewModel.entries.push(self);
                    viewModel.blankNewEntry();
                    obj.sneakyUpdate(obj.amount, "" + Number.parseFloat(obj.amount()).toFixed(2));
                    console.log("Entry " + self.date() + " - " + self.amount() + " added.");
                },
                update: function (obj, result) {
                    console.log("Entry " + self.date() + " - " + self.amount() + " updated.");
                }
            }
        );

        // Subscribe to exposed update fields
        this.amount.subscribe(function (newValue) { self.update(); });
        this.bank_note.subscribe(function (newValue) { self.update(); });
        this.date.subscribe(function (newValue) { self.update(); });
        this.note.subscribe(function (newValue) { self.update(); });
        this.tag.subscribe(function (newValue) { self.update(); });
        this.what.subscribe(function (newValue) { self.update(); });
        this.where.subscribe(function (newValue) { self.update(); });
    }

    updateFromObject(obj) {
        this.id(obj.id);
        this.account_id(obj.account_id);
        this.amount("" + obj.amount.toFixed(2));
        this.date(formatDateIso8601(obj.date));
        this.bank_note(obj.bank_note);
        this.note(obj.note);
        this.tag(obj.tag);
        this.what(obj.what);
        this.where(obj.where);
    }

    valuesOnly() {
        return {
            id:         this.id(),
            account_id: this.account_id(),
            amount:     this.amount(),
            date:       this.date(),
            bank_note:  this.bank_note(),
            note:       this.note(),
            tag:        this.tag(),
            what:       this.what(),
            where:      this.where(),
        };
    }
}