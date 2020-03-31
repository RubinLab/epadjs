// uncomment 2 imports below for react

import $ from "jquery/dist/jquery.js";
import "./semantic/semantic.css";
import "./semantic/semantic.js";

//export next variable for react
export var AimEditor = function(
  userWindow,
  varformCheckHandler,
  varRenderButtonHandler
) {
  //this.mapObjCodeValueParent = new Map();
  //this.mapHtmlObjects = new Map(); not used
  //this.mapHtmlSelectObjectsKeyValue = new Map(); not used
  // this.mapAllowedTermCollectionByCodeValue = new Map(); not used

  var self = this;
  this.fontcolor = "#c9cdd4";
  this.fontsize = "13px";
  this.fontweight = "1500";
  this.fontfamily = "Lato, Helvetica Neue, Arial, Helvetica, sans-serif;";
  this.renderButtonhandler = varRenderButtonHandler;
  this.formCheckHandler = varformCheckHandler;
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
  this.aimName = "";
  this.aimTypeCode = "";
  this.templateSelectedIndex = -1;
  var domelements = [];
  this.geoshapeidCounter = 0;

  var selectid = 0;
  this.mathOperators = new Map();
  this.mathOperators.set("Equal", "=");
  this.mathOperators.set("NotEqual", "!=");
  this.mathOperators.set("LessThan", "<");
  this.mathOperators.set("GreaterThan", ">");
  this.mathOperators.set("LessThanEqual", "<=");
  this.mathOperators.set("GreaterThanEqual", ">=");

  this.mapShapesSchemaToTemplate = new Map();
  this.mapShapesSchemaToTemplate.set("TwoDimensionPolyline", {
    formshape: "Polygon"
  });
  this.mapShapesSchemaToTemplate.set("TwoDimensionMultiPoint", [
    { formshape: "Line" },
    { formshape: "Perpendicular" }
  ]);
  this.mapShapesSchemaToTemplate.set("TwoDimensionPoint", {
    formshape: "Point"
  });
  this.mapShapesSchemaToTemplate.set("TwoDimensionCircle", {
    formshape: "Cirle"
  });

  this.templateShapeArray = []; //each array element is a json object {"shape":'Point', "domid" : '2.25.33554445511225454'});
  this.defaultTemplateJson = {
    TemplateContainer: {
      uid: "2.25.5886502342623758457547593170234",
      name: "example template",
      authors: "epad team",
      version: "1.0",
      creationDate: "2020-03-18",
      description:
        "This template is used to collect annotations for RECIST evaluation",
      "xsi:schemaLocation":
        "gme://caCORE.caCORE/3.2/edu.northwestern.radiology.AIMTemplate AIMTemplate_v2rv13.xsd",
      xmlns: "gme://caCORE.caCORE/3.2/edu.northwestern.radiology.AIMTemplate",
      "xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
      Template: [
        {
          uid: "2.25.14127115639382804046523562737575775778671",
          name: "example template",
          authors: "epad team",
          version: "1.0",
          creationDate: "2020-03-18",
          description: "Template used for RECIST measurements",
          codeMeaning: "Tumor assessment",
          codeValue: "example template",
          codingSchemeDesignator: "99EPAD",
          codingSchemeVersion: "1.0",
          Component: [
            {
              label: "Vessel side (if applicable)",
              itemNumber: 3,
              authors: "epaduser",
              explanatoryText: "Status of lesion",
              minCardinality: 1,
              maxCardinality: 1,
              shouldDisplay: true,
              annotatorConfidence: false,
              id: "2.25.436905441089.13054168484973.21324571207",
              ImagingObservation: {
                annotatorConfidence: false
              },
              AllowedTerm: [
                {
                  codeValue: "epadcdv_none",
                  codeMeaning: "None",
                  codingSchemeDesignator: "99EPAD"
                },
                {
                  codeValue: "epadcdv_left",
                  codeMeaning: "Left",
                  codingSchemeDesignator: "99EPAD"
                },
                {
                  codeValue: "epadcdv_right",
                  codeMeaning: "Right",
                  codingSchemeDesignator: "99EPAD",
                  codingSchemeVersion: "1.0"
                },
                {
                  codeValue: "epadcdv_midline",
                  codeMeaning: "Midline",
                  codingSchemeDesignator: "99EPAD",
                  codingSchemeVersion: "1.0"
                }
              ]
            }
          ]
        }
      ]
    }
  };
  self.annotationNames = [];
  function constructor() {
    if (self.arrayTemplates === "undefined") self.arrayTemplates = [];
  }

  this.arrayDifference = function(base, compareto) {
    let differences = [];
    for (var i = 0; i < base.length; i++) {
      if (!compareto.includes(base[i])) {
        differences.push(base[i]);
      }
    }

    return differences;
  };

  this.aimshortCutKeyEvent = function(e) {
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
    // console.log(keyvalue);

    if (self.mapShortCutKeys.get(keyvalue)) {
      // console.log("in" + keyvalue);
      // console.log(self.mapShortCutKeys.get(keyvalue));

      document.getElementById(self.mapShortCutKeys.get(keyvalue)).click();
    }
  };

  this.removeKeyShortCutEvent = function() {
    document
      .getElementById("root")
      .removeEventListener("keydown", self.aimshortCutKeyEvent);
  };

  this.loadTemplates = function(templateList) {
    console.log("template list ::: --->", templateList);
    self.arrayTemplatesJsonObjects = templateList;
    if (self.arrayTemplatesJsonObjects.length > 0) {
      for (var i = 0; i < self.arrayTemplatesJsonObjects.length; i++) {
        var object = {};
        object.codeValue =
          self.arrayTemplatesJsonObjects[i].TemplateContainer.Template[0][
            "codeValue"
          ];
        object.arrayIndex = i;
        self.mapTemplateCodeValueByIndex.set(object.codeValue, i);
      }
    }
  };

  this.createViewerWindow = function() {
    //var x = document.createElement("INPUT");
    //x.setAttribute("type", "file");
    //x.addEventListener('change', self.readx, false);

    self.mainWindowDiv = document.createElement("div");

    // below section needs to be uncommented for testing purpose
    //self.mainButtonsDiv = document.createElement('div');
    //this.addButtons(this.mainWindowDiv);
    //this.mainWindowDiv.appendChild(x);
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
    self.mainWindowDiv.appendChild(self.shapeDiv);
    self.mainWindowDiv.appendChild(self.accordion1Div);
    //self.mainWindowDiv.appendChild(accordion2Div);

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
      templateOption.value = i;
      templateOption.text =
        self.arrayTemplatesJsonObjects[i].TemplateContainer.Template[0].name;
      //templateOption.innerHTML = this.arrayTemplatesJsonObjects[i].key;
      self.templateSelect.appendChild(templateOption);
    }

    // var lblTxt = document.createTextNode("Select template:");

    self.templateListDiv.appendChild(self.templateSelect);
    self.userWindow.appendChild(self.mainWindowDiv);

    self.templateSelect.onchange = function() {
      self.aimComment = "";
      self.aimName = "";
      self.aimType = "";
      self.aimTypeCode = "";
      self.templateSelectedIndex = this.value;

      self.jsonTemplateCopy = "";
      self.accordion1Div.innerHTML = "";
      self.shapeDiv.innerHTML = "";
      //uncomment below line for testing
      //self.mainButtonsDiv.innerHTML = "";

      self.mapCardinalitiesToCheckId = new Map();
      self.mapStatusAllowedTermBlocks = new Map();
      //self.mapHtmlObjects = new Map(); not used
      //self.mapHtmlSelectObjectsKeyValue = new Map(); not used
      //self.mapAllowedTermCollectionByCodeValue = new Map(); not used
      //self.mapTemplateCodeValueByIndex = new Map();
      self.mapLabelAnnotatorConfidence = new Map();
      self.mapLabelAnnotConfJson = new Map();
      self.mapLabelSubComment = new Map();
      self.mapLabelCommentJson = new Map();
      self.mapLabelUid = new Map();
      if (self.templateSelectedIndex > -1) {
        self.jsonTemplateCopy = self.arrayTemplatesJsonObjects[this.value];
        self.extractTemplate(self.jsonTemplateCopy);
        self.renderButtonhandler(true);
      } else {
        self.renderButtonhandler(false);
      }
    };
    $('select[class^="ui dropdown"]').dropdown();
    document.getElementById("tlist").children[0].style.width = "100%";
    self.templateSelect.style.width = "100%";
    templateDiv.style.width = "100%";
  };

  // below the function to use to switch the annotation name to a dropdown list
  this.createViewerWindowWithNamesAsDropDown = function() {
    //var x = document.createElement("INPUT");
    //x.setAttribute("type", "file");
    //x.addEventListener('change', self.readx, false);
    self.templateSelectedIndex = 1;
    self.annotationNames = [
      {
        text: "Width (Working Projection)",
        value: "Width (Working Projection)"
      },
      {
        text: "Height (Working Projection)",
        value: "Height (Working Projection)"
      },
      {
        text: "Neck (Working Projection)",
        value: "Neck (Working Projection)"
      },
      {
        text: "--------------------------------------------------------",
        value: "--------------------------------------------------------"
      },
      {
        text: "Width (Orthogonal Projection)",
        value: "Width (Orthogonal Projection)"
      },
      {
        text: "Height (Orthogonal Projection)",
        value: "Height (Orthogonal Projection)"
      },
      {
        text: "Neck (Orthogonal Projection)",
        value: "Neck (Orthogonal Projection)"
      },
      {
        text: "--------------------------------------------------------",
        value: "--------------------------------------------------------"
      },

      { text: "1. Basilar aneurysm ", value: "Basilar aneurysm " },

      {
        text: "1.1. Parent vessel – Basilar artery",
        value: "Parent vessel – Basilar artery"
      },
      {
        text: "1.2. Daughter branches of relevance",
        value: "Daughter branches of relevance"
      },
      {
        text: "1.2.1. Left Posterior Cerebral Artery (PCA)",
        value: "Left Posterior Cerebral Artery (PCA)"
      },
      {
        text: "1.2.2. Right Posterior Cerebral Artery (PCA)",
        value: "Right Posterior Cerebral Artery (PCA)"
      },
      {
        text: "----",
        value: "---"
      },
      { text: "2. MCA aneurysm", value: "MCA aneurysm" },
      {
        text: "2.1. Parent vessel – Middle cerebral Artery (MCA) M1 branch",
        value: "Parent vessel – Middle cerebral Artery (MCA) M1 branch"
      },
      {
        text: "2.2. Daughter branches of relevance",
        value: "Daughter branches of relevance"
      },
      {
        text: "2.2.1. MCA M2 superior branch",
        value: "MCA M2 superior branch"
      },
      {
        text: "2.2.2. MCA M2 inferior branch",
        value: "MCA M2 inferior branch"
      },
      {
        text: "----",
        value: "---"
      },
      { text: "3. AComm aneurysm", value: "3. AComm aneurysm" },
      {
        text: "3.1. Parent vessel – Anterior Cerebral Artery (ACA) A1 branch",
        value: "Parent vessel – Anterior Cerebral Artery (ACA) A1 branch"
      },
      {
        text: "3.2. Daughter branches of relevance",
        value: "Daughter branches of relevance"
      },
      {
        text: "3.2.1. ACA A2 ipsilateral branch",
        value: "ACA A2 ipsilateral branch"
      },
      {
        text: "3.2.2. ACA A2 contralateral branch",
        value: "ACA A2 contralateral branch"
      },
      {
        text: "----",
        value: "---"
      },
      { text: "4. ICA Terminus aneurysm", value: "4. ICA Terminus aneurysm" },
      {
        text: "4.1. Parent vessel – Internal Carotid Artery (ICA)",
        value: "Parent vessel – Internal Carotid Artery (ICA)"
      },
      {
        text: "4.2. Daughter branches of relevance",
        value: "Daughter branches of relevance"
      },
      {
        text: "4.2.1. MCA – M1",
        value: "MCA – M1"
      },
      {
        text: "4.2.2. ACA – A1",
        value: "ACA – A1"
      },

      {
        text: "--------------------------------------------------------",
        value: "--------------------------------------------------------"
      },
      { text: "Other", value: "Other" },
      {
        text: "--------------------------------------------------------",
        value: "--------------------------------------------------------"
      }
    ];
    self.mainWindowDiv = document.createElement("div");
    self.userWindow.innerHTML = "";
    // below section needs to be uncommented for testing purpose
    //self.mainButtonsDiv = document.createElement('div');
    //this.addButtons(this.mainWindowDiv);
    //this.mainWindowDiv.appendChild(x);
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
    let labelAnnotationName = document.createElement("label");
    labelAnnotationName.textContent = "Annotation";
    self.mainWindowDiv.appendChild(labelAnnotationName);
    self.mainWindowDiv.appendChild(self.templateListDiv);
    self.mainWindowDiv.appendChild(self.shapeDiv);
    self.mainWindowDiv.appendChild(self.accordion1Div);
    //self.mainWindowDiv.appendChild(accordion2Div);

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
    templateOption.value = "Select an option";
    templateOption.text = "Select an option";
    self.templateSelect.appendChild(templateOption);

    self.annotationNames.forEach(nameobject => {
      let templateOption = document.createElement("option");
      templateOption.value = nameobject.value;
      templateOption.text = nameobject.text;
      templateOption.style.paddingLeft = "100px";
      //templateOption.innerHTML = this.arrayTemplatesJsonObjects[i].key;
      self.templateSelect.appendChild(templateOption);
      //let optGroup = document.createElement("optgroup");
      //optGroup.label = "opt grp";
      //optGroup.appendChild(templateOption);
      //self.templateSelect.appendChild(optGroup);
    });

    // var lblTxt = document.createTextNode("Select template:");

    self.templateListDiv.appendChild(self.templateSelect);
    self.userWindow.appendChild(self.mainWindowDiv);
    self.aimComment = "";
    self.aimName = "";
    self.aimType = "";
    self.aimTypeCode = "";

    self.jsonTemplateCopy = "";
    self.accordion1Div.innerHTML = "";
    self.shapeDiv.innerHTML = "";
    self.mapCardinalitiesToCheckId = new Map();
    self.mapStatusAllowedTermBlocks = new Map();

    self.mapLabelAnnotatorConfidence = new Map();
    self.mapLabelAnnotConfJson = new Map();
    self.mapLabelSubComment = new Map();
    self.mapLabelCommentJson = new Map();
    self.mapLabelUid = new Map();
    self.templateSelect.onchange = function() {
      self.aimName = this.value;
    };
    self.jsonTemplateCopy = self.defaultTemplateJson;
    self.extractTemplate(self.jsonTemplateCopy);
    self.renderButtonhandler(true);
    $('select[class^="ui dropdown"]').dropdown();
    document.getElementById("tlist").children[0].style.width = "100%";
    self.templateSelect.style.width = "100%";
    templateDiv.style.width = "100%";
  };

  this.extractTemplate = function(json) {
    var a = 0;

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

    // var labelAnnotationName = document.createElement("label");

    // labelAnnotationName.textContent = "Annotation Name";
    // var labelAnnotationNameInput = document.createElement("INPUT");
    // labelAnnotationNameInput.style.fontFamily = self.fontfamily;
    // labelAnnotationNameInput.style.fontSize = "14px";
    // labelAnnotationNameInput.style.paddingLeft = "2px";
    // //labelAnnotationNameInput.style.fontWeight = "1000";
    // labelAnnotationNameInput.style.lineHeight = "14px";
    // labelAnnotationNameInput.style.width = "100%";

    // labelAnnotationNameInput.onkeyup = function() {
    //   self.aimName = this.value;
    // };

    // labelAnnotationNameInput.setAttribute("type", "text");
    // labelAnnotationNameInput.id = "annotationName";

    // annotationNameDiv.appendChild(labelAnnotationName);
    // annotationNameDiv.appendChild(labelAnnotationNameInput);
    // annotationNameLabelDiv.appendChild(labelAnnotationName);
    // annotationNameDiv.className = "comment ui input";
    // annotationNameDiv.style.width = "100%";

    var label = document.createElement("label");
    annotationNameLabelDiv.className = "comment";
    annotationNameLabelDiv.style.paddingTop = "10px";
    label.textContent = "Comment";
    labelDiv.className = "comment";
    labelDiv.style.paddingTop = "10px";
    //commentDiv.className = "comment";

    var textareaDomObject = document.createElement("textarea");
    labelDiv.appendChild(label);
    textareaDomObject.id = "comment";
    textareaDomObject.style.color = "black";
    textareaDomObject.style.width = "100%";

    commentDiv.appendChild(textareaDomObject);

    textareaDomObject.onkeyup = function() {
      self.aimComment = this.value;
    };

    self.aimTypeCode = [
      {
        code: json.TemplateContainer.Template[0].codeValue,
        codeSystemName:
          json.TemplateContainer.Template[0].codingSchemeDesignator,
        "iso:displayName": {
          "xmlns:iso": "uri:iso.org:21090",
          value: json.TemplateContainer.Template[0].codeMeaning
        }
      }
    ];

    document.getElementById("accordion1").appendChild(annotationNameLabelDiv);
    document.getElementById("accordion1").appendChild(annotationNameDiv);
    //// removed for annot name drop down //// document.getElementById("accordion1").appendChild(labelDiv);
    //// removed for annot name drop down //// document.getElementById("accordion1").appendChild(commentDiv);
    //end adding comment textarea for the template
    var a = 0;
    for (var i = 0; i < arrayLength; i++) {
      a++;
      if (isArray === 1)
        component = json.TemplateContainer.Template[0].Component[i];
      else component = json.TemplateContainer.Template[0].Component;

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
      //  headerCheckIcon.id = (component.id).replace(/[.*+?^${}()|[\]\\]/g, '');
      headerCheckIcon.id = component.id;
      document.getElementById("accordion1").appendChild(componentDiv);

      var incontentDiv = document.createElement("div");
      incontentDiv.className = "content active";
      incontentDiv.id = ComponentDivId;

      componentDiv.appendChild(headerDiv);
      //icon cav
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
        subTag: []
      };

      components.push({
        component: compObj
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

    //uncomment below line for testing
    //self.mainButtonsDiv.innerHTML = "";
    //self.addButtons(self.mainButtonsDiv);
    $('select[class^="ui dropdown"]').dropdown();
    $(".ui.accordion").accordion();
    self.formCheckHandler(self.checkFormSaveReady());
    ////added here for annot name drop down
    document.getElementById("accordion1").appendChild(labelDiv);
    document.getElementById("accordion1").appendChild(commentDiv);
  };

  this.QuestionType = function(
    parent,
    object,
    parentDiv,
    mapTagArray,
    parentTagTypeFromJson
  ) {};

  this.Calculation = function(
    parent,
    object,
    parentDiv,
    mapTagArray,
    parentTagTypeFromJson
  ) {};
  this.CalculationType = function(
    parent,
    object,
    parentDiv,
    mapTagArray,
    parentTagTypeFromJson
  ) {};

  this.Inference = function(
    parent,
    object,
    parentDiv,
    mapTagArray,
    parentTagTypeFromJson
  ) {};

  this.textFreeInput = function(
    parent,
    object,
    parentDiv,
    mapTagArray,
    parentTagTypeFromJson
  ) {
    //var textareaDomObject = document.createElement("textarea");
    //parentDiv.appendChild(textareaDomObject);
  };

  this.ValidTerm = function(
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

    //checkAnnotatorConfidence(parentDiv,object);
    var ValidTerm = [];
    var i = 0;
    //console.log("array length", arrayLength);
    for (i = 0; i < arrayLength; i++) {
      var subEObject = null;
      if (isArray === 1) {
        subEObject = object[i];
      } else {
        subEObject = object;
      }
      //console.log("undefined object", subEObject);
      var ValidTermObj = {
        type: "ValidTerm",
        codeValue: subEObject.codeValue,
        codeMeaning: subEObject.codeMeaning,
        primitiveObj: subEObject,
        primitiveObjATSparent: ATparent,
        primitiveObjATS: ATobject,
        syntheticObjATS: ATallowedTermObj,
        changeOnSelect: function(newValue, callback) {
          this.select = newValue;
          this.primitiveObj.select = newValue;
        },
        callParentObj: function() {
          return this.ATparent;
        },
        getPrimitive: function() {
          return this.primitiveObj;
        },
        id: subEObject.id,
        subTag: [],
        select: "0"
      };

      ValidTerm.push({
        ValidTerm: ValidTermObj
      });

      var control = "";
      if (ATparent.minCardinality == 1 && ATparent.maxCardinality == 1) {
        control = "radioBtn";
      }
      var allowTermText = parent.codeMeaning;
      var selectHolder;
      //console.log("valid term section : parent", parent); //editing

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

  this.GeometricShape = function(
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
      subTag: []
    };
    mapTagArray.push({
      GeometricShape: Obj
    });

    var GSDiv = document.createElement("div");
    self.geoshapeidCounter++;
    GSDiv.id = "geoshape" + self.geoshapeidCounter;
    GSDiv.className = "mylbl";
    //GSDiv.style.width = '200px';
    // GSDiv.style.height = '20px';
    // GSDiv.style.backgroundColor = 'white';
    //GSDiv.style.color = 'black';
    GSDiv.innerHTML = "Required shape : " + object.GeometricShape;
    parentDiv.appendChild(GSDiv);
    // console.log("shape " + JSON.stringify(object.id));
    self.templateShapeArray.push({
      shape: object.GeometricShape,
      domid: object.id
    });
    //document.getElementById( object.id).className = "green check circle outline icon";
  };

  this.AllowedTerm = function(
    parent,
    object,
    parentDiv,
    mapTagArray,
    parentTagTypeFromJson
  ) {
    //console.log("allowed term object", parent);
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
    //uiAccordionDiv.style.fontWeight = self.fontweight; //editing
    titleDiv.style.fontSize = self.fontsize; //editing
    var titleI = document.createElement("i");
    titleI.className = "dropdown icon";
    var contentDiv = document.createElement("div");
    //iconcav
    var iconI = document.createElement("i");
    iconI.id = parent.id;
    if (parent.minCardinality <= "0") {
      iconI.className = "green check circle outline icon";
      var varOk = "true";
    } else {
      iconI.className = "red check circle outline icon";
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

    var mainSelectDiv = document.createElement("div");
    mainSelectDiv.className = "ui container";
    mainSelectDiv.id = "Drop" + maindiv;

    var selectDiv = document.createElement("select");
    selectDiv.className = "ui fluid multiple dropdown";
    //selectDiv.multiple=true;
    selectDiv.id = "select" + maindiv;

    domelements[maindiv] = new Array(6);
    domelements[maindiv]["id"] = maindiv;
    domelements[maindiv]["label"] = parent.label;
    domelements[maindiv]["min"] = parent.minCardinality;
    domelements[maindiv]["max"] = parent.maxCardinality;
    domelements[maindiv]["selectedCnt"] = 0;
    domelements[maindiv]["selectVerification"] = false;

    let compObj = {
      id: parent.id,
      min: parent.minCardinality,
      max: parent.maxCardinality,
      label: parent.label,
      actualSelected: 0,
      ok: varOk
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
      //add global array
      var NextId = "0";

      //subEObject.cavit = "added by"
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
        changeOnSelect: function(newValue, callback) {
          this.select = newValue;
          this.primitiveObj.select = newValue;
        },
        callParentObj: function() {
          return this.parentObj;
        },
        getPrimitive: function() {
          return this.primitiveObj;
        },
        select: "0",
        subTag: []
      };

      let unionPrntAlwtermObj = {
        parant: parent,
        allowterm: allowedTermObj
      };
      // this.mapAllowedTermCollectionByCodeValue.set(
      //   allowedTermObj.codeValue,
      //   unionPrntAlwtermObj
      // ); not used
      AllowedTerm.push({
        AllowedTerm: allowedTermObj
      });

      //add global array
      //mapTagArray.push( subEObject.codeMeaning);

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

      var el = domelements[domelements.length - 1];
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
      onChange: function(val, text) {
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
      }
    });
  };

  this.ImagingObservation = function(
    parent,
    object,
    parentDiv,
    mapTagArray,
    parentTagTypeFromJson
  ) {
    var _self = this;
    self.checkAnnotatorConfidence(parentDiv, object);
    self.checkIfCommentRequired(object, parentDiv);
    //add global array
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
        subTag: []
      };

      ImagingObservation.push({
        ImagingObservation: ImagingObservationObj
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
        ImagingObservation: ImagingObservation
      });
    }
  };

  this.ImagingObservationCharacteristic = function(
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

    //console.log(JSON.stringify(object));
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
        selected: 0
      };

      ImagingObservationCharacteristic.push({
        ImagingObservationCharacteristic: ImagingObservationCharacteristicObj
      });

      for (var key in subEObject) {
        if (typeof subEObject[key] == "object") {
          //console.log("____________"+key);
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
      ImagingObservationCharacteristic: ImagingObservationCharacteristic
    });
  };

  this.CharacteristicQuantification = function(
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
        selected: 0
      };
      CharacteristicQuantification.push({
        CharacteristicQuantification: CharacteristicQuantificationObj
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
        CharacteristicQuantification: CharacteristicQuantification
      });
    }
  };

  this.AnatomicEntity = function(
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

  this.AnatomicEntityCharacteristic = function(
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

  this.annotatorConfidence = function(
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

  this.Scale = function(
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
      console.log("scale checking object", parent);
    }
    self.checkAnnotatorConfidence(parentDiv, parent);
  };

  this.ScaleLevel = function(
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
    quantileSelect.addEventListener("change", function() {
      var i = 0;
      var scaleArraysize = object.length;
      for (i = 0; i < scaleArraysize; i++) {
        if (object[i].valueLabel == this.value) {
          object[i].select = "1";
          //self.mapHtmlSelectObjectsKeyValue.set(this.value, quantileSelect.id); not used
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
    //self.checkAnnotatorConfidence(parentDiv,object);
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

  this.Numerical = function(
    parent,
    object,
    parentDiv,
    mapTagArray,
    parentTagTypeFromJson
  ) {
    console.log("numerical parent :", "Select" + parent.name);
    var arrayLength = -1;
    var quantileDiv = document.createElement("div");
    quantileDiv.className = "mylbl";
    var quantileSelect = document.createElement("select");
    quantileSelect.className = "ui dropdown mylbl";
    selectid++;
    quantileSelect.id = "Select" + parent.name;
    quantileSelect.addEventListener("change", function() {
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
    //self.checkAnnotatorConfidence(parentDiv, object);
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

  this.Quantile = function(
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
    //self.checkAnnotatorConfidence(parentDiv, object);
    for (var i = 0; i < arrayLength; i++) {
      if (isArray === 1) subEObject = object[i];
      else subEObject = object;
      for (var key in subEObject) {
        if (typeof subEObject[key] == "object") {
          self[key](subEObject, subEObject[key], parentDiv, mapTagArray, null);
        }
      }
      console.log("each quantile ", subEObject);
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

      quantileSelect.addEventListener("change", function() {
        var i = 0;
        var scaleArraysize = object.length;
        console.log("quatile on select : ", object);
        object.selectedBin = this.selectedIndex + 1;
        object.select = 1;
        object.valueLabel = this.options[this.selectedIndex].value;
        // for (i = 0; i < scaleArraysize; i++) {
        //   var createFormValue =
        //     self.mathOperators.get(object[i].operator) +
        //     " " +
        //     object[i].valueLabel +
        //     " " +
        //     object[i].ucumString;

        //   if (createFormValue == this.value) object[i].select = "1";
        //   else object[i].select = "0";
        // }
      });
    }
    self.checkAnnotatorConfidence(parentDiv, parent);
  };

  this.Interval = function(
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
    //self.checkAnnotatorConfidence(parentDiv, object);
    var intervalDiv = document.createElement("div");
    intervalDiv.className = "mylbl";
    var intervalSelect = document.createElement("select");
    intervalSelect.className = "ui dropdown mylbl";

    selectid++;
    intervalSelect.id = "Select" + parent.name;
    intervalSelect.addEventListener("change", function() {
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

  this.NonQuantifiable = function(
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
    quantileSelect.addEventListener("change", function() {
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
    //self.checkAnnotatorConfidence(parentDiv, object);
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

  this.createRadio = function(
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
    //div.style.fontsize = self.fontsize;
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

    radioInput.onclick = function() {
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
      console.log("next id catched", allowedTermObj.nextId);
      if (checkmarkObj.actualSelected >= checkmarkObj.min)
        document.getElementById(checkmarkObj.id).className =
          "green check circle outline icon";
      if (allowedTermObj.nextId != "0") {
        console.log("next id catched", allowedTermObj.nextId);
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

      if (allowedTermObj.getPrimitive().noMoreQuestions == true) {
        console.log("nomore question situation : === true");
        self.DisableTillNext(prObject.id, "tillend", self.callDisable);
      }
      console.log(allowedTermObj);
      self.formCheckHandler(self.checkFormSaveReady());
    };

    this.getelementHtml = function() {
      return div;
    };
    //self.mapHtmlObjects.set(allowedTermObj.codeValue, radioInput); not used
  };
  this.createRadioVT = function(
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

    radioInput.onclick = function() {
      prObject.select = "1";
      var getAllowTGroup = validTermObj.primitiveObjATSparent;
      var getAllowTGroupSize = getAllowTGroup.AllowedTerm.length;
      var i = 0;
      //console.log("gettin alowed terms", getAllowTGroup);
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

      self.formCheckHandler(self.checkFormSaveReady());
    };

    //document.addEventListener('click', this.check.bind(this) );

    this.getelementHtml = function() {
      return div;
    };

    //self.mapHtmlObjects.set(allowedTermObj.codeValue, radioInput); not used
  };

  this.createOption = function(
    prObject,
    id,
    name,
    className,
    checked,
    lbl,
    allowedTermObj
  ) {
    //drop down select and add input box object

    //this.id = id.replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, '');

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
    //div.appendChild(radioInput);

    div.appendChild(optionInput);
    optionInput.appendChild(square);
    optionInput.appendChild(labelHolder);
    labelHolder.appendChild(label);

    optionInput.addEventListener("click", function() {
      console.log("next id", allowedTermObj.nextId);
      console.log("clicked situation", this.selected);
      var checkmarkObj = self.mapCardinalitiesToCheckId.get(prObject.id);
      checkmarkObj.ok = "true";

      if (allowedTermObj.getPrimitive().select == "1") {
        allowedTermObj.getPrimitive().select = "0";
        allowedTermObj.changeOnSelect("0", self.AfterClick(allowedTermObj));
        checkmarkObj.actualSelected--;
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
      else
        document.getElementById(prObject.id).className =
          "red check circle outline icon";

      //disable enable component seection
      if (allowedTermObj.nextId != "0" && this.selected == true) {
        console.log("next id catched", allowedTermObj.nextId);
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

      if (allowedTermObj.getPrimitive().noMoreQuestions == true) {
        if (this.checked == true) {
          console.log("nomore question situation : === true");
          self.DisableTillNext(prObject.id, "tillend", self.callDisable);
        } else {
          console.log("nomore question situation : === true");
          self.EnableTillNext(prObject.id, "tillend");
        }
      }

      self.formCheckHandler(self.checkFormSaveReady());
    });

    this.getelementHtml = function() {
      return optionInput;
    };
  };

  this.createOptionVT = function(
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

    optionInput.addEventListener("click", function() {
      var checkmarkObj = self.mapCardinalitiesToCheckId.get(vtPrObject.id);
      checkmarkObj.ok = "true";

      if (validTermObj.getPrimitive().select == "1") {
        prObject.select = "0";
        //allowedTermObj.getPrimitive().select ='0';
        validTermObj.getPrimitive().select = "0";
        //allowedTermObj.changeOnSelect('0',self.AfterClick(allowedTermObj));
        checkmarkObj.actualSelected--;
      } else {
        prObject.select = "1";
        //allowedTermObj.getPrimitive().select ='1';
        validTermObj.getPrimitive().select = "1";
        //allowedTermObj.changeOnSelect('1',self.AfterClick(allowedTermObj));
        checkmarkObj.actualSelected++;
      }

      self.mapCardinalitiesToCheckId.set(vtPrObject.id, checkmarkObj);
      if (
        checkmarkObj.actualSelected >= checkmarkObj.min &&
        checkmarkObj.actualSelected <= checkmarkObj.max
      )
        document.getElementById(vtPrObject.id).className =
          "green check circle outline icon";
      else
        document.getElementById(vtPrObject.id).className =
          "red check circle outline icon";
      self.formCheckHandler(self.checkFormSaveReady());
    });

    this.getelementHtml = function() {
      return optionInput;
    };
  };

  this.createCheckbox = function(
    prObject,
    id,
    name,
    className,
    value,
    lbl,
    allowedTermObj
  ) {
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
    // document.getElementById(this.par).appendChild(div);
    this.getelementHtml = function() {
      return div;
    };
    let nextIdExist = false;
    let nomoreQuestionExist = false;
    checkbox.onclick = function() {
      console.log("check box parent :", prObject);
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

      // let allowedTermGroup = prObject.AllowedTerm;
      // let clickedAllowedTermIndex = -1;
      // for (let i = 0; i < allowedTermGroup.length; i++) {
      //   console.log(allowedTermGroup[i].select);
      //   if (allowedTermGroup[i].codeValue == allowedTermObj.codeValue) {
      //     clickedAllowedTermIndex = i;
      //   }
      //   //Do something
      // }

      //disable enable component seection
      if (allowedTermObj.nextId != "0" && checkbox.checked == true) {
        console.log("next id catched", allowedTermObj.nextId);
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

      if (allowedTermObj.getPrimitive().noMoreQuestions == true) {
        if (this.checked == true) {
          console.log("nomore question situation : === true");
          self.DisableTillNext(prObject.id, "tillend", self.callDisable);
        } else {
          console.log("nomore question situation : === true");
          self.EnableTillNext(prObject.id, "tillend");
        }
      }

      self.formCheckHandler(self.checkFormSaveReady());
    };
  };

  this.createCheckboxVT = function(
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
    // document.getElementById(this.par).appendChild(div);
    this.getelementHtml = function() {
      return div;
    };

    checkbox.onclick = function() {
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
      else
        document.getElementById(vtPrObject.id).className =
          "red check circle outline icon";

      self.formCheckHandler(self.checkFormSaveReady());
    };
  };

  this.checkValidationTosave = function() {
    for (var property1 in domelements) {
      if (domelements[property1]["selectVerification"] == true)
        console.log("true");
      else console.log("false");
    }
  };
  this.checkAnnotatorConfidence = function(prentDiv, objectToCheckAnnConf) {
    console.log("checking annotator confidence for : ", objectToCheckAnnConf);
    let isMouseButtondown = false;
    if (typeof objectToCheckAnnConf.annotatorConfidence != "undefined") {
      // Assign value to the property here
      if (
        objectToCheckAnnConf.hasOwnProperty("label") ||
        objectToCheckAnnConf.hasOwnProperty("name")
      ) {
        if (objectToCheckAnnConf.annotatorConfidence == true) {
          //console.log("after selecting template"+objectToCheckAnnConf.label);

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
          //console.log(rangeid);
          var annotConfDiv = document.createElement("div");
          var annotConfInput = document.createElement("input");
          annotConfInput.setAttribute("id", "range" + rangeid);
          annotConfInput.setAttribute("type", "range");
          annotConfInput.setAttribute("min", "0");
          annotConfInput.setAttribute("max", "100");
          annotConfInput.setAttribute("start", "0");
          annotConfInput.setAttribute("input", "inputRange" + rangeid);
          annotConfInput.value = 0;

          annotConfInput.onchange = function() {
            annotConfShowValueInput.value = this.value;
            objectToCheckAnnConf.selectac = this.value / 100;
          };
          annotConfInput.onmousedown = function(event) {
            isMouseButtondown = true;
          };
          annotConfInput.onmouseup = function(event) {
            isMouseButtondown = false;
          };
          annotConfInput.onmousemove = function(event) {
            if (isMouseButtondown) {
              annotConfShowValueInput.value = this.value;
              objectToCheckAnnConf.selectac = this.value / 100;
              console.log(event.clientX);
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
          //loadButton.appendChild(loadButtonText);
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
  this.DisableTillNext = function(actualid, nextid, call) {
    console.log("disable next called", nextid);
    let nextControl = 0;
    for (var [key, value] of self.mapCardinalitiesToCheckId) {
      if (key == actualid) {
        nextControl = 1;
        let object = {
          startid: key,
          endid: nextid,
          status: "disabled"
        };
        self.mapStatusAllowedTermBlocks.set(key, object);
      } else if (nextControl == 1) {
        if (key != nextid) {
          disabledefined.push(key);
          document.getElementById(key).className =
            "blue check circle outline icon";
          let ely = document.getElementById(key).parentNode;
          console.log("disabling", ely.parentnode);
          //$(ely.parentNode).dropdown({action: 'hide'});
          $(ely.parentNode).hide();
        } else nextControl = 0;
      }
    }
    call();
  };

  this.EnableTillNext = function(actualid, nextid) {
    let nextControl = 0;
    for (var [key, value] of self.mapCardinalitiesToCheckId) {
      if (key == actualid) {
        nextControl = 1;
        let object = {
          startid: key,
          endid: nextid,
          status: "active"
        };
        self.mapStatusAllowedTermBlocks.set(key, object);
      } else if (nextControl == 1) {
        if (key != nextid) {
          disabledefined.push(key);
          document.getElementById(key).className =
            "green check circle outline icon";
          let ely = document.getElementById(key).parentNode;
          console.log("enabling", ely.parentNode);
          $(ely.parentNode).show();
        } else nextControl = 0;
      }
    }
    self.callDisable();
  };
  this.callDisable = function() {
    for (var [key, value] of self.mapStatusAllowedTermBlocks) {
      //console.log("mapStatusAllowedTermBlocks" + key + ' = ' + JSON.stringify(value));
    }
  };

  this.solveAim = function(object, son) {
    //extracts components from object (maptag)
    let componentSize = object.length;
    var i;
    for (i = 0; i < componentSize; i++) {
      self.solveAimCompnent(object[i][0]);
    }
  };

  this.solveAimCompnent = function(object) {};

  this.AfterClick = function(obj) {
    //alert():
  };

  this.printXmlAim = function(data, xmlArray) {
    var oSerializer = new XMLSerializer();
    var sXML = oSerializer.serializeToString(data);

    // // console.log(
    //   "..................................................aim Saved data" +
    //     JSON.stringify(sXML)
    // );
    for (var i = 0; i < xmlArray.length; i++) {
      var arrayXML = oSerializer.serializeToString(xmlArray[i].value);
      //console.log("..................................................xml array data" + (JSON.stringify(arrayXML)));
    }
  };
  //load aim
  /*
   this.loadAim = function (aimFileXml) {



      //document.getElementById("S1").selectedIndex = 11;
      // $('#S1').trigger("change");
      $('document').ready(function () {
         if (aimFileXml == "") {
            aimFileXml = self.textXml;

         } else {
            self.textXml = aimFileXml;

         }


         var evObj = document.createEvent('Events');
         evObj.initEvent("click", true, true);


         var parser = new window.DOMParser();
         var xmlDoc = parser.parseFromString(self.textXml, "text/xml");

         //get Template code value to select the correct template for the aim
         var templateNameImageAnnotations = xmlDoc.getElementsByTagName("imageAnnotations");
         var templateNameImageAnnotation = templateNameImageAnnotations[0].getElementsByTagName("typeCode");
         var templateCodeValue = templateNameImageAnnotation[0].getAttribute("code");


         //end check codevalue from aim
         var templateIndex = self.mapTemplateCodeValueByIndex.get(templateCodeValue);

         self.templateSelect.selectedIndex = templateIndex + 1;
         self.extractTemplate(self.arrayTemplatesJsonObjects[templateIndex].value);

         var typeCodeCollection = xmlDoc.getElementsByTagName("typeCode");
         for (var i = 0; i < typeCodeCollection.length; i++) {

            let codeValue = typeCodeCollection[i].getAttribute("code");
            let allowedTermObj = self.mapAllowedTermCollectionByCodeValue.get(codeValue);


            var docElement = document.getElementById(codeValue);
            if (docElement != null) {
               var parentDiv = docElement.parentNode;

               if (typeof parentDiv[0] != "undefined") {


                  var crop = parentDiv[0].name;
                  crop = (crop).replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>/ /\{\}\[\]\\\/]/gi, '');

                  var prDiv = document.getElementById("Drop" + crop);
                  var subDivs = prDiv.getElementsByTagName("div");

                  var splittedLabel = docElement.label.split("-");
                  $(subDivs[0]).dropdown({ allowLabels: true });

                  $(subDivs[0]).dropdown('set selected', [splittedLabel[1]]);



               } else {
                  docElement.checked = true;


               }
            }

         }


         //self.checkSaveReady();
      });
   }
*/
  //load aim end
  // this.readx = function readx(evt) {
  //   return self.readFile(evt);
  // };

  //return self.loadAim(self.textXml, self.checkSaveReady);

  // this.readFile = function(e) {
  //   //Retrieve all the files from the FileList object

  //   var file = e.target.files[0];
  //   if (!file) {
  //     return;
  //   }
  //   var reader = new FileReader();
  //   reader.onload = function(e) {
  //     var contents = e.target.result;
  //     self.textXml = contents;
  //     // Display file content
  //     //displayContents(contents);
  //   };
  //   reader.readAsText(file);

  //   // return self.loadAim(self.textXml, self.checkSaveReady);
  // };

  // Save Aim
  this.savetextFreeInput = function(
    parentArray,
    parentObject,
    itself,
    Entitytype,
    jsonInner
  ) {};

  this.saveQuestionType = function(
    parentArray,
    parentObject,
    itself,
    Entitytype,
    jsonInner
  ) {};

  this.saveAlgorithmType = function(
    parentArray,
    parentObject,
    itself,
    Entitytype,
    jsonInner
  ) {};

  this.saveCalculationType = function(
    parentArray,
    parentObject,
    itself,
    Entitytype,
    jsonInner
  ) {};

  this.saveCalculation = function(
    parentArray,
    parentObject,
    itself,
    Entitytype,
    jsonInner
  ) {};

  this.saveInference = function(
    parentArray,
    parentObject,
    itself,
    Entitytype,
    jsonInner
  ) {};

  this.saveComponent = function(
    parentArray,
    parentObject,
    itself,
    Entitytype,
    jsonInner
  ) {};

  //****************** used components ***********************************

  this.saveInterval = function(parentObject, itself, Entitytype, jsonInner) {
    var Intervals = itself.value;
    var arraySize = -1;
    var arrayCheck = false;

    if (Array.isArray(Intervals)) {
      arraySize = Intervals.length;
      arrayCheck = true;
    } else {
      arraySize = 1;
    }
    console.log("numerical parent object", parentObject);
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
        value: ""
      }
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
        value: instanceObject
      };
      console.log("numerical instance object", instanceObject);
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
        value: defaultSelectedValueLabel
      };

      jsonCharacteristicQuantification.operator = defaultSelectedOperator;
      jsonCharacteristicQuantification.minOperator = defaultSelectedMinOperator;
      jsonCharacteristicQuantification.maxOperator = defaultSelectedMaxOperator;
      jsonCharacteristicQuantification.ucumString = {
        value: defaultSelectedUcumString
      };
      jsonCharacteristicQuantification.minValue = {
        value: defaultSelectedMinValue
      };
      jsonCharacteristicQuantification.maxValue = {
        value: defaultSelectedMaxValue
      };
    }

    jsonInner.push(jsonCharacteristicQuantification);
  };

  this.saveNonQuantifiable = function(
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
          value: ""
        },
        codeSystemVersion: ""
      }
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
        value: instanceObject
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
    jsonCharacteristicQuantification.typeCode.codeSystemName = defaultCodeSystemName;
    jsonCharacteristicQuantification.typeCode.codeSystemVersion = defaultCodeSystemVersion;
    jsonCharacteristicQuantification.typeCode[
      "iso:displayName"
    ].value = defaultCodeSystem;
    jsonInner.push(jsonCharacteristicQuantification);
  };

  this.saveQuantile = function(parentObject, itself, Entitytype, jsonInner) {
    var Quantiles = itself.value;
    var arraySize = -1;
    var arrayCheck = false;

    if (Array.isArray(Quantiles)) {
      arraySize = Quantiles.length;
      arrayCheck = true;
    } else {
      arraySize = 1;
    }
    console.log("numerical parent object", parentObject);
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
        value: ""
      }
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
        value: instanceObject
      };
      console.log("numerical instance object", instanceObject);
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
        value: defaultSelectedValueLabel
      };

      jsonCharacteristicQuantification.bins = {
        value: defaultSelectedBins
      };
      jsonCharacteristicQuantification.selectedBin = {
        value: defaultSelectedSelectedBin
      };
      jsonCharacteristicQuantification.minValue = {
        value: defaultSelectedMinValue
      };
      jsonCharacteristicQuantification.maxValue = {
        value: defaultSelectedMaxValue
      };
      jsonCharacteristicQuantification.valueLabel = {
        value: defaultSelectedValueLabel
      };
    }

    jsonInner.push(jsonCharacteristicQuantification);
  };

  this.saveNumerical = function(parentObject, itself, Entitytype, jsonInner) {
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
    console.log("anotconf".anotconf);
    let jsonCharacteristicQuantification = {
      "xsi:type": "Numerical",
      operator: "",
      annotatorConfidence: { value: anotconf },
      label: { value: parentObject.value.name },
      ucumString: { value: "" },
      valueLabel: {
        value: ""
      },
      value: {
        value: ""
      }
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
        value: instanceObject
      };
      console.log("numerical instance object", instanceObject);
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
        value: defaultSelectedValueLabel
      };
      jsonCharacteristicQuantification.value = { value: defaultSelectedValue };
      jsonCharacteristicQuantification.operator = defaultSelectedOperator;
      jsonCharacteristicQuantification.ucumString = {
        value: defaultSelectedUcumString
      };
    }

    jsonInner.push(jsonCharacteristicQuantification);
  };

  this.saveScaleLevel = function(parentObject, itself, Entitytype, jsonInner) {
    //jsonInner["xsi:type"] = parentObject.value.scaleType;
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
        value: instanceObject
      };
    }
  };

  this.saveScale = function(parentObject, itself, Entitytype, jsonInner) {
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
        value: ""
      },
      value: {
        value: ""
      }
    };
    for (i = 0; i < arraySize; i++) {
      if (arrayCheck === true) {
        instanceObject = Scales[i];
      } else {
        instanceObject = Scales;
      }

      let prntObject = {
        type: "Scale",
        value: instanceObject
      };

      for (var key in instanceObject) {
        if (typeof instanceObject[key] === "object") {
          let subObject = {
            type: key,
            value: instanceObject[key]
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

  this.saveCharacteristicQuantification = function(
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
      // console.log("%c CharacteristicQuantifications : "+JSON.stringify(instanceObject),'background:  #068b00; color: white; display: block;');
      let prntObject = {
        type: "CharacteristicQuantification",
        value: instanceObject
      };

      for (var key in instanceObject) {
        if (typeof instanceObject[key] === "object") {
          let subObject = {
            type: key,
            value: instanceObject[key]
          };

          //console.log("@@@@@@@@ car quant : "+key);

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

    //if (Object.keys(jsoncharacteristicQuantification).length > 0)
    jsonInner.characteristicQuantificationCollection.push(
      tempjson.CharacteristicQuantification
    );
  };

  this.saveImagingObservation = function(
    parentObject,
    itself,
    Entitytype,
    jsonInner
  ) {
    // console.log("%c __ imaging observation header before: " + JSON.stringify(jsonInner),  'background:  #df9800; color: white; display: block;');
    if (!jsonInner.hasOwnProperty("imagingObservationEntityCollection"))
      jsonInner.imagingObservationEntityCollection = [];
    let jsonImagingObservationEntity = {};
    self["saveImagingObservationCharacteristic"](
      parentObject,
      itself.value["ImagingObservationCharacteristic"],
      Entitytype,
      jsonInner.imagingObservationEntityCollection
    );
    //console.log("%c __ imaging observation header after: " + JSON.stringify(jsonInner),  'background: #df9800; color: white; display: block;');
  };

  this.saveImagingObservationCharacteristic = function(
    parentObject,
    itself,
    Entitytype,
    jsonInner
  ) {
    //console.log("%c saveImagingObservationCharacteristic - jsonInner before " + JSON.stringify(jsonInner) ,  'background: green; color: white; display: block;');
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
    //console.log("XXX ___  itself : im ob char : " + JSON.stringify(itself));

    var i = 0;
    for (i = 0; i < arraySize; i++) {
      if (arrayCheck === true) {
        instanceObject = ImagingObservationCharacteristics[i];
      } else {
        instanceObject = ImagingObservationCharacteristics;
      }

      let prntObject = {
        type: "ImagingObservationCharacteristic",
        value: instanceObject
      };

      let commentvalue = "";
      if (instanceObject.hasOwnProperty("commentSelect")) {
        commentvalue = instanceObject.commentSelect;
        //console.log("commment on save "+JSON.stringify(instanceObject));
      }
      for (var key in instanceObject) {
        if (key != "QuestionType") {
          if (typeof instanceObject[key] === "object") {
            let subObject = {
              type: key,
              value: instanceObject[key]
            };

            self["save" + key](
              prntObject,
              subObject,
              Entitytype,
              tempjson.imagingObservationCharacteristicCollection
            );
          }
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
      //after for loop
    }
    jsonInner.push(tempjson);
    // console.log("%c saveImagingObservationCharacteristic - jsonInner after " + JSON.stringify(jsonInner) ,  'background: green; color: white; display: block;');

    //jsonInner.imagingObservationCharacteristicCollection = imagingObservationCharacteristicCollection;
  };

  this.emptyJson = function(obj) {
    if (Object.keys(obj).length === 0 && obj.constructor === Object)
      return false;
    else return true;
  };
  this.saveAnatomicEntity = function(
    parentObject,
    itself,
    Entitytype,
    jsonInner
  ) {
    //console.log("%c __ anatomic entity header before: " + JSON.stringify(jsonInner),  'background:  #8b0087; color: white; display: block;');
    if (!jsonInner.hasOwnProperty("imagingPhysicalEntityCollection"))
      jsonInner.imagingPhysicalEntityCollection = [];
    let jsonImagingPhysicalEntity = {};
    self["saveAnatomicEntityCharacteristic"](
      parentObject,
      itself.value["AnatomicEntityCharacteristic"],
      Entitytype,
      jsonInner.imagingPhysicalEntityCollection
    );

    //console.log("%c __ anatomic entity header after: " + JSON.stringify(jsonInner),  'background:  #8b0087; color: white; display: block;');
  };

  this.saveAnatomicEntityCharacteristic = function(
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

    // console.log("a e char :" + JSON.stringify(jsonInner));
    for (i = 0; i < arraySize; i++) {
      let jsonAllowedTerms = {};

      if (arrayCheck === true) {
        instanceObject = AnatomicEntityCharacteristics[i];
      } else {
        instanceObject = AnatomicEntityCharacteristics;
      }

      let prntObject = {
        type: "AnatomicEntityCharacteristic",
        value: instanceObject
      };

      let commentvalue = "";

      if (instanceObject.hasOwnProperty("commentSelect")) {
        commentvalue = instanceObject.commentSelect;
        //console.log("commment on save "+JSON.stringify(instanceObject));
      }
      for (var key in instanceObject) {
        if (typeof instanceObject[key] === "object") {
          if (key != "QuestionType") {
            //alert(key);
            let subObject = {
              type: key,
              value: instanceObject[key]
            };

            self["save" + key](
              prntObject,
              subObject,
              Entitytype,
              tempjson.imagingPhysicalEntityCharacteristicCollection
            );
          }
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

  this.saveAllowedTerm = function(parentObject, itself, Entitytype, jsonInner) {
    // console.log("allowed terms : " + JSON.stringify(itself));

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
        value: instanceAllowedTerms
      };

      if (instanceAllowedTerms.hasOwnProperty("select")) {
        if (instanceAllowedTerms.select == "1") {
          //console.log("%c each at comp itself "+JSON.stringify(instanceAllowedTerms),'background: gray; color: white; display: block;');
          //alert(parentObject.type);
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
                  "xmlns:iso": "uri:iso.org:21090"
                }
              }
            ],
            annotatorConfidence: {
              value: anotconf
            },
            label: {
              value: parentObject.value.label
            }
          };
          // console.log("-------" + parentObject.value.selectac);

          for (var key in instanceAllowedTerms) {
            if (typeof instanceAllowedTerms[key] == "object") {
              var subObject = {
                type: key,
                value: instanceAllowedTerms[key]
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
          //console.log("%c allow "+JSON.stringify(jsonAllowedTerm),  'background: blue; color: white; display: block;');
          //jsonAllowedTerms.push(jsonAllowedTerm);
          if (self.emptyJson(jsonAllowedTerm)) {
            if (parentObject.type === "Component") {
              //console.log("AT adding to component : " + JSON.stringify(jsonAllowedTerm));
              jsonInner.allowedterms.push(jsonAllowedTerm);
            } else {
              //	console.log("AT adding to type : "+ parentObject.type);
              // console.log("AT adding to  ImagingObservationCharacteristicCollection : " + parentObject.type + " : " + JSON.stringify(jsonAllowedTerm));
              jsonInner.push(jsonAllowedTerm);
            }
          }
        }
      }
    }
  };

  this.saveValidTerm = function(parentObject, itself, Entitytype, jsonInner) {
    //console.log("%c valid term begin  : " + JSON.stringify(jsonInner),'background: #8b0000; color: white; display: block;');

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
    console.log("**********************************************");
    console.log("**********************************************");
    console.log("**********************************************");
    console.log("**********************************************");
    console.log("valid term saving section code checkk");
    console.log("temptype code :--->", tempTypecode);

    for (i = 0; i < arraySize; i++) {
      if (arrayCheck == true) {
        instanceObject = ValidTerms[i];
      } else {
        instanceObject = ValidTerms;
      }

      let prntObject = {
        type: "ValidTerm",
        value: instanceObject
      };
      if (i == 0 && arraySize == 1) {
        console.log("valid term instance object", instanceObject);
        defaultCodeValue = instanceObject.codeValue;
        defaultCodingSchemeDesignator = instanceObject.codingSchemeDesignator;
        defaultCodingSchemeVersion = instanceObject.codingSchemeVersion;
        defaultCodeMeaning = instanceObject.codeMeaning;
      } else {
        if (instanceObject.hasOwnProperty("select")) {
          if (instanceObject.select == "1") {
            console.log("valid term instance object selecetd", instanceObject);
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
            "xmlns:iso": "uri:iso.org:21090"
          }
        };
        console.log("json valid term before push", jsonValidTerm);
        if (Array.isArray(jsonInner.typeCode)) {
          jsonInner.typeCode[0].push(jsonValidTerm);
        } else {
          jsonInner.typeCode.push(jsonValidTerm);
        }
        //jsonInner.typeCode[0].push(jsonValidTerm); //edited to be compatible with array to fix the error xml->json (json creates array)
        defaultCodeMeaning = "";
      }
    }

    //console.log("%c valid term end  : " + JSON.stringify(jsonInner),'background: #8b0000; color: white; display: block;');
  };

  this.traverseComponentsToSave = function(o, jsonComponents) {
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
      if (arrayCheckForComponents === true) instanceComponent = Components[i];
      else instanceComponent = Components;

      let componentObject = {
        type: "Component",
        value: instanceComponent
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

      let counter = 0;

      for (counter; counter < keyorder.length; counter++) {
        if (typeof instanceComponent[keyorder[counter]] == "object") {
          let subObject = {
            type: keyorder[counter],
            value: instanceComponent[keyorder[counter]]
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
      //console.log("%c ____each comp json:" + JSON.stringify(jsonInner),'background: #a75d4d; color: white; display: block;');
      if (Object.keys(jsonInner).length > 0) {
        jsonParent.innerjsons.push(jsonInner);
        jsonInner = {};
      }
    }

    jsonComponents.innerjsons = jsonParent.innerjsons;

    //console.log("beforechanging afer json jsonComponents:"+JSON.stringify(jsonComponents));
    return jsonComponents;
  };

  this.saveAim = function() {
    // console.log(
    //   "____________save aim : self.jsonTemplateCopy" +
    //     JSON.stringify(self.jsonTemplateCopy)
    // );
    var jsonComponents = {};
    var finaljson = {};
    var mainHolder = [];

    jsonComponents = self.traverseComponentsToSave(
      self.jsonTemplateCopy,
      jsonComponents
    );
    //console.log("____________whole comps :"+JSON.stringify(jsonComponents));

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
      //console.log("^^^^^^^ ddddd eachinner json  :"+JSON.stringify(eachInnerJson));
      var keys = Object.keys(eachInnerJson);
      //console.log("^^^^^^^ kkkk keys  :"+keys );
      //console.log("^^^^^^^ llllll keys.length  :"+keys.length);
      if (keys.length >= 2) {
        //findout next component
        switch (keys[1]) {
          case "imagingObservationEntityCollection":
            nextComptype = "imagingObservationEntityCollection";
            break;
          case "imagingPhysicalEntityCollection":
            nextComptype = "imagingPhysicalEntityCollection";
            break;
          default:
          // code block
        }

        let directATlength = eachInnerJson["allowedterms"].length;

        if (directATlength > 0) {
          if (directATlength >= 1) {
            //console.log("ae > 1");
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
            //console.log("ae ==1");
            eachInnerJson[nextComptype] = eachInnerJson["allowedterms"];
            delete eachInnerJson["allowedterms"];
          }
        } else {
          delete eachInnerJson["allowedterms"];
        }
      } else {
      }
      // console.log("################ before adding to final json  eachInnerJson:"+JSON.stringify(eachInnerJson));
      // console.log("################ before adding to final json  finaljson:"+JSON.stringify(finaljson));
      // console.log("warning");
      var eachImOB = "";
      var eachImPhy = "";
      if (eachInnerJson.hasOwnProperty("imagingObservationEntityCollection")) {
        //console.log("each inner json has imagingObservationEntityCollection + "+JSON.stringify(eachInnerJson['imagingObservationEntityCollection']));
        if (
          typeof eachInnerJson["imagingObservationEntityCollection"] !==
          "undefined"
        ) {
          eachImOB = eachInnerJson["imagingObservationEntityCollection"];
          if (mapFinalJsonTags.get("imagingObservationEntityCollection")) {
            if (eachImOB != "" && typeof eachImOB != "undefined") {
              //console.log("%c !!!! each comp json: final has it" + JSON.stringify(eachImOB),'background: #ffbb33; color: white; display: block;');
              var mergeJson = [];
              //console.log("push "+eachImOB);
              mergeJson = finaljson[
                "imagingObservationEntityCollection"
              ].concat(eachImOB);
              //console.log("merge json "+JSON.stringify(mergeJson));
              finaljson["imagingObservationEntityCollection"] = [...mergeJson];
              eachImOB = "";
            }
          } else {
            if (eachImOB != "" && typeof eachImOB != "undefined") {
              //console.log("%c !!!! each comp json:final empty" + JSON.stringify(eachImOB),'background: #ffbb33; color: white; display: block;');
              finaljson["imagingObservationEntityCollection"] =
                eachInnerJson["imagingObservationEntityCollection"];
              mapFinalJsonTags.set("imagingObservationEntityCollection", 1);
              //console.log("################ after  adding to final json  finaljson was empty:"+JSON.stringify(finaljson));
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
              mergeJson = finaljson["imagingPhysicalEntityCollection"].concat(
                eachImPhy
              );
              finaljson["imagingPhysicalEntityCollection"] = mergeJson;
              eachImPhy = "";
            }
          } else {
            //var temp
            if (eachImPhy != "" && typeof eachImPhy != "undefined") {
              finaljson["imagingPhysicalEntityCollection"] =
                eachInnerJson["imagingPhysicalEntityCollection"];
              mapFinalJsonTags.set("imagingPhysicalEntityCollection", 1);
              eachImPhy = "";
            }
          }
        }
      }
      // console.log("after warning eachImPhy"+eachImPhy);
      // console.log("after warning eachImOB"+eachImOB);
      // console.log("final json  warning finaljjjj"+JSON.stringify(finaljson));
    }
    self.addUid(finaljson);
    finaljson = self.replaceTagNamingHierarchy(finaljson);
    console.log("============= final" + JSON.stringify(finaljson));

    return finaljson;
  };
  this.addButtonsDiv = function(divforbuttons) {
    self.divHolderForButtons = divforbuttons;
  };
  this.addButtons = function(parentDiv) {
    let saveButton = document.createElement("Button");
    let saveButtonText = document.createTextNode("save");
    saveButton.appendChild(saveButtonText);
    saveButton.onclick = function() {
      var savedAimJson = self.saveAim();
      //console.log("  Returning json to react after saving :"+(JSON.stringify(savedAimJson)));
    };
    let loadButton = document.createElement("Button");
    let loadButtonText = document.createTextNode("load");
    loadButton.appendChild(loadButtonText);
    loadButton.onclick = function() {
      /*presaved aims variables
            recistSavedAim
            aimjsonBeauLieuBoneTemplate_rev18
         */
      // self.loadAimJson(recist_resaved);
    };

    parentDiv.appendChild(saveButton);
    parentDiv.appendChild(loadButton);

    if (self.divHolderForButtons != null)
      parentDiv.appendChild(self.divHolderForButtons);
  };

  this.turnAllRedtoGreencheck = function() {
    var objs = document.getElementsByTagName("i");

    for (var i = 0; i < objs.length; i++) {
      if (objs[i].className == "red check circle outline icon")
        objs[i].className = "green check circle outline icon";
    }
  };
  this.checkFormSaveReady = function() {
    var countRedCircle = 0;
    var objs = document.getElementsByTagName("i");

    for (var i = 0; i < objs.length; i++) {
      if (objs[i].className == "red check circle outline icon")
        countRedCircle++;
    }
    return countRedCircle;
  };

  this.checkAnnotationShapes = function(prmtrShapeArray) {
    //self.templateShapeArray.push({"shape":object.GeometricShape, "domid" : object.id});
    let prmtrShapeArrayLength = prmtrShapeArray.length;
    for (let k = 0; k < prmtrShapeArrayLength; k++) {
      // this.mapShapesSchemaToTemplate.set("TwoDimensionMultiPoint", [{"formshape" : 'Line'}, {"formshape" : 'Perpendicular'}]);
      let jsonShapeObj = this.mapShapesSchemaToTemplate.get(prmtrShapeArray[k]);
      if (Array.isArray(jsonShapeObj)) {
        let templateShapeArrayLength = self.templateShapeArray.length;
        for (let t = 0; t < templateShapeArrayLength; t++) {
          for (let j = 0; j < jsonShapeObj.length; j++) {
            if (
              self.templateShapeArray[t].shape === jsonShapeObj[j].formshape
            ) {
              document.getElementById(
                self.templateShapeArray[t].domid
              ).className = "green check circle outline icon";
            }
          }
        }
      } else {
        let templateShapeArrayLength = self.templateShapeArray.length;
        for (let t = 0; t < templateShapeArrayLength; t++) {
          if (self.templateShapeArray[t].shape === jsonShapeObj.formshape) {
            document.getElementById(
              self.templateShapeArray[t].domid
            ).className = "green check circle outline icon";
          }
        }
      }
    }
    //document.getElementById( object.id).className = "green check circle outline icon";
  };

  this.setAim = function(aimValue) {
    self.textXml = aimValue;
  };

  this.checkIfCommentRequired = function(object, parentDiv) {
    if (object.hasOwnProperty("requireComment")) {
      if (object.requireComment == true) {
        let annoCommentDomid = object.label.replace(
          /[`~!@# $%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi,
          ""
        );

        self.mapLabelSubComment.set(annoCommentDomid, annoCommentDomid);
        self.mapLabelCommentJson.set(annoCommentDomid, object); //changing
        //console.log("comment true"+object.label);

        var req = document.createElement("div");
        var label = document.createElement("label");
        label.textContent = "Comment";

        //console.log("coment for subs"+JSON.stringify(object));
        let textaDomObject = document.createElement("textarea");
        textaDomObject.style.color = "black";
        textaDomObject.style.width = "100%";
        textaDomObject.id = "comment" + object.label;
        textaDomObject.onkeyup = function() {
          object.commentSelect = this.value;
        };
        req.appendChild(label);
        req.appendChild(textaDomObject);
        parentDiv.appendChild(req);
        req.className = "requiredcomment";
      }
    }
  };
  //degistir
  this.traverseJsonOnLoad = function(jsonObj) {
    let label = "";

    if (jsonObj !== null && typeof jsonObj == "object") {
      Object.entries(jsonObj).forEach(([key, value]) => {
        if (key === "CharacteristicQuantification") {
          let CharQuantArray = value;
          let arrayCheck = false;
          let arrayIndex = -1;
          let arraySize = -1;

          console.log("CharacteristicQuantification", value);
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
            console.log("eachCharactQuantfObj", eachCharactQuantfObj);
            console.log(
              "eachCharactQuantfObj",
              eachCharactQuantfObj["xsi:type"]
            );
            let chartQuantfType = eachCharactQuantfObj["xsi:type"];
            switch (chartQuantfType) {
              case "Scale":
                $(
                  "#Select" + eachCharactQuantfObj.label.value
                ).dropdown("set selected", [
                  eachCharactQuantfObj.valueLabel.value
                ]);
                break;
              case "NonQuantifiable":
                console.log("NonQuantifiable", eachCharactQuantfObj);
                $(
                  "#Select" + eachCharactQuantfObj.label.value
                ).dropdown("set selected", [
                  eachCharactQuantfObj.typeCode.codeSystem
                ]);
                break;
              case "Numerical":
                console.log("Numerical", eachCharactQuantfObj);
                $(
                  "#Select" + eachCharactQuantfObj.label.value
                ).dropdown("set selected", [
                  self.mathOperators.get(eachCharactQuantfObj.operator) +
                    " " +
                    eachCharactQuantfObj.valueLabel.value +
                    " " +
                    eachCharactQuantfObj.ucumString.value
                ]);
                break;
              case "Quantile":
                console.log("Quantile", eachCharactQuantfObj);
                $(
                  "#Select" + eachCharactQuantfObj.label.value
                ).dropdown("set selected", [
                  eachCharactQuantfObj.valueLabel.value
                ]);

                break;
              case "Interval":
                console.log("Interval", eachCharactQuantfObj);
                $(
                  "#Select" + eachCharactQuantfObj.label.value
                ).dropdown("set selected", [
                  eachCharactQuantfObj.valueLabel.value
                ]);
                break;
              default:
              // code block
            }

            console.log("each char quantf object :", eachCharactQuantfObj);
          }
        }
        if (key === "typeCode") {
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
                splittedLabelMergeRest.trim()
              ]);
              $(subDivs[0]).removeClass("disabled");
            } else {
              if (docElement.checked != true) {
                docElement.click();
                //console.log("doc element here :::: ", docElement.stringify);
                //docElement.checked = true;
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
            let returnAnnotConfDomId = self.mapLabelAnnotatorConfidence.get(
              annotatorConflabel
            );

            if (typeof returnAnnotConfDomId != "undefined") {
              //console.log("Annotator condifidence section:"+annotatorConflabel);
              //console.log("Annotator condifidence value:"+jsonObj['annotatorConfidence']['value']);
              let showannoConfDomid = "range" + annotatorConflabel;
              document.getElementById(returnAnnotConfDomId).value =
                value.value * 100;
              document.getElementById(showannoConfDomid).value =
                value.value * 100;
              let annotconfJson = self.mapLabelAnnotConfJson.get(
                annotatorConflabel
              );
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

  /*switched to partial parsing follow with other loadAimJson

      this.loadAimJson = function (aimjson) {
      //console.log("____________load aim json :"+JSON.stringify(aimjson));
      var ImageAnnotation = aimjson.imageAnnotations.ImageAnnotationCollection.imageAnnotations.ImageAnnotation;
      var imagingObservationEntityCollection = ImageAnnotation.imagingObservationEntityCollection;
      var imagingPhysicalEntityCollection = ImageAnnotation.imagingPhysicalEntityCollection

      var comment = aimjson.imageAnnotations.ImageAnnotationCollection.imageAnnotations.ImageAnnotation.comment.value;
      var annotationName = aimjson.imageAnnotations.ImageAnnotationCollection.imageAnnotations.ImageAnnotation.name.value;



      var commentArray = comment.split("~~");
      document.getElementById("comment").value = commentArray[1];
      self.aimComment = commentArray[1];

      var annotationNameArray = annotationName.split("~");
      document.getElementById("annotationName").value = annotationNameArray[0];
      self.aimName = annotationNameArray[0];

      var modality = commentArray[0].split("/");
      self.aimType = modality[0];


      self.traverseJsonOnLoad(imagingPhysicalEntityCollection);
      self.traverseJsonOnLoad(imagingObservationEntityCollection);
      //self.printMap(self.mapLabelAnnotatorConfidence);
      //self.printMap(self.mapLabelAnnotConfJson);
      //self.printMap(self.mapLabelCommentJson);

   }
   */
  this.loadAimJson = function(aimjson) {
    //var ImageAnnotation = aimjson.imageAnnotations.ImageAnnotationCollection.imageAnnotations.ImageAnnotation;

    var templateIndex = self.mapTemplateCodeValueByIndex.get(
      aimjson.typeCode[0].code
    );
    if (typeof templateIndex === "undefined") {
      return 1;
    } else {
      self.templateSelect.selectedIndex = templateIndex + 1;
      let evObj = document.createEvent("Events");
      evObj.initEvent("change", true, true);
      self.templateSelect.dispatchEvent(evObj);
      var imagingObservationEntityCollection =
        aimjson.imagingObservationEntityCollection;
      var imagingPhysicalEntityCollection =
        aimjson.imagingPhysicalEntityCollection;
      //console.log("xxxx_"+JSON.stringify(imagingObservationEntityCollection))
      var comment = aimjson.comment.value;
      var annotationName = aimjson.name.value;
      self.aimTypeCode = aimjson.typeCode;
      // console.log("comment" + comment);
      // console.log("comment" + annotationName);
      if (comment.includes("~")) {
        var commentArray = comment.split("~~");
        document.getElementById("comment").value = commentArray[1];
        self.aimComment = commentArray[1];
        var modality = commentArray[0].split("/");
        self.aimType = modality[0];
      } else {
        document.getElementById("comment").value = comment;
        self.aimComment = comment;
        self.aimType = "";
      }

      if (annotationName.includes("~")) {
        var annotationNameArray = annotationName.split("~");
        document.getElementById("annotationName").value =
          annotationNameArray[0];
        self.aimName = annotationNameArray[0];
      } else {
        document.getElementById("annotationName").value = annotationName;
        self.aimName = annotationName;
      }

      self.traverseJsonOnLoad(imagingPhysicalEntityCollection);
      self.traverseJsonOnLoad(imagingObservationEntityCollection);
      self.checkAnnotationShapes(aimjson.markupType);
      //self.printMap(self.mapLabelAnnotatorConfidence);
      //self.printMap(self.mapLabelAnnotConfJson);
      //self.printMap(self.mapLabelCommentJson);
      return 0;
    }
  };

  this.loadAimJsonForAnnotNameDropDown = function(aimjson) {
    console.log("aim josn on load : ", aimjson);
    self.createViewerWindowWithNamesAsDropDown();
    //var ImageAnnotation = aimjson.imageAnnotations.ImageAnnotationCollection.imageAnnotations.ImageAnnotation;

    // self.templateSelect.selectedIndex = templateIndex + 1;
    // let evObj = document.createEvent("Events");
    // evObj.initEvent("change", true, true);
    // self.templateSelect.dispatchEvent(evObj);

    var imagingObservationEntityCollection =
      aimjson.imagingObservationEntityCollection;
    var imagingPhysicalEntityCollection =
      aimjson.imagingPhysicalEntityCollection;
    //console.log("xxxx_"+JSON.stringify(imagingObservationEntityCollection))
    var comment = aimjson.comment.value;
    var annotationName = aimjson.name.value;
    self.aimTypeCode = aimjson.typeCode;
    // console.log("comment" + comment);
    // console.log("comment" + annotationName);
    if (comment.includes("~")) {
      var commentArray = comment.split("~~");
      document.getElementById("comment").value = commentArray[1];
      self.aimComment = commentArray[1];
      var modality = commentArray[0].split("/");
      self.aimType = modality[0];
    } else {
      document.getElementById("comment").value = comment;
      self.aimComment = comment;
      self.aimType = "";
    }

    if (annotationName.includes("~")) {
      var annotationNameArray = annotationName.split("~");
      for (let k = 0; k < self.annotationNames.length; k++) {
        if (annotationNameArray[0] === self.annotationNames[k].value) {
          self.aimName = annotationNameArray[0];
          $("#S1").dropdown("set selected", [self.annotationNames[k].value]);
          break;
        }
      }
    } else {
      for (let k = 0; k < self.annotationNames.length; k++) {
        if (annotationName === self.annotationNames[k].value) {
          self.aimName = annotationName;
          $("#S1").dropdown("set selected", [self.annotationNames[k].value]);
          break;
        }
      }

      //////document.getElementById("annotationName").value = annotationName;
      //////self.aimName = annotationName;
    }

    self.traverseJsonOnLoad(imagingPhysicalEntityCollection);
    self.traverseJsonOnLoad(imagingObservationEntityCollection);
    self.checkAnnotationShapes(aimjson.markupType);
    //self.printMap(self.mapLabelAnnotatorConfidence);
    //self.printMap(self.mapLabelAnnotConfJson);
    //self.printMap(self.mapLabelCommentJson);
    return 0;
  };

  this.addUid = function(jsonobj) {
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
                root: valueJson.uid
              };
            } else {
              jsonobj[key][inobjcounter].uniqueIdentifier = { root: uid() };
            }
          }
        }
      }
    }
  };

  this.replaceTagNamingHierarchy = function(aimJson) {
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
                CharacteristicQuantification: tempSubTwoJson[0]
              };
            }
          }

          delete tempJson[i].imagingPhysicalCharacteristicCollection;
          tempJson[i].imagingPhysicalCharacteristicCollection = {
            imagingPhysicalCharacteristic: tempSubJson
          };
        }
      }

      delete aimJson.imagingPhysicalEntityCollection;
      aimJson.imagingPhysicalEntityCollection = {
        ImagingPhysicalEntity: tempJson
      };
      //console.log("%c %%% _ temp json _ %%%% " + JSON.stringify(tempJson),'background: #453dc2; color: white; display: block;');
    }
    if (aimJson.hasOwnProperty("imagingObservationEntityCollection")) {
      tempJson = aimJson["imagingObservationEntityCollection"];

      //first check if there are chrachteristics under imagingPhysicalEntityCollection

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
                CharacteristicQuantification: tempSubTwoJson[0]
              };
            }
          }

          delete tempJson[i].imagingObservationCharacteristicCollection;
          tempJson[i].imagingObservationCharacteristicCollection = {
            ImagingObservationCharacteristic: tempSubJson
          };
        }
      }

      delete aimJson.imagingObservationEntityCollection;
      aimJson.imagingObservationEntityCollection = {
        ImagingObservationEntity: tempJson
      };
      //console.log("%c %%% _ temp json _ %%%% " + JSON.stringify(tempJson),'background: #453dc2; color: white; display: block;');
    }
    /*
            imagingObservationEntityCollection - > ImagingObservationEntity
            imagingPhysicalEntityCollection - > ImagingPhysicalEntity
            imagingObservationCharacteristicCollection -> ImagingObservationCharacteristic
            imagingPhysicalCharacteristicCollection -> ImagingPhysicalCharacteristic
            characteristicQuantificationCollection -> CharacteristicQuantification
            
         */

    return aimJson;
  };

  this.printMap = function(varmap) {
    //console.log("Printing map------------------------------------------");
    for (var [key, value] of varmap) {
      //console.log("______"+key + ' = ' + JSON.stringify(value));
    }
  };

  this.removeEmptySpace = function(removeFrom) {
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
