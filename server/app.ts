import express, { Application, Request, Response } from 'express'
import path from "path"

const PORT: number = 1123
const app: Application = express()

app.use(express.static(path.join(__dirname, "../public")))

app.use('/', (req: Request, res: Response) => {
    res.send("index.html")
})

app.listen(PORT, (): void => {
    console.log('Server started on port', PORT)
})
