'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

export default function ClearLock() {
  const pathname = usePathname()

  useEffect(() => {
    // buka scroll yang dikunci Radix UI
    document.body.style.overflow = 'auto'
    document.body.style.pointerEvents = 'auto'

    // hapus overlay portal Radix (Select dropdown)
    const portals = document.querySelectorAll('[data-radix-portal]')
    portals.forEach((el) => el.remove())

  }, [pathname])

  return null
}
