<template>
  <div class="w-full max-w-screen relative" ref="flipbookContainer">
    <!-- Top Control Bar -->
    <div class="bg-gray-800 text-white p-2 rounded-t-lg flex justify-between items-center">
      <!-- Left side controls -->
      <div class="flex items-center gap-2">
        <button @click="toggleViewMode" class="px-3 py-1 bg-gray-700 rounded hover:bg-gray-600">
          <span v-if="viewMode === 'sweep'">
            <Icon name="mdi:book-open-variant" class="mr-1" />Switch to Book
          </span>
          <span v-else>
            <Icon name="mdi:gesture-swipe-vertical" class="mr-1" />Switch to Sweep
          </span>
        </button>
        
        <span class="text-sm px-2">{{ currentPage + 1 }} / {{ filteredPages.length }}</span>
      </div>
      
      <!-- Right side controls -->
      <div class="flex items-center gap-2">
        <!-- Fullscreen toggle button -->
        <button @click="toggleFullscreen" class="px-3 py-1 bg-gray-700 rounded hover:bg-gray-600">
          <Icon :name="isFullscreen ? 'mdi:fullscreen-exit' : 'mdi:fullscreen'" class="mr-1" />
          {{ isFullscreen ? 'Exit Full' : 'Full Screen' }}
        </button>
        
        <!-- Reading direction indicator -->
        <div class="px-3 py-1 bg-gray-700 rounded">
          <span v-if="isRTL">
            <Icon name="mdi:format-horizontal-align-right" class="mr-1" />
            RTL Mode
          </span>
          <span v-else>
            <Icon name="mdi:format-horizontal-align-left" class="mr-1" />
            LTR Mode
          </span>
        </div>
        
        <!-- Language selector -->
        <select 
          v-model="selectedLanguage" 
          @change="changeLanguage"
          class="bg-gray-700 rounded px-2 py-1 text-sm"
        >
          <option v-for="lang in availableLanguages" :key="lang" :value="lang">
            {{ lang.toUpperCase() }}
          </option>
        </select>
      </div>
    </div>
    
    <!-- Thumbnail Navigation -->
    <div 
      class="absolute left-0 right-0 z-10 bg-gray-200/95 p-2 border-t-2 border-gray-400 shadow-lg transition-all duration-300"
      :class="showThumbnails ? 'bottom-[44px]' : '-bottom-[150px]'"
      v-show="showThumbnails"
    >
      <div 
        class="flex overflow-x-auto gap-2 pb-2" 
        :class="{'flex-row-reverse': isRTL}"
        ref="thumbnailContainer"
      >
        <!-- Group thumbnails in pairs for flipbook mode, keep covers alone -->
        <template v-for="(page, index) in filteredPages" :key="index">
          <!-- For cover pages (first and last) or in sweep mode, show single thumbnail -->
          <div 
            v-if="isSpecialPage(index) || viewMode === 'sweep' || index % 2 !== (isRTL ? 0 : 1)"
            @click.stop="goToPage(index)"
            class="min-w-[60px] cursor-pointer rounded overflow-hidden"
            :class="{ 'ring-2 ring-blue-500': currentPage === index }"
          >
            <img :src="page.image_url" class="w-full h-auto object-contain" />
            <div class="text-xs text-center bg-gray-800 text-white">{{ index + 1 }}</div>
          </div>
          
          <!-- For non-cover pages in flipbook mode, show double-spread thumbnails -->
          <div 
            v-if="viewMode === 'book' && !isSpecialPage(index) && !isSpecialPage(index-1) && !isSpecialPage(index+1) && index % 2 === (isRTL ? 0 : 1) && index < filteredPages.length - 1"
            @click.stop="goToPage(index)"
            class="min-w-[120px] cursor-pointer rounded overflow-hidden flex"
            :class="{ 'ring-2 ring-blue-500': currentPage === index || currentPage === index + (isRTL ? -1 : 1) }"
          >
            <!-- Left page of spread -->
            <div class="w-1/2">
              <img 
                :src="filteredPages[isRTL ? index + 1 : index - 1]?.image_url" 
                class="w-full h-auto object-contain" 
                v-if="(isRTL ? index + 1 : index - 1) >= 0 && (isRTL ? index + 1 : index - 1) < filteredPages.length"
              />
              <div class="text-xs text-center bg-gray-800 text-white">{{ (isRTL ? index + 1 : index - 1) + 1 }}</div>
            </div>
            <!-- Right page of spread -->
            <div class="w-1/2">
              <img :src="page.image_url" class="w-full h-auto object-contain" />
              <div class="text-xs text-center bg-gray-800 text-white">{{ index + 1 }}</div>
            </div>
          </div>
        </template>
      </div>
    </div>
    
    <!-- Main Content Area -->
    <div 
      class="relative bg-gray-900 overflow-hidden p-2 focus:outline-none"
      :class="{'h-[calc(85vh-4px)]': !isFullscreen, 'h-[calc(100vh-120px)]': isFullscreen}"
      @touchstart="handleTouchStart"
      @touchmove="handleTouchMove"
      @touchend="handleTouchEnd"
      @keydown.left="handleLeftArrow"
      @keydown.right="handleRightArrow"
      @keydown.up="handleUpArrow"
      @keydown.down="handleDownArrow"
      @click="closeThumbnailsOnClick"
      tabindex="0"
      ref="viewerContainer"
    >
      <!-- Sweep Mode (Vertical Scrolling) -->
      <div v-if="viewMode === 'sweep'" class="h-full overflow-y-auto snap-y snap-mandatory">
        <div
          v-for="(page, index) in filteredPages"
          :key="index"
          class="h-full flex flex-col items-center justify-center snap-start"
          :class="{ 'hidden': index !== currentPage }"
        >
          <div class="relative h-full w-full flex items-center justify-center">
            <!-- Base image -->
            <img
              v-if="page.image_url"
              :src="page.image_url"
              :alt="`Page ${index + 1}`"
              class="max-h-full max-w-full object-contain"
            />
            
            <!-- Text overlay -->
            <img
              v-if="page.overlay_url"
              :src="page.overlay_url"
              :alt="`Page ${index + 1} text`"
              class="absolute top-0 left-0 w-full h-full object-contain"
            />
          </div>
        </div>
      </div>
      
      <!-- Book Mode -->
      <div v-else class="h-full flex items-center justify-center">
        <!-- Book spread with proper page handling -->
        <div class="h-full flex items-center justify-center" :class="{'flex-row-reverse': !isRTL}">
          <!-- Special case for covers that should be alone -->
          <template v-if="isSpecialPage(currentPage)">
            <!-- Only show current page (no secondary page) -->
            <div class="relative h-full w-full">
              <img
                v-if="getCurrentPage()"
                :src="getCurrentPage()?.image_url"
                :alt="`Page ${currentPage + 1}`"
                class="max-h-full w-full object-contain"
              />
              <img
                v-if="getCurrentPage()?.overlay_url"
                :src="getCurrentPage().overlay_url"
                class="absolute top-0 left-0 w-full h-full object-contain"
              />
            </div>
          </template>
          
          <!-- Regular spread display for normal pages -->
          <template v-else>
            <!-- Left/Right Page (secondary page) -->
            <div 
              v-if="isDesktop && getSecondaryPage()"
              class="relative h-full"
              :class="isDesktop ? 'w-1/2' : 'w-full'"
            >
              <img
                :src="getSecondaryPage()?.image_url"
                :alt="`Page ${getSecondaryPageIndex() + 1}`"
                class="max-h-full w-full object-contain"
              />
              <img
                v-if="getSecondaryPage()?.overlay_url"
                :src="getSecondaryPage().overlay_url"
                class="absolute top-0 left-0 w-full h-full object-contain"
              />
            </div>
            
            <!-- Right/Left Page (current page) -->
            <div 
              class="relative h-full" 
              :class="isDesktop && getSecondaryPage() ? 'w-1/2' : 'w-full'"
            >
              <img
                v-if="getCurrentPage()"
                :src="getCurrentPage()?.image_url"
                :alt="`Page ${currentPage + 1}`"
                class="max-h-full w-full object-contain"
              />
              <img
                v-if="getCurrentPage()?.overlay_url"
                :src="getCurrentPage().overlay_url"
                class="absolute top-0 left-0 w-full h-full object-contain"
              />
            </div>
          </template>
        </div>
        
        <!-- Navigation arrows -->
        <button 
          @click="moveBack" 
          class="absolute bg-black/50 text-white p-2 rounded-full hover:bg-black/70"
          :class="isRTL ? 'left-2' : 'right-2'"
          v-if="canMoveBack"
        >
          <Icon :name="isRTL ? 'mdi:chevron-left' : 'mdi:chevron-right'" size="24" />
        </button>
        
        <button 
          @click="moveForward" 
          class="absolute bg-black/50 text-white p-2 rounded-full hover:bg-black/70"
          :class="isRTL ? 'right-2' : 'left-2'"
          v-if="canMoveForward"
        >
          <Icon :name="isRTL ? 'mdi:chevron-right' : 'mdi:chevron-left'" size="24" />
        </button>
      </div>
    </div>
    
    <!-- Bottom Navigation Bar -->
    <div class="bg-gray-800 text-white p-2 rounded-b-lg flex justify-between items-center">
      <button @click="toggleThumbnails" class="px-3 py-1 bg-gray-700 rounded hover:bg-gray-600">
        <Icon name="mdi:image-multiple" class="mr-1" />{{ showThumbnails ? 'Hide' : 'Show' }} Thumbnails
      </button>
      
      <div class="flex gap-2">
        <button 
          @click="moveBack" 
          class="px-3 py-1 bg-gray-700 rounded hover:bg-gray-600 disabled:opacity-50" 
          :disabled="!canMoveBack"
        >
          {{ isRTL ? 'Next' : 'Previous' }}
        </button>
        <button 
          @click="moveForward" 
          class="px-3 py-1 bg-gray-700 rounded hover:bg-gray-600 disabled:opacity-50"
          :disabled="!canMoveForward"
        >
          {{ isRTL ? 'Previous' : 'Next' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue';
import { useRouter, useRoute } from 'vue-router';

const props = defineProps({
  product: Object,
  rtl: {
    type: Boolean,
    default: true
  }
});

const router = useRouter();
const route = useRoute();

// State
const currentPage = ref(0);
const showThumbnails = ref(false);
const viewMode = ref('book'); // 'book' or 'sweep'
const isRTL = ref(props.rtl); // Default to RTL for Arabic/Japanese
const isDesktop = ref(window.innerWidth >= 768);
const touchStartY = ref(0);
const touchStartX = ref(0);
const viewerContainer = ref(null);
const selectedLanguage = ref(route.query.lang || 'en');
const isFullscreen = ref(false);
const flipbookContainer = ref(null);
const thumbnailContainer = ref(null);

// Available languages
const availableLanguages = ref(['en', 'fr', 'jp']);

// Filter pages based on the current view mode
const filteredPages = computed(() => {
  if (!props.product?.pages) return [];
  
  return props.product.pages.filter(page => {
    // If page doesn't specify visibility, include it in both modes
    if (!page.visible_if) return true;
    
    // For flipbook mode, include pages with 'flipbook' visibility
    if (viewMode.value === 'book' && page.visible_if.includes('flipbook')) return true;
    
    // For sweep mode, include pages with 'sweepbook' visibility
    if (viewMode.value === 'sweep' && page.visible_if.includes('sweepbook')) return true;
    
    // Otherwise, exclude the page
    return false;
  });
});

// Check if current page is a special page that should be displayed alone
const isSpecialPage = (index) => {
  const page = filteredPages.value[index];
  if (!page) return false;
  
  // Front recto or back verso cover in flipbook mode should be alone
  return (
    page.type === 'volume_cover' &&
    (page.position === 'front_recto' || page.position === 'back_verso') &&
    page.visible_if === 'flipbook'
  );
};

// Determine page movement calculations based on special page status
const getPageStep = (currentPageIndex, direction) => {
  // Default step size is 1
  let step = 1;
  
  // If in book mode on desktop, increase step to 2 for regular pages
  if (viewMode.value === 'book' && isDesktop.value && !isSpecialPage(currentPageIndex)) {
    step = 2;
  }
  
  // If moving forward from a special page or to a special page, adjust step
  const targetIndex = currentPageIndex + (direction * step);
  
  // Special case: fix the navigation from cover to page 2
  if (isSpecialPage(currentPageIndex) && direction > 0) {
    // Always go to page 2 (index 1) when navigating forward from a cover
    return 1 - currentPageIndex;
  }
  
  // Check if destination is a special page when coming from a non-special page
  if (!isSpecialPage(currentPageIndex) && isSpecialPage(targetIndex) && step > 1) {
    // Reduce step to land directly on the special page
    step -= 1;
  }
  
  // Check if moving from a special page to a regular page
  if (isSpecialPage(currentPageIndex) && !isSpecialPage(targetIndex) && step === 1 && isDesktop.value) {
    // Increase step to land on the proper page in the spread
    step += 1;
  }
  
  return step * direction;
};

// Computed properties
const totalPages = computed(() => filteredPages.value.length || 0);

// Navigation availability
const canMoveBack = computed(() => {
  return isRTL.value 
    ? currentPage.value < totalPages.value - 1  // In RTL, "back" means going toward the end
    : currentPage.value > 0;                    // In LTR, "back" means going toward the start
});

const canMoveForward = computed(() => {
  return isRTL.value 
    ? currentPage.value > 0                     // In RTL, "forward" means going toward the start
    : currentPage.value < totalPages.value - 1; // In LTR, "forward" means going toward the end
});

// Methods
const toggleViewMode = () => {
  viewMode.value = viewMode.value === 'sweep' ? 'book' : 'sweep';
  // Reset to first page when toggling view modes
  currentPage.value = 0;
};

const toggleThumbnails = () => {
  showThumbnails.value = !showThumbnails.value;
  if (showThumbnails.value) {
    nextTick(() => {
      scrollThumbnailIntoView();
    });
  }
};

const toggleFullscreen = async () => {
  try {
    if (!isFullscreen.value) {
      if (flipbookContainer.value.requestFullscreen) {
        await flipbookContainer.value.requestFullscreen();
      } else if (flipbookContainer.value.webkitRequestFullscreen) {
        await flipbookContainer.value.webkitRequestFullscreen();
      } else if (flipbookContainer.value.msRequestFullscreen) {
        await flipbookContainer.value.msRequestFullscreen();
      }
      isFullscreen.value = true;
    } else {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        await document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        await document.msExitFullscreen();
      }
      isFullscreen.value = false;
    }
  } catch (err) {
    console.error('Fullscreen error:', err);
  }
};

const goToPage = (pageNumber) => {
  if (pageNumber >= 0 && pageNumber < totalPages.value) {
    currentPage.value = pageNumber;
    // Return focus to viewer container after clicking thumbnails
    nextTick(() => {
      ensureViewerFocus();
      if (showThumbnails.value) {
        scrollThumbnailIntoView();
      }
    });
  }
};

// Simplified thumbnail scrolling function
const scrollThumbnailIntoView = () => {
  if (!showThumbnails.value || !thumbnailContainer.value) return;
  
  // Wait for DOM update to ensure the element is properly rendered
  nextTick(() => {
    // Get all thumbnails and find the current one
    const thumbnailElements = document.querySelectorAll('.min-w-\\[60px\\].cursor-pointer');
    if (thumbnailElements.length > currentPage.value) {
      const currentThumbnail = thumbnailElements[currentPage.value];
      
      // Use the built-in scrollIntoView with behavior and alignment options
      currentThumbnail.scrollIntoView({
        behavior: 'smooth',
        // Center the element horizontally
        block: 'nearest',
        inline: 'center'
      });
    }
  });
};

// Get secondary page index based on reading direction and special page rules
const getSecondaryPageIndex = () => {
  if (isSpecialPage(currentPage.value)) {
    return -1; // No secondary page for special pages
  }
  
  if (isRTL.value) {
    // In RTL, the secondary page is the one after the current page (higher index)
    return currentPage.value + 1;
  } else {
    // In LTR, the secondary page is the one before the current page (lower index)
    return currentPage.value - 1;
  }
};

// Get pages for the book spread
const getCurrentPage = () => {
  return filteredPages.value[currentPage.value];
};

const getSecondaryPage = () => {
  // If this is a special page, don't show a secondary page
  if (isSpecialPage(currentPage.value)) {
    return null;
  }
  
  const index = getSecondaryPageIndex();
  if (index >= 0 && index < totalPages.value) {
    return filteredPages.value[index];
  }
  return null;
};

// Navigation methods with special page handling
const moveBack = () => {
  if (isRTL.value) {
    // In RTL, "back" means next page (higher index)
    const step = getPageStep(currentPage.value, 1);
    goToPage(Math.min(currentPage.value + step, totalPages.value - 1));
  } else {
    // In LTR, "back" means previous page (lower index)
    const step = getPageStep(currentPage.value, -1);
    goToPage(Math.max(currentPage.value + step, 0));
  }
};

const moveForward = () => {
  if (isRTL.value) {
    // In RTL, "forward" means previous page (lower index)
    const step = getPageStep(currentPage.value, -1);
    goToPage(Math.max(currentPage.value + step, 0));
  } else {
    // In RTL, "forward" means next page (higher index)
    const step = getPageStep(currentPage.value, 1);
    goToPage(Math.min(currentPage.value + step, totalPages.value - 1));
  }
};

// Handle keyboard navigation with improved focus handling
const handleLeftArrow = (event) => {
  // Prevent the event from affecting other elements
  event.preventDefault();
  
  // Left key always moves left regardless of RTL setting
  if (!isRTL.value) {
    moveForward(); // In LTR, moving left means going to previous page
  } else {
    moveBack(); // In RTL, moving left means going to next page
  }
};

const handleRightArrow = (event) => {
  // Prevent the event from affecting other elements
  event.preventDefault();
  
  // Right key always moves right regardless of RTL setting
  if (!isRTL.value) {
    moveBack(); // In LTR, moving right means going to next page
  } else {
    moveForward(); // In RTL, moving right means going to previous page
  }
};

// Up/down keys only work in sweep mode
const handleUpArrow = (event) => {
  // Prevent default scrolling behavior
  event.preventDefault();
  
  if (viewMode.value === 'sweep') {
    moveBack(); // Up arrow should go to previous page (up the document)
  }
};

const handleDownArrow = (event) => {
  // Prevent default scrolling behavior
  event.preventDefault();
  
  if (viewMode.value === 'sweep') {
    moveForward(); // Down arrow should go to next page (down the document)
  }
};

// Make sure viewer container has focus when needed
const ensureViewerFocus = () => {
  if (viewerContainer.value) {
    viewerContainer.value.focus();
  }
};

// Change language and update URL
const changeLanguage = () => {
  // Update the URL without page refresh
  router.push({
    query: { 
      ...route.query,
      lang: selectedLanguage.value 
    }
  });
};

// Touch handling for sweep and flipbook modes
const handleTouchStart = (e) => {
  touchStartY.value = e.touches[0].clientY;
  touchStartX.value = e.touches[0].clientX;
};

const handleTouchMove = (e) => {
  if (viewMode.value === 'sweep') {
    e.preventDefault();
  }
};

// Fixed touch handling for sweep mode in smartphones
const handleTouchEnd = (e) => {
  const touchEndY = e.changedTouches[0].clientY;
  const touchEndX = e.changedTouches[0].clientX;
  const diffY = touchEndY - touchStartY.value;
  const diffX = touchEndX - touchStartX.value;
  
  // Determine if horizontal or vertical swipe is more dominant
  if (Math.abs(diffY) > Math.abs(diffX)) {
    // Vertical swipe - only handle in sweep mode
    if (viewMode.value === 'sweep' && Math.abs(diffY) > 50) {
      if (diffY > 0) {
        // Swipe down - natural scrolling direction
        moveForward(); // Go to next page (down the document)
      } else {
        // Swipe up - natural scrolling direction
        moveBack(); // Go to previous page (up the document)
      }
    }
  } else {
    // Horizontal swipe
    if (Math.abs(diffX) > 50) {
      if (diffX > 0) {
        // Swipe right
        handleRightArrow(new Event('keydown'));
      } else {
        // Swipe left
        handleLeftArrow(new Event('keydown'));
      }
    }
  }
};

// Fullscreen change handler
const handleFullscreenChange = () => {
  isFullscreen.value = !!(
    document.fullscreenElement ||
    document.webkitFullscreenElement ||
    document.mozFullScreenElement ||
    document.msFullscreenElement
  );
};

// Window resize handler
const handleResize = () => {
  isDesktop.value = window.innerWidth >= 768;
};

// Lifecycle hooks
onMounted(() => {
  window.addEventListener('resize', handleResize);
  document.addEventListener('fullscreenchange', handleFullscreenChange);
  document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
  document.addEventListener('mozfullscreenchange', handleFullscreenChange);
  document.addEventListener('MSFullscreenChange', handleFullscreenChange);
  
  // Ensure viewer has focus initially
  nextTick(() => {
    ensureViewerFocus();
  });
  
  // Add focus to viewer after toggling view mode
  watch(viewMode, () => {
    nextTick(() => {
      ensureViewerFocus();
    });
  });

  // Ensure focus returns to viewer after any navigation
  watch(currentPage, () => {
    nextTick(() => {
      ensureViewerFocus();
      if (showThumbnails.value) {
        scrollThumbnailIntoView();
      }
    });
  });
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  document.removeEventListener('fullscreenchange', handleFullscreenChange);
  document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
  document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
  document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
  
  if (isFullscreen.value) {
    document.exitFullscreen?.() || document.webkitExitFullscreen?.() || document.msExitFullscreen?.();
  }
});
</script>

<style scoped>
/* Snap scrolling - no direct Tailwind equivalent */
.snap-y {
  scroll-snap-type: y mandatory;
}

.snap-start {
  scroll-snap-align: start;
}

/* Remove focus outline - already using focus:outline-none in template */

/* Hide scrollbar in viewer */
.viewer-container::-webkit-scrollbar {
  width: 0px;
}

/* Thumbnail scrollbar styling */
.overflow-x-auto::-webkit-scrollbar {
  height: 6px;
}

.overflow-x-auto::-webkit-scrollbar-thumb {
  background-color: rgba(107, 114, 128, 0.5);
  border-radius: 3px;
}

.overflow-x-auto::-webkit-scrollbar-track {
  background-color: rgba(229, 231, 235, 0.5);
}

/* These can be removed - already handled by Tailwind classes in template */
/* .w-full { width: 100%; max-width: 100vw; position: relative; } */
/* .transition-all { transition: all 0.3s ease-in-out; } */
</style>