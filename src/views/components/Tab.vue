<template>
  <v-row>
    <v-col>
      <v-tabs v-model="tab" background-color="transparent" slider-size="1">
        <v-tab v-for="tabItem in tabItems" :key="tabItem.tab">
          {{ tabItem.tab }}
        </v-tab>
      </v-tabs>
    </v-col>
    <v-col cols="2" class="d-flex justify-end">
      <v-spacer></v-spacer>
      <v-select
        v-model="sortBy"
        :items="['Date', 'Bid']"
        menu-props="auto"
        label="Select"
        hide-details
        single-line
      >
      </v-select>
      <v-tooltip top>
        <template v-slot:activator="{ on, attrs }">
          <v-btn class="ma-2 align-end" text icon color="">
            <v-icon
              class=""
              @click="changeShortIcon"
              text
              v-bind="attrs"
              v-on="on"
            >
              {{ sortIcon }}
            </v-icon>
          </v-btn>
        </template>
        <span>Change sort direction</span>
      </v-tooltip>
    </v-col>
  </v-row>
</template>

<script>
export default {
  props: {
    tabItems: {
      type: Array,
      default: () => [{ tab: "Answered" }, { tab: "Pending" }, { tab: "All" }]
    },
  },
  data() {
    return {
      tab: 0,
      sortBy: "Date",
      sortDirection: "desc",
    };
  },
  watch: {
    tab(newValue) {
      this.$store.dispatch("bids/updateTabFilter", this.tabItems[newValue].tab);
    },
    sortBy(newValue) {
      this.$store.dispatch("bids/updateSortBy", newValue);
    },
    sortDirection(newValue) {
      this.$store.dispatch("bids/updateSortDirection", newValue);
    },
  },
  computed: {
    sortIcon() {
      if (this.sortDirection == "desc") {
        return "mdi-sort-variant";
      } else {
        return "mdi-sort-reverse-variant";
      }
    },
  },
  methods: {
    changeShortIcon() {
      if (this.sortDirection == "asc") {
        this.sortDirection = "desc";
      } else {
        this.sortDirection = "asc";
      }
    },
  },
};
</script>

<style lang="scss" scoped></style>
