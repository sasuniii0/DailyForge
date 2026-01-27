// context/LoaderContext.tsx
import React, { createContext, useState, ReactNode, useContext } from "react"
import { View, ActivityIndicator, Text, StyleSheet } from "react-native"

interface LoaderContextProps {
  showLoader: () => void
  hideLoader: () => void
  isLoading: boolean
}

export const LoaderContext = createContext<LoaderContextProps>({
  showLoader: () => {},
  hideLoader: () => {},
  isLoading: false
})

export const LoaderProvider = ({ children }: { children: ReactNode }) => {
  const [isLoading, setIsLoading] = useState(false)

  const showLoader = () => setIsLoading(true)
  const hideLoader = () => setIsLoading(false)

  return (
    <LoaderContext.Provider value={{ showLoader, hideLoader, isLoading }}>
      {children}

      {isLoading && (
        <View style={styles.overlay}>
          <View className=" px-12 py-12 rounded-[40px] shadow-2xl items-center border-orange-50">
            {/* Orange Loading spinner matching theme */}
            <ActivityIndicator size="large" color="#FF6B35" />
          </View>
        </View>
      )}
    </LoaderContext.Provider>
  )
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 9999,
  }
})