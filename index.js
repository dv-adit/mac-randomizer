
// Validate newMac format (6 octets separated by colons)
const macRegex = /^([0-9A-F]{2}:){5}[0-9A-F]{2}$/i;

// Function to validate MAC address.
const isValidMac = (mac) => /^([0-9A-F]{2}:){5}[0-9A-F]{2}$/i.test(mac);

function autoUpdateDeviceMac(url) {
    // Create a URL object
    const parsedUrl = new URL(url);

    // Check if any parameter matches a MAC address format
    const potentialMacParams = [];
    for (const [key, value] of parsedUrl.searchParams.entries()) {
     
        if (isValidMac(value) && !['ap_mac', 'apmac'].includes(key)) { // Exclude references to AP Mac addresses to remove errors.
            potentialMacParams.push(key);
        }
    }

    console.log(potentialMacParams);

    // If potential MAC params found, use the first one (or user-provided value)
    let macAddress = document.getElementById('mac-address').value;
    if (!macAddress && potentialMacParams.length > 0) {
        macAddress = parsedUrl.searchParams.get(potentialMacParams[0]);
    }

    // Split the mac address into octets
    const macOctets = macAddress.split(':');
    const validOctets = macOctets.length > 6 ? macOctets.slice(0, 3) : macOctets;

    // Randomize the last three octets (ensure they stay valid hex values)
    for (let i = 3; i < 6; i++) {
        validOctets[i] = Math.floor(Math.random() * 16).toString(16).padStart(2, '0');
    }

    // Rebuild the new mac address
    const newMac = validOctets.join(':');

    // Update the chosen parameter (if any)
    if (potentialMacParams.length > 0) {
        parsedUrl.searchParams.set(potentialMacParams[0], newMac);
    } else {
        macError.textContent = `MAC address not found. Please check the input URL.`
    }

    // Return the updated URL
    return parsedUrl.toString();
}

function updateDeviceMac(url, newMac) {
    // Create a URL object
    const parsedUrl = new URL(url);

    if (!isValidMac(newMac)) {
        throw new Error('Invalid new mac_address format. Must be 6 octets separated by colons (e.g., FF:AA:BB:CC:DD:EE)');
    }

    // Check if any parameter matches a MAC address format
    const potentialMacParams = [];
    for (const [key, value] of parsedUrl.searchParams.entries()) {
        if (isValidMac(value) && !['ap_mac', 'apmac'].includes(key)) {
            console.log(key);
            potentialMacParams.push(key);
        }
    }

    // Update the chosen parameter (if any)
    if (potentialMacParams.length > 0) {
        parsedUrl.searchParams.set(potentialMacParams[0], newMac);
    } else {
        // Show error that MAC address not found/supported.
        macError.textContent = `MAC address not found. Please check the input URL.`
    }

    // Return the updated URL
    return parsedUrl.toString();
}

const refreshButton = document.getElementById('refresh-button');
const regenButton = document.getElementById('regen-button');
const updatedUrl = document.getElementById('updated-url');
const macError = document.getElementById('mac-error');


const copyButton = document.getElementById('copy-button');
const $defaultMessage = document.getElementById('default-message');
const $successMessage = document.getElementById('success-message');
const dynamicLink = document.getElementById('dynamic-link');

regenButton.addEventListener('click', () => {
    macError.textContent = "";
    const originalUrl = document.getElementById('original-url').value;
    try {
        const updatedURL = autoUpdateDeviceMac(originalUrl);
        updatedUrl.textContent = `${updatedURL}`;
        dynamicLink.href = `${updatedURL}`;
        regenButton.classList.add('focus:ring-4')
        setTimeout(() => {
            regenButton.classList.remove('focus:ring-4')
        })
    } catch (error) {
        console.error(error.message);
        //updatedUrl.textContent = `Error: ${error.message}`;
    }
});

refreshButton.addEventListener('click',() => {
    macError.textContent = "";
    const originalUrl = document.getElementById('original-url').value;
    const newMac = document.getElementById('mac-address').value;
    
    if (!isValidMac(newMac)) {
        macError.textContent = `Enter a valid MAC address or Regenerate MAC to get a randomized URL`;
    }
    try {
        const updatedURL = updateDeviceMac(originalUrl, newMac);
        updatedUrl.textContent = `${updatedURL}`;
        dynamicLink.href = `${updatedURL}`;
        refreshButton.classList.add('focus:ring-4')
        setTimeout(() => {
            refreshButton.classList.remove('focus:ring-4')
        })
    } catch (error) {
        console.error(error.message);
        //updatedUrl.textContent = `Error: ${error.message}`;
    }
});

copyButton.addEventListener('click', () => {
    // Use Clipboard API if available
    try {
    if (updatedUrl.textContent.length < 5) {
        macError.textContent = `Enter a valid input URL.`
        throw new Error(`The input URL is empty: ${updatedUrl.textContent}`)
    }
    navigator.clipboard.writeText(updatedUrl.textContent);
    copyButton.classList.add('focus:ring-4', 'bg-blue-500', 'text-white')
    copyButton.classList.remove('outline-1','outline-blue-500', 'text-blue-500')

    $defaultMessage.classList.add('hidden');
    $successMessage.classList.remove('hidden');
    } catch {
        macError.textContent = `Error copying to clipboard. Please try manually.`
    }
    // reset to default state
    setTimeout(() => {
        $defaultMessage.classList.remove('hidden');
        $successMessage.classList.add('hidden');
        copyButton.classList.remove('focus:ring', 'bg-blue-500', 'text-white')
        copyButton.classList.add('outline-1', 'outline-blue-500', 'text-blue-500')
    }, 2000);
});