import React, { FC, useEffect, useState, useRef } from "react"


/**
 * application for recursively zooming into images
 */
export const ImageZoomerApp = () => {
  const ref = useRef<HTMLCanvasElement>(null)
  const img = new Image()
  img.src = 'data/CLIPStudioPaint_4JJ9JlOab2.png'
  useEffect(() => {
    // more interesting react-canvas stuff from here:
    // https://medium.com/@pdx.lucasm/canvas-with-react-js-32e133c05258
    // of note: resizing canvas events
    const canvas = ref.current
    if (!canvas) {
      return
    }
    const ctx = canvas.getContext('2d')!

    let t = 0
    let animFrameId: number
    const draw = () => {
      t += 1/60

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      ctx.fillStyle = 'red'
      ctx.fillRect(30, 30, 100, 100)

      let s = t*2*Math.PI
      let x = 300 + 75 * Math.cos(s*0.1)
      let y = 250 + 250 * Math.sin(s*0.025)
      ctx.drawImage(img, x, y)

      animFrameId = requestAnimationFrame(draw)
    }
    draw()

    // cancel animation request when we unmount this app
    return () => {
      cancelAnimationFrame(animFrameId)
    }
  }, [])

  return <>
    <canvas ref={ref} width="1280px" height='920px' />
  </>
}
