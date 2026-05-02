import React from 'react';

export const BrandStrip: React.FC = () => {
  // Using placeholders for brands
  const brands = [
    { name: 'Pampers', logo: 'https://placehold.co/120x60/ffffff/94a3b8?text=Brand+1' },
    { name: 'Huggies', logo: 'https://placehold.co/120x60/ffffff/94a3b8?text=Brand+2' },
    { name: 'Johnson', logo: 'https://placehold.co/120x60/ffffff/94a3b8?text=Brand+3' },
    { name: 'Avent', logo: 'https://placehold.co/120x60/ffffff/94a3b8?text=Brand+4' },
    { name: 'Chicco', logo: 'https://placehold.co/120x60/ffffff/94a3b8?text=Brand+5' },
    { name: 'Pigeon', logo: 'https://placehold.co/120x60/ffffff/94a3b8?text=Brand+6' },
  ];

  return (
    <section className="py-12 bg-gray-50/50 relative overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="max-w-xl mx-auto text-center mb-10">
          <h3 className="text-xs md:text-sm font-black text-muted uppercase tracking-[0.3em] mb-2">
            World-Class Partners
          </h3>
          <div className="h-1 w-12 bg-accent mx-auto rounded-full" />
        </div>
        
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
          {brands.map((brand, index) => (
            <div 
              key={index} 
              className="group relative px-6 py-4 bg-white rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-100/50"
            >
              <img 
                src={brand.logo} 
                alt={brand.name} 
                className="h-8 md:h-10 object-contain grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500" 
              />
              <div className="absolute inset-x-0 -bottom-1 h-1 bg-accent scale-x-0 group-hover:scale-x-50 transition-transform duration-500 rounded-full" />
            </div>
          ))}
        </div>
      </div>
      
      {/* Subtle Side Gradients */}
      <div className="absolute top-0 left-0 h-full w-20 bg-gradient-to-r from-gray-50/50 to-transparent z-10" />
      <div className="absolute top-0 right-0 h-full w-20 bg-gradient-to-l from-gray-50/50 to-transparent z-10" />
    </section>
  );
};
