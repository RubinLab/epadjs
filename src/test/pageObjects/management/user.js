import Basepage from '../basepage';
import { By, Key, Builder, until } from 'selenium-webdriver';

class User extends Basepage {
  constructor(driver) {
    super(driver);
    this.driver = driver;
    // this.delete = this.driver.findElement(By.id('delete-icon'));
    // this.indeces = {username: }
    this.addNew = null;
    this.usersList = [];
    this.emailsList = [];
  }

  async openCreateUser() {
    let addNewIcon;
    if (this.addNew) {
      addNewIcon = this.addNew;
    } else {
      addNewIcon = await this.driver.findElement(By.id('addNew-icon'));
      this.addNew = addNewIcon;
    }
    addNewIcon.click();
    await this.driver.wait(until.elementLocated(By.className('--email')));
  }

  async selectPermission(radioButtonValue) {}

  async selectProject(checkboxName) {}

  async editUserProject(username, index) {}

  async editUserPermission(username, index) {}
  
  async createUser(username, project, permission) {
    const userEmail = await this.driver.findElement(By.className('--email'));
    userEmail.sendKeys(username);
    await this.driver.wait(until.elementLocated(By.id('Next')));
    let nextButton = await this.driver.findElement(By.id('Next'));
    nextButton.click();
    await this.driver.wait(
      until.elementLocated(By.className('edit-userPermission'))
    );
    nextButton.click();
    await this.driver.wait(until.elementLocated(By.className('project-table')));
    let submitButton = await this.driver.findElement(By.id('Submit'));
    submitButton.click();
    await this.driver.wait(
      until.elementLocated(By.id(username))
    );
    // TODO
    // create user with project
    // create user with permission
  }

  async listUsers() {
    const users = await this.driver.findElements(By.className('rt-tr-group'));
    const tableInfo = [];
    const emailInfo = [];
    for (let i = 0; i < users.length; i += 1) {
      let textArr = await users[i].getText()
      textArr = textArr.split('\n');
      if (textArr.length > 1) tableInfo.push(textArr);
      for (let text of textArr) {
        if (text.includes('@')) {
          emailInfo.push(text);
        }
      }
    }
    this.usersList = tableInfo;
    this.emailsList = emailInfo;
  }
  async findUser(username) {
    await this.listUsers();
    return this.emailsList.indexOf(username);
  }


}

export default User;
