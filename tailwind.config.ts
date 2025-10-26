import type { Config } from 'tailwindcss'

export default <Partial<Config>>{
  theme: {
    extend: {
      aspectRatio: {
        '4/5': '4 / 5',
        '9/16': '9 / 16'
      }
    }
  },
  plugins: []
}