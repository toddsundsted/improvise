/* global Moo describe it expect beforeEach afterEach */

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
  });

  it('should allow singly-nested attributes to be got with dotted notation', function() {
    var test = new Test;
    test.attributes = {foo: {bar: 'baz'}, one: {two: 'three'}};
    expect(test.get('foo.bar')).toEqual('baz');
    expect(test.get('one.two')).toEqual('three');
  });

  it('should allow doubly-nested attributes to be got with dotted notation', function() {
    var test = new Test;
    test.attributes = {foo: {bar: {baz: 'quux'}}, one: {two: {three: 'four'}}};
    expect(test.get('foo.bar.baz')).toEqual('quux');
    expect(test.get('one.two.three')).toEqual('four');
  });

  it('should allow overlapping nested attributes to be got with dotted notation', function() {
    var test = new Test;
    test.attributes = {foo: {bar: 1, baz: 2}};
    expect(test.get('foo.bar')).toEqual(1);
    expect(test.get('foo.baz')).toEqual(2);
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
});

describe('Moo.Object', function() {

  it('should allow attributes to be created via the object constructor', function() {
    var o = new Moo.Object({Attributes: {player: {Value: {value: 0}}}});
    expect(o.attributez.get('player').get('Value.value')).toEqual(0);
  });

  it('should output attributes in the JSON', function() {
    var o = new Moo.Object({Attributes: {player: {Value: {value: 0}}}});
    expect(o.toJSON().Attributes.player.Value.value).toEqual(0);
  });

  it('should allow values to be created via the object constructor', function() {
    var o = new Moo.Object({Values: {name: {Value: {value: 'test'}}}});
    expect(o.values.get('name').get('Value.value')).toEqual('test');
  });

  it('should output values in the JSON', function() {
    var o = new Moo.Object({Values: {name: {Value: {value: 'test'}}}});
    expect(o.toJSON().Values.name.Value.value).toEqual('test');
  });

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
