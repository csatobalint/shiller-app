import Vue from 'vue';
import Vuetify from 'vuetify/lib/framework';
import colors from 'vuetify/lib/util/colors'

Vue.use(Vuetify);

function RGBToHex(r,g,b) {
  r = r.toString(16);
  g = g.toString(16);
  b = b.toString(16);

  if (r.length == 1)
    r = "0" + r;
  if (g.length == 1)
    g = "0" + g;
  if (b.length == 1)
    b = "0" + b;

  return "#" + r + g + b;
}

export default new Vuetify({
    theme: { 
        dark: window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches,
        options: { customProperties: true },
        themes: {
            light: {
              appbarColor: colors.deepPurple.lighten5,
              background: colors.indigo.lighten5,
              foreground: colors.white,
              primary: colors.deepPurple,
              secondary: colors.purple,
              accent: colors.shades.black,
              success: colors.red.accent3,
              error: colors.red.accent3,
              info: colors.red.accent3,
              backgroundColor1: colors.indigo.lighten5,
              backgroundColor2: colors.indigo.lighten5,
              backgroundColor3: colors.deepPurple.lighten5,
              appbarColor1: colors.deepPurple.lighten5,
            },
            dark: {
              appbarColor: '#0d0415',
              background: '#170a22',
              foreground: '#24264C',
              primary: colors.purple.lighten2,
              secondary: colors.shades.transparent,
              backgroundColor1: RGBToHex(23, 7, 30, 1),
              backgroundColor2: RGBToHex(22, 8, 30, 1),
              backgroundColor3: RGBToHex(16, 10, 31, 1),
              appbarColor1: RGBToHex(16, 10, 31, 1),
            },
          },
    },

});
