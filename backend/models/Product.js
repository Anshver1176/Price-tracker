const mongoose = require("mongoose");

const priceHistorySchema = new mongoose.Schema(
  {
    price: {
      type: Number,
      required: true,
    },

    date: {
      type: Date,
      required: true,
      default: Date.now,
    },

    timestamp: {
      type: Number,
      required: true,
      default: () => Date.now(),
    },
  },
  {
    _id: false,
  }
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    url: {
      type: String,
      required: true,
      trim: true,
    },

    imageUrl: {
      type: String,
      default: "",
    },

    currentPrice: {
      type: Number,
      required: true,
    },

    targetPrice: {
      type: Number,
      required: true,
    },

    lowestPrice: {
      type: Number,
      required: true,
    },

    highestPrice: {
      type: Number,
      required: true,
    },

    previousPrice: {
      type: Number,
      default: null,
    },

    website: {
      type: String,
      default: "Unknown",
    },

    priceHistory: {
      type: [priceHistorySchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Product", productSchema);