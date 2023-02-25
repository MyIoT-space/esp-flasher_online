// const baudrates = document.getElementById('baudrates');
const connectButton = document.getElementById('connectButton');
const disconnectButton = document.getElementById('disconnectButton');
// const resetButton = document.getElementById('resetButton');
// const consoleStartButton = document.getElementById('consoleStartButton');
// const consoleStopButton = document.getElementById('consoleStopButton');
const eraseButton = document.getElementById('eraseButton');
const programButton = document.getElementById('programButton');
const terminal = document.getElementById('terminal');
const programDiv = document.getElementById('program');
const lblConnTo = document.getElementById('lblConnTo');
const table = document.getElementById('fileTable');
const alertDiv = document.getElementById('alertDiv');
const placa = document.getElementById('placa');

import * as esptooljs from "./bundle.js";

// Read the file from the server path
const ESPLoader = esptooljs.ESPLoader;
const Transport = esptooljs.Transport;

let term = new Terminal({ cols: 120, rows: 40 });
term.open(terminal);

let device = null;
let transport;
let chip = null;
let esploader;
let file1 = null;
let connected = false;

// addFile.style.display = 'none';
disconnectButton.style.display = 'none';
eraseButton.style.display = 'none';
programButton.style.display = 'none';

// consoleStopButton.style.display = 'none';
// filesDiv.style.display = 'none';
// var endereco_firm_val = document.getElementById("endereco_firm");

var endereco_firm_val = "https://" + document.cookie.replace(/(?:(?:^|.*;\s*)endereco_firm\s*\=\s*([^;]*).*$)|^.*$/, "$1");
// console.log(endereco_firm_val)
// const firmware = fetch(endereco_firm_val)
//   .then(response => {
//     const contentType = response.headers.get('content-type');
//     console.log(contentType);
//     return response.arrayBuffer();
//   })
//   .then(buffer => {
//     // Do something with the buffered file here
//     const uint8Array = new Uint8Array(buffer);
//     const decoder = new TextDecoder('utf-8');
//     const text = decoder.decode(uint8Array);
//     console.log('Buffered file as string:', text);
//   })
//   .catch(error => {
//     console.error('Error fetching file:', error);
//   });




//  const extension = contentType.split('/').pop();
//   if (contentType && (contentType.includes('application/octet-stream') || contentType.includes('application/x-binary'))) {
//     console.log('File is a binary file or hex!');
//     return response.arrayBuffer();
//   } else {
//     console.log('File is not a binary file!');
//     throw new Error('File is not a binary file');
//   }
// }

// var placa_val = document.getElementById("placa");

var placa_val = document.cookie.replace(/(?:(?:^|.*;\s*)placa\s*\=\s*([^;]*).*$)|^.*$/, "$1");

// placa.textContent = placa_val;
// endereco_firm.textContent = "Endereço do firmware: " + endereco_firm_val;

function handleFileSelect(evt) {
    var file = evt.target.files[0];

    if (!file) return;

    var reader = new FileReader();

    reader.onload = (function (theFile) {
        return function (e) {
            file1 = e.target.result;
            evt.target.data = file1;
        };
    })(file);

    reader.readAsBinaryString(file);
}

let espLoaderTerminal = {
    clean() {
        term.clear();
    },
    writeLine(data) {
        term.writeln(data);
    },
    write(data) {
        term.write(data)
    }
}

connectButton.onclick = async () => {
    if (device === null) {
        device = await navigator.serial.requestPort({});
        transport = new Transport(device);
    }
    let speed = 921600;

    if (placa_val == "ESP8266") {
        console.log("mudando para 115200, visto que é uma ESP8266");
        speed = 115200;
    }


    try {
        esploader = new ESPLoader(transport, speed, espLoaderTerminal);
        connected = true;

        chip = await esploader.main_fn();

    } catch (e) {
        console.error(e);
        term.writeln(`Error: ${e.message}`);
    }

    console.log('Settings done for :' + chip);
    lblConnTo.innerHTML = 'Configurando o dispositivo: ' + placa_val;
    lblConnTo.style.display = 'block';
    connectButton.style.display = 'none';
    disconnectButton.style.display = 'initial';
    eraseButton.style.display = 'initial';
    programButton.style.display = 'initial';
};

eraseButton.onclick = async () => {
    eraseButton.disabled = true;
    try {
        await esploader.erase_flash();
    } catch (e) {
        console.error(e);
        term.writeln(`Error: ${e.message}`);
    } finally {
        eraseButton.disabled = false;
    }
};

// to be called on disconnect - remove any stale references of older connections if any
function cleanUp() {
    device = null;
    transport = null;
    chip = null;
}

disconnectButton.onclick = async () => {
    if (transport) await transport.disconnect();

    term.clear();
    connected = false;
    // baudrates.style.display = 'initial';
    connectButton.style.display = 'initial';
    disconnectButton.style.display = 'none';
    eraseButton.style.display = 'none';
    lblConnTo.style.display = 'none';
    // filesDiv.style.display = 'none';
    alertDiv.style.display = 'none';
    // consoleDiv.style.display = 'initial';
    cleanUp();
};

// let isConsoleClosed = false;


programButton.onclick = async () => {
    const alertMsg = document.getElementById('alertmsg');

    // Hide error message
    alertDiv.style.display = 'none';

    async function fetchAndReadBinaryString(url) {
        const response = await fetch(url);
        const blob = await response.blob();

        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                resolve(reader.result);
            };
            reader.onerror = reject;
            reader.readAsBinaryString(blob);
        });
    }
	// await esploader.erase_region(0x1000, 0x5FFF);
	// await esploader.erase_region(0x8000, 0x8FFF);
	// await esploader.erase_region(0xe000, 0xFFFF);
	// await esploader.erase_region(0x10000, 0x46FFF);

    const main_firmware = await fetchAndReadBinaryString(endereco_firm_val);

    let fileArray;
    if (placa_val === "ESP32_DEVKIT" || placa_val === "ESPCAM")   {  
		const bootloader = await fetchAndReadBinaryString("https://espflasher.leonuzzy.repl.co/placas/esp32devkit/bootloader.bin");
		console.log("baixou bootloader");
		const partitions = await fetchAndReadBinaryString("https://espflasher.leonuzzy.repl.co/placas/esp32devkit/partitions.bin");
		console.log("baixou partitions");

    	fileArray = [
            { data: bootloader, address: 0x1000 },
            { data: partitions, address: 0x8000 },
            { data: main_firmware, address: 0x10000 },
        ];
    } else if (placa_val == "ESP8266") {
        fileArray = [{ data: main_firmware, address: 0x0 }];
    }
    
    //esp32 bootloader 0x1000
    //esp32 partitions 0x8000
    //esp32 principal 0x10000
    //esp8266 principal 0x0
    try {
		console.log("começando o flash");

        await esploader.write_flash(
            fileArray,
            'keep',
            undefined,
            undefined,
            false,
            true,
            (fileIndex, written, total) => {
    		const percentComplete = (written / total) * 100;
    		console.log(`Flashing file ${fileIndex}:${percentComplete.toFixed(2)}%`);},
            (image) => CryptoJS.MD5(CryptoJS.enc.Latin1.parse(image))
        );

			//reset automatico depois do flash
		  await transport.setDTR(false);
		  await new Promise((resolve) => setTimeout(resolve, 100));
		  await transport.setDTR(true);
	
    } catch (e) {
        console.error(e);
        term.writeln(`Error: ${e.message}`);
    } finally {
        // Hide progress bars and show erase buttons
        for (let index = 1; index < table.rows.length; index++) {
            table.rows[index].cells[2].style.display = 'none';
            table.rows[index].cells[3].style.display = 'initial';
        }
    }
};
