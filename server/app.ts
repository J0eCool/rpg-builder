import express, { Application, Request, Response } from 'express'
import ws from 'ws'
import fs from 'fs'
import path from "path"
import process from 'process'

const PORT: number = 1123
const app: Application = express()

express.static.mime.define({'text/wgsl': ['wgsl']})
app.use(express.static(path.join(process.cwd(), "public")))

app.use(express.text())
app.get('/data/:filename', (req: Request, res: Response) => {
    const { filename } = req.params
    const pathname = path.join(process.cwd(), 'data', filename)
    res.sendFile(pathname, (err) => {
        if (err) {
            console.error(err)
            res.send(`error reading file at ${filename}`)
        }
    })
})
app.put('/data/:filename', (req: Request, res: Response) => {
    const { filename } = req.params
    const pathname = path.join(process.cwd(), 'data', filename)
    console.log(`request to put ${filename} with body=`, req.body)
    fs.writeFile(pathname, req.body, (err) => {
        if (err) {
            console.error(err)
            res.send(500)
        } else {
            res.sendStatus(200)
        }
    })
})

const openSockets: ws[] = []
const wsServer = new ws.Server({ noServer: true })
wsServer.on('connection', (socket) => {
    openSockets.push(socket)
    socket.on('message', (msg) => {
        console.log('[wsServer]:', msg)
    })
})

const server = app.listen(PORT, (): void => {
    console.log('Server started on port', PORT)
})
server.on('upgrade', (req, socket, head) => {
    wsServer.handleUpgrade(req, socket, head, (socket) => {
        wsServer.emit('connection', socket, req)
    })
})

const lastChanged = new Map<string, number>()
const watcher = fs.watch('data/')
watcher.on('change', (ev: string, filename: string) => {
    // filesystem gets events up to 4x; filter rapid repeats to avoid
    // extraneous websocket spam
    const last = lastChanged.get(filename) ?? 0
    if (Date.now() - last > 100) {
        console.log('file changed:', ev, filename, Date.now())
        lastChanged.set(filename, Date.now())
        for (const socket of openSockets) {
            socket.send('changed:data/' + filename)
        }
    }
})
