import '@mdi/font/css/materialdesignicons.css' // Ensure you are using css-loader

import { createVuetify } from 'vuetify'
import { aliases, mdi } from 'vuetify/iconsets/mdi'
import * as components from 'vuetify/components'
import * as labsComponents from 'vuetify/labs/components'

export default createVuetify({
  theme: {
    defaultTheme: 'system', // 'light' | 'dark' | 'system'
  },
  icons: {
    defaultSet: 'mdi',
    aliases: {
      ...aliases
    },
    sets: {
      mdi,
    },
  },
  components: {
    ...components,
    ...labsComponents,
  },
})
