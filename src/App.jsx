import React, { useState, useEffect, useRef, useCallback } from 'react';
import DistrictList from './components/DistrictList';
import BDMap from './components/BDMap';
import Poster, { POSTER_W, POSTER_H } from './components/Poster';
import { TOTAL } from './data/districts';
import { Download, Share2, Image as ImageIcon } from 'lucide-react';

function App() {
  const [selected, setSelected] = useState(() => {
    try {
      const saved = localStorage.getItem('foodbingobd_districts');
      if (saved) return new Set(JSON.parse(saved));
    } catch (e) {}
    return new Set();
  });
  const [activeId, setActiveId] = useState(null);
  
  const [name, setName] = useState('');
  const [photo, setPhoto] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const posterRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('foodbingobd_districts', JSON.stringify([...selected]));
  }, [selected]);

  const handleToggle = useCallback((id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleSetMany = useCallback((ids, on) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (on) ids.forEach((id) => next.add(id));
      else ids.forEach((id) => next.delete(id));
      return next;
    });
  }, []);

  const handleClear = useCallback(() => {
    setSelected(new Set());
  }, []);

  const handleHover = useCallback((id) => {
    setActiveId(id);
  }, []);

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
    if (!posterRef.current || selected.size === 0) return;
    setIsGenerating(true);
    try {
      await document.fonts.ready;
      const html2canvasModule = await import('html2canvas');
      const html2canvas = html2canvasModule.default;

      // Ensure off-screen elements are visible before capture if necessary, though Poster is rendered fixedly
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
          format: [POSTER_W, POSTER_H]
        });
        pdf.addImage(imgData, 'PNG', 0, 0, POSTER_W, POSTER_H);
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
    const shareText = `আমি Food Bingo BD-এর ${TOTAL}টি জেলার বিখ্যাত খাবারের মধ্যে ${selected.size}টি খেয়েছি! 🔥\nতুমি কি আমার স্কোর হারাতে পারবে?\n\nhttps://foodbingobd.com`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Food Bingo BD',
          text: shareText,
        });
      } catch (err) {
        console.error('Share failed', err);
      }
    } else {
      navigator.clipboard.writeText(shareText);
      alert('টেক্সট কপি করা হয়েছে! বন্ধুদের মেসেজ করে পাঠিয়ে দিন।');
    }
  };

  const pct = TOTAL ? Math.round((selected.size / TOTAL) * 100) : 0;

  return (
    <div className="min-h-screen bg-brand-cream font-bangla text-brand-dark">
      {/* Navbar */}
      <nav className="bg-white border-b border-[#f0e8d2] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <div className="font-bold text-2xl tracking-tight text-brand-green">Food Bingo BD</div>
          <div className="font-bold bg-brand-green/10 text-brand-green px-4 py-1.5 rounded-full">
            {selected.size} / {TOTAL}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="py-12 md:py-20 px-4 text-center max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-brand-green mb-6 leading-tight">
          আপনার খাওয়া <span className="text-brand-red">জেলার খাবার</span> চিহ্নিত করুন
        </h1>
        <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
          বাংলাদেশের ৬৪ জেলার বিখ্যাত সব খাবার। আপনি কোন কোন জেলার সিগনেচার খাবারগুলো খেয়েছেন? ম্যাপে ক্লিক করে আপনার স্কোর তৈরি করুন!
        </p>
      </header>

      {/* Main Interactive Section */}
      <main className="max-w-[1400px] mx-auto px-4 md:px-6 mb-24">
        <div className="flex flex-col-reverse lg:flex-row gap-6 lg:gap-10">
          
          {/* Left: District List */}
          <div className="w-full lg:w-[400px] xl:w-[450px] shrink-0">
            <DistrictList
              selected={selected}
              activeId={activeId}
              onToggle={handleToggle}
              onHover={handleHover}
              onClear={handleClear}
              onSetMany={handleSetMany}
            />
          </div>

          {/* Right: Bangladesh Map */}
          <div className="flex-1 bg-white rounded-[32px] border border-[#eadfc4] shadow-soft p-4 md:p-8 flex flex-col items-center overflow-hidden">
            <div className="w-full max-w-[700px] aspect-[4/5] relative flex items-center justify-center">
              <BDMap
                selected={selected}
                activeId={activeId}
                interactive={true}
                onToggle={handleToggle}
                onHover={handleHover}
              />
            </div>
            
            {/* Mobile Score Hint */}
            <div className="mt-8 text-center lg:hidden">
              <div className="inline-flex items-center gap-2 bg-brand-green/10 px-5 py-2.5 rounded-full text-brand-green font-bold text-lg">
                <span className="text-2xl">{selected.size}</span>
                <span className="opacity-50">/</span>
                <span>{TOTAL}</span>
                <span className="ml-1 opacity-75 font-normal">সম্পন্ন</span>
              </div>
            </div>
          </div>
          
        </div>
      </main>

      {/* Poster Generation Section */}
      {selected.size > 0 && (
        <section className="bg-white border-t border-[#f0e8d2] py-20 px-4 overflow-hidden">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-brand-green mb-4">আপনার ম্যাপ শেয়ার করুন</h2>
              <p className="text-lg text-gray-600">আপনার নাম ও ছবি দিয়ে পোস্টার তৈরি করে বন্ধুদের চ্যালেঞ্জ করুন!</p>
            </div>

            <div className="flex flex-col lg:flex-row gap-12 items-start justify-center">
              
              {/* Settings Panel */}
              <div className="w-full lg:w-1/3 bg-[#fdfaf2] p-8 rounded-3xl shadow-sm border border-[#eadfc4]">
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">আপনার নাম</label>
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="যেমন: সাকিব"
                    className="w-full px-4 py-3 border border-[#eadfc4] rounded-xl focus:ring-2 focus:ring-brand-green outline-none bg-white transition-colors text-lg"
                    maxLength={20}
                  />
                </div>

                <div className="mb-8">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">আপনার ছবি (ঐচ্ছিক)</label>
                  <label className="flex items-center justify-center w-full h-24 px-4 transition bg-white border-2 border-[#eadfc4] border-dashed rounded-xl cursor-pointer hover:border-brand-green/50 hover:bg-brand-green/5">
                    <span className="flex items-center space-x-2 text-gray-500">
                      <ImageIcon className="w-5 h-5" />
                      <span className="font-medium">ছবি আপলোড করুন</span>
                    </span>
                    <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                  </label>
                  {photo && (
                    <div className="mt-3 flex justify-between items-center bg-white px-4 py-2 rounded-lg border border-[#eadfc4]">
                      <span className="text-sm text-brand-green font-medium">ছবি যুক্ত করা হয়েছে</span>
                      <button onClick={() => setPhoto(null)} className="text-brand-red text-sm font-medium hover:underline">মুছুন</button>
                    </div>
                  )}
                </div>

                <div className="space-y-4 pt-4 border-t border-[#eadfc4]">
                  <button 
                    onClick={() => downloadFile('png')}
                    disabled={isGenerating}
                    className="w-full bg-brand-green text-white py-3.5 rounded-xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-green-900 disabled:opacity-50 transition-colors shadow-sm"
                  >
                    <Download size={20} /> {isGenerating ? 'অপেক্ষা করুন...' : 'পোস্টার ডাউনলোড'}
                  </button>
                  <button 
                    onClick={handleShare}
                    className="w-full bg-brand-red text-white py-3.5 rounded-xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-red-700 transition-colors shadow-sm"
                  >
                    <Share2 size={20} /> বন্ধুদের চ্যালেঞ্জ করুন
                  </button>
                </div>
              </div>

              {/* Poster Preview */}
              <div className="w-full lg:w-[450px] xl:w-[500px] flex items-center justify-center">
                {/* Scaled Preview wrapper to fit screen nicely */}
                <div 
                  className="bg-white shadow-2xl rounded-xl overflow-hidden" 
                  style={{
                    width: '100%', 
                    aspectRatio: `${POSTER_W} / ${POSTER_H}`,
                    position: 'relative',
                    containerType: 'inline-size'
                  }}
                >
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: POSTER_W,
                    height: POSTER_H,
                    transform: `scale(var(--scale-factor))`,
                    transformOrigin: 'top left'
                  }} className="preview-scale-wrapper">
                    {/* 
                      We render a second instance for preview. 
                      Because we want high-res download, we keep one explicitly off-screen or scale it natively.
                      Wait, scaling down Poster visually works perfectly:
                    */}
                    <Poster
                      selected={selected}
                      name={name}
                      photo={photo}
                      interactive={false}
                    />
                  </div>
                  <style>{`
                    .preview-scale-wrapper {
                      --scale-factor: min(1, calc(100cqw / ${POSTER_W}));
                    }
                  `}</style>
                </div>
              </div>

              {/* Off-screen Poster for html2canvas to ensure 1080x1350 resolution */}
              <div style={{ position: 'fixed', top: '-20000px', left: '-20000px' }}>
                <Poster
                  ref={posterRef}
                  selected={selected}
                  name={name}
                  photo={photo}
                  interactive={false}
                />
              </div>

            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-brand-green text-white text-center py-8 opacity-90">
        <p className="font-medium">© {new Date().getFullYear()} Food Bingo BD. বাংলাদেশের সব সেরা খাবার এক ঠিকানায়।</p>
      </footer>
    </div>
  );
}

export default App;
