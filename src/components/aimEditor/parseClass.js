// uncomment 2 imports below for react

import $ from "jquery/dist/jquery.js";
import "./semantic/semantic.css";
import "./semantic/semantic.js";
import DOMPurify from "dompurify";
import { teachingFileTempCode } from "constants";

const mode = sessionStorage.getItem("mode");

//export next variable for react
export var AimEditor = function (
  userWindow,
  // varformCheckHandler,
  varRenderButtonHandler,
  aimName,
  setAimDirty,
  lastSavedAim,
  isTeachingFlag,
  tachingDivParent
) {
  //this.mapObjCodeValueParent = new Map();

  var self = this;
  var selectid = 0;
  this.loadingAimFlag = false;
  this.handlerSetAimDirty = setAimDirty;
  this.activateDirtyCheck = false;
  this.fontcolor = "#c9cdd4";
  this.fontsize = "13px";
  this.fontweight = "1500";
  this.fontfamily = "Lato, Helvetica Neue, Arial, Helvetica, sans-serif;";
  this.renderButtonhandler = varRenderButtonHandler;
  // this.formCheckHandler = varformCheckHandler;
  this.userWindow = userWindow;
  this.arrayTemplates = [];
  this.arrayTemplatesJsonObjects = [];
  this.json = "";
  this.jsonTemplateCopy = "";
  this.mainWindowDiv = "";
  this.primitiveJson = "";
  this.mapCardinalitiesToCheckId = new Map();
  this.mapStatusAllowedTermBlocks = new Map();
  this.mapTemplateCodeValueByIndex = new Map();
  this.mapLabelAnnotatorConfidence = new Map(); // combine each label with annotator confidence. annotator confidence exist if label exists for that component or sub component
  this.mapLabelAnnotConfJson = new Map(); // records json object to change the annotator confidence value associated with label
  this.mapLabelSubComment = new Map(); // this comment represent other than annotation comment(which is unique for the template).
  this.mapLabelCommentJson = new Map(); // records json object to change the comment value associated with label
  this.mapLabelUid = new Map(); // relates label  with uid on load
  this.subOrderLabelTracking = 64;
  this.ids = 0;
  this.maptag = [];
  this.savebtn = null;
  this.textXml = null;
  this.divHolderForButtons = null;
  this.aimComment = "";
  this.aimType = "";
  this.aimName = aimName;
  this.aimTypeCode = "";
  this.templateSelectedIndex = -1;
  this.runtimeUserShapes = {};
  this.geoshapeidCounter = 0;
  this.mathOperators = new Map();
  this.mathOperators.set("Equal", "=");
  this.mathOperators.set("NotEqual", "!=");
  this.mathOperators.set("LessThan", "<");
  this.mathOperators.set("GreaterThan", ">");
  this.mathOperators.set("LessThanEqual", "<=");
  this.mathOperators.set("GreaterThanEqual", ">=");

  this.mapShapesSchemaToTemplate = new Map();
  this.mapShapesSchemaToTemplate.set("TwoDimensionPolyline", {
    formshape: "Polygon",
  });
  this.mapShapesSchemaToTemplate.set("TwoDimensionMultiPoint", [
    { formshape: "Line" },
    { formshape: "Perpendicular" },
  ]);
  this.mapShapesSchemaToTemplate.set("TwoDimensionPoint", {
    formshape: "Point",
  });
  this.mapShapesSchemaToTemplate.set("TwoDimensionCircle", {
    formshape: "Circle",
  });
  this.mapShapesSchemaToTemplate.set("Bidirectional", {
    formshape: "Perpendicular",
  });
  this.anyClosedShapeTypes = ["Circle", "Polyline", "Polygon"]; // what is polyline ?
  this.templateShapeArray = []; //each array element is a json object {"shape":'Point', "domid" : '2.25.33554445511225454'});
  this.defaultTemplate = null;
  this.preOpen = null;
  this.aimForAutoFill = "";
  this.isRecistFlag = false;

  // shortcut keys variables to relate allowed terms and html elements
  this.mapShortCutKeys = new Map();
  this.mapcodeValueShortCutKeys = new Map();
  //  example usage in template "keyShortCut" :"ctrlKeyshiftKey+U"

  this.templateType = "";

  function constructor() {
    if (self.arrayTemplates === "undefined") self.arrayTemplates = [];
    document.addEventListener("keydown", self.aimshortCutKeyEvent, false);
  }

  this.getSelectedTemplateType = function () {
    // return type : string
    // values can be : "Study", "Series", "Image"
    return self.templateType;
  };

  this.arrayDifference = function (base, compareto) {
    let differences = [];
    for (var i = 0; i < base.length; i++) {
      if (!compareto.includes(base[i])) {
        differences.push(base[i]);
      }
    }

    return differences;
  };

  this.aimshortCutKeyEvent = function (e) {
    let keyvalue = "";
    let altvalue = "";
    let ctrlvalue = "";
    let shiftvalue = "";

    if (e.altKey) {
      altvalue = "altKey";
      keyvalue = "altKey";
    }

    if (e.ctrlKey) {
      ctrlvalue = "ctrlKey";
      keyvalue = keyvalue + "ctrlKey";
    }

    if (e.shiftKey) {
      shiftvalue = "shiftKey";
      keyvalue = keyvalue + "shiftKey";
    }

    keyvalue = keyvalue + "+" + String.fromCharCode(e.keyCode);
    if (self.mapShortCutKeys.get(keyvalue)) {
      if (self.mapShortCutKeys.get(keyvalue) !== null) {
        document.getElementById(self.mapShortCutKeys.get(keyvalue)).click();
      }
    }
  };

  this.removeKeyShortCutEvent = function () {
    document
      .getElementById("root")
      .removeEventListener("keydown", self.aimshortCutKeyEvent);
  };

  this.loadTemplates = function (templateList) {
    let defaultTempCodeVal = "";
    let preOpenTempCodeValue = "";
    if (templateList.default) {
      defaultTempCodeVal = templateList.default;
    }
    if (templateList.preOpen && templateList.preOpen !== "") {
      preOpenTempCodeValue = templateList.preOpen;
    }
    self.arrayTemplatesJsonObjects = JSON.parse(
      JSON.stringify(templateList.all)
    );

    if (self.arrayTemplatesJsonObjects.length > 0) {
      for (var i = 0; i < self.arrayTemplatesJsonObjects.length; i++) {
        var object = {};
        object.codeValue =
          self.arrayTemplatesJsonObjects[i].TemplateContainer.Template[0][
            "codeValue"
          ];
        object.arrayIndex = i;
        self.mapTemplateCodeValueByIndex.set(object.codeValue, i);
        if (self.loadingAimFlag === false) {
          if (templateList.default !== null) {
            if (defaultTempCodeVal === object.codeValue) {
              self.defaultTemplate = i + 1;
            }
          }
          if (preOpenTempCodeValue !== "") {
            if (preOpenTempCodeValue === object.codeValue) {
              self.preOpen = i + 1;
            }
          }
        }
      }
    }
  };

  this.triggerAutoFillAim = function (lastSavedAim) {
    self.aimForAutoFill = lastSavedAim;
    self.loadAimJson(self.aimForAutoFill, null);
  };

  this.createViewerWindow = function () {
    self.renderButtonhandler(true);
    self.mainWindowDiv = document.createElement("div");

    // below section needs to be uncommented for testing purpose
    /*  self.mainButtonsDiv = document.createElement('div');
        this.addButtons(this.mainWindowDiv);
        this.mainWindowDiv.appendChild(x);
    */
    // above section needs to be uncommented for testing purpose
    self.templateListDiv = document.createElement("div");
    self.templateListDiv.id = "tlist";
    self.templateListDiv.style.width = "100%";

    self.shapeDiv = document.createElement("div");
    self.shapeDiv.id = "shape";

    self.accordion1Div = document.createElement("div");
    self.accordion1Div.id = "accordion1";
    self.accordion1Div.className = " ui accordion";
    self.accordion1Div.style = "background-color: inherit; width:inherit;";

    var accordion2Div = document.createElement("div");
    accordion2Div.id = "accordion2";
    accordion2Div.className = " ui accordion";

    self.mainWindowDiv.appendChild(self.templateListDiv);
    self.mainWindowDiv.appendChild(self.accordion1Div);

    //below line needs to be uncommented for testing purpose
    //self.mainWindowDiv.appendChild(self.mainButtonsDiv);

    //creating template select drop down
    // self.arrayTemplates = ["Select ", "short.json", "multiImage.json", "short1.json", "test3.json", "ATS_Template.json", "BeaulieuBoneTemplate_rev13.json", "coordinationTest.json", "Liver_Template_ePad_CFB_rev15.json", "LT.json", "asdf.json", "BeaulieuBoneTemplate_rev18.json", "LungNoduleFeaturesV2LT1.json", "meduloblastoma.json"];
    var templateDiv = document.createElement("div");
    self.templateSelect = document.createElement("select");
    templateDiv.id = "Temp";
    self.templateSelect.id = "S1";

    self.templateSelect.className = "ui dropdown";
    templateDiv.appendChild(self.templateSelect);
    var i = 0;
    var templateOption = document.createElement("option");
    templateOption.value = "-1";
    templateOption.text = "Select Template";
    self.templateSelect.appendChild(templateOption);

    for (i = 0; i < self.arrayTemplatesJsonObjects.length; i++) {
      var templateOption = document.createElement("option");
      let tempTemplateType = "";
      if (
        self.arrayTemplatesJsonObjects[
          i
        ].TemplateContainer.Template[0].hasOwnProperty("templateType")
      ) {
        tempTemplateType =
          self.arrayTemplatesJsonObjects[i].TemplateContainer.Template[0]
            .templateType;
      } else {
        tempTemplateType = "Image";
      }
      templateOption.value = i;
      templateOption.text =
        self.arrayTemplatesJsonObjects[i].TemplateContainer.Template[0].name +
        "-" +
        tempTemplateType +
        " Template ";
      self.templateSelect.appendChild(templateOption);
    }

    self.templateListDiv.appendChild(self.templateSelect);
    self.userWindow.appendChild(self.mainWindowDiv);
    self.templateShapeArray = [];
    self.templateSelect.onchange = function () {
      // Mete thinks name and comment should be preserved on Template change
      // self.aimComment = "";
      // self.aimName = "";
      self.aimType = "";
      self.aimTypeCode = "";
      self.templateSelectedIndex = this.value;

      self.jsonTemplateCopy = "";
      self.accordion1Div.innerHTML = "";
      self.shapeDiv.innerHTML = "";
      //uncomment below line for testing
      //self.mainButtonsDiv.innerHTML = "";

      self.mapStatusAllowedTermBlocks = new Map();
      self.mapLabelAnnotatorConfidence = new Map();
      self.mapLabelAnnotConfJson = new Map();
      self.mapLabelSubComment = new Map();
      self.mapLabelCommentJson = new Map();
      self.mapLabelUid = new Map();
      self.templateShapeArray = [];

      if (self.templateSelectedIndex > -1) {
        self.jsonTemplateCopy = {
          ...self.arrayTemplatesJsonObjects[this.value],
        };

        if (
          self.jsonTemplateCopy.TemplateContainer.Template[0].hasOwnProperty(
            "templateType"
          )
        ) {
          self.templateType =
            self.jsonTemplateCopy.TemplateContainer.Template[0].templateType;
        } else {
          self.templateType = "Image";
        }

        self.extractTemplate(self.jsonTemplateCopy);
      }
    };
    if (self.preOpen !== null) {
      self.templateSelect.selectedIndex = self.preOpen;
      self.templateSelect.onchange();
    } else if (self.defaultTemplate !== null) {
      self.templateSelect.selectedIndex = self.defaultTemplate;
      self.templateSelect.onchange();
    }

    $('select[class^="ui dropdown"]').dropdown();
    document.getElementById("tlist").children[0].style.width = "100%";
    self.templateSelect.style.width = "100%";
    templateDiv.style.width = "100%";
  };

  this.extractTemplate = function (json) {
    const templateCode = json["TemplateContainer"]["Template"][0]["codeValue"];
    var a = 0;
    // to hide main aim editor components other than teaching components
    if (isTeachingFlag) {
      self.mainWindowDiv.style.visibility = "hidden"; // Hide
      self.mainWindowDiv.style.display = "none";
    }
    var subObject = null;
    var arrayLength = -1;
    let isArray = 0;
    if (Array.isArray(json.TemplateContainer.Template[0].Component)) {
      isArray = 1;
      arrayLength = json.TemplateContainer.Template[0].Component.length;
    } else {
      isArray = 0;
      arrayLength = 1;
    }

    var component = null;
    //adding comment textarea for the template
    var commentDiv = document.createElement("div");
    commentDiv.style.width = "100%";
    var labelDiv = document.createElement("div");
    var annotationNameDiv = document.createElement("div");
    var annotationNameLabelDiv = document.createElement("div");

    var labelAnnotationName = document.createElement("label");
    var labelAnnotationNameInput = document.createElement("INPUT");

    if (mode === "teaching" && templateCode === teachingFileTempCode) {
      labelAnnotationName.textContent = "Case Title";
      labelAnnotationNameInput.placeholder = "Ex: 39 year old with knee pain";
    } else {
      labelAnnotationName.textContent = "Annotation Name";
      labelAnnotationNameInput.value = this.aimName;
    }

    labelAnnotationNameInput.style.fontFamily = self.fontfamily;
    labelAnnotationNameInput.style.fontSize = "14px";
    labelAnnotationNameInput.style.paddingLeft = "2px";
    labelAnnotationNameInput.style.lineHeight = "14px";
    labelAnnotationNameInput.style.width = "100%";

    labelAnnotationNameInput.onkeyup = function () {
      if (self.activateDirtyCheck) {
        self.handlerSetAimDirty(); // added to set dirtflag
      }
      self.aimName = DOMPurify.sanitize(this.value);
    };

    labelAnnotationNameInput.setAttribute("type", "text");
    labelAnnotationNameInput.id = "annotationName";

    annotationNameDiv.appendChild(labelAnnotationName);
    annotationNameDiv.appendChild(labelAnnotationNameInput);
    annotationNameLabelDiv.appendChild(labelAnnotationName);
    annotationNameDiv.className = "comment ui input";
    annotationNameDiv.style.width = "100%";

    var label = document.createElement("label");
    annotationNameLabelDiv.className = "comment";
    annotationNameLabelDiv.style.paddingTop = "10px";
    label.textContent = "Comment";
    labelDiv.className = "comment";
    labelDiv.style.paddingTop = "10px";

    var textareaDomObject = document.createElement("textarea");
    labelDiv.appendChild(label);
    textareaDomObject.id = "comment";
    textareaDomObject.style.color = "black";
    textareaDomObject.style.width = "100%";

    commentDiv.appendChild(textareaDomObject);

    textareaDomObject.onkeyup = function () {
      if (self.activateDirtyCheck) {
        self.handlerSetAimDirty(); // added to set dirtflag
      }
      self.aimComment = DOMPurify.sanitize(this.value);
    };

    self.aimTypeCode = [
      {
        code: json.TemplateContainer.Template[0].codeValue,
        codeSystemName:
          json.TemplateContainer.Template[0].codingSchemeDesignator,
        "iso:displayName": {
          "xmlns:iso": "uri:iso.org:21090",
          value: json.TemplateContainer.Template[0].codeMeaning,
        },
      },
    ];

    document.getElementById("accordion1").appendChild(annotationNameLabelDiv);
    document.getElementById("accordion1").appendChild(annotationNameDiv);
    document.getElementById("accordion1").appendChild(labelDiv);
    document.getElementById("accordion1").appendChild(commentDiv);
    //end adding comment textarea for the template
    var a = 0;
    // hiding the main aim editor to show only seperated components for teaching file

    for (var i = 0; i < arrayLength; i++) {
      a++;
      if (isArray === 1)
        component = json.TemplateContainer.Template[0].Component[i];
      else component = json.TemplateContainer.Template[0].Component;

      if (!component.hasOwnProperty("Label")) {
        var cmplabel = component.label;

        var ComponentDivId = cmplabel.replace(
          /[`~!@#$%^&*()_|+\-=?;:'",.<>/ /\{\}\[\]\\\/]/gi,
          ""
        );

        var componentDivLabel = document.createTextNode(cmplabel);
        var componentDiv = document.createElement("div");
        componentDiv.className = " accordion mylbl";
        componentDiv.disabled = "true";

        var headerDiv = document.createElement("div");
        headerDiv.style.color = self.fontcolor; //editing
        headerDiv.style.fontWeight = self.fontweight; //editing
        headerDiv.style.fontFamily = self.fontfamily;
        headerDiv.style.fontSize = self.fontsize; //editing

        headerDiv.className = "title active";
        headerDiv.id = a;

        var headerArrowIcon = document.createElement("i");
        headerArrowIcon.className = "dropdown icon";

        var headerCheckIcon = document.createElement("i");
        headerCheckIcon.className = "red check circle outline icon";
        headerCheckIcon.id = component.id;

        // below line adds all components to the div passed from caller. Rectifiying for teaching file
        //  document.getElementById("accordion1").appendChild(componentDiv);
        if (
          (component.label === "Radiology Specialty" ||
            component.label === "Anatomy Core" ||
            component.label === "Findings and Diagnosis") &&
          isTeachingFlag
        ) {
          tachingDivParent.appendChild(componentDiv);
          tachingDivParent.appendChild(labelDiv);
          tachingDivParent.appendChild(commentDiv);
        } else {
          document.getElementById("accordion1").appendChild(componentDiv);
        }

        var incontentDiv = document.createElement("div");
        incontentDiv.className = "content active";
        incontentDiv.id = ComponentDivId;

        componentDiv.appendChild(headerDiv);
        headerDiv.appendChild(headerCheckIcon);
        headerDiv.appendChild(headerArrowIcon);
        headerDiv.appendChild(componentDivLabel);
        self.checkIfCommentRequired(component, componentDiv);
        componentDiv.appendChild(incontentDiv);

        //end -----------------------------------------------------

        if (component.hasOwnProperty("GeometricShape")) {
          self.GeometricShape(
            component,
            component,
            incontentDiv,
            this.maptag,
            "component"
          );
        }
        var components = [];

        let compObj = {
          type: "component",
          id: component.id,
          label: component.label,
          itemNumber: component.itemNumber,
          subTag: [],
        };

        components.push({
          component: compObj,
        });

        var keyorder = Object.keys(component);
        var fix = -1;
        for (var z = 0; z < keyorder.length; z++) {
          if (keyorder[z] == "AllowedTerm") {
            fix = z;
            break;
          }
        }

        keyorder[fix] = keyorder[0];
        keyorder[0] = "AllowedTerm";

        var counter = 0;

        for (counter; counter < keyorder.length; counter++) {
          if (typeof component[keyorder[counter]] == "object") {
            self[keyorder[counter]](
              component,
              component[keyorder[counter]],
              incontentDiv,
              compObj.subTag,
              "Component"
            );
          }
        }
      }
    }

    //uncomment below line for testing
    //self.mainButtonsDiv.innerHTML = "";
    //self.addButtons(self.mainButtonsDiv);
    $('select[class^="ui dropdown"]').dropdown();
    $(".ui.accordion").accordion();
    self.checkShapes(self.runtimeUserShapes);
    // self.formCheckHandler(self.checkFormSaveReady());
  };

  this.QuestionType = function (
    parent,
    object,
    parentDiv,
    mapTagArray,
    parentTagTypeFromJson
  ) {
    if (Array.isArray(object)) {
      for (let cnt = 0; cnt < object.length; cnt += 1) {
        object.select = 1;
        let label = document.createElement("label");
        label.textContent = "Question type : " + object[cnt].codeMeaning;
        label.style.marginLeft = "20px";
        parentDiv.appendChild(label);
      }
    }
  };

  this.Calculation = function (
    parent,
    object,
    parentDiv,
    mapTagArray,
    parentTagTypeFromJson
  ) {};
  this.CalculationType = function (
    parent,
    object,
    parentDiv,
    mapTagArray,
    parentTagTypeFromJson
  ) {};

  this.Inference = function (
    parent,
    object,
    parentDiv,
    mapTagArray,
    parentTagTypeFromJson
  ) {};

  this.textFreeInput = function (
    parent,
    object,
    parentDiv,
    mapTagArray,
    parentTagTypeFromJson
  ) {};

  this.ValidTerm = function (
    parent,
    object,
    parentDiv,
    mapTagArray,
    parentTagTypeFromJson,
    optionElement,
    paramContentDiv,
    validTermButtonClass,
    ATparent,
    ATobject,
    ATallowedTermObj
  ) {
    var arrayLength = -1;
    let isArray = 0;
    if (Array.isArray(object)) {
      isArray = 1;
      arrayLength = object.length;
    } else {
      isArray = 0;
      arrayLength = 1;
    }

    var ValidTerm = [];
    var i = 0;
    for (i = 0; i < arrayLength; i++) {
      var subEObject = null;
      if (isArray === 1) {
        subEObject = object[i];
      } else {
        subEObject = object;
      }
      var ValidTermObj = {
        type: "ValidTerm",
        codeValue: subEObject.codeValue,
        codeMeaning: subEObject.codeMeaning,
        primitiveObj: subEObject,
        primitiveObjATSparent: ATparent,
        primitiveObjATS: ATobject,
        syntheticObjATS: ATallowedTermObj,
        changeOnSelect: function (newValue, callback) {
          this.select = newValue;
          this.primitiveObj.select = newValue;
        },
        callParentObj: function () {
          return this.ATparent;
        },
        getPrimitive: function () {
          return this.primitiveObj;
        },
        id: subEObject.id,
        subTag: [],
        select: "0",
      };

      ValidTerm.push({
        ValidTerm: ValidTermObj,
      });

      var control = "";
      if (ATparent.minCardinality == 1 && ATparent.maxCardinality == 1) {
        control = "radioBtn";
      }
      var allowTermText = parent.codeMeaning;
      var selectHolder;

      if (control != "radioBtn") {
        if (validTermButtonClass != "ui") {
          var ar = new self.createCheckboxVT(
            parent,
            subEObject.codeValue,
            ATparent.label,
            "checkbox mylbl",
            false,
            allowTermText + " " + subEObject.codeMeaning,
            ATallowedTermObj,
            ValidTermObj,
            ATparent
          );
          parentDiv.appendChild(ar.getelementHtml());
        } else {
          self.subOrderLabelTracking = self.subOrderLabelTracking + 1;
          var ar = new self.createOptionVT(
            parent,
            subEObject.codeValue,
            ATparent.label,
            "ui ",
            false,
            allowTermText + " " + subEObject.codeMeaning,
            ATallowedTermObj,
            ValidTermObj,
            ATparent
          );

          selectHolder = paramContentDiv.getElementsByTagName("select")[0];
          selectHolder.appendChild(ar.getelementHtml());
        }
      } else {
        var ar = new self.createRadioVT(
          parent,
          subEObject.codeValue,
          ATparent.label,
          "radio checkbox mylbl",
          false,
          allowTermText + " " + subEObject.codeMeaning,
          ATallowedTermObj,
          ValidTermObj,
          ATparent
        );
        parentDiv.appendChild(ar.getelementHtml());
      }
    }
  };

  this.GeometricShape = function (
    parent,
    object,
    parentDiv,
    mapTagArray,
    parentTagTypeFromJson
  ) {
    var GeometricShape = [];
    let Obj = {
      type: "GeometricShape",
      shape: object.GeometricShape,
      subTag: [],
    };
    mapTagArray.push({
      GeometricShape: Obj,
    });

    var GSDiv = document.createElement("div");
    self.geoshapeidCounter++;
    GSDiv.id = "geoshape" + self.geoshapeidCounter;
    GSDiv.className = "mylbl";
    GSDiv.innerHTML = "Required shape : " + object.GeometricShape;
    parentDiv.appendChild(GSDiv);
    self.templateShapeArray.push({
      shape: object.GeometricShape,
      domid: object.id,
    });
  };

  this.AllowedTerm = function (
    parent,
    object,
    parentDiv,
    mapTagArray,
    parentTagTypeFromJson
  ) {
    var athis = this;
    athis.parent = parent;

    athis.obj = object;

    var control;
    var ar = "";
    var validTermButtonClass = "";
    var validTermButtonClassDiv = "";
    var validTermInputType = "";

    var txt = parent.label;
    var maindiv = txt.replace(
      /[`~!@#$%^&*()_|+\-=?;:'",.<>/ /\{\}\[\]\\\/]/gi,
      ""
    );
    var lblTxt = document.createTextNode(parent.label);
    var uiAccordionDiv = document.createElement("div");
    uiAccordionDiv.className = " accordion allowedTermlbl";
    var titleDiv = document.createElement("div");
    titleDiv.className = "title active";
    titleDiv.style.fontFamily = self.fontfamily;
    titleDiv.style.color = self.fontcolor; //editing
    titleDiv.style.fontSize = self.fontsize; //editing
    var titleI = document.createElement("i");
    titleI.className = "dropdown icon";
    var contentDiv = document.createElement("div");

    var iconI = document.createElement("i");
    iconI.id = parent.id;
    iconI.className = "";

    if (parseInt(parent.minCardinality) <= 0) {
      try {
        document.getElementById(iconI.id).className =
          "green check circle outline icon";
      } catch (e) {
        iconI.className = "green check circle outline icon";
      }
      var varOk = "true";
    } else {
      try {
        document.getElementById(iconI.id).className =
          "red check circle outline icon";
      } catch (e) {
        iconI.className = "red check circle outline icon";
      }

      var varOk = "false";
    }

    parentDiv.appendChild(uiAccordionDiv);

    contentDiv.className = "content active";
    contentDiv.id = "allowedTerm" + maindiv;

    if (parentTagTypeFromJson != "Component")
      uiAccordionDiv.appendChild(titleDiv);

    //icon cav
    titleDiv.appendChild(iconI);
    titleDiv.appendChild(titleI);
    titleDiv.appendChild(lblTxt);
    uiAccordionDiv.appendChild(contentDiv);
    uiAccordionDiv.style.marginLeft = "0px";
    if (parseInt(parent.minCardinality) <= 0) {
      document.getElementById(iconI.id).className =
        "green check circle outline icon";
      var varOk = "true";
    } else {
      document.getElementById(iconI.id).className =
        "red check circle outline icon";
      var varOk = "false";
    }
    var mainSelectDiv = document.createElement("div");
    mainSelectDiv.className = "ui container";
    mainSelectDiv.id = "Drop" + maindiv;

    var selectDiv = document.createElement("select");
    selectDiv.className = "ui fluid search multiple dropdown";
    //selectDiv.multiple=true;
    selectDiv.id = "select" + maindiv;

    let compObj = {
      id: parent.id,
      min: parent.minCardinality,
      max: parent.maxCardinality,
      label: parent.label,
      actualSelected: 0,
      ok: varOk,
    };

    self.mapCardinalitiesToCheckId.set(parent.id, compObj);

    var arrayLength = -1;
    let isArray = 0;
    if (Array.isArray(object)) {
      arrayLength = object.length;
      isArray = 1;
    } else {
      isArray = 0;
      arrayLength = 1;
    }

    var subEObject = null;
    self.checkAnnotatorConfidence(parentDiv, object);
    if (parent.minCardinality == 1 && parent.maxCardinality == 1) {
      control = "radioBtn";
      if (arrayLength > 10) {
        mainSelectDiv.appendChild(selectDiv);
        contentDiv.appendChild(mainSelectDiv);
      }
    } else {
      if (arrayLength > 4) {
        mainSelectDiv.appendChild(selectDiv);
        contentDiv.appendChild(mainSelectDiv);
      }
    }

    let AllowedTerm = [];
    var i = 0;

    for (i = 0; i < arrayLength; i++) {
      var subEObject = null;

      self.subOrderLabelTracking = self.subOrderLabelTracking + 1;
      if (isArray === 1) subEObject = object[i];
      else subEObject = object;
      var ar;
      self.ids++;

      var NextId = "0";
      if (typeof subEObject.nextId != "undefined") {
        NextId = subEObject.nextId;
      }

      var allowedTermObj = {
        type: "AllowedTerm",
        codeValue: subEObject.codeValue,
        codeMeaning: subEObject.codeMeaning,
        codingSchemeDesignator: subEObject.codingSchemeDesignator,
        codingSchemeVersion: subEObject.codingSchemeVersion,
        nextId: NextId,
        primitiveObj: subEObject,
        parentObj: parent,
        changeOnSelect: function (newValue, callback) {
          this.select = newValue;
          this.primitiveObj.select = newValue;
        },
        callParentObj: function () {
          return this.parentObj;
        },
        getPrimitive: function () {
          return this.primitiveObj;
        },
        select: "0",
        subTag: [],
      };

      let unionPrntAlwtermObj = {
        parant: parent,
        allowterm: allowedTermObj,
      };

      if (subEObject.hasOwnProperty("keyShortCut")) {
        self.mapShortCutKeys.set(
          subEObject.keyShortCut,
          self.removeEmptySpace(parent.label) + "-" + subEObject.codeValue
        );
        self.mapcodeValueShortCutKeys.set(
          self.removeEmptySpace(parent.label) + "-" + subEObject.codeValue,
          subEObject.keyShortCut
        );
      }

      AllowedTerm.push({
        AllowedTerm: allowedTermObj,
      });

      if (control != "radioBtn") {
        if (arrayLength > 4) {
          validTermInputType = "select";
          validTermButtonClass = "ui";
          ar = new self.createOption(
            parent,
            self.removeEmptySpace(parent.label) + "-" + subEObject.codeValue,
            parent.label,
            "ui ",
            false,
            subEObject.codeMeaning,
            allowedTermObj
          );

          selectDiv.multiple = "true";
          if (!subEObject.hasOwnProperty("ValidTerm"))
            selectDiv.appendChild(ar.getelementHtml());
          validTermButtonClassDiv = selectDiv;
        } else {
          validTermInputType = "checkbox";
          validTermButtonClass = "checkbox mylbl";
          ar = new self.createCheckbox(
            parent,
            self.removeEmptySpace(parent.label) + "-" + subEObject.codeValue,
            parent.label,
            "checkbox mylbl",
            subEObject.codeMeaning,
            subEObject.codeMeaning,
            allowedTermObj
          );
          if (!subEObject.hasOwnProperty("ValidTerm"))
            contentDiv.appendChild(ar.getelementHtml());
          validTermButtonClassDiv = contentDiv;
        }
      } else {
        if (arrayLength > 10) {
          //select from drop down it adds to input box
          validTermInputType = "select";
          validTermButtonClass = "ui";
          ar = new self.createOption(
            parent,
            self.removeEmptySpace(parent.label) + "-" + subEObject.codeValue,
            parent.label,
            "ui ",
            false,
            subEObject.codeMeaning,
            allowedTermObj
          );

          selectDiv.multiple = "false";
          if (!subEObject.hasOwnProperty("ValidTerm"))
            selectDiv.appendChild(ar.getelementHtml());
          validTermButtonClassDiv = selectDiv;
        } else {
          validTermInputType = "radio";
          validTermButtonClass = "radio checkbox mylbl";

          ar = new self.createRadio(
            parent,
            self.removeEmptySpace(parent.label) + "-" + subEObject.codeValue,
            parent.label,
            "radio checkbox mylbl",
            false,
            subEObject.codeMeaning,
            allowedTermObj
          );

          if (!subEObject.hasOwnProperty("ValidTerm"))
            contentDiv.appendChild(ar.getelementHtml());
          validTermButtonClassDiv = contentDiv;
        }
      }

      for (var key in subEObject) {
        if (typeof subEObject[key] == "object") {
          if (key == "ValidTerm") {
            self[key](
              subEObject,
              subEObject[key],
              contentDiv,
              allowedTermObj.subTag,
              "ValidTerm",
              ar.getelementHtml(),
              contentDiv,
              validTermButtonClass,
              parent,
              object,
              allowedTermObj
            );
          } else {
            self[key](
              subEObject,
              subEObject[key],
              contentDiv,
              allowedTermObj.subTag,
              "AllowedTerm"
            );
          }
        }
      }
    }
    self.subOrderLabelTracking = 64;

    var preselected = "";
    $("#" + selectDiv.id).dropdown({
      onChange: function (val, text) {
        if (self.activateDirtyCheck) {
          self.handlerSetAimDirty(); // added to set dirtflag
        }
        if (text[0] == "<") {
          var words = text.split("<label>");
          var words = words[1].split("</label>");

          text = words[0];
        }
        var evObja = document.createEvent("Events");
        evObja.initEvent("click", true, false);
        var k = 0;
        for (k = 0; k < selectDiv.options.length; k++) {
          if (selectDiv.options[k].value == text) {
            selectDiv.options[k].dispatchEvent(evObja);
          }
        }
      },
    });
  };

  this.ImagingObservation = function (
    parent,
    object,
    parentDiv,
    mapTagArray,
    parentTagTypeFromJson
  ) {
    var _self = this;
    self.checkAnnotatorConfidence(parentDiv, object);
    self.checkIfCommentRequired(object, parentDiv);
    var arrayLength = -1;
    let isArray = 0;
    if (Array.isArray(object)) {
      isArray = 1;
      arrayLength = object.length;
    } else {
      isArray = 0;
      arrayLength = 1;
    }

    if (object.hasOwnProperty("ImagingObservationCharacteristic")) {
      var subEObject = object["ImagingObservationCharacteristic"];
      self.checkAnnotatorConfidence(parentDiv, object);

      var ImagingObservation = [];

      let ImagingObservationObj = {
        type: "ImagingObservation",
        subTag: [],
      };

      ImagingObservation.push({
        ImagingObservation: ImagingObservationObj,
      });

      var obj = object["ImagingObservation"];
      self.ImagingObservationCharacteristic(
        object,
        subEObject,
        parentDiv,
        ImagingObservation[ImagingObservation.length - 1].ImagingObservation
          .subTag,
        ImagingObservation[ImagingObservation.length - 1].ImagingObservation
          .type
      );
      mapTagArray.push({
        ImagingObservation: ImagingObservation,
      });
    }
  };

  this.ImagingObservationCharacteristic = function (
    parent,
    object,
    parentDiv,
    mapTagArray,
    parentTagTypeFromJson
  ) {
    var _self = this;

    var arrayLength = -1;
    let isArray = 0;
    if (Array.isArray(object)) {
      isArray = 1;
      arrayLength = object.length;
    } else {
      isArray = 0;
      arrayLength = 1;
    }

    var ImagingObservationCharacteristic = [];
    var i = 0;
    for (i = 0; i < arrayLength; i++) {
      var subEObject = null;
      if (isArray == 1) subEObject = object[i];
      else subEObject = object;

      let ImagingObservationCharacteristicObj = {
        type: "ImagingObservationCharacteristic",
        label: subEObject.label,
        itemNumber: subEObject.itemNumber,
        authors: subEObject.authors,
        explanatoryText: subEObject.explanatoryText,
        minCardinality: subEObject.minCardinality,
        maxCardinality: subEObject.maxCardinality,
        id: subEObject.id,
        subTag: [],
        selected: 0,
      };

      ImagingObservationCharacteristic.push({
        ImagingObservationCharacteristic: ImagingObservationCharacteristicObj,
      });

      for (var key in subEObject) {
        if (typeof subEObject[key] == "object") {
          self[key](
            subEObject,
            subEObject[key],
            parentDiv,
            ImagingObservationCharacteristicObj.subTag,
            ImagingObservationCharacteristicObj.type
          );
        }
      }
      self.checkAnnotatorConfidence(parentDiv, subEObject);
      self.checkIfCommentRequired(subEObject, parentDiv);
    }

    mapTagArray.push({
      ImagingObservationCharacteristic: ImagingObservationCharacteristic,
    });
  };

  this.CharacteristicQuantification = function (
    parent,
    object,
    parentDiv,
    mapTagArray,
    parentTagTypeFromJson,
    subOrderLabel
  ) {
    var arrayLength = -1;
    let isArray = 0;
    if (Array.isArray(object)) {
      isArray = 1;
      arrayLength = object.length;
    } else {
      isArray = 0;
      arrayLength = 1;
    }
    var subEObject = null;

    var CharacteristicQuantification = [];
    var i = 0;
    for (i = 0; i < arrayLength; i++) {
      if (isArray === 1) subEObject = object[i];
      else subEObject = object;

      var scaleHolderDiv = document.createElement("div");
      scaleHolderDiv.className = "mylbl";
      var label = document.createElement("label");

      var aHref = document.createElement("div");
      aHref.className = "ui label blue tiny";

      var _subOrderLabel = String.fromCharCode(self.subOrderLabelTracking);
      var aHrefText = document.createTextNode(_subOrderLabel);
      label.textContent = _subOrderLabel + "--" + subEObject.name;

      scaleHolderDiv.appendChild(aHref);
      aHref.appendChild(aHrefText);
      scaleHolderDiv.appendChild(label);

      parentDiv.appendChild(scaleHolderDiv);

      var suborder = self.subOrderLabelTracking;

      let CharacteristicQuantificationObj = {
        type: "CharacteristicQuantification",
        label: subEObject.label,
        itemNumber: subEObject.itemNumber,
        authors: subEObject.authors,
        explanatoryText: subEObject.explanatoryText,
        minCardinality: subEObject.minCardinality,
        maxCardinality: subEObject.maxCardinality,
        id: subEObject.explanatoryText,
        subTag: [],
        selected: 0,
      };
      CharacteristicQuantification.push({
        CharacteristicQuantification: CharacteristicQuantificationObj,
      });

      for (var key in subEObject) {
        if (typeof subEObject[key] == "object") {
          self[key](
            subEObject,
            subEObject[key],
            scaleHolderDiv,
            CharacteristicQuantification[
              CharacteristicQuantification.length - 1
            ].CharacteristicQuantification.subTag,
            CharacteristicQuantification[
              CharacteristicQuantification.length - 1
            ].CharacteristicQuantification.type,
            suborder
          );
        }
      }
      self.checkAnnotatorConfidence(parentDiv, object);
      mapTagArray.push({
        CharacteristicQuantification: CharacteristicQuantification,
      });
    }
  };

  this.AnatomicEntity = function (
    parent,
    object,
    parentDiv,
    mapTagArray,
    parentTagTypeFromJson
  ) {
    var arrayLength = -1;
    let isArray = 0;
    if (Array.isArray(object)) {
      isArray = 1;
      arrayLength = object.length;
    } else {
      isArray = 0;
      arrayLength = 1;
    }

    self.checkAnnotatorConfidence(parentDiv, object);
    var i = 0;
    for (i = 0; i < arrayLength; i++) {
      var subEObject = null;
      if (isArray === 1) subEObject = object[i];
      else subEObject = object;

      for (var key in subEObject) {
        if (typeof subEObject[key] == "object") {
          self[key](subEObject, subEObject[key], parentDiv, mapTagArray, null);
        }
      }

      var clabel = document.createElement("label");

      parentDiv.appendChild(clabel);
      self.checkAnnotatorConfidence(parentDiv, object);
      self.checkIfCommentRequired(object, parentDiv);
    }
  };

  this.AnatomicEntityCharacteristic = function (
    parent,
    object,
    parentDiv,
    mapTagArray,
    parentTagTypeFromJson
  ) {
    var arrayLength = -1;
    let isArray = 0;
    if (Array.isArray(object)) {
      isArray = 1;
      arrayLength = object.length;
    } else {
      isArray = 0;
      arrayLength = 1;
    }

    var i = 0;
    for (i = 0; i < arrayLength; i++) {
      var subEObject = null;
      if (isArray === 1) subEObject = object[i];
      else subEObject = object;

      for (var key in subEObject) {
        if (typeof subEObject[key] == "object") {
          self[key](subEObject, subEObject[key], parentDiv, mapTagArray, null);
        }
      }
      self.checkAnnotatorConfidence(parentDiv, subEObject);
      self.checkIfCommentRequired(subEObject, parentDiv);
    }
  };

  this.annotatorConfidence = function (
    parent,
    object,
    parentDiv,
    mapTagArray,
    parentTagTypeFromJson
  ) {
    var arrayLength = -1;
    let isArray = 0;
    if (Array.isArray(object)) {
      isArray = 1;
      arrayLength = object.length;
    } else {
      isArray = 0;
      arrayLength = 1;
    }
    var subEObject = null;
    var i = 0;
    for (i = 0; i < arrayLength; i++) {
      if (isArray === 1) subEObject = object[i];
      else subEObject = object;

      for (var key in subEObject) {
        if (typeof subEObject[key] == "object") {
          self[key](subEObject, subEObject[key], parentDiv, mapTagArray, null);
        }
      }
    }
  };

  this.Scale = function (
    parent,
    object,
    parentDiv,
    mapTagArray,
    parentTagTypeFromJson,
    subOrderLabel
  ) {
    var _subOrderLabel = String.fromCharCode(subOrderLabel);

    var arrayLength = -1;
    let isArray = 0;
    if (Array.isArray(object)) {
      isArray = 1;
      arrayLength = object.length;
    } else {
      isArray = 0;
      arrayLength = 1;
    }
    var subEObject = null;

    var i = 0;
    for (i = 0; i < arrayLength; i++) {
      if (isArray === 1) subEObject = object[i];
      else subEObject = object;

      var scaleHolderDiv = document.createElement("div");
      scaleHolderDiv.className = "mylbl";
      var label = document.createElement("label");
      label.textContent = _subOrderLabel + "-" + parent.name;

      parentDiv.appendChild(scaleHolderDiv);

      for (var key in subEObject) {
        if (typeof subEObject[key] == "object") {
          self[key](
            subEObject,
            subEObject[key],
            scaleHolderDiv,
            mapTagArray,
            null,
            "Select" + parent.name
          );
        }
      }
    }
    self.checkAnnotatorConfidence(parentDiv, parent);
  };

  this.ScaleLevel = function (
    parent,
    object,
    parentDiv,
    mapTagArray,
    parentTagTypeFromJson,
    subOrderLabel
  ) {
    var arrayLength = -1;
    var quantileDiv = document.createElement("div");
    var quantileSelect = document.createElement("select");
    selectid++;
    quantileSelect.id = subOrderLabel;
    quantileSelect.addEventListener("change", function () {
      if (self.activateDirtyCheck) {
        self.handlerSetAimDirty(); // added to set dirtflag
      }
      var i = 0;
      var scaleArraysize = object.length;
      for (i = 0; i < scaleArraysize; i++) {
        if (object[i].valueLabel == this.value) {
          object[i].select = "1";
        } else {
          object[i].select = "0";
        }
      }
    });
    quantileSelect.className = "ui dropdown mylbl";
    quantileDiv.appendChild(quantileSelect);
    parentDiv.appendChild(quantileDiv);
    let isArray = 0;
    if (Array.isArray(object)) {
      isArray = 1;
      arrayLength = object.length;
    } else {
      isArray = 0;
      arrayLength = 1;
    }
    var subEObject = null;
    for (var i = 0; i < arrayLength; i++) {
      if (isArray === 1) subEObject = object[i];
      else subEObject = object;
      for (var key in subEObject) {
        if (typeof subEObject[key] == "object") {
          self[key](subEObject, subEObject[key], parentDiv, mapTagArray, null);
        }
      }

      var quantileOption = document.createElement("option");

      quantileOption.innerHTML = subEObject.valueLabel;
      quantileSelect.appendChild(quantileOption);
    }
  };

  this.Numerical = function (
    parent,
    object,
    parentDiv,
    mapTagArray,
    parentTagTypeFromJson
  ) {
    var arrayLength = -1;
    var quantileDiv = document.createElement("div");
    quantileDiv.className = "mylbl";
    var quantileSelect = document.createElement("select");
    quantileSelect.className = "ui dropdown mylbl";
    selectid++;
    quantileSelect.id = "Select" + parent.name;
    quantileSelect.addEventListener("change", function () {
      if (self.activateDirtyCheck) {
        self.handlerSetAimDirty(); // added to set dirtflag
      }
      var i = 0;
      var scaleArraysize = object.length;
      for (i = 0; i < scaleArraysize; i++) {
        var createFormValue =
          self.mathOperators.get(object[i].operator) +
          " " +
          object[i].valueLabel +
          " " +
          object[i].ucumString;

        if (createFormValue == this.value) object[i].select = "1";
        else object[i].select = "0";
      }
    });
    quantileDiv.appendChild(quantileSelect);
    parentDiv.appendChild(quantileDiv);
    let isArray = 0;
    if (Array.isArray(object)) {
      isArray = 1;
      arrayLength = object.length;
    } else {
      isArray = 0;
      arrayLength = 1;
    }
    var subEObject = null;
    for (var i = 0; i < arrayLength; i++) {
      if (isArray === 1) subEObject = object[i];
      else subEObject = object;
      for (var key in subEObject) {
        if (typeof subEObject[key] == "object") {
          self[key](subEObject, subEObject[key], parentDiv, mapTagArray, null);
        }
      }

      var quantileOption = document.createElement("option");
      quantileOption.innerHTML =
        self.mathOperators.get(subEObject.operator) +
        " " +
        subEObject.valueLabel +
        " " +
        subEObject.ucumString;
      quantileSelect.appendChild(quantileOption);
    }
    self.checkAnnotatorConfidence(parentDiv, parent);
  };

  this.Quantile = function (
    parent,
    object,
    parentDiv,
    mapTagArray,
    parentTagTypeFromJson
  ) {
    var arrayLength = -1;
    let isArray = 0;
    if (Array.isArray(object)) {
      isArray = 1;
      arrayLength = object.length;
    } else {
      isArray = 0;
      arrayLength = 1;
    }
    var subEObject = null;
    for (var i = 0; i < arrayLength; i++) {
      if (isArray === 1) subEObject = object[i];
      else subEObject = object;
      for (var key in subEObject) {
        if (typeof subEObject[key] == "object") {
          self[key](subEObject, subEObject[key], parentDiv, mapTagArray, null);
        }
      }
      var quantileDiv = document.createElement("div");
      quantileDiv.className = "mylbl";
      var quantileSelect = document.createElement("select");
      quantileSelect.id = "Select" + parent.name;
      quantileSelect.className = "ui dropdown mylbl";
      quantileDiv.appendChild(quantileSelect);
      parentDiv.appendChild(quantileDiv);
      var max = parseFloat(subEObject.maxValue);
      var min = parseFloat(subEObject.minValue);
      var bins = parseFloat(subEObject.bins);
      var net = max - min;
      var step = net / bins;
      var minValue = min;
      for (i = 0; i < bins; i++) {
        let quantileOption = document.createElement("option");
        quantileSelect.appendChild(quantileOption);
        quantileOption.innerHTML =
          minValue +
          " - " +
          parseFloat(parseFloat(minValue) + parseFloat(step));
        minValue = minValue + step;
      }
      subEObject.valueLabel = quantileSelect.options[0].value;

      quantileSelect.addEventListener("change", function () {
        if (self.activateDirtyCheck) {
          self.handlerSetAimDirty(); // added to set dirtflag
        }
        var i = 0;
        var scaleArraysize = object.length;
        object.selectedBin = this.selectedIndex + 1;
        object.select = 1;
        object.valueLabel = this.options[this.selectedIndex].value;
      });
    }
    self.checkAnnotatorConfidence(parentDiv, parent);
  };

  this.Interval = function (
    parent,
    object,
    parentDiv,
    mapTagArray,
    parentTagTypeFromJson
  ) {
    var arrayLength = -1;
    let isArray = 0;
    if (Array.isArray(object)) {
      isArray = 1;
      arrayLength = object.length;
    } else {
      isArray = 0;
      arrayLength = 1;
    }
    var subEObject = null;
    var intervalDiv = document.createElement("div");
    intervalDiv.className = "mylbl";
    var intervalSelect = document.createElement("select");
    intervalSelect.className = "ui dropdown mylbl";

    selectid++;
    intervalSelect.id = "Select" + parent.name;
    intervalSelect.addEventListener("change", function () {
      if (self.activateDirtyCheck) {
        self.handlerSetAimDirty(); // added to set dirtflag
      }
      var i = 0;
      var scaleArraysize = object.length;
      for (i = 0; i < scaleArraysize; i++) {
        if (object[i].valueLabel == this.value) object[i].select = "1";
        else object[i].select = "0";
      }
    });

    intervalDiv.appendChild(intervalSelect);
    for (var i = 0; i < arrayLength; i++) {
      if (isArray === 1) subEObject = object[i];
      else subEObject = object;
      for (var key in subEObject) {
        if (typeof subEObject[key] == "object") {
          self[key](subEObject, subEObject[key], parentDiv, mapTagArray, null);
        }
      }
      var intervalOption = document.createElement("option");
      intervalOption.innerHTML = subEObject.valueLabel;
      intervalSelect.appendChild(intervalOption);
    }
    parentDiv.appendChild(intervalDiv);
    self.checkAnnotatorConfidence(parentDiv, parent);
  };

  this.NonQuantifiable = function (
    parent,
    object,
    parentDiv,
    mapTagArray,
    parentTagTypeFromJson,
    subOrderLabel
  ) {
    var _subOrderLabel = String.fromCharCode(subOrderLabel);
    var arrayLength = -1;
    var quantileDiv = document.createElement("div");
    quantileDiv.className = "mylbl";
    var quantileSelect = document.createElement("select");
    quantileSelect.className = "ui dropdown mylbl";
    selectid++;
    quantileSelect.id = "Select" + parent.name;
    quantileSelect.addEventListener("change", function () {
      if (self.activateDirtyCheck) {
        self.handlerSetAimDirty(); // added to set dirtflag
      }
      var i = 0;
      var scaleArraysize = object.length;
      for (i = 0; i < scaleArraysize; i++) {
        if (object[i].codeMeaning == this.value) object[i].select = "1";
        else object[i].select = "0";
      }
    });
    quantileDiv.appendChild(quantileSelect);
    parentDiv.appendChild(quantileDiv);
    let isArray = 0;
    if (Array.isArray(object)) {
      isArray = 1;
      arrayLength = object.length;
    } else {
      isArray = 0;
      arrayLength = 1;
    }
    var subEObject = null;
    for (var i = 0; i < arrayLength; i++) {
      if (isArray === 1) subEObject = object[i];
      else subEObject = object;
      for (var key in subEObject) {
        if (typeof subEObject[key] == "object") {
          self[key](subEObject, subEObject[key], parentDiv, mapTagArray, null);
        }
      }
      var quantileOption = document.createElement("option");
      quantileOption.innerHTML = subEObject.codeMeaning;
      quantileSelect.appendChild(quantileOption);
    }
    self.checkAnnotatorConfidence(parentDiv, parent);
  };

  this.createRadio = function (
    prObject,
    id,
    name,
    className,
    checked,
    lbl,
    allowedTermObj
  ) {
    var div = document.createElement("div");
    div.style.marginLeft = "20px";
    div.className = className;
    var label = document.createElement("label");
    label.textContent = lbl;
    if (self.mapcodeValueShortCutKeys.get(id)) {
      label.textContent =
        label.textContent + " (" + self.mapcodeValueShortCutKeys.get(id) + ") ";
    }
    var radioInput = document.createElement("input");
    radioInput.type = "radio";
    radioInput.className = "radio checkbox";
    radioInput.id = id;
    radioInput.name = name;
    radioInput.checked = checked;

    div.appendChild(radioInput);
    div.appendChild(label);

    radioInput.onclick = function () {
      if (self.activateDirtyCheck) {
        self.handlerSetAimDirty(); // added to set dirtflag
      }
      var getAllowTGroup = prObject;
      var getAllowTGroupSize = getAllowTGroup.AllowedTerm.length;
      var i = 0;

      for (i = 0; i < getAllowTGroupSize; i++) {
        if (
          getAllowTGroup.AllowedTerm[i].codeValue !== allowedTermObj.codeValue
        )
          getAllowTGroup.AllowedTerm[i].select = "0";
        else getAllowTGroup.AllowedTerm[i].select = "1";
      }

      allowedTermObj.select = "1";
      allowedTermObj.changeOnSelect(
        "1",
        self.AfterClick(allowedTermObj.callParentObj())
      );
      var checkmarkObj = self.mapCardinalitiesToCheckId.get(prObject.id);
      checkmarkObj.ok = "true";
      checkmarkObj.actualSelected++;

      self.mapCardinalitiesToCheckId.set(checkmarkObj.id, checkmarkObj);

      if (checkmarkObj.actualSelected >= checkmarkObj.min)
        document.getElementById(checkmarkObj.id).className =
          "green check circle outline icon";
      if (allowedTermObj.nextId != "0") {
        self.DisableTillNext(
          prObject.id,
          allowedTermObj.nextId,
          self.callDisable
        );
      } else if (
        typeof self.mapStatusAllowedTermBlocks.get(checkmarkObj.id) !==
        "undefined"
      ) {
        var statusCheckAllowTermObject = self.mapStatusAllowedTermBlocks.get(
          checkmarkObj.id
        );
        if (statusCheckAllowTermObject.status == "disabled")
          self.EnableTillNext(
            statusCheckAllowTermObject.startid,
            statusCheckAllowTermObject.endid
          );
      }
      if (allowedTermObj.getPrimitive().noMoreQuestions == "true") {
        self.DisableTillNext(prObject.id, "tillend", self.callDisable);
      }

      // self.formCheckHandler(self.checkFormSaveReady());
    };

    this.getelementHtml = function () {
      return div;
    };
  };
  this.createRadioVT = function (
    prObject,
    id,
    name,
    className,
    checked,
    lbl,
    allowedTermObj,
    validTermObj,
    vtPrObject
  ) {
    let labelForUniqueness = self.removeEmptySpace(
      validTermObj.primitiveObjATSparent.label
    );
    id = labelForUniqueness + "-" + id + allowedTermObj.codeValue;

    var div = document.createElement("div");
    div.style.marginLeft = "20px";
    div.className = className;
    var label = document.createElement("label");
    label.textContent = lbl;
    var radioInput = document.createElement("input");
    radioInput.type = "radio";
    radioInput.className = "radio checkbox";
    radioInput.id = id;
    radioInput.name = name;
    radioInput.checked = checked;

    div.appendChild(radioInput);
    div.appendChild(label);

    radioInput.onclick = function () {
      if (self.activateDirtyCheck) {
        self.handlerSetAimDirty(); // added to set dirtflag
      }
      prObject.select = "1";
      var getAllowTGroup = validTermObj.primitiveObjATSparent;
      var getAllowTGroupSize = getAllowTGroup.AllowedTerm.length;
      var i = 0;

      for (i = 0; i < getAllowTGroupSize; i++) {
        if (
          getAllowTGroup.AllowedTerm[i].codeValue !==
          validTermObj.primitiveObjATS.codeValue
        )
          getAllowTGroup.AllowedTerm[i].select = "0";
        else getAllowTGroup.AllowedTerm[i].select = "1";
      }

      allowedTermObj.select = "1";
      allowedTermObj.changeOnSelect(
        "1",
        self.AfterClick(allowedTermObj.callParentObj())
      );

      var checkmarkObj = self.mapCardinalitiesToCheckId.get(
        validTermObj.primitiveObjATSparent.id
      );
      checkmarkObj.ok = "true";
      checkmarkObj.actualSelected++;

      self.mapCardinalitiesToCheckId.set(checkmarkObj.id, checkmarkObj);

      if (checkmarkObj.actualSelected >= checkmarkObj.min)
        document.getElementById(checkmarkObj.id).className =
          "green check circle outline icon";
      if (allowedTermObj.nextId != "0") {
        self.DisableTillNext(
          prObject.id,
          allowedTermObj.nextId,
          self.callDisable
        );
      } else if (
        typeof self.mapStatusAllowedTermBlocks.get(checkmarkObj.id) !==
        "undefined"
      ) {
        var statusCheckAllowTermObject = self.mapStatusAllowedTermBlocks.get(
          checkmarkObj.id
        );
        if (statusCheckAllowTermObject.status == "disabled")
          self.EnableTillNext(
            statusCheckAllowTermObject.startid,
            statusCheckAllowTermObject.endid
          );
      }

      // self.formCheckHandler(self.checkFormSaveReady());
    };

    this.getelementHtml = function () {
      return div;
    };
  };

  this.createOption = function (
    prObject,
    id,
    name,
    className,
    checked,
    lbl,
    allowedTermObj
  ) {
    var div = document.createElement("div");
    div.style.marginLeft = "20px";
    div.className = className;
    var labelHolder = document.createElement("label");
    var label = document.createTextNode(lbl);

    var square = document.createElement("div");
    square.className = "ui mini Tiny blue label";
    var lab = document.createTextNode(
      String.fromCharCode(self.subOrderLabelTracking) + "-"
    );
    square.appendChild(lab);

    var optionInput = document.createElement("option");
    optionInput.id = id;
    optionInput.name = name;
    optionInput.checked = checked;
    optionInput.value = lbl;

    div.appendChild(optionInput);
    optionInput.appendChild(square);
    optionInput.appendChild(labelHolder);
    labelHolder.appendChild(label);

    optionInput.addEventListener("click", function () {
      let dropDownItemsArray = $(
        "#select" + self.removeEmptySpace(prObject.label)
      ).dropdown("get value");

      if (self.activateDirtyCheck) {
        self.handlerSetAimDirty(); // added to set dirtflag
      }

      var checkmarkObj = self.mapCardinalitiesToCheckId.get(prObject.id);
      checkmarkObj.ok = "true";

      if (dropDownItemsArray.indexOf(lbl) === -1) {
        allowedTermObj.getPrimitive().select = "0";
        allowedTermObj.changeOnSelect("0", self.AfterClick(allowedTermObj));
        --checkmarkObj.actualSelected;
      } else {
        allowedTermObj.getPrimitive().select = "1";
        allowedTermObj.changeOnSelect("1", self.AfterClick(allowedTermObj));
        checkmarkObj.actualSelected++;
      }

      self.mapCardinalitiesToCheckId.set(prObject.id, checkmarkObj);
      if (
        checkmarkObj.actualSelected >= checkmarkObj.min &&
        checkmarkObj.actualSelected <= checkmarkObj.max
      )
        document.getElementById(prObject.id).className =
          "green check circle outline icon";
      else {
        document.getElementById(prObject.id).className =
          "red check circle outline icon";
      }
      //disable enable component seection
      if (allowedTermObj.nextId != "0" && this.selected == true) {
        self.DisableTillNext(
          prObject.id,
          allowedTermObj.nextId,
          self.callDisable
        );
      } else if (
        typeof self.mapStatusAllowedTermBlocks.get(checkmarkObj.id) !==
          "undefined" &&
        allowedTermObj.nextId != "0" &&
        this.selected == false
      ) {
        var statusCheckAllowTermObject = self.mapStatusAllowedTermBlocks.get(
          checkmarkObj.id
        );
        if (statusCheckAllowTermObject.status == "disabled")
          self.EnableTillNext(
            statusCheckAllowTermObject.startid,
            statusCheckAllowTermObject.endid
          );
      }

      if (allowedTermObj.getPrimitive().noMoreQuestions == "true") {
        if (this.checked == true) {
          self.DisableTillNext(prObject.id, "tillend", self.callDisable);
        } else {
          self.EnableTillNext(prObject.id, "tillend");
        }
      }

      // self.formCheckHandler(self.checkFormSaveReady());
    });

    this.getelementHtml = function () {
      return optionInput;
    };
  };

  this.createOptionVT = function (
    prObject,
    id,
    name,
    className,
    checked,
    lbl,
    allowedTermObj,
    validTermObj,
    vtPrObject
  ) {
    //drop down multiple selectable list
    let labelForUniqueness = self.removeEmptySpace(
      validTermObj.primitiveObjATSparent.label
    );
    id = labelForUniqueness + "-" + id + allowedTermObj.codeValue;
    var div = document.createElement("div");
    div.style.marginLeft = "20px";
    div.className = className;
    var labelHolder = document.createElement("label");
    var label = document.createTextNode(lbl);

    var square = document.createElement("div");
    square.className = "ui mini Tiny blue label";
    self.subOrderLabelTracking = self.subOrderLabelTracking - 1;
    var lab = document.createTextNode(
      String.fromCharCode(self.subOrderLabelTracking) + "-"
    );
    square.appendChild(lab);

    var optionInput = document.createElement("option");
    optionInput.id = id;
    optionInput.name = name;
    optionInput.checked = checked;
    optionInput.value = lbl;

    div.appendChild(optionInput);
    optionInput.appendChild(square);
    optionInput.appendChild(labelHolder);
    labelHolder.appendChild(label);

    optionInput.addEventListener("click", function () {
      if (self.activateDirtyCheck) {
        self.handlerSetAimDirty(); // added to set dirtflag
      }
      var checkmarkObj = self.mapCardinalitiesToCheckId.get(vtPrObject.id);
      checkmarkObj.ok = "true";

      if (validTermObj.getPrimitive().select == "1") {
        prObject.select = "0";
        validTermObj.getPrimitive().select = "0";
        checkmarkObj.actualSelected--;
      } else {
        prObject.select = "1";
        validTermObj.getPrimitive().select = "1";
        checkmarkObj.actualSelected++;
      }

      self.mapCardinalitiesToCheckId.set(vtPrObject.id, checkmarkObj);
      if (
        checkmarkObj.actualSelected >= checkmarkObj.min &&
        checkmarkObj.actualSelected <= checkmarkObj.max
      )
        document.getElementById(vtPrObject.id).className =
          "green check circle outline icon";
      else {
        document.getElementById(vtPrObject.id).className =
          "red check circle outline icon";
      }
      // self.formCheckHandler(self.checkFormSaveReady());
    });

    this.getelementHtml = function () {
      return optionInput;
    };
  };

  this.createCheckbox = function (
    prObject,
    id,
    name,
    className,
    value,
    lbl,
    allowedTermObj
  ) {
    var div = document.createElement("div");
    div.style.marginLeft = "20px";
    div.className = className;
    var label = document.createElement("label");
    label.textContent = lbl;
    if (self.mapcodeValueShortCutKeys.get(id)) {
      label.textContent =
        label.textContent + " (" + self.mapcodeValueShortCutKeys.get(id) + ") ";
    }
    var checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "checkbox";
    checkbox.name = name;
    checkbox.value = value;
    checkbox.id = id;
    div.appendChild(checkbox);
    div.appendChild(label);
    this.getelementHtml = function () {
      return div;
    };
    let nextIdExist = false;
    let nomoreQuestionExist = false;
    checkbox.onclick = function () {
      if (self.activateDirtyCheck) {
        self.handlerSetAimDirty(); // added to set dirtflag
      }

      allowedTermObj.changeOnSelect("1", self.AfterClick);

      var checkmarkObj = self.mapCardinalitiesToCheckId.get(prObject.id);
      if (this.checked == true) {
        allowedTermObj.getPrimitive().select = "1";
        checkmarkObj.ok = "true";
        checkmarkObj.actualSelected++;
      } else {
        allowedTermObj.getPrimitive().select = "0";
        checkmarkObj.ok = "false";
        checkmarkObj.actualSelected--;
      }

      var getAllowTGroup = allowedTermObj.callParentObj();

      self.mapCardinalitiesToCheckId.set(prObject.id, checkmarkObj);

      if (
        checkmarkObj.actualSelected >= checkmarkObj.min &&
        checkmarkObj.actualSelected <= checkmarkObj.max
      ) {
        document.getElementById(prObject.id).className =
          "green check circle outline icon";
      } else {
        document.getElementById(prObject.id).className =
          "red check circle outline icon";
      }
      //disable enable component seection
      if (allowedTermObj.nextId != "0" && checkbox.checked == true) {
        self.DisableTillNext(
          prObject.id,
          allowedTermObj.nextId,
          self.callDisable
        );
      } else if (
        typeof self.mapStatusAllowedTermBlocks.get(checkmarkObj.id) !==
          "undefined" &&
        allowedTermObj.nextId != "0" &&
        checkbox.checked == false
      ) {
        var statusCheckAllowTermObject = self.mapStatusAllowedTermBlocks.get(
          checkmarkObj.id
        );
        if (statusCheckAllowTermObject.status == "disabled")
          self.EnableTillNext(
            statusCheckAllowTermObject.startid,
            statusCheckAllowTermObject.endid
          );
      }

      if (allowedTermObj.getPrimitive().noMoreQuestions == "true") {
        if (this.checked == true) {
          self.DisableTillNext(prObject.id, "tillend", self.callDisable);
        } else {
          self.EnableTillNext(prObject.id, "tillend");
        }
      }
      // self.formCheckHandler(self.checkFormSaveReady());
    };
  };

  this.createCheckboxVT = function (
    prObject,
    id,
    name,
    className,
    value,
    lbl,
    allowedTermObj,
    validTermObj,
    vtPrObject
  ) {
    let labelForUniqueness = self.removeEmptySpace(
      validTermObj.primitiveObjATSparent.label
    );
    id = labelForUniqueness + "-" + id + allowedTermObj.codeValue;

    this.par = prObject;
    //this.id = id.replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, '');

    var div = document.createElement("div");
    div.style.marginLeft = "20px";
    div.className = className;
    var label = document.createElement("label");
    label.textContent = lbl;
    var checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "checkbox";
    checkbox.name = name;
    checkbox.value = value;
    checkbox.id = id;
    div.appendChild(checkbox);
    div.appendChild(label);
    this.getelementHtml = function () {
      return div;
    };

    checkbox.onclick = function () {
      if (self.activateDirtyCheck) {
        self.handlerSetAimDirty(); // added to set dirtflag
      }
      validTermObj.changeOnSelect("1", self.AfterClick);

      var checkmarkObj = self.mapCardinalitiesToCheckId.get(vtPrObject.id);
      if (this.checked == true) {
        prObject.select = "1";
        validTermObj.getPrimitive().select = "1";
        checkmarkObj.ok = "true";
        checkmarkObj.actualSelected++;
      } else {
        prObject.select = "0";
        validTermObj.getPrimitive().select = "0";
        checkmarkObj.ok = "false";
        checkmarkObj.actualSelected--;
      }

      var getAllowTGroup = allowedTermObj.callParentObj();

      self.mapCardinalitiesToCheckId.set(vtPrObject.id, checkmarkObj);

      if (
        checkmarkObj.actualSelected >= checkmarkObj.min &&
        checkmarkObj.actualSelected <= checkmarkObj.max
      )
        document.getElementById(vtPrObject.id).className =
          "green check circle outline icon";
      else {
        document.getElementById(vtPrObject.id).className =
          "red check circle outline icon";
      }
      // self.formCheckHandler(self.checkFormSaveReady());
    };
  };

  this.checkAnnotatorConfidence = function (prentDiv, objectToCheckAnnConf) {
    let isMouseButtondown = false;
    if (typeof objectToCheckAnnConf.annotatorConfidence != "undefined") {
      // Assign value to the property here
      if (
        objectToCheckAnnConf.hasOwnProperty("label") ||
        objectToCheckAnnConf.hasOwnProperty("name")
      ) {
        if (objectToCheckAnnConf.annotatorConfidence == true) {
          if (objectToCheckAnnConf.hasOwnProperty("label")) {
            var rangeid = objectToCheckAnnConf.label.replace(
              /[`~!@# $%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi,
              ""
            );
          } else if (objectToCheckAnnConf.hasOwnProperty("name")) {
            var rangeid = objectToCheckAnnConf.name.replace(
              /[`~!@# $%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi,
              ""
            );
          }

          self.mapLabelAnnotatorConfidence.set(rangeid, "inputRange" + rangeid);
          self.mapLabelAnnotConfJson.set(rangeid, objectToCheckAnnConf);
          var annotConfDiv = document.createElement("div");
          var annotConfInput = document.createElement("input");
          annotConfInput.setAttribute("id", "range" + rangeid);
          annotConfInput.setAttribute("type", "range");
          annotConfInput.setAttribute("min", "0");
          annotConfInput.setAttribute("max", "100");
          annotConfInput.setAttribute("start", "0");
          annotConfInput.setAttribute("input", "inputRange" + rangeid);
          annotConfInput.value = 0;

          annotConfInput.onchange = function () {
            if (self.activateDirtyCheck) {
              self.handlerSetAimDirty(); // added to set dirtflag
            }
            annotConfShowValueInput.value = DOMPurify.sanitize(this.value);
            objectToCheckAnnConf.selectac =
              DOMPurify.sanitize(this.value) / 100;
          };
          annotConfInput.onmousedown = function (event) {
            isMouseButtondown = true;
          };
          annotConfInput.onmouseup = function (event) {
            isMouseButtondown = false;
          };
          annotConfInput.onmousemove = function (event) {
            if (isMouseButtondown) {
              annotConfShowValueInput.value = DOMPurify.sanitize(this.value);
              objectToCheckAnnConf.selectac = DOMPurify.sanitize(
                this.value / 100
              );
            }
          };

          annotConfDiv.className = "ui range";
          annotConfDiv.style.textAlign = "center";
          annotConfDiv.style.marginBottom = "10px";

          var annotConfShowValueInput = document.createElement("input");
          annotConfShowValueInput.style.width = "52px";
          annotConfShowValueInput.style.height = "28px";

          annotConfShowValueInput.setAttribute("type", "text");
          annotConfShowValueInput.setAttribute("class", "ui  input");
          annotConfShowValueInput.setAttribute("id", "inputRange" + rangeid);
          annotConfShowValueInput.value = 0;

          var annotConfShowValueInputDiv = document.createElement("div");
          annotConfShowValueInputDiv.setAttribute(
            "class",
            "ui input disabled small"
          );
          let confidenceText = document.createTextNode("Confidence level");
          annotConfDiv.appendChild(annotConfInput);
          annotConfDiv.appendChild(annotConfShowValueInputDiv);
          annotConfShowValueInputDiv.appendChild(annotConfShowValueInput);
          prentDiv.appendChild(confidenceText);
          prentDiv.appendChild(annotConfDiv);
        }
      }
    }
  };

  var disabledefined = [];
  this.DisableTillNext = function (actualid, nextid, call) {
    let nextControl = 0;
    for (var [key, value] of self.mapCardinalitiesToCheckId) {
      if (key == actualid) {
        nextControl = 1;
        let object = {
          startid: key,
          endid: nextid,
          status: "disabled",
        };
        self.mapStatusAllowedTermBlocks.set(key, object);
      } else if (nextControl == 1) {
        if (key != nextid) {
          disabledefined.push(key);
          document.getElementById(key).className =
            "blue check circle outline icon";
          let ely = document.getElementById(key).parentNode;
          $(ely.parentNode).hide();
        } else nextControl = 0;
      }
    }
    call();
  };

  this.EnableTillNext = function (actualid, nextid) {
    let nextControl = 0;
    for (var [key, value] of self.mapCardinalitiesToCheckId) {
      if (key == actualid) {
        nextControl = 1;
        let object = {
          startid: key,
          endid: nextid,
          status: "active",
        };
        self.mapStatusAllowedTermBlocks.set(key, object);
      } else if (nextControl == 1) {
        if (key != nextid) {
          disabledefined.push(key);
          document.getElementById(key).className =
            "green check circle outline icon";
          let ely = document.getElementById(key).parentNode;
          $(ely.parentNode).show();
        } else nextControl = 0;
      }
    }
    self.callDisable();
  };
  this.callDisable = function () {
    for (var [key, value] of self.mapStatusAllowedTermBlocks) {
    }
  };

  this.solveAim = function (object, son) {
    //extracts components from object (maptag)
    let componentSize = object.length;
    var i;
    for (i = 0; i < componentSize; i++) {
      self.solveAimCompnent(object[i][0]);
    }
  };

  this.solveAimCompnent = function (object) {};

  this.AfterClick = function (obj) {};

  this.printXmlAim = function (data, xmlArray) {
    var oSerializer = new XMLSerializer();
    var sXML = oSerializer.serializeToString(data);
    for (var i = 0; i < xmlArray.length; i++) {
      var arrayXML = oSerializer.serializeToString(xmlArray[i].value);
    }
  };

  // Save Aim
  this.savetextFreeInput = function (
    parentArray,
    parentObject,
    itself,
    Entitytype,
    jsonInner
  ) {};

  this.saveQuestionType = function (
    parentObject,
    itself,
    Entitytype,
    jsonInner
  ) {
    var QuestionTypes = itself.value;
    let i = 0;
    let arraySizeforAllowedTerms = -1;
    let arrayCheckForAllowedTerms = false;
    let instanceAllowedTerms = null;

    if (Array.isArray(QuestionTypes)) {
      arraySizeforAllowedTerms = QuestionTypes.length;
      arrayCheckForAllowedTerms = true;
    } else {
      arraySizeforAllowedTerms = 1;
    }
    let jsonAllowedTerm = {
      questionTypeCode: [],
    };

    if (!jsonInner.hasOwnProperty("questiontypes"))
      jsonInner.questiontypes = [];

    for (i = 0; i < arraySizeforAllowedTerms; i++) {
      if (arrayCheckForAllowedTerms == true) {
        instanceAllowedTerms = QuestionTypes[i];
      } else {
        instanceAllowedTerms = QuestionTypes;
      }
      let questionObj = {
        code: instanceAllowedTerms.codeValue,
        codeSystemName: instanceAllowedTerms.codingSchemeDesignator,
        codeSystemVersion: "instanceAllowedTerms.codingSchemeVersion",
        "iso:displayName": {
          value: instanceAllowedTerms.codeMeaning,
          "xmlns:iso": "uri:iso.org:21090",
        },
      };
      jsonAllowedTerm.questionTypeCode.push(questionObj);
    }
    if (self.emptyJson(jsonAllowedTerm)) {
      if (parentObject.type === "Component") {
        jsonAllowedTerm["label"] = {
          value: parentObject.value.label,
        };
        jsonInner.questiontypes.push(jsonAllowedTerm);
      } else {
        jsonAllowedTerm["label"] = {
          value: parentObject.value.label,
        };
        jsonInner.push(jsonAllowedTerm);
      }
    }
  };

  this.saveAlgorithmType = function (
    parentArray,
    parentObject,
    itself,
    Entitytype,
    jsonInner
  ) {};

  this.saveCalculationType = function (
    parentArray,
    parentObject,
    itself,
    Entitytype,
    jsonInner
  ) {};

  this.saveCalculation = function (
    parentArray,
    parentObject,
    itself,
    Entitytype,
    jsonInner
  ) {};

  this.saveInference = function (
    parentArray,
    parentObject,
    itself,
    Entitytype,
    jsonInner
  ) {};

  this.saveComponent = function (
    parentArray,
    parentObject,
    itself,
    Entitytype,
    jsonInner
  ) {};

  //****************** used components ***********************************

  this.saveInterval = function (parentObject, itself, Entitytype, jsonInner) {
    var Intervals = itself.value;
    var arraySize = -1;
    var arrayCheck = false;

    if (Array.isArray(Intervals)) {
      arraySize = Intervals.length;
      arrayCheck = true;
    } else {
      arraySize = 1;
    }
    let anotconf = 0.0;
    if (typeof parentObject.value.selectac !== "undefined") {
      anotconf = parentObject.value.selectac;
    }
    let jsonCharacteristicQuantification = {
      "xsi:type": "Interval",
      minOperator: "",
      maxOperator: "",
      annotatorConfidence: { value: anotconf },
      label: { value: parentObject.value.name },
      ucumString: { value: "" },
      minValue: { value: "" },
      maxValue: { value: "" },
      valueLabel: {
        value: "",
      },
    };

    var defaultSelectedValueLabel = "";
    var defaultSelectedOperator = "";
    var defaultSelectedMinOperator = "";
    var defaultSelectedMaxOperator = "";
    var defaultSelectedMinValue = "";
    var defaultSelectedMaxValue = "";
    var defaultSelectedUcumString = "";

    var i = 0;

    for (i = 0; i < arraySize; i++) {
      if (arrayCheck == true) {
        var instanceObject = Intervals[i];
      } else {
        var instanceObject = Intervals;
      }

      var prntObject = {
        type: "Numerical",
        value: instanceObject,
      };
      if (i == 0) {
        defaultSelectedValueLabel = instanceObject.valueLabel;
        defaultSelectedOperator = instanceObject.operator;
        defaultSelectedUcumString = instanceObject.ucumString;
        defaultSelectedMinOperator = instanceObject.minOperator;
        defaultSelectedMaxOperator = instanceObject.maxOperator;
        defaultSelectedMinValue = parseFloat(instanceObject.minValue);
        defaultSelectedMaxValue = parseFloat(instanceObject.maxValue);
      } else {
        if (instanceObject.hasOwnProperty("select")) {
          if (instanceObject.select === "1") {
            defaultSelectedValueLabel = instanceObject.valueLabel;
            defaultSelectedOperator = instanceObject.operator;
            defaultSelectedUcumString = instanceObject.ucumString;
            defaultSelectedMinOperator = instanceObject.minOperator;
            defaultSelectedMaxOperator = instanceObject.maxOperator;
            defaultSelectedMinValue = parseFloat(instanceObject.minValue);
            defaultSelectedMaxValue = parseFloat(instanceObject.maxValue);
          }
        }
      }
      jsonCharacteristicQuantification.valueLabel = {
        value: defaultSelectedValueLabel,
      };

      jsonCharacteristicQuantification.operator = defaultSelectedOperator;
      jsonCharacteristicQuantification.minOperator = defaultSelectedMinOperator;
      jsonCharacteristicQuantification.maxOperator = defaultSelectedMaxOperator;
      jsonCharacteristicQuantification.ucumString = {
        value: defaultSelectedUcumString,
      };
      jsonCharacteristicQuantification.minValue = {
        value: defaultSelectedMinValue,
      };
      jsonCharacteristicQuantification.maxValue = {
        value: defaultSelectedMaxValue,
      };
    }

    jsonInner.push(jsonCharacteristicQuantification);
  };

  this.saveNonQuantifiable = function (
    parentObject,
    itself,
    Entitytype,
    jsonInner
  ) {
    var prntObject = null;

    var NonQuantifiables = itself.value;

    var arraySize = -1;
    var arrayCheck = false;
    if (Array.isArray(NonQuantifiables)) {
      arraySize = NonQuantifiables.length;
      arrayCheck = true;
    } else {
      arraySize = 1;
    }
    let anotconf = 0.0;
    if (typeof parentObject.value.selectac !== "undefined") {
      anotconf = parentObject.value.selectac;
    }
    let jsonCharacteristicQuantification = {
      "xsi:type": "NonQuantifiable",
      annotatorConfidence: { value: anotconf },
      label: { value: parentObject.value.name },
      typeCode: {
        code: "",
        codeSystem: "",
        codeSystemName: "",
        "iso:displayName": {
          "xmlns:iso": "uri:iso.org:21090",
          value: "",
        },
        codeSystemVersion: "",
      },
    };
    var defaultCode = "";
    var defaultCodeSystem = "";
    var defaultCodeSystemName = "";
    var defaultCodeSystemVersion = "";

    var i = 0;

    for (i = 0; i < arraySize; i++) {
      if (arrayCheck == true) {
        var instanceObject = NonQuantifiables[i];
      } else {
        var instanceObject = NonQuantifiables;
      }

      var prntObject = {
        type: "NonQuantifiable",
        value: instanceObject,
      };

      if (i == 0) {
        defaultCode = instanceObject.codeValue;
        defaultCodeSystem = instanceObject.codeMeaning;
        defaultCodeSystemName = instanceObject.codingSchemeDesignator;
        defaultCodeSystemVersion = instanceObject.codingSchemeVersion;
      } else {
        if (instanceObject.hasOwnProperty("select")) {
          if (instanceObject.select == "1") {
            defaultCode = instanceObject.codeValue;
            defaultCodeSystem = instanceObject.codeMeaning;
            defaultCodeSystemName = instanceObject.codingSchemeDesignator;
            defaultCodeSystemVersion = instanceObject.codingSchemeVersion;
          }
        }
      }
    }

    jsonCharacteristicQuantification.typeCode.code = defaultCode;
    jsonCharacteristicQuantification.typeCode.codeSystem = defaultCodeSystem;
    jsonCharacteristicQuantification.typeCode.codeSystemName =
      defaultCodeSystemName;
    jsonCharacteristicQuantification.typeCode.codeSystemVersion =
      defaultCodeSystemVersion;
    jsonCharacteristicQuantification.typeCode["iso:displayName"].value =
      defaultCodeSystem;
    jsonInner.push(jsonCharacteristicQuantification);
  };

  this.saveQuantile = function (parentObject, itself, Entitytype, jsonInner) {
    var Quantiles = itself.value;
    var arraySize = -1;
    var arrayCheck = false;

    if (Array.isArray(Quantiles)) {
      arraySize = Quantiles.length;
      arrayCheck = true;
    } else {
      arraySize = 1;
    }
    let anotconf = 0.0;
    if (typeof parentObject.value.selectac !== "undefined") {
      anotconf = parentObject.value.selectac;
    }
    let jsonCharacteristicQuantification = {
      "xsi:type": "Quantile",
      annotatorConfidence: { value: anotconf },
      label: { value: parentObject.value.name },
      minValue: { value: "" },
      maxValue: { value: "" },
      bins: { value: "" },
      selectedBin: { value: "" },
      valueLabel: {
        value: "",
      },
    };

    var defaultSelectedValueLabel = "";
    var defaultSelectedBins = "";
    var defaultSelectedSelectedBin = "";
    var defaultSelectedMinValue = "";
    var defaultSelectedMaxValue = "";

    var i = 0;

    for (i = 0; i < arraySize; i++) {
      if (arrayCheck == true) {
        var instanceObject = Quantiles[i];
      } else {
        var instanceObject = Quantiles;
      }

      var prntObject = {
        type: "Numerical",
        value: instanceObject,
      };
      if (i == 0) {
        defaultSelectedValueLabel = instanceObject.valueLabel;
        defaultSelectedBins = parseInt(instanceObject.bins);
        defaultSelectedSelectedBin = parseInt(instanceObject.selectedBin);
        defaultSelectedMinValue = parseFloat(instanceObject.minValue);
        defaultSelectedMaxValue = parseFloat(instanceObject.maxValue);
      } else {
        if (instanceObject.hasOwnProperty("select")) {
          if (instanceObject.select === "1") {
            defaultSelectedValueLabel = instanceObject.valueLabel;
            defaultSelectedBins = parseInt(instanceObject.bins);
            defaultSelectedSelectedBin = parseInt(instanceObject.selectedBin);
            defaultSelectedMinValue = parseFloat(instanceObject.minValue);
            defaultSelectedMaxValue = parseFloat(instanceObject.maxValue);
          }
        }
      }
      jsonCharacteristicQuantification.valueLabel = {
        value: defaultSelectedValueLabel,
      };

      jsonCharacteristicQuantification.bins = {
        value: defaultSelectedBins,
      };
      jsonCharacteristicQuantification.selectedBin = {
        value: defaultSelectedSelectedBin,
      };
      jsonCharacteristicQuantification.minValue = {
        value: defaultSelectedMinValue,
      };
      jsonCharacteristicQuantification.maxValue = {
        value: defaultSelectedMaxValue,
      };
      jsonCharacteristicQuantification.valueLabel = {
        value: defaultSelectedValueLabel,
      };
    }

    jsonInner.push(jsonCharacteristicQuantification);
  };

  this.saveNumerical = function (parentObject, itself, Entitytype, jsonInner) {
    var Numericals = itself.value;
    var arraySize = -1;
    var arrayCheck = false;

    if (Array.isArray(Numericals)) {
      arraySize = Numericals.length;
      arrayCheck = true;
    } else {
      arraySize = 1;
    }
    let anotconf = 0;
    if (typeof parentObject.value.selectac !== "undefined") {
      anotconf = parentObject.value.selectac;
    }
    let jsonCharacteristicQuantification = {
      "xsi:type": "Numerical",
      operator: "",
      annotatorConfidence: { value: anotconf },
      label: { value: parentObject.value.name },
      ucumString: { value: "" },
      valueLabel: {
        value: "",
      },
      value: {
        value: "",
      },
    };
    var defaultSelectedValue = "";
    var defaultSelectedValueLabel = "";
    var defaultSelectedOperator = "";
    var defaultSelectedUcumString = "";

    var i = 0;

    for (i = 0; i < arraySize; i++) {
      if (arrayCheck == true) {
        var instanceObject = Numericals[i];
      } else {
        var instanceObject = Numericals;
      }

      var prntObject = {
        type: "Numerical",
        value: instanceObject,
      };
      if (i == 0) {
        defaultSelectedValue = parseFloat(instanceObject.value);
        defaultSelectedValueLabel = instanceObject.valueLabel;
        defaultSelectedOperator = instanceObject.operator;
        defaultSelectedUcumString = instanceObject.ucumString;
      } else {
        if (instanceObject.hasOwnProperty("select")) {
          if (instanceObject.select === "1") {
            defaultSelectedValue = parseFloat(instanceObject.value);
            defaultSelectedValueLabel = instanceObject.valueLabel;
            defaultSelectedOperator = instanceObject.operator;
            defaultSelectedUcumString = instanceObject.ucumString;
          }
        }
      }
      jsonCharacteristicQuantification.valueLabel = {
        value: defaultSelectedValueLabel,
      };
      jsonCharacteristicQuantification.value = { value: defaultSelectedValue };
      jsonCharacteristicQuantification.operator = defaultSelectedOperator;
      jsonCharacteristicQuantification.ucumString = {
        value: defaultSelectedUcumString,
      };
    }

    jsonInner.push(jsonCharacteristicQuantification);
  };

  this.saveScaleLevel = function (parentObject, itself, Entitytype, jsonInner) {
    jsonInner["type"] = parentObject.value.scaleType;
    let prntObject = null;

    let ScaleLevels = itself.value;

    let arraySize = -1;
    let arrayCheck = false;
    let instanceObject = null;
    if (Array.isArray(ScaleLevels)) {
      arraySize = ScaleLevels.length;
      arrayCheck = true;
    } else {
      arraySize = 1;
    }

    let i = 0;
    let defaultSelectedValue = "";
    let defaultSelectedValueLabel = "";

    for (i = 0; i < arraySize; i++) {
      if (arrayCheck === true) {
        instanceObject = ScaleLevels[i];
      } else {
        instanceObject = ScaleLevels;
      }
      if (i == 0) {
        defaultSelectedValue = instanceObject.value;
        defaultSelectedValueLabel = instanceObject.valueLabel;
      } else {
        if (instanceObject.hasOwnProperty("select")) {
          if (instanceObject.select === "1") {
            defaultSelectedValue = instanceObject.value;
            defaultSelectedValueLabel = instanceObject.valueLabel;
          }
        }
      }
      jsonInner.valueLabel = { value: defaultSelectedValueLabel };
      jsonInner.value = { value: defaultSelectedValue };

      prntObject = {
        type: "ScaleLevel",
        value: instanceObject,
      };
    }
  };

  this.saveScale = function (parentObject, itself, Entitytype, jsonInner) {
    let prntObject = null;

    let Scales = itself.value;
    let i = 0;
    let arraySize = -1;
    let arrayCheck = false;
    let instanceObject = null;

    if (Array.isArray(Scales)) {
      arraySize = Scales.length;
      arrayCheck = true;
    } else {
      arraySize = 1;
    }

    let anotconf = 0.0;
    if (typeof parentObject.value.selectac !== "undefined") {
      anotconf = parentObject.value.selectac;
    }
    let jsonCharacteristicQuantification = {
      type: "Scale",
      "xsi:type": "Scale",
      annotatorConfidence: { value: anotconf },
      label: { value: parentObject.value.name },
      valueLabel: {
        value: "",
      },
      value: {
        value: "",
      },
    };
    for (i = 0; i < arraySize; i++) {
      if (arrayCheck === true) {
        instanceObject = Scales[i];
      } else {
        instanceObject = Scales;
      }

      let prntObject = {
        type: "Scale",
        value: instanceObject,
      };

      for (var key in instanceObject) {
        if (typeof instanceObject[key] === "object") {
          let subObject = {
            type: key,
            value: instanceObject[key],
          };

          //parentHolder -> each component creates it's own copy of the array and passes to the next object
          //componentOpject is the parent object for the callee
          //is the callee object
          //Entitytype should be null from this point
          self["save" + key](
            prntObject,
            subObject,
            Entitytype,
            jsonCharacteristicQuantification
          );
          jsonInner.push(jsonCharacteristicQuantification);
        }
      }
    }
  };

  this.saveCharacteristicQuantification = function (
    parentObject,
    itself,
    Entitytype,
    jsonInner
  ) {
    var prntObject = null;

    let CharacteristicQuantifications = itself.value;
    let i = 0;
    let arraySize = -1;
    let arrayCheck = false;
    let instanceObject = null;

    if (Array.isArray(CharacteristicQuantifications)) {
      arraySize = CharacteristicQuantifications.length;
      arrayCheck = true;
    } else {
      arraySize = 1;
    }

    jsonInner.characteristicQuantificationCollection = [];
    let tempjson = {};
    tempjson.CharacteristicQuantification = [];

    for (i = 0; i < arraySize; i++) {
      if (arrayCheck === true) {
        instanceObject = CharacteristicQuantifications[i];
      } else {
        instanceObject = CharacteristicQuantifications;
      }
      let prntObject = {
        type: "CharacteristicQuantification",
        value: instanceObject,
      };

      for (var key in instanceObject) {
        if (typeof instanceObject[key] === "object") {
          let subObject = {
            type: key,
            value: instanceObject[key],
          };
          //parentHolder -> each component creates it's own copy of the array and passes to the next object
          //componentOpject is the parent object for the callee
          //is the callee object
          //Entitytype should be null from this point
          self["save" + key](
            prntObject,
            subObject,
            Entitytype,
            tempjson.CharacteristicQuantification
          );
        }
      }
    }

    jsonInner.characteristicQuantificationCollection.push(
      tempjson.CharacteristicQuantification
    );
  };

  this.saveImagingObservation = function (
    parentObject,
    itself,
    Entitytype,
    jsonInner
  ) {
    if (!jsonInner.hasOwnProperty("imagingObservationEntityCollection"))
      jsonInner.imagingObservationEntityCollection = [];
    let jsonImagingObservationEntity = {};
    self["saveImagingObservationCharacteristic"](
      parentObject,
      itself.value["ImagingObservationCharacteristic"],
      Entitytype,
      jsonInner.imagingObservationEntityCollection
    );
  };

  this.saveImagingObservationCharacteristic = function (
    parentObject,
    itself,
    Entitytype,
    jsonInner
  ) {
    let prntObject = null;
    let ImagingObservationCharacteristics = itself;
    let arraySize = -1;
    let arrayCheck = false;
    let instanceObject = null;
    if (Array.isArray(ImagingObservationCharacteristics)) {
      arraySize = ImagingObservationCharacteristics.length;
      arrayCheck = true;
    } else {
      arraySize = 1;
    }
    let tempjson = {};
    tempjson.imagingObservationCharacteristicCollection = [];
    var i = 0;
    for (i = 0; i < arraySize; i++) {
      if (arrayCheck === true) {
        instanceObject = ImagingObservationCharacteristics[i];
      } else {
        instanceObject = ImagingObservationCharacteristics;
      }

      let prntObject = {
        type: "ImagingObservationCharacteristic",
        value: instanceObject,
      };

      let commentvalue = "";
      if (instanceObject.hasOwnProperty("commentSelect")) {
        commentvalue = instanceObject.commentSelect;
      }
      for (var key in instanceObject) {
        if (typeof instanceObject[key] === "object") {
          let subObject = {
            type: key,
            value: instanceObject[key],
          };
          self["save" + key](
            prntObject,
            subObject,
            Entitytype,
            tempjson.imagingObservationCharacteristicCollection
          );
        }
      }

      if (commentvalue !== "") {
        let lastImObCharColl =
          tempjson.imagingObservationCharacteristicCollection[
            tempjson.imagingObservationCharacteristicCollection.length - 1
          ];
        lastImObCharColl["comment"] = { value: commentvalue };
        commentvalue = "";
      }
    }
    jsonInner.push(tempjson);
  };

  this.emptyJson = function (obj) {
    if (Object.keys(obj).length === 0 && obj.constructor === Object)
      return false;
    else return true;
  };
  this.saveAnatomicEntity = function (
    parentObject,
    itself,
    Entitytype,
    jsonInner
  ) {
    if (!jsonInner.hasOwnProperty("imagingPhysicalEntityCollection"))
      jsonInner.imagingPhysicalEntityCollection = [];
    let jsonImagingPhysicalEntity = {};
    self["saveAnatomicEntityCharacteristic"](
      parentObject,
      itself.value["AnatomicEntityCharacteristic"],
      Entitytype,
      jsonInner.imagingPhysicalEntityCollection
    );
  };

  this.saveAnatomicEntityCharacteristic = function (
    parentObject,
    itself,
    Entitytype,
    jsonInner
  ) {
    let prntObject = null;

    let AnatomicEntityCharacteristics = itself;
    let i = 0;
    let arraySize = -1;
    let arrayCheck = false;
    let instanceObject = null;
    if (Array.isArray(AnatomicEntityCharacteristics)) {
      arraySize = AnatomicEntityCharacteristics.length;
      arrayCheck = true;
    } else {
      arraySize = 1;
    }

    let tempjson = {};
    tempjson.imagingPhysicalEntityCharacteristicCollection = [];
    for (i = 0; i < arraySize; i++) {
      let jsonAllowedTerms = {};

      if (arrayCheck === true) {
        instanceObject = AnatomicEntityCharacteristics[i];
      } else {
        instanceObject = AnatomicEntityCharacteristics;
      }

      let prntObject = {
        type: "AnatomicEntityCharacteristic",
        value: instanceObject,
      };

      let commentvalue = "";

      if (instanceObject.hasOwnProperty("commentSelect")) {
        commentvalue = instanceObject.commentSelect;
      }
      for (var key in instanceObject) {
        if (typeof instanceObject[key] === "object") {
          let subObject = {
            type: key,
            value: instanceObject[key],
          };

          self["save" + key](
            prntObject,
            subObject,
            Entitytype,
            tempjson.imagingPhysicalEntityCharacteristicCollection
          );
        }
      }

      if (commentvalue !== "") {
        var lastImPhyCharColl =
          tempjson.imagingPhysicalEntityCharacteristicCollection[
            tempjson.imagingPhysicalEntityCharacteristicCollection.length - 1
          ];
        lastImPhyCharColl["comment"] = { value: commentvalue };
        commentvalue = "";
      }
    }
    jsonInner.push(tempjson);
  };

  this.saveAllowedTerm = function (
    parentObject,
    itself,
    Entitytype,
    jsonInner
  ) {
    var AllowedTerms = itself.value;
    let i = 0;
    let arraySizeforAllowedTerms = -1;
    let arrayCheckForAllowedTerms = false;
    let objectFromDirectComponent = "";
    let instanceAllowedTerms = null;

    if (Array.isArray(AllowedTerms)) {
      arraySizeforAllowedTerms = AllowedTerms.length;
      arrayCheckForAllowedTerms = true;
    } else {
      arraySizeforAllowedTerms = 1;
    }

    if (!jsonInner.hasOwnProperty("allowedterms")) jsonInner.allowedterms = [];
    if (parentObject.type == "Component") {
      if (parentObject.value.hasOwnProperty("ImagingObservation")) {
        objectFromDirectComponent = "ImagingObservationEntity";
      }
      if (parentObject.value.hasOwnProperty("AnatomicEntity")) {
        objectFromDirectComponent = "ImagingPhysicalEntity";
      }
    }

    let jsonAllowedTerms = [];

    let xmlDecideCategory = "";
    for (i = 0; i < arraySizeforAllowedTerms; i++) {
      if (arrayCheckForAllowedTerms == true) {
        instanceAllowedTerms = AllowedTerms[i];
      } else {
        instanceAllowedTerms = AllowedTerms;
      }

      let prntObject = {
        type: "AllowedTerm",
        value: instanceAllowedTerms,
      };

      if (instanceAllowedTerms.hasOwnProperty("select")) {
        if (instanceAllowedTerms.select == "1") {
          let anotconf = "";
          if (typeof parentObject.value.selectac !== "undefined") {
            anotconf = parentObject.value.selectac;
          } else {
            anotconf = 0;
          }
          let jsonAllowedTerm = {
            typeCode: [
              {
                code: instanceAllowedTerms.codeValue,
                codeSystemName: instanceAllowedTerms.codingSchemeDesignator,
                codeSystemVersion: instanceAllowedTerms.codingSchemeVersion,
                "iso:displayName": {
                  value: instanceAllowedTerms.codeMeaning,
                  "xmlns:iso": "uri:iso.org:21090",
                },
              },
            ],
            annotatorConfidence: {
              value: anotconf,
            },
            label: {
              value: parentObject.value.label,
            },
          };

          for (var key in instanceAllowedTerms) {
            if (typeof instanceAllowedTerms[key] == "object") {
              var subObject = {
                type: key,
                value: instanceAllowedTerms[key],
              };

              //parentHolder -> each component creates it's own copy of the array and passes to the next object
              //componentOpject is the parent object for the callee
              //is the callee object
              //Entitytype should be null from this point

              self["save" + key](
                prntObject,
                subObject,
                Entitytype,
                jsonAllowedTerm
              );
            }
          }
          if (self.emptyJson(jsonAllowedTerm)) {
            if (parentObject.type === "Component") {
              jsonInner.allowedterms.push(jsonAllowedTerm);
            } else {
              jsonInner.push(jsonAllowedTerm);
            }
          }
        }
      }
    }
  };

  this.saveValidTerm = function (parentObject, itself, Entitytype, jsonInner) {
    let prntObject = null;

    let ValidTerms = itself.value;
    let defaultCodeValue = "";
    let defaultCodingSchemeDesignator = "";
    let defaultCodingSchemeVersion = "";
    let defaultCodeMeaning = "";
    let arraySize = -1;
    let arrayCheck = false;
    let instanceObject = null;
    if (Array.isArray(ValidTerms)) {
      arraySize = ValidTerms.length;
      arrayCheck = true;
    } else {
      arraySize = 1;
    }

    let i = 0;

    let tempTypecode = jsonInner.typeCode;
    jsonInner.typeCode = [];
    jsonInner.typeCode.push(tempTypecode);

    for (i = 0; i < arraySize; i++) {
      if (arrayCheck == true) {
        instanceObject = ValidTerms[i];
      } else {
        instanceObject = ValidTerms;
      }

      let prntObject = {
        type: "ValidTerm",
        value: instanceObject,
      };
      if (i == 0 && arraySize == 1) {
        defaultCodeValue = instanceObject.codeValue;
        defaultCodingSchemeDesignator = instanceObject.codingSchemeDesignator;
        defaultCodingSchemeVersion = instanceObject.codingSchemeVersion;
        defaultCodeMeaning = instanceObject.codeMeaning;
      } else {
        if (instanceObject.hasOwnProperty("select")) {
          if (instanceObject.select == "1") {
            defaultCodeValue = instanceObject.codeValue;
            defaultCodingSchemeDesignator =
              instanceObject.codingSchemeDesignator;
            defaultCodingSchemeVersion = instanceObject.codingSchemeVersion;
            defaultCodeMeaning = instanceObject.codeMeaning;
          }
        }
      }

      if (defaultCodeMeaning !== "") {
        let jsonValidTerm = {
          code: defaultCodeValue,
          codeSystemName: defaultCodingSchemeDesignator,
          codeSystemVersion: defaultCodingSchemeVersion,
          "iso:displayName": {
            value: defaultCodeMeaning,
            "xmlns:iso": "uri:iso.org:21090",
          },
        };
        if (Array.isArray(jsonInner.typeCode)) {
          jsonInner.typeCode[0].push(jsonValidTerm);
        } else {
          jsonInner.typeCode.push(jsonValidTerm);
        }
        defaultCodeMeaning = "";
      }
    }
  };

  this.traverseComponentsToSave = function (o, jsonComponents) {
    let validTagListToCheck = ["QuestionType", "AnatomicEntity", "AllowedTerm"];

    let Template = o["TemplateContainer"]["Template"][0];
    let Components = Template["Component"];
    let arraySizeforComponents = 0;
    let arrayCheckForComponents = false;
    let jsonParent = { innerjsons: [] };
    let jsonInner = {};
    let instanceComponent;
    if (Array.isArray(Components)) {
      arraySizeforComponents = Components.length;
      arrayCheckForComponents = true;
    } else {
      arraySizeforComponents = 1;
    }
    let i = 0;

    for (i = 0; i < arraySizeforComponents; i++) {
      jsonInner = {};
      if (arrayCheckForComponents === true) {
        instanceComponent = Components[i];
      } else instanceComponent = Components;

      let componentObject = {
        type: "Component",
        value: instanceComponent,
      };

      let Entitytype = null;
      if (instanceComponent.hasOwnProperty("ImagingObservation")) {
        Entitytype = "ImagingObservation";
      }
      if (instanceComponent.hasOwnProperty("AnatomicEntity")) {
        Entitytype = "AnatomicEntity";
      }

      //changin key order to capture Allowed terms first
      let keyorder = Object.keys(instanceComponent);
      let fix = -1;
      let z = 0;
      for (z = 0; z < keyorder.length; z++) {
        if (keyorder[z] === "AllowedTerm") {
          fix = z;
          break;
        }
      }

      keyorder[fix] = keyorder[0];
      keyorder[0] = "AllowedTerm";
      for (let counter = 0; counter < keyorder.length; counter++) {
        if (typeof instanceComponent[keyorder[counter]] == "object") {
          let subObject = {
            type: keyorder[counter],
            value: instanceComponent[keyorder[counter]],
          };

          //parentHolder -> each component creates it's own copy of the array and passes to the next object
          //componentOpject is the parent object for the callee
          //is the callee object
          //Entitytype is used if the allowed term is connected directly to the component to define image or physical entity etc..

          try {
            self["save" + keyorder[counter]](
              componentObject,
              subObject,
              Entitytype,
              jsonInner
            );
          } catch (err) {
            //Block of code to handle errors
          }
        }
      }
      if (Object.keys(jsonInner).length > 0) {
        jsonParent.innerjsons.push(jsonInner);
        jsonInner = {};
      }
    }

    jsonComponents.innerjsons = jsonParent.innerjsons;
    return jsonComponents;
  };

  this.saveAim = function () {
    var jsonComponents = {};
    var finaljson = {};
    var mainHolder = [];

    jsonComponents = self.traverseComponentsToSave(
      self.jsonTemplateCopy,
      jsonComponents
    );

    /* rules : if there are more than 1 allowed terms directly connected to the components one of them goes under characteristic quantification, the rest goes as 
         entity elements.
      */
    var innerJsonCount = jsonComponents.innerjsons.length;
    var nextComptype = "";
    var nextInnerCompCount = -1;
    var index = 0;
    var mergeJson = [];
    var mapFinalJsonTags = new Map();
    finaljson.name = { value: self.aimName };
    finaljson.comment = { value: self.aimComment };
    finaljson.modality = { value: self.aimType };
    finaljson.typeCode = self.aimTypeCode;

    for (index = 0; index < innerJsonCount; index++) {
      var eachInnerJson = jsonComponents.innerjsons[index];
      var keys = Object.keys(eachInnerJson);

      let modifiedKeysForAT = [...keys];
      let indexLocation = modifiedKeysForAT.indexOf("questiontypes");
      if (indexLocation > -1) {
        modifiedKeysForAT.splice(indexLocation, 1);
      }

      if (modifiedKeysForAT.length >= 2) {
        switch (modifiedKeysForAT[1]) {
          case "imagingObservationEntityCollection":
            nextComptype = "imagingObservationEntityCollection";
            break;
          case "imagingPhysicalEntityCollection":
            nextComptype = "imagingPhysicalEntityCollection";
            break;
          default:
        }

        let directATlength = eachInnerJson["allowedterms"].length;

        if (directATlength > 0) {
          if (directATlength >= 1) {
            //add allowed terms to the next component
            if (eachInnerJson[nextComptype].length > 0) {
              var n;
              for (n = 0; n < directATlength; n++) {
                //directATlength-1 means last allowed term will be added inner component ex:characteristics

                if (n < directATlength - 1) {
                  eachInnerJson[nextComptype].push(
                    eachInnerJson["allowedterms"][n]
                  );
                } else {
                  var innerkeys = Object.keys(eachInnerJson[nextComptype][0]);

                  if (innerkeys.length == 0) {
                  } else {
                    if (
                      innerkeys[0] ==
                        "ImagingPhysicalEntityCharacteristicCollection" ||
                      "imagingObservationCharacteristicCollection"
                    ) {
                      var tempMergeJsons = {};
                      tempMergeJsons = eachInnerJson[nextComptype][0];
                      Object.assign(
                        tempMergeJsons,
                        eachInnerJson["allowedterms"][directATlength - 1]
                      );
                    } else {
                      eachInnerJson[nextComptype].push(
                        eachInnerJson["allowedterms"][directATlength - 1]
                      );
                    }
                  }
                }
              }
              delete eachInnerJson["allowedterms"];
              nextInnerCompCount = 1;
            } else {
              eachInnerJson[nextComptype] = eachInnerJson["allowedterms"];
              delete eachInnerJson["allowedterms"];
            }
          } else {
            eachInnerJson[nextComptype] = eachInnerJson["allowedterms"];
            delete eachInnerJson["allowedterms"];
          }
        } else {
          delete eachInnerJson["allowedterms"];
        }
      }

      let modifiedKeysForQT = [...keys];
      let indexLocationQT = modifiedKeysForQT.indexOf("allowedterms");
      if (indexLocationQT > -1) {
        modifiedKeysForQT.splice(indexLocationQT, 1);
      }

      if (modifiedKeysForQT.length >= 2) {
        switch (modifiedKeysForQT[1]) {
          case "imagingObservationEntityCollection":
            nextComptype = "imagingObservationEntityCollection";
            break;
          case "imagingPhysicalEntityCollection":
            nextComptype = "imagingPhysicalEntityCollection";
            break;
          default:
        }

        let directQTlength = eachInnerJson["questiontypes"].length;

        if (directQTlength > 0) {
          if (directQTlength >= 1) {
            if (eachInnerJson[nextComptype].length > 0) {
              var n;
              for (n = 0; n < directQTlength; n++) {
                if (n < directQTlength - 1) {
                  eachInnerJson[nextComptype].push(
                    eachInnerJson["questiontypes"][n]
                  );
                } else {
                  var innerkeys = Object.keys(eachInnerJson[nextComptype][0]);

                  if (innerkeys.length == 0) {
                  } else {
                    if (
                      innerkeys[0] ==
                        "ImagingPhysicalEntityCharacteristicCollection" ||
                      "imagingObservationCharacteristicCollection"
                    ) {
                      var tempMergeJsons = {};
                      tempMergeJsons = eachInnerJson[nextComptype][0];
                      Object.assign(
                        tempMergeJsons,
                        eachInnerJson["questiontypes"][directQTlength - 1]
                      );
                    } else {
                      eachInnerJson[nextComptype].push(
                        eachInnerJson["questiontypes"][directQTlength - 1]
                      );
                    }
                  }
                }
              }
              delete eachInnerJson["questiontypes"];
              nextInnerCompCount = 1;
            } else {
              eachInnerJson[nextComptype] = eachInnerJson["questiontypes"];
              delete eachInnerJson["questiontypes"];
            }
          } else {
            eachInnerJson[nextComptype] = eachInnerJson["questiontypes"];
            delete eachInnerJson["questiontypes"];
          }
        } else {
          delete eachInnerJson["questiontypes"];
        }
      }
      var eachImOB = "";
      var eachImPhy = "";
      if (eachInnerJson.hasOwnProperty("imagingObservationEntityCollection")) {
        if (
          typeof eachInnerJson["imagingObservationEntityCollection"] !==
          "undefined"
        ) {
          eachImOB = eachInnerJson["imagingObservationEntityCollection"];
          if (mapFinalJsonTags.get("imagingObservationEntityCollection")) {
            if (eachImOB != "" && typeof eachImOB != "undefined") {
              var mergeJson = [];
              mergeJson =
                finaljson["imagingObservationEntityCollection"].concat(
                  eachImOB
                );
              finaljson["imagingObservationEntityCollection"] = [...mergeJson];
              eachImOB = "";
            }
          } else {
            if (eachImOB != "" && typeof eachImOB != "undefined") {
              finaljson["imagingObservationEntityCollection"] =
                eachInnerJson["imagingObservationEntityCollection"];
              mapFinalJsonTags.set("imagingObservationEntityCollection", 1);
              eachImOB = "";
            }
          }
        }
      }
      if (eachInnerJson.hasOwnProperty("imagingPhysicalEntityCollection")) {
        if (
          typeof eachInnerJson["imagingPhysicalEntityCollection"] != "undefined"
        ) {
          eachImPhy = eachInnerJson["imagingPhysicalEntityCollection"];
          if (mapFinalJsonTags.get("imagingPhysicalEntityCollection")) {
            if (eachImPhy != "" && typeof eachImPhy != "undefined") {
              var mergeJson = {};
              mergeJson =
                finaljson["imagingPhysicalEntityCollection"].concat(eachImPhy);
              finaljson["imagingPhysicalEntityCollection"] = mergeJson;
              eachImPhy = "";
            }
          } else {
            if (eachImPhy != "" && typeof eachImPhy != "undefined") {
              finaljson["imagingPhysicalEntityCollection"] =
                eachInnerJson["imagingPhysicalEntityCollection"];
              mapFinalJsonTags.set("imagingPhysicalEntityCollection", 1);
              eachImPhy = "";
            }
          }
        }
      }
    }
    self.addUid(finaljson);
    finaljson = self.replaceTagNamingHierarchy(finaljson);
    return finaljson;
  };
  this.addButtonsDiv = function (divforbuttons) {
    self.divHolderForButtons = divforbuttons;
  };
  this.addButtons = function (parentDiv) {
    let saveButton = document.createElement("Button");
    let saveButtonText = document.createTextNode("save");
    saveButton.appendChild(saveButtonText);
    saveButton.onclick = function () {
      var savedAimJson = self.saveAim();
    };
    let loadButton = document.createElement("Button");
    let loadButtonText = document.createTextNode("load");
    loadButton.appendChild(loadButtonText);
    loadButton.onclick = function () {};

    parentDiv.appendChild(saveButton);
    parentDiv.appendChild(loadButton);

    if (self.divHolderForButtons != null)
      parentDiv.appendChild(self.divHolderForButtons);
  };

  this.turnAllRedtoGreencheck = function () {
    var objs = document.getElementsByTagName("i");
    for (var i = 0; i < objs.length; i++) {
      if (objs[i].className == "red check circle outline icon")
        objs[i].className = "green check circle outline icon";
    }
  };
  this.checkFormSaveReady = function () {
    var countRedCircle = 0;
    var objs = document.getElementsByTagName("i");

    for (var i = 0; i < objs.length; i++) {
      if (objs[i].className == "red check circle outline icon")
        countRedCircle++;
    }
    console.log(
      "form save ready",
      document.getElementById("annotationName").value
    );
    if (document.getElementById("annotationName").value === "")
      countRedCircle++;
    return countRedCircle;
  };

  this.checkAnnotationShapes = function (prmtrShapeArray) {
    if (typeof prmtrShapeArray === undefined) {
      return;
    }
    let anyShapeFlag = false;
    let anyClosedShapeFlag = false;
    let prmtrShapeArrayLength = prmtrShapeArray.length;
    let templateShapeArrayLength = self.templateShapeArray.length;

    for (let k = 0; k < prmtrShapeArrayLength; k++) {
      let jsonShapeObj = self.mapShapesSchemaToTemplate.get(prmtrShapeArray[k]);
      if (Array.isArray(jsonShapeObj)) {
        for (let n = 0; n < jsonShapeObj.length; n++) {
          self.runtimeUserShapes[jsonShapeObj[n].formshape] = { validate: "" };
        }
      } else {
        self.runtimeUserShapes[jsonShapeObj.formshape] = { validate: "" };
      }

      if (Array.isArray(jsonShapeObj)) {
        for (let t = 0; t < templateShapeArrayLength; t++) {
          if (self.templateShapeArray[t].shape === "AnyShape") {
            anyShapeFlag = true;
          }
          if (self.templateShapeArray[t].shape === "AnyClosedShape") {
            anyClosedShapeFlag = true;
          }
          for (let j = 0; j < jsonShapeObj.length; j++) {
            if (
              self.templateShapeArray[t].shape === jsonShapeObj[j].formshape
            ) {
              document.getElementById(
                self.templateShapeArray[t].domid
              ).className = "green check circle outline icon";
            }
          }
          if (anyShapeFlag === true) {
            for (let cnt = 0; cnt < templateShapeArrayLength; cnt++) {
              document.getElementById(
                self.templateShapeArray[cnt].domid
              ).className = "green check circle outline icon";
            }
            anyShapeFlag = false;
          }
          if (anyClosedShapeFlag === true) {
            for (let cnt = 0; cnt < templateShapeArrayLength; cnt++) {
              document.getElementById(
                self.templateShapeArray[cnt].domid
              ).className = "green check circle outline icon";
            }
            anyClosedShapeFlag = false;
          }
        }
      } else {
        for (let t = 0; t < templateShapeArrayLength; t++) {
          if (self.templateShapeArray[t].shape === "AnyShape") {
            anyShapeFlag = true;
          }
          if (self.templateShapeArray[t].shape === "AnyClosedShape") {
            anyClosedShapeFlag = true;
          }
          if (self.templateShapeArray[t].shape === jsonShapeObj.formshape) {
            document.getElementById(
              self.templateShapeArray[t].domid
            ).className = "green check circle outline icon";
          }
        }
        if (anyShapeFlag === true) {
          for (let cnt = 0; cnt < templateShapeArrayLength; cnt++) {
            document.getElementById(
              self.templateShapeArray[cnt].domid
            ).className = "green check circle outline icon";
          }
          anyShapeFlag = false;
        }
        if (anyClosedShapeFlag === true) {
          for (let cnt = 0; cnt < templateShapeArrayLength; cnt++) {
            document.getElementById(
              self.templateShapeArray[cnt].domid
            ).className = "green check circle outline icon";
          }
          anyClosedShapeFlag = false;
        }
      }
    }
    // self.formCheckHandler(self.checkFormSaveReady());
  };

  this.setAim = function (aimValue) {
    self.textXml = aimValue;
  };

  this.checkIfCommentRequired = function (object, parentDiv) {
    if (object.hasOwnProperty("requireComment")) {
      if (object.requireComment === "true") {
        let annoCommentDomid = object.label.replace(
          /[`~!@# $%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi,
          ""
        );

        self.mapLabelSubComment.set(annoCommentDomid, annoCommentDomid);
        self.mapLabelCommentJson.set(annoCommentDomid, object); //changing

        var req = document.createElement("div");
        var label = document.createElement("label");
        label.textContent = "Comment";

        let textaDomObject = document.createElement("textarea");
        textaDomObject.style.color = "black";
        textaDomObject.style.width = "100%";
        textaDomObject.id = "comment" + object.label;
        textaDomObject.onkeyup = function () {
          if (self.activateDirtyCheck) {
            self.handlerSetAimDirty(); // added to set dirtflag
          }
          object.commentSelect = DOMPurify.sanitize(this.value);
        };
        req.appendChild(label);
        req.appendChild(textaDomObject);
        parentDiv.appendChild(req);
        req.className = "requiredcomment";
      }
    }
  };
  //change
  this.traverseJsonOnLoad = function (jsonObj) {
    let label = "";

    if (jsonObj !== null && typeof jsonObj == "object") {
      Object.entries(jsonObj).forEach(([key, value]) => {
        if (key === "CharacteristicQuantification") {
          let CharQuantArray = value;
          let arrayCheck = false;
          let arrayIndex = -1;
          let arraySize = -1;

          if (Array.isArray(CharQuantArray)) {
            arrayCheck = true;
            arraySize = CharQuantArray.length;
          } else {
            arraySize = 1;
          }
          let eachCharactQuantfObj = "";
          for (let i = 0; i < arraySize; i++) {
            if (arrayCheck) {
              eachCharactQuantfObj = CharQuantArray[i];
            } else {
              eachCharactQuantfObj = CharQuantArray;
            }
            let chartQuantfType = eachCharactQuantfObj["xsi:type"];
            switch (chartQuantfType) {
              case "Scale":
                $("#Select" + eachCharactQuantfObj.label.value).dropdown(
                  "set selected",
                  [eachCharactQuantfObj.valueLabel.value]
                );
                break;
              case "NonQuantifiable":
                $("#Select" + eachCharactQuantfObj.label.value).dropdown(
                  "set selected",
                  [eachCharactQuantfObj.typeCode.codeSystem]
                );
                break;
              case "Numerical":
                $("#Select" + eachCharactQuantfObj.label.value).dropdown(
                  "set selected",
                  [
                    self.mathOperators.get(eachCharactQuantfObj.operator) +
                      " " +
                      eachCharactQuantfObj.valueLabel.value +
                      " " +
                      eachCharactQuantfObj.ucumString.value,
                  ]
                );
                break;
              case "Quantile":
                $("#Select" + eachCharactQuantfObj.label.value).dropdown(
                  "set selected",
                  [eachCharactQuantfObj.valueLabel.value]
                );

                break;
              case "Interval":
                $("#Select" + eachCharactQuantfObj.label.value).dropdown(
                  "set selected",
                  [eachCharactQuantfObj.valueLabel.value]
                );
                break;
              default:
            }
          }
        }

        if (key === "typeCode") {
          if (
            !(
              self.isRecistFlag === true &&
              (jsonObj.label.value === "Type" ||
                jsonObj.label.value === "Location")
            )
          ) {
            //for allowed terms and valid terms

            let ValidtermCode = "";
            label = self.removeEmptySpace(jsonObj.label.value);

            if (Array.isArray(value[0])) {
              ValidtermCode = value[0][1].code;

              var docElement = document.getElementById(
                label + "-" + ValidtermCode + value[0][0].code
              );
            } else {
              var docElement = document.getElementById(
                label + "-" + value[0].code
              );
            }

            if (docElement != null) {
              var parentDiv = docElement.parentNode;

              if (typeof parentDiv[0] != "undefined") {
                var crop = parentDiv[0].name;

                crop = crop.replace(
                  /[`~!@#$%^&*()_|+\-=?;:'",.<>/ /\{\}\[\]\\\/]/gi,
                  ""
                );

                var prDiv = document.getElementById("Drop" + crop);
                var subDivs = prDiv.getElementsByTagName("div");

                var splittedLabel = docElement.label.split("-");

                let splittedLabelMergeRest = "";
                for (let k = 1; k < splittedLabel.length; k++) {
                  if (k !== splittedLabel.length - 1) {
                    splittedLabelMergeRest =
                      splittedLabelMergeRest + splittedLabel[k] + "-";
                  } else {
                    splittedLabelMergeRest =
                      splittedLabelMergeRest + splittedLabel[k];
                  }
                }

                $(subDivs[0]).addClass("disabled");
                $(subDivs[0]).dropdown("set selected", [
                  splittedLabelMergeRest.trim(),
                ]);
                $(subDivs[0]).removeClass("disabled");
              } else {
                if (docElement.checked != true) {
                  docElement.click();
                }
              }
            }
          }
        }

        if (key === "annotatorConfidence") {
          if (jsonObj.hasOwnProperty("label")) {
            let annotatorConflabel = jsonObj["label"]["value"].replace(
              /[`~!@# $%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi,
              ""
            );
            let returnAnnotConfDomId =
              self.mapLabelAnnotatorConfidence.get(annotatorConflabel);

            if (typeof returnAnnotConfDomId != "undefined") {
              let showannoConfDomid = "range" + annotatorConflabel;
              document.getElementById(returnAnnotConfDomId).value =
                value.value * 100;
              document.getElementById(showannoConfDomid).value =
                value.value * 100;
              let annotconfJson =
                self.mapLabelAnnotConfJson.get(annotatorConflabel);
              annotconfJson.selectac = value.value;
            }
          }
        }
        if (key === "comment") {
          if (jsonObj.hasOwnProperty("label")) {
            let commentLabel = jsonObj["label"]["value"].replace(
              /[`~!@# $%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi,
              ""
            );
            let returnCommentLabel = self.mapLabelSubComment.get(commentLabel);
            if (typeof returnCommentLabel != "undefined") {
              let commentJson = self.mapLabelCommentJson.get(commentLabel);
              document.getElementById(
                "comment" + jsonObj["label"]["value"]
              ).value = value.value;
              commentJson.commentSelect = value.value;
            }
          }
        }

        if (key === "uniqueIdentifier") {
          //alert("uid"+jsonObj['label']['value']);
          //alert(jsonObj['typeCode']['code']);
          let uid = value.root;
          let code = jsonObj["typeCode"]["code"];
          let label = jsonObj["label"]["value"];
          let commentLabel = label.replace(
            /[`~!@# $%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi,
            ""
          );
          self.mapLabelUid.set(code, { uid: uid, label: label });
        }

        self.traverseJsonOnLoad(value);
      });
    }
  };

  this.checkShapes = function (shapes) {
    let shapeKeys = Object.keys(shapes);
    let shapeKeysLength = 0;
    let runtimeUserShapesAll = Object.keys(self.runtimeUserShapes);
    //alert(runtimeUserShapesAll);
    let runtimeUserShapesAllLength = 0;
    if (shapeKeys.length > 0 || runtimeUserShapesAll.length > 0) {
      // shapes rectified Mate needs to adjust the paramters before passing this  test = { circle : {count : 5, validate:""} , line:  {count : 5, validate:""}  };
      // use the the model above not the model in the below line
      // shapes needs to be in format shapes = {Circle : "" , Line : "ok"} , value : {"" , "ok"} will be used to make sure that each option is checked
      /* schema chape list 
    	<xs:enumeration value="Point"/>
			<xs:enumeration value="Circle"/>
			<xs:enumeration value="Polyline"/>
			<xs:enumeration value="Ellipse"/>
			<xs:enumeration value="MultiPoint"/>
			<xs:enumeration value="3DPolygon"/>
			<xs:enumeration value="3DPolyline"/>
			<xs:enumeration value="3DMultiPoint"/>
			<xs:enumeration value="3DPoint"/>
			<xs:enumeration value="3DEllipse"/>
			<xs:enumeration value="3DEllipsoid"/>
			<xs:enumeration value="Line"/>
			<xs:enumeration value="AnyShape"/>
			<xs:enumeration value="AnyClosedShape"/>
      
    const newShapes = {Circle, Polyline, Line, Perpendicular};
    */

      /* impoertant note if there are multiple geometric shape component exist in a template 
      or relation will be applied 
    */

      let templateShapeLength = self.templateShapeArray.length;
      let anyShapeFlag = false;
      let anyClosedShapeFlag = false;
      let localShapes = {};

      if (shapeKeys.length === 0) {
        localShapes = JSON.parse(JSON.stringify(self.runtimeUserShapes));
      } else {
        self.runtimeUserShapes = JSON.parse(JSON.stringify(shapes));
        localShapes = JSON.parse(JSON.stringify(shapes));
      }
      if (templateShapeLength > 0) {
        let arryDiffernce = "";
        let geoTemplateConditionDom = null;
        for (let cnt = 0; cnt < templateShapeLength; cnt++) {
          arryDiffernce = Object.keys(localShapes).filter(
            (eachShape) => eachShape !== self.templateShapeArray[cnt].shape
          );

          geoTemplateConditionDom = document.getElementById(
            self.templateShapeArray[cnt].domid
          );
          if (arryDiffernce.length === 0) {
            if (geoTemplateConditionDom !== null) {
              document.getElementById(
                self.templateShapeArray[cnt].domid
              ).className = "green check circle outline icon";
            }
          } else {
            let perpPos = -1;
            let linePos = -1;
            if (self.templateShapeArray[cnt].shape === "Line") {
              perpPos = arryDiffernce.indexOf("Perpendicular");
              if (perpPos > -1) arryDiffernce.splice(perpPos, 1);
            }
            if (self.templateShapeArray[cnt].shape === "Perpendicular") {
              linePos = arryDiffernce.indexOf("Line");
              if (linePos > -1) arryDiffernce.splice(linePos, 1);
            }

            if (arryDiffernce.length > 0) {
              if (geoTemplateConditionDom !== null) {
                document.getElementById(
                  self.templateShapeArray[cnt].domid
                ).className = "red check circle outline icon";
              }
            } else {
              if (geoTemplateConditionDom !== null) {
                document.getElementById(
                  self.templateShapeArray[cnt].domid
                ).className = "green check circle outline icon";
              }
            }
          }
          // **
          if (self.templateShapeArray[cnt].shape === "AnyShape") {
            anyShapeFlag = true;
          }
          if (self.templateShapeArray[cnt].shape === "AnyClosedShape") {
            anyClosedShapeFlag = true;
          }

          if (anyShapeFlag === true) {
            for (let cnt = 0; cnt < templateShapeLength; cnt++) {
              document.getElementById(
                self.templateShapeArray[cnt].domid
              ).className = "green check circle outline icon";
            }
            anyShapeFlag = false;
          }
          if (anyClosedShapeFlag === true) {
            arryDiffernce = Object.keys(localShapes).filter(
              (eachShape) => !self.anyClosedShapeTypes.includes(eachShape)
            );
            if (arryDiffernce.length === 0) {
              for (let cnt = 0; cnt < templateShapeLength; cnt++) {
                document.getElementById(
                  self.templateShapeArray[cnt].domid
                ).className = "green check circle outline icon";
              }
            } else {
              for (let cnt = 0; cnt < templateShapeLength; cnt++) {
                document.getElementById(
                  self.templateShapeArray[cnt].domid
                ).className = "red check circle outline icon";
              }
            }
            anyClosedShapeFlag = false;
          }
        }
      }
    }
    // self.formCheckHandler(self.checkFormSaveReady());
  };
  this.loadAimJson = function (aimjson, isRecist) {
    //test
    // example test case const test = { circle : {count : 5, validate:""} , line:  {count : 5, validate:""}  };
    // console.log("show  test ", test);
    // console.log(test.hasOwnProperty('o'));
    // test['circle'].validate = 'ok';
    // console.log('new test', test);
    //test

    let aimjsonCopy = aimjson;
    self.loadingAimFlag = true;

    self.activateDirtyCheck = false;
    var templateIndex = self.mapTemplateCodeValueByIndex.get(
      aimjsonCopy.typeCode[0].code
    );

    if (typeof templateIndex === "undefined") {
      return 1;
    } else {
      self.templateSelect.selectedIndex = templateIndex + 1;
      let evObj = document.createEvent("Events");
      evObj.initEvent("change", true, true);
      self.templateSelect.dispatchEvent(evObj);

      var imagingObservationEntityCollection =
        aimjsonCopy.imagingObservationEntityCollection;
      var imagingPhysicalEntityCollection =
        aimjsonCopy.imagingPhysicalEntityCollection;
      var comment = aimjsonCopy.comment.value;
      var annotationName = aimjsonCopy.name.value;
      self.aimTypeCode = aimjsonCopy.typeCode;
      if (comment.includes("~")) {
        var commentArray = comment.split("~~");
        document.getElementById("comment").value = commentArray[1];
        self.aimComment = commentArray[1];
        var modality = commentArray[0].split("/");
        self.aimType = modality[0];
      } else {
        document.getElementById("comment").value = "";
        self.aimComment = "";
        self.aimType = "";
      }

      if (annotationName.includes("~")) {
        var annotationNameArray = annotationName.split("~");
        document.getElementById("annotationName").value =
          annotationNameArray[0];
        self.aimName = annotationNameArray[0];
        if (self.aimName === "Teaching File") {
          document.getElementById("annotationName").value = "";
        }
      } else {
        document.getElementById("annotationName").value = annotationName;
        self.aimName = annotationName;
        if (self.aimName === "Teaching File") {
          self.aimName = "";
          document.getElementById("annotationName").value = "";
        }
      }

      self.traverseJsonOnLoad(imagingPhysicalEntityCollection);

      self.traverseJsonOnLoad(imagingObservationEntityCollection);

      if (typeof isRecist === "undefined" || isRecist === null) {
        self.checkAnnotationShapes(aimjsonCopy.markupType);
      }

      self.loadingAimFlag = false;

      if (isRecist) {
        self.disableRecistSections();
      }
      self.isRecistFlag = false;
      return 0;
    }
  };

  this.disableRecistSections = function () {
    // disable for recist
    let recistAllChildNodes =
      document.getElementById("allowedTermType").childNodes;
    for (let cntRdios = 0; cntRdios < recistAllChildNodes.length; cntRdios++) {
      recistAllChildNodes[cntRdios].childNodes[0].disabled = true;
    }
    // document.getElementById(
    //   "allowedTermType"
    // ).parentElement.onclick = function (event) {
    //   //event.preventDefault();
    //   event.stopPropagation();
    // };

    // $(document.getElementById("allowedTermType").parentElement).on(
    //   "click",
    //   function (event) {
    //     // do something special here

    //     // then cancel event bubbling

    //     event.preventDefault();
    //     event.stopPropagation();
    //   }
    // );
    // $("#Type-S71").on("click", function (event) {
    //   // do something special here

    //   // then cancel event bubbling
    //   return false;
    //   event.preventDefault();
    //   event.stopPropagation();
    // });
    // $("#Type-S72").on("click", function (event) {
    //   // do something special here

    //   // then cancel event bubbling
    //   return false;
    //   event.preventDefault();
    //   event.stopPropagation();
    // });
    // $("#Type-S73").on("click", function (event) {
    //   // do something special here

    //   // then cancel event bubbling
    //   return false;
    //   event.preventDefault();
    //   event.stopPropagation();
    // });
    // $("#Type-S74").on("click", function (event) {
    //   // do something special here

    //   // then cancel event bubbling
    //   return false;
    //   event.preventDefault();
    //   event.stopPropagation();
    // });
    // $("#allowedTermType").on("change", function (event) {
    //   // do something special here

    //   // then cancel event bubbling
    //   return false;
    //   event.preventDefault();
    //   event.stopPropagation();
    // });
    // $("#allowedTermType").mousedown(function (event) {
    //   // do something special here

    //   // then cancel event bubbling
    //   return false;
    //   event.preventDefault();
    //   event.stopPropagation();
    // });
    // $("#allowedTermType").mouseup(function (event) {
    //   // do something special here

    //   // then cancel event bubbling
    //   return false;
    //   event.preventDefault();
    //   event.stopPropagation();
    // });
    let parentDivElementForLocation =
      document.getElementById("annotationName").parentElement;
    let parentDivElementForLocationClass =
      parentDivElementForLocation.className;
    let parentDivElementForLocationClassDisabled =
      parentDivElementForLocationClass + " disabled";
    parentDivElementForLocation.className =
      parentDivElementForLocationClassDisabled;

    let subDivElementForLocation =
      document.getElementById("DropLocation").childNodes[0];
    let subDivElementForLocationClass = subDivElementForLocation.className;
    let subDivElementForLocationClassDisabled =
      subDivElementForLocationClass + " disabled";
    subDivElementForLocation.className = subDivElementForLocationClassDisabled;
    // end disable for recist
  };

  this.addUid = function (jsonobj) {
    for (var key in jsonobj) {
      let innerjsonlength = jsonobj[key].length;
      if (innerjsonlength > 0) {
        let inobjcounter = 0;
        for (inobjcounter; inobjcounter < innerjsonlength; inobjcounter++) {
          if (jsonobj[key][inobjcounter].hasOwnProperty("label")) {
            let valueJson = self.mapLabelUid.get(
              jsonobj[key][inobjcounter]["typeCode"]["code"]
            );
            if (typeof valueJson !== "undefined") {
              jsonobj[key][inobjcounter].uniqueIdentifier = {
                root: valueJson.uid,
              };
            } else {
              jsonobj[key][inobjcounter].uniqueIdentifier = { root: uid() };
            }
          }
        }
      }
    }
  };

  this.replaceTagNamingHierarchy = function (aimJson) {
    let tempJson = {};
    let tempSubJson = {};
    let tempSubTwoJson = {};
    if (aimJson.hasOwnProperty("imagingPhysicalEntityCollection")) {
      tempJson = aimJson["imagingPhysicalEntityCollection"];

      //first check if there are chrachteristics under imagingPhysicalEntityCollection

      for (let i = 0; i < tempJson.length; i++) {
        if (
          tempJson[i].hasOwnProperty("imagingPhysicalCharacteristicCollection")
        ) {
          tempSubJson = tempJson[i]["imagingPhysicalCharacteristicCollection"];

          for (let k = 0; k < tempSubJson.length; k++) {
            if (
              tempSubJson[k].hasOwnProperty(
                "characteristicQuantificationCollection"
              )
            ) {
              tempSubTwoJson =
                tempSubJson[k]["characteristicQuantificationCollection"];
              delete tempSubJson[k].characteristicQuantificationCollection;
              tempSubJson[k].characteristicQuantificationCollection = {
                CharacteristicQuantification: tempSubTwoJson[0],
              };
            }
          }

          delete tempJson[i].imagingPhysicalCharacteristicCollection;
          tempJson[i].imagingPhysicalCharacteristicCollection = {
            imagingPhysicalCharacteristic: tempSubJson,
          };
        }
      }

      delete aimJson.imagingPhysicalEntityCollection;
      aimJson.imagingPhysicalEntityCollection = {
        ImagingPhysicalEntity: tempJson,
      };
    }
    if (aimJson.hasOwnProperty("imagingObservationEntityCollection")) {
      tempJson = aimJson["imagingObservationEntityCollection"];

      for (let i = 0; i < tempJson.length; i++) {
        if (
          tempJson[i].hasOwnProperty(
            "imagingObservationCharacteristicCollection"
          )
        ) {
          tempSubJson =
            tempJson[i]["imagingObservationCharacteristicCollection"];

          for (let k = 0; k < tempSubJson.length; k++) {
            if (
              tempSubJson[k].hasOwnProperty(
                "characteristicQuantificationCollection"
              )
            ) {
              tempSubTwoJson =
                tempSubJson[k]["characteristicQuantificationCollection"];
              delete tempSubJson[k].characteristicQuantificationCollection;
              tempSubJson[k].characteristicQuantificationCollection = {
                CharacteristicQuantification: tempSubTwoJson[0],
              };
            }
          }

          delete tempJson[i].imagingObservationCharacteristicCollection;
          tempJson[i].imagingObservationCharacteristicCollection = {
            ImagingObservationCharacteristic: tempSubJson,
          };
        }
      }

      delete aimJson.imagingObservationEntityCollection;
      aimJson.imagingObservationEntityCollection = {
        ImagingObservationEntity: tempJson,
      };
    }

    return aimJson;
  };

  this.printMap = function (varmap) {
    for (var [key, value] of varmap) {
    }
  };

  this.removeEmptySpace = function (removeFrom) {
    let retVal = removeFrom.replace(/\s/g, "");
    return retVal;
  };
  constructor();
};

//uid function needs to be imported from main library

function uid() {
  let uid = "2.25." + Math.floor(1 + Math.random() * 9);
  for (let index = 0; index < 38; index++) {
    uid = uid + Math.floor(Math.random() * 10);
  }
  return uid;
}

//new AimEditor(div as parameter)

//example form validation handler should be passed by aimeditor instance creator

function formCheckCall(myvar) {
  //myvar will hold the number of required fields which have to be filled
  //alert(myvar);
}

//test by creating aim editor instance, uncomment below section for test
/*
var instanceAimEditor = new AimEditor(document.getElementById("App"), formCheckCall);
instanceAimEditor.loadTemplates(templateArray);
instanceAimEditor.addButtonsDiv();
instanceAimEditor.createViewerWindow();

*/

/* usage 
   
   1-Create AimEditor instance
      -parameter: divid // div id in which aimeditor window will be created
      -parameter: formCheckCall // function to be passed to aimeditor to pass back the number of required fields.
         ex: divid = document.getElementById("onespecificdiv");
      var instanceAimEditor = new AimEditor(divid , formCheckCall);
   
   2-load templates 
   -paramter : templatesJsonArray
    ex: var templatesJsonArray = [{key : "RECIST v2" , value:RECIST_v2},{key : "Lung Nodule V2" , value:TempLungNoduleV2}, {key : "BeaulieuBoneTemplate_rev18" , value:TempBeaulieuBoneTemplaterev18},{key : "asdf" , value:TempAsdf}, {key : "coordinationTest", value:TempCoordinationTest},{key : "test 3", value:TempTest3} ];
      instanceAimEditor.loadTemplates(templatesJsonArray);
   
   3-show aimeditor
   instanceAimEditor.createViewerWindow();

   -save or load
   instanceAimEditor.loadAimJson(previouslySavedAimJsonObject);
   instanceAimEditor.saveAim();


*/

/*
   To Load previously saved aim 
      -paremeter: previouslySavedAimJsonObject

         instanceAimEditor.loadAimJson(previouslySavedAimJsonObject);

   will be added return error or success
*/

/*
   To save  aim 
      -paremeter: no parameter
      -returns aimJsonObject

      var returnValue = instanceAimEditor.saveAim();

   will be added return error or success
*/

/*
   To check if all necessary selections are selected use :
      -paremeter: no parameter
      -returns : 0 or pozitive number (pozitive number means there are expected answers dont'save)

      var returnValue = instanceAimEditor.checkFormSaveReady();


*/
