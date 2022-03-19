import { mapGetters } from "vuex";

export default {
  filters: {
  },
  computed: {
    ...mapGetters({
      provider: "auth/metaMaskProvider",
      signer: "auth/metaMaskSigner",
      address: "auth/metaMaskAddress",
      contract: "auth/metaMaskContract",
      isMetaMaskAuthenticated: "auth/isMetaMaskAuthenticated"
    }),
  },
  methods: {
    sleep(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    },
    copyAddress(refName) {
      this.$refs[refName].focus();
      var text = this.$refs[refName].value;
      var listener = function (ev) {
        ev.clipboardData.setData("text/plain", text);
        ev.preventDefault();
      };
      document.addEventListener("copy", listener);
      document.execCommand("copy");
      document.removeEventListener("copy", listener);
    },
  },
  mounted() {
    console.log("hello from global mixin!");
  },
};
