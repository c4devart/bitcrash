var express = require('express');
var router = express.Router();

var model = require('./model/bot');
router.post('/list', async function (req, res) {
    const { search_key, page, limit } = req.body
    var i_page = isNaN(parseInt(page)) ? 1 : parseInt(page)
    var i_limit = isNaN(parseInt(limit)) ? 1 : parseInt(limit)
    var data = await model.getList(search_key, i_page, i_limit)
    return res.json({
        code: 20000,
        data: data
    })
});
router.post('/update', function (req, res) {
    var ret = model.update(req.body)
    return res.json({
        code: ret ? 20000 : 60000,
        message: ret ? '' : 'Error',
        data: null
    })
});
router.post('/add', function (req, res) {
    var ret = model.add(req.body)
    return res.json({
        code: ret ? 20000 : 60000,
        message: ret ? '' : 'Error',
        data: null
    })
});
module.exports = router;
