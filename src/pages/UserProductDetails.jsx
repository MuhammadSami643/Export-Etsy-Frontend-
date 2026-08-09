import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { productApi } from '../api';
import { money, productImage, categoryName } from '../lib/format';
import { assetUrl } from '../api/client';
import { ArrowLeft, Check, Truck, ShieldCheck, RefreshCw } from 'lucide-react';

const UserProductDetails = () => {
  const { id } = useParams();
  const { addToCart, cartItems } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(null);
  const [size, setSize] = useState(null);
  const [color, setColor] = useState(null);
  const [isAdded, setIsAdded] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    productApi
      .get(id)
      .then((p) => {
        setProduct(p);
        const mainImg = (p.images || []).find((i) => i.is_main);
        setActiveImg(mainImg ? assetUrl(mainImg.url) : productImage(p));
        setSize(p.sizes?.[0] || null);
        setColor(p.colors?.[0] || null);
      })
      .catch(() => setError('Product not found'))
      .finally(() => setLoading(false));
    window.scrollTo(0, 0);
  }, [id]);

  const thumbContainerRef = useRef(null);
  const activeThumbRef = useRef(null);

  useEffect(() => {
    if (activeThumbRef.current && thumbContainerRef.current) {
      activeThumbRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
      });
    }
  }, [activeImg]);

  if (loading) {
    return <div className="min-h-[70vh] flex items-center justify-center text-gray-400">Loading…</div>;
  }

  if (error || !product) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <p className="text-xl text-muted mb-4">Product not found.</p>
        <Link to="/products" className="text-accent font-medium underline hover:text-accent-hover transition-colors">Return to shop</Link>
      </div>
    );
  }

  const soldOut = product.stock <= 0;
  const handleAddToCart = () => {
    if (soldOut) return;
    addToCart(product, { size, color, quantity: 1 });
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const inCart = product && cartItems.some(i => i.id === product.id);

  const mainImage = (product.images || []).find((i) => i.is_main);
  const detailImages = (product.images || []).filter((i) => !i.is_main);
  const allImages = product.images || [];
  
  const currentIndex = allImages.findIndex(img => assetUrl(img.url) === activeImg);

  const nextImage = () => {
    if (allImages.length <= 1) return;
    const nextIdx = (currentIndex + 1) % allImages.length;
    setActiveImg(assetUrl(allImages[nextIdx].url));
  };

  const prevImage = () => {
    if (allImages.length <= 1) return;
    const prevIdx = (currentIndex - 1 + allImages.length) % allImages.length;
    setActiveImg(assetUrl(allImages[prevIdx].url));
  };

  const activePrice = activeImg
    ? allImages.find((i) => assetUrl(i.url) === activeImg)?.price
    : null;
  const displayPrice = activePrice != null ? activePrice : product.price;

  return (
    <div className="bg-white min-h-screen pt-12 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link to="/products" className="inline-flex items-center text-sm text-gray-500 hover:text-ink transition-colors">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Products
          </Link>
        </div>

        <div className="flex flex-col md:flex-row gap-12 lg:gap-16">
          {/* Gallery */}
          <div className="w-full md:w-1/2">
            <div className="relative aspect-[4/5] rounded-3xl overflow-hidden bg-gray-50 mb-6 group">
              <img src={activeImg} alt={product.name} className="w-full h-full object-contain mix-blend-multiply transition-all duration-300" />
              
              {allImages.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 rounded-full flex items-center justify-center text-ink shadow-md hover:bg-white hover:scale-110 transition-all"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 rounded-full flex items-center justify-center text-ink shadow-md hover:bg-white hover:scale-110 transition-all"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </>
              )}
            </div>
            {detailImages.length > 0 && (
              <div ref={thumbContainerRef} className="flex gap-4 overflow-x-auto pb-4 pt-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {detailImages.map((img) => {
                  const isActive = activeImg === assetUrl(img.url);
                  return (
                    <button
                      key={img.id}
                      ref={isActive ? activeThumbRef : null}
                      onClick={() => setActiveImg(assetUrl(img.url))}
                      className={`w-20 h-24 rounded-2xl overflow-hidden border-2 flex-shrink-0 transition-all duration-300 relative group ${
                        isActive 
                          ? 'border-ink shadow-md scale-105' 
                          : 'border-transparent hover:border-gray-300 hover:shadow-sm'
                      }`}
                    >
                      <div className="absolute inset-0 bg-gradient-to-b from-gray-50 to-gray-100 -z-10" />
                      <img src={assetUrl(img.url)} alt="" className="w-full h-full object-contain mix-blend-multiply p-1 transition-transform duration-500 group-hover:scale-110" />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="w-full md:w-1/2 flex flex-col pt-4">
            <div className="mb-2">
              <span className="text-sm font-medium text-gray-500 tracking-wider uppercase">{categoryName(product)}</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-ink mb-4">{product.name}</h1>
            
            <p className="text-2xl font-semibold text-ink mb-6 flex items-center gap-3">
              {money(displayPrice)}
              {activePrice != null && activePrice !== product.price && (
                <span className="text-lg font-medium text-gray-400 line-through">{money(product.price)}</span>
              )}
            </p>
            
            <p className="text-gray-600 leading-relaxed text-base mb-8">{product.description}</p>

            {product.material && (
              <div className="mb-8 p-6 bg-gray-50 rounded-2xl border border-gray-100">
                <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Material</span>
                <span className="text-sm text-ink">{product.material}</span>
              </div>
            )}

            {/* Sizes */}
            {product.sizes?.length > 0 && (
              <div className="mb-6">
                <div className="flex justify-between items-center mb-3">
                  <p className="text-sm font-semibold text-ink">Size</p>
                  <Link to="/size-guide" className="text-xs text-gray-500 hover:text-ink underline">Size Guide</Link>
                </div>
                <div className="flex flex-wrap gap-3">
                  {product.sizes.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSize(s)}
                      className={`w-12 h-12 rounded-lg font-medium text-sm transition-colors ${size === s ? 'bg-ink text-white' : 'border border-gray-200 bg-white text-gray-600 hover:border-ink'
                        }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Colors */}
            {product.colors?.length > 0 && (
              <div className="mb-8">
                <p className="text-sm font-semibold text-ink mb-3">Color</p>
                <div className="flex flex-wrap gap-3">
                  {product.colors.map((c) => (
                    <button
                      key={c}
                      onClick={() => setColor(c)}
                      className={`px-5 py-2.5 rounded-lg font-medium text-sm transition-colors capitalize ${color === c ? 'bg-ink text-white' : 'border border-gray-200 bg-white text-gray-600 hover:border-ink'
                        }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={handleAddToCart}
              disabled={soldOut}
              className={`w-full py-4 rounded-xl font-semibold text-lg transition-colors flex items-center justify-center ${soldOut
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : (isAdded || inCart)
                    ? 'bg-green-600 text-white'
                    : 'bg-ink text-white hover:bg-gray-800'
                }`}
            >
              {soldOut ? 'Sold Out' : (isAdded || inCart) ? (<><Check className="mr-2 h-5 w-5" /> Added to Cart</>) : 'Add to Cart'}
            </button>

            {detailImages.some(img => img.price != null) && (
              <div className="mt-8 pt-6 border-t border-gray-100">
                <h3 className="text-sm font-semibold text-ink mb-4">Pricing Breakdown by Option</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {detailImages.filter(img => img.price != null).map((img) => (
                    <div key={img.id} className="flex flex-col items-center p-3 border border-gray-100 rounded-xl bg-gray-50">
                      <img src={assetUrl(img.url)} alt="" className="w-12 h-12 object-contain mix-blend-multiply mb-2" />
                      <span className="text-sm font-medium text-ink">
                        {money(img.price)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-10 pt-8 border-t border-gray-100 space-y-6">
              <Feature icon={Truck} title="Worldwide Shipping" text="We export globally. Ships within 2–3 business days." />
              <Feature icon={RefreshCw} title="30-Day Returns" text="Not quite right? Return within 30 days for a full refund." />
              <Feature icon={ShieldCheck} title="Quality Guarantee" text="We stand by the craftsmanship of every piece." />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Feature = ({ icon: Icon, title, text }) => (
  <div className="flex items-start">
    <Icon className="h-6 w-6 text-accent mr-4 flex-shrink-0" />
    <div>
      <h4 className="text-sm font-medium text-ink">{title}</h4>
      <p className="text-sm text-muted mt-1">{text}</p>
    </div>
  </div>
);

export default UserProductDetails;
