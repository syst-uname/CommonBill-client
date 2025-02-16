const config = 'SERVER_URL_PLACEHOLDER'.startsWith('http')
  ? {
    SERVER_URL: 'SERVER_URL_PLACEHOLDER'
  }
  : await (await fetch('config.json')).json()

console.log('==== config.js', config)

export default config