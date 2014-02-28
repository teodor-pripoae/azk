var uuid   = require('node-uuid');
var azk    = require('../azk');
var parent = require('parentpath').sync;
var path   = require('path');
var fs     = require('fs');
var Box    = require('./box');
var utils  = require('../utils');

JSON.minify = JSON.minify || require("node-json-minify");
var Q = azk.Q;
var _ = azk._;

function find_manifest(target) {
  var dir = azk.utils.cd(target, function() {
    return parent(azk.cst.MANIFEST);
  });
  return dir ? path.join(dir, azk.cst.MANIFEST) : null;
}

function new_id() {
  return uuid.v1().replace(/-/g, "");
}

function parse_env(file, env) {
  var content = fs.readFileSync(file).toString();
  _.each(content.split('\n'), function(entry) {
    entry = entry.split('=');
    env[entry[0]] = entry[1];
  });
}

var App = function(cwd, env) {
  var manifest = App.find_manifest(cwd);
  if (manifest) {
    var content = JSON.parse(
      JSON.minify(fs.readFileSync(manifest).toString())
    );

    var self = this;
    var repository = "azk/apps/" + content.id;

    self.id = content.id;
    self.file  = manifest;

    self.type = "app";
    self.repository = repository;
    self.image = repository + ':latest';
    self.path  = path.dirname(manifest);

    // TODO: Load default
    self.envs  = content.envs || {};
    self.env   = self.envs[env || "dev"] || { env: {} };

    // File .env
    var e_file = path.join(path.dirname(manifest), ".env");
    if (fs.existsSync(e_file)) {
      parse_env(e_file, self.env.env);
    }

    self.content = content;
    utils.cd(self.path, function() {
      self.from = new Box(content.box);
    });

    self.steps = content.build || [];
  }
}

var provision_box = null;

App.prototype.provision = function(opts, stdout) {
  opts = _.extend({
    force: false,
    cache: true,
  }, opts || {});

  if (!provision_box)
    provision_box = require('./provision_box');

  return provision_box(this, opts, stdout);
}

App.find_manifest = find_manifest;
App.new_id = new_id;
module.exports = App;