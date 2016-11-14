var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {

    req.db.serialize(function()
    {
        req.db.all("SELECT * FROM entry", function (err, rows)
        {
            console.log(rows);
        });

        res.render('base.html', {
            title: 'Express',
            items: [
                { name: "item1" },
                { name: "item2" },
                { name: "item3" },
            ]
        });

    });
});

module.exports = router;
