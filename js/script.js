// =======================================================
// UTILITÁRIOS
// =======================================================

// Otimização para PDF.js: Executa o processamento em um thread separado para não travar a UI.
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.379/pdf.worker.min.js`;

const chunk = (str, s = 28) => (str || '').match(new RegExp('.{1,' + s + '}', 'g')) || [];

const detectQRType = (data) => {
    if (!data) return 'Desconhecido';

    // URL
    if (data.match(/^https?:\/\//) || data.match(/^www\./)) {
        return 'URL';
    }

    // Email
    if (data.match(/^mailto:/) || data.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        return 'Email';
    }

    // Telefone
    if (data.match(/^tel:/) || data.match(/^\+?[\d\s\-\(\)]+$/)) {
        return 'Telefone';
    }

    // SMS
    if (data.match(/^sms:/)) {
        return 'SMS';
    }

    // WiFi
    if (data.match(/^WIFI:/)) {
        return 'WiFi';
    }

    // Pix (Brazilian payment)
    if (data.match(/^000201/)) {
        return 'Pix';
    }

    // WhatsApp
    if (data.match(/^https?:\/\/wa\.me\//) || data.match(/^https?:\/\/api\.whatsapp\.com\//)) {
        return 'WhatsApp';
    }

    // YouTube
    if (data.match(/^https?:\/\/(www\.)?youtube\.com\//) || data.match(/^https?:\/\/youtu\.be\//)) {
        return 'YouTube';
    }

    // Instagram
    if (data.match(/^https?:\/\/(www\.)?instagram\.com\//)) {
        return 'Instagram';
    }

    // Twitter/X
    if (data.match(/^https?:\/\/(www\.)?(twitter\.com|x\.com)\//)) {
        return 'Twitter/X';
    }

    // Facebook
    if (data.match(/^https?:\/\/(www\.)?facebook\.com\//)) {
        return 'Facebook';
    }

    // LinkedIn
    if (data.match(/^https?:\/\/(www\.)?linkedin\.com\//)) {
        return 'LinkedIn';
    }

    // Geo location
    if (data.match(/^geo:/)) {
        return 'Localização';
    }

    // Calendar event
    if (data.match(/^BEGIN:VCALENDAR/)) {
        return 'Evento';
    }

    // Contact (vCard)
    if (data.match(/^BEGIN:VCARD/)) {
        return 'Contato';
    }

    // Default to text
    return 'Texto';
};

const setBadges = (el, text) => {
    el.innerHTML = '';
    if (!text) return;

    const type = detectQRType(text);

    const b = document.createElement('div');
    b.className = 'badge ok';
    b.textContent = `QR Code detectado (${type})`;
    el.appendChild(b);
};

const displayQRCodeResult = (payload, statusEl, badgesEl, qrEl) => {
    statusEl.textContent = 'QR Code detectado';
    setBadges(badgesEl, payload);
    renderPayload(qrEl, payload);
};

const renderPayload = (wrap, payload) => {
    wrap.innerHTML = '';
    if (!payload) return;

    const chips = document.createElement('div');
    chips.className = 'chips';

    chunk(payload, 40).forEach(c => {
        const s = document.createElement('span');
        s.className = 'chip';
        s.textContent = c;
        chips.appendChild(s);
    });

    wrap.appendChild(chips);
};

const showToast = (message) => {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;

    container.appendChild(toast);

    // Força o navegador a aplicar o estilo inicial antes de adicionar a classe 'show'
    requestAnimationFrame(() => {
        toast.classList.add('show');
    });

    setTimeout(() => {
        toast.classList.remove('show');
        toast.addEventListener('transitionend', () => toast.remove());
    }, 3000); // A notificação some após 3 segundos
};

const copyToClipboard = async t => {
    if (!t) return;
    try {
        await navigator.clipboard.writeText(t);
        showToast('QR Code copiado!');
    } catch {
        showToast('Falha ao copiar o QR Code.');
    }
};

// =======================================================
// CÂMERA
// =======================================================
const cameraScanner = {
    videoEl: document.getElementById('video'),
    cameraSelect: document.getElementById('cameraSelect'),
    statusEl: document.getElementById('statusCam'),
    badgesEl: document.getElementById('badgesCam'),
    qrEl: document.getElementById('qrCam'),
    copyBtn: document.getElementById('copyCam'),
    startBtn: document.getElementById('startBtn'),
    stopBtn: document.getElementById('stopBtn'),
    scanning: false,
    payload: '',

    async init() {
        this.startBtn.addEventListener('click', () => this.start());
        this.stopBtn.addEventListener('click', () => this.stop());
        this.copyBtn.addEventListener('click', () => copyToClipboard(this.payload));
        await this.listCameras();
    },

    async listCameras() {
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            const videoDevices = devices.filter(d => d.kind === 'videoinput');
            this.cameraSelect.innerHTML = videoDevices.map((device, i) =>
                `<option value="${device.deviceId}">${device.label || `Câmera ${i + 1}`}</option>`
            ).join('');
        } catch (e) {
            this.statusEl.textContent = 'Não foi possível listar câmeras.';
        }
    },

    async start() {
        if (this.scanning) return;
        this.scanning = true;
        this.statusEl.textContent = 'Iniciando câmera...';

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { deviceId: this.cameraSelect.value || undefined }
            });
            this.videoEl.srcObject = stream;
            await this.videoEl.play();
            this.statusEl.textContent = 'Lendo QR...';
            this.scanFrame();
        } catch (error) {
            this.statusEl.textContent = 'Erro ao acessar a câmera.';
            this.scanning = false;
        }
    },

    stop() {
        this.scanning = false;
        this.videoEl.srcObject?.getTracks().forEach(t => t.stop());
        this.statusEl.textContent = 'Parado';
    },

    scanFrame() {
        if (!this.scanning) return;

        const canvas = document.createElement('canvas');
        canvas.width = this.videoEl.videoWidth;
        canvas.height = this.videoEl.videoHeight;
        canvas.getContext('2d').drawImage(this.videoEl, 0, 0, canvas.width, canvas.height);

        const imgData = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imgData.data, canvas.width, canvas.height);

        if (code?.data) {
            this.payload = code.data;
            displayQRCodeResult(this.payload, this.statusEl, this.badgesEl, this.qrEl);
            this.stop(); // Para o scan após encontrar um código
        } else {
            requestAnimationFrame(() => this.scanFrame());
        }
    }
};

cameraScanner.init();

// =======================================================
// UPLOAD DE ARQUIVO (IMAGEM OU PDF)
// =======================================================
const fileScanner = {
    inputEl: document.getElementById('fileInput'),
    statusEl: document.getElementById('statusFile'),
    resultsContainer: document.getElementById('multiResultsContainer'),
    loaderEl: document.getElementById('fileLoader'),
    previewEl: document.getElementById('previewImg'),

    init() {
        this.inputEl.addEventListener('change', (e) => this.handleFiles(e.target.files));
    },

    reset() {
        this.previewEl.style.display = 'none';
        this.statusEl.textContent = 'Aguardando arquivos...';
        this.loaderEl.classList.remove('visible');
        this.resultsContainer.innerHTML = '';
    },

    async handleFiles(files) {
        if (!files.length) return;
        this.reset();
        this.statusEl.textContent = `Processando ${files.length} arquivo(s)...`;
        this.loaderEl.classList.add('visible');

        try {
            // Cria uma promessa para cada arquivo e as executa em paralelo
            const processingPromises = Array.from(files).map(file => this.processFile(file));
            const results = await Promise.all(processingPromises);

            const foundResults = results.filter(result => result !== null);

            foundResults.forEach(result => {
                this.renderResultItem(result.filename, result.payload);
            });

            if (foundResults.length > 0) {
                this.statusEl.textContent = `${foundResults.length} QR Code(s) encontrado(s) em ${files.length} arquivo(s).`;
            } else {
                this.statusEl.textContent = `Nenhum QR Code encontrado nos ${files.length} arquivo(s) selecionado(s).`;
            }
        } catch (error) {
            this.statusEl.textContent = 'Erro ao processar o arquivo.';
            console.error(error);
        } finally {
            // Esconde o spinner e limpa o input ao finalizar
            this.loaderEl.classList.remove('visible');
            this.inputEl.value = '';
        }
    },

    async processFile(file) {
        let payload = null;
        if (file.type === 'application/pdf') {
            payload = await this.scanPdf(file);
        } else if (file.type.startsWith('image/')) {
            payload = await this.scanImage(file);
        }

        if (payload) {
            return { filename: file.name, payload };
        }
        return null;
    },

    renderResultItem(filename, payload) {
        const item = document.createElement('div');
        item.className = 'result-item';

        const header = document.createElement('div');
        header.className = 'result-item-header';

        const nameEl = document.createElement('span');
        nameEl.className = 'result-item-filename';
        nameEl.textContent = filename;
        nameEl.title = filename;

        const copyBtn = document.createElement('button');
        copyBtn.innerHTML = '<i class="fa-solid fa-copy"></i> Copiar';
        copyBtn.onclick = () => copyToClipboard(payload);

        header.appendChild(nameEl);
        header.appendChild(copyBtn);

        const content = document.createElement('div');
        renderPayload(content, payload);

        item.appendChild(header);
        item.appendChild(content);

        this.resultsContainer.appendChild(item);
    },

    async scanPdf(file) {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const viewport = page.getViewport({ scale: 2 });
            const code = await this.scanCanvas(page, viewport);

            if (code?.data) {
                return code.data; // Retorna o primeiro QR encontrado no PDF
            }
        }
        return null;
    },

    async scanImage(file) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            const url = URL.createObjectURL(file);
            img.src = url;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const code = jsQR(imgData.data, canvas.width, canvas.height);
                URL.revokeObjectURL(url);
                resolve(code?.data || null);
            };
            img.onerror = reject;
        });
    },

    async scanCanvas(page, viewport) {
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d');
        await page.render({ canvasContext: ctx, viewport }).promise;
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        return jsQR(imgData.data, canvas.width, canvas.height);
    }
};

fileScanner.init();

// =======================================================
// CONSENTIMENTO DE PRIVACIDADE (LGPD)
// =======================================================
const privacyConsent = {
    modal: document.getElementById('privacy-consent-modal'),
    acceptBtn: document.getElementById('consent-accept'),
    declineBtn: document.getElementById('consent-decline'),
    consentKey: 'privacy-consent-given',

    init() {
        // Verifica se o consentimento já foi dado
        if (localStorage.getItem(this.consentKey)) {
            this.onAccept();
        } else {
            this.showModal();
        }

        this.acceptBtn.addEventListener('click', () => {
            localStorage.setItem(this.consentKey, 'true');
            this.onAccept();
            this.hideModal();
        });

        this.declineBtn.addEventListener('click', () => {
            this.onDecline();
            this.hideModal();
        });
    },

    showModal() {
        this.modal.style.display = 'flex';
    },

    hideModal() {
        this.modal.style.display = 'none';
    },


    onAccept() {
        // Inicializa o scanner da câmera somente após o consentimento
        cameraScanner.init();
    },

    onDecline() {
        // Desabilita a funcionalidade da câmera se o usuário recusar
        const cameraSection = document.querySelector('#app .card:first-of-type');
        cameraSection.innerHTML = `
            <h3><i class="fa-solid fa-camera"></i> Câmera</h3>
            <p>Você recusou o acesso à câmera. Para usar esta funcionalidade, recarregue a página e aceite os termos de privacidade.</p>
        `;
    }
};

// =======================================================
// ALTERNADOR DE TEMA (LIGHT/DARK MODE)
// =======================================================
const themeSwitcher = {
    toggleButton: document.getElementById('theme-toggle'),
    
    init() {
        this.toggleButton.addEventListener('click', () => this.toggleTheme());
        this.loadTheme();
    },

    loadTheme() {
        const savedTheme = localStorage.getItem('theme');
        const systemPrefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;

        if (savedTheme === 'light' || (!savedTheme && systemPrefersLight)) {
            this.setTheme('light');
        } else {
            this.setTheme('dark');
        }
    },

    toggleTheme() {
        const currentTheme = document.body.classList.contains('light-mode') ? 'light' : 'dark';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        this.setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
    },

    setTheme(theme) {
        const icon = this.toggleButton.querySelector('i');
        document.body.classList.toggle('light-mode', theme === 'light');
        icon.classList.toggle('fa-moon', theme === 'light');
        icon.classList.toggle('fa-sun', theme === 'dark');
    }
};

privacyConsent.init();
themeSwitcher.init();
