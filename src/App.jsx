import React, { useState, useEffect, useRef, useCallback } from 'react';
import DistrictList from './components/DistrictList';
import BDMap from './components/BDMap';
import Poster, { POSTER_W, POSTER_H } from './components/Poster';
import { TOTAL } from './data/districts';
import mapData from './data/bdMap.json';
import { Download, Share2, Image as ImageIcon, Link2 } from 'lucide-react';

const localizeNum = (num, lang) => lang === 'bn' ? String(num).replace(/\d/g, d => '০১২৩৪৫৬৭৮৯'[d]) : num;

const encodeChallenge = (name, score) => {
  try {
    const json = JSON.stringify({ n: name.substring(0, 30), s: score });
    return btoa(unescape(encodeURIComponent(json))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  } catch (e) { return ''; }
};

const decodeChallenge = (c) => {
  try {
    let base64 = c.replace(/-/g, '+').replace(/_/g, '/');
    const pad = base64.length % 4;
    if (pad) base64 += '='.repeat(4 - pad);
    const json = decodeURIComponent(escape(atob(base64)));
    const data = JSON.parse(json);
    if (typeof data.n === 'string' && typeof data.s === 'number' && data.s >= 0 && data.s <= 100) {
      return { name: data.n.substring(0, 30), score: data.s };
    }
  } catch (e) {}
  return null;
};

function App() {
  const [lang, setLang] = useState('bn');
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
  const [challengeData, setChallengeData] = useState(null);
  const posterRef = useRef(null);
  const previewContainerRef = useRef(null);
  const [previewScale, setPreviewScale] = useState(1);

  useEffect(() => {
    if (!previewContainerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const width = entry.contentRect.width;
        setPreviewScale(width / POSTER_W);
      }
    });
    observer.observe(previewContainerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    localStorage.setItem('foodbingobd_districts', JSON.stringify([...selected]));
  }, [selected]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const c = params.get('c');
    if (c) {
      const data = decodeChallenge(c);
      if (data) setChallengeData(data);
    }
  }, []);

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

  const exportCanvasBlob = async () => {
    if (!posterRef.current || selected.size === 0) return null;
    await document.fonts.ready;
    const html2canvasModule = await import('html2canvas');
    const html2canvas = html2canvasModule.default;
    const canvas = await html2canvas(posterRef.current, {
      scale: 2,
      useCORS: true,
      backgroundColor: null,
      onclone: (clonedDoc) => {
        const clonedNode = clonedDoc.getElementById('poster-node');
        if (clonedNode) {
          clonedNode.style.transform = 'none';
        }
      }
    });
    return new Promise(resolve => canvas.toBlob(resolve, 'image/png', 1.0));
  };

  const downloadFile = async () => {
    if (!posterRef.current || selected.size === 0) return;
    setIsGenerating(true);
    try {
      const blob = await exportCanvasBlob();
      if (!blob) throw new Error('No blob generated');
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `food-bingo-bd.png`;
      link.href = url;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (error) {
      console.error('Error generating poster:', error);
      alert('পোস্টার তৈরি করতে সমস্যা হয়েছে।');
    }
    setIsGenerating(false);
  };

  const handleNativeShare = async () => {
    if (!posterRef.current || selected.size === 0) return;
    setIsGenerating(true);
    const url = 'https://food-bingo-bd.vercel.app/';
    const shareText = `আমি বাংলাদেশের ${enToBn(selected.size)}/১০০ খাবার খেয়েছি! তুমি কয়টা খেয়েছ? 👇 ${url}`;
    
    try {
      const blob = await exportCanvasBlob();
      if (!blob) throw new Error('No blob generated');
      const file = new File([blob], 'food-bingo-bd.png', { type: 'image/png' });
      
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'Food Bingo BD',
          text: shareText
        });
      } else {
        throw new Error('Share not supported');
      }
    } catch (err) {
      navigator.clipboard.writeText(shareText);
      alert('লিংক কপি হয়েছে!');
    }
    setIsGenerating(false);
  };

  const handleChallengeLink = () => {
    const n = name.trim() || 'একজন বন্ধু';
    const c = encodeChallenge(n, selected.size);
    const url = `https://food-bingo-bd.vercel.app/?c=${c}`;
    navigator.clipboard.writeText(`আমি বাংলাদেশের ${enToBn(selected.size)}/১০০ খাবার খেয়েছি! তুমি কয়টা খেয়েছ? 👇 ${url}`);
    alert('লিংক কপি হয়েছে!');
  };

  const pct = TOTAL ? Math.round((selected.size / TOTAL) * 100) : 0;

  return (
    <div className="min-h-screen bg-brand-cream font-bangla text-brand-dark pb-24 lg:pb-0">
      {/* Navbar */}
      <nav className="bg-white border-b border-[#f0e8d2] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <div className="font-bold text-2xl tracking-tight text-brand-green">Food Bingo BD</div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setLang(lang === 'bn' ? 'en' : 'bn')}
              className="text-sm font-bold border-2 border-brand-green text-brand-green rounded-full px-3 py-1 hover:bg-brand-green hover:text-white transition-colors"
            >
              {lang === 'bn' ? 'EN' : 'বাংলা'}
            </button>
            <div className="font-bold bg-brand-green/10 text-brand-green px-4 py-1.5 rounded-full">
              {localizeNum(selected.size, lang)} / {localizeNum(TOTAL, lang)}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header id="hero" className="relative pt-12 pb-6 md:pt-16 md:pb-6 px-5 text-center max-w-3xl mx-auto">
        <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none overflow-hidden" aria-hidden="true">
          <svg 
            viewBox={`0 0 ${mapData.width} ${mapData.height}`} 
            className="h-[240px] md:h-[320px] opacity-[0.06]" 
            fill="none" 
            stroke="#0f6b4f" 
            strokeWidth="3"
            strokeLinejoin="round"
          >
            {mapData.districts.map(d => (
              <path key={d.id} d={d.d} />
            ))}
          </svg>
        </div>

        <div className="relative z-10 flex flex-col items-center">
          <h1 
            className="font-extrabold text-[#0f3d2e] mb-4 [text-wrap:balance]"
            style={{ 
              fontFamily: "'Hind Siliguri', sans-serif", 
              fontSize: "clamp(1.9rem, 6vw, 3.4rem)", 
              lineHeight: 1.35 
            }}
          >
            {lang === 'bn' ? (
              <>
                <span className="block">খাবার দিয়ে রঙিন করুন</span>
                <span className="block">বাংলাদেশের মানচিত্র</span>
              </>
            ) : (
              <>
                <span className="block">Color with Food</span>
                <span className="block">The Map of Bangladesh</span>
              </>
            )}
          </h1>
          
          <p className="max-w-xl mx-auto text-[#3b5a49] mt-4 [text-wrap:balance]" style={{ fontSize: '1.05rem', lineHeight: 1.8 }}>
            {lang === 'bn' 
              ? 'ঢাকার কাচ্চি থেকে পদ্মার ইলিশ, যে জেলার সিগনেচার খাবার খেয়েছেন সেটা বেছে নিন। সেই জেলা রঙে ভরে উঠবে। শেষে মানচিত্র শেয়ার করে বন্ধুদের চ্যালেঞ্জ করুন।'
              : "From Dhaka's Kacchi to Padma's Ilish, pick the signature foods you've eaten. The district will fill with color. Then share the map and challenge friends."}
          </p>

          <button 
            onClick={() => {
              document.getElementById('district-search')?.focus();
              window.scrollTo({ top: 500, behavior: 'smooth' });
            }}
            className="mt-8 px-8 py-3.5 bg-[#0f6b4f] text-white font-semibold rounded-full shadow-[0_4px_14px_0_rgba(15,107,79,0.39)] hover:shadow-[0_6px_20px_rgba(15,107,79,0.23)] hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-[#0f6b4f]/30 transition-all motion-reduce:transition-none motion-reduce:hover:translate-y-0"
          >
            {selected.size > 0 
              ? (lang === 'bn' ? 'মানচিত্রে ফিরে যান' : 'Return to Map')
              : (lang === 'bn' ? 'আমার মানচিত্র রঙ করি' : 'Color My Map')}
          </button>

          <div className="mt-3 text-center flex flex-col items-center">
            <span className="text-[0.875rem] text-[#5c7a69]">
              {lang === 'bn' ? 'লগইন লাগবে না, কয়েক মিনিটেই শেষ।' : 'No login required, takes just a few minutes.'}
            </span>
            <div className="mt-2 flex items-center gap-3">
              <span className="text-[0.875rem] font-bold text-[#0f6b4f]">
                {localizeNum(selected.size, lang)} / {localizeNum(TOTAL, lang)} {lang === 'bn' ? 'জেলা' : 'Districts'}
              </span>
              <div className="w-[120px] h-[6px] rounded-full bg-[#d7e4da] overflow-hidden">
                <div 
                  className="h-full bg-[#0f6b4f] rounded-full transition-all duration-500 ease-out" 
                  style={{ width: `${(selected.size / TOTAL) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      {challengeData && (
        <div className="max-w-4xl mx-auto px-4 mb-8">
          <div className="bg-[#f2f9f5] border-2 border-brand-green rounded-3xl p-8 text-center shadow-sm">
            <h2 className="text-2xl md:text-3xl font-bold text-brand-green mb-4 leading-tight">
              {lang === 'bn' 
                ? `${challengeData.name} খেয়েছে ${localizeNum(challengeData.score, lang)}/${localizeNum(TOTAL, lang)} — তুমি কয়টা খেয়েছ?`
                : `${challengeData.name} has eaten ${challengeData.score}/${TOTAL} — how many have you?`}
            </h2>
            <button 
              onClick={() => {
                document.getElementById('district-search')?.focus();
                window.scrollTo({ top: 500, behavior: 'smooth' });
              }}
              className="mt-2 px-8 py-3 bg-brand-red text-white text-lg font-bold rounded-full shadow hover:bg-red-700 transition"
            >
              Start
            </button>
          </div>
        </div>
      )}

      {/* Main Interactive Section */}
      <main className="max-w-[1400px] mx-auto px-4 md:px-6 mb-24">
        <div className="flex flex-col-reverse lg:flex-row gap-6 lg:gap-10">
          
          {/* Left: District List */}
          <div className="w-full lg:w-[400px] xl:w-[450px] shrink-0">
            <DistrictList
              lang={lang}
              selected={selected}
              activeId={activeId}
              onToggle={handleToggle}
              onHover={handleHover}
              onClear={handleClear}
              onSetMany={handleSetMany}
            />
          </div>

          {/* Right: Bangladesh Map */}
          <div className="flex-1 lg:sticky lg:top-24 lg:self-start lg:h-[calc(100vh-8rem)] bg-white rounded-[32px] border border-[#eadfc4] shadow-soft p-4 md:p-8 flex flex-col items-center overflow-hidden">
            <div className="w-full max-w-[700px] aspect-[4/5] relative flex items-center justify-center">
              <BDMap
                lang={lang}
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
                <span>{localizeNum(TOTAL, lang)}</span>
                <span className="ml-1 opacity-75 font-normal">{lang === 'bn' ? 'সম্পন্ন' : 'completed'}</span>
              </div>
            </div>
          </div>
          
        </div>
      </main>

      {/* Poster Generation Section */}
      {selected.size > 0 && (
        <section id="poster-section" className="bg-white border-t border-[#f0e8d2] py-20 px-4 overflow-hidden relative">
          <div className="max-w-6xl mx-auto">
            {challengeData && (
              <div className="mb-12 p-6 rounded-3xl bg-[#fdfaf2] border-2 border-brand-green text-center shadow-sm max-w-2xl mx-auto">
                <h3 className="text-2xl md:text-3xl font-bold text-brand-dark mb-4">
                  {lang === 'bn' 
                    ? <>তুমি <span className="text-brand-green">{localizeNum(selected.size, lang)}</span> vs {challengeData.name} <span className="text-brand-red">{localizeNum(challengeData.score, lang)}</span></>
                    : <>You <span className="text-brand-green">{selected.size}</span> vs {challengeData.name} <span className="text-brand-red">{challengeData.score}</span></>}
                </h3>
                <p className="text-xl font-medium text-gray-700 bg-white inline-block px-6 py-2 rounded-full border border-[#eadfc4]">
                  {selected.size > challengeData.score 
                    ? (lang === 'bn' ? 'দারুণ! তুমি জিতে গেছো! 🏆' : 'Awesome! You won! 🏆') 
                    : selected.size < challengeData.score 
                      ? (lang === 'bn' ? 'ইশ! আরেকটু খেলে জিতে যেতে! 🥲' : 'Oops! Just a little more to win! 🥲') 
                      : (lang === 'bn' ? 'আরেহ! সমান সমান! 🤝' : 'Wow! It\'s a tie! 🤝')}
                </p>
              </div>
            )}

            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-brand-green mb-4">{lang === 'bn' ? 'আপনার ম্যাপ শেয়ার করুন' : 'Share Your Map'}</h2>
              <p className="text-lg text-gray-600">{lang === 'bn' ? 'আপনার নাম ও ছবি দিয়ে পোস্টার তৈরি করে বন্ধুদের চ্যালেঞ্জ করুন!' : 'Create a poster with your name and photo to challenge friends!'}</p>
            </div>

            <div className="flex flex-col lg:flex-row gap-12 items-start justify-center">
              
              {/* Settings Panel */}
              <div className="w-full lg:w-1/3 bg-[#fdfaf2] p-8 rounded-3xl shadow-sm border border-[#eadfc4]">
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">{lang === 'bn' ? 'আপনার নাম' : 'Your Name'}</label>
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={lang === 'bn' ? 'যেমন: সাকিব' : 'e.g. Shakib'}
                    className="w-full px-4 py-3 border border-[#eadfc4] rounded-xl focus:ring-2 focus:ring-brand-green outline-none bg-white transition-colors text-lg"
                    maxLength={20}
                  />
                </div>

                <div className="mb-8">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">{lang === 'bn' ? 'আপনার ছবি (ঐচ্ছিক)' : 'Your Photo (Optional)'}</label>
                  <label className="flex items-center justify-center w-full h-24 px-4 transition bg-white border-2 border-[#eadfc4] border-dashed rounded-xl cursor-pointer hover:border-brand-green/50 hover:bg-brand-green/5">
                    <span className="flex items-center space-x-2 text-gray-500">
                      <ImageIcon className="w-5 h-5" />
                      <span className="font-medium">{lang === 'bn' ? 'ছবি আপলোড করুন' : 'Upload Photo'}</span>
                    </span>
                    <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                  </label>
                  {photo && (
                    <div className="mt-3 flex justify-between items-center bg-white px-4 py-2 rounded-lg border border-[#eadfc4]">
                      <span className="text-sm text-brand-green font-medium">{lang === 'bn' ? 'ছবি যুক্ত করা হয়েছে' : 'Photo Added'}</span>
                      <button onClick={() => setPhoto(null)} className="text-brand-red text-sm font-medium hover:underline">{lang === 'bn' ? 'মুছুন' : 'Remove'}</button>
                    </div>
                  )}
                </div>

                <div className="space-y-4 pt-4 border-t border-[#eadfc4]">
                  <button 
                    onClick={downloadFile}
                    disabled={isGenerating}
                    className="w-full bg-brand-green text-white py-3.5 rounded-xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-green-900 disabled:opacity-50 transition-colors shadow-sm"
                  >
                    <Download size={20} /> {isGenerating ? (lang === 'bn' ? 'অপেক্ষা করুন...' : 'Please wait...') : (lang === 'bn' ? 'ডাউনলোড' : 'Download')}
                  </button>
                  <button 
                    onClick={handleNativeShare}
                    disabled={isGenerating}
                    className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm"
                  >
                    <Share2 size={20} /> {lang === 'bn' ? 'শেয়ার করুন' : 'Share'}
                  </button>
                  <button 
                    onClick={handleChallengeLink}
                    className="w-full bg-brand-red text-white py-3.5 rounded-xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-red-700 transition-colors shadow-sm"
                  >
                    <Link2 size={20} /> {lang === 'bn' ? 'বন্ধুকে চ্যালেঞ্জ করুন' : 'Challenge a Friend'}
                  </button>
                </div>
              </div>

              {/* Poster Preview */}
              <div className="w-full md:w-[450px] xl:w-[500px] flex items-center justify-center">
                <div 
                  ref={previewContainerRef}
                  className="bg-white shadow-2xl overflow-hidden" 
                  style={{
                    position: 'relative',
                    width: '100%', 
                    maxWidth: '420px',
                    aspectRatio: '4 / 5',
                    borderRadius: '16px'
                  }}
                >
                  <div 
                    id="poster-node"
                    ref={posterRef}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: POSTER_W,
                      height: POSTER_H,
                      transform: `scale(${previewScale})`,
                      transformOrigin: 'top left'
                    }}
                  >
                    <Poster
                      selected={selected}
                      name={name}
                      photo={photo}
                      interactive={false}
                    />
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>
      )}

      {/* Footer / Credits Section */}
      <footer id="credits" className="bg-white py-12 px-4 border-t border-[#f0e8d2] text-center">
        <div className="max-w-4xl mx-auto flex flex-col items-center justify-center">
          <p className="text-xl text-gray-700 font-medium mb-2">
            Made by{' '}
            <a 
              href="https://www.facebook.com/share/1Ex7MSCMYK/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-brand-green font-bold hover:text-brand-red transition-colors underline decoration-brand-green/30 hover:decoration-brand-red decoration-2 underline-offset-4"
            >
              MD. Nazmus Shakib
            </a>
          </p>
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} Food Bingo BD. বাংলাদেশের সব সেরা খাবার এক ঠিকানায়।
          </p>
        </div>
      </footer>


      {/* Sticky Mobile Bottom Bar */}
      {selected.size > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#f0e8d2] px-6 py-4 lg:hidden z-50 flex items-center justify-between shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
          <div className="font-bold text-brand-green text-lg">
            {lang === 'bn' ? 'স্কোর:' : 'Score:'} {localizeNum(selected.size, lang)} / {localizeNum(TOTAL, lang)}
          </div>
          <button 
            onClick={() => {
              document.getElementById('poster-section')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="bg-brand-red text-white px-6 py-2.5 rounded-full font-bold shadow-sm"
          >
            {lang === 'bn' ? 'পোস্টার বানান' : 'Make Poster'}
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
