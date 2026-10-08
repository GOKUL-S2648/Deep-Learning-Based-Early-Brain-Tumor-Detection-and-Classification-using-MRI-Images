import React from 'react';
import {
  LayoutDashboard,
  ScanLine,
  History,
  UserPlus,
  Search,
  LogOut,
  Brain,
  Layers,
  Calendar,
  MessageSquare,
  CreditCard,
  Settings,
  Users,
  Split
} from 'lucide-react';

export type NavigationPage = 
  | 'overview' 
  | 'new_analysis' 
  | 'patient_history' 
  | 'register_patient' 
  | 'patient_search'
  | 'patient_category'
  | 'patient_appointments'
  | 'patient_messages'
  | 'patient_billing'
  | 'patient_settings'
  | 'doctor_diagnostics'
  | 'doctor_pacs'
  | 'doctor_consults';

interface SidebarProps {
  currentPage: NavigationPage;
  onPageChange: (page: NavigationPage) => void;
  userName?: string;
  userRole?: string;
  onSignOut?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onPageChange,
  userName = 'User',
  userRole = 'Clinical Radiologist',
  onSignOut,
}) => {
  let navItems = [
    {
      id: 'overview' as NavigationPage,
      label: 'Overview',
      icon: LayoutDashboard,
    },
    {
      id: 'new_analysis' as NavigationPage,
      label: 'New Analysis',
      icon: ScanLine,
    },
    {
      id: 'patient_category' as NavigationPage,
      label: 'Category',
      icon: Layers,
    },
    {
      id: 'patient_search' as NavigationPage,
      label: 'Consultations',
      icon: Users,
    },
    {
      id: 'patient_history' as NavigationPage,
      label: userRole === 'patient' ? 'My Scans' : 'Records',
      icon: History,
    },
    {
      id: 'patient_appointments' as NavigationPage,
      label: 'Appointments',
      icon: Calendar,
    },
    {
      id: 'patient_messages' as NavigationPage,
      label: 'Messages',
      icon: MessageSquare,
    },
    {
      id: 'patient_billing' as NavigationPage,
      label: 'Billing & Insurance',
      icon: CreditCard,
    },
    {
      id: 'patient_settings' as NavigationPage,
      label: 'Account Settings',
      icon: Settings,
    },
  ];

  if (userRole === 'patient') {
    navItems = navItems.filter(item => 
      item.id === 'overview' || 
      item.id === 'patient_history' ||
      item.id === 'patient_appointments' ||
      item.id === 'patient_messages' ||
      item.id === 'patient_billing' ||
      item.id === 'patient_settings'
    );
  } else if (userRole === 'admin') {
    navItems = navItems.filter(item => 
      item.id === 'overview' || 
      item.id === 'new_analysis' || 
      item.id === 'patient_search' ||
      item.id === 'patient_history' ||
      item.id === 'patient_category'
    );
  }

  return (
    <aside className="no-print w-64 bg-slate-950 border-r border-slate-200 flex flex-col justify-between shrink-0 h-screen sticky top-0 text-slate-600 select-none z-30">
      {/* Top Branding Section */}
      <div>
        <div className="px-6 py-6 border-b border-slate-200/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#111927]/20 border border-slate-200/30 flex items-center justify-center text-slate-500">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <div className="text-base font-bold text-white tracking-tight leading-none">
                BrainTumor
              </div>
              <p className="text-[10px] font-mono tracking-wider uppercase text-slate-500 mt-1">
                Clinical Assistant
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <div className="px-3 py-5">
          <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500 font-mono">
            Platform Tools
          </div>

          <nav className="space-y-1 mt-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => onPageChange(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-slate-900/25 to-slate-900/10 text-white font-semibold border border-slate-200/30 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700 hover:bg-[#1e293b]/60'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-slate-500' : 'text-slate-500'
                    }`}
                  />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Bottom Profile and Sign Out Section */}
      <div className="p-4 border-t border-slate-200/60">
        <button
          onClick={() => {
            if (onSignOut) {
              onSignOut();
            } else {
              alert('Logged out securely from hospital workstation.');
            }
          }}
          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-500 hover:text-rose-600 transition-colors mb-3 rounded-lg hover:bg-slate-100 font-medium"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>

        <div className="flex items-center gap-3 p-2 rounded-xl bg-white border border-slate-200">
          <div className="w-9 h-9 rounded-full bg-slate-500 text-white font-bold flex items-center justify-center text-sm shadow-sm shrink-0">
            {userName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold text-slate-900 truncate">
              {userName}
            </div>
            <div className="text-[11px] text-slate-500 truncate">
              {userRole}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
