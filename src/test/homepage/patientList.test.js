require('chromedriver');
require('geckodriver');
const { Builder, By, Key, until } = require('selenium-webdriver');
const chai = require('chai');
const evaluate = chai.expect;
import LoginPage from '../pageObjects/login.js';
import Navbar from '../pageObjects/navbar.js';
import LeftSidebar from '../pageObjects/leftSideBar';
import PatientList from '../pageObjects/patientList';

jest.setTimeout(30000);

const patientListData = {
  pathToPtient: '/Users/ozge/Documents/patients/Patient-7full.zip',
  pathToRecistAims: '/Users/ozge/Documents/Dev/recist_annotations_json.zip',
  patientID: '7'
};

describe('executing test scenario on ePAD', () => {
  let driver = new Builder().forBrowser('chrome').build();
  const login = new LoginPage(driver);
  const navbar = new Navbar(driver);
  const leftSidebar = new LeftSidebar(driver);
  const patientList = new PatientList(driver);

  const projectDetails = {
    id: 'testProject1'
  };

  // before all
  // create a random project
  // create a random worklist

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

  test('it selects the project - ', async () => {
    const urlID = await leftSidebar.selectProject(projectDetails.id);
    expect(urlID).toBe(projectDetails.id);
  });

  test('it should not have a patient', async () => {
    const result = await patientList.getPatientList(' before upload');
    expect(result).toHaveLength(0);
  });

  test('it uploads a patient', async () => {
    await patientList.upload(patientListData.pathToPtient);
    const patients = await patientList.getPatientList(' uploaded');
    expect(patients).toHaveLength(1);
  });

  test('it verifies patient count badge shows the correct number', async () => {
    const patientBadge = await leftSidebar.getPatientCountFromBadge(
      projectDetails.id
    );
    expect(patientBadge).toBe('1');
  });

  test('it downloads patient', async () => {});

  test('it uploads annotations', async () => {
    await patientList.upload(patientListData.pathToRecistAims);
    const aimCount = await patientList.getsubjectAimCount(patientListData.patientID);
    expect(aimCount).toBe('13');
  });

  test('it expands patient from the arrow', async () => {});

  test('it expands study from the arrow', async () => {});

  test('it expands series from the arrow', async () => {});

  test('it verifies annotations are present', async () => {});

  test('it verifies the eye icon opens the annotation', async () => {});

  test('it verifies the eye icon opens the series', async () => {});

  test('it verifies the eye icon opens the study - series selection modal', async () => {});

  test('it verifies selected series are opened', async () => {});

  test('it shows warning when trying to delete an aim of an opened series', async () => {});

  test('it shows warning when trying to delete an opened series', async () => {});

  test('it shows warning when trying to delete a study whose one of series is open', async () => {});

  test('it shows warning when trying to delete a patient whose one of series is open', async () => {});

  test('it uploads another patient', async () => {});

  test('it expands by one level and displays studies', async () => {});

  test('it expands by one level and displays series', async () => {});

  test('it expands by one level and displays annotations', async () => {});

  test('it closes all levels after clicking icon', async () => {});

  test('it adds the selected subject to another project', async () => {});

  test("it adds the selected subject's studies to a worklist", async () => {});

  test('it deletes an annotation', async () => {});

  test('it deletes a series', async () => {});

  test('it deletes a study', async () => {});

  test('it deletes a patient', async () => {});

  // TODO
  // test not opening duplicate series and jumping to display view
  // verif max port opening case

  afterAll(async () => {
    // delete random worklist
    // delete random project
    await driver.quit();
  }, 15000);
}, 30000);
