import React, { useState, useRef, useEffect } from 'react';
import { Bill, BillStatus } from './types';

// --- LOGO ---
export const Logo = ({ className }: { className?: string }) => (
    <div className={`flex items-center justify-center space-x-3 ${className}`}>
        <div className="bg-indigo-600 p-2 rounded-full flex items-center justify-center shadow-md">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        </div>
        <span className="text-3xl sm:text-4xl font-bold text-slate-800 tracking-tight">PagueFácil</span>
    </div>
);


// --- ICONS ---
export const HomeIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-6 w-6"} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

export const DocumentTextIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-6 w-6"} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

export const StarIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-6 w-6"} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-12v4m-2-2h4m5 4v4m-2-2h4M17 3l-1.172 1.172a4 4 0 00-5.656 0L9 3m9 18l-1.172-1.172a4 4 0 00-5.656 0L9 21" />
  </svg>
);

export const UserCircleIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-6 w-6"} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

export const PlusIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-6 w-6"} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
);

export const PencilIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-5 w-5"} viewBox="0 0 20 20" fill="currentColor">
        <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
        <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
    </svg>
);

export const TrashIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-5 w-5"} viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
    </svg>
);

export const DotsVerticalIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-6 w-6"} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
    </svg>
);

export const ClockIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-6 w-6"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

export const CalendarIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-6 w-6"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
);

export const TrendingUpIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-6 w-6"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
);

export const ShieldCheckIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.286zm0 13.036h.008v.008h-.008v-.008z" />
    </svg>
);

export const BellIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
    </svg>
);

export const ArrowRightOnRectangleIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
    </svg>
);


// --- UI COMPONENTS ---
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
}

export const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', ...props }) => {
  const baseClasses = "w-full font-bold py-3 px-4 rounded-lg focus:outline-none focus:ring-4 focus:ring-opacity-50 transition-all duration-200 ease-in-out transform hover:-translate-y-px disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md";
  const variantClasses = {
    primary: "bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-400 text-white",
    secondary: "bg-indigo-100 hover:bg-indigo-200 focus:ring-indigo-400 text-indigo-800",
    danger: "bg-red-600 hover:bg-red-700 focus:ring-red-400 text-white",
    success: "bg-emerald-500 hover:bg-emerald-600 focus:ring-emerald-400 text-white",
  };
  
  return (
    <button className={`${baseClasses} ${variantClasses[variant]}`} {...props}>
      {children}
    </button>
  );
};

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const Input: React.FC<InputProps> = ({ label, ...props }) => (
  <div>
    <label className="block text-slate-700 text-sm font-semibold mb-2">{label}</label>
    <input className="w-full appearance-none rounded-lg border border-slate-300 bg-white py-3 px-4 leading-tight text-slate-900 placeholder-slate-400 shadow-sm transition duration-150 ease-in-out focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-300" {...props} />
  </div>
);

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
}

export const Textarea: React.FC<TextareaProps> = ({ label, ...props }) => (
  <div>
    <label className="block text-slate-700 text-sm font-semibold mb-2">{label}</label>
    <textarea className="w-full appearance-none rounded-lg border border-slate-300 bg-white py-3 px-4 leading-tight text-slate-900 placeholder-slate-400 shadow-sm transition duration-150 ease-in-out focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-300" {...props} />
  </div>
);

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  children: React.ReactNode;
}

export const Select: React.FC<SelectProps> = ({ label, children, ...props }) => (
  <div>
    <label className="block text-slate-700 text-sm font-semibold mb-2">{label}</label>
    <select className="w-full appearance-none rounded-lg border border-slate-300 bg-white py-3 px-4 leading-tight text-slate-900 shadow-sm transition duration-150 ease-in-out focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-300" {...props}>
        {children}
    </select>
  </div>
);

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className }) => (
  <div className={`bg-white p-6 rounded-xl shadow-sm border border-slate-200/80 ${className}`}>
    {children}
  </div>
);

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-slate-800">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-800 text-2xl font-bold">&times;</button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
};

export const Spinner: React.FC = () => (
    <div className="flex justify-center items-center h-full">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
);

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ checked, onChange }) => {
  return (
    <button
      type="button"
      className={`${
        checked ? 'bg-indigo-600' : 'bg-slate-300'
      } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
    >
      <span
        aria-hidden="true"
        className={`${
          checked ? 'translate-x-5' : 'translate-x-0'
        } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
      />
    </button>
  );
};

// --- APP-SPECIFIC COMPONENTS ---

interface SummaryCardProps {
    title: string;
    amount: number;
    value: number;
    color: 'red' | 'yellow' | 'green';
    icon: React.ReactNode;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({ title, amount, value, color, icon }) => {
    const colorClasses = {
        red: { bg: 'bg-red-100', text: 'text-red-600' },
        yellow: { bg: 'bg-yellow-100', text: 'text-yellow-600' },
        green: { bg: 'bg-emerald-100', text: 'text-emerald-600' },
    };

    return (
        <Card className="flex items-center space-x-4">
            <div className={`p-3 rounded-full ${colorClasses[color].bg}`}>
                <div className={colorClasses[color].text}>{icon}</div>
            </div>
            <div className="flex-grow">
                <p className="text-slate-500 text-sm font-medium">{title}</p>
                <p className="text-2xl font-bold text-slate-800">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)}
                </p>
            </div>
            <div className="text-right">
                <p className="text-slate-500 text-sm font-medium">Contas</p>
                <p className="text-2xl font-bold text-slate-800">{amount}</p>
            </div>
        </Card>
    );
};

interface BillItemProps {
  bill: Bill;
  onTogglePaid: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (bill: Bill) => void;
}

export const BillItem: React.FC<BillItemProps> = ({ bill, onTogglePaid, onEdit, onDelete }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuRef]);

  const getStatus = (bill: Bill): BillStatus => {
    if (bill.isPaid) return BillStatus.Paid;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(bill.dueDate);
    dueDate.setHours(0, 0, 0, 0);

    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return BillStatus.Overdue;
    if (diffDays === 0) return BillStatus.DueToday;
    return BillStatus.Upcoming;
  };
  
  const status = getStatus(bill);

  const statusInfo = {
    [BillStatus.Paid]: { text: 'Paga', color: 'bg-slate-400', textColor: 'text-slate-500' },
    [BillStatus.Overdue]: { text: 'Vencida', color: 'bg-red-500', textColor: 'text-red-500' },
    [BillStatus.DueToday]: { text: 'Vence Hoje', color: 'bg-yellow-500', textColor: 'text-yellow-500' },
    [BillStatus.Upcoming]: { text: 'A vencer', color: 'bg-emerald-500', textColor: 'text-emerald-500' },
  };

  return (
    <div className={`bg-white p-4 rounded-lg shadow-sm border border-slate-200/80 flex items-center justify-between transition-all duration-300 ${bill.isPaid ? 'opacity-60 bg-slate-50' : ''}`}>
      <div className="flex items-center flex-grow">
        <div className={`w-2 h-16 rounded-full ${statusInfo[status].color} mr-4 flex-shrink-0`}></div>
        <div className="flex-grow">
          <p className={`font-bold text-lg ${bill.isPaid ? 'line-through text-slate-500' : 'text-slate-800'}`}>{bill.name}</p>
          <p className="text-slate-600 font-semibold">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(bill.value)}</p>
          <div className="flex items-center text-sm text-slate-500 mt-1">
            <CalendarIcon className="h-4 w-4 mr-1.5" />
            <span>Venc. {new Date(bill.dueDate).toLocaleDateString('pt-BR')}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        {bill.isPaid ? (
            <button
                onClick={() => onTogglePaid(bill.id)}
                className='px-4 py-2 text-sm font-semibold rounded-lg bg-slate-200 text-slate-700 hover:bg-slate-300 transition-colors'
            >
                Desmarcar
            </button>
        ) : (
            <button
                onClick={() => onTogglePaid(bill.id)}
                className='px-4 py-2 text-sm font-semibold rounded-lg bg-indigo-100 text-indigo-700 hover:bg-indigo-200 transition-colors'
            >
                Pagar
            </button>
        )}
        <div className="relative" ref={menuRef}>
            <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 rounded-full hover:bg-slate-200 text-slate-500">
                <DotsVerticalIcon className="h-5 w-5" />
            </button>
            {menuOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg z-10 border border-slate-200">
                    <ul className="py-1">
                        <li>
                            <button onClick={() => { onEdit(bill.id); setMenuOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 flex items-center">
                                <PencilIcon className="mr-3" /> Editar
                            </button>
                        </li>
                        <li>
                            <button onClick={() => { onDelete(bill); setMenuOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-slate-100 flex items-center">
                                <TrashIcon className="mr-3" /> Excluir
                            </button>
                        </li>
                    </ul>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};