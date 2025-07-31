import { useState, useEffect } from 'react';
import './Slider.css';
import { FaFire } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const Slider = ({ 
  items, 
  autoPlay = false, 
  interval = 5000,
  title = "Productos Destacados",
  showSalesCount = true
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [slidesToShow, setSlidesToShow] = useState(3);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 480) {
        setSlidesToShow(1);
      } else if (window.innerWidth < 768) {
        setSlidesToShow(1.5);
      } else if (window.innerWidth < 1024) {
        setSlidesToShow(2);
      } else {
        setSlidesToShow(3);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!autoPlay || isPaused || items.length <= slidesToShow) return;

    const timer = setTimeout(() => {
      nextSlide();
    }, interval);

    return () => clearTimeout(timer);
  }, [currentIndex, isPaused, items.length, slidesToShow]);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex >= items.length - slidesToShow ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? Math.floor(items.length - slidesToShow) : prevIndex - 1
    );
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  if (!items || items.length === 0) return null;

  return (
    <div 
      className="slider-container"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {title && <h2 className="slider-title">{title}</h2>}
      
      <div className="slider-wrapper">
        <div 
          className="slider-content"
          style={{
            transform: `translateX(-${currentIndex * (100 / slidesToShow)}%)`,
            width: `${items.length * (100 / slidesToShow)}%`
          }}
        >
          {items.map((item) => (
            <div 
              key={item.id}
              className="slide"
              style={{ width: `${100 / slidesToShow}%` }}
            >
              <div className="slider-product-card">
                <div className="product-badge">
                  {showSalesCount && (
                    <span className="sales-count">
                      <FaFire /> {item.salesCount || 0} vendidos
                    </span>
                  )}
                  {item.discount > 0 && (
                    <span className="discount-badge">
                      {item.discount}% OFF
                    </span>
                  )}
                </div>
                
                <Link to={`/product/${item.id}`}>
                  <img 
                    src={item.imageUrl} 
                    alt={item.name} 
                    className="slider-product-image" 
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/300x200?text=Imagen+no+disponible';
                      e.target.alt = 'Imagen no disponible';
                    }}
                  />
                </Link>
                
                <div className="slider-product-info">
                  <h3 className="slider-product-name">
                    <Link to={`/product/${item.id}`}>{item.name}</Link>
                  </h3>
                  
                  <div className="slider-product-pricing">
                    <span className="slider-product-price">
                      ${item.price.toLocaleString('es-ES')}
                    </span>
                    {item.discount > 0 && (
                      <span className="original-price">
                        ${Math.round(item.price / (1 - item.discount/100)).toLocaleString('es-ES')}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {items.length > slidesToShow && (
        <>
          <button 
            className="slider-btn prev" 
            onClick={prevSlide}
            aria-label="Anterior"
          >
            &lt;
          </button>
          <button 
            className="slider-btn next" 
            onClick={nextSlide}
            aria-label="Siguiente"
          >
            &gt;
          </button>

          <div className="slider-dots">
            {Array.from({ length: Math.ceil(items.length - slidesToShow + 1) }).map((_, index) => (
              <button
                key={index}
                className={`dot ${index === currentIndex ? 'active' : ''}`}
                onClick={() => goToSlide(index)}
                aria-label={`Ir al slide ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Slider;