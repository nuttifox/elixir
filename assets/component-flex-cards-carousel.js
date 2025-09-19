if (typeof FlexCardsCarousel !== 'function') {

  class FlexCardsCarousel extends HTMLElement {
    
    constructor() {
      super();
      this.currentIndex = 0;
      this.totalSlides = 0;
      this.cardsPerView = 3;
      this.cardsPerViewMobile = 1;
      this.autoplayInterval = null;
      this.isAutoplay = false;
      this.autoplaySpeed = 5000;
      this.isTransitioning = false;
      
      this.init();
    }
    
    init() {
      this.track = this.querySelector('[data-carousel-track]');
      this.slides = this.querySelectorAll('.carousel-slide');
      this.prevButton = this.querySelector('[data-carousel-prev]');
      this.nextButton = this.querySelector('[data-carousel-next]');
      this.dots = this.querySelectorAll('[data-carousel-dot]');
      
      if (!this.track || this.slides.length === 0) return;
      
      this.totalSlides = this.slides.length;
      this.updateCardsPerView();
      this.setupEventListeners();
      this.updateCarousel();
      
      // Start autoplay if enabled
      if (this.isAutoplay) {
        this.startAutoplay();
      }
    }
    
    updateCardsPerView() {
      const isMobile = window.innerWidth <= 767;
      this.cardsPerView = isMobile ? this.cardsPerViewMobile : this.cardsPerView;
    }
    
    setupEventListeners() {
      // Navigation buttons
      if (this.prevButton) {
        this.prevButton.addEventListener('click', () => this.previousSlide());
      }
      
      if (this.nextButton) {
        this.nextButton.addEventListener('click', () => this.nextSlide());
      }
      
      // Dots navigation
      this.dots.forEach((dot, index) => {
        dot.addEventListener('click', () => this.goToSlide(index));
      });
      
      // Touch/swipe support
      this.setupTouchEvents();
      
      // Keyboard navigation
      this.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') this.previousSlide();
        if (e.key === 'ArrowRight') this.nextSlide();
      });
      
      // Pause autoplay on hover
      this.addEventListener('mouseenter', () => this.pauseAutoplay());
      this.addEventListener('mouseleave', () => {
        if (this.isAutoplay) this.startAutoplay();
      });
      
      // Handle window resize
      window.addEventListener('resize', () => {
        this.updateCardsPerView();
        this.updateCarousel();
      });
    }
    
    setupTouchEvents() {
      let startX = 0;
      let startY = 0;
      let isDragging = false;
      
      this.track.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        isDragging = true;
        this.pauseAutoplay();
      }, { passive: true });
      
      this.track.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        
        const currentX = e.touches[0].clientX;
        const currentY = e.touches[0].clientY;
        const diffX = startX - currentX;
        const diffY = startY - currentY;
        
        // Only handle horizontal swipes
        if (Math.abs(diffX) > Math.abs(diffY)) {
          e.preventDefault();
        }
      }, { passive: false });
      
      this.track.addEventListener('touchend', (e) => {
        if (!isDragging) return;
        
        const endX = e.changedTouches[0].clientX;
        const diffX = startX - endX;
        const threshold = 50;
        
        if (Math.abs(diffX) > threshold) {
          if (diffX > 0) {
            this.nextSlide();
          } else {
            this.previousSlide();
          }
        }
        
        isDragging = false;
        if (this.isAutoplay) this.startAutoplay();
      }, { passive: true });
    }
    
    nextSlide() {
      if (this.isTransitioning) return;
      
      const maxIndex = Math.max(0, this.totalSlides - this.cardsPerView);
      this.currentIndex = this.currentIndex >= maxIndex ? 0 : this.currentIndex + 1;
      this.updateCarousel();
    }
    
    previousSlide() {
      if (this.isTransitioning) return;
      
      const maxIndex = Math.max(0, this.totalSlides - this.cardsPerView);
      this.currentIndex = this.currentIndex <= 0 ? maxIndex : this.currentIndex - 1;
      this.updateCarousel();
    }
    
    goToSlide(index) {
      if (this.isTransitioning) return;
      
      const maxIndex = Math.max(0, this.totalSlides - this.cardsPerView);
      this.currentIndex = Math.min(index, maxIndex);
      this.updateCarousel();
    }
    
    updateCarousel() {
      if (!this.track) return;
      
      this.isTransitioning = true;
      
      const slideWidth = 100 / this.cardsPerView;
      const translateX = -(this.currentIndex * slideWidth);
      
      this.track.style.transform = `translateX(${translateX}%)`;
      
      // Update navigation buttons
      this.updateNavigationButtons();
      
      // Update dots
      this.updateDots();
      
      // Reset transition flag
      setTimeout(() => {
        this.isTransitioning = false;
      }, 300);
    }
    
    updateNavigationButtons() {
      const maxIndex = Math.max(0, this.totalSlides - this.cardsPerView);
      
      if (this.prevButton) {
        this.prevButton.disabled = this.currentIndex === 0;
      }
      
      if (this.nextButton) {
        this.nextButton.disabled = this.currentIndex >= maxIndex;
      }
    }
    
    updateDots() {
      this.dots.forEach((dot, index) => {
        dot.classList.toggle('carousel-dot--active', index === this.currentIndex);
      });
    }
    
    startAutoplay() {
      this.stopAutoplay();
      this.autoplayInterval = setInterval(() => {
        this.nextSlide();
      }, this.autoplaySpeed);
    }
    
    stopAutoplay() {
      if (this.autoplayInterval) {
        clearInterval(this.autoplayInterval);
        this.autoplayInterval = null;
      }
    }
    
    pauseAutoplay() {
      this.stopAutoplay();
    }
    
    // Public methods for external control
    setAutoplay(enabled, speed = 5000) {
      this.isAutoplay = enabled;
      this.autoplaySpeed = speed;
      
      if (enabled) {
        this.startAutoplay();
      } else {
        this.stopAutoplay();
      }
    }
    
    setCardsPerView(desktop, mobile) {
      this.cardsPerView = desktop;
      this.cardsPerViewMobile = mobile;
      this.updateCardsPerView();
      this.updateCarousel();
    }
  }
  
  // Initialize carousels when DOM is ready
  document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('[data-section="flex-cards-carousel"]').forEach(carousel => {
      // Get settings from the carousel element
      const autoplay = carousel.dataset.autoplay === 'true';
      const autoplaySpeed = parseInt(carousel.dataset.autoplaySpeed) || 5000;
      const cardsPerView = parseInt(carousel.dataset.cardsPerView) || 3;
      const cardsPerViewMobile = parseInt(carousel.dataset.cardsPerViewMobile) || 1;
      
      // Create carousel instance
      const carouselInstance = new FlexCardsCarousel();
      carouselInstance.isAutoplay = autoplay;
      carouselInstance.autoplaySpeed = autoplaySpeed;
      carouselInstance.cardsPerView = cardsPerView;
      carouselInstance.cardsPerViewMobile = cardsPerViewMobile;
      
      // Replace the original element
      carousel.parentNode.replaceChild(carouselInstance, carousel);
      carouselInstance.innerHTML = carousel.innerHTML;
      carouselInstance.init();
    });
  });
  
  // Register the custom element
  if (typeof customElements !== 'undefined') {
    customElements.define('flex-cards-carousel', FlexCardsCarousel);
  }
}
