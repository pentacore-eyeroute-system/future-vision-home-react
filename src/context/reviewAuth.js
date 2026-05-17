import { createContext, useContext } from 'react'

export const ReviewAuthContext = createContext(null)

export const useReviewAuth = () => {
  const context = useContext(ReviewAuthContext)

  if (!context) {
    throw new Error('useReviewAuth must be used inside ReviewAuthProvider.')
  }

  return context
}
