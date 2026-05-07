import React from 'react'
import { View } from 'react-native'
import { Slot, useRouter } from 'expo-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet'
import { Toaster } from 'sonner-native'
import { DatabaseProvider, useDatabase } from '~/context/DatabaseContext'
import { AuthProvider, useAuth } from '~/context/AuthContext'
import { AppText } from '~/components/ui/AppText'
import { LoadingSpinner } from '~/components/ui/LoadingSpinner'
import '../global.css'

const queryClient = new QueryClient()

function AppContent() {
  const { ready, error } = useDatabase()
  const { isAuthenticated, hasPin } = useAuth()
  const router = useRouter()

  React.useEffect(() => {
    if (!ready) return
    if (!hasPin) {
      router.replace('/setup-pin')
    } else if (!isAuthenticated) {
      router.replace('/lock')
    }
  }, [ready, hasPin, isAuthenticated])

  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-app p-8">
        <AppText variant="heading" color="danger" className="text-center mb-2">Database Error</AppText>
        <AppText color="secondary" className="text-center">{error}</AppText>
      </View>
    )
  }
  if (!ready) return <LoadingSpinner />
  return <Slot />
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider style={{ flex: 1, backgroundColor: '#0d0d0d' }}>
        <AuthProvider>
          <DatabaseProvider>
            <QueryClientProvider client={queryClient}>
              <BottomSheetModalProvider>
                <AppContent />
                <Toaster />
              </BottomSheetModalProvider>
            </QueryClientProvider>
          </DatabaseProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}
