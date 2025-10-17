import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, StarIcon, Logo } from '../../components';
import { useAuth } from '../../hooks';

const plans = [
  {
    name: 'Mensal',
    price: 'R$9,90',
    link: 'https://pay.hotmart.com/G102370870Q?off=c5i06s85&checkoutMode=6',
    variant: 'primary' as const,
    featured: false,
  },
  {
    name: 'Semestral',
    price: 'R$49,90',
    link: 'https://pay.hotmart.com/G102370870Q?off=8iln4x60&checkoutMode=6',
    variant: 'success' as const,
    featured: true,
  },
  {
    name: 'Anual',
    price: 'R$99,90',
    link: 'https://pay.hotmart.com/G102370870Q?off=sfkzna33&checkoutMode=6',
    variant: 'primary' as const,
    featured: false,
  },
];

const SubscribePage: React.FC = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    signOut();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <Logo className="mb-6" />
      <h1 className="text-3xl font-bold text-gray-800 text-center mb-2">Escolha seu plano para liberar o acesso</h1>
      <p className="text-gray-600 text-center mb-10">Selecione o plano ideal para você e gerencie suas contas sem preocupação.</p>
      
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <Card key={plan.name} className={`flex flex-col text-center p-6 border-2 rounded-xl transition-transform transform hover:scale-105 ${plan.featured ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}>
            <div className="flex-grow">
                <StarIcon className="h-8 w-8 text-yellow-400 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-800 mb-2">{plan.name}</h2>
                <p className="text-4xl font-bold text-blue-600 mb-6">{plan.price}</p>
            </div>
            <a href={plan.link} target="_blank" rel="noopener noreferrer" className="mt-auto">
              <Button variant={plan.variant}>
                Assinar
              </Button>
            </a>
          </Card>
        ))}
      </div>

      <div className="mt-10">
        <button 
          onClick={handleLogout} 
          className="text-gray-600 hover:text-gray-800 hover:underline"
        >
          Sair e voltar para o login
        </button>
      </div>
    </div>
  );
};

export default SubscribePage;