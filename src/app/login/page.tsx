'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Mail, Lock, Loader2 } from 'lucide-react'
import Image from 'next/image'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nickname, setNickname] = useState('')
  const [isNewUser, setIsNewUser] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const supabase = createClient()

  const checkUserNickname = async (userEmail: string) => {
    const { data, error } = await supabase
      .from('users')
      .select('nickname')
      .eq('email', userEmail)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      setError('사용자 정보를 확인하는 중 오류가 발생했습니다.')
      return false
    }

    // 닉네임이 없으면 신규 유저로 간주하여 닉네임 입력 단계로 전환
    if (!data || !data.nickname) {
      setIsNewUser(true)
      return true
    }

    return false
  }

  const handleNicknameSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nickname.trim()) return

    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()

    console.log(user);

    if (user) {
      const { error } = await supabase
        .from('users')
        .update({ nickname: nickname.trim() })
        .eq('id', user.id)

      if (error) {
        setError('닉네임 저장에 실패했습니다.')
      } else {
        window.location.href = '/'
      }
    }
    setLoading(false)
  }

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else if (data.user) {
      const needsNickname = await checkUserNickname(data.user.email!)
      if (!needsNickname) {
        window.location.href = '/'
      } else {
        setLoading(false)
      }
    }
  }

  const handleSignUp = async () => {
    setLoading(true)
    setError(null)
    setMessage(null)

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setError(error.message)
    } else {
      setMessage('확인 이메일이 발송되었습니다. 이메일을 확인해주세요.')
    }
    setLoading(false)
  }

  const handleOAuthLogin = async (provider: 'google' | 'kakao') => {
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/login?check=nickname`,
      },
    })
  }

  // OAuth 로그인 후 닉네임 체크를 위해 컴포넌트 마운트 시 확인
  useState(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      if (urlParams.get('check') === 'nickname') {
        const check = async () => {
          const { data: { user } } = await supabase.auth.getUser()
          if (user) {
            const needsNickname = await checkUserNickname(user.email!)
            if (!needsNickname) {
              window.location.href = '/'
            }
          }
        }
        check()
      }
    }
  })

  if (isNewUser) {
    return (
      <div className="flex-1 flex flex-col justify-center px-8 py-12">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-accent mb-2">반가워요!</h1>
          <p className="text-gray-500">앱에서 사용할 닉네임을 입력해주세요.</p>
        </div>

        <form onSubmit={handleNicknameSubmit} className="space-y-4">
          <div className="relative">
            <input
              type="text"
              placeholder="닉네임 (최대 10자)"
              maxLength={10}
              className="w-full px-4 py-3 bg-input-bg border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-center font-bold text-lg text-foreground"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              required
              autoFocus
            />
          </div>

          {error && <p className="text-red-500 text-sm px-1 text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading || !nickname.trim()}
            className="w-full bg-primary text-white py-3 rounded-xl font-bold hover:bg-accent transition-all shadow-md active:scale-[0.98] disabled:bg-disabled disabled:text-disabled-foreground disabled:shadow-none disabled:cursor-not-allowed disabled:scale-100 disabled:opacity-60 flex items-center justify-center"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : '시작하기'}
          </button>
        </form>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col justify-center px-8 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-accent mb-2">가계부</h1>
        <p className="text-gray-500">파스텔 핑크와 함께하는 스마트한 소비 습관</p>
      </div>

      <div className="space-y-4">
        {/* OAuth Buttons */}
        <button
          onClick={() => handleOAuthLogin('google')}
          className="w-full flex items-center justify-center gap-3 bg-input-bg border border-border py-3 rounded-xl hover:bg-secondary transition-colors shadow-sm"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
          <span className="font-medium text-gray-700">구글로 로그인</span>
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

        <div className="relative py-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-background text-gray-400">또는 이메일로 로그인</span>
          </div>
        </div>

        {/* Email Login Form */}
        <form onSubmit={handleEmailLogin} className="space-y-3">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="email"
              placeholder="이메일"
              className="w-full pl-10 pr-4 py-3 bg-input-bg border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="password"
              placeholder="비밀번호"
              className="w-full pl-10 pr-4 py-3 bg-input-bg border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <p className="text-red-500 text-sm px-1">{error}</p>}
          {message && <p className="text-green-600 text-sm px-1">{message}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white py-3 rounded-xl font-bold hover:bg-accent transition-all shadow-md active:scale-[0.98] disabled:bg-disabled disabled:text-disabled-foreground disabled:shadow-none disabled:cursor-not-allowed disabled:scale-100 disabled:opacity-60 flex items-center justify-center"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : '로그인'}
          </button>
          
          <button
            type="button"
            onClick={handleSignUp}
            disabled={loading}
            className="w-full text-accent py-2 font-medium text-sm hover:underline"
          >
            이메일로 회원가입
          </button>
        </form>
      </div>
    </div>
  )
}
