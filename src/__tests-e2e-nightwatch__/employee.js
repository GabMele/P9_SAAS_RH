describe('Employee Page Test Suite', function () {

    // Login as employee before running the tests
    before(browser => {
      browser
        .url('http://localhost:8080')
        .waitForElementVisible('body', 2000) // wait for the body to be visible
        .setValue('input[type=email]', 'employee@test.tld')
        .setValue('input[type=password]', 'employee')
        .click('button[type=submit]')
        .waitForElementVisible('#data-table', 2000); 
    });
  
    // Bills List Tests
    it('should display bills list by default', function (browser) {
      browser
        .waitForElementVisible('#data-table', 3000) // Wait for bills table to load
        .assert.visible('[data-testid="btn-new-bill"]', 'New bill button is visible')
        .assert.urlContains('/#employee/bills', 'URL contains /#employee/bills');
    });
  
    // New Bill Form Tests
    it('should display new bill form', function (browser) {
      browser
        .click('[data-testid="btn-new-bill"]')
        .waitForElementVisible('[data-testid="form-new-bill"]', 2000)
        .assert.visible('[data-testid="expense-type"]', 'Expense type dropdown is visible')
        .assert.visible('[data-testid="expense-name"]', 'Expense name input is visible')
        .assert.visible('[data-testid="amount"]', 'Amount input is visible');
    });
  
    // Take screenshots for failed tests
    afterEach(function (browser, done) {
      if (browser.currentTest.results.failed > 0) {
        browser.saveScreenshot(`tests_output/screenshots/${browser.currentTest.name}.png`, done);
      } else {
        done();
      }
    });
  
    // Close the browser after all tests are completed
    after(browser => browser.end());
  });
  