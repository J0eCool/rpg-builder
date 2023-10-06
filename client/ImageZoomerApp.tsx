import React, { FC, useEffect, useState, useRef } from "react"


/**
 * application for recursively zooming into images
 */
export const ImageZoomerApp = () => {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
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
      let x = 400 + 400 * Math.sin(s*0.25)
      let y = 500 + 50 * Math.cos(s)
      ctx.fillStyle = 'blue'
      ctx.fillRect(x, y, 100, 100)

      animFrameId = requestAnimationFrame(draw)
    }
    draw()

    // cancel animation request when we unmount this app
    return () => {
      cancelAnimationFrame(animFrameId)
    }
  }, [])

  return <canvas ref={ref} width="1280px" height='920px' />
}
