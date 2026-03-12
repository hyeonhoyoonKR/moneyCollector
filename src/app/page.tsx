"use client";

import { useState, useEffect } from "react";
import TabBar from "@/components/TabBar";
import Record from "@/components/Record";
import History from "@/components/History";
import MyPage from "@/components/MyPage";
import { createClient } from "@/utils/supabase/client";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function Home() {
  const [activeTab, setActiveTab] = useState("record");
  const [user, setUser] = useState<any>(null);
  const supabase = createClient();

  const fetchUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: userData } = await supabase
        .from('users')
        .select('nickname, friend_code')
        .eq('id', user.id)
        .single();
      
      setUser({ 
        ...user, 
        nickname: userData?.nickname ?? "",
        friend_code: userData?.friend_code ?? "",
      });
    } else console.log("no User!");
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case "record":
        return <Record />;
      case "history":
        return <History />;
      case "analysis":
        return <div className="p-6 text-center text-gray-400 py-20">분석 페이지 (준비 중)</div>;
      case "mypage":
        return <MyPage user={user} onUpdate={fetchUser} />;
      default:
        return <div className="p-6">기록 페이지 (준비 중)</div>;
    }
  };

  return (
    <main className="flex-1 pb-20 overflow-hidden flex flex-col h-screen max-h-screen">
      <header className="bg-background/80 backdrop-blur-md border-b border-border py-4 px-6 z-40 flex justify-between items-center shrink-0">
        <h1 className="text-xl font-bold flex gap-0.5">
          <span className="text-primary">돈버는</span>
          <span className="text-accent">가계부</span>
        </h1>
        <ThemeToggle />
      </header>
      
      <div className="flex-1 overflow-hidden min-h-0 relative">
        {renderContent()}
      </div>

      <TabBar activeTab={activeTab} setActiveTab={setActiveTab} />
    </main>
  );
}
