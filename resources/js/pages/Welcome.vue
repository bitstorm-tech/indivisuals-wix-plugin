<script setup lang="ts">
import { Button } from "@/components/ui/button"
import { Head } from '@inertiajs/vue3'

window.addEventListener('message', (event) => {
    console.log('event', event)
    alert('got message')
})
</script>

<template>

    <Head title="Welcome">
    </Head>
    <div class="p-12">
        <Button>Button</Button>
    </div>
</template>
