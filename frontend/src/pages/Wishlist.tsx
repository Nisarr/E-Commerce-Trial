import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useWishlist } from '../hooks/useWishlist';
import { useCartStore } from '../store/cartStore';
import { Heart, ShoppingCart, Trash2, ArrowRight, ShoppingBag } from 'lucide-react';
import type { Product } from '../types';

export const Wishlist: React.FC = () => {
  const { items, toggleItem } = useWishlist();
  const addToCart = useCartStore((s) => s.addItem);
  const navigate = useNavigate();

  const handleMoveToCart = (product: Product) => {
    addToCart(product, 1);
    toggleItem(product); // remove from wishlist
  };

  const handleMoveAllToCart = () => {
    items.forEach((product) => {
      addToCart(product, 1);
    });
    // Clear wishlist
    items.forEach((product) => toggleItem(product));
  };

  const getImageUrl = (product: Product): string => {
    try {
      const parsed = JSON.parse(product.images as string);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed[0] : '';
    } catch {
      return '';
    }
  };

  if (items.length === 0) {
    return (
      <div className="wishlist-page">
        <div className="wishlist-empty">
          <div className="wishlist-empty-icon">
            <Heart size={56} />
          </div>
          <h2>Your wishlist is empty</h2>
          <p>Save items you love to your wishlist and come back to them later.</p>
          <button onClick={() => navigate('/shop')} className="wishlist-empty-cta">
            Explore Products <ArrowRight size={18} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="wishlist-page">
      <div className="wishlist-header">
        <div>
          <h1>My Wishlist</h1>
          <p>{items.length} item{items.length !== 1 ? 's' : ''} saved</p>
        </div>
        <button onClick={handleMoveAllToCart} className="wishlist-move-all">
          <ShoppingCart size={16} />
          Move All to Cart
        </button>
      </div>

      <div className="wishlist-grid">
        {items.map((product) => {
          const imgUrl = getImageUrl(product);
          const hasDiscount = product.salePrice && product.salePrice < product.price;
          const discountPercent = hasDiscount
            ? Math.round(((product.price - product.salePrice!) / product.price) * 100)
            : 0;

          return (
            <div key={product.id} className="wishlist-card">
              {/* Remove button */}
              <button
                onClick={() => toggleItem(product)}
                className="wishlist-card-remove"
                title="Remove from wishlist"
              >
                <Trash2 size={15} />
              </button>

              {/* Discount badge */}
              {hasDiscount && (
                <div className="wishlist-card-badge">-{discountPercent}%</div>
              )}

              {/* Image */}
              <div
                className="wishlist-card-image"
                onClick={() => navigate(`/product/${product.slug}`)}
              >
                {imgUrl ? (
                  <img src={imgUrl} alt={product.title} loading="lazy" />
                ) : (
                  <div className="wishlist-card-no-image">
                    <ShoppingBag size={32} />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="wishlist-card-info">
                <h3 onClick={() => navigate(`/product/${product.slug}`)}>{product.title}</h3>
                {product.brand && <p className="wishlist-card-brand">{product.brand}</p>}
                <div className="wishlist-card-pricing">
                  <span className="wishlist-card-price">
                    ${(product.salePrice || product.price).toFixed(2)}
                  </span>
                  {hasDiscount && (
                    <span className="wishlist-card-original">${product.price.toFixed(2)}</span>
                  )}
                </div>

                {/* Stock status */}
                <div className={`wishlist-card-stock ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
                  {product.stock > 0 ? `In Stock (${product.stock})` : 'Out of Stock'}
                </div>
              </div>

              {/* Move to cart */}
              <button
                onClick={() => handleMoveToCart(product)}
                disabled={product.stock <= 0}
                className="wishlist-card-cart-btn"
              >
                <ShoppingCart size={16} />
                {product.stock > 0 ? 'Move to Cart' : 'Unavailable'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
