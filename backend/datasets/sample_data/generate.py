"""Regenerate the bundled, entirely fictional CSV fixtures using only stdlib."""
import csv
import json
import math
from datetime import datetime, timedelta
from pathlib import Path
from random import Random

ROOT = Path(__file__).resolve().parent
SPECS = [
    ("retail", "The Sunday Market", "Retail orders", "Follow orders, discounts, and revenue across a fictional online store.", 20000,
     ["order_id", "order_date", "country", "category", "channel", "units", "unit_price_eur", "discount_pct", "revenue_eur", "returned"]),
    ("bikes", "City in Motion", "Bike sharing", "Explore commuting peaks, ride lengths, and stations around a fictional city.", 24000,
     ["trip_id", "started_at", "start_station", "end_station", "rider_type", "bike_type", "duration_minutes", "distance_km", "temperature_c", "fare_eur"]),
    ("energy", "A Brighter Grid", "Renewable energy", "Compare solar and wind output with weather and household demand.", 17520,
     ["reading_id", "timestamp", "site", "source", "capacity_kw", "generation_kwh", "demand_kwh", "temperature_c", "wind_speed_ms", "maintenance"]),
    ("cafes", "Daily Grind", "Café sales", "Find favorite drinks, busy hours, and satisfaction trends across six cafés.", 15000,
     ["sale_id", "sold_at", "cafe", "drink", "size", "milk", "quantity", "sales_eur", "wait_minutes", "rating"]),
    ("streaming", "One More Episode", "Streaming habits", "Discover how genre, device, and subscription shape fictional viewing sessions.", 12000,
     ["session_id", "watched_at", "country", "genre", "device", "plan", "duration_minutes", "watched_minutes", "completion_pct", "rating"]),
]


def rows(topic, count):
    rng = Random(20261001 + [s[0] for s in SPECS].index(topic))
    start = datetime(2025, 1, 1)
    for i in range(count):
        stamp = start + timedelta(minutes=rng.randrange(525600))
        country = rng.choice(["Germany", "France", "Spain", "Netherlands", "Sweden", "Italy"])
        if topic == "retail":
            category, price = rng.choice([("Home", 38), ("Outdoors", 74), ("Books", 16), ("Clothing", 49), ("Electronics", 180)])
            units = rng.randint(1, 5)
            price = round(price * rng.uniform(.7, 1.3), 2)
            discount = rng.choice([0, 0, 0, 10, 15, 25])
            row = [f"ORD-{i+1:06}", stamp.date().isoformat(), country, category, rng.choice(["Web", "Mobile", "Marketplace"]), units, price, discount, round(units * price * (1-discount/100), 2), rng.random() < .06]
        elif topic == "bikes":
            duration = round(rng.uniform(4, 65) * (1.3 if stamp.weekday() > 4 else 1), 1)
            member = rng.choice(["Member", "Member", "Visitor"])
            stations = ["Central", "Riverside", "University", "Old Town", "West Park", "Harbor", "Museum", "North Square"]
            row = [f"TRIP-{i+1:06}", stamp.isoformat(), rng.choice(stations), rng.choice(stations), member, rng.choice(["Classic", "Electric"]), duration, round(duration * rng.uniform(.13, .25), 2), round(12 + 12 * math.sin((stamp.timetuple().tm_yday-90)/365*2*math.pi) + rng.gauss(0, 3), 1), round(duration * (.08 if member == "Member" else .18), 2)]
        elif topic == "energy":
            stamp = start + timedelta(hours=i//2)
            solar = i % 2 == 0
            wind = round(rng.uniform(.2, 15), 2)
            generation = max(0, math.sin((stamp.hour-6)/12*math.pi)) * rng.uniform(20, 95) if solar and 6 <= stamp.hour <= 18 else (0 if solar else min(150, wind**2 * .7))
            row = [f"METER-{i+1:06}", stamp.isoformat(), "Southfield" if solar else "Coastal Ridge", "Solar" if solar else "Wind", 100 if solar else 150, round(generation, 2), round(rng.uniform(25, 60) + (30 if 17 <= stamp.hour <= 21 else 0), 2), round(12+10*math.sin((stamp.timetuple().tm_yday-90)/365*2*math.pi)+rng.gauss(0, 2), 1), wind, rng.random() < .015]
        elif topic == "cafes":
            stamp = stamp.replace(hour=rng.choice([7, 8, 8, 9, 9, 10, 11, 12, 13, 14, 15, 16, 17]))
            drink, price = rng.choice([("Espresso", 2.4), ("Latte", 4.2), ("Cappuccino", 3.8), ("Flat white", 4.0), ("Tea", 3.2), ("Cold brew", 4.5)])
            quantity = rng.randint(1, 4)
            wait = round(rng.uniform(1, 5)+(3 if stamp.hour in [8, 9, 12] else 0), 1)
            row = [f"SALE-{i+1:06}", stamp.isoformat(), rng.choice(["Maple Lane", "Station House", "The Arcade", "Garden Gate", "Dockside", "Hilltop"]), drink, rng.choice(["Regular", "Large"]), rng.choice(["Whole", "Oat", "Soy", "None"]), quantity, round(quantity*price, 2), wait, max(1, min(5, round(5-wait/4+rng.gauss(0, .6))))]
        else:
            duration = rng.choice([22, 30, 45, 60, 90, 120])
            watched = round(duration*rng.uniform(.05, 1), 1)
            row = [f"WATCH-{i+1:06}", stamp.isoformat(), country, rng.choice(["Comedy", "Drama", "Documentary", "Science fiction", "Animation", "Thriller"]), rng.choice(["TV", "Phone", "Tablet", "Laptop"]), rng.choice(["Basic", "Standard", "Premium"]), duration, watched, round(watched/duration*100, 1), rng.randint(1, 5)]
        # Deliberately missing values give the cleaning tools something to work on.
        if i % 37 == 0:
            row[8] = ""
        if i % 83 == 0:
            row[4] = ""
        yield row


def generate():
    catalog = []
    for slug, name, topic, description, count, columns in SPECS:
        path = ROOT / f"{slug}.csv"
        with path.open("w", newline="", encoding="utf-8") as handle:
            writer = csv.writer(handle)
            writer.writerow(columns)
            writer.writerows(rows(slug, count))
        catalog.append(dict(id=slug, name=name, topic=topic, description=description, rowCount=count, columnCount=len(columns), fileSize=path.stat().st_size))
    (ROOT / "catalog.json").write_text(json.dumps(catalog, indent=2) + "\n", encoding="utf-8")


if __name__ == "__main__":
    generate()
