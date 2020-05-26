<template>
    <div class="card">
    <v-progress-circular
      indeterminate
      color="primary"
      v-if="pricePoints.length == 0"
    ></v-progress-circular>

    </div>
</template>
<script>
export default {
    props:{
        state
    }
}
</script>