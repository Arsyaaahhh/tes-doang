// Data Initialization
function seedData() {
    if (!localStorage.getItem('smcc_services')) {
        const defaultServices = [
            { id: 1, name: 'Kesehatan Fisik', desc: 'Layanan konsultasi kesehatan fisik dasar', active: true },
            { id: 2, name: 'Mitigasi Kebencanaan', desc: 'Pelaporan dan informasi mitigasi bencana', active: true },
            { id: 3, name: 'Kesehatan dan Keselamatan Kerja (K3)', desc: 'Layanan pelaporan insiden K3', active: true },
            { id: 4, name: 'Kesehatan Mental', desc: 'Layanan dukungan kesehatan mental awal', active: true }
        ];
        localStorage.setItem('smcc_services', JSON.stringify(defaultServices));
    }

    if (!localStorage.getItem('smcc_questions')) {
        const defaultQuestions = [
            { id: 1, serviceId: 1, text: 'Apa permasalahan fisik yang ingin Anda sampaikan?', type: 'text', options: [], active: true, order: 1 },
            { id: 2, serviceId: 1, text: 'Sejak kapan kondisi tersebut terjadi?', type: 'text', options: [], active: true, order: 2 },
            
            { id: 3, serviceId: 2, text: 'Di mana lokasi kejadiannya?', type: 'text', options: [], active: true, order: 1 },
            { id: 4, serviceId: 2, text: 'Apa potensi bahaya yang Anda amati?', type: 'text', options: [], active: true, order: 2 },
            
            { id: 5, serviceId: 3, text: 'Apa insiden K3 yang terjadi?', type: 'text', options: [], active: true, order: 1 },
            { id: 6, serviceId: 3, text: 'Apakah ada korban atau kerusakan?', type: 'text', options: [], active: true, order: 2 },
            
            { id: 7, serviceId: 4, text: 'Apa yang sedang Anda rasakan saat ini?', type: 'text', options: [], active: true, order: 1 },
            { id: 8, serviceId: 4, text: 'Seberapa sering kondisi tersebut terjadi?', type: 'options', options: ['Jarang', 'Kadang-kadang', 'Sering', 'Hampir setiap hari'], active: true, order: 2 }
        ];
        localStorage.setItem('smcc_questions', JSON.stringify(defaultQuestions));
    }

    if (!localStorage.getItem('smcc_conversations')) {
        localStorage.setItem('smcc_conversations', JSON.stringify([]));
    }
    
    if (!localStorage.getItem('smcc_curhat')) {
        localStorage.setItem('smcc_curhat', JSON.stringify([]));
    }
    
    if (!localStorage.getItem('smcc_bot_responses')) {
        const defaultResponses = [
            { id: 1, keywords: 'kuliah, tugas, belajar', text: 'Tampaknya kamu sedang menghadapi beban akademik. Mengatur waktu dan mengambil jeda istirahat bisa sangat membantu. Jangan lupa bahwa kesehatanmu lebih penting daripada nilai yang sempurna.' },
            { id: 2, keywords: 'cemas, khawatir, stres', text: 'Kecemasan adalah emosi yang wajar ketika kita menghadapi situasi yang menekan. Cobalah mengambil napas dalam-dalam sejenak. Kamu tidak sendirian dalam menghadapi ini.' }
        ];
        localStorage.setItem('smcc_bot_responses', JSON.stringify(defaultResponses));
    }
    
    if (!localStorage.getItem('smcc_bot_settings')) {
        const defaultSettings = { defaultCurhatResponse: 'Terima kasih sudah berbagi. Kami mendengar dan memahami apa yang Anda rasakan. Jika Anda butuh bantuan lebih lanjut, jangan ragu untuk menghubungi kami.' };
        localStorage.setItem('smcc_bot_settings', JSON.stringify(defaultSettings));
    }
}

// State
let currentState = 'greeting'; // greeting, answering, curhat, followup
let activeService = null;
let activeQuestions = [];
let currentQuestionIndex = 0;
let conversationData = {
    id: '',
    date: '',
    time: '',
    serviceName: '',
    qa: [],
    status: '',
    followUpStatus: 'Baru',
    followUpNotes: ''
};
let curhatData = {
    id: '',
    date: '',
    time: '',
    text: '',
    botResponse: '',
    status: '',
    followUpStatus: 'Baru',
    followUpNotes: ''
};

// DOM Elements
const messagesContainer = document.getElementById('chat-messages');
const inputArea = document.getElementById('chat-input-area');
const chatInput = document.getElementById('chat-input');
const sendBtn = document.getElementById('send-btn');

function scrollToBottom() {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function addBotMessage(text, options = []) {
    const msgDiv = document.createElement('div');
    msgDiv.className = 'message message-bot';
    msgDiv.innerHTML = `<p>${text.replace(/\n/g, '<br>')}</p>`;
    
    if (options.length > 0) {
        const optionsContainer = document.createElement('div');
        optionsContainer.className = 'chat-options';
        
        options.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'chat-option-btn';
            btn.textContent = opt.text;
            btn.onclick = () => {
                // Disable all buttons after click
                const allBtns = optionsContainer.querySelectorAll('button');
                allBtns.forEach(b => {
                    b.disabled = true;
                    b.style.opacity = '0.5';
                    b.style.cursor = 'default';
                });
                opt.action();
            };
            optionsContainer.appendChild(btn);
        });
        msgDiv.appendChild(optionsContainer);
    }
    
    messagesContainer.appendChild(msgDiv);
    scrollToBottom();
}

function addUserMessage(text) {
    const msgDiv = document.createElement('div');
    msgDiv.className = 'message message-user';
    msgDiv.textContent = text;
    messagesContainer.appendChild(msgDiv);
    scrollToBottom();
}

function generateId(prefix) {
    return prefix + '-' + Math.random().toString(36).substr(2, 9).toUpperCase();
}

function getFormattedDate() {
    const now = new Date();
    return now.toISOString().split('T')[0];
}

function getFormattedTime() {
    const now = new Date();
    return now.toTimeString().split(' ')[0].substring(0, 5);
}

function initChat() {
    seedData();
    messagesContainer.innerHTML = '';
    inputArea.classList.remove('hidden'); // allow user to type first
    
    currentState = 'greeting';
    
    setTimeout(() => {
        addBotMessage("Selamat Datang di Layanan SMCC UNESA.\nSilakan ketik sapaan atau pesan Anda untuk memulai layanan.");
        chatInput.focus();
    }, 500);
}

function showMainMenu() {
    currentState = 'selecting_service';
    inputArea.classList.add('hidden');
    
    const services = JSON.parse(localStorage.getItem('smcc_services') || '[]');
    const activeServices = services.filter(s => s.active);
    
    const options = activeServices.map(s => ({
        text: s.name,
        action: () => startService(s)
    }));
    
    options.push({
        text: "💬 Sesi Curhat",
        action: () => startCurhat()
    });
    
    setTimeout(() => {
        addBotMessage("Silakan pilih layanan yang Anda butuhkan:", options);
    }, 500);
}

function startService(service) {
    addUserMessage(service.name);
    activeService = service;
    
    // Init conversation
    conversationData = {
        id: generateId('C'),
        date: getFormattedDate(),
        time: getFormattedTime(),
        serviceName: service.name,
        qa: [],
        status: '',
        followUpStatus: 'Baru',
        followUpNotes: ''
    };
    
    // Load questions for this service
    const allQuestions = JSON.parse(localStorage.getItem('smcc_questions') || '[]');
    activeQuestions = allQuestions
        .filter(q => q.serviceId === service.id && q.active)
        .sort((a, b) => a.order - b.order);
        
    currentQuestionIndex = 0;
    currentState = 'answering';
    
    if (activeQuestions.length === 0) {
        addBotMessage("Mohon maaf, belum ada pertanyaan untuk layanan ini.");
        endSession();
        return;
    }
    
    setTimeout(() => {
        askNextQuestion();
    }, 500);
}

function askNextQuestion() {
    if (currentQuestionIndex < activeQuestions.length) {
        const q = activeQuestions[currentQuestionIndex];
        
        if (q.type === 'options' && q.options && q.options.length > 0) {
            const optionsArr = q.options.map(optText => ({
                text: optText,
                action: () => {
                    addUserMessage(optText);
                    saveAnswer(q.text, optText);
                    currentQuestionIndex++;
                    setTimeout(() => askNextQuestion(), 500);
                }
            }));
            addBotMessage(q.text, optionsArr);
            inputArea.classList.add('hidden');
        } else {
            addBotMessage(q.text);
            inputArea.classList.remove('hidden');
            chatInput.focus();
        }
    } else {
        inputArea.classList.add('hidden');
        endSession('conversation');
    }
}

function saveAnswer(questionText, answerText) {
    conversationData.qa.push({
        q: questionText,
        a: answerText
    });
}

function startCurhat() {
    addUserMessage("💬 Sesi Curhat");
    currentState = 'curhat';
    
    curhatData = {
        id: generateId('S'),
        date: getFormattedDate(),
        time: getFormattedTime(),
        text: '',
        botResponse: '',
        status: '',
        followUpStatus: 'Baru',
        followUpNotes: ''
    };
    
    setTimeout(() => {
        addBotMessage("Silakan ceritakan apa yang sedang Anda rasakan atau alami saat ini.");
        inputArea.classList.remove('hidden');
        chatInput.focus();
    }, 500);
}

function handleCurhatInput(text) {
    curhatData.text = text;
    
    // Simulate AI response based on dynamic keywords
    const settings = JSON.parse(localStorage.getItem('smcc_bot_settings') || '{"defaultCurhatResponse": "Terima kasih sudah berbagi."}');
    let response = settings.defaultCurhatResponse;
    
    const responses = JSON.parse(localStorage.getItem('smcc_bot_responses') || '[]');
    const lowerText = text.toLowerCase();
    
    for (let i = 0; i < responses.length; i++) {
        const r = responses[i];
        const keywords = r.keywords.split(',').map(k => k.trim().toLowerCase());
        
        const isMatch = keywords.some(k => k && lowerText.includes(k));
        if (isMatch) {
            response = r.text;
            break;
        }
    }
    
    curhatData.botResponse = response;
    
    setTimeout(() => {
        addBotMessage(response);
        setTimeout(() => {
            inputArea.classList.add('hidden');
            endSession('curhat');
        }, 1500);
    }, 500);
}

function endSession(type) {
    setTimeout(() => {
        addBotMessage("Terima kasih, informasi Anda telah berhasil dicatat.\n\nApakah Anda membutuhkan tindak lanjut dari SMCC?", [
            {
                text: "Ya, saya membutuhkan tindak lanjut",
                action: () => handleFollowUp(type, true)
            },
            {
                text: "Tidak",
                action: () => handleFollowUp(type, false)
            }
        ]);
    }, 1000);
}

function handleFollowUp(type, needsFollowUp) {
    addUserMessage(needsFollowUp ? "Ya, saya membutuhkan tindak lanjut" : "Tidak");
    
    const status = needsFollowUp ? "Perlu Ditindaklanjuti" : "Selesai";
    
    if (type === 'conversation') {
        conversationData.status = status;
        const convs = JSON.parse(localStorage.getItem('smcc_conversations') || '[]');
        convs.push(conversationData);
        localStorage.setItem('smcc_conversations', JSON.stringify(convs));
    } else if (type === 'curhat') {
        curhatData.status = status;
        const curhats = JSON.parse(localStorage.getItem('smcc_curhat') || '[]');
        curhats.push(curhatData);
        localStorage.setItem('smcc_curhat', JSON.stringify(curhats));
    }
    
    setTimeout(() => {
        addBotMessage("Terima kasih! Sesi Anda telah selesai. Anda dapat menutup halaman ini atau memuat ulang halaman untuk memulai percakapan baru.");
    }, 500);
}

function handleSend() {
    const text = chatInput.value.trim();
    if (!text) return;
    
    addUserMessage(text);
    chatInput.value = '';
    inputArea.classList.add('hidden'); // Hide until bot asks next question
    
    if (currentState === 'greeting') {
        showMainMenu();
    } else if (currentState === 'answering') {
        saveAnswer(activeQuestions[currentQuestionIndex].text, text);
        currentQuestionIndex++;
        setTimeout(() => askNextQuestion(), 500);
    } else if (currentState === 'curhat') {
        handleCurhatInput(text);
    }
}

sendBtn.addEventListener('click', handleSend);
chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        handleSend();
    }
});

// Start
document.addEventListener('DOMContentLoaded', initChat);
