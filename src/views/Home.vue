<template>
  <v-container class="pt-10">
    <v-row>
      <v-col></v-col>
      <v-col cols="6">
        <v-row class="py-5 align-center">
          <v-col cols="8">
            <v-row><h1>cASK</h1></v-row>
            <v-row>
                <h3>
                A decentralized question-and-answer platform that enables
                users to ask and answer questions in exchange for cryptocurrencies.
              </h3>
            </v-row>          
          </v-col>
          <v-col class="text-right">
            <img
              :src="require('@/assets/caskImage.png')"
              class="mr-3"
              height="200"
            />
          </v-col>
        </v-row>
        <v-row class="py-5">
          <v-card width="100%" rounded="xl" class="pa-2" color="foreground1">
            <v-card-title> How to use the platform? </v-card-title>
            <v-divider></v-divider>
            <v-card-subtitle>Asker:</v-card-subtitle>
            <v-card-text>
              <ol>
                <li>Go to ask questions</li>
                <li>Select the "+" sign to add a new question</li>
                <li>
                  Add the public address of the recipient, the text of your
                  question, and the bid amount (what you are willing to pay for
                  the answer)
                </li>
                <li>Click send, approve the transaction in your MetaMask</li>
                <li>
                  When you receive the answer, you'll see it in the "Answered"
                  section, otherwise in "Pending"
                </li>
              </ol>
            </v-card-text>
            <v-card-subtitle>Answerer:</v-card-subtitle>
            <v-card-text>
              <ol>
                <li>Go to answer questions</li>
                <li>Select a question you want to answer</li>
                <li>Type in your answer, summit and approve the transaction</li>
                <li>
                  The bid amount will be automatically transferred to your
                  account
                </li>
              </ol>
            </v-card-text>
          </v-card>
        </v-row>
        <v-row class="py-5">
          <v-card width="100%" rounded="xl" class="pa-2" color="foreground1">
            <v-card-title> F. A. Q. </v-card-title>
            <v-divider></v-divider>
            <v-card-text>
              <template>
                <v-treeview :items="items"></v-treeview>
              </template>
            </v-card-text>
          </v-card>
        </v-row>
      </v-col>
      <v-col></v-col>
    </v-row>
  </v-container>
</template>

<script>
import { mapGetters } from "vuex";
export default {
  computed: {
    ...mapGetters({
      isMetaMaskAuthenticated: "auth/isMetaMaskAuthenticated",
    }),
  },
   data: () => ({
      items: [
        {
          name: 'What happens if my question is not answered?',
          children: [
            {name: 'You can withdraw your question anytime, just select a pending question and click on withdraw'},
          ],
        },
        {
          name: 'Is there any token?',
          children: [
            {name: 'Not at the moment'},
          ],
        },
        {
          name: 'How is my question / answer encrypted?',
          children: [
            {name: 'You can withdraw your question anytime, just select a pending question and click on withdraw'},
          ],
        },
        {
          name: 'What is the time limit for my question?',
          children: [
            {name: 'There is no timelimit'},
          ],
        },
      ],
    }),
  mounted() {},
};
</script>
