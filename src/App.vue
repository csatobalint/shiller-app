<template>
  <v-app>
    <v-app-bar app elevation="0" class="gradientAppBarColor">
      <v-row>
        <v-col cols="4">
          <div
            class="d-flex justfiy-start"
            style="cursor: pointer"
            @click="goToHome()"
          >
            <img
              :src="require('./assets/logo-' + this.colorMode + '.png')"
              class="mr-3"
              height="40"
            />
            <v-toolbar-title>
              <span class="text-h4">Shiller</span>
            </v-toolbar-title>
          </div>
        </v-col>
        <v-col cols="4">
          <div class="d-flex justify-center">
            <v-btn
              :to="{ name: 'mybids' }"
              text
              large
              class="mx-1"
              :disabled="!isMetaMaskAuthenticated"
              >Ask something</v-btn
            >
            <v-btn
              :to="{ name: 'bidstome' }"
              text
              large
              class="mx-1"
              :disabled="!isMetaMaskAuthenticated"
              >Answer questions</v-btn
            >
          </div>
        </v-col>
        <v-col cols="4">
          <div class="d-flex justify-end">
            <!-- <v-btn
              color="primary"
              rounded
              outlined
              @click="connectToMetaMask"
              :disabled="connectWalletButtonDisabled"
              :loading="connectWalletButtonDisabled"
            >
              {{ metaMaskButtonText }}
            </v-btn> -->
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
            <template>
              <div class="text-center">
                <v-dialog v-model="connectWalletDialog" width="500">
                  <template v-slot:activator="{ on, attrs }">
                    <v-btn
                      color="primary"
                      outlined
                      rounded
                      v-bind="attrs"
                      v-on="on"
                    >
                      {{ metaMaskButtonText }}
                    </v-btn>
                  </template>

                  <!-- Connect to a wallet -->
                  <v-card
                    class="rounded-lg pa-4"
                    v-if="!isMetaMaskAuthenticated"
                    outlined
                  >
                    <v-row>
                      <v-col class="text-h6">Connect to a wallet</v-col>
                      <v-col class="text-right">
                        <v-btn
                          fab
                          small
                          elevation="0"
                          color="transparent"
                          @click="connectWalletDialog = false"
                        >
                          <v-icon>mdi-close</v-icon>
                        </v-btn>
                      </v-col>
                    </v-row>
                    <v-row>
                      <v-col>
                        <v-hover v-slot="{ hover }">
                          <v-card
                            @click="connectToMetaMask"
                            class="pa-5 center"
                            outlined
                            style="cursor: pointer"
                            :style="
                              hover
                                ? 'border-color:' +
                                  $vuetify.theme.defaults[colorMode]
                                    .appbarColor1
                                : ''
                            "
                          >
                            <v-row class="align-center">
                              <v-col>MetaMask</v-col>
                              <v-col>
                                <v-img
                                  class="float-right"
                                  height="32"
                                  width="32"
                                  :src="require('./assets/metamask.png')"
                                ></v-img>
                              </v-col>
                            </v-row>
                          </v-card>
                        </v-hover>
                      </v-col>
                    </v-row>
                  </v-card>

                  <!-- Connected to MetaMask -->
                  <v-card class="rounded-lg pa-4" v-else outlined>
                    <v-row class="align-center">
                      <v-col class="text-h6">Account</v-col>
                      <v-col class="text-right">
                        <v-btn
                          fab
                          small
                          elevation="0"
                          color="transparent"
                          @click="connectWalletDialog = false"
                        >
                          <v-icon>mdi-close</v-icon>
                        </v-btn>
                      </v-col>
                    </v-row>
                    <v-row>
                      <v-col>
                        <v-card class="pa-5 center" outlined>
                          <v-row class="align-center">
                            <v-col>Connected with MetaMask</v-col>
                            <v-col class="text-right">
                              <v-btn
                                color="primary"
                                rounded
                                outlined
                                small
                                @click="disconnect"
                              >
                                Disconnect
                              </v-btn>
                            </v-col>
                          </v-row>
                          <v-row class="align-center">
                            <v-col
                              cols="12"
                              class="align-center d-flex flex-row gap-4"
                            >
                              <img
                                class="ma-2"
                                :src="require('./assets/metamask.png')"
                                alt="avatar"
                                height="32"
                              />
                              <span>{{ shortAdress }}</span>
                            </v-col>
                            <v-col class="12">
                              <v-btn
                                small
                                text
                                target="_blank"
                                :href="getEthersScanAddressPage()"
                              >
                                <v-icon>mdi-link</v-icon> View on
                                explorer</v-btn
                              >
                              <v-btn small text @click="copyAddress()">
                                <v-icon>mdi-content-copy</v-icon> C
                                <span class="text-lowercase"
                                  >opy address</span
                                ></v-btn
                              >
                              <input
                                v-on:focus="$event.target.select()"
                                ref="clone"
                                readonly
                                type="hidden"
                                :value="address"
                              />
                            </v-col>
                          </v-row>
                        </v-card>
                      </v-col>
                    </v-row>
                  </v-card>
                </v-dialog>
              </div>
            </template>
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
      <template>
        <div class="text-center ma-2">
          <v-snackbar v-model="metaMaskErrorDialog">
            {{ metaMaskErrorText }}
            <template v-slot:action="{ attrs }">
              <v-btn
                color="primary"
                text
                v-bind="attrs"
                @click="metaMaskErrorDialog = false"
              >
                Close
              </v-btn>
            </template>
          </v-snackbar>
        </div>
      </template>
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
import "vue-router";
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
      connectWalletDialog: false,
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
    shortAdress() {
      return this.address.slice(0, 5) + "..." + this.address.slice(-4);
    },
    metaMaskButtonText() {
      if (this.isMetaMaskInstalled) {
        if (this.isMetaMaskAuthenticated) {
          return this.shortAdress;
        } else {
          return "Connect to wallet";
        }
      } else {
        return "Connect to wallet";
      }
    },
  },
  methods: {
    switchDarkMode() {
      this.$vuetify.theme.dark = !this.$vuetify.theme.dark;
    },
    goToHome() {
      this.$router.go("/");
    },
    getEthersScanAddressPage() {
      let chainName = {
        1: "",
        42: "kovan.",
      };
      return `https://${
        chainName[ethereum.networkVersion]
      }etherscan.io/address/${this.address}`;
    },
    copyAddress() {
      this.$refs.clone.focus();
      document.execCommand("copy");
    },
    disconnect() {
      this.$store.dispatch("auth/clearMetaMaskUser");
      this.$router.push("/");
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
        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
          // open the deeplink page
          window.open("https://metamask.app.link/dapp/cacstestapp.web.app/");
        } else {
          if (this.isMetaMaskInstalled) {
            // Check if the metamask client is unlocked
            const isUnlocked = await ethereum._metamask.isUnlocked();
            if (isUnlocked === false)
              throw new Error("Please unlock your MetaMask client to proceed.");

            try {
              await ethereum.request({
                method: "wallet_switchEthereumChain",
                params: [{ chainId: "0x2A" }],
              });
            } catch (switchError) {
              // This error code indicates that the chain has not been added to MetaMask.
              if (switchError.code === 4902) {
                try {
                  await ethereum.request({
                    method: "wallet_addEthereumChain",
                    params: [
                      {
                        chainId: "0xf00",
                        chainName: "...",
                        rpcUrls: ["https://..."] /* ... */,
                      },
                    ],
                  });
                } catch (addError) {
                  // handle "add" error
                }
              }
              // handle other "switch" errors
            }

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
  created() {
    //if metamask is isntalled and desktop devices, then try to connect on load
    if (this.isMetaMaskInstalled && !/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
      this.connectToMetaMask();
    }
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
  border-bottom: 1px solid rgb(32 34 49);
}
.answerQuestionBackground {
  background: var(--v-answerQuestionBackgroundColor-base);
  background: linear-gradient(
    90deg,
    var(--v-answerQuestionBackgroundColor-base) 0%,
    var(--v-answerQuestionBackgroundColor-base) 50%,
    var(--v-answerQuestionBackgroundColor-base) 100%
  );
}
</style>
