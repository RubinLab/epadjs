require('chromedriver');
require('geckodriver');
const { Builder, By, Key, until } = require('selenium-webdriver');

jest.setTimeout(20000);
const url = 'https://www.google.com/';

describe('executing test scenario on ePAD', () => {
  let driver = new Builder().forBrowser('chrome').build();

  // test('it performs a validation of Log in page', async () => {
  //   const result = await loginPage.validateLoginPage();
  //   console.log(result)
  //   expect(result).toContain('Log In');
  // });

  test('it launches Google page', async () => {
    await driver.get(url);
  });

  afterAll(async () => {
    await driver.quit();
  }, 15000);
}, 10000);
