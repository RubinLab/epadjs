//import $ from "jquery";

import "./semantic/semantic.js";

export var AimEditor = function(userWindow) {
  var self = this;
  this.userWindow = userWindow;
  this.arrayTemplates = [];
  this.arrayTemplatesJsonObjects = [];
  this.json = "";
  this.jsonTemplateCopy = "";
  this.mainWindowDiv = "";
  this.primitiveJson = "";
  this.mapCardinalitiesToCheckId = new Map();
  this.mapStatusAllowedTermBlocks = new Map();
  this.mapObjCodeValueParent = new Map();
  this.mapHtmlObjects = new Map();
  this.mapAllowedTermCollectionByCodeValue = new Map();
  this.mapTemplateCodeValueByIndex = new Map();
  this.subOrderLabelTracking = 64;
  this.ids = 0;
  this.maptag = [];
  this.savebtn = null;
  this.textXml = null;
  this.divHolderForButtons = null;

  var domelements = [];

  var selectid = 0;
  var mathOperators = new Map();
  mathOperators.set("Equal", "=");
  mathOperators.set("NotEqual", "!=");
  mathOperators.set("LessThan", "<");
  mathOperators.set("GreaterThan", ">");
  mathOperators.set("LessThanEqual", "<=");
  mathOperators.set("GreaterThanEqual", ">=");

  function constructor() {
    if (self.arrayTemplates === "undefined") self.arrayTemplates = [];
  }

  this.loadTemplates = function(templateList) {
    console.log(JSON.stringify(templateList));
    self.arrayTemplatesJsonObjects = templateList;
    if (self.arrayTemplatesJsonObjects.length > 0) {
      for (var i = 0; i < self.arrayTemplatesJsonObjects.length; i++) {
        var object = self.arrayTemplatesJsonObjects[i];
        object.codeValue =
          self.arrayTemplatesJsonObjects[0].value.Template["codeValue"];
        object.arrayIndex = i;
        self.mapTemplateCodeValueByIndex.set(object.codeValue, i);
      }
    }
  };

  this.createTemplatesFromListToJson = function() {
    /*
 		let templeateObject = {
 			templateName : 
 			jsonObject
		 }
		 
 		templateSelect.onchange = function (){

		
		        $.getJSON("jsons/"+this.value, function(json) {
		        	this.arrayTemplatesJsonObjects.push=json;

		    
		        });
           
		 };
		 */
  };

  this.createViewerWindow = function() {
    //var x = document.createElement("INPUT");
    //x.setAttribute("type", "file");
    //x.addEventListener('change', self.readx, false);

    self.mainWindowDiv = document.createElement("div");
    self.mainButtonsDiv = document.createElement("div");
    //this.addButtons(this.mainWindowDiv);
    //this.mainWindowDiv.appendChild(x);
    self.templateListDiv = document.createElement("div");
    self.templateListDiv.id = "tlist";

    self.shapeDiv = document.createElement("div");
    self.shapeDiv.id = "shape";

    self.accordion1Div = document.createElement("div");
    self.accordion1Div.id = "accordion1";
    self.accordion1Div.class = "accordion1";
    self.accordion1Div.style = "background-color: white; width:400px;";

    var accordion2Div = document.createElement("div");
    accordion2Div.id = "accordion2";
    accordion2Div.class = "ui container";

    self.mainWindowDiv.appendChild(self.templateListDiv);
    self.mainWindowDiv.appendChild(self.shapeDiv);
    self.mainWindowDiv.appendChild(self.accordion1Div);
    self.mainWindowDiv.appendChild(accordion2Div);
    self.mainWindowDiv.appendChild(self.mainButtonsDiv);

    //creating template select drop down
    self.arrayTemplates = [
      "Select ",
      "short.json",
      "multiImage.json",
      "short1.json",
      "test3.json",
      "ATS_Template.json",
      "BeaulieuBoneTemplate_rev13.json",
      "coordinationTest.json",
      "Liver_Template_ePad_CFB_rev15.json",
      "LT.json",
      "asdf.json",
      "BeaulieuBoneTemplate_rev18.json",
      "LungNoduleFeaturesV2LT1.json",
      "meduloblastoma.json"
    ];
    var templateDiv = document.createElement("div");
    self.templateSelect = document.createElement("select");
    templateDiv.id = "Temp";
    self.templateSelect.id = "S1";

    self.templateSelect.className = "ui dropdown";
    templateDiv.appendChild(self.templateSelect);
    var i = 0;
    var templateOption = document.createElement("option");
    templateOption.value = "-1";
    templateOption.text = "Select";
    self.templateSelect.appendChild(templateOption);

    for (i = 0; i < self.arrayTemplatesJsonObjects.length; i++) {
      var templateOption = document.createElement("option");
      templateOption.value = i;
      templateOption.text = self.arrayTemplatesJsonObjects[i].key;
      //templateOption.innerHTML = this.arrayTemplatesJsonObjects[i].key;
      self.templateSelect.appendChild(templateOption);
    }

    // var lblTxt = document.createTextNode("Select template:");

    self.templateListDiv.appendChild(self.templateSelect);
    // $('document').ready(function(){

    //$('select[id^="select"]').dropdown();
    //$('select[class^="ui dropdown"]').dropdown();
    //$('#selectF1AnatomicCenter').dropdown('setting', 'onChange', function(value){console.log(value);});
    //$("#selectF3FunctionalBrainatRiskofResection").dropdown();

    // });

    self.userWindow.appendChild(self.mainWindowDiv);

    self.templateSelect.onchange = function() {
      let templateSelectedIndex = this.value;
      if (templateSelectedIndex == -1) {
        self.accordion1Div.innerHTML = "";
        self.shapeDiv.innerHTML = "";
        self.mainButtonsDiv.innerHTML = "";
      } else {
        self.jsonTemplateCopy =
          self.arrayTemplatesJsonObjects[this.value].value;
        self.accordion1Div.innerHTML = "";
        self.shapeDiv.innerHTML = "";
        //console.log("first json");
        self.mapCardinalitiesToCheckId = new Map();
        self.mapStatusAllowedTermBlocks = new Map();
        self.extractTemplate(self.jsonTemplateCopy);
      }
    };
  };

  this.extractTemplate = function(json) {
    var a = 0;

    //console.log(json);
    var subObject = null;
    var arrayLength = -1;
    if (Array.isArray(json.Template.Component))
      arrayLength = json.Template.Component.length;
    else arrayLength = 1;
    //console.log("how many component in the template :"+arrayLength);
    var component = null;
    for (var i = 0; i < arrayLength; i++) {
      a++;
      if (arrayLength > 1) component = json.Template.Component[i];
      else component = json.Template.Component;

      var cmplabel = component.label;
      var ComponentDivId = cmplabel.replace(
        /[`~!@#$%^&*()_|+\-=?;:'",.<>/ /\{\}\[\]\\\/]/gi,
        ""
      );

      var componentDivLabel = document.createTextNode(cmplabel);
      var componentDiv = document.createElement("div");
      componentDiv.className = "ui accordion mylbl";
      componentDiv.disabled = "true";

      var headerDiv = document.createElement("div");
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
      //console.log("key Order" + JSON.stringify(keyorder));
      var counter = 0;

      for (counter; counter < keyorder.length; counter++) {
        //console.log(counter+"  "+keyorder[counter]);
        if (typeof component[keyorder[counter]] == "object") {
          //console.log(counter+"  "+keyorder[counter]);
          //self[key](component,component[key], incontentDiv ,components[components.length-1].component.subTag,components[components.length-1].component.type);

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

    //callback(headerDiv);
    self.mainButtonsDiv.innerHTML = "";
    self.addButtons(self.mainButtonsDiv);
  };

  this.QuestionType = function(
    parent,
    object,
    parentDiv,
    mapTagArray,
    parentTagTypeFromJson
  ) {
    //console.log("*******************     QuestionType                       **********************");
    //console.log("*******************     QuestionType --end                      **********************");
  };

  this.Calculation = function(
    parent,
    object,
    parentDiv,
    mapTagArray,
    parentTagTypeFromJson
  ) {
    //console.log("*******************     Calculation                       **********************");
    //console.log("*******************     Calculation --end                      **********************");
  };
  this.CalculationType = function(
    parent,
    object,
    parentDiv,
    mapTagArray,
    parentTagTypeFromJson
  ) {
    //console.log("*******************     CalculationType                       **********************");
    //console.log("*******************     CalculationType --end                      **********************");
  };

  this.Inference = function(
    parent,
    object,
    parentDiv,
    mapTagArray,
    parentTagTypeFromJson
  ) {
    //console.log("*******************     Inference                       **********************");
    //console.log("*******************     Inference --end                      **********************");
  };

  this.textFreeInput = function(
    parent,
    object,
    parentDiv,
    mapTagArray,
    parentTagTypeFromJson
  ) {
    var textareaDomObject = document.createElement("textarea");
    parentDiv.appendChild(textareaDomObject);
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
    //console.log("*******************     ValidTerm                       **********************");
    //console.log("val clled validTermButtonClass : "+validTermButtonClass);
    //console.log("val clled paramContentDiv : "+paramContentDiv.innerHTML);
    //console.log("val clled optionElement :"+optionElement.innerHTML);
    //console.log("vt_ATS_Parent _ primitive : "+JSON.stringify(ATparent));
    //console.log("vt_ATS_Obj(AT lists) _ primitive: "+JSON.stringify(ATobject));
    //console.log("vt_AT_Obj (AT synthetic) : "+JSON.stringify(ATallowedTermObj));
    //console.log("---Valid terms parent"+ JSON.stringify(parent));
    //console.log("---Valid terms object"+ JSON.stringify(object));
    // console.log("---Valid terms AT parent"+ JSON.stringify(ATparent));
    //ATparent,ATobject,ATallowedTermObj
    //_this = this;
    //_this.parent = parent;

    var arrayLength = -1;
    if (Array.isArray(object)) {
      arrayLength = object.length;
    } else {
      arrayLength = 1;
    }

    //checkAnnotatorConfidence(parentDiv,object);
    var ValidTerm = [];
    var i = 0;
    for (i = 0; i < arrayLength; i++) {
      var subEObject = null;
      if (arrayLength > 1) subEObject = object[i];
      else subEObject = object;
      //prompt("dial",(paramContentDiv.firstChild.className));

      //parentDiv.innerHTML = parentDiv.innerHTML+"<input class=\"ui radio checkbox\" id=\""+subEObject.codeMeaning+" name=\"Nodule Attenuation\" type=\"radio\">";
      //console.log()
      //global array
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
          //callback(this.parentObj);
        },
        callParentObj: function() {
          //console.log("valid term clikc : primitiveObjATSparent  :"+JSON.stringify(this.primitiveObjATSparent));
          return this.ATparent;
        },
        getPrimitive: function() {
          return this.primitiveObj;
        },
        id: subEObject.id,
        subTag: [],
        select: "0"
      };
      //ImagingObservationCharacteristic.push( ImagingObservationCharacteristicObj );
      ValidTerm.push({
        ValidTerm: ValidTermObj
      });
      //global array

      //ar=new createRadio(parent,ids, parent.label, "ui radio checkbox mylbl", false , subEObject.codeValue,ValidTermObj);

      //console.log("in div "+optionElement.getElementsByTagName("label")[0].innerHTML);
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
            "ui checkbox mylbl",
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
            allowTermText + "  " + subEObject.codeMeaning,
            ATallowedTermObj,
            ValidTermObj,
            ATparent
          );
          //console.log("ar ar ar ar :"+ar.getelementHtml().innerHTML);
          //console.log("ar ar ar ar parent div:"+parentDiv.innerHTML);
          selectHolder = paramContentDiv.getElementsByTagName("select")[0];
          selectHolder.appendChild(ar.getelementHtml());
        }
      } else {
        //optionElement.getElementsByTagName("label")[0].innerHTML = allowTermText + " " + subEObject.codeMeaning;
        //this.createRadioVT = function(prObject, id, name, className, checked , lbl,allowedTermObj, validTermObj, vtPrObject){
        var ar = new self.createRadioVT(
          parent,
          subEObject.codeValue,
          ATparent.label,
          "ui radio checkbox mylbl",
          false,
          allowTermText + " " + subEObject.codeMeaning,
          ATallowedTermObj,
          ValidTermObj,
          ATparent
        );
        parentDiv.appendChild(ar.getelementHtml());
      }

      for (var key in subEObject) {
        if (typeof subEObject[key] == "object") {
          //subObject = 1;
          //console.log("key from imageobserv :"+key);
          // self[key](subEObject,subEObject[key],parentDiv,ValidTermObj.subTag,"ValidTerm");
        }
      }
      //push to the global array

      //push to the global array
    }
    //mapTagArray.push({
    //						ImagingObservationCharacteristic: ImagingObservationCharacteristic
    //					}
    //			  );
    //console.log("*******************     ValidTerm --end                      **********************");
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

    //console.log("*******************     GeometricShape                       **********************");
    var GSDiv = document.createElement("div");
    GSDiv.id = "block";

    GSDiv.className = "mylbl";
    GSDiv.style.width = "200px";
    GSDiv.style.height = "20px";
    GSDiv.style.backgroundColor = "white";
    GSDiv.style.color = "black";
    GSDiv.innerHTML = "Required shape : " + object.GeometricShape;
    parentDiv.appendChild(GSDiv);
    //console.log("*******************     GeometricShape --end                      **********************");
  };

  this.AllowedTerm = function(
    parent,
    object,
    parentDiv,
    mapTagArray,
    parentTagTypeFromJson
  ) {
    //console.log("*******************     Allowed Term                       **********************");
    ////console.log("allowed term caled :"+parent+" " + object);

    var athis = this;
    athis.parent = parent;
    //_this.parent = parent;
    athis.obj = object;

    var control;
    var ar = "";
    var validTermButtonClass = "";
    var validTermButtonClassDiv = "";
    var validTermInputType = "";

    //console.log(JSON.stringify(parent));
    var txt = parent.label;
    var maindiv = txt.replace(
      /[`~!@#$%^&*()_|+\-=?;:'",.<>/ /\{\}\[\]\\\/]/gi,
      ""
    );
    var lblTxt = document.createTextNode(parent.label);
    var uiAccordionDiv = document.createElement("div");
    uiAccordionDiv.className = "ui accordion allowedTermlbl";
    var titleDiv = document.createElement("div");
    titleDiv.className = "title active";

    var titleI = document.createElement("i");
    titleI.className = "dropdown icon";
    var contentDiv = document.createElement("div");
    //iconcav
    var iconI = document.createElement("i");
    //iconI.id = (parent.id).replace(/[.*+?^${}()|[\]\\]/g, '');
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
    uiAccordionDiv.style.marginLeft = "20px";

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

    //console.log("each allowed term  array: "+object);

    //console.log(object);
    var arrayLength = -1;
    if (Array.isArray(object)) {
      arrayLength = object.length;
    } else {
      arrayLength = 1;
    }

    var subEObject = null;
    self.checkAnnotatorConfidence(parentDiv, object);
    if (parent.minCardinality == 1 && parent.maxCardinality == 1) {
      control = "radioBtn";
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
      if (arrayLength > 1) subEObject = object[i];
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
          //alert(newValue);
          this.select = newValue;
          this.primitiveObj.select = newValue;
          //callback(this.parentObj);
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
      this.mapAllowedTermCollectionByCodeValue.set(
        allowedTermObj.codeValue,
        unionPrntAlwtermObj
      );
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
            subEObject.codeValue,
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
          validTermButtonClass = "ui checkbox mylbl";
          ar = new self.createCheckbox(
            parent,
            subEObject.codeValue,
            parent.label,
            "ui checkbox mylbl",
            subEObject.codeMeaning,
            subEObject.codeMeaning,
            allowedTermObj
          );
          if (!subEObject.hasOwnProperty("ValidTerm"))
            contentDiv.appendChild(ar.getelementHtml());
          validTermButtonClassDiv = contentDiv;
        }
      } else {
        validTermInputType = "radio";
        validTermButtonClass = "ui radio checkbox mylbl";

        ar = new self.createRadio(
          parent,
          subEObject.codeValue,
          parent.label,
          "ui radio checkbox mylbl",
          false,
          subEObject.codeMeaning,
          allowedTermObj
        );

        if (!subEObject.hasOwnProperty("ValidTerm"))
          contentDiv.appendChild(ar.getelementHtml());
        validTermButtonClassDiv = contentDiv;
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

      //console.log("el el el ******");
      //console.log("writing meaning : writing meaning between"+subEObject.codeMeaning);
    }
    self.subOrderLabelTracking = 64;
    mapTagArray.push({
      AllowedTerm: AllowedTerm
    });
    /*
								$('.accordion1').accordion({
								  selector: {
									  trigger: '.title'
								  }
						  });
*/
    var preselected = "";
    /*	last					  $("#"+selectDiv.id).dropdown({
    								onChange: function (val, text) {
        							
        							//alert("dispatching on clikc :"+text);
        							
        							if (text[0] == '<'){
        								var words = text.split("<label>");
        								var words = words[1].split("</label>");
        									//alert("words :"+words[0]);
        									text = words[0];
									}
        									var evObja = document.createEvent('Events');
    										evObja.initEvent("click", true, false);
    									var k  = 0;
    									for (k= 0 ; k<selectDiv.options.length;k++){

    										if (selectDiv.options[k].value == text){
   								 				selectDiv.options[k].dispatchEvent(evObja);
   								 			}
   								 		}
    								}
							});
*/
    /* $('select[class^="ui dropdown"]').dropdown({
    								onChange: function (val) {
        							
    								}
							});
*/
    // $('select[class^="ui dropdown"]').dropdown('hide');
    // $('#selectF1AnatomicCenter').dropdown('setting', 'onChange', function(value){console.log(value);});

    // $("#selectF3FunctionalBrainatRiskofResection").dropdown();

    //console.log("000000000"+JSON.stringify(mapTagArray));
    //console.log(mapTagArray.length);
    //console.log("*******************     Allowed Term---end                       **********************");
  };

  this.ImagingObservation = function(
    parent,
    object,
    parentDiv,
    mapTagArray,
    parentTagTypeFromJson
  ) {
    var _self = this;
    //console.log("*******************     ImagingObservation                       **********************");
    //console.log("imaging observation caled : "+parent+" " + object);
    //console.log("imaging observation:"+parent);
    //console.log("image observation characteristic : "+object.ImagingObservationCharacteristic);
    //console.log("*******************     ImagingObservation--end                       **********************");
    //if (object.annotatorConfidence=="true")

    //add global array
    var arrayLength = -1;
    if (Array.isArray(object)) {
      arrayLength = object.length;
    } else {
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
      // ImagingObservation.push( ImagingObservationObj );
      ImagingObservation.push({
        ImagingObservation: ImagingObservationObj
      });

      //add global array

      //console.log(ImagingObservation);
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
    //console.log("*******************     ImagingObservationCharacteristic                       **********************");
    var _self = this;

    var arrayLength = -1;
    if (Array.isArray(object)) {
      arrayLength = object.length;
    } else {
      arrayLength = 1;
    }

    self.checkAnnotatorConfidence(parentDiv, object);
    self.checkIfCommentRequired(object, parentDiv);
    var ImagingObservationCharacteristic = [];
    var i = 0;
    var subEObject;
    for (i = 0; i < arrayLength; i++) {
      subEObject = null;
      if (arrayLength > 1) subEObject = object[i];
      else subEObject = object;

      //global array
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
      //ImagingObservationCharacteristic.push( ImagingObservationCharacteristicObj );
      ImagingObservationCharacteristic.push({
        ImagingObservationCharacteristic: ImagingObservationCharacteristicObj
      });
      //global array
      for (var key in subEObject) {
        if (typeof subEObject[key] == "object") {
          //subObject = 1;
          //console.log("key from imageobserv :"+key);
          self[key](
            subEObject,
            subEObject[key],
            parentDiv,
            ImagingObservationCharacteristicObj.subTag,
            ImagingObservationCharacteristicObj.type
          );
        }
      }
      //push to the global array

      //push to the global array
    }
    mapTagArray.push({
      ImagingObservationCharacteristic: ImagingObservationCharacteristic
    });
    //document.getElementById("accordion1").innerHTML+="</div>";
    //console.log("*******************     ImagingObservationCharacteristic--end                       **********************");
  };

  this.CharacteristicQuantification = function(
    parent,
    object,
    parentDiv,
    mapTagArray,
    parentTagTypeFromJson,
    subOrderLabel
  ) {
    //console.log("*******************     CharacteristicQuantification                       **********************");
    //console.log(parent);
    //console.log(object);

    var arrayLength = -1;
    if (Array.isArray(object)) {
      arrayLength = object.length;
    } else {
      arrayLength = 1;
    }
    var subEObject = null;
    self.checkAnnotatorConfidence(parentDiv, object);

    var CharacteristicQuantification = [];
    var i = 0;
    for (i = 0; i < arrayLength; i++) {
      if (arrayLength > 1) subEObject = object[i];
      else subEObject = object;
      //global array

      var scaleHolderDiv = document.createElement("div");
      scaleHolderDiv.className = "mylbl";
      var label = document.createElement("label");
      //label for sub object to follow allowed terms
      var aHref = document.createElement("div");
      aHref.className = "ui label blue tiny";

      var _subOrderLabel = String.fromCharCode(self.subOrderLabelTracking);
      var aHrefText = document.createTextNode(_subOrderLabel);
      label.textContent = _subOrderLabel + "--" + subEObject.name;

      scaleHolderDiv.appendChild(aHref);
      aHref.appendChild(aHrefText);
      scaleHolderDiv.appendChild(label);

      parentDiv.appendChild(scaleHolderDiv);

      //subOrderLabelTracking = subOrderLabelTracking+1;
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
      //global array
      for (var key in subEObject) {
        if (typeof subEObject[key] == "object") {
          //subObject = 1;
          //console.log(key);
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
      //push to the global array
      mapTagArray.push({
        CharacteristicQuantification: CharacteristicQuantification
      });
      //push to the global array
    }

    //console.log("*******************     CharacteristicQuantification --end                     **********************");
  };

  this.AnatomicEntity = function(
    parent,
    object,
    parentDiv,
    mapTagArray,
    parentTagTypeFromJson
  ) {
    //console.log("AnatomicEntity");

    //console.log("*******************     AnatomicEntity                     **********************");

    var arrayLength = -1;
    if (Array.isArray(object)) {
      arrayLength = object.length;
    } else {
      arrayLength = 1;
    }

    self.checkAnnotatorConfidence(parentDiv, object);
    var i = 0;
    for (i = 0; i < arrayLength; i++) {
      var subEObject = null;
      if (arrayLength > 1) subEObject = object[i];
      else subEObject = object;

      for (var key in subEObject) {
        if (typeof subEObject[key] == "object") {
          //subObject = 1;
          ////console.log("ssssssss"+key);
          self[key](subEObject, subEObject[key], parentDiv, mapTagArray, null);
        }
      }
      //editing

      var clabel = document.createElement("label");
      // clabel.textContent =  "cavit";
      parentDiv.appendChild(clabel);
    }
    //console.log("*******************     AnatomicEntity   --end                  **********************");
  };

  this.AnatomicEntityCharacteristic = function(
    parent,
    object,
    parentDiv,
    mapTagArray,
    parentTagTypeFromJson
  ) {
    //console.log("AnatomicEntityCharacteristic");
    //console.log("*******************     AnatomicEntityCharacteristic                  **********************");
    var arrayLength = -1;
    if (Array.isArray(object)) {
      arrayLength = object.length;
    } else {
      arrayLength = 1;
    }

    self.checkAnnotatorConfidence(parentDiv, object);
    self.checkIfCommentRequired(object, parentDiv);

    var i = 0;
    for (i = 0; i < arrayLength; i++) {
      var subEObject = null;
      if (arrayLength > 1) subEObject = object[i];
      else subEObject = object;

      for (var key in subEObject) {
        if (typeof subEObject[key] == "object") {
          //subObject = 1;
          //console.log(key);
          self[key](subEObject, subEObject[key], parentDiv, mapTagArray, null);
        }
      }
    }
    //console.log("*******************     AnatomicEntityCharacteristic  --end                **********************");
  };

  this.annotatorConfidence = function(
    parent,
    object,
    parentDiv,
    mapTagArray,
    parentTagTypeFromJson
  ) {
    //console.log("annotatorConfidence");
    console.log(
      "*******************     annotatorConfidence                **********************"
    );

    var arrayLength = -1;
    if (Array.isArray(object)) {
      arrayLength = object.length;
    } else {
      arrayLength = 1;
    }
    var subEObject = null;
    var i = 0;
    for (i = 0; i < arrayLength; i++) {
      if (arrayLength > 1) subEObject = object[i];
      else subEObject = object;

      for (var key in subEObject) {
        if (typeof subEObject[key] == "object") {
          //subObject = 1;
          //console.log(key);
          self[key](subEObject, subEObject[key], parentDiv, mapTagArray, null);
        }
      }
    }
    //console.log("*******************     annotatorConfidence     --end           **********************");
  };

  this.Scale = function(
    parent,
    object,
    parentDiv,
    mapTagArray,
    parentTagTypeFromJson,
    subOrderLabel
  ) {
    //console.log("Scale");
    //console.log("*******************     Scale                **********************");
    var _subOrderLabel = String.fromCharCode(subOrderLabel);
    var arrayLength = -1;
    if (Array.isArray(object)) {
      arrayLength = object.length;
    } else {
      arrayLength = 1;
    }
    var subEObject = null;
    self.checkAnnotatorConfidence(parentDiv, object);
    var i = 0;
    for (i = 0; i < arrayLength; i++) {
      if (arrayLength > 1) subEObject = object[i];
      else subEObject = object;

      var scaleHolderDiv = document.createElement("div");
      scaleHolderDiv.className = "mylbl";
      var label = document.createElement("label");
      label.textContent = _subOrderLabel + "-" + parent.name;
      //scaleHolderDiv.appendChild(label);
      parentDiv.appendChild(scaleHolderDiv);

      for (var key in subEObject) {
        if (typeof subEObject[key] == "object") {
          self[key](
            subEObject,
            subEObject[key],
            scaleHolderDiv,
            mapTagArray,
            null
          );
        }
      }
    }
    //console.log("*******************     Scale     --end           **********************");
  };

  this.ScaleLevel = function(
    parent,
    object,
    parentDiv,
    mapTagArray,
    parentTagTypeFromJson
  ) {
    //console.log("ScaleLevel");
    //console.log("*******************     ScaleLevel                **********************");
    var arrayLength = -1;
    var quantileDiv = document.createElement("div");
    var quantileSelect = document.createElement("select");
    selectid++;
    quantileSelect.id = selectid;
    quantileSelect.addEventListener("change", function() {
      var i = 0;
      var scaleArraysize = object.length;
      for (i = 0; i < scaleArraysize; i++) {
        if (object[i].value == this.value) object[i].select = "1";
        else object[i].select = "0";
      }
    });
    quantileSelect.className = "ui dropdown mylbl";
    quantileDiv.appendChild(quantileSelect);
    parentDiv.appendChild(quantileDiv);
    if (Array.isArray(object)) {
      arrayLength = object.length;
    } else {
      arrayLength = 1;
    }
    var subEObject = null;
    self.checkAnnotatorConfidence(parentDiv, object);
    for (var i = 0; i < arrayLength; i++) {
      if (arrayLength > 1) subEObject = object[i];
      else subEObject = object;
      for (var key in subEObject) {
        if (typeof subEObject[key] == "object") {
          //subObject = 1;
          //console.log(key);
          self[key](subEObject, subEObject[key], parentDiv, mapTagArray, null);
        }
      }

      var quantileOption = document.createElement("option");

      quantileOption.innerHTML = subEObject.value;
      quantileSelect.appendChild(quantileOption);
    }

    //console.log("*******************     ScaleLevel     --end           **********************");
  };
  this.followSubAllowed = function() {};

  this.Numerical = function(
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
    quantileSelect.id = selectid;
    quantileSelect.addEventListener("change", function() {
      var i = 0;
      var scaleArraysize = object.length;
      for (i = 0; i < scaleArraysize; i++) {
        var createFormValue =
          mathOperators.get(object[i].operator) +
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
    if (Array.isArray(object)) {
      arrayLength = object.length;
    } else {
      arrayLength = 1;
    }
    var subEObject = null;
    self.checkAnnotatorConfidence(parentDiv, object);
    for (var i = 0; i < arrayLength; i++) {
      if (arrayLength > 1) subEObject = object[i];
      else subEObject = object;
      for (var key in subEObject) {
        if (typeof subEObject[key] == "object") {
          //subObject = 1;
          //console.log(key);
          self[key](subEObject, subEObject[key], parentDiv, mapTagArray, null);
        }
      }

      var quantileOption = document.createElement("option");
      quantileOption.innerHTML =
        mathOperators.get(subEObject.operator) +
        " " +
        subEObject.valueLabel +
        " " +
        subEObject.ucumString;
      quantileSelect.appendChild(quantileOption);
      //console.log(subEObject.valueLabel +"  "+subEObject.operator+"  "+subEObject.value);
    }
    //console.log("*******************     Numerical --end                     **********************");
  };

  this.Quantile = function(
    parent,
    object,
    parentDiv,
    mapTagArray,
    parentTagTypeFromJson
  ) {
    //console.log("*******************     Quantile                    **********************");

    //console.log("Quantile");

    var arrayLength = -1;
    if (Array.isArray(object)) {
      arrayLength = object.length;
    } else {
      arrayLength = 1;
    }
    var subEObject = null;
    self.checkAnnotatorConfidence(parentDiv, object);
    for (var i = 0; i < arrayLength; i++) {
      if (arrayLength > 1) subEObject = object[i];
      else subEObject = object;
      for (var key in subEObject) {
        if (typeof subEObject[key] == "object") {
          //subObject = 1;
          //console.log(key);
          self[key](subEObject, subEObject[key], parentDiv, mapTagArray, null);
        }
      }
      var quantileDiv = document.createElement("div");
      quantileDiv.className = "mylbl";
      var quantileSelect = document.createElement("select");
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
    }
  };

  this.Interval = function(
    parent,
    object,
    parentDiv,
    mapTagArray,
    parentTagTypeFromJson
  ) {
    var arrayLength = -1;
    if (Array.isArray(object)) {
      arrayLength = object.length;
    } else {
      arrayLength = 1;
    }
    var subEObject = null;
    self.checkAnnotatorConfidence(parentDiv, object);
    var intervalDiv = document.createElement("div");
    intervalDiv.className = "mylbl";
    var intervalSelect = document.createElement("select");
    intervalSelect.className = "ui dropdown mylbl";

    selectid++;
    intervalSelect.id = selectid;
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
      if (arrayLength > 1) subEObject = object[i];
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
    quantileSelect.id = selectid;
    quantileSelect.addEventListener("change", function() {
      var i = 0;
      var scaleArraysize = object.length;
      for (i = 0; i < scaleArraysize; i++) {
        alert(
          "object value : " + object[i].codeMeaning + " this : " + this.value
        );
        if (object[i].codeMeaning == this.value) object[i].select = "1";
        else object[i].select = "0";
      }
    });
    quantileDiv.appendChild(quantileSelect);
    parentDiv.appendChild(quantileDiv);
    if (Array.isArray(object)) {
      arrayLength = object.length;
    } else {
      arrayLength = 1;
    }
    var subEObject = null;
    self.checkAnnotatorConfidence(parentDiv, object);
    for (var i = 0; i < arrayLength; i++) {
      if (arrayLength > 1) subEObject = object[i];
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
    var _self = this;
    _self.par = prObject;
    _self.id = id;
    _self.name = name;
    _self.checked = checked;
    _self.className = className;
    _self.lbl = lbl;
    var div = document.createElement("div");
    div.className = _self.className;
    var label = document.createElement("label");
    label.textContent = _self.lbl;
    var radioInput = document.createElement("input");
    radioInput.type = "radio";
    radioInput.className = "ui radio checkbox";
    radioInput.id = _self.id;
    radioInput.name = _self.name;
    radioInput.checked = _self.checked;

    div.appendChild(radioInput);
    div.appendChild(label);

    radioInput.onclick = function() {
      alert(allowedTermObj.codeMeaning);

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

      //console.log("printing parent on click: (create radio AT)"+JSON.stringify(prObject));

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
          _self.par.id,
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
    };

    this.getelementHtml = function() {
      return div;
    };
    self.mapHtmlObjects.set(allowedTermObj.codeValue, radioInput);
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
    //for one select option (radio box collection)
    //console.log("______createRadio AT: "+JSON.stringify(allowedTermObj));
    //console.log("______createRadio VT: "+JSON.stringify(validTermObj));
    //console.log("______createRadio VT pr: "+JSON.stringify(vtPrObject));

    var _self = this;
    _self.allowedTermObj = validTermObj;
    _self.par = prObject;
    _self.id = id;
    _self.name = name;
    _self.checked = checked;
    _self.className = className;
    _self.lbl = lbl;
    var div = document.createElement("div");
    div.className = _self.className;
    var label = document.createElement("label");
    label.textContent = _self.lbl;
    var radioInput = document.createElement("input");
    radioInput.type = "radio";
    radioInput.className = "ui radio checkbox";
    radioInput.id = _self.id;
    radioInput.name = _self.name;
    radioInput.checked = _self.checked;

    div.appendChild(radioInput);
    div.appendChild(label);

    radioInput.onclick = function() {
      //console.log("______valid term");
      //console.log("______createRadio VT parent: "+JSON.stringify(prObject));
      //console.log("______valid term object: "+JSON.stringify(validTermObj));
      //alert("validTerm");
      //cavit adding valid term parent select
      prObject.select = "1";
      var getAllowTGroup = validTermObj.primitiveObjATSparent;
      var checkmarkObj;

      //console.log("at paretnt call : "+ JSON.stringify(validTermObj.callParentObj()));
      //console.log("getAllowTGroup.AllowedTerm.length : "+getAllowTGroup.AllowedTerm.length);
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
      //console.log("+++++ : "+JSON.stringify(getAllowTGroup));
      allowedTermObj.select = "1";
      allowedTermObj.changeOnSelect(
        "1",
        self.AfterClick(allowedTermObj.callParentObj())
      );

      checkmarkObj = self.mapCardinalitiesToCheckId.get(
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
    };

    //document.addEventListener('click', this.check.bind(this) );

    this.getelementHtml = function() {
      return div;
    };

    self.mapHtmlObjects.set(_self.allowedTermObj.codeValue, radioInput);
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
    var _self = this;
    _self.allowedTermObj = allowedTermObj;
    _self.par = prObject;
    //this.id = id.replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, '');
    _self.id = id;
    _self.name = name;
    _self.value = name;
    _self.checked = checked;
    _self.className = className;
    _self.lbl = lbl;
    var div = document.createElement("div");
    div.className = _self.className;
    var labelHolder = document.createElement("label");
    var label = document.createTextNode(_self.lbl);

    var square = document.createElement("div");
    square.className = "ui mini Tiny blue label";
    var lab = document.createTextNode(
      String.fromCharCode(self.subOrderLabelTracking) + "-"
    );
    square.appendChild(lab);

    var optionInput = document.createElement("option");
    optionInput.id = _self.id;
    optionInput.name = _self.name;
    optionInput.checked = _self.checked;
    optionInput.value = _self.lbl;
    //div.appendChild(radioInput);

    div.appendChild(optionInput);
    optionInput.appendChild(square);
    optionInput.appendChild(labelHolder);
    labelHolder.appendChild(label);

    optionInput.addEventListener("click", function() {
      var checkmarkObj;
      checkmarkObj = self.mapCardinalitiesToCheckId.get(prObject.id);
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

      //console.log("printing parent on click: (option AT)"+JSON.stringify( allowedTermObj.getPrimitive()));
      //console.log("printing parent on click: (option)"+JSON.stringify(validTermObj.getPrimitive()));

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
    var _self = this;
    _self.allowedTermObj = validTermObj;
    _self.par = prObject;
    //this.id = id.replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, '');
    _self.id = id;
    _self.name = name;
    _self.value = name;
    _self.checked = checked;
    _self.className = className;
    _self.lbl = lbl;
    var div = document.createElement("div");
    div.className = _self.className;
    var labelHolder = document.createElement("label");
    var label = document.createTextNode(_self.lbl);

    var square = document.createElement("div");
    square.className = "ui mini Tiny blue label";
    var lab = document.createTextNode(
      String.fromCharCode(self.subOrderLabelTracking) + "-"
    );
    square.appendChild(lab);

    var optionInput = document.createElement("option");
    optionInput.id = _self.id;
    optionInput.name = _self.name;
    optionInput.checked = _self.checked;
    optionInput.value = _self.lbl;
    //div.appendChild(radioInput);

    div.appendChild(optionInput);
    optionInput.appendChild(square);
    optionInput.appendChild(labelHolder);
    labelHolder.appendChild(label);

    optionInput.addEventListener("click", function() {
      console.log("create option VT drop down");
      var checkmarkObj;
      checkmarkObj = self.mapCardinalitiesToCheckId.get(vtPrObject.id);
      checkmarkObj.ok = "true";
      //console.log("printing parent on click: (option VT)"+JSON.stringify( allowedTermObj.getPrimitive()));
      //console.log("printing parent on click: (option VT)"+JSON.stringify(validTermObj.getPrimitive()));

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
      //console.log("after drop down clik");
      //console.log("printing parent on click: (option VT)"+JSON.stringify( allowedTermObj.getPrimitive()));
      //console.log("printing parent on click: (option VT)"+JSON.stringify(validTermObj.getPrimitive()));

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
    var _self = this;
    _self.allowedTermObj = allowedTermObj;
    this.par = prObject;
    //this.id = id.replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, '');
    this.allowedTermObj = allowedTermObj;
    this.id = id;
    this.name = name;
    this.className = className;
    this.value = value;
    this.lbl = lbl;
    var div = document.createElement("div");
    div.className = this.className;
    var label = document.createElement("label");
    label.textContent = this.lbl;
    var checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "ui checkbox";
    checkbox.name = this.name;
    checkbox.value = this.value;
    checkbox.id = this.id;
    div.appendChild(checkbox);
    div.appendChild(label);
    // document.getElementById(this.par).appendChild(div);
    this.getelementHtml = function() {
      return div;
    };

    checkbox.onclick = function() {
      var checkmarkObj;
      allowedTermObj.changeOnSelect("1", self.AfterClick);

      alert(prObject.id);
      checkmarkObj = self.mapCardinalitiesToCheckId.get(prObject.id);
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
      )
        document.getElementById(prObject.id).className =
          "green check circle outline icon";
      else
        document.getElementById(prObject.id).className =
          "red check circle outline icon";
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
    var _self = this;
    _self.allowedTermObj = validTermObj;
    this.par = prObject;
    //this.id = id.replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, '');
    this.allowedTermObj = validTermObj;
    this.id = id;
    this.name = name;
    this.className = className;
    this.value = value;
    this.lbl = lbl;
    var div = document.createElement("div");
    div.className = this.className;
    var label = document.createElement("label");
    label.textContent = this.lbl;
    var checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "ui checkbox";
    checkbox.name = this.name;
    checkbox.value = this.value;
    checkbox.id = this.id;
    div.appendChild(checkbox);
    div.appendChild(label);
    // document.getElementById(this.par).appendChild(div);
    this.getelementHtml = function() {
      return div;
    };

    checkbox.onclick = function() {
      var checkmarkObj;
      validTermObj.changeOnSelect("1", self.AfterClick);

      alert(vtPrObject.id);
      checkmarkObj = self.mapCardinalitiesToCheckId.get(vtPrObject.id);
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
    };
  };

  this.checkValidationTosave = function() {
    console.clear();
    for (var property1 in domelements) {
      //console.log('id : '+domelements[property1]['id']);
      //console.log('label : '+domelements[property1]['label']);
      //console.log('min : '+domelements[property1]['min']);
      //console.log('max : '+domelements[property1]['max']);
      //console.log('selected cnt : '+domelements[property1]['selectedCnt']);
      if (domelements[property1]["selectVerification"] == true)
        console.log("true");
      else console.log("false");
    }
  };
  this.checkAnnotatorConfidence = function(prentDiv, objectToCheckAnnConf) {
    if (typeof objectToCheckAnnConf.annotatorConfidence != "undefined") {
      // Assign value to the property here
      if (objectToCheckAnnConf.annotatorConfidence == "true") {
        var annotConfDiv = document.createElement("div");
        var annotConfInput = document.createElement("input");
        annotConfInput.setAttribute("id", "range-1");
        annotConfInput.setAttribute("type", "range");
        annotConfInput.setAttribute("min", "0");
        annotConfInput.setAttribute("max", "100");
        annotConfInput.setAttribute("start", "0");
        annotConfInput.setAttribute("input", "input-1");
        annotConfInput.value = 0;

        annotConfInput.onchange = function() {
          annotConfShowValueInput.value = this.value;
          objectToCheckAnnConf.select = this.value;
          //console.log("Sub Object :"+JSON.stringify(objectToCheckAnnConf))
        };
        annotConfDiv.className = "ui range";

        var annotConfShowValueInput = document.createElement("input");
        annotConfShowValueInput.style.width = "52px";
        annotConfShowValueInput.style.height = "28px";
        //annotConfShowValueInput.style.float = "left";
        annotConfShowValueInput.setAttribute("type", "text");
        annotConfShowValueInput.setAttribute("class", "ui  input");
        annotConfShowValueInput.setAttribute("id", "input-1");
        annotConfShowValueInput.value = 0;

        var annotConfShowValueInputDiv = document.createElement("div");
        annotConfShowValueInputDiv.setAttribute(
          "class",
          "ui input disabled small"
        );

        annotConfDiv.appendChild(annotConfInput);
        prentDiv.appendChild(annotConfDiv);
        annotConfDiv.appendChild(annotConfShowValueInputDiv);
        annotConfShowValueInputDiv.appendChild(annotConfShowValueInput);
      }
    }
  };

  this.print = function() {
    //console.log(maptag.length);
    //console.log(Object.keys(maptag[1]));
    //console.log(maptag);
  };
  var disabledefined = [];
  this.DisableTillNext = function(actualid, nextid, call) {
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

          //$(ely.parentNode).dropdown({action: 'hide'});
          //							$(ely.parentNode).dropdown().hide();
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

          //							$(ely.parentNode).dropdown().show();
        } else nextControl = 0;
      }
    }
    self.callDisable();
  };
  this.callDisable = function() {
    //document.getElementById(key).className = "blue check circle outline icon";
    //console.log("disabled :"+JSON.stringify(mapStatusAllowedTermBlocks));
    for (var [key, value] of self.mapStatusAllowedTermBlocks) {
      console.log(
        "mapStatusAllowedTermBlocks" + key + " = " + JSON.stringify(value)
      );
    }
  };

  this.solveAim = function(object, son) {
    //extracts components from object (maptag)
    let componentSize = object.length;
    var i;
    for (i = 0; i < componentSize; i++) {
      //console.log("i:"+i)
      self.solveAimCompnent(object[i][0]);
    }
  };

  this.solveAimCompnent = function(object) {
    //console.log("----solveAimCompnent"+(maptag.length));
    //	console.log("----object  "+JSON.stringify(object));
    //	console.log("----component"+JSON.stringify(object.component));
    //console.log("----component sub tag"+JSON.stringify(object.component.subTag[0].ImagingObservation));
  };

  this.AfterClick = function(obj) {
    //console.log("callback 00000000 :"+JSON.stringify(obj));mapCardinalitiesToCheckId

    console.log(
      "callback 00000000 :" +
        JSON.stringify(self.mapAllowedTermCollectionByCodeValue.size)
    );
  };

  this.printXmlAim = function(data, xmlArray) {
    var oSerializer = new XMLSerializer();
    var sXML = oSerializer.serializeToString(data);

    console.log(
      "..................................................aim Saved data" +
        JSON.stringify(sXML)
    );
    for (var i = 0; i < xmlArray.length; i++) {
      var arrayXML = oSerializer.serializeToString(xmlArray[i].value);
      console.log(
        "..................................................xml array data" +
          JSON.stringify(arrayXML)
      );
    }
  };
  //load aim
  this.loadAim = function(aimFileXml) {
    //document.getElementById("S1").selectedIndex = 11;
    // $('#S1').trigger("change");

    if (aimFileXml == "") {
      aimFileXml = self.textXml;
      console.log("empty self.text");
    } else {
      self.textXml = aimFileXml;
      console.log("assigning self.text");
    }

    console.log("self.txt   :" + self.textXml);
    //console.log("drop down : "+(document.getElementById["selectSegmentalLocation"]));
    var evObj = document.createEvent("Events");
    evObj.initEvent("click", true, true);

    var parser = new window.DOMParser();
    var xmlDoc = parser.parseFromString(self.textXml, "text/xml");

    //get Template code value to select the correct template for the aim
    var templateNameImageAnnotations = xmlDoc.getElementsByTagName(
      "imageAnnotations"
    );
    var templateNameImageAnnotation = templateNameImageAnnotations[0].getElementsByTagName(
      "typeCode"
    );
    var templateCodeValue = templateNameImageAnnotation[0].getAttribute("code");
    //console.log("size"+templateNameImageAnnotations[0].innerHTML);
    console.log("code value " + templateCodeValue);

    //console.log("loading aim:"+ JSON.stringify(templateNameImageAnnotations[0]));

    //end check codevalue from aim
    var templateIndex = self.mapTemplateCodeValueByIndex.get(templateCodeValue);

    self.templateSelect.selectedIndex = templateIndex + 1;
    self.extractTemplate(self.arrayTemplatesJsonObjects[templateIndex].value);

    var typeCodeCollection = xmlDoc.getElementsByTagName("typeCode");
    for (var i = 0; i < typeCodeCollection.length; i++) {
      let codeValue = typeCodeCollection[i].getAttribute("code");
      let allowedTermObj = self.mapAllowedTermCollectionByCodeValue.get(
        codeValue
      );

      var docElement = document.getElementById(codeValue);
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
          //						$(subDivs[0]).dropdown({ allowLabels:true});

          //					$(subDivs[0]).dropdown('set selected',[splittedLabel[1]]);
        } else {
          docElement.checked = true;
        }
      }
    }

    //self.checkSaveReady();
  };

  //load aim end
  this.readx = function readx(evt) {
    return self.readFile(evt);
  };

  //return self.loadAim(self.textXml, self.checkSaveReady);

  this.readFile = function(e) {
    //Retrieve all the files from the FileList object

    var file = e.target.files[0];
    if (!file) {
      return;
    }
    var reader = new FileReader();
    reader.onload = function(e) {
      var contents = e.target.result;
      self.textXml = contents;
      // Display file content
      //displayContents(contents);
    };
    reader.readAsText(file);

    // return self.loadAim(self.textXml, self.checkSaveReady);
  };

  // Save Aim
  this.savetextFreeInput = function(
    parentArray,
    parentObject,
    itself,
    Entitytype,
    xmlParent,
    xmldoc
  ) {};

  this.saveQuestionType = function(
    parentArray,
    parentObject,
    itself,
    Entitytype,
    xmlParent,
    xmldoc
  ) {};

  this.saveAlgorithmType = function(
    parentArray,
    parentObject,
    itself,
    Entitytype,
    xmlParent,
    xmldoc
  ) {};

  this.saveCalculationType = function(
    parentArray,
    parentObject,
    itself,
    Entitytype,
    xmlParent,
    xmldoc
  ) {
    //console.log("calc type");
  };

  this.saveCalculation = function(
    parentArray,
    parentObject,
    itself,
    Entitytype,
    xmlParent,
    xmldoc
  ) {
    //console.log("calculation");
  };

  this.saveInference = function(
    parentArray,
    parentObject,
    itself,
    Entitytype,
    xmlParent,
    xmldoc
  ) {
    //console.log("inference");
  };

  this.saveComponent = function(
    parentArray,
    parentObject,
    itself,
    Entitytype,
    xmlParent,
    xmldoc
  ) {};

  //****************** used components ***********************************
  this.saveValidTerm = function(
    parentArray,
    parentObject,
    itself,
    Entitytype,
    xmlParent,
    xmldoc
  ) {
    alert("saveValid");
    //coorect it
    //console.log("valid term");
    //console.log("itself "+JSON.stringify(itself));

    var _inself = this;
    var parentHolder = [];
    var prntObject = null;
    //parentHolder = JSON.parse(JSON.stringify(parentArray));
    //console.log("&&&&&& char "+JSON.stringify(itself.value));
    var ValidTerms = itself.value;
    var defaultCodeValue = "";
    var defaultCodingSchemeDesignator = "";
    var defaultCodingSchemeVersion = "";
    var defaultCodeMeaning = "";
    var oSerializer = new XMLSerializer();
    var arraySize = -1;
    var arrayCheck = false;
    if (Array.isArray(ValidTerms)) {
      arraySize = ValidTerms.length;
      arrayCheck = true;
    } else {
      arraySize = 1;
    }
    var serializeXml = oSerializer.serializeToString(xmlParent);
    var Before = JSON.stringify(serializeXml);
    //console.log("Before"+Before);
    var i = 0;
    for (i = 0; i < arraySize; i++) {
      if (arrayCheck == true) {
        var instanceObject = ValidTerms[i];
      } else {
        var instanceObject = ValidTerms;
      }
      //console.log("valid term ____"+JSON.stringify(instanceObject));
      var prntObject = {
        type: "ValidTerm",
        value: instanceObject
      };
      if (i == 0 && arraySize == 1) {
        //alert(instanceObject.value);
        defaultCodeValue = instanceObject.codeValue;
        defaultCodingSchemeDesignator = instanceObject.codingSchemeDesignator;
        defaultCodingSchemeVersion = instanceObject.codingSchemeVersion;
        defaultCodeMeaning = instanceObject.codeMeaning;

        var allowedTermxmlTypeCode = xmldoc.createElement("typeCode");
        allowedTermxmlTypeCode.setAttribute("code", instanceObject.codeValue);
        allowedTermxmlTypeCode.setAttribute(
          "codeSystemName",
          instanceObject.codingSchemeDesignator
        );
        allowedTermxmlTypeCode.setAttribute(
          "codeSystemVersion",
          instanceObject.codingSchemeVersion
        );

        var allowedTermxmlTypeCodeValue = xmldoc.createElement(
          "iso:displayName"
        );
        allowedTermxmlTypeCodeValue.setAttribute(
          "xmlns:iso",
          "uri:iso.org:21090"
        );
        allowedTermxmlTypeCodeValue.setAttribute(
          "value",
          instanceObject.codeMeaning
        );

        allowedTermxmlTypeCode.appendChild(allowedTermxmlTypeCodeValue);
        xmlParent.appendChild(allowedTermxmlTypeCode);
      } else {
        if (instanceObject.hasOwnProperty("select")) {
          if (instanceObject.select == "1") {
            defaultCodeValue = instanceObject.codeValue;
            defaultCodingSchemeDesignator =
              instanceObject.codingSchemeDesignator;
            defaultCodingSchemeVersion = instanceObject.codingSchemeVersion;
            defaultCodeMeaning = instanceObject.codeMeaning;

            var allowedTermxmlTypeCode = xmldoc.createElement("typeCode");
            allowedTermxmlTypeCode.setAttribute(
              "code",
              instanceObject.codeValue
            );
            allowedTermxmlTypeCode.setAttribute(
              "codeSystemName",
              instanceObject.codingSchemeDesignator
            );
            allowedTermxmlTypeCode.setAttribute(
              "codeSystemVersion",
              instanceObject.codingSchemeVersion
            );

            var allowedTermxmlTypeCodeValue = xmldoc.createElement(
              "iso:displayName"
            );
            allowedTermxmlTypeCodeValue.setAttribute(
              "xmlns:iso",
              "uri:iso.org:21090"
            );
            allowedTermxmlTypeCodeValue.setAttribute(
              "value",
              instanceObject.codeMeaning
            );
            allowedTermxmlTypeCode.appendChild(allowedTermxmlTypeCodeValue);
            xmlParent.appendChild(allowedTermxmlTypeCode);
          }
        }
      }

      //No further component under validterm
      /*
								
								for (var key in instanceObject) {

									if (typeof instanceObject[key] == "object"){
									_inself.parentHolder.push(_inself.prntObject);
									//console.log("++ImagingObservationCharacteristics term is calling sub "+key+": value : "+JSON.stringify(instanceObject[key]));
										var subObject = {
											type  : key,
											value : instanceObject[key]
										}
										

										//console.log("allowedTerm value :"+subObject.value.codeValue);
										
										//parentHolder -> each component creates it's own copy of the array and passes to the next object
										//componentOpject is the parent object for the callee
										//is the callee object
										//Entitytype should be null from this point 
										self["save"+key](_inself.parentHolder,_inself.prntObject,subObject, Entitytype, xmlParent , xmldoc);
									}
								}
								*/
    }
    serializeXml = oSerializer.serializeToString(xmlParent);
    var After = JSON.stringify(serializeXml);
    //console.log(":::::::::::after Valid term"+After);
  };

  this.saveInterval = function(
    parentArray,
    parentObject,
    itself,
    Entitytype,
    xmlParent,
    xmldoc
  ) {
    //console.log("interval");
    //console.log("interval"+JSON.stringify(itself));
    var _inself = this;
    var parentHolder = [];
    var prntObject = null;
    parentHolder = JSON.parse(JSON.stringify(parentArray));
    //console.log("&&&&&& char "+JSON.stringify(itself.value));
    var Intervals = itself.value;

    var arraySize = -1;
    var arrayCheck = false;
    if (Array.isArray(Intervals)) {
      arraySize = Intervals.length;
      arrayCheck = true;
    } else {
      arraySize = 1;
    }

    var defaultMaxOperator = "";
    var defaultMinOperator = "";
    var defaultMinValue = "";
    var defaultMaxValue = "";
    var defaultUcumString = "";
    var defaultValue = "";

    var xmlCharacteristicQuantification = xmldoc.createElement(
      "CharacteristicQuantification"
    );

    var xmlAnnotatorConfidence = xmldoc.createElement("annotatorConfidence");
    xmlAnnotatorConfidence.setAttribute("value", parentObject.value.select);

    var xmlLabel = xmldoc.createElement("label");

    var xmlMinValue = xmldoc.createElement("minValue");
    var xmlMaxValue = xmldoc.createElement("maxValue");
    var xmlUcumString = xmldoc.createElement("ucumString");

    xmlCharacteristicQuantification.appendChild(xmlAnnotatorConfidence);

    var i = 0;
    for (i = 0; i < arraySize; i++) {
      if (arrayCheck == true) {
        var instanceObject = Intervals[i];
      } else {
        var instanceObject = Intervals;
      }

      var prntObject = {
        type: "Intervals",
        value: instanceObject
      };
      if (i == 0) {
        //alert(instanceObject.value);
        defaultMaxOperator = instanceObject.maxOperator;
        defaultMinOperator = instanceObject.minOperator;
        defaultMinValue = instanceObject.minValue;
        defaultMaxValue = instanceObject.maxValue;
        defaultUcumString = instanceObject.ucumString;
        defaultValue = instanceObject.valueLabel;
      } else {
        if (instanceObject.hasOwnProperty("select")) {
          if (instanceObject.select == "1") {
            defaultMaxOperator = instanceObject.maxOperator;
            defaultMinOperator = instanceObject.minOperator;
            defaultMinValue = instanceObject.minValue;
            defaultMaxValue = instanceObject.maxValue;
            defaultUcumString = instanceObject.ucumString;
            defaultValue = instanceObject.valueLabel;
          }
        }
      }

      // no further subcomponent
      /*
								for (var key in instanceObject) {

									if (typeof instanceObject[key] == "object"){
									parentHolder.push(prntObject);
									//console.log("++ImagingObservationCharacteristics term is calling sub "+key+": value : "+JSON.stringify(instanceObject[key]));
										var subObject = {
											type  : key,
											value : instanceObject[key]
										}
										

										//console.log("allowedTerm value :"+subObject.value.codeValue);
										
										//parentHolder -> each component creates it's own copy of the array and passes to the next object
										//componentOpject is the parent object for the callee
										//is the callee object
										//Entitytype should be null from this point 
										self["save"+key](parentHolder,prntObject,subObject, Entitytype, xmlParent , xmldoc);
									}
								}
								*/
    }
    xmlCharacteristicQuantification.setAttribute(
      "maxOperator",
      defaultMaxOperator
    );
    xmlCharacteristicQuantification.setAttribute(
      "minOperator",
      defaultMinOperator
    );
    xmlCharacteristicQuantification.setAttribute("xsi:type", "Interval");
    xmlLabel.setAttribute("value", defaultValue);
    xmlMinValue.setAttribute("value", defaultMinValue);
    xmlMaxValue.setAttribute("value", defaultMaxValue);
    xmlUcumString.setAttribute("value", defaultUcumString);

    xmlCharacteristicQuantification.appendChild(xmlLabel);
    xmlCharacteristicQuantification.appendChild(xmlMinValue);
    xmlCharacteristicQuantification.appendChild(xmlMaxValue);
    xmlCharacteristicQuantification.appendChild(xmlUcumString);
    xmlParent.appendChild(xmlCharacteristicQuantification);

    /*
			xmlTypeCode.setAttribute("code",defaultCode);
			xmlTypeCode.setAttribute("codeSystem",defaultCodeSystem);
			xmlTypeCode.setAttribute("codeSystemName",defaultCodeSystemName);
			xmlTypeCode.setAttribute("codeSystemVersion",defaultCodeSystemVersion);
			xmlIsodisplayName.setAttribute("value",defaultCodeSystem);
			xmlTypeCode.appendChild(xmlIsodisplayName);
			xmlCharacteristicQuantification.appendChild(xmlTypeCode);
			xmlParent.appendChild(xmlCharacteristicQuantification);
*/
  };

  this.saveNonQuantifiable = function(
    parentArray,
    parentObject,
    itself,
    Entitytype,
    xmlParent,
    xmldoc
  ) {
    //console.log("non quantifiable");
    //console.log(JSON.stringify(itself));
    //alert("non Quan")
    var _inself = this;
    var parentHolder = [];
    var prntObject = null;
    parentHolder = JSON.parse(JSON.stringify(parentArray));
    //console.log("&&&&&& char "+JSON.stringify(itself.value));
    var NonQuantifiables = itself.value;
    //console.log("non quant"+JSON.stringify(parentObject));
    var arraySize = -1;
    var arrayCheck = false;
    if (Array.isArray(NonQuantifiables)) {
      arraySize = NonQuantifiables.length;
      arrayCheck = true;
    } else {
      arraySize = 1;
    }

    var defaultCode = "";
    var defaultCodeSystem = "";
    var defaultCodeSystemName = "";
    var defaultCodeSystemVersion = "";

    var xmlCharacteristicQuantification = xmldoc.createElement(
      "CharacteristicQuantification"
    );
    xmlCharacteristicQuantification.setAttribute("xsi:type", "NonQuantifiable");

    var xmlAnnotatorConfidence = xmldoc.createElement("annotatorConfidence");
    xmlAnnotatorConfidence.setAttribute("value", parentObject.value.select);

    var xmlLabel = xmldoc.createElement("label");
    xmlLabel.setAttribute("value", parentObject.value.name);

    xmlCharacteristicQuantification.appendChild(xmlAnnotatorConfidence);
    xmlCharacteristicQuantification.appendChild(xmlLabel);

    var xmlTypeCode = xmldoc.createElement("typeCode");
    var xmlIsodisplayName = xmldoc.createElement("iso:displayName");
    xmlIsodisplayName.setAttribute("xmlns:iso", "uri:iso.org:21090");
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
        //alert(instanceObject.value);
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

      // no further subcomponent
      /*
								for (var key in instanceObject) {

									if (typeof instanceObject[key] == "object"){
									_inself.parentHolder.push(_inself.prntObject);
									//console.log("++ImagingObservationCharacteristics term is calling sub "+key+": value : "+JSON.stringify(instanceObject[key]));
										var subObject = {
											type  : key,
											value : instanceObject[key]
										}
										

										//console.log("allowedTerm value :"+subObject.value.codeValue);
										
										//parentHolder -> each component creates it's own copy of the array and passes to the next object
										//componentOpject is the parent object for the callee
										//is the callee object
										//Entitytype should be null from this point 
										self["save"+key](_inself.parentHolder,_inself.prntObject,subObject, Entitytype, xmlParent , xmldoc);
									}
								}
								*/
    }
    xmlTypeCode.setAttribute("code", defaultCode);
    xmlTypeCode.setAttribute("codeSystem", defaultCodeSystem);
    xmlTypeCode.setAttribute("codeSystemName", defaultCodeSystemName);
    xmlTypeCode.setAttribute("codeSystemVersion", defaultCodeSystemVersion);
    xmlIsodisplayName.setAttribute("value", defaultCodeSystem);
    xmlTypeCode.appendChild(xmlIsodisplayName);
    xmlCharacteristicQuantification.appendChild(xmlTypeCode);
    xmlParent.appendChild(xmlCharacteristicQuantification);
    /*xmlScaleLevelValueLabel.setAttribute("value", defaultSelectedValueLabel);
			xmlParent.appendChild(xmlScaleLevelValueLabel);
			xmlParent.appendChild(xmlScaleLevelValue);
			*/
  };

  this.saveQuantile = function(
    parentArray,
    parentObject,
    itself,
    Entitytype,
    xmlParent,
    xmldoc
  ) {
    //correct it
    //console.log("quantile ");
    //console.log(JSON.stringify(itself));
    var _inself = this;
    var parentHolder = [];
    var prntObject = null;
    parentHolder = JSON.parse(JSON.stringify(parentArray));
    //console.log("&&&&&& char "+JSON.stringify(itself.value));
    var Quantiles = itself.value;
    var i = 0;
    var arraySize = -1;
    var arrayCheck = false;
    if (Array.isArray(Quantiles)) {
      arraySize = Quantiles.length;
      arrayCheck = true;
    } else {
      arraySize = 1;
    }

    for (i = 0; i < arraySize; i++) {
      if (arrayCheck == true) {
        var instanceObject = Quantiles[i];
      } else {
        var instanceObject = Quantiles;
      }

      var prntObject = {
        type: "Quantile",
        value: instanceObject
      };

      for (var key in instanceObject) {
        if (typeof instanceObject[key] == "object") {
          parentHolder.push(prntObject);
          //console.log("++ImagingObservationCharacteristics term is calling sub "+key+": value : "+JSON.stringify(instanceObject[key]));
          var subObject = {
            type: key,
            value: instanceObject[key]
          };

          //console.log("allowedTerm value :"+subObject.value.codeValue);

          //parentHolder -> each component creates it's own copy of the array and passes to the next object
          //componentOpject is the parent object for the callee
          //is the callee object
          //Entitytype should be null from this point
          self["save" + key](
            parentHolder,
            prntObject,
            subObject,
            Entitytype,
            xmlParent,
            xmldoc
          );
        }
      }
    }
  };

  this.saveNumerical = function(
    parentArray,
    parentObject,
    itself,
    Entitytype,
    xmlParent,
    xmldoc
  ) {
    //correct it
    //console.log("numerical");
    //console.log(JSON.stringify(itself));
    var _inself = this;
    var parentHolder = [];
    var prntObject = null;
    parentHolder = JSON.parse(JSON.stringify(parentArray));
    //console.log("&&&&&& char "+JSON.stringify(itself.value));
    var Numericals = itself.value;
    var i = 0;
    var arraySize = -1;
    var arrayCheck = false;
    if (Array.isArray(Numericals)) {
      arraySize = Numericals.length;
      arrayCheck = true;
    } else {
      arraySize = 1;
    }

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

      for (var key in instanceObject) {
        if (typeof instanceObject[key] == "object") {
          parentHolder.push(prntObject);
          //console.log("++ImagingObservationCharacteristics term is calling sub "+key+": value : "+JSON.stringify(instanceObject[key]));
          var subObject = {
            type: key,
            value: instanceObject[key]
          };

          //console.log("allowedTerm value :"+subObject.value.codeValue);

          //parentHolder -> each component creates it's own copy of the array and passes to the next object
          //componentOpject is the parent object for the callee
          //is the callee object
          //Entitytype should be null from this point
          self["save" + key](
            parentHolder,
            prntObject,
            subObject,
            Entitytype,
            xmlParent,
            xmldoc
          );
        }
      }
    }
  };

  this.saveScaleLevel = function(
    parentArray,
    parentObject,
    itself,
    Entitytype,
    xmlParent,
    xmldoc
  ) {
    //console.log("scale level");
    //console.log("saveScaleLevel : "+JSON.stringify(itself));
    //alert("scale level called");
    var _inself = this;
    var parentHolder = [];
    var prntObject = null;
    parentHolder = JSON.parse(JSON.stringify(parentArray));
    //console.log("&&&&&& char "+JSON.stringify(itself.value));
    var ScaleLevels = itself.value;

    var arraySize = -1;
    var arrayCheck = false;
    if (Array.isArray(ScaleLevels)) {
      arraySize = ScaleLevels.length;
      arrayCheck = true;
    } else {
      arraySize = 1;
    }

    var i = 0;
    var defaultSelectedValue = "";
    var defaultSelectedValueLabel = "";
    var xmlScaleLevelValue = xmldoc.createElement("value");
    var xmlScaleLevelValueLabel = xmldoc.createElement("valueLabel");
    for (i = 0; i < arraySize; i++) {
      if (arrayCheck == true) {
        var instanceObject = ScaleLevels[i];
      } else {
        var instanceObject = ScaleLevels;
      }
      if (i == 0) {
        //alert(instanceObject.value);
        defaultSelectedValue = instanceObject.value;
        defaultSelectedValueLabel = instanceObject.valueLabel;
      } else {
        if (instanceObject.hasOwnProperty("select")) {
          if (instanceObject.select == "1") {
            defaultSelectedValue = instanceObject.value;
            defaultSelectedValueLabel = instanceObject.valueLabel;
          }
        }
      }

      var prntObject = {
        type: "ScaleLevel",
        value: instanceObject
      };

      //console.log("instance object "+ JSON.stringify(instanceObject));

      //nomore sub component
      /*
								for (var key in instanceObject) {

									if (typeof instanceObject[key] == "object"){
									_inself.parentHolder.push(_inself.prntObject);
									//console.log("++ImagingObservationCharacteristics term is calling sub "+key+": value : "+JSON.stringify(instanceObject[key]));
										var subObject = {
											type  : key,
											value : instanceObject[key]
										}
										

										//console.log("allowedTerm value :"+subObject.value.codeValue);
										
										//parentHolder -> each component creates it's own copy of the array and passes to the next object
										//componentOpject is the parent object for the callee
										//is the callee object
										//Entitytype should be null from this point 
										self["save"+key](_inself.parentHolder,_inself.prntObject,subObject, Entitytype, xmlParent , xmldoc);
									}
								}
								*/
    }
    xmlScaleLevelValue.setAttribute("value", defaultSelectedValue);
    xmlScaleLevelValueLabel.setAttribute("value", defaultSelectedValueLabel);
    xmlParent.appendChild(xmlScaleLevelValueLabel);
    xmlParent.appendChild(xmlScaleLevelValue);
  };

  this.saveScale = function(
    parentArray,
    parentObject,
    itself,
    Entitytype,
    xmlParent,
    xmldoc
  ) {
    //console.log("scale");
    //console.log("save scale---->"+JSON.stringify(itself));
    //alert("save scale called");
    var before = "";
    var after = "";
    var oSerializer = new XMLSerializer();
    var sXML = "";
    var _inself = this;
    var parentHolder = [];
    var prntObject = null;
    parentHolder = JSON.parse(JSON.stringify(parentArray));
    //console.log("&&&&&& char "+JSON.stringify(itself.value));
    var Scales = itself.value;
    var i = 0;
    var arraySize = -1;
    var arrayCheck = false;
    if (Array.isArray(Scales)) {
      arraySize = Scales.length;
      arrayCheck = true;
    } else {
      arraySize = 1;
    }
    //console.log("scale parent:  "+JSON.stringify(itself.value));

    var CharacteristicQuantification = xmldoc.createElement(
      "CharacteristicQuantification"
    );
    CharacteristicQuantification.setAttribute("type", itself.value.scaleType);
    CharacteristicQuantification.setAttribute("xsi:type", "Scale");
    var xmlAnnotatorConfidence = xmldoc.createElement("annotatorConfidence");
    xmlAnnotatorConfidence.setAttribute("value", parentObject.value.select);
    var label = xmldoc.createElement("label");
    label.setAttribute("value", parentObject.value.name);
    CharacteristicQuantification.appendChild(xmlAnnotatorConfidence);
    CharacteristicQuantification.appendChild(label);

    for (i = 0; i < arraySize; i++) {
      if (arrayCheck == true) {
        var instanceObject = Scales[i];
      } else {
        var instanceObject = Scales;
      }

      var prntObject = {
        type: "Scale",
        value: instanceObject
      };

      for (var key in instanceObject) {
        if (typeof instanceObject[key] == "object") {
          parentHolder.push(prntObject);
          //console.log("++ImagingObservationCharacteristics term is calling sub "+key+": value : "+JSON.stringify(instanceObject[key]));
          var subObject = {
            type: key,
            value: instanceObject[key]
          };

          //parentHolder -> each component creates it's own copy of the array and passes to the next object
          //componentOpject is the parent object for the callee
          //is the callee object
          //Entitytype should be null from this point
          self["save" + key](
            parentHolder,
            prntObject,
            subObject,
            Entitytype,
            CharacteristicQuantification,
            xmldoc
          );
        }
      }
    }
    xmlParent.appendChild(CharacteristicQuantification);
  };

  this.saveCharacteristicQuantification = function(
    parentArray,
    parentObject,
    itself,
    Entitytype,
    xmlParent,
    xmldoc
  ) {
    //alert("car quant called");
    var _inself = this;
    var parentHolder = [];
    var prntObject = null;
    var before = "";
    var after = "";
    var oSerializer = new XMLSerializer();
    var sXML = "";
    parentHolder = JSON.parse(JSON.stringify(parentArray));
    //console.log("&&&&&& char "+JSON.stringify(itself.value));
    var CharacteristicQuantifications = itself.value;
    var i = 0;
    var arraySize = -1;
    var arrayCheck = false;
    if (Array.isArray(CharacteristicQuantifications)) {
      arraySize = CharacteristicQuantifications.length;
      arrayCheck = true;
    } else {
      arraySize = 1;
    }
    var xmlCharacteristicQuantification = xmldoc.createElement(
      "characteristicQuantificationCollection"
    );
    sXML = oSerializer.serializeToString(xmlCharacteristicQuantification);
    before = JSON.stringify(sXML);
    console.log("saveCharacteristicQuantification ::   " + before);
    //console.log("CharacteristicQuantifications");
    //console.log("CharacteristicQuantifications" +JSON.stringify(itself));
    for (i = 0; i < arraySize; i++) {
      if (arrayCheck == true) {
        var instanceObject = CharacteristicQuantifications[i];
      } else {
        var instanceObject = CharacteristicQuantifications;
      }

      var prntObject = {
        type: "CharacteristicQuantification",
        value: instanceObject
      };

      for (var key in instanceObject) {
        if (typeof instanceObject[key] == "object") {
          parentHolder.push(prntObject);

          var subObject = {
            type: key,
            value: instanceObject[key]
          };

          //parentHolder -> each component creates it's own copy of the array and passes to the next object
          //componentOpject is the parent object for the callee
          //is the callee object
          //Entitytype should be null from this point
          self["save" + key](
            parentHolder,
            prntObject,
            subObject,
            Entitytype,
            xmlCharacteristicQuantification,
            xmldoc
          );
        }
      }
    }

    sXML = oSerializer.serializeToString(xmlParent);
    after = JSON.stringify(sXML);
    if (before != after) {
      xmlParent.appendChild(xmlCharacteristicQuantification);
    }
    //console.log("after"+after);
  };

  this.saveImagingObservation = function(
    parentArray,
    parentObject,
    itself,
    Entitytype,
    xmlParent,
    xmldoc
  ) {
    //alert("save img obs");

    var ImagingObservationEntity = "";
    var before = "";
    var after = "";
    var oSerializer = new XMLSerializer();
    var sXML = "";
    ImagingObservationEntity = xmldoc.createElement("ImagingObservationEntity");
    sXML = oSerializer.serializeToString(ImagingObservationEntity);
    before = JSON.stringify(sXML);
    //console.log("img obs before"+before);
    self["saveImagingObservationCharacteristic"](
      parentArray,
      parentObject,
      itself.value["ImagingObservationCharacteristic"],
      Entitytype,
      ImagingObservationEntity,
      xmldoc
    );
    sXML = oSerializer.serializeToString(ImagingObservationEntity);
    after = JSON.stringify(sXML);
    //console.log("img obs after"+after);

    if (before != after) {
      xmlParent.appendChild(ImagingObservationEntity);
    }
  };

  this.saveImagingObservationCharacteristic = function(
    parentArray,
    parentObject,
    itself,
    Entitytype,
    xmlParent,
    xmldoc
  ) {
    //alert("saveImagingObservationCharacteristic");
    var _inself = this;
    var parentHolder = [];
    var prntObject = null;
    var colXml = "";
    var collectionBefore = "";
    var collectionAfter = "";
    var oSerializer = new XMLSerializer();
    var parser = new DOMParser();
    parentHolder = JSON.parse(JSON.stringify(parentArray));
    //console.log("&&&&&& char "+JSON.stringify(itself.value));
    var ImagingObservationCharacteristics = itself;

    var arraySize = -1;
    var arrayCheck = false;
    if (Array.isArray(ImagingObservationCharacteristics)) {
      arraySize = ImagingObservationCharacteristics.length;
      arrayCheck = true;
    } else {
      arraySize = 1;
    }

    var xmlImagingObservationCharacteristicCollection = xmldoc.createElement(
      "imagingObservationCharacteristicCollection"
    );
    colXml = oSerializer.serializeToString(
      xmlImagingObservationCharacteristicCollection
    );
    collectionBefore = JSON.stringify(colXml);
    var i = 0;
    for (i = 0; i < arraySize; i++) {
      if (arrayCheck == true) {
        var instanceObject = ImagingObservationCharacteristics[i];
      } else {
        var instanceObject = ImagingObservationCharacteristics;
      }

      var prntObject = {
        type: "ImagingObservationCharacteristic",
        value: instanceObject
      };

      var sXML;
      var before = "a";
      var after = "a";
      var xmlImagingObservationCharacteristic = xmldoc.createElement(
        "ImagingObservationCharacteristic"
      );
      sXML = oSerializer.serializeToString(xmlImagingObservationCharacteristic);
      before = JSON.stringify(sXML);
      for (var key in instanceObject) {
        if (key != "QuestionType") {
          if (typeof instanceObject[key] == "object") {
            //alert("key :"+key);
            parentHolder.push(prntObject);

            var subObject = {
              type: key,
              value: instanceObject[key]
            };

            //alert("char :" + before);
            self["save" + key](
              parentHolder,
              prntObject,
              subObject,
              Entitytype,
              xmlImagingObservationCharacteristic,
              xmldoc
            );
          }
        }
      }
      //after for loop
      sXML = oSerializer.serializeToString(xmlImagingObservationCharacteristic);
      after = JSON.stringify(sXML);
      //console.log("collection : "+after);
      if (before != after) {
        /*
										var uy =  xmlImagingObservationCharacteristic.getElementsByTagName("ImagingObservationCharacteristic");
										//alert("a"+uy.length);
										var p = 0;
										var xmlM = "";
										for (p=0; p<uy.length; p++){
											//console.log("inner :"+uy[p].outerHTML);
											var xmlM = parser.parseFromString(uy[p].outerHTML,"text/xml");
											xmlImagingObservationCharacteristicCollection.appendChild(xmlM.firstChild);
										}
										sXML = oSerializer.serializeToString(xmlImagingObservationCharacteristicCollection);
										collectionAfter =  JSON.stringify(sXML);
										//console.log("collection inner after"+collectionAfter);
										*/
        xmlImagingObservationCharacteristicCollection.appendChild(
          xmlImagingObservationCharacteristic
        );
      }

      sXML = oSerializer.serializeToString(
        xmlImagingObservationCharacteristicCollection
      );
      collectionAfter = JSON.stringify(sXML);
      //console.log("collection before :"+collectionBefore);
      //console.log("collection After : "+collectionAfter);
      if (collectionBefore != collectionAfter) {
        xmlParent.appendChild(xmlImagingObservationCharacteristicCollection);
      }
    }
  };

  this.saveAnatomicEntity = function(
    parentArray,
    parentObject,
    itself,
    Entitytype,
    xmlParent,
    xmldoc
  ) {
    //console.log("itself.value : "+JSON.stringify(itself.value["AnatomicEntityCharacteristic"]));
    //alert("ae called");
    var before = "";
    var after = "";
    var innerXml = "";
    var sXML = "";
    var oSerializer = new XMLSerializer();
    innerXml = xmldoc.createElement("ImagingPhysicalEntity");
    sXML = oSerializer.serializeToString(innerXml);
    before = JSON.stringify(sXML);
    //console.log(before);
    self["saveAnatomicEntityCharacteristic"](
      parentArray,
      parentObject,
      itself.value["AnatomicEntityCharacteristic"],
      Entitytype,
      innerXml,
      xmldoc
    );
    sXML = oSerializer.serializeToString(innerXml);
    after = JSON.stringify(sXML);
    //console.log(after);
    if (before != after) {
      console.log("#######working here " + after);
      xmlParent.appendChild(innerXml);
    }
  };

  this.saveAnatomicEntityCharacteristic = function(
    parentArray,
    parentObject,
    itself,
    Entitytype,
    xmlParent,
    xmldoc
  ) {
    var _inself = this;
    var parentHolder = [];
    var prntObject = null;
    var colXml = "";
    var collectionBefore = "";
    var collectionAfter = "";
    var oSerializer = new XMLSerializer();
    var parser = new DOMParser();
    parentHolder = JSON.parse(JSON.stringify(parentArray));

    var AnatomicEntityCharacteristics = itself;
    var i = 0;
    var arraySize = -1;
    var arrayCheck = false;
    if (Array.isArray(AnatomicEntityCharacteristics)) {
      arraySize = AnatomicEntityCharacteristics.length;
      arrayCheck = true;
    } else {
      arraySize = 1;
    }

    var xmlImagingPhysicalEntityCharacteristicCollection = xmldoc.createElement(
      "imagingPhysicalEntityCharacteristicCollection"
    );
    colXml = oSerializer.serializeToString(
      xmlImagingPhysicalEntityCharacteristicCollection
    );
    collectionBefore = JSON.stringify(colXml);
    //alert(collectionBefore);
    for (i = 0; i < arraySize; i++) {
      if (arrayCheck == true) {
        var instanceObject = AnatomicEntityCharacteristics[i];
      } else {
        var instanceObject = AnatomicEntityCharacteristics;
      }

      var prntObject = {
        type: "AnatomicEntityCharacteristic",
        value: instanceObject
      };
      //console.log("--------- start -----------")
      //console.log("AE char"+JSON.stringify(AnatomicEntityCharacteristics));
      //console.log("anatomic entitiy parent __________"+JSON.stringify(instanceObject));
      var oSerializer = new XMLSerializer();
      var sXML;
      var before = "a";
      var after = "a";
      var xmlImagingPhysicalEntityCharacteristic = xmldoc.createElement(
        "ImagingPhysicalEntityCharacteristic"
      );
      var xmlcarcollect = xmldoc.createElement(
        "ImagingPhysicalEntityCharacteristic"
      );
      sXML = oSerializer.serializeToString(
        xmlImagingPhysicalEntityCharacteristic
      );
      before = JSON.stringify(sXML);
      for (var key in instanceObject) {
        if (typeof instanceObject[key] == "object") {
          if (key != "QuestionType") {
            parentHolder.push(prntObject);

            var subObject = {
              type: key,
              value: instanceObject[key]
            };

            //alert(Entitytype);
            self["save" + key](
              parentHolder,
              prntObject,
              subObject,
              Entitytype,
              xmlImagingPhysicalEntityCharacteristic,
              xmldoc
            );
          }
        }
      }
      sXML = oSerializer.serializeToString(
        xmlImagingPhysicalEntityCharacteristic
      );
      after = JSON.stringify(sXML);

      if (before != after) {
        var uy = xmlImagingPhysicalEntityCharacteristic.childNodes;

        var p = 0;

        var xmlM = "";

        for (p = 0; p < uy.length; p++) {
          alert(uy[p].innerHTML);
          var xmlM = parser.parseFromString(uy[p].outerHTML, "text/xml");

          //xmlImagingPhysicalEntityCharacteristicCollection.appendChild(xmlImagingPhysicalEntityCharacteristic);
          xmlImagingPhysicalEntityCharacteristicCollection.appendChild(
            xmlM.documentElement
          );
        }

        //xmlImagingPhysicalEntityCharacteristicCollection.appendChild(xmlImagingPhysicalEntityCharacteristic);
        //alert(xmlImagingPhysicalEntityCharacteristicCollection.innerHTML);

        //xmlImagingPhysicalEntityCharacteristicCollection.appendChild(xmlImagingPhysicalEntityCharacteristic);
        sXML = oSerializer.serializeToString(
          xmlImagingPhysicalEntityCharacteristicCollection
        );
        collectionAfter = JSON.stringify(sXML);
        //console.log("we didnt add xml img phys entt char"+collectionAfter);
      }

      sXML = oSerializer.serializeToString(
        xmlImagingPhysicalEntityCharacteristicCollection
      );
      collectionAfter = JSON.stringify(sXML);
      if (collectionBefore != collectionAfter) {
        xmlParent.appendChild(xmlImagingPhysicalEntityCharacteristicCollection);
      }
    }
  };

  this.saveAllowedTerm = function(
    parentArray,
    parentObject,
    itself,
    Entitytype,
    xmlParent,
    xmldoc
  ) {
    var _inself = this;
    var parentHolder = [];
    parentHolder = JSON.parse(JSON.stringify(parentArray));

    var oSerializer = new XMLSerializer();
    var AllowedTerms = itself.value;
    var i = 0;
    var arraySizeforAllowedTerms = -1;
    var arrayCheckForAllowedTerms = false;
    var objectFromDirectComponent = "";
    if (Array.isArray(AllowedTerms)) {
      arraySizeforAllowedTerms = AllowedTerms.length;
      arrayCheckForAllowedTerms = true;
    } else {
      arraySizeforAllowedTerms = 1;
    }

    if (parentObject.type == "Component") {
      if (parentObject.value.hasOwnProperty("ImagingObservation")) {
        objectFromDirectComponent = "ImagingObservationEntity";
      }
      if (parentObject.value.hasOwnProperty("AnatomicEntity")) {
        objectFromDirectComponent = "ImagingPhysicalEntity";
      }
    }

    var xmlInnerHolder = [];

    var xmlInner = "";
    var xmlDecideCategory = "";
    for (i = 0; i < arraySizeforAllowedTerms; i++) {
      xmlInner = "";

      if (arrayCheckForAllowedTerms == true) {
        var instanceAllowedTerms = AllowedTerms[i];
      } else {
        var instanceAllowedTerms = AllowedTerms;
      }

      var prntObject = {
        type: "AllowedTerm",
        value: instanceAllowedTerms
      };
      //console.log("code meaning of  aT :"+instanceAllowedTerms.codeMeaning);
      if (instanceAllowedTerms.hasOwnProperty("select")) {
        if (instanceAllowedTerms.select == "1") {
          if (objectFromDirectComponent != "") {
            if (objectFromDirectComponent == "ImagingPhysicalEntity") {
              xmlDecideCategory = xmldoc.createElement("ImagingPhysicalEntity");
            } else {
              xmlDecideCategory = xmldoc.createElement(
                "ImagingObservationEntity"
              );
            }
            xmlInner = xmldoc.createElement("dirctFromComponent");
          }

          var xmlLabel = xmldoc.createElement("label");
          xmlLabel.setAttribute("value", parentObject.value.label);
          var xmlAnnotatorConfidence = xmldoc.createElement(
            "annotatorConfidence"
          );

          xmlAnnotatorConfidence.setAttribute(
            "value",
            parentObject.value.select
          );

          var allowedTermxmlTypeCode = xmldoc.createElement("typeCode");
          allowedTermxmlTypeCode.setAttribute(
            "code",
            instanceAllowedTerms.codeValue
          );
          allowedTermxmlTypeCode.setAttribute(
            "codeSystemName",
            instanceAllowedTerms.codingSchemeDesignator
          );
          allowedTermxmlTypeCode.setAttribute(
            "codeSystemVersion",
            instanceAllowedTerms.codingSchemeVersion
          );

          var allowedTermxmlTypeCodeValue = xmldoc.createElement(
            "iso:displayName"
          );
          allowedTermxmlTypeCodeValue.setAttribute(
            "xmlns:iso",
            "uri:iso.org:21090"
          );
          allowedTermxmlTypeCodeValue.setAttribute(
            "value",
            instanceAllowedTerms.codeMeaning
          );

          allowedTermxmlTypeCode.appendChild(allowedTermxmlTypeCodeValue);

          if (xmlInner != "") {
            xmlDecideCategory.appendChild(allowedTermxmlTypeCode);
            xmlDecideCategory.appendChild(xmlAnnotatorConfidence);
            xmlDecideCategory.appendChild(xmlLabel);
            xmlInner.appendChild(xmlDecideCategory);
          } else {
            var xmlParentBase = xmlParent.cloneNode(true);
            xmlParentBase.appendChild(allowedTermxmlTypeCode);
            xmlParentBase.appendChild(xmlAnnotatorConfidence);
            xmlParentBase.appendChild(xmlLabel);
          }
          //xmldoc.getElementsByTagName("ImageAnnotation")[0].appendChild(xmlImagingPhysicalEntityCharacteristic);
          //let oSerializer = new XMLSerializer();
          //let sXML = oSerializer.serializeToString(xmldoc);
          //console.log("..................................................aim Saved data"+(JSON.stringify(sXML)));
          //console.log("--------alowed term type: allowed term value : "+JSON.stringify(instanceAllowedTerms.codeMeaning));
          for (var key in instanceAllowedTerms) {
            if (typeof instanceAllowedTerms[key] == "object") {
              parentHolder.push(prntObject);

              var subObject = {
                type: key,
                value: instanceAllowedTerms[key]
              };

              //console.log("AT calling sub :---------");

              //parentHolder -> each component creates it's own copy of the array and passes to the next object
              //componentOpject is the parent object for the callee
              //is the callee object
              //Entitytype should be null from this point
              if (xmlInner != "") {
                self["save" + key](
                  parentHolder,
                  prntObject,
                  subObject,
                  Entitytype,
                  xmlInner,
                  xmldoc
                );
              } else {
                self["save" + key](
                  parentHolder,
                  prntObject,
                  subObject,
                  Entitytype,
                  xmlParentBase,
                  xmldoc
                );
              }
            }
          }

          if (xmlInner != "") {
            xmlParent.appendChild(xmlInner);
          } else {
            xmlInnerHolder.push(xmlParentBase);
          }
        }
      }
    }
    var cnt = 0;
    if (xmlInnerHolder.length > 0) {
      //console.log("!!! xml inner holder full");
      var sXMLpro = oSerializer.serializeToString(xmlParent);
      var collectionAf = JSON.stringify(sXMLpro);
      //console.log("!!! xml inner holder xmlparent before"+collectionAf);
      for (cnt = 0; cnt < xmlInnerHolder.length; cnt++) {
        xmlParent.appendChild(xmlInnerHolder[cnt]);
        var sXML = oSerializer.serializeToString(xmlInnerHolder[cnt]);
        var collectionAfter = JSON.stringify(sXML);
        //console.log("!!! xml inner holder result"+collectionAfter);
      }
    }
    //console.log("====parent array after awterms : "+JSON.stringify(_inself.parentHolder));
  };

  this.js_traverse = function(o) {
    //console.log("saved json object :"+JSON.stringify(o));
    var _inself = this;
    var validTagListToCheck = ["QuestionType", "AnatomicEntity", "AllowedTerm"];
    var parentHolder = [];
    var Template = o["Template"];
    var Components = Template["Component"];
    var xmldoc = document.implementation.createDocument("", "", null);
    var xmlImagingPhysicalEntityCollection = xmldoc.createElement(
      "imagingPhysicalEntityCollection"
    );
    var xmlImagingObservationEntityCollection = xmldoc.createElement(
      "imagingObservationEntityCollection"
    );
    var oSerializer = new XMLSerializer();
    var sXML;
    var before = "";
    var after = "";
    var xmlParent = xmldoc.createElement("holder");
    var i = 0;
    var xmlInner = "";
    for (i = 0; i < Components.length; i++) {
      xmlInner = xmldoc.createElement("eachComp");
      var instanceComponent = Components[i];

      var componentObject = {
        type: "Component",
        value: instanceComponent
      };
      parentHolder = [];
      parentHolder.push(instanceComponent);
      //console.log("====parent array component : "+JSON.stringify(_inself.parentHolder));
      var Entitytype = null;
      if (instanceComponent.hasOwnProperty("ImagingObservation")) {
        Entitytype = "ImagingObservation";
      }
      if (instanceComponent.hasOwnProperty("AnatomicEntity")) {
        Entitytype = "AnatomicEntity";
      }

      // console.log("---------- component");

      //changin key order to capture Allowed terms first
      var keyorder = Object.keys(instanceComponent);
      var fix = -1;
      var z = 0;
      for (z = 0; z < keyorder.length; z++) {
        if (keyorder[z] == "AllowedTerm") {
          fix = z;
          break;
        }
      }

      keyorder[fix] = keyorder[0];
      keyorder[0] = "AllowedTerm";
      //console.log("key Order" + JSON.stringify(keyorder));
      var counter = 0;

      for (counter; counter < keyorder.length; counter++) {
        if (typeof instanceComponent[keyorder[counter]] == "object") {
          //console.log("component keys :"+keyorder[counter]);
          //console.log("--sub "+key+": value : "+JSON.stringify(instanceComponent[key]));
          var subObject = {
            type: keyorder[counter],
            value: instanceComponent[keyorder[counter]]
          };

          switch (keyorder[counter]) {
            case "AnatomicEntity":
              //xmlInner =	xmldoc.createElement("ImagingPhysicalEntity");

              break;
            case "ImagingObservation":
              //xmlInner =	xmldoc.createElement("ImagingObservationEntity");

              break;
            case "Inference":
              //xmlInner =	xmldoc.createElement("InferenceEntity");

              break;
            case "Calculation":
              //xmlInner =	xmldoc.createElement("CalculationEntity");

              break;
            case "AllowedTerm":
              if (Entitytype == "AnatomicEntity") {
                //xmlInner =	xmldoc.createElement("ImagingPhysicalEntity");
              } else if (Entitytype == "ImagingObservation") {
                //xmlInner =	xmldoc.createElement("ImagingObservationEntity");
              }
              break;
            default:
            //xmlInner = "";
          }

          //inself.parentArray.push(itself);
          //console.log("saving key :"+key);

          //parentHolder -> each component creates it's own copy of the array and passes to the next object
          //componentOpject is the parent object for the callee
          //is the callee object
          //Entitytype is used if the allowed term is connected directly to the component to define image or physical entity etc..
          if (xmlInner != "") {
            sXML = oSerializer.serializeToString(xmlInner);
            before = JSON.stringify(sXML);
            try {
              //console.log("comp "+ i +" calling "+keyorder[counter]);
              //console.log("xml before : " +before);
              self["save" + keyorder[counter]](
                parentHolder,
                componentObject,
                subObject,
                Entitytype,
                xmlInner,
                xmldoc
              );
            } catch (err) {
              //Block of code to handle errors
            }
            sXML = oSerializer.serializeToString(xmlInner);
            after = JSON.stringify(sXML);
            //console.log("xml after : "+after);
            if (before != after) xmlParent.appendChild(xmlInner);

            sXML = oSerializer.serializeToString(xmlInner);

            //xmlInner = "";
          }
        }
      }
      sXML = oSerializer.serializeToString(xmlParent);
      //console.log("comp value " +i +" "+ instanceComponent.label);
      //console.log("comp :"+i+" each component XML  :"+(JSON.stringify(sXML)));
      xmlInner = "";
    }
    xmldoc.appendChild(xmlParent);
    var lastXML = oSerializer.serializeToString(xmldoc);
    self.parseXmlEachComponent(xmldoc);
    console.log(" whole Xml  :" + JSON.stringify(lastXML));
  };

  this.parseXmlEachComponent = function(resultXmlObject) {
    var InferenceEntities = [];
    var ImagingPhysicalEntities = [];
    var ImagingObservationEntities = [];
    var CalculationEntities = [];
    var InferenceEntities = [];

    var oSerializer = new XMLSerializer();
    alert("xml " + resultXmlObject.childNodes[0].childNodes.length);
    var childCnt = 0;
    var allEachComps = resultXmlObject.childNodes[0].childNodes;

    for (childCnt = 0; childCnt < allEachComps.length; childCnt++) {
      var eachDirctFromComponent = [];
      var eachXML = oSerializer.serializeToString(allEachComps[childCnt]);
      console.log("tag name " + allEachComps[childCnt].tagName);
      console.log(" each comp  :" + JSON.stringify(eachXML));

      var SubComps = allEachComps[childCnt].childNodes;
      var subCnt = 0;
      var childs = "";
      var subXML = "";
      for (subCnt = 0; subCnt < SubComps.length; subCnt++) {
        switch (SubComps[subCnt].tagName) {
          case "dirctFromComponent":
            childs = SubComps[subCnt].childNodes;
            alert("child lnt" + childs.length);
            var directCnt = 0;
            for (directCnt = 0; directCnt < childs.length; directCnt++) {
              subXML = oSerializer.serializeToString(childs[directCnt]);
              console.log("under direct " + childs[directCnt].tagName);
              console.log("under direct  :" + JSON.stringify(subXML));
              var xmlDirectObject = {
                type: childs[directCnt].tagName,
                xmlValue: childs[directCnt]
              };
              eachDirctFromComponent.push(xmlDirectObject);
              alert("in array " + eachDirctFromComponent[0].type);
            }
            // code block
            break;
          case "ImagingPhysicalEntity":
            // code block
            if (eachDirctFromComponent.length > 0) {
              if (eachDirctFromComponent[0].type == "ImagingPhysicalEntity") {
                for (
                  var arrayCnt = 0;
                  arrayCnt < eachDirctFromComponent.length;
                  arrayCnt++
                ) {
                  var xmlItrateEachSub =
                    eachDirctFromComponent[arrayCnt].xmlValue.childNodes;
                  for (
                    var arrayCnta = xmlItrateEachSub.length - 1;
                    arrayCnta >= 0;
                    arrayCnta--
                  ) {
                    SubComps[subCnt].insertBefore(
                      xmlItrateEachSub[arrayCnta],
                      SubComps[subCnt].childNodes[0]
                    );
                  }
                }
                eachDirctFromComponent = [];
              }
            }
            ImagingPhysicalEntities.push(SubComps[subCnt]);
            break;
          case "ImagingObservationEntity":
            // code block
            if (eachDirctFromComponent.length > 0) {
              if (
                eachDirctFromComponent[0].type == "ImagingObservationEntity"
              ) {
                for (
                  var arrayCnt = 0;
                  arrayCnt < eachDirctFromComponent.length;
                  arrayCnt++
                ) {
                  var xmlItrateEachSub =
                    eachDirctFromComponent[arrayCnt].xmlValue.childNodes;
                  for (
                    var arrayCnta = xmlItrateEachSub.length - 1;
                    arrayCnta >= 0;
                    arrayCnta--
                  ) {
                    SubComps[subCnt].insertBefore(
                      xmlItrateEachSub[arrayCnta],
                      SubComps[subCnt].childNodes[0]
                    );
                  }
                }
                eachDirctFromComponent = [];
              }
            }
            ImagingObservationEntities.push(SubComps[subCnt]);
            break;
          case "CalculationEntity":
            if (eachDirctFromComponent.length > 0) {
              if (eachDirctFromComponent[0].type == "CalculationEntity") {
                for (
                  var arrayCnt = 0;
                  arrayCnt < eachDirctFromComponent.length;
                  arrayCnt++
                ) {
                  var xmlItrateEachSub =
                    eachDirctFromComponent[arrayCnt].xmlValue.childNodes;
                  for (
                    var arrayCnta = xmlItrateEachSub.length - 1;
                    arrayCnta >= 0;
                    arrayCnta--
                  ) {
                    SubComps[subCnt].insertBefore(
                      xmlItrateEachSub[arrayCnta],
                      SubComps[subCnt].childNodes[0]
                    );
                  }
                }
                eachDirctFromComponent = [];
              }
            }
            CalculationEntities.push(SubComps[subCnt]);
            // code block
            break;
          case "InferenceEntity":
            if (eachDirctFromComponent.length > 0) {
              if (eachDirctFromComponent[0].type == "InferenceEntity") {
                for (
                  var arrayCnt = 0;
                  arrayCnt < eachDirctFromComponent.length;
                  arrayCnt++
                ) {
                  var xmlItrateEachSub =
                    eachDirctFromComponent[arrayCnt].xmlValue.childNodes;
                  for (
                    var arrayCnta = xmlItrateEachSub.length - 1;
                    arrayCnta >= 0;
                    arrayCnta--
                  ) {
                    SubComps[subCnt].insertBefore(
                      xmlItrateEachSub[arrayCnta],
                      SubComps[subCnt].childNodes[0]
                    );
                  }
                }
                eachDirctFromComponent = [];
              }
            }
            InferenceEntities.push(SubComps[subCnt]);
            // code block
            break;
          default:
          // code block
        }

        subXML = oSerializer.serializeToString(SubComps[subCnt]);
        console.log("sub tag name " + SubComps[subCnt].tagName);
        console.log("sub  each comp  :" + JSON.stringify(subXML));
      }
    }
    for (
      var arrayCnt = 0;
      arrayCnt < ImagingPhysicalEntities.length;
      arrayCnt++
    ) {
      //ImagingPhysicalEntities[arrayCnt];
      subXML = oSerializer.serializeToString(ImagingPhysicalEntities[arrayCnt]);
      console.log("last array phy entities " + subXML);
    }
    //var uy =  xmlParent.getElementsByTagName("eachComp");
    //var uya =  uy[0].getElementsByTagName("eachComp");
  };

  this.saveAim = function() {
    //mainHolder = [];
    //console.log(JSON.stringify(self.jsonTemplateCopy));
    self.js_traverse(self.jsonTemplateCopy);
    //callback(xmlAim,mainHolder);
  };
  this.addButtonsDiv = function(divforbuttons) {
    self.divHolderForButtons = divforbuttons;
  };
  this.addButtons = function(parentDiv) {
    let saveButton = document.createElement("Button");
    let saveButtonText = document.createTextNode("save");
    saveButton.appendChild(saveButtonText);
    saveButton.onclick = function() {
      self.saveAim();
    };
    let loadButton = document.createElement("Button");
    let loadButtonText = document.createTextNode("load");
    loadButton.appendChild(loadButtonText);
    loadButton.onclick = function() {
      self.loadAim("");
    };

    parentDiv.appendChild(saveButton);
    parentDiv.appendChild(loadButton);

    if (self.divHolderForButtons != null)
      parentDiv.appendChild(self.divHolderForButtons);
  };

  this.checkSaveReady = function() {
    console.log("this is back ");
    var objs = document.getElementsByTagName("i");
    console.log(objs.length);
    for (var i = 0; i < objs.length; i++) {
      console.log(objs[i].id);
      if (objs[i].className == "red check circle outline icon")
        objs[i].className = "green check circle outline icon";
    }
  };

  this.setAim = function(aimValue) {
    self.textXml = aimValue;
  };

  this.checkIfCommentRequired = function(object, parentDiv) {
    if (object.hasOwnProperty("requireComment")) {
      if (object.requireComment == "true") {
        //alert("component require coment");

        var label = document.createElement("label");
        label.textContent = "component comment";
        //parentDiv.appendChild(label);

        var textareaDomObject = document.createElement("textarea");
        parentDiv.appendChild(textareaDomObject);
      }
    }
  };

  constructor();
};

export var myjson = {
  authors: "Default User",
  creationDate: "2013-08-15",
  description: "Current liver template",
  name: "Active Liver Template",
  uid: "2.25.262327926267685184074584276827607514851",
  version: "Active Liver 16",
  schemaLocation:
    "gme://caCORE.caCORE/3.2/edu.northwestern.radiology.AIMTemplate AIMTemplate_v2rv13.xsd",
  Template: {
    authors: "cfbeaulieu",
    codeMeaning: "liver15",
    codeValue: "RID58-2",
    codingSchemeDesignator: "RadLex",
    codingSchemeVersion: "1.0",
    creationDate: "2013-02-10",
    description: "Liver template.v18",
    name: "Active Liver Template Beaulieu",
    uid: "2.25.143518070104148940884779125624652210206",
    version: "18",
    Component: [
      {
        authors: "cfbeaulieu",
        explanatoryText: "Which hepatic lobe does the lesion mainly occupy?",
        groupLabel: "",
        id: "2.25.1800391920089.536979722668.204033480007",
        itemNumber: "1",
        label: "Lobar Location",
        maxCardinality: "1",
        minCardinality: "1",
        shouldDisplay: "true",
        AnatomicEntity: {
          annotatorConfidence: "false"
        },
        AllowedTerm: [
          {
            codeMeaning: "liver",
            codeValue: "RID58",
            codingSchemeDesignator: "RadLex",
            codingSchemeVersion: "1.0"
          },
          {
            codeMeaning: "right lobe of liver",
            codeValue: "RID74",
            codingSchemeDesignator: "RadLex",
            codingSchemeVersion: "1.0"
          },
          {
            codeMeaning: "left lobe of liver",
            codeValue: "RID69",
            codingSchemeDesignator: "RadLex",
            codingSchemeVersion: "1.0"
          },
          {
            codeMeaning: "caudate lobe of liver",
            codeValue: "RID77",
            codingSchemeDesignator: "Alan",
            codingSchemeVersion: "1.0"
          },
          {
            codeMeaning: "anterior segment of right lobe of liver",
            codeValue: "RID75",
            codingSchemeDesignator: "RadLex",
            codingSchemeVersion: "1.0"
          },
          {
            codeMeaning: "posterior segment of right lobe of liver",
            codeValue: "RID76",
            codingSchemeDesignator: "RadLex",
            codingSchemeVersion: "1.0"
          },
          {
            codeMeaning: "lateral segment of left lobe of liver",
            codeValue: "RID70",
            codingSchemeDesignator: "RadLex",
            codingSchemeVersion: "1.0"
          },
          {
            codeMeaning: "medial segment of left lobe of liver",
            codeValue: "RID71",
            codingSchemeDesignator: "RadLex",
            codingSchemeVersion: "1.0"
          }
        ]
      },
      {
        authors: "cfbeaulieu",
        explanatoryText:
          "Which hepatic segments does the annotated lesion mainly occupy?  Up to 2 choices for bridging lesions.",
        groupLabel: "",
        id: "2.25.1800391920324.536979722903.204033480052",
        itemNumber: "2",
        label: "Segmental Location",
        maxCardinality: "2",
        minCardinality: "1",
        shouldDisplay: "true",
        AnatomicEntity: {
          annotatorConfidence: "false"
        },
        AllowedTerm: [
          {
            codeMeaning: "hepatovenous segment II",
            codeValue: "RID62",
            codingSchemeDesignator: "RadLex",
            codingSchemeVersion: "1.0"
          },
          {
            codeMeaning: "hepatovenous segment III",
            codeValue: "RID63",
            codingSchemeDesignator: "RadLex",
            codingSchemeVersion: "1.0"
          },
          {
            codeMeaning: "hepatovenous segment IVa",
            codeValue: "RID13115",
            codingSchemeDesignator: "RadLex",
            codingSchemeVersion: "1.0"
          },
          {
            codeMeaning: "hepatovenous segment IVb",
            codeValue: "RID13116",
            codingSchemeDesignator: "RadLex",
            codingSchemeVersion: "1.0"
          },
          {
            codeMeaning: "hepatovenous segment V",
            codeValue: "RID65",
            codingSchemeDesignator: "RadLex",
            codingSchemeVersion: "1.0"
          },
          {
            codeMeaning: "hepatovenous segment VI",
            codeValue: "RID66",
            codingSchemeDesignator: "RadLex",
            codingSchemeVersion: "1.0"
          },
          {
            codeMeaning: "hepatovenous segment VII",
            codeValue: "RID67",
            codingSchemeDesignator: "RadLex",
            codingSchemeVersion: "1.0"
          },
          {
            codeMeaning: "hepatovenous segment VIII",
            codeValue: "RID68",
            codingSchemeDesignator: "RadLex",
            codingSchemeVersion: "1.0"
          },
          {
            codeMeaning: "hepatovenous segment IX",
            codeValue: "RID29230",
            codingSchemeDesignator: "RadLex",
            codingSchemeVersion: "1.0"
          }
        ]
      },
      {
        authors: "cfbeaulieu",
        explanatoryText:
          "Mass, normal, or geographic alteration? Almost all annotations will be for a mass.",
        groupLabel: "",
        id: "2.25.1800391920560.536979723139.204033480097",
        itemNumber: "3",
        label: "Lesion Type",
        maxCardinality: "1",
        minCardinality: "1",
        shouldDisplay: "true",
        ImagingObservation: {
          annotatorConfidence: "false",
          ImagingObservationCharacteristic: [
            {
              annotatorConfidence: "false",
              authors: "cfbeaulieu",
              explanatoryText:
                "What is the etiology of the lesion or its presumed etiology?",
              groupLabel: "",
              id: "2.25.1800391920798.536979723377.204033480142",
              itemNumber: "0",
              label: "Diagnosis",
              maxCardinality: "1",
              minCardinality: "1",
              shouldDisplay: "true",
              AllowedTerm: [
                {
                  codeMeaning: "abscess",
                  codeValue: "RID3711",
                  codingSchemeDesignator: "RadLex",
                  codingSchemeVersion: "1.0"
                },
                {
                  codeMeaning: "angiosarcoma",
                  codeValue: "RID3989",
                  codingSchemeDesignator: "RadLex",
                  codingSchemeVersion: "1.0"
                },
                {
                  codeMeaning: "cholangiocarcinoma",
                  codeValue: "RID4266",
                  codingSchemeDesignator: "RadLex",
                  codingSchemeVersion: "1.0"
                },
                {
                  codeMeaning: "choledochal cyst",
                  codeValue: "RID3896",
                  codingSchemeDesignator: "RadLex",
                  codingSchemeVersion: "1.0"
                },
                {
                  codeMeaning: "cyst",
                  codeValue: "RID3890",
                  codingSchemeDesignator: "RadLex",
                  codingSchemeVersion: "1.0"
                },
                {
                  codeMeaning: "cystadenoma",
                  codeValue: "RID4150",
                  codingSchemeDesignator: "RadLex",
                  codingSchemeVersion: "1.0"
                },
                {
                  codeMeaning: "cystadenocarcinoma",
                  codeValue: "RID4153",
                  codingSchemeDesignator: "RadLex",
                  codingSchemeVersion: "1.0"
                },
                {
                  codeMeaning: "fibrolamellar hepatocellular carcinoma",
                  codeValue: "RID4273",
                  codingSchemeDesignator: "RadLex",
                  codingSchemeVersion: "1.0"
                },
                {
                  codeMeaning: "focal nodular hyperplasia",
                  codeValue: "RID3778",
                  codingSchemeDesignator: "RadLex",
                  codingSchemeVersion: "1.0"
                },
                {
                  codeMeaning: "fungal microabscess",
                  codeValue: "RID45672",
                  codingSchemeDesignator: "ISIS_LIVER",
                  codingSchemeVersion: ""
                },
                {
                  codeMeaning: "hamartoma",
                  codeValue: "RID4335",
                  codingSchemeDesignator: "RadLex",
                  codingSchemeVersion: "1.0"
                },
                {
                  codeMeaning: "hematoma",
                  codeValue: "RID4705",
                  codingSchemeDesignator: "RadLex",
                  codingSchemeVersion: "1.0"
                },
                {
                  codeMeaning: "hemangioma",
                  codeValue: "RID3969",
                  codingSchemeDesignator: "RadLex",
                  codingSchemeVersion: "1.0"
                },
                {
                  codeMeaning: "hepatoblastoma",
                  codeValue: "RID4530",
                  codingSchemeDesignator: "RadLex",
                  codingSchemeVersion: "1.0"
                },
                {
                  codeMeaning: "hepatocellular adenoma",
                  codeValue: "RID4215",
                  codingSchemeDesignator: "RadLex",
                  codingSchemeVersion: "1.0"
                },
                {
                  codeMeaning: "hepatocellular carcinoma",
                  codeValue: "RID4271",
                  codingSchemeDesignator: "RadLex",
                  codingSchemeVersion: "1.0"
                },
                {
                  codeMeaning: "hyatid cyst",
                  codeValue: "RID34798",
                  codingSchemeDesignator: "RadLex",
                  codingSchemeVersion: "1.0"
                },
                {
                  codeMeaning: "laceration",
                  codeValue: "RID4734",
                  codingSchemeDesignator: "RadLex",
                  codingSchemeVersion: "1.0"
                },
                {
                  codeMeaning: "metastasis",
                  codeValue: "RID5231",
                  codingSchemeDesignator: "RadLex",
                  codingSchemeVersion: "1.0"
                },
                {
                  codeMeaning: "regenerative nodule",
                  codeValue: "RID3879",
                  codingSchemeDesignator: "RadLex",
                  codingSchemeVersion: "1.0"
                },
                {
                  codeMeaning: "steatosis",
                  codeValue: "RID5217",
                  codingSchemeDesignator: "RadLex",
                  codingSchemeVersion: "1.0"
                }
              ]
            },
            {
              annotatorConfidence: "false",
              authors: "cfbeaulieu",
              explanatoryText:
                "What is the phase of intravenous contrast enhancement, or is it a noncontrast scan?",
              groupLabel: "",
              id: "2.25.1800391921038.536979723617.204033480187",
              itemNumber: "1",
              label: "Imaging Phase",
              maxCardinality: "1",
              minCardinality: "1",
              shouldDisplay: "true",
              AllowedTerm: [
                {
                  codeMeaning: "early arterial phase",
                  codeValue: "RID11082",
                  codingSchemeDesignator: "RadLex",
                  codingSchemeVersion: "1.0"
                },
                {
                  codeMeaning: "late arterial phase",
                  codeValue: "RID39127",
                  codingSchemeDesignator: "RadLex",
                  codingSchemeVersion: "1.0"
                },
                {
                  codeMeaning: "portal venous phase",
                  codeValue: "RID11085",
                  codingSchemeDesignator: "RadLex",
                  codingSchemeVersion: "1.0"
                },
                {
                  codeMeaning: "unenhanced phase",
                  codeValue: "RID11086",
                  codingSchemeDesignator: "RadLex",
                  codingSchemeVersion: "1.0"
                },
                {
                  codeMeaning: "equilibrium phase",
                  codeValue: "RID39315",
                  codingSchemeDesignator: "RadLex",
                  codingSchemeVersion: "1.0"
                },
                {
                  codeMeaning: "delayed phase (liver)",
                  codeValue: "RID39437",
                  codingSchemeDesignator: "RadLex",
                  codingSchemeVersion: "1.0"
                }
              ]
            },
            {
              annotatorConfidence: "false",
              authors: "cfbeaulieu",
              explanatoryText:
                "How many lesions with a given diagnosis? Are there also more complex distribution patterns?  Up to 2 responses.",
              groupLabel: "",
              id: "2.25.1800391921279.536979723858.204033480232",
              itemNumber: "2",
              label: "Focality of Lesion",
              maxCardinality: "2",
              minCardinality: "1",
              shouldDisplay: "true",
              AllowedTerm: [
                {
                  codeMeaning: "solitary lesion",
                  codeValue: "RID43312",
                  codingSchemeDesignator: "RadLex",
                  codingSchemeVersion: "1.0"
                },
                {
                  codeMeaning: "multiple lesions 1-5",
                  codeValue: "RID43314",
                  codingSchemeDesignator: "RadLex",
                  codingSchemeVersion: "1.0"
                },
                {
                  codeMeaning: "multiple lesions 6-10",
                  codeValue: "RID43315",
                  codingSchemeDesignator: "RadLex",
                  codingSchemeVersion: "1.0"
                },
                {
                  codeMeaning: "multiple lesions >10",
                  codeValue: "RID43316",
                  codingSchemeDesignator: "RadLex",
                  codingSchemeVersion: "1.0"
                },
                {
                  codeMeaning: "satellite lesions present",
                  codeValue: "RID43317",
                  codingSchemeDesignator: "RadLex",
                  codingSchemeVersion: "1.0"
                },
                {
                  codeMeaning: "coalescent",
                  codeValue: "RID5699",
                  codingSchemeDesignator: "RadLex",
                  codingSchemeVersion: "1.0"
                },
                {
                  codeMeaning: "infiltrative",
                  codeValue: "RID6282",
                  codingSchemeDesignator: "RadLex",
                  codingSchemeVersion: "1.0"
                },
                {
                  codeMeaning: "diffuse",
                  codeValue: "RID5701",
                  codingSchemeDesignator: "RadLex",
                  codingSchemeVersion: "1.0"
                }
              ]
            },
            {
              annotatorConfidence: "false",
              authors: "cfbeaulieu",
              explanatoryText:
                "What is the overall shape or shapes associated with the lesion?  Up to 3 responses.",
              groupLabel: "",
              id: "2.25.1800391921521.536979724100.204033480277",
              itemNumber: "3",
              label: "Shape Descriptors",
              maxCardinality: "3",
              minCardinality: "1",
              shouldDisplay: "true",
              AllowedTerm: [
                {
                  codeMeaning: "round",
                  codeValue: "RID5799",
                  codingSchemeDesignator: "RadLex",
                  codingSchemeVersion: "1.0"
                },
                {
                  codeMeaning: "oval",
                  codeValue: "RID5800",
                  codingSchemeDesignator: "RadLex",
                  codingSchemeVersion: "1.0"
                },
                {
                  codeMeaning: "irregular",
                  codeValue: "RID5809",
                  codingSchemeDesignator: "RadLex",
                  codingSchemeVersion: "1.0"
                },
                {
                  codeMeaning: "multilobulated",
                  codeValue: "RID39133",
                  codingSchemeDesignator: "RadLex",
                  codingSchemeVersion: "1.0"
                },
                {
                  codeMeaning: "wedge-shaped",
                  codeValue: "RID5812",
                  codingSchemeDesignator: "RadLex",
                  codingSchemeVersion: "1.0"
                },
                {
                  codeMeaning: "linear",
                  codeValue: "RID5811",
                  codingSchemeDesignator: "RadLex",
                  codingSchemeVersion: "1.0"
                },
                {
                  codeMeaning: "reticular",
                  codeValue: "RID5902",
                  codingSchemeDesignator: "RadLex",
                  codingSchemeVersion: "1.0"
                },
                {
                  codeMeaning: "septated",
                  codeValue: "RID5907",
                  codingSchemeDesignator: "RadLex",
                  codingSchemeVersion: "1.0"
                }
              ]
            },
            {
              annotatorConfidence: "true",
              authors: "cfbeaulieu",
              explanatoryText:
                "How smooth or irregular is the outer lesion contour or boundary?  Do not confuse with border *defnition*.  Quantify from smooth (1) to irregular (100)",
              groupLabel: "",
              id: "2.25.1800391922007.536979724586.204033480367",
              itemNumber: "5",
              label: "Margin Contours: Smooth to Irregular",
              maxCardinality: "1",
              minCardinality: "1",
              shouldDisplay: "true",
              AllowedTerm: [
                {
                  codeMeaning: "smooth margin",
                  codeValue: "RID5714",
                  codingSchemeDesignator: "ISIS_LIVER",
                  codingSchemeVersion: "1.0"
                },
                {
                  codeMeaning: "moderately smooth margin",
                  codeValue: "RID45668",
                  codingSchemeDesignator: "ISIS_LIVER",
                  codingSchemeVersion: "1.0"
                },
                {
                  codeMeaning: "neither smooth nor irregular margin",
                  codeValue: "RID45671",
                  codingSchemeDesignator: "ISIS_LIVER",
                  codingSchemeVersion: "1.0"
                },
                {
                  codeMeaning: "moderately irregular margin",
                  codeValue: "RID45670",
                  codingSchemeDesignator: "ISIS_LIVER",
                  codingSchemeVersion: "1.0"
                },
                {
                  codeMeaning: "irregular margin",
                  codeValue: "RID5715",
                  codingSchemeDesignator: "ISIS_LIVER",
                  codingSchemeVersion: "1.0"
                }
              ]
            },
            {
              annotatorConfidence: "false",
              authors: "cfbeaulieu",
              explanatoryText:
                "Estimate the overall lesion density given all internal components.  For the current imaging phase only.",
              groupLabel: "",
              id: "2.25.1800391922251.536979724830.204033480412",
              itemNumber: "6",
              label: "Average Lesion Density: Hypo to Hyperdense",
              maxCardinality: "1",
              minCardinality: "1",
              shouldDisplay: "true",
              AllowedTerm: [
                {
                  codeMeaning: "hypodense",
                  codeValue: "RID6042",
                  codingSchemeDesignator: "RadLex",
                  codingSchemeVersion: "1.0"
                },
                {
                  codeMeaning: "iso to slightly hypodense",
                  codeValue: "RID45673",
                  codingSchemeDesignator: "ISIS_LIVER",
                  codingSchemeVersion: "1.0"
                },
                {
                  codeMeaning: "isodense",
                  codeValue: "RID6043",
                  codingSchemeDesignator: "RadLex",
                  codingSchemeVersion: "1.0"
                },
                {
                  codeMeaning: "iso to slightly hyperdense",
                  codeValue: "RID45674",
                  codingSchemeDesignator: "ISIS_LIVER",
                  codingSchemeVersion: "1.0"
                },
                {
                  codeMeaning: "hyperdense",
                  codeValue: "RID6044",
                  codingSchemeDesignator: "RadLex",
                  codingSchemeVersion: "1.0"
                }
              ]
            },
            {
              annotatorConfidence: "false",
              authors: "cfbeaulieu",
              explanatoryText:
                "Is the lesion uniform (homogeneous) or nonuniform (heterogeneous) internally?",
              groupLabel: "",
              id: "2.25.1800391922496.536979725075.204033480457",
              itemNumber: "7",
              label: "Density - Homogeneous or Heterogeneous",
              maxCardinality: "1",
              minCardinality: "1",
              shouldDisplay: "true",
              AllowedTerm: [
                {
                  codeMeaning: "homogeneous",
                  codeValue: "RID6059",
                  codingSchemeDesignator: "RadLex",
                  codingSchemeVersion: "1.0"
                },
                {
                  codeMeaning: "heterogeneous",
                  codeValue: "RID6060",
                  codingSchemeDesignator: "RadLex",
                  codingSchemeVersion: "1.0"
                }
              ]
            },
            {
              annotatorConfidence: "false",
              authors: "cfbeaulieu",
              explanatoryText:
                "Does the lesion enhance with intravenous contrast?",
              groupLabel: "",
              id: "2.25.1800391922742.536979725321.204033480502",
              itemNumber: "8",
              label: "Enhancement",
              maxCardinality: "1",
              minCardinality: "1",
              shouldDisplay: "true",
              AllowedTerm: [
                {
                  codeMeaning: "nonenhancing",
                  codeValue: "RID6056",
                  codingSchemeDesignator: "RadLex",
                  codingSchemeVersion: "1.0"
                },
                {
                  codeMeaning: "enhancing",
                  codeValue: "RID6055",
                  codingSchemeDesignator: "RadLex",
                  codingSchemeVersion: "1.0"
                }
              ]
            },
            {
              annotatorConfidence: "false",
              authors: "cfbeaulieu",
              explanatoryText:
                "Only if enhancing, is the enhancement homogeneous or heterogeneous?",
              groupLabel: "",
              id: "2.25.1800391922988.536979725567.204033480547",
              itemNumber: "9",
              label: "Enhancement Uniformity",
              maxCardinality: "2",
              minCardinality: "0",
              shouldDisplay: "true",
              AllowedTerm: [
                {
                  codeMeaning: "homogeneous enhancement",
                  codeValue: "RID39563",
                  codingSchemeDesignator: "RadLex",
                  codingSchemeVersion: "1.0"
                },
                {
                  codeMeaning: "heterogeneous enhancement",
                  codeValue: "RID39457",
                  codingSchemeDesignator: "RadLex",
                  codingSchemeVersion: "1.0"
                }
              ]
            },
            {
              annotatorConfidence: "false",
              authors: "cfbeaulieu",
              explanatoryText:
                "If enhancing, what pattern(s) are observed? Choose up to 3 features.",
              groupLabel: "",
              id: "2.25.1800391923235.536979725814.204033480592",
              itemNumber: "10",
              label: "Specific Enhancement Pattern(s)",
              maxCardinality: "3",
              minCardinality: "0",
              shouldDisplay: "true",
              AllowedTerm: [
                {
                  codeMeaning: "homogeneous internal enhancement",
                  codeValue: "RID34421",
                  codingSchemeDesignator: "RadLex",
                  codingSchemeVersion: "1.0"
                },
                {
                  codeMeaning: "central hypodensity",
                  codeValue: "RID45722",
                  codingSchemeDesignator: "RadLex",
                  codingSchemeVersion: "1.0"
                },
                {
                  codeMeaning: "target enhancement",
                  codeValue: "RID43320",
                  codingSchemeDesignator: "RadLex",
                  codingSchemeVersion: "1.0"
                },
                {
                  codeMeaning: "mottled enhancement",
                  codeValue: "RID43321",
                  codingSchemeDesignator: "RadLex",
                  codingSchemeVersion: "1.0"
                },
                {
                  codeMeaning: "reticular enhancement",
                  codeValue: "RID34311",
                  codingSchemeDesignator: "RadLex",
                  codingSchemeVersion: "1.0"
                },
                {
                  codeMeaning: "peripheral discontinuous nodular enhancement",
                  codeValue: "RID43319",
                  codingSchemeDesignator: "RadLex",
                  codingSchemeVersion: "1.0"
                },
                {
                  codeMeaning: "peripheral continuous rim enhancement",
                  codeValue: "RID43318",
                  codingSchemeDesignator: "RadLex",
                  codingSchemeVersion: "1.0"
                },
                {
                  codeMeaning: "enhancing central scar",
                  codeValue: "RID45692",
                  codingSchemeDesignator: "ISIS_LIVER",
                  codingSchemeVersion: "1.0"
                },
                {
                  codeMeaning: "nonenhancing central scar",
                  codeValue: "RID43326",
                  codingSchemeDesignator: "RadLex",
                  codingSchemeVersion: "1.0"
                },
                {
                  codeMeaning: "incomplete rim",
                  codeValue: "RID43291",
                  codingSchemeDesignator: "RadLex",
                  codingSchemeVersion: "1.0"
                },
                {
                  codeMeaning: "thin rim",
                  codeValue: "RID43309",
                  codingSchemeDesignator: "RadLex",
                  codingSchemeVersion: "1.0"
                },
                {
                  codeMeaning: "thick rim",
                  codeValue: "RID43308",
                  codingSchemeDesignator: "RadLex",
                  codingSchemeVersion: "1.0"
                }
              ]
            },
            {
              annotatorConfidence: "false",
              authors: "cfbeaulieu",
              explanatoryText:
                "On multiphasic imaging, what happens to enhancement over time?",
              groupLabel: "",
              id: "2.25.1800391923732.536979726311.204033480682",
              itemNumber: "11",
              label: "Temporal Enhancement (if known)",
              maxCardinality: "1",
              minCardinality: "0",
              shouldDisplay: "true",
              AllowedTerm: [
                {
                  codeMeaning: "homogeneous retention",
                  codeValue: "RID43338",
                  codingSchemeDesignator: "RadLex",
                  codingSchemeVersion: "1.0"
                },
                {
                  codeMeaning: "homogeneous fade",
                  codeValue: "RID43339",
                  codingSchemeDesignator: "RadLex",
                  codingSchemeVersion: "1.0"
                },
                {
                  codeMeaning: "centripetal fill-in",
                  codeValue: "RID43323",
                  codingSchemeDesignator: "RadLex",
                  codingSchemeVersion: "1.0"
                },
                {
                  codeMeaning: "washout appearance",
                  codeValue: "RID39486",
                  codingSchemeDesignator: "RadLex",
                  codingSchemeVersion: "1.0"
                }
              ]
            },
            {
              annotatorConfidence: "false",
              authors: "cfbeaulieu",
              explanatoryText:
                'If septations are present, how thick are they?  Note "septated" may be included as a Shape Descriptor above.',
              groupLabel: "",
              id: "2.25.1800391923483.536979726062.204033480637",
              itemNumber: "12",
              label: "Septation Thickness",
              maxCardinality: "1",
              minCardinality: "0",
              shouldDisplay: "true",
              AllowedTerm: [
                {
                  codeMeaning: "thick septae",
                  codeValue: "RID45676",
                  codingSchemeDesignator: "ISIS_LIVER",
                  codingSchemeVersion: "1.0"
                },
                {
                  codeMeaning: "thin septae",
                  codeValue: "RID45675",
                  codingSchemeDesignator: "ISIS_LIVER",
                  codingSchemeVersion: "1.0"
                }
              ]
            },
            {
              annotatorConfidence: "false",
              authors: "cfbeaulieu",
              explanatoryText:
                "Is the perilesional tissue normal, or is there a THAD or similar effect?",
              groupLabel: "",
              id: "2.25.1800391923982.536979726561.204033480727",
              itemNumber: "13",
              label: "Perilesional Tissue",
              maxCardinality: "1",
              minCardinality: "1",
              shouldDisplay: "true",
              AllowedTerm: [
                {
                  codeMeaning: "perilesional perfusion alteration",
                  codeValue: "RID43300",
                  codingSchemeDesignator: "RadLex",
                  codingSchemeVersion: "1.0"
                },
                {
                  codeMeaning: "normal perilesional tissue",
                  codeValue: "RID43298",
                  codingSchemeDesignator: "RadLex",
                  codingSchemeVersion: "1.0"
                }
              ]
            },
            {
              annotatorConfidence: "false",
              authors: "cfbeaulieu",
              explanatoryText:
                "Is there calcification, necrosis, central scar or other special feature(s)?  Up to 3 responses.",
              groupLabel: "",
              id: "2.25.1800391924232.536979726811.204033480772",
              itemNumber: "14",
              label: "Special Features",
              maxCardinality: "3",
              minCardinality: "0",
              shouldDisplay: "true",
              AllowedTerm: [
                {
                  codeMeaning: "blood products (lesion)",
                  codeValue: "RID43346",
                  codingSchemeDesignator: "RadLex",
                  codingSchemeVersion: "1.0"
                },
                {
                  codeMeaning: "calcification",
                  codeValue: "RID5196",
                  codingSchemeDesignator: "RadLex",
                  codingSchemeVersion: "1.0"
                },
                {
                  codeMeaning: "central scar",
                  codeValue: "RID43325",
                  codingSchemeDesignator: "RadLex",
                  codingSchemeVersion: "1.0"
                },
                {
                  codeMeaning: "gas containing",
                  codeValue: "RID5750",
                  codingSchemeDesignator: "RadLex",
                  codingSchemeVersion: "1.0"
                },
                {
                  codeMeaning: "intralesional fat",
                  codeValue: "RID39463",
                  codingSchemeDesignator: "RadLex",
                  codingSchemeVersion: "1.0"
                },
                {
                  codeMeaning: "necrosis",
                  codeValue: "RID5171",
                  codingSchemeDesignator: "RadLex",
                  codingSchemeVersion: "1.0"
                },
                {
                  codeMeaning: "oil emulsion contrast",
                  codeValue: "RID11598",
                  codingSchemeDesignator: "RadLex",
                  codingSchemeVersion: "1.0"
                },
                {
                  codeMeaning: "parallels blood pool enhancement",
                  codeValue: "RID39472",
                  codingSchemeDesignator: "RadLex",
                  codingSchemeVersion: "1.0"
                },
                {
                  codeMeaning: "visible internal vessels",
                  codeValue: "RID43324",
                  codingSchemeDesignator: "RadLex",
                  codingSchemeVersion: "1.0"
                }
              ]
            },
            {
              annotatorConfidence: "false",
              authors: "cfbeaulieu",
              explanatoryText:
                "Choose up to 3 additional features about how the lesion affects the liver.",
              groupLabel: "",
              id: "2.25.1800391924483.536979727062.204033480817",
              itemNumber: "15",
              label: "Lesion Effects on Liver",
              maxCardinality: "3",
              minCardinality: "0",
              shouldDisplay: "true",
              AllowedTerm: [
                {
                  codeMeaning: "abuts capsule of liver",
                  codeValue: "RID43327",
                  codingSchemeDesignator: "RadLex",
                  codingSchemeVersion: "1.0"
                },
                {
                  codeMeaning: "abuts hepatic vein",
                  codeValue: "RID43329",
                  codingSchemeDesignator: "RadLex",
                  codingSchemeVersion: "1.0"
                },
                {
                  codeMeaning: "abuts portal vein",
                  codeValue: "RID43331",
                  codingSchemeDesignator: "RadLex",
                  codingSchemeVersion: "1.0"
                },
                {
                  codeMeaning: "adjacent to gallbladder",
                  codeValue: "RID43295",
                  codingSchemeDesignator: "RadLex",
                  codingSchemeVersion: "1.0"
                },
                {
                  codeMeaning: "bland thrombus in portal vein",
                  codeValue: "RID45678",
                  codingSchemeDesignator: "ISIS_LIVER",
                  codingSchemeVersion: "1.0"
                },
                {
                  codeMeaning: "bulges capsule of liver",
                  codeValue: "RID43328",
                  codingSchemeDesignator: "RadLex",
                  codingSchemeVersion: "1.0"
                },
                {
                  codeMeaning: "obstructs biliary ducts",
                  codeValue: "RID45679",
                  codingSchemeDesignator: "ISIS_LIVER",
                  codingSchemeVersion: "1.0"
                },
                {
                  codeMeaning: "retracts capsule of liver",
                  codeValue: "RID45680",
                  codingSchemeDesignator: "ISIS_LIVER",
                  codingSchemeVersion: "1.0"
                },
                {
                  codeMeaning: "tumor thrombus in portal vein",
                  codeValue: "RID45681",
                  codingSchemeDesignator: "ISIS_LIVER",
                  codingSchemeVersion: "1.0"
                }
              ]
            },
            {
              annotatorConfidence: "false",
              authors: "cfbeaulieu",
              explanatoryText:
                "For lesions that are metastases, what is the primary?",
              groupLabel: "",
              id: "2.25.1800391924735.536979727314.204033480862",
              itemNumber: "16",
              label: "Primary Malignancy if Metastatic Disease",
              maxCardinality: "1",
              minCardinality: "1",
              shouldDisplay: "true",
              AllowedTerm: [
                {
                  codeMeaning: "none",
                  codeValue: "RID28454",
                  codingSchemeDesignator: "RadLex",
                  codingSchemeVersion: "1.0"
                },
                {
                  codeMeaning: "adenoid cystic carcinoma",
                  codeValue: "RID4227",
                  codingSchemeDesignator: "RadLex",
                  codingSchemeVersion: "1.0"
                },
                {
                  codeMeaning: "breast cancer",
                  codeValue: "RID45682",
                  codingSchemeDesignator: "RadLex",
                  codingSchemeVersion: "1.0"
                },
                {
                  codeMeaning: "cervical cancer",
                  codeValue: "RID45683",
                  codingSchemeDesignator: "ISIS_LIVER",
                  codingSchemeVersion: "1.0"
                },
                {
                  codeMeaning: "colorectal cancer",
                  codeValue: "RID45684",
                  codingSchemeDesignator: "ISIS_LIVER",
                  codingSchemeVersion: "1.0"
                },
                {
                  codeMeaning: "endometrial cancer",
                  codeValue: "RID45685",
                  codingSchemeDesignator: "ISIS_LIVER",
                  codingSchemeVersion: "1.0"
                },
                {
                  codeMeaning: "gastric carcinoma",
                  codeValue: "RID4251",
                  codingSchemeDesignator: "RadLex",
                  codingSchemeVersion: "1.0"
                },
                {
                  codeMeaning: "gastrointestinal stromal tumor",
                  codeValue: "RID4551",
                  codingSchemeDesignator: "RadLex",
                  codingSchemeVersion: "1.0"
                },
                {
                  codeMeaning: "lung cancer",
                  codeValue: "RID45686",
                  codingSchemeDesignator: "ISIS_LIVER",
                  codingSchemeVersion: "1.0"
                },
                {
                  codeMeaning: "neuroendocrine neoplasm",
                  codeValue: "RID4483",
                  codingSchemeDesignator: "RadLex",
                  codingSchemeVersion: "1.0"
                },
                {
                  codeMeaning: "ovarian cancer",
                  codeValue: "RID45687",
                  codingSchemeDesignator: "ISIS_LIVER",
                  codingSchemeVersion: "1.0"
                },
                {
                  codeMeaning: "pancreatic cancer",
                  codeValue: "RID45688",
                  codingSchemeDesignator: "ISIS_LIVER",
                  codingSchemeVersion: "1.0"
                },
                {
                  codeMeaning: "primary unknown or other",
                  codeValue: "RID39181",
                  codingSchemeDesignator: "ISIS_LIVER",
                  codingSchemeVersion: "1.0"
                },
                {
                  codeMeaning: "prostate cancer",
                  codeValue: "RID45689",
                  codingSchemeDesignator: "ISIS_LIVER",
                  codingSchemeVersion: "1.0"
                },
                {
                  codeMeaning: "renal adenocarcinoma",
                  codeValue: "RID4230",
                  codingSchemeDesignator: "RadLex",
                  codingSchemeVersion: "1.0"
                },
                {
                  codeMeaning: "sarcoma",
                  codeValue: "RID4521",
                  codingSchemeDesignator: "RadLex",
                  codingSchemeVersion: "1.0"
                },
                {
                  codeMeaning: "testicular cancer",
                  codeValue: "RID45690",
                  codingSchemeDesignator: "ISIS_LIVER",
                  codingSchemeVersion: "1.0"
                },
                {
                  codeMeaning: "thyroid cancer",
                  codeValue: "RID45691",
                  codingSchemeDesignator: "ISIS_LIVER",
                  codingSchemeVersion: "1.0"
                },
                {
                  codeMeaning: "transitional cell carcinoma",
                  codeValue: "RID4279",
                  codingSchemeDesignator: "RadLex",
                  codingSchemeVersion: "1.0"
                }
              ]
            }
          ]
        },
        AllowedTerm: {
          codeMeaning: "liver mass",
          codeValue: "RID39466",
          codingSchemeDesignator: "RadLex",
          codingSchemeVersion: "1.0"
        }
      },
      {
        authors: "Default User",
        explanatoryText: "",
        groupLabel: "",
        id: "2.25.260407454693500192885566124937158854189",
        itemNumber: "3",
        label: "Spline ROI",
        maxCardinality: "1",
        minCardinality: "1",
        shouldDisplay: "true",
        GeometricShape: "Point"
      }
    ]
  }
};
export var myjson1 = {
  uid: "2.25.75761204952962875896072870850622745228",
  name: "adsdf",
  authors: "AIM Team",
  version: "asdfadsf",
  creationDate: "2012-12-28",
  description: "asdfsadfasd",
  schemaLocation:
    "gme://caCORE.caCORE/3.2/edu.northwestern.radiology.AIMTemplate AIMTemplate_v2rv13.xsd",
  Template: {
    uid: "2.25.246328047169208880141674055331849154527",
    name: "TEST 3",
    authors: "AIM Team",
    version: "1.0",
    creationDate: "2012-12-28",
    description: "test three",
    modality: "CT",
    precedingAnnotation: "RequireToSelect",
    codeMeaning: "Non-Target Lesion Incomplete Response or Stable Disease",
    codeValue: "112046",
    codingSchemeDesignator: "DCM",
    codingSchemeVersion: "1.0",
    Component: [
      {
        label: "free text",
        itemNumber: "0",
        authors: "AIM Team",
        explanatoryText: "ae ONE",
        minCardinality: "1",
        maxCardinality: "2",
        shouldDisplay: "true",
        id: "2.25.249736992084416545275140963623879078777",
        requireComment: "true",
        textFreeInput: {
          codeValue: "112042",
          codeMeaning: "Target Lesion Partial Response",
          codingSchemeDesignator: "DCM",
          codingSchemeVersion: "1.0"
        }
      },
      {
        label: "AE - 1",
        itemNumber: "0",
        authors: "AIM Team",
        explanatoryText: "ae ONE",
        minCardinality: "1",
        maxCardinality: "2",
        shouldDisplay: "true",
        groupLabel: "AE",
        id: "2.25.249736992084416545275140963623879078175",
        requireComment: "true",
        QuestionType: {
          codeValue: "112042",
          codeMeaning: "Target Lesion Partial Response",
          codingSchemeDesignator: "DCM",
          codingSchemeVersion: "1.0"
        },
        AnatomicEntity: {
          annotatorConfidence: "true",
          AnatomicEntityCharacteristic: [
            {
              label: "AEC - 1 - 1",
              itemNumber: "0",
              authors: "AIM Team",
              explanatoryText: "AEC one - one",
              minCardinality: "1",
              maxCardinality: "1",
              shouldDisplay: "true",
              groupLabel: "AEC - 1 - 1",
              id: "2.25.96983863729747964833684373111073058156",
              requireComment: "true",
              annotatorConfidence: "true",
              AllowedTerm: [
                {
                  codeValue: "RID34993",
                  codeMeaning: "absent gastric air bubble sign",
                  codingSchemeDesignator: "RadLex",
                  codingSchemeVersion: "1.0",
                  ValidTerm: {
                    codeValue: "10055397",
                    codeMeaning: "bone marrow edema",
                    codingSchemeDesignator: "MedDRA",
                    codingSchemeVersion: "1.0"
                  }
                },
                {
                  codeValue: "RID34998",
                  codeMeaning: "acute kyphosis sign",
                  codingSchemeDesignator: "RadLex",
                  codingSchemeVersion: "1.0"
                },
                {
                  codeValue: "RID34997",
                  codeMeaning: "acorn deformity",
                  codingSchemeDesignator: "RadLex",
                  codingSchemeVersion: "1.0",
                  nextId: "2.25.144384273350738068267645406522525823311"
                },
                {
                  codeValue: "RID34995",
                  codeMeaning: "absent liver sign",
                  codingSchemeDesignator: "RadLex",
                  codingSchemeVersion: "1.0"
                },
                {
                  codeValue: "RID34404",
                  codeMeaning: "Mickey Mouse sign of liver",
                  codingSchemeDesignator: "RadLex",
                  codingSchemeVersion: "1.0",
                  ValidTerm: {
                    codeValue: "MTHU002077",
                    codeMeaning: "Bone",
                    codingSchemeDesignator: "LOINC",
                    codingSchemeVersion: ""
                  }
                },
                {
                  codeValue: "RID34409",
                  codeMeaning: "swan neck deformity",
                  codingSchemeDesignator: "RadLex",
                  codingSchemeVersion: "1.0",
                  nextId: "2.25.264945780284452461227299362245725897438"
                },
                {
                  codeValue: "RID34412",
                  codeMeaning: "Erlenmeyer flask deformity",
                  codingSchemeDesignator: "RadLex",
                  codingSchemeVersion: "1.0"
                }
              ],
              QuestionType: {
                codeValue: "RID34999",
                codeMeaning: "air bronchogram sign",
                codingSchemeDesignator: "RadLex",
                codingSchemeVersion: "1.0"
              }
            },
            {
              label: "AEC - 1 - 2",
              itemNumber: "1",
              authors: "AIM Team",
              explanatoryText: "AEC one two",
              minCardinality: "1",
              maxCardinality: "3",
              shouldDisplay: "true",
              groupLabel: "",
              id: "2.25.282321381780351407137178608344539789057",
              requireComment: "true",
              annotatorConfidence: "true",
              AllowedTerm: [
                {
                  codeValue: "RID34995",
                  codeMeaning: "absent liver sign",
                  codingSchemeDesignator: "RadLex",
                  codingSchemeVersion: "1.0",
                  CharacteristicQuantification: {
                    name: "Scale-1",
                    annotatorConfidence: "false",
                    characteristicQuantificationIndex: "0",
                    Scale: {
                      scaleType: "Ordinal",
                      ScaleLevel: [
                        {
                          value: "1",
                          valueLabel: "1",
                          valueDescription: "1"
                        },
                        {
                          value: "2",
                          valueLabel: "two",
                          valueDescription: "2"
                        },
                        {
                          value: "3",
                          valueLabel: "three",
                          valueDescription: "3"
                        }
                      ]
                    },
                    NonQuantifiable: [
                      {
                        codeValue: "R-0038D",
                        codeMeaning: "Yes",
                        codingSchemeDesignator: "SRT",
                        codingSchemeVersion: "1.0"
                      },
                      {
                        codeValue: "G-A540",
                        codeMeaning: "Complex",
                        codingSchemeDesignator: "SRT",
                        codingSchemeVersion: "1.0"
                      },
                      {
                        codeValue: "R-00339",
                        codeMeaning: "No",
                        codingSchemeDesignator: "SRT",
                        codingSchemeVersion: "1.0"
                      }
                    ]
                  }
                },
                {
                  codeValue: "RID34400",
                  codeMeaning: "butterfly shadow",
                  codingSchemeDesignator: "RadLex",
                  codingSchemeVersion: "1.0",
                  defaultAnswer: "true",
                  nextId: "2.25.316621944217354986956136852674485484897",
                  CharacteristicQuantification: {
                    name: "scale",
                    annotatorConfidence: "true",
                    characteristicQuantificationIndex: "0",
                    Scale: {
                      scaleType: "Nominal",
                      ScaleLevel: [
                        {
                          value: "1",
                          valueLabel: "1-1",
                          valueDescription: "1-1-1"
                        },
                        {
                          value: "2",
                          valueLabel: "2-1-1",
                          valueDescription: "2-1-1"
                        },
                        {
                          value: "3",
                          valueLabel: "3-1-1",
                          valueDescription: "3-1-1"
                        }
                      ]
                    },
                    NonQuantifiable: [
                      {
                        codeValue: "R-4207A",
                        codeMeaning: "Extrusion",
                        codingSchemeDesignator: "SRT",
                        codingSchemeVersion: "1.0",
                        defaultAnswer: "true"
                      },
                      {
                        codeValue: "G-A429",
                        codeMeaning: "marked",
                        codingSchemeDesignator: "SRT",
                        codingSchemeVersion: "1.0"
                      }
                    ]
                  }
                },
                {
                  codeValue: "RID34405",
                  codeMeaning: "cobblestone pattern",
                  codingSchemeDesignator: "RadLex",
                  codingSchemeVersion: "1.0",
                  defaultAnswer: "true",
                  ValidTerm: [
                    {
                      codeValue: "C0229962",
                      codeMeaning: "Body Part",
                      codingSchemeDesignator: "NCIm",
                      codingSchemeVersion: "1.0"
                    },
                    {
                      codeValue: "C1204543",
                      codeMeaning: "Plica",
                      codingSchemeDesignator: "NCIm",
                      codingSchemeVersion: "1.0"
                    }
                  ],
                  CharacteristicQuantification: {
                    name: "scale-3",
                    annotatorConfidence: "false",
                    characteristicQuantificationIndex: "0",
                    Scale: {
                      scaleType: "Ratio",
                      ScaleLevel: [
                        {
                          value: "1",
                          valueLabel: "1",
                          valueDescription: "1"
                        },
                        {
                          value: "2",
                          valueLabel: "2",
                          valueDescription: "2"
                        },
                        {
                          value: "3",
                          valueLabel: "3",
                          valueDescription: "3",
                          defaultAnswer: "true"
                        }
                      ]
                    },
                    NonQuantifiable: [
                      {
                        codeValue: "G-A102",
                        codeMeaning: "Center/Bilateral",
                        codingSchemeDesignator: "SRT",
                        codingSchemeVersion: "1.0"
                      },
                      {
                        codeValue: "R-404FA",
                        codeMeaning: "Mild",
                        codingSchemeDesignator: "SRT",
                        codingSchemeVersion: "1.0"
                      },
                      {
                        codeValue: "G-A460",
                        codeMeaning: "Normal",
                        codingSchemeDesignator: "SRT",
                        codingSchemeVersion: "1.0"
                      }
                    ]
                  }
                },
                {
                  codeValue: "RID34409",
                  codeMeaning: "swan neck deformity",
                  codingSchemeDesignator: "RadLex",
                  codingSchemeVersion: "1.0",
                  CharacteristicQuantification: {
                    name: "numerical",
                    annotatorConfidence: "false",
                    characteristicQuantificationIndex: "0",
                    Numerical: [
                      {
                        value: "0.0",
                        ucumString: "cm",
                        operator: "Equal",
                        valueLabel: "0",
                        valueDescription: "zero",
                        askForInput: "false"
                      },
                      {
                        value: "10.0",
                        ucumString: "cm",
                        operator: "NotEqual",
                        valueLabel: "10",
                        valueDescription: "10",
                        askForInput: "false"
                      },
                      {
                        value: "20.0",
                        ucumString: "cm",
                        operator: "LessThan",
                        valueLabel: "20",
                        valueDescription: "20",
                        askForInput: "false"
                      },
                      {
                        value: "30.0",
                        ucumString: "cm",
                        operator: "GreaterThan",
                        valueLabel: "30",
                        valueDescription: "30",
                        askForInput: "false"
                      },
                      {
                        value: "40.0",
                        ucumString: "cm",
                        operator: "LessThanEqual",
                        valueLabel: "40",
                        valueDescription: "40",
                        askForInput: "false"
                      },
                      {
                        value: "50.0",
                        ucumString: "cm",
                        operator: "GreaterThanEqual",
                        valueLabel: "50",
                        valueDescription: "50",
                        askForInput: "false"
                      }
                    ],
                    NonQuantifiable: [
                      {
                        codeValue: "R-0038D",
                        codeMeaning: "Yes",
                        codingSchemeDesignator: "SRT",
                        codingSchemeVersion: "1.0"
                      },
                      {
                        codeValue: "G-A142",
                        codeMeaning: "Horizontal",
                        codingSchemeDesignator: "SRT",
                        codingSchemeVersion: "1.0"
                      },
                      {
                        codeValue: "G-A429",
                        codeMeaning: "marked",
                        codingSchemeDesignator: "SRT",
                        codingSchemeVersion: "1.0"
                      }
                    ]
                  }
                },
                {
                  codeValue: "RID34412",
                  codeMeaning: "Erlenmeyer flask deformity",
                  codingSchemeDesignator: "RadLex",
                  codingSchemeVersion: "1.0",
                  defaultAnswer: "true",
                  CharacteristicQuantification: {
                    name: "Quantile",
                    annotatorConfidence: "false",
                    characteristicQuantificationIndex: "0",
                    Quantile: {
                      minValue: "0.0",
                      maxValue: "500.0",
                      bins: "16",
                      valueLabel: "quantile",
                      valueDescription: "500",
                      defaultBin: "2"
                    },
                    NonQuantifiable: [
                      {
                        codeValue: "R-00339",
                        codeMeaning: "no",
                        codingSchemeDesignator: "SRT",
                        codingSchemeVersion: "1.0"
                      },
                      {
                        codeValue: "R-0038D",
                        codeMeaning: "Yes",
                        codingSchemeDesignator: "SRT",
                        codingSchemeVersion: "1.0"
                      },
                      {
                        codeValue: "R-00339",
                        codeMeaning: "No",
                        codingSchemeDesignator: "SRT",
                        codingSchemeVersion: "1.0"
                      }
                    ]
                  }
                },
                {
                  codeValue: "RID34399",
                  codeMeaning: "bowler hat sign",
                  codingSchemeDesignator: "RadLex",
                  codingSchemeVersion: "1.0",
                  ValidTerm: {
                    codeValue: "C66832",
                    codeMeaning: "one",
                    codingSchemeDesignator: "NCIt",
                    codingSchemeVersion: "1.0"
                  },
                  CharacteristicQuantification: {
                    name: "Interval",
                    annotatorConfidence: "false",
                    characteristicQuantificationIndex: "0",
                    Interval: [
                      {
                        minValue: "0.0",
                        maxValue: "10.0",
                        minOperator: "GreaterThan",
                        maxOperator: "LessThanEqual",
                        ucumString: "cm",
                        valueLabel: "0-10",
                        valueDescription: "0-10",
                        askForInput: "false"
                      },
                      {
                        minValue: "10.0",
                        maxValue: "20.0",
                        minOperator: "NotEqual",
                        maxOperator: "LessThanEqual",
                        ucumString: "cm",
                        valueLabel: "10-20",
                        valueDescription: "10-20",
                        askForInput: "false"
                      },
                      {
                        minValue: "20.0",
                        maxValue: "30.0",
                        minOperator: "GreaterThan",
                        maxOperator: "LessThanEqual",
                        ucumString: "cm",
                        valueLabel: "20-30",
                        valueDescription: "20-30",
                        askForInput: "false"
                      },
                      {
                        minValue: "30.0",
                        maxValue: "40.0",
                        minOperator: "GreaterThanEqual",
                        maxOperator: "LessThanEqual",
                        ucumString: "cm",
                        valueLabel: "cm",
                        valueDescription: "cm",
                        askForInput: "false"
                      }
                    ],
                    NonQuantifiable: [
                      {
                        codeValue: "G-A472",
                        codeMeaning: "Oblique",
                        codingSchemeDesignator: "SRT",
                        codingSchemeVersion: "1.0"
                      },
                      {
                        codeValue: "R-00339",
                        codeMeaning: "No",
                        codingSchemeDesignator: "SRT",
                        codingSchemeVersion: "1.0"
                      },
                      {
                        codeValue: "G-A104",
                        codeMeaning: "Lateral",
                        codingSchemeDesignator: "SRT",
                        codingSchemeVersion: "1.0"
                      },
                      {
                        codeValue: "G-A540",
                        codeMeaning: "Complex",
                        codingSchemeDesignator: "SRT",
                        codingSchemeVersion: "1.0"
                      }
                    ]
                  }
                }
              ],
              QuestionType: {
                codeValue: "G-A460",
                codeMeaning: "Normal",
                codingSchemeDesignator: "SRT",
                codingSchemeVersion: "1.0"
              }
            },
            {
              label: "AEC - 1- 3",
              itemNumber: "2",
              authors: "Default User",
              explanatoryText: "AEC 1-3",
              minCardinality: "0",
              maxCardinality: "1",
              shouldDisplay: "true",
              groupLabel: "AEC - 1 - 1",
              id: "2.25.314136553354390144751865176243128910653",
              annotatorConfidence: "false",
              AllowedTerm: [
                {
                  codeValue: "2181666",
                  codeMeaning: "Image Nodule Lobar Location Type",
                  codingSchemeDesignator: "CTEP",
                  codingSchemeVersion: "1.0"
                },
                {
                  codeValue: "62",
                  codeMeaning: "Patient Gender Category",
                  codingSchemeDesignator: "CTEP",
                  codingSchemeVersion: "1.0"
                },
                {
                  codeValue: "2182326",
                  codeMeaning: "Nodule Histology Histologic Type WHO Code",
                  codingSchemeDesignator: "CTEP",
                  codingSchemeVersion: "1.0"
                },
                {
                  codeValue: "57819",
                  codeMeaning: "NonNodule Finding X Position Number",
                  codingSchemeDesignator: "CTEP",
                  codingSchemeVersion: "1.0"
                },
                {
                  codeValue: "2182326",
                  codeMeaning: "Nodule Histology Histologic Type WHO Code",
                  codingSchemeDesignator: "CTEP",
                  codingSchemeVersion: "1.0"
                }
              ]
            }
          ]
        },
        AllowedTerm: [
          {
            codeValue: "RID35335",
            codeMeaning: "lambda sign of chest",
            codingSchemeDesignator: "RadLex",
            codingSchemeVersion: "1.0",
            nextId: "2.25.316621944217354986956136852674485484897",
            ValidTerm: {
              codeValue: "C25228",
              codeMeaning: "Right",
              codingSchemeDesignator: "NCIt",
              codingSchemeVersion: "1.0"
            }
          },
          {
            codeValue: "RID35340",
            codeMeaning: "leafless tree sign",
            codingSchemeDesignator: "RadLex",
            codingSchemeVersion: "1.0"
          },
          {
            codeValue: "RID35346",
            codeMeaning: "linguine sign",
            codingSchemeDesignator: "RadLex",
            codingSchemeVersion: "1.0"
          },
          {
            codeValue: "RID35349",
            codeMeaning: "lollipop sign",
            codingSchemeDesignator: "RadLex",
            codingSchemeVersion: "1.0"
          }
        ]
      },
      {
        label: "IO",
        itemNumber: "1",
        authors: "AIM Team",
        explanatoryText: "IO",
        minCardinality: "1",
        maxCardinality: "1",
        shouldDisplay: "true",
        groupLabel: "IO",
        id: "2.25.221240251915004149123867287125995545695",
        QuestionType: {
          codeValue: "R-4206F",
          codeMeaning: "Displaced",
          codingSchemeDesignator: "SRT",
          codingSchemeVersion: "1.0"
        },
        ImagingObservation: {
          annotatorConfidence: "false",
          ImagingObservationCharacteristic: {
            label: "IOC",
            itemNumber: "0",
            authors: "AIM Team",
            explanatoryText: "IOC",
            minCardinality: "1",
            maxCardinality: "3",
            shouldDisplay: "true",
            groupLabel: "",
            id: "2.25.262609545894946533504172503990783678900",
            requireComment: "true",
            annotatorConfidence: "true",
            AllowedTerm: [
              {
                codeValue: "RID34996",
                codeMeaning: "accordian sign",
                codingSchemeDesignator: "RadLex",
                codingSchemeVersion: "1.0"
              },
              {
                codeValue: "RID34995",
                codeMeaning: "absent liver sign",
                codingSchemeDesignator: "RadLex",
                codingSchemeVersion: "1.0",
                defaultAnswer: "true"
              },
              {
                codeValue: "RID34407",
                codeMeaning: "comet tail sign",
                codingSchemeDesignator: "RadLex",
                codingSchemeVersion: "1.0"
              },
              {
                codeValue: "RID34411",
                codeMeaning: "absent bow tie sign",
                codingSchemeDesignator: "RadLex",
                codingSchemeVersion: "1.0",
                ValidTerm: {
                  codeValue: "C70764",
                  codeMeaning: "Free text format",
                  codingSchemeDesignator: "NCIt",
                  codingSchemeVersion: "1.0"
                }
              },
              {
                codeValue: "RID34399",
                codeMeaning: "bowler hat sign",
                codingSchemeDesignator: "RadLex",
                codingSchemeVersion: "1.0"
              },
              {
                codeValue: "RID35341",
                codeMeaning: "left atrial notch sign",
                codingSchemeDesignator: "RadLex",
                codingSchemeVersion: "1.0"
              }
            ],
            QuestionType: {
              codeValue: "R-409D1",
              codeMeaning: "Radial",
              codingSchemeDesignator: "SRT",
              codingSchemeVersion: "1.0"
            }
          }
        },
        AllowedTerm: [
          {
            codeValue: "R-00339",
            codeMeaning: "No",
            codingSchemeDesignator: "SRT",
            codingSchemeVersion: "1.0"
          },
          {
            codeValue: "G-A002",
            codeMeaning: "moderate",
            codingSchemeDesignator: "SRT",
            codingSchemeVersion: "1.0",
            defaultAnswer: "true"
          },
          {
            codeValue: "R-4076E",
            codeMeaning: "trace",
            codingSchemeDesignator: "SRT",
            codingSchemeVersion: "1.0"
          },
          {
            codeValue: "G-A176",
            codeMeaning: "previous",
            codingSchemeDesignator: "SRT",
            codingSchemeVersion: "1.0"
          },
          {
            codeValue: "F-32100",
            codeMeaning: "cardiac output",
            codingSchemeDesignator: "SRT",
            codingSchemeVersion: "1.0"
          }
        ]
      },
      {
        label: "AE-2",
        itemNumber: "2",
        authors: "AIM Team",
        explanatoryText: "AE-2",
        minCardinality: "1",
        maxCardinality: "1",
        shouldDisplay: "true",
        groupLabel: "",
        id: "2.25.200462337283989723836761134995730139613",
        QuestionType: {
          codeValue: "RID34406",
          codeMeaning: "coffee bean sign",
          codingSchemeDesignator: "RadLex",
          codingSchemeVersion: "1.0"
        },
        AnatomicEntity: {
          annotatorConfidence: "false",
          AnatomicEntityCharacteristic: {
            label: "AE-AEC",
            itemNumber: "1",
            authors: "AIM Team",
            explanatoryText: "AE-AEC",
            minCardinality: "1",
            maxCardinality: "1",
            shouldDisplay: "true",
            groupLabel: "",
            id: "2.25.4904697685331920492789743978108629689",
            annotatorConfidence: "false",
            AllowedTerm: [
              {
                codeValue: "3227238",
                codeMeaning: "Minimal",
                codingSchemeDesignator: "caDSR",
                codingSchemeVersion: "1.0"
              },
              {
                codeValue: "3262715",
                codeMeaning: "Center/Bilateral",
                codingSchemeDesignator: "caDSR",
                codingSchemeVersion: "1.0",
                defaultAnswer: "true"
              },
              {
                codeValue: "2574088",
                codeMeaning: "Right",
                codingSchemeDesignator: "caDSR",
                codingSchemeVersion: "1.0"
              },
              {
                codeValue: "C0042789",
                codeMeaning: "Vision",
                codingSchemeDesignator: "caDSR",
                codingSchemeVersion: "1.0",
                ValidTerm: {
                  codeValue: "C25517",
                  codeMeaning: "full",
                  codingSchemeDesignator: "NCIt",
                  codingSchemeVersion: "1.0"
                }
              },
              {
                codeValue: "3262720",
                codeMeaning: "No Contrast Injected",
                codingSchemeDesignator: "caDSR",
                codingSchemeVersion: "1.0"
              }
            ],
            QuestionType: {
              codeValue: "2903542",
              codeMeaning: "Lesion Substance Morphology Region Type",
              codingSchemeDesignator: "caDSR",
              codingSchemeVersion: "1.0"
            }
          },
          ImagingObservationCharacteristic: [
            {
              label: "AE-IOC",
              itemNumber: "900",
              authors: "AIM Team",
              explanatoryText: "AE-IOC",
              minCardinality: "1",
              maxCardinality: "2",
              shouldDisplay: "true",
              groupLabel: "",
              id: "2.25.108530634510740764767878159000975400939",
              requireComment: "true",
              annotatorConfidence: "true",
              AllowedTerm: [
                {
                  codeValue: "RID34997",
                  codeMeaning: "acorn deformity",
                  codingSchemeDesignator: "RadLex",
                  codingSchemeVersion: "1.0"
                },
                {
                  codeValue: "RID34404",
                  codeMeaning: "Mickey Mouse sign of liver",
                  codingSchemeDesignator: "RadLex",
                  codingSchemeVersion: "1.0",
                  ValidTerm: {
                    codeValue: "C48660",
                    codeMeaning: "Not Applicable",
                    codingSchemeDesignator: "NCIt",
                    codingSchemeVersion: "1.0"
                  }
                },
                {
                  codeValue: "RID34409",
                  codeMeaning: "swan neck deformity",
                  codingSchemeDesignator: "RadLex",
                  codingSchemeVersion: "1.0"
                },
                {
                  codeValue: "RID34396",
                  codeMeaning: "beaded ureter",
                  codingSchemeDesignator: "RadLex",
                  codingSchemeVersion: "1.0",
                  nextId: "2.25.316621944217354986956136852674485484897"
                },
                {
                  codeValue: "RID35339",
                  codeMeaning: "lead pipe sign",
                  codingSchemeDesignator: "RadLex",
                  codingSchemeVersion: "1.0",
                  defaultAnswer: "true"
                },
                {
                  codeValue: "RID35335",
                  codeMeaning: "lambda sign of chest",
                  codingSchemeDesignator: "RadLex",
                  codingSchemeVersion: "1.0"
                },
                {
                  codeValue: "RID35340",
                  codeMeaning: "leafless tree sign",
                  codingSchemeDesignator: "RadLex",
                  codingSchemeVersion: "1.0"
                }
              ],
              QuestionType: {
                codeValue: "G-A472",
                codeMeaning: "Oblique",
                codingSchemeDesignator: "SRT",
                codingSchemeVersion: "1.0"
              }
            },
            {
              label: "AE-IOC2",
              itemNumber: "2",
              authors: "AIM Team",
              explanatoryText: "AE-IOC2",
              minCardinality: "1",
              maxCardinality: "1",
              shouldDisplay: "true",
              groupLabel: "",
              id: "2.25.144384273350738068267645406522525823311",
              requireComment: "true",
              annotatorConfidence: "true",
              AllowedTerm: [
                {
                  codeValue: "2891769",
                  codeMeaning:
                    "Lesion Substance Morphology Contrast-enhanced MRI Quality Type",
                  codingSchemeDesignator: "caDSR",
                  codingSchemeVersion: "1.0",
                  defaultAnswer: "true"
                },
                {
                  codeValue: "2904270",
                  codeMeaning:
                    "Lesion Substance Morphology Noncontrast-enhancing Tissue (nCET) Proportion Category",
                  codingSchemeDesignator: "caDSR",
                  codingSchemeVersion: "1.0",
                  ValidTerm: {
                    codeValue: "C16847",
                    codeMeaning: "Technique",
                    codingSchemeDesignator: "NCIt",
                    codingSchemeVersion: "1.0"
                  }
                },
                {
                  codeValue: "2904265",
                  codeMeaning:
                    "Lesion Substance Morphology Enhancing Proportion Category",
                  codingSchemeDesignator: "caDSR",
                  codingSchemeVersion: "1.0"
                },
                {
                  codeValue: "2903556",
                  codeMeaning: "Lesion Morphology Margin Thickness Category",
                  codingSchemeDesignator: "caDSR",
                  codingSchemeVersion: "1.0"
                }
              ],
              QuestionType: {
                codeValue: "2904305",
                codeMeaning:
                  "Lesion Alteration Calvarial Bone Remodeling Yes No Indicator",
                codingSchemeDesignator: "caDSR",
                codingSchemeVersion: "1.0"
              }
            }
          ]
        },
        AllowedTerm: [
          {
            codeValue: "RID34402",
            codeMeaning: "C sign",
            codingSchemeDesignator: "RadLex",
            codingSchemeVersion: "1.0"
          },
          {
            codeValue: "RID34410",
            codeMeaning: "inverted Napoleon hat sign",
            codingSchemeDesignator: "RadLex",
            codingSchemeVersion: "1.0",
            defaultAnswer: "true"
          },
          {
            codeValue: "RID34992",
            codeMeaning: "absent collecting duct system",
            codingSchemeDesignator: "RadLex",
            codingSchemeVersion: "1.0",
            ValidTerm: {
              codeValue: "C96205",
              codeMeaning: "meniscal cyst",
              codingSchemeDesignator: "NCIt",
              codingSchemeVersion: "1.0"
            }
          }
        ]
      },
      {
        label: "Inference",
        itemNumber: "3",
        authors: "AIM Team",
        explanatoryText: "Inference",
        minCardinality: "1",
        maxCardinality: "1",
        shouldDisplay: "true",
        groupLabel: "",
        id: "2.25.264945780284452461227299362245725897438",
        QuestionType: {
          codeValue: "2574088",
          codeMeaning: "Right",
          codingSchemeDesignator: "caDSR",
          codingSchemeVersion: "1.0"
        },
        Inference: {
          annotatorConfidence: "false"
        },
        AllowedTerm: [
          {
            codeValue: "2574089",
            codeMeaning: "Left",
            codingSchemeDesignator: "caDSR",
            codingSchemeVersion: "1.0"
          },
          {
            codeValue: "3262719",
            codeMeaning: "No Contrast Enhancement",
            codingSchemeDesignator: "caDSR",
            codingSchemeVersion: "1.0",
            defaultAnswer: "true"
          },
          {
            codeValue: "3262722",
            codeMeaning: "Between Two Thirds and One Third",
            codingSchemeDesignator: "caDSR",
            codingSchemeVersion: "1.0"
          }
        ]
      },
      {
        label: "Calculation",
        itemNumber: "4",
        authors: "AIM Team",
        explanatoryText: "Calculation",
        minCardinality: "1",
        maxCardinality: "1",
        shouldDisplay: "true",
        groupLabel: "",
        id: "2.25.316621944217354986956136852674485484897",
        QuestionType: {
          codeValue: "QT-K09373",
          codeMeaning: "What is the anatomical position?",
          codingSchemeDesignator: "99PRIVATEQA",
          codingSchemeVersion: "1.0"
        },
        Calculation: {
          CalculationType: {
            codeValue: "122405",
            codeMeaning: "Algorithm Manufacturer",
            codingSchemeDesignator: "DCM",
            codingSchemeVersion: "1.0",
            AlgorithmType: [
              {
                codeValue: "111002",
                codeMeaning: "Algorithm Parameters",
                codingSchemeDesignator: "DCM",
                codingSchemeVersion: "1.0",
                description: "Algorithm",
                uniqueIdentifier: "",
                algorithmName: "na",
                algorithmVersion: "na",
                mathML: "na"
              },
              {
                codeValue: "112046",
                codeMeaning:
                  "Non-Target Lesion Incomplete Response or Stable Disease",
                codingSchemeDesignator: "DCM",
                codingSchemeVersion: "1.0",
                description: "AL-2",
                uniqueIdentifier:
                  "2.25.159918858042017011226795796657810478482",
                algorithmName: "NA",
                algorithmVersion: "NA",
                mathML: "NA"
              }
            ]
          }
        }
      },
      {
        label: "Line",
        itemNumber: "5",
        authors: "AIM Team",
        explanatoryText: "Draw a line",
        minCardinality: "1",
        maxCardinality: "1",
        shouldDisplay: "true",
        groupLabel: "",
        id: "2.25.96258620923756115961136393481188603332",
        QuestionType: {
          codeValue: "QT-839565",
          codeMeaning: "What have you seen on the image?",
          codingSchemeDesignator: "99PRIVATEQA",
          codingSchemeVersion: "1.0"
        },
        GeometricShape: "MultiPoint"
      },
      {
        label: "IO-2",
        itemNumber: "6",
        authors: "Default User",
        explanatoryText: "Imaging Observation II",
        minCardinality: "1",
        maxCardinality: "1",
        shouldDisplay: "true",
        groupLabel: "",
        id: "2.25.331558201624197906250695550755625883257",
        QuestionType: {
          codeValue: "QT-839565",
          codeMeaning: "What have you seen on the image?",
          codingSchemeDesignator: "99PRIVATEQA",
          codingSchemeVersion: "1.0"
        },
        ImagingObservation: {
          annotatorConfidence: "false"
        },
        AllowedTerm: [
          {
            codeValue: "C0577559",
            codeMeaning: "Mass",
            codingSchemeDesignator: "NCIm",
            codingSchemeVersion: "1.0"
          },
          {
            codeValue: "C0012634",
            codeMeaning: "Disease",
            codingSchemeDesignator: "NCIm",
            codingSchemeVersion: "1.0"
          },
          {
            codeValue: "C0205258",
            codeMeaning: "Indeterminate",
            codingSchemeDesignator: "NCIm",
            codingSchemeVersion: "1.0"
          },
          {
            codeValue: "99PI-349877",
            codeMeaning: "Anteroseptal",
            codingSchemeDesignator: "99Privt",
            codingSchemeVersion: "1.0"
          },
          {
            codeValue: "99PI-084624",
            codeMeaning: "mid ascending aorta",
            codingSchemeDesignator: "99Privt",
            codingSchemeVersion: "1.0"
          }
        ]
      }
    ]
  }
};
export var myjson2 = {
  uid: "2.25.226786059025611331467166333882529892626777",
  name: "Coordination Test",
  authors: "willrett",
  version: "1.0",
  creationDate: "2013-11-01",
  description: "Testing Coordiantions",
  schemaLocation:
    "gme://caCORE.caCORE/3.2/edu.northwestern.radiology.AIMTemplate AIMTemplate_v2rv13.xsd",
  Template: {
    templateType: "Image",
    uid: "2.25.3117718860672205766530793354048693651257777",
    name: "Coordiantion Test",
    authors: "willrett",
    version: "1.0",
    creationDate: "2013-10-31",
    description: "Coordination Test",
    modality: "CT",
    precedingAnnotation: "DoNotOffer",
    codeMeaning: "Coordination Template",
    codeValue: "LTC",
    codingSchemeDesignator: "CoordinationTemplate",
    codingSchemeVersion: "",
    Component: {
      label: "Lung Nodule",
      itemNumber: "1",
      authors: "Default User",
      explanatoryText: "",
      minCardinality: "1",
      maxCardinality: "1",
      shouldDisplay: "true",
      groupLabel: "",
      id: "2.25.87157590103780976172344716887617624858",
      ImagingObservation: {
        annotatorConfidence: "false",
        ImagingObservationCharacteristic: {
          label: "Nodule Attenuation",
          itemNumber: "1",
          authors: "Default User",
          explanatoryText: "",
          minCardinality: "1",
          maxCardinality: "1",
          shouldDisplay: "true",
          groupLabel: "",
          id: "2.25.14296178658435596975218217235280517220",
          annotatorConfidence: "false",
          AllowedTerm: [
            {
              codeValue: "RID5741",
              codeMeaning: "solid",
              codingSchemeDesignator: "RadLex.3.10"
            },
            {
              codeValue: "RID45726",
              codeMeaning: "ground glass",
              codingSchemeDesignator: "RadLex.3.10"
            },
            {
              codeValue: "RID46009",
              codeMeaning: "semi-consolidation",
              codingSchemeDesignator: "RadLex.3.10"
            },
            {
              codeValue: "RID46011",
              codeMeaning: "partially solid",
              codingSchemeDesignator: "RadLex.3.10",
              ValidTerm: {
                codeValue: "LT2",
                codeMeaning: "greaterThan 5mm",
                codingSchemeDesignator: "LungTemplate"
              }
            },
            {
              codeValue: "RID46011",
              codeMeaning: "partially solid",
              codingSchemeDesignator: "RadLex.3.10",
              ValidTerm: [
                {
                  codeValue: "LT3",
                  codeMeaning: "greaterThan 10mm",
                  codingSchemeDesignator: "LungTemplate"
                },
                {
                  codeValue: "LT5",
                  codeMeaning: "square",
                  codingSchemeDesignator: "LungTemplate"
                }
              ]
            },
            {
              codeValue: "RID46011",
              codeMeaning: "partially solid",
              codingSchemeDesignator: "RadLex.3.10",
              codingSchemeVersion: "",
              ValidTerm: [
                {
                  codeValue: "LT4",
                  codeMeaning: "greaterThan 5mm",
                  codingSchemeDesignator: "LungTemplate"
                },
                {
                  codeValue: "LT6",
                  codeMeaning: "round",
                  codingSchemeDesignator: "LungTemplate"
                }
              ]
            },
            {
              codeValue: "RID46011",
              codeMeaning: "partially solid",
              codingSchemeDesignator: "RadLex.3.10",
              codingSchemeVersion: "",
              ValidTerm: [
                {
                  codeValue: "LT7",
                  codeMeaning: "green",
                  codingSchemeDesignator: "LungTemplate"
                },
                {
                  codeValue: "LT3",
                  codeMeaning: "greaterThan 10mm",
                  codingSchemeDesignator: "LungTemplate"
                }
              ]
            }
          ]
        }
      },
      AllowedTerm: [
        {
          codeValue: "RID39056",
          codeMeaning: "lung mass",
          codingSchemeDesignator: "RadLex3.8",
          codingSchemeVersion: "",
          defaultAnswer: "true",
          ValidTerm: [
            {
              codeValue: "LT4",
              codeMeaning: "greaterThan 5mm",
              codingSchemeDesignator: "LungTemplate"
            },
            {
              codeValue: "LT6",
              codeMeaning: "round",
              codingSchemeDesignator: "LungTemplate"
            }
          ]
        },
        {
          codeValue: "RID39057",
          codeMeaning: "other",
          codingSchemeDesignator: "debra",
          codingSchemeVersion: "",
          defaultAnswer: "false",
          ValidTerm: [
            {
              codeValue: "LT4",
              codeMeaning: "greaterThan 5mm",
              codingSchemeDesignator: "LungTemplate"
            },
            {
              codeValue: "LT6",
              codeMeaning: "round",
              codingSchemeDesignator: "LungTemplate"
            }
          ]
        }
      ]
    }
  }
};
export var myjson3 = {
  authors: "AIM Team",
  creationDate: "2012-12-28",
  description: "asdfsadfasd",
  name: "adsdf",
  uid: "2.25.75761204952962875896072870850622745228",
  version: "asdfadsf",
  schemaLocation:
    "gme://caCORE.caCORE/3.2/edu.northwestern.radiology.AIMTemplate AIMTemplate_v2rv13.xsd",
  Template: {
    authors: "AIM Team",
    codeMeaning: "Non-Target Lesion Incomplete Response or Stable Disease",
    codeValue: "112046",
    codingSchemeDesignator: "DCM",
    codingSchemeVersion: "1.0",
    creationDate: "2012-12-28",
    description: "test three",
    modality: "CT",
    name: "TEST 3",
    precedingAnnotation: "RequireToSelect",
    uid: "2.25.246328047169208880141674055331849154527",
    version: "1.0",
    Component: [
      {
        authors: "AIM Team",
        explanatoryText: "ae ONE",
        groupLabel: "AE",
        id: "2.25.249736992084416545275140963623879078175",
        itemNumber: "0",
        label: "AE - 1",
        maxCardinality: "2",
        minCardinality: "1",
        requireComment: "true",
        shouldDisplay: "true",
        QuestionType: {
          codeMeaning: "Target Lesion Partial Response",
          codeValue: "112042",
          codingSchemeDesignator: "DCM",
          codingSchemeVersion: "1.0"
        },
        AnatomicEntity: {
          annotatorConfidence: "true",
          AnatomicEntityCharacteristic: [
            {
              annotatorConfidence: "true",
              authors: "AIM Team",
              explanatoryText: "AEC one - one",
              groupLabel: "AEC - 1 - 1",
              id: "2.25.96983863729747964833684373111073058156",
              itemNumber: "0",
              label: "AEC - 1 - 1",
              maxCardinality: "5",
              minCardinality: "1",
              requireComment: "true",
              shouldDisplay: "true",
              AllowedTerm: [
                {
                  codeMeaning: "absent gastric air bubble sign",
                  codeValue: "RID34993",
                  codingSchemeDesignator: "RadLex",
                  codingSchemeVersion: "1.0",
                  ValidTerm: {
                    codeMeaning: "bone marrow edema",
                    codeValue: "10055397",
                    codingSchemeDesignator: "MedDRA",
                    codingSchemeVersion: "1.0"
                  }
                },
                {
                  codeMeaning: "acute kyphosis sign",
                  codeValue: "RID34998",
                  codingSchemeDesignator: "RadLex",
                  codingSchemeVersion: "1.0"
                },
                {
                  codeMeaning: "acorn deformity",
                  codeValue: "RID34997",
                  codingSchemeDesignator: "RadLex",
                  codingSchemeVersion: "1.0",
                  nextId: "2.25.144384273350738068267645406522525823311"
                },
                {
                  codeMeaning: "absent liver sign",
                  codeValue: "RID34995",
                  codingSchemeDesignator: "RadLex",
                  codingSchemeVersion: "1.0"
                },
                {
                  codeMeaning: "Mickey Mouse sign of liver",
                  codeValue: "RID34404",
                  codingSchemeDesignator: "RadLex",
                  codingSchemeVersion: "1.0",
                  ValidTerm: {
                    codeMeaning: "Bone",
                    codeValue: "MTHU002077",
                    codingSchemeDesignator: "LOINC",
                    codingSchemeVersion: ""
                  }
                },
                {
                  codeMeaning: "swan neck deformity",
                  codeValue: "RID34409",
                  codingSchemeDesignator: "RadLex",
                  codingSchemeVersion: "1.0",
                  nextId: "2.25.264945780284452461227299362245725897438"
                },
                {
                  codeMeaning: "Erlenmeyer flask deformity",
                  codeValue: "RID34412",
                  codingSchemeDesignator: "RadLex",
                  codingSchemeVersion: "1.0"
                }
              ],
              QuestionType: {
                codeMeaning: "air bronchogram sign",
                codeValue: "RID34999",
                codingSchemeDesignator: "RadLex",
                codingSchemeVersion: "1.0"
              }
            },
            {
              annotatorConfidence: "true",
              authors: "AIM Team",
              explanatoryText: "AEC one two",
              groupLabel: "",
              id: "2.25.282321381780351407137178608344539789057",
              itemNumber: "1",
              label: "AEC - 1 - 2",
              maxCardinality: "3",
              minCardinality: "1",
              requireComment: "true",
              shouldDisplay: "true",
              AllowedTerm: [
                {
                  codeMeaning: "absent liver sign",
                  codeValue: "RID34995",
                  codingSchemeDesignator: "RadLex",
                  codingSchemeVersion: "1.0",
                  CharacteristicQuantification: {
                    annotatorConfidence: "false",
                    characteristicQuantificationIndex: "0",
                    name: "Scale-1",
                    Scale: {
                      scaleType: "Ordinal",
                      ScaleLevel: [
                        {
                          value: "1",
                          valueDescription: "1",
                          valueLabel: "1"
                        },
                        {
                          value: "2",
                          valueDescription: "2",
                          valueLabel: "two"
                        },
                        {
                          value: "3",
                          valueDescription: "3",
                          valueLabel: "three"
                        }
                      ]
                    },
                    NonQuantifiable: [
                      {
                        codeMeaning: "Yes",
                        codeValue: "R-0038D",
                        codingSchemeDesignator: "SRT",
                        codingSchemeVersion: "1.0"
                      },
                      {
                        codeMeaning: "Complex",
                        codeValue: "G-A540",
                        codingSchemeDesignator: "SRT",
                        codingSchemeVersion: "1.0"
                      },
                      {
                        codeMeaning: "No",
                        codeValue: "R-00339",
                        codingSchemeDesignator: "SRT",
                        codingSchemeVersion: "1.0"
                      }
                    ]
                  }
                },
                {
                  codeMeaning: "butterfly shadow",
                  codeValue: "RID34400",
                  codingSchemeDesignator: "RadLex",
                  codingSchemeVersion: "1.0",
                  defaultAnswer: "true",
                  nextId: "2.25.316621944217354986956136852674485484897",
                  CharacteristicQuantification: {
                    annotatorConfidence: "true",
                    characteristicQuantificationIndex: "0",
                    name: "scale",
                    Scale: {
                      scaleType: "Nominal",
                      ScaleLevel: [
                        {
                          value: "1",
                          valueDescription: "1-1-1",
                          valueLabel: "1-1"
                        },
                        {
                          value: "2",
                          valueDescription: "2-1-1",
                          valueLabel: "2-1-1"
                        },
                        {
                          value: "3",
                          valueDescription: "3-1-1",
                          valueLabel: "3-1-1"
                        }
                      ]
                    },
                    NonQuantifiable: [
                      {
                        codeMeaning: "Extrusion",
                        codeValue: "R-4207A",
                        codingSchemeDesignator: "SRT",
                        codingSchemeVersion: "1.0",
                        defaultAnswer: "true"
                      },
                      {
                        codeMeaning: "marked",
                        codeValue: "G-A429",
                        codingSchemeDesignator: "SRT",
                        codingSchemeVersion: "1.0"
                      }
                    ]
                  }
                },
                {
                  codeMeaning: "cobblestone pattern",
                  codeValue: "RID34405",
                  codingSchemeDesignator: "RadLex",
                  codingSchemeVersion: "1.0",
                  defaultAnswer: "true",
                  ValidTerm: [
                    {
                      codeMeaning: "Body Part",
                      codeValue: "C0229962",
                      codingSchemeDesignator: "NCIm",
                      codingSchemeVersion: "1.0"
                    },
                    {
                      codeMeaning: "Plica",
                      codeValue: "C1204543",
                      codingSchemeDesignator: "NCIm",
                      codingSchemeVersion: "1.0"
                    }
                  ],
                  CharacteristicQuantification: {
                    annotatorConfidence: "false",
                    characteristicQuantificationIndex: "0",
                    name: "scale-3",
                    Scale: {
                      scaleType: "Ratio",
                      ScaleLevel: [
                        {
                          value: "1",
                          valueDescription: "1",
                          valueLabel: "1"
                        },
                        {
                          value: "2",
                          valueDescription: "2",
                          valueLabel: "2"
                        },
                        {
                          defaultAnswer: "true",
                          value: "3",
                          valueDescription: "3",
                          valueLabel: "3"
                        }
                      ]
                    },
                    NonQuantifiable: [
                      {
                        codeMeaning: "Center/Bilateral",
                        codeValue: "G-A102",
                        codingSchemeDesignator: "SRT",
                        codingSchemeVersion: "1.0"
                      },
                      {
                        codeMeaning: "Mild",
                        codeValue: "R-404FA",
                        codingSchemeDesignator: "SRT",
                        codingSchemeVersion: "1.0"
                      },
                      {
                        codeMeaning: "Normal",
                        codeValue: "G-A460",
                        codingSchemeDesignator: "SRT",
                        codingSchemeVersion: "1.0"
                      }
                    ]
                  }
                },
                {
                  codeMeaning: "swan neck deformity",
                  codeValue: "RID34409",
                  codingSchemeDesignator: "RadLex",
                  codingSchemeVersion: "1.0",
                  CharacteristicQuantification: {
                    annotatorConfidence: "false",
                    characteristicQuantificationIndex: "0",
                    name: "numerical",
                    Numerical: [
                      {
                        askForInput: "false",
                        operator: "Equal",
                        ucumString: "cm",
                        value: "0.0",
                        valueDescription: "zero",
                        valueLabel: "0"
                      },
                      {
                        askForInput: "false",
                        operator: "NotEqual",
                        ucumString: "cm",
                        value: "10.0",
                        valueDescription: "10",
                        valueLabel: "10"
                      },
                      {
                        askForInput: "false",
                        operator: "LessThan",
                        ucumString: "cm",
                        value: "20.0",
                        valueDescription: "20",
                        valueLabel: "20"
                      },
                      {
                        askForInput: "false",
                        operator: "GreaterThan",
                        ucumString: "cm",
                        value: "30.0",
                        valueDescription: "30",
                        valueLabel: "30"
                      },
                      {
                        askForInput: "false",
                        operator: "LessThanEqual",
                        ucumString: "cm",
                        value: "40.0",
                        valueDescription: "40",
                        valueLabel: "40"
                      },
                      {
                        askForInput: "false",
                        operator: "GreaterThanEqual",
                        ucumString: "cm",
                        value: "50.0",
                        valueDescription: "50",
                        valueLabel: "50"
                      }
                    ],
                    NonQuantifiable: [
                      {
                        codeMeaning: "Yes",
                        codeValue: "R-0038D",
                        codingSchemeDesignator: "SRT",
                        codingSchemeVersion: "1.0"
                      },
                      {
                        codeMeaning: "Horizontal",
                        codeValue: "G-A142",
                        codingSchemeDesignator: "SRT",
                        codingSchemeVersion: "1.0"
                      },
                      {
                        codeMeaning: "marked",
                        codeValue: "G-A429",
                        codingSchemeDesignator: "SRT",
                        codingSchemeVersion: "1.0"
                      }
                    ]
                  }
                },
                {
                  codeMeaning: "Erlenmeyer flask deformity",
                  codeValue: "RID34412",
                  codingSchemeDesignator: "RadLex",
                  codingSchemeVersion: "1.0",
                  defaultAnswer: "true",
                  CharacteristicQuantification: {
                    annotatorConfidence: "false",
                    characteristicQuantificationIndex: "0",
                    name: "Quantile",
                    Quantile: {
                      bins: "16",
                      defaultBin: "2",
                      maxValue: "500.0",
                      minValue: "0.0",
                      valueDescription: "500",
                      valueLabel: "quantile"
                    },
                    NonQuantifiable: [
                      {
                        codeMeaning: "no",
                        codeValue: "R-00339",
                        codingSchemeDesignator: "SRT",
                        codingSchemeVersion: "1.0"
                      },
                      {
                        codeMeaning: "Yes",
                        codeValue: "R-0038D",
                        codingSchemeDesignator: "SRT",
                        codingSchemeVersion: "1.0"
                      },
                      {
                        codeMeaning: "No",
                        codeValue: "R-00339",
                        codingSchemeDesignator: "SRT",
                        codingSchemeVersion: "1.0"
                      }
                    ]
                  }
                },
                {
                  codeMeaning: "bowler hat sign",
                  codeValue: "RID34399",
                  codingSchemeDesignator: "RadLex",
                  codingSchemeVersion: "1.0",
                  CharacteristicQuantification: {
                    annotatorConfidence: "false",
                    characteristicQuantificationIndex: "0",
                    name: "Interval",
                    Interval: [
                      {
                        askForInput: "false",
                        maxOperator: "LessThanEqual",
                        maxValue: "10.0",
                        minOperator: "GreaterThan",
                        minValue: "0.0",
                        ucumString: "cm",
                        valueDescription: "0-10",
                        valueLabel: "0-10"
                      },
                      {
                        askForInput: "false",
                        maxOperator: "LessThanEqual",
                        maxValue: "20.0",
                        minOperator: "NotEqual",
                        minValue: "10.0",
                        ucumString: "cm",
                        valueDescription: "10-20",
                        valueLabel: "10-20"
                      },
                      {
                        askForInput: "false",
                        maxOperator: "LessThanEqual",
                        maxValue: "30.0",
                        minOperator: "GreaterThan",
                        minValue: "20.0",
                        ucumString: "cm",
                        valueDescription: "20-30",
                        valueLabel: "20-30"
                      },
                      {
                        askForInput: "false",
                        maxOperator: "LessThanEqual",
                        maxValue: "40.0",
                        minOperator: "GreaterThanEqual",
                        minValue: "30.0",
                        ucumString: "cm",
                        valueDescription: "cm",
                        valueLabel: "cm"
                      }
                    ],
                    NonQuantifiable: [
                      {
                        codeMeaning: "Oblique",
                        codeValue: "G-A472",
                        codingSchemeDesignator: "SRT",
                        codingSchemeVersion: "1.0"
                      },
                      {
                        codeMeaning: "No",
                        codeValue: "R-00339",
                        codingSchemeDesignator: "SRT",
                        codingSchemeVersion: "1.0"
                      },
                      {
                        codeMeaning: "Lateral",
                        codeValue: "G-A104",
                        codingSchemeDesignator: "SRT",
                        codingSchemeVersion: "1.0"
                      },
                      {
                        codeMeaning: "Complex",
                        codeValue: "G-A540",
                        codingSchemeDesignator: "SRT",
                        codingSchemeVersion: "1.0"
                      }
                    ]
                  }
                }
              ],
              QuestionType: {
                codeMeaning: "Normal",
                codeValue: "G-A460",
                codingSchemeDesignator: "SRT",
                codingSchemeVersion: "1.0"
              }
            },
            {
              annotatorConfidence: "false",
              authors: "Default User",
              explanatoryText: "AEC 1-3",
              groupLabel: "AEC - 1 - 1",
              id: "2.25.314136553354390144751865176243128910653",
              itemNumber: "2",
              label: "AEC - 1- 3",
              maxCardinality: "1",
              minCardinality: "0",
              shouldDisplay: "true",
              AllowedTerm: [
                {
                  codeMeaning: "Image Nodule Lobar Location Type",
                  codeValue: "2181666",
                  codingSchemeDesignator: "CTEP",
                  codingSchemeVersion: "1.0"
                },
                {
                  codeMeaning: "Patient Gender Category",
                  codeValue: "62",
                  codingSchemeDesignator: "CTEP",
                  codingSchemeVersion: "1.0"
                },
                {
                  codeMeaning: "Nodule Histology Histologic Type WHO Code",
                  codeValue: "2182326",
                  codingSchemeDesignator: "CTEP",
                  codingSchemeVersion: "1.0"
                },
                {
                  codeMeaning: "NonNodule Finding X Position Number",
                  codeValue: "57819",
                  codingSchemeDesignator: "CTEP",
                  codingSchemeVersion: "1.0"
                },
                {
                  codeMeaning: "Nodule Histology Histologic Type WHO Code",
                  codeValue: "2182326",
                  codingSchemeDesignator: "CTEP",
                  codingSchemeVersion: "1.0"
                }
              ]
            }
          ]
        },
        AllowedTerm: [
          {
            codeMeaning: "abdominal fat necrosis sign",
            codeValue: "RID34991",
            codingSchemeDesignator: "RadLex",
            codingSchemeVersion: "1.0"
          },
          {
            codeMeaning: "scotty dog sign",
            codeValue: "RID34408",
            codingSchemeDesignator: "RadLex",
            codingSchemeVersion: "1.0"
          },
          {
            codeMeaning: "Erlenmeyer flask deformity",
            codeValue: "RID34412",
            codingSchemeDesignator: "RadLex",
            codingSchemeVersion: "1.0",
            nextId: "2.25.264945780284452461227299362245725897438"
          },
          {
            codeMeaning: "lacunar skull",
            codeValue: "RID35333",
            codingSchemeDesignator: "RadLex",
            codingSchemeVersion: "1.0"
          },
          {
            codeMeaning: "knuckle sign",
            codeValue: "RID35330",
            codingSchemeDesignator: "RadLex",
            codingSchemeVersion: "1.0"
          },
          {
            codeMeaning: "lateral femoral notch sign",
            codeValue: "RID35337",
            codingSchemeDesignator: "RadLex",
            codingSchemeVersion: "1.0"
          },
          {
            codeMeaning: "lambda sign of chest",
            codeValue: "RID35335",
            codingSchemeDesignator: "RadLex",
            codingSchemeVersion: "1.0",
            nextId: "2.25.316621944217354986956136852674485484897",
            ValidTerm: {
              codeMeaning: "Right",
              codeValue: "C25228",
              codingSchemeDesignator: "NCIt",
              codingSchemeVersion: "1.0"
            }
          },
          {
            codeMeaning: "leafless tree sign",
            codeValue: "RID35340",
            codingSchemeDesignator: "RadLex",
            codingSchemeVersion: "1.0"
          },
          {
            codeMeaning: "linguine sign",
            codeValue: "RID35346",
            codingSchemeDesignator: "RadLex",
            codingSchemeVersion: "1.0"
          },
          {
            codeMeaning: "lollipop sign",
            codeValue: "RID35349",
            codingSchemeDesignator: "RadLex",
            codingSchemeVersion: "1.0"
          }
        ]
      },
      {
        authors: "AIM Team",
        explanatoryText: "IO",
        groupLabel: "IO",
        id: "2.25.221240251915004149123867287125995545695",
        itemNumber: "1",
        label: "IO",
        maxCardinality: "1",
        minCardinality: "1",
        shouldDisplay: "true",
        QuestionType: {
          codeMeaning: "Displaced",
          codeValue: "R-4206F",
          codingSchemeDesignator: "SRT",
          codingSchemeVersion: "1.0"
        },
        ImagingObservation: {
          annotatorConfidence: "false",
          ImagingObservationCharacteristic: {
            annotatorConfidence: "true",
            authors: "AIM Team",
            explanatoryText: "IOC",
            groupLabel: "",
            id: "2.25.262609545894946533504172503990783678900",
            itemNumber: "0",
            label: "IOC",
            maxCardinality: "3",
            minCardinality: "1",
            requireComment: "true",
            shouldDisplay: "true",
            AllowedTerm: [
              {
                codeMeaning: "accordian sign",
                codeValue: "RID34996",
                codingSchemeDesignator: "RadLex",
                codingSchemeVersion: "1.0"
              },
              {
                codeMeaning: "absent liver sign",
                codeValue: "RID34995",
                codingSchemeDesignator: "RadLex",
                codingSchemeVersion: "1.0",
                defaultAnswer: "true"
              },
              {
                codeMeaning: "comet tail sign",
                codeValue: "RID34407",
                codingSchemeDesignator: "RadLex",
                codingSchemeVersion: "1.0"
              },
              {
                codeMeaning: "absent bow tie sign",
                codeValue: "RID34411",
                codingSchemeDesignator: "RadLex",
                codingSchemeVersion: "1.0",
                ValidTerm: {
                  codeMeaning: "Free text format",
                  codeValue: "C70764",
                  codingSchemeDesignator: "NCIt",
                  codingSchemeVersion: "1.0"
                }
              },
              {
                codeMeaning: "bowler hat sign",
                codeValue: "RID34399",
                codingSchemeDesignator: "RadLex",
                codingSchemeVersion: "1.0"
              },
              {
                codeMeaning: "left atrial notch sign",
                codeValue: "RID35341",
                codingSchemeDesignator: "RadLex",
                codingSchemeVersion: "1.0"
              }
            ],
            QuestionType: {
              codeMeaning: "Radial",
              codeValue: "R-409D1",
              codingSchemeDesignator: "SRT",
              codingSchemeVersion: "1.0"
            }
          }
        },
        AllowedTerm: [
          {
            codeMeaning: "No",
            codeValue: "R-00339",
            codingSchemeDesignator: "SRT",
            codingSchemeVersion: "1.0"
          },
          {
            codeMeaning: "moderate",
            codeValue: "G-A002",
            codingSchemeDesignator: "SRT",
            codingSchemeVersion: "1.0",
            defaultAnswer: "true"
          },
          {
            codeMeaning: "trace",
            codeValue: "R-4076E",
            codingSchemeDesignator: "SRT",
            codingSchemeVersion: "1.0"
          },
          {
            codeMeaning: "previous",
            codeValue: "G-A176",
            codingSchemeDesignator: "SRT",
            codingSchemeVersion: "1.0"
          },
          {
            codeMeaning: "cardiac output",
            codeValue: "F-32100",
            codingSchemeDesignator: "SRT",
            codingSchemeVersion: "1.0"
          }
        ]
      },
      {
        authors: "AIM Team",
        explanatoryText: "AE-2",
        groupLabel: "",
        id: "2.25.200462337283989723836761134995730139613",
        itemNumber: "2",
        label: "AE-2",
        maxCardinality: "1",
        minCardinality: "1",
        shouldDisplay: "true",
        QuestionType: {
          codeMeaning: "coffee bean sign",
          codeValue: "RID34406",
          codingSchemeDesignator: "RadLex",
          codingSchemeVersion: "1.0"
        },
        AnatomicEntity: {
          annotatorConfidence: "false",
          AnatomicEntityCharacteristic: {
            annotatorConfidence: "false",
            authors: "AIM Team",
            explanatoryText: "AE-AEC",
            groupLabel: "",
            id: "2.25.4904697685331920492789743978108629689",
            itemNumber: "1",
            label: "AE-AEC",
            maxCardinality: "1",
            minCardinality: "1",
            shouldDisplay: "true",
            AllowedTerm: [
              {
                codeMeaning: "Minimal",
                codeValue: "3227238",
                codingSchemeDesignator: "caDSR",
                codingSchemeVersion: "1.0"
              },
              {
                codeMeaning: "Center/Bilateral",
                codeValue: "3262715",
                codingSchemeDesignator: "caDSR",
                codingSchemeVersion: "1.0",
                defaultAnswer: "true"
              },
              {
                codeMeaning: "Right",
                codeValue: "2574088",
                codingSchemeDesignator: "caDSR",
                codingSchemeVersion: "1.0"
              },
              {
                codeMeaning: "Vision",
                codeValue: "C0042789",
                codingSchemeDesignator: "caDSR",
                codingSchemeVersion: "1.0",
                ValidTerm: {
                  codeMeaning: "full",
                  codeValue: "C25517",
                  codingSchemeDesignator: "NCIt",
                  codingSchemeVersion: "1.0"
                }
              },
              {
                codeMeaning: "No Contrast Injected",
                codeValue: "3262720",
                codingSchemeDesignator: "caDSR",
                codingSchemeVersion: "1.0"
              }
            ],
            QuestionType: {
              codeMeaning: "Lesion Substance Morphology Region Type",
              codeValue: "2903542",
              codingSchemeDesignator: "caDSR",
              codingSchemeVersion: "1.0"
            }
          },
          ImagingObservationCharacteristic: [
            {
              annotatorConfidence: "true",
              authors: "AIM Team",
              explanatoryText: "AE-IOC",
              groupLabel: "",
              id: "2.25.108530634510740764767878159000975400939",
              itemNumber: "0",
              label: "AE-IOC",
              maxCardinality: "2",
              minCardinality: "1",
              requireComment: "true",
              shouldDisplay: "true",
              AllowedTerm: [
                {
                  codeMeaning: "acorn deformity",
                  codeValue: "RID34997",
                  codingSchemeDesignator: "RadLex",
                  codingSchemeVersion: "1.0"
                },
                {
                  codeMeaning: "Mickey Mouse sign of liver",
                  codeValue: "RID34404",
                  codingSchemeDesignator: "RadLex",
                  codingSchemeVersion: "1.0",
                  ValidTerm: {
                    codeMeaning: "Not Applicable",
                    codeValue: "C48660",
                    codingSchemeDesignator: "NCIt",
                    codingSchemeVersion: "1.0"
                  }
                },
                {
                  codeMeaning: "swan neck deformity",
                  codeValue: "RID34409",
                  codingSchemeDesignator: "RadLex",
                  codingSchemeVersion: "1.0"
                },
                {
                  codeMeaning: "beaded ureter",
                  codeValue: "RID34396",
                  codingSchemeDesignator: "RadLex",
                  codingSchemeVersion: "1.0",
                  nextId: "2.25.316621944217354986956136852674485484897"
                },
                {
                  codeMeaning: "lead pipe sign",
                  codeValue: "RID35339",
                  codingSchemeDesignator: "RadLex",
                  codingSchemeVersion: "1.0",
                  defaultAnswer: "true"
                },
                {
                  codeMeaning: "lambda sign of chest",
                  codeValue: "RID35335",
                  codingSchemeDesignator: "RadLex",
                  codingSchemeVersion: "1.0"
                },
                {
                  codeMeaning: "leafless tree sign",
                  codeValue: "RID35340",
                  codingSchemeDesignator: "RadLex",
                  codingSchemeVersion: "1.0"
                }
              ],
              QuestionType: {
                codeMeaning: "Oblique",
                codeValue: "G-A472",
                codingSchemeDesignator: "SRT",
                codingSchemeVersion: "1.0"
              }
            },
            {
              annotatorConfidence: "true",
              authors: "AIM Team",
              explanatoryText: "AE-IOC2",
              groupLabel: "",
              id: "2.25.144384273350738068267645406522525823311",
              itemNumber: "2",
              label: "AE-IOC2",
              maxCardinality: "1",
              minCardinality: "1",
              requireComment: "true",
              shouldDisplay: "true",
              AllowedTerm: [
                {
                  codeMeaning:
                    "Lesion Substance Morphology Contrast-enhanced MRI Quality Type",
                  codeValue: "2891769",
                  codingSchemeDesignator: "caDSR",
                  codingSchemeVersion: "1.0",
                  defaultAnswer: "true"
                },
                {
                  codeMeaning:
                    "Lesion Substance Morphology Noncontrast-enhancing Tissue (nCET) Proportion Category",
                  codeValue: "2904270",
                  codingSchemeDesignator: "caDSR",
                  codingSchemeVersion: "1.0",
                  ValidTerm: {
                    codeMeaning: "Technique",
                    codeValue: "C16847",
                    codingSchemeDesignator: "NCIt",
                    codingSchemeVersion: "1.0"
                  }
                },
                {
                  codeMeaning:
                    "Lesion Substance Morphology Enhancing Proportion Category",
                  codeValue: "2904265",
                  codingSchemeDesignator: "caDSR",
                  codingSchemeVersion: "1.0"
                },
                {
                  codeMeaning: "Lesion Morphology Margin Thickness Category",
                  codeValue: "2903556",
                  codingSchemeDesignator: "caDSR",
                  codingSchemeVersion: "1.0"
                }
              ],
              QuestionType: {
                codeMeaning:
                  "Lesion Alteration Calvarial Bone Remodeling Yes No Indicator",
                codeValue: "2904305",
                codingSchemeDesignator: "caDSR",
                codingSchemeVersion: "1.0"
              }
            }
          ]
        },
        AllowedTerm: [
          {
            codeMeaning: "C sign",
            codeValue: "RID34402",
            codingSchemeDesignator: "RadLex",
            codingSchemeVersion: "1.0"
          },
          {
            codeMeaning: "inverted Napoleon hat sign",
            codeValue: "RID34410",
            codingSchemeDesignator: "RadLex",
            codingSchemeVersion: "1.0",
            defaultAnswer: "true"
          },
          {
            codeMeaning: "absent collecting duct system",
            codeValue: "RID34992",
            codingSchemeDesignator: "RadLex",
            codingSchemeVersion: "1.0",
            ValidTerm: {
              codeMeaning: "meniscal cyst",
              codeValue: "C96205",
              codingSchemeDesignator: "NCIt",
              codingSchemeVersion: "1.0"
            }
          }
        ]
      },
      {
        authors: "AIM Team",
        explanatoryText: "Inference",
        groupLabel: "",
        id: "2.25.264945780284452461227299362245725897438",
        itemNumber: "3",
        label: "Inference",
        maxCardinality: "1",
        minCardinality: "1",
        shouldDisplay: "true",
        QuestionType: {
          codeMeaning: "Right",
          codeValue: "2574088",
          codingSchemeDesignator: "caDSR",
          codingSchemeVersion: "1.0"
        },
        Inference: {
          annotatorConfidence: "false"
        },
        AllowedTerm: [
          {
            codeMeaning: "Left",
            codeValue: "2574089",
            codingSchemeDesignator: "caDSR",
            codingSchemeVersion: "1.0"
          },
          {
            codeMeaning: "No Contrast Enhancement",
            codeValue: "3262719",
            codingSchemeDesignator: "caDSR",
            codingSchemeVersion: "1.0",
            defaultAnswer: "true"
          },
          {
            codeMeaning: "Between Two Thirds and One Third",
            codeValue: "3262722",
            codingSchemeDesignator: "caDSR",
            codingSchemeVersion: "1.0"
          }
        ]
      },
      {
        authors: "AIM Team",
        explanatoryText: "Calculation",
        groupLabel: "",
        id: "2.25.316621944217354986956136852674485484897",
        itemNumber: "4",
        label: "Calculation",
        maxCardinality: "1",
        minCardinality: "1",
        shouldDisplay: "true",
        QuestionType: {
          codeMeaning: "What is the anatomical position?",
          codeValue: "QT-K09373",
          codingSchemeDesignator: "99PRIVATEQA",
          codingSchemeVersion: "1.0"
        },
        Calculation: {
          CalculationType: {
            codeMeaning: "Algorithm Manufacturer",
            codeValue: "122405",
            codingSchemeDesignator: "DCM",
            codingSchemeVersion: "1.0",
            AlgorithmType: [
              {
                algorithmName: "na",
                algorithmVersion: "na",
                codeMeaning: "Algorithm Parameters",
                codeValue: "111002",
                codingSchemeDesignator: "DCM",
                codingSchemeVersion: "1.0",
                description: "Algorithm",
                mathML: "na",
                uniqueIdentifier: ""
              },
              {
                algorithmName: "NA",
                algorithmVersion: "NA",
                codeMeaning:
                  "Non-Target Lesion Incomplete Response or Stable Disease",
                codeValue: "112046",
                codingSchemeDesignator: "DCM",
                codingSchemeVersion: "1.0",
                description: "AL-2",
                mathML: "NA",
                uniqueIdentifier: "2.25.159918858042017011226795796657810478482"
              }
            ]
          }
        }
      },
      {
        authors: "AIM Team",
        explanatoryText: "Draw a line",
        groupLabel: "",
        id: "2.25.96258620923756115961136393481188603332",
        itemNumber: "5",
        label: "Line",
        maxCardinality: "1",
        minCardinality: "1",
        shouldDisplay: "true",
        QuestionType: {
          codeMeaning: "What have you seen on the image?",
          codeValue: "QT-839565",
          codingSchemeDesignator: "99PRIVATEQA",
          codingSchemeVersion: "1.0"
        },
        GeometricShape: "MultiPoint"
      },
      {
        authors: "Default User",
        explanatoryText: "Imaging Observation II",
        groupLabel: "",
        id: "2.25.331558201624197906250695550755625883257",
        itemNumber: "6",
        label: "IO-2",
        maxCardinality: "1",
        minCardinality: "1",
        shouldDisplay: "true",
        QuestionType: {
          codeMeaning: "What have you seen on the image?",
          codeValue: "QT-839565",
          codingSchemeDesignator: "99PRIVATEQA",
          codingSchemeVersion: "1.0"
        },
        ImagingObservation: {
          annotatorConfidence: "false"
        },
        AllowedTerm: [
          {
            codeMeaning: "Mass",
            codeValue: "C0577559",
            codingSchemeDesignator: "NCIm",
            codingSchemeVersion: "1.0"
          },
          {
            codeMeaning: "Disease",
            codeValue: "C0012634",
            codingSchemeDesignator: "NCIm",
            codingSchemeVersion: "1.0"
          },
          {
            codeMeaning: "Indeterminate",
            codeValue: "C0205258",
            codingSchemeDesignator: "NCIm",
            codingSchemeVersion: "1.0"
          },
          {
            codeMeaning: "Anteroseptal",
            codeValue: "99PI-349877",
            codingSchemeDesignator: "99Privt",
            codingSchemeVersion: "1.0"
          },
          {
            codeMeaning: "mid ascending aorta",
            codeValue: "99PI-084624",
            codingSchemeDesignator: "99Privt",
            codingSchemeVersion: "1.0"
          }
        ]
      }
    ]
  },
  Tags: {
    Tag: [
      {
        TagName: {
          codeMeaning: "Estimated Dose Level Category Code",
          codeValue: "2188618",
          codingSchemeDesignator: "CTEP",
          codingSchemeVersion: "1.0"
        },
        TagValue: {
          StringValue: "sadfsdafas"
        }
      },
      {
        TagName: {
          codeMeaning: "Non-Lesion at Baseline",
          codeValue: "112076",
          codingSchemeDesignator: "DCM",
          codingSchemeVersion: "1.0"
        },
        TagValue: {
          CodedValue: {
            codeMeaning: "Target Lesion Stable Disease",
            codeValue: "112044",
            codingSchemeDesignator: "DCM",
            codingSchemeVersion: "1.0"
          }
        }
      }
    ]
  }
};

var annotationSavedXml =
  '<?xml version="1.0" encoding="UTF-8"?><ImageAnnotationCollection xmlns="gme://caCORE.caCORE/4.4/edu.northwestern.radiology.AIM" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" aimVersion="AIMv4_2" xsi:schemaLocation="gme://caCORE.caCORE/4.4/edu.northwestern.radiology.AIM AIM_v4.2_rv2_XML.xsd"><uniqueIdentifier root="2.25.315158392848160637748108868094921498589"/><studyInstanceUid root="1.2.826.0.1.3680043.8.420.12307316984239077022721560039253479548"/><seriesInstanceUid root="2.25.276318872129538412910538591647326685134"/><accessionNumber value="5287533"/><dateTime value="20181102022712"/><user><name value="admin"/><loginName value="admin"/></user><equipment><manufacturerName value=""/><manufacturerModelName value=""/><softwareVersion value="syngo CT 2008G"/></equipment><person><name value="AM-1-251-129771"/><id value="129771061547608292133092105219228867067"/><birthDate value="19570214000000"/><sex value="F"/></person><imageAnnotations><ImageAnnotation><uniqueIdentifier root="2.25.304161604230927612403303669594261238112"/><typeCode code="RID58-2" codeSystemName="RadLex"><iso:displayName xmlns:iso="uri:iso.org:21090" value="liver15"/></typeCode><dateTime value="20181112021827"/><name value="rev_18~sp1~-~sp1~-1~sp1~#FFFFFF"/><comment value="CT / ARTERIAL PHASE  2.0  B25F / 0 / 4"/><imagingPhysicalEntityCollection><ImagingPhysicalEntity><uniqueIdentifier root="2.25.252610726732504134576747466742004255886"/><typeCode code="RID58" codeSystemName="RadLex" codeSystemVersion="1.0"><iso:displayName xmlns:iso="uri:iso.org:21090" value="liver"/></typeCode><annotatorConfidence value="0.0"/><label value="Lobar Location"/></ImagingPhysicalEntity><ImagingPhysicalEntity><uniqueIdentifier root="2.25.319098259893188982957419575568011073682"/><typeCode code="RID62" codeSystemName="RadLex" codeSystemVersion="1.0"><iso:displayName xmlns:iso="uri:iso.org:21090" value="hepatovenous segment II"/></typeCode><annotatorConfidence value="0.0"/><label value="Segmental Location"/></ImagingPhysicalEntity></imagingPhysicalEntityCollection><calculationEntityCollection><CalculationEntity><uniqueIdentifier root="2.25.139966971363069929048599894823256468905"/><typeCode code="G-D7FE" codeSystemName="SRT"><iso:displayName xmlns:iso="uri:iso.org:21090" value="Length"/></typeCode><description value="Length"/><calculationResultCollection><CalculationResult type="Scalar" xsi:type="CompactCalculationResult"><unitOfMeasure value="cm"/><dataType code="C48870" codeSystemName="NCI"><iso:displayName xmlns:iso="uri:iso.org:21090" value="Double"/></dataType><dimensionCollection><Dimension><index value="0"/><size value="1"/><label value="LineLength"/></Dimension></dimensionCollection><value value="6.1396812200546265"/></CalculationResult></calculationResultCollection></CalculationEntity><CalculationEntity><uniqueIdentifier root="2.25.98233874665002735164435464823758320746"/><typeCode code="112031" codeSystemName="DCM"><iso:displayName xmlns:iso="uri:iso.org:21090" value="Attenuation Coefficient"/></typeCode><typeCode code="R-00317" codeSystemName="SRT"><iso:displayName xmlns:iso="uri:iso.org:21090" value="Mean"/></typeCode><description value="Mean"/><calculationResultCollection><CalculationResult type="Scalar" xsi:type="CompactCalculationResult"><unitOfMeasure value="[hnsfU]"/><dataType code="C48870" codeSystemName="NCI"><iso:displayName xmlns:iso="uri:iso.org:21090" value="Double"/></dataType><dimensionCollection><Dimension><index value="0"/><size value="1"/><label value="Mean"/></Dimension></dimensionCollection><value value="105.30434782608695"/></CalculationResult></calculationResultCollection></CalculationEntity><CalculationEntity><uniqueIdentifier root="2.25.160783227489918149482523203070132715378"/><typeCode code="112031" codeSystemName="DCM"><iso:displayName xmlns:iso="uri:iso.org:21090" value="Attenuation Coefficient"/></typeCode><typeCode code="R-10047" codeSystemName="SRT"><iso:displayName xmlns:iso="uri:iso.org:21090" value="Standard Deviation"/></typeCode><description value="Standard Deviation"/><calculationResultCollection><CalculationResult type="Scalar" xsi:type="CompactCalculationResult"><unitOfMeasure value="[hnsfU]"/><dataType code="C48870" codeSystemName="NCI"><iso:displayName xmlns:iso="uri:iso.org:21090" value="Double"/></dataType><dimensionCollection><Dimension><index value="0"/><size value="1"/><label value="Standard Deviation"/></Dimension></dimensionCollection><value value="16.744719563800444"/></CalculationResult></calculationResultCollection></CalculationEntity><CalculationEntity><uniqueIdentifier root="2.25.268998517181098610140898258606586565120"/><typeCode code="112031" codeSystemName="DCM"><iso:displayName xmlns:iso="uri:iso.org:21090" value="Attenuation Coefficient"/></typeCode><typeCode code="R-404FB" codeSystemName="SRT"><iso:displayName xmlns:iso="uri:iso.org:21090" value="Minimum"/></typeCode><description value="Minimum"/><calculationResultCollection><CalculationResult type="Scalar" xsi:type="CompactCalculationResult"><unitOfMeasure value="[hnsfU]"/><dataType code="C48870" codeSystemName="NCI"><iso:displayName xmlns:iso="uri:iso.org:21090" value="Double"/></dataType><dimensionCollection><Dimension><index value="0"/><size value="1"/><label value="Minimum"/></Dimension></dimensionCollection><value value="57"/></CalculationResult></calculationResultCollection></CalculationEntity><CalculationEntity><uniqueIdentifier root="2.25.234089010419326141142289307624966597723"/><typeCode code="112031" codeSystemName="DCM"><iso:displayName xmlns:iso="uri:iso.org:21090" value="Attenuation Coefficient"/></typeCode><typeCode code="G-A437" codeSystemName="SRT"><iso:displayName xmlns:iso="uri:iso.org:21090" value="Maximum"/></typeCode><description value="Maximum"/><calculationResultCollection><CalculationResult type="Scalar" xsi:type="CompactCalculationResult"><unitOfMeasure value="[hnsfU]"/><dataType code="C48870" codeSystemName="NCI"><iso:displayName xmlns:iso="uri:iso.org:21090" value="Double"/></dataType><dimensionCollection><Dimension><index value="0"/><size value="1"/><label value="Maximum"/></Dimension></dimensionCollection><value value="149"/></CalculationResult></calculationResultCollection></CalculationEntity></calculationEntityCollection><imagingObservationEntityCollection><ImagingObservationEntity><uniqueIdentifier root="2.25.224037540631763904743113714148100365563"/><typeCode code="RID39466" codeSystemName="RadLex" codeSystemVersion="1.0"><iso:displayName xmlns:iso="uri:iso.org:21090" value="liver mass"/></typeCode><annotatorConfidence value="0.0"/><label value="Lesion Type"/><imagingObservationCharacteristicCollection><ImagingObservationCharacteristic><typeCode code="RID3711" codeSystemName="RadLex" codeSystemVersion="1.0"><iso:displayName xmlns:iso="uri:iso.org:21090" value="abscess"/></typeCode><annotatorConfidence value="0.0"/><label value="Diagnosis"/></ImagingObservationCharacteristic><ImagingObservationCharacteristic><typeCode code="RID11082" codeSystemName="RadLex" codeSystemVersion="1.0"><iso:displayName xmlns:iso="uri:iso.org:21090" value="early arterial phase"/></typeCode><annotatorConfidence value="0.0"/><label value="Imaging Phase"/></ImagingObservationCharacteristic><ImagingObservationCharacteristic><typeCode code="RID43312" codeSystemName="RadLex" codeSystemVersion="1.0"><iso:displayName xmlns:iso="uri:iso.org:21090" value="solitary lesion"/></typeCode><annotatorConfidence value="0.0"/><label value="Focality of Lesion"/></ImagingObservationCharacteristic><ImagingObservationCharacteristic><typeCode code="RID5799" codeSystemName="RadLex" codeSystemVersion="1.0"><iso:displayName xmlns:iso="uri:iso.org:21090" value="round"/></typeCode><annotatorConfidence value="0.0"/><label value="Shape Descriptors"/></ImagingObservationCharacteristic><ImagingObservationCharacteristic><typeCode code="RID5714" codeSystemName="ISIS_LIVER" codeSystemVersion="1.0"><iso:displayName xmlns:iso="uri:iso.org:21090" value="smooth margin"/></typeCode><annotatorConfidence value="0.05"/><label value="Margin Contours: Smooth to Irregular"/></ImagingObservationCharacteristic><ImagingObservationCharacteristic><typeCode code="RID6042" codeSystemName="RadLex" codeSystemVersion="1.0"><iso:displayName xmlns:iso="uri:iso.org:21090" value="hypodense"/></typeCode><annotatorConfidence value="0.0"/><label value="Average Lesion Density: Hypo to Hyperdense"/></ImagingObservationCharacteristic><ImagingObservationCharacteristic><typeCode code="RID6059" codeSystemName="RadLex" codeSystemVersion="1.0"><iso:displayName xmlns:iso="uri:iso.org:21090" value="homogeneous"/></typeCode><annotatorConfidence value="0.0"/><label value="Density - Homogeneous or Heterogeneous"/></ImagingObservationCharacteristic><ImagingObservationCharacteristic><typeCode code="RID6056" codeSystemName="RadLex" codeSystemVersion="1.0"><iso:displayName xmlns:iso="uri:iso.org:21090" value="nonenhancing"/></typeCode><annotatorConfidence value="0.0"/><label value="Enhancement"/></ImagingObservationCharacteristic><ImagingObservationCharacteristic><typeCode code="RID39563" codeSystemName="RadLex" codeSystemVersion="1.0"><iso:displayName xmlns:iso="uri:iso.org:21090" value="homogeneous enhancement"/></typeCode><annotatorConfidence value="0.0"/><label value="Enhancement Uniformity"/></ImagingObservationCharacteristic><ImagingObservationCharacteristic><typeCode code="RID34421" codeSystemName="RadLex" codeSystemVersion="1.0"><iso:displayName xmlns:iso="uri:iso.org:21090" value="homogeneous internal enhancement"/></typeCode><annotatorConfidence value="0.0"/><label value="Specific Enhancement Pattern(s)"/></ImagingObservationCharacteristic><ImagingObservationCharacteristic><typeCode code="RID43338" codeSystemName="RadLex" codeSystemVersion="1.0"><iso:displayName xmlns:iso="uri:iso.org:21090" value="homogeneous retention"/></typeCode><annotatorConfidence value="0.0"/><label value="Temporal Enhancement (if known)"/></ImagingObservationCharacteristic><ImagingObservationCharacteristic><typeCode code="RID45676" codeSystemName="ISIS_LIVER" codeSystemVersion="1.0"><iso:displayName xmlns:iso="uri:iso.org:21090" value="thick septae"/></typeCode><annotatorConfidence value="0.0"/><label value="Septation Thickness"/></ImagingObservationCharacteristic><ImagingObservationCharacteristic><typeCode code="RID43300" codeSystemName="RadLex" codeSystemVersion="1.0"><iso:displayName xmlns:iso="uri:iso.org:21090" value="perilesional perfusion alteration"/></typeCode><annotatorConfidence value="0.0"/><label value="Perilesional Tissue"/></ImagingObservationCharacteristic><ImagingObservationCharacteristic><typeCode code="RID43346" codeSystemName="RadLex" codeSystemVersion="1.0"><iso:displayName xmlns:iso="uri:iso.org:21090" value="blood products (lesion)"/></typeCode><annotatorConfidence value="0.0"/><label value="Special Features"/></ImagingObservationCharacteristic><ImagingObservationCharacteristic><typeCode code="RID43327" codeSystemName="RadLex" codeSystemVersion="1.0"><iso:displayName xmlns:iso="uri:iso.org:21090" value="abuts capsule of liver"/></typeCode><annotatorConfidence value="0.0"/><label value="Lesion Effects on Liver"/></ImagingObservationCharacteristic><ImagingObservationCharacteristic><typeCode code="RID28454" codeSystemName="RadLex" codeSystemVersion="1.0"><iso:displayName xmlns:iso="uri:iso.org:21090" value="none"/></typeCode><annotatorConfidence value="0.0"/><label value="Primary Malignancy if Metastatic Disease"/></ImagingObservationCharacteristic></imagingObservationCharacteristicCollection></ImagingObservationEntity></imagingObservationEntityCollection><markupEntityCollection><MarkupEntity xsi:type="TwoDimensionMultiPoint"><uniqueIdentifier root="2.25.171279248602543582770806938873370239560"/><shapeIdentifier value="1"/><includeFlag value="true"/><imageReferenceUid root="1.2.826.0.1.3680043.8.420.31093973183104747672136176388142683243"/><referencedFrameNumber value="1"/><twoDimensionSpatialCoordinateCollection><TwoDimensionSpatialCoordinate><coordinateIndex value="0"/><x value="130.67546754675467"/><y value="268.6732673267327"/></TwoDimensionSpatialCoordinate><TwoDimensionSpatialCoordinate><coordinateIndex value="1"/><x value="221.35973597359734"/><y value="257.4081408140814"/></TwoDimensionSpatialCoordinate></twoDimensionSpatialCoordinateCollection></MarkupEntity></markupEntityCollection><imageAnnotationStatementCollection><ImageAnnotationStatement xsi:type="CalculationEntityReferencesMarkupEntityStatement"><subjectUniqueIdentifier root="2.25.139966971363069929048599894823256468905"/><objectUniqueIdentifier root="2.25.171279248602543582770806938873370239560"/></ImageAnnotationStatement><ImageAnnotationStatement xsi:type="CalculationEntityReferencesMarkupEntityStatement"><subjectUniqueIdentifier root="2.25.98233874665002735164435464823758320746"/><objectUniqueIdentifier root="2.25.171279248602543582770806938873370239560"/></ImageAnnotationStatement><ImageAnnotationStatement xsi:type="CalculationEntityReferencesMarkupEntityStatement"><subjectUniqueIdentifier root="2.25.160783227489918149482523203070132715378"/><objectUniqueIdentifier root="2.25.171279248602543582770806938873370239560"/></ImageAnnotationStatement><ImageAnnotationStatement xsi:type="CalculationEntityReferencesMarkupEntityStatement"><subjectUniqueIdentifier root="2.25.268998517181098610140898258606586565120"/><objectUniqueIdentifier root="2.25.171279248602543582770806938873370239560"/></ImageAnnotationStatement><ImageAnnotationStatement xsi:type="CalculationEntityReferencesMarkupEntityStatement"><subjectUniqueIdentifier root="2.25.234089010419326141142289307624966597723"/><objectUniqueIdentifier root="2.25.171279248602543582770806938873370239560"/></ImageAnnotationStatement></imageAnnotationStatementCollection><imageReferenceEntityCollection><ImageReferenceEntity xsi:type="DicomImageReferenceEntity"><uniqueIdentifier root="2.25.294891800358651262491806518464955515943"/><imageStudy><instanceUid root="1.2.826.0.1.3680043.8.420.12307316984239077022721560039253479548"/><startDate value="20090129"/><startTime value="081924"/><accessionNumber value="5287533"/><imageSeries><instanceUid root="1.2.826.0.1.3680043.8.420.19308572646164920912587366848473840270"/><modality code="CT" codeSystemName="DCM" codeSystemVersion="20121129"><iso:displayName xmlns:iso="uri:iso.org:21090" value="Computed Tomography"/></modality><imageCollection><Image><sopClassUid root="1.2.840.10008.5.1.4.1.1.2"/><sopInstanceUid root="1.2.826.0.1.3680043.8.420.31093973183104747672136176388142683243"/></Image></imageCollection></imageSeries></imageStudy></ImageReferenceEntity></imageReferenceEntityCollection></ImageAnnotation></imageAnnotations></ImageAnnotationCollection>';

//new AimEditor(div as parameter)
//var instanceAimEditor = new AimEditor(document.getElementById("cont"));

/*
myjson variable check line 1988. This is the example json object needs to be converted from ATS_Template.xml
	mya, is an example array which contains
	key: template name ,
	value : template json
*/

//var myA = [ {key : "BeaulieuBoneTemplate_rev18" , value:myjson},{key : "asdf" , value:myjson1}, {key : "coordinationTest", value:myjson2},{key : "test 3", value:myjson3} ];
//instanceAimEditor.loadTemplates(myA);

//give save/cacel button's div as parameter to show after selecting the template
//instanceAimEditor.addButtonsDiv();

//instanceAimEditor.createViewerWindow();
//instanceAimEditor.loadAim(annotationSavedXml);

//instanceAimEditor.saveAim();
