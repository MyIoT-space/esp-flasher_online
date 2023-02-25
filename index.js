// const baudrates = document.getElementById('baudrates');
const connectButton = document.getElementById('connectButton');
const disconnectButton = document.getElementById('disconnectButton');
// const resetButton = document.getElementById('resetButton');
// const consoleStartButton = document.getElementById('consoleStartButton');
// const consoleStopButton = document.getElementById('consoleStopButton');
const eraseButton = document.getElementById('eraseButton');
const programButton = document.getElementById('programButton');
const filesDiv = document.getElementById('files');
const terminal = document.getElementById('terminal');
const programDiv = document.getElementById('program');
// const consoleDiv = document.getElementById('console');
// const lblBaudrate = document.getElementById('lblBaudrate');
const lblConnTo = document.getElementById('lblConnTo');
const table = document.getElementById('fileTable');
const alertDiv = document.getElementById('alertDiv');
const placa = document.getElementById('placa');
// const endereco_firm = document.getElementById('endereco_firm');
const addFile = document.getElementById('addFile');//isso nao tinha e nao sei como funfava

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

addFile.style.display = 'none';
disconnectButton.style.display = 'none';
eraseButton.style.display = 'none';
// consoleStopButton.style.display = 'none';
filesDiv.style.display = 'none';
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
        console.log("mudando para 115200");
        speed = 115200;
    }


    try {
        esploader = new ESPLoader(transport, speed, espLoaderTerminal);
        // esploader = new ESPLoader(transport, baudrates.value, espLoaderTerminal);
        connected = true;

        chip = await esploader.main_fn();

        // Temporarily broken
        // await esploader.flash_id();
    } catch (e) {
        console.error(e);
        term.writeln(`Error: ${e.message}`);
    }

    console.log('Settings done for :' + chip);
    // lblBaudrate.style.display = 'none';
    lblConnTo.innerHTML = 'Configurando o dispositivo: ' + placa_val;
    lblConnTo.style.display = 'block';
    // baudrates.style.display = 'none';
    connectButton.style.display = 'none';
    disconnectButton.style.display = 'initial';
    eraseButton.style.display = 'initial';
    filesDiv.style.display = 'initial';
    // consoleDiv.style.display = 'none';
};

// resetButton.onclick = async () => {
//   if (device === null) {
//     device = await navigator.serial.requestPort({});
//     transport = new Transport(device);
//   }

//   await transport.setDTR(false);
//   await new Promise((resolve) => setTimeout(resolve, 100));
//   await transport.setDTR(true);
// };

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

addFile.onclick = () => {
    var rowCount = table.rows.length;
    var row = table.insertRow(rowCount);

    //Column 1 - Offset
    var cell1 = row.insertCell(0);
    var element1 = document.createElement('input');
    element1.type = 'text';
    element1.id = 'offset' + rowCount;
    element1.classList.add('para_esconder');
    element1.value = '0x0';

    cell1.appendChild(element1);

    var cell2 = row.insertCell(1);


    // Column 2 - File selector
    var cell2 = row.insertCell(1);
    var element2 = document.createElement('input');
    element2.type = 'file';
    element2.id = 'selectFile' + rowCount;
    element2.name = 'selected_File' + rowCount;
    element2.classList.add('para_esconder');
    element2.addEventListener('change', handleFileSelect, false);
    cell2.appendChild(element2);

    // Column 3  - Progress
    var cell3 = row.insertCell(2);
    cell3.classList.add('progress-cell');
    cell3.style.display = 'block';
    cell3.innerHTML = `<progress value="0" max="100"></progress>`;

    // Column 4  - Remove File
    var cell4 = row.insertCell(3);
    cell4.classList.add('action-cell');
    if (rowCount > 1) {
        var element4 = document.createElement('input');
        element4.type = 'button';
        var btnName = 'button' + rowCount;
        element4.name = btnName;
        element4.setAttribute('class', 'btn');
        element4.setAttribute('value', 'Remove'); // or element1.value = "button";
        element4.onclick = function () {
            removeRow(row);
        };
        cell4.appendChild(element4);
    }
};

function removeRow(row) {
    const rowIndex = Array.from(table.rows).indexOf(row);
    table.deleteRow(rowIndex);
}

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
    filesDiv.style.display = 'none';
    alertDiv.style.display = 'none';
    // consoleDiv.style.display = 'initial';
    cleanUp();
};

// let isConsoleClosed = false;

function validate_program_inputs() {
    let offsetArr = [];
    var rowCount = table.rows.length;
    var row;
    let offset = 0;
    let fileData = null;

    // check for mandatory fields
    for (let index = 1; index < rowCount; index++) {
        row = table.rows[index];

        //offset fields checks
        var offSetObj = row.cells[0].childNodes[0];
        offset = parseInt(offSetObj.value);

        // Non-numeric or blank offset
        if (Number.isNaN(offset)) return 'Offset field in row ' + index + ' is not a valid address!';
        // Repeated offset used
        else if (offsetArr.includes(offset)) return 'Offset field in row ' + index + ' is already in use!';
        else offsetArr.push(offset);

        // var fileObj = row.cells[1].childNodes[0];
        // fileData = fileObj.data;
        // if (fileData == null) return 'No file selected for row ' + index + '!';
    }
    return 'success';
}

programButton.onclick = async () => {
    const alertMsg = document.getElementById('alertmsg');
    const err = validate_program_inputs();

    if (err != 'success') {
        alertMsg.innerHTML = '<strong>' + err + '</strong>';
        alertDiv.style.display = 'block';
        return;
    }

    // Hide error message
    alertDiv.style.display = 'none';

    // const fileArray = [];
    const progressBars = [];

    for (let index = 1; index < table.rows.length; index++) {
        const row = table.rows[index];

        const offSetObj = row.cells[0].childNodes[0];
        const offset = parseInt(offSetObj.value);

        const fileObj = row.cells[1].childNodes[0];
        const progressBar = row.cells[2].childNodes[0];

        progressBar.value = 0;
        progressBars.push(progressBar);

        row.cells[2].style.display = 'initial';
        row.cells[3].style.display = 'none';

        // fileArray.push({ data: fileObj.data, address: offset });
        // fileArray.push({ data: fileObj.data, address: offset });

    }

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
		const partitions = await fetchAndReadBinaryString("https://espflasher.leonuzzy.repl.co/placas/esp32devkit/partitions.bin");
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
        await esploader.write_flash(
            fileArray,
            'keep',
            undefined,
            undefined,
            false,
            true,
            // (fileIndex, written, total) => {
            //     progressBars[fileIndex].value = (written / total) * 100;
            // },
            (image) => CryptoJS.MD5(CryptoJS.enc.Latin1.parse(image)),
        );
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
addFile.onclick();
