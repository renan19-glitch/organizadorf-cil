import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, Link, useNavigate, useLocation, Navigate, Outlet, useParams, useSearchParams } from 'react-router-dom';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/src/integrations/supabase/client';
import type { User, Bill, Category } from './types';
import { supabaseService } from './services';
import { useAuth, useBills, useCategories } from './hooks';
import { AuthContext, BillsContext, CategoriesContext } from './contexts';
import {
    HomeIcon, DocumentTextIcon, StarIcon, UserCircleIcon, Button, Input, Card, Modal, Spinner, SummaryCard, BillItem, PlusIcon, Textarea, Select, Logo, ClockIcon, CalendarIcon, TrendingUpIcon, ShieldCheckIcon, BellIcon, ArrowRightOnRectangleIcon, ToggleSwitch, NotificationBanner, AnimatedBellIcon, CheckCircleIcon, HotmartIcon, HotmartWordmark, AccordionItem, CalculatorIcon, TrophyIcon, ChatBubbleIcon, SparklesIcon, TrashIcon, ArrowTrendingUpIcon, ArrowTrendingDownIcon, ChevronLeftIcon, ChevronRightIcon, ArrowDownTrayIcon
} from './components';
import SubscribePage from '@/src/pages/SubscribePage';

const translateSupabaseError = (message?: string): string => {
    if (!message) return 'Ocorreu um erro desconhecido.';
    
    const lowerCaseMessage = message.toLowerCase();
    
    const translations: { [key: string]: string } = {
        'invalid login credentials': 'E-mail ou senha inválidos.',
        'user not found': 'Usuário não encontrado.',
        'password should be at least 6 characters': 'A senha deve ter no mínimo 6 caracteres.',
        'user already registered': 'Este e-mail já está cadastrado.',
        'unable to validate email address: invalid format': 'O formato do e-mail é inválido.',
        'for security purposes, you can only request this once every 60 seconds': 'Por segurança, você só pode fazer esta solicitação a cada 60 segundos.',
        'email not confirmed': 'Por favor, confirme seu e-mail antes de fazer o login.',
        'missing email': 'É necessário informar um e-mail.',
        'email is required': 'O campo de e-mail é obrigatório.',
    };
    
    const errorKey = Object.keys(translations).find(key => lowerCaseMessage.includes(key));
    
    return errorKey ? translations[errorKey] : 'Ocorreu um erro inesperado. Tente novamente.';
};

// --- PROVIDERS ---
const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const location = useLocation();

    const checkSessionAndSetUser = useCallback(async () => {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
            console.error("Error getting session:", sessionError);
            setUser(null);
            setLoading(false);
            return;
        }

        if (session) {
            const { data: profile, error: profileError } = await supabaseService.getProfile(session.user.id);

            if (profileError || !profile) {
                console.warn("User has session but no profile. Signing out.", profileError);
                await supabaseService.signOut();
                setUser(null);
            } else {
                setUser({
                    id: session.user.id,
                    email: session.user.email!,
                    name: profile.name,
                    subscription_status: profile.subscription_status,
                    plan_name: profile.plan_name,
                    next_billing_date: profile.next_billing_date,
                    subscriber_id: profile.subscriber_id,
                });
            }
        } else {
            setUser(null);
        }
        
        setLoading(false);
    }, []);

    useEffect(() => {
        if (location.pathname !== '/update-password') {
            checkSessionAndSetUser();
        } else {
            setLoading(false);
        }

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (location.pathname === '/update-password') {
                return;
            }

            if (event === 'SIGNED_IN') {
                checkSessionAndSetUser();
            } else if (event === 'SIGNED_OUT') {
                setUser(null);
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [location.pathname, checkSessionAndSetUser]);

    const updateUser = async (updatedFields: Partial<User>) => {
        if (user) {
            const { data: updatedProfile } = await supabaseService.updateProfile(user.id, updatedFields);
            if (updatedProfile) {
                setUser(prevUser => ({ ...prevUser!, name: updatedProfile.name }));
            }
        }
    };
    
    const signOut = async () => {
      await supabaseService.signOut();
      setUser(null);
    };

    const forceRevalidate = async () => {
        await supabase.auth.refreshSession();
    };

    return (
        <AuthContext.Provider value={{ user, loading, updateUser, signOut, forceRevalidate }}>
            {children}
        </AuthContext.Provider>
    );
};

const CategoriesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        const fetchCategories = async () => {
            if (user) {
                setLoading(true);
                const { data, error } = await supabaseService.getCategories(user.id);
                if (error) {
                    console.error('Error fetching categories:', error);
                    setCategories([]);
                } else if (data) {
                    setCategories(data);
                }
                setLoading(false);
            } else {
                setCategories([]);
                setLoading(false);
            }
        };

        fetchCategories();
    }, [user]);

    const addCategory = async (name: string) => {
        if (!user) return;
        const { data: newCategory, error } = await supabaseService.addCategory({ user_id: user.id, name });
        if (error) {
            console.error('Error adding category:', error);
        } else if (newCategory) {
            setCategories(prev => [...prev, newCategory].sort((a, b) => a.name.localeCompare(b.name)));
        }
    };

    const deleteCategory = async (id: string) => {
        const { error } = await supabaseService.deleteCategory(id);
        if (error) {
            console.error('Error deleting category:', error);
        } else {
            setCategories(prev => prev.filter(c => c.id !== id));
        }
    };

    return (
        <CategoriesContext.Provider value={{ categories, addCategory, deleteCategory, loading }}>
            {children}
        </CategoriesContext.Provider>
    );
};

const BillsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [bills, setBills] = useState<Bill[]>([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    const formatBillFromSupabase = (supabaseBill: any): Bill => ({
        id: supabaseBill.id,
        name: supabaseBill.name,
        value: supabaseBill.value,
        dueDate: new Date(supabaseBill.due_date.replace(/-/g, '/')),
        category: supabaseBill.category,
        observations: supabaseBill.observations,
        isPaid: supabaseBill.is_paid,
        isRecurring: supabaseBill.is_recurring,
    });

    useEffect(() => {
        const fetchBills = async () => {
            if (user?.subscription_status?.toLowerCase() === 'active') {
                setLoading(true);
                const { data, error } = await supabaseService.getBills(user.id);
                if (error) {
                    console.error('Error fetching bills:', error);
                    setBills([]);
                } else if (data) {
                    const formattedBills = data.map(formatBillFromSupabase);
                    setBills(formattedBills);
                }
                setLoading(false);
            } else {
                setBills([]);
                setLoading(false);
            }
        };

        fetchBills();
    }, [user]);

    const addBill = async (billData: Omit<Bill, 'id' | 'isPaid'>) => {
        if (!user) return;

        const { dueDate, isRecurring, ...restOfBillData } = billData;
        const billPayload = {
            ...restOfBillData,
            user_id: user.id,
            due_date: dueDate.toISOString().split('T')[0],
            is_paid: false,
            is_recurring: isRecurring,
        };

        const { data: newBill, error } = await supabaseService.addBill(billPayload);
        if (error) {
            console.error('Error adding bill:', error);
        } else if (newBill) {
            const formattedBill = formatBillFromSupabase(newBill);
            setBills(prev => [formattedBill, ...prev].sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime()));
        }
    };

    const updateBill = async (updatedBill: Bill) => {
        const { id, name, value, dueDate, category, observations, isPaid, isRecurring } = updatedBill;
        const updatePayload = {
            name,
            value,
            category,
            observations,
            due_date: dueDate.toISOString().split('T')[0],
            is_paid: isPaid,
            is_recurring: isRecurring,
        };
    
        const { data: returnedBill, error } = await supabaseService.updateBill(id, updatePayload);
        if (error) {
            console.error('Error updating bill:', error);
        } else if (returnedBill) {
            const formattedBill = formatBillFromSupabase(returnedBill);
            setBills(prev => prev.map(b => b.id === formattedBill.id ? formattedBill : b));
        }
    };

    const deleteBill = async (id: string) => {
        const { error } = await supabaseService.deleteBill(id);
        if (error) {
            console.error('Error deleting bill:', error);
        } else {
            setBills(prev => prev.filter(b => b.id !== id));
        }
    };

    const togglePaid = async (id: string) => {
        const billToToggle = bills.find(b => b.id === id);
        if (!billToToggle) return;
    
        const newIsPaidStatus = !billToToggle.isPaid;
        
        const { error } = await supabaseService.updateBill(id, { is_paid: newIsPaidStatus });
    
        if (error) {
            console.error('Error toggling paid status:', error);
            alert('Não foi possível atualizar o status da conta. Tente novamente.');
        } else {
            const updatedBills = bills.map(bill =>
                bill.id === id 
                    ? { ...bill, isPaid: newIsPaidStatus } 
                    : bill
            );
            setBills(updatedBills);

            if (newIsPaidStatus && billToToggle.isRecurring) {
                const nextDueDate = new Date(billToToggle.dueDate);
                nextDueDate.setMonth(nextDueDate.getMonth() + 1);

                const nextBillExists = updatedBills.some(bill => 
                    bill.name === billToToggle.name &&
                    bill.value === billToToggle.value &&
                    !bill.isPaid &&
                    new Date(bill.dueDate).getTime() === nextDueDate.getTime()
                );

                if (!nextBillExists) {
                    const { id: oldId, isPaid, ...restOfBill } = billToToggle;
                    const nextBill: Omit<Bill, 'id' | 'isPaid'> = {
                        ...restOfBill,
                        dueDate: nextDueDate,
                    };
                    await addBill(nextBill);
                }
            }
        }
    };
    
    return (
        <BillsContext.Provider value={{ bills, addBill, updateBill, deleteBill, togglePaid, loading }}>
            {children}
        </BillsContext.Provider>
    );
};

// --- LAYOUTS & ROUTING ---
const AppContainer: React.FC<{children: React.ReactNode}> = ({ children }) => (
    <div className="bg-slate-50 min-h-screen font-sans">
        <div className="max-w-screen-sm mx-auto bg-white min-h-screen shadow-lg">
             {children}
        </div>
    </div>
);

const MainLayout: React.FC = () => {
    const location = useLocation();
    const navItems = [
        { path: '/', icon: HomeIcon, label: 'Início' },
        { path: '/bills', icon: DocumentTextIcon, label: 'Contas' },
        { path: '/subscription', icon: StarIcon, label: 'Assinatura' },
        { path: '/profile', icon: UserCircleIcon, label: 'Perfil' },
    ];
    
    return (
        <div className="flex flex-col h-screen justify-between">
            <main className="overflow-y-auto mb-20 p-6">
                <Outlet />
            </main>
            <footer className="fixed bottom-0 left-0 right-0 max-w-screen-sm mx-auto bg-white/80 backdrop-blur-sm border-t border-slate-200">
                <nav className="flex justify-around items-center h-16 px-2">
                    {navItems.map(item => (
                        <Link to={item.path} key={item.path} className={`flex flex-col items-center justify-center w-full text-sm transition-colors rounded-md py-2 ${location.pathname === item.path ? 'text-indigo-600 font-bold' : 'text-slate-500 hover:text-indigo-600'}`}>
                            <item.icon className="h-6 w-6 mb-1" />
                            <span>{item.label}</span>
                        </Link>
                    ))}
                </nav>
            </footer>
        </div>
    );
};

const ProtectedRoute: React.FC = () => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return <div className="h-screen flex justify-center items-center"><Spinner /></div>;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    const isSubscriptionActive = user.subscription_status?.toLowerCase() === 'active';
    const isTryingToSubscribe = location.pathname === '/subscribe';
    const isAllowedPath = ['/subscribe', '/profile'].includes(location.pathname);

    if (isSubscriptionActive && isTryingToSubscribe) {
        return <Navigate to="/" replace />;
    }

    if (!isSubscriptionActive && !isAllowedPath) {
        return <Navigate to="/subscribe" replace />;
    }

    return <Outlet />;
};

const Header: React.FC<{title: string, children?: React.ReactNode}> = ({title, children}) => (
    <header className="mb-8 flex justify-between items-center">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">{title}</h1>
        {children}
    </header>
);

// --- PAGES ---
const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [searchParams] = useSearchParams();
    const [message, setMessage] = useState('');
    
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (user) {
            navigate('/', { replace: true });
        }
    }, [user, navigate]);

    useEffect(() => {
        if (searchParams.get('message') === 'password-updated') {
            setMessage('Sua senha foi alterada com sucesso! Por favor, faça o login novamente.');
        }
    }, [searchParams]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        
        const { error: signInError } = await supabaseService.signIn({ email, password });

        if (signInError) {
            setError(translateSupabaseError(signInError.message));
        }
        
        setLoading(false);
    };

    return (
        <AppContainer>
            <div className="flex flex-col justify-center items-center h-screen p-4">
                <Logo className="mb-10" />
                <Card className="w-full max-w-sm">
                    {message && (
                        <div className="mb-4 p-3 rounded-md bg-green-100 text-green-800 text-sm text-center">
                            {message}
                        </div>
                    )}
                    <h2 className="text-2xl font-bold text-center text-slate-800 mb-2">
                        Acesse sua conta
                    </h2>
                    <p className="text-center text-slate-600 mb-6 text-sm">
                        Comprou pela Hotmart? Use o link "Esqueceu sua senha?" para criar seu primeiro acesso.
                    </p>
                    
                    <form onSubmit={handleLogin} className="space-y-4">
                        <Input 
                            label="E-mail"
                            type="email"
                            placeholder="Digite seu e-mail"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <Input 
                            label="Senha"
                            type="password"
                            placeholder="Digite sua senha"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        {error && (
                            <p className="text-sm text-red-600 text-center pt-2">{error}</p>
                        )}
                        <div className="pt-2">
                            <Button type="submit" disabled={loading}>
                                {loading ? 'Entrando...' : 'Entrar'}
                            </Button>
                        </div>
                    </form>

                    <div className="text-center mt-4">
                        <Link to="/forgot-password" className="text-sm text-indigo-600 hover:underline">
                            Esqueceu sua senha?
                        </Link>
                    </div>
                </Card>
            </div>
        </AppContainer>
    );
};

const ForgotPasswordPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [isError, setIsError] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setIsError(false);
        const { error } = await supabaseService.sendPasswordResetEmail(email);
        if (error) {
            setMessage(translateSupabaseError(error.message));
            setIsError(true);
        } else {
            setMessage("Se uma conta com este e-mail existir, um link para redefinição de senha foi enviado. Por favor, verifique sua caixa de entrada.");
            setIsError(false);
        }
        setLoading(false);
    };

    return (
        <AppContainer>
            <div className="flex flex-col justify-center items-center h-screen p-4">
                <Logo className="mb-10" />
                <Card className="w-full max-w-sm">
                    <h2 className="text-2xl font-bold text-center text-slate-800 mb-2">
                        Recuperar Senha
                    </h2>
                    <p className="text-center text-slate-600 mb-6 text-sm">
                        Digite seu e-mail <strong>de compra pela Hotmart</strong> para receber um link de recuperação.
                    </p>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input 
                            label="Seu email" 
                            type="email" 
                            value={email} 
                            onChange={e => setEmail(e.target.value)} 
                            required 
                        />
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Enviando...' : 'Enviar Link de Recuperação'}
                        </Button>
                    </form>
                    {message && <p className={`mt-4 text-center text-sm ${isError ? 'text-red-600' : 'text-green-600'}`}>{message}</p>}
                    <div className="text-center mt-4">
                        <Link to="/login" className="text-sm text-indigo-600 hover:underline">
                            Voltar para o login
                        </Link>
                    </div>
                </Card>
            </div>
        </AppContainer>
    );
};

const UpdatePasswordPage: React.FC = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
            if (event === 'USER_UPDATED') {
                navigate('/login?message=password-updated', { replace: true });
            }
        });

        return () => subscription.unsubscribe();
    }, [navigate]);

    return (
        <AppContainer>
            <div className="flex flex-col justify-center items-center h-screen p-4">
                <Logo className="mb-10" />
                <Card className="w-full max-w-sm">
                    <h2 className="text-2xl font-bold text-center text-slate-800 mb-2">
                        Crie uma nova senha
                    </h2>
                    <p className="text-center text-slate-600 mb-6 text-sm">
                        Digite sua nova senha abaixo para acessar sua conta.
                    </p>
                    <Auth
                        supabaseClient={supabase}
                        view="update_password"
                        appearance={{
                            theme: ThemeSupa,
                            variables: {
                                default: {
                                    colors: {
                                        brand: 'rgb(79 70 229)',
                                        brandAccent: 'rgb(99 102 241)',
                                    },
                                    radii: {
                                        borderRadius: '0.5rem',
                                        buttonBorderRadius: '0.5rem',
                                    }
                                }
                            }
                        }}
                        providers={[]}
                        localization={{
                            variables: {
                                update_password: {
                                    password_label: 'Nova senha',
                                    password_input_placeholder: 'Sua nova senha',
                                    button_label: 'Salvar nova senha',
                                    confirmation_text: 'Sua senha foi atualizada com sucesso!',
                                }
                            },
                        }}
                    />
                </Card>
            </div>
        </AppContainer>
    );
};

const HomePage: React.FC = () => {
    const { user } = useAuth();
    const { bills, loading } = useBills();
    const [selectedDate, setSelectedDate] = useState(new Date());

    const handlePreviousMonth = () => {
        setSelectedDate(prevDate => new Date(prevDate.getFullYear(), prevDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setSelectedDate(prevDate => new Date(prevDate.getFullYear(), prevDate.getMonth() + 1, 1));
    };

    const isNextMonthDisabled = () => {
        const now = new Date();
        return selectedDate.getFullYear() === now.getFullYear() && selectedDate.getMonth() === now.getMonth();
    };

    if (loading) return <Spinner />;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const overdue = bills.filter(b => !b.isPaid && new Date(b.dueDate) < today);
    const dueToday = bills.filter(b => !b.isPaid && new Date(b.dueDate).toDateString() === today.toDateString());
    const upcoming = bills.filter(b => !b.isPaid && new Date(b.dueDate) > today);

    const total = (arr: Bill[]) => arr.reduce((sum, b) => sum + b.value, 0);
    
    const displayName = user?.name ? user.name.split(' ')[0] : 'Usuário';

    const renderNotifications = () => {
        const banners = [];

        if (overdue.length > 0) {
            banners.push(
                <NotificationBanner key="overdue" variant="danger" icon={<AnimatedBellIcon className="h-6 w-6" />}>
                    Você tem <strong>{overdue.length} conta(s) vencida(s)</strong>.
                </NotificationBanner>
            );
        }

        if (dueToday.length > 0) {
            banners.push(
                <NotificationBanner key="due-today" variant="warning" icon={<AnimatedBellIcon className="h-6 w-6" />}>
                    Você tem <strong>{dueToday.length} conta(s) vencendo hoje</strong>.
                </NotificationBanner>
            );
        }

        if (banners.length === 0) {
            banners.push(
                <NotificationBanner key="success" variant="success" icon={<CheckCircleIcon className="h-6 w-6" />}>
                    Suas contas estão em dia! Parabéns!
                </NotificationBanner>
            );
        }

        return banners;
    };

    const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

    const selectedMonth = selectedDate.getMonth();
    const selectedYear = selectedDate.getFullYear();
    
    const previousMonthDate = new Date(selectedYear, selectedMonth - 1, 1);
    const previousMonth = previousMonthDate.getMonth();
    const previousMonthYear = previousMonthDate.getFullYear();

    const paidSelectedMonthBills = bills.filter(b => {
        const billDate = new Date(b.dueDate);
        return b.isPaid && billDate.getMonth() === selectedMonth && billDate.getFullYear() === selectedYear;
    });

    const paidPreviousMonthBills = bills.filter(b => {
        const billDate = new Date(b.dueDate);
        return b.isPaid && billDate.getMonth() === previousMonth && billDate.getFullYear() === previousMonthYear;
    });

    const pendingSelectedMonthBills = bills.filter(b => {
        const billDate = new Date(b.dueDate);
        return !b.isPaid && billDate.getMonth() === selectedMonth && billDate.getFullYear() === selectedYear;
    });

    const totalPaidSelectedMonth = paidSelectedMonthBills.reduce((sum, b) => sum + b.value, 0);
    const totalPaidPreviousMonth = paidPreviousMonthBills.reduce((sum, b) => sum + b.value, 0);
    const totalPendingSelectedMonth = pendingSelectedMonthBills.reduce((sum, b) => sum + b.value, 0);

    const monthlyChange = totalPaidPreviousMonth > 0 
        ? ((totalPaidSelectedMonth - totalPaidPreviousMonth) / totalPaidPreviousMonth) * 100
        : totalPaidSelectedMonth > 0 ? 100 : 0;

    const spendingByCategory = paidSelectedMonthBills.reduce((acc, bill) => {
        acc[bill.category] = (acc[bill.category] || 0) + bill.value;
        return acc;
    }, {} as { [key: string]: number });

    const sortedCategories = Object.entries(spendingByCategory).sort(([, a], [, b]) => b - a);
    const maxCategoryValue = Math.max(...Object.values(spendingByCategory), 1);

    return (
        <div>
            <header className="mb-4">
                <h1 className="text-3xl font-bold text-slate-800">Olá, {displayName}!</h1>
                <p className="text-slate-500 mt-1">Aqui está o resumo de suas contas.</p>
            </header>
            {renderNotifications()}
            <div className="space-y-4">
                <SummaryCard title="Vencidas" amount={overdue.length} value={total(overdue)} color="red" icon={<ClockIcon className="h-6 w-6" />} />
                <SummaryCard title="Vencendo Hoje" amount={dueToday.length} value={total(dueToday)} color="yellow" icon={<CalendarIcon className="h-6 w-6" />} />
                <SummaryCard title="Próximos Vencimentos" amount={upcoming.length} value={total(upcoming)} color="green" icon={<TrendingUpIcon className="h-6 w-6" />} />
            </div>

            <div className="mt-10">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <CalculatorIcon className="h-7 w-7 text-indigo-600" />
                            <h2 className="text-2xl font-bold text-slate-800">Análise Financeira</h2>
                        </div>
                        <p className="text-slate-500">Veja um resumo dos seus gastos e tendências.</p>
                    </div>
                </div>

                <div className="flex justify-between items-center bg-slate-100 p-2 rounded-lg mb-4">
                    <button onClick={handlePreviousMonth} className="p-2 rounded-md hover:bg-slate-200 text-slate-600">
                        <ChevronLeftIcon className="h-6 w-6" />
                    </button>
                    <span className="font-bold text-lg text-slate-800 capitalize text-center">
                        {selectedDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}
                    </span>
                    <button onClick={handleNextMonth} disabled={isNextMonthDisabled()} className="p-2 rounded-md hover:bg-slate-200 text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed">
                        <ChevronRightIcon className="h-6 w-6" />
                    </button>
                </div>
                
                <div className="space-y-4">
                    <Card>
                        <h3 className="font-bold text-lg text-slate-800 mb-3">Resumo de {selectedDate.toLocaleString('pt-BR', { month: 'long' })}</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg">
                            <div>
                                <p className="text-sm text-slate-500">Total Pago</p>
                                <p className="text-2xl font-bold text-emerald-600">{formatCurrency(totalPaidSelectedMonth)}</p>
                            </div>
                            <div className="sm:text-right">
                                <p className="text-sm text-slate-500">Total Pendente</p>
                                <p className="text-2xl font-bold text-yellow-600">{formatCurrency(totalPendingSelectedMonth)}</p>
                            </div>
                        </div>
                    </Card>

                    <Card>
                        <h3 className="font-bold text-lg text-slate-800 mb-3">Comparativo Mensal</h3>
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 sm:gap-2">
                            <div>
                                <p className="text-sm text-slate-500">Gastos no mês anterior</p>
                                <p className="text-xl font-semibold text-slate-700">{formatCurrency(totalPaidPreviousMonth)}</p>
                            </div>
                            <div className={`flex items-center font-bold text-lg ${monthlyChange >= 0 ? 'text-red-500' : 'text-green-600'}`}>
                                {monthlyChange >= 0 ? <ArrowTrendingUpIcon className="h-5 w-5 mr-1" /> : <ArrowTrendingDownIcon className="h-5 w-5 mr-1" />}
                                {Math.abs(monthlyChange).toFixed(1)}%
                            </div>
                        </div>
                    </Card>

                    <Card>
                        <h3 className="font-bold text-lg text-slate-800 mb-4">Gastos por Categoria ({selectedDate.toLocaleString('pt-BR', { month: 'long' })})</h3>
                        {sortedCategories.length > 0 ? (
                            <div className="space-y-3">
                                {sortedCategories.map(([category, value]) => (
                                    <div key={category}>
                                        <div className="flex justify-between items-center mb-1 text-sm">
                                            <span className="font-semibold text-slate-700">{category}</span>
                                            <span className="font-bold text-slate-800">{formatCurrency(value)}</span>
                                        </div>
                                        <div className="w-full bg-slate-200 rounded-full h-2.5">
                                            <div 
                                                className="bg-indigo-600 h-2.5 rounded-full" 
                                                style={{ width: `${(value / maxCategoryValue) * 100}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-slate-500 text-center py-4">Nenhum gasto registrado neste mês para exibir a análise.</p>
                        )}
                    </Card>
                </div>
            </div>
        </div>
    );
};

const BillsListPage: React.FC = () => {
    const { bills, loading, togglePaid, deleteBill } = useBills();
    const { categories } = useCategories();
    const navigate = useNavigate();
    const [statusFilter, setStatusFilter] = useState('all');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [periodFilter, setPeriodFilter] = useState('all');
    const [customStartDate, setCustomStartDate] = useState('');
    const [customEndDate, setCustomEndDate] = useState('');
    const [billToDelete, setBillToDelete] = useState<Bill | null>(null);
    const [billToView, setBillToView] = useState<Bill | null>(null);

    const handleEdit = (id: string) => {
        navigate(`/edit-bill/${id}`);
    };

    const handleDelete = (bill: Bill) => {
        setBillToDelete(bill);
    };

    const confirmDelete = () => {
        if (billToDelete) {
            deleteBill(billToDelete.id);
            setBillToDelete(null);
        }
    };

    const sortedAndFilteredBills = [...bills]
        .filter(bill => {
            if (statusFilter === 'paid') return bill.isPaid;
            if (statusFilter === 'unpaid') return !bill.isPaid;
            return true;
        })
        .filter(bill => {
            if (categoryFilter === 'all') return true;
            return bill.category === categoryFilter;
        })
        .filter(bill => {
            if (periodFilter === 'all') {
                return true;
            }

            const billDate = new Date(bill.dueDate);
            billDate.setHours(0, 0, 0, 0);

            if (periodFilter === 'custom') {
                if (!customStartDate || !customEndDate) {
                    return true;
                }
                const startDate = new Date(customStartDate.replace(/-/g, '/'));
                const endDate = new Date(customEndDate.replace(/-/g, '/'));
                startDate.setHours(0, 0, 0, 0);
                endDate.setHours(0, 0, 0, 0);
                return billDate >= startDate && billDate <= endDate;
            }

            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (periodFilter === 'this_month') {
                return billDate.getMonth() === today.getMonth() && billDate.getFullYear() === today.getFullYear();
            }
            if (periodFilter === 'last_month') {
                const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
                return billDate.getMonth() === lastMonth.getMonth() && billDate.getFullYear() === lastMonth.getFullYear();
            }
            if (periodFilter === 'next_month') {
                const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
                return billDate.getMonth() === nextMonth.getMonth() && billDate.getFullYear() === nextMonth.getFullYear();
            }
            
            return true;
        })
        .sort((a, b) => {
            if (statusFilter === 'all' && a.isPaid !== b.isPaid) {
                return a.isPaid ? 1 : -1;
            }
            if (!a.isPaid) {
                return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
            }
            if (a.isPaid) {
                return new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime();
            }
            return 0;
        });

    const handleExportCSV = () => {
        if (sortedAndFilteredBills.length === 0) {
            alert("Não há contas para exportar com os filtros atuais.");
            return;
        }

        const headers = ['Nome', 'Valor', 'Vencimento', 'Categoria', 'Observações', 'Pago', 'Recorrente'];
        const rows = sortedAndFilteredBills.map(bill => [
            `"${bill.name.replace(/"/g, '""')}"`,
            bill.value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            new Date(bill.dueDate).toLocaleDateString('pt-BR'),
            `"${bill.category.replace(/"/g, '""')}"`,
            `"${(bill.observations || '').replace(/"/g, '""')}"`,
            bill.isPaid ? 'Sim' : 'Não',
            bill.isRecurring ? 'Sim' : 'Não'
        ].join(','));

        const csvContent = "\uFEFF" + [headers.join(','), ...rows].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", "contas_paguefacil.csv");
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    return (
        <div>
            <Header title="Minhas Contas">
                <button 
                    onClick={handleExportCSV}
                    disabled={sortedAndFilteredBills.length === 0}
                    className="flex items-center gap-2 text-sm font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg px-3 py-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <ArrowDownTrayIcon className="h-5 w-5" />
                    <span className="hidden sm:inline">Exportar CSV</span>
                </button>
            </Header>
            <div className="mb-6 space-y-4 p-4 bg-slate-50 rounded-lg border border-slate-200/80">
                <div className="grid grid-cols-3 gap-2">
                    <button onClick={() => setStatusFilter('all')} className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${statusFilter === 'all' ? 'bg-indigo-600 text-white shadow' : 'bg-white text-slate-700 hover:bg-slate-100 border'}`}>Todas</button>
                    <button onClick={() => setStatusFilter('unpaid')} className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${statusFilter === 'unpaid' ? 'bg-indigo-600 text-white shadow' : 'bg-white text-slate-700 hover:bg-slate-100 border'}`}>Abertas</button>
                    <button onClick={() => setStatusFilter('paid')} className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${statusFilter === 'paid' ? 'bg-indigo-600 text-white shadow' : 'bg-white text-slate-700 hover:bg-slate-100 border'}`}>Pagas</button>
                </div>
                <div className="grid grid-cols-1 gap-4">
                    <Select label="Filtrar por Categoria" value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
                        <option value="all">Todas as Categorias</option>
                        {categories.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
                    </Select>
                    <div>
                        <Select label="Filtrar por Período" value={periodFilter} onChange={e => {
                            setPeriodFilter(e.target.value);
                            if (e.target.value !== 'custom') {
                                setCustomStartDate('');
                                setCustomEndDate('');
                            }
                        }}>
                            <option value="all">Todos os Períodos</option>
                            <option value="this_month">Este Mês</option>
                            <option value="last_month">Mês Passado</option>
                            <option value="next_month">Próximo Mês</option>
                            <option value="custom">Personalizado</option>
                        </Select>
                        {periodFilter === 'custom' && (
                            <div className="grid grid-cols-2 gap-2 mt-2">
                                <Input label="Data Início" type="date" value={customStartDate} onChange={e => setCustomStartDate(e.target.value)} />
                                <Input label="Data Fim" type="date" value={customEndDate} onChange={e => setCustomEndDate(e.target.value)} />
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {loading ? <Spinner /> : (
                <div>
                    <div className="mb-4 text-sm text-slate-600 font-medium">
                        {sortedAndFilteredBills.length} conta{sortedAndFilteredBills.length !== 1 ? 's' : ''} encontrada{sortedAndFilteredBills.length !== 1 ? 's' : ''}.
                    </div>
                    <div className="space-y-3">
                        {sortedAndFilteredBills.length > 0 ? sortedAndFilteredBills.map(bill => (
                            <BillItem key={bill.id} bill={bill} onTogglePaid={togglePaid} onEdit={handleEdit} onDelete={handleDelete} onViewDetails={setBillToView} />
                        )) : (
                            <div className="text-center text-slate-500 mt-12 py-8 bg-slate-50 rounded-lg">
                                <DocumentTextIcon className="h-12 w-12 mx-auto text-slate-400 mb-4" />
                                <p className="font-semibold">Nenhuma conta encontrada.</p>
                                <p className="text-sm">Tente ajustar os filtros ou adicione uma nova conta.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
            <button
              onClick={() => navigate('/add-bill')}
              className="fixed bottom-24 right-4 max-w-screen-sm mx-auto bg-indigo-600 text-white rounded-full p-4 shadow-lg hover:bg-indigo-700 transition transform hover:scale-110"
              style={{ right: 'calc(50% - (min(100vw, 640px) / 2) + 1.5rem)' }}
            >
                <PlusIcon className="h-8 w-8" />
            </button>
            <Modal isOpen={!!billToDelete} onClose={() => setBillToDelete(null)} title="Confirmar Exclusão">
                <p className="mb-6 text-slate-600">
                    Você tem certeza que deseja excluir a conta "<strong>{billToDelete?.name}</strong>"? Esta ação não pode ser desfeita.
                </p>
                <div className="flex justify-end space-x-4">
                    <Button variant="secondary" onClick={() => setBillToDelete(null)}>Cancelar</Button>
                    <Button variant="danger" onClick={confirmDelete}>Excluir</Button>
                </div>
            </Modal>
            <Modal isOpen={!!billToView} onClose={() => setBillToView(null)} title="Detalhes da Conta">
                {billToView && (
                    <div className="space-y-4 text-slate-700">
                        <div className="pb-2 border-b">
                            <p className="text-xs text-slate-500">Nome da Conta</p>
                            <p className="font-bold text-xl text-slate-800">{billToView.name}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs text-slate-500">Valor</p>
                                <p className="font-semibold text-lg">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(billToView.value)}</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">Vencimento</p>
                                <p className="font-semibold text-lg">{new Date(billToView.dueDate).toLocaleDateString('pt-BR')}</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs text-slate-500">Categoria</p>
                                <p className="font-semibold text-lg">{billToView.category}</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">Tipo</p>
                                <p className="font-semibold text-lg">{billToView.isRecurring ? 'Recorrente' : 'Única'}</p>
                            </div>
                        </div>
                        {billToView.observations && (
                            <div>
                                <p className="text-xs text-slate-500">Observações</p>
                                <p className="text-base bg-slate-50 p-3 rounded-md whitespace-pre-wrap">{billToView.observations}</p>
                            </div>
                        )}
                        <div className="flex justify-end pt-4">
                            <Button variant="secondary" onClick={() => setBillToView(null)}>Fechar</Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

const AddBillPage: React.FC = () => {
    const { addBill } = useBills();
    const { categories, loading: categoriesLoading } = useCategories();
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [value, setValue] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [category, setCategory] = useState('');
    const [observations, setObservations] = useState('');
    const [isRecurring, setIsRecurring] = useState(false);

    useEffect(() => {
        if (categories.length > 0) {
            setCategory(categories[0].name);
        }
    }, [categories]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const billValue = parseFloat(value.replace(',', '.'));
        if (isNaN(billValue)) {
            alert('Valor inválido');
            return;
        }
        addBill({ name, value: billValue, dueDate: new Date(dueDate.replace(/-/g, '/')), category, observations, isRecurring });
        navigate('/bills');
    };

    return (
        <div>
            <Header title="Adicionar Conta" />
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input label="Nome da Conta" value={name} onChange={e => setName(e.target.value)} required />
                <Input label="Valor (R$)" value={value} onChange={e => setValue(e.target.value)} type="text" placeholder="100,00" required />
                <Input label="Data de Vencimento" value={dueDate} onChange={e => setDueDate(e.target.value)} type="date" required />
                <Select label="Categoria" value={category} onChange={e => setCategory(e.target.value)} disabled={categoriesLoading}>
                    {categories.length === 0 && !categoriesLoading ? (
                        <option>Crie uma categoria no seu perfil</option>
                    ) : (
                        categories.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)
                    )}
                </Select>
                <Textarea label="Observações" value={observations} onChange={e => setObservations(e.target.value)} />
                <div className="flex items-center justify-between bg-slate-50 p-3 rounded-lg">
                    <label className="font-semibold text-slate-700">Repetir mensalmente?</label>
                    <ToggleSwitch checked={isRecurring} onChange={setIsRecurring} />
                </div>
                <Button type="submit">Salvar Conta</Button>
            </form>
        </div>
    );
};

const EditBillPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { bills, updateBill } = useBills();
    const { categories, loading: categoriesLoading } = useCategories();
    const navigate = useNavigate();
    const billToEdit = bills.find(b => b.id === id);

    const [name, setName] = useState('');
    const [value, setValue] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [category, setCategory] = useState('');
    const [observations, setObservations] = useState('');
    const [isRecurring, setIsRecurring] = useState(false);

    useEffect(() => {
        if (billToEdit) {
            setName(billToEdit.name);
            setValue(billToEdit.value.toString().replace('.', ','));
            setDueDate(billToEdit.dueDate.toISOString().split('T')[0]);
            setCategory(billToEdit.category);
            setObservations(billToEdit.observations);
            setIsRecurring(billToEdit.isRecurring);
        }
    }, [billToEdit]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const billValue = parseFloat(value.replace(',', '.'));
        if (isNaN(billValue) || !billToEdit) {
            alert('Dados inválidos');
            return;
        }
        const updatedBill: Bill = {
            ...billToEdit,
            name,
            value: billValue,
            dueDate: new Date(dueDate.replace(/-/g, '/')),
            category,
            observations,
            isRecurring,
        };
        updateBill(updatedBill);
        navigate('/bills');
    };

    if (!billToEdit) {
        return <div className="p-4"><Header title="Erro" /><p>Conta não encontrada.</p></div>;
    }

    return (
        <div>
            <Header title="Editar Conta" />
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input label="Nome da Conta" value={name} onChange={e => setName(e.target.value)} required />
                <Input label="Valor (R$)" value={value} onChange={e => setValue(e.target.value)} type="text" placeholder="100,00" required />
                <Input label="Data de Vencimento" value={dueDate} onChange={e => setDueDate(e.target.value)} type="date" required />
                <Select label="Categoria" value={category} onChange={e => setCategory(e.target.value)} disabled={categoriesLoading}>
                    {categories.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
                </Select>
                <Textarea label="Observações" value={observations} onChange={e => setObservations(e.target.value)} />
                <div className="flex items-center justify-between bg-slate-50 p-3 rounded-lg">
                    <label className="font-semibold text-slate-700">Repetir mensalmente?</label>
                    <ToggleSwitch checked={isRecurring} onChange={setIsRecurring} />
                </div>
                <Button type="submit">Salvar Alterações</Button>
            </form>
        </div>
    );
};


const SubscriptionPage: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const statusDisplay = {
        active: { text: 'Ativa', textColor: 'text-green-800', bgColor: 'bg-green-100' },
        inactive: { text: 'Inativa', textColor: 'text-red-800', bgColor: 'bg-red-100' },
        canceled: { text: 'Cancelada', textColor: 'text-red-800', bgColor: 'bg-red-100' },
        started: { text: 'Iniciada', textColor: 'text-blue-800', bgColor: 'bg-blue-100' },
        overdue: { text: 'Atrasada', textColor: 'text-yellow-800', bgColor: 'bg-yellow-100' },
        default: { text: 'Indefinido', textColor: 'text-gray-800', bgColor: 'bg-gray-100' }
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'Não informado';
        const date = new Date(dateString + 'T00:00:00');
        return date.toLocaleDateString('pt-BR');
    };

    if (!user) {
        return <Spinner />;
    }

    const currentStatusKey = user.subscription_status as keyof typeof statusDisplay;
    const displayInfo = statusDisplay[currentStatusKey] || statusDisplay.default;
    const formattedNextBilling = formatDate(user.next_billing_date);

    const InfoRow: React.FC<{ label: React.ReactNode; value: React.ReactNode }> = ({ label, value }) => (
        <div className="space-y-1">
            <div className="text-sm text-slate-500 flex items-center">{label}</div>
            <div className="font-semibold text-slate-800 text-lg">{value}</div>
        </div>
    );

    return (
        <div>
            <Header title="Minha Assinatura" />
            
            <Section icon={<UserCircleIcon className="h-7 w-7" />} title="Informações do Assinante">
                <div className="space-y-4">
                    <InfoRow label="Nome" value={user.name} />
                    <InfoRow label="Email" value={user.email} />
                </div>
            </Section>

            <Section icon={<StarIcon className="h-7 w-7" />} title="Dados da Assinatura">
                <div className="space-y-4">
                    <InfoRow 
                        label="ID do Assinante"
                        value={user.subscriber_id || 'Não informado'} 
                    />
                    <InfoRow label="Plano" value={user.plan_name || 'Não informado'} />
                    <InfoRow label="Próximo Vencimento" value={formattedNextBilling} />
                    <InfoRow 
                        label="Status" 
                        value={
                            <span className={`px-3 py-1 text-sm font-bold rounded-full ${displayInfo.bgColor} ${displayInfo.textColor}`}>
                                {displayInfo.text}
                            </span>
                        } 
                    />
                </div>
                {user.subscription_status !== 'active' && (
                    <div className="mt-6 pt-6 border-t border-slate-200">
                         <Button onClick={() => navigate('/subscribe')}>
                            Fazer Upgrade ou Alterar Plano
                        </Button>
                    </div>
                )}
            </Section>
        </div>
    );
};

const Section: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
    <div className="mb-8">
        <div className="flex items-center mb-4">
            <div className="text-indigo-600">{icon}</div>
            <h2 className="text-xl font-bold text-slate-800 ml-3">{title}</h2>
        </div>
        <div className="bg-slate-50/50 p-6 rounded-xl border border-slate-200/80">
            {children}
        </div>
    </div>
);

const ProfilePage: React.FC = () => {
    const { user, updateUser, signOut } = useAuth();
    const { categories, addCategory, deleteCategory, loading: categoriesLoading } = useCategories();
    const navigate = useNavigate();

    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
    const [name, setName] = useState(user?.name || '');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
    const [isSavingProfile, setIsSavingProfile] = useState(false);
    const [profileSaveSuccess, setProfileSaveSuccess] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
    
    useEffect(() => {
        if (user) {
            setName(user.name);
        }
    }, [user]);

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSavingProfile(true);
        setProfileSaveSuccess(false);
        await updateUser({ name });
        setIsSavingProfile(false);
        setProfileSaveSuccess(true);
        setTimeout(() => setProfileSaveSuccess(false), 3000);
    };
    
    const handleLogout = async () => {
        await signOut();
        navigate('/login', { replace: true });
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordMessage({ type: '', text: '' });
        
        if (password !== confirmPassword) {
            setPasswordMessage({ type: 'error', text: 'As senhas não conferem.' });
            return;
        }
        if (password.length < 6) {
            setPasswordMessage({ type: 'error', text: 'A senha deve ter no mínimo 6 caracteres.' });
            return;
        }

        setIsUpdatingPassword(true);
        
        const { data, error } = await supabaseService.updateUserPassword(password);

        setIsUpdatingPassword(false);

        if (error) {
            setPasswordMessage({ type: 'error', text: translateSupabaseError(error.message) });
        } else if (data && !data.success) {
            setPasswordMessage({ type: 'error', text: translateSupabaseError(data.error) });
        } else if (data && data.success) {
            setPasswordMessage({ type: 'success', text: 'Senha alterada com sucesso! Você será desconectado para fazer login novamente.' });
            setTimeout(async () => {
                await signOut();
                navigate('/login?message=password-updated', { replace: true });
            }, 3000);
        } else {
            setPasswordMessage({ type: 'error', text: 'A resposta do servidor foi inesperada.' });
        }
    };

    const handleAddCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newCategoryName.trim()) {
            await addCategory(newCategoryName.trim());
            setNewCategoryName('');
        }
    };

    const confirmDeleteCategory = () => {
        if (categoryToDelete) {
            deleteCategory(categoryToDelete.id);
            setCategoryToDelete(null);
        }
    };

    const faqItems = [
        {
            question: "Como crio minha senha pela primeira vez?",
            answer: "Se você comprou pela Hotmart, seu acesso é criado automaticamente. Para definir sua senha, vá para a tela de login, clique em 'Esqueceu sua senha?' e digite o mesmo e-mail que usou na compra. Você receberá um link para criar sua senha de acesso."
        },
        {
            question: "O que é uma conta 'Recorrente'?",
            answer: "Uma conta recorrente é aquela que se repete todo mês, como aluguel ou mensalidade. Ao marcar uma conta como 'Paga', o PagueFácil cria automaticamente a mesma conta para o mês seguinte, poupando seu tempo!"
        },
        {
            question: "Como funciona a 'Análise Financeira' na tela inicial?",
            answer: "A análise mostra um resumo dos seus gastos do mês selecionado. Ela compara o total que você pagou no mês atual com o total pago no mês anterior e também exibe um gráfico de quanto você gastou em cada categoria, ajudando a entender para onde seu dinheiro está indo."
        },
        {
            question: "Para que serve a função 'Exportar CSV'?",
            answer: "Essa função permite que você baixe um arquivo de planilha (CSV) com todas as contas que estão visíveis na tela, de acordo com os filtros que você aplicou. É perfeito para quem gosta de fazer análises mais detalhadas no Excel ou Google Sheets, ou simplesmente para ter um backup dos seus dados."
        },
        {
            question: "Como renovo minha assinatura?",
            answer: "Após a data de vencimento, o aplicativo exibirá a tela de planos para que você possa renovar. Para garantir que você não perca nenhuma informação já cadastrada, basta escolher um novo plano e fazer a assinatura usando o mesmo e-mail da compra anterior. Se sua assinatura tiver renovação automática, nenhuma ação é necessária."
        },
        {
            question: "Como crio minhas próprias categorias?",
            answer: "É fácil! Aqui mesmo na página de 'Meu Perfil', na seção 'Minhas Categorias', você pode adicionar novos nomes de categorias (como 'Pets' ou 'Investimentos') e excluir as que não usa. Elas aparecerão automaticamente ao adicionar ou editar uma conta."
        }
    ];

    return (
        <div>
            <Header title="Meu Perfil" />

            <form onSubmit={handleSaveProfile}>
                <Section icon={<UserCircleIcon className="h-7 w-7" />} title="Informações do Perfil">
                    <div className="space-y-4">
                        <Input label="Nome Completo" value={name} onChange={e => setName(e.target.value)} />
                        <Input label="Email" value={user?.email || ''} disabled />
                        <div className="flex justify-end items-center pt-2">
                            {profileSaveSuccess && <span className="text-green-600 text-sm mr-4">Salvo com sucesso!</span>}
                            <Button type="submit" disabled={isSavingProfile} className="!w-auto px-6">
                                {isSavingProfile ? 'Salvando...' : 'Salvar'}
                            </Button>
                        </div>
                    </div>
                </Section>
            </form>

            <Section icon={<DocumentTextIcon className="h-7 w-7" />} title="Minhas Categorias">
                <div className="space-y-3 mb-4">
                    {categoriesLoading ? <Spinner /> : categories.length > 0 ? (
                        categories.map(cat => (
                            <div key={cat.id} className="flex justify-between items-center bg-white p-3 rounded-md border">
                                <span className="text-slate-700">{cat.name}</span>
                                <button onClick={() => setCategoryToDelete(cat)} className="text-red-500 hover:text-red-700">
                                    <TrashIcon className="h-5 w-5" />
                                </button>
                            </div>
                        ))
                    ) : (
                        <p className="text-slate-500 text-center py-4">Você ainda não tem categorias.</p>
                    )}
                </div>
                <form onSubmit={handleAddCategory} className="flex gap-2">
                    <Input label="" placeholder="Nova categoria" value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} />
                    <Button type="submit" className="!w-auto px-5">Adicionar</Button>
                </form>
            </Section>

            <form onSubmit={handlePasswordChange}>
                <Section icon={<ShieldCheckIcon className="h-7 w-7" />} title="Segurança">
                    <div className="space-y-4">
                        <Input 
                            label="Nova Senha" 
                            type="password" 
                            value={password} 
                            onChange={e => setPassword(e.target.value)} 
                            placeholder="Mínimo 6 caracteres"
                        />
                        <Input 
                            label="Confirmar Nova Senha" 
                            type="password" 
                            value={confirmPassword} 
                            onChange={e => setConfirmPassword(e.target.value)} 
                        />
                        {passwordMessage.text && (
                            <p className={`text-sm pt-1 ${passwordMessage.type === 'error' ? 'text-red-500' : 'text-green-600'}`}>
                                {passwordMessage.text}
                            </p>
                        )}
                        <div className="flex justify-end pt-2">
                            <Button type="submit" disabled={isUpdatingPassword} className="!w-auto px-6">
                                {isUpdatingPassword ? 'Alterando...' : 'Alterar Senha'}
                            </Button>
                        </div>
                    </div>
                </Section>
            </form>

            <Section icon={<SparklesIcon className="h-7 w-7" />} title="Tire Suas Dúvidas">
                <div className="divide-y divide-slate-200">
                    {faqItems.map((item, index) => (
                        <AccordionItem key={index} title={item.question}>
                            <p>{item.answer}</p>
                        </AccordionItem>
                    ))}
                </div>
            </Section>

            <div className="mt-8">
                <button 
                    onClick={() => setIsLogoutModalOpen(true)}
                    className="w-full flex items-center justify-center py-3 px-4 text-red-600 font-bold bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                >
                    <ArrowRightOnRectangleIcon className="h-6 w-6 mr-2" />
                    Sair da Conta
                </button>
            </div>

            <Modal isOpen={isLogoutModalOpen} onClose={() => setIsLogoutModalOpen(false)} title="Confirmar Saída">
                <p className="mb-6 text-slate-600">Você tem certeza que deseja sair da sua conta?</p>
                <div className="flex justify-end space-x-4">
                    <Button variant="secondary" onClick={() => setIsLogoutModalOpen(false)}>Cancelar</Button>
                    <Button variant="danger" onClick={handleLogout}>Sair</Button>
                </div>
            </Modal>

            <Modal isOpen={!!categoryToDelete} onClose={() => setCategoryToDelete(null)} title="Confirmar Exclusão">
                <p className="mb-6 text-slate-600">
                    Você tem certeza que deseja excluir a categoria "<strong>{categoryToDelete?.name}</strong>"?
                </p>
                <div className="flex justify-end space-x-4">
                    <Button variant="secondary" onClick={() => setCategoryToDelete(null)}>Cancelar</Button>
                    <Button variant="danger" onClick={confirmDeleteCategory}>Excluir</Button>
                </div>
            </Modal>
        </div>
    );
};

// --- APP ---
const App: React.FC = () => {
  return (
    <AuthProvider>
        <CategoriesProvider>
            <RouterWrapper />
        </CategoriesProvider>
    </AuthProvider>
  );
};

const RouterWrapper: React.FC = () => {
    const { loading } = useAuth();
    if(loading) return <AppContainer><div className="h-screen flex justify-center items-center"><Spinner /></div></AppContainer>;
    
    return (
        <BillsProvider>
            <AppContainer>
                <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                    <Route path="/update-password" element={<UpdatePasswordPage />} />
                    <Route element={<ProtectedRoute />}>
                        <Route path="/subscribe" element={<SubscribePage />} />
                        <Route element={<MainLayout />}>
                            <Route path="/" element={<HomePage />} />
                            <Route path="/bills" element={<BillsListPage />} />
                            <Route path="/add-bill" element={<AddBillPage />} />
                            <Route path="/edit-bill/:id" element={<EditBillPage />} />
                            <Route path="/subscription" element={<SubscriptionPage />} />
                            <Route path="/profile" element={<ProfilePage />} />
                        </Route>
                    </Route>
                </Routes>
            </AppContainer>
        </BillsProvider>
    );
};


export default App;