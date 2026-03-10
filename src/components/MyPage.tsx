"use client";

import { LogOut, User as UserIcon } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

interface MyPageProps {
  user: {
    nickname?: string;
    friend_code?: string;
    app_metadata?: {
      provider?: string;
    };
  } | null;
}

export default function MyPage({ user }: MyPageProps) {
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  return (
    <div className="p-6 space-y-6">
      <div className="bg-input-bg p-6 rounded-2xl shadow-sm border border-border flex flex-col items-center">
        <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mb-4">
          <UserIcon size={40} className="text-accent" />
        </div>
        <div className="flex flex-col items-center gap-1 mb-4">
          <p className="font-bold text-xl">{user?.nickname || "사용자"}</p>
          {user?.friend_code && (
            <p className="text-xs text-gray-400 font-mono">#{user.friend_code}</p>
          )}
        </div>
        <p className="text-sm text-gray-500 mb-6">
          {user?.app_metadata?.provider || "이메일"} 로그인
        </p>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-gray-400 hover:text-red-400 transition-colors text-sm"
        >
          <LogOut size={16} />
          로그아웃
        </button>
      </div>
    </div>
  );
}
