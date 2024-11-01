// nightwatch/tests/login.js
describe('Login Page Test Suite', function() {
    beforeEach(browser => {
      browser.url('http://localhost:8080')
        .waitForElementVisible('body');
    });
  
    it('should show login form with all elements', function(browser) {
      browser
        .assert.visible('input[type=email]', 'Email input is visible')
        .assert.visible('input[type=password]', 'Password input is visible')
        .assert.visible('button[type=submit]', 'Submit button is visible')
        .assert.textContains('button[type=submit]', 'Se connecter', 'Submit button has correct text');
    });
  
    it('should successfully login as employee', function(browser) {
      browser
        .setValue('input[data-testid="employee-email-input"]', 'employee@test.tld') // 'input[type=email]', 'employee@test.tld')
        .setValue('input[data-testid="employee-password-input"]', 'employee') // 'input[type=password]', 'employee')
        .click('button[data-testid="employee-login-button"]') 
        .waitForElementVisible('#data-table')
        .assert.urlContains('/#employee/bills')
        .assert.visible('[data-testid="btn-new-bill"]', 'New bill button is visible');
    });
  
    it('should successfully login as admin', function(browser) {
      browser
        .setValue('input[data-testid="admin-email-input"]', 'admin@test.tld') // 'input[type=email]', 'admin@test.tld')
        .setValue('input[data-testid="admin-password-input"]', 'admin') // 'input[type=password]', 'admin')
        .click('button[data-testid="admin-login-button"]') 
        //.waitForElementVisible('.content-wrapper')
        .waitForElementVisible('.bills-feed')       
        .assert.urlContains('/#admin/dashboard')
        .assert.visible('.dashboard-content', 'Dashboard content is visible');
    });
  
    it('should validate email format', function(browser) {
      browser
        .setValue('input[type=email]', 'invalidemail')
        .setValue('input[type=password]', 'anypassword')
        .click('button[type=submit]')
        .execute(function() {
          return document.querySelector('input[type=email]').validity.valid;
        }, [], function(result) {
          browser.assert.equal(result.value, false, 'Email should be invalid');
        });
    });
  
    it('should require all fields', function(browser) {
      browser
        .click('button[type=submit]')
        .execute(function() {
          const email = document.querySelector('input[type=email]').validity.valid;
          const password = document.querySelector('input[type=password]').validity.valid;
          return { email, password };
        }, [], function(result) {
          browser.assert.equal(result.value.email, false, 'Email should be required');
          browser.assert.equal(result.value.password, false, 'Password should be required');
        });
    });

    afterEach(function(browser) {
      browser.execute('window.localStorage.clear();');
    });
  
    after(browser => browser.end());
  });