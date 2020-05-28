<template>
  <div>
    <v-progress-circular
      indeterminate
      class="progress-circle--center"
      color="primary"
      v-if="!profile"
    ></v-progress-circular>
    <div v-else>
      <v-text-field
        class="input--white"
        label="Stop Limit Percentage"
      ></v-text-field>
      <v-text-field
        class="input--white"
        label="Reserve Percentage"
      ></v-text-field>
      <v-text-field
        class="input--white"
        label="Maximum Losses per Day"
      ></v-text-field>
      <v-text-field
        class="input--white"
        label="Trade Input Amount"
      ></v-text-field>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    profile: {
      type: Object,
      default: null,
    },
  },
  data(){
    return {
      profileModel: {}
    }
  },
  computed:{
    profileProxy:{
      get(){

      },
      set(value){
profileModel
      }
    }
  }
};
</script>
