const isValidMac = (mac) => /^([0-9A-F]{2}:){5}[0-9A-F]{2}$/i.test(mac);

function autoUpdateDeviceMac(url, param) {
    const parsedUrl = new URL(url);
    const macAddress = parsedUrl.searchParams.get(param);
    const macOctets = macAddress.split(':');
    const validOctets = macOctets.length > 6 ? macOctets.slice(0, 3) : macOctets;
    for (let i = 3; i < 6; i++) {
        validOctets[i] = Math.floor(Math.random() * 16).toString(16).padStart(2, '0');
    }
    parsedUrl.searchParams.set(param, validOctets.join(':'));
    return parsedUrl.toString();
}

function populateMacParamRadioButtons(params) {
    const list = document.getElementById('mac-param-list');
    list.innerHTML = '';
    params.forEach((param, index) => {
        const li = document.createElement('li');
        li.className = 'flex items-center gap-2 py-1';

        const input = document.createElement('input');
        input.type = 'radio';
        input.id = `radio-${index}`;
        input.name = 'mac-param';
        input.value = param;
        input.className = 'text-blue-500 focus:ring-blue-500';
        if (index === 0) input.checked = true;

        const label = document.createElement('label');
        label.setAttribute('for', input.id);
        label.className = 'text-sm text-slate-700';
        label.textContent = param;

        li.appendChild(input);
        li.appendChild(label);
        list.appendChild(li);
    });
}

function renderOutputUrls(urls) {
    const outputList = document.getElementById('output-list');
    const copyAllButton = document.getElementById('copy-all-button');

    outputList.innerHTML = '';
    urls.forEach((url) => {
        const li = document.createElement('li');
        li.className = 'flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-2';

        const a = document.createElement('a');
        a.href = url;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.className = 'flex-1 font-mono text-sm text-slate-700 truncate hover:text-blue-500';
        a.textContent = url;

        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'shrink-0 text-slate-400 hover:text-slate-600 transition-colors text-lg leading-none';
        btn.title = 'Copy URL';
        btn.textContent = '📋';
        btn.dataset.url = url;
        btn.dataset.umamiEvent = 'Copy URL button';

        li.appendChild(a);
        li.appendChild(btn);
        outputList.appendChild(li);
    });

    if (urls.length > 1) {
        copyAllButton.classList.remove('hidden');
        copyAllButton.dataset.urls = urls.join('\n');
    } else {
        copyAllButton.classList.add('hidden');
    }
}

function showCopyFeedback(button, originalText) {
    clearTimeout(button._copyTimer);
    button.textContent = '✓';
    button.classList.add('text-green-500');
    button._copyTimer = setTimeout(() => {
        button.textContent = originalText;
        button.classList.remove('text-green-500');
    }, 1500);
}

// DOM refs
const originalUrl = document.getElementById('original-url');
const optionsSection = document.getElementById('options-section');
const outputSection = document.getElementById('output-section');
const regenButton = document.getElementById('regen-button');
const copyAllButton = document.getElementById('copy-all-button');
const noMacMessage = document.getElementById('no-mac-message');
const outputList = document.getElementById('output-list');

originalUrl.addEventListener('input', () => {
    noMacMessage.classList.add('hidden');
    outputSection.classList.add('hidden');

    const value = originalUrl.value.trim();
    if (!value) {
        optionsSection.classList.add('hidden');
        return;
    }

    let parsedUrl;
    try {
        parsedUrl = new URL(value);
    } catch {
        optionsSection.classList.add('hidden');
        return;
    }

    const potentialMacParams = [];
    for (const [key, val] of parsedUrl.searchParams.entries()) {
        if (isValidMac(val) && !['ap_mac', 'apmac'].includes(key)) {
            potentialMacParams.push(key);
        }
    }

    if (potentialMacParams.length === 0) {
        optionsSection.classList.add('hidden');
        noMacMessage.classList.remove('hidden');
        return;
    }

    populateMacParamRadioButtons(potentialMacParams);
    optionsSection.classList.remove('hidden');
});

regenButton.addEventListener('click', () => {
    const selectedRadio = document.querySelector('input[name="mac-param"]:checked');
    if (!selectedRadio) return;

    const countInput = document.getElementById('url-count');
    const count = Math.min(10, Math.max(1, parseInt(countInput.value, 10) || 1));
    countInput.value = count;

    const urls = [];
    for (let i = 0; i < count; i++) {
        urls.push(autoUpdateDeviceMac(originalUrl.value.trim(), selectedRadio.value));
    }

    renderOutputUrls(urls);
    outputSection.classList.remove('hidden');
});

outputList.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-url]');
    if (!btn) return;
    navigator.clipboard.writeText(btn.dataset.url).then(() => {
        showCopyFeedback(btn, '📋');
    });
});

copyAllButton.addEventListener('click', () => {
    navigator.clipboard.writeText(copyAllButton.dataset.urls).then(() => {
        showCopyFeedback(copyAllButton, 'Copy All');
    });
});
