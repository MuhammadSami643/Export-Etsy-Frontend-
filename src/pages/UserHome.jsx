import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { productApi, categoryApi, settingsApi } from '../api';
import { assetUrl } from '../api/client';

const heroImg = 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=2000&h=1000&fit=crop';
const catImg = {
  men: 'https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?w=800&h=1000&fit=crop',
  women: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&h=1000&fit=crop',
  kids: 'https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=800&h=1000&fit=crop',
  accessories: 'https://images.unsplash.com/photo-1523779105320-d1cd346ff52b?w=800&h=1000&fit=crop',
};

const UserHome = () => {
  const [featured, setFeatured] = useState([]);
  const [categories, setCategories] = useState([]);
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    productApi.list({ featured: true, limit: 4 }).then((d) => setFeatured(d.products)).catch(() => { });
    categoryApi.listWithSubs().then(setCategories).catch(() => { });
    settingsApi.get().then(setSettings).catch(() => { });
  }, []);

  const heroTitle = settings?.hero_title || 'Wear the standard\nyou\'re proud of.';
  const heroSubtitle = settings?.hero_subtitle || 'Responsibly sourced, precisely cut apparel built to last. Discover pieces designed to move with you.';
  const heroCta = settings?.cta_text || 'Shop the Collection';
  const heroLink = settings?.cta_link || '/products';
  const heroImage = settings?.hero_bg || heroImg;

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero */}
      <section className="relative h-[85vh] min-h-[560px] flex items-center overflow-hidden bg-ink">
        <div className="absolute inset-0 w-full h-full">
          <img src={heroImage} alt="VESTRA Apparel" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/40 to-transparent" />
        </div>
        <div className="relative max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-xl">
            <span className="inline-block text-accent font-semibold tracking-[0.25em] text-xs uppercase mb-5">
              New Season · 2026
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.05] mb-6 whitespace-pre-line">
              {heroTitle}
            </h1>
            <p className="text-lg text-gray-200 font-light leading-relaxed mb-9 max-w-md">
              {heroSubtitle}
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <Link
                to={heroLink}
                className="inline-flex items-center bg-accent text-accent-foreground px-8 py-4 rounded-full font-semibold hover:bg-accent-hover transition-colors shadow-lg shadow-black/20"
              >
                {heroCta} <span className="ml-2">→</span>
              </Link>
              <Link
                to="/about"
                className="inline-flex items-center text-white font-medium px-6 py-4 rounded-full border border-white/30 hover:bg-white/10 transition-colors"
              >
                Our Story
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <span className="text-accent font-semibold tracking-[0.2em] text-xs uppercase">Collections</span>
            <h2 className="text-3xl font-bold tracking-tight text-ink mt-2 mb-2">Shop by Category</h2>
            <p className="text-muted">Find your fit across our collections.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.filter(c => !c.parent_id && c.show_on_home).map((c, idx) => (
              <Link key={c.id} to={`/products?category=${c.slug}`} className="group relative h-80 rounded-[2rem] overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-accent/20 transition-all duration-500 bg-gray-900">
                <img
                  src={c.bg_image ? assetUrl(c.bg_image) : catImg[c.slug] || `https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&h=1000&fit=crop`}
                  alt={c.name}
                  className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:rotate-1 opacity-80 group-hover:opacity-100"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300" />
                
                <div className="absolute inset-0 p-8 flex flex-col justify-end translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                  <div className="w-10 h-1 bg-accent rounded-full mb-4 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                  <h3 className="text-3xl font-extrabold text-white mb-3 drop-shadow-md">{c.name}</h3>
                  <div className="inline-flex items-center text-white font-medium text-sm opacity-0 group-hover:opacity-100 transition-all duration-500 delay-100">
                    <span className="bg-white/20 backdrop-blur-md px-5 py-2.5 rounded-full border border-white/30 flex items-center gap-2 shadow-lg">
                      Explore Collection <span className="text-accent font-bold group-hover:translate-x-1 transition-transform">→</span>
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <span className="text-accent font-semibold tracking-[0.2em] text-xs uppercase">Curated</span>
              <h2 className="text-3xl font-bold tracking-tight text-ink mt-2 mb-2">Featured Pieces</h2>
              <p className="text-muted">Our most-loved styles this season.</p>
            </div>
            <Link to="/products" className="hidden sm:inline-flex items-center text-accent font-bold hover:text-accent-hover transition-colors">
              View All <span className="ml-2">→</span>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Philosophy */}
      <section className="py-32 bg-ink text-center px-4">
        <div className="max-w-3xl mx-auto">
          <span className="text-accent font-semibold tracking-[0.2em] text-xs uppercase">Our Promise</span>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white mt-3 mb-6">Quality You Can Feel</h2>
          <p className="text-lg text-gray-300 leading-relaxed font-light">
            We source responsibly, cut precisely, and finish carefully — so every garment we export meets a standard we're proud to put our name on.
          </p>
          <Link
            to="/products"
            className="inline-flex items-center mt-9 bg-accent text-accent-foreground px-8 py-4 rounded-full font-semibold hover:bg-accent-hover transition-colors"
          >
            Explore the Collection <span className="ml-2">→</span>
          </Link>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-accent font-semibold tracking-[0.2em] text-xs uppercase">Reviews</span>
            <h2 className="text-3xl font-bold tracking-tight text-ink mt-2">What They're Saying</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="bg-white p-10 rounded-[2rem] shadow-sm border border-gray-100 hover:shadow-lg hover:border-gray-200 transition-all duration-300">
              <div className="text-accent mb-6 flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                ))}
              </div>
              <p className="text-gray-600 font-medium leading-relaxed mb-8 italic">"The export quality is immediately noticeable. Every seam, every cut feels meticulously planned. Easily the best pieces in my wardrobe right now."</p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full overflow-hidden">
                  <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop" alt="Customer" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h4 className="font-bold text-ink text-sm">Marcus L.</h4>
                  <p className="text-xs text-gray-500 uppercase tracking-widest mt-0.5">Verified Buyer</p>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-white p-10 rounded-[2rem] shadow-sm border border-gray-100 hover:shadow-lg hover:border-gray-200 transition-all duration-300">
              <div className="text-accent mb-6 flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                ))}
              </div>
              <p className="text-gray-600 font-medium leading-relaxed mb-8 italic">"I've bought from many high-end brands, but the fabric feel and structure here is unparalleled. Shipping was incredibly fast globally."</p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full overflow-hidden">
                  <img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop" alt="Customer" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h4 className="font-bold text-ink text-sm">Sarah J.</h4>
                  <p className="text-xs text-gray-500 uppercase tracking-widest mt-0.5">Verified Buyer</p>
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-white p-10 rounded-[2rem] shadow-sm border border-gray-100 hover:shadow-lg hover:border-gray-200 transition-all duration-300">
              <div className="text-accent mb-6 flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                ))}
              </div>
              <p className="text-gray-600 font-medium leading-relaxed mb-8 italic">"A standard they can truly be proud of. The minimalist aesthetic combined with heavy-duty material makes for perfect everyday wear."</p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full overflow-hidden">
                  <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop" alt="Customer" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h4 className="font-bold text-ink text-sm">David K.</h4>
                  <p className="text-xs text-gray-500 uppercase tracking-widest mt-0.5">Verified Buyer</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default UserHome;
