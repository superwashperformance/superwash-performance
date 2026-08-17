import React from 'react';

interface CurrencyDisplayProps {
  amount: number;
  currency?: 'USD' | 'VES'; // VES is Venezuelan Bolivar, USD is standard
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
  className?: string;
}

export const CurrencyDisplay: React.FC<CurrencyDisplayProps> = ({ 
  amount, 
  currency = 'USD', 
  size = 'md',
  className = ''
}) => {
  // Format the amount to ensure 2 decimal places
  const numAmount = typeof amount === 'number' ? amount : Number(amount) || 0;
  const formatted = numAmount.toFixed(2);
  const [integerPart, decimalPart] = formatted.split('.');

  const symbol = currency === 'USD' ? '$' : 'Bs';

  // Size mapping for integer and decimal parts
  const sizeClasses = {
    'sm': { int: 'text-sm', dec: 'text-[10px] -mt-0.5' },
    'md': { int: 'text-base', dec: 'text-xs mt-0' },
    'lg': { int: 'text-xl', dec: 'text-sm mt-0.5' },
    'xl': { int: 'text-2xl', dec: 'text-base mt-1' },
    '2xl': { int: 'text-3xl', dec: 'text-lg mt-1' },
    '3xl': { int: 'text-4xl', dec: 'text-xl mt-1.5' },
    '4xl': { int: 'text-5xl', dec: 'text-2xl mt-2' },
  };

  const { int, dec } = sizeClasses[size] || sizeClasses['md'];

  return (
    <span className={`inline-flex items-start font-sans font-extrabold tracking-tight ${className}`}>
      <span className={`${int} mr-1 font-bold`}>{currency === 'USD' ? 'US$' : symbol}</span>
      <span className={`${int}`}>{integerPart}</span>
      <sup className={`${dec} ml-[1px] font-extrabold opacity-90`}>{decimalPart}</sup>
    </span>
  );
};
