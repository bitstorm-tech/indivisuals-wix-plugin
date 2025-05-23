<script setup lang="ts">
import { Button } from "@/components/ui/button"
import { Head } from '@inertiajs/vue3'
import { ref } from 'vue';

window.addEventListener('message', (event) => {
    console.log('event', event)
    userId.value = event.data.userId
})

const userId = ref('N/A')
</script>

<template>

    <Head title="Welcome">
    </Head>
    <div class="p-12 flex flex-col gap-4">
        <Button @click="userId = '1337'">UserID</Button>
        <div>User ID: {{ userId }}</div>
    </div>
</template>
