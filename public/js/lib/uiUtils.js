function formatDateIso8601(date) {
    // Is a numeric date in string or number form
    if (!isNaN(date)) {
        return new Date(Number.parseInt(date)).toISOString().substr(0, 10);
    }

    // Is a string date
    else if (typeof(date) === "string" && date.match(/^(\d{4})-(\d{2})-(\d{2})$/)) {
        return new Date(date).toISOString().substr(0, 10);
    }

    // Is invalid
    else {
        return "Invalid";
    }
}

class UIComponent {
    constructor(container, className) {
        // Test contract
        console.assert(
            (typeof(container) === "string" && (container == "td" || container == "div")) ||
            (typeof(container) === "object" && container instanceof HTMLElement), "Invalid container");

        // Set up container
        if (typeof(container) === "string")
            this.container = document.createElement(container);
        else
            this.container = container;

        // Set up container CSS
        if (className)
            this.container.className = className;
    }
}

class EditableTextField extends UIComponent {
    constructor(object, field, container, className, flag_triggerUpdates) {
        super(container, className);

        // Initialize
        let self    = this;
        this.object = object;
        this.field  = field;

        // Set up elements
        this.input                = document.createElement("input");
        this.span_error           = document.createElement("span");
        this.span_error.className = "error";
        this.container.appendChild(this.input);
        this.container.appendChild(this.span_error);

        // Events
        this.container.onclick = () => { self.startEditing(); };
        this.input.onblur      = () => { if (!this.dirty) { self.stopEditing(); } };
        this.input.onchange    = () => {
            this.dirty    = true;
            object[field] = this.input.value;
            if (flag_triggerUpdates)
                object.update();
        };

        // Configure
        this.refresh(); // Set up correct field value
        self.stopEditing(); // Configure field to start in non-editing state
    }

    refresh() {
        this.input.value = this.object[this.field];

        domsugar_clear(this.span_error);
        if (!this.object.valid(this.field)) {
            this.span_error.appendChild(document.createTextNode(this.object.validationString(this.field)));
            this.container.className += " error";
            this.span_error.style.display = "block";
        }
        else {
            this.container.className      = this.container.className.replace(" error", "");
            this.span_error.style.display = "none";
        }
    }

    startEditing() {
        this.input.disabled = false;
        this.input.focus();
    }

    stopEditing() {
        this.dirty          = false;
        this.input.disabled = true;
    }
}

class TextField extends UIComponent {
    constructor(object, field, container, className) {
        super(container, className);

        // Initialize
        let self    = this;
        this.object = object;
        this.field  = field;

        // Set up elements
        this.input = document.createElement("input");
        this.container.appendChild(this.input);

        // Configure
        this.refresh(); // Set up correct field value
        this.input.disabled = true;
    }

    refresh() {
        this.input.value = this.object[this.field];
    }
}

class AmountTextField extends TextField {
    constructor(object, field, container, className) {
        super(object, field, container, className);
        this.refresh();
    }

    refresh() {
        super.refresh();

        $(this.container).removeClass("amt_positive");
        $(this.container).removeClass("amt_negative");

        if (this.object[this.field] >= 0)
            $(this.container).addClass("amt_positive");
        else
            $(this.container).addClass("amt_negative");
    }
}

class AddButtonPanel extends UIComponent {
    constructor(object, container, className) {
        super(container, className);

        // Initialize
        let self    = this;
        this.object = object;

        // Set up elements
        this.button = domsugar_button("Add");
        this.container.appendChild(this.button);

        // Events
        this.button.onclick = () => { object.add(); };
    }
}

class DeleteButtonPanel extends UIComponent {
    constructor(object, container, className) {
        super(container, className);

        // Initialize
        let self    = this;
        this.object = object;

        // Set up elements
        this.button_del        = domsugar_button("Delete");
        this.button_delConfirm = domsugar_button("Confirm");
        this.button_delCancel  = domsugar_button("Cancel");
        this.container.appendChild(this.button_del);
        this.container.appendChild(this.button_delConfirm);
        this.container.appendChild(this.button_delCancel);

        // Events
        this.button_del.onclick        = () => { this.setState_confirming(); };
        this.button_delCancel.onclick  = () => { this.setState_rest(); };
        this.button_delConfirm.onclick = () => { object.del(); };

        // Configure
        this.setState_rest(); // Start in rest state
    }

    setState_confirming() {
        stylesugar_hide(this.button_del);
        stylesugar_show(this.button_delConfirm);
        stylesugar_show(this.button_delCancel);
    }

    setState_rest() {
        stylesugar_show(this.button_del);
        stylesugar_hide(this.button_delConfirm);
        stylesugar_hide(this.button_delCancel);
    }
}

class EditableAmountTextField extends EditableTextField {
    constructor(object, field, container, className, flag_triggerUpdates) {
        super(object, field, container, className, flag_triggerUpdates);
        this.refresh();
    }

    refresh() {
        super.refresh();

        $(this.container).removeClass("amt_positive");
        $(this.container).removeClass("amt_negative");

        if (this.object[this.field] >= 0)
            $(this.container).addClass("amt_positive");
        else
            $(this.container).addClass("amt_negative");
    }
}

class TagSelectionField extends UIComponent {
    constructor(object, field, tags, container, className, flag_triggerUpdates) {
        super(container, className);

        // Initialize
        let self                 = this;
        this.object              = object;
        this.flag_triggerUpdates = flag_triggerUpdates;
        this.field               = field;

        // Set up elements
        this.input          = document.createElement("input");
        this.input.disabled = true;
        this.setTagStyle(object[field]);
        this.container.appendChild(this.input);

        // Initialize Tag Selection Widget
        TagSelectionField.initializeTagSelectionDiv(tags);

        // Events
        this.container.onclick = () => {
            self.startEditing();
            let onclick = (e) => {
                if (e.path[0] != self.input && _.indexOf(e.path, TagSelectionField.tag_selector.container) == -1) {
                    window.removeEventListener("click", onclick);
                    self.stopEditing();
                }
            };
            window.addEventListener("click", onclick);
        };

        // Configure
        this.refresh(); // Set up correct field value
        self.stopEditing(); // Configure field to start in non-editing state
    }

    static initializeTagSelectionDiv(tags) {
        if (!TagSelectionField.tag_selector) {
            TagSelectionField.tag_selector = new TagSelectionField_TagSelector(tags);
        }
    }

    refresh() {
        this.input.value = this.object[this.field];
    }

    setSelectedValue(selected) {
        // Change cell values
        this.setTagStyle(selected);
        this.input.value = selected;

        // Animate green flash
        let self                             = this;
        this.container.style.backgroundColor = "#38ff65";
        setTimeout(() => { self.container.style.backgroundColor = ""; }, 600);

        // Update
        this.object[this.field] = selected;
        if (this.flag_triggerUpdates)
            this.object.update();
    }

    setTagStyle(selected) {
        stylesugar_clearClasses(this.input);
        stylesugar_addClass(this.input, "tag_" + selected.replace(" ", "_"));
    }


    startEditing() {
        TagSelectionField.tag_selector.setMaster(this, this.object[this.field]);
        TagSelectionField.tag_selector.setSelectedOption(this, this.object[this.field]);
        TagSelectionField.tag_selector.show(this);
        stylesugar_addClass(this.input, "editing");
    }

    stopEditing() {
        TagSelectionField.tag_selector.hide(this);
        TagSelectionField.tag_selector.clearMaster(this);
        stylesugar_removeClass(this.input, "editing");
    }
}

class TagSelectionField_TagSelector {
    constructor(tags) {
        // Initialize
        let self    = this;
        this.master = null;

        // Create container
        this.container           = document.createElement("div");
        this.container.className = "tag_selector";
        stylesugar_hide(this.container);
        document.getElementsByTagName("body")[0].appendChild(this.container);

        // Create options
        this.options = {};
        _.each(tags, (tag) => {
            this.options[tag] = new TagSelectionField_TagSelector_Option(tag, self);
            self.container.appendChild(this.options[tag].container);
        });
    }

    clearMaster(authority) {
        if (this.master == authority)
            this.master = null;
    }

    setMaster(field, value) {
        this.master = field;

        // Position
        let rect                     = field.input.getBoundingClientRect();
        this.container.style.left    = (rect.left - 21) + "px";
        this.container.style.top     = rect.bottom + "px";
        this.container.style.display = "block";
    }

    setSelectedOption(authority, selected) {
        if (this.master == authority) {
            _.each(this.options, function (v) { v.deselect(); });
            if (this.options[selected])
                this.options[selected].select();
            else
                console.log("Cannot set selected to " + selected + " - does not exist");
        }
    }

    setSelectedValue(selected) {
        if (this.master)
            this.master.setSelectedValue(selected);
    }

    hide(authority) {
        if (this.master == authority)
            stylesugar_hide(this.container);
    }

    show(authority) {
        if (this.master == authority)
            stylesugar_show(this.container);
    }
}

class TagSelectionField_TagSelector_Option {
    constructor(value, selector) {
        // Initialize
        let self      = this;
        this.selector = selector;
        this.value    = value;

        // Create container
        this.container = document.createElement("div");
        this.container.appendChild(document.createTextNode(value));
        stylesugar_addClass(this.container, "option");
        stylesugar_addClass(this.container, "tag_" + value.replace(" ", "_"));

        // Events
        this.container.onclick = () => {
            self.selector.setSelectedValue(self.value);
        };
    }

    deselect() {
        stylesugar_removeClass(this.container, "selected");
    }

    select() {
        stylesugar_addClass(this.container, "selected");
    }
}


/*  ---------------------------------------------------------------------------
 DOM Sugar methods
 */

function domsugar_br(clear) {
    let br = document.createElement("br");
    if (clear)
        br.clear = "all";

    return br;
}

function domsugar_button(text, onclick, className, id) {
    let button = document.createElement("button");

    if (className)
        button.className = className;

    if (id)
        button.id = id;

    if (text)
        button.appendChild(document.createTextNode(text));

    if (onclick)
        button.onclick = onclick;

    return button;
}

function domsugar_clear(element) {
    while (element.firstChild) {
        element.removeChild(element.firstChild);
    }
}

function domsugar_h(level, text, content) {
    let elem = document.createElement("h" + level);
    elem.appendChild(document.createTextNode(text));

    if (content)
        elem.appendChild(content);

    return elem;
}

function domsugar_td(content, attributes) {
    let td = document.createElement("td");
    for (let k in attributes) {
        //noinspection JSUnfilteredForInLoop
        td.setAttribute(k, attributes[k]);
    }

    if (typeof(content) === "string" || typeof(content) === "number")
        td.appendChild(document.createTextNode(content));
    else if (typeof(content) === "object")
        td.appendChild(content);

    return td;
}

function domsugar_text(text, bold, italic, style) {
    let span = document.createElement("span");
    if (italic)
        span.style.fontStyle = "italic";
    if (bold)
        span.style.fontWeight = "bold";
    if (style)
        span.setAttribute("style", style);

    span.appendChild(document.createTextNode(text));
    span.className = "text";

    return span;
}


/*  ---------------------------------------------------------------------------
 Style Sugar methods
 */

function stylesugar_hide(element) {
    if (element.style.display)
        element.oldDisplay = element.style.display;

    element.style.display = "none";
}

function stylesugar_show(element) {
    if (element.oldDisplay)
        element.style.display = element.oldDisplay;
    else
        element.style.display = "";
}

function stylesugar_addClass(element, className) {
    if (!element instanceof HTMLElement)
        throw new Error("Can't add class to non-element");

    element.className = " " + element.className + " ";
    if (!element.className.includes(" " + className + " ")) {
        element.className += className;
        element.className = element.className.trim();
    }
}

function stylesugar_clearClasses(element) {
    if (!element instanceof HTMLElement)
        throw new Error("Can't clear classes from non-element");

    element.className = "";
}

function stylesugar_removeClass(element, className) {
    if (!element instanceof HTMLElement)
        throw new Error("Can't remove class from non-element");

    element.className = " " + element.className + " ";
    element.className = element.className.replace(" " + className, "");
    element.className = element.className.trim();
}