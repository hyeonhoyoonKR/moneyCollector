"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useToast } from "./ToastProvider";

interface Transaction {
  id: string;
  date: string;
  category: string;
  type: "expense" | "income";
  amount: number;
  memo: string;
}

const categories = {
  expense: [
    { id: "식비", label: "식비", icon: "🍱" },
    { id: "교통", label: "교통", icon: "🚌" },
    { id: "쇼핑", label: "쇼핑", icon: "🛍️" },
    { id: "생활", label: "생활", icon: "🏠" },
    { id: "여가", label: "여가", icon: "🎨" },
    { id: "고정", label: "고정", icon: "📅" },
    { id: "기타", label: "기타", icon: "✨" },
  ],
  income: [
    { id: "근로", label: "근로", icon: "💼" },
    { id: "용돈", label: "용돈", icon: "💰" },
    { id: "기타", label: "기타", icon: "✨" },
  ]
};

export default function History() {
  const [currentDate, setCurrentDate] = useState(new Date()); 
  const [history, setHistory] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const supabase = createClient();
  const { showToast } = useToast();

  const today = useMemo(() => new Date(), []);

  const allCategories = useMemo(() => {
    const expenseCats = categories.expense.map(c => c.label === "기타" ? "기타(지출)" : c.label);
    const incomeCats = categories.income.map(c => c.label === "기타" ? "기타(수익)" : c.label);
    return Array.from(new Set([...expenseCats, ...incomeCats]));
  }, []);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString();
      const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59).toISOString();

      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .gte('time', firstDay)
        .lte('time', lastDay)
        .order('time', { ascending: false });

      if (error) {
        console.error("Error fetching transactions:", error);
        return;
      }

      if (data) {
        const formattedData: Transaction[] = data.map((item: { id: string; time: string; is_expense: boolean; category: number; amount: number; memo: string }) => {
          const type = item.is_expense ? "expense" : "income";
          const categoryList = categories[type];
          const categoryLabel = categoryList[item.category]?.label || "기타";
          
          return {
            id: item.id,
            date: item.time,
            category: categoryLabel,
            type: type,
            amount: item.amount,
            memo: item.memo
          };
        });
        setHistory(formattedData);
      }
    } catch (err) {
      console.error("Unexpected error:", err);
    } finally {
      setLoading(false);
    }
  }, [currentDate, supabase]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1);
    if (nextMonth <= today) {
      setCurrentDate(nextMonth);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);

      if (error) {
        console.error("Error deleting transaction:", error);
        showToast("삭제에 실패했습니다.");
      } else {
        // Local state update for immediate feedback
        setHistory(prev => prev.filter(item => item.id !== id));
        showToast("삭제되었습니다.");
      }
    } catch (err) {
      console.error("Unexpected error during delete:", err);
      showToast("알 수 없는 오류가 발생했습니다.");
    }
  };

  const isNextDisabled = useMemo(() => {
    const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1);
    return nextMonth > today;
  }, [currentDate, today]);

  const filteredHistory = useMemo(() => {
    if (selectedCategories.length === 0) return history;
    return history.filter(item => {
      if (item.category === "기타") {
        if (item.type === "expense") return selectedCategories.includes("기타(지출)");
        if (item.type === "income") return selectedCategories.includes("기타(수익)");
      }
      return selectedCategories.includes(item.category);
    });
  }, [history, selectedCategories]);

  const { totalIncome, totalExpense } = useMemo(() => {
    return filteredHistory.reduce(
      (acc, item) => {
        if (item.type === "income") acc.totalIncome += item.amount;
        else acc.totalExpense += item.amount;
        return acc;
      },
      { totalIncome: 0, totalExpense: 0 }
    );
  }, [filteredHistory]);

  const formattedMonth = `${currentDate.getMonth() + 1}월`;

  return (
    <div className="w-full flex flex-col h-full">
      {/* Month Navigation */}
      <div className="flex items-center justify-center gap-6 pt-6 pb-4 bg-background">
        <button
          onClick={handlePrevMonth}
          className="p-1 rounded-full hover:bg-secondary/20 transition-colors text-foreground/50 dark:text-foreground/70"
          type="button"
        >
          <ChevronLeft size={24} />
        </button>
        
        <div className="flex flex-col items-center">
          <span className="text-xl font-bold text-foreground">
            {formattedMonth}
          </span>
          <span className="text-xs text-foreground/40 font-medium">
            {currentDate.getFullYear()}
          </span>
        </div>

        <button
          onClick={handleNextMonth}
          disabled={isNextDisabled}
          className={`p-1 rounded-full transition-colors ${
            isNextDisabled 
              ? "text-foreground/20 dark:text-foreground/30 cursor-not-allowed"
              : "hover:bg-secondary/20 text-foreground dark:text-foreground/70"
          }`}
          type="button"
        >
          <ChevronRight size={24} />
        </button>
      </div>

      {/* Category Filter */}
      <div className="px-6 pb-4 bg-background overflow-x-auto no-scrollbar">
        <div className="flex gap-2 flex-wrap justify-center min-w-max">
          {allCategories.map((category) => {
            const isSelected = selectedCategories.includes(category);
            return (
              <button
                key={category}
                onClick={() => {
                  setSelectedCategories(prev => 
                    isSelected 
                      ? prev.filter(c => c !== category)
                      : [...prev, category]
                  );
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                  isSelected
                    ? "bg-primary dark:bg-selected-bg text-white dark:text-selected-text border-primary dark:border-selected-bg shadow-sm"
                    : "bg-input-bg text-foreground/50 border-border hover:border-primary/50"
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-input-bg border-b border-border min-h-0 relative">
        <table className="w-full border-collapse table-fixed">
          <thead className="sticky top-0 bg-secondary/90 backdrop-blur-sm border-b-2 border-border z-10">
            <tr>
              <th scope="col" className="px-3 py-2 text-center text-xs font-bold text-foreground/50 uppercase tracking-wider w-12">구분</th>
              <th scope="col" className="px-3 py-2 text-center text-xs font-bold text-foreground/50 uppercase tracking-wider w-24">카테고리</th>
              <th scope="col" className="px-3 py-2 text-center text-xs font-bold text-foreground/50 uppercase tracking-wider w-20">금액</th>
              <th scope="col" className="px-3 py-2 text-center text-xs font-bold text-foreground/50 uppercase tracking-wider">메모</th>
              <th scope="col" className="px-3 py-2 text-center text-xs font-bold text-foreground/50 uppercase tracking-wider w-16">관리</th>
            </tr>
          </thead>
          <AnimatePresence mode="wait">
            <motion.tbody
              key={`${currentDate.getFullYear()}-${currentDate.getMonth()}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="divide-y divide-border relative"
            >
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <Loader2 className="animate-spin mx-auto text-primary" size={32} />
                  </td>
                </tr>
              ) : filteredHistory.length > 0 ? (
                <>
                  {filteredHistory.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-secondary/10 transition-colors border-b border-border last:border-0"
                    >
                      <td className="px-3 py-2.5 whitespace-nowrap text-center">
                        <span className={`text-lg font-bold ${item.type === 'income' ? 'text-accent' : 'text-foreground/40'}`}>
                          {item.type === 'income' ? '+' : '-'}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap text-center">
                        <span className="text-sm text-foreground font-medium">{item.category}</span>
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap text-center">
                        <span className={`text-sm font-bold ${item.type === 'income' ? 'text-accent' : 'text-foreground'}`}>
                          {item.amount.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <span className="text-sm text-gray-500 truncate block">
                          {item.memo}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap">
                        <div className="flex justify-center gap-2">
                          <button 
                            type="button" 
                            onClick={() => handleDelete(item.id)}
                            className="text-gray-400 hover:text-red-400 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </>
              ) : (
                <tr>
                  <td colSpan={5} className="py-20 text-center text-gray-400">
                    <p className="text-sm font-medium">{formattedMonth} 내역이 없습니다.</p>
                  </td>
                </tr>
              )}
            </motion.tbody>
          </AnimatePresence>
        </table>
      </div>

      {/* Summary Section */}
      <div className="p-6 bg-background border-t border-border flex justify-around items-center shrink-0 z-20">
        <div className="flex flex-col items-center">
          <span className="text-xs text-gray-400 mb-1">월 지출 총액</span>
          <span className="text-lg font-bold text-foreground">
            {totalExpense.toLocaleString()}원
          </span>
        </div>
        <div className="w-[1px] h-8 bg-border"></div>
        <div className="flex flex-col items-center">
          <span className="text-xs text-gray-400 mb-1">월 수익 총액</span>
          <span className="text-lg font-bold text-accent">
            {totalIncome.toLocaleString()}원
          </span>
        </div>
      </div>
    </div>
  );
}

// getCategoryIcon removed as requested
