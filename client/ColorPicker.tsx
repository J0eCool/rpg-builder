import React from "react"

export const ColorPicker = ({color, setColor}:
    {color: string, setColor: (color: string) => void}) => {
  const colors = [
    'black',
    'red',
    'blue',
    'purple',
    'orange',
    'yellow',
    'green',
  ]
  return <>
    <span style={{color}}>{color}</span>
    <br />
    {colors.map((c, idx) => <button key={idx} onClick={() => setColor(c)}>
      {c}
    </button>)}
  </>
}
