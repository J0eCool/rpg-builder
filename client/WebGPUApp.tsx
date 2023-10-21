import React, { FC, useEffect, useState, useRef } from "react"
import { Vec2 } from "./Vec2"
import { GameScene, Sprite, Time } from "./GameScene"

/**
 * WebGPU Test App
 */
export const WebGPUApp = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = canvasRef.current
    
    // more interesting react-canvas stuff from here:
    // https://medium.com/@pdx.lucasm/canvas-with-react-js-32e133c05258
    // of note: resizing canvas events
    if (!canvas) {
      return
    }

    const shared = {
      animFrameId: 0,
    }

    if (!navigator.gpu) throw Error('WebGPU not supported')
    navigator.gpu.requestAdapter()
    .then(async (adapter: GPUAdapter | null) => {
      if (!adapter) throw Error('requestAdapter failed')
      const device = await adapter.requestDevice()

      async function fetchText(url: string): Promise<string> {
        const resp = await fetch(url)
        return await resp.text()
      }
      const shaderText = await fetchText('data/shader.wgsl')
      const shaderModule = device.createShaderModule({
        code: shaderText,
      })

      const ctx = canvas.getContext('webgpu')
      if (!ctx) throw Error('no WebGPU context on canvas')
      ctx.configure({
        device,
        format: navigator.gpu.getPreferredCanvasFormat(),
        alphaMode: 'premultiplied',
      })

      const vertices = new Float32Array([
         0.0,  0.6, 0, 1,   1, 0, 0, 1,
        -0.7, -0.6, 0, 1,   0, 1, 0, 1,
         0.7, -0.6, 0, 1,   0, 0, 1, 1,
      ])
      const vertexBuffer = device.createBuffer({
        size: vertices.byteLength,
        usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
      })
      device.queue.writeBuffer(vertexBuffer, 0, vertices/*, 0, vertices.length*/)

      // describes the data layout of the vertex data
      const vertexBuffers: GPUVertexBufferLayout[] = [{
        attributes: [{
          shaderLocation: 0, // position
          offset: 0,
          format: 'float32x4',
        }, {
          shaderLocation: 1, // color
          offset: 16,
          format: 'float32x4',
        }] as GPUVertexAttribute[], // needed to typecheck
        arrayStride: 32,
        stepMode: 'vertex',
      }]

      // set up the GPU Pipeline
      const renderPipeline = device.createRenderPipeline({
        vertex: {
          module: shaderModule,
          entryPoint: 'vertex_main',
          buffers: vertexBuffers,
        },
        fragment: {
          module: shaderModule,
          entryPoint: 'fragment_main',
          targets: [{
            format: navigator.gpu.getPreferredCanvasFormat(),
          }]
        },
        primitive: {
          topology: 'triangle-list',
        },
        layout: 'auto'
      })

      const commandEncoder = device.createCommandEncoder()
      const pass = commandEncoder.beginRenderPass({
        colorAttachments: [{
          clearValue: { r: 0.0, g: 0.2, b: 0.3, a: 1.0 },
          loadOp: 'clear' as GPULoadOp,
          storeOp: 'store' as GPUStoreOp,
          view: ctx.getCurrentTexture().createView(),
        }],
      })
      pass.setPipeline(renderPipeline)
      pass.setVertexBuffer(0, vertexBuffer)
      pass.draw(3)
      pass.end()

      device.queue.submit([commandEncoder.finish()])



      let lastTick = performance.now()
      const frame = () => {
        const now = performance.now()
        const dT = (now - lastTick) / 1000
        lastTick = now

        shared.animFrameId = requestAnimationFrame(frame)
      }
      frame()
    })

    // cancel animation request when we unmount this app
    return () => {
      cancelAnimationFrame(shared.animFrameId)
    }
  }, [])

  return <>
    <canvas ref={canvasRef} width="900px" height="900px" />

  </>
}
