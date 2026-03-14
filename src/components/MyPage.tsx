"use client";

import { useState, useEffect, useRef } from "react";
import { LogOut, User as UserIcon, Loader2, Pencil, Moon, Sun, ChevronRight, Settings } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useToast } from "./ToastProvider";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";

interface MyPageProps {
  user: {
    id: string;
    nickname?: string;
    friend_code?: string;
    app_metadata?: {
      provider?: string;
    };
  } | null;
  onUpdate?: () => void;
}

export default function MyPage({ user, onUpdate }: MyPageProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [nickname, setNickname] = useState(user?.nickname || "");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();
  const { showToast } = useToast();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (user?.nickname) {
      setNickname(user.nickname);
    }
  }, [user]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  const handleUpdateNickname = async () => {
    if (!user || !nickname.trim() || nickname === user.nickname) {
      setIsEditing(false);
      return;
    }

    setLoading(true);
    const { error } = await supabase
      .from('users')
      .update({ nickname: nickname.trim() })
      .eq('id', user.id);

    if (!error) {
      if (onUpdate) onUpdate();
      setIsEditing(false);
      showToast("닉네임이 변경되었습니다.");
    } else {
      showToast("닉네임 변경에 실패했습니다.");
    }
    setLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleUpdateNickname();
    } else if (e.key === 'Escape') {
      setNickname(user?.nickname || "");
      setIsEditing(false);
    }
  };

  const handleStartEditing = () => {
    setNickname(user?.nickname || "사용자");
    setIsEditing(true);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="bg-input-bg p-6 rounded-2xl shadow-sm border border-border flex flex-col items-center">
        <div 
          className="w-20 h-20 rounded-full flex items-center justify-center mb-4"
          style={{ backgroundColor: mounted ? (theme === 'dark' ? '#3d3133' : '#ffe4e8') : '#ffe4e8' }}
        >
          <UserIcon size={40} className="text-accent" />
        </div>
        <div className="flex flex-col items-center gap-1 mb-4 w-full">
          {isEditing ? (
            <div className="relative w-full max-w-[200px]">
              <input
                ref={inputRef}
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                onBlur={handleUpdateNickname}
                onKeyDown={handleKeyDown}
                disabled={loading}
                maxLength={10}
                className="w-full text-center font-bold text-xl bg-[#ffe4e8]/30 dark:bg-[#3d3133]/30 border-b-2 border-primary focus:outline-none px-2 py-1 rounded-t-md"
              />
              {loading && (
                <div className="absolute right-0 top-1/2 -translate-y-1/2">
                  <Loader2 size={16} className="animate-spin text-primary" />
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={handleStartEditing}
              className="group flex items-center gap-1.5 font-bold text-xl hover:text-primary transition-colors cursor-pointer relative pb-1 border-b border-border hover:border-primary"
            >
              <span>{user?.nickname || "사용자"}</span>
              <Pencil size={14} className="text-foreground/30 group-hover:text-primary transition-colors" />
            </button>
          )}
          {user?.friend_code && (
            <p className="uppercase text-xs text-foreground/40 font-mono">#{user.friend_code}</p>
          )}
        </div>
        <p className="text-sm text-foreground/50 mb-6">
          {user?.app_metadata?.provider ? `${user.app_metadata.provider} 로그인` : "소셜 로그인"}
        </p>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-foreground/40 hover:text-red-400 transition-colors text-sm"
        >
          <LogOut size={16} />
          로그아웃
        </button>
      </div>

      <div className="-mx-6 border-t border-b border-border bg-input-bg">
        <div className="flex items-center justify-between p-4 px-6 hover:bg-[#ffe4e8]/30 dark:hover:bg-[#3d3133]/30 transition-colors">
          <div>
            <p className="font-medium text-sm">다크 모드</p>
            <p className="text-xs text-foreground/40">화면 테마를 변경합니다</p>
          </div>
          {mounted ? (
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="relative w-12 h-6 rounded-full p-1 transition-colors flex items-center"
              style={{ backgroundColor: theme === 'dark' ? '#3d3133' : '#ffe4e8' }}
            >
              <motion.div
                animate={{ x: theme === 'dark' ? 24 : 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className="w-4 h-4 bg-white rounded-full shadow-sm"
              />
            </button>
          ) : (
            <div 
              className="w-12 h-6 rounded-full" 
              style={{ backgroundColor: '#ffe4e8' }}
            />
          )}
        </div>
        
        <button className="w-full flex items-center justify-between p-4 px-6 hover:bg-[#ffe4e8]/30 dark:hover:bg-[#3d3133]/30 transition-colors border-t border-border group">
          <div className="text-left">
            <p className="font-medium text-sm">알림 설정</p>
            <p className="text-xs text-foreground/40">푸시 알림 및 혜택 알림 관리</p>
          </div>
          <ChevronRight size={16} className="text-foreground/20 group-hover:text-foreground/40 transition-colors" />
        </button>
      </div>
    </div>
  );
}
