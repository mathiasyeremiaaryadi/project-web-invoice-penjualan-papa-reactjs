import { useEffect, useState } from 'react'

/** Mengembalikan `value` setelah tidak berubah selama `delay` ms. */
export function useDebounce(value, delay = 400) {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debounced
}
