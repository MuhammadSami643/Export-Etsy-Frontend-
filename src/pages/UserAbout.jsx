import { Link } from 'react-router-dom';
import { Truck, Globe, ShieldCheck, Leaf } from 'lucide-react';

const About = () => {
  return (
    <div className="bg-white min-h-screen pt-12 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-ink mb-4">About VESTRA</h1>
          <p className="text-lg text-muted max-w-2xl mx-auto">
            Premium clothing exported worldwide. We bridge craftsmanship with global demand.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-24">
          {[
            { icon: Globe, title: 'Global Export', text: 'Shipping to 40+ countries with reliable logistics partners.' },
            { icon: Truck, title: 'Fast Dispatch', text: 'Orders processed within 24 hours and tracked end-to-end.' },
            { icon: ShieldCheck, title: 'Quality First', text: 'Every garment inspected against strict export standards.' },
            { icon: Leaf, title: 'Responsible', text: 'Sustainable materials and ethical manufacturing practices.' },
          ].map((item) => (
            <div key={item.title} className="bg-gray-50 p-6 rounded-2xl">
              <item.icon className="h-8 w-8 text-accent mb-4" />
              <h3 className="text-lg font-bold text-ink mb-2">{item.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{item.text}</p>
            </div>
          ))}
        </div>

        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold tracking-tight text-ink mb-6">Our Story</h2>
          <p className="text-gray-600 leading-relaxed mb-6">
            Founded with a focus on clothing export, VESTRA connects manufacturers with retailers and consumers around the world. We handle sourcing, quality control, documentation and shipping so our partners can focus on growing their business.
          </p>
          <p className="text-gray-600 leading-relaxed">
            From bulk wholesale orders to single-item retail, we maintain the same commitment to fabric quality, fit, and finish. Our collection includes shirts, denim, knitwear, dresses, and accessories built to international standards.
          </p>
        </div>

        <div className="mt-16 text-center">
          <Link to="/products" className="inline-block bg-accent text-accent-foreground px-8 py-4 rounded-full font-bold hover:bg-accent-hover transition-colors">
            View Collection
          </Link>
        </div>
      </div>
    </div>
  );
};

export default About;
