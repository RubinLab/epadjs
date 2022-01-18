import Basepage from './basepage';
import { By, Key, Builder, until } from 'selenium-webdriver';

class PatientList extends Basepage {
  constructor(driver) {
    super(driver);
    this.driver = driver;
    this.patientCount = 0;
  }

  setPatientCount(count) {
    this.patientCount = count;
  }

  getPatientCount() {
    return this.patientCount;
  }

  async getFilteredPatientList(filter) {}
  async getPatientList(test) {
    // try {
    const list = await this.driver.findElements(
      By.className('subject-table-row')
    );
    this.setPatientCount(list.length);
    return list;
    // } catch (err) {
    //   console.log(err);
    //   return err.name;
    // }
  }
  async upload(path) {
    await this.clickById('patientList-upload');
    await this.driver.wait(until.elementLocated(By.id('upload-select'), 2500));
    this.driver
      .findElement(By.css('#upload-select>option[value="testProject1"]'))
      .click();
    let chooseFileButton = await this.driver.findElement(By.id('upload-file'));
    await chooseFileButton.sendKeys(path);
    const submitButton = await this.driver.findElement(By.id('upload-submit'));
    await this.driver.wait(until.elementIsEnabled(submitButton));
    await submitButton.click();
    // await this.driver.wait(
    //   until.elementLocated(By.className('subject-table-row'), 30000)
    // );
    // TODO - fix wait by implementing checking notification
    await this.driver.sleep(5000);
  }

  // to assert upload
  // wait until check the bell icon in the navbar
  // then open notification center
  // get the top

  async getsubjectAimCount(patientID) {
    const id = `aimCount-${patientID}`;
    let aimBadge = await this.driver.findElement(By.id(id)).getText();
    return aimBadge;
  }
}

export default PatientList;
