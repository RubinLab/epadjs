import Basepage from '../basepage';
import { By, until } from 'selenium-webdriver';

class Project extends Basepage {
  constructor(driver) {
    super(driver);
    this.driver = driver;
    this.projectList = [];
  }

  async openCreateProject() {
    let addNewIcon;
    if (this.addNew) {
      addNewIcon = this.addNew;
    } else {
      addNewIcon = await this.driver.findElement(By.id('addNew-icon'));
      this.addNew = addNewIcon;
    }
    addNewIcon.click();
    await this.driver.wait(until.elementLocated(By.id('projectName'), 1000));
  }

  async confirmDelete() {
    //click delete on confirmation modal
    await this.driver.wait(
        until.elementLocated(By.id('modal-delete-button'), 1000)
      );
      const modalDeleteButton = await this.driver.findElement(
        By.id('modal-delete-button')
      );
      await modalDeleteButton.click();
  }

  async singleDelete(projectID) {
    await super.clickById(`delete-${projectID}`);
    await this.driver.sleep(2000);
    await this.confirmDelete();
    await this.driver.sleep(3000);
    await this.listProjects();
    return this.projectList;
  }

  async multipleDelete(projectList) {
    let checkboxPromises = [];
    // select checkboxes
    projectList.forEach(element => {
      checkboxPromises.push(this.driver.findElement(By.id(element.id)));
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
    await this.driver.sleep(1000);
    await this.confirmDelete();
    // wait until the value change
    await this.driver.sleep(2000);
    // call listUsers to update user list
    await this.listProjects();
    // return new users list
    return this.projectList;
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

  async selectDropdownOption(dropdown, option) {
    await super.clickById(dropdown);
    await this.driver.sleep(500);
    await super.clickById(option);
    await this.driver.sleep(500);
  }

  async createProject(name, id, description, template, type) {
    if (name) await super.enterTextByCss('#projectName', name);
    if (id) await super.enterTextByCss('#projectID', id);
    if (description)
      await super.enterTextByCss('#projectDescription', description);
    if (template) await this.selectDropdownOption('#projectTemplate', template);
    if (type) await this.selectDropdownOption('projectType', type);
    await super.clickById('submit-button');
    await this.driver.sleep(2000);
  }

  async createSingleProject(name, id, description, template, type) {
    await this.openCreateProject();
    await this.createProject(name, id, description, template, type);
    await this.driver.wait(until.elementLocated(By.id(id), 2500));
    await this.listProjects();
    return this.projectList;
  }

  async createMultipleProjects(list) {
    for (let i = 0; i < list.length; i++) {
      const { name, id, description, template, type } = list[i];
      await this.openCreateProject();
      await this.createProject(name, id, description, template, type);
    }
    const lastProjectID = list[list.length - 1].id;
    await this.driver.wait(until.elementLocated(By.id(lastProjectID), 3500));
    await this.listProjects();
    return this.projectList;
  }

  setProjectsList(list) {
    this.projectList = list;
  }

  async listProjects() {
    const projects = await this.driver.findElements(
      By.className('rt-tr-group')
    );
    const tableInfo = [];
    const projectsResolved = await Promise.all(projects);
    for (let i = 0; i < projectsResolved.length; i += 1) {
      let textArr = await projectsResolved[i].getText();
      textArr = textArr.split('\n');
      if (textArr.length > 1) tableInfo.push(textArr[0]);
    }
    this.setProjectsList(tableInfo);
    return tableInfo;
  }
}

export default Project;
