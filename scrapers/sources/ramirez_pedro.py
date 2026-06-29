"""Scraper para Ramirez Pedro Inmobiliaria - https://www.ramirezpedro.com.ar"""

from scrapers.sources.tokko_broker import TokkoBrokerScraper


class RamirezPedroScraper(TokkoBrokerScraper):
    source = "ramirez-pedro"
    source_name = "Ramirez Pedro Inmobiliaria"
    source_url = "https://www.ramirezpedro.com.ar"
    listings_url = "https://www.ramirezpedro.com.ar/Alquiler"
