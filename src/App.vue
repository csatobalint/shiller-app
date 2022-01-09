<template>
  <v-app>
    <v-app-bar app primary>
      <img :src="require('./assets/logo.svg')" class="mr-3" height="30" />
      <v-toolbar-title>Shiller Crypto App</v-toolbar-title>
      <v-spacer></v-spacer>
      <!-- <v-btn
        v-for="link in links"
        :key="`${link.label}-header-link`"
        text
        rounded
        :to="link.url"
      >
        {{ link.label }}
      </v-btn> -->
      <v-btn text rounded to="/login" v-if="!isAuthenticated">Login</v-btn>
      <v-btn text rounded to="/app" v-if="isAuthenticated">App</v-btn>
      <v-btn text rounded @click="signOut" v-if="isAuthenticated">Logout</v-btn>
      <template v-if="isAuthenticated">
        <v-avatar v-if="user.photoURL">
          <img :src="user.photoURL" />
        </v-avatar>
        <v-avatar v-else color="primary" size="40"
          ><v-icon dark> mdi-account-circle </v-icon>
        </v-avatar>
      </template>
    </v-app-bar>
    <v-main class="grey lighten-3">
      <v-container>
        <v-row>
          <v-col cols="2" v-if="isAuthenticated">
            <v-sheet rounded="lg">
              <v-list color="transparent">
                <v-list-item link :to="{ name: 'new_question' }">
                  <v-list-item-content>
                    <v-list-item-title> New question </v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
                <v-list-item link :to="{ name: 'list_questions' }">
                  <v-list-item-content>
                    <v-list-item-title> My questions </v-list-item-title>
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

          <v-col>
            <v-sheet rounded="lg">
              <v-container v-if="isAuthenticated">
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

export default {
  name: "App",
  data() {
    return {
      links: [
        {
          label: "Home",
          url: "/",
        },
        {
          label: "Login",
          url: "/login",
        },
        {
          label: "App",
          url: "/app",
        },
      ],
    };
  },
  computed: {
    ...mapGetters({
      user: "auth/user",
      isAuthenticated: "auth/isAuthenticated",
    }),
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
  },
};
</script>
