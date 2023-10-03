import React, { FC, useEffect, useState } from "react"

interface User {
    name: string,
    color: string,
}

const LoginButton = ({user}: {user: User}) => {
    return <button onClick={async () => {
        let resp = await fetch('data/users.json')
        let json = await resp.text()
        console.log('logging in as', user.name, 'returns', json)
    }}>
        Login
    </button>
}

const UserProfile = ({user}: {user: User}) => {
    let style: React.CSSProperties = {
        color: user.color
    }
    return <>
        <div style={style}>{user.name}: <LoginButton user={user} /></div>
    </>
}

const EditUsers = () => {
    const usersUrl = 'data/users.json'
    const [users, setUsers] = useState<User[]>()
    useEffect(() => {
        console.log('fetching user data')
        fetch(usersUrl)
            .then((res) => res.json())
            .then((data: User[]) => setUsers(data))
    }, [])

    if (!users) {
        return <>loading</>
    }

    return <>
        <h1>Edit Users</h1>
        <button onClick={() => {
            fetch(usersUrl, {
                method: 'PUT',
                body: JSON.stringify(users, undefined, 2)
            })
        }}>
            Push Changes
        </button>
        {users.map((user, index) =>
            <UserProfile key={index} user={user} />)}
    </>
}

const App: FC = () => {
    return <EditUsers />
}

export default App
