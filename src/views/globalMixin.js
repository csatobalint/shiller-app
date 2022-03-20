import { mapGetters } from "vuex";

export default {
  filters: {
  },
  data() {
    return {
      now: 0
    }
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
      // console.log(refName)
      // console.log(this.$refs[refName])
      let text = '';
      if(this.$refs[refName].constructor  == Array){
        text = this.$refs[refName][0].value;
      }else{
        text = this.$refs[refName].value;
      }
      let listener = function (ev) {
        ev.clipboardData.setData("text/plain", text);
        ev.preventDefault();
      };
      document.addEventListener("copy", listener);
      document.execCommand("copy");
      document.removeEventListener("copy", listener);
    },
    getNow() {
      this.now = Date.now();
    },
  },
  mounted() {
    console.log("hello from global mixin!");
  },
  created() {
    setInterval(() => {
      this.getNow();
    }, 1000)
  },
};
