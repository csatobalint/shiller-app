<template>
  <v-app>
    <v-app-bar app elevation="0" class="gradientAppBarColor">
      <v-row>
        <v-col cols="4">
          <div class="d-flex justfiy-start">
            <img
              :src="require('./assets/logo-' + this.colorMode + '.png')"
              class="mr-3"
              height="40"
            />
            <v-toolbar-title>
              <span style="font-size: 1.4em">Shiller</span>
            </v-toolbar-title>
          </div>
        </v-col>
        <v-col cols="4">
          <div class="d-flex justify-center">
            <v-btn :to="{ name: 'mybids' }" text large class="mx-1" :disabled="!isMetaMaskAuthenticated"
              >Ask something</v-btn
            >
            <v-btn :to="{ name: 'bidstome' }" text large class="mx-1" :disabled="!isMetaMaskAuthenticated"
              >Answer questions</v-btn
            >
          </div>
        </v-col>
        <v-col cols="4">
          <div class="d-flex justify-end">
            <v-btn
              color="primary"
              rounded
              outlined
              @click="connectToMetaMask"
              :disabled="connectWalletButtonDisabled"
              :loading="connectWalletButtonDisabled"
            >
              {{ metaMaskButtonText }}
            </v-btn>
            <v-btn
              outlined
              @click="switchDarkMode"
              class="mx-2"
              fab
              small
              color="primary"
            >
              <v-icon v-if="colorMode == 'dark'"> mdi-brightness-5 </v-icon>
              <v-icon v-else> mdi-brightness-2 </v-icon>
            </v-btn>
          </div>
        </v-col>
      </v-row>
      <!-- <template v-if="isAuthenticated && user !== null">
        <template>
          <v-menu v-model="showMenu" absolute offset-y style="max-width: 600px">
            <template v-slot:activator="{ on, attrs }">
              <v-avatar v-if="user.photoURL" v-bind="attrs" v-on="on">
                <img :src="user.photoURL" />
              </v-avatar>
              <v-avatar
                v-else
                color="primary"
                size="40"
                v-bind="attrs"
                v-on="on"
                ><v-icon dark> mdi-account-circle </v-icon>
              </v-avatar>
            </template>
            <v-list>
              <v-list-item>
                <v-list-item-avatar>
                  <v-avatar v-if="user.photoURL">
                    <img :src="user.photoURL" />
                  </v-avatar>
                  <v-avatar v-else color="primary" size="40"
                    ><v-icon dark> mdi-account-circle </v-icon>
                  </v-avatar>
                </v-list-item-avatar>
                <v-list-item-content>{{ userName }}</v-list-item-content>
              </v-list-item>

              <v-list-item link>
                <v-list-item-content>
                  <v-list-item-title class="text-h6">
                     {{ user.displayName }}
                  </v-list-item-title>
                  <v-list-item-subtitle>{{ user.email }}</v-list-item-subtitle>
                </v-list-item-content>

                <v-list-item-action>
                  <v-icon>mdi-menu-down</v-icon>
                </v-list-item-action>
              </v-list-item>
            </v-list>
            <v-divider></v-divider>
            <v-list nav dense>
              <v-list-item-group v-model="selectedItem" color="primary">
                <v-list-item>
                  <v-list-item-icon>
                    <v-icon>mdi-cog-outline</v-icon>
                  </v-list-item-icon>
                  <v-list-item-content>
                    <v-list-item-title>Settings</v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
                <v-list-item @click="signOut">
                  <v-list-item-icon>
                    <v-icon>mdi-logout</v-icon>
                  </v-list-item-icon>
                  <v-list-item-content>
                    <v-list-item-title>Logout</v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
              </v-list-item-group>
            </v-list>
          </v-menu>
        </template>
      </template> -->
    </v-app-bar>
    <v-main class="gradientBackgroundColor">
      <!-- <v-col cols="2">
            <v-sheet rounded="lg">
              <v-list color="transparent">
                <v-list-item link :to="{ name: 'questions' }">
                  <v-list-item-content>
                    <v-list-item-title> Questions </v-list-item-title>
                  </v-list-item-content>
                </v-list-item>

                <v-divider class="my-2"></v-divider>

                <v-list-item link color="grey lighten-4">
                  <v-list-item-content>
                    <v-list-item-title> Refresh </v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
              </v-list>
            </v-sheet>
          </v-col> -->
      <div class="text-center">
        <v-dialog v-model="metaMaskErrorDialog" width="500">
          <v-card>
            <v-card-title class="text-h5"> MetaMask message </v-card-title>

            <v-card-text>
              {{ metaMaskErrorText }}
            </v-card-text>

            <v-divider></v-divider>

            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn
                color="primary"
                outlined
                @click="metaMaskErrorDialog = false"
              >
                Close
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </div>
      <!-- Provides the application the proper gutter -->
      <v-container fluid>
        <!-- If using vue-router -->
        <router-view></router-view>
      </v-container>
    </v-main>
    <!-- <v-footer color="blue-grey darken-4 lighten-1" padless>
      <v-layout justify-center wrap>
        <v-flex py-4 text-center white--text xs12>
          {{ new Date().getFullYear() }} — <strong>Shiller Crypto</strong>
        </v-flex>
      </v-layout>
    </v-footer> -->
  </v-app>
</template>

<script>
import { mapGetters } from "vuex";
import firebase from "firebase";
import MetaMaskOnboarding from "@metamask/onboarding";
const { ethereum } = window;
import { ethers } from "ethers";

export default {
  name: "App",
  data() {
    return {
      contractAddress: process.env.VUE_APP_CONTRACT_ADDRESS.toLowerCase(),
      connectWalletButtonText: "Connect to a wallet",
      connectWalletButtonDisabled: false,
      metaMaskErrorText: "",
      metaMaskErrorDialog: false,
      showMenu: false,
      selectedItem: 0,
      items: [
        { text: "Settings", icon: "mdi-cog-outline" },
        { text: "Logout", icon: "mdi-logout", link: "/logout" },
      ],
    };
  },
  computed: {
    colorMode() {
      return this.$vuetify.theme.dark ? "dark" : "light";
    },
    ...mapGetters({
      user: "auth/user",
      isAuthenticated: "auth/isAuthenticated",
      userName: "auth/userName",
      provider: "auth/metaMaskProvider",
      signer: "auth/metaMaskSigner",
      address: "auth/metaMaskAddress",
      isMetaMaskAuthenticated: "auth/isMetaMaskAuthenticated",
    }),
    isMetaMaskInstalled() {
      return Boolean(ethereum && ethereum.isMetaMask);
    },
    metaMaskButtonText() {
      if (this.isMetaMaskInstalled) {
        if (this.isMetaMaskAuthenticated) {
          return this.address.slice(0, 5) + "..." + this.address.slice(-4);
        } else {
          return "Connect to wallet";
        }
      } else {
        return "Click here to install MetaMask!";
      }
    },
  },
  methods: {
    switchDarkMode() {
      this.$vuetify.theme.dark = !this.$vuetify.theme.dark;
    },
    signOut() {
      firebase
        .auth()
        .signOut()
        .then(() => {
          this.$store.dispatch("auth/clearUser");
          this.$router.replace({
            name: "login",
          });
        });
    },
    // NOT USED
    onClickInstall() {
      this.connectWalletButtonText = "Onboarding in progress";
      this.connectWalletButtonDisabled = true;
      //On this object we have startOnboarding which will start the onboarding process for our end user
      let url = process.env.VUE_APP_FORWARD_ORIGIN + this.$route.fullPath;
      const onboarding = new MetaMaskOnboarding({ url });
      onboarding.startOnboarding();
    },
    // NOT USED
    async onClickConnect() {
      try {
        // Will open the MetaMask UI
        // You should disable this button while the request is pending!
        this.connectWalletButtonDisabled = true;
        await ethereum.request({ method: "eth_requestAccounts" });
        this.connectWalletButtonDisabled = false;
        //we use eth_accounts because it returns a list of addresses owned by us.
        const accounts = await ethereum.request({ method: "eth_accounts" });
        this.connectWalletButtonText =
          accounts[0] || "Not able to get accounts";
      } catch (error) {
        console.error(error);
      }
    },
    async connectToMetaMask() {
      try {
        if (this.isMetaMaskInstalled) {
          // Check if the metamask client is unlocked
          const isUnlocked = await ethereum._metamask.isUnlocked();
          if (isUnlocked === false)
            throw new Error("Please unlock your MetaMask client to proceed.");

          // Get provider object
          const provider = new ethers.providers.Web3Provider(
            window.ethereum,
            "any"
          );

          // Prompt user for account connections
          this.connectWalletButtonDisabled = true;
          await provider.send("eth_requestAccounts", []);
          this.connectWalletButtonDisabled = false;
          this.$store.dispatch("auth/updateMetaMaskProvider", provider);
          //console.log(provider);

          // Get the signer and address
          const signer = provider.getSigner();
          const address = await signer.getAddress();
          this.$store.dispatch("auth/updateMetaMaskAddress", address);
          //console.log("Account:", address);
        } else {
          this.connectWalletButtonDisabled = true;
          //On this object we have startOnboarding which will start the onboarding process for our end user
          let url = process.env.VUE_APP_FORWARD_ORIGIN + this.$route.fullPath;
          const onboarding = new MetaMaskOnboarding({ url });
          onboarding.startOnboarding();
        }
      } catch (error) {
        this.metaMaskErrorDialog = true;
        if (error.code == -32002) {
          this.metaMaskErrorText =
            "Connection to the MetaMask wallet has been already requested. Check your MetaMask, you may need to unlock it.";
        } else {
          this.metaMaskErrorText = error.message;
        }
        console.log(error);
      }
    },
  },
  mounted() {
    this.connectToMetaMask();
  },
};
</script>

<style lang="scss">
html {
  overflow-y: auto !important;
}

.gradientBackgroundColor {
  background: radial-gradient(
    circle,
    var(--v-backgroundColor1-base) 0%,
    var(--v-backgroundColor2-base) 50%,
    var(--v-backgroundColor3-base) 100%
  );
}
.gradientAppBarColor {
  background: var(--v-appbarColor1-base);
  background: linear-gradient(
    90deg,
    var(--v-appbarColor1-base) 0%,
    var(--v-appbarColor1-base) 50%,
    var(--v-appbarColor1-base) 100%
  );
  border-bottom: 1px solid rgb(32 34 49)
}
.answerQuestionBackground{
  background: var(--v-answerQuestionBackgroundColor-base);
  background: linear-gradient(
    90deg,
    var(--v-answerQuestionBackgroundColor-base) 0%,
    var(--v-answerQuestionBackgroundColor-base) 50%,
    var(--v-answerQuestionBackgroundColor-base) 100%
  );
}

</style>
