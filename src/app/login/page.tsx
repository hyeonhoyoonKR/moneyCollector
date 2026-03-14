'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Loader2 } from 'lucide-react'
import Image from 'next/image'

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  const handleOAuthLogin = async (provider: 'google' | 'kakao') => {
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  return (
    <div className="flex-1 flex flex-col justify-center px-8 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold mb-2 flex justify-center gap-1">
          <span className="text-primary">돈버는</span>
          <span className="text-accent">가계부</span>
        </h1>
        <p className="text-gray-500">재테크의 시작은 절약이다!</p>
      </div>

      <div className="space-y-4">
        {/* OAuth Buttons */}
        <button
          onClick={() => handleOAuthLogin('google')}
          className="w-full flex items-center justify-center gap-3 bg-input-bg dark:bg-[#3d3133] border border-border py-3 rounded-xl hover:bg-secondary transition-colors shadow-sm"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
          <span className="font-medium text-foreground dark:text-foreground">구글로 로그인</span>
        </button>

        <button
          onClick={() => handleOAuthLogin('kakao')}
          className="w-full flex items-center justify-center gap-3 bg-[#FEE500] py-3 rounded-xl hover:bg-[#FDD835] transition-colors shadow-sm"
        >
          <div className="w-5 h-5 flex items-center justify-center">
            {/* Kakao Icon (Simple circle as placeholder if real SVG not available) */}
            <div className="w-4 h-4 bg-black rounded-full"></div>
          </div>
          <span className="font-medium text-[#191919]">카카오로 로그인</span>
        </button>
      </div>
    </div>
  )
}
