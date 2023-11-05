import Basepage from './basepage';
import { By, Key, Builder, until } from 'selenium-webdriver';

class LoginPage extends Basepage {
  constructor(driver) {
    super(driver);
    this.driver = driver;
  }

  launchLoginPage() {
    super.go_to_url();
  }

  async login() {
    super.go_to_url();
    await this.driver.wait(until.elementLocated(By.id('username')));
    await this.driver.wait(until.elementLocated(By.id('password')));
    await this.driver.wait(until.elementLocated(By.id('kc-login')));
    await super.enterTextByCss('#username', 'admin');
    await super.enterTextByCss('#password', 'admin');
    await super.clickById('kc-login');
    await this.driver.wait(until.elementLocated(By.id('epad-logo')));
  }

  
  async verifyLoggedIn() {
    await this.driver.wait(until.elementLocated(By.id('epad-logo')));
    const epadLogo = await this.driver.findElement(By.id('epad-logo'));
    return epadLogo;
  }
}

export default LoginPage;
