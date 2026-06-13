import React, { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, MessageCircle, Heart, Wind, Compass, Coffee, ExternalLink, Sparkles, Send, Loader2, User } from 'lucide-react';
import Fuse from 'fuse.js';

// === 1. 引入預設嘅 JSON 檔案 ===
import defaultVerses from './verses.json'; 

// === 🚨 萬用保底金句 ===
const fallbackVerse = {
  id: "fallback-001",
  primary_emotion: "陪伴與被愛",
  reference: "馬太福音 11:28",
  verse: "凡勞苦擔重擔的人可以到我這裡來，我就使你們得安息。",
  mood_tags: "#好攰 #需要休息 #頂唔順",
  q1: "我覺得自己真係撐唔住啦...",
  a1: "神睇到你嘅疲倦。祂無要求你做一個完美嘅超人，當你覺得孭唔起身上嘅重擔時，祂張開雙手，邀請你過嚟唞下。你可以將一切嘅委屈同壓力放低喺祂面前。",
  q2: "我唔知點樣先可以真正放鬆...",
  a2: "真正嘅安息，唔係咩都唔做，而係知道有人為你托住個底。試下合埋眼深呼吸，同神講『我交畀祢啦』，俾自己個心放一個短假。",
  conclusion: "容許自己軟弱，因為神嘅懷抱係你最安全嘅休息站。",
  youtube_url: null
};

const emotionStyles = {
  "醫治與忍耐": { 
    gradient: "from-emerald-50/80 to-teal-100/50", accent: "text-emerald-700", border: "border-emerald-400", focusRing: "focus:ring-emerald-200",
    icon: <Heart className="w-6 h-6 text-emerald-600" strokeWidth={1.5} />, glow: "shadow-[0_0_30px_rgba(16,185,129,0.15)]",
    placeholder: "例如：最近身體好差，一直都未好番，覺得好攰好無助...",
    suggestions: ["身體好唔舒服...", "心入面好痛...", "今日精神幾好，感恩！"]
  },
  "平靜與清晰": { 
    gradient: "from-blue-50/80 to-sky-100/50", accent: "text-blue-700", border: "border-blue-400", focusRing: "focus:ring-blue-200",
    icon: <Wind className="w-6 h-6 text-blue-600" strokeWidth={1.5} />, glow: "shadow-[0_0_30px_rgba(59,130,246,0.15)]",
    placeholder: "例如：個腦不停諗嘢，夜晚成日失眠，覺得出面個世界好嘈...",
    suggestions: ["個腦不停轉，失眠...", "好多嘢煩，好大壓力...", "終於有一刻平靜，感恩！"]
  },
  "方向與信心": { 
    gradient: "from-amber-50/80 to-orange-100/50", accent: "text-amber-700", border: "border-amber-400", focusRing: "focus:ring-amber-200",
    icon: <Compass className="w-6 h-6 text-amber-600" strokeWidth={1.5} />, glow: "shadow-[0_0_30px_rgba(245,158,11,0.15)]",
    placeholder: "例如：最近面對轉變，唔知自己揀條路啱唔啱，對未來覺得好迷茫...",
    suggestions: ["對前路好迷茫...", "做錯決定好後悔...", "搵到新方向，好開心！"]
  },
  "陪伴與被愛": { 
    gradient: "from-rose-50/80 to-pink-100/50", accent: "text-rose-700", border: "border-rose-400", focusRing: "focus:ring-rose-200",
    icon: <Coffee className="w-6 h-6 text-rose-600" strokeWidth={1.5} />, glow: "shadow-[0_0_30px_rgba(244,63,94,0.15)]",
    placeholder: "例如：覺得身邊無人明自己，好似做咩都係得自己一個人撐住咁...",
    suggestions: ["覺得身邊無人明我...", "覺得好孤單...", "今日感受到被愛，感恩！"]
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

  // === 💡 2. 初始化數據庫 (加入「自動排毒洗底」機制) ===
  const localDatabase = useMemo(() => {
    try {
      const storedData = localStorage.getItem('soulStation_DB');
      const parsedData = storedData ? JSON.parse(storedData) : null;
      
      // 核心防護：確保讀出嚟嘅嘢係一個陣列，否則當壞數據處理
      if (parsedData && Array.isArray(parsedData) && parsedData.length > 0) {
        console.log("📦 成功從設備載入健康嘅本地數據庫");
        return parsedData;
      } else {
        console.log("🔄 發現有毒/舊緩存！強制洗底並重新載入真 JSON");
        // 如果 defaultVerses 本身有問題（例如唔係陣列），會喺度報錯，保障系統安全
        const safeData = Array.isArray(defaultVerses) ? defaultVerses : [];
        localStorage.setItem('soulStation_DB', JSON.stringify(safeData));
        return safeData;
      }
    } catch (e) {
      console.error("讀取數據庫失敗，洗底重嚟", e);
      const safeData = Array.isArray(defaultVerses) ? defaultVerses : [];
      localStorage.setItem('soulStation_DB', JSON.stringify(safeData));
      return safeData;
    }
  }, []);

  // === 3. 設定 Fuse.js ===
  const fuse = useMemo(() => {
    // 確保有資料先啟動大腦
    if (!localDatabase || localDatabase.length === 0) return null;
    
    const fuseOptions = {
      keys: [
        { name: 'mood_tags', weight: 0.4 },
        { name: 'q1', weight: 0.3 },
        { name: 'q2', weight: 0.2 },
        { name: 'primary_emotion', weight: 0.1 }
      ],
      threshold: 0.6, 
      includeScore: true,
      ignoreLocation: true,
    };
    return new Fuse(localDatabase, fuseOptions);
  }, [localDatabase]);

  useEffect(() => {
    const savedName = localStorage.getItem('soulStationUserName');
    if (savedName) {
      setUserName(savedName);
      setAppStage('EMOTION'); 
    }
  }, []);

  const handleNameSubmit = () => {
    if (!userName.trim()) return;
    localStorage.setItem('soulStationUserName', userName.trim());
    setIsTransitioning(true);
    setTimeout(() => {
      setAppStage('EMOTION');
      setIsTransitioning(false);
    }, 400);
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

  // === 🧠 本地極速智能搜尋 ===
  const findBestVerseLocal = (emotion, input) => {
    // 如果系統連 JSON 都讀唔到，直接畀保底
    if (!fuse || !localDatabase || localDatabase.length === 0) {
       console.log("⚠️ 數據庫為空，啟動終極保底");
       return fallbackVerse;
    }

    const results = fuse.search(input);
    const hasGoodMatch = results.length > 0 && results[0].score <= 0.6;

    // 第一層：精準命中
    if (hasGoodMatch) return results[0].item;

    // 第二層：隨機兜底
    const categoryVerses = localDatabase.filter(v => v.primary_emotion === emotion);
    if (categoryVerses.length > 0) {
      const randomIndex = Math.floor(Math.random() * categoryVerses.length);
      return categoryVerses[randomIndex];
    }

    // 第三層：終極保底
    return fallbackVerse; 
  };

  // === 🧠 連線 n8n 真・AI 大腦 ===
  const handleSubmitInput = async () => {
    if (!userInput.trim()) return;
    setIsTransitioning(true);
    
    setTimeout(async () => {
      setAppStage('SEARCHING');
      setIsTransitioning(false);

      try {
        // 1. 將用家心聲 Send 去你嘅 n8n 秘密通道
        //const response = await fetch('https://passionate-jerboa.pikapod.net/webhook-test/soul-station-search', {
          const response = await fetch('https://passionate-jerboa.pikapod.net/webhook/soul-station-search', {

          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            emotion: selectedEmotion,
            userInput: userInput
          })
        });

        if (!response.ok) throw new Error('AI 連線錯誤');

        // 2. 接收 AI 揀好嘅經文 ID
        const data = await response.json();
        const foundId = data.found_id?.trim();

        // 3. 喺本地庫抽返條完整經文出嚟
        let verseForEmotion = localDatabase.find(v => v.id === foundId);

        // 防護網：萬一 AI 黐線畀錯 ID，自動啟動同情緒保底
        if (!verseForEmotion) {
           console.warn("AI 搵唔到，啟動保底");
           const categoryVerses = localDatabase.filter(v => v.primary_emotion === selectedEmotion);
           verseForEmotion = categoryVerses.length > 0
              ? categoryVerses[Math.floor(Math.random() * categoryVerses.length)]
              : fallbackVerse;
        }

        setTimeout(() => {
          setIsTransitioning(true);
          setTimeout(() => {
            setCurrentVerse(verseForEmotion);
            setRevealStep(0);
            setAppStage('RESULT');
            setIsTransitioning(false);
          }, 400); 
        }, 400);

      } catch (error) {
        console.error("AI 大腦連線失敗:", error);
        // 斷網防護網：無得上網就啟動本地盲抽保底
        const categoryVerses = localDatabase.filter(v => v.primary_emotion === selectedEmotion);
        const verseForEmotion = categoryVerses.length > 0
              ? categoryVerses[Math.floor(Math.random() * categoryVerses.length)]
              : fallbackVerse;

        setTimeout(() => {
          setIsTransitioning(true);
          setTimeout(() => {
            setCurrentVerse(verseForEmotion);
            setRevealStep(0);
            setAppStage('RESULT');
            setIsTransitioning(false);
          }, 400); 
        }, 400);
      }
    }, 400);
  };

  const handleBack = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      if (appStage === 'EMOTION') {
        setAppStage('NAME_INPUT'); 
      } else if (appStage === 'INPUT') {
        setSelectedEmotion(null);
        setAppStage('EMOTION');
      } else if (appStage === 'RESULT') {
        setCurrentVerse(null);
        setSelectedEmotion(null);
        setUserInput('');
        setRevealStep(0);
        setAppStage('EMOTION');
      }
      setIsTransitioning(false);
    }, 400);
  };

  const handleRevealNext = () => {
    if (revealStep < 3) setRevealStep(prev => prev + 1);
  };

  const bgStyle = selectedEmotion 
    ? emotionStyles[selectedEmotion].gradient 
    : "from-slate-50 to-slate-100";

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+HK:wght@300;400;500&family=Noto+Serif+HK:wght@300;400;500&display=swap');
        .font-tc-sans { font-family: 'Noto Sans HK', sans-serif; }
        .font-tc-serif { font-family: 'Noto Serif HK', serif; }
        
        @keyframes slideUpFade { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-slide-up { animation: slideUpFade 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @keyframes subtle-breath { 0%, 100% { opacity: 0.8; transform: scale(1); } 50% { opacity: 1; transform: scale(1.02); } }
        .bg-breath { animation: subtle-breath 8s infinite ease-in-out; }
      `}} />

      <div className={`min-h-screen bg-gradient-to-br ${bgStyle} font-tc-sans text-slate-800 flex justify-center transition-colors duration-1000 ease-in-out relative overflow-hidden`}>
        {selectedEmotion && <div className="absolute top-[-10%] left-[-10%] w-[120%] h-[120%] bg-white/20 backdrop-blur-[100px] pointer-events-none rounded-full bg-breath"></div>}

        <div className="w-full max-w-md bg-white/40 backdrop-blur-2xl min-h-screen shadow-[0_0_40px_rgba(0,0,0,0.03)] relative flex flex-col z-10 border-x border-white/50">
          <header className="p-6 pb-2 pt-12 flex items-center justify-between z-20 sticky top-0 bg-gradient-to-b from-white/80 to-transparent">
            {(appStage === 'EMOTION' || appStage === 'INPUT' || appStage === 'RESULT') ? (
              <button onClick={handleBack} className="p-2 -ml-2 rounded-full hover:bg-black/5 transition-all active:scale-90">
                <ChevronLeft className="w-6 h-6 text-slate-500" strokeWidth={1.5} />
              </button>
            ) : <div className="w-10"></div>}
            <div className="flex flex-col items-center">
              <Sparkles className="w-4 h-4 text-slate-300 mb-1" />
              <h1 className="text-[15px] font-tc-serif font-medium tracking-[0.3em] text-slate-600 uppercase">心靈補給站</h1>
            </div>
            <div className="w-10"></div>
          </header>

          <main className={`flex-1 flex flex-col px-6 pb-12 transition-all duration-500 ${isTransitioning ? 'opacity-0 scale-[0.98]' : 'opacity-100 scale-100'}`}>
            
            {appStage === 'NAME_INPUT' && (
              <div className="flex-1 flex flex-col justify-center animate-slide-up mt-[-5vh]">
                <div className="mb-10 text-center px-4">
                  <h2 className="text-3xl font-tc-serif font-light mb-4 text-slate-800 leading-snug">歡迎來到一個<br/>為你預備嘅專屬空間。</h2>
                  <p className="text-slate-500 font-light tracking-wide text-sm leading-relaxed mt-2">喺開始之前，請問我該如何稱呼你？</p>
                </div>
                <div className="relative px-2">
                  <input type="text" className="w-full bg-white/60 backdrop-blur-md border border-white/80 rounded-[1.5rem] px-6 py-5 text-[16px] text-center text-slate-700 shadow-[0_8px_30px_rgb(0,0,0,0.04)] focus:outline-none focus:ring-2 focus:ring-white/80 focus:bg-white/90 transition-all placeholder:text-slate-400" placeholder="你的名字 / 暱稱" value={userName} onChange={(e) => setUserName(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && userName.trim()) handleNameSubmit(); }} />
                  <div className="flex justify-center mt-8">
                    <button onClick={handleNameSubmit} disabled={!userName.trim()} className={`px-8 py-3.5 rounded-full font-medium tracking-widest text-[14px] transition-all duration-300 shadow-sm flex items-center gap-2 ${userName.trim() ? 'bg-slate-800 text-white hover:bg-slate-700 active:scale-95 hover:shadow-md' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}>開始旅程</button>
                  </div>
                </div>
              </div>
            )}

            {appStage === 'EMOTION' && (
              <div className="flex-1 flex flex-col justify-center animate-slide-up mt-[-5vh]">
                <div className="mb-14 text-center">
                  <h2 className="text-4xl font-tc-serif font-light mb-4 text-slate-800 truncate px-4">{userName}，你好。</h2>
                  <p className="text-slate-500 font-light tracking-widest text-sm mt-3">此刻的你，最需要甚麼？</p>
                </div>
                <div className="grid grid-cols-2 gap-4 px-2">
                  {Object.entries(emotionStyles).map(([emotion, style]) => (
                    <button key={emotion} onClick={() => handleEmotionSelect(emotion)} className={`group relative flex flex-col items-center justify-center p-8 rounded-[2rem] transition-all duration-300 active:scale-95 bg-white/60 hover:bg-white backdrop-blur-md border border-white ${style.glow} hover:-translate-y-1`}>
                      <div className={`mb-4 p-4 rounded-2xl bg-gradient-to-br ${style.gradient} border ${style.border} transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>{style.icon}</div>
                      <span className={`font-medium tracking-wide ${style.accent} text-sm`}>{emotion}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {appStage === 'INPUT' && (
              <div className="flex-1 flex flex-col justify-center animate-slide-up mt-[-10vh]">
                <div className="mb-6 px-2">
                  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/50 border border-white mb-6 text-sm ${emotionStyles[selectedEmotion].accent} shadow-sm`}>{emotionStyles[selectedEmotion].icon}<span className="font-medium tracking-widest">關於{selectedEmotion}</span></div>
                  <h2 className="text-2xl font-tc-serif font-light mb-4 text-slate-800 leading-snug">{userName}，可以同神講多少少<br/>你面對緊嘅事嗎？</h2>
                  <p className="text-slate-500 font-light tracking-wide text-sm leading-relaxed mt-2">寫低你嘅感受，系統會為你從資料庫<br/>尋找最合適嘅說話。</p>
                </div>
                <div className="relative px-2 z-10">
                  <textarea className={`w-full bg-white/70 backdrop-blur-md border-2 ${emotionStyles[selectedEmotion].border} rounded-[2rem] p-6 pb-16 text-[16px] leading-relaxed text-slate-700 shadow-[0_8px_30px_rgb(0,0,0,0.04)] focus:outline-none focus:ring-4 ${emotionStyles[selectedEmotion].focusRing} focus:bg-white transition-all resize-none h-40`} placeholder={emotionStyles[selectedEmotion].placeholder} value={userInput} onChange={(e) => setUserInput(e.target.value)} />
                  <button onClick={handleSubmitInput} disabled={!userInput.trim()} className={`absolute bottom-4 right-6 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-md ${userInput.trim() ? 'bg-slate-800 text-white hover:bg-slate-700 active:scale-95' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}><Send className="w-5 h-5 ml-1" /></button>
                </div>
                <div className="mt-5 px-3 animate-slide-up" style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>
                  <p className="text-[11px] font-bold tracking-widest text-slate-400 uppercase mb-3 ml-1">你可以試下直接點擊：</p>
                  <div className="flex flex-wrap gap-2.5">
                    {emotionStyles[selectedEmotion].suggestions.map((s, i) => (
                      <button key={i} onClick={() => setUserInput(s)} className={`group text-[13.5px] bg-white/80 backdrop-blur-md border-2 ${emotionStyles[selectedEmotion].border} px-4 py-2.5 rounded-full text-slate-600 hover:bg-white hover:text-slate-900 hover:shadow-md hover:-translate-y-0.5 transition-all text-left active:scale-95 shadow-sm flex items-center gap-2`}><MessageCircle className={`w-3.5 h-3.5 ${emotionStyles[selectedEmotion].accent} opacity-60 group-hover:opacity-100 transition-opacity`} />{s}</button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {appStage === 'SEARCHING' && (
              <div className="flex-1 flex flex-col items-center justify-center animate-slide-up">
                <div className="relative mb-8">
                  <div className="absolute inset-0 bg-white/40 blur-xl rounded-full"></div>
                  <div className="relative bg-white/80 p-4 rounded-full shadow-sm border border-white"><Loader2 className={`w-8 h-8 animate-spin ${emotionStyles[selectedEmotion].accent}`} /></div>
                </div>
                <p className="text-slate-700 font-tc-serif text-xl tracking-widest animate-pulse mb-3">正在安靜傾聽...</p>
                <p className="text-slate-500 text-sm font-light tracking-wider">從 {localDatabase?.length || 0} 條設備庫存為你極速檢索</p>
              </div>
            )}

            {appStage === 'RESULT' && currentVerse && (
              <div className="flex flex-col flex-1 pb-8">
                <div className="flex flex-col items-end mb-8 animate-slide-up">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-[10px] font-bold tracking-wider px-2.5 py-0.5 rounded-full border ${emotionStyles[selectedEmotion].border} ${emotionStyles[selectedEmotion].accent} bg-white/60 shadow-sm`}>選擇了「{selectedEmotion}」</span>
                    <span className="text-[11px] font-bold tracking-widest text-slate-500 uppercase">{userName}</span>
                  </div>
                  <div className="bg-slate-700 text-white px-5 py-3.5 rounded-[1.5rem] rounded-tr-sm max-w-[85%] text-[15px] leading-relaxed shadow-md">{userInput}</div>
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
                  {revealStep >= 0 && currentVerse.q1 && (
                    <div className="space-y-6 animate-slide-up">
                      <div className="bg-slate-100/60 backdrop-blur-md rounded-[1.5rem] rounded-tl-sm p-5 shadow-inner border border-slate-200/60 mr-8 sm:mr-12 relative">
                        <div className="flex items-center gap-2 mb-3"><div className="bg-slate-200/80 p-1.5 rounded-full"><User className="w-3 h-3 text-slate-500" /></div><span className="text-[11px] font-bold tracking-widest text-slate-500 uppercase">內心深處的聲音</span></div>
                        <p className="text-[15px] text-slate-600 font-medium leading-relaxed">「{currentVerse.q1}」</p>
                      </div>
                      <div className={`bg-white/95 backdrop-blur-md rounded-[1.5rem] rounded-tr-sm p-6 border-2 ${emotionStyles[selectedEmotion].border} shadow-lg ${emotionStyles[selectedEmotion].glow} ml-8 sm:ml-12 relative`}>
                        <div className="flex items-center gap-2 mb-3"><div className={`bg-gradient-to-br ${emotionStyles[selectedEmotion].gradient} p-1.5 rounded-full border ${emotionStyles[selectedEmotion].border}`}><Sparkles className={`w-3.5 h-3.5 ${emotionStyles[selectedEmotion].accent}`} /></div><span className={`text-[12px] font-bold tracking-widest uppercase ${emotionStyles[selectedEmotion].accent}`}>神的回應</span></div>
                        <p className="text-[15.5px] leading-[1.8] text-slate-800">{currentVerse.a1}</p>
                      </div>
                    </div>
                  )}

                  {revealStep === 0 && (
                     <div className="flex justify-center pt-2 animate-slide-up">
                        <button onClick={handleRevealNext} className={`px-6 py-2.5 rounded-full bg-white/80 hover:bg-white backdrop-blur-md border-2 ${emotionStyles[selectedEmotion].border} ${emotionStyles[selectedEmotion].accent} text-xs font-bold tracking-widest transition-all shadow-sm hover:shadow-md flex items-center gap-2`}>繼續默想</button>
                     </div>
                  )}

                  {revealStep >= 1 && currentVerse.q2 && (
                    <div className="space-y-6 animate-slide-up mt-8">
                      <div className="bg-slate-100/60 backdrop-blur-md rounded-[1.5rem] rounded-tl-sm p-5 shadow-inner border border-slate-200/60 mr-8 sm:mr-12 relative">
                        <div className="flex items-center gap-2 mb-3"><div className="bg-slate-200/80 p-1.5 rounded-full"><User className="w-3 h-3 text-slate-500" /></div><span className="text-[11px] font-bold tracking-widest text-slate-500 uppercase">內心深處的聲音</span></div>
                        <p className="text-[15px] text-slate-600 font-medium leading-relaxed">「{currentVerse.q2}」</p>
                      </div>
                      <div className={`bg-white/95 backdrop-blur-md rounded-[1.5rem] rounded-tr-sm p-6 border-2 ${emotionStyles[selectedEmotion].border} shadow-lg ${emotionStyles[selectedEmotion].glow} ml-8 sm:ml-12 relative`}>
                        <div className="flex items-center gap-2 mb-3"><div className={`bg-gradient-to-br ${emotionStyles[selectedEmotion].gradient} p-1.5 rounded-full border ${emotionStyles[selectedEmotion].border}`}><Sparkles className={`w-3.5 h-3.5 ${emotionStyles[selectedEmotion].accent}`} /></div><span className={`text-[12px] font-bold tracking-widest uppercase ${emotionStyles[selectedEmotion].accent}`}>神的回應</span></div>
                        <p className="text-[15.5px] leading-[1.8] text-slate-800">{currentVerse.a2}</p>
                      </div>
                    </div>
                  )}

                   {revealStep === 1 && (
                     <div className="flex justify-center pt-2 animate-slide-up">
                        <button onClick={handleRevealNext} className="w-10 h-10 rounded-full bg-white/60 hover:bg-white backdrop-blur-md border border-white/50 shadow-sm hover:shadow-md text-slate-500 flex items-center justify-center transition-all"><ChevronLeft className="w-4 h-4 -rotate-90" strokeWidth={2} /></button>
                     </div>
                  )}
                </div>

                {revealStep >= 2 && (
                  <div className="mt-auto border-t border-slate-200/50 pt-8 animate-slide-up">
                    <div className="text-center mb-8 relative">
                      <Sparkles className="w-5 h-5 text-amber-300 absolute left-1/2 -top-6 -translate-x-1/2 opacity-50" />
                      <p className="font-tc-serif text-lg text-slate-800 leading-loose px-4">{currentVerse.conclusion}</p>
                    </div>
                    <div className="flex flex-col gap-3 mt-6">
                      <div className="flex gap-3">
                        <button className="flex-1 bg-slate-900 text-white py-4 rounded-[1.5rem] text-[15px] font-medium flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/20 active:scale-95"><MessageCircle className="w-4 h-4" />分享這份平靜</button>
                        {currentVerse.youtube_url && (
                          <a href={currentVerse.youtube_url} target="_blank" rel="noopener noreferrer" className="bg-white border border-slate-200 text-slate-700 px-6 py-4 rounded-[1.5rem] font-medium flex items-center justify-center hover:bg-slate-50 transition-colors shadow-sm active:scale-95"><ExternalLink className="w-4 h-4" /></a>
                        )}
                      </div>
                      <button onClick={() => { setIsTransitioning(true); setTimeout(() => { setAppStage('INPUT'); setUserInput(''); setRevealStep(0); setIsTransitioning(false); }, 400); }} className="w-full bg-white/60 backdrop-blur-md border border-white text-slate-600 py-3.5 rounded-[1.5rem] text-[14px] font-medium hover:bg-white transition-colors shadow-sm active:scale-95">想同神講另一件事...</button>
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