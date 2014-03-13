// json-mixin

var _ = require('underscore')._;
var fs = require('fs');
var path = require('path');

// name of key that tells the library that its value contains names of mixins to include
var MIXIN_KEY = '#mixin';


// substracts the .json extension from file name

function subExt(fileName)
{
  return fileName.substr(0, fileName.indexOf('.json') == -1 ? fileName.length : fileName.indexOf('.json'));
}

function JsonMixin()
{
  // initialize private variables
  this.mixinCache = {};
}

// adds processed mixinObject to the mixin cache as keyName, returns it

function addMixin(mixinObject, keyName)
{
  if(!this.mixinCache[keyName])
    this.mixinCache[keyName] = {};
  return this.mixinCache[keyName] = _.extend(this.mixinCache[keyName], this.loadJson(mixinObject));
}

// loads JSON mixin from file fileName, then adds it to the cache under name keyName

function loadMixin(fileName, keyName)
{
  if(!keyName)
    var keyName = subExt(fileName);
  var file = fs.readFileSync(fileName);
  var mixinObject = JSON.parse(file);
  return this.addMixin(mixinObject, keyName);
}

// returns the cached mixin object that goes by name

function getMixin(name)
{
  var tName = subExt(name);
  if(!this.mixinCache[tName])
    throw 'mixin not found';
  return this.mixinCache[tName];
}

// returns true if mixin specified by name is cached

function existsMixin(name)
{
  var tName = subExt(name);
  return this.mixinCache[tName];
}

// loads mixin files from given directory, but does not override already cached mixins

function loadMixins(mixinDir)
{
  var fileNames = fs.readdirSync(mixinDir);
  for(var i = 0; i < fileNames.length; i++)
  {
    if(fileNames[i].indexOf('.json') == -1)
      continue;
    if(!this.existsMixin(fileNames[i]))
      this.loadMixin(path.join(mixinDir, fileNames[i]), subExt(fileNames[i]));
  }
}

// processes the mixinObject using the cache and returns it

function loadJson(mixinObject)
{
  if(Object.prototype.toString.call(mixinObject) != "[object Object]")
  // Array processing temporarily disabled due to unwanted conversion to dictionary
  //  && !Array.isArray(mixinObject))
    return mixinObject;
  var result = {};
  if(typeof mixinObject[MIXIN_KEY] != 'undefined')
  {
    if(!Array.isArray(mixinObject[MIXIN_KEY]))
    {
      result = _.extend(result, this.getMixin(mixinObject[MIXIN_KEY]));
      continue;
    }
    for(var i = 0; i < mixinObject[MIXIN_KEY].length; i++)
    {
      var mixinKey = mixinObject[MIXIN_KEY][i];
      result = _.extend(result, this.getMixin(mixinKey));
    }
  }
  for(subObject in mixinObject)
  {
    if(subObject == MIXIN_KEY)
      continue;
    result[subObject] = this.loadJson(mixinObject[subObject]);
  }
  return result;
}

// synonymous to loadJson

function apply(mixinObject)
{
  return this.loadJson(mixinObject);
}

JsonMixin.prototype.addMixin = addMixin;
JsonMixin.prototype.loadMixin = loadMixin;
JsonMixin.prototype.loadMixins = loadMixins;
JsonMixin.prototype.getMixin = getMixin;
JsonMixin.prototype.existsMixin = existsMixin;
JsonMixin.prototype.loadJson = loadJson;
JsonMixin.prototype.apply = apply;

exports.JsonMixin = JsonMixin;
