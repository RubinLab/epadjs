import { By, Builder, until } from 'selenium-webdriver';
const { testUrl } = require('../../../public/config.json');
// const driver = new Builder().forBrowser('chrome').build();
// driver.manage().setTimeouts({ implicit: 10000 });

class Basepage {
  constructor(driver) {
    this.driver = driver;
  }

  go_to_url() {
    this.driver.get(testUrl);
  }

  async getTextByCss(css) {
    let foo = await this.driver.wait(until.elementLocated(By.css(css)), 30000, 'Timed out after 30 seconds', 1000)
    const result = await this.driver.findElement(By.css(css)).getText();
    // expect(result).toContain(text);
    return result;
  }

  async enterTextByCss(css, text) {
    const element =  await this.driver.findElement(By.css(css));
    // console.log(' ----> form element', css, text)
    // console.log(element)
    await element.sendKeys(text);
  }

 
  async clickById(id) {
    await this.driver.findElement(By.id(id)).click();
  }

  sleep(seconds) {
    var e = new Date().getTime() + seconds * 1000;
    while (new Date().getTime() <= e) {}
  }
}

export default Basepage;
