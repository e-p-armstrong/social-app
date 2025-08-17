import {useCallback, useMemo, useState} from 'react'
import {useFocusEffect} from '@react-navigation/native'

import {getAppIcon} from '#/lib/app-icon/dynamic-app-icon'
import {useAppIconSets} from '#/screens/Settings/AppIconSettings/useAppIconSets'

export function useCurrentAppIcon() {
  const appIconSets = useAppIconSets()
  const [currentAppIcon, setCurrentAppIcon] = useState(() => getAppIcon())

  // refresh current icon when screen is focused
  useFocusEffect(
    useCallback(() => {
      setCurrentAppIcon(getAppIcon())
    }, []),
  )

  return useMemo(() => {
    return (
      appIconSets.defaults.find(i => i.id === currentAppIcon) ??
      appIconSets.core.find(i => i.id === currentAppIcon) ??
      appIconSets.defaults[0]
    )
  }, [appIconSets, currentAppIcon])
}
