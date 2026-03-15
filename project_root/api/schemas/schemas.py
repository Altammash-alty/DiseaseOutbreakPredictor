from pydantic import BaseModel
from typing import List


class Disease(BaseModel):
    name: str
    probability: float
    precautions: List[str]


class City(BaseModel):
    city: str
    lat: float
    lng: float
    diseases: List[Disease]


class OutbreakResponse(BaseModel):
    cities: List[City]
    heatmap: list