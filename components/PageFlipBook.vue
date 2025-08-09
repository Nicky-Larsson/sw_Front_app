<script setup>
import { ref, onMounted, watch, nextTick, onUnmounted } from 'vue'
import { PageFlip } from 'page-flip'
import { createCustomFlipbook } from '@/scripts/customPageFlip';


const props = defineProps({
  pages: Array,
  currentPage: Number,
  rtl: Boolean
})

const emit = defineEmits(['update:currentPage']);
const flipbookEl = ref(null);
let flip = null;

onMounted(async () => {
  await nextTick();
  
  // Get the container dimensions
  const container = flipbookEl.value;
  const containerWidth = container.clientWidth;
  const containerHeight = container.clientHeight;
  
  // Create properly ordered pages array for RTL/LTR
  const orderedPages = [...props.pages];
  if (props.rtl) {
    // For RTL, we need to reverse the page order
    orderedPages.reverse();
  }
  
  // Initialize PageFlip with proper dimensions
// Initialize PageFlip with proper dimensions
/* flip = new PageFlip(container, {
  width: containerWidth * 0.5,      // Keep 0.5 ratio for proper page size
  height: containerHeight,          // Use full height
  size: 'fixed',                    // IMPORTANT: Use 'fixed', not 'stretch'
  minWidth: 0,                      // Allow any width
  minHeight: 0,                     // Allow any height
  maxWidth: 2000,                   // Large enough for any screen
  maxHeight: 2000,                  // Large enough for any screen
  showCover: true,
  drawShadow: true,
  maxShadowOpacity: 0.3,
  flippingTime: 700,
  usePortrait: false,
  startPage: props.rtl ? props.pages.length - 1 : 0,
  mobileScrollSupport: false,
  useMouseEvents: true,
  clickEventForward: false,
  swipeDistance: 30,
  touchEventForce: 200,
}); */


  // Initialize PageFlip
  flip = new PageFlip(container, {
    width: containerWidth * 0.5, // Half width for each page
    height: containerHeight,
    size: 'stretch',
    showCover: true,
    drawShadow: true,
    maxShadowOpacity: 0.6,
    flippingTime: 700,
    usePortrait: false,
    startPage: props.currentPage,
    minWidth: 10,
    minHeight: 10,
    maxWidth: 1000,
    maxHeight: 1000,
    mobileScrollSupport: true,
    useMouseEvents: true,
    clickEventForward: false,
    useSwipe: true,
    swipeDistance: 30,           // LOWER: more responsive touch (was 15)
    touchEventForce: 0,         // LOWER: less force needed (was 100)
    disableFlipByClick: false,   // Allow clicking to flip
    direction: props.rtl ? 2 : 1,
    pageMargin: 12
  });



  /* if (props.rtl && props.pages.length > 0) {
    setTimeout(() => {
      try {
        flip.turnToPage(0);
        setTimeout(() => {
          const rtlPageIndex = props.pages.length - 1 - props.currentPage;
          flip.turnToPage(rtlPageIndex);
        }, 100);
      } catch (err) {
        console.error("Error handling last page:", err);
      }
    }, 500);
  } */



  try {
    // Load pages (they're already in the right order based on RTL/LTR)
    flip.loadFromHTML(document.querySelectorAll('.stpage'));
    
    // Go to correct page
    if (props.rtl) {
      // For RTL, convert the current page to the reversed index
      const rtlPageIndex = props.pages.length - 1 - props.currentPage;
      flip.turnToPage(rtlPageIndex);
    } else {
      flip.turnToPage(props.currentPage);
    }
    
    // Handle page flip events
    flip.on('flip', (e) => {
      try {
        // Convert page index back based on RTL/LTR
        const actualPage = props.rtl 
          ? props.pages.length - 1 - e.data  // Convert from RTL index
          : e.data;                           // Use as-is for LTR
          
        if (actualPage !== props.currentPage) {
          emit('update:currentPage', actualPage);
        }
      } catch (err) {
        console.error("Error in flip event:", err);
      }
    });
  } catch (err) {
    console.error("Error initializing PageFlip:", err);
  }
});

// Add this right after your PageFlip initialization
// Make sure to update book size when window resizes
const updateBookSize = () => {
  const container = flipbookEl.value;
  if (!flip || !container) return;
  
  const newWidth = container.clientWidth * 0.5; // Always use HALF width
  const newHeight = container.clientHeight;     // Use FULL height
  
  flip.updateSize(newWidth, newHeight);
};

// Listen for resize events
window.addEventListener('resize', updateBookSize);

// Clean up listener
onUnmounted(() => {
  window.removeEventListener('resize', updateBookSize);
});

// Watch for external page changes
watch(() => props.currentPage, (newPage) => {
  if (!flip) return;
  
  try {
    if (props.rtl) {
      // Convert to RTL page index
      const rtlPageIndex = props.pages.length - 1 - newPage;
      if (flip.getCurrentPageIndex() !== rtlPageIndex) {
        flip.turnToPage(rtlPageIndex);
      }
    } else {
      if (flip.getCurrentPageIndex() !== newPage) {
        flip.turnToPage(newPage);
      }
    }
  } catch (err) {
    console.error("Error turning page:", err);
  }
}, { immediate: false });
</script>

<template>
  <div class="w-full max-w-8xl mx-auto aspect-[4/3] h-auto relative">
    <div ref="flipbookEl" class="absolute inset-0 w-full h-full touch-manipulation">
      <div class="stpage w-full h-full" v-for="(page, i) in (props.rtl ? [...props.pages].reverse() : props.pages)" :key="`page-${i}`">
        <img 
          :src="page.image_url" 
          class="w-full h-full object-cover"
          :alt="`Page ${i + 1}`"
        />
        <img 
          v-if="page.overlay_url" 
          :src="page.overlay_url" 
          class="absolute inset-0 w-full h-full object-cover"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Force library containers to take full size */
:deep(.stf__parent),
:deep(.stf__wrapper) {
  width: 100% !important;
  height: 100% !important;
  background: transparent !important;
}


/* Your existing styles for page appearance */
:deep(.stf__item) {
  border-radius: 1px !important;
  box-shadow: 0 0 40px rgba(0, 0, 0, 0.5) !important;
}


:deep(.stf__shadow) {
  opacity: .3 !important;
}

:deep(.stpage) {
  box-shadow: 0 0 5px rgba(255, 61, 61, 0.5);
  background: #ffffff;
  height: 100% !important; /* ADDED: Force full height */
}

/* Fix potential internal wrapper heights */
:deep(.stf__block) * {
  height: 100% !important; /* ADDED: Force ALL children to use full height */
}

.flipbook-container {
  touch-action: pan-y; /* Only allow vertical scrolling, prevent horizontal browser gestures */
}

:deep(.stpage img) {
  object-fit: cover !important;
}

:deep(.stpage img) {
  object-fit: contain !important; /* Show the whole image, no cropping */
  width: 100% !important;
  height: 100% !important;
  background: #fff;
  box-shadow: none !important;    /* Remove border/shadow if you want */
  border: none !important;
}

.touch-manipulation {
  touch-action: manipulation; /* Better touch behavior */
}


/* Control the gap between pages (spread) */
:deep(.stf__item) {
  margin-right: 120px !important; /* Adjust this value for more/less gap */
}

/* For RTL, you may want margin-left instead */
:deep([dir="rtl"] .stf__item) {
  margin-left: 12px !important;
  margin-right: 0 !important;
}


</style>
