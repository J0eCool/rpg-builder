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
    color: user.color
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

/**
 * an application/widget intended to quickly switch between users and edit how
 * their userprofile looks
 */
const EditProfileApp = () => {
  const usersUrl = 'data/users.json'
  const [users, setUsers] = useState<User[]>()
  const [oldUser, setOldUser] = useState<User>()
  const [currentUser, setCurrentUser] = useState<User>()

  useEffect(() => {
    console.log('fetching user data')
    fetch(usersUrl)
    .then((res) => res.json())
    .then((users: User[]) => {
      setUsers(users)
      setOldUser(users[0])
      setCurrentUser(users[0])
    })
  }, [])
  
  if (!users || !oldUser || !currentUser) {
    return <>loading</>
  }

  const SyncToServerButton = () => {
    return <button onClick={() => {
      fetch(usersUrl, {
        method: 'PUT',
        body: JSON.stringify(users, undefined, 2)
      })
    }}>
      Push Changes
    </button>
  }

  const hasChanges = currentUser.name != oldUser.name ||
    currentUser.color != oldUser.color
  
  const SaveChangesButton = () => {
    return !hasChanges ? <></> : <button onClick={() => {
      let u = users.find((user) => user.id == currentUser.id)
      if (!u) {
        throw 'uh oh'
      }
      u.name = currentUser.name
      u.color = currentUser.color
      setUsers(users)
      setOldUser(currentUser)
    }}>
      Save
    </button>
  }

  const AddUserButton = () => {
    return !hasChanges ? <></> : <button onClick={() => {
      // let next = Array.from(users)
      let next = {...currentUser}
      next.id = nextUserId(users)
      users.push(next)
      setUsers(users)
      setOldUser(next)
      setCurrentUser(next)
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
      Logged in as <UserBadge user={oldUser} />
      <br />
      Username: <input value={currentUser.name} onChange={(e) => {
        let next = {...currentUser}
        next.name = e.target.value
        setCurrentUser(next)
      }} />
      <br />
      <SaveChangesButton />
      <br />
      <AddUserButton />
    </div>
    <UserSwitcher
      users={users.filter((user) => user.id != currentUser.id)}
      onSwitch={(user) => {
        setOldUser(user)
        setCurrentUser(user)
      }}
      />
   </>
}

const App: FC = () => {
  return <EditProfileApp />
}

export default App
