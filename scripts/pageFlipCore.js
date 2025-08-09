/**
 * Simple but effective page flip engine
 */
export class PageFlipCore {
  constructor(element, options = {}) { // Accept options
    this.container = element;
    this.isRTL = options.rtl || false; // Store RTL state
    this.pageElements = [];
    this.currentPage = 0;
    this.isFlipping = false;
    this.listeners = {};
    
    // Styling
    this.container.style.position = 'relative';
    this.container.style.transformStyle = 'preserve-3d';
    this.container.style.perspective = '1200px';
    
    console.log("PageFlipCore initialized with container:", this.container);
  }
  
  async setPages(elements) {
    console.log(`Setting ${elements.length} pages`);
    this.pageElements = elements;
    
    // Initialize pages
    this.pageElements.forEach((page, index) => {
      page.style.position = 'absolute';
      page.style.transition = 'transform 0.6s ease';
      // FIX: Set transform origin based on RTL
      page.style.transformOrigin = this.isRTL ? 'right center' : 'left center';
      page.style.backfaceVisibility = 'hidden';
      page.style.zIndex = this.pageElements.length - index;
      
      // CRITICAL FIX: Make pages visible
      page.style.display = 'block';
      page.style.visibility = 'visible';
      
      // Add click event for page flipping
      page.addEventListener('click', () => {
        // FIX: Flip direction depends on RTL
        const direction = this.isRTL ? -1 : 1;
        if (this.isRTL && index >= this.currentPage) return;
        if (!this.isRTL && index <= this.currentPage) return;
        this.flipPage(direction);
      });
    });
    
    this.updatePagePositions();
    console.log("Pages initialized and positioned");
  }
  
updatePagePositions() {
  this.pageElements.forEach((page, index) => {
    const angle = this.isRTL ? 180 : -180;
    if (index < this.currentPage) {
      page.style.transform = `rotateY(${angle}deg)`;
    } else {
      page.style.transform = 'rotateY(0deg)';
    }
    
    // CRITICAL: DELETE any code here that might set visibility to hidden
    // Force ALL pages to be visible no matter what
    page.style.visibility = 'visible';
    page.style.display = 'block';
  });
}
  
  setPage(pageNumber) {
    if (pageNumber < 0 || pageNumber >= this.pageElements.length) return;
    if (this.isFlipping) return;
    
    console.log(`Setting page to ${pageNumber}`);
    this.currentPage = pageNumber;
    this.updatePagePositions();
    this.emit('flip', { page: this.currentPage });
  }
  
  flipPage(direction) {
    if (this.isFlipping) return;
    
    const newPage = this.currentPage + direction;
    if (newPage < 0 || newPage >= this.pageElements.length) return;
    
    console.log(`Flipping page ${direction > 0 ? 'forward' : 'backward'}`);
    this.isFlipping = true;
    
    // Animation
    const page = this.pageElements[direction > 0 ? this.currentPage : this.currentPage - 1];
    if (page) {
      // FIX: Angle calculation depends on RTL
      const angle = this.isRTL ? 180 : -180;
      const startAngle = direction > 0 ? 0 : angle;
      const endAngle = direction > 0 ? angle : 0;
      
      page.style.transform = `rotateY(${startAngle}deg)`;
      
      // Force layout recalculation
      void page.offsetWidth;
      
      page.style.transform = `rotateY(${endAngle}deg)`;
      
      setTimeout(() => {
        this.currentPage = newPage;
        this.updatePagePositions();
        this.isFlipping = false;
        this.emit('flip', { page: this.currentPage });
      }, 600);
    }
  }
  
  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }
  
  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => callback(data));
    }
  }
  
  destroy() {
    // Clean up event listeners
    this.pageElements.forEach(page => {
      page.removeEventListener('click');
    });
    this.listeners = {};
  }
}