PackageSize
===========

[![Dependency Status](https://david-dm.org/jerone/PackageSize.svg?theme=shields.io)](https://david-dm.org/jerone/PackageSize)
[![devDependency Status](https://david-dm.org/jerone/PackageSize/dev-status.svg?theme=shields.io)](https://david-dm.org/jerone/PackageSize#info=devDependencies)
[![License](http://img.shields.io/badge/license-MIT-brightgreen.svg?style=flat)](https://github.com/jerone/PackageSize/blob/master/LICENSE.md)
[![Gitter chat](https://badges.gitter.im/jerone/PackageSize.svg)](https://gitter.im/jerone/PackageSize)

PackageSize is a website that shows the **file size** from the files used within
the most common packages (including **JavaScript/CSS frameworks & libraries**).

PackageSize uses a list of packages from [*cdnjs*](https://cdnjs.com/).
The list and information is fetched from their [API](https://github.com/cdnjs/cdnjs/wiki/Extensions%2C-Plugins%2C-Resources).

For the design is [*Material Design for Bootstrap*](http://fezvrasta.github.io/bootstrap-material-design/bootstrap-elements.html) used, which is a [Bootstrap](http://getbootstrap.com) theme that brings the [Google Material Design](http://www.google.com/design/spec/material-design/) to everyone's favorite front-end framework :smile:.


## Prerequisites

- [Node.js](http://nodejs.org) v0.12.0
- [npm](https://github.com/npm/npm) v2.5.1

*Optional*:
- [Bower](http://bower.io) v1.3.12 (`npm install -g bower`)
- [Nodemon](http://nodemon.io/) v1.3.7 (`npm install -g nodemon`)


## Install

1. Install npm dependencies: `npm install`
2. Start app: `npm run start` or with nodemon: `nodemon`
3. Open browser on [`http://localhost:1337`](http://localhost:1337)


## Debug

On windows, run this in the console to get only debug message related to PackageSize:

```
SET DEBUG=packagesize:*
```


## Contributing

Please review the [guidelines for contributing](https://github.com/jerone/PackageSize/blob/master/CONTRIBUTING.md) to this repository.
