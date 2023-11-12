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

fn wave(x: f32) -> f32 {
  return 0.5*sin(TAU*x) + 0.5;
}

fn qmul(a: vec4f, b: vec4f) -> vec4f {
  var q: vec4f;
  // i^2 = j^2 = k^2 = ijk = -1
  q.w = a.w*b.w - a.x*b.x - a.y*b.y - a.z*b.z;
  q.x = a.x*b.w + a.w*b.x + a.y*b.z - a.z*b.y;
  q.y = a.y*b.w + a.w*b.y + a.z*b.x - a.x*b.z;
  q.z = a.z*b.w + a.w*b.z + a.x*b.y - a.y*b.x;
  return q;
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

  var a = vec4(
    wave(1.0*y*r+t),
    wave(3.0*x*r-y+t),
    wave(2.0*y*r+x+t),
    wave(4.0*r),
  );
  var b = vec4(
    wave(6.0*y*r+t),
    wave(7.0*x*r-y+t),
    wave(8.0*y*r+x+t),
    wave(4.0*r),
  );
  c *= qmul(a, b);

  return c;
}
