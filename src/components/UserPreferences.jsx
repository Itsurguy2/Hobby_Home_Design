import { useUserPreferences } from '../context/UserPreferencesContext'

function UserPreferences() {
  const { preferences, setPreferences } = useUserPreferences()

  const handleColorSchemeChange = (scheme) => {
    setPreferences({ ...preferences, colorScheme: scheme })
  }

  const handleCustomColorChange = (colorType, value) => {
    setPreferences({
      ...preferences,
      customColors: {
        ...preferences.customColors,
        [colorType]: value
      }
    })
  }

  const handlePreviewToggle = (setting) => {
    setPreferences({ ...preferences, [setting]: !preferences[setting] })
  }

  return (
    <div className="user-preferences">
      <h2>Interface Preferences</h2>
      
      <section className="preference-section">
        <h3>Color Scheme</h3>
        <div className="color-scheme-options">
          <button 
            className={preferences.colorScheme === 'default' ? 'active' : ''}
            onClick={() => handleColorSchemeChange('default')}
          >
            Default
          </button>
          <button 
            className={preferences.colorScheme === 'dark' ? 'active' : ''}
            onClick={() => handleColorSchemeChange('dark')}
          >
            Dark
          </button>
          <button 
            className={preferences.colorScheme === 'light' ? 'active' : ''}
            onClick={() => handleColorSchemeChange('light')}
          >
            Light
          </button>
          <button 
            className={preferences.colorScheme === 'custom' ? 'active' : ''}
            onClick={() => handleColorSchemeChange('custom')}
          >
            Custom
          </button>
        </div>

        {preferences.colorScheme === 'custom' && (
          <div className="custom-colors">
            <div className="color-picker">
              <label>Primary Color:</label>
              <input
                type="color"
                value={preferences.customColors.primary}
                onChange={(e) => handleCustomColorChange('primary', e.target.value)}
              />
            </div>
            <div className="color-picker">
              <label>Background Color:</label>
              <input
                type="color"
                value={preferences.customColors.background}
                onChange={(e) => handleCustomColorChange('background', e.target.value)}
              />
            </div>
            <div className="color-picker">
              <label>Text Color:</label>
              <input
                type="color"
                value={preferences.customColors.text}
                onChange={(e) => handleCustomColorChange('text', e.target.value)}
              />
            </div>
            <div className="color-picker">
              <label>Accent Color:</label>
              <input
                type="color"
                value={preferences.customColors.accent}
                onChange={(e) => handleCustomColorChange('accent', e.target.value)}
              />
            </div>
          </div>
        )}
      </section>

      <section className="preference-section">
        <h3>Preview Settings</h3>
        <div className="preview-options">
          <label>
            <input
              type="checkbox"
              checked={preferences.showContentPreview}
              onChange={() => handlePreviewToggle('showContentPreview')}
            />
            Show content preview on home feed
          </label>
          <label>
            <input
              type="checkbox"
              checked={preferences.showImagePreview}
              onChange={() => handlePreviewToggle('showImagePreview')}
            />
            Show image preview on home feed
          </label>
        </div>
      </section>
    </div>
  )
}

export default UserPreferences