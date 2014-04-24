from django.conf.urls import patterns, include, url

urlpatterns = patterns('apps.search_position.views',
    url(r'^$', 'home', name='home'),
    url(r'^cargar-autocomplete-ubigeo/$', 'autocomplete_ubigeo', name='home'),
    url(r'^consume_web_service/$', 'consume_web_service', name='home'),
    
)
