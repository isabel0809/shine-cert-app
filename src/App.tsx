/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Calendar } from './components/Calendar';
import { PersonnelList } from './components/PersonnelList';
import { Statistics } from './components/Statistics';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar as CalendarIcon, Users, PieChart, Menu, X } from 'lucide-react';
import { cn } from './utils/cn';
import { LicenseEvent } from './types';

// 設定 API 網址
const API_URL = "https://shine-cert-apy-v2.zeabur.app";
type View = 'calendar' | 'personnel' | 'statistics';

export default function App() {
  const [currentView, setCurrentView] = useState<View>('calendar');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [events, setEvents] = useState<LicenseEvent[]>([]);

  // 1. 初始化資料載入
useEffect(() => {
  fetch(`${API_URL}/certificates`)
    .then((res) => res.json())
    .then((data) => {
      // 將日期字符串轉換為 Date 對象
      const parsedData = data.map((event: any) => ({
        ...event,
        expiryDate: new Date(event.expiryDate),
        issueDate: event.issueDate ? new Date(event.issueDate) : undefined,
      }));
      setEvents(parsedData);
    })
    .catch((err) => console.error("資料載入失敗:", err));
}, []);


 // 2. 新增資料 (POST)
  const handleAdd = async (event: Omit<LicenseEvent, 'id'>) => {
    try {
      const response = await fetch(`${API_URL}/certificates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event),
      });
      if (response.ok) {
        const newEvent = await response.json();
        // 確保日期被轉換為 Date 對象
        const parsedEvent = {
          ...newEvent,
          expiryDate: new Date(newEvent.expiryDate),
          issueDate: newEvent.issueDate ? new Date(newEvent.issueDate) : undefined,
        };
        setEvents((prev) => [...prev, parsedEvent]);
      }
    } catch (err) {
      console.error("新增資料失敗:", err);
    }
  };


  // 3. 刪除資料 (DELETE) - 與後端同步
  const handleDelete = async (id: string) => {
    if (confirm('確定要刪除這筆資料嗎？')) {
      try {
        const response = await fetch(`${API_URL}/certificates/${id}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          setEvents((prev) => prev.filter((e) => e.id !== id));
        } else {
          alert("刪除失敗，請檢查網路連線");
        }
      } catch (err) {
        console.error("刪除請求失敗:", err);
      }
    }
  };

  const handleUpdate = (updatedEvent: LicenseEvent) => {
    setEvents((prev) => prev.map((e) => (e.id === updatedEvent.id ? updatedEvent : e)));
  };

const handleNavClick = (view: View) => {
  setCurrentView(view);
  setIsMobileMenuOpen(false);
};


  const navItems = [
    { id: 'calendar', label: '回訓日曆', icon: <CalendarIcon size={20} /> },
    { id: 'personnel', label: '人員名冊', icon: <Users size={20} /> },
    { id: 'statistics', label: '統計分析', icon: <PieChart size={20} /> },
  ];

  return (
    <div className="min-h-screen font-sans transition-colors duration-500 bg-shine-bg text-shine-dark">
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-sm border-b border-gray-100 shadow-sm">
  <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
    <span className="font-serif font-black text-2xl text-shine-dark">興安營造 SHINE</span>
    
    {/* 桌面版導航 - 保持原樣 */}
    <nav className="hidden md:flex items-center gap-1">
      {navItems.map((item) => (
        <button
          key={item.id}
          onClick={() => setCurrentView(item.id as View)}
          className={cn(
            "px-6 py-2 rounded-full font-black text-sm",
            currentView === item.id ? "bg-vivid-blue text-white" : "hover:bg-shine-light"
          )}
        >
          {item.label}
        </button>
      ))}
    </nav>

    {/* 手機版漢堡菜單按鈕 */}
    <button
      onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      className="md:hidden p-2 hover:bg-shine-light rounded-lg transition-colors"
      aria-label="Toggle menu"
    >
      {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
    </button>
  </div>

  {/* 手機版下拉菜單 */}
  <AnimatePresence>
    {isMobileMenuOpen && (
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ duration: 0.2 }}
        className="md:hidden border-t border-gray-100 bg-white overflow-hidden"
      >
        <nav className="flex flex-col gap-2 px-4 py-4">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id as View)}
              className={cn(
                "w-full px-4 py-3 rounded-lg font-black text-sm flex items-center gap-3 transition-all",
                currentView === item.id 
                  ? "bg-vivid-blue text-white shadow-md" 
                  : "bg-shine-light text-shine-dark hover:bg-gray-200"
              )}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </motion.div>
    )}
  </AnimatePresence>
</header>


      <main className="pt-4 pb-12">
        {currentView === 'calendar' && <Calendar events={events} />}
        {currentView === 'personnel' && (
          <PersonnelList 
            events={events} 
            onAdd={handleAdd} 
            onUpdate={handleUpdate} 
            onDelete={handleDelete} 
          />
        )}
        {currentView === 'statistics' && <Statistics events={events} />}
      </main>
    </div>
  );
}