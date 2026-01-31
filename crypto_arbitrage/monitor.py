import requests
import time
import json
import logging
from datetime import datetime

logging.basicConfig(filename='arbitrage.log', level=logging.INFO, format='%(asctime)s - %(message)s')

# Define exchanges
exchanges = {
    'binance': {
        'url': 'https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT',
        'parse': lambda data: float(data['price'])
    },
    'coinbase': {
        'url': 'https://api.coinbase.com/v2/prices/BTC-USD/spot',
        'parse': lambda data: float(data['data']['amount'])
    },
    'kraken': {
        'url': 'https://api.kraken.com/0/public/Ticker?pair=XBTUSD',
        'parse': lambda data: float(data['result']['XXBTZUSD']['c'][0])
    }
}

# Approximate trading fees (percentage)
fees = {
    'binance': 0.001,
    'coinbase': 0.005,
    'kraken': 0.0026
}

# Withdrawal fees, but for simplicity, ignore or add later

def get_price(exchange):
    try:
        response = requests.get(exchanges[exchange]['url'], timeout=10)
        data = response.json()
        return exchanges[exchange]['parse'](data)
    except Exception as e:
        logging.error(f"Error fetching {exchange}: {e}")
        return None

def detect_opportunity(prices):
    opportunities = []
    ex_list = list(prices.keys())
    for i in range(len(ex_list)):
        for j in range(i+1, len(ex_list)):
            ex1 = ex_list[i]
            ex2 = ex_list[j]
            p1 = prices[ex1]
            p2 = prices[ex2]
            if p1 and p2:
                if p1 < p2:
                    # Buy on ex1, sell on ex2
                    cost = p1 * (1 + fees[ex1])
                    revenue = p2 * (1 - fees[ex2])
                    profit = revenue - cost
                    if profit > 0:
                        opportunities.append(f"Arbitrage: Buy BTC on {ex1} at {p1}, sell on {ex2} at {p2}, estimated profit {profit:.2f} USD per BTC")
                elif p2 < p1:
                    # Buy on ex2, sell on ex1
                    cost = p2 * (1 + fees[ex2])
                    revenue = p1 * (1 - fees[ex1])
                    profit = revenue - cost
                    if profit > 0:
                        opportunities.append(f"Arbitrage: Buy BTC on {ex2} at {p2}, sell on {ex1} at {p1}, estimated profit {profit:.2f} USD per BTC")
    return opportunities

def simulate_trade(opportunity):
    # Placeholder for simulation
    logging.info(f"Simulated: {opportunity}")
    # For execution, add API calls here
    # But since low-risk, perhaps use testnet
    pass

def send_report():
    # Placeholder for email
    # Use smtplib or yagmail
    # But need credentials
    # For now, log
    logging.info("Report sent (placeholder)")
    pass

def main():
    report_interval = 3600  # 1 hour
    last_report = time.time()
    while True:
        prices = {ex: get_price(ex) for ex in exchanges}
        logging.info(f"Prices: {json.dumps(prices)}")
        opps = detect_opportunity(prices)
        for opp in opps:
            logging.info(opp)
            simulate_trade(opp)
        if time.time() - last_report > report_interval:
            send_report()
            last_report = time.time()
        time.sleep(60)  # Check every minute

if __name__ == "__main__":
    main()