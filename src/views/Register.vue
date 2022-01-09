<template>
  <v-container>
    <v-row v-if="error">
      <v-col>
        <v-alert border="top" color="red lighten-2" dark>
         {{error}}
        </v-alert>
      </v-col>
    </v-row>
    <v-row>
      <v-card width="400" class="mx-auto mt-5">
        <v-card-title>
          <h1 class="display-1">Register with email</h1>
        </v-card-title>
        <v-card-text>
          <v-form>
            <v-text-field
              label="Name"
              prepend-icon="mdi-account"
              v-model="displayName"
            />
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
          <v-btn color="success" @click="signUp">Register</v-btn>
        </v-card-actions>
      </v-card>
    </v-row>
  </v-container>
</template>

<script>
import firebase from "firebase";
import { mapGetters } from "vuex";

export default {
  name: "RegisterPage",
  data() {
    return {
      email: "",
      password: "",
      displayName: "",
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
  methods: {
    signUp() {
      firebase
        .auth()
        .createUserWithEmailAndPassword(this.email, this.password)
        .then((data) => {
          data.user
            .updateProfile({
              displayName: this.displayName,
            })
            .then(() => {
              this.$store.dispatch("fetchUser", data.user);
              this.$router.replace({ name: "app" });
            });
        })
        .catch((err) => {
          this.error = err.message;
        });
    },
  },
};
</script>

<style></style>
