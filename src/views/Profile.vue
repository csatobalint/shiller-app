<template>
  <v-container class="pt-10">
    <v-row>
      <v-col></v-col>
      <v-col cols="8">
        <v-row class="py-5">
          <h1>My profile</h1>
        </v-row>
        <v-btn @click="setKeysWithBidLimit(0.01)">SET KEYS WITH BID LIMIT</v-btn>
        <v-row class="pb-5">
          <v-card class="pa-4 foreground1" width="100%" rounded="xl">
            <v-card-text metamask class="d-flex align-center">
              <div>
                <v-img
                  height="24"
                  width="24"
                  :src="require('@/assets/metamask.png')"
                ></v-img>
              </div>
              &nbsp;
              Connected with MetaMask: {{ this.address }}
            </v-card-text>
            <v-divider></v-divider>
            <v-card-text v-if="isKeysSet == false">
              <v-row>
                <v-col cols="12" class="text-left">
                  You have not used this application before. Are you here for
                  asking or giving answers primarly?
                  <v-radio-group v-model="userType">
                    <v-radio
                      :key="0"
                      :label="`Follower mode: you want to ask, then you are good to go..`"
                      :value="0"
                    ></v-radio>
                    <v-radio
                      :key="1"
                      :label="`Influencer mode: you can get questions and ask too`"
                      :value="1"
                    ></v-radio>
                  </v-radio-group>
                </v-col>
                <v-col cols="12" v-if="this.userType == 1">
                  In order to be able to get encrypted questions and provide
                  encrypted answers, you have to perform an initial transaction.
                  Please set a minimum bid value if you wish. You can change
                  this limit later with a separate transaction as well.
                </v-col>
                <v-col v-if="this.userType == 1">
                  <v-text-field
                    name="bid_limit"
                    label="Bid limit"
                    id="bid_limit"
                    v-model="bidLimit"
                    @keypress="NumbersOnly"
                    :rules="[rules.required, rules.positiveNumber]"
                    dense
                    outlined
                  ></v-text-field>
                </v-col>
                <v-col v-if="this.userType == 1">
                  <v-btn color="primary darken-1" outlined @click="register()">
                    Register
                  </v-btn>
                </v-col>
              </v-row>
            </v-card-text>

            <v-card-text
              v-else
              class="d-flex justify-space-between align-center"
            >
              <div class="text-left">
                Update your bid limit of questions sent to you
              </div>
              <div class="d-flex flex-row align-center">
                <v-text-field
                  name="bid_limit"
                  label="Bid limit"
                  id="bid_limit"
                  v-model="bidLimit"
                  dense
                  outlined
                  suffix="ETH"
                  hide-details="auto"
                  @keypress="NumbersOnly"
                  :rules="[rules.required, rules.positiveNumber]"
                ></v-text-field>
                <v-btn
                  class="ml-1"
                  color="primary darken-1"
                  outlined
                  @click="updateBidLimit()"
                >
                  Update
                </v-btn>
              </div>
            </v-card-text>
            <v-divider></v-divider>
            <v-card-text
              class="text-left d-flex justify-space-between align-center"
              twitter
              v-if="!isAuthenticated"
            >
              <div>Connect with your Twitter account</div>
              <div>
                <v-btn color="primary" outlined @click="signInWithTwitter()"
                  ><svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"
                    />
                  </svg>
                  Sign in with Twitter</v-btn
                >
              </div>
            </v-card-text>
            <v-card-text
              class="text-left d-flex justify-space-between align-center"
              twitter
              v-if="isAuthenticated"
            >
              <div cols="12" class="text-left d-flex align-center">
                <div>
                  <v-icon>mdi-twitter</v-icon>
                </div>
                &nbsp;
                Connected with Twitter as {{ userName }} with assigned address
                {{ userMetamaskDict[userName] }}
              </div>
              <div>
                <v-btn color="primary darken-1" outlined @click="signOut"
                  >Logout</v-btn
                >
              </div>
            </v-card-text>
          </v-card>
        </v-row>
      </v-col>
      <v-col></v-col>
    </v-row>
  </v-container>
</template>

<script>
import { mapState, mapGetters } from "vuex";
import globaMixin from "./globalMixin";

export default {
  mixins: [globaMixin],
  data() {
    return {
      userType: 0,
    };
  },
  computed: {
    ...mapState({
      isKeysSet: (state) => state.auth.isKeysSet,
    }),
    ...mapGetters({
      userMetamaskDict: "getUserMetamaskDictionary",
    }),
  },
  asyncComputed: {
    bidLimit: {
      async get() {
        return await this.getBidLimit();
      },
    },
  },
  methods: {
    async updateBidLimit() {
      await this.setBidLimit(this.bidLimit);
    },
    async register() {
      await this.setKeysWithBidLimit(this.bidLimit);
      this.$store.commit("auth/SET_IS_KEYS_SET", true);
    },
  },
  mounted() {
    this.getBidLimit();
    this.$store.dispatch("bindUsers");
  },
};
</script>
