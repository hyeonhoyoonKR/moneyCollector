"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Pencil, Trash2, ChevronLeft, ChevronRight } from "lucide-react";

interface Transaction {
  id: string;
  date: string;
  category: string;
  type: "expense" | "income";
  amount: number;
  memo: string;
}

const mockHistory: Transaction[] = [
  { id: "1", date: "2026-03-10 14:30", category: "식비", type: "expense", amount: 12000, memo: "점심 쌀국수" },
  { id: "2", date: "2026-03-10 09:00", category: "교통", type: "expense", amount: 1500, memo: "지하철" },
  { id: "3", date: "2026-03-09 18:20", category: "용돈", type: "income", amount: 50000, memo: "부모님 용돈" },
  { id: "4", date: "2026-03-09 12:00", category: "쇼핑", type: "expense", amount: 35000, memo: "티셔츠" },
  { id: "5", date: "2026-03-08 20:00", category: "기타", type: "income", amount: 5000, memo: "당근마켓 판매" },
  { id: "8", date: "2026-03-07 13:00", category: "식비", type: "expense", amount: 8500, memo: "김치찌개" },
  { id: "9", date: "2026-03-07 10:00", category: "생활", type: "expense", amount: 2500, memo: "편의점 물" },
  { id: "10", date: "2026-03-06 19:00", category: "식비", type: "expense", amount: 15000, memo: "돈까스" },
  { id: "11", date: "2026-03-05 14:00", category: "여가", type: "expense", amount: 12000, memo: "영화관" },
  { id: "12", date: "2026-03-04 11:00", category: "식비", type: "expense", amount: 7000, memo: "커피와 샌드위치" },
  { id: "13", date: "2026-03-03 08:30", category: "교통", type: "expense", amount: 1250, memo: "버스" },
  { id: "14", date: "2026-03-02 18:00", category: "식비", type: "expense", amount: 22000, memo: "치킨" },
  { id: "15", date: "2026-03-01 10:00", category: "고정", type: "expense", amount: 55000, memo: "통신비" },
  { id: "16", date: "2026-03-01 09:00", category: "근로", type: "income", amount: 2500000, memo: "급여" },
  { id: "6", date: "2026-02-15 10:00", category: "고정", type: "expense", amount: 200000, memo: "월세" },
  { id: "7", date: "2026-02-01 09:00", category: "근로", type: "income", amount: 3000000, memo: "급여" },
];

export default function History() {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 2)); // 2026년 3월 (Month는 0부터 시작)
  const today = new Date(2026, 2); // 현재 시스템 기준 (문제 설정상 2026년 3월)

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1);
    if (nextMonth <= today) {
      setCurrentDate(nextMonth);
    }
  };

  const isNextDisabled = useMemo(() => {
    const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1);
    return nextMonth > today;
  }, [currentDate, today]);

  const filteredHistory = useMemo(() => {
    return mockHistory.filter(item => {
      const itemDate = new Date(item.date);
      return (
        itemDate.getFullYear() === currentDate.getFullYear() &&
        itemDate.getMonth() === currentDate.getMonth()
      );
    });
  }, [currentDate]);

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
      <div className="flex items-center justify-center gap-6 py-6 bg-background">
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
              {filteredHistory.length > 0 ? (
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
                          <button type="button" className="text-gray-400 hover:text-primary transition-colors">
                            <Pencil size={14} />
                          </button>
                          <button type="button" className="text-gray-400 hover:text-red-400 transition-colors">
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
