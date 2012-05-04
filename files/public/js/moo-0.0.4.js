/* global Moo $ _ Backbone JSON */

if (!window.Moo && !document.Moo)
  Moo = {};

(function(Moo) {

  /* utilities */

  function endsWith(string, suffix) {
    return string.indexOf(suffix, string.length - suffix.length) !== -1;
  };

  /* helpers */

  Moo.formatHTML = function(value, literal) {
    if (_.isNumber(value)) {
      return '<span class="moo-num">' + value + '</span>';
    }
    else if (_.isString(value)) {
      var str, num;
      if (endsWith(value, '|err')) {
        str = _.escape(value.slice(0, value.length - 4));
        return '<span class="moo-err">' + str + '</span>';
      }
      else if (endsWith(value, '|obj')) {
        str = _.escape(value.slice(0, value.length - 4));
        num = _.escape(value.slice(0, value.length - 4).slice(1));
        return '<a rel="object" data-object-number="' + num + '" class="moo-obj" href="/objects/' + num + '">' + str + '</a>';
      }
      else if (endsWith(value, '|int')) {
        str = _.escape(value.slice(0, value.length - 4));
        return '<span class="moo-num">' +  str + '</span>';
      }
      else if (endsWith(value, '|float')) {
        str = _.escape(value.slice(0, value.length - 6));
        return '<span class="moo-num">' +  str + '</span>';
      }
      else if (endsWith(value, '|str')) {
        str = value.slice(0, value.length - 4);
        return '<span class="moo-str">' +  _.escape(literal ? '"' + str.replace(/"/gm, '\\\"') + '"' : str) + '</span>';
      }
      else {
        str = value;
        return '<span class="moo-str">' + _.escape(literal ? '"' + str.replace(/"/gm, '\\\"') + '"' : str) + '</span>';
      }
    }
    else if (_.isArray(value)) {
      return '<span class="moo-list">{ ' + _.map(value, function(v) { return Moo.formatHTML(v, true); }).join(', ') + ' }</span>';
    }
    else if (_.isObject(value)) {
      return '<span class="moo-map">[ ' + _.map(value, function(v, k) { return Moo.formatHTML(k, true) + ' -> ' + Moo.formatHTML(v, true); }).join(', ') + ' ]</span>';
    }
  };

  _.extend(Moo, {

    isString: function(value) {
      return typeof(value) == 'string' && !(endsWith(value, '|obj') || endsWith(value, '|err'));
    },

    isObjectNumber: function(value) {
      return typeof(value) == 'string' && endsWith(value, '|obj');
    },

    isError: function(value) {
      return typeof(value) == 'string' && endsWith(value, '|err');
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

    initialize: function(attributes) {
    },

    has: function(attr) {
      var result = this.get(attr);
      return !(result === null || result === undefined);
    },

    get: function(attr, opts) {
      opts = opts || {};

      var path = attr.split('.'),
          root = path.shift();

      var value = Backbone.Model.prototype.get.call(this, root, opts);

      _.each(path, function(p) {
        value = value != undefined && (p in value) ? value[p] : undefined;
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
    },

    isReadable: function() {
      return this.get('Meta.status') == 'readable';
    },

    isWritable: function() {
      return this.get('Meta.status') == 'writable';
    },

    isDenied: function() {
      return this.get('Meta.status') == 'denied';
    }
  });

  function one(v) {
    return Moo.Value.generate(v);
  }

  function make_one(indent) {
    return function (v) { var next = indent + '  '; return next + Moo.Value.generate(v, next); };
  }

  function two(v, k) {
    return Moo.Value.generate(k) + ' -> ' + Moo.Value.generate(v);
  }

  function make_two(indent) {
    return function(v, k) { var next = indent + '  '; return next + Moo.Value.generate(k, next) + ' -> ' + Moo.Value.generate(v, next); };
  }

  Moo.Value.generate = function(v, indent) {
    var next = indent;
    if (indent != undefined) {
      indent = (indent !== true) ? indent : '';
      next = indent + '  ';
    }

    if (v != undefined && v != null) {
      if (typeof(v) == 'string')
        if (endsWith(v, '|err'))
          return v.slice(0, v.length - 4);
        else if (endsWith(v, '|obj'))
          return v.slice(0, v.length - 4);
        else if (endsWith(v, '|int'))
          return v.slice(0, v.length - 4);
        else if (endsWith(v, '|float'))
          return v.slice(0, v.length - 6);
        else if (endsWith(v, '|str'))
          return JSON.stringify(v.slice(0, v.length - 4));
        else
          return JSON.stringify(v);
      else if (_.isArray(v) && indent != undefined)
        return '{\n' + _.chain(v).map(make_one(indent)).join(',\n').value() + '\n' + indent + '}';
      else if (_.isArray(v))
        return '{' + _.chain(v).map(one).join(', ').value() + '}';
      else if (_.isObject(v) && indent != undefined)
        return '[\n' + _.chain(v).map(make_two(indent)).join(',\n').value() + '\n' + indent + ']';
      else if (_.isObject(v))
        return '[' + _.chain(v).map(two).join(', ').value() + ']';
      return v.toString();
    }
    return undefined;
  };

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
    },

    isReadable: function() {
      return this.get('Meta.status') == 'readable';
    },

    isWritable: function() {
      return this.get('Meta.status') == 'writable';
    },

    isDenied: function() {
      return this.get('Meta.status') == 'denied';
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
    },

    isReadable: function() {
      return this.get('Meta.status') == 'readable';
    },

    isWritable: function() {
      return this.get('Meta.status') == 'writable';
    },

    isDenied: function() {
      return this.get('Meta.status') == 'denied';
    }
  });

  Moo.Collection = Backbone.Collection.extend({

    add: function(models, opts) {
      models = _.isArray(models) ? models.slice() : [models];

      var mapped = this instanceof Moo.Attributes || this instanceof Moo.Values;

      models = _.chain(models).map(function (model) {
        if (!('id' in model))
          if (mapped) {
            /* transform attributes and values from {foo: {...}}} to {id: foo, ...} */
            return _.map(model, function(v, k) {
              v.id = k;
              return v;
            });
          }
          else {
            /* add an id to properties and verbs */
            model.id = models.length;
            return model;
          }
        return model;
      }).flatten().value();

      return Backbone.Collection.prototype.add.call(this, models, opts);
    }
  });

  Moo.Attributes = Moo.Collection.extend({
    model: Moo.Attribute
  });

  Moo.Values = Moo.Collection.extend({
    model: Moo.Value
  });

  Moo.Properties = Moo.Collection.extend({
    model: Moo.Property
  });

  Moo.Verbs = Moo.Collection.extend({
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
      this.attributez.reset(attributez);
      //  _.chain(attributez).reduce(id_g, []).value()
      //);

      var values = response.Values;
      delete response.Values;
      this.values.reset(values);
      //  _.chain(values).reduce(id_g, []).value()
      //);

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

      /* set the id */
      if ('Meta' in response && 'id' in response.Meta)
        this.id = response.Meta.id;

      return response;
    },

    fetch: function(options) {
      options = options ? _.clone(options) : {};

      var model = this;
      var error = options.error;
      options.error = function(model, resp) {
        model.httpResponseStatus = resp.status;
        if (error) error(model, resp);
      };

      return Backbone.Model.prototype.fetch.call(this, options);
    },

    failed: function() {
      return this.httpResponseStatus >= 300;
    },

    isNotFound: function() {
      return this.httpResponseStatus == 404;
    },

    isDenied: function() {
      return this.httpResponseStatus == 403;
    },

    isReadable: function() {
      var meta;
      return (meta = this.get('Meta')) && meta.status == 'readable';
    },

    isWritable: function() {
      var meta;
      return (meta = this.get('Meta')) && meta.status == 'writable';
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

  $.widget('moo.simpleObjectPanel', {

    options: {
      template: null,
      object: null
    },

    _setOption: function(key, value) {
      switch (key) {
        case 'object':
          this.options.object = value;
          this._render();
          break;
        case 'template':
          this.options.template = _.template(value);
          this._render();
          break;
      }
    },

    _render: function() {
      if (this.options.object && this.options.template) {
        this.element.html(this.options.template({
          object: this.options.object
        }));
      }
    },

    _modal: {
      show: function($modal, title, body) {
        $('h3', $modal).text(title);
        $('.textarea', $modal).text(body);
        $modal.modal('show');
      },

      resetSelection: function() {
        if (window.getSelection)
          window.getSelection().removeAllRanges();
        else if (document.selection)
          document.selection.empty();
      }
    },

    _create: function() {
      var that = this;
      if (!this.options.template) {
        $.get('/html/moo-0.0.3.html', function(template) {
          that.options.template = _.template(template);
          that._render();
        });
      }
      this.element.on('dblclick', 'tr.value.readable, tr.value.writable', function(e) {
        var object = that.options.object,
            $modal = $('.modal', that.element),
            $target = $(e.target).parents('tr'),
            name = $target.data('id'),
            value = Moo.Value.generate(object.values.get(name).get('Value.value'), true);
        that._modal.show($modal, name, value);
        that._modal.resetSelection();
      });
      this.element.on('dblclick', 'tr.property.readable, tr.property.writable', function(e) {
        var object = that.options.object,
            $modal = $('.modal', that.element),
            $target = $(e.target).parents('tr'),
            id = $target.data('id'),
            value = Moo.Value.generate(object.properties.get(id).get('Property.value'), true),
            title = object.properties.get(id).get('Property.name');
        that._modal.show($modal, title, value);
        that._modal.resetSelection();
      });
      this.element.on('dblclick', 'tr.verb.readable, tr.verb.writable', function(e) {
        var object = that.options.object,
            $modal = $('.modal', that.element),
            $target = $(e.target).parents('tr'),
            id = $target.data('id'),
            value = object.verbs.get(id).get('Verb.code').join('\n'),
            title = object.verbs.get(id).get('Verb.names');
        that._modal.show($modal, title, value);
        that._modal.resetSelection();
      });
    },

    _init: function() {
      this._render();
    },

    destroy: function() {
      this.element.html('');
    }
  });
})(Moo);
