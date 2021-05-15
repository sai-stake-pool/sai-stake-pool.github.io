import flask
from flask import request, jsonify, make_response, render_template
import cbpro
import flask_restful
from datetime import datetime


app = flask.Flask(__name__)
app.config["DEBUG"] = True
api = flask_restful.Api(app)


@app.route('/<path:path>')
def static_file(path):
    return app.send_static_file(path)

@app.route('/')
def root():
    return app.send_static_file('index.html')

@app.route('/api/v1/resources/books/all', methods=['GET'])
def api_all():
    return jsonify(books)

@api.representation('text/csv')
@app.route('/api/v1/resources/ticker', methods=['GET'])
def ticker():
    l=[]
    # public_client = cbpro.PublicClient(api_url='https://api-public.sandbox.pro.coinbase.com', timeout=30)
    # data = public_client.get_product_historic_rates('BTC-USD', granularity=60)
    # l.append('Date,Open,High,Low,Close,Adj Close,Volume')
    # items = [('%s,%s,%s,%s,%s,%s,%s' % (datetime.fromtimestamp(l[0]), l[3], l[2], l[1], l[4], l[4], l[5]) ) for l in data[::-1]]
    # for i in items:
    #     l.append(i)

    # csv = ''.join(['%s\n' % x for x in l])
    # response = make_response(csv)
    # cd = 'attachment; filename=mycsv.csv'
    # response.headers['Content-Disposition'] = cd 
    # response.mimetype='text/csv'    
    # return response
    public_client = cbpro.PublicClient(api_url='https://api-public.sandbox.pro.coinbase.com', timeout=30)

    data = public_client.get_product_historic_rates('BTC-USD', granularity=60)
    l.append('Date,Open,High,Low,Close,Volume')
    items = [('%s,%s,%s,%s,%s,%s' % (datetime.fromtimestamp(l[0]), l[3], l[2], l[1], l[4], l[5]) ) for l in data[::-1]]
    for i in items[-100:]:
        l.append(i)

    csv = ''.join(['%s\n' % x for x in l])
    response = make_response(csv)
    cd = 'attachment; filename=mycsv.csv'
    response.headers['Content-Disposition'] = cd 
    response.mimetype='text/csv'    
    return response

print('starting')




# app.run()
app.run(host='0.0.0.0')