require('chromedriver');
require('geckodriver');
const { Builder, By, Key, until } = require('selenium-webdriver');
const chai = require('chai');
const evaluate = chai.expect;
import LoginPage from '../pageObjects/login.js';
import Navbar from '../pageObjects/navbar.js';
import Project from '../pageObjects/management/project';

jest.setTimeout(30000);

const projectList = [
  {
    name: 'testProject3',
    id: 'testProject3'
    // description: 'testProject3'
  },
  {
    name: 'testProject4',
    id: 'testProject4'
    // description: 'testProject4'
  },
  {
    name: 'testProject5',
    id: 'testProject5'
    // description: 'testProject5'
  },
  {
    name: 'testProject6',
    id: 'testProject6'
    // description: 'testProject2'
  }
];
describe('executing test scenario on ePAD', () => {
  let driver = new Builder().forBrowser('chrome').build();
  const login = new LoginPage(driver);
  const navbar = new Navbar(driver);
  const projects = new Project(driver);

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

  test('it opens project page', async () => {
    const result = await navbar.selectMNGSubject('Projects');
    expect(result).toContain('Projects');
  });

    test('it creates testProject2', async () => {
      const projectCreated = await projects.createSingleProject(
        'testProject2',
        'testProject2',
        'testProject2'
      );

      evaluate(projectCreated)
        .to.be.an('array')
        .that.includes('testProject2');
    });

    test('it creates multiple project', async () => {
      const projectCreated = await projects.createMultipleProjects(projectList);
      evaluate(projectCreated)
        .to.be.an('array')
        .that.include.members([
          'testProject3',
          'testProject4',
          'testProject5',
          'testProject6'
        ]);
    });

    test('it deletes single user from row', async () => {
      const projectsAfterDelete = await projects.singleDelete('testProject2');
      evaluate(projectsAfterDelete)
        .to.be.an('array')
        .that.does.not.include('testProject2');
    });

    test('it deletes multiple users', async () => {
      const projectsAfterDelete = await projects.multipleDelete(projectList);
      evaluate(projectsAfterDelete).to.not.have.members([
          'testProject3',
          'testProject4',
          'testProject5',
          'testProject6'
        ]);
    });

  // TODO
  // edit testproject2 and verify the changes
  // edit user permissions and test
  // create project with type & template and verify

  afterAll(async () => {
    await driver.quit();
  }, 15000);
}, 30000);
