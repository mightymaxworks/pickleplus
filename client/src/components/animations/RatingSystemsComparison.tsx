import { useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Check, X, AlertCircle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';

interface RatingSystem {
  id: string;
  name: string;
  logo?: string;
  primaryColor: string;
  secondaryColor: string;
  description: string;
  features: {
    [key: string]: boolean | 'partial';
  };
  infoUrl?: string;
}

interface RatingSystemsComparisonProps {
  systems: RatingSystem[];
  featuresConfig: {
    id: string;
    label: string;
    tooltip?: string;
  }[];
  className?: string;
}

export function RatingSystemsComparison({ 
  systems, 
  featuresConfig, 
  className = '' 
}: RatingSystemsComparisonProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  const [hoveredSystem, setHoveredSystem] = useState<string | null>(null);
  
  return (
    <div 
      ref={ref} 
      className={`overflow-x-auto ${className}`}
    >
      <motion.div 
        className="min-w-[640px]"
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
      >
        {/* Header row */}
        <div className="grid grid-cols-[200px_repeat(auto-fit,minmax(120px,1fr))]">
          <div className="p-4 font-bold text-lg text-gray-700">
            <span>Rating Systems</span>
          </div>
          
          {systems.map((system, index) => (
            <motion.div 
              key={system.id}
              className={`p-4 rounded-t-lg text-center font-bold text-white relative ${
                hoveredSystem === system.id ? 'z-10' : 'z-0'
              }`}
              style={{
                backgroundColor: hoveredSystem === system.id ? system.secondaryColor : system.primaryColor,
                boxShadow: hoveredSystem === system.id ? '0 4px 20px rgba(0,0,0,0.2)' : 'none'
              }}
              onMouseEnter={() => setHoveredSystem(system.id)}
              onMouseLeave={() => setHoveredSystem(null)}
              initial={{ opacity: 0, y: -20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.1 + index * 0.1, duration: 0.5 }}
              whileHover={{ y: -5 }}
            >
              <div className="flex flex-col items-center gap-2">
                <span className="whitespace-nowrap">{system.name}</span>
                {system.logo && (
                  <img src={system.logo} alt={system.name} className="h-6 object-contain" />
                )}
              </div>
              
              {/* System description tooltip */}
              <motion.div 
                className={`absolute left-0 right-0 text-xs p-2 rounded-b-lg text-white bg-opacity-90 overflow-hidden ${
                  hoveredSystem === system.id ? 'block' : 'hidden'
                }`}
                style={{ backgroundColor: system.secondaryColor }}
                initial={{ height: 0 }}
                animate={{ height: hoveredSystem === system.id ? 'auto' : 0 }}
                transition={{ duration: 0.3 }}
              >
                <p className="mb-1">{system.description}</p>
                {system.infoUrl && (
                  <a 
                    href={system.infoUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1 text-white underline"
                  >
                    Learn more <ExternalLink size={10} />
                  </a>
                )}
              </motion.div>
            </motion.div>
          ))}
        </div>
        
        {/* Feature rows */}
        {featuresConfig.map((feature, featureIndex) => (
          <div 
            key={feature.id}
            className={`grid grid-cols-[200px_repeat(auto-fit,minmax(120px,1fr))] ${
              featureIndex % 2 === 0 ? 'bg-gray-50' : 'bg-white'
            }`}
          >
            <div className="p-4 font-medium text-gray-700 flex items-center">
              <span>{feature.label}</span>
              {feature.tooltip && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button className="ml-1">
                        <AlertCircle size={14} className="text-gray-400" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-sm text-sm">{feature.tooltip}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            
            {systems.map((system, systemIndex) => {
              const hasFeature = system.features[feature.id];
              const isPartial = hasFeature === 'partial';
              
              return (
                <motion.div 
                  key={`${system.id}-${feature.id}`}
                  className="p-4 text-center flex justify-center items-center"
                  onMouseEnter={() => setHoveredSystem(system.id)}
                  onMouseLeave={() => setHoveredSystem(null)}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={isInView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ 
                    delay: 0.3 + systemIndex * 0.1 + featureIndex * 0.05, 
                    duration: 0.5 
                  }}
                >
                  {hasFeature ? (
                    isPartial ? (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className={`text-yellow-500`}>
                              <AlertCircle size={22} />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Partially supported</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ) : (
                      <div 
                        className={`p-1 rounded-full`}
                        style={{ color: system.primaryColor }}
                      >
                        <Check size={22} strokeWidth={3} />
                      </div>
                    )
                  ) : (
                    <div className="text-gray-300">
                      <X size={22} />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        ))}
      </motion.div>
    </div>
  );
}