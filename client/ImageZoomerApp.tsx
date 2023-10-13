import React, { FC, useEffect, useState, useRef } from "react"
import { LoremIpsum } from "./LoremIpsum"
import { Vec2 } from "./Vec2"
import { GameScene, Sprite } from "./GameScene"

/**
 * application for recursively zooming into images
 */
export const ImageZoomerApp = () => {
  const items: Sprite[] = []
  const addItem = (imageUrl: string, x: number, y: number) => {
    const image = new Image()
    image.src = imageUrl
    items.push(new Sprite(image, new Vec2(x, y)))
  }
  addItem('data/CLIPStudioPaint_4JJ9JlOab2.png', 200, 25)
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
    const canvasSize = new Vec2(canvas.width, canvas.height)
        
    let scene = new GameScene(canvasSize)
    scene.children = items
        
    // Mouse wheel to Zoom
    canvas.onwheel = (ev) => {
      ev.preventDefault()
      // deltaY is either -100 (scroll up) or +100 (scroll down)
      const ratio = 1.25
      if (ev.deltaY > 0) {
        scene.camera.zoom /= ratio
      } else {
        scene.camera.zoom *= ratio
      }
    }

    // Drag the camera around
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
        const mousePos = new Vec2(ev.clientX, ev.clientY)
        const cam = scene.camera
        cam.pos = cam.pos.sub(mousePos.sub(lastMousePos).div(cam.zoom))
        lastMousePos = mousePos
      }
    }
    
    let animFrameId: number
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      scene.draw(ctx)
      
      animFrameId = requestAnimationFrame(draw)
    }
    draw()

    // cancel animation request when we unmount this app
    return () => {
      cancelAnimationFrame(animFrameId)
    }
  }, [])
  
  return <>
    <canvas ref={canvasRef} width="1280px" height='920px' />
  </>
}
