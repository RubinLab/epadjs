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
    const user = await users.findUser('epad_user1@gmail.com');
    expect(user.index).toBeGreaterThan(-1);
  });

  //   test('it creates multiple users', async () => {
  //     for (let newUser of userList) {
  //         await users.openCreateUser();
  //         await users.createUser(newUser);
  //     }
  //   });

  test('it verifies other users were created', async () => {
    const indeces = [];
    for (let newUser of userList) {
      const user = await users.findUser(newUser);
      indeces.push(user.index);
    }
    const index = indeces.indexOf(-1);

    expect(index).toEqual(-1);
  });

  test('it adds "create users" permission to user 1 and verifies', async () => {
    await users.editUserPermission('epad_user1@gmail.com', 'CreateUser');
  })

  test('it adds "create connections"permission to user 2 and verifies', async () => {
    await users.editUserPermission('epad_user2@gmail.com', 'CreatePAC')
  });

  test('it adds "create queries" permission to user 3 and verifies', async () => {
    await users.editUserPermission('epad_user3@gmail.com', 'CreateAutoPACQuery')
  });

  test('it adds "create projects" permission to user 4 and verifies', async () => {
    await users.editUserPermission( 'epad_user4@gmail.com', 'CreateProject')
  });

  test('it adds "create worklists" permission to user 5 and verifies', async () => {
    await users.editUserPermission('epad_user5@gmail.com', 'CreateWorklist')
  });


  // test('it removes "create users" permission to user 1', async () => {});


  // test('it removes "create connections" permission to user 1', async () => {});


  // test('it removes "create queries" permission to user 1', async () => {});


  // test('it removes "create projects" permission to user 1', async () => {});


  // test('it removes "create worklists" permission to user 1', async () => {});


  // test ('it adds user 2 to a project', async () => {

  // })

  // test ('it verifies user projeect relation', async () => {

  // })
  // test('it deletes single patient from row', async () => {});

  // test('it verifies single user is deleted', async () => {});

  // test('it selects multiple users', async () => {});

  // test('it verifies multiple users are deleted', async () => {});

  afterAll(async () => {
    await driver.quit();
  }, 15000);
}, 10000);
