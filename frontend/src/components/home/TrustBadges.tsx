import React from 'react';
import { ShieldCheck, Truck, Clock, CreditCard } from 'lucide-react';

export const TrustBadges: React.FC = () => {
  const features = [
    {
      icon: <Truck className="text-[var(--accent)]" size={32} />,
      title: 'Free Shipping',
      description: 'On orders over ৳5000'
    },
    {
      icon: <ShieldCheck className="text-[var(--accent)]" size={32} />,
      title: 'Premium Quality',
      description: '100% authentic products'
    },
    {
      icon: <Clock className="text-[var(--accent)]" size={32} />,
      title: '24/7 Support',
      description: 'Dedicated customer service'
    },
    {
      icon: <CreditCard className="text-[var(--accent)]" size={32} />,
      title: 'Secure Payments',
      description: 'Multiple payment options'
    }
  ];

  return (
    <section className="py-12 bg-white relative">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="group flex flex-col items-center text-center gap-4 p-6 rounded-[2rem] bg-gray-50 hover:bg-white hover:shadow-2xl hover:shadow-primary/5 transition-all duration-300 border border-transparent hover:border-gray-100"
            >
              <div className="shrink-0 p-4 bg-white rounded-2xl shadow-sm group-hover:scale-110 group-hover:bg-accent group-hover:text-white transition-all duration-300">
                {React.cloneElement(feature.icon as React.ReactElement<{ className?: string; size?: number }>, { 
                  className: "group-hover:text-white transition-colors",
                  size: 28
                })}
              </div>
              <div>
                <h4 className="font-black text-primary text-sm md:text-base tracking-tight">{feature.title}</h4>
                <p className="text-[10px] md:text-xs font-bold text-muted uppercase tracking-widest mt-1 opacity-80">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
