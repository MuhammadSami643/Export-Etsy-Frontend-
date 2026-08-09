import { Link } from 'react-router-dom';

const UserFooter = () => {
  return (
    <footer className="bg-white border-t border-gray-100 pt-16 pb-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div>
            <span className="font-bold text-2xl tracking-[0.2em] text-ink block mb-4">VESTRA<span className="text-accent">.</span></span>
            <p className="text-gray-500 text-sm mb-6 max-w-xs">
              Global apparel export. Thoughtfully made clothing for men, women and kids — shipped worldwide.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-sm font-bold text-gray-400 hover:text-accent transition-colors">IG</a>
              <a href="#" className="text-sm font-bold text-gray-400 hover:text-accent transition-colors">TW</a>
              <a href="#" className="text-sm font-bold text-gray-400 hover:text-accent transition-colors">FB</a>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-ink mb-4">Shop</h4>
            <ul className="space-y-3">
              <li><Link to="/products" className="text-gray-500 hover:text-accent text-sm transition-colors">All Products</Link></li>
              <li><Link to="/products?category=men" className="text-gray-500 hover:text-accent text-sm transition-colors">Men</Link></li>
              <li><Link to="/products?category=women" className="text-gray-500 hover:text-accent text-sm transition-colors">Women</Link></li>
              <li><Link to="/products?category=kids" className="text-gray-500 hover:text-accent text-sm transition-colors">Kids</Link></li>
              <li><Link to="/products?category=accessories" className="text-gray-500 hover:text-accent text-sm transition-colors">Accessories</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-ink mb-4">Customer Care</h4>
            <ul className="space-y-3">
              <li><Link to="/size-guide" className="text-gray-500 hover:text-accent text-sm transition-colors">Size Guide</Link></li>
              <li><Link to="/shipping" className="text-gray-500 hover:text-accent text-sm transition-colors">Shipping &amp; Returns</Link></li>
              <li><Link to="/contact" className="text-gray-500 hover:text-accent text-sm transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-ink mb-4">Legal</h4>
            <ul className="space-y-3">
              <li><Link to="/privacy" className="text-gray-500 hover:text-accent text-sm transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-gray-500 hover:text-accent text-sm transition-colors">Terms &amp; Conditions</Link></li>
              <li><Link to="/returns" className="text-gray-500 hover:text-accent text-sm transition-colors">Return &amp; Refund</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-xs text-center md:text-left mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} VESTRA Global Apparel. All rights reserved.
          </p>
          <div className="flex space-x-4">
            <Link to="/privacy" className="text-gray-400 text-xs hover:text-accent transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="text-gray-400 text-xs hover:text-accent transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default UserFooter;
