<template>
  <div class="book">
    <!-- Left page encapsulated in a frame -->
    <div class="page-frame">
      <div class="book-page left">
        <img v-if="leftPageContent" :src="leftPageContent.image_url" class="page-image" alt="Left Page">
        <img v-if="leftPageContent?.overlay_url" :src="leftPageContent.overlay_url" class="page-overlay">
      </div>
    </div>
    
    <!-- Right page encapsulated in a frame -->
    <div class="page-frame">
      <div class="book-page right">
        <img v-if="rightPageContent" :src="rightPageContent.image_url" class="page-image" alt="Right Page">
        <img v-if="rightPageContent?.overlay_url" :src="rightPageContent.overlay_url" class="page-overlay">
      </div>
    </div>
    
    <!-- This turning page logic is NOT changed -->
    <div v-if="isFlipping" class="turning-page" 
         :class="{'forward': direction === 'forward', 'backward': direction === 'backward'}">
      <!-- Front of turning page -->
      <div class="turning-page-front">
        <div class="page-frame">
          <img v-if="flippingFrontContent" :src="flippingFrontContent.image_url" class="page-image" alt="Turning Page Front">
          <img v-if="flippingFrontContent?.overlay_url" :src="flippingFrontContent.overlay_url" class="page-overlay">
        </div>
      </div>
      
      <!-- Back of turning page -->
      <div class="turning-page-back">
        <div class="page-frame">
          <img v-if="flippingBackContent" :src="flippingBackContent.image_url" class="page-image" alt="Turning Page Back">
          <img v-if="flippingBackContent?.overlay_url" :src="flippingBackContent.overlay_url" class="page-overlay">
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';

const props = defineProps({
  pages: { type: Array, required: true },
  currentPage: { type: Number, default: 0 }
});

// Add emits to tell the parent when flipping starts/ends
const emit = defineEmits(['flippingChange']);

const isFlipping = ref(false);
const direction = ref('forward');

// FIXED: Inverted the page calculations for stable state
const leftPageContent = computed(() => {
  // During flipping, keep showing the old left page until animation ends
  if (isFlipping.value) {
    if (direction.value === 'backward') {
        // Forward turn, show the last page on the left
        return props.pages[props.currentPage-2] || null;
    }
  }
  // Otherwise, show the new left page
  return props.pages[props.currentPage] || null;
  // return props.pages[1] || null;
});

const rightPageContent = computed(() => {
  // Always show the new right page, even during flipping
  // const index =  props.currentPage + 1
  if (isFlipping.value) {
    if (direction.value === 'forward') {
        // Forward turn, show the last page on the left
        return props.pages[props.currentPage + 3] || null;
    }
  }

  return props.pages[props.currentPage + 1] || null;
});

// Calculate the content for the flipping pages
const flippingFrontContent = computed(() => {
  if (direction.value === 'backward') {
      // Forward  ,  Page  left  Recto !
      const index =  props.currentPage - 1;
    return props.pages[index] || null;
  } else {

      // Backward ,  Right  Recto 
      const index = props.currentPage + 2;
      console.log("forward");

    return props.pages[index] || null;
  }
});

const flippingBackContent = computed(() => {
  if (direction.value === 'backward') {
      // Forward ,  page  Left Verso
      const index =  props.currentPage ;
      

    return props.pages[index] || null;
  } else {
      // Backward ,  Right  VERSO 
      const index =  props.currentPage + 1;
    return props.pages[index] || null;
  }
});

// Watch for page changes to trigger the animation
watch(() => props.currentPage, (newPage, oldPage) => {
  if (newPage === oldPage || isFlipping.value) return; // Prevent double trigger
  
  direction.value = newPage > oldPage ? 'backward' : 'forward';
  
  // Start flipping and tell parent
  isFlipping.value = true;
  emit('flippingChange', true);
  
  setTimeout(() => {
    // End flipping and tell parent
    isFlipping.value = false;
    emit('flippingChange', false);
  }, 950); // Match animation duration
});
</script>

<style scoped>
.book {
  display: flex; /* Arrange pages side by side, like an open book */
  width: 100%; /* Book fills its container horizontally */
  height: 100%; /* Book fills its container vertically */
  position: relative; /* Allows absolutely positioned children */
  perspective: 1500px; /* Adds 3D depth for page flip effect */
  background: transparent; /* No background color */
  /* Use a shared gap so static frames and the turning page compute the same width */
  /* --page-gap: 0px; */
  /* gap: var(--page-gap); */ /* Space between left and right pages */
  flex-direction: row-reverse; /* Pages go right-to-left (RTL) */
  /* --page-padding: 10px;  */
}

.page-frame {
  /* Each page frame should be exactly half of the remaining width after the gap */
  /* width: calc((100% - var(--page-gap)) / 2); */
  width: 50%;
  height: 100%; /* Full height of the book */
  position: relative; /* For absolutely positioned children */
  /* box-shadow: 0 1px 2px 0 rgba(0,0,0,0.18); */ /* Soft shadow for depth */
  border-radius: 0px; /* Rounded corners for the page frame */
  border: 0px solid rgba(0, 255, 34, 0);   /* See the frame edges clearly */
  background: rgba(255, 255, 255, 0); /* Page background color */
  padding-left : 28px ; 
  padding-right : 28px ; 
}

.book-page {
  width: 100%; /* Page fills its frame */
  height: 100%; /* Full height of the frame */
  position: relative; /* For overlay positioning */
  overflow: hidden; /* Hide anything outside the page */

}

.page-image {
  width: 100%; /* Image fills the page */
  height: 100%; /* Full height of the page */
  object-fit: cover; /* Image covers the whole area, cropping if needed */
  border: 0px solid rgb(243, 177, 35);   /* See the frame edges clearly */
}

.page-overlay {
  position: absolute; /* Sits on top of the page image */
  top: 0; /* Start at top edge */
  left: 0; /* Start at left edge */
  width: 100%; /* Overlay covers the whole page */
  height: 100%; /* Overlay covers the whole page */
  object-fit: cover; /* Overlay image covers the area */
}

.turning-page {
  position: absolute; /* Floats above the book for animation */
  /* Match the static frame width to avoid any size jump while flipping */
  /* width: calc((100% - var(--page-gap)) / 2); */
  width: 50%;
  height: 100%; /* Full hzeight of the book */
  transform-style: preserve-3d; /* Enables 3D flipping */
  z-index: 10; /* Sits above other elements */
  will-change: transform; /* Hint for smoother animation */
}

.turning-page.forward {
  right: 0; /* Attach to right edge (like holding a page at the right) */
  transform-origin: left center; /* Flip around the left edge */
  animation: flipForward 950ms ease-in-out forwards; /* Play forward flip animation */
}

.turning-page.backward {
  left: 0; /* Attach to left edge (like holding a page at the left) */
  transform-origin: right center; /* Flip around the right edge */
  animation: flipBackward 950ms ease-in-out forwards; /* Play backward flip animation */
}

.turning-page-front, .turning-page-back {
  position: absolute; /* Fill the flipping page */
  width: 100%; /* Full width */
  height: 100%; /* Full height */
  backface-visibility: hidden; /* Hide the back when facing away */
}

/* Inside the turning faces, make the inner frame fill the face exactly */
.turning-page-front .page-frame,
.turning-page-back .page-frame {
  width: 100%;
  height: 100%;
  
}

.turning-page-back {
  transform: rotateY(180deg); /* Back side is rotated for 3D effect */
  
}

@keyframes flipForward {
  from { transform: rotateY(0); } /* Start flat */
  to { transform: rotateY(-180deg); } /* Flip to the back */
}

@keyframes flipBackward {
  from { transform: rotateY(0); } /* Start flat */
  to { transform: rotateY(180deg); } /* Flip to the back (opposite direction) */
}
</style>