"""
Models Package
Pydantic models for data validation
"""
from app.models.materia import Materia, MateriaStatus
from app.models.clase import Clase, BloqueHorario
from app.models.horario import Franja, FranjaStatus, HorarioCombination
from app.models.configuracion import Configuracion, Calificacion

__all__ = [
    'Materia',
    'MateriaStatus',
    'Clase',
    'BloqueHorario',
    'Franja',
    'FranjaStatus',
    'HorarioCombination',
    'Configuracion',
    'Calificacion'
]
