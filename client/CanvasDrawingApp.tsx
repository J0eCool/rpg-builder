import React, { FC, useEffect, useState, useRef } from "react"
import { Vec2 } from "./Vec2"
import { GameScene, Sprite, Time } from "./GameScene"
import { clamp } from "./Util"

const Slider = ({range=[0, 1], value, setValue, children}: {
  range?: number[],
  value: number,
  setValue: (v: number) => void,
  children: React.ReactNode,
}) => {
  const [lo, hi] = range
  return <><div>
    {children}
    <input type="range"
      min={lo} max={hi} step={(hi-lo)/1000} value={value}
      style={{width:200}}
      onChange={(ev) => {
        setValue(+ev.target.value)
      }} />
    ({value})
  </div></>
}

/**
 * app for doing cool drawing + effects, pixel modification
 */
export const CanvasDrawingApp = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [effect0_p, setEffect0_p] = useState(0.1)
  const [effect0_s, setEffect0_s] = useState(0.85)
  const [effect0_v, setEffect0_v] = useState(0.035)
  const [sprites, setSprites] = useState<Sprite[]>([])
  const [scene, setScene] = useState<GameScene>()
  const [buttonText, setButtonText] = useState("")
  useEffect(() => {
    const canvas = canvasRef.current
    
    // more interesting react-canvas stuff from here:
    // https://medium.com/@pdx.lucasm/canvas-with-react-js-32e133c05258
    // of note: resizing canvas events
    if (!canvas) {
      return
    }

    let scene = new GameScene(canvas)
    if (sprites.length == 0) {
      let sprs: Sprite[] = []
      const addItem = (imageUrl: string, x: number, y: number) => {
        const sprite = new Sprite(imageUrl, new Vec2(x, y))
        sprs.push(sprite)
        scene.children.push(sprite)
      }
      for (let y of [25, 325]) {
        for (let x of [125, 425]) {
          addItem('data/SHAPE_0137.png', x, y)
        }
      }
      setSprites(sprs)
    }
    setScene(scene)

    let animFrameId: number
    let lastTick = performance.now()
    const frame = () => {
      const now = performance.now()
      const dT = (now - lastTick) / 1000
      lastTick = now
      scene.update({now, delta: dT})

      scene.draw()

      animFrameId = requestAnimationFrame(frame)
    }
    frame()

    // cancel animation request when we unmount this app
    return () => {
      cancelAnimationFrame(animFrameId)
    }
  }, [])

  if (scene) {
    scene.update = (t: Time) => {
      if (sprites.length == 0) return

      // controller support because I want to try the API
      for (let gamepad of navigator.getGamepads()) {
        if (gamepad) {
          // axes go LH, LV, RH, RV
          const dx = gamepad.axes[0]
          const dy = gamepad.axes[1]
          const deadzone = 0.1
          if (Math.abs(dx) > deadzone) {
            setEffect0_v(clamp(effect0_v + 0.3*dx*t.delta, 0, 1))
          }
          if (Math.abs(dy) > deadzone) {
            setEffect0_s(clamp(effect0_s - dy*t.delta, 0, 1))
          }

          for (let i = 0; i < gamepad.buttons.length; ++i) {
            const btn = gamepad.buttons[i]
            if (btn.pressed) {
              setButtonText(`pressed ${i}, ${btn.value}`)
            }
          }
        }
      }
    
      const src = sprites[0].imageData
      const r = Math.random
      
      /** EFFECT_0 shuffles the original, in position + color */
      function EFFECT_0(dest: ImageData) {
        const s = effect0_s
        const v = effect0_v
        const w = src.width
        const h = src.height
        for (let dy = 0; dy < h; ++dy) {
          for (let dx = 0; dx < w; ++dx) {
            if (r() > effect0_p) continue;
            let sy = dy+(v*(r()-0.5)*h)|0
            let sx = dx+(v*(r()-0.5)*w)|0
            let di = (4 * (dx + dy*w))|0
            let si = (4 * (sx + sy*w))|0
            for (let k = 0; k < 3; ++k) {
              let lhs = src.data[si+k]*s
              let rhs = 255*r()*(1-s)
              dest.data[di+k] = (lhs + rhs)|0
            }
            dest.data[di+3] = src.data[si+3]
          }
        }
      }

      EFFECT_0(sprites[1].imageData)
      EFFECT_0(sprites[3].imageData)
    }
  }

  return <>
    <canvas ref={canvasRef} width="900px" height="600px" />
    <Slider value={effect0_p} setValue={setEffect0_p} >
      EFFECT_0:p
    </Slider>
    <Slider value={effect0_s} setValue={setEffect0_s} >
      EFFECT_0:s
    </Slider>
    <Slider value={effect0_v} setValue={setEffect0_v} >
      EFFECT_0:v
    </Slider>
    {buttonText}
  </>
}
