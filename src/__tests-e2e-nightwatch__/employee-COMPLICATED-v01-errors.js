import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

describe('Employee Page Test Suite', function () {
    // Set global timeout for all tests
    this.timeout(10000);

    // Helper function for retrying actions
    const retryClick = async (browser, selector, maxAttempts = 3) => {
        let attempts = 0;
        while (attempts < maxAttempts) {
            try {
                await browser.click(selector);
                return;
            } catch (error) {
                attempts++;
                if (attempts === maxAttempts) throw error;
                await browser.pause(1000);
            }
        }
    };

    // Setup before running tests
    before(browser => {
        // Clear any existing state
        browser.execute(function() {
            localStorage.clear();
            sessionStorage.clear();
            // Clear any bootstrap modals
            document.querySelectorAll('.modal').forEach(modal => {
                modal.remove();
            });
        });

        // Login
        browser
            .url('http://localhost:8080')
            .waitForElementVisible('body', 5000)
            .setValue('input[type=email]', 'employee@test.tld')
            .setValue('input[type=password]', 'employee')
            .click('button[type=submit]')
            .waitForElementVisible('#data-table', 2000);
    });

    // Bills List Tests
    it('should display bills list by default', function(browser) {
        browser
            .waitForElementVisible('#data-table', 3000)
            .assert.visible('[data-testid="btn-new-bill"]', 'New bill button is visible')
            .assert.urlContains('/#employee/bills', 'URL contains /#employee/bills');
    });

    it('should open bill proof when clicking icon-eye', function(browser) {
        browser
            .waitForElementVisible('[data-testid="icon-eye"]', 2000)
            .click('[data-testid="icon-eye"]')
            .waitForElementVisible('.modal', 5000)
            .assert.visible('.modal', 'Bill proof modal is visible')
            .assert.visible('.modal img', 'Bill proof image is visible')
            // Try multiple selectors for the close button
            .execute(function() {
                // Try to find and click the close button
                const closeButtons = document.querySelectorAll('.modal .close, .modal .btn-close, .modal [data-dismiss="modal"], .modal .close');
                for (const button of closeButtons) {
                    button.click();
                }
                // If no button found, remove modal directly
                const modal = document.querySelector('.modal');
                if (modal) {
                    modal.classList.remove('show');
                    modal.style.display = 'none';
                    const backdrop = document.querySelector('.modal-backdrop');
                    if (backdrop) backdrop.remove();
                    modal.remove();
                }
            })
            .pause(1000)
            .waitForElementNotPresent('.modal', 5000);
    });

    it('should display new bill form', function(browser) {
        browser
            // Ensure no modal is present
            .waitForElementNotPresent('.modal', 5000)
            // Use retry logic for clicking new bill button
            .perform(async (client, done) => {
                try {
                    await retryClick(client, '[data-testid="btn-new-bill"]');
                    done();
                } catch (error) {
                    console.error('Failed to click new bill button:', error);
                    done(error);
                }
            })
            .waitForElementVisible('[data-testid="form-new-bill"]', 5000)
            .assert.visible('[data-testid="expense-type"]', 'Expense type dropdown is visible')
            .assert.visible('[data-testid="expense-name"]', 'Expense name input is visible')
            .assert.visible('[data-testid="amount"]', 'Amount input is visible');
    });

    // Cleanup after each test
    afterEach(function(browser, done) {
        // Close any open modals
        browser.execute(function() {
            // Remove modal and backdrop
            const modals = document.querySelectorAll('.modal');
            const backdrops = document.querySelectorAll('.modal-backdrop');
            
            modals.forEach(modal => {
                if (modal.classList.contains('show')) {
                    modal.classList.remove('show');
                    modal.style.display = 'none';
                }
                modal.remove();
            });
            
            backdrops.forEach(backdrop => backdrop.remove());
            
            // Clean up body classes
            document.body.classList.remove('modal-open');
            document.body.style.removeProperty('padding-right');
        });

        // Take screenshot if test failed
        try {
            const testResults = this.currentTest && this.currentTest.results;
            if (testResults && testResults.failed > 0) {
                const screenshotName = `${this.currentTest.title.replace(/\s+/g, '-')}-${Date.now()}.png`;
                browser.saveScreenshot(`tests_output/screenshots/${screenshotName}`, done);
            } else {
                done();
            }
        } catch (error) {
            console.error('Error in afterEach hook:', error);
            done();
        }
    });

    // Global cleanup
    after(function(browser, done) {
        // Clear local/session storage
        browser.execute(function() {
            localStorage.clear();
            sessionStorage.clear();
        });
        
        // End the browser session
        browser.end(function() {
            done();
        });
    });
});