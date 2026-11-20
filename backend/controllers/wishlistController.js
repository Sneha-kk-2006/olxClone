
const Wishlist = require("../models/Wishlist");
const Product = require("../models/Product");

// ADD TO WISHLIST
const addToWishlist = async (req, res) => {
    try {
        const { productId } = req.body;

        if (!productId) {
            return res.status(400).json({
                success: false,
                message: "Product ID is required"
            });
        }

        const product = await Product.findById(productId);

        if (!product || product.status !== "available") {
            return res.status(404).json({
                success: false,
                message: "Available product not found"
            });
        }

        let wishlist = await Wishlist.findOne({
            user: req.user._id
        });

        if (!wishlist) {
            wishlist = await Wishlist.create({
                user: req.user._id,
                products: [productId]
            });
        } else {
            if (wishlist.products.some(
                id => id.toString() === productId
            )) {
                return res.status(409).json({
                    success: false,
                    message: "Product already in wishlist"
                });
            }

            wishlist.products.push(productId);
            await wishlist.save();
        }

        res.status(200).json({
            success: true,
            message: "Added to wishlist",
            wishlist
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// GET WISHLIST
const getWishlist = async (req, res) => {
    try {
        const wishlist = await Wishlist.findOne({
            user: req.user._id
        }).populate({
            path: "products",
            populate: {
                path: "seller",
                select: "name phone"
            }
        });

        res.status(200).json({
            success: true,
            products: wishlist
                ? wishlist.products.filter(Boolean)
                : []
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// REMOVE FROM WISHLIST
const removeFromWishlist = async (req, res) => {
    try {
        const { productId } = req.params;

        const wishlist = await Wishlist.findOne({
            user: req.user._id
        });

        if (!wishlist) {
            return res.status(404).json({
                success: false,
                message: "Wishlist not found"
            });
        }

        wishlist.products = wishlist.products.filter(
            id => id.toString() !== productId
        );

        await wishlist.save();

        res.status(200).json({
            success: true,
            message: "Removed from wishlist"
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    addToWishlist,
    getWishlist,
    removeFromWishlist
};
