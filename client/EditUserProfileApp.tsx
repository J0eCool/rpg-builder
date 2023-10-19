import React, { useEffect, useState } from "react"
import { ColorPicker } from "./ColorPicker"

interface User {
  id: number,
  name: string,
  color: string,
}

/** The default user, if not logged in */
const anonymousUser = {
  id: 0,
  name: 'Anonymous',
  color: 'black',
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
 * Get the last user logged in out of localstorage
 * 
 * In the future this should be just storing userID, and syncing the
 * full User struct from server data, but I'd rather just limit the
 * number of places that can edit User data and cause desync for now
 */
function getLocalLoggedInUser(): User {
  const local = localStorage.getItem('loggedInUser')
  if (!local) {
    return anonymousUser
  }
  return JSON.parse(local)
}
function setLocalLoggedInUser(user: User) {
  localStorage.setItem('loggedInUser', JSON.stringify(user))
}

/**
 * Widget used to switch to another available user
 */
const UserSwitcher = ({users, onSwitch}:
    {users: User[], onSwitch: ((user: User) => void)}) => {
  function switchToUser(user: User) {
    setLocalLoggedInUser(user)
    onSwitch(user)
  }
  return <div>
    <h3>User List</h3>
    {users.map((user, index) =>
      <div key={index}>
        <UserBadge user={user} />
        <button onClick={() => switchToUser(user)}>Select</button>
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

/**
 * an application/widget intended to quickly switch between users and edit how
 * their userprofile looks
 */
export const EditUserProfileApp = () => {
  const usersUrl = 'data/users.json'
  const [users, setUsers] = useState<User[]>()
  const [user, setUser] = useState<User>(getLocalLoggedInUser())
  const [name, setName] = useState<string>(user.name)
  const [color, setColor] = useState<string>(user.color)

  useEffect(() => {
    fetch(usersUrl)
    .then((res) => res.json())
    .then((users: User[]) => {
      setUsers(users)
    })
  }, [])
  
  if (!users) {
    return <>loading</>
  }

  /** Send any changes to the server. Currently just sends all data */
  const syncToServer = () => {
    fetch(usersUrl, {
      method: 'PUT',
      body: JSON.stringify(users, undefined, 2)
    })
  }

  const hasChanges = user.name != name ||
    user.color != color
  
  /** Saves the changes to the current user */
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
      // we've changed the parameters of the local user, so update it
      setLocalLoggedInUser(u)

      syncToServer()
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

      syncToServer()
    }}>
      Add as New User
    </button>
  }

  return <>
    <h1>Edit User</h1>
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
