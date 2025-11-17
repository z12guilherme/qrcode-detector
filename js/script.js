// =======================================================
// UTILITÁRIOS
// =======================================================

// Otimização para PDF.js: Executa o processamento em um thread separado para não travar a UI.
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.9.179/pdf.worker.min.js`;

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
    badgesEl: document.getElementById('badgesFile'),
    qrEl: document.getElementById('qrFile'),
    copyBtn: document.getElementById('copyFile'),
    previewEl: document.getElementById('previewImg'),
    payload: '',

    init() {
        this.inputEl.addEventListener('change', (e) => this.handleFile(e.target.files[0]));
        this.copyBtn.addEventListener('click', () => copyToClipboard(this.payload));
    },

    reset() {
        this.previewEl.style.display = 'none';
        this.statusEl.textContent = 'Processando...';
        this.badgesEl.innerHTML = '';
        this.qrEl.innerHTML = '';
        this.payload = '';
    },

    async handleFile(file) {
        if (!file) return;
        this.reset();

        try {
            if (file.type === 'application/pdf') {
                await this.scanPdf(file);
            } else if (file.type.startsWith('image/')) {
                await this.scanImage(file);
            } else {
                this.statusEl.textContent = 'Arquivo não suportado';
            }

            if (this.payload) {
                displayQRCodeResult(this.payload, this.statusEl, this.badgesEl, this.qrEl);
            } else {
                this.statusEl.textContent = `Nenhum QR Code encontrado no ${file.type.includes('pdf') ? 'PDF' : 'arquivo'}.`;
            }
        } catch (error) {
            this.statusEl.textContent = 'Erro ao processar o arquivo.';
            console.error(error);
        }
    },

    async scanPdf(file) {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const viewport = page.getViewport({ scale: 2 });
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = viewport.width;
            canvas.height = viewport.height;

            await page.render({ canvasContext: ctx, viewport }).promise;
            const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(imgData.data, canvas.width, canvas.height);

            if (code?.data) {
                this.payload = code.data;
                break; // Para na primeira página que encontrar um QR Code
            }
        }
    },

    async scanImage(file) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            const url = URL.createObjectURL(file);
            img.src = url;

            img.onload = () => {
                this.previewEl.src = url;
                this.previewEl.style.display = 'block';

                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);

                const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const code = jsQR(imgData.data, canvas.width, canvas.height);
                if (code?.data) {
                    this.payload = code.data;
                }
                // URL.revokeObjectURL(url) não deve ser chamado aqui se a preview continuar visível.
                resolve();
            };

            img.onerror = reject;
        });
    }
};

fileScanner.init();

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

themeSwitcher.init();
