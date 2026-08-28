import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";
import PriceChart from "./components/PriceChart";

type PriceHistory = {
  price: number;
  date: string;
  timestamp?: number;
};

type Product = {
  _id: string;
  title: string;
  url: string;
  image: string;
  price: number;
  targetPrice: number;
  lowestPrice: number;
  highestPrice: number;
  previousPrice: number | null;
  website: string;
  priceHistory: PriceHistory[];
  createdAt?: string;
  updatedAt?: string;
};

type PriceResponse = {
  success: boolean;
  url: string;
  website: string;
  price: number;
  currency: string;
  checkedAt: string;
  message: string;
};

const API_URL = "http://localhost:3000/api";

function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [showForm, setShowForm] = useState(false);

  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [image, setImage] = useState("");
  const [price, setPrice] = useState("");
  const [targetPrice, setTargetPrice] = useState("");

  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("default");

  const [selectedProduct, setSelectedProduct] =
    useState<string | null>(null);

  const [updatePrice, setUpdatePrice] = useState("");

  const [editingProduct, setEditingProduct] =
    useState<Product | null>(null);

  const [checkingPrice, setCheckingPrice] =
    useState<string | null>(null);

  // LOAD PRODUCTS
  

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    try {
      const response = await axios.get<Product[]>(
        `${API_URL}/products`
      );

      setProducts(response.data);
    } catch (error) {
      console.error("Error loading products:", error);
      alert("Products load nahi ho pa rahe hain.");
    }
  }


  // RESET FORM
 

  function resetForm() {
    setTitle("");
    setUrl("");
    setImage("");
    setPrice("");
    setTargetPrice("");
  }

 
  // ADD PRODUCT
 

  async function addProduct() {
    if (
      !title.trim() ||
      !url.trim() ||
      !price ||
      !targetPrice
    ) {
      alert("Please fill all required fields.");
      return;
    }

    const currentPrice = Number(price);
    const target = Number(targetPrice);

    if (
      !Number.isFinite(currentPrice) ||
      !Number.isFinite(target) ||
      currentPrice <= 0 ||
      target <= 0
    ) {
      alert("Please enter valid prices.");
      return;
    }

    try {
      const response = await axios.post<Product>(
        `${API_URL}/products`,
        {
          title: title.trim(),
          url: url.trim(),
          image: image.trim(),
          price: currentPrice,
          targetPrice: target,
        }
      );

      setProducts((prev) => [
        response.data,
        ...prev,
      ]);

      alert("Product added successfully!");

      resetForm();
      setShowForm(false);
    } catch (error: any) {
      console.error("Error adding product:", error);

      alert(
        error?.response?.data?.message ||
          "Product add nahi ho pa raha hai."
      );
    }
  }

  
  // START EDIT
 
  function startEdit(product: Product) {
    setEditingProduct(product);

    setTitle(product.title);
    setUrl(product.url);
    setImage(product.image || "");
    setPrice(String(product.price));
    setTargetPrice(String(product.targetPrice));
  }

  
  // SAVE EDIT
  
  async function saveEdit() {
    if (!editingProduct) return;

    if (
      !title.trim() ||
      !url.trim() ||
      !price ||
      !targetPrice
    ) {
      alert("Please fill all required fields.");
      return;
    }

    const currentPrice = Number(price);
    const target = Number(targetPrice);

    if (
      !Number.isFinite(currentPrice) ||
      !Number.isFinite(target) ||
      currentPrice <= 0 ||
      target <= 0
    ) {
      alert("Please enter valid product details.");
      return;
    }

    try {
      const response = await axios.put<Product>(
        `${API_URL}/products/${editingProduct._id}`,
        {
          title: title.trim(),
          url: url.trim(),
          image: image.trim(),
          price: currentPrice,
          targetPrice: target,
        }
      );

      setProducts((prev) =>
        prev.map((product) =>
          product._id === editingProduct._id
            ? response.data
            : product
        )
      );

      alert("Product updated successfully!");

      resetForm();
      setEditingProduct(null);
    } catch (error: any) {
      console.error(
        "Error updating product:",
        error
      );

      alert(
        error?.response?.data?.message ||
          "Product update nahi ho pa raha hai."
      );
    }
  }

  // MANUAL PRICE UPDATE
  

  async function changePrice() {
    if (!selectedProduct || !updatePrice) {
      alert("Enter a new price.");
      return;
    }

    const newPrice = Number(updatePrice);

    if (
      !Number.isFinite(newPrice) ||
      newPrice <= 0
    ) {
      alert("Please enter a valid price.");
      return;
    }

    try {
      const response = await axios.patch<Product>(
        `${API_URL}/products/${selectedProduct}/price`,
        {
          price: newPrice,
        }
      );

      setProducts((prev) =>
        prev.map((product) =>
          product._id === selectedProduct
            ? response.data
            : product
        )
      );

      alert(
        `Price updated to ₹${newPrice.toLocaleString(
          "en-IN"
        )}`
      );

      setUpdatePrice("");
      setSelectedProduct(null);
    } catch (error: any) {
      console.error(
        "Error updating price:",
        error
      );

      alert(
        error?.response?.data?.message ||
          "Price update nahi ho pa raha hai."
      );
    }
  }

  // CHECK LIVE PRICE


  async function fetchCurrentPrice(product: Product) {
    if (checkingPrice !== null) {
      return;
    }

    try {
      setCheckingPrice(product._id);

      console.log(
        "Checking live price:",
        product.url
      );

      
      // STEP 1: GET LIVE PRICE FROM WEBSITE
    

      const priceResponse =
        await axios.post<PriceResponse>(
          `${API_URL}/price`,
          {
            url: product.url,
          }
        );

      console.log(
        "Live price response:",
        priceResponse.data
      );

      if (
        !priceResponse.data.success ||
        !Number.isFinite(
          Number(priceResponse.data.price)
        )
      ) {
        throw new Error(
          priceResponse.data.message ||
            "Could not fetch current price."
        );
      }

      const newPrice = Number(
        priceResponse.data.price
      );

      
      // STEP 2: SAVE NEW PRICE TO DATABASE
      

      const updateResponse =
        await axios.patch<Product>(
          `${API_URL}/products/${product._id}/price`,
          {
            price: newPrice,
          }
        );

    
      // STEP 3: UPDATE FRONTEND
      

      setProducts((prev) =>
        prev.map((item) =>
          item._id === product._id
            ? updateResponse.data
            : item
        )
      );

      // SUCCESS MESSAGE
  

      const oldPrice = product.price;

      if (newPrice < oldPrice) {
        alert(
          `Price dropped!\n\nOld: ₹${oldPrice.toLocaleString(
            "en-IN"
          )}\nNew: ₹${newPrice.toLocaleString(
            "en-IN"
          )}\n\nDrop: ₹${(
            oldPrice - newPrice
          ).toLocaleString("en-IN")}`
        );
      } else if (newPrice > oldPrice) {
        alert(
          `Price increased!\n\nOld: ₹${oldPrice.toLocaleString(
            "en-IN"
          )}\nNew: ₹${newPrice.toLocaleString(
            "en-IN"
          )}`
        );
      } else {
        alert(
          `Price checked successfully!\n\nCurrent price: ₹${newPrice.toLocaleString(
            "en-IN"
          )}`
        );
      }
    } catch (error: any) {
      console.error(
        "Error checking live price:",
        error
      );

      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Unable to fetch live price.";

      alert(message);
    } finally {
      setCheckingPrice(null);
    }
  }


  // DELETE PRODUCT
  

  async function deleteProduct(id: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await axios.delete(
        `${API_URL}/products/${id}`
      );

      setProducts((prev) =>
        prev.filter(
          (product) => product._id !== id
        )
      );

      alert("Product deleted successfully!");
    } catch (error: any) {
      console.error(
        "Error deleting product:",
        error
      );

      alert(
        error?.response?.data?.message ||
          "Product delete nahi ho pa raha hai."
      );
    }
  }

  // HISTORY HELPERS


  function getHistoryTimestamp(
    item: PriceHistory
  ) {
    if (
      typeof item.timestamp === "number" &&
      item.timestamp > 0
    ) {
      return item.timestamp;
    }

    const parsed = new Date(item.date).getTime();

    return Number.isFinite(parsed)
      ? parsed
      : 0;
  }

  function getLowestPrice(
    history: PriceHistory[]
  ) {
    if (!history.length) {
      return 0;
    }

    return Math.min(
      ...history.map((item) => item.price)
    );
  }

  function getHighestPrice(
    history: PriceHistory[]
  ) {
    if (!history.length) {
      return 0;
    }

    return Math.max(
      ...history.map((item) => item.price)
    );
  }

  function getLastUpdated(
    history: PriceHistory[]
  ) {
    if (!history.length) {
      return "Never";
    }

    const latest = [...history].sort(
      (a, b) =>
        getHistoryTimestamp(b) -
        getHistoryTimestamp(a)
    )[0];

    const timestamp =
      getHistoryTimestamp(latest);

    if (!timestamp) {
      return latest.date;
    }

    return new Date(timestamp).toLocaleString(
      "en-IN",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  }

  
  // SEARCH
 

  const filteredProducts =
    products.filter((product) =>
      product.title
        .toLowerCase()
        .includes(search.toLowerCase())
    );

  
  // SORT
 

  const sortedProducts = [
    ...filteredProducts,
  ].sort((a, b) => {
    if (sortBy === "low") {
      return a.price - b.price;
    }

    if (sortBy === "high") {
      return b.price - a.price;
    }

    if (sortBy === "recent") {
      const aTime =
        a.priceHistory.length > 0
          ? Math.max(
              ...a.priceHistory.map(
                getHistoryTimestamp
              )
            )
          : 0;

      const bTime =
        b.priceHistory.length > 0
          ? Math.max(
              ...b.priceHistory.map(
                getHistoryTimestamp
              )
            )
          : 0;

      return bTime - aTime;
    }

    return 0;
  });

  
  // PRICE DROPS
  

  const priceDrops = products.filter(
    (product) => {
      if (product.priceHistory.length < 2) {
        return false;
      }

      const history = [
        ...product.priceHistory,
      ].sort(
        (a, b) =>
          getHistoryTimestamp(a) -
          getHistoryTimestamp(b)
      );

      const previous =
        history[history.length - 2].price;

      return product.price < previous;
    }
  ).length;

  // BEST DEALS
  

  const bestDeals = products.filter(
    (product) =>
      product.price <= product.targetPrice
  ).length;


  // UI
  

  return (
    <div className="app">
      {/* 
          NAVBAR
      */}

      <nav>
        <div className="brand">
          <div className="brand-icon">
            ₹
          </div>

          <div>
            <h1>Price Tracker</h1>
            <span>
              Smart price monitoring
            </span>
          </div>
        </div>

        <button
          className="add-product-btn"
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
        >
          + Add Product
        </button>
      </nav>

      <main>
        {/* 
            WELCOME
      */}

        <section className="welcome">
          <div>
            <span className="welcome-tag">
              PRICE INTELLIGENCE
            </span>

            <h2>
              Track your product prices
            </h2>

            <p>
              Add products you want to watch
              and keep an eye on their
              prices in one place.
            </p>
          </div>
        </section>

        {/*
            CONTROLS
         */}

        <div className="controls">
          <div className="search-box">
            <span className="search-icon">
              ⌕
            </span>

            <input
              type="text"
              placeholder="Search products by name..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />
          </div>

          <div className="sort-box">
            <label htmlFor="sort">
              Sort by
            </label>

            <select
              id="sort"
              value={sortBy}
              onChange={(e) =>
                setSortBy(e.target.value)
              }
            >
              <option value="default">
                Default
              </option>

              <option value="low">
                Lowest Price
              </option>

              <option value="high">
                Highest Price
              </option>

              <option value="recent">
                Recently Updated
              </option>
            </select>
          </div>
        </div>

        {/* 
            STATS
       */}

        <div className="stats">
          <div className="stat-card">
            <div className="stat-icon">
              📦
            </div>

            <div>
              <p>Products</p>
              <h3>
                {products.length}
              </h3>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon green">
              ↓
            </div>

            <div>
              <p>Price Drops</p>
              <h3>
                {priceDrops}
              </h3>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon yellow">
              ✓
            </div>

            <div>
              <p>Best Deals</p>
              <h3>
                {bestDeals}
              </h3>
            </div>
          </div>
        </div>

        {/* 
            PRODUCTS HEADER
        */}

        <div className="products-header">
          <div>
            <h2>My Products</h2>

            <p>
              Keep track of the products
              you care about.
            </p>
          </div>

          <span>
            {sortedProducts.length}{" "}
            {sortedProducts.length === 1
              ? "product"
              : "products"}
          </span>
        </div>

        {/* 
            EMPTY
        */}

        {products.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">
              📦
            </div>

            <h3>No products added</h3>

            <p>
              Add your first product to
              start tracking its price.
            </p>

            <button
              onClick={() => {
                resetForm();
                setShowForm(true);
              }}
            >
              + Add Product
            </button>
          </div>
        ) : sortedProducts.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">
              ⌕
            </div>

            <h3>No products found</h3>

            <p>
              Try searching with a
              different product name.
            </p>
          </div>
        ) : (
          /* 
             PRODUCT LIST
          */

          <div className="product-list">
            {sortedProducts.map(
              (product) => {
                const history =
                  product.priceHistory ||
                  [];

                const sortedHistory = [
                  ...history,
                ].sort(
                  (a, b) =>
                    getHistoryTimestamp(a) -
                    getHistoryTimestamp(b)
                );

                let priceDifference = 0;

                if (
                  sortedHistory.length >= 2
                ) {
                  const previous =
                    sortedHistory[
                      sortedHistory.length -
                        2
                    ].price;

                  priceDifference =
                    product.price -
                    previous;
                }

                const lowestPrice =
                  product.lowestPrice ||
                  getLowestPrice(history);

                const highestPrice =
                  product.highestPrice ||
                  getHighestPrice(history);

                const lastUpdated =
                  getLastUpdated(history);

                const isChecking =
                  checkingPrice ===
                  product._id;

                return (
                  <article
                    className="product-card"
                    key={product._id}
                  >
                    {/*
                       IMAGE
                    */}

                    <div className="product-image-wrapper">
                      {product.image ? (
                        <img
                          className="product-image"
                          src={product.image}
                          alt={
                            product.title
                          }
                          onError={(e) => {
                            e.currentTarget.style.display =
                              "none";

                            e.currentTarget.parentElement?.classList.add(
                              "image-error"
                            );
                          }}
                        />
                      ) : (
                        <div className="product-image-placeholder">
                          {product.title
                            .charAt(0)
                            .toUpperCase()}
                        </div>
                      )}

                      <div className="tracked-badge">
                        ● Tracking
                      </div>
                    </div>

                    {/* 
                       PRODUCT TITLE
                     */}

                    <div className="product-top">
                      <div>
                        <h3>
                          {product.title}
                        </h3>

                        <p className="product-url">
                          {product.website ||
                            "Price Tracker"}
                        </p>
                      </div>
                    </div>

                    {/*
                       PRICE
                    */}

                    <div className="price-section">
                      <span>
                        Current price
                      </span>

                      <p className="current-price">
                        ₹{" "}
                        {product.price.toLocaleString(
                          "en-IN"
                        )}
                      </p>

                      <p className="target-price">
                        Target: ₹{" "}
                        {product.targetPrice.toLocaleString(
                          "en-IN"
                        )}
                      </p>
                    </div>

                    {/* 
                       STATUS
                     */}

                    <div className="status-area">
                      {sortedHistory.length >=
                      2 ? (
                        priceDifference < 0 ? (
                          <span className="price-drop">
                            ↓ ₹{" "}
                            {Math.abs(
                              priceDifference
                            ).toLocaleString(
                              "en-IN"
                            )}{" "}
                            price drop
                          </span>
                        ) : priceDifference >
                          0 ? (
                          <span className="price-rise">
                            ↑ ₹{" "}
                            {priceDifference.toLocaleString(
                              "en-IN"
                            )}{" "}
                            price increase
                          </span>
                        ) : (
                          <span className="same-price">
                            No price change
                          </span>
                        )
                      ) : (
                        <span className="same-price">
                          No previous price
                        </span>
                      )}

                      {product.price <=
                      product.targetPrice ? (
                        <span className="good-deal">
                          ✓ Good Deal
                        </span>
                      ) : (
                        <span className="above-target">
                          ₹{" "}
                          {(
                            product.price -
                            product.targetPrice
                          ).toLocaleString(
                            "en-IN"
                          )}{" "}
                          above target
                        </span>
                      )}
                    </div>

                    {/* 
                       LOWEST / HIGHEST
                     */}

                    <div className="price-summary">
                      <div>
                        <span>
                          Lowest
                        </span>

                        <strong>
                          ₹{" "}
                          {lowestPrice.toLocaleString(
                            "en-IN"
                          )}
                        </strong>
                      </div>

                      <div>
                        <span>
                          Highest
                        </span>

                        <strong>
                          ₹{" "}
                          {highestPrice.toLocaleString(
                            "en-IN"
                          )}
                        </strong>
                      </div>
                    </div>

                    {/*
                       LAST UPDATED
                     */}

                    <div className="last-updated">
                      <span>
                        Last updated
                      </span>

                      <strong>
                        {lastUpdated}
                      </strong>
                    </div>

                    {/* =
                       PRICE HISTORY
                     */}

                    <div className="history">
                      <div className="history-title">
                        <div>
                          <h4>
                            Price History
                          </h4>

                          <span>
                            Track how the
                            price changes
                            over time
                          </span>
                        </div>

                        <strong>
                          {history.length}{" "}
                          {history.length ===
                          1
                            ? "update"
                            : "updates"}
                        </strong>
                      </div>

                      <div className="chart-container">
                        <PriceChart
                          history={history.map(
                            (item) => ({
                              ...item,
                              timestamp:
                                getHistoryTimestamp(
                                  item
                                ),
                            })
                          )}
                        />
                      </div>

                      <div className="history-list">
                        {[
                          ...history,
                        ]
                          .sort(
                            (a, b) =>
                              getHistoryTimestamp(
                                b
                              ) -
                              getHistoryTimestamp(
                                a
                              )
                          )
                          .map(
                            (
                              item,
                              index
                            ) => (
                              <div
                                className="history-item"
                                key={`${getHistoryTimestamp(
                                  item
                                )}-${index}`}
                              >
                                <strong>
                                  ₹{" "}
                                  {item.price.toLocaleString(
                                    "en-IN"
                                  )}
                                </strong>

                                <span>
                                  {getHistoryTimestamp(
                                    item
                                  )
                                    ? new Date(
                                        getHistoryTimestamp(
                                          item
                                        )
                                      ).toLocaleString(
                                        "en-IN",
                                        {
                                          day: "numeric",
                                          month: "short",
                                          hour: "2-digit",
                                          minute:
                                            "2-digit",
                                        }
                                      )
                                    : item.date}
                                </span>
                              </div>
                            )
                          )}
                      </div>
                    </div>

                    {/* 
                       BUTTONS
                   */}

                    <div className="card-buttons">
                      <a
                        className="view-product"
                        href={
                          product.url
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View Product
                      </a>

                      <button
                        className="update-btn"
                        onClick={() => {
                          setSelectedProduct(
                            product._id
                          );
                          setUpdatePrice("");
                        }}
                      >
                        Update Price
                      </button>

                      <button
                        className="edit-btn"
                        onClick={() =>
                          startEdit(
                            product
                          )
                        }
                      >
                        Edit
                      </button>

                      <button
                        className="check-price-btn"
                        onClick={() =>
                          fetchCurrentPrice(
                            product
                          )
                        }
                        disabled={
                          isChecking
                        }
                      >
                        {isChecking
                          ? "⏳ Checking..."
                          : "🔄 Check Price"}
                      </button>

                      <button
                        className="delete-btn"
                        onClick={() =>
                          deleteProduct(
                            product._id
                          )
                        }
                      >
                        Delete
                      </button>
                    </div>
                  </article>
                );
              }
            )}
          </div>
        )}
      </main>

      {/* 
          ADD PRODUCT MODAL
      */}

      {showForm && (
        <div className="overlay">
          <div className="form-box">
            <div className="form-header">
              <div>
                <span>
                  NEW PRODUCT
                </span>

                <h2>
                  Add Product
                </h2>
              </div>

              <button
                className="close-btn"
                onClick={() => {
                  resetForm();
                  setShowForm(false);
                }}
              >
                ×
              </button>
            </div>

            <label>
              Product Name
            </label>

            <input
              type="text"
              placeholder="e.g. iPhone 16"
              value={title}
              onChange={(e) =>
                setTitle(
                  e.target.value
                )
              }
            />

            <label>
              Product URL
            </label>

            <input
              type="url"
              placeholder="https://example.com/product"
              value={url}
              onChange={(e) =>
                setUrl(
                  e.target.value
                )
              }
            />

            <label>
              Product Image URL
            </label>

            <input
              type="url"
              placeholder="https://example.com/image.jpg"
              value={image}
              onChange={(e) =>
                setImage(
                  e.target.value
                )
              }
            />

            {image.trim() && (
              <div className="image-preview">
                <img
                  src={image}
                  alt="Product preview"
                />
              </div>
            )}

            <label>
              Current Price
            </label>

            <input
              type="number"
              min="1"
              placeholder="79999"
              value={price}
              onChange={(e) =>
                setPrice(
                  e.target.value
                )
              }
            />

            <label>
              Target Price
            </label>

            <input
              type="number"
              min="1"
              placeholder="65000"
              value={targetPrice}
              onChange={(e) =>
                setTargetPrice(
                  e.target.value
                )
              }
            />

            <div className="form-buttons">
              <button
                className="cancel"
                onClick={() => {
                  resetForm();
                  setShowForm(false);
                }}
              >
                Cancel
              </button>

              <button
                onClick={addProduct}
              >
                Add Product
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 
          EDIT PRODUCT MODAL
      */}

      {editingProduct && (
        <div className="overlay">
          <div className="form-box">
            <div className="form-header">
              <div>
                <span>
                  UPDATE PRODUCT
                </span>

                <h2>
                  Edit Product
                </h2>
              </div>

              <button
                className="close-btn"
                onClick={() => {
                  resetForm();
                  setEditingProduct(
                    null
                  );
                }}
              >
                ×
              </button>
            </div>

            <label>
              Product Name
            </label>

            <input
              type="text"
              value={title}
              onChange={(e) =>
                setTitle(
                  e.target.value
                )
              }
            />

            <label>
              Product URL
            </label>

            <input
              type="url"
              value={url}
              onChange={(e) =>
                setUrl(
                  e.target.value
                )
              }
            />

            <label>
              Product Image URL
            </label>

            <input
              type="url"
              value={image}
              onChange={(e) =>
                setImage(
                  e.target.value
                )
              }
            />

            <label>
              Current Price
            </label>

            <input
              type="number"
              min="1"
              value={price}
              onChange={(e) =>
                setPrice(
                  e.target.value
                )
              }
            />

            <label>
              Target Price
            </label>

            <input
              type="number"
              min="1"
              value={targetPrice}
              onChange={(e) =>
                setTargetPrice(
                  e.target.value
                )
              }
            />

            <div className="form-buttons">
              <button
                className="cancel"
                onClick={() => {
                  resetForm();
                  setEditingProduct(
                    null
                  );
                }}
              >
                Cancel
              </button>

              <button
                onClick={saveEdit}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 
          MANUAL UPDATE PRICE MODAL
       */}

      {selectedProduct && (
        <div className="overlay">
          <div className="form-box small-form">
            <div className="form-header">
              <div>
                <span>
                  PRICE UPDATE
                </span>

                <h2>
                  Update Price
                </h2>
              </div>

              <button
                className="close-btn"
                onClick={() => {
                  setSelectedProduct(
                    null
                  );
                  setUpdatePrice("");
                }}
              >
                ×
              </button>
            </div>

            <label>
              New Price
            </label>

            <input
              type="number"
              min="1"
              placeholder="Enter new price"
              value={updatePrice}
              onChange={(e) =>
                setUpdatePrice(
                  e.target.value
                )
              }
            />

            <div className="form-buttons">
              <button
                className="cancel"
                onClick={() => {
                  setSelectedProduct(
                    null
                  );
                  setUpdatePrice("");
                }}
              >
                Cancel
              </button>

              <button
                onClick={changePrice}
              >
                Update Price
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;