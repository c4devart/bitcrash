var express = require('express');
var router = express.Router();

var userModel = require('./model/admin_user');
router.post('/login', function (req, res) {
  const {
    search_key,
    password,
    token
  } = req.body
  var data = {}
  if (token !== undefined && token != null && token.length > 0) {
    data = {
      token: token
    }
  } else {
    data = {
      search_key: search_key,
      password: password
    }
  }
  userModel.getUserInfo(data, function (rows) {
    var token = null
    if (rows.length < 1) {
      return res.json({
        code: 60204,
        message: 'Incorrect Username or Password. Please try again.'
      })
    } else {
      if (rows[0]['DEL_YN'] != 'N') {
        return res.json({
          code: 60204,
          message: 'You are not allowed to use this account. Do you need support?'
        })
      } else {
        token = rows[0]['ID'] // rows[0]['API_TOKEN']
      }
    }

    var data = rows[0]
    data["token"] = token // rows[0]['API_TOKEN']
    data["id"] = rows[0]['ID']
    return res.json({
      code: 20000,
      data: data
    });
  });
});

router.post('/info', function (req, res) {
  const {
    token
  } = req.body
  userModel.getUserInfo({
    token: token
  }, function (rows) {
    if (rows.length < 1 || rows[0]['DEL_YN'] != 'N') {
      return res.json({
        code: 50008,
        message: 'Login failed, unable to get user details.'
      })
    }
    return res.json({
      code: 20000,
      data: rows[0]
    });
  });
});

router.post('/update', function (req, res) {
  const {
    old_pwd,
    new_pwd
  } = req.body

  var update_data = {}
  if (old_pwd != undefined && old_pwd != '') {
    update_data['old_pwd'] = old_pwd
  }
  if (new_pwd != undefined && new_pwd != '') {
    update_data['new_pwd'] = new_pwd
  }

  userModel.updateUserInfo(update_data, function (result) {
    if (result == false) {
      return res.json({
        code: 50008,
        message: 'Updating info failed'
      })
    }

    return res.json({
      code: 20000,
      data: null
    });
  });
});

// router.post('/signup', async function (req, res) {
//   const { username, email, password } = req.body

//   var ret = await userModel.signup({ username: username, email: email, password: password })
//   if (ret.code == false) {
//     return res.json({
//       code: 50000,
//       data: 'Signup Failed'
//     });
//   } else {
//     return res.json({
//       code: 20000,
//       data: {
//         user_id: ret.insert_id,
//         token: ret.token
//       }
//     });
//   }
// });
router.post('/logout', function (req, res) {
  return res.json({
    code: 20000,
    data: ''
  });
});

module.exports = router;