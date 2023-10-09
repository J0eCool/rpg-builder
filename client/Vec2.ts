export default class Vec2 {
  x: number
  y: number

  constructor(x: number, y: number) {
    this.x = x
    this.y = y
  }

  add(v: Vec2): Vec2 {
    return new Vec2(this.x + v.x, this.y + v.y)
  }
  sub(v: Vec2): Vec2 {
    return new Vec2(this.x - v.x, this.y - v.y)
  }
  mul(v: Vec2 | number): Vec2 {
    if (v instanceof Vec2) {
      return new Vec2(this.x * v.x, this.y * v.y)
    } else {
      return new Vec2(this.x * v, this.y * v)
    }
  }
  div(v: Vec2 | number): Vec2 {
    if (v instanceof Vec2) {
      return new Vec2(this.x / v.x, this.y / v.y)
    } else {
      return new Vec2(this.x / v, this.y / v)
    }
  }
}
