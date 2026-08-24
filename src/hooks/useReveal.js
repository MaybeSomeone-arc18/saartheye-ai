import { useEffect, useRef } from 'react'

export default function useReveal() {
  const ref = useRef(null)

  useEffect(() => {
    if (!ref.current) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible')
          observer.disconnect()
        }
      },
      { threshold: 0.2 }
    )

    observer.observe(ref.current)

    return () => {
      observer.disconnect()
    }
  }, [])

  return ref
}
