import React from 'react'
import { Text, View, Image, Pressable } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated'
import Ionicons from '@expo/vector-icons/Ionicons'
import * as ImagePicker from 'expo-image-picker'
import { colors } from '../../constants/theme'

interface CameraCaptureProps {
  label: string
  onCapture: (uri: string) => void
  captured?: string
  hint?: string
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

export function CameraCapture({
  label,
  onCapture,
  captured,
  hint,
}: CameraCaptureProps) {
  const scale = useSharedValue(1)

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  const handlePressIn = () => {
    scale.value = withTiming(0.97, { duration: 100 })
  }

  const handlePressOut = () => {
    scale.value = withTiming(1, { duration: 100 })
  }

  const handleCapture = async () => {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
    })
    if (!result.canceled) onCapture(result.assets[0].uri)
  }

  return (
    <View>
      <AnimatedPressable
        onPress={handleCapture}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[
          {
            borderWidth: 1.5,
            borderStyle: 'dashed',
            borderColor: colors.primary,
            height: 140,
          },
          animatedStyle,
        ]}
        className="rounded-md bg-elevated items-center justify-center overflow-hidden"
      >
        {captured != null ? (
          <Image
            source={{ uri: captured }}
            className="w-full rounded-md"
            style={{ height: 140 }}
            resizeMode="cover"
          />
        ) : (
          <>
            <Ionicons name="camera-outline" size={32} color={colors.primary} />
            <Text className="text-[13px] text-text-secondary mt-2">{label}</Text>
          </>
        )}
      </AnimatedPressable>

      {hint != null && (
        <Text className="text-xs text-text-muted mt-[6px]">{hint}</Text>
      )}
    </View>
  )
}
