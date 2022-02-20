<template>
  <v-container class="pt-10">
    <v-row>
      <v-col></v-col>
      <v-col cols="8">
        <v-row class="py-5">
          <h1>Welcome to Shiller</h1>
        </v-row>
        <v-row class="pb-5">
          <v-sheet class="pa-5" width="100%" rounded="xl" color="foreground1">
            <v-container>
              <v-row>
                <v-col class="text-left">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                  Vestibulum tincidunt sapien ut justo mattis dignissim. Nulla
                  condimentum lobortis ante, ac dignissim libero iaculis quis.
                  Etiam blandit justo at molestie posuere. Curabitur et neque
                  faucibus, hendrerit est ultrices, iaculis metus. Nam.
                </v-col>
              </v-row>
            </v-container>
          </v-sheet>
        </v-row>
      </v-col>
      <v-col></v-col>
    </v-row>
  </v-container>
</template>

<script>
import {mapGetters} from 'vuex'
export default {
  computed: {
    ...mapGetters({
      isMetaMaskAuthenticated: "auth/isMetaMaskAuthenticated",
    }),
  },
  mounted() {},
};
</script>
