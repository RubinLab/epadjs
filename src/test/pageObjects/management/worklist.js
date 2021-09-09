import Basepage from '../basepage';
import { By, until } from 'selenium-webdriver';

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

  async singleDelete(username) {
    const elementXpath = "//div[@id='delete-" + username + "']";
    const deleteButton = await this.driver.findElements(By.xpath(elementXpath));
    await deleteButton[0].click();

    await this.driver.wait(
      until.elementLocated(By.id('modal-delete-button'), 10000)
    );
    const modalDeleteButton = await this.driver.findElement(
      By.id('modal-delete-button')
    );
    await modalDeleteButton.click();
    await this.driver.sleep(3000);
    await this.worklists();
    return this.emailsList;
  }

  async multipleDelete(userNameList) {
    let checkboxPromises = [];
    // select checkboxes
    userNameList.forEach(element => {
      checkboxPromises.push(
        this.driver.findElement(By.xpath(`//input[@id="${element}"]`))
      );
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
    // call listWorklists to update user list
    await this.listWorklists();
    // return new users list
    return this.emailsList;
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
    const titles = ['name', 'assignees', 'duedate', 'requirements', 'desc'];

    for (let i = 0; i < worklistsResolved.length; i += 1) {
      let textArr = await worklistsResolved[i].getText();
      textArr = textArr.split('\n');
      const obj = {};
      for (let k = 0; k < textArr.length; k++) {
        if ('Click to edit requirements' === textArr[k]) continue;
        obj[titles[k]] = textArr[k];
      }
      tableInfo.push(obj);
    }
    this.setWorklistList(tableInfo);
    return tableInfo;
  }
}

export default Worklist;
