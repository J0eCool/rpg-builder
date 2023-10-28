// A custom shader for SHAPE_2013.png

struct VertexIn {
  @location(0) pos: vec4f,
  @location(1) uv: vec2f,
}

struct Uniforms {
  time: f32,
  zoom: f32,
  pos: vec2f,
}

@group(0) @binding(0) var mySampler: sampler;
@group(0) @binding(1) var myTexture: texture_2d<f32>;
@group(0) @binding(2) var<uniform> uniforms: Uniforms;

struct VertexOut {
  @builtin(position) pos : vec4f,
  @location(0) uv : vec2f,
}

@vertex
fn vertex_main(in: VertexIn) -> VertexOut {
  var out : VertexOut;
  let pos = in.pos + vec4(uniforms.pos, 0.0, 0.0);
  out.pos = pos * vec4(vec3(uniforms.zoom), 1.0);
  out.uv = in.uv.xy;
  return out;
}

const PI = 3.1415926535;
const TAU = 2.0*PI;

// A number that varies between `lo` and `hi`, `rate` times per second
fn vary(lo: f32, hi: f32, rate: f32) -> f32 {
  return lo + (hi-lo)*0.5*(1.0+sin(rate*TAU*uniforms.time));
}

@fragment
fn fragment_main(in: VertexOut) -> @location(0) vec4f {
  var c = textureSample(myTexture, mySampler, in.uv);
  if (c.a <= 0.1) {
    discard;
  }

  let p = vec2(in.uv)*2.0 - 1.0;
  let r = dot(p,p);
  let x = p.x;
  let y = p.y;
  let t = uniforms.time;

  let reps = 0.44*vec2(1.3, 0.7)/pow(r+0.1,2.0);
  let spd = 0.3*vec2(0.83, -1.03);
  let pix = sin(TAU*reps*p + spd*t);
  let ripple = sin(0.2*TAU*t + 1.4*pix.x*pix.y/(0.2+r)) * (1.0-r);

  var u: vec4f;
  u.b = (1.0-c.r*15.0)*abs(0.5+ripple);
  u.r = c.r*0.6 + 0.4*sin(0.3*TAU*t + 2.0*TAU*c.r)*ripple;
  u.g = 0.0;
  u.a = c.a;
  if (normalize(c.rgb).r > 0.8 || r > 0.1) {
    c = u;
  } else {
    c = smoothstep(u, c, vec4(r/0.1));
  }
  c *= 1.0/(1.0+3.0*r);
  return c;
}
