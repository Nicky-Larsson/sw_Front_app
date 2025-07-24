<template>
  <div class="w-full max-w-screen relative flex flex-col h-screen bg-gray-900" 
  ref="flipbookContainer"
  @contextmenu.prevent> <!-- Add this to prevent right-click menu -->
    <!-- Top Control Bar -->

    
    <!-- Thumbnail Navigation with CONSISTENT SPREADS -->
    <div 
      class="absolute left-0 right-0 z-10 bg-gray-200/30 backdrop-blur-sm p-2 border-t-2 border-gray-400 shadow-lg transition-all duration-300"
      :class="showThumbnails ? 'bottom-[44px]' : '-bottom-[150px]'"
      v-show="showThumbnails"
    >
      <div 
        class="flex overflow-x-auto gap-2 pb-2" 
        :class="{'flex-row-reverse': isRTL}"
        ref="thumbnailContainer"
      >
        <!-- BOOK MODE THUMBNAILS (SPREADS) -->
        <template v-if="viewMode === 'book'">
          <!-- Front cover -->
          <div v-if="filteredPages.length > 0" @click.stop="handleThumbnailClick(0, $event)" class="min-w-[60px] cursor-pointer rounded overflow-hidden hover:opacity-100 opacity-90" :class="{ 'ring-4 ring-blue-500': currentPage === 0 }" data-page-indices="0">
            <img :src="filteredPages[0].image_url" class="w-full h-auto object-contain" />
            <div class="text-xs text-center bg-gray-800 text-white">1</div>
          </div>
          <!-- Inner Spreads -->
          <template v-for="(_, i) in Array(Math.floor((filteredPages.length - 2) / 2))" :key="i">
            <div @click.stop="handleThumbnailClick(i*2+1, $event)" class="min-w-[120px] cursor-pointer rounded overflow-hidden flex hover:opacity-100 opacity-90 border border-gray-500" :class="{ 'ring-4 ring-blue-500': (currentPage === i*2+1 || currentPage === i*2+2) }" :data-page-indices="`${i*2+1},${i*2+2}`">
              <div class="w-1/2"><img v-if="filteredPages[i*2+2]" :src="filteredPages[i*2+2].image_url" class="w-full h-auto object-contain" /><div v-if="filteredPages[i*2+2]" class="text-xs text-center bg-gray-800 text-white">{{ i*2+3 }}</div></div>
              <div class="w-1/2"><img v-if="filteredPages[i*2+1]" :src="filteredPages[i*2+1].image_url" class="w-full h-auto object-contain" /><div v-if="filteredPages[i*2+1]" class="text-xs text-center bg-gray-800 text-white">{{ i*2+2 }}</div></div>
            </div>
          </template>
          <!-- Back cover -->
          <div v-if="filteredPages.length > 1" @click.stop="handleThumbnailClick(filteredPages.length - 1, $event)" class="min-w-[60px] cursor-pointer rounded overflow-hidden hover:opacity-100 opacity-90" :class="{ 'ring-4 ring-blue-500': currentPage === filteredPages.length - 1 }" :data-page-indices="filteredPages.length - 1">
            <img :src="filteredPages[filteredPages.length - 1].image_url" class="w-full h-auto object-contain" />
            <div class="text-xs text-center bg-gray-800 text-white">{{ filteredPages.length }}</div>
          </div>
        </template>

        <!-- SWEEP MODE THUMBNAILS (SINGLE PAGES) -->
        <template v-else>
          <div 
            v-for="(page, index) in filteredPages" :key="`sweep-${index}`"
            @click.stop="handleThumbnailClick(index, $event)"
            class="min-w-[60px] cursor-pointer rounded overflow-hidden hover:opacity-100 opacity-90"
            :class="{ 'ring-2 ring-blue-500': currentPage === index }"
            :data-page-indices="`${index}`"
          >
            <img :src="page.image_url" class="w-full h-auto object-contain" />
            <div class="text-xs text-center bg-gray-800 text-white">{{ index + 1 }}</div>
          </div>
        </template>
      </div>
    </div>
    
    <!-- Main Content Area -->
    <div 
      class="relative overflow-hidden p-2 focus:outline-none flex-grow"
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
        <div class="h-full flex items-center justify-center" :class="{'flex-row-reverse': isRTL}">
          <!-- Display pages using the new deterministic computed properties -->
          
          <!-- LEFT PAGE OF SPREAD -->
          <div 
            class="relative h-full"
            :class="isDesktop && rightPageOfSpread ? 'w-1/2' : 'w-full'"
          >
            <img
              v-if="leftPageOfSpread"
              :src="leftPageOfSpread.image_url"
              :alt="`Left Page`"
              class="max-h-full w-full object-contain"
            />
            <img
              v-if="leftPageOfSpread?.overlay_url"
              :src="leftPageOfSpread.overlay_url"
              class="absolute top-0 left-0 w-full h-full object-contain"
            />
          </div>

          <!-- RIGHT PAGE OF SPREAD -->
          <div 
            v-if="isDesktop && rightPageOfSpread"
            class="relative h-full w-1/2"
          >
            <img
              :src="rightPageOfSpread.image_url"
              :alt="`Right Page`"
              class="max-h-full w-full object-contain"
            />
            <img
              v-if="rightPageOfSpread.overlay_url"
              :src="rightPageOfSpread.overlay_url"
              class="absolute top-0 left-0 w-full h-full object-contain"
            />
          </div>
        </div>
        
        <!-- Navigation arrows -->
        <div 
          @click.stop="moveBack" 
          class="absolute top-0 bottom-0 flex items-center justify-center w-16 hover:bg-black/10"
          :class="isRTL ? 'right-0' : 'left-0'"
          v-if="canMoveForward"
        >
          <div class="bg-black/50 text-white p-2 rounded-full hover:bg-black/70">
            <Icon :name="isRTL ? 'mdi:chevron-right' : 'mdi:chevron-left'" size="24" />
          </div>
        </div>
        
        <div 
          @click.stop="moveForward" 
          class="absolute top-0 bottom-0 flex items-center justify-center w-16 hover:bg-black/10"
          :class="isRTL ? 'left-0' : 'right-0'"
          v-if="canMoveBack"
        >
          <div class="bg-black/50 text-white p-2 rounded-full hover:bg-black/70">
            <Icon :name="isRTL ? 'mdi:chevron-left' : 'mdi:chevron-right'" size="24" />
          </div>
        </div>
      </div>
    </div>
    
    <!-- CORRECTED AND RE-ORGANIZED Bottom Navigation Bar -->
    <div class="bg-gray-800 text-white p-2 rounded-b-lg flex justify-between items-center flex-wrap gap-x-4 gap-y-2">
      <!-- Left Group: Navigation -->
      <div class="flex items-center gap-2">
        <button @click="toggleThumbnails" class="px-3 py-1 bg-gray-700 rounded hover:bg-gray-600 flex items-center" title="Show or hide thumbnails">
          <Icon name="mdi:image-multiple" class="mr-1" />{{ showThumbnails ? 'Hide Thumbnails' : 'Show Thumbnails' }}
        </button>
        <button @click="toggleViewMode" class="px-3 py-1 bg-gray-700 rounded hover:bg-gray-600 flex items-center" title="Switch between Book and Sweep mode">
          <Icon :name="viewMode === 'sweep' ? 'mdi:book-open-variant' : 'mdi:gesture-swipe-vertical'" class="mr-1" />
          {{ viewMode === 'sweep' ? 'Book Mode' : 'Sweep Mode' }}
        </button>
        
        <!-- Custom Language Dropdown -->
        <div class="relative">
          <button @click.stop="showLanguageMenu = !showLanguageMenu" class="bg-gray-700 rounded px-3 py-1 text-sm flex items-center hover:bg-gray-600 w-36 justify-between" title="Change language">
            <div class="flex items-center">
              <img :src="languageDetails[selectedLanguage]?.image" class="w-5 h-auto mr-2 rounded-sm" />
              <span>{{ languageDetails[selectedLanguage]?.name }}</span>
            </div>
            <Icon name="mdi:chevron-up" v-if="!showLanguageMenu" />
            <Icon name="mdi:chevron-down" v-else />
          </button>
          <div v-if="showLanguageMenu" class="absolute bottom-full mb-2 w-full bg-gray-600 rounded shadow-lg z-20 border border-gray-500">
            <ul>
              <li v-for="lang in availableLanguages.filter(l => l !== selectedLanguage)" :key="lang" @click="selectLanguage(lang)" class="px-3 py-2 hover:bg-gray-500 cursor-pointer flex items-center">
                <img :src="languageDetails[lang]?.image" class="w-5 h-auto mr-2 rounded-sm" />
                <span>{{ languageDetails[lang]?.name }}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Right Group: Tools & Settings -->
      <div class="flex items-center gap-2 flex-wrap justify-end">


        <button @click="toggleFullscreen" class="px-3 py-1 bg-gray-700 rounded hover:bg-gray-600 flex items-center" title="Toggle fullscreen">
          <Icon :name="isFullscreen ? 'mdi:fullscreen-exit' : 'mdi:fullscreen'" class="mr-1" />
          {{ isFullscreen ? 'Exit Fullscreen' : 'Fullscreen' }}
        </button>
        


        <button 
          @click="moveForward" 
          class="px-3 py-1 bg-gray-700 rounded hover:bg-gray-600 disabled:opacity-50 flex items-center" 
          :disabled="!canMoveBack"
          title="Go to previous page"
        >
          <Icon name="mdi:chevron-left" size="18" /> Next 
        </button>
        <span class="text-sm px-2 font-mono" title="Current page">{{ currentPage + 1 }} / {{ totalPages }}</span>
        <button 
          @click="moveBack" 
          class="px-3 py-1 bg-gray-700 rounded hover:bg-gray-600 disabled:opacity-50 flex items-center"
          :disabled="!canMoveForward"
          title="Go to next page"
        >
         Previous <Icon name="mdi:chevron-right" size="18" />
        </button>

        <div class="px-2 py-1 bg-gray-700 rounded text-sm flex items-center" title="Current reading direction">
          <Icon :name="isRTL ? 'mdi:format-horizontal-align-left' : 'mdi:format-horizontal-align-right'" class="mr-1" />
          {{ isRTL ? 'RTL' : 'LTR' }}
        </div>
      </div>
    </div>

    <!-- Fullscreen Close Button (only shows in fullscreen mode) -->
    <button 
      v-if="isFullscreen" 
      @click="toggleFullscreen"
      class="absolute top-2 right-2 z-50 bg-black/70 text-white p-2 rounded-full hover:bg-black/90"
    >
      <Icon name="mdi:close" size="24" />
    </button>

    <!-- <div class="fixed bottom-0 right-0 z-50 w-full md:w-1/2 lg:w-1/3" style="max-height: 70vh;">
      <div class="bg-gray-800 text-white p-2 rounded-t-lg flex justify-between items-center cursor-pointer"
          @click="showDebugPanel = !showDebugPanel">
        <div class="flex items-center gap-2">
          <Icon name="mdi:code-json" class="text-yellow-400" />
          <span>filteredPages Data</span>
        </div>
        <Icon :name="showDebugPanel ? 'mdi:chevron-down' : 'mdi:chevron-up'" />
      </div>
      
      <div v-if="showDebugPanel" class="bg-gray-900 border border-gray-700 p-2 overflow-auto" style="max-height: 60vh;">
        <pre class="text-xs whitespace-pre-wrap" v-html="formatJsonColored(filteredPages)"></pre>
      </div>
    </div> -->

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
const showDebugPanel = ref(false);
const showLanguageMenu = ref(false); // ADD THIS: To control the new dropdown

// CORRECTED: Object to hold language details with image paths
const languageDetails = {
  en: { name: 'English', image: '/flags/en_flag.jpg' },
  fr: { name: 'Français', image: '/flags/fr_flag.jpg' },
  ar: { name: 'العربية', image: '/flags/ar_flag.jpg' },
  ma: { name: 'الدارجة', image: '/flags/ma_flag.jpg' }
};

// CORRECTED: Available languages to match LeftMenu
const availableLanguages = ref(['en', 'fr', 'ar', 'ma']);

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
  
  // Only front_recto and back_recto should be displayed alone
  // OR the first and last pages (regardless of their metadata)
  return (
    (page.type === 'volume_cover' && 
     (page.position === 'front_recto' || page.position === 'back_recto')) ||
    index === 0 // First page is always special (front cover)
    || index === totalPages.value - 1 // Last page is always special (back cover)
  );
};


// Close thumbnails when clicking on the page content
const closeThumbnailsOnClick = () => {
  showThumbnails.value = false;
};

const getPageStep = (currentPageIndex, direction) => {
  // Special case: when moving forward from cover (page 0)
  if (currentPageIndex === 0 && direction > 0) {
    return 1; // Always go to page 1 (index) from cover
  }
  
  // Default step size
  return 1 * direction;
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
  // Remember current page content before switching modes
  const currentPageContent = filteredPages.value[currentPage.value];
  const currentImageUrl = currentPageContent?.image_url;
  
  // If we're in book mode, also remember the secondary page
  let secondaryImageUrl = null;
  if (viewMode.value === 'book') {
    const secondaryPage = getSecondaryPage();
    secondaryImageUrl = secondaryPage?.image_url;
  }
  
  // Toggle the view mode
  viewMode.value = viewMode.value === 'sweep' ? 'book' : 'sweep';
  
  // After switching, find the corresponding page in the new filtered list
  nextTick(() => {
    // First try to find an exact match for the current page's image
    let newIndex = filteredPages.value.findIndex(p => p.image_url === currentImageUrl);
    
    // If no match and we had a secondary page in book mode, try that one
    if (newIndex === -1 && secondaryImageUrl) {
      newIndex = filteredPages.value.findIndex(p => p.image_url === secondaryImageUrl);
    }
    
    // If we found a matching page, set it as current
    if (newIndex !== -1) {
      currentPage.value = newIndex;
    } else {
      // If no match was found, just keep the current index if it's valid
      if (currentPage.value >= filteredPages.value.length) {
        currentPage.value = 0; // Reset if out of bounds
      }
    }
    
    ensureViewerFocus();
  });
};

const toggleThumbnails = () => {
  showThumbnails.value = !showThumbnails.value;
  
  if (showThumbnails.value) {
    nextTick(() => {
      scrollThumbnailIntoView();
      ensureViewerFocus();
    });
  } else {
    ensureViewerFocus();
  }
};

const toggleFullscreen = async () => {
  try {
    if (!isFullscreen.value) {
      if (flipbookContainer.value.requestFullscreen) await flipbookContainer.value.requestFullscreen();
      else if (flipbookContainer.value.webkitRequestFullscreen) await flipbookContainer.value.webkitRequestFullscreen();
      else if (flipbookContainer.value.msRequestFullscreen) await flipbookContainer.value.msRequestFullscreen();
    } else {
      if (document.exitFullscreen) await document.exitFullscreen();
      else if (document.webkitExitFullscreen) await document.webkitExitFullscreen();
      else if (document.msExitFullscreen) await document.msExitFullscreen();
    }
  } catch (err) {
    console.error('Fullscreen error:', err);
  }
  ensureViewerFocus();
};

// CORRECTED NAVIGATION LOGIC
/* const moveBack = () => {
  if (!canMoveBack.value) return;
  isRTL.value ? handleLeftArrow() : handleRightArrow();
  ensureViewerFocus();
};

const moveForward = () => {
  if (!canMoveForward.value) return;
  isRTL.value ? handleRightArrow() : handleLeftArrow();
  ensureViewerFocus();
}; */

// Simplified navigation methods 
const moveBack = () => {
  if (isRTL.value) {
    handleRightArrow(); // In RTL, back button calls right arrow handler
  } else {
    handleLeftArrow(); // In LTR, back button calls left arrow handler
  }
};

const moveForward = () => {
  if (isRTL.value) {
    handleLeftArrow(); // In RTL, forward button calls left arrow handler
  } else {
    handleRightArrow(); // In LTR, forward button calls right arrow handler
  }
};


const changeLanguage = () => {
  router.push({ query: { ...route.query, lang: selectedLanguage.value } });
  ensureViewerFocus();
};

// ADD THIS FUNCTION: To handle language selection from the new dropdown
const selectLanguage = (lang) => {
  selectedLanguage.value = lang;
  showLanguageMenu.value = false; // Close menu after selection
  changeLanguage(); // Update route and focus
};

const isFromClick = ref(false);

// CORRECTED: goToPage function
const goToPage = (pageNumber, isClick = false) => {
  if (pageNumber >= 0 && pageNumber < totalPages.value) {
    // Set the flag to indicate the source of the navigation.
    isFromClick.value = isClick;
    currentPage.value = pageNumber;
  }
};

// REVISED: Restores edge-scrolling logic with selection
const handleThumbnailClick = (pageNumber, event) => {
  const container = thumbnailContainer.value;
  if (!container || !event.currentTarget) {
    goToPage(pageNumber, true); // Fallback
    ensureViewerFocus(); // Add focus on fallback
    return;
  }

  const allThumbs = Array.from(container.children);
  const clickedElement = event.currentTarget;

  // Find which thumbnails are currently visible inside the container
  const containerRect = container.getBoundingClientRect();
  const visibleThumbs = allThumbs.filter(thumb => {
    const thumbRect = thumb.getBoundingClientRect();
    return thumbRect.left < containerRect.right && thumbRect.right > containerRect.left;
  });

  // If there are few enough thumbnails that all are effectively "edges", 
  // then any click should navigate and center.
  if (visibleThumbs.length <= 4) {
    goToPage(pageNumber, true);
    nextTick(() => {
      scrollThumbnailIntoView();
      ensureViewerFocus(); // Add focus here
    });
    return;
  }

  // Identify the two thumbnails at each edge
  const edgeThumbs = [
    visibleThumbs[0],
    visibleThumbs[1],
    visibleThumbs[visibleThumbs.length - 2],
    visibleThumbs[visibleThumbs.length - 1]
  ];

  // Check if the clicked thumbnail is one of the edge thumbnails
  if (edgeThumbs.includes(clickedElement)) {
    // It's an edge thumbnail: NAVIGATE and SCROLL to center it.
    goToPage(pageNumber, true);
    nextTick(() => {
      scrollThumbnailIntoView();
      ensureViewerFocus(); // Add focus here
    });
  } else {
    // It's a "middle" thumbnail: NAVIGATE ONLY. Do not scroll.
    goToPage(pageNumber, true);
    // Use nextTick to ensure focus is set after any potential DOM updates.
    nextTick(() => {
      ensureViewerFocus(); // Add focus here
    });
  }
};


// NEW, ROBUST SCROLLING FUNCTION (DECOUPLED FROM CSS)
const scrollThumbnailIntoView = () => {
  if (!showThumbnails.value || !thumbnailContainer.value) return;

  const allThumbs = Array.from(thumbnailContainer.value.children);
  let targetElement = null;

  // Find the thumbnail that corresponds to the current page
  for (const thumb of allThumbs) {
    const pageIndices = (thumb.dataset.pageIndices || '').split(',').map(Number);
    
    // Check if this thumbnail contains the current page index
    if (pageIndices.includes(currentPage.value)) {
      targetElement = thumb;
      break;
    }
  }
  
  if (targetElement) {
    const containerWidth = thumbnailContainer.value.offsetWidth;
    const thumbnailWidth = targetElement.offsetWidth;
    const thumbnailLeft = targetElement.offsetLeft;
    
    const scrollPosition = thumbnailLeft - (containerWidth / 2) + (thumbnailWidth / 2);
    
    thumbnailContainer.value.scrollTo({
      left: scrollPosition,
      behavior: 'smooth'
    });
  }
};

// Get secondary page index based on reading direction and special page rules
const getSecondaryPageIndex = () => {
  const current = currentPage.value;
  
  // Covers and other special pages are always displayed alone.
  if (isSpecialPage(current)) {
    return -1;
  }

  // In book mode, spreads are pairs of (odd, even) pages, e.g., (1,2), (3,4).
  // Page 0 is the front cover and is handled by isSpecialPage.
  
  // If the current page is an ODD number, its partner is the NEXT page.
  if (current % 2 === 1) {
    const partnerIndex = current + 1;
    // The partner cannot be the back cover (which is a special page).
    if (partnerIndex < totalPages.value && !isSpecialPage(partnerIndex)) {
      return partnerIndex;
    }
  } 
  // If the current page is an EVEN number, its partner is the PREVIOUS page.
  else { // current % 2 === 0
    const partnerIndex = current - 1;
    // The partner cannot be the front cover (page 0).
    if (partnerIndex > 0) {
      return partnerIndex;
    }
  }

  // If no valid partner is found, the page is displayed alone.
  return -1;
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

// NEW: Determine the left and right pages of the current spread
const leftPageOfSpread = computed(() => {
  const current = currentPage.value;
  if (isSpecialPage(current)) return getCurrentPage();

  const secondaryIndex = getSecondaryPageIndex();
  if (secondaryIndex === -1) return getCurrentPage();

  // In a spread, the page with the lower index is on the left (for LTR)
  const leftIndex = Math.min(current, secondaryIndex);
  return filteredPages.value[leftIndex];
});

const rightPageOfSpread = computed(() => {
  const current = currentPage.value;
  if (isSpecialPage(current)) return null; // No right page for special pages

  const secondaryIndex = getSecondaryPageIndex();
  if (secondaryIndex === -1) return null;

  // The page with the higher index is on the right (for LTR)
  const rightIndex = Math.max(current, secondaryIndex);
  return filteredPages.value[rightIndex];
});


// CORRECTED and SIMPLIFIED navigation by pairs in book mode
const handleLeftArrow = (event) => {
  if (event) event.preventDefault();
  
  if (viewMode.value === 'sweep') {
    if (!isRTL.value && currentPage.value > 0) goToPage(currentPage.value - 1);
    else if (isRTL.value && currentPage.value < totalPages.value - 1) goToPage(currentPage.value + 1);
    return;
  }
  
  // BOOK MODE
  if (!isRTL.value) { // LTR: Left arrow means PREVIOUS
    if (currentPage.value > 0) {
      if (currentPage.value === 1) {
        goToPage(0); // From page 1 to cover
      } else {
        goToPage(currentPage.value - 2); // Go back a spread
      }
    }
  } else { // RTL: Left arrow means NEXT
    if (currentPage.value < totalPages.value - 1) {
      if (currentPage.value === 0) {
        goToPage(1); // From cover to page 1
      } else {
        goToPage(currentPage.value + 2); // Go forward a spread
      }
    }
  }
};

const handleRightArrow = (event) => {
  if (event) event.preventDefault();
  
  if (viewMode.value === 'sweep') {
    if (!isRTL.value && currentPage.value < totalPages.value - 1) goToPage(currentPage.value + 1);
    else if (isRTL.value && currentPage.value > 0) goToPage(currentPage.value - 1);
    return;
  }
  
  // BOOK MODE
  if (!isRTL.value) { // LTR: Right arrow means NEXT
    if (currentPage.value < totalPages.value - 1) {
      if (currentPage.value === 0) {
        goToPage(1); // From cover to page 1
      } else {
        goToPage(currentPage.value + 2); // Go forward a spread
      }
    }
  } else { // RTL: Right arrow means PREVIOUS
    if (currentPage.value > 0) {
      if (currentPage.value === 1) {
        goToPage(0); // From page 1 to cover
      } else {
        goToPage(currentPage.value - 2); // Go back a spread
      }
    }
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



// Touch handling for sweep and flipbook modes
const handleTouchStart = (e) => {
  touchStartY.value = e.touches[0].clientY;
  touchStartX.value = e.touches[0].clientX;
};

const handleTouchMove = (e) => {
  // Only prevent default in sweep mode to allow scrolling in book mode with thumbnails open
  if (viewMode.value === 'sweep') {
    e.preventDefault();
  } else {
    // For book mode, only prevent default if it would cause page navigation in browser
    const touchY = e.touches[0].clientY;
    const touchX = e.touches[0].clientX;
    const diffY = touchY - touchStartY.value;
    const diffX = touchX - touchStartX.value;
    
    // If horizontal swipe is significant, prevent browser navigation
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 10) {
      e.preventDefault();
    }
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

// Add this function to your script section
const formatJsonColored = (json) => {
  const jsonString = JSON.stringify(json, null, 2);
  
  // Replace with HTML and color classes
  return jsonString
    // Strings (green)
    .replace(/"([^"]+)":/g, '<span class="text-yellow-300">"$1"</span>:')
    // String values (green)
    .replace(/: "([^"]+)"/g, ': <span class="text-green-400">"$1"</span>')
    // Numbers (blue)
    .replace(/: ([0-9]+)/g, ': <span class="text-blue-400">$1</span>')
    // Booleans (purple)
    .replace(/: (true|false)/g, ': <span class="text-purple-400">$1</span>')
    // null (red)
    .replace(/: (null)/g, ': <span class="text-red-400">$1</span>')
    // Brackets and braces (gray)
    .replace(/[[\]{}]/g, '<span class="text-gray-400">$&</span>');
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

  // CORRECTED: Watcher for currentPage
  watch(currentPage, (newPage, oldPage) => {
    // This check prevents the watcher from running on initial component load
    if (newPage === oldPage) return;

    nextTick(() => {
      ensureViewerFocus();
      
      // If navigation was NOT from a click, scroll the active thumbnail into view.
      // This is the logic for keyboard navigation.
      if (showThumbnails.value && !isFromClick.value) {
        scrollThumbnailIntoView();
      }
      
      // Always reset the flag after the operation so the next navigation is handled correctly.
      isFromClick.value = false;
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
}); // <-- THIS is the correct closing for onUnmounted

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

/* Prevent image selection and download */
img {
  user-select: none;
  -webkit-user-drag: none;
  -moz-user-select: none;
  -webkit-user-select: none;
  pointer-events: none;
}

/* Prevent blue highlight on double click */
.h-full {
  user-select: none;
}
</style>