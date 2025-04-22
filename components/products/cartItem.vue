<template>
    <div class="flex justify-start my-2">
        <div class="my-auto">
            <div 
                @mouseenter="isHover = true"
                @mouseleave="isHover = false"
                class="flex items-center justify-start p-0.5 cursor-pointer"
            >
                <div 
                    @click="toggleSelection"
                    class=" flex items-center justify-center h-[25px] w-[25px] rounded-full border mr-5 ml-2"
                    :class="[
                        isHover ? 'border-[#FD374F]' : 'border-gray-900',
                        isSelected ? 'bg-[#FD374F]' : ''
                    ]"
                >
                <!-- <p>Is Selected: {{ isSelected }}</p> -->
                    <div class="h-[8px] w-[8px] rounded-full bg-white" />
                </div>
            </div>
        </div>

        <img 
            class="rounded-md md:w-[150px] w-[90px]" 
            :src="product.thumbnail"
        >

        <div class="overflow-hidden pl-2 w-full">
            <div class="flex items-center justify-between w-full">
                <!-- <div class="flex items-center justify-between truncate">
                    <span class="sm:block hidden bg-[#FD374F] text-white text-[9px] font-semibold px-1.5 rounded-sm min-w-[80px]">Welcome Deal</span>
                    <br>
                </div> -->
                   <div class="truncate sm:pl-5 font-bold text-2xl">{{ product.graphic_novel_name}}</div>
                <button 
                    @click="removeFromCart()"
                    class="mx-3 sm:block hidden -mt-0.5 hover:text-red-500"
                >
                    <Icon name="material-symbols:delete-outline" size="20" />
                </button>
            </div>

                   <span class="truncate sm:pl-5 text-2xl">{{ product.volume_name }}

                   </span>
                   <br>
                    <span class="truncate sm:pl-5 text-xl ">{{ product.volume_title }}</span>
            <br>
            <div class="flex items-center">
                <!-- Display the language image -->
                <div class="truncate text-xl pl-5">{{ languageImage?.text || product.language }}</div>
                <img 
                    v-if="languageImage" 
                    :src="languageImage.image" 
                    :alt="languageImage.alt" 
                    class="h-6 w-6 rounded-full ml-2"
                >

            </div>
            <br>
            <div class="text-xl font-semibold">
                <span class="font-bold pl-5">{{ product.price / 100 }}  €</span>
            </div>
            <p class="text-[#009A66] text-xs font-semibold pt-1">
            </p>


            <div class="flex items-center justify-end">
                <button 
                    @click="removeFromCart"
                    class="sm:hidden block -mt-0.5 hover:text-red-500"
                >
                    <Icon name="material-symbols:delete-outline" size="20" />
                </button>
            </div>
        </div>
    </div>
    <!-- {{product}} -->
</template>

<script setup>
import { useStoreUser } from '@/stores/storeUser'
import { ref, computed, reactive, toRefs } from 'vue'


const userStore = reactive(useStoreUser())

// const props = defineProps(['product', 'selectedArray'])

const languages = ref([
  { id: 'ar', image: '/flags/ar_flag.jpg', alt: 'Arabic',   text: 'Arabic' },
  { id: 'ma', image: '/flags/ma_flag.jpg', alt: 'Morrocan', text: 'Darija' },
  { id: 'en', image: '/flags/en_flag.jpg', alt: 'English',  text: 'English'},
  { id: 'fr', image: '/flags/fr_flag.jpg', alt: 'French',   text: 'French' }
])


const props = defineProps({
  product: Object,
  isSelected: Boolean, // Receive isSelected as a prop
});

const { product, selectedArray } = toRefs(props)

const emit = defineEmits(['selectedRadio', 'remove']); // Emit events to the parent


let isHover = ref(false)

const toggleSelection = () => {
  // emit('selectedRadio', props.product);
  emit('selectedRadio', props.product);
console.log('Toggling selection for:', props.product);

}


/* watch(() => isSelected.value, (val) => {
    // emit('selectedRadio', { id: product.value.id, val: val })
    emit('selectedRadio', product.value)
}) */

// Computed property to find the corresponding language object
const languageImage = computed(() => {
  return (
    languages.value.find((lang) => lang.id === product.value.language) || null
  )
})


const removeFromCart = () => {
  emit('remove', props.product); // Notify the parent to remove the item
};


/* 
const removeFromCart = () => {
  // Remove the item from the cart
  userStore.userSession.cart = userStore.userSession.cart.filter(
    (prod) =>
      prod.graphic_novel_uid !== product.value.graphic_novel_uid ||
      prod.volume_uid !== product.value.volume_uid ||
      prod.volume_name !== product.value.volume_name ||
      prod.product_uid !== product.value.product_uid
  )

  // Update the selectedArray to match the updated cart
  selectedArray.value = selectedArray.value.filter(
    (selected) =>
      selected.graphic_novel_uid !== product.value.graphic_novel_uid ||
      selected.volume_uid !== product.value.volume_uid ||
      selected.volume_name !== product.value.volume_name ||
      selected.product_uid !== product.value.product_uid
  )
}
 */





/*   for (const prod of userStore.userSession.cart) {
    if (
      productInfosForCart.value.graphic_novel_uid === prod.graphic_novel_uid &&
      productInfosForCart.value.volume_uid === prod.volume_uid &&
      productInfosForCart.value.product_uid === prod.product_uid
    ) {
      return true; // Product is in the cart
    }
  } */

</script>


