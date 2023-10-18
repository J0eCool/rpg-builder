import React, { FC, useEffect, useState } from "react"
import { EditUserProfileApp } from "./EditUserProfileApp"
import { ImageZoomerApp } from "./ImageZoomerApp"
import { LoremIpsum } from "./LoremIpsum"
import { TestRunnerApp } from "./TestRunnerApp"

const AppSwitcher: FC = () => {
  const apps = [{
    name: 'Image',
    component: ImageZoomerApp,
  }, {
    name: 'Lorem',
    component: LoremIpsum,
  }, {
    name: 'Users',
    component: EditUserProfileApp,
  }, {
    name: 'Testing',
    component: TestRunnerApp,
  }]
  const getLocalLastSelectedApp = () => {
    const lastName = localStorage.getItem('lastSelectedApp')
    if (lastName) {
      for (let i = 0; i < apps.length; ++i) {
        if (apps[i].name == lastName) {
          return i
        }
      }
    }
    // if we can't find the last selected app by name, or if this is our first
    // viewing of the page, just pick the first app as the default
    return 0
  }
  const setLocalLastSelectedApp = (idx: number) => {
    localStorage.setItem('lastSelectedApp', apps[idx].name)
  }
  let [selected, setSelected] = useState<number>(getLocalLastSelectedApp())
  let current = apps[selected]

  return <>
    <div>
      Switch app
      {apps.map((app, idx) =>
        <button key={idx} onClick={() => {
          setLocalLastSelectedApp(idx)
          setSelected(idx)
        }}>
          {app.name}
        </button>)}
    </div>
    <current.component />
  </>
}

export const App: FC = () => {
  return <AppSwitcher />
}
