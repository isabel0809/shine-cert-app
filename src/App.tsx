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
const API_URL = "https://shine-cert-api-v2.zeabur.app";
type View = 'calendar' | 'personnel' | 'statistics';

export default function App() {
  const [currentView, setCurrentView] = useState<View>('calendar');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [events, setEvents] = useState<LicenseEvent[]>([]);

  // 1. 初始化資料載入
  useEffect(() => {
    fetch(`${API_URL}/certificates`)
      .then((res) => res.json())
      .then((data) => setEvents(data))
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
        setEvents((prev) => [...prev, newEvent]);
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

  const navItems = [
    { id: 'calendar', label: '回訓日曆', icon: <CalendarIcon size={20} /> },
    { id: 'personnel', label: '人員名冊', icon: <Users size={20} /> },
    { id: 'statistics', label: '統計分析', icon: <PieChart size={20} /> },
  ];

  return (
    <div className="min-h-screen font-sans transition-colors duration-500 bg-shine-bg text-shine-dark">
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-sm border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <span className="font-serif font-black text-2xl text-shine-dark">興安營造 SHINE</span>
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
        </div>
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