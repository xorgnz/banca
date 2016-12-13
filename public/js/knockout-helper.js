/**
 * Created by xorgnz on 2016-12-09.
 */
ko.bindingHandlers.groupFocus = {
    init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
        // Add onclick to all table cells in this row such that whenever one is clicked,
        // - editing mode for this row is enabled
        // - the first input in that cell is focused
        $(element).find("td:has(input, select)").click(function () {
            if (!bindingContext.$data.deleting()) {
                bindingContext.$data.editing(true);
                $(this).find("input,select").focus();
            }
        });

        // Add onfocusout to the row such that whenever the user focuses elsewhere:
        // - editing mode is preserved if they clicked elsewhere in the same row
        // - editing mode is preserved if validation results are still pending for this row
        // - editing mode is disabled if they clicked somewhere else and there is no validation pending
        $(element).focusout(function () {
            setTimeout(function () {
                if ($(element).find("input").is(":focus")) {
                    bindingContext.$data.editing(true);
                } else if (_.size(bindingContext.$data.validationResults()) > 0) {
                    bindingContext.$data.editing(true);
                } else {
                    bindingContext.$data.editing(false);
                }
            }, 1);
        });
    },
    update: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
        // Do nothing
    }
};