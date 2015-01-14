var express = require('express');
var router = express.Router();

var library = require('../controllers/library.js');

router.get('/:name/:version?', function(req, res) {
  var name = req.params.name;
  var version = req.params.version;
  var callback = function(__err, __library){
    if (req.xhr) {
      res.send(__library);
    } else {
      res.render('data', {
        library: __library,
        versions: library.getVersions(name),
        dump: JSON.stringify(__library, null, '\t')
      });
    }
  };

  if(version){
    library.getByVersion(name, version, callback);
  }else{
    library.getByName(name, callback);
  }
});

module.exports = router;
