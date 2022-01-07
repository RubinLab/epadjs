import Basepage from '../basepage';
import { By, until } from 'selenium-webdriver';

class Template extends Basepage {
  constructor(driver) {
    super(driver);
    this.driver = driver;
    this.TemplateList = [];
  }

  async uploadTemplate(path, codeValue) {
    await this.clickById('mng-upload');
    await this.driver.wait(until.elementLocated(By.id('upload-select'), 2500));
    this.driver
      .findElement(By.css('#upload-select>option[value="testProject1"]'))
      .click();

    let chooseFileButton = await this.driver.findElement(By.id('upload-file'));
    await chooseFileButton.sendKeys(path);
    const submitButton = await this.driver.findElement(By.id('upload-submit'));
    await this.driver.wait(until.elementIsEnabled(submitButton));
    await submitButton.click();
    await this.driver.wait(until.elementLocated(By.id(codeValue), 3000));
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

  async singleDelete(templateCodeValue) {
    await this.clickById(`delete-${templateCodeValue}`);
    await this.driver.sleep(1000);
    await this.confirmDelete();
    await this.driver.sleep(3000);
    await this.listTemplates('codeValue');
    return this.TemplateList;
  }

  async multipleDelete(templateList) {
    let checkboxPromises = [];
    // select checkboxes
    templateList.forEach(element => {
      checkboxPromises.push(this.clickById(element));
    });
    await Promise.all(checkboxPromises);
    const deleteButton = await this.driver.findElement(By.id('delete-icon'));
    await deleteButton.click();
    await this.driver.sleep(1000);
    await this.confirmDelete();
    // wait until the value change
    await this.driver.sleep(2000);
    // call listUsers to update user list
    await this.listTemplates('codeValue');
    // return new users list
    return this.TemplateList;
  }

  async editTemplateProjectRelation(templateCode, projectID, text) {
    await this.clickById(`projects-${templateCode}`);
    await this.driver.wait(
      until.elementLocated(By.className('projectTable-modal__header'), 3000)
    );
    await this.clickById(projectID);
    await this.driver.sleep(2000);
    await this.clickById('templateProjectRelation');
    await this.driver.sleep(3000);
    return await this.listTemplates('projects');
  }

  setTemplatesList(list) {
    this.TemplateList = list;
  }

  async listTemplates(assertionKey) {
    const templates = await this.driver.findElements(
      By.className('rt-tr-group')
    );
    const tableInfo = assertionKey === 'projects' ? {} : [];
    const templatesResolved = await Promise.all(templates);
    for (let i = 0; i < templatesResolved.length; i += 1) {
      let textArr = await templatesResolved[i].getText();
      textArr = textArr.split('\n');
      if (textArr.length > 1) {
        if (assertionKey === 'projects') {
          tableInfo[textArr[2]] = textArr[4];
        } else {
          tableInfo.push(textArr[2]);
        }
      }
    }
    this.setTemplatesList(tableInfo);
    return tableInfo;
  }
}

export default Template;
