import babel from 'rollup-plugin-babel';
const isDev = process.env.NODE_ENV === 'develop';
const babelConfig = {
  presets: [
    [
      '@babel/preset-env',
      {
        modules: false,
        targets: {
          browsers: ['chrome > 40', 'safari >= 7']
        }
      }
    ]
  ]
} 
export default {
  input: 'src/index.js',
  output: {
    file: isDev ? '../website/client/js/monitor.umd.js' : './dist/monitor.umd.js',
    name: 'Monitor',
    format: 'umd',
    sourcemap: true
  },
  watch: {
    exclude: 'node_modules/**'
  },
  plugin: [
    babel({
      babelrc: false,
      presets: babelConfig.presets,
      plugins: babelConfig.plugins,
      exclude: 'node_modules/**'
    })
  ]
};