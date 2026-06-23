import React, { useState, useEffect, useMemo, Component } from 'react';
import { ChevronLeft, MessageCircle, Heart, Wind, Compass, Coffee, Sparkles, Send, Loader2, User, Copy, Check, Download, Share2, MoreVertical, PlayCircle } from 'lucide-react';

// 🛡️ 1. CTO 級防白屏安全氣袋 (Error Boundary)
// ==========================================
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("🚨 成功攔截白屏死機:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: '100vh', backgroundColor: '#FDFCF8', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px', fontFamily: '"Noto Sans HK", sans-serif' }}>
          <div style={{ textAlign: 'center', maxWidth: '400px' }}>
            <div style={{ backgroundColor: '#FEE2E2', color: '#DC2626', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: '24px' }}>
              🚧
            </div>
            <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: '#4A5568', marginBottom: '16px' }}>
              哎呀！尋找平靜的過程遇到少許阻滯
            </h2>
            <p style={{ fontSize: '15px', color: '#718096', lineHeight: '1.6', marginBottom: '30px' }}>
              如果你正使用 <strong>WhatsApp、Instagram 或 Facebook</strong> 直接開啟此網頁，某些手機隱私限制可能會令畫面無法正常顯示。
            </p>
            
            <div style={{ backgroundColor: '#F7FAFC', borderRadius: '16px', padding: '24px', border: '1px solid #E2E8F0', textAlign: 'left', marginBottom: '30px' }}>
              <p style={{ fontWeight: 'bold', color: '#2D3748', marginBottom: '12px' }}>💡 快速修復方法：</p>
              <ul style={{ paddingLeft: '20px', color: '#4A5568', lineHeight: '1.8', fontSize: '14px', margin: 0 }}>
                <li>點擊畫面右上角或右下角的選單 <strong>「...」</strong></li>
                <li>選擇 <strong>「在 Safari 開啟」</strong> 或 <strong>「在系統瀏覽器開啟」</strong> 🌐</li>
              </ul>
            </div>

            <button 
              onClick={() => window.location.reload()}
              style={{ backgroundColor: '#4A5568', color: 'white', border: 'none', padding: '14px 28px', borderRadius: '30px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', width: '100%', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
            >
              🔄 重新載入網頁
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// ==========================================
// 🧘 2. 心靈補給站 主程式 (Soul Station Main)
// ==========================================

// 備用經文庫 (當連線不穩定時的溫柔備案)
const fallbackVerse = {
  id: "fallback-001",
  primary_emotion: "陪伴與被愛",
  reference: "給你的心靈小語",
  verse: "無論此刻你經歷著什麼，請記得你並不孤單。給自己一點時間，慢慢來。",
  mood_tags: ["#平靜", "#同行", "#BETA測試中"],
  q1: "點解系統好似冇反應？",
  a1: "因為我哋嘅應用程式依家處於 BETA 測試階段，伺服器可能需要少少時間休息同調整。唔使擔心，我哋嘅團隊正在努力優化中。",
  q2: "我依家應該點做？",
  a2: "你可以嘗試稍後再重新載入頁面。喺等待嘅時候，不妨深呼吸，俾自己幾分鐘安靜嘅時間。",
  conclusion: "感謝你參與我哋嘅 BETA 測試，陪我哋一齊成長。",
  youtube_url: null,
  isFallback: true
};

// Vercel 安全版 UI 樣式設定
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

function SoulStationMain() {

  // Production ========================================================================================
   const [appStage, setAppStage] = useState('NAME_INPUT');
   const [userName, setUserName] = useState(''); 
   const [selectedEmotion, setSelectedEmotion] = useState(null);
  // =======================================================================================================

// 🚀 CTO 開發捷徑：直接 Skip 走打字，一開網頁直入播片畫面 ==================================
  //const [appStage, setAppStage] = useState('SEARCHING'); 
 // const [userName, setUserName] = useState('測試員'); 
 // const [selectedEmotion, setSelectedEmotion] = useState('平靜與清晰');
  // =======================================================================================================

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

  useEffect(() => {
    try {
      const savedName = localStorage.getItem('soulStationUserName');
      if (savedName) setUserName(savedName); 
    } catch (e) {
      console.warn("無法讀取 localStorage");
    }
  }, []);

  const handleNameSubmit = () => {
    if (!userName.trim()) return;
    try {
      localStorage.setItem('soulStationUserName', userName.trim());
    } catch (e) {
      console.warn("無法寫入 localStorage");
    }
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

        if (!response.ok) throw new Error('AI 連線錯誤');

        const data = await response.json();
        let verseForEmotion = data.verse_data;

        if (!verseForEmotion) {
           verseForEmotion = fallbackVerse;
           verseForEmotion.isFallback = true;
        } else {
           verseForEmotion.isFallback = false;
        }

        setTimeout(() => { setIsTransitioning(true); setTimeout(() => { setCurrentVerse(verseForEmotion); setRevealStep(0); setAppStage('RESULT'); setIsTransitioning(false); }, 400); }, 400);
      } catch (error) {
        console.error("AI 錯誤，啟用 Fallback 機制:", error);
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
    const shareData = {
      title: '心靈補給站',
      text: '「心靈補給站」是一個為你配對專屬經文的智能小助手。寫下你的心情，讓神的話語成為你此刻的力量：',
      url: appUrl
    };
    if (navigator.share) {
      try { await navigator.share(shareData); } catch (e) { console.log('分享應用取消'); }
    } else {
      navigator.clipboard.writeText(`${shareData.text} ${appUrl}`);
      alert("✨ 應用程式連結已經複製！快去發給朋友吧！");
    }
  };

  const handleCopy = () => {
    const shareText = `我在「心靈補給站」透過系統配對，找到了一句很有共鳴的經文：\n\n「${currentVerse?.verse}」\n- ${currentVerse?.reference}\n\n願神的話語也能成為你今天的力量。✨\n\n尋找專屬經文👉 ${window.location.href}`;
    navigator.clipboard.writeText(shareText).then(() => {
      setIsCopied(true); 
      setTimeout(() => setIsCopied(false), 2000); 
    });
  };

  const handleShare = async () => {
    const shareText = `我在「心靈補給站」透過系統配對，找到了一句很有共鳴的經文：\n\n「${currentVerse?.verse}」\n- ${currentVerse?.reference}\n\n願神的話語也能成為你今天的力量。✨`;
    try { await navigator.clipboard.writeText(shareText); } catch (e) {}
    if (navigator.share) {
      try { await navigator.share({ title: '心靈補給站', text: shareText, url: window.location.href }); } 
      catch (err) { console.log('分享取消', err); }
    } else {
      navigator.clipboard.writeText(`${shareText}\n\n尋找專屬經文👉 ${window.location.href}`);
      alert("✨ 經文已經複製！你可以去 WhatsApp 或 IG 貼上分享啦！");
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
        .overflow-y-auto::-webkit-scrollbar { width: 4px; }
        .overflow-y-auto::-webkit-scrollbar-track { background: transparent; }
        .overflow-y-auto::-webkit-scrollbar-thumb { background: rgba(229, 192, 123, 0.3); border-radius: 99px; }
      `}} />

      <div className={`min-h-screen bg-gradient-to-br ${bgStyle} font-tc-sans text-slate-800 flex justify-center transition-colors duration-1000 ease-in-out relative overflow-hidden`}>
        
        {showDoorAnimation && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#FDFCF8] transition-opacity duration-500">
            <div className="flex flex-col items-center justify-center">
              <div className="relative w-36 h-56 sm:w-44 sm:h-64 border-x-[3px] border-t-[3px] border-[#E5C07B]/50 rounded-t-[5rem] sm:rounded-t-[6rem] overflow-hidden shadow-2xl shadow-amber-500/20 bg-white/40">
                <div className="absolute inset-0 bg-gradient-to-t from-[#E5C07B]/70 to-transparent translate-y-full animate-[slideUpFade_1.5s_ease-in-out_forwards]"></div>
                <Sparkles className="absolute top-10 sm:top-12 left-1/2 -translate-x-1/2 w-8 h-8 sm:w-10 sm:h-10 text-[#E5C07B] animate-pulse" strokeWidth={1.5} />
              </div>
              <p className="mt-10 text-[#8C8273] font-tc-serif tracking-[0.3em] text-[14px] sm:text-[15px] animate-pulse">正在為你開啟空間...</p>
            </div>
          </div>
        )}

        {selectedEmotion && <div className="absolute top-[-10%] left-[-10%] w-[120%] h-[120%] bg-white/20 backdrop-blur-[100px] pointer-events-none rounded-full bg-breath"></div>}

        <div className="w-full max-w-md bg-white/40 backdrop-blur-2xl min-h-screen shadow-2xl shadow-black/5 relative flex flex-col z-10 border-x border-white/50">
          
          <header className="p-6 pb-2 pt-12 flex items-center justify-between z-20 sticky top-0 bg-gradient-to-b from-white/80 to-transparent">
            <div className="flex-1 flex justify-start">
              {(appStage === 'EMOTION' || appStage === 'INPUT' || appStage === 'RESULT') && (
                <button onClick={handleBack} className="p-2 -ml-2 rounded-full hover:bg-black/5 transition-all active:scale-90"><ChevronLeft className="w-6 h-6 text-slate-500" strokeWidth={1.5} /></button>
              )}
            </div>
            <div className="flex flex-col items-center flex-none relative">
              <Sparkles className="w-4 h-4 text-[#E5C07B] mb-1" />
              <h1 className="text-[15px] font-tc-serif font-medium tracking-[0.3em] text-slate-600 uppercase">心靈補給站</h1>
              <span className="absolute -top-1 -right-8 text-[9px] font-bold tracking-widest text-[#E5C07B] bg-[#E5C07B]/10 px-1.5 py-0.5 rounded-sm border border-[#E5C07B]/20">BETA</span>
            </div>
            <div className="flex-1 flex justify-end items-center gap-3">
              <button onClick={handleShareApp} className="text-[#8C8273] hover:text-[#E5C07B] transition-colors" title="分享應用程式"><Share2 className="w-[18px] h-[18px]" strokeWidth={1.5} /></button>
              <button onClick={() => setShowInstallModal(true)} className="text-[#8C8273] hover:text-[#E5C07B] transition-colors" title="安裝到主畫面"><Download className="w-[18px] h-[18px]" strokeWidth={1.5} /></button>
            </div>
          </header>

          <main className={`flex-1 flex flex-col px-6 pb-12 transition-all duration-500 ${isTransitioning ? 'opacity-0 scale-[0.98]' : 'opacity-100 scale-100'}`}>
            
            {appStage === 'NAME_INPUT' && (
              <div className="flex-1 flex flex-col justify-center items-center animate-slide-up pt-6 pb-4">
                <div className="relative mb-10 text-center px-4 w-full mt-2">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#E5C07B]/25 blur-[60px] rounded-full pointer-events-none"></div>
                  <h2 className="relative text-[24px] sm:text-[28px] font-wenkai mb-5 text-[#5A5245] leading-[1.7]">來到這裡，甚麼都不用做，<br/>只需做最真實的自己。</h2>
                  <p className="text-[#8C8273] font-wenkai tracking-[0.15em] text-[15px] leading-relaxed mt-4 opacity-90">安靜心靈，在此刻。<br/>請問我該如何稱呼你？</p>
                </div>
                
                <div className="relative px-2 w-full max-w-[85%] z-10">
                  <input type="text" className="w-full bg-white/70 backdrop-blur-md border-2 border-white/90 rounded-[2rem] px-6 py-5 text-[17px] text-center text-[#5A5245] shadow-xl shadow-amber-500/5 focus:outline-none focus:border-[#E5C07B]/50 focus:ring-4 focus:ring-amber-500/10 focus:bg-white/90 transition-all placeholder:text-[#D1C9BE] font-light tracking-widest" placeholder="你的名字 / 暱稱" value={userName} onChange={(e) => setUserName(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && userName.trim()) handleNameSubmit(); }} />
                  <div className="flex justify-center mt-10">
                    <button 
                      onClick={handleNameSubmit} 
                      disabled={!userName.trim()} 
                      className={`px-10 py-4 rounded-full font-medium tracking-[0.2em] text-[15px] transition-all duration-500 flex items-center justify-center gap-2 ${userName.trim() ? 'bg-[#E5C07B] text-white hover:shadow-lg hover:shadow-amber-500/30 active:scale-95 hover:-translate-y-0.5' : 'bg-white/80 text-[#D1C9BE] border border-[#EAE3D9] cursor-not-allowed'}`}
                      style={userName.trim() ? { backgroundImage: 'linear-gradient(to right, #E5C07B, #d4ad64)' } : {}}
                    >
                      進入空間
                    </button>
                  </div>
                </div>
              </div>
            )}

            {appStage === 'EMOTION' && (
              <div className="flex-1 flex flex-col justify-center animate-slide-up pt-6 pb-4">
                <div className="mb-10 sm:mb-14 text-center mt-2">
                  <h2 className="text-[32px] sm:text-4xl font-wenkai mb-4 text-[#5A5245] truncate px-4">{userName}，你好。</h2>
                  <p className="text-[#8C8273] font-wenkai tracking-[0.15em] text-[16px] mt-3">此刻的你，最需要甚麼？</p>
                </div>
                <div className="grid grid-cols-2 gap-4 px-2">
                  {Object.entries(emotionStyles).map(([emotion, style]) => (
                    <button key={emotion} onClick={() => handleEmotionSelect(emotion)} className={`group relative flex flex-col items-center justify-center p-8 rounded-[2rem] transition-all duration-300 active:scale-95 bg-white/60 hover:bg-white backdrop-blur-md border border-white ${style.glow} hover:-translate-y-1`}>
                      <div className={`mb-4 p-4 rounded-2xl bg-gradient-to-br ${style.gradient} border ${style.border} transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>{style.icon}</div>
                      <span className={`font-wenkai tracking-wider ${style.accent} text-[16px]`}>{emotion}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {appStage === 'INPUT' && (
              <div className="flex-1 flex flex-col justify-center animate-slide-up mt-4 pt-6">
                <div className="mb-6 px-2">
                  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/50 border border-white mb-6 text-sm ${emotionStyles[selectedEmotion].accent} shadow-sm`}>
                    {emotionStyles[selectedEmotion].icon}
                    <span className="font-medium tracking-widest">關於{selectedEmotion}</span>
                  </div>
                 <h2 className="text-[24px] sm:text-[26px] font-wenkai mb-4 text-[#5A5245] leading-[1.6]">
                    {userName}，神的話語帶有力量。<br/>寫下感受，讓經文陪伴你吧。
                  </h2>
                  <p className="text-slate-500 font-light tracking-wide text-[15px] leading-relaxed mt-2">
                    寫下你此刻的處境或心情，AI系統將透過語意配對技術為你尋找相關的聖經金句。願神親自透過祂的話語，成為你此時此刻的力量。
                  </p>
                </div>
               <div className="relative px-2 z-10">
                  <textarea 
                    className={`w-full bg-white/70 backdrop-blur-md border-2 ${emotionStyles[selectedEmotion].border} rounded-[2rem] p-6 pb-16 font-wenkai text-[17px] leading-[1.8] text-[#5A5245] shadow-xl shadow-black/5 focus:outline-none focus:ring-4 ${emotionStyles[selectedEmotion].focusRing} focus:bg-white transition-all resize-none h-40`} 
                    placeholder={emotionStyles[selectedEmotion].placeholder} 
                    value={userInput} 
                    onChange={(e) => setUserInput(e.target.value)} 
                  />
                  <button 
                    onClick={handleSubmitInput} 
                    disabled={!userInput.trim()} 
                    className={`absolute bottom-4 right-6 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-md ${userInput.trim() ? 'bg-[#E5C07B] text-white hover:shadow-lg hover:shadow-amber-500/30 active:scale-95' : 'bg-white/80 text-[#D1C9BE] border border-[#EAE3D9] cursor-not-allowed'}`}
                    style={userInput.trim() ? { backgroundImage: 'linear-gradient(to right, #E5C07B, #d4ad64)' } : {}}
                  >
                    <Send className="w-5 h-5 ml-1" />
                  </button>
                </div>
                <div className="mt-6 px-3 animate-slide-up" style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>
                  <p className="text-[14px] font-wenkai tracking-widest text-[#8C8273] opacity-90 mb-4 ml-1">你可以試下直接點擊：</p>
                  <div className="flex flex-wrap gap-3">
                    {emotionStyles[selectedEmotion].suggestions.map((s, i) => (
                      <button key={i} onClick={() => setUserInput(s)} className={`group font-wenkai text-[16px] bg-white/80 backdrop-blur-md border-2 ${emotionStyles[selectedEmotion].border} px-5 py-3 rounded-full text-[#5A5245] hover:bg-white hover:shadow-md hover:-translate-y-0.5 transition-all text-left active:scale-95 shadow-sm flex items-center gap-2.5`}>
                        <MessageCircle className={`w-4 h-4 ${emotionStyles[selectedEmotion].accent} opacity-60 group-hover:opacity-100 transition-opacity`} />{s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {appStage === 'SEARCHING' && (
              <div className="flex-1 flex flex-col items-center justify-center animate-slide-up">
                <div className="relative mb-6 flex justify-center items-center">
                  <div className="absolute inset-0 bg-[#E5C07B]/10 blur-xl rounded-full"></div>
                  <video 
                    src="/searching-bible.mp4" 
                    autoPlay 
                    loop 
                    muted 
                    playsInline
                    className="relative z-10 w-32 h-32 object-cover rounded-2xl shadow-md border-2 border-white/80"
                  />
                </div>
                <p className="text-[#5A5245] font-wenkai text-[18px] tracking-widest animate-pulse mb-2">
                  正在為你查閱經文...
                </p>
                <p className="text-[#8C8273] font-tc-sans text-[12px] tracking-wider opacity-70">
                  請稍候片刻
                </p>
              </div>
            )}

            {appStage === 'RESULT' && currentVerse && (
              <div className="flex flex-col flex-1 pb-8">
                <div className="flex flex-col items-end mb-8 animate-slide-up">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-[10px] font-bold tracking-wider px-2.5 py-0.5 rounded-full border ${emotionStyles[selectedEmotion].border} ${emotionStyles[selectedEmotion].accent} bg-white/60 shadow-sm`}>選擇了「{selectedEmotion}」</span>
                    <span className="text-[11px] font-bold tracking-widest text-slate-500 uppercase">{userName}</span>
                  </div>
                  <div className="bg-slate-700 text-white px-5 py-3.5 rounded-[1.5rem] rounded-tr-sm max-w-[85%] text-[15px] leading-relaxed shadow-md font-wenkai">{userInput}</div>
                </div>
                
                <div className={`p-8 rounded-[2.5rem] mb-6 bg-white/70 backdrop-blur-xl border-2 ${emotionStyles[selectedEmotion].border} shadow-sm relative overflow-hidden animate-slide-up`} style={{ animationDelay: '0.2s', animationFillMode: 'both' }}>
                  <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${emotionStyles[selectedEmotion].gradient} rounded-full blur-2xl opacity-50 -translate-y-1/2 translate-x-1/2`}></div>
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-6">
                      <div className={`p-2 rounded-xl bg-gradient-to-br ${emotionStyles[selectedEmotion].gradient} border ${emotionStyles[selectedEmotion].border}`}>{emotionStyles[selectedEmotion].icon}</div>
                      <p className={`text-xs font-medium tracking-[0.2em] uppercase ${emotionStyles[selectedEmotion].accent}`}>{currentVerse.reference}</p>
                    </div>
                    <p className="text-[22px] font-tc-serif font-light leading-[1.8] mb-8 text-slate-800">「{currentVerse.verse}」</p>
                    <div className="flex flex-wrap gap-2">
                      {currentVerse.mood_tags && (Array.isArray(currentVerse.mood_tags) ? currentVerse.mood_tags : String(currentVerse.mood_tags).split(' ')).map((tag, idx) => (
                        tag && <span key={idx} className="text-[11px] bg-black/5 px-3 py-1.5 rounded-full text-slate-500 tracking-wide">{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-4 mb-8 flex-1">
                  
                  {/* 💡 溫柔引導語 */}
                  {revealStep >= 0 && currentVerse.q1 && (
                    <div className="text-center mb-6 animate-slide-up">
                      <p className="text-[13px] font-wenkai tracking-widest text-[#8C8273] opacity-80 flex items-center justify-center gap-2">
                        <span className="w-8 h-[1px] bg-[#EAE3D9]"></span>
                        跟隨內心的對話，慢慢沉澱
                        <span className="w-8 h-[1px] bg-[#EAE3D9]"></span>
                      </p>
                    </div>
                  )}

                  {/* 🟢 修復：Q1/A1 完美區塊 */}
                  {revealStep >= 0 && currentVerse.q1 && (
                    <div className="space-y-6 animate-slide-up">
                      <div className="bg-slate-100/60 backdrop-blur-md rounded-[1.5rem] rounded-tl-sm p-5 shadow-inner border border-slate-200/60 mr-8 sm:mr-12 relative">
                        <div className="flex items-center gap-2 mb-3"><div className="bg-slate-200/80 p-1.5 rounded-full"><User className="w-3 h-3 text-slate-500" /></div><span className="text-[11px] font-bold tracking-widest text-slate-500 uppercase">內心深處的聲音</span></div>
                        <p className="text-[16px] text-slate-600 font-wenkai leading-[1.8]">「{currentVerse.q1}」</p>
                      </div>
                      <div className={`bg-white/95 backdrop-blur-md rounded-[1.5rem] rounded-tr-sm p-6 border-2 ${emotionStyles[selectedEmotion].border} shadow-lg ${emotionStyles[selectedEmotion].glow} ml-8 sm:ml-12 relative`}>
                        <div className="flex items-center gap-2 mb-3">
                          <div className={`bg-gradient-to-br ${emotionStyles[selectedEmotion].gradient} p-1.5 rounded-full border ${emotionStyles[selectedEmotion].border}`}>
                            <Sparkles className={`w-3.5 h-3.5 ${emotionStyles[selectedEmotion].accent}`} />
                          </div>
                          <span className={`text-[12px] font-bold tracking-widest uppercase ${emotionStyles[selectedEmotion].accent}`}>
                            經文啟示
                          </span>
                        </div>
                        <p className="text-[16px] leading-[1.8] font-wenkai text-slate-800">{currentVerse.a1}</p>
                      </div>
                    </div>
                  )}

                  {/* 🟢 修復：繼續默想按鈕 */}
                  {revealStep === 0 && (
                     <div className="flex justify-center pt-6 pb-2 animate-slide-up">
                        <button onClick={handleRevealNext} className={`flex items-center gap-2 px-8 py-3.5 rounded-full bg-white/80 hover:bg-white backdrop-blur-md border-2 ${emotionStyles[selectedEmotion].border} ${emotionStyles[selectedEmotion].accent} font-wenkai text-[16px] font-bold tracking-widest transition-all shadow-md hover:shadow-lg animate-bounce active:scale-95`}>
                           <span>繼續默想</span>
                           <ChevronLeft className="w-5 h-5 -rotate-90" strokeWidth={2.5} />
                        </button>
                     </div>
                  )}

                  {/* 🟢 Q2/A2 區塊 */}
                  {revealStep >= 1 && currentVerse.q2 && (
                    <div className="space-y-6 animate-slide-up mt-8">
                      <div className="bg-slate-100/60 backdrop-blur-md rounded-[1.5rem] rounded-tl-sm p-5 shadow-inner border border-slate-200/60 mr-8 sm:mr-12 relative">
                        <div className="flex items-center gap-2 mb-3"><div className="bg-slate-200/80 p-1.5 rounded-full"><User className="w-3 h-3 text-slate-500" /></div><span className="text-[11px] font-bold tracking-widest text-slate-500 uppercase">內心深處的聲音</span></div>
                        <p className="text-[16px] text-slate-600 font-wenkai leading-[1.8]">「{currentVerse.q2}」</p>
                      </div>
                      <div className={`bg-white/95 backdrop-blur-md rounded-[1.5rem] rounded-tr-sm p-6 border-2 ${emotionStyles[selectedEmotion].border} shadow-lg ${emotionStyles[selectedEmotion].glow} ml-8 sm:ml-12 relative`}>
                        <div className="flex items-center gap-2 mb-3">
                          <div className={`bg-gradient-to-br ${emotionStyles[selectedEmotion].gradient} p-1.5 rounded-full border ${emotionStyles[selectedEmotion].border}`}>
                            <Sparkles className={`w-3.5 h-3.5 ${emotionStyles[selectedEmotion].accent}`} />
                          </div>
                          <span className={`text-[12px] font-bold tracking-widest uppercase ${emotionStyles[selectedEmotion].accent}`}>
                            經文啟示
                          </span>
                        </div>
                        <p className="text-[16px] leading-[1.8] font-wenkai text-slate-800">{currentVerse.a2}</p>
                      </div>
                    </div>
                  )}

                  {revealStep === 1 && (
                     <div className="flex justify-center pt-8 pb-4 animate-slide-up">
                        <button onClick={handleRevealNext} className={`flex items-center gap-2 px-8 py-3.5 rounded-full bg-white/80 hover:bg-white backdrop-blur-md border-2 ${emotionStyles[selectedEmotion].border} ${emotionStyles[selectedEmotion].accent} font-wenkai text-[16px] font-bold tracking-widest transition-all shadow-md hover:shadow-lg animate-bounce active:scale-95`}>
                           <span>睇埋神嘅總結</span>
                           <ChevronLeft className="w-5 h-5 -rotate-90" strokeWidth={2.5} />
                        </button>
                     </div>
                  )}
                </div>

                {revealStep >= 2 && (
                  <div className="mt-auto border-t border-slate-200/50 pt-8 animate-slide-up">
                    <div className="text-center mb-8 relative">
                      <Sparkles className="w-5 h-5 text-[#E5C07B] absolute left-1/2 -top-6 -translate-x-1/2 opacity-60" />
                      <p className="font-wenkai text-[19px] text-[#5A5245] leading-[1.8] px-4">{currentVerse.conclusion}</p>
                    </div>
                    
                    <div className="flex flex-col gap-3 mt-6">
                      <div className="flex gap-3">
                        <button 
                          onClick={handleShare} 
                          className="flex-1 bg-[#E5C07B] text-white py-4 rounded-[1.5rem] text-[16px] font-wenkai tracking-wider flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-amber-500/30 transition-all active:scale-95 shadow-md"
                          style={{ backgroundImage: 'linear-gradient(to right, #E5C07B, #d4ad64)' }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
                          分享這份平靜
                        </button>
                        
                        <button onClick={handleCopy} className="group relative bg-white/80 border-2 border-[#EAE3D9] text-[#E5C07B] px-6 py-4 rounded-[1.5rem] flex items-center justify-center hover:bg-white transition-colors shadow-sm active:scale-95">
                          {isCopied ? <Check className="w-5 h-5 text-emerald-500" strokeWidth={2} /> : <Copy className="w-5 h-5" strokeWidth={2} />}
                          <span className="absolute -top-12 left-1/2 -translate-x-1/2 bg-[#5A5245] text-[#FDFCF8] text-[12px] font-wenkai tracking-widest px-3.5 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none shadow-lg">
                            {isCopied ? "已複製！" : "複製"}
                            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-[5px] border-transparent border-t-[#5A5245]"></span>
                          </span>
                        </button>

                        {currentVerse.youtube_url && (
                          <a href={currentVerse.youtube_url} target="_blank" rel="noopener noreferrer" className="group relative bg-white/80 border-2 border-[#EAE3D9] text-[#E5C07B] px-6 py-4 rounded-[1.5rem] flex items-center justify-center hover:bg-white transition-colors shadow-sm active:scale-95">
                            <PlayCircle className="w-5 h-5" strokeWidth={2} />
                            <span className="absolute -top-12 left-1/2 -translate-x-1/2 bg-[#5A5245] text-[#FDFCF8] text-[12px] font-wenkai tracking-widest px-3.5 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none shadow-lg z-50">
                              療癒影音
                              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-[5px] border-transparent border-t-[#5A5245]"></span>
                            </span>
                          </a>
                        )}
                      </div>
                      
                      <button onClick={() => { setIsTransitioning(true); setTimeout(() => { setAppStage('INPUT'); setUserInput(''); setRevealStep(0); setIsTransitioning(false); }, 400); }} className="w-full bg-white/80 backdrop-blur-md border-2 border-[#EAE3D9] text-[#8C8273] font-wenkai tracking-widest py-3.5 rounded-[1.5rem] text-[15px] hover:bg-white transition-colors shadow-sm active:scale-95">
                        想同神講另一件事...
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </main>

          {/* 全局優雅 Footer */}
          <div className="w-full pb-6 pt-2 flex flex-col items-center justify-center gap-2.5 z-20 mt-auto opacity-70 hover:opacity-100 transition-opacity">
            <button onClick={() => setShowModal(true)} className="text-[12px] font-wenkai tracking-wider text-[#8C8273] hover:text-[#E5C07B] transition-colors underline underline-offset-4 decoration-[#8C8273]/40 bg-transparent border-none cursor-pointer focus:outline-none">
              關於我們、條款及免責聲明
            </button>
            <p className="text-[11px] font-tc-sans tracking-widest text-[#A39A8E]">
              © 2026 心靈補給站 <span className="mx-1 text-[#EAE3D9]">|</span> 開發團隊: <a href="https://www.facebook.com/profile.php?id=61590310737697" target="_blank" rel="noopener noreferrer" className="text-[#E5C07B] hover:text-[#d4ad64] transition-colors font-medium underline underline-offset-2 decoration-[#E5C07B]/30">懶人工具駅</a>
            </p>
          </div>

        </div>
      </div>

      {/* 🌟 關於我們、條款及免責聲明彈窗 (已去重覆並加入新聲明) */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="bg-[#FDFCF8] border-2 border-[#EAE3D9] w-full max-w-md max-h-[75vh] rounded-[2.5rem] p-8 shadow-2xl flex flex-col justify-between overflow-hidden relative">
            <div className="text-center mb-4 flex flex-col items-center">
              <Sparkles className="w-4 h-4 text-[#E5C07B] mb-1" />
              <h3 className="font-wenkai text-[20px] text-[#5A5245] tracking-widest">關於我們及聲明</h3>
              <div className="w-12 h-[1px] bg-[#EAE3D9] mt-3"></div>
            </div>
            <div className="overflow-y-auto flex-1 my-2 pr-1 space-y-5 text-[14px] font-wenkai text-[#6E6454] leading-relaxed text-justify">
              
              <div>
                <h4 className="text-[#5A5245] font-bold text-[15px] mb-1 tracking-wider">💡 關於心靈補給站</h4>
                <p>「心靈補給站」是一個專為每一個渴望平靜的你預備的安靜角落。我們深信，無論生活多麼喧鬧，每個人都需要一處可以誠實面對內心感受的空間。本程式扮演「電子書僮」的角色，透過 AI 語意配對技術為你尋找適切的聖經金句，作為日常靈修與默想的輔助，願神親自透過祂的話語賜你力量。</p>
              </div>
              
              <div>
                <h4 className="text-[#5A5245] font-bold text-[15px] mb-1 tracking-wider">💬 關於默想對話機制</h4>
                <p>系統中出現的「內心深處的聲音」與「經文啟示」等延伸對話，是 AI 系統根據您輸入的具體處境所生成的「引導式默想」。其目的是為您提供一個消化情緒的過程，幫助您將經文的安慰應用於當下感受之中。請注意，這些對話純屬 AI 的輔助引導，並非神諭，亦非絕對的神學定論。</p>
              </div>
              
              <div>
                <h4 className="text-[#5A5245] font-bold text-[15px] mb-1 tracking-wider">🛠️ 開發團隊</h4>
                <p>本程式由 <span className="text-[#5A5245] font-bold">心靈補給站</span> 策劃，並由 <a href="https://lazytoolsstation.vercel.app/" target="_blank" rel="noopener noreferrer" className="text-[#E5C07B] underline underline-offset-2 font-medium">懶人工具駅</a> 團隊傾力研發。我們致力運用科技為日常生活提供溫暖且實用的輔助工具。</p>
              </div>
              
              <div>
                <h4 className="text-[#5A5245] font-bold text-[15px] mb-1 tracking-wider">⚠️ 免責聲明</h4>
                <p>本程式的經文配對及回應均由 AI 系統輔助分析與整理，所有內容並不代表權威神學釋經、心理諮商或醫療診斷意見。若您正經歷嚴重的心理困擾、抑鬱、焦慮或任何身心危機，本程式無法替代專業救助。請務必及時尋求教會牧者、專業心理醫生、輔導員或醫療機構的正式協助。</p>
              </div>

            </div>
            <button onClick={() => setShowModal(false)} className="w-full mt-4 bg-[#E5C07B] text-white py-3.5 rounded-[1.5rem] font-wenkai text-[15px] tracking-widest hover:shadow-lg hover:shadow-amber-500/20 transition-all active:scale-95" style={{ backgroundImage: 'linear-gradient(to right, #E5C07B, #d4ad64)' }}>我知道了，返回空間</button>
          </div>
        </div>
      )}

      {/* 🌟 全新 PWA 安裝教學彈窗 */}
      {showInstallModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4 pb-8 sm:p-4 animate-in fade-in duration-300">
          <div className="bg-[#FDFCF8] border-2 border-[#EAE3D9] w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl relative animate-in slide-in-from-bottom-8 sm:slide-in-from-bottom-0">
            
            <div className="text-center mb-6 flex flex-col items-center">
              <Download className="w-6 h-6 text-[#E5C07B] mb-2" />
              <h3 className="font-wenkai text-[20px] text-[#5A5245] tracking-widest">安裝「心靈補給站」</h3>
              <p className="text-[13px] text-[#8C8273] mt-2 font-tc-sans tracking-wider">加到手機主畫面，隨時一鍵進入平靜空間</p>
            </div>

            <div className="space-y-5 text-[14px] font-wenkai text-[#6E6454] leading-relaxed">
              <div className="bg-white/60 p-5 rounded-2xl border border-[#EAE3D9] shadow-sm">
                <h4 className="text-[#5A5245] font-bold text-[15px] mb-3 flex items-center gap-2">🍎 蘋果 iOS (Safari)</h4>
                <ol className="list-decimal pl-5 space-y-2">
                  <li>點擊瀏覽器底部的 <span className="inline-flex items-center justify-center bg-gray-100 px-1.5 py-0.5 rounded-md mx-1 border border-gray-200"><Share2 className="w-3.5 h-3.5 text-blue-500" /></span>「分享」圖示</li>
                  <li>在清單中向下滑動，選擇「加入主畫面」</li>
                  <li>點擊右上角的「加入」即可完成</li>
                </ol>
              </div>
              <div className="bg-white/60 p-5 rounded-2xl border border-[#EAE3D9] shadow-sm">
                <h4 className="text-[#5A5245] font-bold text-[15px] mb-3 flex items-center gap-2">🤖 安卓 Android (Chrome)</h4>
                <ol className="list-decimal pl-5 space-y-2">
                  <li>點擊瀏覽器右上角的 <span className="inline-flex items-center justify-center bg-gray-100 px-1.5 py-0.5 rounded-md mx-1 border border-gray-200"><MoreVertical className="w-3.5 h-3.5 text-gray-600" /></span>「選單」圖示</li>
                  <li>在清單中選擇「加到主畫面」或「安裝應用程式」</li>
                  <li>根據系統提示點擊「安裝」即可完成</li>
                </ol>
              </div>
            </div>

            {isInstallable && (
              <button 
                onClick={async () => {
                  if (deferredPrompt) {
                    deferredPrompt.prompt();
                    const { outcome } = await deferredPrompt.userChoice;
                    if (outcome === 'accepted') { setIsInstallable(false); setShowInstallModal(false); }
                    setDeferredPrompt(null);
                  }
                }} 
                className="w-full mt-6 bg-[#E5C07B] text-white py-3.5 rounded-[1.5rem] font-wenkai text-[15px] tracking-widest hover:shadow-lg hover:shadow-amber-500/30 transition-all active:scale-95 flex justify-center items-center gap-2"
                style={{ backgroundImage: 'linear-gradient(to right, #E5C07B, #d4ad64)' }}
              >
                <Download className="w-4 h-4" /> 系統一鍵安裝
              </button>
            )}

            <button onClick={() => setShowInstallModal(false)} className={`w-full ${isInstallable ? 'mt-3' : 'mt-6'} bg-white/80 border-2 border-[#EAE3D9] text-[#8C8273] py-3.5 rounded-[1.5rem] font-wenkai text-[15px] tracking-widest hover:bg-white transition-all active:scale-95`}>
              我知道了
            </button>
          </div>
        </div>
      )}
    </>
  );
}

// ==========================================
// 🛡️ 3. 終極結合：將防護罩笠落主程式度匯出
// ==========================================
export default function App() {
  return (
    <ErrorBoundary>
      <SoulStationMain />
    </ErrorBoundary>
  );
}
