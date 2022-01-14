<template>
  <v-app>
    <v-app-bar app primary>
      <img :src="require('./assets/logo.svg')" class="mr-3" height="30" />
      <v-toolbar-title>Shiller Crypto App</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn text rounded v-if="isMetaMaskInstalled" @click="onClickConnect">{{
        connectWalletButtonText
      }}</v-btn>
      <v-btn text rounded v-else @click="onClickInstall">{{
        connectWalletButtonText
      }}</v-btn>
      <template v-if="isAuthenticated && user !== null">
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
      </template>
    </v-app-bar>
    <v-main class="grey lighten-3">
      <v-container>
        <v-row>
          <v-col cols="2" v-if="isAuthenticated">
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
          </v-col>

          <v-col cols="10">
            <v-sheet rounded="lg">
              <v-container v-if="isAuthenticated && user !== null">
                <v-row>
                  <v-col cols="8">
                    <h1>Logged in as {{ user.displayName }}</h1>
                  </v-col>
                </v-row>
              </v-container>
              <router-view></router-view>
              <v-row>
                <v-col></v-col>
              </v-row>
            </v-sheet>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
    <v-footer color="blue-grey darken-4 lighten-1" padless>
      <v-layout justify-center wrap>
        <!-- <v-btn
          v-for="link in links"
          :key="`${link.label}-footer-link`"
          color="white"
          text
          rounded
          class="my-2"
          :to="link.url"
        >
          {{ link.label }}
        </v-btn> -->
        <v-flex py-4 text-center white--text xs12>
          {{ new Date().getFullYear() }} — <strong>Shiller Crypto</strong>
        </v-flex>
      </v-layout>
    </v-footer>
  </v-app>
</template>

<script>
import { mapGetters } from "vuex";
import firebase from "firebase";
import MetaMaskOnboarding from "@metamask/onboarding";
const { ethereum } = window;

export default {
  name: "App",
  data() {
    return {
      contractAddress:
        "0xC5A381a1285D54C66B3eA9983F76f79F7116d1f4".toLowerCase(),
      connectWalletButtonText: "Connect to wallet",
      connectWalletButtonDisabled: false,
      showMenu: false,
      selectedItem: 0,
      items: [
        { text: "Settings", icon: "mdi-cog-outline" },
        { text: "Logout", icon: "mdi-logout", link: "/logout" },
      ],
    };
  },
  computed: {
    ...mapGetters({
      user: "auth/user",
      isAuthenticated: "auth/isAuthenticated",
      userName: "auth/userName",
    }),
    onboarding() {
      let url = "http://localhost:8080/" + this.$route.fullPath;
      return new MetaMaskOnboarding({ url });
    },
    isMetaMaskInstalled() {
      return Boolean(ethereum && ethereum.isMetaMask);
    },
  },
  methods: {
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

    onClickInstall() {
      this.connectWalletButtonText = "Onboarding in progress";
      this.connectWalletButtonDisabled = true;
      //On this object we have startOnboarding which will start the onboarding process for our end user
      this.onboarding.startOnboarding();
    },
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

    async updateMetamask() {
      if (ethereum) {
        const accounts = await ethereum.request({ method: "eth_accounts" });

        if (accounts[0] !== undefined) {
          let metamask = accounts[0];
          this.$store.dispatch("auth/updateMetamask", metamask);
          let metamaskShortText =
            metamask.slice(0, 5) + "..." + metamask.slice(-4);
          this.connectWalletButtonText = metamaskShortText;
        } else {
          this.connectWalletButtonText =
            "Not able to get accounts. Click here to try again.";
        }
      }
    },
  },
  mounted() {
    //Now we check to see if MetaMask is installed
    if (!this.isMetaMaskInstalled) {
      //If it isn't installed we ask the user to click to install it
      this.connectWalletButtonText = "Click here to install MetaMask!";
      //The button is now disabled
      this.connectWalletButtonDisabled = false;
    } else {
      //If it is installed we change our button text
      this.connectWalletButtonText = "Connect to wallet";
      //The button is now disabled
      this.connectWalletButtonDisabled = false;
    }

    this.updateMetamask();
  },
};
</script>
