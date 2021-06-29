require('chromedriver');
require('geckodriver');
const { Builder, By, Key, until } = require('selenium-webdriver');
const { testUrl } = require('../../../public/config.json');
import LoginPage from '../pageObjects/login.js';
import Navbar from '../pageObjects/navbar.js';
import Annotations from '../pageObjects/annotations.js';


jest.setTimeout(20000);

describe('executing test scenario on ePAD', () => {
  let driver = new Builder().forBrowser('chrome').build();
  const loginPage = new LoginPage(driver);
  const navbar = new Navbar(driver);
  const annotations = new Annotations(driver);


  test('it performs a validation of Log in page', async () => {
    const result = await loginPage.validateLoginPage();
    expect(result).toContain('Log In');
  });

  test('it logs in as admin user', async () => {
    await loginPage.login();
  });

  test('it verifies logged in successfully', async () => {
    const result = await loginPage.verifyLoggedIn();
    expect(result).toContain('ePAD');
  });

  test('it lands on annotation search page', async () => {
    await navbar.selectTabById('annotations');
  });



  afterAll(async () => {
    await driver.quit();
  }, 15000);
}, 10000);
