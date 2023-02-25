from flask import Flask, redirect, request, send_file
# instance of flask application
app = Flask(__name__)


@app.after_request
def after_request(response):
	if request.path != '/assets/flasher.png' and request.path != 'favicon.ico' and request.path != '/getcookie' and request.path != '/flasher' and request.path != '/index.js' and request.path != '/bundle.js' and request.path != '/firmware.bin' and request.path != '/lib/aparencia.css'and request.path != '/placas/esp32devkit/bootloader.bin' and request.path != '/placas/esp32devkit/partitions.bin':
		valor_url = request.path
		# if len(request.path.split("/")) == 3:
		# 	# valor_url = request.path
		# 	placa = request.path.split("/")[1]
		# 	endereco_firm = request.path
		# 	# .split('https://')[len(request.path.split('https://'))- 1]
		# 	# endereco_firm = request.path.split('/')[2]
		# 	response.set_cookie('placa', placa, max_age=10, httponly=False)
		# 	response.set_cookie('endereco_firm',
		# 	                    endereco_firm,
		# 	                    max_age=10,
		# 	                    httponly=False)
		if len(valor_url.split("https:/")) == 2:
			placa = valor_url.split("/")[1]
			endereco_firm = valor_url.split('https:/')[len(valor_url.split('https:/')) -
			                                           1]
			response.set_cookie('placa', placa, max_age=10, httponly=False)
			response.set_cookie('endereco_firm',
			                    endereco_firm,
			                    max_age=10,
			                    httponly=False)
	return response


# from urlextract import URLExtract


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


@app.route('/placas/esp32devkit/bootloader.bin')
def bootloader_esp32devkit():
	return send_file('placas/esp32devkit/bootloader.bin')
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
