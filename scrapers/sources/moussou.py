"""Scraper para Moussou Propiedades - https://www.moussoupropiedades.com.ar"""

from scrapers.sources.tokko_broker import TokkoBrokerScraper


class MoussouScraper(TokkoBrokerScraper):
    source = "moussou"
    source_name = "Moussou Propiedades"
    source_url = "https://www.moussoupropiedades.com.ar"
    listings_url = "https://www.moussoupropiedades.com.ar/Alquiler"
