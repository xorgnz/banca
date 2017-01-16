class Period {
    constructor(obj, viewModel) {
        this._viewModel = viewModel;
        var self        = this;

        // Storage
        this.id         = obj.id;
        this.name       = obj.name;
        this.date_start = new Date(obj.date_start);
        this.date_end   = new Date(obj.date_end);
    }
}