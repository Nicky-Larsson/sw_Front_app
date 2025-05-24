<template>
    <div 
        :id="`${volume.product_uid.volume_uid}`"
        :class="[
            'bg-white inline-block rounded cursor-pointer hover:shadow-[0_0_10px_3px_rgba(0,0,0,0.15)]',
            hasAccess ? 'border-2 border-green-600' : ''
        ]"
    >

        <NuxtLink :to="{
                          path: `/Fanoorassm/${volume.product_uid.graphic_novel_uid}/volume/${volume.product_uid.volume_uid}`
                          // query: volume
                        }">   

            <img 
                class="rounded-t h-70 w-52 object-cover"
                :src="volume.thumbnail"
            >

            <div id="ProductDetails">
            
                <p class="px-1 pt-0.5 text-2xl text- text-[#252525]">
                    {{ volume.volume_name.substring(0,60) }}
                </p>


                <span class="flex items-center justify-center gap-3 px-1  pt-1 pb-2 ">
                    <span class="text-red-700 text-2xl font-semibold">{{ priceComputed }}€</span>

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

            </div>
        </NuxtLink>

            <div :class="hasAccess ? 'bg-green-200' : isInCart ? 'bg-gray-100' : 'bg-yellow-300'" class="px-1 pb-1">
                <button
                    v-if="!hasAccess && !isInCart"
                    class="flex items-center justify-center text-[#052e20] text-xl font-semibold w-full py-2 px-5 border-2 border-[#052e20] rounded whitespace-nowrap"
                    @click.stop="$emit('add-to-cart', volume)"
                    type="button"
                >
                    <Icon name="hugeicons:shopping-basket-add-03" size="150%" />
                    <span class="ml-2">Add to Cart</span>
                </button>
                <NuxtLink
                    v-else-if="!hasAccess && isInCart"
                    :to="productLink"
                    class="flex items-center justify-center text-[#053021] text-xl font-semibold w-full py-2 px-5  border-2 border-[#053021] rounded"
                >
                    <Icon name="mdi:cart-check" size="150%" />
                    <span class="ml-2">Is Added</span>
                </NuxtLink>
                <NuxtLink
                    v-else
                    :to="productLink"
                    class="flex items-center justify-center text-[#072e21] text-xl font-semibold w-full py-2 pr-1  border-2 border-[#072e21] rounded"
                >
                    <Icon name="streamline:book-reading" size="120%" />
                    <span class="ml-2">Read</span>
                </NuxtLink>
            </div>
        
        <div class="px-5 mt-3"></div>

        <!-- <Icon name="ri:earth-line"  size="150%" /> -->
    </div>
</template>

<script setup>
import { toRefs, computed } from 'vue';
import { useStoreUser } from '@/stores/storeUser';

const props = defineProps(['volume', 'hasAccess', 'isInCart']);

const emit = defineEmits(['add-to-cart']);


const { volume, hasAccess, isInCart } = toRefs(props);

const priceComputed = computed(() => {
  return volume.value.price / 100;
});



const productLink = computed(() => 
    `/Fanoorassm/${volume.value.product_uid.graphic_novel_uid}/volume/${volume.value.product_uid.volume_uid}`
);



</script>
