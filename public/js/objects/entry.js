class Entry extends AjaxRestObject {
    constructor(obj, budget_allocations, viewModel) {
        super("/rest/entry/", "entry");

        this.viewModel = viewModel;
        var self       = this;

        // Storage - Fields
        this.id                 = obj.id;
        this.account_id         = obj.account_id;
        this.amount             = "" + obj.amount.toFixed(2);
        this.date               = formatDateIso8601(obj.date);
        this.bank_note          = obj.bank_note;
        this.note               = obj.note;
        this.tag                = obj.tag;
        this.what               = obj.what;
        this.where              = obj.where;

        // Storage Other
        this.balance          = 0;
        this.balance_previous = 0;
        this.budget_allocations = budget_allocations;
        this.neighbor_previous = null;
        this.neighbor_next     = null;

        // UI
        this.container = null;

        // AJAX callbacks
        this.callbacks.del = function (result) {
            if (result.success) {
                console.log("Entry " + self.date + " - " + self.amount + " removed.");
            }
        };

        this.callbacks.add = function (result) {
            if (result.success) {
                console.log("Entry " + self.date + " - " + self.amount + " added.");
            }
            else {
                console.log("Entry " + self.date + " - " + self.amount + " add failed.");
            }
            self.refreshFields();
            self.releaseFields();
        };

        this.callbacks.update = function (result) {
            if (result.success) {
                console.log("Entry " + self.date + " - " + self.amount + " updated.");
            }
            else {
                console.log("Entry " + self.date + " - " + self.amount + " update failed.");
            }
            self.refreshFields();
            self.releaseFields();
        }
    }

    expressAsEditableTableRow() {
        var self = this;

        // Create components
        this.field_date      = new EditableTextField(this, "date", "td", "width-3", true);
        this.field_tag       = new TagSelectionField(this, "tag", this.viewModel.entryTags, "td", "width-3", true);
        this.field_bank_note = new EditableTextField(this, "bank_note", "td", "width-6", true);
        this.field_note      = new EditableTextField(this, "note", "td", "width-6", true);
        this.field_where     = new EditableTextField(this, "where", "td", "width-6", true);
        this.field_what      = new EditableTextField(this, "what", "td", "width-6", true);
        this.field_amount    = new EditableAmountTextField(this, "amount", "td", "width-3", true);
        this.field_balance   = domsugar_td(this.balance, {class: "balance"});
        this.buttons         = new DeleteButtonPanel(this, "td", "width-3", true);

        // Create container
        this.container = document.createElement("tr");

        // Assemble
        this.container.appendChild(domsugar_td(this.id, {class: "id"}));
        this.container.appendChild(this.field_date.container);
        this.container.appendChild(this.field_tag.container);
        this.container.appendChild(this.field_bank_note.container);
        this.container.appendChild(this.field_note.container);
        this.container.appendChild(this.field_where.container);
        this.container.appendChild(this.field_what.container);
        this.container.appendChild(this.field_amount.container);
        this.container.appendChild(this.field_balance);
        this.container.appendChild(this.buttons.container);

        return this.container;
    }

    expressAsAddForm() {
        var self = this;

        // Create components
        this.field_date      = new EditableTextField(this, "date", "td", "width-3", false);
        this.field_tag       = new TagSelectionField(this, "tag", this.viewModel.entryTags, "td", "width-3", false);
        this.field_bank_note = new EditableTextField(this, "bank_note", "td", "width-6", false);
        this.field_note      = new EditableTextField(this, "note", "td", "width-6", false);
        this.field_where     = new EditableTextField(this, "where", "td", "width-6", false);
        this.field_what      = new EditableTextField(this, "what", "td", "width-6", false);
        this.field_amount    = new EditableAmountTextField(this, "amount", "td", "width-3", false);
        this.field_balance   = domsugar_td(this.balance, {class: "balance"});
        this.buttons         = new AddButtonPanel(this, "td", "width-3");

        // Create container
        this.container = document.createElement("tr");

        // Assemble
        this.container.appendChild(domsugar_td("", {class: "id"}));
        this.container.appendChild(this.field_date.container);
        this.container.appendChild(this.field_tag.container);
        this.container.appendChild(this.field_bank_note.container);
        this.container.appendChild(this.field_note.container);
        this.container.appendChild(this.field_where.container);
        this.container.appendChild(this.field_what.container);
        this.container.appendChild(this.field_amount.container);
        this.container.appendChild(this.field_balance);
        this.container.appendChild(this.buttons.container);

        return this.container;
    }

    cascadingBalanceUpdate(val) {
        this.balance_previous = val;
        this.balance          = this.balance_previous + Number.parseFloat(this.amount);
        if (this.field_balance)
            $(this.field_balance).text(this.balance);

        if (this.neighbor_next)
            this.neighbor_next.cascadingBalanceUpdate(this.balance);
    }

    refreshFields() {
        this.field_date.refresh();
        this.field_bank_note.refresh();
        this.field_note.refresh();
        this.field_tag.refresh();
        this.field_where.refresh();
        this.field_what.refresh();
        this.field_amount.refresh();
    }

    releaseFields() {
        this.field_date.stopEditing();
        this.field_bank_note.stopEditing();
        this.field_note.stopEditing();
        this.field_tag.stopEditing();
        this.field_where.stopEditing();
        this.field_what.stopEditing();
        this.field_amount.stopEditing();
    }

    linkNeighbors(previous, next) {
        this.neighbor_previous = previous;
        this.neighbor_next     = next;
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