import React from 'react';
import { Utensils, Leaf } from 'lucide-react';

const Logo: React.FC = () => {
  return (
    <div className="logo-container">
      <div className="logo-icon">
        <Utensils />
        <Leaf />
      </div>
      <h1 className="logo-text">HungerLink</h1>
    </div>
  );
};

export default Logo;