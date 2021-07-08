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
    this.permissions = {
      CreateUser: 'user',
      CreatePAC: 'connection',
      CreateAutoPACQuery: 'query',
      CreateProject: 'project',
      CreateWorklist: 'worklist'
    };
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

  async singleDelete(index) {
    // check if the user list is populated
    // if populated get the index
    // form the id of the cell
    // find the delete cell
    // click delete icon
    // wait until the value change
    // call listUsers to update user list
  }

  async multipleDelete(userNameList) {
    // check if the user list is populated
    // iterate over the usernames and get checkboxes and click
    // click on the multiple delete
    // wait until the value change
    // call listUsers to update user list
  }

  async selectPermission(checkboxName) {
    // find the checkbox by name
    const checkbox = await this.driver.findElement(By.name(checkboxName));
    // click on the checkbox
    checkbox.click();
  }

  async selectProject(project, role) {
    // find the list of radio buttons with project
    // iterate over the list and search by role
    // select on the role & project
  }

  async editUserProject(username, project, role) {
    // check if the user list is populated
    // if populated get the index
    // form the id of the cell
    // find the cell
    // get the old value of the cell
    // click on the cell
    // call this.selectProject
    // submit
    // wait until the value change
    // get the new value
    // call listUsers to update user list
  }

  async editUserPermission(username, permission) {
    await this.driver.manage().setTimeouts({ implicit: 3000 });
    // check if the user list is populated
    if (this.usersList.length === 0 && this.emailsList.length === 0) {
      await this.listUsers();
    }
    // if populated get the index
    const index = this.emailsList.indexOf(username);
    // form the id of the cell
    const elementId = `permissions-${index}`;
    console.log('elementid', elementId);
    // find the cell
    const cell = await this.driver.findElement(By.id(elementId));
    // click on the cell
    await cell.click();
    await this.driver.wait(
      until.elementLocated(By.className('edit-permission__modal--button'))
      );
      await this.driver.manage().setTimeouts({ implicit: 6000 });
    // call this.selectPermission
    await this.selectPermission(permission);
    const submit = await this.driver.findElement(
      By.id('user-permission-submit')
    );
    // submit
    await submit.click();
    // wait until the value change
    await this.driver.wait(
      until.elementTextContains(cell, this.permissions[permission])
    );
  
  }

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
    await this.driver.wait(until.elementLocated(By.id(username)));
    // TODO
    // create user with project
    // create user with permission
  }

  setEmailsList(list) {
    this.emailsList = list;
  }

  setUsersList(list) {
    this.usersList = list;
  }

  async listUsers() {
    await this.driver.manage().setTimeouts({ implicit: 6000 });
    const users = await this.driver.findElements(By.className('rt-tr-group'));
    const tableInfo = [];
    const emailInfo = [];
    for (let i = 0; i < users.length; i += 1) {
      let textArr = await users[i].getText();
      textArr = textArr.split('\n');
      if (textArr.length > 1) tableInfo.push(textArr);
      for (let text of textArr) {
        if (text.includes('@')) {
          emailInfo.push(text);
        }
      }
    }
    this.setUsersList(tableInfo);
    this.setEmailsList(emailInfo);
    // console.log(' ----> should see only once');
  }

  async findUser(username) {
    if (this.emailsList.length === 0 && this.usersList.length === 0) {
      await this.listUsers();
    }
    // console.log(' -----> this.emailsList');
    // console.log(this.emailsList);
    const index = this.emailsList.indexOf(username);
    return { index, user: this.usersList[index] };
  }
}

export default User;
