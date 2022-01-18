import Basepage from './basepage';
import { By, Key, Builder, until } from 'selenium-webdriver';
const { testUrl } = require('../../../public/config.json');

class LeftSidebar extends Basepage {
  constructor(driver) {
    super(driver);
    this.driver = driver;
    this.tabIds = {
      projects: 'controlled-tab-leftSidebar-tab-0',
      worklists: 'controlled-tab-leftSidebar-tab-1',
      progress: 'controlled-tab-leftSidebar-tab-2'
    };
    this.paneIds = {
      projects: 'controlled-tab-leftSidebar-tabpane-0',
      worklists: 'controlled-tab-leftSidebar-tabpane-1',
      progress: 'controlled-tab-leftSidebar-tabpane-2'
    };
    this.management = null;
  }

  async selectTab(tabname) {
    await this.driver.wait(until.elementLocated(By.id(this.tabIds[tabname])));
    await super.clickById(this.tabIds[tabname]);
    await this.driver.wait(until.elementLocated(By.id(this.paneIds[tabname])));
  }

  async selectProject(projectID) {
    await this.driver.wait(until.elementLocated(By.id(`pid-${projectID}`)));
    await this.clickById(`pid-${projectID}`);
    // await this.driver.wait(until.urlMatches(new RegExp(`/${projectID}/`)));
    const currentUrl =  await this.driver.getCurrentUrl()
    return currentUrl.split('/').pop();
  }

  async getPatientCountFromBadge(projectID) {
    let badge = await this.driver.findElement(By.id(`subjectCount-${projectID}`))
    badge = await badge.getText();  
    return badge;
  }

}

export default LeftSidebar;
