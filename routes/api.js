var express = require('express');
var router = express.Router();

var library = require('../controllers/library.js');

router.get('/:name/:version?', function(req, res) {
  var name = req.params.name;
  var version = req.params.version;
  var versions = library.getVersions(name);
  var callback = function(__err, __library){
    res.send(__library);
  };

  if(version){
    library.getByVersion(name, version, callback);
  }else{
    library.getByName(name, callback);
  }
});

module.exports = router;
