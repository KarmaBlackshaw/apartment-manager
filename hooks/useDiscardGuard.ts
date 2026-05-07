import { Alert } from 'react-native'
import { useNavigation } from 'expo-router'
import { useEffect } from 'react'

interface UseDiscardGuardOpts {
  isDirty: boolean
  title?: string
  message?: string
  onDiscard?: () => void
}

export function useDiscardGuard({
  isDirty,
  title = 'Discard changes?',
  message = 'Your changes will be lost.',
  onDiscard,
}: UseDiscardGuardOpts) {
  const navigation = useNavigation()

  useEffect(() => {
    if (!isDirty) return

    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      e.preventDefault()

      Alert.alert(title, message, [
        { text: 'Keep editing', style: 'cancel' },
        {
          text: 'Discard',
          style: 'destructive',
          onPress: () => {
            onDiscard?.()
            navigation.dispatch(e.data.action)
          },
        },
      ])
    })

    return unsubscribe
  }, [isDirty, navigation, title, message, onDiscard])
}
