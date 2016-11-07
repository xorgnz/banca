var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {

    req.db.serialize(function()
    {
        req.db.each("SELECT * FROM Category", function (err, row)
        {
            console.log(row);
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
