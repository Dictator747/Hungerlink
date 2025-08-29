import React from 'react';
import { Utensils, Leaf } from 'lucide-react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
}

const Logo: React.FC<LogoProps> = ({ size = 'md', animated = false }) => {
  const sizeClasses = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-3xl',
  };

  return (
    <div className={`flex items-center gap-2 ${sizeClasses[size]}`}>
      <div className={`relative ${animated ? 'animate-bounce' : ''}`}>
        <Utensils className="w-6 h-6 text-primary-500" />
        <Leaf className="w-4 h-4 text-secondary-500 absolute -top-1 -right-1" />
      </div>
      <h1 className="font-bold">HungerLink</h1>
    </div>
  );
};

export default Logo;
