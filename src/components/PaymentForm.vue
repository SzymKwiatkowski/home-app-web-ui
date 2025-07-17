<script setup>
import { ref } from 'vue';

const paymentDetails = ref({
    cardNumber: '',
    cardHolder: '',
    expiryDate: '',
    cvv: ''
});

const submitPayment = () => {
    // Handle payment submission logic here
    console.log('Payment submitted:', paymentDetails.value);
};
</script>

<template>
    <div class="payment-form">
        <h2>Payment Information</h2>
        <form @submit.prevent="submitPayment">
            <div>
                <label for="cardNumber">Card Number:</label>
                <input type="text" id="cardNumber" v-model="paymentDetails.cardNumber" required />
            </div>
            <div>
                <label for="cardHolder">Card Holder:</label>
                <input type="text" id="cardHolder" v-model="paymentDetails.cardHolder" required />
            </div>
            <div>
                <label for="expiryDate">Expiry Date:</label>
                <input type="text" id="expiryDate" v-model="paymentDetails.expiryDate" placeholder="MM/YY" required />
            </div>
            <div>
                <label for="cvv">CVV:</label>
                <input type="text" id="cvv" v-model="paymentDetails.cvv" required />
            </div>
            <button type="submit">Submit Payment</button>
        </form>
    </div>
</template>

<style scoped>
.payment-form {
    max-width: 400px;
    margin: auto;
    padding: 20px;
    border: 1px solid #ccc;
    border-radius: 5px;
    background-color: #f9f9f9;
}

.payment-form h2 {
    text-align: center;
}

.payment-form div {
    margin-bottom: 15px;
}

.payment-form label {
    display: block;
    margin-bottom: 5px;
}

.payment-form input {
    width: 100%;
    padding: 8px;
    box-sizing: border-box;
}

.payment-form button {
    width: 100%;
    padding: 10px;
    background-color: #28a745;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
}

.payment-form button:hover {
    background-color: #218838;
}
</style>