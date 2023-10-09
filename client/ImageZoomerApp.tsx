import React, { FC, useEffect, useState, useRef } from "react"
import { LoremIpsum } from "./LoremIpsum"
import Vec2 from "./Vec2"

interface ImageItem {
  image: HTMLImageElement
  pos: Vec2
}

/**
 * application for recursively zooming into images
 */
export const ImageZoomerApp = () => {
  const items: ImageItem[] = []
  const addItem = (imageUrl: string, x: number, y: number) => {
    const image = new Image()
    image.src = imageUrl
    items.push({
      image,
      pos: new Vec2(x, y),
    })
  }
  addItem('data/CLIPStudioPaint_4JJ9JlOab2.png', 600, 25)
  addItem('data/CLIPStudioPaint_944WNH6JgV.png', 50, 450)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    // more interesting react-canvas stuff from here:
    // https://medium.com/@pdx.lucasm/canvas-with-react-js-32e133c05258
    // of note: resizing canvas events
    const canvas = canvasRef.current
    if (!canvas) {
      return
    }
    const ctx = canvas.getContext('2d')!

    let animFrameId: number
    const halfCanvas = new Vec2(canvas.width, canvas.height).mul(0.5)
    let camera = {
      pos: halfCanvas,
      zoom: 1,
    }

    const drawItem = (item: ImageItem) => {
      // time for some camera maffs!
      const size = new Vec2(item.image.width, item.image.height)
      const halfSize = size.mul(0.5)
      // camera pos is center-aligned, so make it consistent by 
      const camTopLeft = camera.pos.sub(halfCanvas.div(camera.zoom))
      const topLeft = item.pos.sub(camTopLeft).mul(camera.zoom)
      const drawSize = size.mul(camera.zoom)
      ctx.drawImage(item.image, topLeft.x, topLeft.y, drawSize.x, drawSize.y)
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      for (let item of items) {
        drawItem(item)
      }

      animFrameId = requestAnimationFrame(draw)
    }
    draw()

    canvas.onwheel = (ev) => {
      ev.preventDefault()
      // deltaY is either -100 (scroll up) or +100 (scroll down)
      const ratio = 1.25
      if (ev.deltaY > 0) {
        camera.zoom /= ratio
      } else {
        camera.zoom *= ratio
      }
    }
    canvas.oncontextmenu = (ev) => {
      // prevents right-click from opening a context menu when over canvas
      return false
    }
    let lastMousePos: Vec2 | null = null
    canvas.onmousedown = (ev) => {
      ev.preventDefault()
      lastMousePos = new Vec2(ev.clientX, ev.clientY)
    }
    canvas.onmouseup = (ev) => {
      ev.preventDefault()
      lastMousePos = null
    }
    canvas.onmouseleave = (ev) => {
      lastMousePos = null
    }
    canvas.onmousemove = (ev) => {
      ev.preventDefault()
      if (lastMousePos) {
        let mousePos = new Vec2(ev.clientX, ev.clientY)
        camera.pos = camera.pos.sub(mousePos.sub(lastMousePos).div(camera.zoom))
        lastMousePos = mousePos
      }
    }

    // cancel animation request when we unmount this app
    return () => {
      cancelAnimationFrame(animFrameId)
    }
  }, [])

  return <>
    <canvas ref={canvasRef} width="1280px" height='920px' />
    <LoremIpsum />
  </>
}
