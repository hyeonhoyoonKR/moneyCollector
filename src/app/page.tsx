"use client";

import { useState, useEffect } from "react";
import TabBar from "@/components/TabBar";
import Record from "@/components/Record";
import MyPage from "@/components/MyPage";
import { createClient } from "@/utils/supabase/client";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function Home() {
  const [activeTab, setActiveTab] = useState("record");
  const [user, setUser] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: userData } = await supabase
          .from('users')
          .select('nickname, friend_code')
          .eq('id', user.id)
          .single();
        
        setUser({ 
          ...user, 
          nickname: userData?.nickname,
          friend_code: userData?.friend_code
        });
      }
    };
    getUser();
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case "record":
        return <Record />;
      case "history":
        return <div className="p-6">내역 페이지 (준비 중)</div>;
      case "assets":
        return <div className="p-6">자산 페이지 (준비 중)</div>;
      case "mypage":
        return <MyPage user={user} />;
      default:
        return <div className="p-6">기록 페이지 (준비 중)</div>;
    }
  };

  return (
    <main className="flex-1 pb-20 overflow-y-auto">
      <header className="sticky top-0 bg-background/80 backdrop-blur-md border-b border-border py-4 px-6 z-40 flex justify-between items-center">
        <h1 className="text-xl font-bold text-accent">가계부</h1>
        <ThemeToggle />
      </header>
      
      <div className="flex flex-col">
        {renderContent()}
      </div>

      <TabBar activeTab={activeTab} setActiveTab={setActiveTab} />
    </main>
  );
}
