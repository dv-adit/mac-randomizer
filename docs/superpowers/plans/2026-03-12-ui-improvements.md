# MAC Randomizer UI Improvements Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the Refresh MAC Tool UI with stacked sections, a larger input, batch URL generation, per-row and copy-all clipboard support, and a polished slate aesthetic.

**Architecture:** Full rewrite of `index.html` (new layout and structure) and `index.js` (new rendering and event logic). Core MAC randomization logic (`isValidMac`, `autoUpdateDeviceMac`) is preserved unchanged. No new files, no build tooling.

**Tech Stack:** Vanilla JS, Tailwind CSS via CDN, `navigator.clipboard` API

---

## Chunk 1: HTML Structure

### Task 1: Rebuild index.html

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Replace index.html with new layout**

Full replacement — keep the `<head>` (Tailwind CDN, analytics script) and `<script src="index.js">`, replace everything in `<body>`:

```html
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Refresh MAC Tool</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script defer src="https://analytics.us.umami.is/script.js"
    data-website-id="1dcedebd-7a5c-474e-85e5-e7f72358b5d6"></script>
</head>

<body class="min-h-screen bg-slate-100 flex items-center justify-center px-4 py-8">
  <div class="w-full max-w-lg bg-white rounded-xl shadow-md">
    <div class="p-6">
      <h1 class="text-2xl font-bold text-slate-800 text-center mb-6">Refresh MAC Tool</h1>

      <!-- INPUT SECTION -->
      <div class="border-t border-slate-100 pt-4">
        <p class="text-xs uppercase tracking-wide text-slate-400 mb-3">Input</p>
        <textarea id="original-url" rows="6" placeholder="Enter your captive portal URL here..."
          class="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"></textarea>
        <p id="no-mac-message" class="text-xs text-slate-500 mt-1 hidden">No MAC params found in this URL</p>
      </div>

      <!-- OPTIONS SECTION -->
      <div id="options-section" class="border-t border-slate-100 pt-4 mt-4 hidden">
        <p class="text-xs uppercase tracking-wide text-slate-400 mb-3">Options</p>
        <ul id="mac-param-list" class="mb-4"></ul>
        <div class="flex items-center gap-3 mb-4">
          <label for="url-count" class="text-sm text-slate-600">Number of URLs</label>
          <input type="number" id="url-count" value="1" min="1" max="10"
            class="w-20 border border-slate-200 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
        </div>
        <button type="button" id="regen-button" data-umami-event="Regenerate MAC button"
          class="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors">
          Regenerate MAC
        </button>
      </div>

      <!-- OUTPUT SECTION -->
      <div id="output-section" class="border-t border-slate-100 pt-4 mt-4 hidden">
        <div class="flex items-center justify-between mb-3">
          <p class="text-xs uppercase tracking-wide text-slate-400">Output</p>
          <button type="button" id="copy-all-button" data-umami-event="Copy All button"
            class="hidden text-sm border border-slate-300 text-slate-600 hover:bg-slate-50 px-3 py-1 rounded-lg transition-colors">
            Copy All
          </button>
        </div>
        <ul id="output-list" class="space-y-2"></ul>
      </div>

    </div>
  </div>
  <script src="index.js"></script>
</body>

</html>
```

- [ ] **Step 2: Open in browser and verify structure**

Open `http://localhost:8734` (or via `python3 -m http.server`).

Expected: card centered on slate background, "Input" section label visible, large textarea, no Options or Output sections visible yet. No JS errors in console (JS will error since index.js still references old element IDs — that's fine for now).

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat: rebuild HTML with stacked Input/Options/Output sections"
```

---

## Chunk 2: JavaScript Logic

### Task 2: Rewrite index.js

**Files:**
- Modify: `index.js`

- [ ] **Step 1: Replace index.js**

Full replacement:

```javascript
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
        btn.textContent = '⎘';
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
    button.textContent = '✓';
    button.classList.add('text-green-500');
    setTimeout(() => {
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
    navigator.clipboard.writeText(btn.dataset.url);
    showCopyFeedback(btn, '⎘');
});

copyAllButton.addEventListener('click', () => {
    navigator.clipboard.writeText(copyAllButton.dataset.urls);
    showCopyFeedback(copyAllButton, 'Copy All');
});
```

- [ ] **Step 2: Verify — URL with MACs shows Options section**

Open the app in browser. Paste:
```
http://portal.example.com/login?device_mac=AA:BB:CC:11:22:33&ap_mac=00:11:22:33:44:55&client_mac=AA:BB:CC:44:55:66
```

Expected:
- Options section appears with `device_mac` and `client_mac` radio buttons (`ap_mac` excluded)
- `device_mac` pre-selected
- Count input shows `1`

- [ ] **Step 3: Verify — Regenerate single URL**

Click "Regenerate MAC" with count = 1.

Expected:
- Output section appears with one URL row
- URL in monospace, truncated if long
- Copy icon `⎘` on the right
- No "Copy All" button visible

- [ ] **Step 4: Verify — Copy single URL feedback**

Click the `⎘` button on the URL row.

Expected: button briefly shows `✓` in green, then reverts to `⎘`. URL is in clipboard.

- [ ] **Step 5: Verify — Batch generation and Copy All**

Set count to `3`, click "Regenerate MAC".

Expected:
- 3 URL rows appear, each with unique randomized last 3 octets
- "Copy All" button visible at top of Output section
- Clicking "Copy All" copies all 3 URLs newline-separated, button briefly shows `✓`

- [ ] **Step 6: Verify — Output hides on URL edit**

Clear or modify the URL textarea after generating.

Expected: Output section disappears.

- [ ] **Step 7: Verify — Zero MAC params message**

Paste a valid URL with no MAC params:
```
http://portal.example.com/login?session=abc123
```

Expected: Options section stays hidden, "No MAC params found in this URL" appears below textarea.

- [ ] **Step 8: Verify — Invalid/partial URL is silent**

Type `not-a-url` into the textarea.

Expected: no error shown, Options hidden, no console errors thrown to UI.

- [ ] **Step 9: Verify — Count clamping**

Manually type `99` into the count field, click Regenerate.

Expected: count field resets to `10`, 10 URLs generated.

- [ ] **Step 10: Commit**

```bash
git add index.js
git commit -m "feat: rewrite JS with batch generation, per-row copy, and copy-all"
```
