<template>
  <v-container class="pt-10">
    <v-row>
      <v-col></v-col>
      <v-col cols="8">
        <v-row class="py-5">
          <h1>Welcome to Shiller</h1>
        </v-row>
        <v-row class="pb-5">
          <v-sheet class="pa-5" width="100%" rounded="xl" color="foreground1">
            <v-container>
              <v-row>
                <v-col class="text-left">
                  Shiller is a decentralized question-and-answer platform that enables users 
                  to ask and answer questions in exchange for cryptocurrencies.
                  Users can write text based questions, 
                  set a "bid" amount that they are willing to pay for the answer. 
                  Questions can be submitted to a selected address via a simple transaction.

                  How to use as an asker:

1. Go to ask questions
2. Select the "+" sign to add a new question
3. Add the public address of the recipient, the text of your question, and the bid amount (what you are willing to pay for the answer)
4. Click send, approve the transaction in your MetaMask
5. When you receive the answer, you'll see it in the "Answered" section, otherwise in "Pending"

1. Go to answer questions
2. Select a question you want to answer
3. Type in your answer, summit and approve the transaction
4. The bid amount will be automatically transferred to your account


What happens if my question is not answered?
You can withdraw your question anytime, just select a pending question and click on withdraw

Is there any token?
Not at the moment

How is my question / answer encrypted?

What is the time limit for my question?
There is no timelimit
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
import {mapGetters} from 'vuex'
export default {
  computed: {
    ...mapGetters({
      isMetaMaskAuthenticated: "auth/isMetaMaskAuthenticated",
    }),
  },
  mounted() {},
};
</script>
