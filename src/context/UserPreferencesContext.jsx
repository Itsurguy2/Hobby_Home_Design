import { createContext, useContext, useState } from 'react'

export const UserPreferencesContext = createContext({
  preferences: {
    showContentPreview: true,
    showImagePreview: true,
    colorScheme: 'default',
    customColors: {
      primary: '#646cff',
      background: '#242424',
      text: '#ffffff',
      accent: '#535bf2'
    }
  },
  setPreferences: () => {}
})

export function UserPreferencesProvider({ children }) {
  const [preferences, setPreferences] = useState({
    showContentPreview: true,
    showImagePreview: true,
    colorScheme: 'default',
    customColors: {
      primary: '#646cff',
      background: '#242424',
      text: '#ffffff',
      accent: '#535bf2'
    }
  })

  return (
    <UserPreferencesContext.Provider 
      value={{
        preferences,
        setPreferences
      }}
    >
      {children}
    </UserPreferencesContext.Provider>
  )
}

export function useUserPreferences() {
  const context = useContext(UserPreferencesContext)
  if (!context) {
    throw new Error('useUserPreferences must be used within a UserPreferencesProvider')
  }
  return context
}



