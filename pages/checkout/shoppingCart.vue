<template>
 <div class="text-amber-50 pt-10 text-2xl">
        <h1>Shopping Cart Page</h1>
        <br>
        <table>
            <thead>
                <tr>
                    <th>Product</th>
                    <th>Price</th>
                    <th>Quantity</th>
                    <th>Total</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Product 1</td>
                    <td>$100</td>
                    <td>2</td>
                    <td>$200</td>
                </tr>
                <tr>
                    <td>Product 2</td>
                    <td>$50</td>
                    <td>3</td>
                    <td>$150</td>
                </tr>
            </tbody>
        </table>
        <br>
        <h2>Total: $350</h2>
        <br>
        <button>Checkout</button>
    </div>


</template>


<script  setup>
import { ref } from 'vue'

</script>

<style scoped>
    table {
        width: 100%;
        border-collapse: collapse;
    }

    table, th, td {
        border: 1px solid black;
    }

    th, td {
        padding: 10px;
        text-align: left;
    }

    th {
        background-color: #f2f2f2;
    }
</style>