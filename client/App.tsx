import React, { FC, useState } from "react"

interface User {
    name: string,
    color: string,
}

const UserProfile = ({user}: {user: User}) => {
    let style: React.CSSProperties = {
        color: user.color
    }
    return <div>
        <div style={style}>{user.name}</div>
    </div>
}

const App: FC = () => {
    return <UserProfile user={{name: "J0eCool", color: "red"}} />
}

export default App
