// Tanpa postcss-preset-env → hindari load caniuse-lite (sering ETIMEDOUT kalau node_modules di iCloud/disk lambat).
module.exports = {
    plugins: {
        'postcss-flexbugs-fixes': {},
        autoprefixer: {
            flexbox: 'no-2009',
        },
    },
};
