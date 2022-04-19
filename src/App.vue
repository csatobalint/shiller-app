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
              :src="require('./assets/cask-' + this.colorMode + '.png')"
              class="mr-3"
              height="40"
            />
            <v-toolbar-title>
              <span class="text-h4">cASK</span>
            </v-toolbar-title>
          </div>
        </v-col>
        <v-col cols="4">
          <div class="d-flex justify-center">
            <v-btn :to="{ name: 'mybids' }" text large class="mx-1"
              >Ask something</v-btn
            >
            <!-- :disabled="!isMetaMaskAuthenticated" -->

            <v-btn :to="{ name: 'bidstome' }" text large class="mx-1"
              >Answer questions</v-btn
            >
            <!-- :disabled="!isMetaMaskAuthenticated || !isKeysSet" -->
          </div>
        </v-col>
        <v-col cols="4">
          <div class="d-flex justify-end align-center">
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
                                @click="disconnectMetaMask"
                              >
                                Disconnect
                              </v-btn>
                            </v-col>
                          </v-row>
                          <v-row class="align-center">
                            <v-col
                              cols="6"
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
                            <v-col
                              cols="6"
                              class="d-flex flex-row-reverse gap-4"
                            >
                              <v-btn
                                color="secondary"
                                rounded
                                text
                                href="#"
                                :to="{ name: 'profile' }"
                                @click="connectWalletDialog = false"
                              >
                                <v-icon>mdi-cog</v-icon>&nbsp;Profile
                              </v-btn>
                            </v-col>
                            <v-col class="12">
                              <v-btn
                                small
                                text
                                target="_blank"
                                :href="getEthersScanAddressPage()"
                              >
                                <v-icon>mdi-link</v-icon> View on explorer
                              </v-btn>
                              <v-btn
                                small
                                text
                                @click="copyAddress('addressInput')"
                              >
                                <v-icon>mdi-content-copy</v-icon> C<span
                                  class="text-lowercase"
                                  >opy address</span
                                >
                              </v-btn>
                              <input
                                v-on:focus="$event.target.select()"
                                ref="addressInput"
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
            <template v-if="isMetaMaskAuthenticated">
              <template
                v-if="
                  isAuthenticated && isMetaMaskAuthenticated && user !== null
                "
              >
                <template>
                  <v-menu
                    v-model="showMenu"
                    absolute
                    offset-y
                    style="max-width: 600px"
                  >
                    <template v-slot:activator="{ on, attrs }">
                      <v-avatar
                        class="ml-2"
                        size="40"
                        v-if="user.photoURL"
                        v-bind="attrs"
                        v-on="on"
                      >
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
                            <img :src="user.photoURL" size="40" />
                          </v-avatar>
                          <v-avatar v-else color="primary" size="40"
                            ><v-icon dark> mdi-account-circle </v-icon>
                          </v-avatar>
                        </v-list-item-avatar>
                        <v-list-item-content>{{
                          userName
                        }}</v-list-item-content>
                      </v-list-item>

                      <v-list-item link>
                        <v-list-item-content>
                          <v-list-item-title class="text-h6">
                            {{ user.displayName }}
                          </v-list-item-title>
                          <v-list-item-subtitle>{{
                            user.email
                          }}</v-list-item-subtitle>
                        </v-list-item-content>

                        <v-list-item-action>
                          <v-icon>mdi-menu-down</v-icon>
                        </v-list-item-action>
                      </v-list-item>
                    </v-list>
                    <v-divider></v-divider>
                    <v-list nav dense>
                      <v-list-item-group v-model="selectedItem" color="primary">
                        <v-list-item @click="$router.push('/profile')">
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
              <template v-else>
                <v-tooltip left>
                  <template v-slot:activator="{ on, attrs }">
                    <v-btn text icon color="">
                      <v-btn
                        class="ml-2"
                        color="primary"
                        size="40"
                        fab
                        outlined
                        small
                        v-bind="attrs"
                        v-on="on"
                        @click="signInWithTwitter()"
                        ><v-icon dark> mdi-twitter </v-icon>
                      </v-btn>
                    </v-btn>
                  </template>
                  <span>Connect with Twitter account</span>
                </v-tooltip>
              </template>
            </template>
          </div>
        </v-col>
      </v-row>
    </v-app-bar>

    <v-main class="gradientBackgroundColor">
      <template>
        <v-progress-linear
          v-if="isLoading"
          height="5"
          style="margin-bottom: -5px"
          indeterminate
          color="primary"
        ></v-progress-linear>
      </template>
      <template name="system_components">
        <div class="text-center ma-2">
          <div v-if="false" id="buttons">
            <v-btn
              :disabled="isLoading"
              :loading="isLoading"
              class="white--text"
              color="purple darken-2"
              @click="startLoading()"
            >
              Start loading
            </v-btn>
            <v-btn
              :disabled="!isLoading"
              :loading="!isLoading"
              class="white--text"
              color="purple darken-2"
              @click="endLoading()"
            >
              Stop loading
            </v-btn>
            <v-btn
              color="primary"
              @click="
                openNotificationSnackbar('testsfs dfdsfs gdasg sdg asdg adsg')
              "
            >
              Test notification snackbar
            </v-btn>
            <v-btn
              color="primary"
              @click="
                openNotificationDialog({
                  title: 'test',
                  text: 'text',
                })
              "
            >
              From the top
            </v-btn>
          </div>

          <!-- NOTIFICATION SNACKBAR -->
          <template name="isNotificationSnackbar">
            <v-snackbar v-model="isNotificationSnackbar" timeout="-1">
              {{ isNotificationSnackbarText }}
              <template v-slot:action="{ attrs }">
                <v-btn
                  color="primary"
                  text
                  v-bind="attrs"
                  @click="closeNotificationSnackbar()"
                >
                  Close
                </v-btn>
              </template>
            </v-snackbar>
          </template>
          <!-- GLOBAL LOADER DIALOG -->
          <template name="isLoading">
            <!--
              <v-dialog v-model="isLoading" hide-overlay persistent width="300">
                <v-card color="primary" dark class="pt-2">
                  <v-card-text>
                    Please stand by
                    <v-progress-linear
                      indeterminate
                      color="white"
                      class="mb-0"
                    ></v-progress-linear>
                  </v-card-text>
                </v-card>
              </v-dialog>-->
          </template>
          <!-- NOTIFICATION DIALOG -->
          <template name="isNotificationDialog">
            <v-dialog v-model="isNotificationDialog" max-width="600">
              <v-card class="rounded-lg pa-4" outlined>
                <v-row class="align-center">
                  <v-col class="text-h6">{{ isNotificationDialogTitle }}</v-col>
                  <v-col class="text-right">
                    <v-btn
                      fab
                      small
                      elevation="0"
                      color="transparent"
                      @click="closeNotificationDialog()"
                    >
                      <v-icon>mdi-close</v-icon>
                    </v-btn>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col>
                    <v-card class="pa-5 center" outlined>
                      <v-row class="align-center">
                        <v-col>
                          {{ isNotificationDialogText }}
                        </v-col>
                      </v-row>
                    </v-card>
                  </v-col>
                </v-row>
              </v-card>
            </v-dialog>
          </template>
        </div>
      </template>
      <!-- Provides the application the proper gutter -->
      <v-container fluid>
        <!-- If using vue-router -->
        <Transition name="fade" mode="out-in">
          <router-view></router-view>
        </Transition>
      </v-container>
    </v-main>
    <v-footer color="gradientAppBarColor" padless>
      <v-layout justify-center wrap>
        <v-flex py-4 text-center xs12>
          {{ new Date().getFullYear() }} — <strong>Shiller Crypto</strong>
        </v-flex>
      </v-layout>
    </v-footer>
  </v-app>
</template>

<script>
import "vue-router";
import MetaMaskOnboarding from "@metamask/onboarding";
const { ethereum } = window;
import { ethers } from "ethers";
import globaMixin from "./views/globalMixin";

export default {
  name: "App",
  metaInfo: {
    // if no subcomponents specify a metaInfo.title, this title will be used
    title: "cASK",
    // // all titles will be injected into this template
    // titleTemplate: '%s | cASK Me'
    meta: [
      { charset: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
    ],
    link: [{ rel: "icon", href: "/cask32.png", type: "image/png" }],
  },
  mixins: [globaMixin],
  data() {
    return {
      connectWalletButtonText: "Connect to a wallet",
      connectWalletButtonDisabled: false,
      connectWalletDialog: false,
      showMenu: false,
      selectedItem: 0,
      items: [
        { text: "Settings", icon: "mdi-cog-outline" },
        { text: "Logout", icon: "mdi-logout", link: "/logout" },
      ],
    };
  },
  computed: {
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
        return "Install wallet";
      }
    },
    colorMode() {
      return this.$vuetify.theme.dark ? "dark" : "light";
    },
    isKeysSet: {
      get() {
        return this.$store.state.auth.isKeysSet;
      },
      set(value) {
        this.$store.commit("auth/SET_IS_KEYS_SET", value);
      },
    },
  },
  methods: {
    switchDarkMode() {
      this.$vuetify.theme.dark = !this.$vuetify.theme.dark;
    },
    goToHome() {
      this.$router.push("/");
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

    // NOT USED
    onClickInstall() {
      this.connectWalletButtonText = "Onboarding in progress";
      this.connectWalletButtonDisabled = true;
      //On this object we have startOnboarding which will start the onboarding process for our end user
      let url = process.env.VUE_APP_HOST + this.$route.fullPath;
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
      this.startLoading();
      try {
        if (
          /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
            navigator.userAgent
          )
        ) {
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

            // Get the contract
            const contract = new ethers.Contract(
              process.env.VUE_APP_CONTRACT_ADDRESS.toLowerCase(), //contract address in .env file
              process.env.VUE_APP_ABI,
              this.provider
            );
            this.$store.dispatch("auth/updateMetaMaskContract", contract);
            //console.log("Contract:", contract);

            //Check it the user already set its keys
            const ownerPublicKey = await this.contract.publicKeys(this.address);
            if (ownerPublicKey != "") {
              this.isKeysSet = true;
            } else {
              this.isKeysSet = false;
              this.$router.push("/profile");
            }

            //Get decryptedPrivateKey if not found in local storage
            if (
              localStorage.getItem("decryptedPrivateKey") == null &&
              this.isKeysSet
            ) {
              this.openNotificationDialog({
                title: "Decrypt request",
                text: `Messages are decrypted with help of the MetaMask client. 
                       You have to request your MetaMask client to provide your
                       unique key by which your messages can be decrypted. \n\n Your
                       unique key is stored in the browser cache until you 
                       disconnect with your MetaMask wallet.`,
              });
              const privateKey = await this.decryptPrivateKey();
              this.closeNotificationDialog();
              //console.log("XXXXXXXXX Decrypted private key: ", privateKey);
              this.$store.commit("auth/SET_DECRYPTED_PRIVATE_KEY", privateKey);
            }

            // Get the current block number of the chain
            const blockNumber = await this.provider.getBlockNumber();
            //console.log(blockNumber)
            this.$store.commit("bids/SET_BLOCK_NUMBER", blockNumber);
          } else {
            this.connectWalletButtonDisabled = true;
            //On this object we have startOnboarding which will start the onboarding process for our end user
            let url = process.env.VUE_APP_HOST + this.$route.fullPath;
            const onboarding = new MetaMaskOnboarding({ url });
            onboarding.startOnboarding();
          }
        }
      } catch (error) {
        if (error.code == -32002) {
          this.openNotificationSnackbar(
            "Connection to the MetaMask wallet has been already requested. Check your MetaMask, you may need to unlock it."
          );
        } else {
          this.openNotificationSnackbar(error.message);
          this.disconnectMetaMask();
        }
      }
      this.endLoading();
    },
    disconnectMetaMask() {
      this.$store.dispatch("auth/clearMetaMaskUser");
      this.connectWalletDialog = false;
      this.$router.push("/");
    },
  },
  created() {
    //if metamask is isntalled and desktop devices, and already logged in then try to connect on load
    if (
      this.isMetaMaskInstalled &&
      !/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      ) &&
      localStorage.getItem("isMetaMaskAuthenticated") &&
      localStorage.getItem("decryptedPrivateKey") != null
    ) {
      this.connectToMetaMask();
    }
  },
};
</script>
