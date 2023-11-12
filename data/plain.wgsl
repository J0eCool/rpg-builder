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

  return c;
}
