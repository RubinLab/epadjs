import Basepage from '../basepage';
import { By, until, Key } from 'selenium-webdriver';

class Worklist extends Basepage {
  constructor(driver) {
    super(driver);
    this.driver = driver;
    this.addNew = null;
    this.worklistList = [];
  }

  async openCreateWorklist() {
    let addNewIcon;
    if (this.addNew) {
      addNewIcon = this.addNew;
    } else {
      addNewIcon = await this.driver.findElement(By.id('addNew-icon'));
      this.addNew = addNewIcon;
    }
    addNewIcon.click();
    await this.driver.wait(
      until.elementLocated(By.id('addWorklist-name'), 1000)
    );
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

  async singleDelete(worklistID) {
    await this.clickById(`delete-${worklistID}`);
    await this.confirmDelete();
    await this.driver.sleep(3000);
    return await this.listWorklists();
  }

  async multipleDelete(worklistIDList) {
    let checkboxPromises = [];
    // select checkboxes
    worklistIDList.forEach(element => {
      checkboxPromises.push(this.driver.findElement(By.id(element)));
    });
    const checkboxses = await Promise.all(checkboxPromises);
    const actionPromises = [];
    checkboxses.forEach(el => {
      actionPromises.push(el.click());
    });

    await Promise.all(actionPromises);
    // click on delete icon
    await this.clickById('delete-icon');
    //click delete on confirmation modal
    await this.confirmDelete();
    // wait until the value change
    await this.driver.sleep(2000);
    // call listWorklists to update user list
    // return new users list
    return await this.listWorklists();
  }

  async sendKeysToField(id, attr, value) {
    const elementId = `${attr}-${id}`;
    await this.clickById(elementId);
    let inputField;
    if (attr === 'due') {
      inputField = await this.driver.findElement(By.name('duedate'));
    } else {
      inputField = await this.driver.findElements(
        By.className('edit-user__modal--input')
      );
      inputField = inputField[0];
    }
    if (value) {
      await inputField.clear();
      await inputField.sendKeys(value);
      await inputField.sendKeys(Key.RETURN);
    } else if (!value && attr === 'due') {
      await inputField.sendKeys(Key.DELETE);
    } else {
      const text = await inputField.getAttribute('value');
      for (let i = 0; i < text.length; i++) {
        await inputField.sendKeys(Key.BACK_SPACE);
      }
      await this.driver.sleep(2000);
      await inputField.sendKeys(Key.RETURN);
    }
    await this.driver.sleep(500);
  }

  async editInput(id, attr, value) {
    await this.driver.sleep(2000);
    await this.sendKeysToField(id, attr, value);
    if (attr === 'due') {
      let button = await this.driver.findElements(
        By.className('updateDueDate__modal--button')
      );
      button = button[0];
      await button.click();
    }
    await this.driver.sleep(2000);
    return await this.listWorklists();
  }

  async addRequirement(id, requirements) {
    await this.driver.sleep(2000);
    const elementId = `req-${id}`;
    await this.clickById(elementId);
    // click on add button
    await this.driver.wait(
      until.elementLocated(By.className('updateReq__btn'), 1500)
    );
    const buttons = await this.driver.findElements(
      By.className('updateReq__btn')
    );
    await buttons[0].click();
    // fill requirement form
    await this.driver.wait(
      until.elementLocated(By.className('worklist-requirementForm'), 1500)
    );
    await this.fillRequirementForm(requirements);
    const submit = await this.driver.findElements(
      By.className('updateReq__modal--button')
    );
    await submit[0].click();
    await this.driver.sleep(2000);
    return await this.listWorklists();
  }

  async deleteRequirement(id) {
    const elementId = `req-${id}`;
    await this.clickById(elementId);
    await this.driver.wait(
      until.elementLocated(By.css('button[name="edit"]'), 2000)
    );
    const button = await this.driver.findElement(By.css('button[name="edit"]'));
    await button.click();
    const deleteIcons = await this.driver.findElement(
      By.css('div[name="delete-req"]')
    );
    await deleteIcons.click();
    await this.driver.sleep(2000);
    return await this.listWorklists();
  }

  async fillRequirementForm(requirements) {
    const levelEl = await this.driver.findElement(By.name('level'));
    const templateEl = await this.driver.findElement(By.name('template'));
    const numOfAimsEl = await this.driver.findElement(By.name('numOfAims'));
    const { level, template, numOfAims } = requirements;
    await levelEl.click();
    await this.clickById(level);
    await templateEl.click();
    await this.clickById(template);
    await numOfAimsEl.sendKeys(numOfAims);
  }

  async handleAssigneeSelect(assigneeList) {
    for (let i = 0; i < assigneeList.length; i++) {
      await this.clickById(assigneeList[i]);
      //   await this.driver.wait(
      //     until.elementIsSelected(By.id(assigneeList[i]), 1000)
      //   );
      await this.driver.sleep(1000);
    }
  }

  async editAssigne(assignee) {
    await this.handleAssigneeSelect([assignee]);
    const button = await this.driver.findElements(
      By.className('updateAssignee__modal--button')
    );
    await button[0].click();
    await this.driver.sleep(1500);
    return await this.listWorklists();
  }

  async createWorklist(name, id, duedate, desc, assignees, requirements) {
    await this.openCreateWorklist();

    if (name) {
      await super.enterTextByCss('#addWorklist-name', name);
    }
    if (id) {
      await super.enterTextByCss('#addWorklist-id', id);
    }
    if (duedate) {
      await super.enterTextByCss('#addWorklist-due', duedate);
    }
    if (desc) {
      await super.enterTextByCss('#addWorklist-desc', desc);
    }
    // await this.driver.wait(until.elementIsEnabled(By.id('next-btn'), 1000));
    await this.driver.sleep(1000);
    await this.clickById('Next');
    // await this.driver.wait(
    //   until.elementIsVisible(By.id('addWorklist-users'), 1000)
    // );
    await this.driver.sleep(1000);

    if (assignees) {
      await this.handleAssigneeSelect(assignees);
    }
    await this.clickById('Next');
    // await this.driver.wait(
    //   until.elementIsVisible(By.id('addWorklist-requirements'), 1000)
    // );
    await this.driver.sleep(1000);

    if (requirements) {
      await this.fillRequirementForm(requirements);
    }
    await this.driver.sleep(3000);
    await this.clickById('Submit');
  }

  async createSingleWorklist(info) {
    const { name, id, duedate, desc, assignees, requirements } = info;
    await this.createWorklist(name, id, duedate, desc, assignees, requirements);
    await this.driver.sleep(3000);
    return await this.listWorklists();
  }

  async createMultipleWorklist(list) {
    for (let item of list) {
      const { name, id, duedate, desc, assignees, requirements } = item;
      await this.createWorklist(
        name,
        id,
        duedate,
        desc,
        assignees,
        requirements
      );
      await this.driver.sleep(300);
    }
    await this.driver.sleep(4000);
    return await this.listWorklists();
  }

  setWorklistList(info) {
    this.worklistList = info;
  }

  async listWorklists() {
    const worklists = await this.driver.findElements(
      By.className('rt-tr-group')
    );
    const tableInfo = [];
    const worklistsResolved = await Promise.all(worklists);

    for (let i = 0; i < worklistsResolved.length; i += 1) {
      let titles = ['name', 'assignees', 'duedate', 'requirements', 'desc'];
      let textArr = await worklistsResolved[i].getText();
      textArr = textArr.split('\n');
      textArr = textArr.filter(el => el !== 'Click to edit requirements');
      const obj = {};
      for (let k = 0; k < textArr.length; k++) obj[titles[k]] = textArr[k];
      tableInfo.push(obj);
    }
    this.setWorklistList(tableInfo);
    return tableInfo;
  }
}

export default Worklist;
