# 💰 Price Tracker — Price Intelligence Dashboard

A full-stack **price monitoring and intelligence application** that allows users to track product prices, monitor price history, compare current prices with target prices, and check live prices from supported e-commerce websites.

Built with **React, TypeScript, Node.js, Express, MongoDB, Axios, and Cheerio**.

---

## 🚀 Live Project

> Add your deployed frontend URL here after deployment.

**Frontend:** `Coming Soon`

**Backend API:** `Coming Soon`

**GitHub:**
https://github.com/Anshver1176/Price-tracker

---

## 📌 About The Project

Price Tracker is a full-stack web application designed to make product price monitoring simple and visual.

Users can add products with their current and target prices, track price changes over time, manually update prices, and fetch the latest available price from supported websites.

The application stores product information and complete price history in **MongoDB**, allowing users to see how prices change over time.

---

## ✨ Features

### 📦 Product Management

* Add products
* Edit product details
* Delete products
* View product directly on the original website
* Store product image
* Store target price
* Identify the product's source website

### 💰 Price Tracking

* Track current product price
* Track previous price
* Automatically calculate lowest price
* Automatically calculate highest price
* Detect price drops
* Detect price increases
* Compare current price with target price
* Identify products available at or below target price

### 🔄 Live Price Checking

* Check the latest available product price
* Amazon price extraction
* Flipkart price extraction
* Generic price extraction for supported websites
* Axios-based HTTP requests
* Cheerio-based HTML parsing
* Handles websites that block or dynamically load prices

### 📊 Price History

Every price update is stored in MongoDB.

The application records:

* Price
* Date
* Timestamp

Price history is displayed using an interactive chart.

### 🔎 Search & Sorting

* Search products by name
* Sort by default
* Sort by lowest price
* Sort by highest price
* Sort by recently updated

### 📈 Dashboard Statistics

The dashboard provides:

* Total products
* Price drops
* Best deals
* Current price
* Target price
* Lowest price
* Highest price
* Last updated time

---

## 🛠️ Tech Stack

### Frontend

| Technology      | Purpose                     |
| --------------- | --------------------------- |
| React           | User interface              |
| TypeScript      | Type safety                 |
| Vite            | Development and build tool  |
| Axios           | API communication           |
| CSS             | Styling                     |
| Chart Component | Price history visualization |

### Backend

| Technology | Purpose               |
| ---------- | --------------------- |
| Node.js    | Runtime               |
| Express.js | REST API              |
| Axios      | Fetch product pages   |
| Cheerio    | HTML parsing          |
| CORS       | Cross-origin requests |
| dotenv     | Environment variables |

### Database

| Technology | Purpose                           |
| ---------- | --------------------------------- |
| MongoDB    | Product and price history storage |
| Mongoose   | MongoDB ODM                       |

---

## 🏗️ Project Architecture

```text
Price-tracker/
│
├── backend/
│   ├── models/
│   │   └── Product.js
│   │
│   ├── server.js
│   ├── package.json
│   ├── package-lock.json
│   └── products.json
│
├── public/
│   ├── favicon.svg
│   └── icons.svg
│
├── src/
│   ├── components/
│   │   └── PriceChart.tsx
│   │
│   ├── assets/
│   ├── App.tsx
│   ├── App.css
│   ├── index.css
│   └── main.tsx
│
├── .gitignore
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## 🔄 How It Works

```text
User
  │
  ▼
React Frontend
  │
  │ Axios
  ▼
Express REST API
  │
  ├──────────────► MongoDB
  │                  │
  │                  └── Product + Price History
  │
  └──────────────► E-commerce Website
                       │
                       ▼
                  Axios + Cheerio
                       │
                       ▼
                   Live Price
```

### Price Checking Flow

```text
Click "Check Price"
        │
        ▼
Frontend sends product URL
        │
        ▼
POST /api/price
        │
        ▼
Backend requests product page
        │
        ▼
Cheerio parses HTML
        │
        ▼
Price selector finds price
        │
        ▼
Price returned to frontend
        │
        ▼
PATCH /api/products/:id/price
        │
        ▼
MongoDB stores new price
        │
        ▼
Price History + Chart updated
```

---

## 📡 API Endpoints

### Get All Products

```http
GET /api/products
```

Returns all tracked products.

---

### Add Product

```http
POST /api/products
```

Example request:

```json
{
  "title": "iPhone 16",
  "url": "https://www.amazon.in/...",
  "image": "",
  "price": 79900,
  "targetPrice": 62000
}
```

---

### Update Product

```http
PUT /api/products/:id
```

Updates product information and price.

---

### Update Price

```http
PATCH /api/products/:id/price
```

Example:

```json
{
  "price": 75999
}
```

The backend automatically updates:

* Previous price
* Current price
* Lowest price
* Highest price
* Price history

---

### Check Live Price

```http
POST /api/price
```

Example:

```json
{
  "url": "https://www.amazon.in/..."
}
```

Example response:

```json
{
  "success": true,
  "website": "Amazon",
  "price": 79900,
  "currency": "INR",
  "message": "Price fetched successfully"
}
```

---

### Delete Product

```http
DELETE /api/products/:id
```

Deletes a tracked product.

---

## 🗄️ MongoDB Data Model

Each product contains:

```text
Product
│
├── name
├── url
├── imageUrl
├── currentPrice
├── targetPrice
├── lowestPrice
├── highestPrice
├── previousPrice
├── website
│
└── priceHistory[]
      │
      ├── price
      ├── date
      └── timestamp
```

This allows the application to maintain a complete historical record of price changes.

---

## 💻 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/Anshver1176/Price-tracker.git
```

```bash
cd Price-tracker
```

---

### 2. Install Frontend Dependencies

```bash
npm install
```

---

### 3. Install Backend Dependencies

```bash
cd backend
npm install
```

---

### 4. Configure Environment Variables

Create:

```text
backend/.env
```

Add:

```env
MONGO_URI=mongodb://127.0.0.1:27017/price_tracker
PORT=3000
```

If you are using MongoDB Atlas, replace `MONGO_URI` with your Atlas connection string.

---

### 5. Start MongoDB

Make sure MongoDB is running locally or use MongoDB Atlas.

---

### 6. Start Backend

From the `backend` directory:

```bash
node server.js
```

You should see:

```text
MongoDB Connected Successfully

========================================
Price Tracker API running on port 3000
http://localhost:3000
========================================
```

---

### 7. Start Frontend

Open another terminal in the project root:

```bash
npm run dev
```

Open:

```text
http://localhost:5173
```

---

## 🧪 Testing The API

You can test the live price endpoint using PowerShell:

```powershell
$body = @{
    url = "https://www.amazon.in/..."
} | ConvertTo-Json

Invoke-RestMethod `
    -Uri "http://localhost:3000/api/price" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body
```

---

## 📸 Screenshots

> Add screenshots of your application here.

### Dashboard

```text
Add dashboard screenshot here
```

### Product Tracking

```text
Add product card screenshot here
```

### Price History

```text
Add price history screenshot here
```

---

## 🔐 Security

Sensitive configuration files are excluded from Git using `.gitignore`.

```text
.env
node_modules/
dist/
```

**Never commit MongoDB credentials, API keys, passwords, or other secrets to GitHub.**

---

## ⚠️ Important Notes

Live price extraction depends on the HTML structure and access restrictions of the target website.

Some e-commerce websites may:

* Block automated requests
* Require JavaScript to render prices
* Change their HTML structure
* Use anti-bot protection

Therefore, live price checking may not work for every product URL.

The application gracefully reports when a price cannot be extracted.

---

## 🔮 Future Improvements

Planned improvements include:

* [ ] Automatic scheduled price checking
* [ ] Email price-drop notifications
* [ ] WhatsApp/Telegram notifications
* [ ] More e-commerce website support
* [ ] Automatic product information extraction
* [ ] Automatic product image extraction
* [ ] Price comparison between websites
* [ ] User authentication
* [ ] Personal watchlists
* [ ] Advanced analytics
* [ ] Deployment with cloud database
* [ ] Mobile responsive improvements
* [ ] Price-drop notification thresholds

---

## 🎯 Learning Outcomes

This project helped demonstrate practical experience with:

* React component development
* TypeScript interfaces and state management
* REST API development
* Express.js routing
* MongoDB database design
* Mongoose schemas
* Axios HTTP requests
* Web scraping fundamentals
* Cheerio HTML parsing
* CRUD operations
* API integration
* Price history tracking
* Data visualization
* Git and GitHub workflow
* Full-stack application architecture

---

## 👨‍💻 Author

**Ansh Verma**

B.Tech Computer Science Engineering — 2027

Aspiring Full Stack Developer | DSA Enthusiast

### Connect With Me

* GitHub: https://github.com/Anshver1176
* Project: https://github.com/Anshver1176/Price-tracker

---

## ⭐ Support

If you find this project useful, consider giving it a ⭐ on GitHub.

---

## 📄 License

This project is intended for educational and portfolio purposes.
