<template>
 <div class="text-amber-50 pt-10 text-4xl">

        <h1>Payment Method Page</h1>
        <br>
        <form>
        <label for="cardNumber">Card Number:</label>
        <input type="text" id="cardNumber" name="cardNumber">
        <br>
        <label for="expiryDate">Expiry Date:</label>
        <input type="text" id="expiryDate" name="expiryDate">
        <br>
        <label for="cvv">CVV:</label>
        <input type="text" id="cvv" name="cvv">
        <br>
        <button type="submit">Pay</button>
        </form>
    </div>
</template>

<script setup>
import { ref } from 'vue'

const cardNumber = ref('')
const expiryDate = ref('')
const cvv = ref('')

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
        background-color: #4CAF50;
        color: white;
        border: none;
        cursor: pointer;
    }

    button:hover {
        background-color: #45a049;
    }
</style>