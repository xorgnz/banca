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


class EditableTextField {
    constructor(object, field, container, className) {
        var self    = this;
        this.object = object;
        this.field  = field;

        // Set up container
        console.assert(
            (typeof(container) === "string" && (container == "td" || container == "div")) ||
            (typeof(container) === "object" && container instanceof HTMLElement), "Invalid container");
        if (typeof(container) === "string")
            this.container = document.createElement(container);
        else
            this.container = container;

        // Set CSS class
        if (className)
            this.container.className = className;

        // Set up elements
        this.input                = document.createElement("input");
        this.input.disabled       = true;
        this.span_error           = document.createElement("span");
        this.span_error.className = "error";
        this.container.appendChild(this.input);
        this.container.appendChild(this.span_error);
        this.refresh();

        // Events
        this.container.onclick = () => { self.startEditing(); };
        this.input.onblur      = () => { self.stopEditing(); };
        this.input.onchange    = () => {
            this.dirty    = true;
            object[field] = this.input.value;
            object.update();
        };
    }

    refresh() {
        this.input.value = this.object[this.field];

        domsugar_clear(this.span_error);
        if (! this.object.valid(this.field)) {
            this.span_error.appendChild(document.createTextNode(this.object.validationString(this.field)));
            this.container.className += " error";
            this.span_error.style.display = "block";
        }
        else {
            this.container.className = this.container.className.replace(" error", "");
            this.span_error.style.display = "none";
        }
    }

    startEditing() {
        this.input.disabled = false;
        this.input.focus();
    }

    stopEditing() {
        if (!this.dirty) {
            this.input.disabled = true;
        }
    }
}

class DeleteButtonPanel {
    constructor(object, container, className) {
        var self    = this;
        this.object = object;

        // Set up container
        console.assert(
            (typeof(container) === "string" && (container == "td" || container == "div")) ||
            (typeof(container) === "object" && container instanceof HTMLElement), "Invalid container");
        if (typeof(container) === "string")
            this.container = document.createElement(container);
        else
            this.container = container;

        // Set CSS class
        if (className)
            this.container.className = className;

        // Set up elements
        var button_del        = domsugar_button("Delete");
        var button_delConfirm = domsugar_button("Confirm");
        var button_delCancel  = domsugar_button("Cancel");
        stylesugar_hide(button_delConfirm);
        stylesugar_hide(button_delCancel);
        this.container.appendChild(button_del);
        this.container.appendChild(button_delConfirm);
        this.container.appendChild(button_delCancel);

        // Events
        button_del.onclick        = () => {
            stylesugar_hide(button_del);
            stylesugar_show(button_delConfirm);
            stylesugar_show(button_delCancel);
        };
        button_delCancel.onclick  = () => {
            stylesugar_show(button_del);
            stylesugar_hide(button_delConfirm);
            stylesugar_hide(button_delCancel);
        };
        button_delConfirm.onclick = () => {
            object.del();
        };
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


function stylesugar_hide(element) {
    element.style.oldDisplay = element.style.display;
    element.style.display    = "none";
}

function stylesugar_show(element) {
    if (element.style.oldDisplay)
        element.style.display = element.style.oldDisplay;
    else
        element.style.display = "inline";
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
