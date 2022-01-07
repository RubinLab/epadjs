require('chromedriver');
require('geckodriver');
const { Builder, By, Key, until } = require('selenium-webdriver');
const chai = require('chai');
const evaluate = chai.expect;
const assert = chai.assert;
import LoginPage from '../pageObjects/login.js';
import Navbar from '../pageObjects/navbar.js';
import Template from '../pageObjects/management/template';

jest.setTimeout(30000);

const templateSample = {
  pathToROI:
    '/Users/ozge/Documents/Dev/templates/ROI_2.25.121060836007636801627558943005335 2.json',
  codeValue: 'ROI',
  containerUID: '2.25.121060836007636801627558943005335'
};

describe('executing test scenario on ePAD', () => {
  let driver = new Builder().forBrowser('chrome').build();
  const login = new LoginPage(driver);
  const navbar = new Navbar(driver);
  const templates = new Template(driver);

  // test('it performs a validation of Log in page', async () => {
  //   const result = await login.validateLoginPage();
  //   console.log(result)
  //   expect(result).toContain('Log In');
  // });

  test('it logs in as admin user', async () => {
    await login.login();
  });

  test('it verifies logged in successfully', async () => {
    const result = await login.verifyLoggedIn();
    expect(result).toContain('ePAD');
  });

  test('it opens management menu', async () => {
    await navbar.selectTabById('management');
  });

  test('it opens template page', async () => {
    const result = await navbar.selectMNGSubject('Templates');
    expect(result).toContain('Templates');
  });

  test('it uploads ROI template', async () => {
    await templates.uploadTemplate(
      templateSample.pathToROI,
      templateSample.codeValue
    );
  });

  test('it deletes single template from row', async () => {
    const templatesAfterDelete = await templates.singleDelete(
      templateSample.codeValue
    );
    evaluate(templatesAfterDelete)
      .to.be.an('array')
      .that.does.not.include(templateSample.codeValue);
  });

  test('it uploads ROI template', async () => {
    await templates.uploadTemplate(
      templateSample.pathToROI,
      templateSample.codeValue
    );
  });

  test('it adds/removes template to the project - testProject1', async () => {
    const temps = await templates.listTemplates('projects');
    const listOfProject = await templates.editTemplateProjectRelation(
      'ROI',
      'testProject1',
      'add'
    );
    if (temps['ROI'].includes('testProject1'))
      assert.notInclude(listOfProject['ROI'], 'testProject1');
    else assert.include(listOfProject['ROI'], 'testProject1');
  });

  test('it adds/removes template to the project - testProject1', async () => {
    const temps = await templates.listTemplates('projects');
    const listOfProject = await templates.editTemplateProjectRelation(
      'ROI',
      'testProject1',
      'remove'
    );
    if (temps['ROI'].includes('testProject1'))
      assert.notInclude(listOfProject['ROI'], 'testProject1');
    else assert.include(listOfProject['ROI'], 'testProject1');
  });

  test('it deletes the template from toolbar', async () => {
    const templatesAfterDelete = await templates.multipleDelete([
      templateSample.codeValue
    ]);
    evaluate(templatesAfterDelete).to.not.have.members([
      templateSample.codeValue
    ]);
  });


  afterAll(async () => {
    await driver.quit();
  }, 15000);
}, 30000);
