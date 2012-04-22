/* global _ $ Moo describe it expect beforeEach afterEach spyOn */

describe('Number', function() {
  it('should HTML-ize a number', function() {
    var n = 123;
    var $v = $(Moo.formatHTML(n));
    expect($v.hasClass('moo-num')).toBeTruthy();
    expect($v.text()).toEqual('123');
  });
});

describe('String', function() {
  it('should HTML-ize a MOO error', function() {
    var $v = $(Moo.formatHTML('E_FOO|err'));
    expect($v.hasClass('moo-err')).toBeTruthy();
    expect($v.text()).toEqual('E_FOO');
  });

  it('should HTML-ize a MOO object number', function() {
    var $v = $(Moo.formatHTML('#0|obj'));
    expect($v.hasClass('moo-obj')).toBeTruthy();
    expect($v.attr('href')).toEqual('/objects/0');
    expect($v.text()).toEqual('#0');
  });

  it('should HTML-ize a MOO integer', function() {
    var $v = $(Moo.formatHTML('123|int'));
    expect($v.hasClass('moo-num')).toBeTruthy();
    expect($v.text()).toEqual('123');
  });

  it('should HTML-ize a MOO float', function() {
    var $v = $(Moo.formatHTML('1.3|float'));
    expect($v.hasClass('moo-num')).toBeTruthy();
    expect($v.text()).toEqual('1.3');
  });

  it('should HTML-ize a tricky MOO string', function() {
    var $v = $(Moo.formatHTML('#0|obj|str'));
    expect($v.hasClass('moo-str')).toBeTruthy();
    expect($v.text()).toEqual('#0|obj');
  });

  it('should HTML-ize a simple MOO string', function() {
    var $v = $(Moo.formatHTML('str'));
    expect($v.hasClass('moo-str')).toBeTruthy();
    expect($v.text()).toEqual('str');
  });

  describe('as a MOO-value literal', function() {
    it('should HTML-ize a tricky MOO string', function() {
      var $v = $(Moo.formatHTML('#0|obj|str', true));
      expect($v.hasClass('moo-str')).toBeTruthy();
      expect($v.text()).toEqual('"#0|obj"');
    });

    it('should HTML-ize a simple MOO string', function() {
      var $v = $(Moo.formatHTML('str', true));
      expect($v.hasClass('moo-str')).toBeTruthy();
      expect($v.text()).toEqual('"str"');
    });
  });

  it('should sanitize HTML', function() {
    var $v = $(Moo.formatHTML('<script>alert("bang!");</script>'));
    expect($v.hasClass('moo-str')).toBeTruthy();
    expect($v.html()).toEqual('&lt;script&gt;alert("bang!");&lt;/script&gt;');
    expect($v.text()).toEqual('<script>alert("bang!");</script>');
  });
});

describe('Array', function() {
  it('should HTML-ize an array of values', function() {
    var a = [123, '123', '#123|obj'];
    var $v = $(Moo.formatHTML(a));
    expect($v.hasClass('moo-list')).toBeTruthy();
    expect($v.children().length).toEqual(3);
    expect($v.find(':eq(0)').text()).toEqual('123');
    expect($v.find(':eq(1)').text()).toEqual('"123"');
    expect($v.find(':eq(2)').text()).toEqual('#123');
  });
});

describe('Object', function() {
  it('should HTML-ize an object of value pairs', function() {
    var o = {'123|int': 123, '123|str': '123'};
    var $v = $(Moo.formatHTML(o));
    expect($v.hasClass('moo-map')).toBeTruthy();
    expect($v.children().length).toEqual(4);
    expect($v.find(':eq(0)').text()).toEqual('123');
    expect($v.find(':eq(1)').text()).toEqual('123');
    expect($v.find(':eq(2)').text()).toEqual('"123"');
    expect($v.find(':eq(3)').text()).toEqual('"123"');
  });
});

describe('Moo.NestedModel', function() {

  var Test;

  beforeEach(function() {
    Test = Moo.NestedModel.extend({});
  });

  it('should allow non-nested attributes to be set in the constructor', function() {
    var test = new Test({foo: 'bar', one: 'two'});
    expect(test.attributes).toEqual({foo: 'bar', one: 'two'});
  });

  it('should allow singly-nested attributes to be set in the constructor', function() {
    var test1 = new Test({foo: {bar: 'baz'}, one: {two: 'three'}});
    expect(test1.attributes).toEqual({foo: {bar: 'baz'}, one: {two: 'three'}});
    var test2 = new Test({'foo.bar': 'baz', 'one.two': 'three'});
    expect(test2.attributes).toEqual({foo: {bar: 'baz'}, one: {two: 'three'}});
  });

  it('should allow doubly-nested attributes to be set in the constructor', function() {
    var test1 = new Test({foo: {bar: {baz: 'quux'}}, one: {two: {three: 'four'}}});
    expect(test1.attributes).toEqual({foo: {bar: {baz: 'quux'}}, one: {two: {three: 'four'}}});
    var test2 = new Test({'foo.bar.baz': 'quux', 'one.two.three': 'four'});
    expect(test2.attributes).toEqual({foo: {bar: {baz: 'quux'}}, one: {two: {three: 'four'}}});
  });

  it('should allow overlapping nested attributes to be set in the constructor', function() {
    var test1 = new Test({foo: {bar: 1, baz: 2}});
    expect(test1.attributes).toEqual({foo: {bar: 1, baz: 2}});
    var test2 = new Test({'foo.bar': 1, 'foo.baz': 2});
    expect(test2.attributes).toEqual({foo: {bar: 1, baz: 2}});
  });

  it('should allow non-nested attributes to be set with dotted notation', function() {
    var test = new Test;
    test.set('foo', 'bar');
    test.set('one', 'two');
    expect(test.attributes).toEqual({foo: 'bar', one: 'two'});
  });

  it('should allow singly-nested attributes to be set with dotted notation', function() {
    var test = new Test;
    test.set('foo.bar', 'baz');
    test.set('one.two', 'three');
    expect(test.attributes).toEqual({foo: {bar: 'baz'}, one: {two: 'three'}});
  });

  it('should allow doubly-nested attributes to be set with dotted notation', function() {
    var test = new Test;
    test.set('foo.bar.baz', 'quux');
    test.set('one.two.three', 'four');
    expect(test.attributes).toEqual({foo: {bar: {baz: 'quux'}}, one: {two: {three: 'four'}}});
  });

  it('should allow overlapping nested attributes to be set with dotted notation', function() {
    var test = new Test;
    test.set('foo.bar', 1);
    test.set('foo.baz', 2);
    expect(test.attributes).toEqual({foo: {bar: 1, baz: 2}});
  });

  it('should allow non-nested attributes to be got with dotted notation', function() {
    var test = new Test;
    test.attributes = {foo: 'bar', one: 'two'};
    expect(test.get('foo')).toEqual('bar');
    expect(test.get('one')).toEqual('two');
    expect(test.get('xyz')).toBeUndefined();
  });

  it('should allow singly-nested attributes to be got with dotted notation', function() {
    var test = new Test;
    test.attributes = {foo: {bar: 'baz'}, one: {two: 'three'}};
    expect(test.get('foo.bar')).toEqual('baz');
    expect(test.get('one.two')).toEqual('three');
    expect(test.get('xyz.abc')).toBeUndefined();
  });

  it('should allow doubly-nested attributes to be got with dotted notation', function() {
    var test = new Test;
    test.attributes = {foo: {bar: {baz: 'quux'}}, one: {two: {three: 'four'}}};
    expect(test.get('foo.bar.baz')).toEqual('quux');
    expect(test.get('one.two.three')).toEqual('four');
    expect(test.get('xyz.abc.mno')).toBeUndefined();
  });

  it('should allow overlapping nested attributes to be got with dotted notation', function() {
    var test = new Test;
    test.attributes = {foo: {bar: 1, baz: 2}};
    expect(test.get('foo.bar')).toEqual(1);
    expect(test.get('foo.baz')).toEqual(2);
    expect(test.get('foo.xyz')).toBeUndefined();
  });

  it('should allow non-nested attributes to be introspected with dotted notation', function() {
    var test = new Test;
    test.attributes = {foo: 'bar', one: 'two'};
    expect(test.has('foo')).toBeTruthy();
    expect(test.has('one')).toBeTruthy();
    expect(test.has('xyz')).toBeFalsy();
  });

  it('should allow singly-nested attributes to be introspected with dotted notation', function() {
    var test = new Test;
    test.attributes = {foo: {bar: 'baz'}, one: {two: 'three'}};
    expect(test.has('foo.bar')).toBeTruthy();
    expect(test.has('one.two')).toBeTruthy();
    expect(test.has('xyz.abc')).toBeFalsy();
  });

  it('should allow doubly-nested attributes to be introspected with dotted notation', function() {
    var test = new Test;
    test.attributes = {foo: {bar: {baz: 'quux'}}, one: {two: {three: 'four'}}};
    expect(test.has('foo.bar.baz')).toBeTruthy();
    expect(test.has('one.two.three')).toBeTruthy();
    expect(test.has('xyz.abc.mno')).toBeFalsy();
  });

  it('should allow overlapping nested attributes to be introspected with dotted notation', function() {
    var test = new Test;
    test.attributes = {foo: {bar: 1, baz: 2}};
    expect(test.has('foo.bar')).toBeTruthy();
    expect(test.has('foo.baz')).toBeTruthy();
    expect(test.has('foo.xyz')).toBeFalsy();
  });
});

describe('Moo.Attribute', function() {

  it('should allow a value to be set in the constructor', function() {
    var a = new Moo.Attribute({Value: {value: 'test'}});
    expect(a.get('Value.value')).toEqual('test');
  });

  it('should allow a value to be set with dotted notation', function() {
    var a = new Moo.Attribute;
    a.set('Value.value', 'test');
    expect(a.get('Value.value')).toEqual('test');
  });

  it('should not allow an invalid value specification', function() {
    var a = new Moo.Attribute({Value: 5});
    expect(a.isValid()).toBeFalsy();
    a.set('Value', 'five');
    expect(a.isValid()).toBeFalsy();
  });
});

describe('Moo.Value', function() {

  it('should allow a value to be set in the constructor', function() {
    var v = new Moo.Value({Value: {value: 'test'}});
    expect(v.get('Value.value')).toEqual('test');
  });

  it('should allow a value to be set with dotted notation', function() {
    var v = new Moo.Value;
    v.set('Value.value', 'test');
    expect(v.get('Value.value')).toEqual('test');
  });

  it('should allow the clear flag to be set in constructor', function() {
    var v = new Moo.Value({Value: {clear: 1}});
    expect(v.get('Value.clear')).toEqual(1);
  });

  it('should allow the clear flag to be set with dotted notation', function() {
    var v = new Moo.Value;
    v.set('Value.clear', 0);
    expect(v.get('Value.clear')).toEqual(0);
  });

  it('should require the clear flag to be either 0 or 1', function() {
    var v = new Moo.Value({Value: {clear: 'test'}});
    expect(v.isValid()).toBeFalsy();
    v.set('Value.clear', 5);
    expect(v.isValid()).toBeFalsy();
  });

  it('should not allow an invalid value specification', function() {
    var v = new Moo.Value({Value: 5});
    expect(v.isValid()).toBeFalsy();
    v.set('Value', 'five');
    expect(v.isValid()).toBeFalsy();
  });

  describe('dotted notation', function() {

    it('should allow simple values to be changed', function() {
      var v = new Moo.Value;
      v.set('Value.value', 0);
      expect(v.get('Value.value')).toEqual(0);
      v.set('Value.value', 'zero');
      expect(v.get('Value.value')).toEqual('zero');
      v.set('Value.value', 0.1);
      expect(v.get('Value.value')).toEqual(0.1);
    });

    it('should allow collection values to be changed', function() {
      var v = new Moo.Value;
      v.set('Value.value', [1, 2, 3]);
      expect(v.get('Value.value')).toEqual([1, 2, 3]);
      v.set('Value.value', {foo: 'bar'});
      expect(v.get('Value.value')).toEqual({foo: 'bar'});
      v.set('Value.value', {one: 'two'});
      expect(v.get('Value.value')).toEqual({one: 'two'});
      v.set('Value.value', 0.1);
      expect(v.get('Value.value')).toEqual(0.1);
    });
  });

  describe('value in the context of an object', function() {

    var o;

    beforeEach(function() {
      o = new Moo.Object({
        Attributes: {},
        Values: {readable: {Meta: {status: 'readable'}}, writable: {Meta: {status: 'writable'}}, foobar: {Meta: {status: 'foobar'}}},
        Properties: [],
        Verbs: []
      });
    });

    it('should ensure isReadable() returns true if the value is readable on the server', function() {
      expect(o.values.get('readable').isReadable()).toBeTruthy();
    });

    it('should ensure isReadable() returns false if the value is readable on the server', function() {
      expect(o.values.get('foobar').isReadable()).toBeFalsy();
    });

    it('should ensure isWritable() returns true if the value is writable on the server', function() {
      expect(o.values.get('writable').isWritable()).toBeTruthy();
    });

    it('should ensure isWritable() returns false if the value is writable on the server', function() {
      expect(o.values.get('foobar').isWritable()).toBeFalsy();
    });
  });

  describe('MOOvalue generating', function() {

    it ('should return the MOO literal representation of an integer', function() {
      var v = new Moo.Value({'Value.value': 11});
      expect(Moo.Value.generate(v.get('Value.value'))).toEqual('11');
    });

    it ('should return the MOO literal representation of a float', function() {
      var v = new Moo.Value({'Value.value': 11.1});
      expect(Moo.Value.generate(v.get('Value.value'))).toEqual('11.1');
    });

    it ('should return the MOO literal representation of a MOO integer', function() {
      var v = new Moo.Value({'Value.value': '11|int'});
      expect(Moo.Value.generate(v.get('Value.value'))).toEqual('11');
    });

    it ('should return the MOO literal representation of a MOO float', function() {
      var v = new Moo.Value({'Value.value': '11.1|float'});
      expect(Moo.Value.generate(v.get('Value.value'))).toEqual('11.1');
    });

    it ('should return the MOO literal representation of a MOO error', function() {
      var v = new Moo.Value({'Value.value': 'E_FOO|err'});
      expect(Moo.Value.generate(v.get('Value.value'))).toEqual('E_FOO');
    });

    it ('should return the MOO literal representation of a MOO object number', function() {
      var v = new Moo.Value({'Value.value': '#0|obj'});
      expect(Moo.Value.generate(v.get('Value.value'))).toEqual('#0');
    });

    it ('should return the MOO literal representation of a MOO string', function() {
      var v = new Moo.Value({'Value.value': '#0|obj|str'});
      expect(Moo.Value.generate(v.get('Value.value'))).toEqual('"#0|obj"');
    });

    it ('should return the MOO literal representation of a string', function() {
      var v = new Moo.Value({'Value.value': 'str'});
      expect(Moo.Value.generate(v.get('Value.value'))).toEqual('"str"');
    });

    it ('should return the MOO literal representation of a list/array', function() {
      var v = new Moo.Value({'Value.value': ['1|int', '2.0|float', '#3|obj']});
      expect(Moo.Value.generate(v.get('Value.value'))).toEqual('{1, 2.0, #3}');
    });

    it ('should return the MOO literal representation of a map/object', function() {
      var v = new Moo.Value({'Value.value': {'1|int': 'one', '2.0|float': 'two', '#3|obj': 'three'}});
      expect(Moo.Value.generate(v.get('Value.value'))).toEqual('[1 -> "one", 2.0 -> "two", #3 -> "three"]');
    });

    it ('should return the MOO literal representation of a somewhat complicated value', function() {
      var v = new Moo.Value({'Value.value': ['abc', 'xyz', {'1|int': ['one'], '2.0|float': [['two']], '#3|obj': 'three'}, '']    });
      expect(Moo.Value.generate(v.get('Value.value'))).toEqual('{"abc", "xyz", [1 -> {"one"}, 2.0 -> {{"two"}}, #3 -> "three"], ""}');
    });

    it ('should pretty-print the MOO literal representation of a somewhat complicated value', function() {
      var v = new Moo.Value({'Value.value': ['abc', 'xyz', {'1|int': ['one'], '2.0|float': [['two']], '#3|obj': 'three'}, '']    });
      expect(Moo.Value.generate(v.get('Value.value'), true)).toEqual('{\n  "abc",\n  "xyz",\n  [\n    1 -> {\n      "one"\n    },\n    2.0 -> {\n      {\n        "two"\n      }\n    },\n    #3 -> "three"\n  ],\n  ""\n}');
    });
  });
});

describe('Moo.Property', function() {

  it('should allow a name to be set in the constructor', function() {
    var p = new Moo.Property({Property: {name: 'test'}});
    expect(p.get('Property.name')).toEqual('test');
  });

  it('should allow a name to be set with dotted notation', function() {
    var p = new Moo.Property;
    p.set('Property.name', 'test');
    expect(p.get('Property.name')).toEqual('test');
  });

  it('should allow the owner to be set in the constructor', function() {
    var p = new Moo.Property({Property: {owner: '#-1|obj'}});
    expect(p.get('Property.owner')).toEqual('#-1|obj');
  });

  it('should allow the owner to be set with dotted notation', function() {
    var p = new Moo.Property;
    p.set('Property.owner', '#1|obj');
    expect(p.get('Property.owner')).toEqual('#1|obj');
  });

  it('should allow perms to be set in the constructor', function() {
    var p = new Moo.Property({Property: {perms: 'r'}});
    expect(p.get('Property.perms')).toEqual('r');
  });

  it('should allow perms to be set with dotted notation', function() {
    var p = new Moo.Property;
    p.set('Property.perms', 'wc');
    expect(p.get('Property.perms')).toEqual('wc');
  });

  it('should allow a value to be set in the constructor', function() {
    var p = new Moo.Property({Property: {value: [1, 2, 3]}});
    expect(p.get('Property.value')).toEqual([1, 2, 3]);
  });

  it('should allow a value to be set with dotted notation', function() {
    var p = new Moo.Property;
    p.set('Property.value', {foo: 'bar'});
    expect(p.get('Property.value')).toEqual({foo: 'bar'});
  });

  it('should require the name to be a string', function() {
    var p = new Moo.Property({Property: {name: 'test|err'}});
    expect(p.isValid()).toBeFalsy();
    p.set('Property.name', 5);
    expect(p.isValid()).toBeFalsy();
  });

  it('should require the owner to be an object number', function() {
    var p = new Moo.Property({Property: {owner: 'test|err'}});
    expect(p.isValid()).toBeFalsy();
    p.set('Property.owner', 5);
    expect(p.isValid()).toBeFalsy();
  });

  it('should require the perms to be in the set "rwc"', function() {
    var p = new Moo.Property({Property: {perms: 'test|err'}});
    expect(p.isValid()).toBeFalsy();
    p.set('Property.perms', 5);
    expect(p.isValid()).toBeFalsy();
  });

  it('should not allow an invalid property specification', function() {
    var v = new Moo.Property({Property: 5});
    expect(v.isValid()).toBeFalsy();
    v.set('Property', 'five');
    expect(v.isValid()).toBeFalsy();
  });

  describe('property in the context of an object', function() {

    var o;

    beforeEach(function() {
      o = new Moo.Object({
        Attributes: {},
        Values: {name: {Value: {value: 'Test'}}},
        Properties: [],
        Verbs: []
      });
    });

    it('should ensure isDenied() returns true if access to the property with the specified id is denied', function() {
      o.properties.add({id: 0, Meta: {status: 'denied'}, Property: {}});
      expect(o.properties.get(0).isDenied()).toBeTruthy();
    });

    it('should ensure isDenied() returns false if access to the property with the requested id was not denied', function() {
      o.properties.add({id: 0, Meta: {}, Property: {}});
      expect(o.properties.get(0).isDenied()).toBeFalsy();
    });
  });
});

describe('Moo.Verb', function() {

  it('should allow names to be set in the constructor', function() {
    var v = new Moo.Verb({Verb: {names: 'test'}});
    expect(v.get('Verb.names')).toEqual('test');
  });

  it('should allow names to be set with dotted notation', function() {
    var v = new Moo.Verb;
    v.set('Verb.names', 'test');
    expect(v.get('Verb.names')).toEqual('test');
  });

  it('should allow the owner to be set in the constructor', function() {
    var v = new Moo.Verb({Verb: {owner: '#-1|obj'}});
    expect(v.get('Verb.owner')).toEqual('#-1|obj');
  });

  it('should allow the owner to be set with dotted notation', function() {
    var v = new Moo.Verb;
    v.set('Verb.owner', '#1|obj');
    expect(v.get('Verb.owner')).toEqual('#1|obj');
  });

  it('should allow perms to be set in the constructor', function() {
    var v = new Moo.Verb({Verb: {perms: 'r'}});
    expect(v.get('Verb.perms')).toEqual('r');
  });

  it('should allow perms to be set with dotted notation', function() {
    var v = new Moo.Verb;
    v.set('Verb.perms', 'xd');
    expect(v.get('Verb.perms')).toEqual('xd');
  });

  it('should allow the dobj to be set in the constructor', function() {
    var v = new Moo.Verb({Verb: {dobj: 'this'}});
    expect(v.get('Verb.dobj')).toEqual('this');
  });

  it('should allow the dobj to be set with dotted notation', function() {
    var v = new Moo.Verb;
    v.set('Verb.dobj', 'none');
    expect(v.get('Verb.dobj')).toEqual('none');
  });

  it('should allow the prep to be set in the constructor', function() {
    var v = new Moo.Verb({Verb: {prep: 'with'}});
    expect(v.get('Verb.prep')).toEqual('with');
  });

  it('should allow the prep to be set with dotted notation', function() {
    var v = new Moo.Verb;
    v.set('Verb.prep', 'in');
    expect(v.get('Verb.prep')).toEqual('in');
  });

  it('should allow the iobj to be set in the constructor', function() {
    var v = new Moo.Verb({Verb: {iobj: 'this'}});
    expect(v.get('Verb.iobj')).toEqual('this');
  });

  it('should allow the iobj to be set with dotted notation', function() {
    var v = new Moo.Verb;
    v.set('Verb.iobj', 'none');
    expect(v.get('Verb.iobj')).toEqual('none');
  });

  it('should allow code to be set in the constructor', function() {
    var v = new Moo.Verb({Verb: {code: []}});
    expect(v.get('Verb.code')).toEqual([]);
  });

  it('should allow code to be set with dotted notation', function() {
    var v = new Moo.Verb;
    v.set('Verb.code', ['foo']);
    expect(v.get('Verb.code')).toEqual(['foo']);
  });

  it('should require names to be a string', function() {
    var v = new Moo.Verb({Verb: {names: '#1|obj'}});
    expect(v.isValid()).toBeFalsy();
    v.set('Verb.names', 5);
    expect(v.isValid()).toBeFalsy();
  });

  it('should require the owner to be an object number', function() {
    var v = new Moo.Verb({Verb: {owner: 'test|err'}});
    expect(v.isValid()).toBeFalsy();
    v.set('Verb.owner', 5);
    expect(v.isValid()).toBeFalsy();
  });

  it('should require the perms to be in the set "rwxd"', function() {
    var v = new Moo.Verb({Verb: {perms: 'test|err'}});
    expect(v.isValid()).toBeFalsy();
    v.set('Verb.perms', 5);
    expect(v.isValid()).toBeFalsy();
  });

  it('should require the dobj to be valid', function() {
    var v = new Moo.Verb({Verb: {dobj: 'test|err'}});
    expect(v.isValid()).toBeFalsy();
    v.set('Verb.dobj', 5);
    expect(v.isValid()).toBeFalsy();
  });

  it('should require the prep to be valid', function() {
    var v = new Moo.Verb({Verb: {prep: 'test|err'}});
    expect(v.isValid()).toBeFalsy();
    v.set('Verb.prep', 5);
    expect(v.isValid()).toBeFalsy();
  });

  it('should require the iobj to be valid', function() {
    var v = new Moo.Verb({Verb: {iobj: 'test|err'}});
    expect(v.isValid()).toBeFalsy();
    v.set('Verb.iobj', 5);
    expect(v.isValid()).toBeFalsy();
  });

  it('should require code to be an array of strings', function() {
    var v = new Moo.Verb({Verb: {code: 'test|err'}});
    expect(v.isValid()).toBeFalsy();
    v.set('Verb.code', 5);
    expect(v.isValid()).toBeFalsy();
  });

  it('should not allow an invalid verb specification', function() {
    var v = new Moo.Verb({Verb: 5});
    expect(v.isValid()).toBeFalsy();
    v.set('Verb', 'five');
    expect(v.isValid()).toBeFalsy();
  });

  describe('verb in the context of an object', function() {

    var o;

    beforeEach(function() {
      o = new Moo.Object({
        Attributes: {},
        Values: {name: {Value: {value: 'Test'}}},
        Properties: [],
        Verbs: []
      });
    });

    it('should ensure isDenied() returns true if access to the verb with the specified id is denied', function() {
      o.verbs.add({id: 0, Meta: {status: 'denied'}, Verb: {}});
      expect(o.verbs.get(0).isDenied()).toBeTruthy();
    });

    it('should ensure isDenied() returns false if access to the verb with the requested id was not denied', function() {
      o.verbs.add({id: 0, Meta: {}, Verb: {}});
      expect(o.verbs.get(0).isDenied()).toBeFalsy();
    });
  });
});

describe('Moo.Object', function() {

  describe('construction', function() {

    it('should allow attributes to be add via the object constructor', function() {
      var o = new Moo.Object({Attributes: {player: {Value: {value: 0}}}});
      expect(o.attributez.get('player').get('Value.value')).toEqual(0);
    });

    it('should allow values to be add via the object constructor', function() {
      var o = new Moo.Object({Values: {name: {Value: {value: 'test'}}}});
      expect(o.values.get('name').get('Value.value')).toEqual('test');
    });

    it('should allow properties to be add via the object constructor', function() {
      var o = new Moo.Object({Properties: [{Property: {name: 'foo'}}, {Property: {name: 'bar'}}]});
      expect(o.properties.get(0).get('Property.name')).toEqual('foo');
      expect(o.properties.get(1).get('Property.name')).toEqual('bar');
    });

    it('should allow verbs to be add via the object constructor', function() {
      var o = new Moo.Object({Verbs: [{Verb: {names: 'foo bar'}}, {Verb: {names: 'one two'}}]});
      expect(o.verbs.get(0).get('Verb.names')).toEqual('foo bar');
      expect(o.verbs.get(1).get('Verb.names')).toEqual('one two');
    });
  });

  describe('modification', function() {

    var o;

    beforeEach(function() {
      o = new Moo.Object({
            Values: {zorch: {'Value.value': 'abc'}},
            Properties: [{'Property.name': 'test'}],
            Verbs : [{'Verb.names': 'test'}]
          });
    });

    describe('as raw attributes', function() {

      it('should allow attributes to be added after construction', function() {
        o.attributez.add({parents: {Value: {value: []}}, player: {Value: {value: 1}}});
        expect(o.attributez.get('parents').get('Value.value')).toEqual([]);
        expect(o.attributez.get('player').get('Value.value')).toEqual(1);
      });

      it('should allow values to be added after construction', function() {
        o.values.add({name: {Value: {value: 'test'}}, f: {Value: {value: 0}}});
        expect(o.values.get('name').get('Value.value')).toEqual('test');
        expect(o.values.get('f').get('Value.value')).toEqual(0);
      });

      it('should allow properties to be added after construction', function() {
        o.properties.add({Property: {name: 'foo', perms: ''}});
        expect(o.properties.get(1).get('Property.name')).toEqual('foo');
        expect(o.properties.get(1).get('Property.perms')).toEqual('');
      });

      it('should allow verbs to be added after construction', function() {
        o.verbs.add({Verb: {names: 'foo', perms: ''}});
        expect(o.verbs.get(1).get('Verb.names')).toEqual('foo');
        expect(o.verbs.get(1).get('Verb.perms')).toEqual('');
      });
    });
  });

  describe('to json', function() {

    it('should output attributes in the JSON', function() {
      var o = new Moo.Object({Attributes: {player: {Value: {value: 0}}}});
      expect(o.toJSON().Attributes.player.Value.value).toEqual(0);
    });

    it('should output values in the JSON', function() {
      var o = new Moo.Object({Values: {name: {Value: {value: 'test'}}}});
      expect(o.toJSON().Values.name.Value.value).toEqual('test');
    });
  });

  describe('validations', function() {

    it('should fail to validate if the player attribute is not 0 or 1', function() {
      var o = new Moo.Object;
      o.attributez.add({id: 'player', Value: {value: 'test'}});
      expect(o.isValid()).toBeFalsy();
      o.attributez.get('player').set('Value.value', 5);
      expect(o.isValid()).toBeFalsy();
      o.attributez.get('player').set('Value.value', 1);
      expect(o.isValid()).toBeTruthy();
    });

    it('should fail to validate if the parents attribute is not an array of object numbers', function() {
      var o = new Moo.Object;
      o.attributez.add({id: 'parents', Value: {value: 'test'}});
      expect(o.isValid()).toBeFalsy();
      o.attributez.get('parents').set('Value.value', ['test']);
      expect(o.isValid()).toBeFalsy();
      o.attributez.get('parents').set('Value.value', ['#1|obj']);
      expect(o.isValid()).toBeTruthy();
    });

    it('should fail to validate if the name value is not a string', function() {
      var o = new Moo.Object;
      o.values.add({id: 'name', Value: {value: '#1|obj'}});
      expect(o.isValid()).toBeFalsy();
      o.values.get('name').set('Value.value', 5);
      expect(o.isValid()).toBeFalsy();
      o.values.get('name').set('Value.value', '5');
      expect(o.isValid()).toBeTruthy();
    });

    it('should fail to validate if the owner value is not an object number', function() {
      var o = new Moo.Object;
      o.values.add({id: 'owner', Value: {value: '#1'}});
      expect(o.isValid()).toBeFalsy();
      o.values.get('owner').set('Value.value', 5);
      expect(o.isValid()).toBeFalsy();
      o.values.get('owner').set('Value.value', '#5|obj');
      expect(o.isValid()).toBeTruthy();
    });

    it('should fail to validate if the location value is not an object number', function() {
      var o = new Moo.Object;
      o.values.add({id: 'location', Value: {value: '#1'}});
      expect(o.isValid()).toBeFalsy();
      o.values.get('location').set('Value.value', 5);
      expect(o.isValid()).toBeFalsy();
      o.values.get('location').set('Value.value', '#5|obj');
      expect(o.isValid()).toBeTruthy();
    });

    it('should fail to validate if the contents value is not an array of object numbers', function() {
      var o = new Moo.Object;
      o.values.add({id: 'contents', Value: {value: 'test'}});
      expect(o.isValid()).toBeFalsy();
      o.values.get('contents').set('Value.value', ['test']);
      expect(o.isValid()).toBeFalsy();
      o.values.get('contents').set('Value.value', ['#1|obj']);
      expect(o.isValid()).toBeTruthy();
    });

    it('should fail to validate if the programmer value is not 0 or 1', function() {
      var o = new Moo.Object;
      o.values.add({id: 'programmer', Value: {value: 'test'}});
      expect(o.isValid()).toBeFalsy();
      o.values.get('programmer').set('Value.value', 5);
      expect(o.isValid()).toBeFalsy();
      o.values.get('programmer').set('Value.value', 1);
      expect(o.isValid()).toBeTruthy();
    });

    it('should fail to validate if the wizard value is not 0 or 1', function() {
      var o = new Moo.Object;
      o.values.add({id: 'wizard', Value: {value: 'test'}});
      expect(o.isValid()).toBeFalsy();
      o.values.get('wizard').set('Value.value', 5);
      expect(o.isValid()).toBeFalsy();
      o.values.get('wizard').set('Value.value', 1);
      expect(o.isValid()).toBeTruthy();
    });

    it('should fail to validate if the r (read) value is not 0 or 1', function() {
      var o = new Moo.Object;
      o.values.add({id: 'r', Value: {value: 'test'}});
      expect(o.isValid()).toBeFalsy();
      o.values.get('r').set('Value.value', 5);
      expect(o.isValid()).toBeFalsy();
      o.values.get('r').set('Value.value', 1);
      expect(o.isValid()).toBeTruthy();
    });

    it('should fail to validate if the w (write) value is not 0 or 1', function() {
      var o = new Moo.Object;
      o.values.add({id: 'w', Value: {value: 'test'}});
      expect(o.isValid()).toBeFalsy();
      o.values.get('w').set('Value.value', 5);
      expect(o.isValid()).toBeFalsy();
      o.values.get('w').set('Value.value', 1);
      expect(o.isValid()).toBeTruthy();
    });

    it('should fail to validate if the f (fertile) value is not 0 or 1', function() {
      var o = new Moo.Object;
      o.values.add({id: 'f', Value: {value: 'test'}});
      expect(o.isValid()).toBeFalsy();
      o.values.get('f').set('Value.value', 5);
      expect(o.isValid()).toBeFalsy();
      o.values.get('f').set('Value.value', 1);
      expect(o.isValid()).toBeTruthy();
    });
  });

  describe('save', function() {

    it('should assign an id to a newly saved object', function() {
      spyOn($, "ajax").andCallFake(function(options) {
        options.success({Meta: {id: 1}});
      });
      var o = new Moo.Object;
      o.save();
      expect(o.id).toBeTruthy();
    });

    it('should preserve the id of an existing object', function() {
      spyOn($, "ajax").andCallFake(function(options) {
        options.success({Meta: {id: 2}}, 'success');
      });
      var o = new Moo.Object({id: 2});
      o.save();
      expect(o.id).toEqual(2);
    });
  });

  it('should ensure failed() returns true if fetch() failed for some reason', function() {
    spyOn($, "ajax").andCallFake(function(options) {
      options.error({status: 500}, 'error', 'Internal Server Error');
    });
    var o = new Moo.Object({id: 1});
    o.fetch();
    expect(o.failed()).toBeTruthy();
  });

  it('should ensure failed() returns false if fetch() did not fail for any reason', function() {
    spyOn($, "ajax").andCallFake(function(options) {
      options.success({}, 'Ok', {status: 200});
    });
    var o = new Moo.Object({id: 1});
    o.fetch();
    expect(o.failed()).toBeFalsy();
  });

  it('should ensure isDenied() returns true if access to the object with the requested id was denied', function() {
    spyOn($, "ajax").andCallFake(function(options) {
      options.error({status: 403}, 'error', 'Forbidden');
    });
    var o = new Moo.Object({id: 1});
    o.fetch();
    expect(o.isDenied()).toBeTruthy();
  });

  it('should ensure isDenied() returns false if access to the object with the requested id was not denied', function() {
    spyOn($, "ajax").andCallFake(function(options) {
      options.success({}, 'Ok', {status: 200});
    });
    var o = new Moo.Object({id: 1});
    o.fetch();
    expect(o.isDenied()).toBeFalsy();
  });

  it('should ensure isNotFound() returns true if the object with the requested id does not exist on the server', function() {
    spyOn($, "ajax").andCallFake(function(options) {
      options.error({status: 404}, 'error', 'Not Found');
    });
    var o = new Moo.Object({id: 1});
    o.fetch();
    expect(o.isNotFound()).toBeTruthy();
  });

  it('should ensure isNotFound() does not return true if the object with the requested id exists on the server', function() {
    spyOn($, 'ajax').andCallFake(function(options) {
      options.success({}, 'Ok', {status: 200});
    });
    var o = new Moo.Object({id: 1});
    o.fetch();
    expect(o.isNotFound()).toBeFalsy();
  });

  it('should ensure isReadable() returns true if the object is readable on the server', function() {
    spyOn($, "ajax").andCallFake(function(options) {
      options.success({Meta: {status: 'readable'}}, 'Ok', {status: 200});
    });
    var o = new Moo.Object({id: 1});
    o.fetch();
    expect(o.isReadable()).toBeTruthy();
  });

  it('should ensure isReadable() returns false if the object is not readable on the server', function() {
    spyOn($, "ajax").andCallFake(function(options) {
      options.success({Meta: {status: 'foobar'}}, 'Ok', {status: 200});
    });
    var o = new Moo.Object({id: 1});
    o.fetch();
    expect(o.isReadable()).toBeFalsy();
  });


  it('should ensure isWritable() returns true if the object is writable on the server', function() {
    spyOn($, "ajax").andCallFake(function(options) {
      options.success({Meta: {status: 'writable'}}, 'Ok', {status: 200});
    });
    var o = new Moo.Object({id: 1});
    o.fetch();
    expect(o.isWritable()).toBeTruthy();
  });

  it('should ensure isWritable() returns false if the object is not writable on the server', function() {
    spyOn($, "ajax").andCallFake(function(options) {
      options.success({Meta: {status: 'foobar'}}, 'Ok', {status: 200});
    });
    var o = new Moo.Object({id: 1});
    o.fetch();
    expect(o.isWritable()).toBeFalsy();
  });
});

describe('widget $().simpleObjectPanel', function() {

  var template, o, p;

  $.ajax({
    async: false,
    type: 'get',
    url: '/html/moo-0.0.3.html',
    success: function(data) {
      template = data;
    }
  });

  beforeEach(function() {
    p = $('<div></div>').simpleObjectPanel({
      template: _.template(template)
    });
    o = new Moo.Object({
      Attributes: {},
      Values: {name: {Value: {value: 'Test'}}},
      Properties: [{Property: {name: 'Test Property', owner: '#1|obj', perms: '', value: 0}}],
      Verbs: [{Verb: {names: 'Test Verb', owner: '#1|obj', perms: '', dobj: '', prep: '', iobj: '', code: []}}]
    });
  });

  it('should display the object name in the heading', function() {
    p.simpleObjectPanel({object: o});
    expect(p.find('h1').text()).toContain('Test');
  });

  it('should display "Request Failed" in the heading if the request for the object failed', function() {
    spyOn(o, 'failed').andReturn(1);
    p.simpleObjectPanel({object: o});
    expect(p.find('h1').text()).toContain('Request Failed');
  });

  it('should display "Request Denied" in the heading if the request for the object was denied', function() {
    spyOn(o, 'isDenied').andReturn(1);
    p.simpleObjectPanel({object: o});
    expect(p.find('h1').text()).toContain('Request Denied');
  });

  it('should display "Not Found" in the heading if the object does not exist on the server', function() {
    spyOn(o, 'isNotFound').andReturn(1);
    p.simpleObjectPanel({object: o});
    expect(p.find('h1').text()).toContain('Not Found');
  });

  it('should display an enabled player indicator in the summary if the object is a player', function() {
    o.attributez.add({id: 'player', 'Value.value': 1});
    p.simpleObjectPanel({object: o});
    expect(p.find('.object-summary .player-flag').length).toEqual(1);
    expect(p.find('.object-summary .player-flag .disabled').length).toEqual(0);
  });

  it('should display a disabled player indicator in the summary if the object is not a player', function() {
    o.attributez.add({id: 'player', 'Value.value': 0});
    p.simpleObjectPanel({object: o});
    expect(p.find('.object-summary .player-flag').length).toEqual(1);
    expect(p.find('.object-summary .player-flag .disabled').length).toEqual(1);
  });

  it('should display an enabled programmer indicator in the summary if the object is a programmer', function() {
    o.values.add({id: 'programmer', 'Value.value': 1});
    p.simpleObjectPanel({object: o});
    expect(p.find('.object-summary .programmer-flag').length).toEqual(1);
    expect(p.find('.object-summary .programmer-flag .disabled').length).toEqual(0);
  });

  it('should display a disabled programmer indicator in the summary if the object is not a programmer', function() {
    o.values.add({id: 'programmer', 'Value.value': 0});
    p.simpleObjectPanel({object: o});
    expect(p.find('.object-summary .programmer-flag').length).toEqual(1);
    expect(p.find('.object-summary .programmer-flag .disabled').length).toEqual(1);
  });

  it('should display an enabled wizard indicator in the summary if the object is a wizard', function() {
    o.values.add({id: 'wizard', 'Value.value': 1});
    p.simpleObjectPanel({object: o});
    expect(p.find('.object-summary .wizard-flag').length).toEqual(1);
    expect(p.find('.object-summary .wizard-flag .disabled').length).toEqual(0);
  });

  it('should display a disabled wizard indicator in the summary if the object is not a wizard', function() {
    o.values.add({id: 'wizard', 'Value.value': 0});
    p.simpleObjectPanel({object: o});
    expect(p.find('.object-summary .wizard-flag').length).toEqual(1);
    expect(p.find('.object-summary .wizard-flag .disabled').length).toEqual(1);
  });

  it('should display an enabled read indicator in the summary if the object is readable', function() {
    o.values.add({id: 'r', 'Value.value': 1});
    p.simpleObjectPanel({object: o});
    expect(p.find('.object-summary .read-flag').length).toEqual(1);
    expect(p.find('.object-summary .read-flag.disabled').length).toEqual(0);
  });

  it('should display a disabled read indicator in the summary if the object is not readable', function() {
    o.values.add({id: 'r', 'Value.value': 0});
    p.simpleObjectPanel({object: o});
    expect(p.find('.object-summary .read-flag').length).toEqual(1);
    expect(p.find('.object-summary .read-flag.disabled').length).toEqual(1);
  });

  it('should display an enabled write indicator in the summary if the object is writable', function() {
    o.values.add({id: 'w', 'Value.value': 1});
    p.simpleObjectPanel({object: o});
    expect(p.find('.object-summary .write-flag').length).toEqual(1);
    expect(p.find('.object-summary .write-flag.disabled').length).toEqual(0);
  });

  it('should display a disabled write indicator in the summary if the object is not writable', function() {
    o.values.add({id: 'w', 'Value.value': 0});
    p.simpleObjectPanel({object: o});
    expect(p.find('.object-summary .write-flag').length).toEqual(1);
    expect(p.find('.object-summary .write-flag.disabled').length).toEqual(1);
  });

  it('should display an enabled fertile indicator in the summary if the object is fertile', function() {
    o.values.add({id: 'f', 'Value.value': 1});
    p.simpleObjectPanel({object: o});
    expect(p.find('.object-summary .fertile-flag').length).toEqual(1);
    expect(p.find('.object-summary .fertile-flag.disabled').length).toEqual(0);
  });

  it('should display a disabled fertile indicator in the summary if the object is not fertileable', function() {
    o.values.add({id: 'f', 'Value.value': 0});
    p.simpleObjectPanel({object: o});
    expect(p.find('.object-summary .fertile-flag').length).toEqual(1);
    expect(p.find('.object-summary .fertile-flag.disabled').length).toEqual(1);
  });

  it('should display the parents in the heading', function() {
    o.attributez.add({id: 'parents', 'Value.value': ['#100|obj', '#200|obj']});
    p.simpleObjectPanel({object: o});
    expect(p.find('.object-summary .parents').length).toEqual(1);
  });

  it('should display the property name in the properties table', function() {
    var s = spyOn(o.properties.get(0), 'isDenied').andReturn(0);
    p.simpleObjectPanel({object: o});
    expect(p.find('.properties .property > td').text()).toContain('Test Property');
    expect(s).toHaveBeenCalled();
  });

  it('should display "denied" in the properties table if access to the property is denied', function() {
    var s = spyOn(o.properties.get(0), 'isDenied').andReturn(1);
    p.simpleObjectPanel({object: o});
    expect(p.find('.properties .property > td').text()).toContain('denied');
    expect(s).toHaveBeenCalled();
  });

  it('should display the verb names in the verbs table', function() {
    var s = spyOn(o.verbs.get(0), 'isDenied').andReturn(0);
    p.simpleObjectPanel({object: o});
    expect(p.find('.verbs .verb > td').text()).toContain('Test Verb');
    expect(s).toHaveBeenCalled();
  });

  it('should display "denied" in the verbs table if access to the verb is denied', function() {
    var s = spyOn(o.verbs.get(0), 'isDenied').andReturn(1);
    p.simpleObjectPanel({object: o});
    expect(p.find('.verbs .verb > td').text()).toContain('denied');
    expect(s).toHaveBeenCalled();
  });
});
