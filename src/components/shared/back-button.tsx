'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

export function BackButton() {
  const router = useRouter()

  return (
    <button
      onClick={() => router.back()}
      className="btn-outline-gold inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold w-full sm:w-auto justify-center cursor-pointer"
    >
      <ArrowLeft className="w-4 h-4" />
      Go Back
    </button>
  )
}
