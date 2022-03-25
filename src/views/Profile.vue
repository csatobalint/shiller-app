<template>
  <v-container class="pt-10">
    <v-row>
      <v-col></v-col>
      <v-col cols="8">
        <v-row class="py-5">
          <h1>My profile</h1>
        </v-row>
        <v-row class="pb-5">
          <v-sheet class="pa-5" width="100%" rounded="xl" color="foreground1">
            <v-container>
              <v-row v-if="isKeysSet == false">
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
                    dense
                    outlined
                  ></v-text-field>
                </v-col>
                <v-col v-if="this.userType == 1">
                  <v-btn
                    color="primary darken-1"
                    outlined
                    @click="register()"
                  >
                    Register
                  </v-btn>
                </v-col>
              </v-row>
              <v-row v-else>
                <v-col cols="12" class="text-left">
                  Update your bid limit of questions sent to you
                </v-col>
                <v-col cols="3">
                  <v-text-field
                    name="bid_limit"
                    label="Bid limit"
                    id="bid_limit"
                    v-model="bidLimit"
                    dense
                    outlined
                    suffix="ETH"
                  ></v-text-field>
                </v-col>
                <v-col class="text-right">
                  <v-btn
                    color="primary darken-1"
                    outlined
                    @click="updateBidLimit()"
                  >
                    Update
                  </v-btn>
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
import { mapGetters } from "vuex";
import { mapState } from "vuex";
import globaMixin from "./globalMixin";

export default {
  mixins: [globaMixin],
  data() {
    return {
      userType: 0,
    };
  },
  computed: {
    ...mapGetters({
      isMetaMaskAuthenticated: "auth/isMetaMaskAuthenticated",
    }),
    ...mapState({
      isKeysSet: (state) => state.auth.isKeysSet,
    }),
  },
  asyncComputed: {
    bidLimit: {
      async get(){
        return await this.getBidLimit()
      }
    }
  },
  methods:{
    async updateBidLimit(){
      await this.setBidLimit(this.bidLimit)
    },
    async register(){
       await this.setKeysWithBidLimit(this.bidLimit)
       this.$store.commit("auth/SET_IS_KEYS_SET",true)
    }
  },
  mounted() {
    this.getBidLimit();
  },
};
</script>
