import React, { FC, useEffect, useState } from "react"
import { Schema, ValidData, validateData } from "./SchemaData"

/**
 * an App that creates and modifies different data tables
 * 
 * basically My Very Own Excel
 */
export const DataEditorApp: FC = () => {
  // This is currently a stub to get a sense of the dataflow
  // main thing is this widget is the top-level UI, so it is responsible for
  // switching between 

  const [schema, setSchema] = useState<Schema>()
  const [data, setData] = useState<ValidData>()

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
    <SchemaPicker setSchema={setSchema} />
    <DataEditor schema={schema} data={data} />
   </>
}
