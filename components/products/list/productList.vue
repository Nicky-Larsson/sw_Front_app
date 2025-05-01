<template>
    <div 
        :id="`productList${volume.id}`"
        class="
            bg-white 
            inline-block 
            rounded 
            hover:shadow-[0_0_10px_3px_rgba(0,0,0,0.15)] 
            cursor-pointer
        "
    >

        <NuxtLink :to="{
                        path: `/Fanoorassm/${volume.graphic_novel_uid}/volume/${volume.volume_uid}`
                        // query: volume
                        }">   

         <img 
                class="rounded-t h-60 w-50 object-cover"
                :src="volume.thumbnail"
            >

            <div id="ProductDetails">
            
                <p class="px-1 pt-0.5 text-xl text- text-[#252525]">
                    {{ volume.volume_name.substring(0,60) }}
                </p>


                <span class="flex items-center justify-center gap-3 px-1  pt-1 pl-5">
                    <span class="text-[#FF6674] text-2xl font-semibold">{{ priceComputed }}€</span>
                    <span class="text-gray-500 text-sm text-light line-through">{{ oldPriceComputed }} €</span>
                </span>

                <!-- <span class="px-1 relative -top-1.5 text-[#FF6674] text-xs font-semibold">
                    Extra 5% off
                </span>

                <div class="flex items-center gap-1 px-1 relative -top-1">
                    <span class="bg-[#FD374F] text-white text-[9px] font-semibold px-1.5 rounded-sm">Welcome Deal</span>
                    <span class="bg-[#F5F5F5] border text-[#C08562] text-[9px] font-semibold px-1.5 rounded-sm">Top Selling</span>
                </div> 

                <p class="flex items-center px-1 pt-0.5 text-xs text-[#252525]">
                    5,000+ sold <Icon name="material-symbols:star-rate" color="#757575" class="ml-1.5"/> 4.7
                </p> -->


                <p class="px-1 pb-1">
                <button
                    class="text-[#009A66] text-xl font-semibold"
                    @click.stop="$emit('add-to-cart', volume)"
                    type="button"
                >
                    Add to Cart
                </button>
                </p>

            </div>
        </NuxtLink>
    </div>
</template>

<script setup>
import { toRefs, computed } from 'vue';

const props = defineProps(['volume']);
const { volume } = toRefs(props);

const emit = defineEmits(['add-to-cart']);

const priceComputed = computed(() => {
  return volume.value.price / 100;
});

const oldPriceComputed = computed(() => {
  let res = (volume.value.price + (volume.value.price / 20)) / 100;
  return res.toFixed(2);
});
</script>
