import { EditUserProfileApp } from "./EditUserProfileApp"
import React, { FC, useEffect, useState } from "react"

const AppSwitcher: FC = () => {
  const apps = [{
    name: 'Users',
    component: EditUserProfileApp,
  }, {
    name: 'Other thing',
    component: () => <div>Hi mom</div>,
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
