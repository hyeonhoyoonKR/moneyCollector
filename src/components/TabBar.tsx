"use client";

import React from "react";
import { History, PlusCircle, BarChart3, User } from "lucide-react";

interface TabBarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const TabBar: React.FC<TabBarProps> = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: "record", label: "기록", icon: <PlusCircle size={24} /> },
    { id: "history", label: "내역", icon: <History size={24} /> },
    { id: "analysis", label: "분석", icon: <BarChart3 size={24} /> },
    { id: "mypage", label: "마이", icon: <User size={24} /> },
  ];

  return (
    <div className="fixed bottom-0 w-full max-w-[430px] bg-background border-t border-border flex justify-around items-center py-2 px-4 shadow-sm z-50">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`flex flex-col items-center gap-1 transition-colors ${
            activeTab === tab.id ? "text-accent" : "text-foreground/40"
          }`}
        >
          {tab.icon}
          <span className="text-xs font-medium">{tab.label}</span>
        </button>
      ))}
    </div>
  );
};

export default TabBar;
