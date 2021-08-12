import Basepage from '../basepage';
import { By, until } from 'selenium-webdriver';

class User extends Basepage {
  constructor(driver) {
    super(driver);
    this.driver = driver;

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
    await this.driver.wait(until.elementLocated(By.className('--email'), 1000));
  }

  async getUserIndex(username) {
    // check if the user list is populated
    if (this.usersList.length === 0 && this.emailsList.length === 0) {
      await this.listUsers();
    }
    // if populated get the index
    return this.emailsList.indexOf(username);
  }

  async compareUserList() {
    const newEmailsList = await this.listUsers();
    return this.emailsList.length > newEmailsList.length;
  }

  async singleDelete(username) {
    const elementXpath = "//div[@id='delete-" + username + "']";
    const deleteButton = await this.driver.findElements(By.xpath(elementXpath));
    await deleteButton[0].click();
    await this.driver.wait(
      until.elementLocated(By.id('modal-delete-button'), 1000)
    );
    const modalDeleteButton = await this.driver.findElement(
      By.id('modal-delete-button')
    );
    await modalDeleteButton.click();
    await this.driver.sleep(3000);
    await this.listUsers();
    return this.emailsList;
  }

  async multipleDelete(userNameList) {
    let checkboxPromises = [];
    // select checkboxes
    userNameList.forEach(element => {
      checkboxPromises.push(this.driver.findElement(By.xpath(`//input[@id="${element}"]`)));
    });
    const checkboxses = await Promise.all(checkboxPromises);
    const actionPromises = [];
    checkboxses.forEach(el => {
      actionPromises.push(el.click());
    });

    await Promise.all(actionPromises);
    // click on delete icon
    const deleteButton = await this.driver.findElement(By.id('delete-icon'));
    await deleteButton.click();

    //click delete on confirmation modal
    await this.driver.wait(
      until.elementLocated(By.id('modal-delete-button'), 1000)
    );
    const modalDeleteButton = await this.driver.findElement(
      By.id('modal-delete-button')
    );
    await modalDeleteButton.click();
    // wait until the value change
    await this.driver.sleep(5000);
    // call listUsers to update user list
    await this.listUsers();
    // return new users list
    return this.emailsList;
  }

  async selectPermission(checkboxName) {
    // find the checkbox by name
    const checkbox = await this.driver.findElement(By.name(checkboxName));
    // click on the checkbox
    checkbox.click();
  }

  async selectProject(cell, project, role) {
    // click on the project
    let text = '';
    await cell.click();
    await this.driver.wait(
      until.elementLocated(By.className('project-table')),
      5000
    );
    // find the list of radio buttons with project
    const radioButton = await this.driver.findElement(
      By.id(`${role}-${project}`)
    );
    // select on the role & project
    await radioButton.click();
    // submit
  }

  async editUserProject(username, project, role, projectName) {
    // check if the user list is populated
    // if populated get the index
    const sanitizedUserName = username.split('').reduce((all, item, index) => {
      if (item !== '\\') all = all + item;
      return all;
    }, '');
    const projectElementId = `projects-${sanitizedUserName}`;
    const cell = await this.driver.findElement(By.id(projectElementId));
    await this.selectProject(cell, project, role);
    let submitButton = await this.driver.findElement(
      By.className('edit-userRole__modal--button submit')
    );
    await submitButton.click();
    let text;
    await this.driver.wait(async () => {
      text = await cell.getText();
      return text.includes(projectName);
    }, 70000);
    return text;
  }

  async editUserPermission(username, permission) {
    // form the id of the cell
    const sanitizedUserName = username.split('').reduce((all, item, index) => {
      if (item !== '\\') all = all + item;
      return all;
    }, '');
    const elementId = `permissions-${sanitizedUserName}`;
    // find the cell
    const cell = await this.driver.findElement(By.id(elementId));
    // click on the cell
    const oldText = await cell.getText();
    await cell.click();
    await this.driver.wait(
      until.elementLocated(By.className('edit-permission__modal--button'), 1000)
    );
    // call this.selectPermission
    await this.selectPermission(permission);

    const submit = await this.driver.findElement(
      By.id('user-permission-submit')
    );
    // submit
    await submit.click();
    // wait until the value change

    await this.driver.wait(async () => {
      const newText = await cell.getText();
      return newText !== oldText;
    }, 7000);
    let permissionText = await cell.getText();
    // return value for assertion
    return permissionText;
  }

  async createUser(username, project, permission) {
    const userEmail = await this.driver.findElement(By.className('--email'));
    userEmail.sendKeys(username);
    await this.driver.wait(until.elementLocated(By.id('Next'), 1000));
    let nextButton = await this.driver.findElement(By.id('Next'));
    nextButton.click();
    await this.driver.wait(
      until.elementLocated(By.className('edit-userPermission'), 1000)
    );
    nextButton.click();
    await this.driver.wait(
      until.elementLocated(By.className('project-table'), 1000)
    );
    let submitButton = await this.driver.findElement(By.id('Submit'));
    submitButton.click();
    await this.driver.wait(until.elementLocated(By.id(username), 1000));
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
    const users = await this.driver.findElements(By.className('rt-tr-group'));
    const tableInfo = [];
    const emailInfo = [];
    const usersResolved = await Promise.all(users);
    for (let i = 0; i < usersResolved.length; i += 1) {
      let textArr = await usersResolved[i].getText();
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
    return emailInfo;
  }

  async findUser(username) {
    await this.listUsers();
    const index = this.emailsList.indexOf(username);
    return index === -1 ? { index } : { index, user: this.usersList[index] };
  }
}

export default User;
