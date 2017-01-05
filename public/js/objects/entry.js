class Entry extends AjaxRestObject {
    constructor(obj, budget_allocations, viewModel) {
        super("/rest/entry/", "entry");

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
        this.ui_tr = null;

        // AJAX callbacks
        this.callbacks.del = function (result) {
            _.pull(viewModel.entries, self);
            self.ui_tr.parentNode.removeChild(self.ui_tr);
            console.log("Entry " + self.date + " - " + self.amount + " removed.");
        };

        this.callbacks.add = function (result) {
            viewModel.entries.push(self);
            viewModel.blankNewEntry();
            this.amount = "" + Number.parseFloat(this.amount).toFixed(2);
            console.log("Entry " + self.date + " - " + self.amount + " added.");
        };

        this.callbacks.update = function (result) {
            self.refreshFields();
            if (result.success) {
                console.log("Entry " + self.date + " - " + self.amount + " updated.");
                self.releaseFields();
            }
            else {
                console.log("Entry " + self.date + " - " + self.amount + " update failed.");
            }
        }
    }

    expressAsEditableTableRow() {
        var self = this;

        this.field_date      = new EditableTextField(this, "date", "td", "width-3");
        this.field_bank_note = new EditableTextField(this, "bank_note", "td", "width-6");
        this.field_note      = new EditableTextField(this, "note", "td", "width-6");
        // this.field_tag       = new EditableTagField(this, "tag", "td", "width-3");
        this.field_where     = new EditableTextField(this, "where", "td", "width-6");
        this.field_what      = new EditableTextField(this, "what", "td", "width-6");
        this.field_amount    = new EditableAmountTextField(this, "amount", "td", "width-3");
        
        this.deleteButtons = new DeleteButtonPanel(this, "td", "width-3");

        // Make static TDs
        this.ui_tr = document.createElement("tr");

        this.ui_tr.appendChild(domsugar_td(this.id, {class: "id"}));
        this.ui_tr.appendChild(this.field_date.container);
        this.ui_tr.appendChild(this.field_bank_note.container);
        this.ui_tr.appendChild(this.field_note.container);
        this.ui_tr.appendChild(domsugar_td(this.tag, {class: "tag_" + this.tag.replace(" ", "_")}));
        this.ui_tr.appendChild(this.field_where.container);
        this.ui_tr.appendChild(this.field_what.container);
        this.ui_tr.appendChild(this.field_amount.container);
        this.ui_tr.appendChild(this.deleteButtons.container);

        return this.ui_tr;
    }

    refreshFields() {
        this.field_date.refresh();
        this.field_bank_note.refresh();
        this.field_note.refresh();
        // this.field_tag.refresh();
        this.field_where.refresh();
        this.field_what.refresh();
        this.field_amount.refresh();
    }

    releaseFields() {
        this.field_date.input.disabled = true;
        this.field_bank_note.input.disabled = true;
        this.field_note.input.disabled = true;
        // this.field_tag.input.disabled = true;
        this.field_where.input.disabled = true;
        this.field_what.input.disabled = true;
        this.field_amount.input.disabled = true;
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