require('chromedriver');
require('geckodriver');
const { Builder, By, Key, until } = require('selenium-webdriver');
const chai = require('chai');
const evaluate = chai.expect;
const assert = chai.assert;
import LoginPage from '../pageObjects/login.js';
import Navbar from '../pageObjects/navbar.js';
import Worklist from '../pageObjects/management/worklist';

jest.setTimeout(30000);

const sampleList = [
  {
    name: 'worklist_test_2',
    id: 'worklist_test_2',
    duedate: '01012022',
    desc: 'worklist_test_2',
    assignees: ['admin'],
    requirements: {
      level: 'Patient',
      template: 'Any',
      numOfAims: 1
    }
  },
  {
    name: 'worklist_test_3',
    id: 'worklist_test_3',
    duedate: '01012023',
    desc: 'worklist_test_3',
    assignees: ['admin'],
    requirements: {
      level: 'Patient',
      template: 'Any',
      numOfAims: 1
    }
  }
  //   {
  //     name: 'worklist_test_4',
  //     id: 'worklist_test_4',
  //     duedate: '01012024',
  //     desc: 'worklist_test_4',
  //     assignees: 'admin',
  //     requirements: {
  //       level: 'Patient',
  //       template: 'Any',
  //       numOfAims: 1
  //     }
  //   }
];

describe('executing test scenario on ePAD', () => {
  let driver = new Builder().forBrowser('chrome').build();
  const login = new LoginPage(driver);
  const navbar = new Navbar(driver);
  const worklist = new Worklist(driver);

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

  test('it opens worklist page', async () => {
    const result = await navbar.selectMNGSubject('Worklists');
    expect(result).toContain('Worklists');
  });

  
  test('it creates worklist1', async () => {
    const singleWorklist = {
      name: 'worklist_test_1',
      id: 'worklist_test_1',
      duedate: '01012022',
      desc: 'worklist_test_1',
      assignees: ['admin'],
      requirements: {
        level: 'Patient',
        template: 'Any',
        numOfAims: 1
      }
    };

    const worklists = await worklist.createSingleWorklist(singleWorklist);
    const worklistReturned = worklists.filter(
      el => el.name === singleWorklist.name
    );
    assert.equal(worklistReturned[0].name, 'worklist_test_1');
    assert.include(worklistReturned[0].duedate, '2022-01-01');
    assert.equal(worklistReturned[0].desc, 'worklist_test_1');
    assert.include(worklistReturned[0].assignees, 'admin');
    assert.include(worklistReturned[0].requirements, '1:any:Patient');
  });

  test('it creates multiple worklists', async () => {
    const worklists = await worklist.createMultipleWorklist(sampleList);
    const worklist1 = worklists.filter(el => el.name === sampleList[0].name);
    const worklist2 = worklists.filter(el => el.name === sampleList[1].name);
    assert.equal(worklist1[0].name, 'worklist_test_2');
    assert.include(worklist1[0].duedate, '2022-01-01');
    assert.equal(worklist1[0].desc, 'worklist_test_2');
    assert.include(worklist1[0].assignees, 'admin');
    assert.include(worklist1[0].requirements, '1:any:Patient');

    assert.equal(worklist2[0].name, 'worklist_test_3');
    assert.include(worklist2[0].duedate, '2023-01-01');
    assert.equal(worklist2[0].desc, 'worklist_test_3');
    assert.include(worklist2[0].assignees, 'admin');
    assert.include(worklist2[0].requirements, '1:any:Patient');
  });

  

  test('it edits name', async () => {
    
  });

  test('it adds assignees', async () => {});

  test('it removes assignees', async () => {});

  test('it fills duedate', async () => {});

  test('it edits duedate', async () => {});

  test('it changes duedate', async () => {});

  test('it adds requirement', async () => {});

  test('it deletes requirement', async () => {});

  test('it adds description', async () => {});

  test('it deletes description', async () => {});

  
  test('it deletes single worklist from row', async () => {
    const worklistsAfterDelete = await worklist.singleDelete('worklist_test_1');
    const worklistReturned = worklistsAfterDelete.filter(
      el => el.name === 'worklist_test_1'
    );
    assert.lengthOf(worklistReturned, 0, 'don not have worklist_test_1');
  });
  

  test('it deletes multiple worklists', async () => {
    const worklistsAfterDelete = await worklist.multipleDelete([
      'worklist_test_2',
      'worklist_test_3'
    ]);
    const worklistReturned = worklistsAfterDelete.filter(
      el => el.name === 'worklist_test_2' || el.name === 'worklist_test_3'
    );
    assert.lengthOf(
      worklistReturned,
      0,
      'don not have worklist_test_2 or worklist_test_3'
    );
  });


  afterAll(async () => {
    await driver.quit();
  }, 15000);
}, 30000);
