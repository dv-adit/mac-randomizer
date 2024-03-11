
// Validate newMac format (6 octets separated by colons)
const macRegex = /^([0-9A-F]{2}:){5}[0-9A-F]{2}$/i;

// Function to validate MAC address.
const isValidMac = (mac) => /^([0-9A-F]{2}:){5}[0-9A-F]{2}$/i.test(mac);

function autoUpdateDeviceMac(url, param) {
    // Create a URL object
    const parsedUrl = new URL(url);

    let macAddress = parsedUrl.searchParams.get(param); 

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
    if (param) {
        parsedUrl.searchParams.set(param, newMac);
    } else {
        macError.textContent = `MAC address not found. Please check the input URL.`
    }

    // Return the updated URL
    return parsedUrl.toString();
}


function populateMacParamRadioButtons(potentialMacParams) {
    const container = document.getElementById('mac-param-radio-container');
    container.innerHTML = ''; // Clear existing radio buttons

    potentialMacParams.forEach((param, index) => {
        // Create radio button
        const radioInput = document.createElement('input');
        radioInput.id = `bordered-radio-${index}`;
        radioInput.type = 'radio';
        radioInput.value = param;
        radioInput.name = 'bordered-radio';
        radioInput.classList.add('w-4', 'h-4', 'text-blue-600', 'bg-gray-100', 'border-gray-300', 'focus:ring-blue-500', 'dark:focus:ring-blue-600', 'dark:ring-offset-gray-800', 'focus:ring-2', 'dark:bg-gray-700', 'dark:border-gray-600');
        
        // Check the first radio button by default or based on some condition
        if (index === 0) radioInput.checked = true;

        // Create label
        const label = document.createElement('label');
        label.setAttribute('for', radioInput.id);
        label.classList.add('w-full', 'py-4', 'ms-2', 'text-sm', 'font-medium', 'text-gray-900', 'dark:text-gray-300');
        label.textContent = param; // Use the parameter as the label text

        // Create a container for each radio button
        const radioContainer = document.createElement('div');
        radioContainer.classList.add('flex', 'items-center', 'ps-4', 'border', 'border-gray-200', 'rounded', 'dark:border-gray-700');
        
        // Append the radio button and label to the container
        radioContainer.appendChild(radioInput);
        radioContainer.appendChild(label);

        // Append the container to the main container
        container.appendChild(radioContainer);
    });
}

const refreshButton = document.getElementById('refresh-button');
const regenButton = document.getElementById('regen-button');
const updatedUrl = document.getElementById('updated-url');
const macError = document.getElementById('mac-error');


const copyButton = document.getElementById('copy-button');
const $defaultMessage = document.getElementById('default-message');
const $successMessage = document.getElementById('success-message');
const dynamicLink = document.getElementById('dynamic-link');
const originalUrl = document.getElementById('original-url');


regenButton.addEventListener('click', () => {
    macError.textContent = "";
    try {
        const selectedParam = document.querySelector('input[name="bordered-radio"]:checked').value
        const updatedURL = autoUpdateDeviceMac(originalUrl.value, selectedParam);
        updatedUrl.textContent = `${updatedURL}`;
        dynamicLink.href = `${updatedURL}`;
        regenButton.classList.add('focus:ring-4')
        setTimeout(() => {
            regenButton.classList.remove('focus:ring-4')
        })
    } catch (error) {
        console.error(error);
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

originalUrl.addEventListener('input', () => {

    const parsedUrl = new URL(originalUrl.value);
    const potentialMacParams = [];
    for (const [key, value] of parsedUrl.searchParams.entries()) {
        if (isValidMac(value) && !['ap_mac', 'apmac'].includes(key)) {
            console.log(key);
            potentialMacParams.push(key);
        }
    }
    populateMacParamRadioButtons(potentialMacParams);
})