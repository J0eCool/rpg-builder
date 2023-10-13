import { Vec2 } from "./Vec2"

export class Node {
  children: Node[] = []
}

export interface Camera {
  pos: Vec2
  bounds: Vec2
  zoom: number
}

interface Drawable {
  draw(camera: Camera, ctx: CanvasRenderingContext2D): void
}
function canDraw(obj: any): obj is Drawable {
  return (obj as Drawable).draw != undefined
}

export class Sprite extends Node implements Drawable {
  image: HTMLImageElement
  pos: Vec2

  constructor(image: HTMLImageElement, pos: Vec2) {
    super()
    this.image = image
    this.pos = pos
  }

  draw(camera: Camera, ctx: CanvasRenderingContext2D) {
    // time for some camera maffs!
    const size = new Vec2(this.image.width, this.image.height)
    const halfBounds = camera.bounds.div(2)
    // camera pos is center-aligned, so make it consistent by shifting its
    // coordinates by half the screen size
    const camTopLeft = camera.pos.sub(halfBounds.div(camera.zoom))
    const topLeft = this.pos.sub(camTopLeft).mul(camera.zoom)
    const drawSize = size.mul(camera.zoom)
    ctx.drawImage(this.image, topLeft.x, topLeft.y, drawSize.x, drawSize.y)
  }
}

export class GameScene extends Node {
  camera: Camera

  constructor(bounds: Vec2) {
    super()
    this.camera = {
      pos: bounds.div(2),
      bounds,
      zoom: 1,
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    for (let n of this.children) {
      if (canDraw(n)) {
        n.draw(this.camera, ctx)
      }
    }
  }
}
