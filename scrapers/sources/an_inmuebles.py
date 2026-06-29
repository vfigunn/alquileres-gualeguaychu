"""Scraper para AN Inmuebles S.A. - https://www.an-inmuebles.com.ar"""

from scrapers.sources.tokko_broker import TokkoBrokerScraper


class ANInmueblesScraper(TokkoBrokerScraper):
    source = "an-inmuebles"
    source_name = "AN Inmuebles S.A."
    source_url = "https://www.an-inmuebles.com.ar"
    listings_url = "https://www.an-inmuebles.com.ar/Alquiler"
