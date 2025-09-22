// Flex Cards Carousel JavaScript
document.addEventListener('DOMContentLoaded', function() {
  console.log('Flex Cards Carousel: Initializing...');
  
  // Initialize all carousels
  const carousels = document.querySelectorAll('[data-section="flex-cards-carousel"]');
  console.log('Found carousels:', carousels.length);
  
  carousels.forEach(function(carousel) {
    console.log('Initializing carousel:', carousel);
    initCarousel(carousel);
  });
});

function initCarousel(carousel) {
  const track = carousel.querySelector('[data-carousel-track]');
  const originalSlides = carousel.querySelectorAll('.card');
  const prevBtn = carousel.querySelector('[data-carousel-prev]');
  const nextBtn = carousel.querySelector('[data-carousel-next]');
  const dots = carousel.querySelectorAll('[data-carousel-dot]');
  
  console.log('Carousel elements found:', {
    track: !!track,
    slides: originalSlides.length,
    prevBtn: !!prevBtn,
    nextBtn: !!nextBtn,
    dots: dots.length
  });
  
  if (!track || originalSlides.length === 0) {
    console.log('Carousel initialization failed: missing track or slides');
    return;
  }
  
  // Create infinite loop by duplicating slides
  const slides = [];
  const slideCount = originalSlides.length;
  
  // Clone slides for infinite loop (add clones at beginning and end)
  originalSlides.forEach((slide, index) => {
    // Original slides
    slides.push(slide);
    
    // Clone for end (to create seamless loop)
    const cloneEnd = slide.cloneNode(true);
    cloneEnd.classList.add('carousel-clone', 'carousel-clone-end');
    track.appendChild(cloneEnd);
    slides.push(cloneEnd);
    
    // Clone for beginning (to create seamless loop)
    const cloneStart = slide.cloneNode(true);
    cloneStart.classList.add('carousel-clone', 'carousel-clone-start');
    track.insertBefore(cloneStart, track.firstChild);
    slides.unshift(cloneStart);
  });
  
  // Update slides reference to include clones
  const allSlides = track.querySelectorAll('.card, .carousel-clone');
  
  console.log('Infinite loop setup:', {
    originalSlides: slideCount,
    totalSlides: allSlides.length,
    clonesAdded: allSlides.length - slideCount
  });
  
  // Get settings
  const cardsPerView = parseInt(carousel.dataset.cardsPerView) || 3;
  const cardsPerViewMobile = parseInt(carousel.dataset.cardsPerViewMobile) || 1;
  const autoplay = carousel.dataset.autoplay === 'true';
  const autoplaySpeed = parseInt(carousel.dataset.autoplaySpeed) || 5000;
  
  // Start at the first original slide (after the start clones)
  let currentIndex = slideCount; // Start at first original slide
  let autoplayInterval = null;
  let isTransitioning = false;
  
  // Update cards per view based on screen size
  function updateCardsPerView() {
    return window.innerWidth <= 767 ? cardsPerViewMobile : cardsPerView;
  }
  
  // Update carousel position
  function updateCarousel() {
    console.log('updateCarousel called, currentIndex:', currentIndex);
    if (isTransitioning) return;
    
    const currentCardsPerView = updateCardsPerView();
    const slideWidth = 100 / currentCardsPerView;
    const translateX = -(currentIndex * slideWidth);
    
    console.log('Updating carousel:', {
      currentCardsPerView,
      slideWidth,
      translateX,
      currentIndex,
      totalSlides: allSlides.length
    });
    
    track.style.transform = `translateX(${translateX}%)`;
    
    // Never disable buttons in infinite loop
    if (prevBtn) prevBtn.disabled = false;
    if (nextBtn) nextBtn.disabled = false;
    
    // Update dots based on original slide position
    const originalSlideIndex = currentIndex - slideCount;
    dots.forEach((dot, index) => {
      dot.classList.toggle('carousel-dot--active', index === originalSlideIndex);
    });
  }
  
  // Next slide
  function nextSlide() {
    console.log('nextSlide called, currentIndex:', currentIndex);
    if (isTransitioning) return;
    
    currentIndex++;
    
    // If we've reached the end clones, jump to the beginning of original slides
    if (currentIndex >= slideCount * 2) {
      setTimeout(() => {
        currentIndex = slideCount;
        track.style.transition = 'none';
        updateCarousel();
        setTimeout(() => {
          track.style.transition = 'transform 0.3s ease-in-out';
        }, 50);
      }, 300);
    }
    
    console.log('nextSlide: new currentIndex:', currentIndex);
    updateCarousel();
  }
  
  // Previous slide
  function prevSlide() {
    console.log('prevSlide called, currentIndex:', currentIndex);
    if (isTransitioning) return;
    
    currentIndex--;
    
    // If we've reached the start clones, jump to the end of original slides
    if (currentIndex < slideCount) {
      setTimeout(() => {
        currentIndex = slideCount * 2 - 1;
        track.style.transition = 'none';
        updateCarousel();
        setTimeout(() => {
          track.style.transition = 'transform 0.3s ease-in-out';
        }, 50);
      }, 300);
    }
    
    console.log('prevSlide: new currentIndex:', currentIndex);
    updateCarousel();
  }
  
  // Go to specific slide
  function goToSlide(index) {
    if (isTransitioning) return;
    currentIndex = index + slideCount; // Adjust for start clones
    updateCarousel();
  }
  
  // Start autoplay
  function startAutoplay() {
    if (!autoplay) return;
    stopAutoplay();
    autoplayInterval = setInterval(nextSlide, autoplaySpeed);
  }
  
  // Stop autoplay
  function stopAutoplay() {
    if (autoplayInterval) {
      clearInterval(autoplayInterval);
      autoplayInterval = null;
    }
  }
  
  // Event listeners
  if (prevBtn) {
    console.log('Adding click listener to prev button');
    prevBtn.addEventListener('click', function(e) {
      console.log('Prev button clicked!');
      e.preventDefault();
      prevSlide();
    });
  }
  
  if (nextBtn) {
    console.log('Adding click listener to next button');
    nextBtn.addEventListener('click', function(e) {
      console.log('Next button clicked!');
      e.preventDefault();
      nextSlide();
    });
  }
  
  // Dot navigation
  dots.forEach((dot, index) => {
    dot.addEventListener('click', function(e) {
      e.preventDefault();
      goToSlide(index);
    });
  });
  
  // Touch/swipe support
  let startX = 0;
  let startY = 0;
  let isDragging = false;
  
  track.addEventListener('touchstart', function(e) {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    isDragging = true;
    stopAutoplay();
  }, { passive: true });
  
  track.addEventListener('touchmove', function(e) {
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
  
  track.addEventListener('touchend', function(e) {
    if (!isDragging) return;
    
    const endX = e.changedTouches[0].clientX;
    const diffX = startX - endX;
    const threshold = 50;
    
    if (Math.abs(diffX) > threshold) {
      if (diffX > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
    
    isDragging = false;
    if (autoplay) startAutoplay();
  }, { passive: true });
  
  // Keyboard navigation
  carousel.addEventListener('keydown', function(e) {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      prevSlide();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      nextSlide();
    }
  });
  
  // Pause autoplay on hover
  carousel.addEventListener('mouseenter', stopAutoplay);
  carousel.addEventListener('mouseleave', function() {
    if (autoplay) startAutoplay();
  });
  
  // Handle window resize
  window.addEventListener('resize', function() {
    updateCarousel();
  });
  
  // Initialize
  console.log('Initializing infinite carousel with settings:', {
    cardsPerView,
    cardsPerViewMobile,
    autoplay,
    autoplaySpeed,
    originalSlides: slideCount,
    totalSlides: allSlides.length,
    startingIndex: currentIndex
  });
  
  // Set initial position without transition
  track.style.transition = 'none';
  updateCarousel();
  
  // Enable transitions after initial setup
  setTimeout(() => {
    track.style.transition = 'transform 0.3s ease-in-out';
  }, 50);
  
  if (autoplay) startAutoplay();
  
  console.log('Infinite carousel initialization complete!');
}