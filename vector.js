var vector = {};

vector.rotate = function( _array, _theta, _index1, _index2 ){
  var a = _array.slice();
  a[ _index1 ] = _array[ _index1 ] * Math.cos( _theta ) - _array[ _index2 ] * Math.sin( _theta );
  a[ _index2 ] = _array[ _index1 ] * Math.sin( _theta ) + _array[ _index2 ] * Math.cos( _theta );
  return a;
};

vector.axes = function( _array, _axes ){
  var a = _array.slice();
  a = vector.rotate( a, _axes[2], 1, 2 );
  a = vector.rotate( a, _axes[1], 0, 1 );
  a = vector.rotate( a, _axes[0], 2, 0 );
  return a;
};

vector.add = function( _v1, _v2 ){
  var a = [];
  for( var i=0; i<3; i++ ){
    a[i] = _v1[i] + _v2[i];
  }
  return a;
};

vector.scalar = function( _v, _s ){
  var a = [];
  for( var i=0; i<3; i++ ){
    a[i] = _v[i] * _s;
  }
  return a;
}
