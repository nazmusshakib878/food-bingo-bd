import React, { useState, useEffect, useRef, Suspense, lazy } from 'react';
import foodsData from './data/foods.json';
import { Search, RefreshCcw, Check, ChevronDown } from 'lucide-react';

const PosterGenerator = lazy(() => import('./PosterGenerator'));

function App() {
  const [selectedFoods, setSelectedFoods] = useState([]);
  const [activeCategory, setActiveCategory] = useState('সব');
  const [searchQuery, setSearchQuery] = useState('');
  
  const bingoSectionRef = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem('foodBingoSelected');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const validIds = new Set(foodsData.map(f => f.id));
          const safeData = parsed.filter(id => validIds.has(id));
          setSelectedFoods(safeData);
        }
      } catch (e) {
        localStorage.removeItem('foodBingoSelected');
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('foodBingoSelected', JSON.stringify(selectedFoods));
    if (selectedFoods.length === foodsData.length && foodsData.length > 0) {
      triggerConfetti();
    }
  }, [selectedFoods]);

  const triggerConfetti = async () => {
    const duration = 3 * 1000;
    const end = Date.now() + duration;
    
    try {
      const confettiModule = await import('canvas-confetti');
      const confetti = confettiModule.default;

      const frame = () => {
        confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#0b3d2c', '#df2a38', '#d4af37']
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#0b3d2c', '#df2a38', '#d4af37']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
    } catch (e) {
      console.error('Confetti error', e);
    }
  };

  const categories = ['সব', ...new Set(foodsData.map(f => f.category))];

  const handleToggle = (id) => {
    setSelectedFoods(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const getBadge = (score) => {
    const percentage = foodsData.length > 0 ? (score / foodsData.length) * 100 : 0;
    if (percentage <= 30) return 'নতুন শিকারী 🌱';
    if (percentage <= 60) return 'খাবার প্রেমিক 😋';
    if (percentage <= 85) return 'ভোজন রসিক 🤤';
    if (percentage <= 99) return 'ভোজন বিলাসী বস 👑';
    return 'Food Bingo Champion 🏆';
  };

  const getScoreMessage = (score) => {
    const percentage = foodsData.length > 0 ? (score / foodsData.length) * 100 : 0;
    if (percentage <= 30) return 'বাংলাদেশের খাবারের জগৎ এখনো অনেক বাকি! 🍽️';
    if (percentage <= 60) return 'ভালোই খাওয়া হয়েছে! কিন্তু আরও অনেক স্বাদ অপেক্ষা করছে 😋';
    if (percentage <= 85) return 'আপনি সত্যিকারের ভোজন রসিক! 🔥';
    if (percentage <= 99) return 'আপনাকে থামানো কঠিন! 👑';
    return 'অবিশ্বাস্য! আপনি Food Bingo BD সম্পূর্ণ করেছেন! 🏆🇧🇩';
  };

  const handleReset = () => {
    if(window.confirm('আপনি কি সব বাছাই মুছে ফেলতে চান?')) {
      setSelectedFoods([]);
    }
  };

  const scrollToBingo = () => {
    bingoSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const filteredFoods = foodsData.filter(food => {
    const matchesCategory = activeCategory === 'সব' || food.category === activeCategory;
    const matchesSearch = food.nameBn.includes(searchQuery) || food.nameEn.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const score = selectedFoods.length;
  const progressPercent = foodsData.length > 0 ? (score / foodsData.length) * 100 : 0;

  return (
    <div className="min-h-screen bg-transparent font-bangla text-brand-dark pb-20">
      
      {/* 1. HERO SECTION */}
      <section className="relative pt-10 pb-8 px-6 max-w-5xl mx-auto flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-green/10 text-brand-green text-sm font-bold mb-6">
          <span>🇧🇩</span> {foodsData.length}টি বিখ্যাত বাংলাদেশি খাবার
        </div>
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-brand-green mb-4 leading-[1.1]">
          বাংলাদেশের কয়টা<br />খাবার খেয়েছেন?
        </h1>
        <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto mb-8">
          আপনি যেসব খাবার খেয়েছেন সেগুলো বেছে নিন, নিজের Food Bingo তৈরি করুন এবং বন্ধুদের সাথে শেয়ার করুন।
        </p>
        <button 
          onClick={scrollToBingo}
          className="bg-brand-red text-white text-base md:text-lg font-bold px-6 py-3 md:px-8 md:py-4 rounded-full hover:bg-red-700 hover:scale-105 transition-all shadow-lg shadow-brand-red/20 flex items-center gap-2"
        >
          খাবার বাছাই শুরু করুন <ChevronDown size={20} />
        </button>
      </section>

      {/* 2. 3-STEP EXPLANATION */}
      <section className="max-w-5xl mx-auto px-6 mb-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-gray-200">
          <div className="pt-6 md:pt-0">
            <div className="text-3xl font-bold text-gray-200 mb-2 font-sans">01</div>
            <h3 className="text-xl font-semibold text-brand-green">খাবার বাছাই করুন</h3>
          </div>
          <div className="pt-6 md:pt-0">
            <div className="text-3xl font-bold text-gray-200 mb-2 font-sans">02</div>
            <h3 className="text-xl font-semibold text-brand-green">নিজের পোস্টার সাজান</h3>
          </div>
          <div className="pt-6 md:pt-0">
            <div className="text-3xl font-bold text-gray-200 mb-2 font-sans">03</div>
            <h3 className="text-xl font-semibold text-brand-green">ডাউনলোড ও শেয়ার করুন</h3>
          </div>
        </div>
      </section>

      {/* 3. MAIN FOOD BINGO SECTION */}
      <section ref={bingoSectionRef} className="max-w-6xl mx-auto px-4 md:px-6 mb-16">
        
        {/* Sticky Score & Progress */}
        <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100 shadow-sm mb-6 -mx-4 md:-mx-6 px-4 md:px-6 py-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-row items-center justify-between gap-4">
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-brand-dark leading-none">যেসব খাবার খেয়েছি</h2>
                <div className="inline-flex items-center gap-1.5 mt-2 px-2.5 py-0.5 rounded-md bg-brand-green/10 text-brand-green text-sm font-bold">
                  {getBadge(score)}
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-4xl md:text-5xl font-black tracking-tight">
                  <span className="text-brand-green">{score}</span>
                  <span className="text-xl md:text-2xl font-bold text-brand-red ml-1">/ {foodsData.length}</span>
                </div>
              </div>
            </div>
            <div className="w-full h-2.5 bg-gray-100 rounded-full mt-4 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-brand-green via-brand-gold to-brand-red transition-all duration-500 ease-out rounded-full relative overflow-hidden" 
                style={{ width: `${progressPercent}%` }}
              >
                <div className="absolute inset-0 bg-white/20 w-full h-full animate-shimmer"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Controls: Search, Categories, Reset */}
        <div className="max-w-6xl mx-auto mb-8 flex flex-col gap-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative w-full md:w-96 flex-shrink-0">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all outline-none text-base font-medium placeholder:text-gray-400"
                placeholder="খাবারের নাম খুঁজুন..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <button 
              onClick={handleReset}
              className="hidden md:flex text-gray-500 hover:text-brand-red font-medium items-center gap-2 transition-colors px-4 py-2 rounded-lg hover:bg-red-50 border border-transparent hover:border-red-100"
            >
              <RefreshCcw size={16} /> সব মুছুন
            </button>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar snap-x relative w-full pr-4 md:pr-0">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`snap-start whitespace-nowrap px-4 py-2 rounded-lg text-sm font-semibold transition-all flex-shrink-0 ${
                  activeCategory === cat 
                    ? 'bg-brand-green text-white shadow-md shadow-brand-green/20' 
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-brand-green/30 hover:bg-brand-green/5'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <button 
            onClick={handleReset}
            className="md:hidden self-start text-gray-500 hover:text-brand-red font-bold flex items-center gap-1.5 transition-colors px-3 py-1.5 rounded-lg border border-gray-200 text-sm bg-white"
          >
            <RefreshCcw size={14} /> সব মুছুন
          </button>
        </div>

        {/* 6. FOOD CARD GRID */}
        {/* 6. FOOD CARD GRID */}
        <div className="max-w-6xl mx-auto grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 xl:grid-cols-8 gap-3 md:gap-4">
          {filteredFoods.map(food => {
            const isSelected = selectedFoods.includes(food.id);
            return (
              <button 
                key={food.id}
                onClick={() => handleToggle(food.id)}
                aria-pressed={isSelected}
                aria-label={food.nameBn}
                className={`food-card relative rounded-2xl p-2.5 border flex flex-col items-center justify-between text-center aspect-[4/5] overflow-hidden group focus:outline-none focus:ring-2 focus:ring-brand-gold focus:ring-offset-2
                  ${isSelected ? 'food-card-selected' : 'food-card-unselected'}`}
              >
                <div className="relative w-full aspect-square mb-1.5 overflow-hidden rounded-xl bg-gray-50 flex items-center justify-center">
                  <img 
                    src={food.image}
                    alt={food.nameBn}
                    loading="lazy"
                    onError={(e) => { e.target.style.display = 'none'; e.target.nextElementSibling.style.display = 'block'; }}
                    className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]
                      ${isSelected ? 'grayscale-0 opacity-100 blur-0' : 'grayscale opacity-[0.55] blur-[0.5px]'}`}
                  />
                  <div 
                    style={{ display: 'none' }}
                    className={`text-4xl md:text-5xl transition-all duration-300 ${isSelected ? 'scale-110 drop-shadow-md' : 'grayscale opacity-[0.55]'}`}
                  >
                    {food.emoji}
                  </div>
                  {!isSelected && (
                    <div className="absolute inset-0 bg-brand-cream/30 mix-blend-overlay pointer-events-none transition-opacity duration-300 group-hover:opacity-0"></div>
                  )}
                </div>
                
                <div className="mt-auto w-full flex flex-col items-center pb-0.5">
                  <span className={`text-[13px] md:text-[15px] font-semibold leading-[1.2] text-center w-[95%] line-clamp-2 ${isSelected ? 'text-brand-green font-bold' : 'text-gray-600'}`}>
                    {food.nameBn}
                  </span>
                  {food.region && (
                    <span className="text-[10px] text-gray-400 font-sans mt-0.5 truncate w-full px-1">
                      {food.region}
                    </span>
                  )}
                </div>

                {isSelected && (
                  <div className="absolute top-2 right-2 bg-brand-green text-white rounded-full p-1 shadow-md shadow-brand-green/30">
                    <Check size={14} strokeWidth={4} />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* 9. SCORE EXPERIENCE & 10. CELEBRATION */}
      <section className="max-w-3xl mx-auto px-6 mb-24">
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-soft border border-gray-100 text-center relative overflow-hidden">
          <h3 className="text-xl text-gray-500 font-semibold mb-2">আপনার Food Bingo Score</h3>
          <div className="text-6xl md:text-7xl font-bold text-brand-green mb-4">
            {score} <span className="text-3xl text-gray-400">/ {foodsData.length}</span>
          </div>
          <div className="text-2xl font-bold text-brand-red mb-4">{getBadge(score)}</div>
          <p className="text-lg text-gray-600">{getScoreMessage(score)}</p>
          
          {score === foodsData.length && foodsData.length > 0 && (
            <div className="absolute inset-0 bg-brand-gold/10 flex items-center justify-center pointer-events-none">
              <span className="text-9xl opacity-20">🏆</span>
            </div>
          )}
        </div>
      </section>

      {/* 11 & 12. POSTER CUSTOMIZATION & PREVIEW */}
      <Suspense fallback={<div className="text-center py-20 text-gray-500 font-medium">পোস্টার প্রস্তুত হচ্ছে…</div>}>
        <PosterGenerator selectedFoods={selectedFoods} getBadge={getBadge} />
      </Suspense>

      {/* 19. FOOTER */}
      <footer className="text-center py-12 border-t border-gray-200 mt-20">
        <h4 className="text-xl font-bold text-brand-green mb-2">Food Bingo BD</h4>
        <p className="text-gray-500 mb-4">বাংলাদেশের খাবারের প্রতি ভালোবাসা দিয়ে তৈরি ❤️</p>
        <p className="text-sm text-gray-400">আপনার বাছাই ও ছবি শুধু আপনার ব্রাউজারেই থাকে।</p>
      </footer>
    </div>
  );
}

export default App;
