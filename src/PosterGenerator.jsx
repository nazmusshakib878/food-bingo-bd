import React, { useRef, useState, useEffect } from 'react';
import { Download, Image as ImageIcon, Share2, Copy } from 'lucide-react';
import foodsData from './data/foods.json';

const themes = {
  'বাংলার সবুজ': { bg: 'bg-[#0b3d2c]', text: 'text-white', accent: 'text-[#d4af37]', cardSelected: 'bg-white', cardHidden: 'bg-black/30' },
  'সূর্যাস্ত': { bg: 'bg-gradient-to-br from-orange-500 to-red-600', text: 'text-white', accent: 'text-yellow-300', cardSelected: 'bg-white', cardHidden: 'bg-black/30' },
  'রাতের বাংলা': { bg: 'bg-gray-900', text: 'text-white', accent: 'text-[#00d2ff]', cardSelected: 'bg-gray-800', cardHidden: 'bg-black/40' },
  'উৎসব': { bg: 'bg-gradient-to-br from-pink-600 to-purple-600', text: 'text-white', accent: 'text-yellow-300', cardSelected: 'bg-white', cardHidden: 'bg-black/30' }
};

export default function PosterGenerator({ selectedFoods, getBadge }) {
  const posterRef = useRef(null);
  const containerRef = useRef(null);
  const [name, setName] = useState('');
  const [theme, setTheme] = useState('বাংলার সবুজ');
  const [photo, setPhoto] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [format, setFormat] = useState('feed'); // feed or story
  const [scale, setScale] = useState(0.35);

  const score = selectedFoods.length;
  const badge = getBadge(score);
  const activeTheme = themes[theme];
  const posterWidth = 1080;
  const posterHeight = format === 'feed' ? 1350 : 1920;

  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth - 32; // 32px for padding
        const maxScale = 0.35;
        setScale(Math.min(maxScale, containerWidth / posterWidth));
      } else {
        const availableWidth = Math.min(window.innerWidth - 64, 400);
        setScale(availableWidth / posterWidth);
      }
    };
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [posterWidth]);

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('দয়া করে একটি বৈধ ছবি নির্বাচন করুন।');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert('৫ মেগাবাইটের থেকে ছোট সাইজের ছবি আপলোড করুন।');
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => setPhoto(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const downloadFile = async (type) => {
    if (!posterRef.current || score === 0) return;
    setIsGenerating(true);
    try {
      await document.fonts.ready;
      
      const html2canvasModule = await import('html2canvas');
      const html2canvas = html2canvasModule.default;

      const canvas = await html2canvas(posterRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: null
      });

      if (type === 'pdf') {
        const { jsPDF } = await import('jspdf');
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'px',
          format: format === 'feed' ? [1080, 1350] : [1080, 1920]
        });
        pdf.addImage(imgData, 'PNG', 0, 0, 1080, format === 'feed' ? 1350 : 1920);
        pdf.save('food-bingo-bd.pdf');
      } else {
        const mimeType = type === 'jpg' ? 'image/jpeg' : 'image/png';
        canvas.toBlob((blob) => {
          if (!blob) return;
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.download = `food-bingo-bd.${type}`;
          link.href = url;
          link.target = '_blank';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          setTimeout(() => URL.revokeObjectURL(url), 1000);
        }, mimeType, 1.0);
      }
    } catch (error) {
      console.error('Error generating poster:', error);
      alert('পোস্টার তৈরি করতে সমস্যা হয়েছে।');
    }
    setIsGenerating(false);
  };

  const handleShare = async () => {
    const shareText = `আমি Food Bingo BD-এর ${foodsData.length}টি বিখ্যাত খাবারের মধ্যে ${score}টি খেয়েছি! 🔥\nতুমি কি আমার স্কোর হারাতে পারবে?\n\nhttps://foodbingobd.com`;
    
    let file = null;
    if (posterRef.current && navigator.canShare) {
      setIsGenerating(true);
      try {
        await document.fonts.ready;
        const html2canvasModule = await import('html2canvas');
        const html2canvas = html2canvasModule.default;
        const canvas = await html2canvas(posterRef.current, { scale: 2, useCORS: true, backgroundColor: null });
        const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
        if (blob) {
          file = new File([blob], 'food-bingo-bd.png', { type: 'image/png' });
        }

      } catch (e) {
        console.error("Failed to generate image for sharing", e);
      }
      setIsGenerating(false);
    }

    if (navigator.share) {
      try {
        const shareData = {
          title: 'Food Bingo BD',
          text: shareText,
        };
        if (file && navigator.canShare({ files: [file] })) {
          shareData.files = [file];
        }
        await navigator.share(shareData);
      } catch (err) {
        console.error('Share failed', err);
      }
    } else {
      navigator.clipboard.writeText(shareText);
      alert('চ্যালেঞ্জ টেক্সট কপি করা হয়েছে! এখন বন্ধুদের মেসেজ করে পাঠিয়ে দিন।');
    }
  };

  if (score === 0) {
    return (
      <section className="max-w-4xl mx-auto px-6 mb-24 text-center">
        <h2 className="text-3xl font-bold text-brand-green mb-6">আপনার Food Bingo সাজান</h2>
        <div className="bg-white rounded-3xl p-12 border-2 border-dashed border-gray-300 shadow-sm">
          <p className="text-xl text-gray-500 font-medium">আগে অন্তত ১টা খাবার বাছাই করুন</p>
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-6xl mx-auto px-4 md:px-6 mb-24">
      <div className="text-center mb-10">
        <h2 className="text-3xl md:text-4xl font-bold text-brand-green mb-4">আপনার Food Bingo সাজান</h2>
        <p className="text-lg text-gray-600">আপনার ছবি, নাম ও থিম দিয়ে সাজিয়ে বন্ধুদের সাথে শেয়ার করুন</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-12 items-start">
        
        {/* Settings Panel */}
        <div className="w-full lg:w-1/3 bg-white p-8 rounded-3xl shadow-soft border border-gray-100">
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">আপনার নাম</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="যেমন: সাকিব"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-green outline-none bg-gray-50 focus:bg-white transition-colors text-lg"
              maxLength={20}
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">সাইজ</label>
            <div className="flex bg-gray-100 p-1 rounded-xl">
              <button 
                onClick={() => setFormat('feed')}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${format === 'feed' ? 'bg-white shadow-sm text-brand-green' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Feed (4:5)
              </button>
              <button 
                onClick={() => setFormat('story')}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${format === 'story' ? 'bg-white shadow-sm text-brand-green' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Story (9:16)
              </button>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">থিম বেছে নিন</label>
            <div className="grid grid-cols-2 gap-3">
              {Object.keys(themes).map((t) => (
                <button 
                  key={t}
                  onClick={() => setTheme(t)} 
                  className={`py-3 rounded-xl border-2 font-medium text-sm transition-all ${theme === t ? 'border-brand-green text-brand-green bg-brand-green/5' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-8">
            <label className="block text-sm font-semibold text-gray-700 mb-2">আপনার ছবি (ঐচ্ছিক)</label>
            <label className="flex items-center justify-center w-full h-24 px-4 transition bg-gray-50 border-2 border-gray-200 border-dashed rounded-xl cursor-pointer hover:border-brand-green/50 hover:bg-brand-green/5">
              <span className="flex items-center space-x-2 text-gray-500">
                <ImageIcon className="w-5 h-5" />
                <span className="font-medium">ছবি আপলোড করুন</span>
              </span>
              <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
            </label>
            {photo && (
              <div className="mt-3 flex justify-between items-center bg-gray-50 px-4 py-2 rounded-lg border border-gray-100">
                <span className="text-sm text-gray-600 font-medium">ছবি যুক্ত করা হয়েছে</span>
                <button onClick={() => setPhoto(null)} className="text-red-500 text-sm font-medium hover:underline">মুছুন</button>
              </div>
            )}
          </div>
        </div>

        {/* Poster Preview Area */}
        <div 
          ref={containerRef}
          className="w-full lg:w-2/3 flex flex-col items-center justify-center overflow-hidden bg-gray-100/50 rounded-3xl p-4 md:p-8 border border-gray-100"
        >
          
          <div 
            style={{ width: posterWidth, height: posterHeight, transform: `scale(${scale})`, transformOrigin: 'top center', marginBottom: `-${posterHeight * (1 - scale)}px` }}
            className="bg-white shadow-2xl relative"
          >
            <div 
              ref={posterRef}
              className={`w-full h-full ${activeTheme.bg} p-12 flex flex-col font-bangla relative overflow-hidden justify-between`}
            >
              {/* Header */}
              <div className="flex items-center gap-8 z-10">
                {photo ? (
                  <img src={photo} alt="Profile" className="w-40 h-40 rounded-full border-8 border-white/20 object-cover shadow-xl" />
                ) : (
                  <div className="w-40 h-40 rounded-full border-8 border-white/20 bg-black/20 flex items-center justify-center shadow-xl">
                    <span className={`text-7xl ${activeTheme.text}`}>👤</span>
                  </div>
                )}
                <div className="flex-1">
                  <h1 className={`text-7xl font-bold ${activeTheme.text} mb-4 leading-tight`}>
                    {name ? `${name} এর Food Bingo` : 'আমার Food Bingo'}
                  </h1>
                  <p className={`text-4xl ${activeTheme.text} opacity-90`}>
                    বাংলাদেশের {foodsData.length}টি জনপ্রিয় খাবারের তালিকা
                  </p>
                </div>
              </div>

              {/* Grid */}
              <div className={`grid grid-cols-10 grid-rows-10 gap-2 z-10 w-full flex-1 my-12 ${format === 'story' ? 'content-center max-h-[1200px]' : 'max-h-[1000px]'}`}>
                {foodsData.map((food) => {
                  const isSelected = selectedFoods.includes(food.id);
                  return (
                    <div 
                      key={food.id} 
                      className={`rounded-xl flex flex-col items-center justify-center p-1 relative
                        ${isSelected ? activeTheme.cardSelected : activeTheme.cardHidden}
                      `}
                    >
                      <div className={`text-[40px] ${!isSelected && 'grayscale brightness-0 opacity-20'}`}>
                        {food.emoji}
                      </div>
                      
                      {isSelected && (
                        <div className="absolute inset-0 flex items-end justify-center pb-1">
                          <span className={`text-[12px] font-bold leading-tight text-center px-1 rounded w-[90%] line-clamp-2 ${activeTheme.text.includes('white') ? 'text-gray-900 bg-white/90' : 'text-white bg-black/70'}`}>
                            {food.nameBn}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Footer */}
              <div className="flex items-end justify-between z-10 border-t-2 border-white/20 pt-8 mt-auto">
                <div>
                  <p className={`text-5xl font-bold ${activeTheme.text} mb-3`}>
                    লেভেল: <span className={activeTheme.accent}>{badge}</span>
                  </p>
                  <p className={`text-3xl ${activeTheme.text} opacity-90`}>
                    স্কোর: <span className="font-bold text-4xl">{score}/{foodsData.length}</span>
                  </p>
                </div>
                <div className="text-right">
                  <div className={`text-3xl font-bold ${activeTheme.text} opacity-80 mb-1`}>আপনি কয়টা খেয়েছেন?</div>
                  <div className={`text-4xl font-black ${activeTheme.accent}`}>Food Bingo BD</div>
                </div>
              </div>

              {/* Decorative elements */}
              <div className="absolute -top-20 -right-20 w-[500px] h-[500px] bg-white opacity-5 rounded-full blur-3xl pointer-events-none"></div>
              <div className="absolute -bottom-40 -left-20 w-[800px] h-[800px] bg-black opacity-10 rounded-full blur-3xl pointer-events-none"></div>
            </div>
          </div>
        </div>
      </div>

      {/* 15. DOWNLOAD SECTION */}
      <div className="mt-16 text-center max-w-2xl mx-auto">
        <h3 className="text-2xl font-bold text-brand-green mb-6">আপনার Food Bingo ডাউনলোড করুন</h3>
        <div className="flex flex-wrap justify-center gap-4 mb-16">
          <button 
            onClick={() => downloadFile('png')}
            disabled={isGenerating}
            className="bg-brand-green text-white px-6 py-3 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-green-800 disabled:opacity-50 transition-colors shadow-sm"
          >
            <Download size={18} /> {isGenerating ? 'অপেক্ষা করুন...' : '↓ PNG'}
          </button>
          <button 
            onClick={() => downloadFile('jpg')}
            disabled={isGenerating}
            className="bg-brand-green text-white px-6 py-3 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-green-800 disabled:opacity-50 transition-colors shadow-sm"
          >
            <Download size={18} /> ↓ JPG
          </button>
          <button 
            onClick={() => downloadFile('pdf')}
            disabled={isGenerating}
            className="bg-brand-green text-white px-6 py-3 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-green-800 disabled:opacity-50 transition-colors shadow-sm"
          >
            <Download size={18} /> ↓ PDF
          </button>
        </div>
      </div>

      {/* 17. SHARE SYSTEM & 18. VIRAL CHALLENGE SECTION */}
      <div className="max-w-xl mx-auto bg-white rounded-3xl p-8 md:p-12 text-center shadow-soft border border-gray-100">
        <h3 className="text-3xl font-bold text-brand-red mb-4">বন্ধুদের চ্যালেঞ্জ করুন 👀</h3>
        <p className="text-lg text-gray-600 mb-8">দেখুন আপনার বন্ধুরা আপনার স্কোর হারাতে পারে কিনা!</p>
        
        <button 
          onClick={handleShare}
          className="w-full bg-brand-red text-white py-4 rounded-2xl font-bold text-xl flex items-center justify-center gap-3 hover:bg-red-700 hover:scale-[1.02] active:scale-95 transition-all shadow-[0_8px_20px_rgba(223,42,56,0.25)]"
        >
          {navigator.share ? <Share2 size={24} /> : <Copy size={24} />}
          আমার স্কোরকে হারাতে পারবে?
        </button>
      </div>

    </section>
  );
}
