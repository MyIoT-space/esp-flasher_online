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
let transport2;
let chip = null;
let esploader;
let file1 = null;
let connected = false;

// addFile.style.display = 'none';
disconnectButton.style.display = 'none';
eraseButton.style.display = 'none';
mensagem.style.marginBottom = "20px";
programButton.style.display = 'none';
terminal.style.display = 'none';
mensagem.style.fontSize = '22px';
progress.style.display = 'none';
nome_placa.style.display = 'flex';
nome_placa.style.justifyContent = 'center';
nome_placa.style.color = "white";
nome_placa.style.fontSize = "20px";
nome_placa.style.marginBottom = "20px";

botoes_conectar_apagar.style.display = 'flex';
botoes_conectar_apagar.style.justifyContent = 'space-evenly';
botoes_conectar_apagar.style.alignContent = 'space-center';

var endereco_firm_val = "https://" + document.cookie.replace(/(?:(?:^|.*;\s*)endereco_firm\s*\=\s*([^;]*).*$)|^.*$/, "$1");

var placa_va = document.cookie.replace(/(?:(?:^|.*;\s*)placa\s*\=\s*([^;]*).*$)|^.*$/, "$1");

var placa_val = placa_va.replace(/_/g, " ");

nome_placa.textContent = "Página para configuração do dispositivo: " + placa_val;
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
  let speed = 115200;

  if (placa_val == "ESPCAM HUGEAPP") {
    console.log("mudando para 460800, visto que é uma ESPCAM com codigo enorme");
    speed = 115200;
  }
    mensagem.style.color = "white";
  try {
    esploader = new ESPLoader(transport, speed, espLoaderTerminal);
	setTimeout(() => {
      if(!connected){mensagem.textContent = "Pressione e segure o botão de boot da sua placa!";
					mensagem.style.color = "red";
					mensagem.style.textShadow = "1px 1px 5px";}
    }, 5000);
    chip = await esploader.main_fn();
    connected = true;
    progress.style.display = 'block';
    console.log("estamos aq pq sera");
	mensagem.style.textShadow = "";
	mensagem.style.color = "white";
    mensagem.textContent = "Clique em programar para começar!";
    eraseButton.style.display = 'initial';
    disconnectButton.style.display = 'initial';
    const chip_family = await esploader.chip.CHIP_NAME;
    console.log(chip_family);

    if (placa_val.includes(chip_family)) {
      console.log('Checagem completa, placa escolhida adequadamente');
      nome_placa.textContent = 'Configurando o dispositivo: ' + placa_val;

    } else {
      console.log('Cara bobo');
        console.log(placa_val);
      nome_placa.textContent = 'O dispositivo conectado é da familia ' + chip_family + " não um " + placa_val + " !!!";
    }
    nome_placa.style.display = 'flex';
    connectButton.style.display = 'none';
    eraseButton.style.display = 'initial';
    programButton.style.display = 'initial';
  } catch (e) {
    // mensagem.style.display = 'initial';
    device = null;
    if (transport) await transport.disconnect();
    connected = false;
    mensagem.textContent = e.message;
    mensagem.style.color = 'red';
    console.error(e.message);
    term.writeln(`Error: ${e.message}`);
  }
};

eraseButton.onclick = async () => {
  eraseButton.disabled = true;
  try {
    await esploader.erase_flash();
  } catch (e) {
    mensagem.style.display = 'initial';
    mensagem.textContent = e.message;
    mensagem.style.color = 'red';
    disconnectButton.style.display = 'initial';
    console.error(e.message);
    term.writeln(`Error: ${e.message}`);
  } finally {
    eraseButton.disabled = false;
  }
};

// to be called on disconnect - remove any stale references of older connections if any
function cleanUp() {
  device = null;
  transport = null;
  transport2 = null;
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
  nome_placa.textContent = 'Configurando o dispositivo: ' + placa_val;
  // nome_placa.style.display = 'none';
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
  console.log(endereco_firm_val);
  const main_firmware = await fetchAndReadBinaryString(endereco_firm_val);

  let fileArray = null;
    if (placa_val === "ESP32 DEVKIT NODEMCU") {
    const bootloader = await fetchAndReadBinaryString("https://9a90d2b8-e895-4838-bb10-7453bc182665.usrfiles.com/ugd/9a90d2_7eca0185d8bb40fb9824e3daf9ad04cc.txt");
    console.log("baixou bootloader nodemcu");
    const partitions = await fetchAndReadBinaryString("https://9a90d2b8-e895-4838-bb10-7453bc182665.usrfiles.com/ugd/9a90d2_795c5c8d927d4352b0e61a49904deac1.txt");
    console.log("baixou partitions nodemcu");

    fileArray = [
      { data: bootloader, address: 0x1000 },
      { data: partitions, address: 0x8000 },
      { data: main_firmware, address: 0x10000 },
    ];
  } 

else if (placa_val === "ESP32 DEVKIT") {
    const bootloader = await fetchAndReadBinaryString("https://espflasher.leonuzzy.repl.co/placas/esp32devkit/bootloader.bin");
    console.log("baixou bootloader");
    const partitions = await fetchAndReadBinaryString("https://espflasher.leonuzzy.repl.co/placas/esp32devkit/partitions.bin");
    console.log("baixou partitions");

    fileArray = [
      { data: bootloader, address: 0x1000 },
      { data: partitions, address: 0x8000 },
      { data: main_firmware, address: 0x10000 },
    ];
  } 
  
  else if (placa_val === "ESPCAM") {
    const bootloader = await fetchAndReadBinaryString("https://espflasher.leonuzzy.repl.co/placas/espcam/bootloader_esp32_qio_80m.bin");
    console.log("baixou bootloader espcam");
    const partitions = await fetchAndReadBinaryString("https://espflasher.leonuzzy.repl.co/placas/espcam/partitions_espcam.bin");
    console.log("baixou partitions espcam");

    fileArray = [
      { data: bootloader, address: 0x1000 },
      { data: partitions, address: 0x8000 },
      { data: main_firmware, address: 0x10000 },
    ];
  }
  else if (placa_val === "ESPCAM HUGEAPP") {
    const bootloader = await fetchAndReadBinaryString("https://espflasher.leonuzzy.repl.co/placas/espcam/bootloader_esp32_qio_80m.bin");
    console.log("baixou bootloader espcam");
    const partitions = await fetchAndReadBinaryString("https://espflasher.leonuzzy.repl.co/placas/espcam/partitions_espcam_hugeapp.bin");
    console.log("baixou partitions espcam hugeapp");

    fileArray = [
      { data: bootloader, address: 0x1000 },
      { data: partitions, address: 0x8000 },
      { data: main_firmware, address: 0x10000 },
    ];
  }
  else if (placa_val == "ESP8266") {
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