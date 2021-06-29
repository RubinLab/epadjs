import Basepage from './basepage';
import { By, Key, Builder } from 'selenium-webdriver';

class Annotations extends Basepage {
  constructor(driver) {
    super(driver);
    this.query = driver.findElement(By.name('query'));
    this.type = driver.findElement(By.name('type'));
    this.criteria = driver.findElement(By.name('criteria'));
    this.term = driver.findElement(By.name('term'));
    this.searchButton = driver.findElement(By.name('search-button'));
    this.addButton = driver.findElement(By.name('add-button'));
    this.projectDropdown = driver.findElement(By.name('project-dropdown'));
    this.downloadButton = driver.findElement(By.name('download'))
  }

  //   async selectTabById(tabname) {
  //     await super.clickById(this.tabs[tabname]);
  //   }
}

export default Annotations;
