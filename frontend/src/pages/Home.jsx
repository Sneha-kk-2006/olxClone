
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import "./Home.css";

function Home() {
    const [products, setProducts] = useState([]);
    const [wishlist, setWishlist] = useState([]);
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("All");
    const [sort, setSort] = useState("default");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Fetch products and wishlist
    useEffect(() => {
        const fetchData = async () => {
            try {
                const productResponse = await API.get("/products");
                setProducts(productResponse.data.products || []);

                try {
                    const wishlistResponse = await API.get("/wishlist");

                    const items =
                        wishlistResponse.data.wishlist ||
                        wishlistResponse.data.products ||
                        [];

                    setWishlist(
                        items.map((item) =>
                            item.product?._id ||
                            item.productId ||
                            item._id
                        )
                    );
                } catch (wishlistError) {
                    console.log(
                        "Wishlist fetch:",
                        wishlistError.response?.data ||
                        wishlistError.message
                    );
                }
            } catch (error) {
                console.log("FETCH ERROR:", error);
                setError("Failed to load products");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Wishlist
    const handleWishlist = async (productId) => {
        try {
            if (wishlist.includes(productId)) {
                await API.delete(`/wishlist/${productId}`);

                setWishlist((prev) =>
                    prev.filter((id) => id !== productId)
                );
            } else {
                await API.post(`/wishlist/${productId}`);

                setWishlist((prev) => [...prev, productId]);
            }
        } catch (error) {
            console.log(
                "WISHLIST ERROR:",
                error.response?.data || error.message
            );

            if (error.response?.status === 401) {
                alert("Please login to use wishlist");
            } else {
                alert(
                    error.response?.data?.message ||
                    "Unable to update wishlist"
                );
            }
        }
    };

    // Dynamic categories from database
    const categories = [
        "All",
        ...new Set(
            products.map((product) => product.category).filter(Boolean)
        )
    ];

    // Category icons
    const categoryIcons = {
        cars: "🚗",
        motorcycles: "🏍️",
        bikes: "🏍️",
        mobiles: "📱",
        "mobile phones": "📱",
        properties: "🏢",
        electronics: "📺",
        "electronics & appliances": "🧊",
        furniture: "🛋️",
        fashion: "👕",
        jobs: "💼",
        books: "📚",
        sports: "⚽",
        "commercial vehicles": "🚚"
    };

    const getCategoryIcon = (name) => {
        return categoryIcons[name.toLowerCase()] || "🛍️";
    };

    // Search, category and sorting
    const filteredProducts = useMemo(() => {
        let result = [...products];

        if (search.trim()) {
            const searchText = search.toLowerCase();

            result = result.filter((product) =>
                `${product.title} ${product.category} ${product.location}`
                    .toLowerCase()
                    .includes(searchText)
            );
        }

        if (category !== "All") {
            result = result.filter(
                (product) => product.category === category
            );
        }

        if (sort === "low-to-high") {
            result.sort((a, b) => a.price - b.price);
        } else if (sort === "high-to-low") {
            result.sort((a, b) => b.price - a.price);
        }

        return result;
    }, [products, search, category, sort]);

    if (loading) {
        return <div className="home-message">Loading products...</div>;
    }

    if (error) {
        return <div className="home-message">{error}</div>;
    }

    return (
        <div className="olx-home">

            {/* TOP HEADER */}
            <header className="main-header">

                <Link to="/" className="olx-logo">
                    olx<span>.</span>
                </Link>

                <div className="location-box">
                    <span>📍</span>
                    <input value="India" readOnly />
                    <span>⌄</span>
                </div>

                <div className="main-search">
                    <input
                        type="text"
                        placeholder='Search "Cars", Mobiles and more...'
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />

                    <button type="button">⌕</button>
                </div>

                <Link to="/wishlist" className="header-action">
                    <span>♡</span>
                    Wishlist
                </Link>

                <Link to="/login" className="header-action">
                    <span>♙</span>
                    Login
                </Link>

                <Link to="/sell" className="post-ad-button">
                    <span>＋</span> Post Ad
                </Link>

            </header>

            {/* CATEGORY NAVIGATION */}
            <nav className="category-navigation">

                <button
                    className={
                        category === "All"
                            ? "all-category active"
                            : "all-category"
                    }
                    onClick={() => setCategory("All")}
                >
                    ☰ &nbsp; ALL CATEGORIES
                </button>

                {categories.filter((item) => item !== "All").map((item) => (
                    <button
                        key={item}
                        className={
                            category === item
                                ? "category-nav-item selected"
                                : "category-nav-item"
                        }
                        onClick={() => setCategory(item)}
                    >
                        {item}
                    </button>
                ))}

            </nav>

            {/* ADVERTISEMENT BANNER */}
            <section className="advertisement-section">
                <div className="advertisement-banner">
                    <div className="banner-content">
                        <span className="banner-tag">OLX MARKETPLACE</span>
                        <h1>Find it. Buy it. Love it.</h1>
                        <p>
                            Discover amazing deals on products near you.
                        </p>
                        <button
                            onClick={() =>
                                document.getElementById("recommendations")
                                    ?.scrollIntoView({ behavior: "smooth" })
                            }
                        >
                            Explore Now →
                        </button>
                    </div>

                    <div className="banner-illustration">
                        <span>🛍️</span>
                        <span>📱</span>
                        <span>🚗</span>
                    </div>
                </div>
            </section>

            {/* CATEGORIES AND APP DOWNLOAD */}
            <section className="category-and-app">

                <div className="category-section">
                    <h2>Browse by Category</h2>

                    <div className="category-tiles">
                        {categories.filter((item) => item !== "All").map((item) => (
                            <button
                                className="category-tile"
                                key={item}
                                onClick={() => {
                                    setCategory(item);
                                    document.getElementById("recommendations")
                                        ?.scrollIntoView({ behavior: "smooth" });
                                }}
                            >
                                <div className="category-icon">
                                    {getCategoryIcon(item)}
                                </div>
                                <span>{item}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <aside className="app-download">
                    <div className="fake-qr">
                        <div className="qr-pattern"></div>
                    </div>

                    <div>
                        <h3>Download the OLX App</h3>
                        <p>Buy and sell from anywhere!</p>
                    </div>
                </aside>

            </section>

            {/* FRESH RECOMMENDATIONS */}
            <section className="recommendations" id="recommendations">

                <div className="recommendation-heading">
                    <div>
                        <h2>Fresh recommendations</h2>
                        <p>Explore the latest products near you</p>
                    </div>

                    <select
                        value={sort}
                        onChange={(e) => setSort(e.target.value)}
                    >
                        <option value="default">Sort by</option>
                        <option value="low-to-high">Price: Low to High</option>
                        <option value="high-to-low">Price: High to Low</option>
                    </select>
                </div>

                <div className="product-grid">

                    {filteredProducts.length === 0 ? (
                        <div className="no-products">
                            <span>🔍</span>
                            <h3>No products found</h3>
                            <p>Try another search or category.</p>
                        </div>
                    ) : (
                        filteredProducts.map((product) => (
                            <div className="product-card" key={product._id}>

                                <div className="product-image">

                                    <Link to={`/product/${product._id}`}>
                                        <img
                                            src={product.images?.[0] || "/placeholder.png"}
                                            alt={product.title}
                                        />
                                    </Link>

                                    <button
                                        className="wishlist-button"
                                        onClick={() =>
                                            handleWishlist(product._id)
                                        }
                                        title="Add to wishlist"
                                    >
                                        {wishlist.includes(product._id)
                                            ? "❤️"
                                            : "♡"}
                                    </button>

                                    {product.isFeatured && (
                                        <span className="featured-label">
                                            FEATURED
                                        </span>
                                    )}
                                </div>

                                <div className="product-info">

                                    <h2>₹{Number(product.price).toLocaleString("en-IN")}</h2>

                                    <h3>{product.title}</h3>

                                    <p className="product-category">
                                        {product.category}
                                    </p>

                                    <div className="product-location">
                                        <span>{product.location}</span>
                                        <span>Today</span>
                                    </div>

                                </div>

                            </div>
                        ))
                    )}

                </div>

            </section>

            {/* FOOTER */}
            <footer className="olx-footer">
                <div>
                    <h2>OLX</h2>
                    <p>Buy and sell anything, anywhere.</p>
                </div>

                <div>
                    <h4>Useful Links</h4>
                    <Link to="/">Home</Link>
                    <Link to="/wishlist">Wishlist</Link>
                    <Link to="/sell">Post an Ad</Link>
                </div>

                <div>
                    <h4>Account</h4>
                    <Link to="/login">Login</Link>
                    <Link to="/register">Register</Link>
                </div>
            </footer>

        </div>
    );
}

export default Home;
