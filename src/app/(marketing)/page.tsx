"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  motion,
  useScroll,
  useTransform,
  AnimatePresence,
  useMotionValue,
  useSpring,
} from "framer-motion";
import {
  ArrowRight,
  TrendingUp,
  Users,
  Zap,
  CheckCircle,
  Star,
  Play,
  Sparkles,
  Target,
  BarChart3,
  Globe,
  ChevronLeft,
  ChevronRight,
  Rocket,
  Shield,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { testimonials } from "@/data/testimonials";
import { caseStudies } from "@/data/case-studies";
import { staggerContainer, staggerItem } from "@/lib/animations";

// 3D Tilt Card Component
function TiltCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(
    mouseYSpring,
    [-0.5, 0.5],
    ["7.5deg", "-7.5deg"],
  );
  const rotateY = useTransform(
    mouseXSpring,
    [-0.5, 0.5],
    ["-7.5deg", "7.5deg"],
  );

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;

    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Animated Counter Component
function AnimatedCounter({
  end,
  duration = 2000,
  suffix = "",
}: {
  end: number;
  duration?: number;
  suffix?: string;
}) {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (hasAnimated) return;

    const startTime = Date.now();
    const endTime = startTime + duration;

    const updateCount = () => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(easeProgress * end));

      if (now < endTime) {
        requestAnimationFrame(updateCount);
      } else {
        setCount(end);
        setHasAnimated(true);
      }
    };

    updateCount();
  }, [end, duration, hasAnimated]);

  return (
    <span>
      {count}
      {suffix}
    </span>
  );
}

// Floating particles component
function FloatingParticles() {
  const particles = Array.from({ length: 30 });

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-[rgb(var(--brand-primary))] rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0, 0.5, 0],
            scale: [0, 1, 0],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        />
      ))}
    </div>
  );
}

export default function HomePage() {
  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0]);

  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [activeTab, setActiveTab] = useState<"brands" | "creators">("brands");
  const featuredTestimonials = testimonials.filter((t) => t.featured);
  const featuredCaseStudies = caseStudies.filter((c) => c.featured).slice(0, 3);

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % featuredTestimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial(
      (prev) =>
        (prev - 1 + featuredTestimonials.length) % featuredTestimonials.length,
    );
  };

  const stats = [
    { label: "Active Creators", value: 50000, icon: Users, suffix: "+" },
    { label: "Partner Brands", value: 2500, icon: TrendingUp, suffix: "+" },
    { label: "Campaigns Delivered", value: 15000, icon: Zap, suffix: "+" },
    { label: "Combined Reach", value: 500, icon: Globe, suffix: "M+" },
  ];

  const features = [
    {
      title: "AI-Powered Matching",
      description:
        "Our advanced AI algorithms match you with the perfect influencers based on audience demographics, engagement rates, and brand alignment.",
      icon: Sparkles,
      color: "from-purple-500 to-pink-500",
    },
    {
      title: "Real-Time Analytics",
      description:
        "Track every metric that matters with real-time analytics, performance insights, and comprehensive ROI reporting.",
      icon: BarChart3,
      color: "from-blue-500 to-cyan-500",
    },
    {
      title: "Campaign Management",
      description:
        "From discovery to payment, manage your entire influencer marketing workflow in one powerful platform.",
      icon: Target,
      color: "from-orange-500 to-red-500",
    },
    {
      title: "Brand Safety First",
      description:
        "AI-powered content screening ensures every creator is vetted for brand safety and authenticity.",
      icon: Shield,
      color: "from-green-500 to-emerald-500",
    },
    {
      title: "Instant Payouts",
      description:
        "Fast, secure payments for creators with multiple payout options and automatic invoicing.",
      icon: Zap,
      color: "from-yellow-500 to-orange-500",
    },
    {
      title: "Award-Winning Support",
      description:
        "Dedicated account managers and 24/7 support to help you succeed at every step.",
      icon: Award,
      color: "from-red-500 to-pink-500",
    },
  ];

  const platformFeatures = {
    brands: [
      {
        icon: Target,
        title: "Discover Perfect Creators",
        description:
          "Find influencers who align with your brand values and target audience.",
      },
      {
        icon: BarChart3,
        title: "Track Campaign Performance",
        description: "Monitor ROI, engagement, and conversions in real-time.",
      },
      {
        icon: Shield,
        title: "Ensure Brand Safety",
        description: "AI-powered screening protects your brand reputation.",
      },
    ],
    creators: [
      {
        icon: Rocket,
        title: "Get Discovered by Brands",
        description: "Connect with brands that match your niche and values.",
      },
      {
        icon: BarChart3,
        title: "Grow Your Influence",
        description: "Access analytics and insights to boost your performance.",
      },
      {
        icon: Zap,
        title: "Get Paid Fast",
        description: "Secure, instant payments for all your collaborations.",
      },
    ],
  };

  const brands = [
    "Nike",
    "Adidas",
    "Samsung",
    "Sony",
    "Netflix",
    "Spotify",
    "Apple",
    "Google",
  ];

  return (
    <div className="flex flex-col overflow-hidden">
      {/* Hero Section - Ultra Modern with Interactive Elements */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Animated Mesh Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[rgb(var(--background))] via-[rgb(var(--brand-primary))]/5 to-[rgb(var(--brand-secondary))]/10" />

        {/* Floating Particles */}
        <FloatingParticles />

        {/* Large Gradient Orbs */}
        <motion.div
          className="absolute top-0 left-0 w-[600px] h-[600px] bg-[rgb(var(--brand-primary))]/20 rounded-full blur-[120px]"
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-0 right-0 w-[700px] h-[700px] bg-[rgb(var(--brand-secondary))]/20 rounded-full blur-[120px]"
          animate={{
            scale: [1, 1.3, 1],
            x: [0, -50, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
        />

        <div className="container relative z-10">
          <motion.div
            style={{ opacity: heroOpacity }}
            className="mx-auto max-w-6xl"
          >
            <motion.div
              initial="initial"
              animate="animate"
              variants={staggerContainer}
              className="text-center"
            >
              <motion.div variants={staggerItem} className="mb-8">
                <Badge
                  variant="primary"
                  className="text-base px-8 py-3 backdrop-blur-sm bg-[rgb(var(--brand-primary))]/10 border-[rgb(var(--brand-primary))]/20"
                >
                  <Rocket className="w-4 h-4 mr-2 inline" />
                  Trusted by 15,000+ Brands Worldwide
                </Badge>
              </motion.div>

              <motion.h1
                variants={staggerItem}
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tight mb-6 sm:mb-8 lg:mb-10 leading-[0.95]"
              >
                Where Brands Meet
                <br />
                <span className="gradient-text inline-block">Influence</span>
              </motion.h1>

              <motion.p
                variants={staggerItem}
                className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl text-[rgb(var(--muted))] mb-8 sm:mb-10 lg:mb-14 max-w-4xl mx-auto leading-relaxed font-light"
              >
                The most powerful platform for influencer marketing.
                <br className="hidden md:block" />
                Connect, collaborate, and create viral campaigns that drive real
                results.
              </motion.p>

              <motion.div
                variants={staggerItem}
                className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center mb-10 sm:mb-12 lg:mb-16"
              >
                <Link href="/sign-up">
                  <Button
                    size="lg"
                    variant="gradient"
                    className="text-base sm:text-lg lg:text-xl px-8 sm:px-10 lg:px-12 py-6 sm:py-7 lg:py-8 h-auto group rounded-full shadow-2xl shadow-[rgb(var(--brand-primary))]/30"
                  >
                    Start Free Trial
                    <ArrowRight className="ml-2 sm:ml-3 h-5 w-5 sm:h-6 sm:w-6 group-hover:translate-x-2 transition-transform" />
                  </Button>
                </Link>
                <Link href="#demo">
                  <Button
                    size="lg"
                    variant="outline"
                    className="text-base sm:text-lg lg:text-xl px-8 sm:px-10 lg:px-12 py-6 sm:py-7 lg:py-8 h-auto group rounded-full backdrop-blur-sm border-2"
                  >
                    <Play className="mr-2 sm:mr-3 h-5 w-5 sm:h-6 sm:w-6 group-hover:scale-125 transition-transform" />
                    Watch Demo
                  </Button>
                </Link>
              </motion.div>

              <motion.div
                variants={staggerItem}
                className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 lg:gap-10 text-xs sm:text-sm text-[rgb(var(--muted))]"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
                  No credit card required
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
                  14-day free trial
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
                  Cancel anytime
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-12 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 12, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-8 h-12 border-2 border-[rgb(var(--muted))]/30 rounded-full flex justify-center">
            <motion.div
              className="w-1.5 h-3 bg-[rgb(var(--brand-primary))] rounded-full mt-2"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
        </motion.div>
      </section>

      {/* Infinite Logo Marquee */}
      <section className="py-8 sm:py-12 lg:py-16 border-y border-[rgb(var(--border))] bg-[rgb(var(--surface))]/50 backdrop-blur-sm overflow-hidden">
        <div className="mb-4 sm:mb-6 lg:mb-8">
          <p className="text-center text-sm text-[rgb(var(--muted))] uppercase tracking-widest font-semibold">
            Trusted by Industry Leaders
          </p>
        </div>
        <div className="relative">
          <div className="flex animate-marquee whitespace-nowrap">
            {[...brands, ...brands].map((brand, i) => (
              <div
                key={i}
                className="mx-6 sm:mx-8 lg:mx-12 text-xl sm:text-2xl lg:text-3xl font-bold text-[rgb(var(--muted))]/40 hover:text-[rgb(var(--foreground))] transition-colors"
              >
                {brand}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Animated Stats Section with Hover Effects */}
      <section className="py-12 sm:py-16 lg:py-24 xl:py-32 bg-gradient-to-b from-[rgb(var(--background))] to-[rgb(var(--surface))]">
        <div className="container">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-12">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{
                  delay: index * 0.1,
                  duration: 0.6,
                  type: "spring",
                }}
                whileHover={{ scale: 1.05 }}
                className="text-center group cursor-pointer"
              >
                <motion.div
                  className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[rgb(var(--brand-primary))]/20 to-[rgb(var(--brand-secondary))]/20 mb-4 sm:mb-5 lg:mb-6 group-hover:from-[rgb(var(--brand-primary))]/30 group-hover:to-[rgb(var(--brand-secondary))]/30 transition-all"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <stat.icon className="h-7 w-7 sm:h-8 sm:w-8 lg:h-10 lg:w-10 text-[rgb(var(--brand-primary))]" />
                </motion.div>
                <div className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold mb-2 sm:mb-3 gradient-text">
                  <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-base text-[rgb(var(--muted))] group-hover:text-[rgb(var(--foreground))] transition-colors">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Tab-Based Platform Features */}
      <section className="py-12 sm:py-16 lg:py-24 xl:py-32 bg-[rgb(var(--background))]">
        <div className="container">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-8 sm:mb-12 lg:mb-16"
          >
            <motion.div variants={staggerItem}>
              <Badge variant="primary" className="mb-4 sm:mb-6">
                For Everyone
              </Badge>
            </motion.div>
            <motion.h2
              variants={staggerItem}
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 sm:mb-6 lg:mb-8"
            >
              Built for <span className="gradient-text">Brands</span> &{" "}
              <span className="gradient-text">Creators</span>
            </motion.h2>
          </motion.div>

          {/* Tab Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 mb-8 sm:mb-12 lg:mb-16">
            <button
              onClick={() => setActiveTab("brands")}
              className={`px-6 sm:px-8 lg:px-10 py-3 sm:py-4 lg:py-5 rounded-full text-base sm:text-lg font-semibold transition-all ${
                activeTab === "brands"
                  ? "bg-gradient-to-r from-[rgb(var(--brand-primary))] to-[rgb(var(--brand-secondary))] text-white shadow-xl shadow-[rgb(var(--brand-primary))]/30"
                  : "bg-[rgb(var(--surface))] text-[rgb(var(--muted))] hover:text-[rgb(var(--foreground))]"
              }`}
            >
              For Brands
            </button>
            <button
              onClick={() => setActiveTab("creators")}
              className={`px-6 sm:px-8 lg:px-10 py-3 sm:py-4 lg:py-5 rounded-full text-base sm:text-lg font-semibold transition-all ${
                activeTab === "creators"
                  ? "bg-gradient-to-r from-[rgb(var(--brand-primary))] to-[rgb(var(--brand-secondary))] text-white shadow-xl shadow-[rgb(var(--brand-primary))]/30"
                  : "bg-[rgb(var(--surface))] text-[rgb(var(--muted))] hover:text-[rgb(var(--foreground))]"
              }`}
            >
              For Creators
            </button>
          </div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 max-w-6xl mx-auto"
            >
              {platformFeatures[activeTab].map((feature) => (
                <TiltCard key={feature.title} className="h-full">
                  <Card className="h-full border-2 border-[rgb(var(--border))] hover:border-[rgb(var(--brand-primary))]/40 transition-all">
                    <CardContent className="p-6 sm:p-8 lg:p-10 text-center">
                      <div className="w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 rounded-full bg-gradient-to-br from-[rgb(var(--brand-primary))]/20 to-[rgb(var(--brand-secondary))]/20 flex items-center justify-center mb-4 sm:mb-5 lg:mb-6 mx-auto">
                        <feature.icon className="h-7 w-7 sm:h-8 sm:w-8 lg:h-10 lg:w-10 text-[rgb(var(--brand-primary))]" />
                      </div>
                      <h3 className="text-lg sm:text-xl lg:text-2xl font-bold mb-3 sm:mb-4">
                        {feature.title}
                      </h3>
                      <p className="text-sm sm:text-base lg:text-lg text-[rgb(var(--muted))] leading-relaxed">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                </TiltCard>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* Enhanced Features Grid with 3D Cards */}
      <section className="py-12 sm:py-16 lg:py-24 xl:py-32 bg-gradient-to-b from-[rgb(var(--surface))] to-[rgb(var(--background))]">
        <div className="container">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-10 sm:mb-12 lg:mb-16 xl:mb-20"
          >
            <motion.div variants={staggerItem}>
              <Badge variant="primary" className="mb-4 sm:mb-6">
                Platform Features
              </Badge>
            </motion.div>
            <motion.h2
              variants={staggerItem}
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 sm:mb-6 lg:mb-8"
            >
              Everything You Need to
              <br />
              <span className="gradient-text">Scale Your Influence</span>
            </motion.h2>
            <motion.p
              variants={staggerItem}
              className="text-base sm:text-lg lg:text-xl xl:text-2xl text-[rgb(var(--muted))] max-w-4xl mx-auto"
            >
              From discovery to deployment, our platform handles every aspect of
              influencer marketing with precision and ease.
            </motion.p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <TiltCard className="h-full">
                  <Card className="h-full border-2 border-transparent hover:border-[rgb(var(--brand-primary))]/20 transition-all duration-300 group overflow-hidden relative backdrop-blur-sm">
                    {/* Gradient Background on Hover */}
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
                    />

                    <CardContent className="p-6 sm:p-8 lg:p-10 relative z-10">
                      <motion.div
                        className="w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[rgb(var(--brand-primary))]/10 to-[rgb(var(--brand-secondary))]/10 flex items-center justify-center mb-4 sm:mb-6 lg:mb-8 group-hover:scale-110 transition-transform duration-300"
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.6 }}
                      >
                        <feature.icon className="h-7 w-7 sm:h-8 sm:w-8 lg:h-10 lg:w-10 text-[rgb(var(--brand-primary))]" />
                      </motion.div>
                      <h3 className="text-lg sm:text-xl lg:text-2xl font-bold mb-3 sm:mb-4">
                        {feature.title}
                      </h3>
                      <p className="text-sm sm:text-base lg:text-lg text-[rgb(var(--muted))] leading-relaxed">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                </TiltCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Video/Demo Section */}
      <section id="demo" className="py-32 bg-[rgb(var(--background))]">
        <div className="container">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative aspect-video rounded-3xl overflow-hidden bg-gradient-to-br from-[rgb(var(--brand-primary))]/20 to-[rgb(var(--brand-secondary))]/20 flex items-center justify-center group cursor-pointer border-2 border-[rgb(var(--border))]"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgxMzksMTkyLDI0NiwwLjEpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30" />

              <motion.div
                className="relative z-10 w-28 h-28 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border-4 border-white/20 group-hover:bg-white/20 transition-all duration-300"
                whileHover={{ scale: 1.2 }}
              >
                <Play className="h-14 w-14 text-white ml-1" />
              </motion.div>

              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center text-white p-8">
                  <h3 className="text-4xl font-bold mb-3">
                    See ViralFluencer in Action
                  </h3>
                  <p className="text-xl opacity-90">
                    Watch how we transform influencer marketing
                  </p>
                </div>
              </div>

              {/* Animated rings */}
              <motion.div
                className="absolute inset-0 border-4 border-white/10 rounded-3xl"
                animate={{ scale: [1, 1.05, 1], opacity: [0.1, 0.3, 0.1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Case Studies - Modern Grid with Hover Effects */}
      <section className="py-32 bg-gradient-to-b from-[rgb(var(--surface))] to-[rgb(var(--background))]">
        <div className="container">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-20"
          >
            <motion.div variants={staggerItem}>
              <Badge variant="primary" className="mb-6">
                Success Stories
              </Badge>
            </motion.div>
            <motion.h2
              variants={staggerItem}
              className="text-5xl md:text-7xl font-bold mb-8"
            >
              Real Results from
              <br />
              <span className="gradient-text">Real Brands</span>
            </motion.h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {featuredCaseStudies.map((study, index) => (
              <motion.div
                key={study.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
              >
                <Link href={`/case-studies/${study.id}`}>
                  <TiltCard className="h-full">
                    <Card className="h-full overflow-hidden group border-2 border-[rgb(var(--border))] hover:border-[rgb(var(--brand-primary))]/40 transition-all">
                      <div className="aspect-[16/10] bg-gradient-to-br from-[rgb(var(--brand-primary))]/10 to-[rgb(var(--brand-secondary))]/10 relative overflow-hidden">
                        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgxMzksMTkyLDI0NiwwLjEpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-50" />
                        <div className="absolute inset-0 flex items-center justify-center text-6xl font-bold opacity-10 group-hover:opacity-20 transition-opacity">
                          {study.client}
                        </div>
                      </div>
                      <CardContent className="p-8">
                        <Badge variant="outline" className="mb-4">
                          {study.industry}
                        </Badge>
                        <h3 className="text-2xl font-bold mb-3 group-hover:text-[rgb(var(--brand-primary))] transition-colors line-clamp-2">
                          {study.title}
                        </h3>
                        <p className="text-[rgb(var(--muted))] mb-6 line-clamp-2">
                          {study.summary}
                        </p>
                        <div className="grid grid-cols-2 gap-4">
                          {study.results.slice(0, 2).map((result) => (
                            <div
                              key={result.metric}
                              className="p-4 rounded-xl bg-[rgb(var(--surface))] group-hover:bg-[rgb(var(--surface-elevated))] transition-colors"
                            >
                              <div className="text-3xl font-bold gradient-text mb-1">
                                {result.value}
                              </div>
                              <div className="text-xs text-[rgb(var(--muted))]">
                                {result.metric}
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </TiltCard>
                </Link>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mt-16"
          >
            <Link href="/case-studies">
              <Button
                variant="outline"
                size="lg"
                className="text-lg px-10 py-7 h-auto rounded-full border-2"
              >
                View All Success Stories <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Testimonials - Interactive Slider with Better Design */}
      <section className="py-32 bg-[rgb(var(--background))]">
        <div className="container">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-20"
          >
            <motion.div variants={staggerItem}>
              <Badge variant="primary" className="mb-6">
                Testimonials
              </Badge>
            </motion.div>
            <motion.h2
              variants={staggerItem}
              className="text-5xl md:text-7xl font-bold mb-8"
            >
              Loved by <span className="gradient-text">Thousands</span>
            </motion.h2>
          </motion.div>

          <div className="max-w-5xl mx-auto relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentTestimonial}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.4 }}
                className="bg-gradient-to-br from-[rgb(var(--surface))] to-[rgb(var(--surface-elevated))] p-12 md:p-20 rounded-3xl border-2 border-[rgb(var(--border))] relative overflow-hidden"
              >
                {/* Decorative quote mark */}
                <div className="absolute top-8 left-8 text-8xl text-[rgb(var(--brand-primary))]/10 font-serif">
                  "
                </div>

                <div className="flex gap-2 mb-8 justify-center">
                  {[
                    ...Array(featuredTestimonials[currentTestimonial].rating),
                  ].map((_, i) => (
                    <Star
                      key={i}
                      className="h-7 w-7 fill-[rgb(var(--warning))] text-[rgb(var(--warning))]"
                    />
                  ))}
                </div>
                <blockquote className="text-2xl md:text-4xl font-medium text-center mb-10 leading-relaxed relative z-10">
                  {featuredTestimonials[currentTestimonial].content}
                </blockquote>
                <div className="text-center relative z-10">
                  <div className="font-bold text-xl mb-2">
                    {featuredTestimonials[currentTestimonial].author}
                  </div>
                  <div className="text-[rgb(var(--muted))] text-lg">
                    {featuredTestimonials[currentTestimonial].role} at{" "}
                    {featuredTestimonials[currentTestimonial].company}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex items-center justify-center gap-6 mt-12">
              <Button
                variant="outline"
                size="icon"
                onClick={prevTestimonial}
                className="rounded-full w-14 h-14 border-2"
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>

              <div className="flex gap-3">
                {featuredTestimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentTestimonial(index)}
                    className={`h-3 rounded-full transition-all ${
                      index === currentTestimonial
                        ? "w-12 bg-[rgb(var(--brand-primary))]"
                        : "w-3 bg-[rgb(var(--border))] hover:bg-[rgb(var(--muted))]"
                    }`}
                  />
                ))}
              </div>

              <Button
                variant="outline"
                size="icon"
                onClick={nextTestimonial}
                className="rounded-full w-14 h-14 border-2"
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA - Bold & Gradient */}
      <section className="py-32 md:py-48 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[rgb(var(--brand-primary))] via-[rgb(var(--brand-primary))] to-[rgb(var(--brand-secondary))]" />

        {/* Animated Background Pattern */}
        <motion.div
          className="absolute inset-0"
          animate={{
            backgroundPosition: ["0% 0%", "100% 100%"],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: "reverse",
          }}
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)",
            backgroundSize: "200% 200%",
          }}
        />

        {/* Floating Elements */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-white/20 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -20, 0],
                opacity: [0.2, 0.5, 0.2],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        <div className="container relative z-10">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center max-w-5xl mx-auto text-white"
          >
            <motion.h2
              variants={staggerItem}
              className="text-6xl md:text-8xl font-bold mb-10 leading-tight"
            >
              Ready to Go Viral?
            </motion.h2>
            <motion.p
              variants={staggerItem}
              className="text-2xl md:text-3xl mb-16 opacity-90 max-w-3xl mx-auto leading-relaxed"
            >
              Join thousands of brands and creators transforming their marketing
              with ViralFluencer.
            </motion.p>
            <motion.div
              variants={staggerItem}
              className="flex flex-col sm:flex-row gap-8 justify-center mb-16"
            >
              <Link href="/sign-up">
                <Button
                  size="lg"
                  className="bg-white text-[rgb(var(--brand-primary))] hover:bg-white/90 text-xl px-14 py-9 h-auto border-none shadow-2xl rounded-full font-semibold"
                >
                  Get Started Free <ArrowRight className="ml-3 h-7 w-7" />
                </Button>
              </Link>
              <Link href="/pricing">
                <Button
                  size="lg"
                  variant="outline"
                  className="text-white border-white/40 hover:bg-white/10 text-xl px-14 py-9 h-auto rounded-full border-2 backdrop-blur-sm"
                >
                  View Pricing
                </Button>
              </Link>
            </motion.div>

            <motion.div
              variants={staggerItem}
              className="flex flex-wrap items-center justify-center gap-10 text-base opacity-90"
            >
              <div className="flex items-center gap-3">
                <CheckCircle className="h-6 w-6" />
                Free 14-day trial
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-6 w-6" />
                No credit card needed
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-6 w-6" />
                Cancel anytime
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
