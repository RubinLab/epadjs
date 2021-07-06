require('chromedriver');
require('geckodriver');
const { Builder, By, Key, until } = require('selenium-webdriver');
import LoginPage from '../pageObjects/login.js';
import Navbar from '../pageObjects/navbar.js';
import User from '../pageObjects/management/user';

const userList = [
  'epad_user2@gmail.com',
  'epad_user3@gmail.com',
  'epad_user4@gmail.com',
  'epad_user5@gmail.com'
];

jest.setTimeout(20000);

describe('executing test scenario on ePAD', () => {
  let driver = new Builder().forBrowser('chrome').build();
  const login = new LoginPage(driver);
  const navbar = new Navbar(driver);
  const users = new User(driver);

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

  test('it opens users page', async () => {
    const result = await navbar.selectMNGSubject('Users');
    expect(result).toContain('Users');
  });

//   test('it opens create new user modal', async () => {
//     await users.openCreateUser();
//   });

//   test('it creates user1', async () => {
//     await users.createUser('epad_user1@gmail.com');
//   });

  test('it verifies single user created', async () => {
    const index = await users.findUser('epad_user1@gmail.com');  
    expect(index).toBeGreaterThan(-1);
  })


//   test('it creates multiple users', async () => {
//     for (let newUser of userList) {
//         await users.openCreateUser();
//         await users.createUser(newUser);
//     }
//   });

  test('it verifies other userscreated', async () => {
    const indeces = []
    for (let newUser of userList) {
        const index = await users.findUser(newUser);  
        indeces.push(index);
    }
    const index = indeces.indexOf(-1);
    expect(index).toEqual(-1);
  })

  

  afterAll(async () => {
    await driver.quit();
  }, 15000);
}, 10000);
