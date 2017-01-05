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
    constructor(object, field, container, className) {
        super(container, className);

        // Initialize
        var self    = this;
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

class DeleteButtonPanel extends UIComponent {
    constructor(object, container, className) {
        super(container, className);

        // Initialize
        var self    = this;
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
    constructor(object, field, container, className) {
        super(object, field, container, className);
        this.refresh();
    }

    refresh() {
        super.refresh();

        this.container.className = this.container.className.replace(" amt_positive", "");
        this.container.className = this.container.className.replace(" amt_negative", "");

        if (this.object[this.field] >= 0)
            this.container.className += " amt_positive";
        else
            this.container.className += " amt_negative";
    }
}

class TagSelectionField extends UIComponent {
    constructor(object, field, container, className) {
        super(container, className);

        // Initialize
        var self    = this;
        this.object = object;
        this.field  = field;

        // Set up elements
        this.input          = document.createElement("input");
        this.input.disabled = true;
        stylesugar_addClass(this.container, "tag_" + object[field]);
        stylesugar_addClass(this.input, "tag_" + object[field]);
        this.container.appendChild(this.input);

        // Initialize Tag Selection Widget
        TagSelectionField.initializeTagSelectionDiv();

        // Events
        this.container.onclick = () => {
            self.startEditing();
            var onclick = (e) => {
                if (e.path[0] != self.input && _.indexOf(e.path, TagSelectionField.tag_selector.container) == -1) {
                    document.getElementsByTagName("body")[0].removeEventListener("click", onclick);
                    self.stopEditing();
                }
            };
            document.getElementsByTagName("body")[0].addEventListener("click", onclick);
        };
        this.input.onchange    = () => {
            object[field] = this.input.value;
            object.update();
        };

        // Configure
        this.refresh(); // Set up correct field value
        self.stopEditing(); // Configure field to start in non-editing state
    }

    static initializeTagSelectionDiv() {
        if (!TagSelectionField.tag_selector) {
            TagSelectionField.tag_selector = new TagSelectionField_TagSelector();
        }
    }

    refresh() {
        this.input.value = this.object[this.field];
        // for (var str of this.container.className.split(" "))
        //     console.log(str);
    }

    startEditing() {
        console.log("Start editing " + this.object.id + " - " + this.object[this.field]);
        TagSelectionField.tag_selector.setMaster(this, this.object[this.field]);
        TagSelectionField.tag_selector.show(this);
    }

    stopEditing() {
        TagSelectionField.tag_selector.hide(this);
        TagSelectionField.tag_selector.clearMaster();
    }
}

class TagSelectionField_TagSelector {
    constructor() {
        this.master = null;

        this.container           = document.createElement("div");
        this.container.className = "tag_selector";
        document.getElementsByTagName("body")[0].appendChild(this.container);

        this.options              = {};
        this.options["Bank"]      = new TagSelectionField_TagSelector_Option("Bank");
        this.options["Music"]     = new TagSelectionField_TagSelector_Option("Music");
        this.options["Games"]     = new TagSelectionField_TagSelector_Option("Games");
        this.options["Groceries"] = new TagSelectionField_TagSelector_Option("Groceries");

        _.forIn(this.options, (value, key) => {
            this.container.appendChild(value.container);
        });
    }

    clearMaster() {
        this.master = null;
    }

    setMaster(field, value) {
        this.master = field;

        // Position
        var rect                     = field.input.getBoundingClientRect();
        this.container.style.left    = rect.left + "px";
        this.container.style.top     = rect.bottom + "px";
        this.container.style.display = "block";

        // Set value
        // this.options[value].select();
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
    constructor(value) {
        this.container = document.createElement("div");
        this.container.appendChild(document.createTextNode(value));

        stylesugar_addClass(this.container, "option");
        stylesugar_addClass(this.container, "tag_" + value);
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
    var br = document.createElement("br");
    if (clear)
        br.clear = "all";

    return br;
}

function domsugar_button(text, onclick, className, id) {
    var button = document.createElement("button");

    if (className)
        button.className = className;

    if (id)
        button.id = id;

    if (text)
        button.appendChild(document.createTextNode(text));

    if (onclick)
        button.onclick = onclick;

    return button;
};

function domsugar_clear(element) {
    while (element.firstChild) {
        element.removeChild(element.firstChild);
    }
}

function domsugar_h(level, text, content) {
    var elem = document.createElement("h" + level);
    elem.appendChild(document.createTextNode(text));

    if (content)
        elem.appendChild(content);

    return elem;
}

function domsugar_td(content, attributes) {
    var td = document.createElement("td");
    for (var k in attributes) {
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
    var span = document.createElement("span");
    if (italic)
        span.style.fontStyle = "italic";
    if (bold)
        span.style.fontWeight = "bold";
    if (style)
        span.setAttribute("style", style);

    span.appendChild(document.createTextNode(text));
    span.className = "text";

    return span;
};


/*  ---------------------------------------------------------------------------
 Style Sugar methods
 */

function stylesugar_hide(element) {
    element.oldDisplay    = element.style.display;
    element.style.display = "none";
}

function stylesugar_show(element) {
    if (element.oldDisplay)
        element.style.display = element.oldDisplay;
    else
        element.style.display = "block";
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

// DOMUtils.button = function(className, id, text, onclick)
// {
//     var button = document.createElement("button");
//
//     if (className)
//         button.className = className;
//
//     if (id)
//         button.id = id;
//
//     if (text)
//         button.innerHTML = text;
//
//     if (onclick)
//         button.onclick = onclick;
//
//     return button;
// };
//
//
//
//
// DOMUtils.container = function(className, id, text, style, content)
// {
//     var container = document.createElement("container");
//
//     if (className)
//         container.className = className;
//
//     if (id)
//         container.id = id;
//
//     if (text)
//         container.innerHTML = text;
//
//     if (style)
//         container.setAttribute("style", style);
//
//     if (content)
//         container.appendChild(content);
//
//     return container;
// };
//
//
//
//
// DOMUtils.fieldset = function (className, id, text, label)
// {
//     var fieldset = document.createElement("fieldset");
//
//     if (text)
//         fieldset.appendChild(document.createTextNode(text));
//
//     if (label)
//     {
//         var legend = document.createElement("legend");
//         legend.appendChild(document.createTextNode(label));
//         fieldset.appendChild(legend);
//         fieldset.legend = legend;
//     }
//
//     if (id)
//         fieldset.id = id;
//
//     if (className)
//         fieldset.className = className;
//
//     return fieldset;
// };
//
//
//
// DOMUtils.input = function(name, value, type, style, attributes)
// {
//     var node = document.createElement("input");
//     node.setAttribute("name", name);
//     node.setAttribute("value", value);
//     node.setAttribute("type", type);
//
//     if (style != null)
//         node.setAttribute("style", style);
//
//     for (var att in attributes)
//         node.setAttribute(att, attributes[att]);
//
//     return node;
// };
//
//
//
//
// DOMUtils.input_range = function(name, value, min, max, step, style)
// {
//     var node = document.createElement("input");
//     node.setAttribute("name", name);
//     node.setAttribute("value", value);
//     node.setAttribute("type", "range");
//     node.setAttribute("min", min);
//     node.setAttribute("max", max);
//     node.setAttribute("step", step);
//
//     if (style != null)
//         node.setAttribute("style", style);
//
//     return node;
//
// };
//
//
//
//
// DOMUtils.label = function(text, _for)
// {
//     var label = document.createElement("label");
//     label.innerHTML = text;
//
//     if (_for)
//         label.htmlFor = _for;
//
//     return label;
// };
//
//
//
//
// DOMUtils.link = function(href, text, target, onclick)
// {
//     // Create element
//     var a = document.createElement("a");
//     a.href = href;
//     a.appendChild(document.createTextNode(text));
//
//     // Set target, if provided
//     if (target)
//         a.target = target;
//
//
//     // Set onclick event, if provided
//     if (onclick)
//     {
//         if (typeof onclick == "function")
//             a.onclick = onclick;
//         else if (typeof onclick == "string")
//             a.onclick = Function(onclick);
//     }
//     return a;
// };
//
//
//
//
// DOMUtils.option = function (value, text, selected)
// {
//     var option = document.createElement("option");
//
//     option.value = value;
//
//     if (text)
//         option.innerHTML = text;
//     else
//         option.innerHTML = "No label";
//
//     if (selected)
//         option.selected = true;
//
//     return option;
// };
//
//
//
//
// DOMUtils.p = function (contents)
// {
//     var p = document.createElement("p");
//
//     p.appendChild(contents);
//
//     return p;
// };
//
//
//
//
// DOMUtils.parse = function (html)
// {
//     var doc = DOMUtils.parser.parseFromString(html, "text/xml");
//     if (doc)
//         return doc.firstChild;
//     else
//         return document.createTextNode("");
// };
//
//
//
//
// DOMUtils.radio = function (name, checked, id)
// {
//     var radio = document.createElement("input");
//
//     radio.type = "radio";
//     radio.name = name;
//     if (checked)
//         radio.checked = true;
//     if (id)
//         radio.id = id;
//
//     return radio;
// };
//
//
//
//
// // Create an HTML select box:
// // - name           - form name. Can be ""
// // - objects        - list of objects to use in creating select
// // - val_func       - Fn - extract value for select option from object
// // - label_func     - Fn - extract label for select option from object
// // - default_value  - default value. If null, use first in list
// DOMUtils.select = function (name, objects, val_func, label_func, default_value)
// {
//     var select = document.createElement("select");
//     select.name = name;
//
//     for (var i = 0 ; i < objects.length ; i ++)
//     {
//         var val = val_func(objects[i]);
//         var label = label_func(objects[i]);
//         var selected = false;
//         if (default_value !== null && val == default_value)
//             selected = true;
//
//         select.appendChild(DOMUtils.option(val, label, selected));
//     }
//
//     return select;
// };
//
//
//
//
// DOMUtils.span = function(className, id, text)
// {
//     var span = document.createElement("span");
//
//     if (className)
//         span.className = className;
//
//     if (id)
//         span.id = id;
//
//     if (text)
//         span.innerHTML = text;
//
//     return span;
// };
//
//
//
//
// DOMUtils.table = function (headers, className, headerClasses)
// {
//     // Validate
//     if (headerClasses && headers.length != headerClasses.length)
//         throw ("DOMUtils.table - array lengths mismatch");
//
//     // Create table
//     var table = document.createElement("table");
//     if (className)
//         $(table).addClass(className);
//
//     // Create headers
//     var tr = document.createElement("tr");
//     for (var i = 0 ; i < headers.length ; i ++)
//     {
//         // Create header cell
//         var th = document.createElement("th");
//         th.appendChild(document.createTextNode(headers[i]));
//         tr.appendChild(th);
//
//         // Style header cell
//         if (headerClasses)
//             $(th).addClass(headerClasses[i]);
//     }
//     table.appendChild(tr);
//
//     return table;
// };
//
//
//
//
// DOMUtils.table_row = function(contents, styles)
// {
//     // Validate
//     if (styles && contents.length != styles.length)
//         throw ("DOMUtils.table_row - array lengths mismatch");
//
//
//     // Create table cells from given contents
//     var tr = document.createElement("tr");
//     for (var i = 0 ; i < contents.length; i++)
//     {
//         // Create table cell
//         var td = document.createElement("td");
//         if (typeof contents[i] == "string")
//             td.appendChild(document.createTextNode(contents[i]));
//         else
//             td.appendChild(contents[i]);
//         tr.appendChild(td);
//
//         // Style table cell
//         if (styles)
//             td.style.cssText = styles[i];
//     }
//
//     return tr;
// };
//
//
