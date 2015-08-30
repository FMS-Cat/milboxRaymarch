#ifdef GL_ES
precision highp float;
#endif

#define PI 3.14159265

#define EYE_DISTANCE 0.01
#define FOCUS 0.5
#define MARCH_ITER 48
#define SHIFT vec3( 0.5 )
#define ROTATE vec3( 1.0 + t )
#define COLOR1 vec3( 0.1, 0.1, 0.1 )
#define COLOR2 vec3( 0.2, 0.9, 0.6 ) * 4.0
#define COLOR3 vec3( 0.9, -1.1, -0.35 ) * 9.0

#define t time
#define r resolution

#define saturate(i) clamp(i,0.,1.)

uniform float t;
uniform vec2 r;
uniform vec3 u_camPos;
uniform vec3 u_camAxe;
uniform sampler2D randomTexture;

mat2 rotate( float _t ){
  return mat2( cos( _t ), sin( _t ), -sin( _t ), cos( _t ) );
}

vec3 axes( vec3 _i, vec3 _a ){
  vec3 i = _i;
  i.yz = rotate( _a.z ) * i.yz;
  i.xy = rotate( _a.y ) * i.xy;
  i.zx = rotate( _a.x ) * i.zx;
  return i;
}

vec4 tex( vec2 _v ){
  return texture2D( randomTexture, _v );
  /*
  vec2 v = _v * 256.0 - 0.5;
  vec2 vFloor = floor( v );
  vec2 vMod = mod( v, 1.0 );

  vec4 p00 = texture2D( randomTexture, ( vFloor + vec2( 0.5, 0.5 ) ) / 256.0 );
  vec4 p01 = texture2D( randomTexture, ( vFloor + vec2( 0.5, 1.5 ) ) / 256.0 );
  vec4 p10 = texture2D( randomTexture, ( vFloor + vec2( 1.5, 0.5 ) ) / 256.0 );
  vec4 p11 = texture2D( randomTexture, ( vFloor + vec2( 1.5, 1.5 ) ) / 256.0 );

  return mix(
    mix( p00, p10, vMod.x ),
    mix( p01, p11, vMod.x ),
    vMod.y
  );
  */
}

vec4 noise( vec2 _p, float _r, float _d ){
  vec4 sum = vec4( 0.0 );
  for( float i=1.0; i<40.5; i+=1.0 ){
    vec2 p = mod( rotate( _r * ( 1.0 - exp( -i ) ) ) * _p * exp( i * 0.9 - 4.0 ), 1.0 );
    sum += tex( p ) / pow( 2.0, i );
    if( _d < i ){ break; }
  }
  return sum;
}

vec3 catColor( float _theta ){
  return vec3(
    sin( _theta ),
    sin( _theta + PI / 3.0 * 2.0 ),
    sin( _theta + PI / 3.0 * 4.0 )
  ) * 0.5 + 0.5;
}

float plane( vec3 _p, float _height ){
  return _p.y - _height;
}

vec3 distFunc( vec3 _p, float _lastDist ){
  vec3 p = _p;

  float n = noise( p.xz * 0.1, 1.0, exp( -max( _lastDist, 0.0 ) * 28.0 ) * 6.0 ).x;
  float height = -0.5;
  height += n * 0.4;
  vec3 dist = vec3( 0.0 );
  dist.x = p.y - height;
  dist.y = n;

  return dist;
}

vec3 distFunc( vec3 _p ){
  return distFunc( _p, 0.01 );
}

vec3 normalFunc( vec3 _p ){
  vec2 d = vec2( 0.0, 1E-3 );
  return normalize( vec3(
    distFunc( _p + d.yxx ).x - distFunc( _p - d.yxx ).x,
    distFunc( _p + d.xyx ).x - distFunc( _p - d.xyx ).x,
    distFunc( _p + d.xxy ).x - distFunc( _p - d.xxy ).x
  ) );
}

void main(){
  if( distFunc( u_camPos ).x < 0.0 ){
    gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
  }else{
    vec2 p = vec2( 0.0 );
    float rightEye = 0.0;

    if( gl_FragCoord.x < r.x * 0.5 ){
      p = ( gl_FragCoord.xy * 2.0 - r * vec2( 0.5, 1.0 ) ) / r.x;
    }else{
      p = ( gl_FragCoord.xy * 2.0 - r * vec2( 1.5, 1.0 ) ) / r.x;
      rightEye = 1.0;
    }

    vec3 camPos = u_camPos;
    vec3 camSid = axes( vec3( 1.0, 0.0, 0.0 ), u_camAxe );
    vec3 camTop = axes( vec3( 0.0, 1.0, 0.0 ), u_camAxe );
    vec3 camDir = axes( vec3( 0.0, 0.0, -1.0 ), u_camAxe );

    vec3 camTar = camPos + camDir * FOCUS;
    camPos += camSid * ( -0.5 + rightEye ) * EYE_DISTANCE;
    camDir = normalize( camTar - camPos );
    camSid = normalize( cross( camDir, camTop ) );

    vec3 rayBeg = camPos;
    vec3 rayDir = normalize( p.x * camSid + p.y * camTop + camDir );
    float rayLen = 0.0;
    vec3 rayPos = vec3( 0.0 );
    vec3 rayCol = vec3( 0.0 );

    rayLen = 0.01;
    rayPos = rayBeg + rayDir * rayLen;
    vec3 dist = vec3( 1.0, 0.0, 0.0 );

    for( int iMarch=0; iMarch<MARCH_ITER; iMarch++ ){
      vec3 d = distFunc( rayPos, dist.x );
      dist = d;
      rayLen += dist.x * 0.7;
      rayPos = rayBeg + rayDir * rayLen;
    }

    if( abs( dist.x ) < 0.01 ){
      vec3 nor = normalFunc( rayPos );
      vec3 ligPos = camPos - camDir;
      vec3 ligDir = normalize( rayPos - ligPos );
      float ligLen = length( rayPos - ligPos );

      float dif = saturate( dot( -nor, ligDir ) );
      float spe = pow( saturate( dot( -nor, normalize( ligDir + rayDir ) ) ), 40.0 );

      rayCol = mix( vec3( 0.4, 0.9, 0.1 ), vec3( 0.9, 0.7, 0.3 ), dist.y ) * ( dif * 0.8 + 0.2 );
      rayCol += spe * pow( dist.y, 4.0 );
      rayCol *= exp( -ligLen * 0.1 );
      rayCol *= exp( -rayLen * 0.3 );
      rayCol += vec3( 0.8, 0.8, 0.8 ) * ( 1.0 - exp( -rayLen * 0.3 ) );
    }else{
      rayCol = mix( vec3( 0.8, 0.8, 0.8 ), vec3( 0.4, 0.5, 0.9 ), rayDir.y );
    }

    gl_FragColor = vec4( rayCol, 1.0 );
  }
}
