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
    <DataEditor schema={schema} data={data} updateElem={(idx, elem) => {
      const clone = Array.from(data)
      clone[idx] = elem
      setData(clone)
      syncToServer()
    }} />
   </>
}

const FieldEditor = ({value, setValue, type}: any) => {
  switch (type){
    case 'String':
    case 'Int':
      return <input value={value} onChange={(ev) => {
        let v = ev.target.value
        setValue(type == 'Int' ? (+v|0) : v)
      }} />
    case 'Vec2':
      const setVec = (ev: React.ChangeEvent<HTMLInputElement>, n: number) => {
        let c = Array.from(value)
        c[n] = +ev.target.value
        setValue(c)
      }
      return <>
        <input value={value[0]} onChange={(ev) => setVec(ev, 0)} />
        <input value={value[1]} onChange={(ev) => setVec(ev, 1)} />
      </>
  }
}

const DataEditor = ({schema, data, updateElem}:
    { schema: Schema,
      data: any[],
      updateElem: (idx: number, elem: any) => void}) => {
  return <>
    <table>
      <thead>
        <tr>
          {schema.fields.map(({name, type}, idx) =>
            <th key={idx}>{name} ({type})</th>)}
        </tr>
      </thead>
      <tbody>
        {data.map((elem, elem_idx) =>
          <tr key={elem_idx}>
            {schema.fields.map(({name, type}, idx) =>
              <td key={idx}>
                <FieldEditor value={elem[name]} type={type}
                  setValue={(value: any) => {
                    elem[name] = value
                    updateElem(elem_idx, elem)
                  }} />
              </td>)}
          </tr>)}
      </tbody>
    </table>
  </>
}
