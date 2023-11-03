import React, { FC, useEffect, useState } from "react"
import { Schema, ValidData, validateData } from "./SchemaData"

const schemas: Schema[] = [{
  url: 'data/scenes.json',
  fields: [
    { name: 'image', type: 'String' },
    { name: 'shader', type: 'String' },
    { name: 'pos', type: 'Vec2' },
  ],
}]

/**
 * an App that creates and modifies different data tables
 * 
 * basically My Very Own Excel
 */
export const DataEditorApp: FC = () => {
  // This is currently a stub to get a sense of the dataflow
  // main thing is this widget is the top-level UI, so it is responsible for
  // switching between 

  const [schema, setSchema] = useState<Schema>(schemas[0])
  const [data, setData] = useState<any[]>()

  useEffect(() => {
    if (!schema) return

    fetch(schema.url)
    .then((res: Response) => res.json())
    .then((data: any) => {
      if (validateData(schema, data)) {
        setData(data)
      }
    })
  }, [schema])
  
  if (!schema || !data) {
    return <>loading</>
  }

  /** Send any changes to the server. Currently just sends all data */
  const syncToServer = () => {
    fetch(schema.url, {
      method: 'PUT',
      body: JSON.stringify(data, undefined, 2)
    })
  }

  return <>
    {/* <SchemaPicker setSchema={setSchema} /> */}
    <DataEditor schema={schema} data={data} />
   </>
}

const DataEditor = ({schema, data}: {schema: Schema, data: any[]}) => {
  return <>
    <table>
      <thead>
        <tr>
          {schema.fields.map(({name, type}, idx) =>
            <th key={idx}>{name} ({type})</th>)}
        </tr>
      </thead>
      <tbody>
        {data.map((elem, idx) =>
          <tr key={idx}>
            {schema.fields.map(({name, type}, idx) =>
              <td key={idx}>{elem[name]}</td>)}
          </tr>)}
      </tbody>
    </table>
  </>
}
