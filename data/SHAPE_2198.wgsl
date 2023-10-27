// A custom shader for SHAPE_2198.png

struct VertexIn {
  @location(0) pos: vec4f,
  @location(1) uv: vec2f,
}

struct Uniforms {
  time: f32,
  zoom: f32,
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
  out.pos = in.pos * vec4(vec3(uniforms.zoom), 1.0);
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
  // c = vec4(1.0, 0.0, 0.0, 1.0);

  if (c.a <= 0.1) {
    discard;
  }

  let p = vec2(in.uv)*2.0 - 1.0;
  let r = dot(p,p);
  let x = p.x;
  let y = p.y;
  let t = uniforms.time;

  // use normalized color to determine hue
  let u = normalize(c.rgb);

  if (u.r > 0.95) {
    // red pixels
    let reps = 8.0*vec2(1.3, 0.7);
    let spd = 0.3*vec2(0.83, -1.03);
    let pix = sin(TAU*reps*p + spd*t);
    let ripple = sin(1.2*TAU*t + 5.4*pix.x*pix.y/(0.2+r)) * (1.0-r);

    c.r *= max(0.65 + 0.35*ripple, c.b);
    if (ripple < -vary(0.6, 0.875, 0.2)) {
      c.g = 1.0;
    }
  } else if (u.b > 0.8) {
    // blue pixels
    // c = vec4(1.0, 0.0, 1.0, c.a);
    // c = vec4(c.b, c.b, 0.0, c.a);
    c.b = c.b + 0.2*sin(0.8*TAU*t + 2.0*TAU*c.b);
  } else {
    // white pixels
    // c = vec4(1.0, 1.0, 0.0, c.a);
    if (r > 0.2) {
      c *= vary(0.1, 1.0, 0.2);
    }
    return vec4(c.rgb, 1.0);
  }

  return c;
}
