import {isWeb} from '#/platform/detection'

// Native module import - wrapped in try/catch and conditionally imported
let nativeModule: any = null

// Function to obfuscate module name from webpack bundler
function getModuleName() {
  return '@mozzius/expo-dynamic-app-icon'
}

if (!isWeb) {
  try {
    // Use eval to prevent webpack from analyzing this require
    nativeModule = require(getModuleName())
  } catch (error) {
    // Module not available, will use fallback
    if (__DEV__) {
      console.warn('expo-dynamic-app-icon not available:', error)
    }
  }
}

// App icon functions with web fallback
export function getAppIcon(): string | false {
  if (isWeb) {
    if (__DEV__) {
      console.warn('getAppIcon is not supported on web')
    }
    return 'default_light'
  }

  if (nativeModule) {
    try {
      return nativeModule.getAppIcon()
    } catch (error) {
      if (__DEV__) {
        console.error('Failed to get app icon:', error)
      }
      return 'default_light'
    }
  }

  return 'default_light'
}

export function setAppIcon(name: string | null): string | false {
  if (isWeb) {
    if (__DEV__) {
      console.warn('setAppIcon is not supported on web')
    }
    return name || 'default_light'
  }

  if (nativeModule) {
    try {
      return nativeModule.setAppIcon(name)
    } catch (error) {
      if (__DEV__) {
        console.error('Failed to set app icon:', error)
      }
      return name || 'default_light'
    }
  }

  return name || 'default_light'
}
