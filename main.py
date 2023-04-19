from flask import Flask, redirect, request, send_file, jsonify
# instance of flask application
app = Flask(__name__)
# if request.path != '/assets/flasher.png' and request.path != 'favicon.ico' and request.path != '/getcookie' and request.path != '/flasher' and request.path != '/index.js' and request.path != '/bundle.js' and request.path != '/firmware.bin' and request.path != '/lib/aparencia.css' and request.path != '/placas/esp32devkit/bootloader.bin' and request.path != '/placas/esp32devkit/partitions.bin' and request.path != '/placas/espcam/partitions_espcam.bin' and request.path != '/placas/espcam/bootloader_esp32_qio_80m.bin':

EXCLUDED_PATHS = [
    '/assets/flasher.png', 'favicon.ico', '/getcookie', '/flasher',
    '/index.js', '/bundle.js', '/firmware.bin', '/lib/aparencia.css',
    '/placas/esp32devkit/bootloader.bin', '/placas/esp32devkit/partitions.bin',
    '/placas/espcam/partitions_espcam.bin',
    '/placas/espcam/partitions_espcam_hugeapp.bin',
    '/placas/espcam/bootloader_esp32_qio_80m.bin', '/OTA/esp32/',
    '/OTA/esp32/firmware_version', '/OTA/esp32/firmware.bin',
    '/OTA/OCTOPUS/firmware.bin', '/OTA/OCTOPUS/firmware_version',
    '/OTA/TERMOMETRO_DHT22/firmware.bin',
    '/OTA/TERMOMETRO_DHT22/firmware_version'
]


# Check if request path is excluded
@app.after_request
def after_request(response):
    if request.path not in EXCLUDED_PATHS:
        valor_url = request.path
        if len(valor_url.split("https:/")) == 2:
            placa = valor_url.split("/")[1]
            endereco_firm = valor_url.split('https:/')[
                len(valor_url.split('https:/')) - 1]
            response.set_cookie('placa', placa, max_age=15, httponly=False)
            response.set_cookie('endereco_firm',
                                endereco_firm,
                                max_age=15,
                                httponly=False)
    return response


@app.route('/')
def index():
    return 'Bem vindo! Coloque as configuracoes no endereço do site adequadamente!'


@app.route('/<path:path>')
def any_path(path):
    # placa = request.cookies.get('placa')
    # endereco_firm = request.cookies.get('endereco_firm')
    # if placa is None:
    # 	return 'nao tem cookie pq será'                   ESSA MERDA N FAZ SENTIDO
    # else:
    return redirect("/flasher")


@app.route('/getcookie')  #nao esta sendo usado pra nada
def getcookie():
    placa = request.cookies.get('placa')
    endereco_firm = request.cookies.get('endereco_firm')

    if placa is None:
        return 'expirou amigo'
    else:
        resposta = 'placa: ' + placa + ' endereço: ' + endereco_firm
        # response.set_cookie('placa', placa, max_age=0, httponly=False)
        # response.set_cookie('endereco_firm',
        # 	                    endereco_firm,
        # 	                    max_age=0,
        # 	                    httponly=False)
        return resposta


@app.route('/OTA/esp32/firmware_version', methods=['GET', 'POST'])
def firmware_version_OTA_esp32():
    with open('OTA/esp32/firmware_version.txt', 'r') as f:
        version = f.readline().strip()
        print(version)
    return jsonify({'version': version})


@app.route('/OTA/esp32/firmware.bin', methods=['GET', 'POST'])
def firmware_OTA_esp32():
    return send_file('OTA/esp32/firmware.bin')


@app.route('/OTA/OCTOPUS/firmware_version', methods=['GET', 'POST'])
def firmware_version_OTA_OCTOPUS():
    with open('OTA/OCTOPUS/firmware_version_octopus.txt', 'r') as f:
        version = f.readline().strip()
        print(version)
    return jsonify({'version': version})


@app.route('/OTA/OCTOPUS/firmware.bin', methods=['GET', 'POST'])
def firmware_OTA_OCTOPUS():
    return send_file('OTA/OCTOPUS/firmware.bin')


@app.route('/OTA/TERMOMETRO_DHT22/firmware_version', methods=['GET', 'POST'])
def firmware_version_OTA_TERMOMETRO_DHT22():
    with open('OTA/TERMOMETRO_DHT22/firmware_version_term_dht.txt', 'r') as f:
        version = f.readline().strip()
        print(version)
    return jsonify({'version': version})


@app.route('/OTA/TERMOMETRO_DHT22/firmware.bin', methods=['GET', 'POST'])
def firmware_OTA_TERMOMETRO_DHT22():
    return send_file('OTA/TERMOMETRO_DHT22/firmware.bin')


@app.route('/OTA/esp32/', methods=['GET', 'POST'])
def hello():
    return 'Hello, World!', 200


# # Define the file paths for each route
# file_paths = {
#     '/placas/esp32devkit/bootloader.bin': 'placas/esp32devkit/bootloader.bin',
#     '/placas/espcam/partitions_espcam.bin': 'placas/espcam/partitions_espcam.bin',
#     '/placas/espcam/bootloader_esp32_qio_80m.bin': 'placas/espcam/bootloader_esp32_qio_80m.bin',
#     '/placas/esp32devkit/partitions.bin': 'placas/esp32devkit/partitions.bin',
#     '/index.js': 'index.js',
#     '/firmware.bin': 'firmware.bin',
#     '/bundle.js': 'bundle.js',
# }

# # Define the common prefix for all routes
# prefix = ''

# # Define the routes using a loop and a dictionary
# for route, path in file_paths.items():
#     endpoint_name = path.replace('/', '_')
#     @app.route(f'{prefix}{route}', endpoint=endpoint_name)
#     def serve_file():
#         return send_file(path)


@app.route('/placas/esp32devkit/bootloader.bin')
def bootloader_esp32devkit():
    return send_file('placas/esp32devkit/bootloader.bin')


@app.route('/placas/espcam/partitions_espcam.bin')
def partitions_espcam():
    return send_file('placas/espcam/partitions_espcam.bin')


@app.route('/placas/espcam/partitions_espcam_hugeapp.bin')
def partitions_espcam_hugeapp():
    return send_file('placas/espcam/partitions_espcam_hugeapp.bin')


@app.route('/placas/espcam/bootloader_esp32_qio_80m.bin')
def bootloader_espcam():
    return send_file('placas/espcam/bootloader_esp32_qio_80m.bin')


@app.route('/placas/esp32devkit/partitions.bin')
def paritions_esp32devkit():
    return send_file('placas/esp32devkit/partitions.bin')


@app.route('/index.js')
def script():
    return send_file('index.js')


@app.route('/firmware.bin')
def firmware_send():
    return send_file('firmware.bin')


@app.route('/bundle.js')
def script_bundle():
    return send_file('bundle.js')


@app.route('/flasher')
def flasher_open_webpage():
    placa = request.cookies.get('placa')
    # endereco_firm = request.cookies.get('endereco_firm')

    if placa is None:
        return redirect("/")
    else:
        return send_file('index.html')


@app.route('/assets/flasher.png')
def flasher():
    return send_file('assets/flasher.png')


@app.route('/assets/aparencia.css')
def aparencia_css():
    return send_file('assets/aparencia.css')


@app.route('/favicon.ico')
def favicon():
    return send_file('favicon.ico')


if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True)
