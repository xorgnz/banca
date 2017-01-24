class Accounting extends AjaxRestObject {
    constructor(obj) {
        super("/rest/account/", "account");

        var self        = this;

        // Storage
        this.id           = obj.id;
        this.amount_start = "" + obj.amount_start.toFixed(2);
        this.amount_end   = "" + obj.amount_end.toFixed(2);
        this.account_id   = obj.account_id;
        this.period       = {
            id:         obj.period.id,
            name:       obj.period.name,
            date_start: obj.period.date_start,
            date_end:   obj.period.date_end
        };
    }

    expressAsPanel() {
        var div = document.createElement("div");
        div.className = "data_panel";
        div.append(domsugar_h(1, "Accounting Information"));
        div.append(domsugar_text("Start Balance: " + this.amount_start));
        div.append(domsugar_br());
        div.append(domsugar_text("End Balance: " + this.amount_end));
        return div;
    }

    updateFromObject(obj) {
        this.id           = obj.id;
        this.amount_start = obj.amount_start;
        this.amount_end   = obj.amount_end;
        this.account_id   = obj.account_id;
        this.period_id    = obj.period_id;
    }

    valuesOnly() {
        return {
            id:           this.id,
            amount_start: this.amount_start,
            amount_end:   this.amount_end,
            account_id:   this.account_id,
            period_id:    this.period.id,
        };
    }
}