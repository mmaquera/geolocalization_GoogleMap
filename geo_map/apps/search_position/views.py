from django.shortcuts import render, render_to_response
from django.http import HttpResponse, Http404, HttpResponseRedirect
from django.template import RequestContext

from models import TbUbigeo, TbPositionSelect
from django.core import serializers

from django.db.models import Q

from suds.client import Client
import json
import urllib

def home(request):
	if request.method == 'GET':
		data = serializers.serialize("json", TbUbigeo.objects.all())
		ctx = { 'ubijeo': data }
		return render_to_response('search_position/location.html',ctx,context_instance = RequestContext(request))
	else:

		address = request.POST.get('adress_form', '')
		lat = request.POST.get('lat_form', '')
		lng = request.POST.get('lng_form', '')

	
		if address == '' or lat == '' or lng == '':
			return HttpResponseRedirect('/')
		else:
			tbPositionSelect = TbPositionSelect()
			tbPositionSelect.address = address
			tbPositionSelect.lat = lat
			tbPositionSelect.lng = lng
			tbPositionSelect.save()
			return HttpResponseRedirect('/')
	
def autocomplete_ubigeo(request):
	if request.is_ajax():
		param = request.GET.get('term', '')
		param = param.upper()
		datos = TbUbigeo.objects.filter(Q(ubigeo__startswith = param) | Q(nom_dist__startswith = param) | Q(nom_prov__startswith = param) | Q(nom_dpto__startswith = param))[:10]
		result = []
		for dato in datos:
			dato_json = {}
			dato_json['id'] = dato.ubigeo
			dato_json['label'] = "%s - %s - %s - %s" % (dato.ubigeo, dato.nom_dist, dato.nom_prov, dato.nom_dpto)
			result.append(dato_json)

		data = json.dumps(result)
		return HttpResponse(data, mimetype="application/json")
	else:
		return Http404

def consume_web_service(request):
	if request.is_ajax():
		ubigeo = request.GET['ubigeo']
		adress = request.GET['adress']
		
		url = 'Web Service a consumir :P'
		
		client = Client(url)

		geocodificarDireccion =  client.service.GeocodificarDireccion('1', ubigeo, adress)
		xmlRes = client.last_received()
		return HttpResponse(xmlRes, mimetype="application/xml")
	else:
		return Http404
	


