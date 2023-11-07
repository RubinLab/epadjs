require('chromedriver');
require('geckodriver');
const { Builder, By, Key, until } = require('selenium-webdriver');
const chai = require('chai');
const evaluate = chai.expect;
const assert = chai.assert;
import LoginPage from '../pageObjects/login.js';
import Navbar from '../pageObjects/navbar.js';
import Worklist from '../pageObjects/management/worklist';

jest.setTimeout(10000);

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
    expect(result).toBeTruthy();
  });

  test('it opens management menu', async () => {
    const result = await navbar.selectTabById('management', '.mng-menu');
    expect(result).toBeTruthy();
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
    const newValue = 'worklist_test_1_edited_name';
    const worklists = await worklist.editInput(
      'worklist_test_1',
      'name',
      newValue
    );
    const worklistReturned = worklists.filter(el => el.name === newValue);
    assert.lengthOf(worklistReturned, 1, 'found the updated name');
  });

  // TODO create a new user and add it to a worklist and verify
  // TODO remove the added user and verify
  // test('it adds assignees', async () => {});

  // TODO Remove a worklist's only assignee it should delet the worklist completely
  // test('it removes worklist by removing the only assignee', async () => {});

  test('it edits due date', async () => {
    const newValue = '01012030';
    const worklists = await worklist.editInput(
      'worklist_test_1',
      'due',
      newValue
    );
    const worklistReturned = worklists.filter(
      el => el.duedate === '2030-01-01'
    );
    assert.lengthOf(worklistReturned, 1, 'found the updated date');
  });

  test('it deletes due date', async () => {
    const newValue = '';
    const worklists = await worklist.editInput(
      'worklist_test_1',
      'due',
      newValue
    );
    const worklistReturned = worklists.filter(
      el =>
        el.name === 'worklist_test_1_edited_name' &&
        el.duedate === 'Add due date'
    );
    assert.lengthOf(worklistReturned, 1, 'date is deleted');
  });

  test('it adds requirement', async () => {
    const requirements = {
      level: 'Study',
      template: 'Any',
      numOfAims: 2
    };
    const worklists = await worklist.addRequirement(
      'worklist_test_1',
      requirements
    );
    const worklistReturned = worklists.filter(
      el => el.name === 'worklist_test_1_edited_name'
    );
    const updatedRequirements = worklistReturned[0]?.requirements.split(',');
    console.log('updatedRequirements', updatedRequirements);
    assert.lengthOf(updatedRequirements, 2, 'requirement added');
  });

  test('it deletes one requirement', async () => {
    const worklists = await worklist.deleteRequirement('worklist_test_1');
    const worklistReturned = worklists.filter(
      el => el.name === 'worklist_test_1_edited_name'
    );
    const updatedRequirements = worklistReturned[0]?.requirements.split(',');
    assert.lengthOf(updatedRequirements, 1, 'requirement deleted');
  });

  test('it edits description', async () => {
    const newValue = 'worklist_test_1_edited_desc';
    const worklists = await worklist.editInput(
      'worklist_test_1',
      'desc',
      newValue
    );
    const worklistReturned = worklists.filter(el => el.desc === newValue);
    assert.lengthOf(worklistReturned, 1, 'found the updated description');
  });

  test('it deletes description', async () => {
    const newValue = '';
    const worklists = await worklist.editInput(
      'worklist_test_1',
      'desc',
      newValue
    );
    const worklistReturned = worklists.filter(
      el =>
        el.name === 'worklist_test_1_edited_name' &&
        el.desc === 'Add description'
    );
    assert.lengthOf(worklistReturned, 1, 'description is deleted');
  });

  test('it adds description', async () => {
    const newValue = 'desc added';
    const worklists = await worklist.editInput(
      'worklist_test_1',
      'desc',
      newValue
    );
    const worklistReturned = worklists.filter(
      el =>
        el.name === 'worklist_test_1_edited_name' && el.desc === 'desc added'
    );
    assert.lengthOf(worklistReturned, 1, 'description is added');
  });

  // TODO
  // test('it CAN NOT delete name', async () => {});

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
