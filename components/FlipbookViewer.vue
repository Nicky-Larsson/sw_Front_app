<template>
  <div class="w-full max-w-screen relative flex flex-col h-screen bg-gray-900" 
  ref="flipbookContainer"
  @contextmenu.prevent>

    <!-- TOP NAVIGATION ROW -->
    <div class="absolute top-2 w-full flex justify-between z-30 px-2">
      <!-- Left Menu Button -->
      <button 
        @click.stop="emitToggleLeftMenu"
        class="bg-black/30 text-white p-2 rounded-full hover:bg-black/50 transition-colors"
        title="Open Menu"
      >
        <Icon name="mdi:menu" size="24" />
      </button>
      
      <!-- Center Area (empty for now) -->
      <div></div>
      
      <!-- Right Side Controls -->
      <div class="flex items-center gap-2">
        <!-- Back Button -->
        <button 
          @click.stop="goBack"
          class="bg-black/30 text-white p-2 rounded-full hover:bg-black/50 transition-colors"
          title="Go Back"
        >
          <Icon name="mdi:arrow-left" size="24" />
        </button>
        
        <!-- Account Button -->
        <button 
          @click.stop="emitToggleRightMenu"
          class="bg-black/30 text-white p-2 rounded-full hover:bg-black/50 transition-colors"
          title="Open Account"
        >
          <Icon name="mdi:account-circle-outline" size="24" />
        </button>
      </div>
    </div>


    <!-- END: Side Menu Trigger Buttons -->

    <!-- Top Control Bar -->

    
    <!-- Thumbnail Navigation with DYNAMIC POSITION -->
    <div 
      class="absolute z-10 backdrop-blur-sm p-1 shadow-lg transition-all duration-300"
      :class="[
        viewMode === 'sweep' 
          // CHANGED: Increased width from w-[65px] to w-[90px] for a wider bar.
          ? 'left-0 top-0 bottom-0 border-r border-gray-600 w-[90px] bg-gray-800/20' 
          : 'left-0 right-0 bottom-[44px] border-t border-gray-400 bg-gray-800/30'
      ]"
      :style="{ 
        transform: showThumbnails 
          ? 'translate(0, 0)' 
          : (viewMode === 'sweep' ? 'translateX(-100%)' : 'translateY(100%)') 
      }"
      v-show="showThumbnails"
    >
      <div 
        :class="[
          viewMode === 'sweep' 
            ? 'flex flex-col h-full overflow-y-auto gap-1 px-1'
            : 'flex overflow-x-auto gap-2 pb-2',
          {'flex-row-reverse': isRTL && viewMode === 'book'}
        ]"
        ref="thumbnailContainer"
        @wheel="handleThumbnailWheel"
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
              <div class="w-1/2">
                <img v-if="filteredPages[i*2+2]" :src="filteredPages[i*2+2].image_url" class="w-full h-auto object-contain" />
                <div v-if="filteredPages[i*2+2]" class="text-xs text-center text-white" :class="{'bg-yellow-500': filteredPages[i*2+2].type === 'chapter_cover' && (currentPage === i*2+1 || currentPage === i*2+2), 'bg-red-800': filteredPages[i*2+2].type === 'chapter_cover' && !(currentPage === i*2+1 || currentPage === i*2+2), 'bg-gray-800': filteredPages[i*2+2].type !== 'chapter_cover'}">{{ i*2+3 }}</div>
              </div>
              <div class="w-1/2">
                <img v-if="filteredPages[i*2+1]" :src="filteredPages[i*2+1].image_url" class="w-full h-auto object-contain" />
                <div v-if="filteredPages[i*2+1]" class="text-xs text-center text-white" :class="{'bg-yellow-500': filteredPages[i*2+1].type === 'chapter_cover' && (currentPage === i*2+1 || currentPage === i*2+2), 'bg-red-800': filteredPages[i*2+1].type === 'chapter_cover' && !(currentPage === i*2+1 || currentPage === i*2+2), 'bg-gray-800': filteredPages[i*2+1].type !== 'chapter_cover'}">{{ i*2+2 }}</div>
              </div>
            </div>
          </template>
          <!-- Back cover -->
          <div v-if="filteredPages.length > 1" @click.stop="handleThumbnailClick(filteredPages.length - 1, $event)" class="min-w-[60px] cursor-pointer rounded overflow-hidden hover:opacity-100 opacity-90" :class="{ 'ring-4 ring-blue-500': currentPage === filteredPages.length - 1 }" :data-page-indices="filteredPages.length - 1">
            <img :src="filteredPages[filteredPages.length - 1].image_url" class="w-full h-auto object-contain" />
            <div class="text-xs text-center bg-gray-800 text-white">{{ filteredPages.length }}</div>
          </div>
        </template>

        <!-- SWEEP MODE THUMBNAILS (THE FIX) -->
        <template v-else>
          <div 
            v-for="(page, index) in filteredPages" :key="`sweep-${index}`"
            @click.stop="handleThumbnailClick(index, $event)"
            class="w-full flex-shrink-0 cursor-pointer rounded overflow-hidden hover:opacity-100 opacity-90 border border-gray-500 mb-1" 
            :class="{ 'ring-3 ring-blue-500 ring-offset-2 ring-offset-gray-800': currentPage === index }"
            :data-page-indices="`${index}`"
          >
            <!-- Larger height -->
            <!-- CHANGED: Increased height from h-22 to h-28 for bigger images. -->
            <div class="w-full h-28 bg-gray-800/40 flex items-center justify-center">
              <img 
                v-if="page && page.image_url" 
                :src="page.image_url" 
                class="max-h-full max-w-full object-contain" 
                :alt="`Page ${index + 1}`"
              />
            </div>
            <div 
              class="text-xs text-center text-white py-1"
              :class="{
                'bg-yellow-500': page.type === 'chapter_cover' && currentPage === index,
                'bg-red-800': page.type === 'chapter_cover' && currentPage !== index,
                'bg-gray-800': page.type !== 'chapter_cover'
              }"
            >
              {{ index + 1 }}
            </div>
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
      @keydown.tab="handleTabSwitch"
      @keydown.space="handleTabSwitch"
      @click="handleViewerClick"
      @wheel="handleWheel"
      tabindex="0"
      ref="viewerContainer"
    >
      
        <!-- Sweep Mode V2 (Vertical Scrolling) -->
        <div 
          v-if="viewMode === 'sweep'" 
          class="h-full overflow-y-auto smooth-scroll"
          :class="{ 'is-dragging': isDragging || isPanning }"
          @scroll="handleSweepScroll"
          @mousedown="handleMouseDown"          
          @mousemove="handleDragMove"           
          @mouseup="handleDragEnd"              
          @mouseleave="handleDragEnd"   
          @touchstart="handleSweepTouchStart"
          @touchmove="handleSweepTouchMove"
          @touchend="handleSweepTouchEnd"
        >
        <div
          v-for="(page, index) in filteredPages"
          :key="index"
          class="h-full flex flex-col items-center justify-center mb-1"
          :id="`sweep-page-${index}`"
        >
          <div class="relative h-full w-full flex items-center justify-center">
            <!-- Base image -->
            <img
              v-if="page.image_url"
              :src="page.image_url"
              :alt="`Page ${index + 1}`"
              class="max-h-full max-w-full object-contain"
              :style="{ pointerEvents: 'auto' }" 
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
        <!-- Book distance spread with proper page handling -->
        <div class="h-full flex items-center justify-center gap-x-10" :class="{'flex-row-reverse': isRTL}">
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
          @dblclick.stop
          @mousedown="startNavRepeat('back')"
          @mouseup="stopNavRepeat"
          @mouseleave="stopNavRepeat"
          @touchstart.stop.prevent="startNavRepeat('back')" 
          @touchend="stopNavRepeat"
          @touchcancel="stopNavRepeat" 
          class="absolute top-0 bottom-0 flex items-center justify-center w-32 hover:bg-black/20 cursor-pointer transition-colors" 
          :class="isRTL ? 'right-0' : 'left-0'"
          v-if="canMoveForward"
        >
          <div class="bg-black/70 text-white p-6 rounded-full hover:bg-black/90 shadow-lg">
            <Icon :name="isRTL ? 'mdi:chevron-right' : 'mdi:chevron-left'" size="48" />
          </div>
        </div>

        <div 
          @click.stop="moveForward" 
          @dblclick.stop
          @mousedown="startNavRepeat('forward')"
          @mouseup="stopNavRepeat"
          @mouseleave="stopNavRepeat"
          @touchstart.stop.prevent="startNavRepeat('forward')" 
          @touchend="stopNavRepeat"
          @touchcancel="stopNavRepeat" 
          class="absolute top-0 bottom-0 flex items-center justify-center w-32 hover:bg-black/20 cursor-pointer transition-colors" 
          :class="isRTL ? 'left-0' : 'right-0'"
          v-if="canMoveBack"
        >
          <div class="bg-black/70 text-white p-6 rounded-full hover:bg-black/90 shadow-lg">
            <Icon :name="isRTL ? 'mdi:chevron-left' : 'mdi:chevron-right'" size="48" />
          </div>
        </div>

      <div 
        v-if="isPanning"
        class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 bg-black/50 text-white p-4 rounded-full pointer-events-none flex items-center justify-center"
        title="Panning Mode Active"
      >
        <Icon name="mdi:arrow-all" size="48" />
      </div>        
      </div>
    </div>
    
    <!-- CORRECTED AND RE-ORGANIZED Bottom Navigation Bar -->
    <div class="bg-gray-800 text-white p-2 rounded-b-lg flex justify-between items-center flex-wrap gap-x-4 gap-y-2 relative z-20">
      <!-- Left Group: Navigation -->
      <div class="flex items-center gap-2">
        <button
          @click="toggleThumbnails"
          class="px-3 py-1 bg-gray-700 rounded hover:bg-gray-600 flex items-center justify-center w-45"  
          title="Show or hide thumbnails"
        >
          <Icon name="mdi:image-multiple" class="mr-1" />
          <span class="block w-full text-center truncate">
            {{ showThumbnails ? 'Hide Thumbnails' : 'Show Thumbnails' }}
          </span>
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
          data-nav-arrow 
          @click.stop="moveForward" 
          @mousedown.prevent="startNavRepeat('forward')"
          @mouseup="stopNavRepeat"
          @mouseleave="stopNavRepeat"
          @touchstart.prevent="startNavRepeat('forward')"
          @touchend="stopNavRepeat"
          class="px-3 py-1 bg-gray-700 rounded hover:bg-gray-600 disabled:opacity-50 flex items-center" 
          :disabled="!canMoveBack"
          title="Go to previous page"
        >
          <Icon name="mdi:chevron-left" size="18" /> Next 
        </button>
        <span class="text-sm px-2 font-mono" title="Current page">{{ currentPage + 1 }} / {{ totalPages }}</span>
        <button
          data-nav-arrow 
          @click.stop="moveBack" 
          @mousedown.prevent="startNavRepeat('back')"
          @mouseup="stopNavRepeat"
          @mouseleave="stopNavRepeat"
          @touchstart.prevent="startNavRepeat('back')"
          @touchend="stopNavRepeat"
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

import { useMenuActions } from '@/composables/useMenuState';



const emit = defineEmits(['toggle-left-menu', 'toggle-right-menu']);

const props = defineProps({
  product: Object,
  rtl: {
    type: Boolean,
    default: true
  }
});

const router = useRouter();
const route = useRoute();
const menuActions = useMenuActions();
const touchStartTime = ref(0);
const hasMoved = ref(false);

const isDragging = ref(false);
const lastClientY = ref(0);
const grabCursorActive = ref(false);

// --- START: New state for Inertia Scrolling ---
const velocityY = ref(0);
const lastDragTime = ref(0);
const inertiaFrameId = ref(null);
const touchInProgress = ref(false); // To prevent conflict between touch and mouse
// --- END: New state for Inertia Scrolling ---

// --- START: New state for Wheel and Pan controls ---
const wheelDebounceTimer = ref(null);
const isPanning = ref(false);
const panLastY = ref(0);
// --- END: New state for Wheel and Pan controls ---



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
const showLanguageMenu = ref(false);

// --- START: New state for press-and-hold navigation ---
const navInterval = ref(null);
const navSpeed = ref(350); // Initial delay in ms
const navAccelerationTimeout = ref(null);



// --- END: New state for press-and-hold navigation ---



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


// NEW: Single click/tap handler for the main viewer area
const handleViewerClick = (event) => {
  // This check prevents a "ghost click" from firing after a touch event.
  if (Date.now() - touchStartTime.value < 500) {
    return;
  }

  // Also, if the click was actually the end of a drag, do nothing.
  if (isDragging.value) {
    return;
  }

  // Check if click was on navigation arrows in book mode
  if (viewMode.value === 'book') {
    const target = event.target;
    const isNavArrow = target.closest('[data-nav-arrow]');
    
    if (!isNavArrow) {
      // Toggle thumbnails on any click (including images) in book mode
      showThumbnails.value = !showThumbnails.value;
    }
    return;
  }
  
  // SWEEP MODE LOGIC remains unchanged
  if (viewMode.value === 'sweep') {
    if (event.target.tagName !== 'IMG') {
      showThumbnails.value = !showThumbnails.value;
    }
  }
};


const handleSweepScroll = (e) => {
  if (viewMode.value !== 'sweep') return;
  
  // Find which page is most visible in the viewport
  const container = e.target;
  const containerRect = container.getBoundingClientRect();
  const containerCenter = containerRect.top + (containerRect.height / 2);
  
  // Find the page element whose center is closest to the container's center
  let closestPage = null;
  let closestDistance = Infinity;
  
  for (let i = 0; i < filteredPages.value.length; i++) {
    const pageEl = document.getElementById(`sweep-page-${i}`);
    if (!pageEl) continue;
    
    const pageRect = pageEl.getBoundingClientRect();
    const pageCenter = pageRect.top + (pageRect.height / 2);
    const distance = Math.abs(pageCenter - containerCenter);
    
    if (distance < closestDistance) {
      closestDistance = distance;
      closestPage = i;
    }
  }
  
  // Update currentPage if needed, but don't force scroll
  if (closestPage !== null && closestPage !== currentPage.value) {
    currentPage.value = closestPage;
  }
};

// --- START: FINAL DRAG HANDLERS with INERTIA ---
// This block makes mouse-drag feel exactly like touch-drag.

const handleDragStart = (e) => {
  // This function is for MOUSE events only.
  // It prevents firing if a touch action is already in progress.
  if (e.type !== 'mousedown' || touchInProgress.value) return;

  // Stop any previous inertia animation
  if (inertiaFrameId.value) {
    cancelAnimationFrame(inertiaFrameId.value);
    inertiaFrameId.value = null;
  }

  isDragging.value = true;
  lastClientY.value = e.clientY;
  velocityY.value = 0;
  lastDragTime.value = Date.now();
  e.preventDefault(); // Prevent text selection
};


// --- START: MODIFIED handleDragMove function ---
const handleDragMove = (e) => {
  // First, check if we are in the new "pan" mode.
  if (isPanning.value) {
    const container = viewerContainer.value.querySelector('.overflow-y-auto');
    if (!container) return;

    const deltaY = e.clientY - panLastY.value;
    container.scrollTop -= deltaY; // Scroll by the amount the mouse moved.
    panLastY.value = e.clientY; // Update the last position for the next move.
    return; // Stop here, don't do the regular drag logic.
  }

  // Below is the existing logic for left-click dragging, which remains unchanged.
  if (!isDragging.value || e.type !== 'mousemove') return;
  
  const container = viewerContainer.value.querySelector('.overflow-y-auto');
  if (!container) return;

  const now = Date.now();
  const deltaTime = now - lastDragTime.value;
  const deltaY = e.clientY - lastClientY.value;

  // Apply the movement to the scroll container
  container.scrollTop -= deltaY;

  // Calculate velocity (pixels per millisecond) for the inertia effect
  if (deltaTime > 0) {
    velocityY.value = deltaY / deltaTime;
  }

  lastClientY.value = e.clientY;
  lastDragTime.value = now;
};
// --- END: MODIFIED handleDragMove function ---


const handleDragEnd = () => {
  if (!isDragging.value) return;
  isDragging.value = false;
  
  // Start the inertia animation
  inertiaStep();
};

const handleTabSwitch = (event) => {
  // Switch on Tab (not Shift+Tab) or Space key
  if (
    (event.key === 'Tab' && !event.shiftKey) ||
    event.code === 'Space' || event.key === ' ' || event.key === 'Spacebar'
  ) {
    event.preventDefault();
    toggleViewMode();
  }
};

const inertiaStep = () => {
  if (Math.abs(velocityY.value) < 0.05) {
    velocityY.value = 0;
    return; // Stop animation when velocity is negligible
  }

  const container = viewerContainer.value.querySelector('.overflow-y-auto');
  if (!container) return;

  // Apply the current velocity to the scroll position
  container.scrollTop -= velocityY.value * 8; // Multiply by ~16ms for frame rate
  
  // Apply friction to slow down the velocity
  velocityY.value *= 0.86;               //  Intery & friction

  // Request the next animation frame
  inertiaFrameId.value = requestAnimationFrame(inertiaStep);
};
// --- END: FINAL DRAG HANDLERS with INERTIA ---

// --- START: NEW Mouse Control Functions ---

const handleWheel = (event) => {
  // Get scroll speed multiplier - how many pages to jump (ONLY for book mode)
  const scrollMultiplier = .5;
  
  if (viewMode.value === 'book') {
    // BOOK MODE: Prevent default and use enhanced page navigation
    event.preventDefault();

    // If debounce timer is active, skip this event
    if (wheelDebounceTimer.value) return;

    // REVERSED: Positive deltaY now goes backward, negative goes forward
    if (event.deltaY > 1) {
      // Scroll down - move BACKWARD multiple pages (reversed)
      for (let i = 0; i < scrollMultiplier; i++) {
        if (canMoveForward.value) moveBack();
      }
    } else if (event.deltaY < -1) {
      // Scroll up - move FORWARD multiple pages (reversed)
      for (let i = 0; i < scrollMultiplier; i++) {
        if (canMoveBack.value) moveForward();
      }
    }

    // Use a shorter debounce timer for more responsive scrolling
    wheelDebounceTimer.value = setTimeout(() => {
      wheelDebounceTimer.value = null;
    }, 1);
  }
  else if (viewMode.value === 'sweep') {
    // SWEEP MODE: Add multiplier to slow down scrolling speed
    const container = viewerContainer.value.querySelector('.overflow-y-auto');
    if (!container) return;

    event.preventDefault();
    // Reduce scroll speed by multiplying deltaY by 0.4 (adjust as needed)
    container.scrollBy({
      top: event.deltaY * 0.4,         //  Middle Wheel Sweep
      behavior: 'auto'
    });

    //Lower value = slower scroll (e.g. 0.1 is slower, 0.05 is very slow).
    //Higher value = faster scroll (e.g. 0.5 is faster).
    
    // Let the scroll event bubble up for handleSweepScroll to detect current page
  }
};


const handleMouseDown = (e) => {
  // For LEFT CLICK: Handle drag with inertia
  if (e.button === 0) {
    if (isPanning.value) {
      // Cancel panning mode on left click
      isPanning.value = false;
      return;
    }
    
    // Only handle left-click drag if not in touch mode
    if (touchInProgress.value) return;
    
    // Stop any previous inertia
    if (inertiaFrameId.value) {
      cancelAnimationFrame(inertiaFrameId.value);
      inertiaFrameId.value = null;
    }
    
    // Start dragging
    isDragging.value = true;
    lastClientY.value = e.clientY;
    velocityY.value = 0;
    lastDragTime.value = Date.now();
    e.preventDefault();
  }
  
  // For MIDDLE CLICK: Use standard middle mouse scrolling
  // Let the browser handle it naturally, don't prevent default
};

const togglePanningMode = () => {
  isPanning.value = !isPanning.value;
  if (isPanning.value) {
    // When entering panning mode, attach a document-level mousemove handler
    document.addEventListener('mousemove', handlePanMove);
    document.addEventListener('mouseup', () => {
      // Clean up when mouse is released
      isPanning.value = false;
      document.removeEventListener('mousemove', handlePanMove);
    }, { once: true });
  }
};

const handleSweepMouseDown = (e) => {
  // Middle Mouse Button (button code 1) toggles the panning mode.
  if (e.button === 1) {
    e.preventDefault();
    isPanning.value = !isPanning.value;
    // If we just entered panning mode, store the initial mouse position.
    if (isPanning.value) {
      panLastY.value = e.clientY;
    }
    return;
  }

  // Left Mouse Button (button code 0) handles normal dragging.
  if (e.button === 0) {
    // If we are in panning mode, a left click will disable it.
    if (isPanning.value) {
      isPanning.value = false;
      return;
    }
    // Otherwise, start a normal drag, just like before.
    handleDragStart(e);
  }
};

// --- END: NEW Mouse Control Functions ---

const handleSweepTouchStart = (e) => {
  // Signal a touch event is in progress to block mouse events
  touchInProgress.value = true;
  
  // Stop any leftover mouse inertia animation
  if (inertiaFrameId.value) {
    cancelAnimationFrame(inertiaFrameId.value);
    inertiaFrameId.value = null;
  }
  
  // IMPORTANT: Only track start position for swipe detection
  // DON'T call handleTouchDragStart - this was fighting with native scrolling
  touchStartX.value = e.touches[0].clientX;
  touchStartY.value = e.touches[0].clientY;
  touchStartTime.value = Date.now();
  hasMoved.value = false;
  
  // NO preventDefault() - let the browser handle scrolling naturally
};

const handleSweepTouchMove = (e) => {
  // IMPORTANT: DON'T call handleTouchDragMove - it was fighting native scrolling
  
  // Just track movement for horizontal swipe detection
  const touchX = e.touches[0].clientX;
  const touchY = e.touches[0].clientY;
  const diffX = touchX - touchStartX.value;
  const diffY = touchY - touchStartY.value;
  
  if (Math.abs(diffX) > 10 || Math.abs(diffY) > 10) {
    hasMoved.value = true;
  }
  
  // NO preventDefault() - let the browser handle scrolling naturally
};

const handleSweepTouchEnd = (e) => {
  // Get touch end position and duration
  const touchEndX = e.changedTouches[0].clientX;
  const touchEndY = e.changedTouches[0].clientY;
  const diffX = touchEndX - touchStartX.value;
  const diffY = touchEndY - touchStartY.value;
  const touchDuration = Date.now() - touchStartTime.value;

  // Handle horizontal swipe for thumbnails (this is your existing logic)
  if (hasMoved.value && touchDuration < 500) {
    const isHorizontalSwipe = Math.abs(diffX) > Math.abs(diffY);

    if (isHorizontalSwipe && Math.abs(diffX) > 30) {
      if (diffX > 0) { // Swipe RIGHT - SHOW thumbnails
        showThumbnails.value = true;
      } else { // Swipe LEFT - HIDE thumbnails
        showThumbnails.value = false;
      }
    }
  }

  touchInProgress.value = false;
};


// Update for touch compatibility
const handleTouchDragStart = (e) => {
  lastClientY.value = e.touches[0].clientY;
  isDragging.value = true;
  // Don't prevent default here - allow native scrolling momentum
};

const handleTouchDragMove = (e) => {
  if (!isDragging.value) return;
  
  const clientY = e.touches[0].clientY;
  const container = viewerContainer.value.querySelector('.overflow-y-auto');
  if (!container) return;
  
  const deltaY = lastClientY.value - clientY;
  container.scrollTop += deltaY;
  lastClientY.value = clientY;
  // Don't prevent default here - allow native scrolling momentum
};


const ensureViewerFocus = () => {
  // Try to focus the main viewer container if it exists
  if (viewerContainer.value && typeof viewerContainer.value.focus === 'function') {
    viewerContainer.value.focus();
  }
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

// THIS IS THE FIX: Add this watcher to automatically scroll the thumbnails.
watch(currentPage, () => {
  // When the current page changes for any reason,
  // scroll the corresponding thumbnail into view if the panel is open.
  if (showThumbnails.value) {
    nextTick(() => {
      scrollThumbnailIntoView();
    });
  }
});

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

// --- START: New functions for press-and-hold navigation ---
const startNavRepeat = (direction) => {
  // Clear any existing timers to prevent conflicts
  stopNavRepeat();

  // Function to perform a single navigation step
  const navigate = () => {
    if (direction === 'forward') {
      moveForward();
    } else {
      moveBack();
    }
  };

  // Set up the repeating interval
  navInterval.value = setInterval(navigate, navSpeed.value);

  // Set up the acceleration
  navAccelerationTimeout.value = setTimeout(() => {
    clearInterval(navInterval.value); // Clear the current interval
    navSpeed.value = 100; // Set a faster speed
    navInterval.value = setInterval(navigate, navSpeed.value); // Start a new, faster interval
  }, 1000); // Accelerate after 1 second
};

const stopNavRepeat = () => {
  clearInterval(navInterval.value);
  clearTimeout(navAccelerationTimeout.value);
  navInterval.value = null;
  navAccelerationTimeout.value = null;
  navSpeed.value = 350; // Reset to initial speed
};
// --- END: New functions for press-and-hold navigation ---

// Add these at the top of your script section
const clickSpeed = ref(1);
const lastClickTime = ref(0);

// FINAL CORRECTED VERSION: moveBack and moveForward
const moveBack = () => {
  // In SWEEP MODE, "Previous" should act like the UP ARROW key (navigate up).
  if (viewMode.value === 'sweep') {
    if (currentPage.value > 0) {
      goToPage(currentPage.value - 1);
    }
    return; // Stop execution here for sweep mode
  }

  // In BOOK MODE, the original, working logic is preserved.
  // "Previous" button logic for book mode (RTL/LTR aware).
  if (isRTL.value) {
    handleRightArrow(); // In RTL, "Previous" is the right arrow
  } else {
    handleLeftArrow(); // In LTR, "Previous" is the left arrow
  }
};

const moveForward = () => {
  // In SWEEP MODE, "Next" should act like the DOWN ARROW key (navigate down).
  if (viewMode.value === 'sweep') {
    if (currentPage.value < totalPages.value - 1) {
      goToPage(currentPage.value + 1);
    }
    return; // Stop execution here for sweep mode
  }

  // In BOOK MODE, the original, working logic is preserved.
  // "Next" button logic for book mode (RTL/LTR aware).
  if (isRTL.value) {
    handleLeftArrow(); // In RTL, "Next" is the left arrow
  } else {
    handleRightArrow(); // In LTR, "Next" is the right arrow
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



const goToPage = (pageNumber, isClick = false) => {
  if (pageNumber >= 0 && pageNumber < totalPages.value) {
    isFromClick.value = isClick;
    currentPage.value = pageNumber;

    // If in sweep mode, scroll the view to the new page.
    if (viewMode.value === 'sweep' && isClick) { // Only scroll if user clicked or used keyboard
      nextTick(() => {
        const pageElement = document.getElementById(`sweep-page-${pageNumber}`);
        if (pageElement) {
          pageElement.scrollIntoView({ 
            behavior: 'auto', 
            block: 'center' 
          });
        }
      });
    }
  }
};

const handleThumbnailWheel = (event) => {
  // Only handle in book mode (horizontal scroll)
  if (viewMode.value === 'book') {
    const container = thumbnailContainer.value;
    if (!container) return;
    container.scrollLeft += event.deltaY;
    event.preventDefault(); // Prevent parent from handling
  }
  // In sweep mode, let vertical scrolling happen natively
};

// REVISED: Restores edge-scrolling logic with selection
const handleThumbnailClick = (pageNumber, event) => {
  const container = thumbnailContainer.value;
  // Fallback if something goes wrong.
  if (!container || !event.currentTarget) {
    goToPage(pageNumber, true); 
    ensureViewerFocus();
    return;
  }

  const allThumbs = Array.from(container.children);
  const clickedElement = event.currentTarget;

  // STEP 1: Find which thumbnails are currently visible inside the container.
  const containerRect = container.getBoundingClientRect();
  const visibleThumbs = allThumbs.filter(thumb => {
    const thumbRect = thumb.getBoundingClientRect();
    return thumbRect.left < containerRect.right && thumbRect.right > containerRect.left;
  });

  // STEP 2: If only a few thumbnails are visible, any click should scroll.
  if (visibleThumbs.length <= 4) {
    goToPage(pageNumber, true);
    nextTick(() => {
      scrollThumbnailIntoView();
      ensureViewerFocus();
    });
    return;
  }

  // STEP 3: Identify the thumbnails at the far left and far right edges.
  const edgeThumbs = [
    visibleThumbs[0],
    visibleThumbs[1],
    visibleThumbs[visibleThumbs.length - 2],
    visibleThumbs[visibleThumbs.length - 1]
  ];

  // STEP 4: Check if the thumbnail you clicked is an "edge" thumbnail.
  if (edgeThumbs.includes(clickedElement)) {
    // YES, it's an edge thumbnail.
    // ACTION: Change the page AND scroll the thumbnail bar.
    goToPage(pageNumber, true);
    nextTick(() => {
      scrollThumbnailIntoView();
      ensureViewerFocus();
    });
  } else {
    // NO, it's a "middle" thumbnail.
    // ACTION: Change the page ONLY. Do NOT scroll the thumbnail bar.
    goToPage(pageNumber, true);
    nextTick(() => {
      ensureViewerFocus();
    });
  }
};


// NEW, ROBUST SCROLLING FUNCTION (DECOUPLED FROM CSS)
const scrollThumbnailIntoView = () => {
  if (!showThumbnails.value || !thumbnailContainer.value) return;

  const allThumbs = Array.from(thumbnailContainer.value.children);
  let targetElement = null;

  for (const thumb of allThumbs) {
    const pageIndices = (thumb.dataset.pageIndices || '').split(',').map(Number);
    if (pageIndices.includes(currentPage.value)) {
      targetElement = thumb;
      break;
    }
  }
  
  if (targetElement) {
    if (viewMode.value === 'sweep') {
      // VERTICAL SCROLLING for sweep mode (remains instant)
      const containerHeight = thumbnailContainer.value.offsetHeight;
      const thumbnailHeight = targetElement.offsetHeight;
      const thumbnailTop = targetElement.offsetTop;
      const scrollPosition = thumbnailTop - (containerHeight / 2) + (thumbnailHeight / 2);
      
      thumbnailContainer.value.scrollTo({ top: scrollPosition, behavior: 'auto' });

    } else {
      // HORIZONTAL SCROLLING for book mode (with new custom, faster animation)
      const container = thumbnailContainer.value;
      const scrollPosition = targetElement.offsetLeft - (container.offsetWidth / 2) + (targetElement.offsetWidth / 2);
      
      // THIS IS THE FIX: A custom smooth scroll that we can control.
      const start = container.scrollLeft;
      const change = scrollPosition - start;
      // CHANGED: Duration reduced from 250 to 150 for a much faster, more reactive animation.
      const duration = 100; 
      let startTime = null;

      const animateScroll = (currentTime) => {
        if (startTime === null) startTime = currentTime;
        const timeElapsed = currentTime - startTime;
        
        // Easing function for a smooth start and end
        const easeInOutQuad = (t, b, c, d) => {
          t /= d / 2;
          if (t < 1) return c / 2 * t * t + b;
          t--;
          return -c / 2 * (t * (t - 2) - 1) + b;
        };
        
        container.scrollLeft = easeInOutQuad(timeElapsed, start, change, duration);
        
        if (timeElapsed < duration) {
          requestAnimationFrame(animateScroll);
        } else {
          container.scrollLeft = scrollPosition; // Ensure it ends at the exact spot
        }
      };
      
      requestAnimationFrame(animateScroll);
    }
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
  
  // For SWEEP MODE: LEFT arrow ONLY controls thumbnails
  if (viewMode.value === 'sweep') {
    // In sweep mode: LEFT ONLY closes thumbnails. It NEVER navigates.
    if (showThumbnails.value) {
      showThumbnails.value = false;
    }
    // IMPORTANT: Stop all further execution for sweep mode.
    return;
  }
  
  // BOOK MODE NAVIGATION - This part is unchanged and only runs if not in sweep mode.
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
  
  // For SWEEP MODE: RIGHT arrow ONLY controls thumbnails
  if (viewMode.value === 'sweep') {
    // In sweep mode: RIGHT ONLY opens thumbnails. It NEVER navigates.
    if (!showThumbnails.value) {
      showThumbnails.value = true;
      nextTick(() => {
        scrollThumbnailIntoView();
      });
    }
    // IMPORTANT: Stop all further execution for sweep mode.
    return;
  }
  
  // BOOK MODE NAVIGATION - This part is unchanged and only runs if not in sweep mode.
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
  if (viewMode.value === 'sweep') {
    // Prevent default to handle our own scrolling
    event.preventDefault();
    const container = viewerContainer.value.querySelector('.overflow-y-auto');
    if (container) {
      // Scroll smoothly UP by a reasonable amount (adjust 100 as needed)
      container.scrollBy({
        top: -20,
        behavior: 'auto'
      });
    }
    return;
  }
  // Book mode logic unchanged
  event.preventDefault();
  showThumbnails.value = true;
  nextTick(() => {
    scrollThumbnailIntoView();
  });
};

const handleDownArrow = (event) => {
  if (viewMode.value === 'sweep') {
    // Prevent default to handle our own scrolling
    event.preventDefault();
    const container = viewerContainer.value.querySelector('.overflow-y-auto');
    if (container) {
      // Scroll smoothly DOWN by a reasonable amount (adjust 100 as needed)
      container.scrollBy({
        top: 20,
        behavior: 'auto'
      });
    }
    return;
  }
  // Book mode logic unchanged
  event.preventDefault();
  showThumbnails.value = false;
};


// Touch handling for sweep and flipbook modes
const handleTouchStart = (e) => {
  touchStartY.value = e.touches[0].clientY;
  touchStartX.value = e.touches[0].clientX;
  touchStartTime.value = Date.now();
  hasMoved.value = false;
};

/* const handleTouchMove = (e) => {
  // Track if user has moved finger
  const touchY = e.touches[0].clientY;
  const touchX = e.touches[0].clientX;
  const diffY = touchY - touchStartY.value;
  const diffX = touchX - touchStartX.value;
  
  if (Math.abs(diffX) > 10 || Math.abs(diffY) > 10) {
    hasMoved.value = true;
  }
  
  // Only prevent default in sweep mode or for horizontal swipes
  if (viewMode.value === 'sweep') {
    e.preventDefault();
  } else if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 10) {
    e.preventDefault(); // Prevent horizontal browser navigation
  }
}; */

const handleTouchMove = (e) => {
  // Track if user has moved finger
  const touchY = e.touches[0].clientY;
  const touchX = e.touches[0].clientX;
  const diffY = touchY - touchStartY.value;
  const diffX = touchX - touchStartX.value;
  
  if (Math.abs(diffX) > 10 || Math.abs(diffY) > 10) {
    hasMoved.value = true;
  }
  
  // IMPORTANT FIX: Only prevent default for horizontal swipes in book mode
  // This allows natural touch scrolling in sweep mode
  if (viewMode.value === 'book' && Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 10) {
    e.preventDefault(); // Prevent horizontal browser navigation only in book mode
  }
};

const handleTouchEnd = (e) => {
  const touchEndY = e.changedTouches[0].clientY;
  const touchEndX = e.changedTouches[0].clientX;
  const diffY = touchEndY - touchStartY.value;
  const diffX = touchEndX - touchStartX.value;
  const touchDuration = Date.now() - touchStartTime.value;

  // SIMPLE TAP DETECTION - minimal movement, short duration
  if (Math.abs(diffX) < 10 && Math.abs(diffY) < 10 && touchDuration < 300) {
    // Book Mode: Toggle thumbnails on any tap except nav arrows
    if (viewMode.value === 'book') {
      const element = document.elementFromPoint(touchEndX, touchEndY);
      const isNavArrow = element?.closest('[data-nav-arrow]');
      if (!isNavArrow) {
        showThumbnails.value = !showThumbnails.value;
      }
      return;
    }

    // Sweep Mode: Only toggle on image touches
    if (viewMode.value === 'sweep') {
      showThumbnails.value = !showThumbnails.value;

      return;
    }
  }

  // Check for dominant swipe direction
  const isVerticalSwipe = Math.abs(diffY) > Math.abs(diffX);
  const isHorizontalSwipe = Math.abs(diffX) > Math.abs(diffY);

  // --- SWEEP MODE LOGIC ---
  if (viewMode.value === 'sweep') {
    if (isVerticalSwipe && Math.abs(diffY) > 50) {
      // Vertical swipe in sweep mode: NAVIGATE pages directly.
      if (diffY > 0 && currentPage.value > 0) {
        // Swipe DOWN, go to PREVIOUS page
        goToPage(currentPage.value - 1);
      } else if (diffY < 0 && currentPage.value < totalPages.value - 1) {
        // Swipe UP, go to NEXT page
        goToPage(currentPage.value + 1);
      }
    } else if (isHorizontalSwipe && Math.abs(diffX) > 50) {
      // Horizontal swipe in sweep mode: control thumbnails.
      if (diffX > 0) { // Swipe RIGHT
        showThumbnails.value = true;
      } else { // Swipe LEFT
        showThumbnails.value = false;
      }
    }
    return; // Stop after handling sweep mode
  }

  // --- BOOK MODE LOGIC ---
  if (viewMode.value === 'book') {
    if (isVerticalSwipe && Math.abs(diffY) > 50) {
      // Vertical swipe in book mode: control thumbnails.
      if (diffY < 0) { // Swipe UP
        showThumbnails.value = true;
      } else { // Swipe DOWN
        showThumbnails.value = false;
      }
    } else if (isHorizontalSwipe && Math.abs(diffX) > 50) {
      // Horizontal swipe in book mode: NAVIGATE pages.
      if (diffX > 0) { // Swipe RIGHT
        handleLeftArrow(new Event('keydown'));
      } else { // Swipe LEFT
        handleRightArrow(new Event('keydown'));
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


/* 
const emitToggleLeftMenu = () => {
  console.log("Toggling left menu");
    // null (red)
    .replace(/: (null)/g, ': <span class="text-red-400">$1</span>')
    // Brackets and braces (gray)
    .replace(/[[\]{}]/g, '<span class="text-gray-400">$&</span>');
};


/* 
const emitToggleLeftMenu = () => {
  console.log("Toggling left menu");
  emit('toggle-left-menu');
};

const emitToggleRightMenu = () => {
  emit('toggle-right-menu');
};
*/

// Replace your toggle functions with these:
const emitToggleLeftMenu = () => {
  console.log("Toggling left menu from FlipbookViewer");
  menuActions.toggleLeftMenu();
};

const emitToggleRightMenu = () => {
  console.log("Toggling right menu from FlipbookViewer");
  menuActions.toggleRightMenu();
};


const goBack = () => {
  router.go(-1); // Go back to previous page in browser history
};
// Lifecycle hooks
onMounted(() => {
  window.addEventListener('resize', handleResize);
  document.addEventListener('fullscreenchange', handleFullscreenChange);
  document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
  document.addEventListener('mozfullscreenchange', handleFullscreenChange);
  document.addEventListener('MSFullscreenChange', handleFullscreenChange);
  

  // Add this near the beginning of onMounted
  console.log("Filtered Pages:", filteredPages.value);
  filteredPages.value.forEach((page, index) => {
    console.log(`Page ${index} image URL:`, page.image_url);
  });

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
  /* pointer-events: none;  <-- REMOVE or comment out this line */
}

/* Prevent blue highlight on double click */
.h-full {
  user-select: none;
}

/* Move scrollbar to left side for sweep mode */
.flex-col.overflow-y-auto::-webkit-scrollbar {
  width: 6px; /* Set scrollbar width */
  position: absolute;
  left: 0; /* Position scrollbar on left */
}

.flex-col.overflow-y-auto::-webkit-scrollbar-thumb {
  background-color: rgba(107, 114, 128, 0.5);
  border-radius: 3px;
}

.flex-col.overflow-y-auto {
  direction: rtl; /* This moves scrollbar to left */
}

.flex-col.overflow-y-auto > * {
  direction: ltr; /* Reset direction for content */
}

@supports (-webkit-touch-callout: none) {
  .smooth-scroll {
    -webkit-overflow-scrolling: touch;
  }
}

/* FINAL CURSOR LOGIC: Default cursor is normal. "grabbing" only when dragging. */
.smooth-scroll.is-dragging {
  cursor: grabbing !important;
}
.smooth-scroll.is-dragging * { /* Apply to all children during drag */
  cursor: grabbing !important;
}

/* Make the scrollbar completely invisible in sweep mode */
.overflow-y-auto::-webkit-scrollbar {
  width: 0px; /* Hide scrollbar but keep functionality */
}

/* For Firefox */
.overflow-y-auto {
  scrollbar-width: none;
}

/* For IE and Edge */
.overflow-y-auto {
  -ms-overflow-style: none;
}

</style>
