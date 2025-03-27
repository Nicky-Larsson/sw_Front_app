<template>
    <div class="bg-amber-600 container mx-auto pt-2 md:w-[85%]">
      <div class="flex flex-col text-amber-50 p-0 text-4xl block">

        <h1 class="text-8xl "> {{graphicNovelStore[0].name}}</h1>
        <div  class="mt-4 max-w-[1200px] mx-auto px-2">
            <div v-if="graphicNovelStore[0]" class="grid xl:grid-cols-4 lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-2 grid-cols-1 gap-23">
                <div v-for="volume in graphicNovelStore[0].volumes" :key="volume">
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
</template>

<script setup>
import { ref } from 'vue'

const librarySet_1 = reactive({
                                    grapicNovel: "sunsetLand",
                                    volume_num: 3,
                                    chapter_num: 4,
                                    figurine_name: "tbourida",
                                    arc_name: "Lghoula",
                                    illustration_name: "Entrer to Fes Jdid",
                                    magazine_num: 1
                                })


const graphicNovelStore = ref(
      [{ id:1,
        name: "Sunset Land",
        volumes: [
                    {  id:15444,
                       name: "sunsetLand",
                       volume_num: 1,
                       title: "volume 1",
                       description: "this is a description",
                       thumbnail: "https://picsum.photos/800/600",
                       cover: "https://picsum.photos/800/600",
                       preview: [ "https://", "https://", "https://" ],
                       price: 299,
                       chapters: []
                    },
                    {  id:15445,
                       name: "sunsetLand",
                       volume_num: 2,
                       title: "volume 2",
                       description: "this is a description",
                       thumbnail: "https://picsum.photos/700/800",
                       cover: "https://picsum.photos/700/800",
                       preview: [ "https://", "https://", "https://" ],
                       price: 299,
                       chapters: []
                    },
                    {  id:15446,
                       name: "sunsetLand",
                       volume_num: 3,
                       title: "volume 3",
                       description: "this is a description",
                       thumbnail: "https://picsum.photos/500/500",
                       cover: "https://picsum.photos/500/500",
                       preview: [ "https://", "https://", "https://" ],
                       price: 299,
                       chapters: []
                    },
                    {  id:15447,
                       name: "sunsetLand",
                       volume_num: 4,
                       title: "volume 4",
                       description: "this is a description",
                       thumbnail: "https://picsum.photos/700/700",
                       cover: "https://picsum.photos/700/700",
                          preview: [ "https://", "https://", "https://" ],
                       price: 299,
                       chapters: []
                    },
                    {  id:15458,
                       name: "sunsetLand",
                       volume_num: 5,
                       title: "volume 5",
                       description: "this is a description",
                       thumbnail: "https://picsum.photos/300/300",
                       cover: "https://picsum.photos/300/300",
                       preview: ["https://", "https://", "https://" ],
                       price: 299,
                       chapters: []
                    },
                    {  id:18448,
                       name: "sunsetLand",
                       volume_num: 5,
                       title: "volume 5",
                       description: "this is a description",
                       thumbnail: "https://picsum.photos/350/350",
                       cover: "https://picsum.photos/350/350",
                       preview: ["https://", "https://", "https://" ],
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