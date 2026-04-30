import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, Star, Check, Plus } from 'lucide-react';
import { translations, Language } from './translations';

// --- Components ---

const Logo = ({ invert = false }: { invert?: boolean }) => (
  <div className={`flex flex-col items-start leading-none ${invert ? 'text-black' : ''}`}>
    <div className="font-bebas text-2xl tracking-tight">
      <span className={invert ? 'font-bold' : 'font-bold text-yellow'}>WHEY</span>
      <span className={invert ? 'font-light' : 'font-light text-white'}>CUP</span>
    </div>
    <div className={`font-mono text-[8px] tracking-[0.2em] mt-1 ${invert ? 'text-black' : 'text-yellow'}`}>
      PROTEIN • CAFFEINE • L-THEANINE
    </div>
  </div>
);

const SectionLabel = ({ children, yellow = false }: { children: React.ReactNode, yellow?: boolean }) => (
  <div className={`text-[11px] font-sans font-medium uppercase tracking-[0.2em] mb-4 ${yellow ? 'text-black' : 'text-yellow'}`}>
    {children}
  </div>
);

const Button = ({ 
  children, 
  variant = 'primary', 
  className = '',
  onClick
}: { 
  children: React.ReactNode, 
  variant?: 'primary' | 'secondary' | 'outline' | 'black',
  className?: string,
  onClick?: () => void
}) => {
  const base = "px-8 py-4 font-sans text-[12px] font-bold uppercase tracking-widest transition-all duration-300 relative overflow-hidden group sharp";
  const variants = {
    primary: "bg-yellow text-black hover:bg-yellow-dark",
    secondary: "bg-transparent text-yellow border border-yellow hover:bg-yellow hover:text-black",
    outline: "bg-transparent text-black border border-black hover:bg-black hover:text-white",
    black: "bg-black text-yellow border border-black hover:bg-transparent hover:text-black",
  };

  return (
    <button className={`${base} ${variants[variant]} ${className}`} onClick={onClick}>
      {children}
    </button>
  );
};

const CustomCursor = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'BUTTON' || target.tagName === 'A' || target.closest('button') || target.closest('a')) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseover', handleMouseOver);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseover', handleMouseOver);
    };
  }, []);

  return (
    <div 
      className="custom-cursor hidden md:block"
      style={{ 
        transform: `translate(${position.x - 6}px, ${position.y - 6}px) scale(${isHovering ? 2 : 1})`,
      }}
    />
  );
};

const CountUp = ({ end, duration = 1.5 }: { end: number, duration?: number }) => {
  const [count, setCount] = useState(0);
  const nodeRef = useRef<HTMLSpanElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (nodeRef.current) {
      observer.observe(nodeRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    let startTime: number | null = null;
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / (duration * 1000), 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, [isVisible, end, duration]);

  return <span ref={nodeRef}>{count}</span>;
};

// --- Main App ---

export default function App() {
  const [lang, setLang] = useState<Language>('en');
  const t = translations[lang];

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showStickyBar, setShowStickyBar] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
      
      const heroHeight = window.innerHeight;
      const shopElement = document.getElementById('shop');
      const shopOffset = shopElement?.offsetTop || 0;
      
      setShowStickyBar(window.scrollY > heroHeight && window.scrollY < shopOffset - 500);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 64;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
    setIsMenuOpen(false);
  };

  return (
    <div className="relative selection:bg-yellow selection:text-black overflow-x-hidden">
      <CustomCursor />

      {/* Sticky Add-to-Cart Bar */}
      <AnimatePresence>
        {showStickyBar && (
          <motion.div 
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            exit={{ y: -100 }}
            className="fixed top-0 left-0 w-full h-16 bg-yellow z-[60] flex items-center justify-between px-6 md:px-12 border-b border-black"
          >
            <div className="flex items-center gap-4">
              <div className="font-bebas text-black text-lg md:text-xl">
                {t.STICKY.PRODUCT}
              </div>
            </div>
            <Button variant="black" className="px-4 py-2 text-[10px] md:text-[11px]" onClick={() => scrollTo('shop')}>
              {t.STICKY.ADD_TO_CART}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <nav className={`fixed top-0 left-0 w-full h-16 z-50 transition-all duration-300 flex items-center justify-between px-6 md:px-12 ${scrolled ? 'bg-black border-b border-yellow-strong' : 'bg-transparent border-b border-white/5'}`}>
        <div className="cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <Logo />
        </div>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-10">
          {[
            { key: 'HOW_IT_WORKS', link: 'how-it-works' },
            { key: 'INGREDIENTS', link: 'ingredients' },
            { key: 'REVIEWS', link: 'reviews' },
            { key: 'FAQ', link: 'faq' }
          ].map((item) => (
            <button 
              key={item.key}
              onClick={() => scrollTo(item.link)}
              className="text-[11px] font-sans font-medium uppercase tracking-[0.15em] text-white hover:text-yellow transition-colors"
            >
              {(t.NAV as any)[item.key]}
            </button>
          ))}
          <div className="h-4 w-[1px] bg-white/20 mx-2" />
          <button 
            onClick={() => setLang(lang === 'en' ? 'fr' : 'en')}
            className="text-[11px] font-sans font-medium uppercase tracking-[0.15em] text-white/50 hover:text-white transition-colors"
          >
            {lang === 'en' ? 'FR | EN' : 'EN | FR'}
          </button>
        </div>

        <div className="flex items-center gap-4">
          <Button 
            variant="secondary" 
            className="hidden md:block py-2 px-6"
            onClick={() => scrollTo('shop')}
          >
            {t.NAV.SHOP_NOW}
          </Button>
          <button 
            className="md:hidden text-yellow"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, x: '100%' }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed inset-0 bg-black z-40 flex flex-col items-center justify-center gap-8 px-6 pt-16"
            >
              {[
                { key: 'HOW_IT_WORKS', link: 'how-it-works' },
                { key: 'INGREDIENTS', link: 'ingredients' },
                { key: 'REVIEWS', link: 'reviews' },
                { key: 'FAQ', link: 'faq' },
                { key: 'SHOP_NOW', link: 'shop' }
              ].map((item) => (
                <button 
                  key={item.key} 
                  onClick={() => scrollTo(item.link)}
                  className="text-4xl font-bebas text-white hover:text-yellow transition-colors"
                >
                  {(t.NAV as any)[item.key]}
                </button>
              ))}
              <Button variant="primary" className="w-full mt-4" onClick={() => scrollTo('shop')}>
                {t.HERO.BUTTON_SHOP}
              </Button>
              <button 
                onClick={() => {
                  setLang(lang === 'en' ? 'fr' : 'en');
                  setIsMenuOpen(false);
                }}
                className="text-xl font-bebas text-white/50 hover:text-white transition-colors uppercase tracking-[0.2em]"
              >
                {lang === 'en' ? 'CHANGER EN FRANÇAIS' : 'SWITCH TO ENGLISH'}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen bg-black flex flex-col justify-center px-6 md:px-[8vw] py-24 overflow-hidden">
        {/* Decorative elements */}
        
        <div className="max-w-4xl relative z-10">
          <SectionLabel>{t.HERO.LABEL}</SectionLabel>
          
          <h1 className="text-7xl md:text-[110px] leading-[0.85] mb-8 font-black">
            <span className="flex flex-wrap gap-x-[0.3em]">
              {t.HERO.WAKE_UP.split(' ').map((word, i) => (
                <motion.span 
                  key={word}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + (i * 0.2) }}
                  className="block text-white"
                >
                  {word}
                </motion.span>
              ))}
            </span>
            <span className="flex flex-wrap gap-x-[0.3em] relative">
              {[t.HERO.WHEYCUP].map((word, i) => (
                <motion.span 
                  key={word}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + (i * 0.2) }}
                  className="block text-yellow"
                >
                  {word}
                </motion.span>
              ))}
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ delay: 1.2, duration: 0.8 }}
                className="absolute -bottom-2 left-0 h-2 bg-yellow/20"
              />
            </span>
          </h1>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-lg md:text-[18px] text-[#aaaaaa] leading-relaxed max-w-[520px] mb-10 font-sans"
          >
            {t.HERO.SUBTITLE}
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Button variant="primary" onClick={() => scrollTo('shop')}>
              {t.HERO.BUTTON_SHOP}
            </Button>
            <Button variant="secondary" onClick={() => scrollTo('how-it-works')}>
              {t.HERO.BUTTON_HOW}
            </Button>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="mt-6 flex items-center gap-2 text-yellow text-[12px] font-sans font-medium"
          >
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
            </div>
            <span>{t.HERO.REVIEWS}</span>
          </motion.div>
        </div>

        {/* Floating Product Card (Desktop) */}
        <motion.div 
          initial={{ opacity: 0, rotate: 0, x: 100 }}
          animate={{ opacity: 1, rotate: 3, x: 0 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="hidden xl:flex absolute right-[10vw] top-1/2 -translate-y-1/2 w-[280px] h-[380px] border-2 border-yellow pointer-events-none flex-col p-8 items-start justify-center gap-6"
        >
          <div className="font-bebas text-5xl text-yellow">{t.HERO.WHEYCUP}</div>
          <div className="text-[11px] font-sans uppercase tracking-widest text-[#6a6a6a]">{t.SHOP.PRODUCT}</div>
          <div className="flex flex-col gap-3">
            {[t.INGREDIENTS.PROTEIN.DOSE, t.INGREDIENTS.CAFFEINE.DOSE, t.INGREDIENTS.THEANINE.DOSE].map((tag) => (
              <div key={tag} className="border border-yellow px-4 py-1.5 text-[10px] text-yellow inline-block uppercase font-sans">
                {tag}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <span className="text-[10px] text-yellow tracking-widest uppercase mb-1">{t.SCROLL}</span>
          <div className="w-[1px] h-12 bg-yellow/30 relative">
            <motion.div 
              animate={{ top: ['0%', '100%', '0%'] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className="absolute left-0 w-[1px] h-4 bg-yellow"
            />
            <div className="absolute -bottom-1 -left-1 w-2 h-2 border-r border-b border-yellow rotate-45" />
          </div>
        </div>
      </section>

      {/* Ingredients Story Section */}
      <section id="ingredients" className="bg-yellow py-24 px-6 md:px-12 text-black">
        <div className="max-w-7xl mx-auto">
          <SectionLabel yellow>{t.INGREDIENTS.LABEL}</SectionLabel>
          <h2 className="text-6xl md:text-8xl mb-4">{t.INGREDIENTS.TITLE}</h2>
          <p className="text-xl md:text-2xl mb-16 font-sans">{t.INGREDIENTS.SUBTITLE}</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <IngredientCard 
              num="01" 
              name={t.INGREDIENTS.PROTEIN.NAME} 
              dose={t.INGREDIENTS.PROTEIN.DOSE}
              body={t.INGREDIENTS.PROTEIN.BODY}
              bottom={t.INGREDIENTS.PROTEIN.BOTTOM}
              delay={0}
            />
            <IngredientCard 
              num="02" 
              name={t.INGREDIENTS.CAFFEINE.NAME} 
              dose={t.INGREDIENTS.CAFFEINE.DOSE}
              body={t.INGREDIENTS.CAFFEINE.BODY}
              bottom={t.INGREDIENTS.CAFFEINE.BOTTOM}
              delay={0.1}
            />
            <IngredientCard 
              num="03" 
              name={t.INGREDIENTS.THEANINE.NAME} 
              dose={t.INGREDIENTS.THEANINE.DOSE}
              body={t.INGREDIENTS.THEANINE.BODY}
              bottom={t.INGREDIENTS.THEANINE.BOTTOM}
              delay={0.2}
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="bg-black py-24 px-6 md:px-12 text-white">
        <div className="max-w-7xl mx-auto">
          <SectionLabel>{t.HOW.LABEL}</SectionLabel>
          <h2 className="text-5xl md:text-7xl mb-20 max-w-2xl">{t.HOW.TITLE}</h2>

          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-8 mb-20">
            {/* Desktop Connectors */}
            <div className="hidden md:block absolute top-[24px] left-[15%] w-[70%] h-[1px] border-t border-dashed border-yellow opacity-30 z-0" />
            
            <StepItem 
              num="01" 
              title={t.HOW.STEP_1.TITLE} 
              description={t.HOW.STEP_1.DESC}
            />
            <StepItem 
              num="02" 
              title={t.HOW.STEP_2.TITLE} 
              description={t.HOW.STEP_2.DESC}
            />
            <StepItem 
              num="03" 
              title={t.HOW.STEP_3.TITLE} 
              description={t.HOW.STEP_3.DESC}
            />
          </div>

          <div className="bg-yellow p-8 md:p-12 text-center border-y border-black">
            <h3 className="text-3xl md:text-4xl text-black">{t.HOW.CALLOUT}</h3>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section id="reviews" className="bg-yellow py-24 px-6 md:px-12 text-black">
        <div className="max-w-7xl mx-auto">
          <SectionLabel yellow>{t.REVIEWS.LABEL}</SectionLabel>
          <h2 className="text-5xl md:text-7xl mb-12">
            <CountUp end={312} /> {t.REVIEWS.TITLE}
          </h2>

          <div className="flex items-center gap-6 mb-16">
            <div className="text-8xl md:text-9xl font-bebas">4.9</div>
            <div className="text-sm md:text-base font-sans font-medium tracking-widest uppercase">
              {t.REVIEWS.SUMMARY} <CountUp end={312} /> {t.REVIEWS.VERIFIED}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <ReviewCard 
              quote={t.REVIEWS.QUOTE_1}
              author={t.REVIEWS.AUTHOR_1}
              verifiedBadge={t.REVIEWS.VERIFIED_PURCHASE}
            />
            <ReviewCard 
              quote={t.REVIEWS.QUOTE_2}
              author={t.REVIEWS.AUTHOR_2}
              verifiedBadge={t.REVIEWS.VERIFIED_PURCHASE}
            />
            <ReviewCard 
              quote={t.REVIEWS.QUOTE_3}
              author={t.REVIEWS.AUTHOR_3}
              verifiedBadge={t.REVIEWS.VERIFIED_PURCHASE}
            />
          </div>

          <button className="text-[12px] font-sans font-bold uppercase tracking-widest border-b border-black pb-1 hover:pb-2 transition-all">
            {t.REVIEWS.READ_ALL}
          </button>
        </div>
      </section>

      {/* Shop Section */}
      <section id="shop" className="bg-[#0f0f0f] py-24 px-6 md:px-12 text-white border-y border-yellow-strong">
        <div className="max-w-7xl mx-auto">
          <SectionLabel>{t.SHOP.LABEL}</SectionLabel>
          <h2 className="text-6xl md:text-8xl mb-16">{t.SHOP.TITLE}</h2>

          <div className="max-w-3xl mx-auto border border-yellow-strong">
            {/* Card 1 - Cappuccino */}
            <div 
              className={`relative p-8 md:p-16 transition-all duration-500 bg-[#111111] group overflow-hidden`}
            >
              <div className="absolute top-0 right-0 bg-yellow text-black px-4 py-1.5 text-[10px] font-bold tracking-widest uppercase z-20">
                {t.SHOP.POPULAR}
              </div>
              <h3 className="text-5xl md:text-6xl mb-8">{t.SHOP.PRODUCT}</h3>
              
              <ul className="space-y-4 mb-10 text-sm font-sans">
                {t.SHOP.FEATURES.map(item => (
                  <li key={item} className="flex items-center gap-3">
                    <Check size={16} className="text-yellow" />
                    <span className="opacity-90">{item}</span>
                  </li>
                ))}
              </ul>

              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-6xl font-bebas text-yellow">{t.SHOP.PRICE} <span className="text-lg">{t.SHOP.CAD}</span></span>
              </div>
              <p className="text-[12px] opacity-50 mb-8 font-sans tracking-widest uppercase">{t.SHOP.PER_SERVING}</p>

              <Button variant="primary" className="w-full py-5 text-xl font-bebas tracking-normal" onClick={() => window.open('https://buy.stripe.com/test_...', '_blank')}>{t.SHOP.ADD_TO_CART}</Button>
              
              <div className="mt-4 text-center">
                <button className="text-[11px] text-yellow font-sans uppercase tracking-widest hover:underline underline-offset-4">
                  {t.SHOP.SUBSCRIBE}
                </button>
              </div>
            </div>
          </div>

          <div className="mt-20 pt-8 border-t border-yellow-strong grid grid-cols-2 lg:grid-cols-4 gap-6 text-yellow text-[10px] font-sans font-bold tracking-[0.2em] uppercase opacity-70">
            {t.SHOP.BADGES.map(badge => (
              <span key={badge}>{badge}</span>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="bg-yellow py-24 px-6 md:px-12 text-black">
        <div className="max-w-4xl mx-auto">
          <SectionLabel yellow>{t.FAQ.LABEL}</SectionLabel>
          <h2 className="text-6xl md:text-7xl mb-16">{t.FAQ.TITLE}</h2>

          <div className="space-y-0">
            <AccordionItem 
              question={t.FAQ.Q1} 
              answer={t.FAQ.A1}
            />
            <AccordionItem 
              question={t.FAQ.Q2} 
              answer={t.FAQ.A2}
            />
            <AccordionItem 
              question={t.FAQ.Q3} 
              answer={t.FAQ.A3}
            />
            <AccordionItem 
              question={t.FAQ.Q4} 
              answer={t.FAQ.A4}
            />
            <AccordionItem 
              question={t.FAQ.Q5} 
              answer={t.FAQ.A5}
            />
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="bg-yellow py-32 px-6 md:px-12 text-black text-center border-t border-black">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-7xl md:text-[96px] leading-[0.9] mb-4">
            {t.FINAL_CTA.WAKE_UP}<br />{t.FINAL_CTA.WHEYCUP}
          </h2>
          <p className="text-xl md:text-[18px] mb-12 font-sans">{t.FINAL_CTA.SUBTITLE}</p>
          <Button variant="black" className="px-12 py-6 text-sm" onClick={() => scrollTo('shop')}>
            {t.FINAL_CTA.BUTTON}
          </Button>
          <p className="mt-8 text-[12px] opacity-60 font-sans">{t.FINAL_CTA.SUBTEXT}</p>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="bg-black py-20 px-6 md:px-12 text-white border-t border-yellow-strong">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-12">
          {/* Left */}
          <div>
            <Logo />
            <p className="mt-4 text-[#aaaaaa] font-sans text-sm italic">{t.FOOTER.TAGLINE}</p>
            <p className="mt-8 text-[12px] text-[#aaaaaa] font-sans">{t.FOOTER.COPYRIGHT}</p>
          </div>

          {/* Center */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { key: 'SHOP_NOW', link: 'shop' },
              { key: 'HOW_IT_WORKS', link: 'how-it-works' },
              { key: 'INGREDIENTS', link: 'ingredients' },
              { key: 'REVIEWS', link: 'reviews' },
              { key: 'FAQ', link: 'faq' }
            ].map(item => (
              <button 
                key={item.key} 
                className="text-[12px] font-sans font-bold uppercase tracking-widest text-[#aaaaaa] hover:text-yellow transition-colors text-left"
                onClick={() => scrollTo(item.link)}
              >
                {(t.NAV as any)[item.key]}
              </button>
            ))}
          </div>

          {/* Right */}
          <div>
            <div className="flex gap-4 mb-8 text-[12px] font-sans font-bold tracking-widest text-yellow">
              <span>IG</span> <span>TK</span> <span>FB</span>
            </div>
            <div className="flex">
              <input 
                type="email" 
                placeholder={t.FOOTER.EMAIL} 
                className="bg-black border border-yellow-strong px-4 py-3 text-[12px] font-sans text-white focus:outline-none w-full border-r-0 focus:border-yellow"
              />
              <button className="bg-yellow text-black px-6 py-3 text-[12px] font-sans font-bold uppercase tracking-widest hover:bg-yellow-dark transition-colors">
                {t.FOOTER.SUBSCRIBE}
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-white/10 text-center">
          <p className="text-[10px] text-[#aaaaaa] font-sans max-w-2xl mx-auto leading-relaxed">
            {t.FOOTER.DISCLAIMER}
          </p>
        </div>
      </footer>

      {/* Technical Status Bar (Bold Typography Theme) */}
      <div className="hidden lg:flex fixed bottom-0 left-0 right-0 h-16 bg-yellow-strong backdrop-blur-md items-center px-10 text-white border-t border-yellow z-[70]">
        <div className="font-bebas text-2xl flex-1 tracking-tight">
          {t.STATUS_BAR.FORMULA} <span className="text-white">{t.STATUS_BAR.PROTEIN}</span> + <span className="text-white">{t.STATUS_BAR.CAFFEINE}</span> + <span className="text-white">{t.STATUS_BAR.THEANINE}</span>
        </div>
        <div className="flex gap-12 font-sans">
          <div className="flex flex-col">
            <span className="font-mono text-[9px] font-bold text-yellow uppercase tracking-[0.2em]">Step 01</span>
            <span className="text-[10px] uppercase font-black text-white">{t.STATUS_BAR.STEP_1}</span>
          </div>
          <div className="flex flex-col">
            <span className="font-mono text-[9px] font-bold text-yellow uppercase tracking-[0.2em]">Step 02</span>
            <span className="text-[10px] uppercase font-black text-white">{t.STATUS_BAR.STEP_2}</span>
          </div>
          <div className="flex flex-col">
            <span className="font-mono text-[9px] font-bold text-yellow uppercase tracking-[0.2em]">Step 03</span>
            <span className="text-[10px] uppercase font-black text-white">{t.STATUS_BAR.STEP_3}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Specialized Components ---

const IngredientCard = ({ num, name, dose, body, bottom, delay }: any) => (
  <motion.div 
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay, duration: 0.8 }}
    className="bg-white border border-black p-8 relative flex flex-col h-full group hover:bg-offwhite transition-colors sharp"
  >
    <div className="font-bebas text-7xl text-black/10 absolute top-8 left-8">{num}</div>
    <div className="relative mt-auto">
      <h3 className="text-3xl mb-1">{name}</h3>
      <div className="text-[11px] font-sans font-bold tracking-widest mb-6">{dose}</div>
      <p className="text-[15px] leading-relaxed mb-10 font-sans text-black/80">{body}</p>
      <div className="text-sm italic font-sans">{bottom}</div>
    </div>
  </motion.div>
);

const StepItem = ({ num, title, description }: any) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className="relative z-10 flex flex-col items-center text-center"
  >
    <div className="w-12 h-12 bg-yellow text-black font-bebas text-2xl flex items-center justify-center mb-6 z-10">
      {num}
    </div>
    <h3 className="text-2xl text-yellow mb-2">{title}</h3>
    <p className="text-white/60 text-[15px] font-sans">{description}</p>
  </motion.div>
);

const ReviewCard = ({ quote, author, verifiedBadge }: any) => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.95 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true }}
    className="bg-black p-8 flex flex-col"
  >
    <div className="flex gap-0.5 mb-6 text-yellow">
      {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
    </div>
    <p className="text-white text-[16px] leading-relaxed mb-8 font-sans font-medium italic">"{quote}"</p>
    <div className="mt-auto">
      <div className="text-white/40 text-[12px] font-sans font-bold tracking-widest uppercase mb-1">{author}</div>
      <div className="flex items-center gap-2 text-[10px] font-sans font-bold tracking-widest text-[#4ade80]">
        <div className="w-1.5 h-1.5 bg-[#4ade80] rounded-full" />
        {verifiedBadge}
      </div>
    </div>
  </motion.div>
);

const AccordionItem = ({ question, answer }: { question: string, answer: string }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-black">
      <button 
        className="w-full flex items-center justify-between py-8 text-left group"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <span className="text-2xl md:text-3xl font-bebas">{question}</span>
        <motion.div 
          animate={{ rotate: isOpen ? 45 : 0 }}
          className="text-black"
        >
          <Plus size={32} />
        </motion.div>
      </button>
      <motion.div 
        animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
        className="overflow-hidden"
      >
        <p className="pb-8 text-[16px] md:text-lg leading-relaxed font-sans max-w-2xl text-black/80">
          {answer}
        </p>
      </motion.div>
    </div>
  );
};
