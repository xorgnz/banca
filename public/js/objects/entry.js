class Entry {
    constructor(obj, budget_allocations, viewModel) {
        this._viewModel = viewModel;
        var self        = this;

        // Storage
        this.id                 = obj.id;
        this.account_id         = obj.account_id;
        this.amount             = "" + obj.amount.toFixed(2);
        this.date               = formatDateIso8601(obj.date);
        this.bank_note          = obj.bank_note;
        this.note               = obj.note;
        this.tag                = obj.tag;
        this.what               = obj.what;
        this.where              = obj.where;
        this.budget_allocations = budget_allocations;

        // UI
        var ui_tr = null;

        // Decorate as rest managed object
        decorateAjaxRest(
            self, "entry", "/rest/entry/",
            {
                del:    function (obj, result) {
                    _.remove(viewModel.entries, self);
                    console.log("Entry " + self.date + " - " + self.amount + " removed.");
                },
                add:    function (obj, result) {
                    viewModel.entries.push(self);
                    viewModel.blankNewEntry();
                    this.amount = "" + Number.parseFloat(obj.amount).toFixed(2);
                    console.log("Entry " + self.date + " - " + self.amount + " added.");
                },
                update: function (obj, result) {
                    console.log("Entry " + self.date + " - " + self.amount + " updated.");
                }
            }
        );
    }

    expressAsEditableTableRow() {
        var tds = [];
        var self = this;

        tds.push(domsugar_td(this.id, {class: "center"}));
        tds.push(domsugar_td(this.date, {class: "bold"}));
        tds.push(domsugar_td(this.bank_note, {class: "bold"}));
        tds.push(domsugar_td(this.note, {class: "bold"}));
        tds.push(domsugar_td(this.tag, {class: "bold tag_" + this.tag.replace(" ", "_")}));
        tds.push(domsugar_td(this.where, {class: "bold"}));
        tds.push(domsugar_td(this.what, {class: "bold"}));
        tds.push(domsugar_td(this.amount, {class: "bold amt_" + (this.amount >= 0 ? "positive": "negative")}));

        tds.push(domsugar_td(buildsugar_deleteButtons(() => {
            this.del();
            self.ui_tr.parentNode.removeChild(self.ui_tr);
        })));

        this.ui_tr = document.createElement("tr");
        for (var td of tds)
            this.ui_tr.appendChild(td);

        return this.ui_tr;
    }

    updateFromObject(obj) {
        this.id         = obj.id;
        this.account_id = obj.account_id;
        this.amount     = "" + obj.amount.toFixed(2);
        this.date       = formatDateIso8601(obj.date);
        this.bank_note  = obj.bank_note;
        this.note       = obj.note;
        this.tag        = obj.tag;
        this.what       = obj.what;
        this.where      = obj.where;
    }

    valuesOnly() {
        return {
            id:         this.id,
            account_id: this.account_id,
            amount:     this.amount,
            date:       this.date,
            bank_note:  this.bank_note,
            note:       this.note,
            tag:        this.tag,
            what:       this.what,
            where:      this.where,
        };
    }
}