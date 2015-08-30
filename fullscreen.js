var fullscreen = function( _element ){
  if( _element.requestFullScreen ){
    _element.requestFullScreen();
  }else if( _element.mozRequestFullScreen ){
    _element.mozRequestFullScreen();
  }else if( _element.webkitRequestFullScreen ){
    _element.webkitRequestFullScreen();
  }
}
