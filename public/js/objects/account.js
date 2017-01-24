class Account extends AjaxRestObject {
    constructor(obj) {
        super("/rest/account/", "account");

        var self = this;

        // Storage
        this.id          = obj.id;
        this.name        = obj.name;
        this.description = obj.description;
    }

    expressAsPanel() {
        var div = document.createElement("div");
        div.className = "data_panel";
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