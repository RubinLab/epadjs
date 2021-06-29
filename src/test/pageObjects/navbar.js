import Basepage from './basepage';
import { By, Key, Builder } from 'selenium-webdriver';

class Navbar extends Basepage {
  constructor(driver) {
    super(driver);
    this.tabIds = {
      annotations: 'navbar-ann'
    };
  }

  async selectTab(tabname) {
    await super.clickById(this.tabIds[tabname]);
  }
}

export default Navbar;
