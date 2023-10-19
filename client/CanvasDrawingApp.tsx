import React, { FC, useEffect, useState, useRef } from "react"
import { Vec2 } from "./Vec2"
import { GameScene, Sprite } from "./GameScene"

/**
 * application for recursively zooming into images
 */
export const CanvasDrawingApp = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [beep, setBeep] = useState<number>(0)
  useEffect(() => {
    const canvas = canvasRef.current
    
    // more interesting react-canvas stuff from here:
    // https://medium.com/@pdx.lucasm/canvas-with-react-js-32e133c05258
    // of note: resizing canvas events
    if (!canvas) {
      return
    }
    
    const ctx = canvas.getContext('2d')!
    const canvasSize = new Vec2(canvas.width, canvas.height)

    let scene = new GameScene(canvasSize)
    const sprites: Sprite[] = []
    const addItem = (imageUrl: string, x: number, y: number) => {
      const sprite = new Sprite(imageUrl, new Vec2(x, y))
      sprites.push(sprite)
      scene.children.push(sprite)
    }
    for (let x of [125, 425])
      for (let y of [25, 325])
        addItem('data/SHAPE_0137.png', x, y)

    interface Time {
      now: number
      delta: number
    }
    const update = (t: Time) => {
      const img = sprites[1]
    }

    const draw = (ctx: CanvasRenderingContext2D) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      scene.draw(ctx)
    }  

    let animFrameId: number
    let lastTick = performance.now()
    const frame = () => {
      const now = performance.now()
      const dT = (now - lastTick) / 1000
      lastTick = now
      update({now, delta: dT})

      draw(canvas.getContext('2d')!)

      animFrameId = requestAnimationFrame(frame)
      setBeep(animFrameId)
    }
    frame()

    // cancel animation request when we unmount this app
    return () => {
      cancelAnimationFrame(animFrameId)
    }
  }, [])
  
  return <>
    <canvas ref={canvasRef} width="900px" height="600px" />
    <div>AnimframeId: {beep}</div>
  </>
}
