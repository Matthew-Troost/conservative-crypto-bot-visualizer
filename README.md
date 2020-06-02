<h1 align="center">Conservative Crypto Trading Bot - Visualizer</h1>

> An experimental algorithm to trade crypto currency on a minute-to-minute basis.

<div align="center">
<img src="src/assets/images/crypto.png" width="50" />
</div>

Currently a work in progress, this is an real-time crypto currency trading bot. Every minute, the current Bitcoin price is fetched and a decision is made (based on various limits and metrics) to make a trade.

In production, the algorithm will be linked to the Luno API to enable transactions.

Future enhancements: 
 - **Profiles.** A profile will have a target crypto currency and limits attached to it. The visualizer will be able to toggle between profiles and compare performances.

- **Candlestick View.** A candlestick view of the price changes.

<img src="src/assets/images/crypto-bot.gif"  />