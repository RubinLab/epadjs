require('chromedriver');
require('geckodriver');
const { Builder, By, Key, until } = require('selenium-webdriver');
const chai = require('chai');
const evaluate = chai.expect;
import LoginPage from '../pageObjects/login.js';
import Navbar from '../pageObjects/navbar.js';
import LeftSidebar from '../pageObjects/leftSideBar';

jest.setTimeout(30000);


describe('executing test scenario on ePAD', () => {
  let driver = new Builder().forBrowser('chrome').build();
  const login = new LoginPage(driver);
  const navbar = new Navbar(driver);
  const leftSidebar = new LeftSidebar(driver);


  test('it logs in as admin user', async () => {
    await login.login();
  });

  test('it verifies logged in successfully', async () => {
    const result = await login.verifyLoggedIn();
    expect(result).toContain('ePAD');
  });

  test('it selects patients list from navbar and select projects tab from left sidebar ', async () => {
    await navbar.selectTabByName('patientList');
    await leftSidebar.selectTab('projects');
  });

  

  // TODO
  // edit testproject2 and verify the changes
  // edit user permissions and test
  // create project with type & template and verify

  afterAll(async () => {
    await driver.quit();
  }, 15000);
}, 30000);
