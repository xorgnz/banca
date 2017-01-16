class Accounting extends AjaxRestObject {
    constructor(obj, viewModel) {
        super("/rest/account/", "account");

        this._viewModel = viewModel;
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

        // Register for AJAX calls
        // decorateAjaxRest(
        //     self, "account", "/rest/account/",
        //     {
        //         del:    function () {
        //             self._viewModel.accounts.remove(self);
        //             console.log("Account " + self.name() + " removed.");
        //         },
        //         add:    function () {
        //             self._viewModel.accounts.push(self);
        //             self._viewModel.blankNewAccount();
        //             console.log(self);
        //             console.log("Account " + self.name() + " added.");
        //         },
        //         update: function () {
        //             console.log("Account " + self.name() + " updated.");
        //         }
        //     }
        // );
    }


    expressAsTable() {
        var div = document.createElement("div");
        div.appendChild(document.createTextNode(this));
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