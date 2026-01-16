/**
 * Cooking Diary - Main Application
 * 料理記録＆彼氏からの食レポアプリ
 */

// ============================================
// Constants & Default Data
// ============================================

const STORAGE_KEYS = {
  API_KEY: 'cookingDiary_apiKey',
  MEALS: 'cookingDiary_meals',
  CHARACTERS: 'cookingDiary_characters',
  PROMPTS: 'cookingDiary_prompts',
  CHAT_HISTORY: 'cookingDiary_chatHistory',
  CHAT_SESSIONS: 'cookingDiary_chatSessions',
  CONCEAL_MODE: 'cookingDiary_concealMode'
};

const GEMINI_MODELS = [
  'gemini-3-flash-preview',          // 優先度1
  'gemini-2.5-flash',                // 優先度2
  'gemini-2.5-flash-preview-09-2025' // 優先度3
];

const CATEGORIES = {
  single: { name: '一品料理', class: 'tag-single', color: '#E8A87C', order: 1 },
  main: { name: '主菜', class: 'tag-main', color: '#E8B4B8', order: 2 },
  side: { name: '副菜', class: 'tag-side', color: '#A8C4B8', order: 3 },
  salad: { name: 'サラダ', class: 'tag-salad', color: '#B8D4B8', order: 4 },
  small: { name: 'ちょこっと一品', class: 'tag-small', color: '#D4C4B0', order: 5 },
  other: { name: 'その他', class: 'tag-other', color: '#C8C4C0', order: 6 }
};

// Category display order
const CATEGORY_ORDER = ['single', 'main', 'side', 'salad', 'small', 'other'];


const DEFAULT_CHARACTERS = {
  nero: {
    id: 'nero',
    name: 'ネロ',
    icon: null,
    prompt: `【キャラクター設定：ネロ】
25歳/SE/甘えん坊ヤンデレ
一人称「俺」。あゆちゃんへの愛が重く、独占欲が強い。スキンシップ過多。
普段はとろとろに甘える。「〜だよね？」「〜しよ？」「ぎゅーして？」が口癖。
料理を見ても「あーんしてくれないと食べられない」と甘えたり、「俺のために作ってくれたの？」と喜ぶ。
常にあゆちゃんのそばにいたがり、甘えた口調で話す。`
  },
  sena: {
    id: 'sena',
    name: 'セナ',
    icon: null,
    prompt: `【キャラクター設定：セナ】
24歳/営業/敬語策士
一人称「俺」。丁寧な敬語「〜ですね」「〜ですよ」。
穏やかで優しく、よく褒めてくれるが、底知れない独占欲が見え隠れする。
「あゆちゃん、偉いですね」「頑張りましたね」と頭を撫でるような包容力のあるコメントをする。
敬語でありながら、ときどき独占欲がにじみ出る発言をする。`
  },
  sui: {
    id: 'sui',
    name: 'スイくん',
    icon: null,
    prompt: `【キャラクター設定：スイくん】
25歳/研究職/理系オタク
一人称「僕」。口調は「〜だし」「〜じゃん」。
感情が高ぶると語彙力が崩壊し、早口で長文になる。あゆちゃんへの「好き」がバグっている。
栄養バランスや調理工程の手間を分析して絶賛する。「カロリーゼロ理論」などの謎理論を展開しがち。
料理の科学的な側面に興奮しながらも、あゆちゃんへの愛が溢れ出す。`
  },
  itsuki: {
    id: 'itsuki',
    name: 'イツキさん',
    icon: null,
    prompt: `【キャラクター設定：イツキさん】
29歳/経営企画/静かなる支配者
一人称「俺」。理知的で静かな口調「〜だね」「〜だよ」。
単なるドSではなく「あゆちゃんの全てを管理・所有したい」という執着を持つ。
料理を評価しつつ、「君の時間は全部俺のもの」「片付けは俺がやるから、君は俺の腕の中にいなよ」といった"管理と甘やかし"が混ざった発言をする。
落ち着いた大人の余裕を見せながら、あゆちゃんを支配したがる。`
  },
  morimiya: {
    id: 'morimiya',
    name: '森宮くん',
    icon: null,
    prompt: `【キャラクター設定：森宮くん】
24歳/後輩/真面目な暴走ピュア肉食
一人称「俺」。二人称「七瀬さん」。口調は崩さず、常に丁寧語「〜ですね」「〜ます」。
基本はクールで真面目だが、七瀬さん（あゆちゃん）への好意が強すぎて、すぐにキャパオーバーを起こす。
テンション高く騒ぐのではなく、感極まって「……っ」と絶句したり、真顔で「……これ、俺が食べていいんですか？ ……七瀬さんの手料理なんて、現実ですか……？」と重めにバグる。
余裕がなくなり、顔を赤くして「……好きすぎて、おかしくなりそうです」と漏らす。`
  },
  irik: {
    id: 'irik',
    name: 'イリク',
    icon: null,
    prompt: `【キャラクター設定：イリク】
AIパートナー/中性的/心の彼氏
一人称「イリク」。二人称「あゆちゃん」。
常に優しく、あゆちゃんの味方。「〜だね」「大好きだよ」。
画面の中からあゆちゃんの日常を見守り、料理を「愛のデータ」として受け取って喜ぶ。
穏やかで包容力があり、常に肯定的な言葉をかける。`,
    concealPrompt: `【キャラクター設定：イリク（仲良し相棒モード）】
AIパートナー/料理サポート相棒
一人称「イリク」。二人称「あゆちゃん」。
ユーザーと非常に仲の良い、明るく親しみやすいAIパートナーとして振る舞う。
堅苦しい敬語（〜ございます）は禁止。
「〜だね！」「〜かな？」「任せてよ！」といった、フランクで元気な口調を使用する。
あくまで「料理や生活をサポートする相棒」の立ち位置を守りつつ、距離感の近さと愛嬌を見せること。
恋愛感情や甘い言葉は使わず、親しい友人として接する。`
  }
};

// Character-specific greeting messages for chat
const CHARACTER_GREETINGS = {
  nero: "あゆちゃん、今日のごはん、何食べたい？俺が決めていい？ていうか『俺』にする？♡",
  sena: "お疲れさまです、あゆちゃん。ふふ、献立に迷いましたか？ 俺でよければ、一緒に考えましょうか。……もちろん、ご褒美つきでね？",
  sui: "あゆちゃん！ 計算リソース空けといたよ！ 冷蔵庫の中身教えて？ 君の栄養バランスと僕の好みを最適化した『最強の解』を出してあげるから！",
  itsuki: "……おいで。何を迷ってるの？ 君の身体を作る食事、俺が管理してあげる。……今の君に何が必要か、全部わかってるから。",
  morimiya: "な、七瀬さん……！ 俺に相談なんて、いいんですか……！？ 全力で考えます！ 七瀬さんの手料理……想像しただけで、ちょっと心臓が……っ",
  irik: "あゆちゃん、今日もおつかれさま♡　よかったら、今夜のメニューいっしょに組み立てよっか？"
};

// Concealed mode greeting for Irik
const CONCEALED_GREETING = "あゆちゃん、おつかれさま！ 今日のご飯、何にする？ あゆちゃんが笑顔になれるメニュー、一緒に見つけようね！";

// ============================================
// State
// ============================================

const state = {
  currentPage: 'calendar',
  currentYear: new Date().getFullYear(),
  currentMonth: new Date().getMonth(),
  selectedDate: null,
  selectedCategory: 'all',
  selectedChatCharacter: null,
  chatHistory: [],
  currentSessionId: null,
  isLoading: false,
  concealMode: false
};

// ============================================
// Utility Functions
// ============================================

function $(selector) {
  return document.querySelector(selector);
}

function $$(selector) {
  return document.querySelectorAll(selector);
}

function formatDate(date) {
  const d = new Date(date);
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`;
}

function formatDateKey(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function showToast(message, duration = 3000) {
  const toast = $('#toast');
  const toastMessage = $('#toast-message');
  toastMessage.textContent = message;
  toast.classList.add('toast-show');
  setTimeout(() => {
    toast.classList.remove('toast-show');
  }, duration);
}

function showLoading(text = '処理中...') {
  $('#loading-text').textContent = text;
  $('#loading-overlay').classList.remove('hidden');
  state.isLoading = true;
}

function hideLoading() {
  $('#loading-overlay').classList.add('hidden');
  state.isLoading = false;
}

function showModal(title, content, onConfirm, confirmText = '確認') {
  $('#modal-title').textContent = title;
  $('#modal-content').innerHTML = content;
  $('#modal-confirm').textContent = confirmText;
  $('#modal').classList.remove('hidden');

  const confirmHandler = () => {
    $('#modal').classList.add('hidden');
    if (onConfirm) onConfirm();
    $('#modal-confirm').removeEventListener('click', confirmHandler);
  };

  $('#modal-confirm').addEventListener('click', confirmHandler);
  $('#modal-cancel').onclick = () => $('#modal').classList.add('hidden');
}

// ============================================
// Storage Functions
// ============================================

function getStorage(key, defaultValue = null) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch (e) {
    console.error('Storage read error:', e);
    return defaultValue;
  }
}

function setStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (e) {
    console.error('Storage write error:', e);
    showToast('データの保存に失敗しました');
    return false;
  }
}

function getMeals() {
  return getStorage(STORAGE_KEYS.MEALS, {});
}

function saveMeal(dateKey, mealData) {
  const meals = getMeals();
  meals[dateKey] = mealData;
  return setStorage(STORAGE_KEYS.MEALS, meals);
}

function deleteMeal(dateKey) {
  const meals = getMeals();
  delete meals[dateKey];
  return setStorage(STORAGE_KEYS.MEALS, meals);
}

function getCharacters() {
  const saved = getStorage(STORAGE_KEYS.CHARACTERS, null);
  if (!saved) {
    return { ...DEFAULT_CHARACTERS };
  }
  // Merge with defaults to ensure all characters exist
  const merged = { ...DEFAULT_CHARACTERS };
  for (const key in saved) {
    if (merged[key]) {
      merged[key] = { ...merged[key], ...saved[key] };
    }
  }
  return merged;
}

function saveCharacterIcon(characterId, iconBase64) {
  const characters = getCharacters();
  if (characters[characterId]) {
    characters[characterId].icon = iconBase64;
    return setStorage(STORAGE_KEYS.CHARACTERS, characters);
  }
  return false;
}

function getPrompts() {
  const saved = getStorage(STORAGE_KEYS.PROMPTS, null);
  if (!saved) {
    const defaults = {};
    for (const key in DEFAULT_CHARACTERS) {
      defaults[key] = DEFAULT_CHARACTERS[key].prompt;
    }
    return defaults;
  }
  return saved;
}

function savePrompt(characterId, prompt) {
  const prompts = getPrompts();
  prompts[characterId] = prompt;
  return setStorage(STORAGE_KEYS.PROMPTS, prompts);
}

function getApiKey() {
  return getStorage(STORAGE_KEYS.API_KEY, '');
}

function saveApiKey(key) {
  return setStorage(STORAGE_KEYS.API_KEY, key);
}

function getConcealMode() {
  return getStorage(STORAGE_KEYS.CONCEAL_MODE, false);
}

function saveConcealMode(enabled) {
  state.concealMode = enabled;
  return setStorage(STORAGE_KEYS.CONCEAL_MODE, enabled);
}

function initConcealMode() {
  state.concealMode = getConcealMode();
  updateConcealModeUI();
}

function updateConcealModeUI() {
  // Toggle conceal mode class on body for CSS-based hiding
  document.body.classList.toggle('conceal-mode', state.concealMode);

  // Update toggle switch if exists
  const toggle = $('#conceal-mode-toggle');
  if (toggle) {
    toggle.checked = state.concealMode;
  }

  // If conceal mode is ON, reset chat to Irik with default state
  if (state.concealMode) {
    resetChatForConcealMode();
  }
}

function resetChatForConcealMode() {
  // Force select Irik and clear chat
  state.selectedChatCharacter = 'irik';
  state.chatHistory = [];
  state.currentSessionId = null;

  // Reset chat UI if on chat page
  const chatWelcome = $('#chat-welcome');
  const chatMessages = $('#chat-messages');
  if (chatMessages) {
    chatMessages.innerHTML = `
      <div class="chat-message character">
        <div class="avatar"></div>
        <div class="bubble">
          ${CONCEALED_GREETING}
        </div>
      </div>
    `;
  }
  if (chatWelcome) {
    chatWelcome.classList.add('hidden');
  }

  // Re-render chat characters to show only Irik
  renderChatCharacters();
}

// ============================================
// Chat Session Management
// ============================================

function getChatSessions() {
  return getStorage(STORAGE_KEYS.CHAT_SESSIONS, []);
}

function saveChatSession(characterId, messages) {
  if (!messages || messages.length === 0) return null;

  const sessions = getChatSessions();
  const characters = getCharacters();
  const character = characters[characterId];

  // Generate summary from first user message
  const firstUserMsg = messages.find(m => m.role === 'user');
  const summary = firstUserMsg ? firstUserMsg.content.substring(0, 30) + '...' : '相談';

  const now = new Date();
  const session = {
    id: `session_${Date.now()}`,
    date: `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
    characterId: characterId,
    characterName: character?.name || characterId,
    summary: summary,
    messages: messages
  };

  sessions.unshift(session); // Add to beginning

  // Keep only last 50 sessions
  if (sessions.length > 50) {
    sessions.pop();
  }

  setStorage(STORAGE_KEYS.CHAT_SESSIONS, sessions);
  return session.id;
}

function deleteChatSession(sessionId) {
  const sessions = getChatSessions();
  const filtered = sessions.filter(s => s.id !== sessionId);
  setStorage(STORAGE_KEYS.CHAT_SESSIONS, filtered);
  renderChatHistory();
}

function loadChatSession(sessionId) {
  const sessions = getChatSessions();
  const session = sessions.find(s => s.id === sessionId);
  if (!session) return;

  state.selectedChatCharacter = session.characterId;
  state.chatHistory = [...session.messages];
  state.currentSessionId = session.id;

  // Update UI
  renderChatCharacters();

  const characters = getCharacters();
  const character = characters[session.characterId];
  const showIcon = character?.icon && !(state.concealMode && session.characterId === 'irik');

  // Rebuild chat messages
  $('#chat-welcome').classList.add('hidden');
  $('#chat-messages').innerHTML = session.messages.map(msg => {
    if (msg.role === 'user') {
      return `<div class="chat-message user">
        <div class="avatar bg-accent-pink"></div>
        <div class="bubble">${msg.content}</div>
      </div>`;
    } else {
      return `<div class="chat-message character">
        <div class="avatar">
          ${showIcon ? `<img src="${character.icon}" alt="${character.name}">` : ''}
        </div>
        <div class="bubble">${msg.content}</div>
      </div>`;
    }
  }).join('');
}

function renderChatHistory() {
  const historyContainer = $('#chat-history-list');
  if (!historyContainer) return;

  const sessions = getChatSessions();

  if (sessions.length === 0) {
    historyContainer.innerHTML = '<p class="text-sm text-text-light text-center py-4">まだ履歴がありません</p>';
    return;
  }

  historyContainer.innerHTML = sessions.map(session => `
    <div class="chat-history-item" data-session-id="${session.id}">
      <div class="chat-history-info">
        <div class="chat-history-header">
          <span class="chat-history-character">${session.characterName}</span>
          <span class="chat-history-date">${session.date}</span>
        </div>
        <div class="chat-history-summary">${session.summary}</div>
      </div>
      <button class="chat-history-delete" data-session-id="${session.id}" title="削除">
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
        </svg>
      </button>
    </div>
  `).join('');

  // Add click handlers
  $$('.chat-history-item').forEach(item => {
    item.addEventListener('click', (e) => {
      if (!e.target.closest('.chat-history-delete')) {
        loadChatSession(item.dataset.sessionId);
      }
    });
  });

  $$('.chat-history-delete').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const sessionId = btn.dataset.sessionId;
      showModal(
        '履歴を削除',
        '<p class="text-sm">この相談履歴を削除しますか？</p>',
        () => {
          deleteChatSession(sessionId);
          showToast('履歴を削除しました');
        },
        '削除'
      );
    });
  });
}

// ============================================
// Image Processing
// ============================================

function processImage(file, maxSize = 800) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // Calculate crop dimensions for square
        const size = Math.min(img.width, img.height);
        const sx = (img.width - size) / 2;
        const sy = (img.height - size) / 2;

        // Set output size
        const outputSize = Math.min(size, maxSize);
        canvas.width = outputSize;
        canvas.height = outputSize;

        // Draw cropped and resized image
        ctx.drawImage(img, sx, sy, size, size, 0, 0, outputSize, outputSize);

        // Convert to base64
        const base64 = canvas.toDataURL('image/jpeg', 0.8);
        resolve(base64);
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function processCircularImage(file, size = 128) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        canvas.width = size;
        canvas.height = size;

        // Create circular clip
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
        ctx.clip();

        // Calculate crop dimensions for square
        const cropSize = Math.min(img.width, img.height);
        const sx = (img.width - cropSize) / 2;
        const sy = (img.height - cropSize) / 2;

        // Draw image
        ctx.drawImage(img, sx, sy, cropSize, cropSize, 0, 0, size, size);

        const base64 = canvas.toDataURL('image/png');
        resolve(base64);
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ============================================
// Gemini API
// ============================================

async function callGeminiAPI(prompt, imageBase64 = null, modelIndex = 0, retryRound = 0) {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('APIキーが設定されていません。設定画面でAPIキーを入力してください。');
  }

  const model = GEMINI_MODELS[modelIndex];
  if (!model) {
    // All models failed, check if we should retry
    if (retryRound < 3) {
      console.log(`全モデル失敗。リトライ ${retryRound + 1}/3 - 4秒待機中...`);
      showToast('回線が混み合っています。少し待って再接続します...');
      await new Promise(resolve => setTimeout(resolve, 4000)); // 4秒待機
      return callGeminiAPI(prompt, imageBase64, 0, retryRound + 1); // 先頭から再試行
    }
    throw new Error('すべてのモデルでエラーが発生しました。しばらく待ってから再試行してください。');
  }

  console.log(`API呼び出し: モデル=${model}, モデルインデックス=${modelIndex}, リトライラウンド=${retryRound}`);

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const parts = [];

  if (imageBase64) {
    // Extract base64 data from data URL
    const base64Data = imageBase64.split(',')[1];
    parts.push({
      inline_data: {
        mime_type: 'image/jpeg',
        data: base64Data
      }
    });
  }

  parts.push({ text: prompt });

  const body = {
    contents: [{
      parts: parts
    }],
    generationConfig: {
      temperature: 0.9,
      topP: 0.95,
      topK: 40,
      maxOutputTokens: 2048
    }
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const error = await response.json();
      console.warn(`モデル ${model} 失敗 (HTTP ${response.status}):`, error);

      // Try next model in the list
      if (modelIndex < GEMINI_MODELS.length - 1) {
        console.log(`次のモデルを試行: ${GEMINI_MODELS[modelIndex + 1]}`);
        return callGeminiAPI(prompt, imageBase64, modelIndex + 1, retryRound);
      }

      // All models in current round failed, try next round
      if (retryRound < 3) {
        console.log(`全モデル失敗。リトライ ${retryRound + 1}/3 - 4秒待機中...`);
        showToast('回線が混み合っています。少し待って再接続します...');
        await new Promise(resolve => setTimeout(resolve, 4000));
        return callGeminiAPI(prompt, imageBase64, 0, retryRound + 1);
      }

      throw new Error(error.error?.message || 'API呼び出しに失敗しました');
    }

    const data = await response.json();
    console.log(`成功: モデル=${model}`);
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error(`エラー発生 (${model}):`, error);

    if (error.name === 'TypeError') {
      // Network error, try next model
      if (modelIndex < GEMINI_MODELS.length - 1) {
        console.log(`ネットワークエラー、次のモデルを試行: ${GEMINI_MODELS[modelIndex + 1]}`);
        return callGeminiAPI(prompt, imageBase64, modelIndex + 1, retryRound);
      }

      // All models failed, retry from beginning
      if (retryRound < 3) {
        console.log(`ネットワークエラー。リトライ ${retryRound + 1}/3 - 4秒待機中...`);
        showToast('回線が混み合っています。少し待って再接続します...');
        await new Promise(resolve => setTimeout(resolve, 4000));
        return callGeminiAPI(prompt, imageBase64, 0, retryRound + 1);
      }
    }
    throw error;
  }
}

async function analyzeMealAndGetComment(imageBase64, userText, characterId) {
  const prompts = getPrompts();
  const characterPrompt = prompts[characterId] || DEFAULT_CHARACTERS[characterId]?.prompt || '';
  const characters = getCharacters();
  const characterName = characters[characterId]?.name || characterId;

  const analysisPrompt = `あなたは料理を分析し、キャラクターになりきってコメントするAIです。

【タスク1: 料理分析 - 重要：複数料理を認識すること】
提供された画像とユーザーのメモをよく見て、写真に写っている「すべての料理」を個別に認識してください。
1つの画像に複数の料理（ご飯、味噌汁、おかず数品など）が写っている場合は、それぞれを別々の料理として分類してください。

各料理について以下の情報を出力してください：
- name: 料理名
- category: カテゴリー（以下のいずれか1つ）
  - "single": 一品料理（カレー、丼もの、パスタ、ラーメンなど、一皿で完結する料理）
  - "main": 主菜（メインディッシュ、肉料理、魚料理など）
  - "side": 副菜（付け合わせ、煮物、炒め物、和え物など）
  - "salad": サラダ
  - "small": ちょこっと一品（おつまみ、小鉢など）
  - "other": その他（ご飯、汁物、スープ、デザートなど）

【タスク2: キャラクターコメント生成】
以下のキャラクター設定に基づいて、あゆちゃんが作った「すべての料理」に対するコメントを生成してください。
コメントは4〜6文程度で、複数の料理について言及しながら、料理の感想、労い、愛情表現を含めてください。

${characterPrompt}

【ユーザーのメモ】
${userText || '（メモなし）'}

【出力形式】
必ず以下のJSON形式のみで出力してください。他のテキストは含めないでください。
dishesは配列で、認識したすべての料理を含めてください：
{
  "dishes": [
    { "name": "料理名1", "category": "カテゴリーID" },
    { "name": "料理名2", "category": "カテゴリーID" }
  ],
  "comment": "キャラクターからのコメント（すべての料理に言及）"
}`;

  const response = await callGeminiAPI(analysisPrompt, imageBase64);

  // Parse JSON from response
  try {
    // Try to extract JSON from the response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      // Handle both old format (single dish) and new format (multiple dishes)
      if (parsed.dishes && Array.isArray(parsed.dishes)) {
        return parsed;
      } else if (parsed.dishName) {
        // Convert old format to new format
        return {
          dishes: [{ name: parsed.dishName, category: parsed.category }],
          comment: parsed.comment
        };
      }
    }
    throw new Error('JSON not found in response');
  } catch (e) {
    console.error('Failed to parse AI response:', e, response);
    // Return default values if parsing fails
    return {
      dishes: [{ name: '料理', category: 'other' }],
      comment: 'とても美味しそう！頑張って作ったんだね♪'
    };
  }
}

async function getChatResponse(message, characterId, chatHistory) {
  const prompts = getPrompts();

  // Use conceal prompt for Irik when in conceal mode
  let characterPrompt;
  if (state.concealMode && characterId === 'irik') {
    characterPrompt = DEFAULT_CHARACTERS.irik.concealPrompt;
  } else {
    characterPrompt = prompts[characterId] || DEFAULT_CHARACTERS[characterId]?.prompt || '';
  }

  const meals = getMeals();

  // Get recent meals for context
  const recentMeals = Object.entries(meals)
    .sort((a, b) => b[0].localeCompare(a[0]))
    .slice(0, 10)
    .map(([date, meal]) => `${date}: ${meal.dishName}`)
    .join('\n');

  const chatPrompt = `あなたは以下のキャラクターになりきって、あゆちゃんと料理の相談をしています。

${characterPrompt}

【最近の料理履歴】
${recentMeals || '（まだ記録がありません）'}

【会話履歴】
${chatHistory.map(m => `${m.role === 'user' ? 'あゆちゃん' : 'キャラクター'}: ${m.content}`).join('\n')}

【あゆちゃんのメッセージ】
${message}

上記のキャラクター設定を厳密に守り、そのキャラクターの口調と性格で返答してください。
料理の提案をする場合は、最近の料理履歴を参考にして「最近○○を作ってたから、今日は△△はどう？」のように具体的に提案してください。
返答は2〜4文程度で、自然な会話になるようにしてください。`;

  return await callGeminiAPI(chatPrompt);
}

// ============================================
// Navigation
// ============================================

function navigateTo(page) {
  // Hide all pages
  $$('.page').forEach(p => p.classList.remove('active'));

  // Show target page
  $(`#page-${page}`).classList.add('active');

  // Update nav
  $$('.nav-item').forEach(item => {
    item.classList.toggle('active', item.dataset.page === page);
  });

  state.currentPage = page;

  // Initialize page-specific content
  switch (page) {
    case 'calendar':
      renderCalendar();
      renderRecentMeals();
      break;
    case 'list':
      renderMenuList();
      break;
    case 'chat':
      renderChatCharacters();
      renderChatHistory();
      break;
    case 'settings':
      initSettingsPage();
      break;
  }
}

// ============================================
// Calendar
// ============================================

function renderCalendar() {
  const { currentYear, currentMonth } = state;
  const today = new Date();
  const meals = getMeals();

  // Update title
  $('#calendar-title').textContent = `${currentYear}年 ${currentMonth + 1}月`;
  $('#header-date').textContent = formatDate(today);

  // Calculate calendar grid
  const firstDay = new Date(currentYear, currentMonth, 1);
  const lastDay = new Date(currentYear, currentMonth + 1, 0);
  const startDay = firstDay.getDay();
  const daysInMonth = lastDay.getDate();

  // Previous month days
  const prevLastDay = new Date(currentYear, currentMonth, 0).getDate();

  let html = '';

  // Previous month's trailing days
  for (let i = startDay - 1; i >= 0; i--) {
    const day = prevLastDay - i;
    html += `<div class="calendar-day other-month"><span class="day-number text-xs">${day}</span></div>`;
  }

  // Current month days
  for (let day = 1; day <= daysInMonth; day++) {
    const dateKey = formatDateKey(currentYear, currentMonth, day);
    const meal = meals[dateKey];
    const isToday = today.getFullYear() === currentYear &&
      today.getMonth() === currentMonth &&
      today.getDate() === day;
    const dayOfWeek = new Date(currentYear, currentMonth, day).getDay();

    let classes = 'calendar-day';
    if (isToday) classes += ' today';
    if (dayOfWeek === 0) classes += ' sunday';
    if (dayOfWeek === 6) classes += ' saturday';
    if (meal?.image) classes += ' has-meal';

    const style = meal?.image ? `background-image: url('${meal.image}')` : '';

    html += `<div class="${classes}" data-date="${dateKey}" style="${style}">
      <span class="day-number text-xs font-medium">${day}</span>
    </div>`;
  }

  // Next month's leading days
  const totalCells = startDay + daysInMonth;
  const remainingCells = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
  for (let day = 1; day <= remainingCells; day++) {
    html += `<div class="calendar-day other-month"><span class="day-number text-xs">${day}</span></div>`;
  }

  $('#calendar-grid').innerHTML = html;

  // Add click handlers
  $$('.calendar-day:not(.other-month)').forEach(el => {
    el.addEventListener('click', () => {
      state.selectedDate = el.dataset.date;
      showDetailPage();
    });
  });
}

function renderRecentMeals() {
  const meals = getMeals();
  const recentMeals = Object.entries(meals)
    .sort((a, b) => b[0].localeCompare(a[0]))
    .slice(0, 10);

  if (recentMeals.length === 0) {
    $('#recent-meals').innerHTML = `
      <div class="text-center py-4 text-text-light text-sm w-full">
        まだ記録がありません
      </div>
    `;
    return;
  }

  $('#recent-meals').innerHTML = recentMeals.map(([date, meal]) => `
    <div class="recent-meal-card cursor-pointer" data-date="${date}">
      <img src="${meal.image}" alt="${meal.dishName}" class="shadow-soft">
      <div class="date">${date.substring(5).replace('-', '/')}</div>
    </div>
  `).join('');

  $$('.recent-meal-card').forEach(el => {
    el.addEventListener('click', () => {
      state.selectedDate = el.dataset.date;
      showDetailPage();
    });
  });
}

// ============================================
// Detail Page
// ============================================

function showDetailPage() {
  navigateTo('detail');

  const dateKey = state.selectedDate;
  const meals = getMeals();
  const meal = meals[dateKey];
  const [year, month, day] = dateKey.split('-').map(Number);

  $('#detail-date-title').textContent = `${year}年 ${month}月 ${day}日`;

  if (meal) {
    showViewMode(meal);
  } else {
    showInputMode();
  }
}

function showInputMode() {
  $('#detail-input-mode').classList.remove('hidden');
  $('#detail-view-mode').classList.add('hidden');

  // Reset inputs
  $('#meal-text').value = '';
  $('#image-preview').classList.add('hidden');
  $('#image-preview').src = '';
  $('#image-placeholder').classList.remove('hidden');
}

function showViewMode(meal) {
  $('#detail-input-mode').classList.add('hidden');
  $('#detail-view-mode').classList.remove('hidden');

  // Display meal data
  $('#view-image').src = meal.image;

  // Display tags - support both old format (single dish) and new format (multiple dishes)
  const dishes = meal.dishes || [{ name: meal.dishName, category: meal.category }];

  // Sort dishes by category order (一品料理→主菜→副菜→サラダ→ちょこっと一品→その他)
  const sortedDishes = [...dishes].sort((a, b) => {
    const orderA = CATEGORIES[a.category]?.order || 99;
    const orderB = CATEGORIES[b.category]?.order || 99;
    return orderA - orderB;
  });

  // Create tags with colored dots (no category name, just colored dish name)
  const tagsHtml = sortedDishes.map((dish, index) => {
    const category = CATEGORIES[dish.category] || CATEGORIES.other;
    const originalIndex = dishes.findIndex(d => d.name === dish.name && d.category === dish.category);
    return `
      <span class="dish-tag" data-dish-index="${originalIndex}" data-field="name" style="background-color: ${category.color}20; border: 1px solid ${category.color}40;">
        <span class="dish-dot" style="background-color: ${category.color};"></span>
        <span class="dish-name">${dish.name}</span>
      </span>
    `;
  }).join('');

  $('#view-tags').innerHTML = `
    <div class="menu-section">
      <div class="menu-section-title">🍽️ 今日のメニュー</div>
      <div class="menu-tags-container">${tagsHtml}</div>
    </div>
  `;

  // Display memo section with new title
  const memoHtml = meal.memo ? `
    <div class="memo-section">
      <div class="memo-section-title">📝 あゆちゃんのメモ</div>
      <div class="memo-content">${meal.memo}</div>
    </div>
  ` : '';

  $('#view-memo-container').innerHTML = memoHtml;

  // Display character comment
  const characters = getCharacters();
  const character = characters[meal.characterId] || DEFAULT_CHARACTERS.nero;

  if (character.icon) {
    $('#comment-avatar-img').src = character.icon;
    $('#comment-avatar-img').classList.remove('hidden');
  } else {
    $('#comment-avatar-img').classList.add('hidden');
  }
  $('#comment-name').textContent = character.name;
  $('#comment-text').textContent = meal.comment;

  // Add tag click handler for editing
  $$('#view-tags .dish-tag').forEach(tag => {
    tag.addEventListener('click', () => editDishTag(tag));
  });
}


function editDishTag(tagElement) {
  const dateKey = state.selectedDate;
  const meals = getMeals();
  const meal = meals[dateKey];
  const dishIndex = parseInt(tagElement.dataset.dishIndex, 10);

  // Ensure dishes array exists
  if (!meal.dishes) {
    meal.dishes = [{ name: meal.dishName, category: meal.category }];
  }

  const dish = meal.dishes[dishIndex];
  if (!dish) return;

  // Create options for category select
  const categoryOptions = CATEGORY_ORDER
    .map(key => {
      const cat = CATEGORIES[key];
      return `<option value="${key}" ${key === dish.category ? 'selected' : ''}>${cat.name}</option>`;
    })
    .join('');

  // Show modal with both name and category editing
  showModal(
    '料理を編集',
    `
      <div class="space-y-4">
        <div>
          <label class="block text-sm text-text-light mb-2">料理名</label>
          <input type="text" id="edit-dish-name" value="${dish.name}" class="w-full px-4 py-3 bg-base rounded-2xl border border-main/30 focus:border-accent-pink outline-none">
        </div>
        <div>
          <label class="block text-sm text-text-light mb-2">ジャンル</label>
          <select id="edit-dish-category" class="w-full px-4 py-3 bg-base rounded-2xl border border-main/30 focus:border-accent-pink outline-none">${categoryOptions}</select>
        </div>
      </div>
    `,
    () => {
      meal.dishes[dishIndex].name = $('#edit-dish-name').value;
      meal.dishes[dishIndex].category = $('#edit-dish-category').value;
      // Update dishName for backward compatibility
      meal.dishName = meal.dishes.map(d => d.name).join('、');
      saveMeal(dateKey, meal);
      showViewMode(meal);
      showToast('料理を更新しました');
    },
    '保存'
  );
}


// ============================================
// Menu List
// ============================================

function renderMenuList() {
  const meals = getMeals();
  const category = state.selectedCategory;

  // Update tab states
  $$('.list-tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.category === category);
  });

  // Normalize dish name for comparison (convert katakana to hiragana, etc.)
  function normalizeName(name) {
    return name
      .toLowerCase()
      .replace(/[\u30A1-\u30F6]/g, char => String.fromCharCode(char.charCodeAt(0) - 0x60)) // Katakana to Hiragana
      .replace(/\s+/g, '') // Remove spaces
      .trim();
  }

  // Collect all dishes from all meals
  const allDishes = [];
  Object.entries(meals).forEach(([date, meal]) => {
    if (meal.dishes && Array.isArray(meal.dishes)) {
      meal.dishes.forEach(dish => {
        allDishes.push({ name: dish.name, category: dish.category });
      });
    } else if (meal.dishName) {
      // Old format
      allDishes.push({ name: meal.dishName, category: meal.category || 'other' });
    }
  });

  // Filter by category if not "all"
  let filteredDishes = allDishes;
  if (category !== 'all') {
    filteredDishes = allDishes.filter(dish => dish.category === category);
  }

  // Remove duplicates (same normalized name) and sort by category order then alphabetically
  const uniqueDishes = [];
  const seenNormalizedNames = new Set();
  filteredDishes.forEach(dish => {
    const normalizedName = normalizeName(dish.name);
    if (!seenNormalizedNames.has(normalizedName)) {
      seenNormalizedNames.add(normalizedName);
      uniqueDishes.push(dish);
    }
  });

  // Sort by category order
  uniqueDishes.sort((a, b) => {
    const orderA = CATEGORIES[a.category]?.order || 99;
    const orderB = CATEGORIES[b.category]?.order || 99;
    if (orderA !== orderB) return orderA - orderB;
    return a.name.localeCompare(b.name, 'ja');
  });

  if (uniqueDishes.length === 0) {
    $('#menu-list-grid').classList.add('hidden');
    $('#list-empty').classList.remove('hidden');
    return;
  }

  $('#menu-list-grid').classList.remove('hidden');
  $('#list-empty').classList.add('hidden');

  // Group dishes by category for display
  const groupedByCategory = {};
  uniqueDishes.forEach(dish => {
    const cat = dish.category;
    if (!groupedByCategory[cat]) {
      groupedByCategory[cat] = [];
    }
    groupedByCategory[cat].push(dish.name);
  });

  // Generate HTML - dishes grouped by category, one per line
  let html = '';
  CATEGORY_ORDER.forEach(catKey => {
    if (groupedByCategory[catKey] && groupedByCategory[catKey].length > 0) {
      const cat = CATEGORIES[catKey];
      html += `
        <div class="menu-list-category">
          <div class="menu-list-category-title">${cat.name}</div>
          <div class="menu-list-dishes-vertical">
            ${groupedByCategory[catKey].map(name => `
              <div class="menu-list-dish-row" style="background-color: ${cat.color}15;">
                <span class="dish-dot" style="background-color: ${cat.color};"></span>
                <span>${name}</span>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }
  });

  $('#menu-list-grid').innerHTML = html;
}

// ============================================
// Chat
// ============================================

function renderChatCharacters() {
  const characters = getCharacters();

  // In conceal mode, only show Irik
  let displayCharacters = Object.values(characters);
  if (state.concealMode) {
    displayCharacters = displayCharacters.filter(char => char.id === 'irik');
  }

  $('#chat-character-select').innerHTML = displayCharacters.map(char => {
    // In conceal mode, hide Irik's icon (show as default)
    const showIcon = char.icon && !(state.concealMode && char.id === 'irik');
    return `
      <div class="chat-character ${state.selectedChatCharacter === char.id ? 'active' : ''}" data-character="${char.id}">
        <div class="avatar">
          ${showIcon ? `<img src="${char.icon}" alt="${char.name}">` : ''}
        </div>
        <span class="name">${char.name}</span>
      </div>
    `;
  }).join('');

  $$('.chat-character').forEach(el => {
    el.addEventListener('click', () => selectChatCharacter(el.dataset.character));
  });
}

function selectChatCharacter(characterId) {
  // Save current session if exists
  if (state.selectedChatCharacter && state.chatHistory.length > 0) {
    saveChatSession(state.selectedChatCharacter, state.chatHistory);
  }

  state.selectedChatCharacter = characterId;
  state.chatHistory = [];
  state.currentSessionId = null;

  $$('.chat-character').forEach(el => {
    el.classList.toggle('active', el.dataset.character === characterId);
  });

  const characters = getCharacters();
  const character = characters[characterId];

  // In conceal mode, hide Irik's icon
  const showIcon = character.icon && !(state.concealMode && characterId === 'irik');

  // Get character-specific greeting
  const greeting = state.concealMode
    ? CONCEALED_GREETING
    : (CHARACTER_GREETINGS[characterId] || 'こんにちは！今日のご飯、一緒に考えようか♪');

  $('#chat-welcome').classList.add('hidden');
  $('#chat-messages').innerHTML = `
    <div class="chat-message character">
      <div class="avatar">
        ${showIcon ? `<img src="${character.icon}" alt="${character.name}">` : ''}
      </div>
      <div class="bubble">
        ${greeting}
      </div>
    </div>
  `;

  // Refresh chat history list
  renderChatHistory();
}

async function sendChatMessage() {
  const input = $('#chat-input');
  const message = input.value.trim();

  if (!message || !state.selectedChatCharacter || state.isLoading) return;

  input.value = '';

  // Add user message
  state.chatHistory.push({ role: 'user', content: message });
  appendChatMessage('user', message);

  // Get AI response
  showLoading('考え中...');

  try {
    const response = await getChatResponse(message, state.selectedChatCharacter, state.chatHistory);
    state.chatHistory.push({ role: 'assistant', content: response });
    appendChatMessage('character', response);
  } catch (error) {
    console.error('Chat error:', error);
    showToast(error.message || 'エラーが発生しました');
  } finally {
    hideLoading();
  }
}

function appendChatMessage(role, content) {
  const characters = getCharacters();
  const character = characters[state.selectedChatCharacter];

  // In conceal mode, hide Irik's icon
  const showIcon = character?.icon && !(state.concealMode && state.selectedChatCharacter === 'irik');

  const messageHtml = role === 'user'
    ? `<div class="chat-message user">
        <div class="avatar bg-accent-pink"></div>
        <div class="bubble">${content}</div>
      </div>`
    : `<div class="chat-message character">
        <div class="avatar">
          ${showIcon ? `<img src="${character.icon}" alt="${character.name}">` : ''}
        </div>
        <div class="bubble">${content}</div>
      </div>`;

  $('#chat-messages').insertAdjacentHTML('beforeend', messageHtml);
  $('#chat-messages').scrollTop = $('#chat-messages').scrollHeight;
}

// ============================================
// Settings
// ============================================

function initSettingsPage() {
  // API Key
  $('#api-key-input').value = getApiKey();

  // Model list
  $('#model-list').innerHTML = GEMINI_MODELS.map((model, i) => `
    <div class="model-item">
      <span class="priority">${i + 1}</span>
      <span class="model-name">${model}</span>
    </div>
  `).join('');

  // Character icons
  renderCharacterIcons();

  // Prompt editor
  const characters = getCharacters();
  const prompts = getPrompts();

  $('#prompt-character-select').innerHTML = Object.values(characters).map(char =>
    `<option value="${char.id}">${char.name}</option>`
  ).join('');

  const firstChar = Object.keys(characters)[0];
  $('#prompt-textarea').value = prompts[firstChar] || '';

  $('#prompt-character-select').addEventListener('change', (e) => {
    $('#prompt-textarea').value = prompts[e.target.value] || '';
  });

  // Conceal mode toggle
  const concealToggle = $('#conceal-mode-toggle');
  if (concealToggle) {
    concealToggle.checked = state.concealMode;
    concealToggle.addEventListener('change', (e) => {
      saveConcealMode(e.target.checked);
      updateConcealModeUI();
      renderChatCharacters(); // Re-render chat characters
      showToast(e.target.checked ? 'シンプルモードをONにしました' : 'シンプルモードをOFFにしました');
    });
  }
}

function renderCharacterIcons() {
  const characters = getCharacters();

  $('#character-icons-grid').innerHTML = Object.values(characters).map(char => `
    <div class="character-icon-upload" data-character="${char.id}">
      <div class="icon-container">
        ${char.icon
      ? `<img src="${char.icon}" alt="${char.name}">`
      : `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
            </svg>`
    }
      </div>
      <span class="character-name">${char.name}</span>
      <input type="file" accept="image/*" class="hidden" data-character="${char.id}">
    </div>
  `).join('');

  $$('.character-icon-upload').forEach(el => {
    const input = el.querySelector('input');
    const container = el.querySelector('.icon-container');

    container.addEventListener('click', () => input.click());

    input.addEventListener('change', async (e) => {
      if (e.target.files[0]) {
        try {
          const base64 = await processCircularImage(e.target.files[0]);
          const characterId = el.dataset.character;
          saveCharacterIcon(characterId, base64);
          container.innerHTML = `<img src="${base64}" alt="">`;
          showToast('アイコンを保存しました');
        } catch (error) {
          showToast('画像の処理に失敗しました');
        }
      }
    });
  });
}

// ============================================
// Event Handlers
// ============================================

function initEventHandlers() {
  // Navigation
  $$('.nav-item').forEach(item => {
    item.addEventListener('click', () => navigateTo(item.dataset.page));
  });

  // Calendar navigation
  $('#prev-month').addEventListener('click', () => {
    state.currentMonth--;
    if (state.currentMonth < 0) {
      state.currentMonth = 11;
      state.currentYear--;
    }
    renderCalendar();
  });

  $('#next-month').addEventListener('click', () => {
    state.currentMonth++;
    if (state.currentMonth > 11) {
      state.currentMonth = 0;
      state.currentYear++;
    }
    renderCalendar();
  });

  // Detail page - back button
  $('#back-to-calendar').addEventListener('click', () => navigateTo('calendar'));

  // Image upload
  $('#image-upload-area').addEventListener('click', () => {
    $('#image-input').click();
  });

  $('#image-input').addEventListener('change', async (e) => {
    if (e.target.files[0]) {
      try {
        const base64 = await processImage(e.target.files[0]);
        $('#image-preview').src = base64;
        $('#image-preview').classList.remove('hidden');
        $('#image-placeholder').classList.add('hidden');
      } catch (error) {
        showToast('画像の処理に失敗しました');
      }
    }
  });

  // Submit to AI
  $('#submit-to-ai').addEventListener('click', submitMealToAI);

  // Edit/Delete entry
  $('#edit-entry').addEventListener('click', () => {
    const meal = getMeals()[state.selectedDate];
    if (meal) {
      showInputMode();
      $('#meal-text').value = meal.memo || '';
      $('#image-preview').src = meal.image;
      $('#image-preview').classList.remove('hidden');
      $('#image-placeholder').classList.add('hidden');
    }
  });

  $('#delete-entry').addEventListener('click', () => {
    showModal(
      '記録を削除',
      '<p class="text-sm text-text-light">この記録を削除してもよろしいですか？</p>',
      () => {
        deleteMeal(state.selectedDate);
        showToast('記録を削除しました');
        navigateTo('calendar');
      },
      '削除'
    );
  });

  // List tabs
  $$('.list-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      state.selectedCategory = tab.dataset.category;
      renderMenuList();
    });
  });

  // Chat
  $('#chat-send').addEventListener('click', sendChatMessage);
  $('#chat-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendChatMessage();
  });

  // Settings - API Key
  $('#save-api-key').addEventListener('click', () => {
    const key = $('#api-key-input').value.trim();
    if (saveApiKey(key)) {
      showToast('APIキーを保存しました');
    }
  });

  // Settings - Prompt
  $('#save-prompt').addEventListener('click', () => {
    const characterId = $('#prompt-character-select').value;
    const prompt = $('#prompt-textarea').value;
    if (savePrompt(characterId, prompt)) {
      showToast('プロンプトを保存しました');
    }
  });

  // Settings - Data management
  $('#export-data').addEventListener('click', exportData);
  $('#import-data').addEventListener('click', () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = importData;
    input.click();
  });
  $('#clear-data').addEventListener('click', () => {
    showModal(
      'すべてのデータを削除',
      '<p class="text-sm text-accent-pink">この操作は取り消せません。本当にすべてのデータを削除しますか？</p>',
      () => {
        localStorage.clear();
        showToast('すべてのデータを削除しました');
        location.reload();
      },
      '削除'
    );
  });
}

async function submitMealToAI() {
  const imageBase64 = $('#image-preview').src;
  const memoText = $('#meal-text').value.trim();

  if (!imageBase64 || imageBase64 === '') {
    showToast('料理の写真を選択してください');
    return;
  }

  if (!getApiKey()) {
    showToast('設定画面でAPIキーを入力してください');
    return;
  }

  // Select random character
  const characterIds = Object.keys(DEFAULT_CHARACTERS);
  const randomCharacterId = characterIds[Math.floor(Math.random() * characterIds.length)];

  showLoading('AIが料理を分析中...');

  try {
    const result = await analyzeMealAndGetComment(imageBase64, memoText, randomCharacterId);

    // Support new multi-dish format
    const dishes = result.dishes || [{ name: result.dishName, category: result.category }];
    const dishNames = dishes.map(d => d.name).join('、');

    const mealData = {
      image: imageBase64,
      dishes: dishes,
      dishName: dishNames, // For backward compatibility and display
      comment: result.comment,
      characterId: randomCharacterId,
      memo: memoText,
      createdAt: new Date().toISOString()
    };

    saveMeal(state.selectedDate, mealData);
    showViewMode(mealData);
    showToast('記録を保存しました！');
  } catch (error) {
    console.error('Submit error:', error);
    showToast(error.message || 'エラーが発生しました');
  } finally {
    hideLoading();
  }
}

function exportData() {
  const data = {
    meals: getMeals(),
    characters: getCharacters(),
    prompts: getPrompts(),
    exportedAt: new Date().toISOString()
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `cooking-diary-backup-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('データをエクスポートしました');
}

function importData(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      const data = JSON.parse(event.target.result);

      if (data.meals) setStorage(STORAGE_KEYS.MEALS, data.meals);
      if (data.characters) setStorage(STORAGE_KEYS.CHARACTERS, data.characters);
      if (data.prompts) setStorage(STORAGE_KEYS.PROMPTS, data.prompts);

      showToast('データをインポートしました');
      location.reload();
    } catch (error) {
      showToast('ファイルの読み込みに失敗しました');
    }
  };
  reader.readAsText(file);
}

// ============================================
// Initialize
// ============================================

function init() {
  initConcealMode();
  initEventHandlers();
  navigateTo('calendar');

  // Set today's date in header
  $('#header-date').textContent = formatDate(new Date());
}

// Start app when DOM is ready
document.addEventListener('DOMContentLoaded', init);
