/* global $ _ Backbone */

var Moo = {};

(function(Moo) {

  _.extend(Moo, {

    endsWith: function(string, suffix) {
      return string.indexOf(suffix, string.length - suffix.length) !== -1;
    },

    isString: function(value) {
      return typeof(value) == 'string' && !(Moo.endsWith(value, '|obj') || Moo.endsWith(value, '|err'));
    },

    isObjectNumber: function(value) {
      return typeof(value) == 'string' && Moo.endsWith(value, '|obj');
    },

    isError: function(value) {
      return typeof(value) == 'string' && Moo.endsWith(value, '|err');
    },

    isBinary: function(value) {
      return value === 0 || value === 1;
    },

    isValidPerms: function(value, set) {
      return typeof(value) == 'string' && value.match('^[' + set + ']*$');
    },

    isValidObj: function(value) {
      return _.include(['this', 'none', 'any'], value);
    },

    isValidPrep: function(value) {
      var preps = ['with', 'using', 'at', 'to', 'in front of', 'in', 'inside', 'into',
                   'on top of', 'on', 'onto', 'upon', 'out of', 'from inside', 'from',
                   'over', 'through', 'under', 'underneath', 'beneath', 'behind', 'beside',
                   'for', 'about', 'is', 'as', 'off', 'off of', 'none', 'any'];
      return _.include(preps, value);
    },

    isValidCode: function(value) {
      return _.isArray(value) && _.all(value, Moo.isString);
    },

    isValidObjectNumberArray: function(value) {
      return _.isArray(value) && _.all(value, Moo.isObjectNumber);
    }
  });

  Moo.NestedModel = Backbone.Model.extend({

    get: function(attr, opts) {
      opts = opts || {};

      var path = attr.split('.'),
          root = path.shift();

      var value = Backbone.Model.prototype.get.call(this, root, opts);

      _.each(path, function(p) {
        value = value[p];
      });

      return value;
    },

    set: function(key, value, opts) {
      var attrs;
      if (_.isObject(key)) {
        attrs = key;
        opts = value;
      } else {
        attrs = {};
        attrs[key] = value;
      }
      opts = opts || {};

      var attributes = _.inject(this.attributes, function(a, v, k) {
        a[k] = _.clone(v);
        return a;
      }, {});

      _.each(attrs, function(value, attr) {
        var path = attr.split('.'),
            root = path.shift();
        var top = attributes,
            last = root;

        _.each(path, function(p) {
          if (!(last in top))
            top[last] = {};
          top = top[last];
          last = p;
        });

        top[last] = value;
      });

      return Backbone.Model.prototype.set.call(this, attributes, opts);
    }
  });

  Moo.Attribute = Moo.NestedModel.extend({

    validate: function(attribute) {
      if (attribute && 'Value' in attribute && (typeof(attribute.Value) != 'object'))
        return 'invalid attribute';
    }
  });

  Moo.Value = Moo.NestedModel.extend({

    validate: function(value) {
      if (value && 'Value' in value && (typeof(value.Value) != 'object'))
        return 'invalid value';
      if (value && 'Value' in value && 'clear' in value.Value && !Moo.isBinary(value.Value.clear))
        return "invalid value: `clear' must be 0 or 1";
    }
  });

  Moo.Property = Moo.NestedModel.extend({

    validate: function(property) {
      if (property && 'Property' in property && (typeof(property.Property) != 'object'))
        return 'invalid property';
      if (property && 'Property' in property && 'name' in property.Property && !Moo.isString(property.Property.name))
        return "invalid property: `name' must be a string";
      if (property && 'Property' in property && 'owner' in property.Property && !Moo.isObjectNumber(property.Property.owner))
        return "invalid property: `owner' must be an object number";
      if (property && 'Property' in property && 'perms' in property.Property && !Moo.isValidPerms(property.Property.perms, 'rwc'))
        return "invalid property: `perms' must be in the set 'rwc'";
    }
  });

  Moo.Verb = Moo.NestedModel.extend({

    validate: function(verb) {
      if (verb && 'Verb' in verb && (typeof(verb.Verb) != 'object'))
        return 'invalid verb';
      if (verb && 'Verb' in verb && 'names' in verb.Verb && !Moo.isString(verb.Verb.names))
        return "invalid verb: `names' must be a string";
      if (verb && 'Verb' in verb && 'owner' in verb.Verb && !Moo.isObjectNumber(verb.Verb.owner))
        return "invalid verb: `owner' must be an object number";
      if (verb && 'Verb' in verb && 'perms' in verb.Verb && !Moo.isValidPerms(verb.Verb.perms, 'rwxd'))
        return "invalid verb: `perms' must be in the set 'rwxd'";
      if (verb && 'Verb' in verb && 'dobj' in verb.Verb && !Moo.isValidObj(verb.Verb.dobj))
        return "invalid verb: `dobj' must be valid";
      if (verb && 'Verb' in verb && 'prep' in verb.Verb && !Moo.isValidPrep(verb.Verb.prep))
        return "invalid verb: `prep' must be valid";
      if (verb && 'Verb' in verb && 'iobj' in verb.Verb && !Moo.isValidObj(verb.Verb.iobj))
        return "invalid verb: `iobj' must be valid";
      if (verb && 'Verb' in verb && 'code' in verb.Verb && !Moo.isValidCode(verb.Verb.code))
        return "invalid verb: `code' must be an array of strings";
    }
  });

  Moo.Attributes = Backbone.Collection.extend({
    model: Moo.Attribute
  });

  Moo.Values = Backbone.Collection.extend({
    model: Moo.Value
  });

  Moo.Properties = Backbone.Collection.extend({
    model: Moo.Property
  });

  Moo.Verbs = Backbone.Collection.extend({
    model: Moo.Verb
  });

  Moo.Object = Backbone.Model.extend({

    urlRoot: '///objects',

    initialize: function () {
      this.attributez = new Moo.Attributes;
      this.attributez.url = this.url() + '/attributes';
      this.values = new Moo.Values;
      this.values.url = this.url() + '/values';
      this.properties = new Moo.Properties;
      this.properties.url = this.url() + '/properties';
      this.verbs = new Moo.Verbs;
      this.verbs.url = this.url() + '/verbs';

      this.parse(this.attributes);
    },

    validate: function(object) {
      var attribute, value;
      if ((attribute = this.attributez.get('player')) && !Moo.isBinary(attribute.get('Value.value')))
        return "invalid attribute: `player' must be 0 or 1";
      if ((attribute = this.attributez.get('parents')) && !Moo.isValidObjectNumberArray(attribute.get('Value.value')))
        return "invalid attribute: `parents' must be an array of object numbers";
      if ((value = this.values.get('name')) && !Moo.isString(value.get('Value.value')))
        return "invalid value: `name' must be a string";
      if ((value = this.values.get('owner')) && !Moo.isObjectNumber(value.get('Value.value')))
        return "invalid value: `owner' must be an object number";
      if ((value = this.values.get('location')) && !Moo.isObjectNumber(value.get('Value.value')))
        return "invalid value: `location' must be an object number";
      if ((value = this.values.get('contents')) && !Moo.isValidObjectNumberArray(value.get('Value.value')))
        return "invalid value: `contents' must be an array of object numbers";
      if ((value = this.values.get('programmer')) && !Moo.isBinary(value.get('Value.value')))
        return "invalid value: `programmer' must be 0 or 1";
      if ((value = this.values.get('wizard')) && !Moo.isBinary(value.get('Value.value')))
        return "invalid value: `wizard' must be 0 or 1";
      if ((value = this.values.get('r')) && !Moo.isBinary(value.get('Value.value')))
        return "invalid value: `r' must be 0 or 1";
      if ((value = this.values.get('w')) && !Moo.isBinary(value.get('Value.value')))
        return "invalid value: `w' must be 0 or 1";
      if ((value = this.values.get('f')) && !Moo.isBinary(value.get('Value.value')))
        return "invalid value: `f' must be 0 or 1";
    },

    parse: function(response) {

      var id_g = function(a, v, k) {
        v.id = k;
        a.push(v);
        return a;
      };

      var attributez = response.Attributes;
      delete response.Attributes;
      this.attributez.reset(
        _.chain(attributez).reduce(id_g, []).value()
      );

      var values = response.Values;
      delete response.Values;
      this.values.reset(
        _.chain(values).reduce(id_g, []).value()
      );

      var properties = response.Properties;
      delete response.Properties;
      this.properties.reset(
        _.chain(properties).reduce(id_g, []).value()
      );

      var verbs = response.Verbs;
      delete response.Verbs;
      this.verbs.reset(
        _.chain(verbs).reduce(id_g, []).value()
      );

      return response;
    },

    toJSON: function() {
      var to_map = function(a, v, k) {
        a[v.id] = v;
        delete v.id;
        return a;
      };

      return {
        Attributes: _.chain(this.attributez.toJSON()).reduce(to_map, {}).value(),
        Values: _.chain(this.values.toJSON()).reduce(to_map, {}).value(),
        Properties: this.properties.toJSON(),
        Verbs: this.verbs.toJSON()
      };
    }
  });

  Moo.Objects = Backbone.Collection.extend({
    model: Moo.Object,
    url: '///objects'
  });

})(Moo);
