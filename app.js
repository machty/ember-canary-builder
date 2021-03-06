var http = require('http');
var defeatureify = require('defeatureify');
var Q = require('q');
var parse = require('url').parse;

var request = require('request');

var get = Q.denodeify(request.get);

var port = process.env.PORT || 5000;

var cachedFiles = {};
var cachedProcessedFiles = {};

var cachedFeatures;

function getFeatures() {
  if (cachedFeatures) {
    return Q.resolve(cachedFeatures);
  }

  console.log("Fetching features...");
  return get("https://raw.github.com/emberjs/ember.js/master/features.json").then(function(r) {
    cachedFeatures = JSON.parse(r[1]);
    return Object.create(cachedFeatures);
  });
}

function getFile(parsedUrl) {

  var fileUrl = parsedUrl.pathname;

  if (cachedFiles.hasOwnProperty(fileUrl)) {
    return Q.resolve(cachedFiles[fileUrl]);
  }

  return get("http://builds.emberjs.com" + fileUrl).then(function(response) {
    var body = response[1];
    cachedFiles[fileUrl] = body;
    return body;
  });
}

function getProcessedFile(parsedUrl) {
  var fullpath = parsedUrl.path;
  if (cachedProcessedFiles.hasOwnProperty(fullpath)) {
    console.log("Returning processed cached: " + fullpath);
    return Q.resolve(cachedProcessedFiles[fullpath]);
  }

  return getFeatures().then(function(features) {

    if (parsedUrl.query) {
      parsedUrl.query.split('&').forEach(function(f) {
        var parts = f.split('=');
        features[parts[0]] = JSON.parse(parts[1]);
      });
    }

    return getFile(parsedUrl).then(function(body) {
      body = defeatureify(body, { enabled: features });
      cachedProcessedFiles[fullpath] = body;
      return body;
    });
  });
}

http.createServer(function (req, res) {

  console.log(req.url);

  // cachedFiles.delete["ember-latest.js"];

  res.writeHead(200, {
    'Content-Type': 'text/javascript',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': true,
    'Access-Control-Allow-Methods': 'GET',
    'Access-Control-Allow-Headers': 'Content-Type'
  });

  var parsedUrl = parse(req.url);
  if (parsedUrl.pathname === '/') {
    parsedUrl = parse("/ember-latest.js" + parsedUrl.path.slice(1));
  }

  getProcessedFile(parsedUrl).then(function(body) {
    res.end(body);
  }).fail(function(e) {
    console.log(e);
    res.end("// something went wrong");
  });

}).listen(port);
console.log('Server running on port ' + port);

