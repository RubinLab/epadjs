require('chromedriver');
require('geckodriver');
const { Builder, By, Key, until } = require('selenium-webdriver');
const { testUrl } = require('../../../public/config.json');

describe('executing test scenario on ePAD', () => {
  let driver = new Builder().forBrowser('chrome').build();

  test('it performs a validation of Log in page', async () => {
    driver.get(testUrl);
    const logInTitle = await driver.findElement(By.id('kc-page-title')).getText();
    expect(logInTitle).toContain('Log In');
  });

  test('it logs in as admin user', async () => {
    await driver.findElement(By.id('username')).sendKeys('admin');
    await driver.findElement(By.id('password')).sendKeys('admin');
    await driver.findElement(By.id('kc-login')).click()
    let logo =
       await driver.wait(until.elementLocated(By.id('epad-logo')), 10000);
    expect(typeof logo).toBe('object');
  });

  afterAll(async () => {
    await driver.quit();
  }, 15000);

}, 10000);
