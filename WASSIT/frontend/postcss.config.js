/**
 * PostCSS config - مخصص لتطبيق "وسّط" مع دعم اللغة العربية واتجاه RTL
 */
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {
      flexbox: 'no-2009',
      grid: true
    },
    'postcss-logical': {
      // دعم الخصائص المنطقية (للاتجاه من اليمين إلى اليسار)
      dir: 'rtl',
    },
  },
};