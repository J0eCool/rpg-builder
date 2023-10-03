import express, { Application, Request, Response } from 'express'
import fs from 'fs'
import path from "path"

const PORT: number = 1123
const app: Application = express()

app.use(express.static(path.join(__dirname, "../public")))

app.use(express.text())
app.get('/data/:filename', (req: Request, res: Response) => {
    const { filename } = req.params
    const pathname = path.join(__dirname, '../data', filename)
    fs.readFile(pathname, 'utf8', (err, data) => {
        if (err) {
            console.error(err)
            res.send(`error reading file at ${filename}`)
        } else {
            res.send(data)
        }
    })
})
app.put('/data/:filename', (req: Request, res: Response) => {
    const { filename } = req.params
    const pathname = path.join(__dirname, '../data', filename)
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

app.listen(PORT, (): void => {
    console.log('Server started on port', PORT)
})
