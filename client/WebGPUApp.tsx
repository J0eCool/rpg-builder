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

      const sampler = device.createSampler({
        minFilter: 'linear',
        magFilter: 'linear',
      })
      const uniformBuffer = device.createBuffer({
        size: 16,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
      })

      class Scene {
        img: string
        shader: string
        pos: Vec2

        device: GPUDevice
        pipeline: GPURenderPipeline | null
        texture: GPUTexture | null
        uniformBindGroup: GPUBindGroup | null

        constructor(device: GPUDevice, img: string, shader: string, pos: Vec2) {
          this.img = img
          this.shader = shader
          this.pos = pos

          this.device = device
          this.pipeline = null
          this.texture = null
          this.uniformBindGroup = null
        }

        async load() {
          await this.loadTexture()
          await this.loadPipeline()

          this.uniformBindGroup = device.createBindGroup({
            layout: this.pipeline!.getBindGroupLayout(0),
            entries: [{
              binding: 0,
              resource: sampler,
            }, {
              binding: 1,
              resource: this.texture!.createView(),
            }, {
              binding: 2,
              resource: { buffer: uniformBuffer }
            }]
          })
        }

        async loadTexture() {
          const bitmap = await fetchBitmap(this.img)
          this.texture = this.device.createTexture({
            size: [bitmap.width, bitmap.height, 1],
            format: 'rgba8unorm',
            usage:
              GPUTextureUsage.TEXTURE_BINDING |
              GPUTextureUsage.COPY_DST |
              GPUTextureUsage.RENDER_ATTACHMENT,
          })
          this.device.queue.copyExternalImageToTexture(
            { source: bitmap },
            { texture: this.texture },
            [bitmap.width, bitmap.height]
          )
        }

        async loadPipeline() {
          const shaderText = await fetchText(this.shader)
          const shaderModule = this.device.createShaderModule({
            code: shaderText,
          })
          this.pipeline = this.device.createRenderPipeline({
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
        }
      }

      const sceneData = [{
        image: 'data/PIC_1.png',
        shader: 'data/shader.wgsl',
        pos: new Vec2(-0.5, -0.5),
      }, {
        image: 'data/SHAPE_2013.png',
        shader: 'data/SHAPE_2013.wgsl',
        pos: new Vec2(0.5, -0.5),
      }, {
        image: 'data/SHAPE_2196.png',
        shader: 'data/SHAPE_2198.wgsl',
        pos: new Vec2(-0.5, 0.5),
      }, {
        image: 'data/SHAPE_2197.png',
        shader: 'data/SHAPE_2198.wgsl',
        pos: new Vec2(0.0, 1.5),
      }, {
        image: 'data/SHAPE_2198.png',
        shader: 'data/SHAPE_2198.wgsl',
        pos: new Vec2(0.5, 0.5),
      }]
      const scenes = sceneData.map(
        data => new Scene(device, data.image, data.shader, data.pos)
      )
      for (let scene of scenes) {
        await scene.load()
      }

      // -----------------------------------------------------------

      let zoom = 1.0
      let camera = new Vec2(0, 0)
      const draw = (now: number) => {
        // device.label = `draw-${shared.animFrameId}`

        
        for (let scene of scenes) {
          const commandEncoder = device.createCommandEncoder()
          const pos = scene.pos.sub(camera)
          device.queue.writeBuffer(uniformBuffer, 0,
            new Float32Array([now, zoom, pos.x, pos.y]))

          const pass = commandEncoder.beginRenderPass({
            colorAttachments: [{
              // clearValue: { r: 0.0, g: 0.2, b: 0.3, a: 1.0 },
              loadOp: 'load' as GPULoadOp,
              storeOp: 'store' as GPUStoreOp,
              view: ctx.getCurrentTexture().createView(),
            }],
          })
          pass.setPipeline(scene.pipeline!)
          pass.setBindGroup(0, scene.uniformBindGroup!)
          pass.setVertexBuffer(0, vertexBuffer)
          pass.draw(6)
          pass.end()
          device.queue.submit([commandEncoder.finish()])
        }
        
      }

      let zoomTarget = zoom
      let lastTime = performance.now()/1000
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
  
        draw(now)
        
        shared.animFrameId = requestAnimationFrame(frame)
      }
      frame()

      canvas.ondblclick = () => {
        canvas.requestFullscreen()
      }
      // canvas.onclick = (ev) => {
      //   loadPipeline().then((pipeline) => {
      //     renderPipeline = pipeline
      //   })
      // }

      let mousePos: Vec2|null = null
      const ev2pos = (ev: MouseEvent) => new Vec2(ev.clientX, ev.clientY)
      canvas.onmousedown = (ev) => {
        mousePos = ev2pos(ev)
        ev.preventDefault()
      }
      canvas.onmouseup = (ev) => {
        mousePos = null
        ev.preventDefault()
      }
      canvas.onmousemove = (ev) => {
        if (mousePos) {
          const cur = ev2pos(ev)
          camera = camera.sub(cur.sub(mousePos)
            .mul(new Vec2(2, -2)
            .div(zoom)
            .div(new Vec2(canvas.width, canvas.height))))
          mousePos = cur
          ev.preventDefault()
        }
      }

      const socket = new WebSocket('ws://localhost:1123')
      socket.onmessage = (ev) => {
        // reload shaders when server says they've changed
        if (ev.data.startsWith('changed:')) {
          const filename = ev.data.slice('changed:'.length)
          for (let scene of scenes) {
            if (scene.shader == filename) {
              scene.loadPipeline()
            }
          }
        }
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
