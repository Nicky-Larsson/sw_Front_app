<template>
  <div class="w-full h-full relative">
    <div ref="flipbookEl" class="w-full h-full">
      <div 
        v-for="(page, i) in pages" 
        :key="`page-${i}`"
        class="page-element"
        :style="getPageStyle(i)"
      >
        <img 
          :src="page.image_url" 
          class="w-full h-full object-contain"
          :alt="`Page ${i + 1}`"
          crossorigin="anonymous"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue';
import { PageFlipCore } from '../scripts/pageFlipCore';

const props = defineProps({
  pages: { type: Array, required: true },
  currentPage: { type: Number, default: 0 },
  rtl: { type: Boolean, default: false },
});

const emit = defineEmits(['update:currentPage', 'page-flip']);

const flipbookEl = ref(null);
let flipCore = null;

const getPageStyle = (index) => ({
  position: 'absolute',
  width: '50%',
  height: '100%',
  top: 0,
  left: (index % 2 === 0) ? '0' : '50%',
  display: 'block',
});

onMounted(async () => {
  await nextTick();
  if (!flipbookEl.value) {
    console.error("CoreFlipBook Error: Root element not found.");
    return;
  }

  // Wait for all images inside the flipbook to load
  await Promise.all(
    Array.from(flipbookEl.value.querySelectorAll('img')).map(img => {
      if (img.complete) return Promise.resolve();
      return new Promise(resolve => {
        img.onload = img.onerror = resolve;
      });
    })
  );

flipCore = new PageFlipCore(flipbookEl.value, { rtl: props.rtl });
  const pageElements = Array.from(flipbookEl.value.querySelectorAll('.page-element'));
  
  await flipCore.setPages(pageElements);
  flipCore.setPage(props.currentPage);

  flipCore.on('flip', (data) => {
    emit('update:currentPage', data.page);
    emit('page-flip', data.page);
  });
});

watch(() => props.currentPage, (newPage) => {
  if (flipCore) {
    flipCore.setPage(newPage);
  }
});
</script>

<style scoped>
.page-element {
  position: absolute !important;
  transition: transform 0.6s ease !important;
  background-color: transparent;
  box-shadow: none;
  border: none;
  visibility: visible !important;
  display: block !important;
  opacity: 1 !important;
  pointer-events: auto !important;
  z-index: 1 !important;
  transform: none !important;
}

/* Add this NEW rule to override inline visibility */
div[id="flipbook-container"] .page-element {
  visibility: visible !important;
  display: block !important;
}

img {
  pointer-events: none;
  user-select: none;
  -webkit-user-drag: none;
  max-height: 100%;
  max-width: 100%;
}

div[id="flipbook-container"] {
  position: relative;
  width: 100%;
  height: 100%;
  background-color: white;
}
</style>