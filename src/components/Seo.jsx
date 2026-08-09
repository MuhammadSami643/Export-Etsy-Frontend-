import { useEffect } from 'react';

const Seo = ({ title, description, keywords }) => {
  useEffect(() => {
    if (title) {
      document.title = title;
    }
    if (description) {
      let meta = document.querySelector('meta[name="description"]');
      if (!meta) {
        meta = document.createElement('meta');
        meta.name = 'description';
        document.head.appendChild(meta);
      }
      meta.content = description;
    }
    if (keywords) {
      let meta = document.querySelector('meta[name="keywords"]');
      if (!meta) {
        meta = document.createElement('meta');
        meta.name = 'keywords';
        document.head.appendChild(meta);
      }
      meta.content = keywords;
    }
    return () => {
      if (title) document.title = 'VESTRA — Global Apparel';
    };
  }, [title, description, keywords]);

  return null;
};

export default Seo;
