import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { productApi, categoryApi, settingsApi } from '../api';
import { apiFetch, assetUrl } from '../api/client';

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
  const [testimonials, setTestimonials] = useState([]);

  useEffect(() => {
    productApi.list({ featured: true, limit: 4 }).then((d) => setFeatured(d.products)).catch(() => { });
    categoryApi.listWithSubs().then(setCategories).catch(() => { });
    settingsApi.get().then(setSettings).catch(() => { });
    apiFetch('/testimonials').then(setTestimonials).catch(() => { });
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
            <h2 className="text-3xl font-bold tracking-tight text-ink mt-2 mb-2">What Our Customers Say</h2>
            <p className="text-muted">We place huge value on strong relationships and customer feedback.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4 pb-12">
            {(testimonials.length > 0 ? testimonials : [
              {
                id: '1',
                subject: 'Amazing quality!',
                content: "I used to spend hours writing creative copy, but now all I do is tell Rytr what I need and it writes everything for me. It's the ultimate AI content writer, and a must-have tool for bloggers,marketers.",
                name: 'MERI PIPENBAHER',
                role: 'Ui Designer',
                image_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop'
              },
              {
                id: '2',
                subject: 'Saves so much time',
                content: "codexyard is a game-changer. Instead of drowning in an endless chain of emails, there is clear and easy accountability meaning tasks actually get done!",
                name: 'SAM WISTER',
                role: 'Laravel Developer',
                image_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop'
              },
              {
                id: '3',
                subject: 'Highly recommended',
                content: "I have been using codexyard for over a year now and I love it! I can't imagine life without it. It's so easy to use, and the customer service is great.",
                name: 'EMILA MARTINEZ',
                role: 'Social Media Manager',
                image_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop'
              }
            ]).map((t) => (
              <div key={t.id} className="bg-white p-10 rounded-xl shadow-sm border border-gray-100 hover:shadow-lg hover:border-gray-200 relative text-center mb-12 md:mb-0 flex flex-col h-full transition-all duration-300">
                <div className="text-accent mb-4 flex justify-center">
                  <svg className="w-12 h-12 fill-current opacity-20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
                  </svg>
                </div>
                {t.subject && (
                  <h4 className="font-bold text-ink mb-2">{t.subject}</h4>
                )}
                <p className="text-gray-600 text-[15px] leading-relaxed mb-8 flex-grow">
                  "{t.content}"
                </p>
                
                <div className="mt-auto mb-4">
                  <h4 className="font-bold text-accent text-sm uppercase tracking-wider mb-1">{t.name}</h4>
                  <p className="text-slate-500 text-sm">{t.role}</p>
                </div>

                <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2">
                  {t.image_url ? (
                    <img 
                      src={assetUrl(t.image_url)} 
                      alt={t.name} 
                      className="w-20 h-20 rounded-full border-[6px] border-white object-cover shadow-sm bg-gray-100"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full border-[6px] border-white flex items-center justify-center text-gray-500 bg-gray-100 shadow-sm uppercase font-bold text-2xl">
                      {t.name.charAt(0)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default UserHome;
