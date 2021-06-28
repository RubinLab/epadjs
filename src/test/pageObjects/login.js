import Basepage from './basepage';
import { By, Key, Builder } from 'selenium-webdriver';


class LoginPage extends Basepage {

  constructor (driver) {
    super(driver)
  }
  
  async validateLoginPage() {
    super.go_to_url();
    const logInTitle = await super.getTextByCss('#kc-page-title')
    return logInTitle;
  }

  async login() {
    // super.go_to_url();
    await super.enterTextByCss('#username', 'admin');
    await super.enterTextByCss('#password', 'admin');
    await super.clickById('kc-login');
  }

  async verifyLoggedIn() {
    const epadLogo = await super.getTextByCss('#epad-logo')
    return epadLogo;
  }

}

export default LoginPage;
