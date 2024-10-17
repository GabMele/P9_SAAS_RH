// nightwatch.conf.js
module.exports = {
  src_folders: ['nightwatch/tests'],
  
  webdriver: {
    start_process: true,
    server_path: require('chromedriver').path,
    port: 9515
  },

  test_settings: {
    default: {
      desiredCapabilities: {
        browserName: 'chrome'
      },
      globals: {
        waitForConditionTimeout: 5000,    // Time to wait for conditions
        retryAssertionTimeout: 5000,      // Time to retry failed assertions
        abortOnAssertionFailure: false    // Continue tests after failure
      }
    }
  }
};