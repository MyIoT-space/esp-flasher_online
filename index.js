const connectButton = document.getElementById('connectButton');
const disconnectButton = document.getElementById('disconnectButton');
const nome_placa = document.getElementById('nome_placa');
const mensagem = document.getElementById('mensagem');
const eraseButton = document.getElementById('eraseButton');
const programButton = document.getElementById('programButton');
const terminal = document.getElementById('terminal');
const programDiv = document.getElementById('program');
// const lblConnTo = document.getElementById('lblConnTo');
const table = document.getElementById('fileTable');
const alertDiv = document.getElementById('alertDiv');
const placa = document.getElementById('placa');
const progress = document.getElementById('progress');
const botoes_conectar_apagar = document.getElementById('botoes_conectar_apagar');

import * as esptooljs from "./bundle.js";

// Read the file from the server path
const ESPLoader = esptooljs.ESPLoader;
const Transport = esptooljs.Transport;

let term = new Terminal({ cols: 120, rows: 25 });
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
mensagem.style.marginBottom = "20px";
programButton.style.display = 'none';
// mensagem.style.display = 'none';
mensagem.style.fontSize = '22px';
progress.style.display = 'none';
nome_placa.style.display = 'none';
nome_placa.style.fontSize = "20px";
nome_placa.style.marginBottom = "20px";
botoes_conectar_apagar.style.display = 'flex';
botoes_conectar_apagar.style.justifyContent = 'space-evenly';
botoes_conectar_apagar.style.alignContent = 'space-center';

var endereco_firm_val = "https://" + document.cookie.replace(/(?:(?:^|.*;\s*)endereco_firm\s*\=\s*([^;]*).*$)|^.*$/, "$1");
// console.log(endereco_firm_val)

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
    progress.style.display = 'block';
	eraseButton.style.display = 'initial';
	mensagem.textContent = "Clique em programar para começar!";


  } catch (e) {
    // mensagem.style.display = 'initial';
    mensagem.textContent = e;
    mensagem.style.color = 'red';
    disconnectButton.style.display = 'initial';
    console.error(e);
    term.writeln(`Error: ${e.message}`);
  }

  console.log('Settings done for :' + chip);
  nome_placa.textContent = 'Configurando o dispositivo: ' + placa_val;
  nome_placa.style.display = 'flex';
  nome_placa.style.justifyContent = 'center';
  nome_placa.style.color = "white";
  connectButton.style.display = 'none';
  eraseButton.style.display = 'initial';
  programButton.style.display = 'initial';
};

eraseButton.onclick = async () => {
  eraseButton.disabled = true;
  try {
    await esploader.erase_flash();
  } catch (e) {
    mensagem.style.display = 'initial';
    mensagem.textContent = e;
    mensagem.style.color = 'red';
    disconnectButton.style.display = 'initial';
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
  connected = false;
  term.clear();
  cleanUp();
  connectButton.style.display = 'initial';
  disconnectButton.style.display = 'none';
  eraseButton.style.display = 'none';
  alertDiv.style.display = 'none';
  programButton.style.display = 'none';
  mensagem.textContent = 'Clique em conectar para começar!';
  mensagem.style.color = 'white';
  updateProgressBar(0);
};

// let isConsoleClosed = false;
const progressBar = document.querySelector('.progress-bar');

function updateProgressBar(progress) {
  progressBar.style.width = progress + '%';
}

programButton.onclick = async () => {
  const alertMsg = document.getElementById('alertmsg');

  // Hide error message
  alertDiv.style.display = 'none';
  eraseButton.style.display = 'none';
  programButton.style.display = "none";


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
  if (placa_val === "ESP32_DEVKIT" || placa_val === "ESPCAM") {
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
	mensagem.textContent = "Realizando a programação da placa";
    await esploader.write_flash(
      fileArray,
      'keep',
      undefined,
      undefined,
      false,
      true,
      (fileIndex, written, total) => {
        const percentComplete = (written / total) * 100;
        console.log(`Flashing file ${fileIndex}:${percentComplete.toFixed(2)}%`);
        updateProgressBar(percentComplete);
		mensagem.textContent = `Realizando a programação da placa: ${percentComplete.toFixed(2)}%`;
      },
      (image) => CryptoJS.MD5(CryptoJS.enc.Latin1.parse(image))
    );

    //reset automatico depois do flash
    // await transport.setDTR(false);
    // await new Promise((resolve) => setTimeout(resolve, 200));
    // await transport.setDTR(true);
    if (transport) await transport.disconnect();
    connected = false;
    updateProgressBar(0);
    let transport2;
    transport2 = new Transport(device);
    await transport2.connect(115200);
    await transport2.setDTR(false);
    await new Promise((resolve) => setTimeout(resolve, 200));
    await transport2.setDTR(true);
    if (transport2) await transport2.disconnect();
    console.log("desconectou tudinho");
    cleanUp();
    mensagem.style.display = 'initial';
    mensagem.textContent = "Finalizado com sucesso! (100%)";
    mensagem.style.color = 'white';
    progress.style.display = 'none';
    programButton.style.display = 'none';
    disconnectButton.style.display = 'initial';
  } catch (e) {
    mensagem.style.display = 'initial';
    mensagem.textContent = e;
    mensagem.style.color = 'red';
    disconnectButton.style.display = 'initial';
    console.error(e);
    term.writeln(`Error: ${e.message}`);
  }
};
