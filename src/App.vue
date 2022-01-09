<template>
  <v-app>
    <v-app-bar app primary>
      <v-toolbar-title>Shiller Crypto App</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn
        v-for="link in links"
        :key="`${link.label}-header-link`"
        text
        rounded
        :to="link.url"
      >
        {{ link.label }}
      </v-btn>
    </v-app-bar>
    <v-main class="grey lighten-3">
      <v-container>
        <v-row>
          <v-col cols="2"> 
            <v-sheet rounded="lg">
              <v-list color="transparent">
                <v-list-item link :to="{name: 'new_question'}">
                  <v-list-item-content>
                    <v-list-item-title > New question </v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
                <v-list-item link :to="{name: 'list_questions'}">
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
            <v-sheet min-height="70vh" rounded="lg">
              <router-view></router-view>
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
};
</script>
