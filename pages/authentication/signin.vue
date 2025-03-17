<template>
    <div>
        <br>
        <h1>Sign In Page</h1>
        <br>
        <form>
        <label for="email">Email:</label>
        <input type="email" id="email" name="email">
        <br>
        <label for="password">Password:</label>
        <input type="password" id="password" name="password">
        <br>
        <nuxt-link to="/authentication/signup" class="text-blue-400 " > create new account </nuxt-link>
        <br>
        <button type="submit" class="fill-green-500">Sign Ip</button>
        </form>
    </div>
</template>

<script setup>
import { ref } from 'vue'

const email = ref('')
const password = ref('')
const confirmPassword = ref('')

</script>

<style scoped>
    form {
        display: flex;
        flex-direction: column;
        width: 50%;
        margin: 0 auto;
    }

    label {
        margin-bottom: 5px;
    }

    input {
        margin-bottom: 10px;
        padding: 5px;
    }

    button {
        padding: 5px;
        background-color: #f9b42a;
        color: white;
        border: none;
        cursor: pointer;
    }

    button:hover {
        background-color: #45a049;
    }
</style>