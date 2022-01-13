<template>
  <v-container>
    <v-row v-if="error">
      <v-col>
        <v-alert border="top" color="red lighten-2" dark>
          {{ error }}
        </v-alert>
      </v-col>
    </v-row>
    <v-row>
      <v-card width="400" class="mx-auto mt-5">
        <v-card-title>
          <h1 class="display-1">Login with email</h1>
        </v-card-title>
        <v-card-text>
          <v-form>
            <v-text-field
              label="Email"
              prepend-icon="mdi-email"
              v-model="email"
            />
            <v-text-field
              :type="showPassword ? 'text' : 'password'"
              label="Password"
              prepend-icon="mdi-lock"
              :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
              @click:append="showPassword = !showPassword"
              v-model="password"
            />
          </v-form>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions>
          <v-btn text color="success" to="/register">Switch to Register</v-btn>
          <v-spacer></v-spacer>
          <v-btn color="info" @click="submitLoginForm">Login</v-btn>
        </v-card-actions>
      </v-card>
    </v-row>
    <v-row>
      <v-col>
        <v-card width="400" class="mx-auto mt-5">
          <v-btn width="400" color="#fff" @click="signInWithTwitter()"
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
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import firebase from "firebase";
import { mapGetters } from "vuex";

export default {
  name: "LoginPage",
  data() {
    return {
      email: "",
      password: "",
      showPassword: false,
      error: null,
    };
  },
  computed: {
    ...mapGetters({
      user: "auth/user",
      isAuthenticated: "auth/isAuthenticated",
    }),
  },
  watch: {
    user: function (newUser) {
      this.$router.replace({ name: "app" });
      if (newUser) {
        console.log(`logged in as ${newUser.displayName}`);
      }
    },
  },
  methods: {
    submitLoginForm() {
      firebase
        .auth()
        .signInWithEmailAndPassword(this.email, this.password)
        .then((res) => {
          console.log(res.user.email);
          //this.$router.replace({ name: "app" });
        })
        .catch((err) => {
          this.error = err.message;
        });
    },
    signInWithTwitter() {
      var provider = new firebase.auth.TwitterAuthProvider();
      firebase.auth().signInWithPopup(provider);
      firebase
        .auth()
        .getRedirectResult()
        .then(() => {
          //this.$router.replace({ name: "app" });
        })
        .catch((error) => {
          alert(error);
          return;
        });
    },
  },
};
</script>

<style></style>
