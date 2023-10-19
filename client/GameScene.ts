import { Vec2 } from "./Vec2"

export interface Time {
  now: number
  delta: number
}

export interface Camera {
  pos: Vec2
  bounds: Vec2
  zoom: number
}

export class Node {
  children: Node[] = []
}

interface Drawable {
  draw(camera: Camera, ctx: CanvasRenderingContext2D): void
}
function isDrawable(obj: any): obj is Drawable {
  return (obj as Drawable).draw != undefined
}

export class Sprite extends Node implements Drawable {
  imageData: ImageData
  w: number
  h: number
  pos: Vec2

  constructor(imageUrl: string, pos: Vec2) {
    super()

    // default values to something sane while we load
    this.w = 1
    this.h = 1
    this.imageData = new ImageData(1, 1)
    this.pos = pos

    const img = new Image()
    img.src = imageUrl
    img.onload = (_ev: Event) => {
      this.w = img.width
      this.h = img.height
      const canvas = new OffscreenCanvas(this.w, this.h)
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0)
      this.imageData = ctx.getImageData(0, 0, this.w, this.h)
    }
  }

  draw(camera: Camera, ctx: CanvasRenderingContext2D) {
    // time for some camera maffs!
    const size = new Vec2(this.imageData.width, this.imageData.height)
    const halfBounds = camera.bounds.div(2)
    // camera pos is center-aligned, so make it consistent by shifting its
    // coordinates by half the screen size
    const camTopLeft = camera.pos.sub(halfBounds.div(camera.zoom))
    const topLeft = this.pos.sub(camTopLeft).mul(camera.zoom)
    const drawSize = size.mul(camera.zoom)
    ctx.putImageData(this.imageData, topLeft.x, topLeft.y, 0, 0, drawSize.x, drawSize.y)
  }
}

export class GameScene extends Node {
  canvas: HTMLCanvasElement
  camera: Camera
  update: (t: Time) => void = (_t) => {}

  constructor(canvas: HTMLCanvasElement) {
    super()
    this.canvas = canvas
    const bounds = new Vec2(canvas.width, canvas.height)
    this.camera = {
      pos: bounds.div(2),
      bounds,
      zoom: 1,
    }
  }

  draw() {
    const ctx = this.canvas.getContext('2d')!
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    for (let n of this.children) {
      if (isDrawable(n)) {
        n.draw(this.camera, ctx)
      }
    }
  }
}
