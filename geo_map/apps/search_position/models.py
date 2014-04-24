from django.db import models

class TbUbigeo(models.Model):
    ubigeo = models.CharField(db_column='UBIGEO', max_length=255, blank=True, primary_key=True) # Field name made lowercase.
    nom_dpto = models.CharField(db_column='NOM_DPTO', max_length=255, blank=True) # Field name made lowercase.
    nom_prov = models.CharField(db_column='NOM_PROV', max_length=255, blank=True) # Field name made lowercase.
    nom_dist = models.CharField(db_column='NOM_DIST', max_length=255, blank=True) # Field name made lowercase.
    cod_postal = models.CharField(db_column='COD_POSTAL', max_length=255, blank=True) # Field name made lowercase.
    
    def __unicode__(self):
    	return '%s- %s, %s, %s ' % (self.ubigeo, self.nom_dpto, self.nom_prov, self.nom_dist)

    class Meta:
        managed = False
        db_table = 'tb_ubigeo'


class TbPositionSelect(models.Model):
	address = models.CharField(max_length=255)
	lat = models.CharField(max_length=255)
	lng = models.CharField(max_length=255)

	class Meta:
		db_table = 'tb_position_select'

	def __unicode__(self):
		return self.address