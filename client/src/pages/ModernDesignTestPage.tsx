import { motion, useScroll, useTransform, useSpring, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Trophy, TrendingUp, Users, Zap, Shield, Globe, Star } from "lucide-react";
import ReactPlayer from "react-player";
import YouTube from "react-youtube";

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

      {/* Hero Section - 3D Passport */}
      <motion.section
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center px-6"
        style={{ y: yHero, opacity: opacityHero }}
      >
        <div className="max-w-6xl mx-auto text-center">
          {/* 3D Passport Card */}
          <motion.div
            className="relative mb-12"
            style={{ scale: scalePassport }}
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: heroInView ? 1 : 0, y: heroInView ? 0 : 100 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <motion.div
              className="w-80 h-48 mx-auto relative"
              style={{
                rotateX: mousePosition.y * 15,
                rotateY: mousePosition.x * 15,
                transformStyle: "preserve-3d",
              }}
              whileHover={{ scale: 1.05 }}
            >
              {/* Passport Card */}
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-2xl">
                {/* Holographic effect */}
                <motion.div
                  className="absolute inset-0 rounded-xl opacity-50"
                  style={{
                    background: `linear-gradient(45deg, 
                      transparent 30%, 
                      rgba(255,255,255,0.3) 50%, 
                      transparent 70%)`,
                    transform: `translateX(${mousePosition.x * 20}px)`,
                  }}
                />
                
                {/* Card Content */}
                <div className="relative z-10 p-6 h-full flex flex-col justify-between text-white">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-sm font-bold">PICKLE+ PASSPORT</h3>
                      <p className="text-xs opacity-80">Universal Player ID</p>
                    </div>
                    <motion.div
                      className="w-8 h-8 border border-white/30 rounded"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    >
                      <div className="w-full h-full bg-white/20 rounded flex items-center justify-center text-xs">
                        QR
                      </div>
                    </motion.div>
                  </div>
                  
                  <div>
                    <p className="text-xl font-bold mb-1">ALEX CHEN</p>
                    <p className="text-sm opacity-80">ID: HVGN0BW0</p>
                    <p className="text-sm opacity-80">Rating: 1247 PCP</p>
                  </div>
                </div>
              </div>
              
              {/* Card shadow/depth */}
              <div className="absolute inset-0 bg-black/20 rounded-xl transform translate-z-[-10px]" />
            </motion.div>
          </motion.div>

          {/* Kinetic Typography */}
          <motion.div className="mb-12">
            <motion.h1 className="text-6xl md:text-8xl font-black leading-tight mb-8 text-white">
              {["YOUR", "PICKLEBALL", "PASSPORT", "STARTS", "HERE"].map((word, i) => (
                <motion.span
                  key={word}
                  className={`inline-block mr-6 ${i === 1 ? 'text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-500' : ''}`}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: heroInView ? 1 : 0, y: heroInView ? 0 : 50 }}
                  transition={{ duration: 0.8, delay: i * 0.1 }}
                  whileHover={{ scale: 1.05, color: "#f97316" }}
                >
                  {word}
                  {i === 2 && <br />}
                </motion.span>
              ))}
            </motion.h1>
            
            <motion.p
              className="text-xl md:text-2xl text-slate-300 leading-relaxed mb-12 max-w-3xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: heroInView ? 1 : 0 }}
              transition={{ duration: 1, delay: 0.5 }}
            >
              Every player deserves a verified identity. Track your journey, connect with others, 
              and prove your skills with the universal pickleball passport system.
            </motion.p>
          </motion.div>

          {/* Magnetic CTA Buttons */}
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
                className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 text-lg font-medium relative overflow-hidden group"
              >
                <motion.span
                  className="relative z-10 flex items-center"
                  animate={{ x: isHovering ? 5 : 0 }}
                >
                  Get My Passport
                  <ArrowRight className="ml-2 h-5 w-5" />
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
                className="border-white/20 text-white hover:bg-white/10 px-8 py-4 text-lg font-medium backdrop-blur-sm"
              >
                Watch Demo
              </Button>
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
            Ready to Join the Revolution?
          </motion.h2>
          <motion.p
            className="text-xl text-orange-100 mb-8 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            Be among the first to get your verified pickleball passport and join the global community.
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
                  Claim My Passport Now
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