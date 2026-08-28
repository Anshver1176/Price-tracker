const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const axios = require("axios");
const cheerio = require("cheerio");
require("dotenv").config();

const Product = require("./models/Product");

const app = express();

const PORT = process.env.PORT || 3000;

// MIDDLEWARE


app.use(cors());
app.use(express.json());


// DATABASE


const MONGO_URI =
  process.env.MONGO_URI ||
  "mongodb://127.0.0.1:27017/price_tracker";

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected Successfully");
    console.log("Database: price_tracker");
  })
  .catch((error) => {
    console.error("MongoDB Connection Error:", error);
  });


// HELPER - FORMAT PRODUCT


function formatProduct(product) {
  return {
    _id: product._id,

    title: product.name,

    url: product.url,

    image: product.imageUrl,

    price: product.currentPrice,

    targetPrice: product.targetPrice,

    lowestPrice: product.lowestPrice,

    highestPrice: product.highestPrice,

    previousPrice: product.previousPrice,

    website: product.website,

    priceHistory: product.priceHistory,

    createdAt: product.createdAt,

    updatedAt: product.updatedAt,
  };
}


// HOME


app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Price Tracker API is running",
    port: PORT,
  });
});

// GET ALL PRODUCTS


app.get("/api/products", async (req, res) => {
  try {
    console.log("GET /api/products");

    const products = await Product.find().sort({
      createdAt: -1,
    });

    console.log("Products found:", products.length);

    res.json(products.map(formatProduct));
  } catch (error) {
    console.error("Get products error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to load products",
      error: error.message,
    });
  }
});

// ADD PRODUCT


app.post("/api/products", async (req, res) => {
  try {
    console.log("POST /api/products");

    console.log("Body:", req.body);

    const {
      title,
      url,
      image,
      price,
      targetPrice,
    } = req.body;

    // VALIDATE
    

    if (
      !title ||
      !url ||
      price === undefined ||
      targetPrice === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Title, URL, price and target price are required",
      });
    }

   
    // CONVERT PRICE
    

    const currentPrice = Number(price);

    const target = Number(targetPrice);

    
    // VALIDATE PRICE
   

    if (
      !Number.isFinite(currentPrice) ||
      !Number.isFinite(target) ||
      currentPrice <= 0 ||
      target <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Prices must be valid and greater than 0",
      });
    }
    // WEBSITE
    

    let website = "Unknown";

    try {
      const hostname = new URL(url).hostname
        .replace("www.", "")
        .split(".")[0];

      website =
        hostname.charAt(0).toUpperCase() +
        hostname.slice(1);
    } catch {
      website = "Unknown";
    }

    // CREATE PRODUCT
    

    const product = new Product({
      name: String(title).trim(),

      url: String(url).trim(),

      imageUrl: image
        ? String(image).trim()
        : "",

      currentPrice: currentPrice,

      targetPrice: target,

      lowestPrice: currentPrice,

      highestPrice: currentPrice,

      previousPrice: null,

      website: website,

      priceHistory: [
        {
          price: currentPrice,

          date: new Date(),

          timestamp: Date.now(),
        },
      ],
    });

  
    // SAVE
    

    const savedProduct = await product.save();

    console.log(
      "Product added:",
      savedProduct.name
    );

    res.status(201).json(
      formatProduct(savedProduct)
    );
  } catch (error) {
    console.error(
      "Add product error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Unable to add product",
      error: error.message,
    });
  }
});

// UPDATE PRODUCT


app.put("/api/products/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const {
      title,
      url,
      image,
      price,
      targetPrice,
    } = req.body;

    // VALIDATE
    

    if (
      !title ||
      !url ||
      price === undefined ||
      targetPrice === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Title, URL, price and target price are required",
      });
    }

    const currentPrice = Number(price);

    const target = Number(targetPrice);

    if (
      !Number.isFinite(currentPrice) ||
      !Number.isFinite(target) ||
      currentPrice <= 0 ||
      target <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid product details",
      });
    }

   
    // FIND PRODUCT
    

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

   
    // UPDATE BASIC INFORMATION
    

    product.name = String(title).trim();

    product.url = String(url).trim();

    product.imageUrl = image
      ? String(image).trim()
      : "";

    product.targetPrice = target;

   
    // UPDATE PRICE ONLY IF CHANGED
    

    if (currentPrice !== product.currentPrice) {
      product.previousPrice =
        product.currentPrice;

      product.currentPrice =
        currentPrice;

      if (
        currentPrice <
        product.lowestPrice
      ) {
        product.lowestPrice =
          currentPrice;
      }

      if (
        currentPrice >
        product.highestPrice
      ) {
        product.highestPrice =
          currentPrice;
      }

      product.priceHistory.push({
        price: currentPrice,

        date: new Date(),

        timestamp: Date.now(),
      });
    }


    // SAVE
   

    const updatedProduct =
      await product.save();

    console.log(
      "Product updated:",
      updatedProduct.name
    );

    res.json(
      formatProduct(updatedProduct)
    );
  } catch (error) {
    console.error(
      "Update product error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Unable to update product",
      error: error.message,
    });
  }
});

// UPDATE PRICE


app.patch(
  "/api/products/:id/price",
  async (req, res) => {
    try {
      const { id } = req.params;

      const { price } = req.body;

      const newPrice = Number(price);

     
      // VALIDATE PRICE
     

      if (
        !Number.isFinite(newPrice) ||
        newPrice <= 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid price",
        });
      }

     
      // FIND PRODUCT
      

      const product =
        await Product.findById(id);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }

   
      // IMPORTANT:
      // DO NOT SAVE DUPLICATE PRICE
     

      if (
        newPrice ===
        product.currentPrice
      ) {
        console.log(
          "Price unchanged:",
          newPrice
        );

        return res.json(
          formatProduct(product)
        );
      }

     
      // SAVE PREVIOUS PRICE
  

      product.previousPrice =
        product.currentPrice;

   
      // UPDATE CURRENT PRICE
 

      product.currentPrice =
        newPrice;

    
      // UPDATE LOWEST PRICE
      

      if (
        newPrice <
        product.lowestPrice
      ) {
        product.lowestPrice =
          newPrice;
      }

  
      // UPDATE HIGHEST PRICE
      

      if (
        newPrice >
        product.highestPrice
      ) {
        product.highestPrice =
          newPrice;
      }

     
      // ADD PRICE HISTORY
     

      product.priceHistory.push({
        price: newPrice,

        date: new Date(),

        timestamp: Date.now(),
      });

      
      // SAVE
   

      const updatedProduct =
        await product.save();

      console.log(
        "Price updated:",
        updatedProduct.name,
        newPrice
      );

      res.json(
        formatProduct(updatedProduct)
      );
    } catch (error) {
      console.error(
        "Update price error:",
        error
      );

      res.status(500).json({
        success: false,
        message: "Unable to update price",
        error: error.message,
      });
    }
  }
);


// DELETE PRODUCT


app.delete(
  "/api/products/:id",
  async (req, res) => {
    try {
      const { id } = req.params;

      const product =
        await Product.findByIdAndDelete(id);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }

      console.log(
        "Product deleted:",
        product.name
      );

      res.json({
        success: true,
        message:
          "Product deleted successfully",
      });
    } catch (error) {
      console.error(
        "Delete product error:",
        error
      );

      res.status(500).json({
        success: false,
        message: "Unable to delete product",
        error: error.message,
      });
    }
  }
);


// CLEAN PRICE


function cleanPrice(priceText) {
  if (!priceText) {
    return null;
  }

  const text = String(priceText);

  /*
    Examples:

    ₹65,999
    ₹ 65,999
    Rs. 65,999
    Rs 65,999
    INR 65,999
    65,999
    65999
    ₹65,999.00
  */

  const match = text.match(
    /(?:₹|Rs\.?|INR)?\s*([\d,]+(?:\.\d{1,2})?)/
  );

  if (!match) {
    return null;
  }

  const numberText =
    match[1].replace(/,/g, "");

  const price = Number(numberText);

  return Number.isFinite(price)
    ? price
    : null;
}

// AMAZON PRICE


function getAmazonPrice($) {
  const selectors = [
    // Current Amazon price
    "#corePriceDisplay_desktop_feature_div .a-price .a-offscreen",

    "#corePriceDisplay_desktop_feature_div .a-price-whole",

    "#corePrice_feature_div .a-price .a-offscreen",

    // Apex / Buy Box
    "#apex_desktop .a-price .a-offscreen",

    "#apex_desktop .a-price-whole",

    "#buybox .a-price .a-offscreen",

    "#buybox .a-price-whole",

    // Older Amazon
    "#priceblock_ourprice",

    "#priceblock_dealprice",

    "#priceblock_saleprice",

    "#price_inside_buybox",

    // Generic Amazon
    ".a-price .a-offscreen",
  ];

  for (const selector of selectors) {
    const elements = $(selector);

    for (
      let i = 0;
      i < elements.length;
      i++
    ) {
      const text = $(elements[i])
        .text()
        .trim();

      const price = cleanPrice(text);

      if (
        price &&
        price > 100 &&
        price < 10000000
      ) {
        console.log(
          "Amazon price found using:",
          selector,
          "=>",
          price
        );

        return price;
      }
    }
  }

  return null;
}

// FLIPKART PRICE


function getFlipkartPrice($) {
  const selectors = [
    "div.Nx9bqj",

    "div._30jeq3",

    "div._16Jk6d",

    "div.CEmiEU",

    "div.hl05eU",
  ];

  for (const selector of selectors) {
    const elements = $(selector);

    for (
      let i = 0;
      i < elements.length;
      i++
    ) {
      const text = $(elements[i])
        .text()
        .trim();

      const price = cleanPrice(text);

      if (
        price &&
        price > 100 &&
        price < 10000000
      ) {
        console.log(
          "Flipkart price found using:",
          selector,
          "=>",
          price
        );

        return price;
      }
    }
  }

  return null;
}

// CHECK LIVE PRICE


app.post("/api/price", async (req, res) => {
  try {
    const { url } = req.body || {};

    
    // VALIDATE URL


    if (!url) {
      return res.status(400).json({
        success: false,
        message:
          "Product URL is required",
      });
    }

    let parsedUrl;

    try {
      parsedUrl = new URL(url);
    } catch {
      return res.status(400).json({
        success: false,
        message:
          "Invalid product URL",
      });
    }

    console.log("");

    console.log(
      "========================================"
    );

    console.log(
      "Checking price:"
    );

    console.log(url);

    console.log(
      "========================================"
    );

    // REQUEST WEBSITE
   

    const response =
      await axios.get(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",

          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",

          "Accept-Language":
            "en-IN,en-US;q=0.9,en;q=0.8",

          "Cache-Control":
            "no-cache",

          Pragma:
            "no-cache",

          Referer:
            parsedUrl.origin + "/",
        },

        timeout: 20000,

        maxRedirects: 5,

        validateStatus: (status) =>
          status >= 200 &&
          status < 400,
      });

    console.log(
      "HTTP Status:",
      response.status
    );

    console.log(
      "HTML length:",
      response.data?.length || 0
    );

    // LOAD HTML
   

    const $ =
      cheerio.load(response.data);

    let price = null;

    const hostname =
      parsedUrl.hostname.toLowerCase();

  
    // AMAZON
   

    if (
      hostname.includes("amazon.")
    ) {
      price =
        getAmazonPrice($);
    }

  
    // FLIPKART
 

    else if (
      hostname.includes("flipkart.")
    ) {
      price =
        getFlipkartPrice($);
    }

    // =================================================
    // GENERIC WEBSITE
    // =================================================

    if (!price) {
      const genericSelectors = [
        "[itemprop='price']",

        "meta[itemprop='price']",

        ".price",

        ".product-price",

        ".sale-price",

        ".current-price",
      ];

      for (
        const selector of genericSelectors
      ) {
        const elements =
          $(selector);

        for (
          let i = 0;
          i < elements.length;
          i++
        ) {
          const element =
            $(elements[i]);

          const text =
            element.attr("content") ||
            element.text();

          const foundPrice =
            cleanPrice(text);

          if (
            foundPrice &&
            foundPrice > 100 &&
            foundPrice < 10000000
          ) {
            price =
              foundPrice;

            break;
          }
        }

        if (price) {
          break;
        }
      }
    }

    // PRICE NOT FOUND
   

    if (!price) {
      console.log(
        "Price was not found in HTML."
      );

      return res.status(400).json({
        success: false,

        message:
          "Could not find product price on this page. The website may be blocking automated requests or loading the price dynamically.",

        website: hostname,
      });
    }

    // WEBSITE NAME
   

    let website =
      hostname.replace(
        "www.",
        ""
      );

    if (
      hostname.includes("amazon")
    ) {
      website = "Amazon";
    } else if (
      hostname.includes("flipkart")
    ) {
      website = "Flipkart";
    }

   
    // RESPONSE
   

    console.log(
      "LIVE PRICE:",
      price
    );

    console.log(
      "========================================"
    );

    console.log("");

    res.json({
      success: true,

      url,

      website,

      price,

      currency: "INR",

      checkedAt:
        new Date().toISOString(),

      message:
        "Price fetched successfully",
    });
  } catch (error) {
    console.error("");

    console.error(
      "Check price error:",
      error.message
    );

    if (error.response) {
      console.error(
        "HTTP Status:",
        error.response.status
      );
    }

    res.status(500).json({
      success: false,

      message:
        "Unable to fetch price from this website",

      error:
        error.message,
    });
  }
});


// START SERVER


app.listen(PORT, () => {
  console.log("");

  console.log(
    "========================================"
  );

  console.log(
    `Price Tracker API running on port ${PORT}`
  );

  console.log(
    `http://localhost:${PORT}`
  );

  console.log(
    "========================================"
  );
});