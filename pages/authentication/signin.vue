<template>
    <div class="flex bg-gray-50 text-2xl">
        
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">

        <div class="flex-1 flex flex-col justify-center py-1 px-4 sm:px-6 lg:px-20 lg:flex-none xl:px-24">

            <div class="mx-auto" >
                <h2 class="mt-6 text-2xl font-extrabold text-gray-900 md:text-3xl">Take a breath, sign up</h2>

                <nuxt-link to="/authentication/signin" class="mt-2 text-sm font-medium text-green-600 hover:text-gren-500">Already have an account ? Sign in </nuxt-link>

            </div>
        <div class="mx-auto w-full max-w-sm lg:w-96 ">
            
            

            <form class="mt-4" @submit.prevent="onSubmit">

                  <div class="space-y-5 mt-6">

                      <div>
                      <label for="email"  class="block text-sm font-medium text-gray-700">Email address</label>
                      <input type="email" placeholder="e.g. alexsmith@gmail.com" id="email" v-model="credentials.email" class="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none  focus:border-green-700 sm:text-sm">
                      </div>
                      
                      <div>
                      <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
                      <input  v-model="credentials.password" type="password" id="password" class="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none  focus:border-green-700 sm:text-sm">
                      </div>


                  </div>

                  <div class="flex items-center justify-between mt-8">

                      <div class="flex items-center">
                      <input type="checkbox" id="remember-me" class="w-4 h-4 rounded">
                      <label for="remember-me" class="ml-2 block text-sm text-gray-900">Remember me</label>
                      </div>

                  </div>

                  <div class="w-full py-3 px-4 mt-4 rounded-md shadow-sm text-sm font-medium text-white bg-green-800">
                    <p class="text-center">
                      <button class="button is-primary">
                        Sign in
                      </button>
                    </p>
                  </div>

            </form>

            <div class="mt-2 pb-40">

            <nuxt-link to="/authentication/signup" class="mt-2 text-sm font-medium text-green-600 hover:text-gren-500">
            create an account ? </nuxt-link>

            </div>

<!--             <div class="mt-1 flex justify-center">

                <a href="#" class="mx-2 p-4 border border-gray-300 rounded-md shadow-sm bg-white hover:bg-gray-50">
                    <span class="sr-only">Sign up with Instagram</span>
                    <img src="/ig.svg" alt="instagram logo" class="w-6">
                </a>
                <a href="#" class="mx-2 p-4 border border-gray-300 rounded-md shadow-sm bg-white hover:bg-gray-50">
                    <span class="sr-only">Sign up with Pinterest</span>
                    <img src="/pinterest.svg" alt="pinterest logo" class="w-6">
                </a>
                <a href="#" class="mx-2 p-4 border border-gray-300 rounded-md shadow-sm bg-white hover:bg-gray-50">
                    <span class="sr-only">Sign up with Instagram</span>
                    <img src="/tumblr.svg" alt="tumblr logo" class="w-6">
                </a>

            </div> -->

        </div>

        </div>



    </div>
</template>

<script setup>

  import { ref, computed, reactive } from 'vue'
  import { useStoreAuth } from '@/stores/storeAuth'

/*
  store
*/
const formTitle = ref("sign in form");

const storeAuth = useStoreAuth()

/*
  register / login
*/

const register = ref(false)

/*
  form title
*/



/* const formTitle = computed(() => {
    return register.value ? 'Register' : 'Login'
  }) 
 */
/*
  credentials
*/

const credentials = reactive({
    email: '',
    password: ''
  })

/*
  submit
*/

  const onSubmit = () => {
    console.log("submit -----------<<<<<<<<<<<<<<<<<<<<<<")
    if (!credentials.email || !credentials.password) {
      alert('Please enter an email and password gosh darnit!')
    }
    else {
      if (register.value) {
        console.log('register User')
        storeAuth.registerUser(credentials)
      }
      else {
        storeAuth.loginUser(credentials)
      }
    }
  }  
</script>

<style scoped>

</style>