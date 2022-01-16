import Basepage from './basepage';
import { By, Key, Builder, until } from 'selenium-webdriver';
const { testUrl } = require('../../../public/config.json');

class PatientList extends Basepage {
  constructor(driver) {
    super(driver);
    this.driver = driver;
  }

  async getFilteredPatientList(filter) {}
  async getPatientList() {
    try {
      const list = await this.driver.findElement(
        By.className('subject-table-row')
      );
      return list;
    } catch (err) {
      return err.name;
    }
  }
}

export default PatientList;
