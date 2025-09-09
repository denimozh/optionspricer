README

---

# Options Greeks Calculator

**Live Demo:** [Options Greeks Calculator](https://optionspricer.vercel.app/)

---

## Overview

The **Options Greeks Calculator** is an interactive web application that calculates the theoretical price of an option and its **Greeks** (Delta, Gamma, Vega, Theta, Rho) using the **Black-Scholes model**. This tool allows users to analyze option sensitivities and risk based on stock price, strike price, time to expiry, volatility, and risk-free interest rate.

It is designed for both **call and put options**, with dynamic charts that visually display how Delta, Gamma, Vega, and Theta change with the underlying stock price. Vertical lines indicate the **current stock price** and **strike price**.

Explore the live app here: [https://optionspricer.vercel.app/](https://optionspricer.vercel.app/)

---

## Features

* **Black-Scholes Option Pricing**
  Calculate theoretical call and put option prices.

* **Option Greeks Calculation**

  * Delta
  * Gamma
  * Vega
  * Theta
  * Rho (displayed in table, not chart)

* **Interactive Chart**

  * Delta (cyan) on left Y-axis
  * Gamma, Vega, Theta (red, green, orange) on right Y-axis
  * Current Stock Price (yellow vertical line)
  * Strike Price (purple vertical line)
  * Hover tooltips display all Greeks at each stock price

* **Real-Time Updates**
  Automatically recalculates and updates chart as input values change.

* **Exportable Data**
  Users can export payoff or Greek data as CSV for further analysis (optional).

---

## Technology Stack

* **Frontend:** React, Next.js
* **Charting:** Chart.js, chartjs-plugin-annotation
* **Calculations:** JavaScript implementation of Black-Scholes model
* **Deployment:** Vercel

---

## Usage

1. **Access the live app**
   Open [https://optionspricer.vercel.app/](https://optionspricer.vercel.app/) in your browser.

2. **Input parameters**

   * **Stock Price (S):** Current price of the underlying asset
   * **Strike Price (K):** Option strike price
   * **Days to Expiration (T\_days):** Time until option expiry in days
   * **Risk-Free Rate (r):** Annual risk-free interest rate (decimal)
   * **Volatility (σ):** Annualized volatility of the underlying asset (decimal)
   * **Option Type:** Call or Put

3. **Analyze results**

   * View **option price and Greeks** in the table.
   * Explore **Delta, Gamma, Vega, Theta curves** on the chart.
   * Hover over the chart to see **all Greeks at a given stock price**.
   * 
---

## Why This Project Matters

This project demonstrates:

* Understanding of **financial derivatives** and option risk management.
* Ability to **implement complex quantitative models** in code.
* Proficiency in **frontend visualization**, creating interactive and professional dashboards.
* Integration of **financial theory and software engineering**, a highly sought skill for roles in FICC and Equities trading.

---

## Future Improvements

* Add **implied volatility calculation** with interactive solver.
* Include **payoff visualization** for multiple option positions.
* Support **portfolio-level Greeks** for multiple options simultaneously.

---

## License

This project is **MIT licensed**.

---
