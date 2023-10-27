import React, { FC, useEffect, useState, useRef } from "react"
import { Vec2 } from "./Vec2"
import { GameScene, Sprite, Time } from "./GameScene"
import { text } from "stream/consumers"

async function fetchText(url: string): Promise<string> {
  const resp = await fetch(url)
  return await resp.text()
}
async function fetchBitmap(url: string): Promise<ImageBitmap> {
  const resp = await fetch(url)
  return await createImageBitmap(await resp.blob())
}

/**
 * WebGPU Test App
 */
export const WebGPUApp = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) {
      return
    }

    const shared = {
      animFrameId: 0,
      canceled: false,
    }

    if (!navigator.gpu) throw Error('WebGPU not supported')
    navigator.gpu.requestAdapter()
    .then(async (adapter: GPUAdapter | null) => {
      if (shared.canceled) return
      if (!adapter) throw Error('requestAdapter failed')
      const device = await adapter.requestDevice()
      device.label = 'origin'

      const ctx = canvas.getContext('webgpu')
      if (!ctx) throw Error('no WebGPU context on canvas')
      ctx.configure({
        device,
        format: navigator.gpu.getPreferredCanvasFormat(),
        alphaMode: 'premultiplied',
      })

      const vertices = new Float32Array([
        -0.5, -0.5, 0, 1,    0, 1,    //0, 0,
        -0.5,  0.5, 0, 1,    0, 0,    //0, 0,
         0.5, -0.5, 0, 1,    1, 1,    //0, 0,

         0.5, -0.5, 0, 1,    1, 1,    //0, 0,
        -0.5,  0.5, 0, 1,    0, 0,    //0, 0,
         0.5,  0.5, 0, 1,    1, 0,    //0, 0,
      ])
      const vertexBuffer = device.createBuffer({
        size: vertices.byteLength,
        usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
      })
      device.queue.writeBuffer(vertexBuffer, 0, vertices)

      const uniformBuffer = device.createBuffer({
        size: 8,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
      })

      // describes the data layout of the vertex data
      const vertexBuffers: GPUVertexBufferLayout[] = [{
        attributes: [{
          shaderLocation: 0, // position
          offset: 0,
          format: 'float32x4',
        }, {
          shaderLocation: 1, // uv
          offset: 16,
          format: 'float32x2',
        }] as GPUVertexAttribute[], // needed to typecheck
        arrayStride: 24,
        stepMode: 'vertex',
      }]

      const bitmap = await fetchBitmap('data/SHAPE_2013.png')
      const texture = device.createTexture({
        size: [bitmap.width, bitmap.height, 1],
        format: 'rgba8unorm',
        usage:
          GPUTextureUsage.TEXTURE_BINDING |
          GPUTextureUsage.COPY_DST |
          GPUTextureUsage.RENDER_ATTACHMENT,
      })
      device.queue.copyExternalImageToTexture(
        { source: bitmap },
        { texture },
        [bitmap.width, bitmap.height]
      )

      // set up the GPU Pipeline
      const shaderText = await fetchText('data/shader.wgsl')
      const shaderModule = device.createShaderModule({
        code: shaderText,
      })
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

      const sampler = device.createSampler({
        minFilter: 'linear',
        magFilter: 'linear',
      })

      const uniformBindGroup = device.createBindGroup({
        layout: renderPipeline.getBindGroupLayout(0),
        entries: [{
          binding: 0,
          resource: sampler,
        }, {
          binding: 1,
          resource: texture.createView(),
        }, {
          binding: 2,
          resource: { buffer: uniformBuffer }
        }]
      })

      // -----------------------------------------------------------

      const draw = () => {
        // device.label = `draw-${shared.animFrameId}`

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
        pass.setBindGroup(0, uniformBindGroup)
        pass.setVertexBuffer(0, vertexBuffer)
        pass.draw(6)
        pass.end()
        
        device.queue.submit([commandEncoder.finish()])
      }

      let lastTime = performance.now()/1000
      let zoom = 2.0
      let zoomTarget = zoom
      const frame = () => {
        const now = performance.now()/1000
        const dT = now - lastTime
        lastTime = now

        // Zoom based on logarithms
        // This is probably overengineered and janky, but it feels correct-ish
        let ratio = zoomTarget/zoom
        ratio = Math.max(ratio, 1/ratio)
        if (ratio > 1.001) {
          const zoomLogSpeed = -1.5*(1-Math.pow(ratio,2))
          const delta = Math.log(zoomTarget) - Math.log(zoom)
          const logZoomDelta = Math.sign(delta)*zoomLogSpeed*dT
          const nextZoom = Math.pow(Math.E, Math.log(zoom) + logZoomDelta)
          if (Math.abs(delta) < zoomLogSpeed*dT) {
            zoom = zoomTarget
          } else {
            zoom = nextZoom
          }
        }

        device.queue.writeBuffer(uniformBuffer, 0,
          new Float32Array([now, zoom]))
  
        draw()
        
        shared.animFrameId = requestAnimationFrame(frame)
      }
      frame()

      canvas.ondblclick = () => {
        canvas.requestFullscreen()
      }
  
      const zoomSpeed = 1.3
      canvas.onwheel = (ev) => {
        const dy = ev.deltaY/100;
        zoomTarget *= dy < 0 ? zoomSpeed : 1/zoomSpeed;
        ev.preventDefault()
      }
    })  

    // cancel animation request when we unmount this app
    return () => {
      cancelAnimationFrame(shared.animFrameId)
      shared.canceled = true
    }
  }, [])

  return <>
    <canvas ref={canvasRef} width="900px" height="900px" />
  </>
}
