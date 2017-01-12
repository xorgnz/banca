// Namespace declarations to fix erroneous warnings in WebStorm
// without disabling unresolved variable checking.
//
// Depending on how a Node.JS module is constructed, WebStorm
// sometimes doesn't believe it provides the functions that it does.
// Declaring them this way fixes it.

/** @namespace check.assigned */
/** @namespace check.emptyString */
/** @namespace check.nonEmptyString */
/** @namespace check.instanceStrict */
/** @namespace check.instance */
/** @namespace check.number */
/** @namespace check.string */

/** @namespace sqlite3.Database */
