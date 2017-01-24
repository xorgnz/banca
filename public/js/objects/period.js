class Period {
    constructor(obj) {
        var self = this;

        // Storage
        this.id         = obj.id;
        this.name       = obj.name;
        this.date_start = new Date(obj.date_start);
        this.date_end   = new Date(obj.date_end);
    }

    expressAsPanel() {
        var div       = document.createElement("div");
        div.className = "data_panel";
        div.append(domsugar_h(1, "Period Information"));
        div.append(domsugar_text("Start: " + new Date(this.date_start).toISOString().substr(0,10)));
        div.append(domsugar_br());
        div.append(domsugar_text("End: " + new Date(this.date_end).toISOString().substr(0,10)));
        return div;
    }
}