<template>
 <div class="text-amber-50 pt-10 text-2xl">
        <h1>Client Account Page</h1>
        <br>
        <div>
            <h2>Account Information</h2>
            <p>First Name: {{ clientAccount.firstName }}</p>
            <p>Last Name: {{ clientAccount.lastName }}</p>
            <p>Email: {{ clientAccount.email }}</p>
            <p>Phone: {{ clientAccount.phone }}</p>
            <p>Address: {{ clientAccount.address }}</p>
            <p>City: {{ clientAccount.city }}</p>
            <p>State: {{ clientAccount.state }}</p>
            <p>Zip: {{ clientAccount.zip }}</p>
            <p>Country: {{ clientAccount.country }}</p>
        </div>
    </div>
</template> 

<script setup>
import { ref } from 'vue';

const clientAccount = ref({
    firstName: 'John',
    lastName: 'Doe',
    email: '',
    phone: '123-456-7890',
    address: '123 Main St',
    city: 'Anytown',
    state: 'CA',
    zip: '12345',
    country: 'USA'
});





</script>