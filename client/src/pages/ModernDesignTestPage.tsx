import { motion, useScroll, useTransform, useSpring, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Trophy, TrendingUp, Users, Zap, Shield, Globe, Star, Sparkles, Crown, Flame } from "lucide-react";
import ReactPlayer from "react-player";
import YouTube from "react-youtube";

// Trading Card Rarity Types
type CardRarity = 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';

interface TradingCard {
  id: string;
  playerName: string;
  rating: number;
  rarity: CardRarity;
  achievements: string[];
  cardNumber: string;
  foilType?: string;
}

// Card rarity configurations aligned to ranking points system
const rarityConfig: Record<CardRarity, {
  bgGradient: string;
  glowColor: string;
  borderColor: string;
  icon: React.ComponentType<any>;
  particles: boolean;
  holographic: boolean;
  pointsRange: string;
  tier: string;
}> = {
  common: {
    bgGradient: 'from-slate-600 to-slate-700',
    glowColor: 'shadow-slate-500/20',
    borderColor: 'border-slate-400/30',
    icon: Users,
    particles: false,
    holographic: false,
    pointsRange: '0-300',
    tier: 'Recreational',
  },
  rare: {
    bgGradient: 'from-blue-500 to-blue-600',
    glowColor: 'shadow-blue-500/40',
    borderColor: 'border-blue-400/50',
    icon: Shield,
    particles: false,
    holographic: false,
    pointsRange: '300-1000',
    tier: 'Competitive',
  },
  epic: {
    bgGradient: 'from-purple-500 to-purple-600',
    glowColor: 'shadow-purple-500/50',
    borderColor: 'border-purple-400/60',
    icon: Sparkles,
    particles: true,
    holographic: true,
    pointsRange: '1000-1800',
    tier: 'Elite',
  },
  legendary: {
    bgGradient: 'from-orange-500 to-orange-600',
    glowColor: 'shadow-orange-500/60',
    borderColor: 'border-orange-400/70',
    icon: Crown,
    particles: true,
    holographic: true,
    pointsRange: '1800+',
    tier: 'Professional',
  },
  mythic: {
    bgGradient: 'from-red-500 via-pink-500 to-purple-500',
    glowColor: 'shadow-red-500/70',
    borderColor: 'border-red-400/80',
    icon: Flame,
    particles: true,
    holographic: true,
    pointsRange: '1800+',
    tier: 'Professional',
  },
};

// Foil Pack Opening Component
function FoilPackOpening({ onReveal }: { onReveal: () => void }) {
  const [isOpening, setIsOpening] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);

  const handleOpenPack = () => {
    setIsOpening(true);
    setTimeout(() => {
      setIsRevealed(true);
      onReveal();
    }, 1500);
  };

  if (isRevealed) return null;

  return (
    <motion.div
      className="relative w-80 h-64 mx-auto cursor-pointer"
      onClick={handleOpenPack}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Enhanced Premium Foil Pack */}
      <motion.div
        className="absolute inset-0 rounded-xl shadow-2xl border-2 overflow-hidden"
        animate={isOpening ? { 
          rotateY: 180, 
          scale: 0.8,
          opacity: 0 
        } : {}}
        transition={{ duration: 1.5, ease: "easeInOut" }}
        style={{
          background: `linear-gradient(135deg, 
            #1a1a1a 0%,
            #2d2d2d 25%, 
            #1a1a1a 50%, 
            #2d2d2d 75%, 
            #1a1a1a 100%)`,
          borderImage: 'linear-gradient(45deg, #f97316, #fb923c, #f97316) 1',
        }}
      >
        {/* Premium Iridescent Foil Effect */}
        <motion.div
          className="absolute inset-0 rounded-xl opacity-40"
          animate={{
            background: [
              'linear-gradient(45deg, transparent 20%, rgba(249,115,22,0.8) 40%, rgba(251,146,60,0.9) 50%, rgba(249,115,22,0.8) 60%, transparent 80%)',
              'linear-gradient(135deg, transparent 20%, rgba(251,146,60,0.9) 40%, rgba(249,115,22,0.8) 50%, rgba(251,146,60,0.9) 60%, transparent 80%)',
              'linear-gradient(225deg, transparent 20%, rgba(249,115,22,0.8) 40%, rgba(251,146,60,0.9) 50%, rgba(249,115,22,0.8) 60%, transparent 80%)',
            ]
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        />
        
        {/* Embossed Security Strips */}
        <div className="absolute inset-0 rounded-xl">
          <div className="absolute top-4 left-4 right-4 h-0.5 bg-gradient-to-r from-transparent via-orange-400 to-transparent opacity-60" />
          <div className="absolute bottom-4 left-4 right-4 h-0.5 bg-gradient-to-r from-transparent via-orange-400 to-transparent opacity-60" />
        </div>
        
        {/* Premium Pack Content */}
        <div className="relative z-10 p-6 h-full flex flex-col justify-between text-white">
          <div className="text-center">
            <motion.div
              className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <Sparkles className="h-8 w-8 text-white" />
            </motion.div>
            <h3 className="text-lg font-bold mb-2 bg-gradient-to-r from-orange-300 to-orange-500 bg-clip-text text-transparent">
              TODAY'S DAILY PACK
            </h3>
            <p className="text-sm opacity-80">Special Community Rewards</p>
          </div>
          
          <div className="text-center">
            <motion.div
              className="text-xs opacity-70 mb-2"
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              ✨ Premium Collectibles Inside ✨
            </motion.div>
            <p className="text-sm font-semibold">Click to Reveal</p>
          </div>
        </div>
      </motion.div>
      
      {/* Opening effect particles */}
      {isOpening && (
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 15 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-orange-400 rounded-full"
              initial={{ 
                x: 160, 
                y: 132, 
                scale: 0, 
                opacity: 1 
              }}
              animate={{ 
                x: 160 + (Math.random() - 0.5) * 400,
                y: 132 + (Math.random() - 0.5) * 400,
                scale: [0, 1, 0],
                opacity: [1, 1, 0]
              }}
              transition={{ 
                duration: 1.5, 
                delay: i * 0.1,
                ease: "easeOut" 
              }}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}

// Individual Trading Card Component
function TradingCard({ 
  card, 
  mousePosition 
}: { 
  card: TradingCard; 
  mousePosition: { x: number; y: number } 
}) {
  const config = rarityConfig[card.rarity];
  const IconComponent = config.icon;

  return (
    <motion.div
      className="relative w-80 h-64 mx-auto"
      style={{
        rotateX: mousePosition.y * 10,
        rotateY: mousePosition.x * 10,
        transformStyle: "preserve-3d",
      }}
      whileHover={{ scale: 1.05 }}
      initial={{ opacity: 0, scale: 0.8, rotateY: 180 }}
      animate={{ opacity: 1, scale: 1, rotateY: 0 }}
      transition={{ duration: 1, ease: "easeOut" }}
    >
      {/* Card Glow Effect */}
      <div className={`absolute inset-0 rounded-xl blur-xl ${config.glowColor} opacity-50`} />
      
      {/* Main Card */}
      <div className={`absolute inset-0 bg-gradient-to-br ${config.bgGradient} rounded-xl border-2 ${config.borderColor} shadow-2xl overflow-hidden`}>
        
        {/* Holographic Effect for Higher Rarities */}
        {config.holographic && (
          <motion.div
            className="absolute inset-0 rounded-xl opacity-30"
            style={{
              background: `linear-gradient(45deg, 
                transparent 30%, 
                rgba(255,255,255,0.6) 50%, 
                transparent 70%)`,
              transform: `translateX(${mousePosition.x * 30}px) translateY(${mousePosition.y * 30}px)`,
            }}
          />
        )}
        
        {/* Particle Effects for Epic+ */}
        {config.particles && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl">
            {Array.from({ length: 8 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-white rounded-full opacity-60"
                animate={{
                  x: [0, Math.random() * 320, 0],
                  y: [0, Math.random() * 256, 0],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  repeat: Infinity,
                  delay: i * 0.5,
                  ease: "easeInOut",
                }}
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
              />
            ))}
          </div>
        )}
        
        {/* Card Content */}
        <div className="relative z-10 p-6 h-full flex flex-col justify-between text-white">
          {/* Header */}
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <IconComponent className="h-4 w-4" />
                <span className="text-xs font-bold uppercase tracking-wide">
                  {card.rarity}
                </span>
              </div>
              <p className="text-xs opacity-80">{card.cardNumber}</p>
            </div>
            <motion.div
              className="w-8 h-8 border border-white/30 rounded bg-white/10 flex items-center justify-center"
              animate={{ rotate: card.rarity === 'mythic' ? 360 : 0 }}
              transition={{ 
                duration: card.rarity === 'mythic' ? 4 : 0, 
                repeat: card.rarity === 'mythic' ? Infinity : 0, 
                ease: "linear" 
              }}
            >
              <div className="text-xs font-bold">
                {card.rating >= 1800 ? '⭐' : card.rating >= 1000 ? '🏆' : '🎯'}
              </div>
            </motion.div>
          </div>
          
          {/* Player Info */}
          <div className="text-center">
            <motion.h3 
              className="text-xl font-bold mb-2"
              animate={card.rarity === 'mythic' ? {
                textShadow: [
                  '0 0 5px rgba(255,255,255,0.5)',
                  '0 0 20px rgba(255,255,255,0.8)',
                  '0 0 5px rgba(255,255,255,0.5)',
                ]
              } : {}}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {card.playerName}
            </motion.h3>
            <p className="text-lg font-semibold mb-1">{card.rating} PCP</p>
            <div className="flex flex-wrap gap-1 justify-center">
              {card.achievements.slice(0, 2).map((achievement, i) => (
                <span key={i} className="text-xs bg-white/20 px-2 py-1 rounded">
                  {achievement}
                </span>
              ))}
            </div>
          </div>
          
          {/* Footer */}
          <div className="text-center">
            <p className="text-xs opacity-70">PICKLE+ TRADING CARDS</p>
          </div>
        </div>
      </div>
      
      {/* Card depth shadow */}
      <div className="absolute inset-0 bg-black/30 rounded-xl transform translate-z-[-10px]" />
    </motion.div>
  );
}

// Main Trading Card Showcase Component
function TradingCardShowcase({ 
  mousePosition 
}: { 
  mousePosition: { x: number; y: number } 
}) {
  const [showPack, setShowPack] = useState(true);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  
  // Sample passport cards aligned to ranking points tiers
  const sampleCards: TradingCard[] = [
    {
      id: '1',
      playerName: 'ALEX CHEN',
      rating: 1247,
      rarity: 'epic', // Elite tier (1000-1800 points)
      achievements: ['Elite Player', 'Tournament Regular'],
      cardNumber: '#001/1000',
    },
    {
      id: '2',
      playerName: 'SARAH MARTINEZ',
      rating: 892,
      rarity: 'rare', // Competitive tier (300-1000 points) 
      achievements: ['Team Captain', 'Consistent Player'],
      cardNumber: '#047/1000',
    },
    {
      id: '3',
      playerName: 'MIKE JOHNSON',
      rating: 1856,
      rarity: 'legendary', // Professional tier (1800+ points)
      achievements: ['Hall of Fame', 'Perfect Season'],
      cardNumber: '#001/100',
    },
    {
      id: '4',
      playerName: 'JAMIE RIVERA',
      rating: 156,
      rarity: 'common', // Recreational tier (0-300 points)
      achievements: ['New Player', 'Learning Fast'],
      cardNumber: '#156/1000',
    },
  ];

  const handlePackReveal = () => {
    setShowPack(false);
  };

  const cycleCard = () => {
    setCurrentCardIndex((prev) => (prev + 1) % sampleCards.length);
  };

  if (showPack) {
    return <FoilPackOpening onReveal={handlePackReveal} />;
  }

  return (
    <div className="relative">
      <TradingCard 
        card={sampleCards[currentCardIndex]} 
        mousePosition={mousePosition} 
      />
      
      {/* Card cycling controls */}
      <motion.div 
        className="flex justify-center gap-4 mt-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
      >
        <Button 
          variant="outline" 
          size="sm"
          onClick={cycleCard}
          className="border-white/20 text-white hover:bg-white/10"
        >
          View Next Card
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setShowPack(true)}
          className="border-white/20 text-white hover:bg-white/10"
        >
          Open New Pack
        </Button>
      </motion.div>
      
      {/* Rarity indicator */}
      <motion.div 
        className="text-center mt-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
      >
        <div className="text-center">
          <p className="text-sm text-slate-300 mb-2">
            <span className="font-bold capitalize text-orange-400">
              {rarityConfig[sampleCards[currentCardIndex].rarity].tier}
            </span> • {rarityConfig[sampleCards[currentCardIndex].rarity].pointsRange} points
          </p>
          <p className="text-xs text-slate-400">
            Passport Card Rarity: {sampleCards[currentCardIndex].rarity}
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export default function ModernDesignTestPage() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const heroRef = useRef(null);
  const statsRef = useRef(null);
  const videoRef = useRef(null);
  
  const { scrollYProgress } = useScroll();
  const heroInView = useInView(heroRef, { once: false });
  const statsInView = useInView(statsRef, { once: true });
  
  // Smooth spring animations
  const springConfig = { stiffness: 100, damping: 30, mass: 1 };
  const mouseX = useSpring(0, springConfig);
  const mouseY = useSpring(0, springConfig);
  
  // Scroll-based transforms
  const yHero = useTransform(scrollYProgress, [0, 0.3], [0, -100]);
  const opacityHero = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  const scalePassport = useTransform(scrollYProgress, [0, 0.2], [1, 1.1]);
  
  // Handle mouse movement for 3D effects
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      
      setMousePosition({
        x: (clientX - centerX) / centerX,
        y: (clientY - centerY) / centerY,
      });
      
      mouseX.set((clientX - centerX) * 0.1);
      mouseY.set((clientY - centerY) * 0.1);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  // Counter animation hook
  const useCounter = (end: number, duration: number = 2000) => {
    const [count, setCount] = useState(0);
    
    useEffect(() => {
      if (!statsInView) return;
      
      let startTime: number;
      const animate = (currentTime: number) => {
        if (!startTime) startTime = currentTime;
        const progress = Math.min((currentTime - startTime) / duration, 1);
        setCount(Math.floor(progress * end));
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      
      requestAnimationFrame(animate);
    }, [end, duration, statsInView]);
    
    return count;
  };

  const playerCount = useCounter(15000);
  const tournamentCount = useCounter(50);
  const countryCount = useCounter(25);

  // YouTube video options
  const videoOpts = {
    height: '400',
    width: '100%',
    playerVars: {
      autoplay: 0,
      controls: 1,
      modestbranding: 1,
      rel: 0,
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-orange-950 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Animated gradient mesh */}
        <motion.div
          className="absolute inset-0 opacity-30"
          style={{
            background: `radial-gradient(600px circle at ${mousePosition.x * 100 + 50}% ${mousePosition.y * 100 + 50}%, 
              rgba(249, 115, 22, 0.1), transparent 50%)`,
          }}
        />
        
        {/* Floating particles */}
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-orange-400 rounded-full opacity-20"
            animate={{
              x: [0, Math.random() * 100, 0],
              y: [0, Math.random() * 100, 0],
            }}
            transition={{
              duration: 10 + Math.random() * 20,
              repeat: Infinity,
              ease: "linear",
            }}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      {/* Hero Section - Passport Identity Focus */}
      <motion.section
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center px-6"
        style={{ y: yHero, opacity: opacityHero }}
      >
        <div className="max-w-6xl mx-auto text-center">
          {/* Passport Identity Messaging */}
          <motion.div className="mb-16">
            <motion.h1 className="text-5xl md:text-7xl font-bold leading-tight mb-8 text-white">
              {["YOUR", "UNIVERSAL", "PICKLEBALL", "PASSPORT"].map((word, i) => (
                <motion.span
                  key={word}
                  className={`inline-block mr-4 ${i === 2 ? 'text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-500' : ''}`}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: heroInView ? 1 : 0, y: heroInView ? 0 : 30 }}
                  transition={{ duration: 0.6, delay: i * 0.15 }}
                  whileHover={{ scale: 1.02 }}
                >
                  {word}
                  {i === 1 && <br />}
                </motion.span>
              ))}
            </motion.h1>
            
            <motion.p
              className="text-xl md:text-2xl text-slate-300 leading-relaxed mb-12 max-w-4xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: heroInView ? 1 : 0 }}
              transition={{ duration: 1, delay: 0.5 }}
            >
              The passport for everything pickleball. Your verified identity that opens doors to courts, tournaments, 
              and communities worldwide. Future-ready for your active lifestyle journey.
            </motion.p>
          </motion.div>

          {/* Primary CTA */}
          <motion.div
            className="flex flex-col sm:flex-row gap-6 justify-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: heroInView ? 1 : 0, y: heroInView ? 0 : 30 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onHoverStart={() => setIsHovering(true)}
              onHoverEnd={() => setIsHovering(false)}
            >
              <Button 
                size="lg" 
                className="bg-orange-500 hover:bg-orange-600 text-white px-12 py-6 text-xl font-bold relative overflow-hidden group"
              >
                <motion.span
                  className="relative z-10 flex items-center"
                  animate={{ x: isHovering ? 5 : 0 }}
                >
                  Claim My Passport
                  <ArrowRight className="ml-3 h-6 w-6" />
                </motion.span>
                
                {/* Magnetic effect background */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-orange-400 to-orange-600"
                  initial={{ scale: 0, opacity: 0 }}
                  whileHover={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />
              </Button>
            </motion.div>
            
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white/20 text-white hover:bg-white/10 px-8 py-6 text-lg font-medium backdrop-blur-sm"
              >
                Learn More
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Daily Pack Section - Below the Fold */}
      <motion.section 
        className="py-24 bg-slate-900/50 backdrop-blur-sm relative"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <div className="container mx-auto px-6">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Today's Community Pack
            </h2>
            <p className="text-lg text-slate-300 max-w-2xl mx-auto mb-8">
              Daily rewards and collectibles await! Login to claim and store your exclusive items.
            </p>
          </motion.div>

          {/* Trading Card Pack Experience */}
          <motion.div
            className="max-w-lg mx-auto"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <TradingCardShowcase mousePosition={mousePosition} />
          </motion.div>

          {/* Login Value Proposition */}
          <motion.div
            className="text-center mt-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
          >
            <p className="text-slate-400 mb-6">
              🎁 Preview one reward as guest • Login to claim all 5 items
            </p>
            <motion.div className="text-sm text-orange-400 font-medium">
              ⏰ This pack expires in 14:32:18
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Live Stats Section with Count-up Animation */}
      <motion.section
        ref={statsRef}
        className="py-24 relative"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <div className="container mx-auto px-6 text-center">
          <motion.p
            className="text-orange-400 text-sm font-medium uppercase tracking-wide mb-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Trusted by Players Worldwide
          </motion.p>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-2xl mx-auto">
            {[
              { count: playerCount, label: "Active Players", icon: Users, suffix: "+" },
              { count: tournamentCount, label: "Tournaments", icon: Trophy, suffix: "+" },
              { count: countryCount, label: "Countries", icon: Globe, suffix: "" },
            ].map(({ count, label, icon: Icon, suffix }, i) => (
              <motion.div
                key={label}
                className="text-center group"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ scale: 1.05 }}
              >
                <motion.div
                  className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-orange-500/30 transition-colors"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <Icon className="h-8 w-8 text-orange-400" />
                </motion.div>
                <motion.div
                  className="text-4xl font-bold text-white mb-2"
                  key={count}
                  initial={{ scale: 1 }}
                  animate={{ scale: statsInView ? [1, 1.1, 1] : 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {count.toLocaleString()}{suffix}
                </motion.div>
                <p className="text-slate-400">{label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Video Showcase Section */}
      <motion.section
        ref={videoRef}
        className="py-24 bg-black/20 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <div className="container mx-auto px-6">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              See It In Action
            </h2>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Watch how the Pickle+ passport system transforms the way players connect and compete.
            </p>
          </motion.div>

          <motion.div
            className="max-w-4xl mx-auto"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            {/* Video Player - Ready for YouTube URLs */}
            <div className="relative rounded-xl overflow-hidden shadow-2xl bg-slate-800/50 backdrop-blur-sm border border-slate-700/50">
              <div className="aspect-video flex items-center justify-center">
                {/* Placeholder for video - replace with actual YouTube URL */}
                <div className="text-center text-slate-400">
                  <div className="w-24 h-24 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ArrowRight className="h-12 w-12 ml-2" />
                  </div>
                  <p className="text-lg font-medium">Video Player Ready</p>
                  <p className="text-sm opacity-70">Insert YouTube URL when available</p>
                </div>
                
                {/* Uncomment when you have a YouTube video */}
                {/* <YouTube 
                  videoId="YOUR_VIDEO_ID_HERE" 
                  opts={videoOpts}
                  className="w-full h-full"
                /> */}
                
                {/* Alternative with ReactPlayer */}
                {/* <ReactPlayer
                  url="https://www.youtube.com/watch?v=YOUR_VIDEO_ID"
                  width="100%"
                  height="100%"
                  controls
                  light // Shows thumbnail until clicked
                /> */}
              </div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Interactive Features Grid */}
      <motion.section className="py-24">
        <div className="container mx-auto px-6">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              One Passport.
              <br />
              <span className="text-slate-400">Every Court.</span>
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
              The universal player identity system that connects courts, tournaments, and communities worldwide.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: "Verified Identity",
                description: "Your unique passport code connects your identity across all courts and tournaments with tamper-proof verification.",
                color: "from-blue-500 to-blue-600",
              },
              {
                icon: TrendingUp,
                title: "Match History",
                description: "Complete record of every match linked to your passport, creating an unbreakable chain of your pickleball journey.",
                color: "from-green-500 to-green-600",
              },
              {
                icon: Globe,
                title: "Universal Access",
                description: "One passport opens doors everywhere - courts recognize you instantly, tournaments accept your credentials automatically.",
                color: "from-purple-500 to-purple-600",
              },
              {
                icon: Zap,
                title: "Real-time Sync",
                description: "Instant updates across all platforms. Your achievements and ratings sync automatically wherever you play.",
                color: "from-yellow-500 to-yellow-600",
              },
              {
                icon: Star,
                title: "Achievement System",
                description: "Unlock badges, track milestones, and showcase your progress with our comprehensive achievement system.",
                color: "from-pink-500 to-pink-600",
              },
              {
                icon: Users,
                title: "Community Network",
                description: "Connect with players globally, find matches near you, and build lasting relationships in the pickleball community.",
                color: "from-indigo-500 to-indigo-600",
              },
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="group"
              >
                <Card className="border-slate-700/50 bg-slate-800/30 backdrop-blur-sm hover:bg-slate-800/50 transition-all duration-300 h-full">
                  <CardHeader className="pb-4">
                    <motion.div
                      className={`w-12 h-12 bg-gradient-to-r ${feature.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                      whileHover={{ rotate: [0, -10, 10, 0] }}
                      transition={{ duration: 0.5 }}
                    >
                      <feature.icon className="h-6 w-6 text-white" />
                    </motion.div>
                    <CardTitle className="text-xl font-bold text-white group-hover:text-orange-400 transition-colors">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-300 leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Final CTA with Confetti Effect */}
      <motion.section className="py-24 bg-gradient-to-r from-orange-500 to-orange-600 relative overflow-hidden">
        <div className="container mx-auto px-6 text-center relative z-10">
          <motion.h2
            className="text-4xl md:text-5xl font-bold text-white mb-6"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Ready for Your Passport?
          </motion.h2>
          <motion.p
            className="text-xl text-orange-100 mb-8 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            Join the universal pickleball identity system. Get verified, collect rewards, and connect with the global community.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                size="lg" 
                className="bg-white text-orange-600 hover:bg-orange-50 px-12 py-6 text-xl font-bold shadow-2xl relative overflow-hidden group"
                onClick={() => {
                  // Confetti effect could be added here
                  console.log("🎉 Passport registration started!");
                }}
              >
                <span className="relative z-10 flex items-center">
                  Create My Passport
                  <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    <ArrowRight className="ml-3 h-6 w-6" />
                  </motion.div>
                </span>
                
                {/* Animated background */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-white to-orange-50"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: "0%" }}
                  transition={{ duration: 0.3 }}
                />
              </Button>
            </motion.div>
          </motion.div>
        </div>
        
        {/* Animated background elements */}
        <div className="absolute inset-0 opacity-10">
          {Array.from({ length: 10 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-white rounded-full"
              animate={{
                x: [0, window.innerWidth || 1000],
                y: [0, (window.innerHeight || 800) * Math.random()],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 8,
                delay: i * 0.5,
                repeat: Infinity,
                ease: "linear",
              }}
              style={{
                left: -10,
                top: `${Math.random() * 100}%`,
              }}
            />
          ))}
        </div>
      </motion.section>
    </div>
  );
}