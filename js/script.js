// =======================================================
// UTILITÁRIOS
// =======================================================
const isPix = t => typeof t === 'string' && t.trim().startsWith('000201');

const chunk = (str, s = 28) => (str || '').match(new RegExp('.{1,' + s + '}', 'g')) || [];

const setBadges = (el, text) => {
    el.innerHTML = '';
    if (!text) return;
    const b = document.createElement('div');
    b.className = 'badge ' + (isPix(text) ? 'ok' : 'warn');
    b.textContent = isPix(text) ? 'Pix válido' : 'QR não é Pix';
    el.appendChild(b);
};

const renderPayload = (wrap, payload) => {
    wrap.innerHTML = '';
    if (!payload || !isPix(payload)) return;

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

const copyToClipboard = async t => {
    if (!t) return;
    try {
        await navigator.clipboard.writeText(t);
        alert('Pix copiado!');
    } catch {
        alert('Não foi possível copiar');
    }
};

// =======================================================
// CÂMERA
// =======================================================
const videoEl = document.getElementById('video');
const cameraSelect = document.getElementById('cameraSelect');
const statusCam = document.getElementById('statusCam');
const badgesCam = document.getElementById('badgesCam');
const pixCam = document.getElementById('pixCam');
const copyCam = document.getElementById('copyCam');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');

let scanning = false;
let lastCamPayload = '';

async function listCameras() {
    try {
        const cams = await navigator.mediaDevices.enumerateDevices();
        cameraSelect.innerHTML = '';
        cams.filter(c => c.kind === 'videoinput').forEach((c, i) => {
            const opt = document.createElement('option');
            opt.value = c.deviceId;
            opt.textContent = c.label || `Câmera ${i + 1}`;
            cameraSelect.appendChild(opt);
        });
    } catch (e) {
        statusCam.textContent = 'Não foi possível listar câmeras.';
    }
}

async function startScan() {
    if (scanning) return;
    scanning = true;
    statusCam.textContent = 'Iniciando câmera...';

    const stream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: cameraSelect.value || undefined }
    });

    videoEl.srcObject = stream;
    await videoEl.play();
    statusCam.textContent = 'Lendo QR...';
    scanFrame();
}

function stopScan() {
    scanning = false;
    videoEl.srcObject?.getTracks().forEach(t => t.stop());
    statusCam.textContent = 'parado';
}

async function scanFrame() {
    if (!scanning) return;

    const canvas = document.createElement('canvas');
    canvas.width = videoEl.videoWidth;
    canvas.height = videoEl.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoEl, 0, 0);

    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imgData.data, canvas.width, canvas.height);

    if (code && code.data && isPix(code.data)) {
        lastCamPayload = code.data;
        statusCam.textContent = 'QR Pix detectado';
        setBadges(badgesCam, lastCamPayload);
        renderPayload(pixCam, lastCamPayload);
    } else {
        requestAnimationFrame(scanFrame);
    }
}

startBtn.addEventListener('click', startScan);
stopBtn.addEventListener('click', stopScan);
copyCam.addEventListener('click', () => copyToClipboard(lastCamPayload));
listCameras();

// =======================================================
// UPLOAD DE ARQUIVO (IMAGEM OU PDF)
// =======================================================
const fileInput = document.getElementById('fileInput');
const statusFile = document.getElementById('statusFile');
const badgesFile = document.getElementById('badgesFile');
const pixFile = document.getElementById('pixFile');
const copyFile = document.getElementById('copyFile');
const previewImg = document.getElementById('previewImg');
let lastFilePayload = '';

fileInput.addEventListener('change', async () => {
    const file = fileInput.files?.[0];
    if (!file) return;

    previewImg.style.display = 'none';
    statusFile.textContent = 'Processando...';
    badgesFile.innerHTML = '';
    pixFile.innerHTML = '';
    lastFilePayload = '';

    if (file.type === 'application/pdf') {
        // PDF.js
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const viewport = page.getViewport({ scale: 2 });
            const canvas = document.createElement('canvas');
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            const ctx = canvas.getContext('2d');
            await page.render({ canvasContext: ctx, viewport }).promise;
            const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(imgData.data, canvas.width, canvas.height);
            if (code && code.data && isPix(code.data)) {
                lastFilePayload = code.data;
                break;
            }
        }
        if (lastFilePayload) {
            statusFile.textContent = 'QR Pix detectado no PDF';
            setBadges(badgesFile, lastFilePayload);
            renderPayload(pixFile, lastFilePayload);
        } else {
            statusFile.textContent = 'Nenhum QR Pix encontrado no PDF';
        }
    } else if (file.type.startsWith('image/')) {
        // imagem
        const img = new Image();
        img.src = URL.createObjectURL(file);
        img.onload = () => {
            previewImg.src = img.src;
            previewImg.style.display = 'block';
            URL.revokeObjectURL(img.src);

            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);

            const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(imgData.data, canvas.width, canvas.height);
            if (code && code.data && isPix(code.data)) {
                lastFilePayload = code.data;
                statusFile.textContent = 'QR Pix detectado';
                setBadges(badgesFile, lastFilePayload);
                renderPayload(pixFile, lastFilePayload);
            } else {
                statusFile.textContent = 'Nenhum QR Pix encontrado';
            }
        };
    } else {
        statusFile.textContent = 'Arquivo não suportado';
    }
});

copyFile.addEventListener('click', () => copyToClipboard(lastFilePayload));
