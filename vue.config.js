module.exports = {
  publicPath: process.env.NODE_ENV === 'production'
    ? '/maskmap/' // 為 repo 名稱
    : '/'
}