require('chromedriver');
require('geckodriver');
const { Builder, By, Key, until } = require('selenium-webdriver');
import LoginPage from '../pageObjects/login.js';

jest.setTimeout(20000);

describe('executing test scenario on ePAD', () => {
  let driver = new Builder().forBrowser('chrome').build();
  const loginPage = new LoginPage(driver);

  // test('it performs a validation of Log in page', async () => {
  //   const result = await loginPage.validateLoginPage();
  //   console.log(result)
  //   expect(result).toContain('Log In');
  // });


  test('it logs in as admin user', async () => {
    await loginPage.login();
  });

  test('it verifies logged in successfully', async () => {
    const result = await loginPage.verifyLoggedIn();
    expect(result).toContain('ePAD');
  });

  afterAll(async () => {
    await driver.quit();
  }, 15000);
}, 10000);
