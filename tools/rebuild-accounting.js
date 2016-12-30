const sqlite3  = require("sqlite3");
const db       = new sqlite3.Database('database.sqlite');
const accountingDAO = require("../dao/accounting.js");

Promise.resolve()
    .then(() => { return accountingDAO.listAll(db); })
    .then((accountings) => {
        var promises = [];
        for (var a of accountings)
            promises.push(accountingDAO.calc(db, a.id));
        return Promise.all(promises);
    })

    .then(() => { return accountingDAO.listAll(db); })
    .then((accountings) => { return accountingDAO.cascade(accountings[0]); })
    .then(() => { console.log("Rebuild complete!"); })

    .catch((e) => {
        console.log("Rebuild failed!");
        console.log(e);
    });
