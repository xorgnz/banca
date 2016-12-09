
exports.stripDatabasePrefix = function(objects) {
    var fixedObjects = [];
    
    for (var object of objects)
    {
        var fixedObject = {};
        for (var key in object)
        {
            var fixedKey = key.substr(key.indexOf("_") + 1);
            fixedObject[fixedKey] = object[key];
        }
        fixedObjects.push(fixedObject);
    }

    return fixedObjects;
}

