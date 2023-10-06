import React, { FC, useEffect, useState } from "react"
import { EditUserProfileApp } from "./EditUserProfileApp"
import { ImageZoomerApp } from "./ImageZoomerApp"

const AppSwitcher: FC = () => {
  const apps = [{
    name: 'Image',
    component: ImageZoomerApp,
  }, {
    name: 'Users',
    component: EditUserProfileApp,
  }]
  let [selected, setSelected] = useState<number>(0)
  let current = apps[selected]
  return <>
    <div>
      Switch app
      {apps.map((app, idx) =>
        <button key={idx} onClick={() => setSelected(idx)}>
          {app.name}
        </button>)}
    </div>
    <current.component />
  </>
}

export const App: FC = () => {
  return <AppSwitcher />
}
