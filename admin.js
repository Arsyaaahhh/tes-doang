// Navigation handling
const navItems = document.querySelectorAll('.nav-item');
const contentArea = document.getElementById('content-area');
const modalContainer = document.getElementById('modal-container');
const modalTitle = document.getElementById('modal-title');
const modalBody = document.getElementById('modal-body');
const modalClose = document.getElementById('modal-close');

let activeTab = 'dashboard';

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
            activeTab = item.dataset.target;
            renderView();
        });
    });
    
    modalClose.addEventListener('click', closeModal);
    
    renderView();
});

function getData(key) {
    return JSON.parse(localStorage.getItem(key) || '[]');
}

function saveData(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

function resetDemoData() {
    if(confirm("Apakah Anda yakin ingin mereset semua data ke kondisi awal? Data percakapan akan dihapus.")) {
        localStorage.removeItem('smcc_services');
        localStorage.removeItem('smcc_questions');
        localStorage.removeItem('smcc_conversations');
        localStorage.removeItem('smcc_curhat');
        
        // Trigger seedData logic from script.js indirectly by setting defaults here
        const defaultServices = [
            { id: 1, name: 'Kesehatan Fisik', desc: 'Layanan konsultasi kesehatan fisik dasar', active: true },
            { id: 2, name: 'Mitigasi Kebencanaan', desc: 'Pelaporan dan informasi mitigasi bencana', active: true },
            { id: 3, name: 'Kesehatan dan Keselamatan Kerja (K3)', desc: 'Layanan pelaporan insiden K3', active: true },
            { id: 4, name: 'Kesehatan Mental', desc: 'Layanan dukungan kesehatan mental awal', active: true }
        ];
        saveData('smcc_services', defaultServices);

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
        saveData('smcc_questions', defaultQuestions);
        saveData('smcc_conversations', []);
        saveData('smcc_curhat', []);
        
        const defaultResponses = [
            { id: 1, keywords: 'kuliah, tugas, belajar', text: 'Tampaknya kamu sedang menghadapi beban akademik. Mengatur waktu dan mengambil jeda istirahat bisa sangat membantu. Jangan lupa bahwa kesehatanmu lebih penting daripada nilai yang sempurna.' },
            { id: 2, keywords: 'cemas, khawatir, stres', text: 'Kecemasan adalah emosi yang wajar ketika kita menghadapi situasi yang menekan. Cobalah mengambil napas dalam-dalam sejenak. Kamu tidak sendirian dalam menghadapi ini.' }
        ];
        saveData('smcc_bot_responses', defaultResponses);
        
        const defaultSettings = { defaultCurhatResponse: 'Terima kasih sudah berbagi. Kami mendengar dan memahami apa yang Anda rasakan. Jika Anda butuh bantuan lebih lanjut, jangan ragu untuk menghubungi kami.' };
        saveData('smcc_bot_settings', defaultSettings);
        
        renderView();
        alert("Data berhasil direset.");
    }
}

function renderView() {
    switch (activeTab) {
        case 'dashboard': renderDashboard(); break;
        case 'layanan': renderLayanan(); break;
        case 'pertanyaan': renderPertanyaan(); break;
        case 'percakapan': renderPercakapan(); break;
        case 'curhat': renderCurhat(); break;
        case 'tindaklanjut': renderTindakLanjut(); break;
        case 'respons': renderRespons(); break;
    }
}

// ==========================================
// DASHBOARD VIEW
// ==========================================
function renderDashboard() {
    const convs = getData('smcc_conversations');
    const curhats = getData('smcc_curhat');
    
    let totalConvs = convs.length;
    let totalCurhats = curhats.length;
    
    let allSessions = [...convs, ...curhats];
    let perluTindakLanjut = allSessions.filter(s => s.status === 'Perlu Ditindaklanjuti').length;
    let selesai = allSessions.filter(s => s.status === 'Selesai').length;

    contentArea.innerHTML = `
        <div class="section-header">
            <h2>Dashboard Statistik</h2>
            <button class="btn btn-danger" onclick="resetDemoData()">Reset Data Demo</button>
        </div>
        <div class="stats-grid">
            <div class="stat-card">
                <h3>Total Percakapan</h3>
                <div class="value">${totalConvs}</div>
            </div>
            <div class="stat-card">
                <h3>Total Sesi Curhat</h3>
                <div class="value">${totalCurhats}</div>
            </div>
            <div class="stat-card">
                <h3>Perlu Ditindaklanjuti</h3>
                <div class="value">${perluTindakLanjut}</div>
            </div>
            <div class="stat-card">
                <h3>Selesai</h3>
                <div class="value">${selesai}</div>
            </div>
        </div>
    `;
}

// ==========================================
// LAYANAN VIEW
// ==========================================
function renderLayanan() {
    const services = getData('smcc_services');
    
    let html = `
        <div class="section-header">
            <h2>Manajemen Layanan</h2>
        </div>
        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nama Layanan</th>
                        <th>Deskripsi</th>
                        <th>Status</th>
                        <th>Aksi</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    services.forEach(s => {
        const badgeClass = s.active ? 'badge-success' : 'badge-default';
        const badgeText = s.active ? 'Aktif' : 'Nonaktif';
        html += `
            <tr>
                <td>${s.id}</td>
                <td>${s.name}</td>
                <td>${s.desc}</td>
                <td><span class="badge ${badgeClass}">${badgeText}</span></td>
                <td>
                    <button class="btn" onclick="editLayanan(${s.id})">Edit</button>
                </td>
            </tr>
        `;
    });
    
    html += `</tbody></table></div>`;
    contentArea.innerHTML = html;
}

function editLayanan(id) {
    const services = getData('smcc_services');
    const s = services.find(x => x.id === id);
    
    modalTitle.textContent = 'Edit Layanan';
    modalBody.innerHTML = `
        <div class="form-group">
            <label>Nama Layanan</label>
            <input type="text" id="svc-name" class="form-control" value="${s.name}">
        </div>
        <div class="form-group">
            <label>Deskripsi</label>
            <input type="text" id="svc-desc" class="form-control" value="${s.desc}">
        </div>
        <div class="form-group">
            <label>Status</label>
            <select id="svc-active" class="form-control">
                <option value="true" ${s.active ? 'selected' : ''}>Aktif</option>
                <option value="false" ${!s.active ? 'selected' : ''}>Nonaktif</option>
            </select>
        </div>
        <button class="btn btn-primary" onclick="saveLayanan(${s.id})">Simpan</button>
    `;
    openModal();
}

function saveLayanan(id) {
    const services = getData('smcc_services');
    const index = services.findIndex(x => x.id === id);
    
    services[index].name = document.getElementById('svc-name').value;
    services[index].desc = document.getElementById('svc-desc').value;
    services[index].active = document.getElementById('svc-active').value === 'true';
    
    saveData('smcc_services', services);
    closeModal();
    renderView();
}

// ==========================================
// PERTANYAAN VIEW
// ==========================================
let currentServiceForQuestions = 1;

function renderPertanyaan() {
    const services = getData('smcc_services');
    const questions = getData('smcc_questions').filter(q => q.serviceId == currentServiceForQuestions).sort((a,b) => a.order - b.order);
    
    let serviceOptions = services.map(s => 
        `<option value="${s.id}" ${s.id == currentServiceForQuestions ? 'selected' : ''}>${s.name}</option>`
    ).join('');
    
    let html = `
        <div class="section-header">
            <h2>Manajemen Pertanyaan</h2>
            <button class="btn btn-primary" onclick="addPertanyaan()">+ Tambah Pertanyaan</button>
        </div>
        <div class="form-group" style="max-width: 300px;">
            <label>Pilih Layanan:</label>
            <select class="form-control" onchange="changeQuestionService(this.value)">
                ${serviceOptions}
            </select>
        </div>
        <div class="table-container mt-4">
            <table>
                <thead>
                    <tr>
                        <th>Urutan</th>
                        <th>Pertanyaan</th>
                        <th>Tipe</th>
                        <th>Status</th>
                        <th>Aksi</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    questions.forEach(q => {
        const badgeClass = q.active ? 'badge-success' : 'badge-default';
        const badgeText = q.active ? 'Aktif' : 'Nonaktif';
        const typeText = q.type === 'options' ? 'Pilihan Ganda' : 'Teks Bebas';
        html += `
            <tr>
                <td>${q.order}</td>
                <td>${q.text}</td>
                <td>${typeText}</td>
                <td><span class="badge ${badgeClass}">${badgeText}</span></td>
                <td>
                    <button class="btn" onclick="editPertanyaan(${q.id})">Edit</button>
                    <button class="btn btn-danger" onclick="hapusPertanyaan(${q.id})">Hapus</button>
                </td>
            </tr>
        `;
    });
    
    html += `</tbody></table></div>`;
    contentArea.innerHTML = html;
}

function changeQuestionService(id) {
    currentServiceForQuestions = id;
    renderPertanyaan();
}

function hapusPertanyaan(id) {
    if(confirm("Hapus pertanyaan ini?")) {
        let questions = getData('smcc_questions');
        questions = questions.filter(q => q.id !== id);
        saveData('smcc_questions', questions);
        renderPertanyaan();
    }
}

function addPertanyaan() {
    modalTitle.textContent = 'Tambah Pertanyaan';
    modalBody.innerHTML = getPertanyaanForm();
    openModal();
}

function editPertanyaan(id) {
    const questions = getData('smcc_questions');
    const q = questions.find(x => x.id === id);
    modalTitle.textContent = 'Edit Pertanyaan';
    modalBody.innerHTML = getPertanyaanForm(q);
    openModal();
}

function getPertanyaanForm(q = null) {
    const id = q ? q.id : Date.now();
    const text = q ? q.text : '';
    const type = q ? q.type : 'text';
    const active = q ? q.active : true;
    const order = q ? q.order : 99;
    const options = q && q.options ? q.options : [];
    
    window.tempOptions = [...options]; // temporary array for UI
    
    return `
        <input type="hidden" id="q-id" value="${id}">
        <div class="form-group">
            <label>Pertanyaan</label>
            <input type="text" id="q-text" class="form-control" value="${text}">
        </div>
        <div class="form-group">
            <label>Urutan (Angka)</label>
            <input type="number" id="q-order" class="form-control" value="${order}">
        </div>
        <div class="form-group">
            <label>Status</label>
            <select id="q-active" class="form-control">
                <option value="true" ${active ? 'selected' : ''}>Aktif</option>
                <option value="false" ${!active ? 'selected' : ''}>Nonaktif</option>
            </select>
        </div>
        <div class="form-group">
            <label>Tipe Jawaban</label>
            <select id="q-type" class="form-control" onchange="toggleOptionsUI()">
                <option value="text" ${type === 'text' ? 'selected' : ''}>Teks Bebas</option>
                <option value="options" ${type === 'options' ? 'selected' : ''}>Pilihan Ganda</option>
            </select>
        </div>
        <div id="options-container" class="${type === 'options' ? '' : 'hidden'} form-group">
            <label>Pilihan Jawaban</label>
            <div class="flex gap-2 mb-4">
                <input type="text" id="new-opt-input" class="form-control" placeholder="Tambah pilihan baru">
                <button class="btn" onclick="addOptionToTemp()">Tambah</button>
            </div>
            <div id="options-list" class="options-list">
                ${renderTempOptions()}
            </div>
        </div>
        <button class="btn btn-primary mt-4" onclick="savePertanyaan(${q ? false : true})">Simpan</button>
    `;
}

function toggleOptionsUI() {
    const type = document.getElementById('q-type').value;
    const container = document.getElementById('options-container');
    if(type === 'options') container.classList.remove('hidden');
    else container.classList.add('hidden');
}

function renderTempOptions() {
    return window.tempOptions.map((opt, i) => `
        <div class="option-item">
            <input type="text" class="form-control" value="${opt}" onchange="updateTempOption(${i}, this.value)">
            <button class="btn btn-danger" onclick="removeTempOption(${i})">X</button>
        </div>
    `).join('');
}

function addOptionToTemp() {
    const input = document.getElementById('new-opt-input');
    const val = input.value.trim();
    if(val) {
        window.tempOptions.push(val);
        input.value = '';
        document.getElementById('options-list').innerHTML = renderTempOptions();
    }
}

function updateTempOption(idx, val) {
    window.tempOptions[idx] = val;
}

function removeTempOption(idx) {
    window.tempOptions.splice(idx, 1);
    document.getElementById('options-list').innerHTML = renderTempOptions();
}

function savePertanyaan(isNew) {
    let questions = getData('smcc_questions');
    const id = parseInt(document.getElementById('q-id').value);
    
    const data = {
        id: id,
        serviceId: parseInt(currentServiceForQuestions),
        text: document.getElementById('q-text').value,
        type: document.getElementById('q-type').value,
        options: window.tempOptions,
        active: document.getElementById('q-active').value === 'true',
        order: parseInt(document.getElementById('q-order').value) || 99
    };
    
    if (isNew) {
        questions.push(data);
    } else {
        const idx = questions.findIndex(x => x.id === id);
        questions[idx] = data;
    }
    
    saveData('smcc_questions', questions);
    closeModal();
    renderPertanyaan();
}

// ==========================================
// PERCAKAPAN VIEW
// ==========================================
function renderPercakapan() {
    const convs = getData('smcc_conversations').reverse(); // newest first
    
    let html = `
        <div class="section-header">
            <h2>Data Percakapan (Layanan 1-4)</h2>
        </div>
        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Waktu</th>
                        <th>Layanan</th>
                        <th>Jumlah Pertanyaan</th>
                        <th>Status</th>
                        <th>Aksi</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    convs.forEach(c => {
        let statusBadge = c.status === 'Selesai' ? 'badge-success' : 'badge-warning';
        html += `
            <tr>
                <td>${c.id}</td>
                <td>${c.date} ${c.time}</td>
                <td>${c.serviceName}</td>
                <td>${c.qa.length}</td>
                <td><span class="badge ${statusBadge}">${c.status || '-'}</span></td>
                <td>
                    <button class="btn" onclick="detailPercakapan('${c.id}')">Detail</button>
                </td>
            </tr>
        `;
    });
    
    html += `</tbody></table></div>`;
    contentArea.innerHTML = html;
}

function detailPercakapan(id) {
    const conv = getData('smcc_conversations').find(c => c.id === id);
    
    modalTitle.textContent = `Detail Percakapan (${conv.id})`;
    
    let html = `
        <div class="mb-4">
            <strong>Waktu:</strong> ${conv.date} ${conv.time}<br>
            <strong>Layanan:</strong> ${conv.serviceName}<br>
            <strong>Status:</strong> ${conv.status}
        </div>
        <h4>Riwayat Tanya Jawab:</h4>
        <div style="background:var(--bg-color); padding:1rem; border-radius:var(--radius-md); margin-top:1rem;">
    `;
    
    conv.qa.forEach((item, i) => {
        html += `
            <div class="mb-4">
                <strong>P${i+1}: ${item.q}</strong><br>
                <div style="color:var(--text-muted); margin-top:0.25rem;">Jawab: ${item.a}</div>
            </div>
        `;
    });
    
    html += `</div>`;
    modalBody.innerHTML = html;
    openModal();
}

// ==========================================
// SESI CURHAT VIEW
// ==========================================
function renderCurhat() {
    const curhats = getData('smcc_curhat').reverse();
    
    let html = `
        <div class="section-header">
            <h2>Data Sesi Curhat</h2>
        </div>
        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Waktu</th>
                        <th>Cuplikan Isi</th>
                        <th>Status</th>
                        <th>Aksi</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    curhats.forEach(c => {
        let statusBadge = c.status === 'Selesai' ? 'badge-success' : 'badge-warning';
        let snippet = c.text.length > 50 ? c.text.substring(0, 50) + '...' : c.text;
        html += `
            <tr>
                <td>${c.id}</td>
                <td>${c.date} ${c.time}</td>
                <td>${snippet}</td>
                <td><span class="badge ${statusBadge}">${c.status || '-'}</span></td>
                <td>
                    <button class="btn" onclick="detailCurhat('${c.id}')">Detail</button>
                </td>
            </tr>
        `;
    });
    
    html += `</tbody></table></div>`;
    contentArea.innerHTML = html;
}

function detailCurhat(id) {
    const curhat = getData('smcc_curhat').find(c => c.id === id);
    
    modalTitle.textContent = `Detail Curhat (${curhat.id})`;
    modalBody.innerHTML = `
        <div class="mb-4">
            <strong>Waktu:</strong> ${curhat.date} ${curhat.time}<br>
            <strong>Status:</strong> ${curhat.status}
        </div>
        <div class="mb-4">
            <strong>Cerita Mahasiswa:</strong>
            <div style="background:var(--bg-color); padding:1rem; border-radius:var(--radius-md); margin-top:0.5rem;">
                ${curhat.text}
            </div>
        </div>
        <div>
            <strong>Respons Simulasi AI:</strong>
            <div style="background:#e0f2fe; padding:1rem; border-radius:var(--radius-md); margin-top:0.5rem; color:#0369a1;">
                ${curhat.botResponse}
            </div>
        </div>
    `;
    openModal();
}

// ==========================================
// TINDAK LANJUT VIEW
// ==========================================
function renderTindakLanjut() {
    const convs = getData('smcc_conversations').filter(c => c.status === 'Perlu Ditindaklanjuti');
    const curhats = getData('smcc_curhat').filter(c => c.status === 'Perlu Ditindaklanjuti');
    
    const all = [...convs, ...curhats].sort((a,b) => {
        return new Date(b.date + 'T' + b.time) - new Date(a.date + 'T' + a.time);
    });
    
    let html = `
        <div class="section-header">
            <h2>Manajemen Tindak Lanjut</h2>
        </div>
        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Waktu</th>
                        <th>Tipe</th>
                        <th>Status TL</th>
                        <th>Aksi</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    all.forEach(item => {
        let type = item.serviceName ? `Layanan: ${item.serviceName}` : 'Sesi Curhat';
        let badgeClass = 'badge-default';
        if(item.followUpStatus === 'Baru') badgeClass = 'badge-danger';
        else if(item.followUpStatus === 'Sedang Ditangani') badgeClass = 'badge-warning';
        else if(item.followUpStatus === 'Selesai') badgeClass = 'badge-success';
        
        html += `
            <tr>
                <td>${item.id}</td>
                <td>${item.date} ${item.time}</td>
                <td>${type}</td>
                <td><span class="badge ${badgeClass}">${item.followUpStatus}</span></td>
                <td>
                    <button class="btn" onclick="editTindakLanjut('${item.id}', ${item.serviceName ? 'true' : 'false'})">Kelola</button>
                </td>
            </tr>
        `;
    });
    
    html += `</tbody></table></div>`;
    contentArea.innerHTML = html;
}

function editTindakLanjut(id, isConversation) {
    let key = isConversation ? 'smcc_conversations' : 'smcc_curhat';
    let items = getData(key);
    let item = items.find(x => x.id === id);
    
    modalTitle.textContent = `Kelola Tindak Lanjut (${id})`;
    modalBody.innerHTML = `
        <div class="form-group">
            <label>Status Penanganan</label>
            <select id="tl-status" class="form-control">
                <option value="Baru" ${item.followUpStatus === 'Baru' ? 'selected' : ''}>Baru</option>
                <option value="Dibaca" ${item.followUpStatus === 'Dibaca' ? 'selected' : ''}>Dibaca</option>
                <option value="Sedang Ditangani" ${item.followUpStatus === 'Sedang Ditangani' ? 'selected' : ''}>Sedang Ditangani</option>
                <option value="Selesai" ${item.followUpStatus === 'Selesai' ? 'selected' : ''}>Selesai</option>
            </select>
        </div>
        <div class="form-group">
            <label>Catatan Internal</label>
            <textarea id="tl-notes" class="form-control" rows="5">${item.followUpNotes || ''}</textarea>
        </div>
        <button class="btn btn-primary" onclick="saveTindakLanjut('${id}', ${isConversation})">Simpan Pembaruan</button>
    `;
    openModal();
}

function saveTindakLanjut(id, isConversation) {
    let key = isConversation ? 'smcc_conversations' : 'smcc_curhat';
    let items = getData(key);
    let index = items.findIndex(x => x.id === id);
    
    items[index].followUpStatus = document.getElementById('tl-status').value;
    items[index].followUpNotes = document.getElementById('tl-notes').value;
    
    saveData(key, items);
    closeModal();
    renderTindakLanjut();
}

// ==========================================
// RESPONS CHATBOT VIEW
// ==========================================
function renderRespons() {
    const responses = getData('smcc_bot_responses');
    const settings = JSON.parse(localStorage.getItem('smcc_bot_settings') || '{"defaultCurhatResponse": "Terima kasih sudah berbagi."}');
    
    let html = `
        <div class="section-header">
            <h2>Respons Simulasi AI (Sesi Curhat)</h2>
            <button class="btn btn-primary" onclick="addRespons()">+ Tambah Respons Khusus</button>
        </div>
        
        <div class="form-group mb-4" style="background:var(--surface); padding:1.5rem; border:1px solid var(--border); border-radius:var(--radius-md);">
            <h4>Respons Default (Jika tidak ada kata kunci yang cocok)</h4>
            <textarea id="default-response-input" class="form-control mt-4" rows="3">${settings.defaultCurhatResponse}</textarea>
            <button class="btn btn-primary mt-4" onclick="saveDefaultResponse()">Simpan Respons Default</button>
        </div>

        <div class="table-container mt-4">
            <table>
                <thead>
                    <tr>
                        <th>Kata Kunci (pisahkan dengan koma)</th>
                        <th>Respons Chatbot</th>
                        <th>Aksi</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    responses.forEach(r => {
        let snippet = r.text.length > 80 ? r.text.substring(0, 80) + '...' : r.text;
        html += `
            <tr>
                <td style="width:25%;">${r.keywords}</td>
                <td>${snippet}</td>
                <td style="width:15%;">
                    <button class="btn" onclick="editRespons(${r.id})">Edit</button>
                    <button class="btn btn-danger" onclick="hapusRespons(${r.id})">Hapus</button>
                </td>
            </tr>
        `;
    });
    
    html += `</tbody></table></div>`;
    contentArea.innerHTML = html;
}

function saveDefaultResponse() {
    const val = document.getElementById('default-response-input').value;
    const settings = JSON.parse(localStorage.getItem('smcc_bot_settings') || '{}');
    settings.defaultCurhatResponse = val;
    saveData('smcc_bot_settings', settings);
    alert('Respons default berhasil disimpan!');
}

function hapusRespons(id) {
    if(confirm("Hapus respons ini?")) {
        let responses = getData('smcc_bot_responses');
        responses = responses.filter(r => r.id !== id);
        saveData('smcc_bot_responses', responses);
        renderRespons();
    }
}

function addRespons() {
    modalTitle.textContent = 'Tambah Respons Khusus';
    modalBody.innerHTML = getResponsForm();
    openModal();
}

function editRespons(id) {
    const responses = getData('smcc_bot_responses');
    const r = responses.find(x => x.id === id);
    modalTitle.textContent = 'Edit Respons Khusus';
    modalBody.innerHTML = getResponsForm(r);
    openModal();
}

function getResponsForm(r = null) {
    const id = r ? r.id : Date.now();
    const keywords = r ? r.keywords : '';
    const text = r ? r.text : '';
    
    return `
        <input type="hidden" id="r-id" value="${id}">
        <div class="form-group">
            <label>Kata Kunci (Pisahkan dengan koma. Contoh: kuliah, tugas, nilai)</label>
            <input type="text" id="r-keywords" class="form-control" value="${keywords}">
        </div>
        <div class="form-group">
            <label>Respons Chatbot</label>
            <textarea id="r-text" class="form-control" rows="5">${text}</textarea>
        </div>
        <button class="btn btn-primary mt-4" onclick="saveResponsKhusus(${r ? false : true})">Simpan</button>
    `;
}

function saveResponsKhusus(isNew) {
    let responses = getData('smcc_bot_responses');
    const id = parseInt(document.getElementById('r-id').value);
    const keywords = document.getElementById('r-keywords').value;
    const text = document.getElementById('r-text').value;
    
    if(!keywords || !text) {
        alert("Semua kolom harus diisi.");
        return;
    }
    
    const data = { id, keywords, text };
    
    if (isNew) {
        responses.push(data);
    } else {
        const idx = responses.findIndex(x => x.id === id);
        responses[idx] = data;
    }
    
    saveData('smcc_bot_responses', responses);
    closeModal();
    renderRespons();
}

// ==========================================
// MODAL UTILS
// ==========================================
function openModal() {
    modalContainer.classList.remove('hidden');
}

function closeModal() {
    modalContainer.classList.add('hidden');
}
