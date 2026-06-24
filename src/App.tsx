/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Calendar } from './components/Calendar';
import { PersonnelList } from './components/PersonnelList';
import { Statistics } from './components/Statistics';
import { motion, AnimatePresence } from 'motion/react';
import { LayoutDashboard, Users, Calendar as CalendarIcon, PieChart, Menu, X } from 'lucide-react';
import { cn } from './utils/cn';
import { LicenseEvent } from './types';
import { MOCK_DATA } from './constants';

type View = 'calendar' | 'personnel' | 'statistics';

export default function App() {
  const [currentView, setCurrentView] = useState<View>('calendar');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [events, setEvents] = useState<LicenseEvent[]>(MOCK_DATA);

  const handleAdd = (event: Omit<LicenseEvent, 'id'>) => {
    const newEvent = { ...event, id: Math.random().toString(36).substr(2, 9) };
    setEvents(prev => [...prev, newEvent]);
  };

  const handleUpdate = (updatedEvent: LicenseEvent) => {
    setEvents(prev => prev.map(e => e.id === updatedEvent.id ? updatedEvent : e));
  };

  const handleDelete = (id: string) => {
    if (confirm('確定要刪除這筆資料嗎？')) {
      setEvents(prev => prev.filter(e => e.id !== id));
    }
  };

  const navItems = [
    { id: 'calendar', label: '回訓日曆', icon: <CalendarIcon size={20} /> },
    { id: 'personnel', label: '人員名冊', icon: <Users size={20} /> },
    { id: 'statistics', label: '統計分析', icon: <PieChart size={20} /> },
  ];

  return (
    <div className="min-h-screen font-sans selection:bg-vivid-orange/20 transition-colors duration-500 bg-shine-bg text-shine-dark">
      {/* Decorative Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] rounded-full bg-vivid-orange/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[30%] h-[30%] rounded-full bg-vivid-yellow/5 blur-[100px]" />
        <div className="absolute inset-0 opacity-[0.02] bg-[radial-gradient(#4A3B31_1px,transparent_1px)] [background-size:24px_24px]" />
      </div>

      {/* Navigation Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-sm border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center bg-shine-red rounded-lg shadow-lg rotate-[-2deg]">
              <svg viewBox="0 0 100 100" className="w-8 h-8 fill-white">
                <path d="M70,30 C70,15 50,10 40,20 C30,30 60,40 60,60 C60,80 40,90 25,80 L20,70 C35,80 50,75 50,65 C50,55 30,45 30,30 C30,10 55,0 75,15 Z" />
              </svg>
            </div>
            <span className="font-serif font-black text-2xl text-shine-dark tracking-tighter">
              興安營造 <span className="text-shine-red font-sans italic">SHINE</span>
            </span>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id as View)}
                className={cn(
                  "flex items-center gap-2 px-6 py-2 rounded-full transition-all text-sm font-black",
                  currentView === item.id 
                    ? "bg-vivid-blue text-white shadow-lg shadow-vivid-blue/20 scale-105" 
                    : "text-shine-dark hover:bg-shine-light hover:text-vivid-blue"
                )}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </nav>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden p-2 text-gray-400 hover:bg-shine-light rounded-lg transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Nav Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden border-t border-gray-100 bg-white overflow-hidden"
            >
              <div className="px-4 py-4 space-y-2">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setCurrentView(item.id as View);
                      setIsMobileMenuOpen(false);
                    }}
                    className={cn(
                      "flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all text-sm font-black",
                      currentView === item.id 
                        ? "bg-vivid-blue text-white" 
                        : "text-shine-dark hover:bg-shine-light"
                    )}
                  >
                    {item.icon}
                    {item.label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <motion.main 
        key={currentView}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="min-h-[calc(100vh-64px-136px)] pt-4 pb-12"
      >
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
      </motion.main>

      <footer className="py-12 px-4 border-t border-gray-100 text-center">
        <p className="font-serif text-gray-400 text-sm italic font-bold">
          &copy; 2026 營造業證照回訓管理系統．細心守護工地安全
        </p>
      </footer>
    </div>
  );
}