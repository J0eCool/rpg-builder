import React, { FC, useEffect, useState } from "react"
import { EditUserProfileApp } from "./EditUserProfileApp"
import { CanvasDrawingApp } from "./CanvasDrawingApp"
import { ImageZoomerApp } from "./ImageZoomerApp"
import { LoremIpsum } from "./LoremIpsum"
import { TestRunnerApp } from "./TestRunnerApp"
import { WebGPUApp } from "./WebGPUApp"
import { DataEditorApp } from "./DataEditorApp"

const AppSwitcher: FC = () => {
  interface Indexable<T> { [key: string]: T }
  const apps: Indexable<FC> = {
    'Image': ImageZoomerApp,
    'Canvas': CanvasDrawingApp,
    'WebGPU': WebGPUApp,
    'Lorem': LoremIpsum,
    'Users': EditUserProfileApp,
    'Data': DataEditorApp,
    'Testing': TestRunnerApp,
  }
  const getLocalLastSelectedApp = (): string => {
    return localStorage.getItem('lastSelectedApp') ?? 'Image'
  }
  const setLocalLastSelectedApp = (name: string) => {
    localStorage.setItem('lastSelectedApp', name)
  }
  let [selected, setSelected] = useState(getLocalLastSelectedApp())
  let Current = apps[selected]

  return <>
    <div>
      <span>Switch app</span>
      {Object.keys(apps).map((name, idx) => <button
        key={idx} onClick={() => {
          setLocalLastSelectedApp(name)
          setSelected(name)
        }}>
          {name}
        </button>)}
    </div>
    <Current />
  </>
}

export const App: FC = () => {
  return <AppSwitcher />
}
