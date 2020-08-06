module.exports = {
        devServer: {
            proxy: {
                '/api': {
                    target: 'http://192.168.0.117/',
                    pathRewrite: {
                        '^/api': ''
                    },
                    changeOrigin: true
                },
            }
        }
}