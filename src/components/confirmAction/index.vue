<template>
  <v-dialog v-model="open" persistent max-width="290">
    <v-card>
      <v-card-title class="headline">Confirm Action</v-card-title>
      <v-card-text>{{ text }}</v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="green darken-1" text @click="$emit('cancelled')"
          >Cancel</v-btn
        >
        <v-btn color="green darken-1" text @click="$emit('accepted')"
          >Agree</v-btn
        >
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script>
export default {
  props: {
    text: {
      type: String,
      default: null,
    },
    open: {
      type: Boolean,
      default: false,
    },
  },
};
</script>
