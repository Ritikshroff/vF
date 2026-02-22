"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
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
  const [particles, setParticles] = useState<
    Array<{ left: number; top: number; duration: number; delay: number }>
  >([]);

  useEffect(() => {
    setParticles(
      Array.from({ length: 30 }, () => ({
        left: Math.random() * 100,
        top: Math.random() * 100,
        duration: 3 + Math.random() * 2,
        delay: Math.random() * 2,
      })),
    );
  }, []);

  if (particles.length === 0) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-[rgb(var(--brand-primary))] rounded-full"
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0, 0.5, 0],
            scale: [0, 1, 0],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
          }}
        />
      ))}
    </div>
  );
}

function FloatingDots() {
  const [dots, setDots] = useState<
    Array<{ left: number; top: number; duration: number; delay: number }>
  >([]);

  useEffect(() => {
    setDots(
      Array.from({ length: 20 }, () => ({
        left: Math.random() * 100,
        top: Math.random() * 100,
        duration: 3 + Math.random() * 2,
        delay: Math.random() * 2,
      })),
    );
  }, []);

  if (dots.length === 0) return null;

  return (
    <div className="absolute inset-0">
      {dots.map((d, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-white/20 rounded-full"
          style={{
            left: `${d.left}%`,
            top: `${d.top}%`,
          }}
          animate={{
            y: [0, -20, 0],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: d.duration,
            repeat: Infinity,
            delay: d.delay,
          }}
        />
      ))}
    </div>
  );
}

export default function HomePage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0]);

  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [activeTab, setActiveTab] = useState<"brands" | "creators">("brands");

  // Auto-redirect logged-in users to their dashboard
  useEffect(() => {
    if (!isLoading && user?.onboardingCompleted && user?.role) {
      router.replace(`/${user.role.toLowerCase()}/dashboard`);
    }
  }, [user, isLoading, router]);
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
      {/* Hero Section */}
      <section className="relative min-h-[85vh] md:min-h-screen flex items-center overflow-hidden pt-16 md:pt-0">
        {/* Animated Mesh Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[rgb(var(--background))] via-[rgb(var(--brand-primary))]/5 to-[rgb(var(--brand-secondary))]/10" />

        {/* Floating Particles - hidden on mobile for performance */}
        <div className="hidden md:block">
          <FloatingParticles />
        </div>

        {/* Large Gradient Orbs - smaller on mobile */}
        <div className="absolute top-0 left-0 w-[300px] h-[300px] md:w-[600px] md:h-[600px] bg-[rgb(var(--brand-primary))]/15 rounded-full blur-[80px] md:blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[350px] h-[350px] md:w-[700px] md:h-[700px] bg-[rgb(var(--brand-secondary))]/15 rounded-full blur-[80px] md:blur-[120px]" />

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
              <motion.div variants={staggerItem} className="mb-4 md:mb-8">
                <Badge
                  variant="primary"
                  className="text-xs md:text-sm px-4 md:px-6 py-1.5 md:py-2 backdrop-blur-sm bg-[rgb(var(--brand-primary))]/10 border-[rgb(var(--brand-primary))]/20"
                >
                  <Rocket className="w-3 h-3 md:w-4 md:h-4 mr-1.5 md:mr-2 inline" />
                  Trusted by 15,000+ Brands Worldwide
                </Badge>
              </motion.div>

              <motion.h1
                variants={staggerItem}
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight mb-4 md:mb-6 lg:mb-8 leading-[0.95]"
              >
                Where Brands Meet
                <br />
                <span className="gradient-text inline-block">Influence</span>
              </motion.h1>

              <motion.p
                variants={staggerItem}
                className="text-sm sm:text-base md:text-lg lg:text-xl text-[rgb(var(--muted))] mb-6 md:mb-10 lg:mb-12 max-w-3xl mx-auto leading-relaxed font-light px-4 md:px-0"
              >
                The most powerful platform for influencer marketing.
                <br className="hidden md:block" />
                Connect, collaborate, and create viral campaigns that drive real
                results.
              </motion.p>

              <motion.div
                variants={staggerItem}
                className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-6 md:mb-10 lg:mb-14 px-4 md:px-0"
              >
                <Link href="/sign-up">
                  <Button
                    size="lg"
                    variant="gradient"
                    className="text-sm md:text-base lg:text-lg px-6 md:px-8 lg:px-10 py-3 md:py-4 lg:py-5 h-auto rounded-full shadow-lg shadow-[rgb(var(--brand-primary))]/20 w-full sm:w-auto"
                  >
                    Start Free Trial
                    <ArrowRight className="ml-2 h-4 w-4 md:h-5 md:w-5" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button
                    size="lg"
                    variant="outline"
                    className="text-sm md:text-base lg:text-lg px-6 md:px-8 lg:px-10 py-3 md:py-4 lg:py-5 h-auto rounded-full backdrop-blur-sm border-2 w-full sm:w-auto"
                  >
                    Log In
                    <ArrowRight className="ml-2 h-4 w-4 md:h-5 md:w-5" />
                  </Button>
                </Link>
              </motion.div>

              <motion.div
                variants={staggerItem}
                className="flex flex-wrap items-center justify-center gap-3 md:gap-6 lg:gap-8 text-xs md:text-sm text-[rgb(var(--muted))]"
              >
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="h-3.5 w-3.5 md:h-4 md:w-4 text-green-500" />
                  No credit card required
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="h-3.5 w-3.5 md:h-4 md:w-4 text-green-500" />
                  14-day free trial
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="h-3.5 w-3.5 md:h-4 md:w-4 text-green-500" />
                  Cancel anytime
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll Indicator - hidden on mobile */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden md:block"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-10 border-2 border-[rgb(var(--muted))]/30 rounded-full flex justify-center">
            <motion.div
              className="w-1 h-2.5 bg-[rgb(var(--brand-primary))] rounded-full mt-2"
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

      {/* Animated Stats Section */}
      <section className="py-8 md:py-16 lg:py-24 bg-gradient-to-b from-[rgb(var(--background))] to-[rgb(var(--surface))]">
        <div className="container">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8 lg:gap-10">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{
                  delay: index * 0.1,
                  duration: 0.6,
                  type: "spring",
                }}
                className="text-center group"
              >
                <div className="inline-flex items-center justify-center w-10 h-10 md:w-14 md:h-14 lg:w-16 lg:h-16 rounded-xl md:rounded-2xl bg-gradient-to-br from-[rgb(var(--brand-primary))]/20 to-[rgb(var(--brand-secondary))]/20 mb-2 md:mb-4">
                  <stat.icon className="h-5 w-5 md:h-7 md:w-7 lg:h-8 lg:w-8 text-[rgb(var(--brand-primary))]" />
                </div>
                <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-1 md:mb-2 gradient-text">
                  <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-xs md:text-sm text-[rgb(var(--muted))]">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Tab-Based Platform Features */}
      <section className="py-8 md:py-16 lg:py-24 bg-[rgb(var(--background))]">
        <div className="container">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-6 md:mb-10 lg:mb-14"
          >
            <motion.div variants={staggerItem}>
              <Badge variant="primary" className="mb-3 md:mb-4">
                For Everyone
              </Badge>
            </motion.div>
            <motion.h2
              variants={staggerItem}
              className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold mb-3 md:mb-6"
            >
              Built for <span className="gradient-text">Brands</span> &{" "}
              <span className="gradient-text">Creators</span>
            </motion.h2>
          </motion.div>

          {/* Tab Buttons */}
          <div className="flex justify-center gap-2 md:gap-4 mb-6 md:mb-10 lg:mb-14">
            <button
              onClick={() => setActiveTab("brands")}
              className={`px-5 md:px-8 py-2.5 md:py-3.5 rounded-full text-sm md:text-base font-semibold transition-all ${
                activeTab === "brands"
                  ? "bg-gradient-to-r from-[rgb(var(--brand-primary))] to-[rgb(var(--brand-secondary))] text-white shadow-lg shadow-[rgb(var(--brand-primary))]/20"
                  : "bg-[rgb(var(--surface))] text-[rgb(var(--muted))] hover:text-[rgb(var(--foreground))]"
              }`}
            >
              For Brands
            </button>
            <button
              onClick={() => setActiveTab("creators")}
              className={`px-5 md:px-8 py-2.5 md:py-3.5 rounded-full text-sm md:text-base font-semibold transition-all ${
                activeTab === "creators"
                  ? "bg-gradient-to-r from-[rgb(var(--brand-primary))] to-[rgb(var(--brand-secondary))] text-white shadow-lg shadow-[rgb(var(--brand-primary))]/20"
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
              className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-6 max-w-5xl mx-auto"
            >
              {platformFeatures[activeTab].map((feature) => (
                <TiltCard key={feature.title} className="h-full">
                  <Card className="h-full border border-[rgb(var(--border))] hover:border-[rgb(var(--brand-primary))]/40 transition-all">
                    <CardContent className="p-4 md:p-6 lg:p-8 text-center">
                      <div className="w-10 h-10 md:w-14 md:h-14 rounded-full bg-gradient-to-br from-[rgb(var(--brand-primary))]/20 to-[rgb(var(--brand-secondary))]/20 flex items-center justify-center mb-3 md:mb-4 mx-auto">
                        <feature.icon className="h-5 w-5 md:h-7 md:w-7 text-[rgb(var(--brand-primary))]" />
                      </div>
                      <h3 className="text-sm md:text-lg lg:text-xl font-bold mb-2 md:mb-3">
                        {feature.title}
                      </h3>
                      <p className="text-xs md:text-sm lg:text-base text-[rgb(var(--muted))] leading-relaxed">
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

      {/* Features Grid */}
      <section className="py-8 md:py-16 lg:py-24 bg-gradient-to-b from-[rgb(var(--surface))] to-[rgb(var(--background))]">
        <div className="container">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-6 md:mb-10 lg:mb-16"
          >
            <motion.div variants={staggerItem}>
              <Badge variant="primary" className="mb-3 md:mb-4">
                Platform Features
              </Badge>
            </motion.div>
            <motion.h2
              variants={staggerItem}
              className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold mb-3 md:mb-5"
            >
              Everything You Need to
              <br />
              <span className="gradient-text">Scale Your Influence</span>
            </motion.h2>
            <motion.p
              variants={staggerItem}
              className="text-xs sm:text-sm md:text-base lg:text-lg text-[rgb(var(--muted))] max-w-3xl mx-auto px-4 md:px-0"
            >
              From discovery to deployment, our platform handles every aspect of
              influencer marketing with precision and ease.
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-5 lg:gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
              >
                <TiltCard className="h-full">
                  <Card className="h-full border border-transparent hover:border-[rgb(var(--brand-primary))]/20 transition-all duration-300 group overflow-hidden relative">
                    {/* Gradient Background on Hover */}
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
                    />

                    <CardContent className="p-3 md:p-5 lg:p-8 relative z-10">
                      <div className="w-9 h-9 md:w-12 md:h-12 lg:w-14 lg:h-14 rounded-xl md:rounded-2xl bg-gradient-to-br from-[rgb(var(--brand-primary))]/10 to-[rgb(var(--brand-secondary))]/10 flex items-center justify-center mb-2.5 md:mb-4 lg:mb-5">
                        <feature.icon className="h-4 w-4 md:h-6 md:w-6 lg:h-7 lg:w-7 text-[rgb(var(--brand-primary))]" />
                      </div>
                      <h3 className="text-xs sm:text-sm md:text-base lg:text-lg font-bold mb-1.5 md:mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-[10px] sm:text-xs md:text-sm lg:text-base text-[rgb(var(--muted))] leading-relaxed">
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

      {/* Video/Demo Section */}
      <section id="demo" className="py-10 md:py-20 lg:py-28 bg-[rgb(var(--background))]">
        <div className="container">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative aspect-video rounded-2xl md:rounded-3xl overflow-hidden bg-gradient-to-br from-[rgb(var(--brand-primary))]/20 to-[rgb(var(--brand-secondary))]/20 flex items-center justify-center group cursor-pointer border border-[rgb(var(--border))]"
            >
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgxMzksMTkyLDI0NiwwLjEpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30" />

              <div className="relative z-10 w-16 h-16 md:w-24 md:h-24 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border-2 md:border-4 border-white/20 group-hover:bg-white/20 transition-all duration-300">
                <Play className="h-7 w-7 md:h-10 md:w-10 text-white ml-0.5" />
              </div>

              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center text-white p-4 md:p-8">
                  <h3 className="text-lg md:text-2xl lg:text-3xl font-bold mb-1.5 md:mb-3">
                    See ViralFluencer in Action
                  </h3>
                  <p className="text-xs md:text-base opacity-90">
                    Watch how we transform influencer marketing
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Case Studies */}
      <section className="py-10 md:py-20 lg:py-28 bg-gradient-to-b from-[rgb(var(--surface))] to-[rgb(var(--background))]">
        <div className="container">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-8 md:mb-14"
          >
            <motion.div variants={staggerItem}>
              <Badge variant="primary" className="mb-3 md:mb-4">
                Success Stories
              </Badge>
            </motion.div>
            <motion.h2
              variants={staggerItem}
              className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold mb-3 md:mb-5"
            >
              Real Results from
              <br />
              <span className="gradient-text">Real Brands</span>
            </motion.h2>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-5 lg:gap-6">
            {featuredCaseStudies.map((study, index) => (
              <motion.div
                key={study.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`${index === 2 ? "col-span-2 md:col-span-1" : ""}`}
              >
                <Link href={`/case-studies/${study.id}`}>
                  <TiltCard className="h-full">
                    <Card className="h-full overflow-hidden group border border-[rgb(var(--border))] hover:border-[rgb(var(--brand-primary))]/40 transition-all">
                      <div className="aspect-[16/10] bg-gradient-to-br from-[rgb(var(--brand-primary))]/10 to-[rgb(var(--brand-secondary))]/10 relative overflow-hidden">
                        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgxMzksMTkyLDI0NiwwLjEpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-50" />
                        <div className="absolute inset-0 flex items-center justify-center text-2xl md:text-4xl lg:text-5xl font-bold opacity-10 group-hover:opacity-20 transition-opacity">
                          {study.client}
                        </div>
                      </div>
                      <CardContent className="p-3 md:p-5 lg:p-6">
                        <Badge variant="outline" className="mb-2 md:mb-3 text-[10px] md:text-xs">
                          {study.industry}
                        </Badge>
                        <h3 className="text-xs sm:text-sm md:text-lg lg:text-xl font-bold mb-1.5 md:mb-2 group-hover:text-[rgb(var(--brand-primary))] transition-colors line-clamp-2">
                          {study.title}
                        </h3>
                        <p className="text-[10px] sm:text-xs md:text-sm text-[rgb(var(--muted))] mb-3 md:mb-4 line-clamp-2 hidden sm:block">
                          {study.summary}
                        </p>
                        <div className="grid grid-cols-2 gap-2 md:gap-3">
                          {study.results.slice(0, 2).map((result) => (
                            <div
                              key={result.metric}
                              className="p-2 md:p-3 rounded-lg bg-[rgb(var(--surface))]"
                            >
                              <div className="text-sm md:text-xl lg:text-2xl font-bold gradient-text mb-0.5">
                                {result.value}
                              </div>
                              <div className="text-[9px] md:text-xs text-[rgb(var(--muted))]">
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
            className="text-center mt-8 md:mt-12"
          >
            <Link href="/case-studies">
              <Button
                variant="outline"
                size="lg"
                className="text-xs md:text-sm px-5 md:px-8 py-2.5 md:py-3.5 h-auto rounded-full border"
              >
                View All Success Stories <ArrowRight className="ml-1.5 h-3.5 w-3.5 md:h-4 md:w-4" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-10 md:py-20 lg:py-28 bg-[rgb(var(--background))]">
        <div className="container">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-6 md:mb-12"
          >
            <motion.div variants={staggerItem}>
              <Badge variant="primary" className="mb-3 md:mb-4">
                Testimonials
              </Badge>
            </motion.div>
            <motion.h2
              variants={staggerItem}
              className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold"
            >
              Loved by <span className="gradient-text">Thousands</span>
            </motion.h2>
          </motion.div>

          <div className="max-w-4xl mx-auto relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentTestimonial}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
                className="bg-gradient-to-br from-[rgb(var(--surface))] to-[rgb(var(--surface-elevated))] p-5 md:p-10 lg:p-14 rounded-2xl md:rounded-3xl border border-[rgb(var(--border))] relative overflow-hidden"
              >
                {/* Decorative quote mark */}
                <div className="absolute top-3 left-4 md:top-6 md:left-6 text-4xl md:text-6xl text-[rgb(var(--brand-primary))]/10 font-serif">
                  &ldquo;
                </div>

                <div className="flex gap-1 md:gap-1.5 mb-4 md:mb-6 justify-center">
                  {[
                    ...Array(featuredTestimonials[currentTestimonial].rating),
                  ].map((_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 md:h-5 md:w-5 fill-[rgb(var(--warning))] text-[rgb(var(--warning))]"
                    />
                  ))}
                </div>
                <blockquote className="text-sm md:text-lg lg:text-xl font-medium text-center mb-5 md:mb-8 leading-relaxed relative z-10">
                  {featuredTestimonials[currentTestimonial].content}
                </blockquote>
                <div className="text-center relative z-10">
                  <div className="font-bold text-sm md:text-base mb-1">
                    {featuredTestimonials[currentTestimonial].author}
                  </div>
                  <div className="text-[rgb(var(--muted))] text-xs md:text-sm">
                    {featuredTestimonials[currentTestimonial].role} at{" "}
                    {featuredTestimonials[currentTestimonial].company}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex items-center justify-center gap-4 md:gap-5 mt-6 md:mt-8">
              <Button
                variant="outline"
                size="icon"
                onClick={prevTestimonial}
                className="rounded-full w-9 h-9 md:w-10 md:h-10 border"
              >
                <ChevronLeft className="h-4 w-4 md:h-5 md:w-5" />
              </Button>

              <div className="flex gap-2">
                {featuredTestimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentTestimonial(index)}
                    className={`h-2 rounded-full transition-all ${
                      index === currentTestimonial
                        ? "w-8 bg-[rgb(var(--brand-primary))]"
                        : "w-2 bg-[rgb(var(--border))] hover:bg-[rgb(var(--muted))]"
                    }`}
                  />
                ))}
              </div>

              <Button
                variant="outline"
                size="icon"
                onClick={nextTestimonial}
                className="rounded-full w-9 h-9 md:w-10 md:h-10 border"
              >
                <ChevronRight className="h-4 w-4 md:h-5 md:w-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-14 md:py-24 lg:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[rgb(var(--brand-primary))] via-[rgb(var(--brand-primary))] to-[rgb(var(--brand-secondary))]" />

        {/* Subtle Background Pattern */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 50%, rgba(255,255,255,0.15) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(255,255,255,0.15) 0%, transparent 50%)",
          }}
        />

        {/* Floating Elements - hidden on mobile */}
        <div className="hidden md:block">
          <FloatingDots />
        </div>

        <div className="container relative z-10">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center max-w-4xl mx-auto text-white"
          >
            <motion.h2
              variants={staggerItem}
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 md:mb-6 leading-tight"
            >
              Ready to Go Viral?
            </motion.h2>
            <motion.p
              variants={staggerItem}
              className="text-sm md:text-base lg:text-lg mb-6 md:mb-10 opacity-90 max-w-2xl mx-auto leading-relaxed px-4 md:px-0"
            >
              Join thousands of brands and creators transforming their marketing
              with ViralFluencer.
            </motion.p>
            <motion.div
              variants={staggerItem}
              className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center mb-6 md:mb-10 px-4 md:px-0"
            >
              <Link href="/sign-up">
                <Button
                  size="lg"
                  className="bg-white text-[rgb(var(--brand-primary))] hover:bg-white/90 text-sm md:text-base px-6 md:px-8 py-3 md:py-4 h-auto border-none shadow-lg rounded-full font-semibold w-full sm:w-auto"
                >
                  Get Started Free <ArrowRight className="ml-2 h-4 w-4 md:h-5 md:w-5" />
                </Button>
              </Link>
              <Link href="/pricing">
                <Button
                  size="lg"
                  variant="outline"
                  className="text-white border-white/40 hover:bg-white/10 text-sm md:text-base px-6 md:px-8 py-3 md:py-4 h-auto rounded-full border backdrop-blur-sm w-full sm:w-auto"
                >
                  View Pricing
                </Button>
              </Link>
            </motion.div>

            <motion.div
              variants={staggerItem}
              className="flex flex-wrap items-center justify-center gap-4 md:gap-8 text-xs md:text-sm opacity-90"
            >
              <div className="flex items-center gap-1.5">
                <CheckCircle className="h-3.5 w-3.5 md:h-4 md:w-4" />
                Free 14-day trial
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle className="h-3.5 w-3.5 md:h-4 md:w-4" />
                No credit card needed
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle className="h-3.5 w-3.5 md:h-4 md:w-4" />
                Cancel anytime
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
