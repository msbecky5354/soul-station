import React, { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, MessageCircle, Heart, Wind, Compass, Coffee, ExternalLink, Sparkles, Send, Loader2, User, Copy, Check, Download, Share2, MoreVertical, PlayCircle } from 'lucide-react';
import Fuse from 'fuse.js';

import defaultVerses from './verses.json'; 

const fallbackVerse = {
  id: "fallback-001",
  primary_emotion: "陪伴與被愛",
  reference: "系統提示",
  verse: "這是一條離線備用經文。代表你的 n8n 系統目前並未成功連線。",
  mood_tags: "#系統診斷中",
  q1: "點解我睇唔到 YouTube 掣？",
  a1: "因為系統連線失敗，目前讀取緊本地 verses.json，而本地檔案沒有 youtube_url 欄位。",
  q2: "我應該點做？",
  a2: "請檢查 n8n 工作流是否已經設定為 'Active' (啟動狀態)。",
  conclusion: "排查錯誤是開發必經之路，我們一起解決它。",
  youtube_url: null,
  isFallback: true // 診斷標記
};

const emotionStyles = {
  "醫治與忍耐": { 
    gradient: "from-emerald-50/80 to-teal-100/50", accent: "text-emerald-700", border: "border-emerald-400", focusRing: "focus:ring-emerald-200",
    icon: <Heart className="w-6 h-6 text-emerald-600" strokeWidth={1.5} />, glow: "shadow-xl shadow-emerald-500/15",
    placeholder: "例如：最近有一種講唔出嘅無力感，身心都覺得好疲累...",
    suggestions: ["我最近身體好唔舒服。", "其實我心入面覺得好痛。", "今日精神唔錯，好感恩！"]
  },
  "平靜與清晰": { 
    gradient: "from-blue-50/80 to-sky-100/50", accent: "text-blue-700", border: "border-blue-400", focusRing: "focus:ring-blue-200",
    icon: <Wind className="w-6 h-6 text-blue-600" strokeWidth={1.5} />, glow: "shadow-xl shadow-blue-500/15",
    placeholder: "例如：生活節奏太快，好想搵一個可以俾自己唞氣同沉澱嘅空間...",
    suggestions: ["個腦不停轉，搞到成日失眠。", "最近好多嘢煩，覺得好大壓力。", "終於有一刻平靜，真係好感恩！"]
  },
  "方向與信心": { 
    gradient: "from-amber-50/80 to-orange-100/50", accent: "text-amber-700", border: "border-amber-400", focusRing: "focus:ring-amber-200",
    icon: <Compass className="w-6 h-6 text-amber-600" strokeWidth={1.5} />, glow: "shadow-xl shadow-amber-500/15",
    placeholder: "例如：面對緊人生嘅交叉點，唔知點樣做決定先係對自己最好...",
    suggestions: ["我對未來嘅前路覺得好迷茫。", "做錯咗決定，依家覺得好後悔。", "終於搵到新方向，個心定咗好多！"]
  },
  "陪伴與被愛": { 
    gradient: "from-rose-50/80 to-pink-100/50", accent: "text-rose-700", border: "border-rose-400", focusRing: "focus:ring-rose-200",
    icon: <Coffee className="w-6 h-6 text-rose-600" strokeWidth={1.5} />, glow: "shadow-xl shadow-rose-500/15",
    placeholder: "例如：有時候喺人群之中，反而會覺得得番自己一個人...",
    suggestions: ["覺得身邊好似無人真正明白我。", "呢排真係覺得自己好孤單。", "今日深深感受到被愛，好感恩！"]
  },
};

export default function App() {
  const [appStage, setAppStage] = useState('NAME_INPUT');
  const [userName, setUserName] = useState(''); 
  const [selectedEmotion, setSelectedEmotion] = useState(null);
  const [userInput, setUserInput] = useState('');
  const [currentVerse, setCurrentVerse] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [revealStep, setRevealStep] = useState(0);
  const [showDoorAnimation, setShowDoorAnimation] = useState(false);
  const [showModal, setShowModal] = useState(false); 
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true); 
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const localDatabase = useMemo(() => {
    try {
      const storedData = localStorage.getItem('soulStation_DB');
      const parsedData = storedData ? JSON.parse(storedData) : null;
      if (parsedData && Array.isArray(parsedData) && parsedData.length > 0) return parsedData;
      const safeData = Array.isArray(defaultVerses) ? defaultVerses : [];
      localStorage.setItem('soulStation_DB', JSON.stringify(safeData));
      return safeData;
    } catch (e) {
      const safeData = Array.isArray(defaultVerses) ? defaultVerses : [];
      localStorage.setItem('soulStation_DB', JSON.stringify(safeData));
      return safeData;
    }
  }, []);

  useEffect(() => {
    const savedName = localStorage.getItem('soulStationUserName');
    if (savedName) setUserName(savedName); 
  }, []);

  const handleNameSubmit = () => {
    if (!userName.trim()) return;
    localStorage.setItem('soulStationUserName', userName.trim());
    setShowDoorAnimation(true); 
    setTimeout(() => {
      setAppStage('EMOTION');
      setShowDoorAnimation(false); 
    }, 2500); 
  };

  const handleEmotionSelect = (emotion) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setSelectedEmotion(emotion);
      setUserInput(''); 
      setAppStage('INPUT');
      setIsTransitioning(false);
    }, 400);
  };

  const handleSubmitInput = async () => {
    if (!userInput.trim()) return;
    setIsTransitioning(true);
    
    setTimeout(async () => {
      setAppStage('SEARCHING');
      setIsTransitioning(false);

      try {
        const response = await fetch('https://passionate-jerboa.pikapod.net/webhook/soul-station-search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userName, emotion: selectedEmotion, userInput })
        });

        if (!response.ok) throw new Error(`Webhook Error: ${response.status}`);

        const data = await response.json();
        let verseForEmotion = data.verse_data;

        if (!verseForEmotion) {
           console.warn("API 成功回傳，但找不到對應經文 (verse_data 為空)");
           verseForEmotion = fallbackVerse;
           verseForEmotion.isFallback = true;
        } else {
           verseForEmotion.isFallback = false;
        }

        setTimeout(() => { setIsTransitioning(true); setTimeout(() => { setCurrentVerse(verseForEmotion); setRevealStep(0); setAppStage('RESULT'); setIsTransitioning(false); }, 400); }, 400);
      } catch (error) {
        console.error("AI 連線錯誤，觸發 Fallback:", error);
        let verseForEmotion = fallbackVerse;
        verseForEmotion.isFallback = true;
        setTimeout(() => { setIsTransitioning(true); setTimeout(() => { setCurrentVerse(verseForEmotion); setRevealStep(0); setAppStage('RESULT'); setIsTransitioning(false); }, 400); }, 400);
      }
    }, 400);
  };

  const handleBack = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      if (appStage === 'EMOTION') setAppStage('NAME_INPUT'); 
      else if (appStage === 'INPUT') { setSelectedEmotion(null); setAppStage('EMOTION'); }
      else if (appStage === 'RESULT') { setCurrentVerse(null); setSelectedEmotion(null); setUserInput(''); setRevealStep(0); setAppStage('EMOTION'); }
      setIsTransitioning(false);
    }, 400);
  };

  const handleRevealNext = () => { if (revealStep < 3) setRevealStep(prev => prev + 1); };

  const handleShareApp = async () => {
    const appUrl = window.location.href;
    const shareData = { title: '心靈補給站', text: '來這裡尋找你的平靜吧：', url: appUrl };
    if (navigator.share) {
      try { await navigator.share(shareData); } catch (e) { console.log('分享取消'); }
    } else {
      navigator.clipboard.writeText(`${shareData.text} ${appUrl}`);
      alert("✨ 連結已經複製！");
    }
  };

  const handleCopy = () => {
    const shareText = `我在「心靈補給站」找到了一份平靜：\n\n「${currentVerse?.verse}」\n- ${currentVerse?.reference}`;
    navigator.clipboard.writeText(shareText).then(() => {
      setIsCopied(true); 
      setTimeout(() => setIsCopied(false), 2000); 
    });
  };

  const handleShare = async () => {
    const shareText = `我在「心靈補給站」找到了一份平靜：\n\n「${currentVerse?.verse}」\n- ${currentVerse?.reference}`;
    try { await navigator.clipboard.writeText(shareText); } catch (e) {}
    if (navigator.share) {
      try { await navigator.share({ title: '心靈補給站', text: shareText }); } 
      catch (err) {}
    } else {
      navigator.clipboard.writeText(shareText);
      alert("✨ 經文已經複製！");
    }
  };

  const bgStyle = selectedEmotion ? emotionStyles[selectedEmotion].gradient : "from-[#FDFCF8] to-[#F5F0E6]"; 

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+HK:wght@300;400;500&family=Noto+Serif+HK:wght@300;400;500&family=LXGW+WenKai+TC&display=swap');
        .font-tc-sans { font-family: 'Noto Sans HK', sans-serif; }
        .font-tc-serif { font-family: 'Noto Serif HK', serif; }
        .font-wenkai { font-family: 'LXGW WenKai TC', cursive, serif; }
        @keyframes slideUpFade { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-slide-up { animation: slideUpFade 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @keyframes subtle-breath { 0%, 100% { opacity: 0.8; transform: scale(1); } 50% { opacity: 1; transform: scale(1.02); } }
        .bg-breath { animation: subtle-breath 8s infinite ease-in-out; }
      `}} />

      <div className={`min-h-screen bg-gradient-to-br ${bgStyle} font-tc-sans text-slate-800 flex justify-center transition-colors duration-1000 relative overflow-hidden`}>
        
        {showDoorAnimation && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#FDFCF8] transition-opacity duration-500">
            <div className="flex flex-col items-center justify-center">
              <div className="relative w-36 h-56 sm:w-44 sm:h-64 border-x-[3px] border-t-[3px] border-[#E5C07B]/50 rounded-t-[5rem] sm:rounded-t-[6rem] overflow-hidden shadow-2xl shadow-amber-500/20 bg-white/40">
                <div className="absolute inset-0 bg-gradient-to-t from-[#E5C07B]/70 to-transparent translate-y-full animate-[slideUpFade_1.5s_ease-in-out_forwards]"></div>
                <Sparkles className="absolute top-10 sm:top-12 left-1/2 -translate-x-1/2 w-8 h-8 sm:w-10 sm:h-10 text-[#E5C07B] animate-pulse" strokeWidth={1.5} />
              </div>
            </div>
          </div>
        )}

        <div className="w-full max-w-md bg-white/40 backdrop-blur-2xl min-h-screen shadow-2xl shadow-black/5 relative flex flex-col z-10 border-x border-white/50">
          
          <header className="p-6 pb-2 pt-12 flex items-center justify-between z-20 sticky top-0 bg-gradient-to-b from-white/80 to-transparent">
            <div className="flex-1 flex justify-start">
              {(appStage === 'EMOTION' || appStage === 'INPUT' || appStage === 'RESULT') && (
                <button onClick={handleBack} className="p-2 -ml-2 rounded-full hover:bg-black/5 transition-all"><ChevronLeft className="w-6 h-6 text-slate-500" strokeWidth={1.5} /></button>
              )}
            </div>
            <div className="flex flex-col items-center flex-none">
              <Sparkles className="w-4 h-4 text-[#E5C07B] mb-1" />
              <h1 className="text-[15px] font-tc-serif font-medium tracking-[0.3em] text-slate-600 uppercase">心靈補給站</h1>
            </div>
            <div className="flex-1 flex justify-end items-center gap-3">
              <button onClick={() => setShowInstallModal(true)} className="text-[#8C8273] hover:text-[#E5C07B]"><Download className="w-[18px] h-[18px]" strokeWidth={1.5} /></button>
            </div>
          </header>

          <main className={`flex-1 flex flex-col px-6 pb-12 transition-all duration-500 ${isTransitioning ? 'opacity-0 scale-[0.98]' : 'opacity-100 scale-100'}`}>
            
            {appStage === 'NAME_INPUT' && (
              <div className="flex-1 flex flex-col justify-center items-center animate-slide-up pt-6 pb-4">
                <div className="relative mb-10 text-center px-4 w-full">
                  <h2 className="relative text-[24px] sm:text-[28px] font-wenkai mb-5 text-[#5A5245] leading-[1.7]">來到這裡，甚麼都不用做，<br/>只需做最真實的自己。</h2>
                </div>
                <div className="relative px-2 w-full max-w-[85%] z-10">
                  <input type="text" className="w-full bg-white/70 backdrop-blur-md border-2 border-white/90 rounded-[2rem] px-6 py-5 text-[17px] text-center text-[#5A5245] focus:outline-none focus:border-[#E5C07B]/50" placeholder="你的名字 / 暱稱" value={userName} onChange={(e) => setUserName(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && userName.trim()) handleNameSubmit(); }} />
                  <div className="flex justify-center mt-10">
                    <button onClick={handleNameSubmit} disabled={!userName.trim()} className={`px-10 py-4 rounded-full font-medium tracking-[0.2em] text-[15px] transition-all duration-500 ${userName.trim() ? 'bg-[#E5C07B] text-white' : 'bg-white/80 text-[#D1C9BE] cursor-not-allowed'}`} style={userName.trim() ? { backgroundImage: 'linear-gradient(to right, #E5C07B, #d4ad64)' } : {}}>進入空間</button>
                  </div>
                </div>
              </div>
            )}

            {appStage === 'EMOTION' && (
              <div className="flex-1 flex flex-col justify-center animate-slide-up pt-6 pb-4">
                <div className="mb-10 text-center">
                  <h2 className="text-[32px] sm:text-4xl font-wenkai mb-4 text-[#5A5245]">{userName}，你好。</h2>
                </div>
                <div className="grid grid-cols-2 gap-4 px-2">
                  {Object.entries(emotionStyles).map(([emotion, style]) => (
                    <button key={emotion} onClick={() => handleEmotionSelect(emotion)} className={`group relative flex flex-col items-center justify-center p-8 rounded-[2rem] bg-white/60 hover:bg-white backdrop-blur-md border border-white transition-all`}>
                      <div className={`mb-4 p-4 rounded-2xl bg-gradient-to-br ${style.gradient} border ${style.border}`}>{style.icon}</div>
                      <span className={`font-wenkai tracking-wider ${style.accent} text-[16px]`}>{emotion}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {appStage === 'INPUT' && (
              <div className="flex-1 flex flex-col justify-center animate-slide-up mt-4 pt-6">
                <div className="mb-6 px-2">
                  <h2 className="text-[24px] font-wenkai mb-4 text-[#5A5245]">將你嘅感受話畀祂聽吧。</h2>
                </div>
                <div className="relative px-2 z-10">
                  <textarea className={`w-full bg-white/70 backdrop-blur-md border-2 ${emotionStyles[selectedEmotion].border} rounded-[2rem] p-6 pb-16 font-wenkai text-[17px] focus:outline-none h-40`} placeholder={emotionStyles[selectedEmotion].placeholder} value={userInput} onChange={(e) => setUserInput(e.target.value)} />
                  <button onClick={handleSubmitInput} disabled={!userInput.trim()} className={`absolute bottom-4 right-6 w-12 h-12 rounded-full flex items-center justify-center ${userInput.trim() ? 'bg-[#E5C07B] text-white' : 'bg-white/80 text-[#D1C9BE]'}`} style={userInput.trim() ? { backgroundImage: 'linear-gradient(to right, #E5C07B, #d4ad64)' } : {}}><Send className="w-5 h-5 ml-1" /></button>
                </div>
              </div>
            )}

            {appStage === 'SEARCHING' && (
              <div className="flex-1 flex flex-col items-center justify-center animate-slide-up">
                <Loader2 className={`w-8 h-8 animate-spin ${emotionStyles[selectedEmotion].accent} mb-4`} />
                <p className="text-slate-700 font-tc-serif text-xl tracking-widest animate-pulse">正在安靜傾聽...</p>
              </div>
            )}

            {appStage === 'RESULT' && currentVerse && (
              <div className="flex flex-col flex-1 pb-8">
                
                {/* 🌟 終極診斷指示燈 🌟 */}
                <div className="flex justify-center mb-6 animate-slide-up">
                  {currentVerse.isFallback ? (
                    <span className="text-[12px] text-rose-600 font-bold border border-rose-300 bg-rose-50 px-3 py-1.5 rounded-full shadow-sm">🔴 離線備用數據 (n8n 連線失敗/找不到經文)</span>
                  ) : (
                    <span className="text-[12px] text-emerald-600 font-bold border border-emerald-300 bg-emerald-50 px-3 py-1.5 rounded-full shadow-sm">🟢 真實 Supabase 數據 (連線成功)</span>
                  )}
                </div>

                <div className={`p-8 rounded-[2.5rem] mb-6 bg-white/70 backdrop-blur-xl border-2 ${emotionStyles[selectedEmotion].border} shadow-sm animate-slide-up`}>
                  <p className={`text-xs font-medium tracking-[0.2em] uppercase ${emotionStyles[selectedEmotion].accent} mb-4`}>{currentVerse.reference}</p>
                  <p className="text-[22px] font-tc-serif font-light leading-[1.8] text-slate-800">「{currentVerse.verse}」</p>
                </div>

                <div className="space-y-4 mb-8 flex-1">
                  {revealStep >= 0 && currentVerse.q1 && (
                    <div className="space-y-6 animate-slide-up">
                      <div className="bg-slate-100/60 rounded-[1.5rem] p-5 mr-8"><p className="text-[16px] text-slate-600 font-wenkai">「{currentVerse.q1}」</p></div>
                      <div className={`bg-white/95 rounded-[1.5rem] p-6 border-2 ${emotionStyles[selectedEmotion].border} ml-8`}><p className="text-[16px] font-wenkai text-slate-800">{currentVerse.a1}</p></div>
                    </div>
                  )}
                  {revealStep === 0 && (
                     <div className="flex justify-center pt-2 animate-slide-up"><button onClick={handleRevealNext} className={`px-6 py-2.5 rounded-full border-2 ${emotionStyles[selectedEmotion].border} ${emotionStyles[selectedEmotion].accent} text-xs font-bold tracking-widest`}>繼續默想</button></div>
                  )}
                  {revealStep >= 1 && currentVerse.q2 && (
                    <div className="space-y-6 animate-slide-up mt-8">
                      <div className="bg-slate-100/60 rounded-[1.5rem] p-5 mr-8"><p className="text-[16px] text-slate-600 font-wenkai">「{currentVerse.q2}」</p></div>
                      <div className={`bg-white/95 rounded-[1.5rem] p-6 border-2 ${emotionStyles[selectedEmotion].border} ml-8`}><p className="text-[16px] font-wenkai text-slate-800">{currentVerse.a2}</p></div>
                    </div>
                  )}
                   {revealStep === 1 && (
                     <div className="flex justify-center pt-2 animate-slide-up"><button onClick={handleRevealNext} className="w-10 h-10 rounded-full bg-white/60 border border-white/50 text-slate-500 flex items-center justify-center"><ChevronLeft className="w-4 h-4 -rotate-90" strokeWidth={2} /></button></div>
                  )}
                </div>

                {revealStep >= 2 && (
                  <div className="mt-auto border-t border-slate-200/50 pt-8 animate-slide-up">
                    <div className="text-center mb-8 relative"><p className="font-wenkai text-[19px] text-[#5A5245] leading-[1.8] px-4">{currentVerse.conclusion}</p></div>
                    <div className="flex flex-col gap-3 mt-6">
                      <div className="flex gap-3">
                        <button onClick={handleShare} className="flex-1 bg-[#E5C07B] text-white py-4 rounded-[1.5rem] text-[16px] font-wenkai tracking-wider flex items-center justify-center gap-2" style={{ backgroundImage: 'linear-gradient(to right, #E5C07B, #d4ad64)' }}>分享這份平靜</button>
                        <button onClick={handleCopy} className="group relative bg-white/80 border-2 border-[#EAE3D9] text-[#E5C07B] px-6 py-4 rounded-[1.5rem] flex items-center justify-center">{isCopied ? <Check className="w-5 h-5" strokeWidth={2} /> : <Copy className="w-5 h-5" strokeWidth={2} />}</button>

                        {currentVerse.youtube_url && (
                          <a href={currentVerse.youtube_url} target="_blank" rel="noopener noreferrer" className="group relative bg-white/80 border-2 border-[#EAE3D9] text-[#E5C07B] px-6 py-4 rounded-[1.5rem] flex items-center justify-center hover:bg-white transition-colors shadow-sm active:scale-95">
                            <PlayCircle className="w-5 h-5" strokeWidth={2} />
                          </a>
                        )}
                      </div>
                      <button onClick={() => { setIsTransitioning(true); setTimeout(() => { setAppStage('INPUT'); setUserInput(''); setRevealStep(0); setIsTransitioning(false); }, 400); }} className="w-full bg-white/80 border-2 border-[#EAE3D9] text-[#8C8273] font-wenkai tracking-widest py-3.5 rounded-[1.5rem] text-[15px]">想同神講另一件事...</button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      </div>
    </>
  );
}
