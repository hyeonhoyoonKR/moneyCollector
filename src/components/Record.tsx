import { useState, useRef, useEffect } from "react";
import { Calendar, Tag, CreditCard, AlignLeft, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type RecordType = "expense" | "income";
type InputField = "date" | "category" | "amount" | "memo" | null;

interface InputWrapperProps {
  id: InputField;
  label: string;
  icon: any;
  value: string;
  placeholder: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  rightElement?: React.ReactNode;
}

const InputWrapper = ({ 
  label, 
  icon: Icon, 
  value, 
  placeholder, 
  isOpen,
  onToggle,
  children,
  rightElement
}: InputWrapperProps) => {
  return (
    <div className="border-b border-border bg-input-bg overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full px-6 py-5 flex items-center justify-between hover:bg-secondary/30 transition-colors relative z-20 select-none"
      >
        <div className="flex items-center gap-3">
          <Icon size={20} className="text-accent" />
          <span className="font-medium text-foreground">{label}</span>
        </div>
        <div className="flex items-center gap-2">
          {!isOpen && (
            <span className="text-sm text-foreground/40 max-w-[150px] truncate">
              {value || placeholder}
            </span>
          )}
          {rightElement}
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <ChevronDown size={18} className="text-gray-400" />
          </motion.div>
        </div>
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden bg-input-bg"
          >
            <div className="px-6 pb-6">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function Record() {
  const [type, setType] = useState<RecordType>("expense");
  const [openField, setOpenField] = useState<InputField>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const [formData, setFormData] = useState({
    date: new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16),
    category: "식비",
    amount: "",
    memo: ""
  });

  // 카테고리 타입 변경 시 초기화 및 스크롤 위치 초기화
  useEffect(() => {
    setFormData(prev => ({ ...prev, category: categories[type][0].id }));
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
    }
  }, [type]);

  // 카테고리 탭이 열릴 때 선택된 카테고리를 중앙으로 스크롤
  useEffect(() => {
    if (openField === "category" && scrollRef.current) {
      const currentList = categories[type];
      const index = currentList.findIndex(cat => cat.id === formData.category);
      if (index !== -1) {
        const itemWidth = 80 + 16;
        const timer = setTimeout(() => {
          scrollRef.current?.scrollTo({
            left: index * itemWidth,
            behavior: 'smooth'
          });
        }, 100);
        return () => clearTimeout(timer);
      }
    }
  }, [openField]); // formData.category를 의존성에서 제거하여 자동 스크롤 시 무한 루프나 끊김 방지

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

  const toggleField = (field: InputField) => {
    setOpenField(openField === field ? null : field);
  };

  const handleAmountAdd = (val: number) => {
    setFormData(prev => ({
      ...prev,
      amount: String((Number(prev.amount) || 0) + val)
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === "memo" && value.length > 10) return;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCategoryScroll = (e: React.UIEvent<HTMLDivElement>) => {
    // 스크롤 중에는 상태를 업데이트하지 않고, 스냅이 끝날 때만 업데이트하도록 최적화 가능
    // 하지만 현재 snap-center가 있으므로, 인덱스가 변할 때만 setFormData 호출
    const container = e.currentTarget;
    const scrollLeft = container.scrollLeft;
    const itemWidth = 80 + 16;
    const index = Math.round(scrollLeft / itemWidth);
    const currentList = categories[type];
    
    if (currentList[index] && formData.category !== currentList[index].id) {
      // requestAnimationFrame을 사용하여 렌더링 프레임에 맞춰 업데이트
      requestAnimationFrame(() => {
        setFormData(prev => ({ ...prev, category: currentList[index].id }));
      });
    }
  };

  const handleCategoryClick = (catId: string, index: number) => {
    setFormData(prev => ({ ...prev, category: catId }));
    if (scrollRef.current) {
        const itemWidth = 80 + 16;
        scrollRef.current.scrollTo({
            left: index * itemWidth,
            behavior: 'smooth'
        });
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* 지출/수익 선택 탭 */}
      <div className="p-4 flex justify-center">
        <div className="flex bg-secondary/50 rounded-full p-1 relative w-full max-w-[180px]">
          <button
            type="button"
            onClick={() => {
              setType("expense");
              setOpenField(null);
            }}
            className={`flex-1 py-2 rounded-full text-sm font-bold transition-colors relative z-10 ${
              type === "expense" ? "text-accent" : "text-foreground/40"
            }`}
          >
            지출
            {type === "expense" && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 bg-input-bg rounded-full shadow-sm -z-10"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
          </button>
          <button
            type="button"
            onClick={() => {
              setType("income");
              setOpenField(null);
            }}
            className={`flex-1 py-2 rounded-full text-sm font-bold transition-colors relative z-10 ${
              type === "income" ? "text-accent" : "text-foreground/40"
            }`}
          >
            수익
            {type === "income" && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 bg-input-bg rounded-full shadow-sm -z-10"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
          </button>
        </div>
      </div>

      {/* 입력 박스들 */}
      <div className="flex-1 mt-2">
        <InputWrapper 
          id="date" 
          label="일시" 
          icon={Calendar} 
          value={formData.date.replace('T', ' ')}
          placeholder="날짜 선택"
          isOpen={openField === "date"}
          onToggle={() => toggleField("date")}
        >
          <input
            type="datetime-local"
            name="date"
            value={formData.date}
            onChange={handleInputChange}
            className="w-full p-3 bg-secondary/20 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary focus:ring-inset appearance-none"
          />
        </InputWrapper>

        <InputWrapper 
          id="category" 
          label="카테고리" 
          icon={Tag} 
          value={formData.category}
          placeholder="카테고리 선택"
          isOpen={openField === "category"}
          onToggle={() => toggleField("category")}
        >
          <div 
            ref={scrollRef}
            onScroll={handleCategoryScroll}
            className="flex gap-4 overflow-x-auto py-4 px-[calc(50%-40px)] snap-x snap-mandatory scrollbar-hide no-scrollbar"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {categories[type].map((cat, idx) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleCategoryClick(cat.id, idx)}
                className={`flex-shrink-0 w-20 flex flex-col items-center gap-2 snap-center transition-all duration-300 ${
                  formData.category === cat.id ? "scale-110 opacity-100" : "opacity-40"
                }`}
              >
                <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl bg-input-bg border-2 transition-all ${
                    formData.category === cat.id ? "border-primary shadow-md" : "border-transparent"
                }`}>
                  {cat.icon}
                </div>
                <span className={`text-xs font-bold ${formData.category === cat.id ? "text-accent" : "text-gray-500"}`}>
                  {cat.label}
                </span>
              </button>
            ))}
          </div>
        </InputWrapper>

        <InputWrapper 
          id="amount" 
          label="금액" 
          icon={CreditCard} 
          value={formData.amount ? `${Number(formData.amount).toLocaleString()}원` : ""}
          placeholder="0원"
          isOpen={openField === "amount"}
          onToggle={() => toggleField("amount")}
        >
          <div className="space-y-4">
            <div className="relative">
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                placeholder="금액을 입력하세요"
                className="w-full p-3 bg-secondary/20 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary focus:ring-inset pr-10 text-right font-bold text-lg text-foreground placeholder:text-foreground/20"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-foreground/40">원</span>
            </div>
            <div className="flex gap-2">
              {[100, 1000, 10000, 50000].map(val => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleAmountAdd(val)}
                  className="flex-1 py-2 px-1 bg-input-bg border border-border rounded-lg text-xs font-medium text-foreground hover:bg-secondary/30 active:bg-primary/20 transition-colors"
                >
                  +{val >= 10000 ? `${val/10000}만` : val >= 1000 ? `${val/1000}천` : `${val/100}백`}
                </button>
              ))}
            </div>
          </div>
        </InputWrapper>

        <InputWrapper 
          id="memo" 
          label="메모" 
          icon={AlignLeft} 
          value={formData.memo}
          placeholder="메모 입력"
          isOpen={openField === "memo"}
          onToggle={() => toggleField("memo")}
          rightElement={openField === "memo" && (
            <span className="text-xs text-gray-300 mr-1">
              {formData.memo.length}/10
            </span>
          )}
        >
          <div className="relative">
            <input
              type="text"
              name="memo"
              value={formData.memo}
              onChange={handleInputChange}
              maxLength={10}
              placeholder="내용을 입력해주세요 (최대 10자)"
              className="w-full p-3 bg-secondary/20 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary focus:ring-inset text-foreground placeholder:text-foreground/20"
            />
          </div>
        </InputWrapper>
      </div>

      {/* 입력 버튼 */}
      <div className="px-6 py-6 mt-auto">
        <button 
          type="button"
          disabled={!(Number(formData.amount) > 0 && formData.memo.trim().length > 0)}
          className="w-full max-w-[200px] mx-auto block py-3.5 bg-primary text-primary-foreground font-bold rounded-full shadow-lg shadow-primary/30 hover:bg-accent transition-all active:scale-[0.98] disabled:bg-disabled disabled:text-disabled-foreground disabled:shadow-none disabled:cursor-not-allowed disabled:scale-100 disabled:opacity-60 dark:bg-primary dark:text-primary-foreground"
        >
          입력
        </button>
      </div>
    </div>
  );
}
