<template>
   <client-only>
    <div class="bg-amber-600 container mx-auto pt-2 md:w-[85%]">
      <div class="flex flex-col text-amber-50 p-0 text-4xl block">

        <h1 v-if="storeProducts.products.length > 0" class="text-8xl "> {{storeProducts.products[0].name}}</h1>
        <div  class="mt-4 max-w-[1200px] mx-auto px-2">
            <div v-if="storeProducts.products" class="grid xl:grid-cols-4 lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-2 grid-cols-1 gap-23">
                <div v-for="volume in storeProducts.products" :key="volume">
                    <productList :volume="volume"  />
                </div>
            </div>
        </div>


       <div> 
            <h2 class="text-4xl">  Simo Warch App  </h2>
            <br>   
            <NuxtLink :to="`/Fanoorassm/${librarySet_1.grapicNovel}`">
                Présentation Oeuvre
            </NuxtLink>

            <NuxtLink :to="`/Fanoorassm/${librarySet_1.grapicNovel}/volume/${librarySet_1.volume_num}`">
                Tome
            </NuxtLink>

            <NuxtLink :to="`/Fanoorassm/${librarySet_1.grapicNovel}/volume/${librarySet_1.volume_num}
                                                                   /chapter/${librarySet_1.chapter_num}`">
                Chapiter
            </NuxtLink>

            <NuxtLink :to="`/Fanoorassm/${librarySet_1.grapicNovel}/artworks/arc/${librarySet_1.arc_name}
                                                                   /figurine/${librarySet_1.figurine_name}`">
                Figurine
            </NuxtLink>

            <NuxtLink :to="`/Fanoorassm/${librarySet_1.grapicNovel}/artworks/arc/${librarySet_1.grapicNovel}
                                                                   /illustration/${librarySet_1.illustration_name}`">
                Illustration
            </NuxtLink>

            <NuxtLink :to="`/Fanoorassm/magazine/${librarySet_1.magazine_num}`">
                Magazine
            </NuxtLink>
        </div>

      </div>
    </div>
    </client-only>
</template>

<script setup>
import { ref } from 'vue'
import { onMounted } from 'vue'
import { useStoreProducts } from '@/stores/storeProducts'

import { useStoreUser } from '@/stores/storeUser';

const userStore = useStoreUser()
console.log("userStore Cart from < List Book >" , userStore.userSession.cart);

// onBeforeMount(async () => {

const storeProducts = useStoreProducts()
// storeProducts.getProducts()

onMounted(() => {
    storeProducts.getProducts()
})


console.log("storeProducts", storeProducts.products);

const librarySet_1 = reactive({
                                    grapicNovel: "sunsetLand",
                                    volume_num: 3,
                                    chapter_num: 4,
                                    figurine_name: "tbourida",
                                    arc_name: "Lghoula",
                                    illustration_name: "Entrer to Fes Jdid",
                                    magazine_num: 1
                                })




/* const graphicNovelStore = ref(
      [{ id:1,
        name: "Sunset Land",
        volumes: [
                    {  id:15444,
                       name: "sunsetLand",
                       volume_num: 1,
                       title: "volume 1",
                       description: "Les Dragon Ball, boules de cristal magiques, offrent à celui qui les détient la possibilité de réaliser tous ses voeux. Bien sûr la quête que mène Sangoku et ses amis pour les réunir n'est pas sans obstacles : tournois et combats rythment chaque tome de cette série-culte pour les jeunes adolescents. Scénarios et dialogues assez simples centrés sur la confrontation entre les différents protagonistes. Les textes se résument parfois aux cris des combattants mais le succès de la série dépasse largement cela, pour en faire un véritable mythe auprès de la jeune génératio",
                       thumbnail: "https://sxlfmjwipdqjmkhslfql.supabase.co/storage/v1/object/sign/products/Volume_1/Tome_01_cover_mini.jpg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJwcm9kdWN0cy9Wb2x1bWVfMS9Ub21lXzAxX2NvdmVyX21pbmkuanBnIiwiaWF0IjoxNzQzMjA0MDcxLCJleHAiOjE3NzQ3NDAwNzF9.Ul1EHX6YlFQjtFk1IX_yvrFi11uBGb-AW6UdEIchVOI",
                       cover: "https://sxlfmjwipdqjmkhslfql.supabase.co/storage/v1/object/sign/products/Volume_1/Tome_01_cover.jpg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJwcm9kdWN0cy9Wb2x1bWVfMS9Ub21lXzAxX2NvdmVyLmpwZyIsImlhdCI6MTc0MzIwMzkxNywiZXhwIjoxNzc0NzM5OTE3fQ.4qLIAO531DOX1ubLsXHk1E34rVU0wbIY7FvdTPaNHv4",
                       preview: [ "https://sxlfmjwipdqjmkhslfql.supabase.co/storage/v1/object/sign/products/Volume_1/Tome_01_preview_01.jpg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJwcm9kdWN0cy9Wb2x1bWVfMS9Ub21lXzAxX3ByZXZpZXdfMDEuanBnIiwiaWF0IjoxNzQzMjA0MTUyLCJleHAiOjE3NzQ3NDAxNTJ9.704EJGYdiNPIR1Q3GB7UHukewCOsnMoTrtrgfGwFMEU",
                                  "https://sxlfmjwipdqjmkhslfql.supabase.co/storage/v1/object/sign/products/Volume_1/Tome_01_preview_02.jpg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJwcm9kdWN0cy9Wb2x1bWVfMS9Ub21lXzAxX3ByZXZpZXdfMDIuanBnIiwiaWF0IjoxNzQzMjA0MTgyLCJleHAiOjE3NzQ3NDAxODJ9.-nqNDC9PED1iTVVwMeUTVYfCZAhkSrzeSGWec2nJ5mU",
                                  "https://sxlfmjwipdqjmkhslfql.supabase.co/storage/v1/object/sign/products/Volume_1/Tome_01_preview_03.jpg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJwcm9kdWN0cy9Wb2x1bWVfMS9Ub21lXzAxX3ByZXZpZXdfMDMuanBnIiwiaWF0IjoxNzQzMjA0MjMwLCJleHAiOjE3NzQ3NDAyMzB9.sgBipbmbUEQeHD--J8mDYUnD8pGjVW7q1K8YmWwToDs",
                                  "https://sxlfmjwipdqjmkhslfql.supabase.co/storage/v1/object/sign/products/Volume_1/Tome_01_preview_04.jpg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJwcm9kdWN0cy9Wb2x1bWVfMS9Ub21lXzAxX3ByZXZpZXdfMDQuanBnIiwiaWF0IjoxNzQzMjA0MjU0LCJleHAiOjE3NzQ3NDAyNTR9.FNUyc0kVqI23E9TWl-_NG_Xj8f8Gj8bT_waWM7Hg0D4",
                                  "https://sxlfmjwipdqjmkhslfql.supabase.co/storage/v1/object/sign/products/Volume_1/Tome_01_preview_05.jpg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJwcm9kdWN0cy9Wb2x1bWVfMS9Ub21lXzAxX3ByZXZpZXdfMDUuanBnIiwiaWF0IjoxNzQzMjA0MjY0LCJleHAiOjE3NzQ3NDAyNjR9.Cd8YhOWD0Ov_RTgGomA8ROare5yyFo3NGcDtnGK6Ax8",
                                  "https://sxlfmjwipdqjmkhslfql.supabase.co/storage/v1/object/sign/products/Volume_1/Tome_01_preview_06.jpg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJwcm9kdWN0cy9Wb2x1bWVfMS9Ub21lXzAxX3ByZXZpZXdfMDYuanBnIiwiaWF0IjoxNzQzMjA0MzAxLCJleHAiOjE3NzQ3NDAzMDF9.I-tUiD19sR2TplqnDb_EnStnY6NmfJHKEnpKPcLUJYk"],
                       price: 299,
                       chapters: []
                    },
                    {  id:15445,
                       name: "sunsetLand",
                       volume_num: 2,
                       title: "volume 2",
                       description: "this is a description",
                       thumbnail: "https://sxlfmjwipdqjmkhslfql.supabase.co/storage/v1/object/sign/products/Volume_2/Tome_02_cover_mini.jpg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJwcm9kdWN0cy9Wb2x1bWVfMi9Ub21lXzAyX2NvdmVyX21pbmkuanBnIiwiaWF0IjoxNzQzMjA0NDYwLCJleHAiOjE3NzQ3NDA0NjB9.il9heDatlCPq4lfNX8eKTrmLk_ULbMxB4wIz-2munZE",
                       cover: "https://sxlfmjwipdqjmkhslfql.supabase.co/storage/v1/object/sign/products/Volume_2/Tome_02_cover.jpg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJwcm9kdWN0cy9Wb2x1bWVfMi9Ub21lXzAyX2NvdmVyLmpwZyIsImlhdCI6MTc0MzIwNDQ0NSwiZXhwIjoxNzc0NzQwNDQ1fQ.mz8ZefCA23YOGzotYWqXY0-qEuRCEHhqlBi8Xp31sno",
                       preview: [ "https://sxlfmjwipdqjmkhslfql.supabase.co/storage/v1/object/sign/products/Volume_2/Tome_02_preview_01.jpg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJwcm9kdWN0cy9Wb2x1bWVfMi9Ub21lXzAyX3ByZXZpZXdfMDEuanBnIiwiaWF0IjoxNzQzMjA0NDc1LCJleHAiOjE3NzQ3NDA0NzV9.xFyeNjOd0CEi0rH7XDyurkWB_03whTJ2IUhNrjtLedQ",
                                  "https://sxlfmjwipdqjmkhslfql.supabase.co/storage/v1/object/sign/products/Volume_2/Tome_02_preview_01.jpg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJwcm9kdWN0cy9Wb2x1bWVfMi9Ub21lXzAyX3ByZXZpZXdfMDEuanBnIiwiaWF0IjoxNzQzMjA0NDc1LCJleHAiOjE3NzQ3NDA0NzV9.xFyeNjOd0CEi0rH7XDyurkWB_03whTJ2IUhNrjtLedQ",
                                  "https://sxlfmjwipdqjmkhslfql.supabase.co/storage/v1/object/sign/products/Volume_2/Tome_02_preview_03.jpg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJwcm9kdWN0cy9Wb2x1bWVfMi9Ub21lXzAyX3ByZXZpZXdfMDMuanBnIiwiaWF0IjoxNzQzMjA0NDk2LCJleHAiOjE3NzQ3NDA0OTZ9.czQ7evONjnV2wArEoQqxwe2ubK-k4EuvXf2DysERy1s",
                                  "https://sxlfmjwipdqjmkhslfql.supabase.co/storage/v1/object/sign/products/Volume_2/Tome_02_preview_04.jpg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJwcm9kdWN0cy9Wb2x1bWVfMi9Ub21lXzAyX3ByZXZpZXdfMDQuanBnIiwiaWF0IjoxNzQzMjA0NTA2LCJleHAiOjE3NzQ3NDA1MDZ9.hl3rmN5R_4cZByF1dFE7q13inOGQhE9Vsziur2VRffQ",
                                  "https://sxlfmjwipdqjmkhslfql.supabase.co/storage/v1/object/sign/products/Volume_2/Tome_02_preview_04.jpg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJwcm9kdWN0cy9Wb2x1bWVfMi9Ub21lXzAyX3ByZXZpZXdfMDQuanBnIiwiaWF0IjoxNzQzMjA0NTA2LCJleHAiOjE3NzQ3NDA1MDZ9.hl3rmN5R_4cZByF1dFE7q13inOGQhE9Vsziur2VRffQ"],
                       price: 299,
                       chapters: []
                    },
                    {  id:15446,
                       name: "sunsetLand",
                       volume_num: 3,
                       title: "volume 3",
                       description: "this is a description",
                       thumbnail: "https://sxlfmjwipdqjmkhslfql.supabase.co/storage/v1/object/sign/products/Volume_3/Tome_03_cover_mini.jpg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJwcm9kdWN0cy9Wb2x1bWVfMy9Ub21lXzAzX2NvdmVyX21pbmkuanBnIiwiaWF0IjoxNzQzMjA0NjIxLCJleHAiOjE3NzQ3NDA2MjF9.ltIBP-imD88LmJ9W5MS03__GdtOb3bUcQL6oKXJ8DzY",
                       cover: "https://sxlfmjwipdqjmkhslfql.supabase.co/storage/v1/object/sign/products/Volume_3/Tome_03_cover.jpg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJwcm9kdWN0cy9Wb2x1bWVfMy9Ub21lXzAzX2NvdmVyLmpwZyIsImlhdCI6MTc0MzIwNDYwOCwiZXhwIjoxNzc0NzQwNjA4fQ.efV1XXvzyxziJrxzW8dgYH6CNkZ9LEsrviwcP9KvAas",
                       preview: [ "https://sxlfmjwipdqjmkhslfql.supabase.co/storage/v1/object/sign/products/Volume_3/Tome_03_preview_01.jpg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJwcm9kdWN0cy9Wb2x1bWVfMy9Ub21lXzAzX3ByZXZpZXdfMDEuanBnIiwiaWF0IjoxNzQzMjA0NjMzLCJleHAiOjE3NzQ3NDA2MzN9.8gmWeV17Ko9f0Jx7A8yS3mViUyKxUtD6BaW2DZyeCjQ",
                                  "https://sxlfmjwipdqjmkhslfql.supabase.co/storage/v1/object/sign/products/Volume_3/Tome_03_preview_02.jpg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJwcm9kdWN0cy9Wb2x1bWVfMy9Ub21lXzAzX3ByZXZpZXdfMDIuanBnIiwiaWF0IjoxNzQzMjA0NjQzLCJleHAiOjE3NzQ3NDA2NDN9.Nb0jlBSEkYV8Ft94lNS0d0dS_wjd7DLRNh92bJNzO4Q",
                                  "https://sxlfmjwipdqjmkhslfql.supabase.co/storage/v1/object/sign/products/Volume_3/Tome_03_preview_03.jpg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJwcm9kdWN0cy9Wb2x1bWVfMy9Ub21lXzAzX3ByZXZpZXdfMDMuanBnIiwiaWF0IjoxNzQzMjA0NjU0LCJleHAiOjE3NzQ3NDA2NTR9.b14grFEC2bQXQuOeA5CR579CN3oMCEUqnIfFNwca9kI",
                                  "https://sxlfmjwipdqjmkhslfql.supabase.co/storage/v1/object/sign/products/Volume_3/Tome_03_preview_04.jpg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJwcm9kdWN0cy9Wb2x1bWVfMy9Ub21lXzAzX3ByZXZpZXdfMDQuanBnIiwiaWF0IjoxNzQzMjA0NjYyLCJleHAiOjE3NzQ3NDA2NjJ9.RCP8wxGb8K5LlW7khEReh6ZPnFWikupjocfrR9R2Otc",
                                  "https://sxlfmjwipdqjmkhslfql.supabase.co/storage/v1/object/sign/products/Volume_3/Tome_03_preview_05.jpg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJwcm9kdWN0cy9Wb2x1bWVfMy9Ub21lXzAzX3ByZXZpZXdfMDUuanBnIiwiaWF0IjoxNzQzMjA0NjcxLCJleHAiOjE3NzQ3NDA2NzF9.o4LOHNdmaWV-cUcJFvY8Hw3o1dFilyhonFgExuII4dY",
                                  "https://sxlfmjwipdqjmkhslfql.supabase.co/storage/v1/object/sign/products/Volume_3/Tome_03_preview_06.jpg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJwcm9kdWN0cy9Wb2x1bWVfMy9Ub21lXzAzX3ByZXZpZXdfMDYuanBnIiwiaWF0IjoxNzQzMjA0NjgzLCJleHAiOjE3NzQ3NDA2ODN9.jFHEWaC9m7C7B5M5ppVJBDpCk9Tz8mKz9wviXlM23-4"],
                       price: 299,
                       chapters: []
                    },
                    {  id:15447,
                       name: "sunsetLand",
                       volume_num: 4,
                       title: "volume 4",
                       description: "this is a description",
                       thumbnail: "https://sxlfmjwipdqjmkhslfql.supabase.co/storage/v1/object/sign/products/Volume_4/Tome_04_cover_mini.jpg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJwcm9kdWN0cy9Wb2x1bWVfNC9Ub21lXzA0X2NvdmVyX21pbmkuanBnIiwiaWF0IjoxNzQzMjA0NzYzLCJleHAiOjE3NzQ3NDA3NjN9.Ki2MIUEIEek0gQyDcrOJvKRuBHBgFHt2RCo0AAN573k",
                       cover: "https://sxlfmjwipdqjmkhslfql.supabase.co/storage/v1/object/sign/products/Volume_4/Tome_04_cover.jpg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJwcm9kdWN0cy9Wb2x1bWVfNC9Ub21lXzA0X2NvdmVyLmpwZyIsImlhdCI6MTc0MzIwNDc1MCwiZXhwIjoxNzc0NzQwNzUwfQ.NPABFEAhqEGQ5rfqux6D4cEinrR4XMAy_uc4scbH0oI",
                       preview: [ "https://sxlfmjwipdqjmkhslfql.supabase.co/storage/v1/object/sign/products/Volume_4/Tome_04_preview_01.jpg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJwcm9kdWN0cy9Wb2x1bWVfNC9Ub21lXzA0X3ByZXZpZXdfMDEuanBnIiwiaWF0IjoxNzQzMjA0NzczLCJleHAiOjE3NzQ3NDA3NzN9.Kl1Wzai6TvwnFMP6W9fs2y-l9nxYBXyY1oaIhcvTSZk",
                                  "https://sxlfmjwipdqjmkhslfql.supabase.co/storage/v1/object/sign/products/Volume_4/Tome_04_preview_02.jpg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJwcm9kdWN0cy9Wb2x1bWVfNC9Ub21lXzA0X3ByZXZpZXdfMDIuanBnIiwiaWF0IjoxNzQzMjA0NzgyLCJleHAiOjE3NzQ3NDA3ODJ9.7j5woRoVezpwz9LV9yit1Zn87B7uBU5FX4Vx6sNwuYs",
                                  "https://sxlfmjwipdqjmkhslfql.supabase.co/storage/v1/object/sign/products/Volume_4/Tome_04_preview_03.jpg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJwcm9kdWN0cy9Wb2x1bWVfNC9Ub21lXzA0X3ByZXZpZXdfMDMuanBnIiwiaWF0IjoxNzQzMjA0NzkyLCJleHAiOjE3NzQ3NDA3OTJ9.zHycUp1gKHhFb31ENJdnQ6p4eBGIYQg2_PiB6MpObJo",
                                  "https://sxlfmjwipdqjmkhslfql.supabase.co/storage/v1/object/sign/products/Volume_4/Tome_04_preview_04.jpg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJwcm9kdWN0cy9Wb2x1bWVfNC9Ub21lXzA0X3ByZXZpZXdfMDQuanBnIiwiaWF0IjoxNzQzMjA0ODAxLCJleHAiOjE3NzQ3NDA4MDF9.Om4eArg2CHKuWskH3EWcnugGvuNzh7Q7jY3mAkgwmN8",
                                  "https://sxlfmjwipdqjmkhslfql.supabase.co/storage/v1/object/sign/products/Volume_4/Tome_04_preview_05.jpg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJwcm9kdWN0cy9Wb2x1bWVfNC9Ub21lXzA0X3ByZXZpZXdfMDUuanBnIiwiaWF0IjoxNzQzMjA0ODEwLCJleHAiOjE3NzQ3NDA4MTB9.jOxHe-u0JaJVvreq0Ll5n6B4D9akeHKt6J_eqQz-j58"],
                       price: 299,
                       chapters: []
                    },
                    {  id:15458,
                       name: "sunsetLand",
                       volume_num: 5,
                       title: "volume 5",
                       description: "L'issue du championnat du monde des arts martiaux approche. Qui de Sangoku ou de Tortue Géniale l'emportera ? Les paris sont ouverts. La foule fiévreuse supporte tour à tour chacun des combattants. L'épreuve de force est engagée et le suspense bat son plein... Cet épisode des aventures de Sangoku met fin au cycle concernant l'obtention du titre de champion du monde des arts martiaux, et préfigure les prémices d'une nouvelle aventure de grande envergure. Une transition à ne pas rater !",
                       thumbnail: "https://sxlfmjwipdqjmkhslfql.supabase.co/storage/v1/object/sign/products/Volume_5/Tome_05_cover_mini.jpg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJwcm9kdWN0cy9Wb2x1bWVfNS9Ub21lXzA1X2NvdmVyX21pbmkuanBnIiwiaWF0IjoxNzQzMjA0OTE3LCJleHAiOjE3NzQ3NDA5MTd9.wGFg9aWBvLGUdA2fP3J1cVv7gGI_39HFDO0hwqhWZu4",
                       cover: "https://sxlfmjwipdqjmkhslfql.supabase.co/storage/v1/object/sign/products/Volume_5/Tome_05_cover.jpg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJwcm9kdWN0cy9Wb2x1bWVfNS9Ub21lXzA1X2NvdmVyLmpwZyIsImlhdCI6MTc0MzIwNDkwMiwiZXhwIjoxNzc0NzQwOTAyfQ.JjecHIumMnPXksTXONvgco1YQxSSHlBVufm-lk5C9Mw",
                       preview: [ "https://sxlfmjwipdqjmkhslfql.supabase.co/storage/v1/object/sign/products/Volume_5/Tome_05_preview_01.jpg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJwcm9kdWN0cy9Wb2x1bWVfNS9Ub21lXzA1X3ByZXZpZXdfMDEuanBnIiwiaWF0IjoxNzQzMjA0OTI2LCJleHAiOjE3NzQ3NDA5MjZ9.0i9wbbyF4XTQiUmxuyJDXR6enH1Veq7KfrQFz1pMSh8",
                                  "https://sxlfmjwipdqjmkhslfql.supabase.co/storage/v1/object/sign/products/Volume_5/Tome_05_preview_02.jpg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJwcm9kdWN0cy9Wb2x1bWVfNS9Ub21lXzA1X3ByZXZpZXdfMDIuanBnIiwiaWF0IjoxNzQzMjA0OTU0LCJleHAiOjE3NzQ3NDA5NTR9.KrUocxEzeV4yDtqiEDXhs2fM8DzLaGerxDO__LdAcx0",
                                  "https://sxlfmjwipdqjmkhslfql.supabase.co/storage/v1/object/sign/products/Volume_5/Tome_05_preview_03.jpg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJwcm9kdWN0cy9Wb2x1bWVfNS9Ub21lXzA1X3ByZXZpZXdfMDMuanBnIiwiaWF0IjoxNzQzMjA0OTYzLCJleHAiOjE3NzQ3NDA5NjN9.vVoaIvQUmfSRUuu38RxbAMmN_xD_xMuEBLsjBHZ1CJo",
                                  "https://sxlfmjwipdqjmkhslfql.supabase.co/storage/v1/object/sign/products/Volume_5/Tome_05_preview_04.jpg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJwcm9kdWN0cy9Wb2x1bWVfNS9Ub21lXzA1X3ByZXZpZXdfMDQuanBnIiwiaWF0IjoxNzQzMjA0OTc0LCJleHAiOjE3NzQ3NDA5NzR9.A8HzhJoqub3X5Vhg83mzvc60UJ7RGs0J5Dthhvk5v90",
                                  "https://sxlfmjwipdqjmkhslfql.supabase.co/storage/v1/object/sign/products/Volume_5/Tome_05_preview_05.jpg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJwcm9kdWN0cy9Wb2x1bWVfNS9Ub21lXzA1X3ByZXZpZXdfMDUuanBnIiwiaWF0IjoxNzQzMjA0OTg0LCJleHAiOjE3NzQ3NDA5ODR9.SCtRCLIzmxKvK8Lq4IMwNZ0u9nCvz5Ok5x4oV2UDPMc"],
                       price: 299,
                       chapters: []
                    },
                    {  id:18448,
                       name: "sunsetLand",
                       volume_num: 6,
                       title: "volume 6",
                       description: "Après avoir laissé échapper le titre de champion du monde des arts martiaux, Sangoku est reparti à la quête du Dragon Ball que lui avait confié son grand-père. Chemin faisant, il se heurte quelque peu aux troupes de l'armée du ruban rouge qui se trouve être la plus puissante de la galaxie. Au passage, Sangoku en profite pour venir en aide à des villageois dont le maire est retenu en otage...",
                       thumbnail: "https://sxlfmjwipdqjmkhslfql.supabase.co/storage/v1/object/sign/products/Volume_6/Tome_06_cover_mini.jpg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJwcm9kdWN0cy9Wb2x1bWVfNi9Ub21lXzA2X2NvdmVyX21pbmkuanBnIiwiaWF0IjoxNzQzMjA1MDM0LCJleHAiOjE3NzQ3NDEwMzR9.nhWwU9KSdV7bKocVZ4jA2eG1BVyg4SD-PuCQqo9LY5Y",
                       cover: "https://sxlfmjwipdqjmkhslfql.supabase.co/storage/v1/object/sign/products/Volume_6/Tome_06_cover.jpg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJwcm9kdWN0cy9Wb2x1bWVfNi9Ub21lXzA2X2NvdmVyLmpwZyIsImlhdCI6MTc0MzIwNTAyMiwiZXhwIjoxNzc0NzQxMDIyfQ.WFD9ksf5avnV25priWYcfYex1lznJTazHs7INPI55E4",
                       preview: [ "https://sxlfmjwipdqjmkhslfql.supabase.co/storage/v1/object/sign/products/Volume_6/Tome_06_preview_01.jpg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJwcm9kdWN0cy9Wb2x1bWVfNi9Ub21lXzA2X3ByZXZpZXdfMDEuanBnIiwiaWF0IjoxNzQzMjA1MDQ5LCJleHAiOjE3NzQ3NDEwNDl9.1T5P3gFKZvb5exXR4sKSC7mpis5ptMYJe1-8ZBZR7xk",
                                  "https://sxlfmjwipdqjmkhslfql.supabase.co/storage/v1/object/sign/products/Volume_6/Tome_06_preview_02.webp?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJwcm9kdWN0cy9Wb2x1bWVfNi9Ub21lXzA2X3ByZXZpZXdfMDIud2VicCIsImlhdCI6MTc0MzIwNTA2MCwiZXhwIjoxNzc0NzQxMDYwfQ.f4H53SOQRuH8ubrWvMA23AWgPjDOZBWRD9MDJjze1Y4",
                                  "https://sxlfmjwipdqjmkhslfql.supabase.co/storage/v1/object/sign/products/Volume_6/Tome_06_preview_03.webp?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJwcm9kdWN0cy9Wb2x1bWVfNi9Ub21lXzA2X3ByZXZpZXdfMDMud2VicCIsImlhdCI6MTc0MzIwNTA2NywiZXhwIjoxNzc0NzQxMDY3fQ.bK4Wen6pzqQFmCCWgukE_k8UjVlvYmZxJ9OgTf2biWY",
                                  "https://sxlfmjwipdqjmkhslfql.supabase.co/storage/v1/object/sign/products/Volume_6/Tome_06_preview_04.webp?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJwcm9kdWN0cy9Wb2x1bWVfNi9Ub21lXzA2X3ByZXZpZXdfMDQud2VicCIsImlhdCI6MTc0MzIwNTA3NiwiZXhwIjoxNzc0NzQxMDc2fQ.W0QYsSQ4i_4B_laizORgn3bm-kzuBei0oOWvpjy4g9o",
                                  "https://sxlfmjwipdqjmkhslfql.supabase.co/storage/v1/object/sign/products/Volume_6/Tome_06_preview_05.jpg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJwcm9kdWN0cy9Wb2x1bWVfNi9Ub21lXzA2X3ByZXZpZXdfMDUuanBnIiwiaWF0IjoxNzQzMjA1MDg1LCJleHAiOjE3NzQ3NDEwODV9.47U2lnuERyfSQdlXVuesQkV_z-taumMOrmQVPCIS68E"],
                       price: 299,
                       chapters: []
                    },
                    {  id:18448,
                       name: "sunsetLand",
                       volume_num: 7,
                       title: "volume 7",
                       description: "La chasse aux Dragon Balls est ouverte ! Le duel entre Sangoku et le Commandant Bleu bat son plein. Plus qu'un conflit d'intérêts, il s'agit d'une véritable lutte pour l'honneur, opposant deux combattants surdoués. C'est dans ce contexte survolté que la pétillante Arale décide de faire son apparition. Cette jeune ingénue n'est d'ailleurs pas inconnue des fans d'Akira Toriyama, puisqu'elle n'est autre que l'héroïne de sa série culte Docteur Slump.",
                       thumbnail: "https://sxlfmjwipdqjmkhslfql.supabase.co/storage/v1/object/sign/products/Volume_7/Tome_07_cover_mini.jpg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJwcm9kdWN0cy9Wb2x1bWVfNy9Ub21lXzA3X2NvdmVyX21pbmkuanBnIiwiaWF0IjoxNzQzMjA1MTM5LCJleHAiOjE3NzQ3NDExMzl9.FfLVoavjGWXcF4uuOgfqDw9l2P9FnWfzshlCYl_V0Ys",
                       cover: "https://sxlfmjwipdqjmkhslfql.supabase.co/storage/v1/object/sign/products/Volume_7/Tome_07_cover.jpg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJwcm9kdWN0cy9Wb2x1bWVfNy9Ub21lXzA3X2NvdmVyLmpwZyIsImlhdCI6MTc0MzIwNTEyMSwiZXhwIjoxNzc0NzQxMTIxfQ.VeghjgTos1WiaEaIVAdZIwnn7oFMsoL1vXphb73cn8k",
                       preview: [ "https://sxlfmjwipdqjmkhslfql.supabase.co/storage/v1/object/sign/products/Volume_7/Tome_07_preview_01.jpg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJwcm9kdWN0cy9Wb2x1bWVfNy9Ub21lXzA3X3ByZXZpZXdfMDEuanBnIiwiaWF0IjoxNzQzMjA1MTUwLCJleHAiOjE3NzQ3NDExNTB9.zXFvlAIm-J1cEU-Bug5tuzq_Z82twXOxSELsO-XSaP4",
                                  "https://sxlfmjwipdqjmkhslfql.supabase.co/storage/v1/object/sign/products/Volume_7/Tome_07_preview_01.jpg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJwcm9kdWN0cy9Wb2x1bWVfNy9Ub21lXzA3X3ByZXZpZXdfMDEuanBnIiwiaWF0IjoxNzQzMjA1MTU5LCJleHAiOjE3NzQ3NDExNTl9.yYZSEw7jkvvyEcV9KjrQ6HoCZrdTRgN-jPojFLxp4tA",
                                  "https://sxlfmjwipdqjmkhslfql.supabase.co/storage/v1/object/sign/products/Volume_7/Tome_07_preview_03.jpg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJwcm9kdWN0cy9Wb2x1bWVfNy9Ub21lXzA3X3ByZXZpZXdfMDMuanBnIiwiaWF0IjoxNzQzMjA1MTcxLCJleHAiOjE3NzQ3NDExNzF9.Cqm0ov1n2ei-l6VRr488EhNBXmeAhFzWkcBJUVJ-nYI",
                                  "https://sxlfmjwipdqjmkhslfql.supabase.co/storage/v1/object/sign/products/Volume_7/Tome_07_preview_04.jpg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJwcm9kdWN0cy9Wb2x1bWVfNy9Ub21lXzA3X3ByZXZpZXdfMDQuanBnIiwiaWF0IjoxNzQzMjA1MTgwLCJleHAiOjE3NzQ3NDExODB9.AzyA6QcQLnjrQAlt_eFFt3P14VVIhg1UqLJbGIA_YsI",
                                  "https://sxlfmjwipdqjmkhslfql.supabase.co/storage/v1/object/sign/products/Volume_7/Tome_07_preview_05.jpg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJwcm9kdWN0cy9Wb2x1bWVfNy9Ub21lXzA3X3ByZXZpZXdfMDUuanBnIiwiaWF0IjoxNzQzMjA1MTg4LCJleHAiOjE3NzQ3NDExODh9.m1x_0TJa8Kqo6R-E-s3YGMsjFznnO6d1XF89BzwlvW8"],
                       price: 299,
                       chapters: []
                    },
                    {  id:18448,
                       name: "sunsetLand",
                       volume_num: 8,
                       title: "volume 8",
                       description: "Les dragon balls sont des boules de cristal magiques. Celui qui les réunit invoque un dragon qui réalisera ses voeux. Sangoku, Dendé, Végéta et tous les protagonistes de cette grande saga tentent de trouver les sept dragon balls qui, une fois le voeu exaucé, s'éparpilleront à nouveau dans l'univers.Devenue un véritable phénomène de mode dès sa parution, cette série connaît un succès mondial auprès de toute une génération.",
                       thumbnail: "https://sxlfmjwipdqjmkhslfql.supabase.co/storage/v1/object/sign/products/Volume_8/Tome_08_cover_mini.jpg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJwcm9kdWN0cy9Wb2x1bWVfOC9Ub21lXzA4X2NvdmVyX21pbmkuanBnIiwiaWF0IjoxNzQzMjA1MjM5LCJleHAiOjE3NzQ3NDEyMzl9.vZkqYnR4d5j5s_vL_1IaXOdn681nnXaB0ksW2I9jznc",
                       cover: "https://sxlfmjwipdqjmkhslfql.supabase.co/storage/v1/object/sign/products/Volume_8/Tome_08_cover.jpg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJwcm9kdWN0cy9Wb2x1bWVfOC9Ub21lXzA4X2NvdmVyLmpwZyIsImlhdCI6MTc0MzIwNTIxNSwiZXhwIjoxNzc0NzQxMjE1fQ.r6-gw4pi9VZlvSjErnuWjzdD48PjI--jCs4bpsCWvww",
                       preview: [ "https://sxlfmjwipdqjmkhslfql.supabase.co/storage/v1/object/sign/products/Volume_8/Tome_08_preview_01.jpg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJwcm9kdWN0cy9Wb2x1bWVfOC9Ub21lXzA4X3ByZXZpZXdfMDEuanBnIiwiaWF0IjoxNzQzMjA1MjU2LCJleHAiOjE3NzQ3NDEyNTZ9.NJFIW_AzDj1ZWxE6AxkAXIvLB7L3hc_bEn8uJSn0DGU",
                                  "https://sxlfmjwipdqjmkhslfql.supabase.co/storage/v1/object/sign/products/Volume_8/Tome_08_preview_02.jpg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJwcm9kdWN0cy9Wb2x1bWVfOC9Ub21lXzA4X3ByZXZpZXdfMDIuanBnIiwiaWF0IjoxNzQzMjA1MjY1LCJleHAiOjE3NzQ3NDEyNjV9.6xSGoJv29y2kravz1iu13wfdRiOj0SyZ8LDr9GhUP-g",
                                  "https://sxlfmjwipdqjmkhslfql.supabase.co/storage/v1/object/sign/products/Volume_8/Tome_08_preview_03.jpg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJwcm9kdWN0cy9Wb2x1bWVfOC9Ub21lXzA4X3ByZXZpZXdfMDMuanBnIiwiaWF0IjoxNzQzMjA1Mjc2LCJleHAiOjE3NzQ3NDEyNzZ9.o8AH-gi-OlDQnw0SRCfSR9CnueV0_2LoM3MMR1SqH9Y",
                                  "https://sxlfmjwipdqjmkhslfql.supabase.co/storage/v1/object/sign/products/Volume_8/Tome_08_preview_04.webp?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJwcm9kdWN0cy9Wb2x1bWVfOC9Ub21lXzA4X3ByZXZpZXdfMDQud2VicCIsImlhdCI6MTc0MzIwNTI4NCwiZXhwIjoxNzc0NzQxMjg0fQ.lreBx20SRorJzLqwoZpWHvHd7R3ZM8dg4Mp1fPkm7pk",
                                  "https://sxlfmjwipdqjmkhslfql.supabase.co/storage/v1/object/sign/products/Volume_8/Tome_08_preview_05.jpg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJwcm9kdWN0cy9Wb2x1bWVfOC9Ub21lXzA4X3ByZXZpZXdfMDUuanBnIiwiaWF0IjoxNzQzMjA1MjkyLCJleHAiOjE3NzQ3NDEyOTJ9.9_XJHbNpLEHfb_2wckLhQElIRLXV0gXvqqXuswiAv08"],
                       price: 299,
                       chapters: []
                    }
                  ],
        chapters: [
                    {
                    id:144, 
                    volume_num: 1,
                    title: "volume 1",
                    description: "this is a description",
                    volume_thumbnail: "https://picsum.photos/200/300",
                    volume_cover: "https://picsum.photos/200/300",
                    chapters: [
                                { id:1, 
                                chapter_num: 1,
                                chapter_title: "volume 2",
                                description: "this is a description",
                                chapter_thumbnail: "https://picsum.photos/200/500",
                                chapter_cover: "https://picsum.photos/200/500",
                                chapter_preview: [ "https://", "https://", "https://" ]
                                },
                                {
                                id:2,
                                chapter_num: 2,
                                chapter_title: "volume 2",
                                description: "this is a description",
                                chapter_thumbnail: "https://picsum.photos/200/600",
                                chapter_cover: "https://picsum.photos/200/600",
                                chapter_preview: [ "https://", "https://", "https://" ] 
                                },
                                {
                                id:3,
                                chapter_num: 3,
                                chapter_title: "volume 2",
                                description: "this is a description",
                                chapter_thumbnail: "https://picsum.photos/200/270",
                                chapter_cover: "https://picsum.photos/200/700",
                                chapter_preview: [ "https://", "https://", "https://" ]
                                }
                             ]
                    }
                  ],
        artworks: [
                   { id:1145416, 
                     arcName: "ghoula",
                        figurines: [
                                { 
                                    id:1, 
                                    figurineName: "tbourida",
                                    description: "this is a description",
                                    figurine_thumbnail: "https://picsum.photos/200/270",
                                    figurine_cover: "https://picsum.photos/200/700"
                                },
                                { 
                                    id:2, 
                                    figurineName: "tbourida",
                                    description: "this is a description",
                                    figurine_thumbnail: "https://picsum.photos/300/370",
                                    figurine_cover: "https://picsum.photos/200/700"
                                },
                                { 
                                    id:3, 
                                    figurineName: "tbourida",
                                    description: "this is a description",
                                    figurine_thumbnail: "https://picsum.photos/400/470",
                                    figurine_cover: "https://picsum.photos/400/470"
                                }
                            ],
                        illustrations: [
                                { id:1,
                                    illustrationName: "bab merinide",
                                    description: "this is a description",
                                    illustration_thumbnail: "https://picsum.photos/400/470",
                                    illustration_cover: "https://picsum.photos/300/500"                                },
                                { id:2,
                                     illustrationName: "tbourida",
                                    description: "this is a description",
                                    illustration_thumbnail: "https://picsum.photos/400/470",
                                    illustration_cover: "https://picsum.photos/300/500"   
                                },
                                { id:3,
                                    illustrationName: "Entrer to Fes Jdid",
                                    description: "this is a description",
                                    illustration_thumbnail: "https://picsum.photos/400/470",
                                    illustration_cover: "https://picsum.photos/300/500"   
                                }
                            ]
                    }]
     }]
);

 */

const magazineStore = ref(
    {
      id:1,
      magazine_num: 1,
      magazineName: "AlMajala",
      articles: [
                    { id:1,
                    articleTitle: "title 1",
                    articleContent: "this is a description"
                    },
                    { id:2,
                    articleTitle: "title 2",
                    articleContent: "this is a description"
                    },
                    { id:3,
                    articleTitle: "title 3",
                    articleContent: "this is a description"
                    }
               ]
    }
);


const illustrations = ref();

 
</script>

<style lang="scss" scoped>

</style>