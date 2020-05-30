<template>
  <div>
    <v-progress-circular
      indeterminate
      class="progress-circle--center"
      color="primary"
      v-if="!profile"
    ></v-progress-circular>
    <div v-else>
      <v-row>
        <v-col cols="12" sm="6">
          <v-text-field
            class="input--white"
            label="Stop Limit Percentage"
            type="number"
            v-model.number="profile.stopLimitPercentage"
          ></v-text-field>
        </v-col>
        <v-col cols="12" sm="6">
          <v-text-field
            class="input--white"
            label="Reserve Percentage"
            type="number"
            v-model.number="profile.reservePercentage"
          ></v-text-field>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12" sm="6">
          <v-text-field
            class="input--white"
            label="Maximum Losses per Day"
            type="number"
            v-model.number="profile.maximumLossesPerDay"
          ></v-text-field>
        </v-col>
        <v-col cols="12" sm="6">
          <v-text-field
            class="input--white"
            label="Trade Input Amount"
            type="number"
            v-model.number="profile.tradeInput"
          ></v-text-field>
        </v-col>
      </v-row>
      <v-btn small class="f-right" @click="updateProfile()">Save changes</v-btn>
    </div>
  </div>
</template>
<script>
import mutations from "../../apollo/mutations.gql";

export default {
  props: {
    value: {
      type: Object,
      default: null,
    },
  },
  data() {
    return {
      profile: null,
    };
  },
  mounted() {
    this.profile = this.lodash.cloneDeep(this.value);
  },
  methods: {
    updateProfile() {
      this.$apollo.mutate({
        mutation: mutations.updateProfile,
        variables: {
          id: parseInt(this.profile.id),
          stopLimitPercentage: this.profile.stopLimitPercentage,
          reservePercentage: this.profile.reservePercentage,
          maximumLossesPerDay: this.profile.maximumLossesPerDay,
          tradeInput: this.profile.tradeInput,
        },
      }).catch(error => console.log(error))
    },
  },
};
</script>
