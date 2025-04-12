<template>
    <div class="flex justify-start my-2">
        <div class="my-auto">
            <div 
                @mouseenter="isHover = true"
                @mouseleave="isHover = false"
                class="flex items-center justify-start p-0.5 cursor-pointer"
            >
                <div 
                    @click="isSelected = !isSelected"
                    class=" flex items-center justify-center h-[20px] w-[20px] rounded-full border mr-5 ml-2"
                    :class="[
                        isHover ? 'border-[#FD374F]' : 'border-gray-900',
                        isSelected ? 'bg-[#FD374F]' : ''
                    ]"
                >
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
            <br>
            <br>
            <div class="text-xl font-semibold">
                <span class="font-bold pl-5">{{ product.price / 100 }}  €</span>
            </div>
            <p class="text-[#009A66] text-xs font-semibold pt-1">
            </p>


            <div class="flex items-center justify-end">
                <button 
                    @click="removeFromCart()"
                    class="sm:hidden block -mt-0.5 hover:text-red-500"
                >
                    <Icon name="material-symbols:delete-outline" size="20" />
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { useStoreUser } from '@/stores/storeUser';
const userStore = reactive(useStoreUser())

const props = defineProps(['product', 'selectedArray'])
const { product, selectedArray } = toRefs(props)

const emit = defineEmits(['selectedRadio'])

let isHover = ref(false)
let isSelected = ref(false)

const removeFromCart = () => {
    userStore.userSession.cart.forEach((prod, index) => {
        if (prod.id === product.value.id) {
            userStore.userSession.cart.splice(index, 1);
        }
    })
}

watch(() => isSelected.value, (val) => {
    emit('selectedRadio', { id: product.value.id, val: val })
})
</script>
