import React from 'react'
import { Text, View, Image, Pressable, StyleSheet } from 'react-native'
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
        style={[styles.zone, animatedStyle]}
      >
        {captured != null ? (
          <Image
            source={{ uri: captured }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <>
            <Ionicons name="camera-outline" size={32} color={colors.primary} />
            <Text style={styles.label}>{label}</Text>
          </>
        )}
      </AnimatedPressable>

      {hint != null && (
        <Text style={styles.hint}>{hint}</Text>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  zone: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.primary,
    borderRadius: 8,
    backgroundColor: colors.elevated,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 140,
    borderRadius: 8,
  },
  label: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 8,
  },
  hint: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 6,
  },
})
