struct VertexIn {
  @location(0) position: vec4f,
  @location(1) uv: vec2f,
}

struct VertexOut {
  @builtin(position) position : vec4f,
  @location(0) uv : vec2f,
}

@vertex
fn vertex_main(in: VertexIn) -> VertexOut {
  var output : VertexOut;
  output.position = in.position;
  output.uv = in.uv.xy;
  return output;
}

@group(0) @binding(0) var mySampler: sampler;
@group(0) @binding(1) var myTexture: texture_2d<f32>;

@fragment
fn fragment_main(fragData: VertexOut) -> @location(0) vec4f {
  let c = textureSample(myTexture, mySampler, fragData.uv);
  if (c.w <= 0.01) {
    discard;
  }
  return c;
}
