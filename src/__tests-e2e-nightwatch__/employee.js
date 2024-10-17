describe('Employee Page Test Suite', function () {

    // Login as employee before running the tests
    before(browser => {
      browser
        .url('http://localhost:8080')
        .waitForElementVisible('body', 5000) // wait for the body to be visible
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
  
    it('should open bill proof when clicking icon-eye', function (browser) {
      browser
        .click('[data-testid="icon-eye"]') // Assuming the icon-eye is for opening bill proof
        .waitForElementVisible('.modal', 5000) // Wait for modal to appear
        .assert.visible('.modal', 'Bill proof modal is visible');
    });
  
    // New Bill Form Tests
    it('should display new bill form', function (browser) {
      browser
        .click('[data-testid="btn-new-bill"]')
        .waitForElementVisible('[data-testid="form-new-bill"]', 5000)
        .assert.visible('[data-testid="expense-type"]', 'Expense type dropdown is visible')
        .assert.visible('[data-testid="expense-name"]', 'Expense name input is visible')
        .assert.visible('[data-testid="amount"]', 'Amount input is visible');
    });
  
    it('should validate file upload format', function (browser) {
      browser
        .setValue('input[type="file"]', require('path').resolve(__dirname + '/valid-file.png')) // Replace with path to valid file
        .assert.containsText('[data-testid="file-name"]', 'valid-file.png', 'Valid file uploaded');
    });
  
    it('should reject invalid file formats', function (browser) {
      browser
        .setValue('input[type="file"]', require('path').resolve(__dirname + '/invalid-file.txt')) // Replace with path to invalid file
        .assert.containsText('[data-testid="file-error"]', 'Invalid file format', 'Error message displayed for invalid format');
    });
  
    it('should submit form with valid data', function (browser) {
      browser
        .click('[data-testid="btn-new-bill"]')
        .waitForElementVisible('[data-testid="form-new-bill"]', 5000)
        .setValue('[data-testid="expense-type"]', 'Travel')
        .setValue('[data-testid="expense-name"]', 'Business Trip')
        .setValue('[data-testid="amount"]', '200')
        .setValue('input[type="file"]', require('path').resolve(__dirname + '/valid-file.png')) // Valid file
        .click('button[type="submit"]')
        .assert.urlContains('/employee/bills', 'Form submission successful and redirected to bills list');
    });
  
    it('should require all mandatory fields', function (browser) {
      browser
        .click('[data-testid="btn-new-bill"]')
        .waitForElementVisible('[data-testid="form-new-bill"]', 5000)
        .clearValue('[data-testid="expense-name"]')
        .click('button[type="submit"]')
        .assert.visible('[data-testid="expense-name-error"]', 'Error displayed for missing expense name');
    });
  
    // Navigation and Session Tests
    it('should highlight bills icon in vertical layout', function (browser) {
      browser
        .assert.cssClassPresent('[data-testid="icon-bills"]', 'active-icon', 'Bills icon is highlighted');
    });
  
    it('should allow navigation between pages', function (browser) {
      browser
        .click('[data-testid="icon-bills"]')
        .assert.urlContains('/employee/bills', 'Navigated to bills page')
        .click('[data-testid="icon-new-bill"]')
        .assert.urlContains('/employee/new-bill', 'Navigated to new bill page');
    });
  
    it('should maintain session after page refresh', function (browser) {
      browser
        .refresh()
        .waitForElementVisible('.content-wrapper', 5000)
        .assert.urlContains('/employee/bills', 'Session maintained after refresh');
    });
  
    // Error Handling Tests
    it('should handle file upload errors gracefully', function (browser) {
      browser
        .setValue('input[type="file"]', require('path').resolve(__dirname + '/corrupt-file.png')) // Invalid or corrupt file
        .assert.containsText('[data-testid="file-error"]', 'File upload failed', 'Proper error message for file upload failure');
    });
  
    it('should validate amount format', function (browser) {
      browser
        .setValue('[data-testid="amount"]', 'invalidAmount')
        .click('button[type="submit"]')
        .assert.visible('[data-testid="amount-error"]', 'Error displayed for invalid amount format');
    });
  
    // Take screenshots for failed tests
    afterEach(function (browser, done) {
      if (this.currentTest.results.failed > 0) {
        browser.saveScreenshot(`tests_output/screenshots/${this.currentTest.title}.png`, done);
      } else {
        done();
      }
    });
  
    // Close the browser after all tests are completed
    after(browser => browser.end());
  });
  