var touch = [];
var lastTouch = [];
var deltaTouch = [];
for( var i=0; i<2; i++ ){
  touch[i] = 0;
  lastTouch[i] = 0;
  deltaTouch[i] = 0;
}

var axes = [];
for( var i=0; i<3; i++ ){
  axes[i] = 0;
}

var camPos = [ 0.0, 0.0, 2.0 ];

var begin = function(){
  if( this.done ){ return; }
  else{ this.done = true; }

  console.log( 'begin' );

  var width = screen.height;
  var height = screen.width;

  var mother = document.createElement( 'div' );
  mother.style.width = width + 'px';
  mother.style.height = height + 'px';
  mother.style.transform = 'rotate( 90deg )';
  document.body.appendChild( mother );
  fullscreen( mother );

  var itaPoly = new ItaPoly( width * 0.5, height * 0.5 );
  itaPoly.canvas.style.width = width + 'px';
  itaPoly.canvas.style.height = height + 'px';
  requestText( 'shader.frag', function( _text ){
    itaPoly.createProgram( _text, function(){
      var a = [];
      for( var i=0; i<256*256*4; i++ ){
        a[i] = ~~( Math.random() * 256 );
      }

      itaPoly.setSampler2DFromArray( 'randomTexture', a, 256, 256 );
      mother.appendChild( itaPoly.canvas );
      ready( 'itaPoly program' );
    } );
  } );

  var ready = function( _text ){
    console.log( 'ready : ' + _text );
    if( !this.count ){ this.count = 0; }
    this.count ++;
    if( this.count == 1 ){ go(); }
  }

  var go = function(){
    console.log( 'go!' );

    var update = function(){
      var dir = vector.axes( [ 0.0, 0.0, -1.0 ], axes );
      camPos = vector.add( camPos, vector.scalar( dir, -deltaTouch[1] * 0.01 ) );

      itaPoly.setVec3( 'u_camPos', camPos );
      itaPoly.setVec3( 'u_camAxe', axes );
      itaPoly.update();

      deltaTouch[0] = 0;
      deltaTouch[1] = 0;

      requestAnimationFrame( update );
    };
    update();
  };
};


window.addEventListener( 'deviceorientation', function( _event ){
  axes[0] = _event.alpha / 180.0 * Math.PI;
  axes[1] = -_event.beta / 180.0 * Math.PI;
  axes[2] = -( _event.gamma + 90.0 ) / 180.0 * Math.PI;
} );

window.addEventListener( 'touchstart', function( _event ){
  begin();

  touch[0] = _event.touches[0].clientX;
  touch[1] = _event.touches[0].clientY;
} );

window.addEventListener( 'touchmove', function( _event ){
  lastTouch[0] = touch[0];
  lastTouch[1] = touch[1];

  touch[0] = _event.touches[0].clientX;
  touch[1] = _event.touches[0].clientY;

  deltaTouch[0] = touch[0] - lastTouch[0];
  deltaTouch[1] = touch[1] - lastTouch[1];
} );
