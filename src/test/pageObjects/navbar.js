import Basepage from './basepage';
import { By, Key, Builder, until } from 'selenium-webdriver';

class Navbar extends Basepage {
  constructor(driver) {
    super(driver);
    this.driver = driver;
    this.tabIds = {
      annotations: 'navbar-ann',
      management: 'mng-icon'
    };
    this.management = null;
  }

  async selectTabById(tabname) {
    await this.driver.wait(until.elementLocated(By.id(this.tabIds[tabname])));
    await super.clickById(this.tabIds[tabname]);
    await this.driver.wait(until.elementLocated(By.className('mng-menu')));
  }

  async formManagementMenu() {
    await this.driver.wait(
      until.elementLocated(By.className('mng-menu__option'))
    );
    const subjects = await this.driver.findElements(
      By.className('mng-menu__option')
    );
    const subjectsTitles = {};
    for (let subject of subjects) {
      const text = await subject.getText();
      subjectsTitles[text] = subject;
    }
    this.management = subjectsTitles;
    return subjectsTitles;
  }

  async selectMNGSubject(subject) {
    const subjects = await this.formManagementMenu();
    await subjects[subject].click();
    const title = await this.driver.findElement(By.className('mng-header'));
    return title.getText();
  }
}

export default Navbar;
