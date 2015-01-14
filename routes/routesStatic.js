'use strict';

var express = require('express');
var router = express.Router();
var favicon = require('serve-favicon');
var path = require('path');

var staticOptions = {
  maxAge: '7d'
};

router.use(favicon(path.join('.', 'public', 'favicon.ico'), staticOptions));

router.use(express.static(path.join('.', 'public'), staticOptions));

router.use('/vendor/:vendor/:file', function(req, res, next) {
  var dir;
  switch (req.params.vendor) {
    case 'jquery':
    {
      dir = path.join('.', 'bower_components', 'jquery', 'dist', req.params.file);
      break;
    }
    case 'bootstrap':
    {
      dir = path.join('.', 'bower_components', 'bootstrap', 'dist', req.params.file);
      break;
    }
    case 'bootstrap-list-filter':
    {
      dir = path.join('.', 'bower_components', 'bootstrap-list-filter', req.params.file);
      break;
    }
    default: return next();
  }
  return express.static(dir, staticOptions).apply(this, arguments);
});

module.exports = router;
