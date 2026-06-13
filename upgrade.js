import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://oylemsbvdcxqawmrufxt.supabase.co';
const SUPABASE_KEY = 'sb_publishable_BbUDz-IRGziPBHqyHfkg_A_DveczOdA'; 
// 👇 貼上你嘅 Cohere API Key 👇
const COHERE_API_KEY = '你嘅_COHERE_API_KEY_貼喺度'; 

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function runUpgrade() {
  console.log('🚀 開始使用 Cohere AI (免翻牆) 掃描未有坐標嘅經文...');

  const { data: verses, error } = await supabase.from('daily_verses').select('*').is('embedding', null);

  if (error || !verses || verses.length === 0) {
    console.log('✅ 讀取失敗或所有經文已升級！');
    return;
  }

  let count = 0;
  for (const verse of verses) {
    try {
      const textToEmbed = `${verse.mood_tags || ''} ${verse.verse || ''} ${verse.q1 || ''} ${verse.a1 || ''}`.trim();

      // 直接 Call Cohere API，唔需要裝額外外掛
      const res = await fetch('https://api.cohere.ai/v1/embed', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${COHERE_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          texts: [textToEmbed],
          model: 'embed-multilingual-v3.0',
          input_type: 'search_document'
        })
      });

      const data = await res.json();
      if (!data.embeddings) throw new Error("API 冇回傳坐標，可能係 Key 錯咗");
      
      const embedding = data.embeddings[0];

      const { error: updateError } = await supabase.from('daily_verses').update({ embedding }).eq('id', verse.id);

      if (updateError) throw updateError;
      
      count++;
      console.log(`✅ [${count}/${verses.length}] 成功注入 Cohere 坐標: ${verse.reference}`);
      
      // 停頓 1.5 秒避免免費帳號被限速
      await new Promise(resolve => setTimeout(resolve, 1500));

    } catch (err) {
      console.error(`⚠️ 處理 ${verse.reference} 發生錯誤:`, err.message);
    }
  }
  console.log('🎉 全部升級完成！資料庫依家擁有無限制嘅 Cohere 大腦！');
}

runUpgrade();