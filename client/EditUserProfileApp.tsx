import React, { FC, useEffect, useState } from "react"

interface User {
  id: number,
  name: string,
  color: string,
}

/**
 * A mini-profile, username + avatar + some custom styling
 *
 *  It's small and intended to be used inline with other content
 */
const UserBadge = ({user}: {user: User}) => {
  let style: React.CSSProperties = {
    color: user.color,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    fontSize: 'large',
  }
  return <span style={style}>{user.name}</span>
}

/**
 * Widget used to switch to another available user
 */
const UserSwitcher = ({users, onSwitch}:
    {users: User[], onSwitch: ((user: User) => void)}) => {
  return <div>
    <h3>User List</h3>
    {users.map((user, index) =>
      <div key={index}>
        <UserBadge user={user} />
        <button onClick={() => onSwitch(user)}>Select</button>
      </div>
    )}
  </div>
}

/**
 * a function that finds a unique userid
 */
function nextUserId(users: User[]) {
  return 1 + users.reduce((id, user) => Math.max(id, user.id), 0)
}

const ColorPicker = ({color, setColor}:
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

/**
 * an application/widget intended to quickly switch between users and edit how
 * their userprofile looks
 */
export const EditUserProfileApp = () => {
  const usersUrl = 'data/users.json'
  const [users, setUsers] = useState<User[]>()
  const [user, setUser] = useState<User>()
  const [name, setName] = useState<string>('Anon')
  const [color, setColor] = useState<string>('black')

  useEffect(() => {
    fetch(usersUrl)
    .then((res) => res.json())
    .then((users: User[]) => {
      setUsers(users)
      let user = users[0]
      setUser(user)
      setName(user.name)
      setColor(user.color)
    })
  }, [])
  
  if (!users || !user) {
    return <>loading</>
  }

  const SyncToServerButton = () => {
    return <button onClick={() => {
      fetch(usersUrl, {
        method: 'PUT',
        body: JSON.stringify(users, undefined, 2)
      })
    }}>
      Push All Changes
    </button>
  }

  const hasChanges = user.name != name ||
    user.color != color
  
  const SaveChangesButton = () => {
    return !hasChanges ? <></> : <button onClick={() => {
      let u = users.find((u) => u.id == user.id)
      if (!u) {
        throw 'uh oh'
      }
      u.name = name
      u.color = color
      setUser({...u})
      setUsers(users)
    }}>
      Save
    </button>
  }

  const AddUserButton = () => {
    return !hasChanges ? <></> : <button onClick={() => {
      const next = {
        id: nextUserId(users),
        name,
        color,
      }
      users.push(next)
      setUsers(users)
      setUser(next)
    }}>
      Add as New User
    </button>
  }

  return <>
    <h1>Edit User</h1>
    <div>
      <SyncToServerButton />
    </div>
    <div>
      Logged in as <UserBadge user={user} /><br />
      Username: <input value={name} onChange={(e) => {
        setName(e.target.value)
      }} /><br />
      Color: <ColorPicker color={color} setColor={setColor} /><br />
      <SaveChangesButton /><br />
      <AddUserButton />
    </div>
    <UserSwitcher
      users={users.filter((u) => u.id != user.id)}
      onSwitch={(u) => {
        setUser(u)
        setName(u.name)
        setColor(u.color)
      }}
      />
   </>
}
