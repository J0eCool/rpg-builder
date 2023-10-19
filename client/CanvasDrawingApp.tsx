import React, { FC, useEffect, useState, useRef } from "react"
import { Vec2 } from "./Vec2"
import { GameScene, Sprite } from "./GameScene"

/**
 * application for recursively zooming into images
*/
export const CanvasDrawingApp = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [effect0, setEffect0] = useState(0.85)
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
    for (let y of [25, 325])
      for (let x of [125, 425])
        addItem('data/SHAPE_0137.png', x, y)

    interface Time {
      now: number
      delta: number
    }
    const update = (t: Time) => {
      const src = sprites[0].imageData
      const dest = sprites[1].imageData
      const r = Math.random
      
      const s = effect0
      console.log(s)
      for (let i = 0; i < 50000*t.delta; ++i) {
        let x = (r()*src.width)|0
        let y = (r()*src.height)|0
        let i = (4 * (x + y * src.width))|0
        for (let j = 0; j < 3; ++j) {
          let lhs = src.data[i+j]*s
          let c = 0.5-r()*r()
          let rhs = 255*c*(1-s)
          dest.data[i+j] = (lhs + rhs)|0
        }
      }
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
    }
    frame()

    // cancel animation request when we unmount this app
    return () => {
      cancelAnimationFrame(animFrameId)
    }
  }, [])
  
  const Slider = ({label, value, setValue}: {
    label: string,
    value: number,
    setValue: (v: number) => void,
  }) => {
    return <><div>
      {label}
      <input type="range"
        min={0} max={1} step={0.001} value={value}
        style={{width:200}}
        onChange={(ev) => {
          setValue(+ev.target.value)
        }} />
      ({value})
    </div></>
  }

  return <>
    <canvas ref={canvasRef} width="900px" height="600px" />
    {/* <Slider label="EFFECT_0" value={effect0} setValue={setEffect0} /> */}
    <div>
      EFFECT_0 again
      <input type="range"
        min={0} max={1} step={0.001} value={effect0}
        style={{width:200}}
        onChange={(ev) => {
          setEffect0(+ev.target.value)
        }} />
      ({effect0})
    </div>
  </>
}
