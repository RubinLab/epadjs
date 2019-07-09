

// uncomment 2 imports below for react

import $ from "jquery/dist/jquery.js";
import "semantic-ui/dist/semantic.js";


//export next variable for react
export var AimEditor = function (userWindow, varformCheckHandler) {

   var self = this;
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
   //this.mapObjCodeValueParent = new Map();
   this.mapHtmlObjects = new Map();
   this.mapHtmlSelectObjectsKeyValue = new Map();
   this.mapAllowedTermCollectionByCodeValue = new Map();
   this.mapTemplateCodeValueByIndex = new Map();
   this.mapLabelAnnotatorConfidence = new Map();// combine each label with annotator confidence. annotator confidence exist if label exists for that component or sub component
   this.mapLabelAnnotConfJson = new Map();// records json object to change the annotator confidence value associated with label
   this.mapLabelSubComment = new Map(); // this comment represent other than annotation comment(which is unique for the template). 
   this.mapLabelCommentJson = new Map();// records json object to change the comment value associated with label
   this.mapLabelUid = new Map();// relates label  with uid on load
   this.subOrderLabelTracking = 64;
   this.ids = 0;
   this.maptag = [];
   this.savebtn = null;
   this.textXml = null;
   this.divHolderForButtons = null;
   this.aimComment = "";
   this.aimType = "";
   this.aimName = "";
   var domelements = [];
   this.geoshapeidCounter = 0;

   var selectid = 0;
   var mathOperators = new Map();
   mathOperators.set("Equal", "=");
   mathOperators.set("NotEqual", "!=");
   mathOperators.set("LessThan", "<");
   mathOperators.set("GreaterThan", ">");
   mathOperators.set("LessThanEqual", "<=");
   mathOperators.set("GreaterThanEqual", ">=");

   this.mapShapesSchemaToTemplate = new Map();
   this.mapShapesSchemaToTemplate.set("TwoDimensionPolyline", {"formshape" : 'Polygon'});
   this.mapShapesSchemaToTemplate.set("TwoDimensionMultiPoint", [{"formshape" : 'Line'}, {"formshape" : 'Perpendicular'}]);
   this.mapShapesSchemaToTemplate.set("TwoDimensionPoint", {"formshape" : 'Point'});
   this.mapShapesSchemaToTemplate.set("TwoDimensionCircle", {"formshape" : 'Cirle'});

   this.templateShapeArray = [];//each array element is a json object {"shape":'Point', "domid" : '2.25.33554445511225454'}); 

   function constructor() {
      if (self.arrayTemplates === "undefined")
         self.arrayTemplates = [];


   }

   this.arrayDifference = function(base, compareto) {
      
      let differences = [];
        for (var i = 0; i < base.length; i++) {
          if ( ! compareto.includes(base[i]) ) {
            differences.push(base[i]);
          }
        }
      
        return differences;
   }

   this.aimshortCutKeyEvent= function(e) {

      let keyvalue = ""; 
      let altvalue = "";
      let ctrlvalue = "";
      let shiftvalue = "";
      
      if (e.altKey){
         altvalue = "altKey";
         keyvalue = "altKey";
      }
     
      if (e.ctrlKey){
         ctrlvalue = "ctrlKey";
         keyvalue = keyvalue +  "ctrlKey";
      }
      
      if (e.shiftKey){
         shiftvalue = "shiftKey";
         keyvalue = keyvalue +  "shiftKey";
      }
     
      keyvalue = keyvalue+"+"+String.fromCharCode(e.keyCode);
      console.log(keyvalue);
     
      if (self.mapShortCutKeys.get(keyvalue)){
         console.log("in"+keyvalue);
         console.log(self.mapShortCutKeys.get(keyvalue));
         document.getElementById(self.mapShortCutKeys.get(keyvalue)).click();
      }
      
   }
   
   this.removeKeyShortCutEvent = function (){

      document.getElementById("root").removeEventListener("keydown", self.aimshortCutKeyEvent);

   }

   this.loadTemplates = function (templateList) {

      self.arrayTemplatesJsonObjects = templateList;
      console.log("JsonObjects", self.arrayTemplatesJsonObjects);
      if (self.arrayTemplatesJsonObjects.length > 0) {
         for (var i = 0; i < self.arrayTemplatesJsonObjects.length; i++) {
            var object = {};
            console.log(
              "CAVIIITTTT",
              self.arrayTemplatesJsonObjects[i]
            );
            object.codeValue = self.arrayTemplatesJsonObjects[i].TemplateContainer.Template[0]["codeValue"];
            object.arrayIndex = i;
            self.mapTemplateCodeValueByIndex.set(object.codeValue, i);


         }
      }
   
   }


   this.createViewerWindow = function () {



      //var x = document.createElement("INPUT");
      //x.setAttribute("type", "file");
      //x.addEventListener('change', self.readx, false);


      self.mainWindowDiv = document.createElement('div');
      
      // below section needs to be uncommented for testing purpose
         //self.mainButtonsDiv = document.createElement('div');
         //this.addButtons(this.mainWindowDiv);
         //this.mainWindowDiv.appendChild(x);
      // above section needs to be uncommented for testing purpose
      self.templateListDiv = document.createElement('div');
      self.templateListDiv.id = "tlist";

      self.shapeDiv = document.createElement('div');
      self.shapeDiv.id = "shape";

      self.accordion1Div = document.createElement('div');
      self.accordion1Div.id = "accordion1";
      self.accordion1Div.className = " ui accordion";
      self.accordion1Div.style = "background-color: inherit; width:inherit;";

      var accordion2Div = document.createElement('div');
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
      var templateDiv = document.createElement('div');
      self.templateSelect = document.createElement('select');
      templateDiv.id = 'Temp';
      self.templateSelect.id = "S1";

      self.templateSelect.className = 'ui dropdown';
      templateDiv.appendChild(self.templateSelect);
      var i = 0;
      var templateOption = document.createElement("option");
      templateOption.value = "-1";
      templateOption.text = "Select";
      self.templateSelect.appendChild(templateOption);

      for (i = 0; i < self.arrayTemplatesJsonObjects.length; i++) {

         var templateOption = document.createElement("option");
         templateOption.value = i;
         templateOption.text = self.arrayTemplatesJsonObjects[i].value.TemplateContainer.Template[0].codeMeaning;
         //templateOption.innerHTML = this.arrayTemplatesJsonObjects[i].key;
         self.templateSelect.appendChild(templateOption);

      }

      // var lblTxt = document.createTextNode("Select template:");


      self.templateListDiv.appendChild(self.templateSelect);
      self.userWindow.appendChild(self.mainWindowDiv);


      self.templateSelect.onchange = function () {
         
         self.aimComment = "";
         self.aimName = "";
         self.aimType = "";
         let templateSelectedIndex = this.value;
        
       
            self.jsonTemplateCopy = "";
            self.accordion1Div.innerHTML = '';
            self.shapeDiv.innerHTML = '';
            //uncomment below line for testing
            //self.mainButtonsDiv.innerHTML = "";

            self.mapCardinalitiesToCheckId = new Map();
            self.mapStatusAllowedTermBlocks = new Map();
            self.mapHtmlObjects = new Map();
            self.mapHtmlSelectObjectsKeyValue = new Map();
            self.mapAllowedTermCollectionByCodeValue = new Map();
            //self.mapTemplateCodeValueByIndex = new Map();
            self.mapLabelAnnotatorConfidence = new Map();
            self.mapLabelAnnotConfJson = new Map();
            self.mapLabelSubComment = new Map();
            self.mapLabelCommentJson = new Map();
            self.mapLabelUid = new Map();
            if (templateSelectedIndex > -1){
               self.jsonTemplateCopy = self.arrayTemplatesJsonObjects[this.value].value;
               self.extractTemplate(self.jsonTemplateCopy);
            }
         

      };
      $('select[class^="ui dropdown"]').dropdown();

   }


   this.extractTemplate = function (json) {
      var a = 0;


      var subObject = null;
      var arrayLength = -1;
      let isArray = 0;
      if (Array.isArray(json.TemplateContainer.Template[0].Component)){
         isArray = 1;
         arrayLength = json.TemplateContainer.Template[0].Component.length;
      }else{
         isArray = 0;
         arrayLength = 1;
      }

      var component = null;
      //adding comment textarea for the template 
      var commentDiv = document.createElement("div");
      var labelDiv = document.createElement("div");
      var annotationNameDiv = document.createElement("div");
      var annotationNameLabelDiv = document.createElement("div");

      var labelAnnotationName = document.createElement('label');

      labelAnnotationName.textContent = "Name";
      var labelAnnotationNameInput = document.createElement("INPUT");
      labelAnnotationNameInput.onkeyup = function () {

         self.aimName = this.value;
      }

      labelAnnotationNameInput.setAttribute("type", "text");
      labelAnnotationNameInput.id = 'annotationName';

      annotationNameDiv.appendChild(labelAnnotationName);
      annotationNameDiv.appendChild(labelAnnotationNameInput);
      annotationNameLabelDiv.appendChild(labelAnnotationName);
      annotationNameDiv.className = 'comment ui input';

      var label = document.createElement('label');
      annotationNameLabelDiv.className = 'comment';
      label.textContent = "comment";
      labelDiv.className = 'comment';
      commentDiv.className = 'comment';

      var textareaDomObject = document.createElement("textarea");
      labelDiv.appendChild(label);
      textareaDomObject.id = 'comment';
      commentDiv.appendChild(textareaDomObject);
      
      textareaDomObject.onkeyup = function () {

         self.aimComment = this.value;

      }




      document.getElementById("accordion1").appendChild(annotationNameLabelDiv);
      document.getElementById("accordion1").appendChild(annotationNameDiv);
      document.getElementById("accordion1").appendChild(labelDiv);
      document.getElementById("accordion1").appendChild(commentDiv);
      //end adding comment textarea for the template 
      var a = 0;
      for (var i = 0; i < arrayLength; i++) {
         a++;
         if (isArray === 1)
            component = json.TemplateContainer.Template[0].Component[i];
         else
            component = json.TemplateContainer.Template[0].Component;

         var cmplabel = component.label;
        
         var ComponentDivId = (cmplabel).replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>/ /\{\}\[\]\\\/]/gi, '');

         var componentDivLabel = document.createTextNode(cmplabel);
         var componentDiv = document.createElement('div');
         componentDiv.className = ' accordion mylbl';
         componentDiv.disabled = 'true';


         var headerDiv = document.createElement('div');
         headerDiv.className = 'title active';
         headerDiv.id = a;


         var headerArrowIcon = document.createElement('i');
         headerArrowIcon.className = 'dropdown icon';

         var headerCheckIcon = document.createElement('i');
         headerCheckIcon.className = "red check circle outline icon";
         //  headerCheckIcon.id = (component.id).replace(/[.*+?^${}()|[\]\\]/g, '');
         headerCheckIcon.id = component.id;
         document.getElementById("accordion1").appendChild(componentDiv);

         var incontentDiv = document.createElement('div');
         incontentDiv.className = 'content active';
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
            self.GeometricShape(component, component, incontentDiv, this.maptag, 'component');
         }
         var components = [];

         let compObj = {
            type: 'component',
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

            if (typeof (component[keyorder[counter]]) == "object") {



               self[keyorder[counter]](component, component[keyorder[counter]], incontentDiv, compObj.subTag, "Component");

            }


         }




      }

      //uncomment below line for testing
      //self.mainButtonsDiv.innerHTML = "";
      //self.addButtons(self.mainButtonsDiv);
      $('select[class^="ui dropdown"]').dropdown();
      $('.ui.accordion').accordion();
      self.formCheckHandler(self.checkFormSaveReady());

   }

   this.QuestionType = function (parent, object, parentDiv, mapTagArray, parentTagTypeFromJson) {


   }

   this.Calculation = function (parent, object, parentDiv, mapTagArray, parentTagTypeFromJson) {


   }
   this.CalculationType = function (parent, object, parentDiv, mapTagArray, parentTagTypeFromJson) {


   }

   this.Inference = function (parent, object, parentDiv, mapTagArray, parentTagTypeFromJson) {


   }

   this.textFreeInput = function (parent, object, parentDiv, mapTagArray, parentTagTypeFromJson) {


      //var textareaDomObject = document.createElement("textarea");
      //parentDiv.appendChild(textareaDomObject);


   }

   this.ValidTerm = function (parent, object, parentDiv, mapTagArray, parentTagTypeFromJson, optionElement, paramContentDiv, validTermButtonClass, ATparent, ATobject, ATallowedTermObj) {


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
      for (i = 0; i < arrayLength; i++) {
         var subEObject = null;
         if (arrayLength > 1)
            subEObject = object[i];
         else
            subEObject = object;

         var ValidTermObj = {
            type: 'ValidTerm',
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
            select: '0'

         };

         ValidTerm.push({
            ValidTerm: ValidTermObj
         }
         );

         var control = "";
         if ((ATparent.minCardinality == 1) && (ATparent.maxCardinality == 1)) {
            control = "radioBtn";
         }
         var allowTermText = parent.codeMeaning;
         var selectHolder;
         if ((control != "radioBtn")) {
            if (validTermButtonClass != "ui") {
               var ar = new self.createCheckboxVT(parent, subEObject.codeValue, ATparent.label, "ui checkbox mylbl", false, allowTermText + " " + subEObject.codeMeaning, ATallowedTermObj, ValidTermObj, ATparent);
               parentDiv.appendChild(ar.getelementHtml());
            } else {
               self.subOrderLabelTracking = self.subOrderLabelTracking + 1;
               var ar = new self.createOptionVT(parent, subEObject.codeValue, ATparent.label, "ui ", false, allowTermText + "  " + subEObject.codeMeaning, ATallowedTermObj, ValidTermObj, ATparent);

               selectHolder = paramContentDiv.getElementsByTagName("select")[0];
               selectHolder.appendChild(ar.getelementHtml());
            }

         } else {


            var ar = new self.createRadioVT(parent, subEObject.codeValue, ATparent.label, "ui radio checkbox mylbl", false, allowTermText + " " + subEObject.codeMeaning, ATallowedTermObj, ValidTermObj, ATparent);
            parentDiv.appendChild(ar.getelementHtml());
         }

         for (var key in subEObject) {
            if (typeof (subEObject[key]) == "object") {

            }

         }

      }


   }

   this.GeometricShape = function (parent, object, parentDiv, mapTagArray, parentTagTypeFromJson) {
      var GeometricShape = [];
      let Obj = {
         type: 'GeometricShape',
         shape: object.GeometricShape,
         subTag: []
      };
      mapTagArray.push({
         GeometricShape: Obj
      }
      );


      var GSDiv = document.createElement('div');
      self.geoshapeidCounter++;
      GSDiv.id = 'geoshape'+self.geoshapeidCounter;
      GSDiv.className = 'mylbl';
      //GSDiv.style.width = '200px';
     // GSDiv.style.height = '20px';
     // GSDiv.style.backgroundColor = 'white';
     //GSDiv.style.color = 'black';
      GSDiv.innerHTML = "Required shape : " + object.GeometricShape;
      parentDiv.appendChild(GSDiv);
      console.log("shape " + JSON.stringify(object.id));
      self.templateShapeArray.push({"shape":object.GeometricShape, "domid" : object.id});
      //document.getElementById( object.id).className = "green check circle outline icon";


   }


   this.AllowedTerm = function (parent, object, parentDiv, mapTagArray, parentTagTypeFromJson) {


      var athis = this;
      athis.parent = parent;

      athis.obj = object;

      var control;
      var ar = "";
      var validTermButtonClass = "";
      var validTermButtonClassDiv = "";
      var validTermInputType = "";

      var txt = parent.label;
      var maindiv = (txt).replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>/ /\{\}\[\]\\\/]/gi, '');
      var lblTxt = document.createTextNode(parent.label);
      var uiAccordionDiv = document.createElement('div');
      uiAccordionDiv.className = ' accordion allowedTermlbl';
      var titleDiv = document.createElement('div');
      titleDiv.className = 'title active';




      var titleI = document.createElement('i');
      titleI.className = 'dropdown icon';
      var contentDiv = document.createElement('div');
      //iconcav
      var iconI = document.createElement('i');
      iconI.id = parent.id;
      if (parent.minCardinality <= '0') {
         iconI.className = "green check circle outline icon";
         var varOk = "true";
      } else {
         iconI.className = "red check circle outline icon";
         var varOk = "false";
      }


      parentDiv.appendChild(uiAccordionDiv);

      contentDiv.className = 'content active';
      contentDiv.id = "allowedTerm" + maindiv;



      if (parentTagTypeFromJson != "Component")
         uiAccordionDiv.appendChild(titleDiv);

      //icon cav
      titleDiv.appendChild(iconI);
      titleDiv.appendChild(titleI);
      titleDiv.appendChild(lblTxt);
      uiAccordionDiv.appendChild(contentDiv);
      uiAccordionDiv.style.marginLeft = "20px";

      var mainSelectDiv = document.createElement('div');
      mainSelectDiv.className = "ui container";
      mainSelectDiv.id = "Drop" + maindiv;

      var selectDiv = document.createElement('select');
      selectDiv.className = "ui fluid multiple dropdown";
      //selectDiv.multiple=true;
      selectDiv.id = 'select' + maindiv;




      domelements[maindiv] = new Array(6);
      domelements[maindiv]['id'] = maindiv;
      domelements[maindiv]['label'] = parent.label;
      domelements[maindiv]['min'] = parent.minCardinality;
      domelements[maindiv]['max'] = parent.maxCardinality;
      domelements[maindiv]['selectedCnt'] = 0;
      domelements[maindiv]['selectVerification'] = false;


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
      if ((parent.minCardinality == 1) && (parent.maxCardinality == 1)) {

         control = "radioBtn";
         if (arrayLength > 10) {
            mainSelectDiv.appendChild(selectDiv)
            contentDiv.appendChild(mainSelectDiv);
         }
      } else {
         if (arrayLength > 4) {
            mainSelectDiv.appendChild(selectDiv)
            contentDiv.appendChild(mainSelectDiv);
         }
      }

      let AllowedTerm = [];
      var i = 0;

      for (i = 0; i < arrayLength; i++) {
         var subEObject = null;

         self.subOrderLabelTracking = self.subOrderLabelTracking + 1;
         if (isArray === 1)
            subEObject = object[i];
         else
            subEObject = object;
         var ar;
         self.ids++;
         //add global array
         var NextId = '0';

         //subEObject.cavit = "added by"
         if (typeof subEObject.nextId != "undefined") {
            NextId = subEObject.nextId;

         }




         var allowedTermObj = {
            type: 'AllowedTerm',
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
            select: '0',
            subTag: []

         };

         let unionPrntAlwtermObj = {
            parant: parent,
            allowterm: allowedTermObj
         }
         this.mapAllowedTermCollectionByCodeValue.set(allowedTermObj.codeValue, unionPrntAlwtermObj);
         AllowedTerm.push({
            AllowedTerm: allowedTermObj
         }
         );

         //add global array
         //mapTagArray.push( subEObject.codeMeaning);

         if (control != "radioBtn") {
            if (arrayLength > 4) {

               validTermInputType = "select"
               validTermButtonClass = "ui";
               ar = new self.createOption(parent, subEObject.codeValue, parent.label, "ui ", false, subEObject.codeMeaning, allowedTermObj);

               selectDiv.multiple = "true";
               if (!subEObject.hasOwnProperty("ValidTerm"))
                  selectDiv.appendChild(ar.getelementHtml());
               validTermButtonClassDiv = selectDiv;

            } else {
               validTermInputType = "checkbox"
               validTermButtonClass = "ui checkbox mylbl";
               ar = new self.createCheckbox(parent, subEObject.codeValue, parent.label, "ui checkbox mylbl", subEObject.codeMeaning, subEObject.codeMeaning, allowedTermObj);
               if (!subEObject.hasOwnProperty("ValidTerm"))
                  contentDiv.appendChild(ar.getelementHtml());
               validTermButtonClassDiv = contentDiv;
            }

         } else {
            if (arrayLength > 10) {
               //select from drop down it adds to input box
               validTermInputType = "select"
               validTermButtonClass = "ui";
               ar = new self.createOption(parent, subEObject.codeValue, parent.label, "ui ", false, subEObject.codeMeaning, allowedTermObj);

               selectDiv.multiple = "false";
               if (!subEObject.hasOwnProperty("ValidTerm"))
                  selectDiv.appendChild(ar.getelementHtml());
               validTermButtonClassDiv = selectDiv;
            }
            else {

               validTermInputType = "radio"
               validTermButtonClass = "ui radio checkbox mylbl";

               ar = new self.createRadio(parent, subEObject.codeValue, parent.label, "ui radio checkbox mylbl", false, subEObject.codeMeaning, allowedTermObj);

               if (!subEObject.hasOwnProperty("ValidTerm"))
                  contentDiv.appendChild(ar.getelementHtml());
               validTermButtonClassDiv = contentDiv;
            }

         }


         var el = domelements[domelements.length - 1];
         for (var key in subEObject) {
            if (typeof (subEObject[key]) == "object") {
               if (key == "ValidTerm") {


                  self[key](subEObject, subEObject[key], contentDiv, allowedTermObj.subTag, "ValidTerm", ar.getelementHtml(), contentDiv, validTermButtonClass, parent, object, allowedTermObj);

               } else {


                  self[key](subEObject, subEObject[key], contentDiv, allowedTermObj.subTag, "AllowedTerm");
               }
            }

         }


      }
      self.subOrderLabelTracking = 64;

      var preselected = "";
      $("#" + selectDiv.id).dropdown({
         onChange: function (val, text) {



            if (text[0] == '<') {
               var words = text.split("<label>");
               var words = words[1].split("</label>");

               text = words[0];
            }
            var evObja = document.createEvent('Events');
            evObja.initEvent("click", true, false);
            var k = 0;
            for (k = 0; k < selectDiv.options.length; k++) {

               if (selectDiv.options[k].value == text) {
                  selectDiv.options[k].dispatchEvent(evObja);
               }
            }
         }
      });



   }


   this.ImagingObservation = function (parent, object, parentDiv, mapTagArray, parentTagTypeFromJson) {
      var _self = this;
      self.checkAnnotatorConfidence(parentDiv, object);
      self.checkIfCommentRequired(object, parentDiv);
      //add global array
      var arrayLength = -1;
      let isArray = 0;
      if (Array.isArray(object)) {
         isArray = 1 ;
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
            type: 'ImagingObservation',
            subTag: []
         };

         ImagingObservation.push({
            ImagingObservation: ImagingObservationObj
         }
         );


         var obj = object["ImagingObservation"];
         self.ImagingObservationCharacteristic(object, subEObject, parentDiv, ImagingObservation[ImagingObservation.length - 1].ImagingObservation.subTag, ImagingObservation[ImagingObservation.length - 1].ImagingObservation.type);
         mapTagArray.push({
            ImagingObservation: ImagingObservation
         }
         );
      }

   }

   this.ImagingObservationCharacteristic = function (parent, object, parentDiv, mapTagArray, parentTagTypeFromJson) {

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
         if (isArray == 1)
            subEObject = object[i];
         else
            subEObject = object;



         let ImagingObservationCharacteristicObj = {
            type: 'ImagingObservationCharacteristic',
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
         }
         );

         for (var key in subEObject) {
            if (typeof (subEObject[key]) == "object") {
               //console.log("____________"+key);
               self[key](subEObject, subEObject[key], parentDiv, ImagingObservationCharacteristicObj.subTag, ImagingObservationCharacteristicObj.type);
            }

         }
         self.checkAnnotatorConfidence(parentDiv, subEObject);
         self.checkIfCommentRequired(subEObject, parentDiv);

      }

      mapTagArray.push({
         ImagingObservationCharacteristic: ImagingObservationCharacteristic
      }
      );


   }

   this.CharacteristicQuantification = function (parent, object, parentDiv, mapTagArray, parentTagTypeFromJson, subOrderLabel) {


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
         if (isArray === 1)
            subEObject = object[i];
         else
            subEObject = object;


         var scaleHolderDiv = document.createElement('div');
         scaleHolderDiv.className = "mylbl";
         var label = document.createElement('label');

         var aHref = document.createElement('div');
         aHref.className = "ui label blue tiny";

         var _subOrderLabel = String.fromCharCode(self.subOrderLabelTracking);
         var aHrefText = document.createTextNode(_subOrderLabel);
         label.textContent = _subOrderLabel + '--' + subEObject.name;

         scaleHolderDiv.appendChild(aHref);
         aHref.appendChild(aHrefText);
         scaleHolderDiv.appendChild(label);

         parentDiv.appendChild(scaleHolderDiv);



         var suborder = self.subOrderLabelTracking;


         let CharacteristicQuantificationObj = {
            type: 'CharacteristicQuantification',
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

            if (typeof (subEObject[key]) == "object") {

               self[key](subEObject, subEObject[key], scaleHolderDiv, CharacteristicQuantification[CharacteristicQuantification.length - 1].CharacteristicQuantification.subTag, CharacteristicQuantification[CharacteristicQuantification.length - 1].CharacteristicQuantification.type, suborder);
            }

         }
         self.checkAnnotatorConfidence(parentDiv, object);
         mapTagArray.push({
            CharacteristicQuantification: CharacteristicQuantification
         }
         );

      }


   }

   this.AnatomicEntity = function (parent, object, parentDiv, mapTagArray, parentTagTypeFromJson) {


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
         if (isArray === 1)
            subEObject = object[i];
         else
            subEObject = object;

         for (var key in subEObject) {
            if (typeof (subEObject[key]) == "object") {

               self[key](subEObject, subEObject[key], parentDiv, mapTagArray, null);
            }

         }


         var clabel = document.createElement('label');

         parentDiv.appendChild(clabel);
         self.checkAnnotatorConfidence(parentDiv, object);
         self.checkIfCommentRequired(object, parentDiv);





      }

   }

   this.AnatomicEntityCharacteristic = function (parent, object, parentDiv, mapTagArray, parentTagTypeFromJson) {


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
         if (isArray === 1)
            subEObject = object[i];
         else
            subEObject = object;

         for (var key in subEObject) {
            if (typeof (subEObject[key]) == "object") {


               self[key](subEObject, subEObject[key], parentDiv, mapTagArray, null);

            }

         }
         self.checkAnnotatorConfidence(parentDiv, subEObject);
         self.checkIfCommentRequired(subEObject, parentDiv);


      }


   }

   this.annotatorConfidence = function (parent, object, parentDiv, mapTagArray, parentTagTypeFromJson) {

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
         if (isArray === 1)
            subEObject = object[i];
         else
            subEObject = object;


         for (var key in subEObject) {
            if (typeof (subEObject[key]) == "object") {

               self[key](subEObject, subEObject[key], parentDiv, mapTagArray, null);
            }

         }

      }

   }



   this.Scale = function (parent, object, parentDiv, mapTagArray, parentTagTypeFromJson, subOrderLabel) {


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
         if (isArray === 1)
            subEObject = object[i];
         else
            subEObject = object;

         var scaleHolderDiv = document.createElement('div');
         scaleHolderDiv.className = "mylbl";
         var label = document.createElement('label');
         label.textContent = _subOrderLabel + '-' + parent.name;

         parentDiv.appendChild(scaleHolderDiv);

         for (var key in subEObject) {

            if (typeof (subEObject[key]) == "object") {

               self[key](subEObject, subEObject[key], scaleHolderDiv, mapTagArray, null, "Select" + parent.name);
            }

         }
         self.checkAnnotatorConfidence(parentDiv, object);
      }



   }

   this.ScaleLevel = function (parent, object, parentDiv, mapTagArray, parentTagTypeFromJson, subOrderLabel) {


      var arrayLength = -1;
      var quantileDiv = document.createElement('div');
      var quantileSelect = document.createElement('select');
      selectid++;
      quantileSelect.id = subOrderLabel;
      quantileSelect.addEventListener("change", function () {

         var i = 0;
         var scaleArraysize = object.length;
         for (i = 0; i < scaleArraysize; i++) {
            if (object[i].valueLabel == this.value) {
               object[i].select = '1';
               self.mapHtmlSelectObjectsKeyValue.set(this.value, quantileSelect.id);
            } else {
               object[i].select = '0';
            }
         }

      });
      quantileSelect.className = 'ui dropdown mylbl';
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
         if (isArray === 1)
            subEObject = object[i];
         else
            subEObject = object;
         for (var key in subEObject) {
            if (typeof (subEObject[key]) == "object") {

               self[key](subEObject, subEObject[key], parentDiv, mapTagArray, null);
            }

         }

         var quantileOption = document.createElement('option');

         quantileOption.innerHTML = subEObject.valueLabel;
         quantileSelect.appendChild(quantileOption);


      }


   }

   this.Numerical = function (parent, object, parentDiv, mapTagArray, parentTagTypeFromJson) {

      var arrayLength = -1;
      var quantileDiv = document.createElement('div');
      quantileDiv.className = "mylbl";
      var quantileSelect = document.createElement('select');
      quantileSelect.className = 'ui dropdown mylbl';
      selectid++;
      quantileSelect.id = selectid;
      quantileSelect.addEventListener("change", function () {


         var i = 0;
         var scaleArraysize = object.length;
         for (i = 0; i < scaleArraysize; i++) {
            var createFormValue = mathOperators.get(object[i].operator) + " " + object[i].valueLabel + " " + object[i].ucumString;

            if (createFormValue == this.value)
               object[i].select = '1';
            else
               object[i].select = '0';
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
      self.checkAnnotatorConfidence(parentDiv, object);
      for (var i = 0; i < arrayLength; i++) {
         if (isArray === 1)
            subEObject = object[i];
         else
            subEObject = object;
         for (var key in subEObject) {
            if (typeof (subEObject[key]) == "object") {

               self[key](subEObject, subEObject[key], parentDiv, mapTagArray, null);
            }

         }

         var quantileOption = document.createElement('option');
         quantileOption.innerHTML = mathOperators.get(subEObject.operator) + " " + subEObject.valueLabel + " " + subEObject.ucumString;
         quantileSelect.appendChild(quantileOption);

      }


   }

   this.Quantile = function (parent, object, parentDiv, mapTagArray, parentTagTypeFromJson) {





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
      self.checkAnnotatorConfidence(parentDiv, object);
      for (var i = 0; i < arrayLength; i++) {
         if (isArray === 1)
            subEObject = object[i];
         else
            subEObject = object;
         for (var key in subEObject) {
            if (typeof (subEObject[key]) == "object") {

               self[key](subEObject, subEObject[key], parentDiv, mapTagArray, null);
            }

         }
         var quantileDiv = document.createElement('div');
         quantileDiv.className = "mylbl";
         var quantileSelect = document.createElement('select');
         quantileSelect.className = 'ui dropdown mylbl';
         quantileDiv.appendChild(quantileSelect);
         parentDiv.appendChild(quantileDiv);
         var max = parseFloat(subEObject.maxValue);
         var min = parseFloat(subEObject.minValue);
         var bins = parseFloat(subEObject.bins);
         var net = max - min;
         var step = net / bins;
         var minValue = min;
         for (i = 0; i < bins; i++) {

            let quantileOption = document.createElement('option');
            quantileSelect.appendChild(quantileOption);
            quantileOption.innerHTML = minValue + " - " + parseFloat(parseFloat(minValue) + parseFloat(step));
            minValue = minValue + step;
         }

      }


   }

   this.Interval = function (parent, object, parentDiv, mapTagArray, parentTagTypeFromJson) {


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
      self.checkAnnotatorConfidence(parentDiv, object);
      var intervalDiv = document.createElement('div');
      intervalDiv.className = "mylbl";
      var intervalSelect = document.createElement('select');
      intervalSelect.className = 'ui dropdown mylbl';


      selectid++;
      intervalSelect.id = selectid;
      intervalSelect.addEventListener("change", function () {

         var i = 0;
         var scaleArraysize = object.length;
         for (i = 0; i < scaleArraysize; i++) {


            if (object[i].valueLabel == this.value)
               object[i].select = '1';
            else
               object[i].select = '0';
         }

      });



      intervalDiv.appendChild(intervalSelect);
      for (var i = 0; i < arrayLength; i++) {
         if (isArray === 1)
            subEObject = object[i];
         else
            subEObject = object;
         for (var key in subEObject) {
            if (typeof (subEObject[key]) == "object") {

               self[key](subEObject, subEObject[key], parentDiv, mapTagArray, null);
            }

         }
         var intervalOption = document.createElement('option');
         intervalOption.innerHTML = subEObject.valueLabel;
         intervalSelect.appendChild(intervalOption);

      }
      parentDiv.appendChild(intervalDiv);

   }

   this.NonQuantifiable = function (parent, object, parentDiv, mapTagArray, parentTagTypeFromJson, subOrderLabel) {


      var _subOrderLabel = String.fromCharCode(subOrderLabel);
      var arrayLength = -1;
      var quantileDiv = document.createElement('div');
      quantileDiv.className = "mylbl";
      var quantileSelect = document.createElement('select');
      quantileSelect.className = 'ui dropdown mylbl';
      selectid++;
      quantileSelect.id = selectid;
      quantileSelect.addEventListener("change", function () {

         var i = 0;
         var scaleArraysize = object.length;
         for (i = 0; i < scaleArraysize; i++) {


            if (object[i].codeMeaning == this.value)
               object[i].select = '1';
            else
               object[i].select = '0';
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
      self.checkAnnotatorConfidence(parentDiv, object);
      for (var i = 0; i < arrayLength; i++) {
         if (isArray === 1)
            subEObject = object[i];
         else
            subEObject = object;
         for (var key in subEObject) {
            if (typeof (subEObject[key]) == "object") {

               self[key](subEObject, subEObject[key], parentDiv, mapTagArray, null);
            }

         }
         var quantileOption = document.createElement('option');
         quantileOption.innerHTML = subEObject.codeMeaning;
         quantileSelect.appendChild(quantileOption);

      }


   }





   this.createRadio = function (prObject, id, name, className, checked, lbl, allowedTermObj) {

      var _self = this;
      _self.par = prObject;
      _self.id = id;
      _self.name = name;
      _self.checked = checked;
      _self.className = className;
      _self.lbl = lbl;
      var div = document.createElement('div');
      div.className = _self.className;
      var label = document.createElement('label');
      label.textContent = _self.lbl;
      var radioInput = document.createElement('input');
      radioInput.type = "radio";
      radioInput.className = "ui radio checkbox";
      radioInput.id = _self.id;
      radioInput.name = _self.name;
      radioInput.checked = _self.checked;


      div.appendChild(radioInput);
      div.appendChild(label);

      radioInput.onclick = function () {


         var getAllowTGroup = prObject;
         var getAllowTGroupSize = getAllowTGroup.AllowedTerm.length;
         var i = 0;

         for (i = 0; i < getAllowTGroupSize; i++) {
            if (getAllowTGroup.AllowedTerm[i].codeValue !== allowedTermObj.codeValue)
               getAllowTGroup.AllowedTerm[i].select = '0';
            else
               getAllowTGroup.AllowedTerm[i].select = '1';
         }





         allowedTermObj.select = '1';
         allowedTermObj.changeOnSelect('1', self.AfterClick(allowedTermObj.callParentObj()));
         var checkmarkObj = self.mapCardinalitiesToCheckId.get(prObject.id);
         checkmarkObj.ok = 'true';
         checkmarkObj.actualSelected++;

         self.mapCardinalitiesToCheckId.set(checkmarkObj.id, checkmarkObj);

         if (checkmarkObj.actualSelected >= checkmarkObj.min)
            document.getElementById(checkmarkObj.id).className = "green check circle outline icon";
         if (allowedTermObj.nextId != '0') {

            self.DisableTillNext(_self.par.id, allowedTermObj.nextId, self.callDisable);

         } else if (typeof (self.mapStatusAllowedTermBlocks.get(checkmarkObj.id)) !== 'undefined') {
            var statusCheckAllowTermObject = self.mapStatusAllowedTermBlocks.get(checkmarkObj.id);
            if (statusCheckAllowTermObject.status == 'disabled')
               self.EnableTillNext(statusCheckAllowTermObject.startid, statusCheckAllowTermObject.endid);
         }

         self.formCheckHandler(self.checkFormSaveReady());
      };

      this.getelementHtml = function () {

         return div;
      };
      self.mapHtmlObjects.set(allowedTermObj.codeValue, radioInput);
   };
   this.createRadioVT = function (prObject, id, name, className, checked, lbl, allowedTermObj, validTermObj, vtPrObject) {

      var _self = this;
      _self.allowedTermObj = validTermObj;
      _self.par = prObject;
      _self.id = id + allowedTermObj.codeValue;
      _self.name = name;
      _self.checked = checked;
      _self.className = className;
      _self.lbl = lbl;
      var div = document.createElement('div');
      div.className = _self.className;
      var label = document.createElement('label');
      label.textContent = _self.lbl;
      var radioInput = document.createElement('input');
      radioInput.type = "radio";
      radioInput.className = "ui radio checkbox";
      radioInput.id = _self.id;
      radioInput.name = _self.name;
      radioInput.checked = _self.checked;



      div.appendChild(radioInput);
      div.appendChild(label);

      radioInput.onclick = function () {


         prObject.select = "1";
         var getAllowTGroup = validTermObj.primitiveObjATSparent;
         var getAllowTGroupSize = getAllowTGroup.AllowedTerm.length;
         var i = 0;
         for (i = 0; i < getAllowTGroupSize; i++) {
            if (getAllowTGroup.AllowedTerm[i].codeValue !== validTermObj.primitiveObjATS.codeValue)
               getAllowTGroup.AllowedTerm[i].select = '0';
            else
               getAllowTGroup.AllowedTerm[i].select = '1';
         }

         allowedTermObj.select = '1';
         allowedTermObj.changeOnSelect('1', self.AfterClick(allowedTermObj.callParentObj()));



         var checkmarkObj = self.mapCardinalitiesToCheckId.get(validTermObj.primitiveObjATSparent.id);
         checkmarkObj.ok = 'true';
         checkmarkObj.actualSelected++;

         self.mapCardinalitiesToCheckId.set(checkmarkObj.id, checkmarkObj);

         if (checkmarkObj.actualSelected >= checkmarkObj.min)
            document.getElementById(checkmarkObj.id).className = "green check circle outline icon";
         if (allowedTermObj.nextId != '0') {

            self.DisableTillNext(prObject.id, allowedTermObj.nextId, self.callDisable);

         } else if (typeof (self.mapStatusAllowedTermBlocks.get(checkmarkObj.id)) !== 'undefined') {
            var statusCheckAllowTermObject = self.mapStatusAllowedTermBlocks.get(checkmarkObj.id);
            if (statusCheckAllowTermObject.status == 'disabled')

               self.EnableTillNext(statusCheckAllowTermObject.startid, statusCheckAllowTermObject.endid);
         }



         self.formCheckHandler(self.checkFormSaveReady());
      };



      //document.addEventListener('click', this.check.bind(this) );


      this.getelementHtml = function () {

         return div;
      };

      self.mapHtmlObjects.set(_self.allowedTermObj.codeValue, radioInput);
   };

   this.createOption = function (prObject, id, name, className, checked, lbl, allowedTermObj) {
      //drop down select and add input box object
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
      var div = document.createElement('div');
      div.className = _self.className;
      var labelHolder = document.createElement('label');
      var label = document.createTextNode(_self.lbl);


      var square = document.createElement('div');
      square.className = "ui mini Tiny blue label";
      var lab = document.createTextNode(String.fromCharCode(self.subOrderLabelTracking) + "-");
      square.appendChild(lab);

      var optionInput = document.createElement('option');
      optionInput.id = _self.id;
      optionInput.name = _self.name;
      optionInput.checked = _self.checked;
      optionInput.value = _self.lbl;
      //div.appendChild(radioInput);

      div.appendChild(optionInput);
      optionInput.appendChild(square);
      optionInput.appendChild(labelHolder);
      labelHolder.appendChild(label);

      optionInput.addEventListener("click", function () {

         var checkmarkObj = self.mapCardinalitiesToCheckId.get(prObject.id);
         checkmarkObj.ok = 'true';

         if (allowedTermObj.getPrimitive().select == '1') {

            allowedTermObj.getPrimitive().select = '0';
            allowedTermObj.changeOnSelect('0', self.AfterClick(allowedTermObj));
            checkmarkObj.actualSelected--;
         } else {
            allowedTermObj.getPrimitive().select = '1';
            allowedTermObj.changeOnSelect('1', self.AfterClick(allowedTermObj));
            checkmarkObj.actualSelected++;

         }


         self.mapCardinalitiesToCheckId.set(prObject.id, checkmarkObj);
         if ((checkmarkObj.actualSelected >= checkmarkObj.min) && (checkmarkObj.actualSelected <= checkmarkObj.max))
            document.getElementById(prObject.id).className = "green check circle outline icon";
         else
            document.getElementById(prObject.id).className = "red check circle outline icon";

         self.formCheckHandler(self.checkFormSaveReady());
      });





      this.getelementHtml = function () {

         return optionInput;
      };

   };

   this.createOptionVT = function (prObject, id, name, className, checked, lbl, allowedTermObj, validTermObj, vtPrObject) {
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
      var div = document.createElement('div');
      div.className = _self.className;
      var labelHolder = document.createElement('label');
      var label = document.createTextNode(_self.lbl);


      var square = document.createElement('div');
      square.className = "ui mini Tiny blue label";
      var lab = document.createTextNode(String.fromCharCode(self.subOrderLabelTracking) + "-");
      square.appendChild(lab);

      var optionInput = document.createElement('option');
      optionInput.id = _self.id;
      optionInput.name = _self.name;
      optionInput.checked = _self.checked;
      optionInput.value = _self.lbl;
      //div.appendChild(radioInput);

      div.appendChild(optionInput);
      optionInput.appendChild(square);
      optionInput.appendChild(labelHolder);
      labelHolder.appendChild(label);

      optionInput.addEventListener("click", function () {


         var checkmarkObj = self.mapCardinalitiesToCheckId.get(vtPrObject.id);
         checkmarkObj.ok = 'true';


         if (validTermObj.getPrimitive().select == '1') {
            prObject.select = "0";
            //allowedTermObj.getPrimitive().select ='0';
            validTermObj.getPrimitive().select = '0';
            //allowedTermObj.changeOnSelect('0',self.AfterClick(allowedTermObj));
            checkmarkObj.actualSelected--;
         } else {
            prObject.select = "1";
            //allowedTermObj.getPrimitive().select ='1';
            validTermObj.getPrimitive().select = '1';
            //allowedTermObj.changeOnSelect('1',self.AfterClick(allowedTermObj));
            checkmarkObj.actualSelected++;

         }






         self.mapCardinalitiesToCheckId.set(vtPrObject.id, checkmarkObj);
         if ((checkmarkObj.actualSelected >= checkmarkObj.min) && (checkmarkObj.actualSelected <= checkmarkObj.max))
            document.getElementById(vtPrObject.id).className = "green check circle outline icon";
         else
            document.getElementById(vtPrObject.id).className = "red check circle outline icon";
         self.formCheckHandler(self.checkFormSaveReady());

      });




      this.getelementHtml = function () {

         return optionInput;
      };

   };


   this.createCheckbox = function (prObject, id, name, className, value, lbl, allowedTermObj) {
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
      var div = document.createElement('div');
      div.className = this.className;
      var label = document.createElement('label');
      label.textContent = this.lbl;
      var checkbox = document.createElement('input');
      checkbox.type = "checkbox";
      checkbox.className = "ui checkbox";
      checkbox.name = this.name;
      checkbox.value = this.value;
      checkbox.id = this.id;
      div.appendChild(checkbox);
      div.appendChild(label);
      // document.getElementById(this.par).appendChild(div);
      this.getelementHtml = function () {

         return div;
      };


      checkbox.onclick = function () {

         allowedTermObj.changeOnSelect('1', self.AfterClick);




         var checkmarkObj = self.mapCardinalitiesToCheckId.get(prObject.id);
         if (this.checked == true) {

            allowedTermObj.getPrimitive().select = '1';
            checkmarkObj.ok = 'true';
            checkmarkObj.actualSelected++;
         } else {
            allowedTermObj.getPrimitive().select = '0';
            checkmarkObj.ok = 'false';
            checkmarkObj.actualSelected--;
         }

         var getAllowTGroup = allowedTermObj.callParentObj();


         self.mapCardinalitiesToCheckId.set(prObject.id, checkmarkObj);

         if ((checkmarkObj.actualSelected >= checkmarkObj.min) && (checkmarkObj.actualSelected <= checkmarkObj.max))
            document.getElementById(prObject.id).className = "green check circle outline icon";
         else
            document.getElementById(prObject.id).className = "red check circle outline icon";

         self.formCheckHandler(self.checkFormSaveReady());
      };

   }

   this.createCheckboxVT = function (prObject, id, name, className, value, lbl, allowedTermObj, validTermObj, vtPrObject) {
      //var _self = this;
      //_self.allowedTermObj = validTermObj;
      this.par = prObject;
      //this.id = id.replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, '');
      this.allowedTermObj = validTermObj;
      this.id = id;
      this.name = name;
      this.className = className;
      this.value = value;
      this.lbl = lbl;
      var div = document.createElement('div');
      div.className = this.className;
      var label = document.createElement('label');
      label.textContent = this.lbl;
      var checkbox = document.createElement('input');
      checkbox.type = "checkbox";
      checkbox.className = "ui checkbox";
      checkbox.name = this.name;
      checkbox.value = this.value;
      checkbox.id = this.id;
      div.appendChild(checkbox);
      div.appendChild(label);
      // document.getElementById(this.par).appendChild(div);
      this.getelementHtml = function () {

         return div;
      };


      checkbox.onclick = function () {

         validTermObj.changeOnSelect('1', self.AfterClick);




         var checkmarkObj = self.mapCardinalitiesToCheckId.get(vtPrObject.id);
         if (this.checked == true) {
            prObject.select = "1";
            validTermObj.getPrimitive().select = '1';
            checkmarkObj.ok = 'true';
            checkmarkObj.actualSelected++;
         } else {
            prObject.select = "0";
            validTermObj.getPrimitive().select = '0';
            checkmarkObj.ok = 'false';
            checkmarkObj.actualSelected--;
         }

         var getAllowTGroup = allowedTermObj.callParentObj();

         self.mapCardinalitiesToCheckId.set(vtPrObject.id, checkmarkObj);

         if ((checkmarkObj.actualSelected >= checkmarkObj.min) && (checkmarkObj.actualSelected <= checkmarkObj.max))
            document.getElementById(vtPrObject.id).className = "green check circle outline icon";
         else
            document.getElementById(vtPrObject.id).className = "red check circle outline icon";

         self.formCheckHandler(self.checkFormSaveReady());
      };

   }

   this.checkValidationTosave = function () {

      for (var property1 in domelements) {


         if (domelements[property1]['selectVerification'] == true)
            console.log('true');
         else
            console.log('false');
      }
   }
   this.checkAnnotatorConfidence = function (prentDiv, objectToCheckAnnConf) {

      if (typeof objectToCheckAnnConf.annotatorConfidence != "undefined") {

         // Assign value to the property here
         if ((objectToCheckAnnConf.hasOwnProperty("label")) || (objectToCheckAnnConf.hasOwnProperty("name"))) {
            if (objectToCheckAnnConf.annotatorConfidence == "true") {
               //console.log("after selecting template"+objectToCheckAnnConf.label);

               if (objectToCheckAnnConf.hasOwnProperty("label")) {
                  var rangeid = objectToCheckAnnConf.label.replace(/[`~!@# $%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, '');
               } else if (objectToCheckAnnConf.hasOwnProperty("name")) {
                  var rangeid = objectToCheckAnnConf.name.replace(/[`~!@# $%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, '');
               }

               self.mapLabelAnnotatorConfidence.set(rangeid, "inputRange" + rangeid);
               self.mapLabelAnnotConfJson.set(rangeid, objectToCheckAnnConf);
               //console.log(rangeid);
               var annotConfDiv = document.createElement('div');
               var annotConfInput = document.createElement('input');
               annotConfInput.setAttribute("id", "range" + rangeid);
               annotConfInput.setAttribute("type", "range");
               annotConfInput.setAttribute("min", "0");
               annotConfInput.setAttribute("max", "100");
               annotConfInput.setAttribute("start", "0");
               annotConfInput.setAttribute("input", "inputRange" + rangeid);
               annotConfInput.value = 0;

               annotConfInput.onchange = function () {

                  annotConfShowValueInput.value = this.value;
                  objectToCheckAnnConf.selectac = this.value / 100;

               };
               annotConfDiv.className = 'ui range';

               var annotConfShowValueInput = document.createElement('input');
               annotConfShowValueInput.style.width = "52px";
               annotConfShowValueInput.style.height = "28px";
               //annotConfShowValueInput.style.float = "left";
               annotConfShowValueInput.setAttribute("type", "text");
               annotConfShowValueInput.setAttribute("class", "ui  input");
               annotConfShowValueInput.setAttribute("id", "inputRange" + rangeid);
               annotConfShowValueInput.value = 0;

               var annotConfShowValueInputDiv = document.createElement('div');
               annotConfShowValueInputDiv.setAttribute("class", "ui input disabled small");



               annotConfDiv.appendChild(annotConfInput);
               annotConfDiv.appendChild(annotConfShowValueInputDiv);
               annotConfShowValueInputDiv.appendChild(annotConfShowValueInput);
               prentDiv.appendChild(annotConfDiv);

            }
         }
      }


   }


   var disabledefined = [];
   this.DisableTillNext = function (actualid, nextid, call) {
      let nextControl = 0;
      for (var [key, value] of self.mapCardinalitiesToCheckId) {
         if (key == actualid) {
            nextControl = 1;
            let object = {
               startid: key,
               endid: nextid,
               status: 'disabled'
            }
            self.mapStatusAllowedTermBlocks.set(key, object);
         } else if (nextControl == 1) {
            if ((key != nextid)) {
               disabledefined.push(key);
               document.getElementById(key).className = "blue check circle outline icon";
               let ely = document.getElementById(key).parentNode;

               //$(ely.parentNode).dropdown({action: 'hide'});
               $(ely.parentNode).dropdown().hide();

            } else
               nextControl = 0;
         }
      }
      call();

   }
   this.EnableTillNext = function (actualid, nextid) {
      let nextControl = 0;
      for (var [key, value] of self.mapCardinalitiesToCheckId) {
         if (key == actualid) {
            nextControl = 1;
            let object = {
               startid: key,
               endid: nextid,
               status: 'active'
            }
            self.mapStatusAllowedTermBlocks.set(key, object);
         } else if (nextControl == 1) {
            if (key != nextid) {
               disabledefined.push(key);
               document.getElementById(key).className = "green check circle outline icon";
               let ely = document.getElementById(key).parentNode;

               $(ely.parentNode).dropdown().show();

            } else
               nextControl = 0;
         }
      }
      self.callDisable();

   }
   this.callDisable = function () {

      for (var [key, value] of self.mapStatusAllowedTermBlocks) {
         //console.log("mapStatusAllowedTermBlocks" + key + ' = ' + JSON.stringify(value));
      }
   }

   this.solveAim = function (object, son) {
      //extracts components from object (maptag) 
      let componentSize = object.length
      var i
      for (i = 0; i < componentSize; i++) {

         self.solveAimCompnent(object[i][0])

      }


   }

   this.solveAimCompnent = function (object) {


   }

   this.AfterClick = function (obj) {



   }

   this.printXmlAim = function (data, xmlArray) {
      var oSerializer = new XMLSerializer();
      var sXML = oSerializer.serializeToString(data);

      console.log("..................................................aim Saved data" + (JSON.stringify(sXML)));
      for (var i = 0; i < xmlArray.length; i++) {
         var arrayXML = oSerializer.serializeToString(xmlArray[i].value);
         //console.log("..................................................xml array data" + (JSON.stringify(arrayXML)));
      }
   }
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
   this.readx = function readx(evt) {

      return self.readFile(evt);
   }


   //return self.loadAim(self.textXml, self.checkSaveReady);

   this.readFile = function (e) {
      //Retrieve all the files from the FileList object





      var file = e.target.files[0];
      if (!file) {
         return;
      }
      var reader = new FileReader();
      reader.onload = function (e) {
         var contents = e.target.result;
         self.textXml = contents;
         // Display file content
         //displayContents(contents);
      };
      reader.readAsText(file);

      // return self.loadAim(self.textXml, self.checkSaveReady);
   }


   // Save Aim
   this.savetextFreeInput = function (parentArray, parentObject, itself, Entitytype, jsonInner) {

   }


   this.saveQuestionType = function (parentArray, parentObject, itself, Entitytype, jsonInner) {

   }

   this.saveAlgorithmType = function (parentArray, parentObject, itself, Entitytype, jsonInner) {

   }

   this.saveCalculationType = function (parentArray, parentObject, itself, Entitytype, jsonInner) {

   }

   this.saveCalculation = function (parentArray, parentObject, itself, Entitytype, jsonInner) {

   }

   this.saveInference = function (parentArray, parentObject, itself, Entitytype, jsonInner) {

   }

   this.saveComponent = function (parentArray, parentObject, itself, Entitytype, jsonInner) {


   }

   //****************** used components *********************************** 


   this.saveInterval = function (parentArray, parentObject, itself, Entitytype, jsonInner) {
  		//console.log("interval :"+JSON.stringify(parentObject));
   		//console.log("interval :"+JSON.stringify(jsonInner));
/*
      var _inself = this;

      var prntObject = null;


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


      var xmlCharacteristicQuantification = xmldoc.createElement("CharacteristicQuantification");


      var xmlAnnotatorConfidence = xmldoc.createElement("annotatorConfidence");
      xmlAnnotatorConfidence.setAttribute("value", parentObject.value.selectac);

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
         }
         if (i == 0) {

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


      }
      xmlCharacteristicQuantification.setAttribute("maxOperator", defaultMaxOperator);
      xmlCharacteristicQuantification.setAttribute("minOperator", defaultMinOperator);
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

*/
   }

   this.saveNonQuantifiable = function (parentObject, itself, Entitytype, jsonInner) {

 
   		
  

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

      let jsonCharacteristicQuantification = {


        "xsi:type" : "NonQuantifiable",
        "annotatorConfidence": { "value": parentObject.value.selectac },
        "label": { "value": parentObject.value.name },
		"typeCode":	[{
			"code" :"",
			"codeSystem" : "",
			"codeSystemName" : "",
			"iso:displayName" :{
				"xmlns:iso" : "uri:iso.org:21090",
				"value" : ""
			},
			"codeSystemVersion" :""

		}]

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
         }

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

      jsonCharacteristicQuantification.typeCode[0].code = defaultCode;
      jsonCharacteristicQuantification.typeCode[0].codeSystem = defaultCodeSystem;
      jsonCharacteristicQuantification.typeCode[0].codeSystemName = defaultCodeSystemName;
      jsonCharacteristicQuantification.typeCode[0].codeSystemVersion = defaultCodeSystemVersion;
      jsonCharacteristicQuantification.typeCode[0]['iso:displayName'].value = defaultCodeSystem;
      jsonInner.push(jsonCharacteristicQuantification);


   }

   this.saveQuantile = function (parentObject, itself, Entitytype, jsonInner) {
/*


      let prntObject = null;


      let Quantiles = itself.value;
      let i = 0;
      let arraySize = -1;
      let arrayCheck = false;
      let instanceObject = null;
      if (Array.isArray(Quantiles)) {
         arraySize = Quantiles.length;
         arrayCheck = true;
      } else {
         arraySize = 1;
      }



      for (i = 0; i < arraySize; i++) {

         if (arrayCheck === true) {
            instanceObject = Quantiles[i];
         } else {
            instanceObject = Quantiles;
         }

         let prntObject = {
            type: "Quantile",
            value: instanceObject
         }



         for (var key in instanceObject) {

            if (typeof instanceObject[key] === "object") {


               let subObject = {
                  type: key,
                  value: instanceObject[key]
               }



               //parentHolder -> each component creates it's own copy of the array and passes to the next object
               //componentOpject is the parent object for the callee
               //is the callee object
               //Entitytype should be null from this point 
               self["save" + key](prntObject, subObject, Entitytype, jsonInner);
            }
         }
      }
*/
   }

   this.saveNumerical = function (parentObject, itself, Entitytype, jsonInner) {

/*

      let prntObject = null;


      let Numericals = itself.value;
      let i = 0;
      let arraySize = -1;
      let arrayCheck = false;
      let instanceObject = null;

      if (Array.isArray(Numericals)) {
         arraySize = Numericals.length;
         arrayCheck = true;
      } else {
         arraySize = 1;
      }



      for (i = 0; i < arraySize; i++) {

         if (arrayCheck === true) {
            instanceObject = Numericals[i];
         } else {
            instanceObject = Numericals;
         }

         let prntObject = {
            type: "Numerical",
            value: instanceObject
         }



         for (var key in instanceObject) {

            if (typeof instanceObject[key] === "object") {


               let subObject = {
                  type: key,
                  value: instanceObject[key]
               }




               //parentHolder -> each component creates it's own copy of the array and passes to the next object
               //componentOpject is the parent object for the callee
               //is the callee object
               //Entitytype should be null from this point 
               self["save" + key](prntObject, subObject, Entitytype, jsonInner);
            }
         }
      }
*/
   }


   this.saveScaleLevel = function (parentObject, itself, Entitytype, jsonInner) {


   	  jsonInner["xsi:type"] = parentObject.value.scaleType ;
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
         jsonInner.valueLabel = { "value":defaultSelectedValueLabel};
         jsonInner.value = {"value":defaultSelectedValue};

         prntObject = {
            type: "ScaleLevel",
            value: instanceObject
         }

      }

   }

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

      let anotconf  = "";
      if (typeof parentObject.value.selectac !== "undefined"){
          anotconf = parentObject.value.selectac;
      }else{
          anotconf = 0;
      }
      let jsonCharacteristicQuantification = {

         "type": "Scale",
         "xsi:type" : "",
         "annotatorConfidence": { "value": anotconf },
         "label": { "value": parentObject.value.name },
         "valueLabel": {
            "value": ""
         },
         "value": {
            "value": ""
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
         }




         for (var key in instanceObject) {

            if (typeof instanceObject[key] === "object") {



               let subObject = {
                  type: key,
                  value: instanceObject[key]
               }

               //parentHolder -> each component creates it's own copy of the array and passes to the next object
               //componentOpject is the parent object for the callee
               //is the callee object
               //Entitytype should be null from this point 
               self["save" + key](prntObject, subObject, Entitytype, jsonCharacteristicQuantification);
               jsonInner.push(jsonCharacteristicQuantification);
            }
         }

      }

   }



   this.saveCharacteristicQuantification = function (parentObject, itself, Entitytype, jsonInner) {



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
         }




         for (var key in instanceObject) {

            if (typeof instanceObject[key] === "object") {


               let subObject = {
                  type: key,
                  value: instanceObject[key]
               }
				

               //console.log("@@@@@@@@ car quant : "+key);

               //parentHolder -> each component creates it's own copy of the array and passes to the next object
               //componentOpject is the parent object for the callee
               //is the callee object
               //Entitytype should be null from this point 
               self["save" + key](prntObject, subObject, Entitytype, tempjson.CharacteristicQuantification);
               
            }
         }
      }

				//if (Object.keys(jsoncharacteristicQuantification).length > 0)
                  jsonInner.characteristicQuantificationCollection.push(tempjson.CharacteristicQuantification);

   }

   this.saveImagingObservation = function (parentObject, itself, Entitytype, jsonInner) {
     // console.log("%c __ imaging observation header before: " + JSON.stringify(jsonInner),  'background:  #df9800; color: white; display: block;');
      if (! (jsonInner.hasOwnProperty("imagingObservationEntityCollection")) )
      jsonInner.imagingObservationEntityCollection = [];
      let jsonImagingObservationEntity = {};
      self["saveImagingObservationCharacteristic"](parentObject, itself.value["ImagingObservationCharacteristic"], Entitytype, jsonInner.imagingObservationEntityCollection);
       //console.log("%c __ imaging observation header after: " + JSON.stringify(jsonInner),  'background: #df9800; color: white; display: block;');
   }

   this.saveImagingObservationCharacteristic = function (parentObject, itself, Entitytype, jsonInner) {

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
      tempjson.imagingObservationCharachteristicCollection = [];
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
         }

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
		                  }

		                 
		                  self["save" + key](prntObject, subObject, Entitytype, tempjson.imagingObservationCharachteristicCollection);
		                 

               	}
            }
         }

         
         if (commentvalue !== "") {
            let lastImObCharColl = tempjson.imagingObservationCharachteristicCollection[tempjson.imagingObservationCharachteristicCollection.length - 1];
            lastImObCharColl['comment'] = { "value": commentvalue };
            commentvalue = "";
         }
         //after for loop


      }
       jsonInner.push(tempjson);
     // console.log("%c saveImagingObservationCharacteristic - jsonInner after " + JSON.stringify(jsonInner) ,  'background: green; color: white; display: block;');
     
      //jsonInner.imagingObservationCharacteristicCollection = imagingObservationCharacteristicCollection;

   }

   this.emptyJson = function(obj){
   	 if ( (Object.keys(obj).length === 0) && (obj.constructor === Object) )
   	 	return false;
   	 else
   	 	return true;
   }
   this.saveAnatomicEntity = function ( parentObject, itself, Entitytype, jsonInner) {



		//console.log("%c __ anatomic entity header before: " + JSON.stringify(jsonInner),  'background:  #8b0087; color: white; display: block;');
    	if (! (jsonInner.hasOwnProperty("imagingPhysicalEntityCollection")) )
    	jsonInner.imagingPhysicalEntityCollection = [];
    	let jsonImagingPhysicalEntity = {};
    	self["saveAnatomicEntityCharacteristic"]( parentObject, itself.value["AnatomicEntityCharacteristic"], Entitytype,  jsonInner.imagingPhysicalEntityCollection);

      	//console.log("%c __ anatomic entity header after: " + JSON.stringify(jsonInner),  'background:  #8b0087; color: white; display: block;');


   }

   this.saveAnatomicEntityCharacteristic = function ( parentObject, itself, Entitytype, jsonInner) {

     
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
         }

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
                  }



                  self["save" + key](prntObject, subObject, Entitytype,  tempjson.imagingPhysicalEntityCharacteristicCollection);
                 



               }
            }
         }

         if (commentvalue !== "") {
            var lastImPhyCharColl =  tempjson.imagingPhysicalEntityCharacteristicCollection[ tempjson.imagingPhysicalEntityCharacteristicCollection.length - 1];
            lastImPhyCharColl['comment'] = { "value": commentvalue };
            commentvalue = "";
         }

      }
       jsonInner.push(tempjson);

   }


   this.saveAllowedTerm = function (parentObject, itself, Entitytype, jsonInner) {

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

       if (!(jsonInner.hasOwnProperty("allowedterms")))
       jsonInner.allowedterms = [];
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
         }

         if (instanceAllowedTerms.hasOwnProperty("select")) {
            if (instanceAllowedTerms.select == "1") {
  				//console.log("%c each at comp itself "+JSON.stringify(instanceAllowedTerms),'background: gray; color: white; display: block;');
               //alert(parentObject.type);
               let anotconf  = "";
               if (typeof parentObject.value.selectac !== "undefined"){
                   anotconf = parentObject.value.selectac;
               }else{
                   anotconf = 0;
               }
               let jsonAllowedTerm = {
                  "typeCode": [{
                     "code": instanceAllowedTerms.codeValue,
                     "codeSystemName": instanceAllowedTerms.codingSchemeDesignator,
                     "codeSystemVersion": instanceAllowedTerms.codingSchemeVersion,
                     "iso:displayName": {
                        "value": instanceAllowedTerms.codeMeaning,
                        "xmlns:iso": "uri:iso.org:21090"
                     }
                  }],
                  "annotatorConfidence": {
                     "value": anotconf
                  },
                  "label": {
                     "value": parentObject.value.label
                  }

               };
               console.log("-------"+parentObject.value.selectac);




               for (var key in instanceAllowedTerms) {

                  if (typeof instanceAllowedTerms[key] == "object") {


                     var subObject = {
                        type: key,
                        value: instanceAllowedTerms[key]
                     }




                     //parentHolder -> each component creates it's own copy of the array and passes to the next object
                     //componentOpject is the parent object for the callee
                     //is the callee object
                     //Entitytype should be null from this point 

                     self["save" + key](prntObject, subObject, Entitytype, jsonAllowedTerm);

                  }
               }
               //console.log("%c allow "+JSON.stringify(jsonAllowedTerm),  'background: blue; color: white; display: block;');
               //jsonAllowedTerms.push(jsonAllowedTerm);
		        if (self.emptyJson(jsonAllowedTerm)){
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



   }


   this.saveValidTerm = function (parentObject, itself, Entitytype, jsonInner) {


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

      for (i = 0; i < arraySize; i++) {

         if (arrayCheck == true) {
            instanceObject = ValidTerms[i];
         } else {
            instanceObject = ValidTerms;
         }

         let prntObject = {
            type: "ValidTerm",
            value: instanceObject
         }
         if ((i == 0) && (arraySize == 1)) {

            defaultCodeValue = instanceObject.codeValue;
            defaultCodingSchemeDesignator = instanceObject.codingSchemeDesignator;
            defaultCodingSchemeVersion = instanceObject.codingSchemeVersion;
            defaultCodeMeaning = instanceObject.codeMeaning;


         } else {
            if (instanceObject.hasOwnProperty("select")) {
               if (instanceObject.select == "1") {

                  defaultCodeValue = instanceObject.codeValue;
                  defaultCodingSchemeDesignator = instanceObject.codingSchemeDesignator;
                  defaultCodingSchemeVersion = instanceObject.codingSchemeVersion;
                  defaultCodeMeaning = instanceObject.codeMeaning;

               }
            }
         }

         if (defaultCodeMeaning !== "") {
            let jsonValidTerm = {

               "code": defaultCodeMeaning,
               "codeSystemName": defaultCodingSchemeDesignator,
               "codeSystemVersion": defaultCodingSchemeVersion,
               "iso:displayName": {
                  "value": defaultCodeMeaning,
                  "xmlns:iso": "uri:iso.org:21090"
               }


            };
            jsonInner.typeCode.push(jsonValidTerm);
            defaultCodeMeaning = "";
         }


      }

      //console.log("%c valid term end  : " + JSON.stringify(jsonInner),'background: #8b0000; color: white; display: block;');

   }

   this.traverseComponentsToSave = function (o, jsonComponents) {


      let validTagListToCheck = ["QuestionType", "AnatomicEntity", "AllowedTerm"];

      let Template = o["TemplateContainer"]['Template'][0];
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
         if (arrayCheckForComponents === true)
            instanceComponent = Components[i];
         else
            instanceComponent = Components;

         let componentObject = {
            type: "Component",
            value: instanceComponent
         }



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

            if (typeof (instanceComponent[keyorder[counter]]) == "object") {

               let subObject = {
                  type: keyorder[counter],
                  value: instanceComponent[keyorder[counter]]
               }

               //parentHolder -> each component creates it's own copy of the array and passes to the next object
               //componentOpject is the parent object for the callee
               //is the callee object
               //Entitytype is used if the allowed term is connected directly to the component to define image or physical entity etc..

               try {

                  self["save" + keyorder[counter]](componentObject, subObject, Entitytype, jsonInner);

               }
               catch (err) {
                  //Block of code to handle errors
               }



            }

         }
          //console.log("%c ____each comp json:" + JSON.stringify(jsonInner),'background: #a75d4d; color: white; display: block;');
         if (Object.keys(jsonInner).length>0){
         				jsonParent.innerjsons.push(jsonInner);
         				jsonInner = {};
         }
        

      }


      jsonComponents.innerjsons = jsonParent.innerjsons;

      //console.log("beforechanging afer json jsonComponents:"+JSON.stringify(jsonComponents));
      return jsonComponents;

   }


   this.saveAim = function () {

      //console.log("____________save aim : self.jsonTemplateCopy"+JSON.stringify(self.jsonTemplateCopy));
      var jsonComponents = {};
      var finaljson = {};
      var mainHolder = [];

      jsonComponents = self.traverseComponentsToSave(self.jsonTemplateCopy, jsonComponents);
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
      finaljson.name =  { value: self.aimName } ;
      finaljson.comment = { value: self.aimComment } ;
      finaljson.modality =  { value: self.aimType } ;


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
                           eachInnerJson[nextComptype].push(eachInnerJson["allowedterms"][n]);
                        } else {
                           var innerkeys = Object.keys(eachInnerJson[nextComptype][0]);

                           if (innerkeys.length == 0) {

                           } else {
                              if ((innerkeys[0] == "ImagingPhysicalEntityCharacteristicCollection") || ("imagingObservationCharacteristicCollection")) {
                                 var tempMergeJsons = {};
                                 tempMergeJsons = eachInnerJson[nextComptype][0];
                                 Object.assign(tempMergeJsons, eachInnerJson["allowedterms"][directATlength - 1]);
                              } else {
                                 eachInnerJson[nextComptype].push(eachInnerJson["allowedterms"][directATlength - 1]);
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
            if (typeof eachInnerJson['imagingObservationEntityCollection'] !=="undefined"){
               eachImOB = eachInnerJson['imagingObservationEntityCollection'];
                if (mapFinalJsonTags.get("imagingObservationEntityCollection")) {
                  if ((eachImOB != "") && (typeof  eachImOB != "undefined")) {
                    //console.log("%c !!!! each comp json: final has it" + JSON.stringify(eachImOB),'background: #ffbb33; color: white; display: block;');
                     var mergeJson = [];
                      //console.log("push "+eachImOB);
                     mergeJson= (finaljson['imagingObservationEntityCollection']).concat(eachImOB);
                     //console.log("merge json "+JSON.stringify(mergeJson));
                     finaljson['imagingObservationEntityCollection'] = [...mergeJson];
                     eachImOB = "";
                  }
               } else {
                  if ((eachImOB != "") && ( typeof eachImOB != "undefined")) {
                      //console.log("%c !!!! each comp json:final empty" + JSON.stringify(eachImOB),'background: #ffbb33; color: white; display: block;');
                     finaljson["imagingObservationEntityCollection"] = eachInnerJson['imagingObservationEntityCollection'] ;
                     mapFinalJsonTags.set("imagingObservationEntityCollection",1);
                       //console.log("################ after  adding to final json  finaljson was empty:"+JSON.stringify(finaljson));
                     eachImOB = "";
                  }
               }

            }
            

         }
         if (eachInnerJson.hasOwnProperty("imagingPhysicalEntityCollection")) {
            if (typeof eachInnerJson['imagingPhysicalEntityCollection'] !="undefined"){
               eachImPhy = eachInnerJson['imagingPhysicalEntityCollection'];
                              if (mapFinalJsonTags.get("imagingPhysicalEntityCollection")) {

                  if ((eachImPhy != "") && (typeof eachImPhy != "undefined")) {
                     var mergeJson = {};
                     mergeJson = finaljson['imagingPhysicalEntityCollection'].concat(eachImPhy);
                     finaljson['imagingPhysicalEntityCollection'] = mergeJson;
                     eachImPhy = "";
                  }

               } else {
                  //var temp 
                 if ((eachImPhy != "") && (typeof eachImPhy != "undefined")) {
                     finaljson["imagingPhysicalEntityCollection"] =  eachInnerJson['imagingPhysicalEntityCollection'] ;
                     mapFinalJsonTags.set("imagingPhysicalEntityCollection",1);
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
     
      return finaljson;

   }
   this.addButtonsDiv = function (divforbuttons) {

      self.divHolderForButtons = divforbuttons;


   }
   this.addButtons = function (parentDiv) {

      let saveButton = document.createElement('Button');
      let saveButtonText = document.createTextNode("save");
      saveButton.appendChild(saveButtonText);
      saveButton.onclick = function () {

         var savedAimJson = self.saveAim();
         //console.log("  Returning json to react after saving :"+(JSON.stringify(savedAimJson)));
      }
      let loadButton = document.createElement('Button');
      let loadButtonText = document.createTextNode("load");
      loadButton.appendChild(loadButtonText);
      loadButton.onclick = function () {
         /*presaved aims variables
            recistSavedAim
            aimjsonBeauLieuBoneTemplate_rev18
         */
         self.loadAimJson(recist_resaved);

      }

      parentDiv.appendChild(saveButton);
      parentDiv.appendChild(loadButton);

      if (self.divHolderForButtons != null)
         parentDiv.appendChild(self.divHolderForButtons);

   };

   this.turnAllRedtoGreencheck = function () {

      var objs = document.getElementsByTagName("i");

      for (var i = 0; i < objs.length; i++) {

         if (objs[i].className == "red check circle outline icon")
            objs[i].className = "green check circle outline icon"

      }

   }
   this.checkFormSaveReady = function () {
      var countRedCircle = 0;
      var objs = document.getElementsByTagName("i");

      for (var i = 0; i < objs.length; i++) {

         if (objs[i].className == "red check circle outline icon")
            countRedCircle++;

      }
      return countRedCircle;
   }

   this.checkAnnotationShapes = function(prmtrShapeArray){
          
            //self.templateShapeArray.push({"shape":object.GeometricShape, "domid" : object.id});
            let prmtrShapeArrayLength = prmtrShapeArray.length();
            for (let k = 0 ; k< prmtrShapeArrayLength; k++){
               // this.mapShapesSchemaToTemplate.set("TwoDimensionMultiPoint", [{"formshape" : 'Line'}, {"formshape" : 'Perpendicular'}]);
                let jsonShapeObj = this.mapShapesSchemaToTemplate.get(prmtrShapeArray[k]);
                if (Array.isArray(jsonShapeObj)){
                     let templateShapeArrayLength = self.templateShapeArray.length();
                     for (let t = 0 ; t< templateShapeArrayLength; t++){
                         for (let j = 0 ; j< jsonShapeObj.length; j++){
                           if (self.templateShapeArray[t].shape === jsonShapeObj[j].formshape ){
                               document.getElementById(self.templateShapeArray[t].domid).className = "green check circle outline icon";
                           }
                        }
                     }
                }else{
                     let templateShapeArrayLength = self.templateShapeArray.length();
                     for (let t = 0 ; t< templateShapeArrayLength; t++){
                        if (self.templateShapeArray[t].shape === jsonShapeObj.formshape ){
                            document.getElementById(self.templateShapeArray[t].domid).className = "green check circle outline icon";
                        }
                     }
                }

            }
      //document.getElementById( object.id).className = "green check circle outline icon";

   }

   this.setAim = function (aimValue) {
      self.textXml = aimValue;
   }

   this.checkIfCommentRequired = function (object, parentDiv) {
      if (object.hasOwnProperty("requireComment")) {
         if (object.requireComment == "true") {
            let annoCommentDomid = (object.label).replace(/[`~!@# $%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, '');
            self.mapLabelSubComment.set(annoCommentDomid, annoCommentDomid);
            self.mapLabelCommentJson.set(annoCommentDomid, object);//changing
            //console.log("comment true"+object.label);

            var req = document.createElement('div');
            var label = document.createElement('label');
            label.textContent = "component comment";

            //console.log("coment for subs"+JSON.stringify(object));
            let textaDomObject = document.createElement("textarea");
            textaDomObject.id = 'comment' + object.label;
            textaDomObject.onkeyup = function () {

               object.commentSelect = this.value;

            }


            req.appendChild(textaDomObject);
            parentDiv.appendChild(req);
            req.className = 'requiredcomment';


         }

      }
   }

   this.traverseJsonOnLoad = function (jsonObj) {

      if (jsonObj !== null && typeof jsonObj == "object") {
         Object.entries(jsonObj).forEach(([key, value]) => {

            if (key === "CharacteristicQuantification") {


               $('#Select' + value.label.value).dropdown('set selected', [value.valueLabel.value]);

            }
            if (key === "typeCode") {


               //console.log("type code load : "+ JSON.stringify(value));
               var docElement = document.getElementById(value[0].code);
                //console.log("type code load : docElement"+ JSON.stringify(docElement));
               if (docElement != null) {
                  var parentDiv = docElement.parentNode;
                  
                  if (typeof parentDiv[0] != "undefined") {


                     var crop = parentDiv[0].name;
                     crop = (crop).replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>/ /\{\}\[\]\\\/]/gi, '');

                     var prDiv = document.getElementById("Drop" + crop);
                     var subDivs = prDiv.getElementsByTagName("div");

                     var splittedLabel = docElement.label.split("-");
                     $(subDivs[0]).addClass("disabled");
                     $(subDivs[0]).dropdown('set selected', [splittedLabel[1]]);
                     $(subDivs[0]).removeClass("disabled");



                  } else {
                     if (docElement.checked != true) {
                        docElement.click();
                        //docElement.checked = true;
                     }


                  }
               }




            }
            if (key === "annotatorConfidence") {
               if (jsonObj.hasOwnProperty("label")) {

                  let annotatorConflabel = (jsonObj['label']['value']).replace(/[`~!@# $%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, '');
                  let returnAnnotConfDomId = self.mapLabelAnnotatorConfidence.get(annotatorConflabel);

                  if (typeof returnAnnotConfDomId != "undefined") {
                     //console.log("Annotator condifidence section:"+annotatorConflabel);
                     //console.log("Annotator condifidence value:"+jsonObj['annotatorConfidence']['value']);
                     let showannoConfDomid = "range" + annotatorConflabel;
                     document.getElementById(returnAnnotConfDomId).value = value.value * 100;
                     document.getElementById(showannoConfDomid).value = value.value * 100;
                     let annotconfJson = self.mapLabelAnnotConfJson.get(annotatorConflabel);
                     annotconfJson.selectac = value.value;
                  }



               }

            }
            if (key === "comment") {
               if (jsonObj.hasOwnProperty("label")) {

                  let commentLabel = (jsonObj['label']['value']).replace(/[`~!@# $%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, '');
                  let returnCommentLabel = self.mapLabelSubComment.get(commentLabel);
                  if (typeof returnCommentLabel != "undefined") {
                     let commentJson = self.mapLabelCommentJson.get(commentLabel);
                     document.getElementById("comment" + jsonObj['label']['value']).value = value.value;
                     commentJson.commentSelect = value.value;
                  }

               }
            }

            if (key === "uniqueIdentifier") {
               //alert("uid"+jsonObj['label']['value']);
               //alert(jsonObj['typeCode']['code']);
               let uid = value.root;
               let code = jsonObj['typeCode']['code'];
               let label = jsonObj['label']['value'];
               let commentLabel = (label).replace(/[`~!@# $%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, '');
               self.mapLabelUid.set(code, { "uid": uid, "label": label });

            }

            self.traverseJsonOnLoad(value);
         });
      }
      else {

      }

   }

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
   this.loadAimJson = function (aimjson) {
      //console.log("____________load aim json :"+JSON.stringify(aimjson));
      //var ImageAnnotation = aimjson.imageAnnotations.ImageAnnotationCollection.imageAnnotations.ImageAnnotation;

      var templateIndex = self.mapTemplateCodeValueByIndex.get(aimjson.typeCode.code);
      if (typeof templateIndex === "undefined"){
         return 1;
      }else{
      self.templateSelect.selectedIndex = templateIndex + 1;
       let evObj = document.createEvent('Events');
         evObj.initEvent("change", true, true);
         self.templateSelect.dispatchEvent(evObj);
      var imagingObservationEntityCollection = aimjson.imagingObservationEntityCollection;
      var imagingPhysicalEntityCollection = aimjson.imagingPhysicalEntityCollection;
      //console.log("xxxx_"+JSON.stringify(imagingObservationEntityCollection))
      var comment = aimjson.comment.value;
      var annotationName = aimjson.name.value;

     // console.log("comment" + comment);
     // console.log("comment" + annotationName);
      if (comment.includes("~")){
        
          var commentArray = comment.split("~~");
         document.getElementById("comment").value = commentArray[1];
         self.aimComment = commentArray[1];
         var modality = commentArray[0].split("/");
         self.aimType = modality[0];
      }else{
        
          document.getElementById("comment").value = comment;
         self.aimComment = comment;
         self.aimType = "";
      }
     
      if (annotationName.includes("~")){
        
         var annotationNameArray = annotationName.split("~");
         document.getElementById("annotationName").value = annotationNameArray[0];
         self.aimName = annotationNameArray[0];
      }else{
         
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

   }
   
   this.addUid = function (jsonobj) {

            for (var key in jsonobj) {
               let innerjsonlength = jsonobj[key].length;
               if (innerjsonlength > 0) {
                  let inobjcounter = 0;
                  for (inobjcounter; inobjcounter < innerjsonlength; inobjcounter++) {
                     if ((jsonobj[key][inobjcounter].hasOwnProperty("label"))) {

                        let valueJson = self.mapLabelUid.get(jsonobj[key][inobjcounter]['typeCode']['code']);
                        if ((typeof valueJson !== "undefined")) {
                           jsonobj[key][inobjcounter].uniqueIdentifier = { "root": valueJson.uid };
                        } else {
                           jsonobj[key][inobjcounter].uniqueIdentifier = { "root": uid() };
                        }


                     }
                  }
               }

            }
   }

   this.replaceTagNamingHierarchy = function(aimJson){
      let tempJson ={};
      let tempSubJson ={};
      let tempSubTwoJson ={};
       if (aimJson.hasOwnProperty("imagingPhysicalEntityCollection")) {
         tempJson = aimJson['imagingPhysicalEntityCollection'];
            
            //first check if there are chrachteristics under imagingPhysicalEntityCollection
           
            for (let i = 0 ; i < tempJson.length ; i++){
                if (tempJson[i].hasOwnProperty("imagingPhysicalCharachteristicCollection")) {
                  tempSubJson = tempJson[i]['imagingPhysicalCharachteristicCollection'];
                  
                   for (let k = 0 ; k < tempSubJson.length ; k++){
                         if (tempSubJson[k].hasOwnProperty("characteristicQuantificationCollection")) {
                              tempSubTwoJson = tempSubJson[k]['characteristicQuantificationCollection'];
                              delete tempSubJson[k].characteristicQuantificationCollection ; 
                              tempSubJson[k].characteristicQuantificationCollection = {"CharacteristicQuantification" : tempSubTwoJson[0]};

                         }

                   }

                  delete tempJson[i].imagingPhysicalCharachteristicCollection ; 
                  tempJson[i].imagingPhysicalCharachteristicCollection = {"imagingPhysicalCharacteristic" : tempSubJson};
                }
            }

            delete aimJson.imagingPhysicalEntityCollection ;
            aimJson.imagingPhysicalEntityCollection = {"ImagingPhysicalEntity" : tempJson};
            //console.log("%c %%% _ temp json _ %%%% " + JSON.stringify(tempJson),'background: #453dc2; color: white; display: block;');
       }
       if (aimJson.hasOwnProperty("imagingObservationEntityCollection")) {

         tempJson = aimJson['imagingObservationEntityCollection'];
            
            //first check if there are chrachteristics under imagingPhysicalEntityCollection

            for (let i = 0 ; i < tempJson.length ; i++){
                if (tempJson[i].hasOwnProperty("imagingObservationCharachteristicCollection")) {
                  tempSubJson = tempJson[i]['imagingObservationCharachteristicCollection'];
                  
                   for (let k = 0 ; k < tempSubJson.length ; k++){
                         if (tempSubJson[k].hasOwnProperty("characteristicQuantificationCollection")) {
                              tempSubTwoJson = tempSubJson[k]['characteristicQuantificationCollection'];
                              delete tempSubJson[k].characteristicQuantificationCollection ; 
                              tempSubJson[k].characteristicQuantificationCollection = {"CharacteristicQuantification" : tempSubTwoJson[0]};

                         }

                   }

                  delete tempJson[i].imagingObservationCharachteristicCollection ; 
                  tempJson[i].imagingObservationCharachteristicCollection = {"ImagingObservationCharacteristic" : tempSubJson};
                }
            }

            delete aimJson.imagingObservationEntityCollection ;
            aimJson.imagingObservationEntityCollection = {"ImagingObservationEntity" : tempJson};
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
   }



   this.printMap = function (varmap) {
      //console.log("Printing map------------------------------------------");
      for (var [key, value] of varmap) {
         //console.log("______"+key + ' = ' + JSON.stringify(value));

      }
   }

   constructor();
}

//uid function needs to be imported from main library

function uid() {
   let uid = "2.25." + Math.floor(1 + Math.random() * 9);
   for (let index = 0; index < 38; index++) {
      uid = uid + Math.floor(Math.random() * 10);
   }
   return uid;
}
 



//epad build templates below
export var Recist = {
  "TemplateContainer": {
    "xmlns": "gme://caCORE.caCORE/3.2/edu.northwestern.radiology.AIMTemplate",
    "xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
    "authors": "The AIM team",
    "creationDate": "2011-07-10",
    "description": "This template is used to collect annotations for RECIST evaluation",
    "name": "VK Template",
    "uid": "2.25.4369054530523.1305416222607.217635711999",
    "version": "1",
    "xsi:schemaLocation": "gme://caCORE.caCORE/3.2/edu.northwestern.radiology.AIMTemplate AIMTemplate_v2rv13.xsd",
    "Template": [
      {
        "authors": "epaduser",
        "codeMeaning": "Tumor assessment",
        "codeValue": "RECIST",
        "codingSchemeDesignator": "99EPAD",
        "codingSchemeVersion": "1",
        "creationDate": "2011-11-16",
        "description": "Template used for RECIST measurements",
        "name": "RECIST",
        "uid": "2.25.158009446295858919844005670982612161979.0",
        "version": "1.1",
        "Component": [
          {
            "authors": "epaduser",
            "explanatoryText": "Anatomic Location of lesion",
            "id": "2.25.4369054531089.1305416223173.217635712047",
            "itemNumber": 1,
            "label": "Location",
            "maxCardinality": 1,
            "minCardinality": 1,
            "shouldDisplay": true,
            "AnatomicEntity": {
              "annotatorConfidence": false
            },
            "AllowedTerm": [
              {
                "codeMeaning": "liver",
                "codeValue": "RID58",
                "codingSchemeDesignator": "RadLex"
              },
              {
                "codeMeaning": "pancreas",
                "codeValue": "RID170",
                "codingSchemeDesignator": "RadLex"
              },
              {
                "codeMeaning": "spleen",
                "codeValue": "RID86",
                "codingSchemeDesignator": "RadLex"
              },
              {
                "codeMeaning": "left lung",
                "codeValue": "RID1326",
                "codingSchemeDesignator": "RadLex"
              },
              {
                "codeMeaning": "right lung",
                "codeValue": "RID1302",
                "codingSchemeDesignator": "RadLex"
              },
              {
                "codeMeaning": "left upper lobe",
                "codeValue": "RID1327",
                "codingSchemeDesignator": "RadLex"
              },
              {
                "codeMeaning": "left lower lob",
                "codeValue": "RID1338",
                "codingSchemeDesignator": "RadLex"
              },
              {
                "codeMeaning": "right upper lobe",
                "codeValue": "RID1303",
                "codingSchemeDesignator": "RadLex"
              },
              {
                "codeMeaning": "right middle lobe",
                "codeValue": "RID1310",
                "codingSchemeDesignator": "RadLex"
              },
              {
                "codeMeaning": "right lower lobe",
                "codeValue": "RID1315",
                "codingSchemeDesignator": "RadLex"
              },
              {
                "codeMeaning": "left kidney",
                "codeValue": "RID29663",
                "codingSchemeDesignator": "RadLex"
              },
              {
                "codeMeaning": "right kidney",
                "codeValue": "RID29662",
                "codingSchemeDesignator": "RadLex"
              },
              {
                "codeMeaning": "brain",
                "codeValue": "RID6434",
                "codingSchemeDesignator": "RadLex"
              },
              {
                "codeMeaning": "peritoneal cavity",
                "codeValue": "RID397",
                "codingSchemeDesignator": "RadLex"
              },
              {
                "codeMeaning": "retroperitoneum",
                "codeValue": "RID431",
                "codingSchemeDesignator": "RadLex"
              },
              {
                "codeMeaning": "left adrenal gland",
                "codeValue": "RID30325",
                "codingSchemeDesignator": "RadLex"
              },
              {
                "codeMeaning": "right adrenal gland",
                "codeValue": "RID30324",
                "codingSchemeDesignator": "RadLex"
              },
              {
                "codeMeaning": "bladder",
                "codeValue": "RID237",
                "codingSchemeDesignator": "RadLex"
              },
              {
                "codeMeaning": "bone",
                "codeValue": "RID13197",
                "codingSchemeDesignator": "RadLex"
              },
              {
                "codeMeaning": "gallbladder",
                "codeValue": "RID187",
                "codingSchemeDesignator": "RadLex"
              },
              {
                "codeMeaning": "gastrointestinal tract",
                "codeValue": "RID94",
                "codingSchemeDesignator": "RadLex"
              },
              {
                "codeMeaning": "lymph node",
                "codeValue": "RID13296",
                "codingSchemeDesignator": "RadLex"
              },
              {
                "codeMeaning": "omentum",
                "codeValue": "RID29251",
                "codingSchemeDesignator": "RadLex"
              },
              {
                "codeMeaning": "left ovary",
                "codeValue": "RID32830",
                "codingSchemeDesignator": "RadLex"
              },
              {
                "codeMeaning": "right ovary",
                "codeValue": "RID32829",
                "codingSchemeDesignator": "RadLex"
              },
              {
                "codeMeaning": "pelvic cavity",
                "codeValue": "RID2617",
                "codingSchemeDesignator": "RadLex"
              },
              {
                "codeMeaning": "uterus",
                "codeValue": "RID302",
                "codingSchemeDesignator": "RadLex"
              },
              {
                "codeMeaning": "prostate",
                "codeValue": "RID343",
                "codingSchemeDesignator": "RadLex"
              }
            ]
          },
          {
            "authors": "epaduser",
            "explanatoryText": "Mass",
            "id": "2.25.4369054531658.1305416223742.217635712095",
            "itemNumber": 2,
            "label": "Lesion",
            "maxCardinality": 1,
            "minCardinality": 1,
            "shouldDisplay": true,
            "ImagingObservation": {
              "annotatorConfidence": false,
              "ImagingObservationCharacteristic": [
                {
                  "annotatorConfidence": false,
                  "authors": "epaduser",
                  "explanatoryText": "Type of lesion",
                  "id": "2.25.4369054532228.1305416224313.217635712143",
                  "itemNumber": 1,
                  "label": "Type",
                  "maxCardinality": 1,
                  "minCardinality": 1,
                  "shouldDisplay": true,
                  "AllowedTerm": [
                    {
                      "codeMeaning": "target",
                      "codeValue": "S71",
                      "codingSchemeDesignator": "99EPAD"
                    },
                    {
                      "codeMeaning": "non-target",
                      "codeValue": "S72",
                      "codingSchemeDesignator": "99EPAD"
                    },
                    {
                      "codeMeaning": "new lesion",
                      "codeValue": "S73",
                      "codingSchemeDesignator": "99EPAD"
                    },
                    {
                      "codeMeaning": "resolved lesion",
                      "codeValue": "S74",
                      "codingSchemeDesignator": "99EPAD"
                    }
                  ]
                }
              ]
            },
            "AllowedTerm": [
              {
                "codeMeaning": "Lesion Baseline Evaluation",
                "codeValue": "S81",
                "codingSchemeDesignator": "99EPAD"
              },
              {
                "codeMeaning": "Lesion Followup Evaluation",
                "codeValue": "S82",
                "codingSchemeDesignator": "99EPAD"
              }
            ]
          },
          {
            "authors": "epaduser",
            "explanatoryText": "Anatomic Status of cancer lesion",
            "id": "2.25.4369054532800.1305416224885.217635712191",
            "itemNumber": 3,
            "label": "Status",
            "maxCardinality": 1,
            "minCardinality": 1,
            "shouldDisplay": true,
            "AnatomicEntity": {
              "annotatorConfidence": false
            },
            "AllowedTerm": [
              {
                "codeMeaning": "tracked",
                "codeValue": "S83",
                "codingSchemeDesignator": "99EPAD"
              },
              {
                "codeMeaning": "not tracked",
                "codeValue": "S84",
                "codingSchemeDesignator": "99EPAD"
              }
            ]
          }
        ]
      }
    ]
  }
}


//export next variable for react

export var Recist_v2 = {
  "TemplateContainer": {
    "xmlns": "gme://caCORE.caCORE/3.2/edu.northwestern.radiology.AIMTemplate",
    "xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
    "authors": "The AIM team",
    "creationDate": "2011-07-10",
    "description": "This template is used to collect annotations for RECIST evaluation",
    "name": "VK Template",
    "uid": "2.25.5886507345423505656941688371593170234",
    "version": "1",
    "xsi:schemaLocation": "gme://caCORE.caCORE/3.2/edu.northwestern.radiology.AIMTemplate AIMTemplate_v2rv13.xsd",
    "Template": [
      {
        "authors": "epaduser",
        "codeMeaning": "Tumor assessment",
        "codeValue": "RECIST_v2",
        "codingSchemeDesignator": "99EPAD",
        "codingSchemeVersion": "1",
        "creationDate": "2011-11-16",
        "description": "Template used for RECIST measurements",
        "name": "RECIST_v2",
        "uid": "2.25.141271156393828040465219830221796293521",
        "version": "1.1",
        "Component": [
          {
            "authors": "epaduser",
            "explanatoryText": "Anatomic Location of lesion",
            "id": "2.25.4369054531089.1305416223173.217635712047",
            "itemNumber": 1,
            "label": "Location",
            "maxCardinality": 2,
            "minCardinality": 1,
            "shouldDisplay": true,
            "AnatomicEntity": {
              "annotatorConfidence": false
            },
            "AllowedTerm": [
              {
                "codeMeaning": "liver",
                "codeValue": "RID58",
                "codingSchemeDesignator": "RadLex"
              },
              {
                "codeMeaning": "pancreas",
                "codeValue": "RID170",
                "codingSchemeDesignator": "RadLex"
              },
              {
                "codeMeaning": "spleen",
                "codeValue": "RID86",
                "codingSchemeDesignator": "RadLex"
              },
              {
                "codeMeaning": "pleura",
                "codeValue": "RID1362",
                "codingSchemeDesignator": "RadLex"
              },
              {
                "codeMeaning": "pleural effusion",
                "codeValue": "RID34539",
                "codingSchemeDesignator": "RadLex"
              },
              {
                "codeMeaning": "left lung",
                "codeValue": "RID1326",
                "codingSchemeDesignator": "RadLex"
              },
              {
                "codeMeaning": "right lung",
                "codeValue": "RID1302",
                "codingSchemeDesignator": "RadLex"
              },
              {
                "codeMeaning": "left upper lobe",
                "codeValue": "RID1327",
                "codingSchemeDesignator": "RadLex"
              },
              {
                "codeMeaning": "left lower lobe",
                "codeValue": "RID1338",
                "codingSchemeDesignator": "RadLex"
              },
              {
                "codeMeaning": "right upper lobe",
                "codeValue": "RID1303",
                "codingSchemeDesignator": "RadLex"
              },
              {
                "codeMeaning": "right middle lobe",
                "codeValue": "RID1310",
                "codingSchemeDesignator": "RadLex"
              },
              {
                "codeMeaning": "right lower lobe",
                "codeValue": "RID1315",
                "codingSchemeDesignator": "RadLex"
              },
              {
                "codeMeaning": "middle lobe of lung",
                "codeValue": "RID1310",
                "codingSchemeDesignator": "RadLex"
              },
              {
                "codeMeaning": "lung",
                "codeValue": "RID1301",
                "codingSchemeDesignator": "RadLex"
              },
              {
                "codeMeaning": "left kidney",
                "codeValue": "RID29663",
                "codingSchemeDesignator": "RadLex"
              },
              {
                "codeMeaning": "right kidney",
                "codeValue": "RID29662",
                "codingSchemeDesignator": "RadLex"
              },
              {
                "codeMeaning": "kidney",
                "codeValue": "RID205",
                "codingSchemeDesignator": "RadLex"
              },
              {
                "codeMeaning": "brain",
                "codeValue": "RID6434",
                "codingSchemeDesignator": "RadLex"
              },
              {
                "codeMeaning": "peritoneal cavity",
                "codeValue": "RID397",
                "codingSchemeDesignator": "RadLex"
              },
              {
                "codeMeaning": "retroperitoneum",
                "codeValue": "RID431",
                "codingSchemeDesignator": "RadLex"
              },
              {
                "codeMeaning": "left adrenal gland",
                "codeValue": "RID30325",
                "codingSchemeDesignator": "RadLex"
              },
              {
                "codeMeaning": "right adrenal gland",
                "codeValue": "RID30324",
                "codingSchemeDesignator": "RadLex"
              },
              {
                "codeMeaning": "adrenal gland",
                "codeValue": "RID88",
                "codingSchemeDesignator": "RadLex"
              },
              {
                "codeMeaning": "bladder",
                "codeValue": "RID237",
                "codingSchemeDesignator": "RadLex"
              },
              {
                "codeMeaning": "bone",
                "codeValue": "RID13197",
                "codingSchemeDesignator": "RadLex"
              },
              {
                "codeMeaning": "gallbladder",
                "codeValue": "RID187",
                "codingSchemeDesignator": "RadLex"
              },
              {
                "codeMeaning": "gastrointestinal tract",
                "codeValue": "RID94",
                "codingSchemeDesignator": "RadLex"
              },
              {
                "codeMeaning": "lymph node",
                "codeValue": "RID13296",
                "codingSchemeDesignator": "RadLex"
              },
              {
                "codeMeaning": "omentum",
                "codeValue": "RID29251",
                "codingSchemeDesignator": "RadLex"
              },
              {
                "codeMeaning": "left ovary",
                "codeValue": "RID32830",
                "codingSchemeDesignator": "RadLex"
              },
              {
                "codeMeaning": "right ovary",
                "codeValue": "RID32829",
                "codingSchemeDesignator": "RadLex"
              },
              {
                "codeMeaning": "ovary",
                "codeValue": "RID290",
                "codingSchemeDesignator": "RadLex"
              },
              {
                "codeMeaning": "pelvic cavity",
                "codeValue": "RID2617",
                "codingSchemeDesignator": "RadLex"
              },
              {
                "codeMeaning": "pelvis",
                "codeValue": "RID2507",
                "codingSchemeDesignator": "RadLex"
              },
              {
                "codeMeaning": "uterus",
                "codeValue": "RID302",
                "codingSchemeDesignator": "RadLex"
              },
              {
                "codeMeaning": "vagina",
                "codeValue": "RID325",
                "codingSchemeDesignator": "RadLex"
              },
              {
                "codeMeaning": "prostate",
                "codeValue": "RID343",
                "codingSchemeDesignator": "RadLex"
              },
              {
                "codeMeaning": "bone marrow",
                "codeValue": "RID38594",
                "codingSchemeDesignator": "RadLex"
              },
              {
                "codeMeaning": "colon",
                "codeValue": "RID31011",
                "codingSchemeDesignator": "RadLex"
              },
              {
                "codeMeaning": "esophagus",
                "codeValue": "RID95",
                "codingSchemeDesignator": "RadLex"
              },
              {
                "codeMeaning": "breast",
                "codeValue": "RID28749",
                "codingSchemeDesignator": "RadLex"
              },
              {
                "codeMeaning": "mediastinum",
                "codeValue": "RID1384",
                "codingSchemeDesignator": "RadLex"
              },
              {
                "codeMeaning": "peritoneum",
                "codeValue": "RID410",
                "codingSchemeDesignator": "RadLex"
              },
              {
                "codeMeaning": "rectum",
                "codeValue": "RID163",
                "codingSchemeDesignator": "RadLex"
              },
              {
                "codeMeaning": "skin",
                "codeValue": "RID34290",
                "codingSchemeDesignator": "RadLex"
              },
              {
                "codeMeaning": "thyroid gland",
                "codeValue": "RID7578",
                "codingSchemeDesignator": "RadLex"
              },
              {
                "codeMeaning": "tonsil",
                "codeValue": "RID34854",
                "codingSchemeDesignator": "RadLex"
              },
              {
                "codeMeaning": "small intestine",
                "codeValue": "RID132",
                "codingSchemeDesignator": "RadLex"
              },
              {
                "codeMeaning": "undefined organ",
                "codeValue": "S99",
                "codingSchemeDesignator": "99EPAD"
              },
              {
                "codeMeaning": "neck",
                "codeValue": "RID7488",
                "codingSchemeDesignator": "Radlex"
              },
              {
                "codeMeaning": "perineum",
                "codeValue": "RID396",
                "codingSchemeDesignator": "Radlex"
              },
              {
                "codeMeaning": "anal canal",
                "codeValue": "RID32691",
                "codingSchemeDesignator": "RadLex"
              },
              {
                "codeMeaning": "anus",
                "codeValue": "RID164",
                "codingSchemeDesignator": "RadLex"
              },
              {
                "codeMeaning": "appendix",
                "codeValue": "RID168",
                "codingSchemeDesignator": "RadLex"
              },
              {
                "codeMeaning": "cecum",
                "codeValue": "RID154",
                "codingSchemeDesignator": "RadLex"
              },
              {
                "codeMeaning": "duodenum",
                "codeValue": "RID134",
                "codingSchemeDesignator": "RadLex"
              },
              {
                "codeMeaning": "cervical part of esophagus",
                "codeValue": "RID31553",
                "codingSchemeDesignator": "RadLex"
              },
              {
                "codeMeaning": "left uterine tube",
                "codeValue": "RID30346",
                "codingSchemeDesignator": "RadLex"
              },
              {
                "codeMeaning": "right uterine tube",
                "codeValue": "RID30345",
                "codingSchemeDesignator": "RadLex"
              },
              {
                "codeMeaning": "uterine tube",
                "codeValue": "RID295",
                "codingSchemeDesignator": "RadLex"
              },
              {
                "codeMeaning": "adipose tissue",
                "codeValue": "RID29380",
                "codingSchemeDesignator": "RadLex"
              },
              {
                "codeMeaning": "aortic valve",
                "codeValue": "RID1394",
                "codingSchemeDesignator": "RadLex"
              },
              {
                "codeMeaning": "apex of heart",
                "codeValue": "RID29225",
                "codingSchemeDesignator": "RadLex"
              },
              {
                "codeMeaning": "left atrial appendage",
                "codeValue": "RID1391",
                "codingSchemeDesignator": "RadLex"
              },
              {
                "codeMeaning": "right atrial appendage",
                "codeValue": "RID1388",
                "codingSchemeDesignator": "RadLex"
              },
              {
                "codeMeaning": "left atrium",
                "codeValue": "RID1390",
                "codingSchemeDesignator": "RadLex"
              },
              {
                "codeMeaning": "right atrium",
                "codeValue": "RID1387",
                "codingSchemeDesignator": "RadLex"
              },
              {
                "codeMeaning": "interventricular septum",
                "codeValue": "RID1404",
                "codingSchemeDesignator": "RadLex"
              },
              {
                "codeMeaning": "mitral valve",
                "codeValue": "RID1395",
                "codingSchemeDesignator": "RadLex"
              },
              {
                "codeMeaning": "pulmonic valve",
                "codeValue": "RID1396",
                "codingSchemeDesignator": "RadLex"
              },
              {
                "codeMeaning": "tricuspid valve",
                "codeValue": "RID1397",
                "codingSchemeDesignator": "RadLex"
              },
              {
                "codeMeaning": "left ventricle",
                "codeValue": "RID1392",
                "codingSchemeDesignator": "RadLex"
              },
              {
                "codeMeaning": "right ventricle",
                "codeValue": "RID1389",
                "codingSchemeDesignator": "RadLex"
              },
              {
                "codeMeaning": "heart",
                "codeValue": "RID1385",
                "codingSchemeDesignator": "RadLex"
              },
              {
                "codeMeaning": "mesentery",
                "codeValue": "RID33180",
                "codingSchemeDesignator": "RadLex"
              },
              {
                "codeMeaning": "musculature of back",
                "codeValue": "RID32802",
                "codingSchemeDesignator": "RadLex"
              },
              {
                "codeMeaning": "muscle of lower limb",
                "codeValue": "RID39054",
                "codingSchemeDesignator": "RadLex"
              },
              {
                "codeMeaning": "psoas muscle",
                "codeValue": "RID2624",
                "codingSchemeDesignator": "RadLex"
              },
              {
                "codeMeaning": "rectus abdominis",
                "codeValue": "RID31610",
                "codingSchemeDesignator": "RadLex"
              },
              {
                "codeMeaning": "muscle of pectoral girdle",
                "codeValue": "RID39501",
                "codingSchemeDesignator": "RadLex"
              },
              {
                "codeMeaning": "external anal sphincter",
                "codeValue": "RID39061",
                "codingSchemeDesignator": "RadLex"
              },
              {
                "codeMeaning": "anal sphincter ",
                "codeValue": "RID165",
                "codingSchemeDesignator": "RadLex"
              },
              {
                "codeMeaning": "skeletal muscle of thigh",
                "codeValue": "RID2694",
                "codingSchemeDesignator": "RadLex"
              },
              {
                "codeMeaning": "muscle of thorax",
                "codeValue": "RID39497",
                "codingSchemeDesignator": "RadLex"
              },
              {
                "codeMeaning": "muscle of upper limb",
                "codeValue": "RID39053",
                "codingSchemeDesignator": "RadLex"
              },
              {
                "codeMeaning": "musculature",
                "codeValue": "RID32753",
                "codingSchemeDesignator": "RadLex"
              },
              {
                "codeMeaning": "paranasal sinus",
                "codeValue": "RID9554",
                "codingSchemeDesignator": "RadLex"
              },
              {
                "codeMeaning": "nasal vestibule",
                "codeValue": "RID9544",
                "codingSchemeDesignator": "RadLex"
              },
              {
                "codeMeaning": "naris",
                "codeValue": "RID10030",
                "codingSchemeDesignator": "RadLex"
              },
              {
                "codeMeaning": "orbital cavity",
                "codeValue": "RID35751",
                "codingSchemeDesignator": "RadLex"
              },
              {
                "codeMeaning": "major duodenal papilla",
                "codeValue": "RID30091",
                "codingSchemeDesignator": "RadLex"
              },
              {
                "codeMeaning": "minor duodenal papilla",
                "codeValue": "RID30092",
                "codingSchemeDesignator": "RadLex"
              },
              {
                "codeMeaning": "penis",
                "codeValue": "RID362",
                "codingSchemeDesignator": "RadLex"
              },
              {
                "codeMeaning": "pericardium",
                "codeValue": "RID1407",
                "codingSchemeDesignator": "RadLex"
              },
              {
                "codeMeaning": "rectal ampulla",
                "codeValue": "RID32521",
                "codingSchemeDesignator": "RadLex"
              },
              {
                "codeMeaning": "seminal vesicle",
                "codeValue": "RID357",
                "codingSchemeDesignator": "RadLex"
              },
              {
                "codeMeaning": "terminal ileum",
                "codeValue": "RID151",
                "codingSchemeDesignator": "RadLex"
              },
              {
                "codeMeaning": "ileum",
                "codeValue": "RID150",
                "codingSchemeDesignator": "RadLex"
              },
              {
                "codeMeaning": "jejunum",
                "codeValue": "RID148",
                "codingSchemeDesignator": "RadLex"
              },
              {
                "codeMeaning": "wall of abdomen",
                "codeValue": "RID30014",
                "codingSchemeDesignator": "RadLex"
              },
              {
                "codeMeaning": "spinal cord",
                "codeValue": "RID7361",
                "codingSchemeDesignator": "RadLex"
              },
              {
                "codeMeaning": "antrum of stomach",
                "codeValue": "RID119",
                "codingSchemeDesignator": "RadLex"
              },
              {
                "codeMeaning": "body of stomach",
                "codeValue": "RID117",
                "codingSchemeDesignator": "RadLex"
              },
              {
                "codeMeaning": "gastric cardia",
                "codeValue": "RID115",
                "codingSchemeDesignator": "RadLex"
              },
              {
                "codeMeaning": "gastric fundus",
                "codeValue": "RID116",
                "codingSchemeDesignator": "RadLex"
              },
              {
                "codeMeaning": "greater curvature of stomach",
                "codeValue": "RID124",
                "codingSchemeDesignator": "RadLex"
              },
              {
                "codeMeaning": "lesser curvature of stomach",
                "codeValue": "RID125",
                "codingSchemeDesignator": "RadLex"
              },
              {
                "codeMeaning": "pyloric canal",
                "codeValue": "RID30332",
                "codingSchemeDesignator": "RadLex"
              },
              {
                "codeMeaning": "stomach",
                "codeValue": "RID114",
                "codingSchemeDesignator": "RadLex"
              },
              {
                "codeMeaning": "left testis",
                "codeValue": "RID38997",
                "codingSchemeDesignator": "RadLex"
              },
              {
                "codeMeaning": "right testis",
                "codeValue": "RID38996",
                "codingSchemeDesignator": "RadLex"
              },
              {
                "codeMeaning": "testis",
                "codeValue": "RID366",
                "codingSchemeDesignator": "RadLex"
              },
              {
                "codeMeaning": "transverse fold of rectum",
                "codeValue": "RID33647",
                "codingSchemeDesignator": "RadLex"
              },
              {
                "codeMeaning": "left ureter",
                "codeValue": "RID30845",
                "codingSchemeDesignator": "RadLex"
              },
              {
                "codeMeaning": "right ureter",
                "codeValue": "RID30844",
                "codingSchemeDesignator": "RadLex"
              },
              {
                "codeMeaning": "ureter",
                "codeValue": "RID229",
                "codingSchemeDesignator": "RadLex"
              },
              {
                "codeMeaning": "vulva",
                "codeValue": "RID272",
                "codingSchemeDesignator": "RadLex"
              }
            ]
          },
          {
            "authors": "epaduser",
            "id": "2.25.4369054531658.1305416223742.217635712095",
            "itemNumber": 2,
            "label": "Lesion Quality",
            "maxCardinality": 3,
            "minCardinality": 1,
            "shouldDisplay": true,
            "ImagingObservation": {
              "annotatorConfidence": false,
              "ImagingObservationCharacteristic": [
                {
                  "annotatorConfidence": false,
                  "authors": "epaduser",
                  "explanatoryText": "Timepoint of lesion",
                  "id": "2.25.4369054532228.1305416224313.217635712143",
                  "itemNumber": 1,
                  "label": "Timepoint",
                  "maxCardinality": 1,
                  "minCardinality": 1,
                  "shouldDisplay": true,
                  "AllowedTerm": [
                    {
                      "codeMeaning": "FU Number (0=Baseline)",
                      "codeValue": "S90",
                      "codingSchemeDesignator": "99EPAD",
                      "codingSchemeVersion": "1",
                      "CharacteristicQuantification": [
                        {
                          "annotatorConfidence": false,
                          "characteristicQuantificationIndex": 0,
                          "name": "Timepoint",
                          "Scale": {
                            "scaleType": "Nominal",
                            "ScaleLevel": [
                              {
                                "value": "0",
                                "valueDescription": "T0",
                                "valueLabel": "Baseline"
                              },
                              {
                                "value": "1",
                                "valueDescription": "T1",
                                "valueLabel": "FU1"
                              },
                              {
                                "value": "2",
                                "valueDescription": "T2",
                                "valueLabel": "FU2"
                              },
                              {
                                "value": "3",
                                "valueDescription": "T3",
                                "valueLabel": "FU3"
                              },
                              {
                                "value": "4",
                                "valueDescription": "T4",
                                "valueLabel": "FU4"
                              },
                              {
                                "value": "5",
                                "valueDescription": "T5",
                                "valueLabel": "FU5"
                              },
                              {
                                "value": "6",
                                "valueDescription": "T6",
                                "valueLabel": "FU6"
                              },
                              {
                                "value": "7",
                                "valueDescription": "T7",
                                "valueLabel": "FU7"
                              },
                              {
                                "value": "8",
                                "valueDescription": "T8",
                                "valueLabel": "FU8"
                              },
                              {
                                "value": "9",
                                "valueDescription": "T9",
                                "valueLabel": "FU9"
                              },
                              {
                                "value": "10",
                                "valueDescription": "T10",
                                "valueLabel": "FU10"
                              },
                              {
                                "value": "11",
                                "valueDescription": "T11",
                                "valueLabel": "FU11"
                              },
                              {
                                "value": "12",
                                "valueDescription": "T12",
                                "valueLabel": "FU12"
                              },
                              {
                                "value": "13",
                                "valueDescription": "T13",
                                "valueLabel": "FU13"
                              },
                              {
                                "value": "14",
                                "valueDescription": "T14",
                                "valueLabel": "FU14"
                              },
                              {
                                "value": "15",
                                "valueDescription": "T15",
                                "valueLabel": "FU15"
                              },
                              {
                                "value": "16",
                                "valueDescription": "T16",
                                "valueLabel": "FU16"
                              },
                              {
                                "value": "17",
                                "valueDescription": "T17",
                                "valueLabel": "FU17"
                              },
                              {
                                "value": "18",
                                "valueDescription": "T18",
                                "valueLabel": "FU18"
                              },
                              {
                                "value": "19",
                                "valueDescription": "T19",
                                "valueLabel": "FU19"
                              },
                              {
                                "value": "20",
                                "valueDescription": "T20",
                                "valueLabel": "FU20"
                              },
                              {
                                "value": "21",
                                "valueDescription": "T21",
                                "valueLabel": "FU21"
                              },
                              {
                                "value": "22",
                                "valueDescription": "T22",
                                "valueLabel": "FU22"
                              },
                              {
                                "value": "23",
                                "valueDescription": "T23",
                                "valueLabel": "FU23"
                              },
                              {
                                "value": "24",
                                "valueDescription": "T24",
                                "valueLabel": "FU24"
                              },
                              {
                                "value": "25",
                                "valueDescription": "T25",
                                "valueLabel": "FU25"
                              },
                              {
                                "value": "26",
                                "valueDescription": "T26",
                                "valueLabel": "FU26"
                              },
                              {
                                "value": "27",
                                "valueDescription": "T27",
                                "valueLabel": "FU27"
                              },
                              {
                                "value": "28",
                                "valueDescription": "T28",
                                "valueLabel": "FU28"
                              },
                              {
                                "value": "29",
                                "valueDescription": "T29",
                                "valueLabel": "FU29"
                              }
                            ]
                          }
                        }
                      ]
                    }
                  ]
                },
                {
                  "annotatorConfidence": false,
                  "authors": "epaduser",
                  "explanatoryText": "Type of lesion",
                  "id": "2.25.4369054532228.1305416224313.217635712143",
                  "itemNumber": 2,
                  "label": "Type",
                  "maxCardinality": 1,
                  "minCardinality": 1,
                  "shouldDisplay": true,
                  "AllowedTerm": [
                    {
                      "codeMeaning": "Target Lesion",
                      "codeValue": "S71",
                      "codingSchemeDesignator": "99EPAD",
                      "codingSchemeVersion": "1"
                    },
                    {
                      "codeMeaning": "Non-Target Lesion",
                      "codeValue": "S72",
                      "codingSchemeDesignator": "99EPAD",
                      "codingSchemeVersion": "1"
                    },
                    {
                      "codeMeaning": "Non-cancer Lesion",
                      "codeValue": "S75",
                      "codingSchemeDesignator": "99EPAD",
                      "codingSchemeVersion": "1"
                    }
                  ]
                },
                {
                  "annotatorConfidence": false,
                  "authors": "epaduser",
                  "explanatoryText": "Status of lesion",
                  "id": "2.25.436905441089.13054168484973.21324571207",
                  "itemNumber": 3,
                  "label": "Lesion Status",
                  "maxCardinality": 1,
                  "minCardinality": 1,
                  "shouldDisplay": true,
                  "AllowedTerm": [
                    {
                      "codeMeaning": "Present Lesion",
                      "codeValue": "RID28472",
                      "codingSchemeDesignator": "RadLex"
                    },
                    {
                      "codeMeaning": "Progressive Lesion",
                      "codeValue": "RID39162",
                      "codingSchemeDesignator": "RadLex"
                    },
                    {
                      "codeMeaning": "New Lesion",
                      "codeValue": "S73",
                      "codingSchemeDesignator": "99EPAD",
                      "codingSchemeVersion": "1"
                    },
                    {
                      "codeMeaning": "Resolved Lesion",
                      "codeValue": "S74",
                      "codingSchemeDesignator": "99EPAD",
                      "codingSchemeVersion": "1"
                    }
                  ]
                },
                {
                  "annotatorConfidence": false,
                  "authors": "epaduser",
                  "explanatoryText": "Enhancement state of lesion",
                  "id": "2.25.436905441089.13054164543173.217634571207",
                  "itemNumber": 3,
                  "label": "Lesion Enhancement",
                  "maxCardinality": 2,
                  "minCardinality": 0,
                  "shouldDisplay": true,
                  "AllowedTerm": [
                    {
                      "codeMeaning": "Enhancing",
                      "codeValue": "RID6055",
                      "codingSchemeDesignator": "RadLex"
                    },
                    {
                      "codeMeaning": "Nonenhancing",
                      "codeValue": "RID6056",
                      "codingSchemeDesignator": "RadLex"
                    }
                  ]
                }
              ]
            },
            "AllowedTerm": [
              {
                "codeMeaning": "Evaluable",
                "codeValue": "S86",
                "codingSchemeDesignator": "99EPAD",
                "codingSchemeVersion": "1",
                "defaultAnswer": true
              },
              {
                "codeMeaning": "Nonevaluable",
                "codeValue": "RID39225",
                "codingSchemeDesignator": "Radlex"
              },
              {
                "codeMeaning": "added test",
                "codeValue": "RID39220",
                "codingSchemeDesignator": "Radlex"
              }
            ]
          }
        ]
      }
    ]
  }
}

export var recist_resaved = {
  "name": {
    "value": "Lesion1"
  },
  "comment": {
    "value": "cav"
  },
  "modality": {
    "value": ""
  },
  "imagingPhysicalEntityCollection": {
    "ImagingPhysicalEntity": [
      {
        "typeCode": [{
          "code": "RID170",
          "codeSystemName": "RadLex",
          "iso:displayName": {
            "value": "pancreas",
            "xmlns:iso": "uri:iso.org:21090"
          }
        }],
        "annotatorConfidence": {
          "value": 0
        },
        "label": {
          "value": "Location"
        },
        "uniqueIdentifier": {
          "root": "2.25.144201361142939764751820118190477731946"
        }
      },
      {
        "typeCode": [{
          "code": "RID1326",
          "codeSystemName": "RadLex",
          "iso:displayName": {
            "value": "left lung",
            "xmlns:iso": "uri:iso.org:21090"
          }
        }],
        "annotatorConfidence": {
          "value": 0
        },
        "label": {
          "value": "Location"
        },
        "uniqueIdentifier": {
          "root": "2.25.151901011596600713357754563036529313859"
        }
      },
      {
        "typeCode": [
        {
          "code": "S83",
          "codeSystemName": "99EPAD",
          "iso:displayName": {
            "value": "tracked",
            "xmlns:iso": "uri:iso.org:21090"
          }
        }
        ],
        "annotatorConfidence": {
          "value": 0
        },
        "label": {
          "value": "Status"
        },
        "uniqueIdentifier": {
          "root": "2.25.185011262315404592658616430589309417946"
        }
      }
    ]
  },
  "imagingObservationEntityCollection": {
    "ImagingObservationEntity": [
      {
        "typeCode": [{
          "code": "S81",
          "codeSystemName": "99EPAD",
          "iso:displayName": {
            "value": "Lesion Baseline Evaluation",
            "xmlns:iso": "uri:iso.org:21090"
          }
        }],
        "annotatorConfidence": {
          "value": 0
        },
        "label": {
          "value": "Lesion"
        },
        "uniqueIdentifier": {
          "root": "2.25.845877027985738848560320637038968003441"
        },
        "imagingObservationCharachteristicCollection": {
          "ImagingObservationCharacteristic": [
            {
              "typeCode": [{
                "code": "S71",
                "codeSystemName": "99EPAD",
                "iso:displayName": {
                  "value": "target",
                  "xmlns:iso": "uri:iso.org:21090"
                }
              }],
              "annotatorConfidence": {
                "value": 0
              },
              "label": {
                "value": "Type"
              }
            }
          ]
        }
      }
    ]
  },
  "typeCode":  {
            "code": "RECIST",
            "codeSystemName": "99EPAD",
            "iso:displayName": {
                "xmlns:iso": "uri:iso.org:21090",
                "value": "ROI Only"
            }
   }    
};

export var AcLivTempBealieuLiver_Template_ePad_CFB_rev18 = {
  "TemplateContainer": {
    "xmlns": "gme://caCORE.caCORE/3.2/edu.northwestern.radiology.AIMTemplate",
    "xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
    "authors": "Default User",
    "creationDate": "2013-08-15",
    "description": "Current liver template",
    "name": "Active Liver Template",
    "uid": "2.25.262327926267685184074584276827607514851",
    "version": "Active Liver 16",
    "xsi:schemaLocation": "gme://caCORE.caCORE/3.2/edu.northwestern.radiology.AIMTemplate AIMTemplate_v2rv13.xsd",
    "Template": [
      {
        "authors": "cfbeaulieu",
        "codeMeaning": "liver15",
        "codeValue": "RID58-2",
        "codingSchemeDesignator": "RadLex",
        "codingSchemeVersion": "1.0",
        "creationDate": "2013-02-10",
        "description": "Liver template.v18",
        "name": "Active Liver Template Beaulieu",
        "uid": "2.25.143518070104148940884779125624652210206",
        "version": "18",
        "Component": [
          {
            "authors": "cfbeaulieu",
            "explanatoryText": "Which hepatic lobe does the lesion mainly occupy?",
            "id": "2.25.1800391920089.536979722668.204033480007",
            "itemNumber": 1,
            "label": "Lobar Location",
            "maxCardinality": 1,
            "minCardinality": 1,
            "shouldDisplay": true,
            "AnatomicEntity": {
              "annotatorConfidence": false
            },
            "AllowedTerm": [
              {
                "codeMeaning": "liver",
                "codeValue": "RID58",
                "codingSchemeDesignator": "RadLex",
                "codingSchemeVersion": "1.0"
              },
              {
                "codeMeaning": "right lobe of liver",
                "codeValue": "RID74",
                "codingSchemeDesignator": "RadLex",
                "codingSchemeVersion": "1.0"
              },
              {
                "codeMeaning": "left lobe of liver",
                "codeValue": "RID69",
                "codingSchemeDesignator": "RadLex",
                "codingSchemeVersion": "1.0"
              },
              {
                "codeMeaning": "caudate lobe of liver",
                "codeValue": "RID77",
                "codingSchemeDesignator": "Alan",
                "codingSchemeVersion": "1.0"
              },
              {
                "codeMeaning": "anterior segment of right lobe of liver",
                "codeValue": "RID75",
                "codingSchemeDesignator": "RadLex",
                "codingSchemeVersion": "1.0"
              },
              {
                "codeMeaning": "posterior segment of right lobe of liver",
                "codeValue": "RID76",
                "codingSchemeDesignator": "RadLex",
                "codingSchemeVersion": "1.0"
              },
              {
                "codeMeaning": "lateral segment of left lobe of liver",
                "codeValue": "RID70",
                "codingSchemeDesignator": "RadLex",
                "codingSchemeVersion": "1.0"
              },
              {
                "codeMeaning": "medial segment of left lobe of liver",
                "codeValue": "RID71",
                "codingSchemeDesignator": "RadLex",
                "codingSchemeVersion": "1.0"
              }
            ]
          },
          {
            "authors": "cfbeaulieu",
            "explanatoryText": "Which hepatic segments does the annotated lesion mainly occupy?  Up to 2 choices for bridging lesions.",
            "id": "2.25.1800391920324.536979722903.204033480052",
            "itemNumber": 2,
            "label": "Segmental Location",
            "maxCardinality": 2,
            "minCardinality": 1,
            "shouldDisplay": true,
            "AnatomicEntity": {
              "annotatorConfidence": false
            },
            "AllowedTerm": [
              {
                "codeMeaning": "hepatovenous segment II",
                "codeValue": "RID62",
                "codingSchemeDesignator": "RadLex",
                "codingSchemeVersion": "1.0"
              },
              {
                "codeMeaning": "hepatovenous segment III",
                "codeValue": "RID63",
                "codingSchemeDesignator": "RadLex",
                "codingSchemeVersion": "1.0"
              },
              {
                "codeMeaning": "hepatovenous segment IVa",
                "codeValue": "RID13115",
                "codingSchemeDesignator": "RadLex",
                "codingSchemeVersion": "1.0"
              },
              {
                "codeMeaning": "hepatovenous segment IVb",
                "codeValue": "RID13116",
                "codingSchemeDesignator": "RadLex",
                "codingSchemeVersion": "1.0"
              },
              {
                "codeMeaning": "hepatovenous segment V",
                "codeValue": "RID65",
                "codingSchemeDesignator": "RadLex",
                "codingSchemeVersion": "1.0"
              },
              {
                "codeMeaning": "hepatovenous segment VI",
                "codeValue": "RID66",
                "codingSchemeDesignator": "RadLex",
                "codingSchemeVersion": "1.0"
              },
              {
                "codeMeaning": "hepatovenous segment VII",
                "codeValue": "RID67",
                "codingSchemeDesignator": "RadLex",
                "codingSchemeVersion": "1.0"
              },
              {
                "codeMeaning": "hepatovenous segment VIII",
                "codeValue": "RID68",
                "codingSchemeDesignator": "RadLex",
                "codingSchemeVersion": "1.0"
              },
              {
                "codeMeaning": "hepatovenous segment IX",
                "codeValue": "RID29230",
                "codingSchemeDesignator": "RadLex",
                "codingSchemeVersion": "1.0"
              }
            ]
          },
          {
            "authors": "cfbeaulieu",
            "explanatoryText": "Mass, normal, or geographic alteration? Almost all annotations will be for a mass.",
            "id": "2.25.1800391920560.536979723139.204033480097",
            "itemNumber": 3,
            "label": "Lesion Type",
            "maxCardinality": 1,
            "minCardinality": 1,
            "shouldDisplay": true,
            "ImagingObservation": {
              "annotatorConfidence": false,
              "ImagingObservationCharacteristic": [
                {
                  "annotatorConfidence": false,
                  "authors": "cfbeaulieu",
                  "explanatoryText": "What is the etiology of the lesion or its presumed etiology?",
                  "id": "2.25.1800391920798.536979723377.204033480142",
                  "itemNumber": 0,
                  "label": "Diagnosis",
                  "maxCardinality": 1,
                  "minCardinality": 1,
                  "shouldDisplay": true,
                  "AllowedTerm": [
                    {
                      "codeMeaning": "abscess",
                      "codeValue": "RID3711",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "angiosarcoma",
                      "codeValue": "RID3989",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "cholangiocarcinoma",
                      "codeValue": "RID4266",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "choledochal cyst",
                      "codeValue": "RID3896",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "cyst",
                      "codeValue": "RID3890",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "cystadenoma",
                      "codeValue": "RID4150",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "cystadenocarcinoma",
                      "codeValue": "RID4153",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "fibrolamellar hepatocellular carcinoma",
                      "codeValue": "RID4273",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "focal nodular hyperplasia",
                      "codeValue": "RID3778",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "fungal microabscess",
                      "codeValue": "RID45672",
                      "codingSchemeDesignator": "ISIS_LIVER"
                    },
                    {
                      "codeMeaning": "hamartoma",
                      "codeValue": "RID4335",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "hematoma",
                      "codeValue": "RID4705",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "hemangioma",
                      "codeValue": "RID3969",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "hepatoblastoma",
                      "codeValue": "RID4530",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "hepatocellular adenoma",
                      "codeValue": "RID4215",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "hepatocellular carcinoma",
                      "codeValue": "RID4271",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "hyatid cyst",
                      "codeValue": "RID34798",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "laceration",
                      "codeValue": "RID4734",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "metastasis",
                      "codeValue": "RID5231",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "regenerative nodule",
                      "codeValue": "RID3879",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "steatosis",
                      "codeValue": "RID5217",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    }
                  ]
                },
                {
                  "annotatorConfidence": false,
                  "authors": "cfbeaulieu",
                  "explanatoryText": "What is the phase of intravenous contrast enhancement, or is it a noncontrast scan?",
                  "id": "2.25.1800391921038.536979723617.204033480187",
                  "itemNumber": 1,
                  "label": "Imaging Phase",
                  "maxCardinality": 1,
                  "minCardinality": 1,
                  "shouldDisplay": true,
                  "AllowedTerm": [
                    {
                      "codeMeaning": "early arterial phase",
                      "codeValue": "RID11082",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "late arterial phase",
                      "codeValue": "RID39127",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "portal venous phase",
                      "codeValue": "RID11085",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "unenhanced phase",
                      "codeValue": "RID11086",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "equilibrium phase",
                      "codeValue": "RID39315",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "delayed phase (liver)",
                      "codeValue": "RID39437",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    }
                  ]
                },
                {
                  "annotatorConfidence": false,
                  "authors": "cfbeaulieu",
                  "explanatoryText": "How many lesions with a given diagnosis? Are there also more complex distribution patterns?  Up to 2 responses.",
                  "id": "2.25.1800391921279.536979723858.204033480232",
                  "itemNumber": 2,
                  "label": "Focality of Lesion",
                  "maxCardinality": 2,
                  "minCardinality": 1,
                  "shouldDisplay": true,
                  "AllowedTerm": [
                    {
                      "codeMeaning": "solitary lesion",
                      "codeValue": "RID43312",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "multiple lesions 1-5",
                      "codeValue": "RID43314",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "multiple lesions 6-10",
                      "codeValue": "RID43315",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "multiple lesions >10",
                      "codeValue": "RID43316",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "satellite lesions present",
                      "codeValue": "RID43317",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "coalescent",
                      "codeValue": "RID5699",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "infiltrative",
                      "codeValue": "RID6282",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "diffuse",
                      "codeValue": "RID5701",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    }
                  ]
                },
                {
                  "annotatorConfidence": false,
                  "authors": "cfbeaulieu",
                  "explanatoryText": "What is the overall shape or shapes associated with the lesion?  Up to 3 responses.",
                  "id": "2.25.1800391921521.536979724100.204033480277",
                  "itemNumber": 3,
                  "label": "Shape Descriptors",
                  "maxCardinality": 3,
                  "minCardinality": 1,
                  "shouldDisplay": true,
                  "AllowedTerm": [
                    {
                      "codeMeaning": "round",
                      "codeValue": "RID5799",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "oval",
                      "codeValue": "RID5800",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "irregular",
                      "codeValue": "RID5809",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "multilobulated",
                      "codeValue": "RID39133",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "wedge-shaped",
                      "codeValue": "RID5812",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "linear",
                      "codeValue": "RID5811",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "reticular",
                      "codeValue": "RID5902",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "septated",
                      "codeValue": "RID5907",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    }
                  ]
                },
                {
                  "annotatorConfidence": true,
                  "authors": "cfbeaulieu",
                  "explanatoryText": "How smooth or irregular is the outer lesion contour or boundary?  Do not confuse with border *defnition*.  Quantify from smooth (1) to irregular (100)",
                  "id": "2.25.1800391922007.536979724586.204033480367",
                  "itemNumber": 5,
                  "label": "Margin Contours: Smooth to Irregular",
                  "maxCardinality": 1,
                  "minCardinality": 1,
                  "shouldDisplay": true,
                  "AllowedTerm": [
                    {
                      "codeMeaning": "smooth margin",
                      "codeValue": "RID5714",
                      "codingSchemeDesignator": "ISIS_LIVER",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "moderately smooth margin",
                      "codeValue": "RID45668",
                      "codingSchemeDesignator": "ISIS_LIVER",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "neither smooth nor irregular margin",
                      "codeValue": "RID45671",
                      "codingSchemeDesignator": "ISIS_LIVER",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "moderately irregular margin",
                      "codeValue": "RID45670",
                      "codingSchemeDesignator": "ISIS_LIVER",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "irregular margin",
                      "codeValue": "RID5715",
                      "codingSchemeDesignator": "ISIS_LIVER",
                      "codingSchemeVersion": "1.0"
                    }
                  ]
                },
                {
                  "annotatorConfidence": false,
                  "authors": "cfbeaulieu",
                  "explanatoryText": "Estimate the overall lesion density given all internal components.  For the current imaging phase only.",
                  "id": "2.25.1800391922251.536979724830.204033480412",
                  "itemNumber": 6,
                  "label": "Average Lesion Density: Hypo to Hyperdense",
                  "maxCardinality": 1,
                  "minCardinality": 1,
                  "shouldDisplay": true,
                  "AllowedTerm": [
                    {
                      "codeMeaning": "hypodense",
                      "codeValue": "RID6042",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "iso to slightly hypodense",
                      "codeValue": "RID45673",
                      "codingSchemeDesignator": "ISIS_LIVER",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "isodense",
                      "codeValue": "RID6043",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "iso to slightly hyperdense",
                      "codeValue": "RID45674",
                      "codingSchemeDesignator": "ISIS_LIVER",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "hyperdense",
                      "codeValue": "RID6044",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    }
                  ]
                },
                {
                  "annotatorConfidence": false,
                  "authors": "cfbeaulieu",
                  "explanatoryText": "Is the lesion uniform (homogeneous) or nonuniform (heterogeneous) internally?",
                  "id": "2.25.1800391922496.536979725075.204033480457",
                  "itemNumber": 7,
                  "label": "Density - Homogeneous or Heterogeneous",
                  "maxCardinality": 1,
                  "minCardinality": 1,
                  "shouldDisplay": true,
                  "AllowedTerm": [
                    {
                      "codeMeaning": "homogeneous",
                      "codeValue": "RID6059",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "heterogeneous",
                      "codeValue": "RID6060",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    }
                  ]
                },
                {
                  "annotatorConfidence": false,
                  "authors": "cfbeaulieu",
                  "explanatoryText": "Does the lesion enhance with intravenous contrast?",
                  "id": "2.25.1800391922742.536979725321.204033480502",
                  "itemNumber": 8,
                  "label": "Enhancement",
                  "maxCardinality": 1,
                  "minCardinality": 1,
                  "shouldDisplay": true,
                  "AllowedTerm": [
                    {
                      "codeMeaning": "nonenhancing",
                      "codeValue": "RID6056",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "enhancing",
                      "codeValue": "RID6055",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    }
                  ]
                },
                {
                  "annotatorConfidence": false,
                  "authors": "cfbeaulieu",
                  "explanatoryText": "Only if enhancing, is the enhancement homogeneous or heterogeneous?",
                  "id": "2.25.1800391922988.536979725567.204033480547",
                  "itemNumber": 9,
                  "label": "Enhancement Uniformity",
                  "maxCardinality": 1,
                  "minCardinality": 0,
                  "shouldDisplay": true,
                  "AllowedTerm": [
                    {
                      "codeMeaning": "homogeneous enhancement",
                      "codeValue": "RID39563",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "heterogeneous enhancement",
                      "codeValue": "RID39457",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    }
                  ]
                },
                {
                  "annotatorConfidence": false,
                  "authors": "cfbeaulieu",
                  "explanatoryText": "If enhancing, what pattern(s) are observed? Choose up to 3 features.",
                  "id": "2.25.1800391923235.536979725814.204033480592",
                  "itemNumber": 10,
                  "label": "Specific Enhancement Pattern(s)",
                  "maxCardinality": 3,
                  "minCardinality": 0,
                  "shouldDisplay": true,
                  "AllowedTerm": [
                    {
                      "codeMeaning": "homogeneous internal enhancement",
                      "codeValue": "RID34421",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "central hypodensity",
                      "codeValue": "RID45722",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "target enhancement",
                      "codeValue": "RID43320",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "mottled enhancement",
                      "codeValue": "RID43321",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "reticular enhancement",
                      "codeValue": "RID34311",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "peripheral discontinuous nodular enhancement",
                      "codeValue": "RID43319",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "peripheral continuous rim enhancement",
                      "codeValue": "RID43318",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "enhancing central scar",
                      "codeValue": "RID45692",
                      "codingSchemeDesignator": "ISIS_LIVER",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "nonenhancing central scar",
                      "codeValue": "RID43326",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "incomplete rim",
                      "codeValue": "RID43291",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "thin rim",
                      "codeValue": "RID43309",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "thick rim",
                      "codeValue": "RID43308",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    }
                  ]
                },
                {
                  "annotatorConfidence": false,
                  "authors": "cfbeaulieu",
                  "explanatoryText": "On multiphasic imaging, what happens to enhancement over time?",
                  "id": "2.25.1800391923732.536979726311.204033480682",
                  "itemNumber": 11,
                  "label": "Temporal Enhancement (if known)",
                  "maxCardinality": 1,
                  "minCardinality": 0,
                  "shouldDisplay": true,
                  "AllowedTerm": [
                    {
                      "codeMeaning": "homogeneous retention",
                      "codeValue": "RID43338",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "homogeneous fade",
                      "codeValue": "RID43339",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "centripetal fill-in",
                      "codeValue": "RID43323",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "washout appearance",
                      "codeValue": "RID39486",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    }
                  ]
                },
                {
                  "annotatorConfidence": false,
                  "authors": "cfbeaulieu",
                  "explanatoryText": "If septations are present, how thick are they?  Note \"septated\" may be included as a Shape Descriptor above.",
                  "id": "2.25.1800391923483.536979726062.204033480637",
                  "itemNumber": 12,
                  "label": "Septation Thickness",
                  "maxCardinality": 1,
                  "minCardinality": 0,
                  "shouldDisplay": true,
                  "AllowedTerm": [
                    {
                      "codeMeaning": "thick septae",
                      "codeValue": "RID45676",
                      "codingSchemeDesignator": "ISIS_LIVER",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "thin septae",
                      "codeValue": "RID45675",
                      "codingSchemeDesignator": "ISIS_LIVER",
                      "codingSchemeVersion": "1.0"
                    }
                  ]
                },
                {
                  "annotatorConfidence": false,
                  "authors": "cfbeaulieu",
                  "explanatoryText": "Is the perilesional tissue normal, or is there a THAD or similar effect?",
                  "id": "2.25.1800391923982.536979726561.204033480727",
                  "itemNumber": 13,
                  "label": "Perilesional Tissue",
                  "maxCardinality": 1,
                  "minCardinality": 1,
                  "shouldDisplay": true,
                  "AllowedTerm": [
                    {
                      "codeMeaning": "perilesional perfusion alteration",
                      "codeValue": "RID43300",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "normal perilesional tissue",
                      "codeValue": "RID43298",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    }
                  ]
                },
                {
                  "annotatorConfidence": false,
                  "authors": "cfbeaulieu",
                  "explanatoryText": "Is there calcification, necrosis, central scar or other special feature(s)?  Up to 3 responses.",
                  "id": "2.25.1800391924232.536979726811.204033480772",
                  "itemNumber": 14,
                  "label": "Special Features",
                  "maxCardinality": 3,
                  "minCardinality": 0,
                  "shouldDisplay": true,
                  "AllowedTerm": [
                    {
                      "codeMeaning": "blood products (lesion)",
                      "codeValue": "RID43346",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "calcification",
                      "codeValue": "RID5196",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "central scar",
                      "codeValue": "RID43325",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "gas containing",
                      "codeValue": "RID5750",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "intralesional fat",
                      "codeValue": "RID39463",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "necrosis",
                      "codeValue": "RID5171",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "oil emulsion contrast",
                      "codeValue": "RID11598",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "parallels blood pool enhancement",
                      "codeValue": "RID39472",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "visible internal vessels",
                      "codeValue": "RID43324",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    }
                  ]
                },
                {
                  "annotatorConfidence": false,
                  "authors": "cfbeaulieu",
                  "explanatoryText": "Choose up to 3 additional features about how the lesion affects the liver.",
                  "id": "2.25.1800391924483.536979727062.204033480817",
                  "itemNumber": 15,
                  "label": "Lesion Effects on Liver",
                  "maxCardinality": 3,
                  "minCardinality": 0,
                  "shouldDisplay": true,
                  "AllowedTerm": [
                    {
                      "codeMeaning": "abuts capsule of liver",
                      "codeValue": "RID43327",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "abuts hepatic vein",
                      "codeValue": "RID43329",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "abuts portal vein",
                      "codeValue": "RID43331",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "adjacent to gallbladder",
                      "codeValue": "RID43295",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "bland thrombus in portal vein",
                      "codeValue": "RID45678",
                      "codingSchemeDesignator": "ISIS_LIVER",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "bulges capsule of liver",
                      "codeValue": "RID43328",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "obstructs biliary ducts",
                      "codeValue": "RID45679",
                      "codingSchemeDesignator": "ISIS_LIVER",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "retracts capsule of liver",
                      "codeValue": "RID45680",
                      "codingSchemeDesignator": "ISIS_LIVER",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "tumor thrombus in portal vein",
                      "codeValue": "RID45681",
                      "codingSchemeDesignator": "ISIS_LIVER",
                      "codingSchemeVersion": "1.0"
                    }
                  ]
                },
                {
                  "annotatorConfidence": false,
                  "authors": "cfbeaulieu",
                  "explanatoryText": "For lesions that are metastases, what is the primary?",
                  "id": "2.25.1800391924735.536979727314.204033480862",
                  "itemNumber": 16,
                  "label": "Primary Malignancy if Metastatic Disease",
                  "maxCardinality": 1,
                  "minCardinality": 1,
                  "shouldDisplay": true,
                  "AllowedTerm": [
                    {
                      "codeMeaning": "none",
                      "codeValue": "RID28454",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "adenoid cystic carcinoma",
                      "codeValue": "RID4227",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "breast cancer",
                      "codeValue": "RID45682",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "cervical cancer",
                      "codeValue": "RID45683",
                      "codingSchemeDesignator": "ISIS_LIVER",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "colorectal cancer",
                      "codeValue": "RID45684",
                      "codingSchemeDesignator": "ISIS_LIVER",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "endometrial cancer",
                      "codeValue": "RID45685",
                      "codingSchemeDesignator": "ISIS_LIVER",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "gastric carcinoma",
                      "codeValue": "RID4251",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "gastrointestinal stromal tumor",
                      "codeValue": "RID4551",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "lung cancer",
                      "codeValue": "RID45686",
                      "codingSchemeDesignator": "ISIS_LIVER",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "neuroendocrine neoplasm",
                      "codeValue": "RID4483",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "ovarian cancer",
                      "codeValue": "RID45687",
                      "codingSchemeDesignator": "ISIS_LIVER",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "pancreatic cancer",
                      "codeValue": "RID45688",
                      "codingSchemeDesignator": "ISIS_LIVER",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "primary unknown or other",
                      "codeValue": "RID39181",
                      "codingSchemeDesignator": "ISIS_LIVER",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "prostate cancer",
                      "codeValue": "RID45689",
                      "codingSchemeDesignator": "ISIS_LIVER",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "renal adenocarcinoma",
                      "codeValue": "RID4230",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "sarcoma",
                      "codeValue": "RID4521",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "testicular cancer",
                      "codeValue": "RID45690",
                      "codingSchemeDesignator": "ISIS_LIVER",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "thyroid cancer",
                      "codeValue": "RID45691",
                      "codingSchemeDesignator": "ISIS_LIVER",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "transitional cell carcinoma",
                      "codeValue": "RID4279",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    }
                  ]
                }
              ]
            },
            "AllowedTerm": [
              {
                "codeMeaning": "liver mass",
                "codeValue": "RID39466",
                "codingSchemeDesignator": "RadLex",
                "codingSchemeVersion": "1.0"
              }
            ]
          },
          {
            "authors": "Default User",
            "id": "2.25.260407454693500192885566124937158854189",
            "itemNumber": 3,
            "label": "Spline ROI",
            "maxCardinality": 1,
            "minCardinality": 1,
            "shouldDisplay": true,
            "GeometricShape": "Point"
          }
        ]
      }
    ]
  }
};

export var coordinationTest = {
  "TemplateContainer": {
    "xmlns": "gme://caCORE.caCORE/3.2/edu.northwestern.radiology.AIMTemplate",
    "xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
    "authors": "willrett",
    "creationDate": "2013-11-01",
    "description": "Testing Coordiantions",
    "name": "Coordination Test",
    "uid": "2.25.226786059025611331467166333882529892626777",
    "version": "1.0",
    "xsi:schemaLocation": "gme://caCORE.caCORE/3.2/edu.northwestern.radiology.AIMTemplate AIMTemplate_v2rv13.xsd",
    "Template": [
      {
        "authors": "willrett",
        "codeMeaning": "Coordination Template",
        "codeValue": "LTC",
        "codingSchemeDesignator": "CoordinationTemplate",
        "creationDate": "2013-10-31",
        "description": "Coordination Test",
        "modality": "CT",
        "name": "Coordiantion Test",
        "precedingAnnotation": "DoNotOffer",
        "templateType": "Image",
        "uid": "2.25.3117718860672205766530793354048693651257777",
        "version": "1.0",
        "Component": [
          {
            "authors": "Default User",
            "id": "2.25.87157590103780976172344716887617624858",
            "itemNumber": 1,
            "label": "Lung Nodule",
            "maxCardinality": 1,
            "minCardinality": 1,
            "shouldDisplay": true,
            "ImagingObservation": {
              "annotatorConfidence": false,
              "ImagingObservationCharacteristic": [
                {
                  "annotatorConfidence": false,
                  "authors": "Default User",
                  "id": "2.25.14296178658435596975218217235280517220",
                  "itemNumber": 1,
                  "label": "Nodule Attenuation",
                  "maxCardinality": 5,
                  "minCardinality": 1,
                  "shouldDisplay": true,
                  "AllowedTerm": [
                    {
                      "codeMeaning": "solid",
                      "codeValue": "RID5741",
                      "codingSchemeDesignator": "RadLex.3.10"
                    },
                    {
                      "codeMeaning": "ground glass",
                      "codeValue": "RID45726",
                      "codingSchemeDesignator": "RadLex.3.10"
                    },
                    {
                      "codeMeaning": "semi-consolidation",
                      "codeValue": "RID46009",
                      "codingSchemeDesignator": "RadLex.3.10"
                    },
                    {
                      "codeMeaning": "partially solid",
                      "codeValue": "RID46011",
                      "codingSchemeDesignator": "RadLex.3.10",
                      "ValidTerm": [
                        {
                          "codeMeaning": "greaterThan 5mm",
                          "codeValue": "LT2",
                          "codingSchemeDesignator": "LungTemplate"
                        }
                      ]
                    },
                    {
                      "codeMeaning": "partially solid",
                      "codeValue": "RID46011",
                      "codingSchemeDesignator": "RadLex.3.10",
                      "ValidTerm": [
                        {
                          "codeMeaning": "greaterThan 10mm",
                          "codeValue": "LT3",
                          "codingSchemeDesignator": "LungTemplate"
                        },
                        {
                          "codeMeaning": "square",
                          "codeValue": "LT5",
                          "codingSchemeDesignator": "LungTemplate"
                        }
                      ]
                    },
                    {
                      "codeMeaning": "partially solid",
                      "codeValue": "RID46011",
                      "codingSchemeDesignator": "RadLex.3.10",
                      "ValidTerm": [
                        {
                          "codeMeaning": "greaterThan 5mm",
                          "codeValue": "LT4",
                          "codingSchemeDesignator": "LungTemplate"
                        },
                        {
                          "codeMeaning": "round",
                          "codeValue": "LT6",
                          "codingSchemeDesignator": "LungTemplate"
                        }
                      ]
                    },
                    {
                      "codeMeaning": "partially solid",
                      "codeValue": "RID46011",
                      "codingSchemeDesignator": "RadLex.3.10",
                      "ValidTerm": [
                        {
                          "codeMeaning": "green",
                          "codeValue": "LT7",
                          "codingSchemeDesignator": "LungTemplate"
                        },
                        {
                          "codeMeaning": "greaterThan 10mm",
                          "codeValue": "LT3",
                          "codingSchemeDesignator": "LungTemplate"
                        }
                      ]
                    }
                  ]
                }
              ]
            },
            "AllowedTerm": [
              {
                "codeMeaning": " lung mass",
                "codeValue": "RID39056",
                "codingSchemeDesignator": "RadLex3.8",
                "defaultAnswer": true,
                "ValidTerm": [
                  {
                    "codeMeaning": "greaterThan 5mm",
                    "codeValue": "LT4",
                    "codingSchemeDesignator": "LungTemplate"
                  },
                  {
                    "codeMeaning": "round",
                    "codeValue": "LT6",
                    "codingSchemeDesignator": "LungTemplate"
                  }
                ]
              },
              {
                "codeMeaning": " other",
                "codeValue": "RID39057",
                "codingSchemeDesignator": "debra",
                "defaultAnswer": false,
                "ValidTerm": [
                  {
                    "codeMeaning": "greaterThan 5mm",
                    "codeValue": "LT4",
                    "codingSchemeDesignator": "LungTemplate"
                  },
                  {
                    "codeMeaning": "round",
                    "codeValue": "LT6",
                    "codingSchemeDesignator": "LungTemplate"
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  }
};
export var Desmoid_Tumor_Template_Rev1_1 = {
  "TemplateContainer": {
    "xmlns": "gme://caCORE.caCORE/3.2/edu.northwestern.radiology.AIMTemplate",
    "xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
    "authors": "Chris Beaulieu",
    "creationDate": "2016-03-25",
    "description": "Template Group for Soft Tissue Tumors",
    "name": "Soft Tissue Tumor",
    "uid": "2.25.243405785262040347419281839931878662612",
    "version": "1.0",
    "xsi:schemaLocation": "gme://caCORE.caCORE/3.2/edu.northwestern.radiology.AIMTemplate AIMTemplate_v2rv13.xsd",
    "Template": [
      {
        "authors": "Chris Beaulieu ",
        "codeMeaning": "Bones Jones - Beaulieu",
        "codeValue": "v 002B",
        "codingSchemeDesignator": "RadLex",
        "codingSchemeVersion": "1.0",
        "creationDate": "2012-01-05",
        "description": "Template for annotation of Desmoid Tumors on MRI",
        "name": "Desmoid Tumor Template Rev1",
        "precedingAnnotation": "OfferToSelect",
        "uid": "2.25.39264994946316101151378559254532888109",
        "version": "1.0",
        "Component": [
          {
            "authors": "Default Author",
            "id": "2.25.189194458228658898162435061968203142813",
            "itemNumber": 0,
            "label": "Geometric Shape",
            "maxCardinality": 1,
            "minCardinality": 0,
            "shouldDisplay": true,
            "GeometricShape": "Polyline"
          },
          {
            "authors": "Default Author",
            "explanatoryText": "Tumor location",
            "id": "2.25.221526230049005467254544758680599896266",
            "itemNumber": 1,
            "label": "Location",
            "maxCardinality": 1,
            "minCardinality": 1,
            "shouldDisplay": true,
            "AnatomicEntity": {
              "annotatorConfidence": false
            },
            "AllowedTerm": [
              {
                "codeMeaning": "0 Intra-abdominal",
                "codeValue": "D038",
                "codingSchemeDesignator": "Erasmus",
                "codingSchemeVersion": "1.0"
              },
              {
                "codeMeaning": "1 Extra-abdominal",
                "codeValue": "D039",
                "codingSchemeDesignator": "Erasmus",
                "codingSchemeVersion": "1.0"
              },
              {
                "codeMeaning": "2 Upper extremity",
                "codeValue": "D040",
                "codingSchemeDesignator": "Erasmus",
                "codingSchemeVersion": "1.0"
              },
              {
                "codeMeaning": "3 Lower extremity",
                "codeValue": "D041",
                "codingSchemeDesignator": "Erasmus",
                "codingSchemeVersion": "1.0"
              }
            ]
          },
          {
            "authors": "Default User",
            "id": "2.25.310444775948556391542463804549917945634",
            "itemNumber": 2,
            "label": "Margin",
            "maxCardinality": 1,
            "minCardinality": 1,
            "shouldDisplay": true,
            "ImagingObservation": {
              "annotatorConfidence": false
            },
            "AllowedTerm": [
              {
                "codeMeaning": "0 Well-defined margin",
                "codeValue": "D001",
                "codingSchemeDesignator": "Erasmus",
                "codingSchemeVersion": "1.0"
              },
              {
                "codeMeaning": "1 Partially ill-defined margin",
                "codeValue": "D002",
                "codingSchemeDesignator": "Erasmus",
                "codingSchemeVersion": "1.0"
              },
              {
                "codeMeaning": "2 Ill-defined margin",
                "codeValue": "D003",
                "codingSchemeDesignator": "Erasmus",
                "codingSchemeVersion": "1.0"
              }
            ]
          },
          {
            "authors": "Default User",
            "id": "2.25.309726280825410711096442039233271164266",
            "itemNumber": 3,
            "label": "Contour",
            "maxCardinality": 1,
            "minCardinality": 1,
            "shouldDisplay": true,
            "ImagingObservation": {
              "annotatorConfidence": false
            },
            "AllowedTerm": [
              {
                "codeMeaning": "0 Lobulated contour",
                "codeValue": "D004",
                "codingSchemeDesignator": "Erasmus",
                "codingSchemeVersion": "1.0"
              },
              {
                "codeMeaning": "1 Circumscribed contour",
                "codeValue": "D005",
                "codingSchemeDesignator": "Erasmus",
                "codingSchemeVersion": "1.0"
              },
              {
                "codeMeaning": "2 Irregular contour",
                "codeValue": "D006",
                "codingSchemeDesignator": "Erasmus",
                "codingSchemeVersion": "1.0"
              }
            ]
          },
          {
            "authors": "Default User",
            "id": "2.25.189285988495077206103073397690861677053",
            "itemNumber": 4,
            "label": "Split Fat Sign",
            "maxCardinality": 1,
            "minCardinality": 1,
            "shouldDisplay": true,
            "ImagingObservation": {
              "annotatorConfidence": false
            },
            "AllowedTerm": [
              {
                "codeMeaning": "0 No split fat",
                "codeValue": "D007",
                "codingSchemeDesignator": "Erasmus",
                "codingSchemeVersion": "1.0"
              },
              {
                "codeMeaning": "2 Yes split fat",
                "codeValue": "D008",
                "codingSchemeDesignator": "Erasmus",
                "codingSchemeVersion": "1.0"
              }
            ]
          },
          {
            "authors": "Default User",
            "id": "2.25.236756184847835311704061767422241492036",
            "itemNumber": 5,
            "label": "Extra-Compartmental Extension",
            "maxCardinality": 1,
            "minCardinality": 1,
            "shouldDisplay": true,
            "ImagingObservation": {
              "annotatorConfidence": false
            },
            "AllowedTerm": [
              {
                "codeMeaning": "0 No extracompt extension",
                "codeValue": "D009",
                "codingSchemeDesignator": "Erasmus",
                "codingSchemeVersion": "1.0"
              },
              {
                "codeMeaning": "1 Yes extracompt extension",
                "codeValue": "D010",
                "codingSchemeDesignator": "Erasmus",
                "codingSchemeVersion": "1.0"
              }
            ]
          },
          {
            "authors": "Default User",
            "id": "2.25.306409962038169819218039321478271625703",
            "itemNumber": 6,
            "label": "Infiltrative Border",
            "maxCardinality": 2,
            "minCardinality": 1,
            "shouldDisplay": true,
            "ImagingObservation": {
              "annotatorConfidence": false
            },
            "AllowedTerm": [
              {
                "codeMeaning": "0 No infiltrative border",
                "codeValue": "D011",
                "codingSchemeDesignator": "Erasmus",
                "codingSchemeVersion": "1.0"
              },
              {
                "codeMeaning": "1 Yes infiltrative border",
                "codeValue": "D012",
                "codingSchemeDesignator": "Erasmus",
                "codingSchemeVersion": "1.0"
              }
            ]
          },
          {
            "authors": "Default User",
            "id": "2.25.166069257346762368135816929225775779624",
            "itemNumber": 7,
            "label": "Bone Involvement",
            "maxCardinality": 1,
            "minCardinality": 1,
            "shouldDisplay": true,
            "ImagingObservation": {
              "annotatorConfidence": false
            },
            "AllowedTerm": [
              {
                "codeMeaning": "0 No bone involvement",
                "codeValue": "D013",
                "codingSchemeDesignator": "Erasmus",
                "codingSchemeVersion": "1.0"
              },
              {
                "codeMeaning": "1 Yes bone involvement",
                "codeValue": "D014",
                "codingSchemeDesignator": "Erasmus",
                "codingSchemeVersion": "1.0"
              }
            ]
          },
          {
            "authors": "Default Author",
            "id": "2.25.181411278763008325661496683410085837351",
            "itemNumber": 8,
            "label": "Bone Destruction",
            "maxCardinality": 1,
            "minCardinality": 1,
            "shouldDisplay": true,
            "ImagingObservation": {
              "annotatorConfidence": false
            },
            "AllowedTerm": [
              {
                "codeMeaning": "0 No bone destruction",
                "codeValue": "D015",
                "codingSchemeDesignator": "Erasmus",
                "codingSchemeVersion": "1.0"
              },
              {
                "codeMeaning": "1 Yes bone destruction",
                "codeValue": "D016",
                "codingSchemeDesignator": "Erasmus",
                "codingSchemeVersion": "1.0"
              }
            ]
          },
          {
            "authors": "Default User",
            "id": "2.25.121732821011254109299521056340217692746",
            "itemNumber": 9,
            "label": "Neurovascular Involvement",
            "maxCardinality": 1,
            "minCardinality": 1,
            "shouldDisplay": true,
            "ImagingObservation": {
              "annotatorConfidence": false
            },
            "AllowedTerm": [
              {
                "codeMeaning": "0 No neurovascular involvement",
                "codeValue": "D017",
                "codingSchemeDesignator": "Erasmus",
                "codingSchemeVersion": "1.0"
              },
              {
                "codeMeaning": "1 Yes neurovascular involvement",
                "codeValue": "D018",
                "codingSchemeDesignator": "Erasmus",
                "codingSchemeVersion": "1.0"
              }
            ]
          },
          {
            "authors": "Default User",
            "id": "2.25.166069257346762368135816929225775779624",
            "itemNumber": 10,
            "label": "Encasement",
            "maxCardinality": 1,
            "minCardinality": 1,
            "shouldDisplay": true,
            "ImagingObservation": {
              "annotatorConfidence": false
            },
            "AllowedTerm": [
              {
                "codeMeaning": "1 0-90 degree encasement",
                "codeValue": "D034",
                "codingSchemeDesignator": "Erasmus",
                "codingSchemeVersion": "1.0"
              },
              {
                "codeMeaning": "2 91-180 degree encasement",
                "codeValue": "D035",
                "codingSchemeDesignator": "Erasmus",
                "codingSchemeVersion": "1.0"
              },
              {
                "codeMeaning": "3 181-270 degree encasement",
                "codeValue": "D036",
                "codingSchemeDesignator": "Erasmus",
                "codingSchemeVersion": "1.0"
              },
              {
                "codeMeaning": "4 271-360 degree encasement",
                "codeValue": "D037",
                "codingSchemeDesignator": "Erasmus",
                "codingSchemeVersion": "1.0"
              }
            ]
          },
          {
            "authors": "Default User",
            "id": "2.25.166069257346762368135816929225775779624",
            "itemNumber": 11,
            "label": "MRI T1 Signal",
            "maxCardinality": 1,
            "minCardinality": 1,
            "shouldDisplay": true,
            "ImagingObservation": {
              "annotatorConfidence": false
            },
            "AllowedTerm": [
              {
                "codeMeaning": "0 T1 low SI c/w muscle",
                "codeValue": "D019",
                "codingSchemeDesignator": "Erasmus",
                "codingSchemeVersion": "1.0"
              },
              {
                "codeMeaning": "1 T1 iso SI c/w muscle",
                "codeValue": "D020",
                "codingSchemeDesignator": "Erasmus",
                "codingSchemeVersion": "1.0"
              },
              {
                "codeMeaning": "2 T1 high SI c/w muscle",
                "codeValue": "D021",
                "codingSchemeDesignator": "Erasmus",
                "codingSchemeVersion": "1.0"
              }
            ]
          },
          {
            "authors": "Default Author",
            "id": "2.25.92521815917170150074736637229081584301",
            "itemNumber": 12,
            "label": "MRI T2 Signal",
            "maxCardinality": 1,
            "minCardinality": 1,
            "shouldDisplay": true,
            "ImagingObservation": {
              "annotatorConfidence": false
            },
            "AllowedTerm": [
              {
                "codeMeaning": "0 T2 low SI c/w muscle",
                "codeValue": "D022",
                "codingSchemeDesignator": "Erasmus",
                "codingSchemeVersion": "1.0"
              },
              {
                "codeMeaning": "1 T2 iso SI c/w muscle",
                "codeValue": "D023",
                "codingSchemeDesignator": "Erasmus",
                "codingSchemeVersion": "1.0"
              },
              {
                "codeMeaning": "2 T2 high SI c/w muscle",
                "codeValue": "D024",
                "codingSchemeDesignator": "Erasmus",
                "codingSchemeVersion": "1.0"
              }
            ]
          },
          {
            "authors": "Default Author",
            "id": "2.25.323407831278615396256848897771729779087",
            "itemNumber": 13,
            "label": "MRI Heterogeneity",
            "maxCardinality": 1,
            "minCardinality": 1,
            "shouldDisplay": true,
            "ImagingObservation": {
              "annotatorConfidence": false
            },
            "AllowedTerm": [
              {
                "codeMeaning": "0 Homogeneous",
                "codeValue": "D025",
                "codingSchemeDesignator": "Erasmus",
                "codingSchemeVersion": "1.0"
              },
              {
                "codeMeaning": "1 Heterogeneous",
                "codeValue": "D026",
                "codingSchemeDesignator": "Erasmus",
                "codingSchemeVersion": "1.0"
              }
            ]
          },
          {
            "authors": "Default Author",
            "id": "2.25.240305355707272962796980482168289729653",
            "itemNumber": 14,
            "label": "Non-enhancing Low SI Band",
            "maxCardinality": 1,
            "minCardinality": 1,
            "shouldDisplay": true,
            "ImagingObservation": {
              "annotatorConfidence": false
            },
            "AllowedTerm": [
              {
                "codeMeaning": "0 No non-enhancing bands",
                "codeValue": "D032",
                "codingSchemeDesignator": "Erasmus",
                "codingSchemeVersion": "1.0"
              },
              {
                "codeMeaning": "1 Yes non-enhancing bands",
                "codeValue": "D033",
                "codingSchemeDesignator": "Erasmus",
                "codingSchemeVersion": "1.0"
              }
            ]
          },
          {
            "authors": "Default Author",
            "id": "2.25.82399029268408846190480521733460498439",
            "itemNumber": 15,
            "label": "Internal Signal Void",
            "maxCardinality": 1,
            "minCardinality": 1,
            "shouldDisplay": true,
            "ImagingObservation": {
              "annotatorConfidence": false
            },
            "AllowedTerm": [
              {
                "codeMeaning": "0 No internal signal void",
                "codeValue": "D027",
                "codingSchemeDesignator": "Erasmus",
                "codingSchemeVersion": "1.0"
              },
              {
                "codeMeaning": "1 Yes internal signal void",
                "codeValue": "D028",
                "codingSchemeDesignator": "Erasmus",
                "codingSchemeVersion": "1.0"
              }
            ]
          },
          {
            "authors": "Default Author",
            "id": "2.25.248177537227277564507730025427918693848",
            "itemNumber": 16,
            "label": "Enhancement",
            "maxCardinality": 1,
            "minCardinality": 1,
            "shouldDisplay": true,
            "ImagingObservation": {
              "annotatorConfidence": false
            },
            "AllowedTerm": [
              {
                "codeMeaning": "0 No enhancement",
                "codeValue": "D029",
                "codingSchemeDesignator": "Erasmus",
                "codingSchemeVersion": "1.0"
              },
              {
                "codeMeaning": "1 Partial enhancement",
                "codeValue": "D030",
                "codingSchemeDesignator": "Erasmus",
                "codingSchemeVersion": "1.0"
              },
              {
                "codeMeaning": "2 Complete enhancement",
                "codeValue": "D031",
                "codingSchemeDesignator": "Erasmus",
                "codingSchemeVersion": "1.0"
              }
            ]
          }
        ]
      }
    ]
  }
};
export var lungnodulefeaturesv2 = {
  "TemplateContainer": {
    "xmlns": "gme://caCORE.caCORE/3.2/edu.northwestern.radiology.AIMTemplate",
    "xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
    "authors": "Ann Leung and Deni Aberle",
    "creationDate": "2013-11-01",
    "description": "Template describing features of lung nodules",
    "name": "Lung Nodule V2",
    "uid": "2.25.22678605902561133146716633388252989262677",
    "version": "1.0",
    "xsi:schemaLocation": "gme://caCORE.caCORE/3.2/edu.northwestern.radiology.AIMTemplate AIMTemplate_v2rv13.xsd",
    "Template": [
      {
        "authors": "Ann Leung, Deni Aberle, Daniel Rubin",
        "codeMeaning": "Lung Template",
        "codeValue": "LTtest77777777",
        "codingSchemeDesignator": "LungTemplate",
        "creationDate": "2013-10-31",
        "description": "Lung cancer tameplate for descibing lung cancers",
        "modality": "CT",
        "name": "Lung Nodule Features V2",
        "precedingAnnotation": "DoNotOffer",
        "templateType": "Image",
        "uid": "2.25.31177188606722057665307933540486936512577",
        "version": "1.0",
        "Component": [
          {
            "authors": "Default User",
            "id": "2.25.140176464195137397956100227930935538072",
            "itemNumber": 0,
            "label": "Anatomic Location",
            "maxCardinality": 1,
            "minCardinality": 1,
            "shouldDisplay": true,
            "AnatomicEntity": {
              "annotatorConfidence": false
            },
            "AllowedTerm": [
              {
                "codeMeaning": "upper lobe of right lung",
                "codeValue": "RID1303",
                "codingSchemeDesignator": "RadLex",
                "codingSchemeVersion": "1.0"
              },
              {
                "codeMeaning": "middle lobe of right lung",
                "codeValue": "RID1310",
                "codingSchemeDesignator": "RadLex_3.9.1"
              },
              {
                "codeMeaning": "lower lobe of right lung",
                "codeValue": "RID1315",
                "codingSchemeDesignator": "RadLex_3.9.1"
              },
              {
                "codeMeaning": "upper lobe of left lung",
                "codeValue": "RID1327",
                "codingSchemeDesignator": "RadLex_3.9.1"
              }
            ]
          },
          {
            "authors": "Default User",
            "id": "2.25.87157590103780976172344716887617624858",
            "itemNumber": 1,
            "label": "Lung Nodule",
            "maxCardinality": 1,
            "minCardinality": 1,
            "shouldDisplay": true,
            "ImagingObservation": {
              "annotatorConfidence": false,
              "ImagingObservationCharacteristic": [
                {
                  "annotatorConfidence": false,
                  "authors": "Default User",
                  "id": "2.25.14296178658435596975218217235280517220",
                  "itemNumber": 1,
                  "label": "Nodule Attenuation",
                  "maxCardinality": 1,
                  "minCardinality": 1,
                  "shouldDisplay": true,
                  "AllowedTerm": [
                    {
                      "codeMeaning": "solid",
                      "codeValue": "RID5741",
                      "codingSchemeDesignator": "RadLex.3.10"
                    },
                    {
                      "codeMeaning": "partially solid",
                      "codeValue": "RID46011",
                      "codingSchemeDesignator": "RadLex.3.10",
                      "ValidTerm": [
                        {
                          "codeMeaning": "Solid lessOrEqual 5mm",
                          "codeValue": "LT2",
                          "codingSchemeDesignator": "LungTemplate"
                        }
                      ]
                    },
                    {
                      "codeMeaning": "partially solid",
                      "codeValue": "RID46011",
                      "codingSchemeDesignator": "RadLex.3.10",
                      "ValidTerm": [
                        {
                          "codeMeaning": "Solid greaterThan 5mm",
                          "codeValue": "LT3",
                          "codingSchemeDesignator": "LungTemplate"
                        }
                      ]
                    }
                  ]
                },
                {
                  "annotatorConfidence": false,
                  "authors": "Default User",
                  "id": "2.25.86591728618943540706650681612583222798",
                  "itemNumber": 2,
                  "label": "Nodule Associated Findings",
                  "maxCardinality": 1,
                  "minCardinality": 1,
                  "shouldDisplay": true,
                  "AllowedTerm": [
                    {
                      "codeMeaning": "entering airway",
                      "codeValue": "RID46035",
                      "codingSchemeDesignator": "RadLex.3.10"
                    },
                    {
                      "codeMeaning": "bronchovascular bundle",
                      "codeValue": "RID46020",
                      "codingSchemeDesignator": "RadLex.3.10",
                      "ValidTerm": [
                        {
                          "codeMeaning": "thickened",
                          "codeValue": "RID5914",
                          "codingSchemeDesignator": "RadLex3.10_NS"
                        }
                      ]
                    },
                    {
                      "codeMeaning": "vascular convergence",
                      "codeValue": "RID46036",
                      "codingSchemeDesignator": "RadLex.3.10"
                    },
                    {
                      "codeMeaning": "septal thickening",
                      "codeValue": "RID46021",
                      "codingSchemeDesignator": "RadLex.3.10"
                    }
                  ]
                },
                {
                  "annotatorConfidence": false,
                  "authors": "Default User",
                  "id": "2.25.337873076505794771639407232761357500198",
                  "itemNumber": 3,
                  "label": "Nodule Periphery",
                  "maxCardinality": 1,
                  "minCardinality": 1,
                  "shouldDisplay": true,
                  "AllowedTerm": [
                    {
                      "codeMeaning": "emphysema",
                      "codeValue": "RID4799",
                      "codingSchemeDesignator": "RadLex3.10_NS"
                    },
                    {
                      "codeMeaning": "fibrosis",
                      "codeValue": "RID3820",
                      "codingSchemeDesignator": "RadLex3.10_NS",
                      "ValidTerm": [
                        {
                          "codeMeaning": "diffuse",
                          "codeValue": "RID5701",
                          "codingSchemeDesignator": "RadLex3.10_NS"
                        }
                      ]
                    },
                    {
                      "codeMeaning": "normal",
                      "codeValue": "RID13173",
                      "codingSchemeDesignator": "RadLex3.10_NS"
                    },
                    {
                      "codeMeaning": "scar",
                      "codeValue": "RID3829",
                      "codingSchemeDesignator": "RadLex3.10_NS",
                      "ValidTerm": [
                        {
                          "codeMeaning": "focal",
                          "codeValue": "RID5702",
                          "codingSchemeDesignator": "RadLex3.10_NS"
                        }
                      ]
                    }
                  ]
                }
              ]
            },
            "AllowedTerm": [
              {
                "codeMeaning": " lung mass",
                "codeValue": "RID39056",
                "codingSchemeDesignator": "RadLex3.8",
                "defaultAnswer": true
              }
            ]
          }
        ]
      }
    ]
  }
};

export var medulloblastoma = {
  "TemplateContainer": {
    "xmlns": "gme://caCORE.caCORE/3.2/edu.northwestern.radiology.AIMTemplate",
    "xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
    "authors": "Mike Iv",
    "creationDate": "2014-10-11",
    "description": "Semantic terms for Medulloblastoma study",
    "name": "Medulloblastoma",
    "uid": "2.25.15849407908315605105713741120411730412",
    "version": "1.0",
    "xsi:schemaLocation": "gme://caCORE.caCORE/3.2/edu.northwestern.radiology.AIMTemplate AIMTemplate_v2rv13.xsd",
    "Template": [
      {
        "authors": "Mike Iv",
        "codeMeaning": "MedulloblastomaCopy",
        "codeValue": "99_PRI_TC_01_COPY",
        "codingSchemeDesignator": "MB",
        "codingSchemeVersion": "1.0",
        "creationDate": "2014-09-18",
        "description": "Semantic terms for Medulloblastoma study",
        "name": "Medulloblastoma",
        "templateType": "Study",
        "uid": "2.25.38059802756356362231537519738295395570",
        "version": "1.0",
        "Component": [
          {
            "authors": "Mike Iv",
            "id": "2.25.117572152526707927574939372850941803789",
            "itemNumber": 0,
            "label": "Tumor",
            "maxCardinality": 1,
            "minCardinality": 1,
            "shouldDisplay": true,
            "ImagingObservation": {
              "annotatorConfidence": false,
              "ImagingObservationCharacteristic": [
                {
                  "annotatorConfidence": false,
                  "authors": "Mike Iv",
                  "explanatoryText": "Location of tumor center",
                  "id": "2.25.243369427314152610892608614870379669427",
                  "itemNumber": 0,
                  "label": "Tumor Center",
                  "maxCardinality": 1,
                  "minCardinality": 1,
                  "shouldDisplay": true,
                  "AllowedTerm": [
                    {
                      "codeMeaning": "Cerebellopontine angle",
                      "codeValue": "M05",
                      "codingSchemeDesignator": "MB"
                    },
                    {
                      "codeMeaning": "Central cerebellum",
                      "codeValue": "M02",
                      "codingSchemeDesignator": "MB",
                      "codingSchemeVersion": "1.0",
                      "defaultAnswer": true
                    },
                    {
                      "codeMeaning": "Peripheral cerebellum",
                      "codeValue": "M01",
                      "codingSchemeDesignator": "MB",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "Cerebellar peduncles",
                      "codeValue": "M03",
                      "codingSchemeDesignator": "MB",
                      "codingSchemeVersion": "1.0"
                    }
                  ]
                },
                {
                  "annotatorConfidence": false,
                  "authors": "Mike Iv",
                  "explanatoryText": "Location of side of tumor center",
                  "id": "2.25.258394607215005566882269020151816243346",
                  "itemNumber": 1,
                  "label": "Side of tumor center",
                  "maxCardinality": 1,
                  "minCardinality": 1,
                  "shouldDisplay": true,
                  "AllowedTerm": [
                    {
                      "codeMeaning": "Right",
                      "codeValue": "M06",
                      "codingSchemeDesignator": "MB"
                    },
                    {
                      "codeMeaning": "Left",
                      "codeValue": "M08",
                      "codingSchemeDesignator": "MB"
                    },
                    {
                      "codeMeaning": "Midline - Vermis",
                      "codeValue": "M07",
                      "codingSchemeDesignator": "MB",
                      "codingSchemeVersion": "1.0",
                      "defaultAnswer": true
                    },
                    {
                      "codeMeaning": "Midline - Fourth ventricle",
                      "codeValue": "M22",
                      "codingSchemeDesignator": "MB",
                      "codingSchemeVersion": "1.0"
                    }
                  ]
                },
                {
                  "annotatorConfidence": false,
                  "authors": "Mike Iv",
                  "explanatoryText": "Presence of tumor enhancement",
                  "id": "2.25.338770605775076783480232327850136588548",
                  "itemNumber": 2,
                  "label": "Enhancement",
                  "maxCardinality": 1,
                  "minCardinality": 1,
                  "shouldDisplay": true,
                  "AllowedTerm": [
                    {
                      "codeMeaning": "Yes",
                      "codeValue": "M12",
                      "codingSchemeDesignator": "MB",
                      "defaultAnswer": true,
                      "nextId": "2.25.218175037184590661113614121913710048949"
                    },
                    {
                      "codeMeaning": "No",
                      "codeValue": "M13",
                      "codingSchemeDesignator": "MB",
                      "nextId": "2.25.74924448650820154247124998177552875940"
                    }
                  ]
                },
                {
                  "annotatorConfidence": false,
                  "authors": "Mike Iv",
                  "id": "2.25.218175037184590661113614121913710048949",
                  "itemNumber": 3,
                  "label": "Amount of enhancement",
                  "maxCardinality": 1,
                  "minCardinality": 1,
                  "shouldDisplay": true,
                  "AllowedTerm": [
                    {
                      "codeMeaning": "Less than or equal to 25%",
                      "codeValue": "M09",
                      "codingSchemeDesignator": "MB",
                      "codingSchemeVersion": "1.0",
                      "defaultAnswer": true
                    },
                    {
                      "codeMeaning": "Between 25-75%",
                      "codeValue": "M10",
                      "codingSchemeDesignator": "MB",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "Greater than or equal to 75%",
                      "codeValue": "M11",
                      "codingSchemeDesignator": "MB",
                      "codingSchemeVersion": "1.0"
                    }
                  ]
                },
                {
                  "annotatorConfidence": false,
                  "authors": "Mike Iv",
                  "explanatoryText": "Presence of intratumoral hemorrhage",
                  "id": "2.25.74924448650820154247124998177552875940",
                  "itemNumber": 4,
                  "label": "Hemorrhage",
                  "maxCardinality": 1,
                  "minCardinality": 1,
                  "shouldDisplay": true,
                  "AllowedTerm": [
                    {
                      "codeMeaning": "Yes",
                      "codeValue": "M12",
                      "codingSchemeDesignator": "MB",
                      "nextId": "2.25.298160909746610489749753082118792263970"
                    },
                    {
                      "codeMeaning": "No",
                      "codeValue": "M13",
                      "codingSchemeDesignator": "MB",
                      "defaultAnswer": true,
                      "nextId": "2.25.298376394697089297145445272837107331498"
                    }
                  ]
                },
                {
                  "annotatorConfidence": false,
                  "authors": "Mike Iv",
                  "explanatoryText": "How much hemorrhage is present relative to the size of tumor?",
                  "id": "2.25.298160909746610489749753082118792263970",
                  "itemNumber": 5,
                  "label": "Amount of hemorrhage",
                  "maxCardinality": 1,
                  "minCardinality": 1,
                  "shouldDisplay": true,
                  "AllowedTerm": [
                    {
                      "codeMeaning": "Less than or equal to 25%",
                      "codeValue": "M09",
                      "codingSchemeDesignator": "MB",
                      "codingSchemeVersion": "1.0",
                      "defaultAnswer": true
                    },
                    {
                      "codeMeaning": "Between 25-75%",
                      "codeValue": "M10",
                      "codingSchemeDesignator": "MB",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "Greater than or equal to 75%",
                      "codeValue": "M11",
                      "codingSchemeDesignator": "MB",
                      "codingSchemeVersion": "1.0"
                    }
                  ]
                },
                {
                  "annotatorConfidence": false,
                  "authors": "Mike Iv",
                  "explanatoryText": "Presence of intratumoral calcification",
                  "id": "2.25.298376394697089297145445272837107331498",
                  "itemNumber": 6,
                  "label": "Calcification",
                  "maxCardinality": 1,
                  "minCardinality": 1,
                  "shouldDisplay": true,
                  "AllowedTerm": [
                    {
                      "codeMeaning": "Yes",
                      "codeValue": "M12",
                      "codingSchemeDesignator": "MB",
                      "defaultAnswer": true
                    },
                    {
                      "codeMeaning": "No",
                      "codeValue": "M13",
                      "codingSchemeDesignator": "MB"
                    },
                    {
                      "codeMeaning": "Indeterminate",
                      "codeValue": "M21",
                      "codingSchemeDesignator": "MB",
                      "codingSchemeVersion": "1.0"
                    }
                  ]
                },
                {
                  "annotatorConfidence": false,
                  "authors": "Mike Iv",
                  "explanatoryText": "Presence of cyst(s) - defined as circumscribed lesion(s) with CSF signal intensity and thin and smooth wall(s)",
                  "id": "2.25.327908120642115618520019529889963055643",
                  "itemNumber": 7,
                  "label": "Cyst(s)",
                  "maxCardinality": 1,
                  "minCardinality": 1,
                  "shouldDisplay": true,
                  "AllowedTerm": [
                    {
                      "codeMeaning": "Yes",
                      "codeValue": "M12",
                      "codingSchemeDesignator": "MB"
                    },
                    {
                      "codeMeaning": "No",
                      "codeValue": "M13",
                      "codingSchemeDesignator": "MB",
                      "defaultAnswer": true
                    }
                  ]
                },
                {
                  "annotatorConfidence": false,
                  "authors": "Mike Iv",
                  "explanatoryText": "Presence of necrosis - differentiate from cyst by complex internal material and thick and/or irregular wall",
                  "id": "2.25.81179750153991324821009866957029294622",
                  "itemNumber": 8,
                  "label": "Necrosis",
                  "maxCardinality": 1,
                  "minCardinality": 1,
                  "shouldDisplay": true,
                  "AllowedTerm": [
                    {
                      "codeMeaning": "Yes",
                      "codeValue": "M12",
                      "codingSchemeDesignator": "MB"
                    },
                    {
                      "codeMeaning": "No",
                      "codeValue": "M13",
                      "codingSchemeDesignator": "MB",
                      "defaultAnswer": true
                    }
                  ]
                },
                {
                  "annotatorConfidence": false,
                  "authors": "Mike Iv",
                  "explanatoryText": "Is >50% of tumor margin circumscribed (i.e. margin is easy to trace with a pencil if you were to draw it)?",
                  "id": "2.25.328482396987283900535246189988708663854",
                  "itemNumber": 9,
                  "label": "Margin",
                  "maxCardinality": 1,
                  "minCardinality": 1,
                  "shouldDisplay": true,
                  "AllowedTerm": [
                    {
                      "codeMeaning": "Yes",
                      "codeValue": "M12",
                      "codingSchemeDesignator": "MB",
                      "defaultAnswer": true
                    },
                    {
                      "codeMeaning": "No",
                      "codeValue": "M13",
                      "codingSchemeDesignator": "MB"
                    }
                  ]
                },
                {
                  "annotatorConfidence": false,
                  "authors": "Mike Iv",
                  "explanatoryText": "Presence of abnormal leptomeningeal and/or ependymal enhancement",
                  "id": "2.25.219360991222997338272004958619102183256",
                  "itemNumber": 10,
                  "label": "Leptomeningeal or ependymal seeding",
                  "maxCardinality": 1,
                  "minCardinality": 1,
                  "shouldDisplay": true,
                  "AllowedTerm": [
                    {
                      "codeMeaning": "None",
                      "codeValue": "M20",
                      "codingSchemeDesignator": "MB",
                      "defaultAnswer": true
                    },
                    {
                      "codeMeaning": "Linear",
                      "codeValue": "M14",
                      "codingSchemeDesignator": "MB"
                    },
                    {
                      "codeMeaning": "Fine nodular (Less than 5mm)",
                      "codeValue": "M15",
                      "codingSchemeDesignator": "MB"
                    },
                    {
                      "codeMeaning": "Large nodular (Greater than or equal to 5 mm)",
                      "codeValue": "M16",
                      "codingSchemeDesignator": "MB"
                    }
                  ]
                },
                {
                  "annotatorConfidence": false,
                  "authors": "Mike Iv",
                  "explanatoryText": "Presence of parenchymal metastasis",
                  "id": "2.25.325627286753303843169513393422606521293",
                  "itemNumber": 11,
                  "label": "Parenchymal metastasis",
                  "maxCardinality": 1,
                  "minCardinality": 1,
                  "shouldDisplay": true,
                  "AllowedTerm": [
                    {
                      "codeMeaning": "Yes",
                      "codeValue": "M12",
                      "codingSchemeDesignator": "MB"
                    },
                    {
                      "codeMeaning": "No",
                      "codeValue": "M13",
                      "codingSchemeDesignator": "MB",
                      "defaultAnswer": true,
                      "noMoreQuestions": "true"
                    }
                  ]
                },
                {
                  "annotatorConfidence": false,
                  "authors": "Mike Iv",
                  "explanatoryText": "Size of metastasis",
                  "id": "2.25.261923430377697684112193976061955864305",
                  "itemNumber": 12,
                  "label": "Size of metastasis",
                  "maxCardinality": 1,
                  "minCardinality": 1,
                  "shouldDisplay": true,
                  "AllowedTerm": [
                    {
                      "codeMeaning": "Small (Less than 5 mm)",
                      "codeValue": "M17",
                      "codingSchemeDesignator": "MB",
                      "defaultAnswer": true,
                      "nextId": "2.25.5576664793525414120049970800664039910"
                    },
                    {
                      "codeMeaning": "Large (Greater or equal to 5 mm)",
                      "codeValue": "M17",
                      "codingSchemeDesignator": "MB",
                      "nextId": "2.25.5576664793525414120049970800664039910"
                    }
                  ]
                },
                {
                  "annotatorConfidence": false,
                  "authors": "Mike Iv",
                  "explanatoryText": "Location of metastasis",
                  "id": "2.25.5576664793525414120049970800664039910",
                  "itemNumber": 13,
                  "label": "Location of metastasis",
                  "maxCardinality": 1,
                  "minCardinality": 1,
                  "shouldDisplay": true,
                  "AllowedTerm": [
                    {
                      "codeMeaning": "Supratentorium",
                      "codeValue": "M18",
                      "codingSchemeDesignator": "MB"
                    },
                    {
                      "codeMeaning": "Visualized spine",
                      "codeValue": "M19",
                      "codingSchemeDesignator": "MB"
                    },
                    {
                      "codeMeaning": "Cerebellum",
                      "codeValue": "M04",
                      "codingSchemeDesignator": "MB",
                      "codingSchemeVersion": "1.0",
                      "defaultAnswer": true
                    }
                  ]
                }
              ]
            },
            "AllowedTerm": [
              {
                "codeMeaning": "Medulloblastoma",
                "codeValue": "99_PRI_TC_01",
                "codingSchemeDesignator": "MB",
                "codingSchemeVersion": "1.0",
                "defaultAnswer": true
              }
            ]
          }
        ]
      }
    ]
  }
};
export var segmentation_templatev2_1 = {
  "TemplateContainer": {
    "uid": "2.25.73865789221463805614224162339669641819",
    "name": "Liver segmentation",
    "authors": "Pritam",
    "version": "1.0",
    "creationDate": "2019-05-08",
    "description": "Segmenting liver",
    "xsi:schemaLocation": "gme://caCORE.caCORE/3.2/edu.northwestern.radiology.AIMTemplate AIMTemplate_v2rv13.xsd",
    "xmlns": "gme://caCORE.caCORE/3.2/edu.northwestern.radiology.AIMTemplate",
    "xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
    "Template": [
      {
        "uid": "2.25.1580094462958589198440056709826121619790",
        "name": "SEGOnly",
        "authors": "dwillrett",
        "version": "1.1",
        "creationDate": "2011-11-16",
        "description": "Template used for collecting only SEGs",
        "codeMeaning": "SEG Only",
        "codeValue": "SEG",
        "codingSchemeDesignator": "SEG",
        "codingSchemeVersion": "1.0",
        "Component": [
          {
            "label": "Part",
            "itemNumber": 0,
            "authors": "Default User",
            "explanatoryText": "What part of the liver is being segmented",
            "minCardinality": 1,
            "maxCardinality": 1,
            "shouldDisplay": true,
            "id": "2.25.308731779875454893724855094415453764018",
            "ImagingObservation": {
              "annotatorConfidence": false
            },
            "AllowedTerm": [
              {
                "codeValue": "RID58",
                "codeMeaning": "liver",
                "codingSchemeDesignator": "RadLex",
                "codingSchemeVersion": "1.0",
                "noMoreQuestions": "true"
              },
              {
                "codeValue": "RID4",
                "codeMeaning": "blood vessel",
                "codingSchemeDesignator": "RadLex",
                "codingSchemeVersion": "1.0",
                "noMoreQuestions": "true"
              },
              {
                "codeValue": "lesion",
                "codeMeaning": "lesion",
                "codingSchemeDesignator": "liver_template_terms",
                "codingSchemeVersion": "1.0"
              },
              {
                "codeValue": "RID28454",
                "codeMeaning": "none",
                "codingSchemeDesignator": "RadLex",
                "codingSchemeVersion": "1.0",
                "noMoreQuestions": "true"
              }
            ]
          },
          {
            "label": "Malignancy score",
            "itemNumber": 1,
            "authors": "Default User",
            "minCardinality": 0,
            "maxCardinality": 1,
            "shouldDisplay": true,
            "id": "2.25.39349524745844595092030426213705965181",
            "QuestionType": {
              "codeValue": "malignancy_score",
              "codeMeaning": "Please give a malignancy score to the lesion on a scale of 1 to 5 (1: benign, 5: malignant)",
              "codingSchemeDesignator": "99PRIVATEQA",
              "codingSchemeVersion": "1.0"
            },
            "Inference": {
              "annotatorConfidence": false
            },
            "AllowedTerm": [
              {
                "codeValue": "1",
                "codeMeaning": "LR-1: Definitely benign",
                "codingSchemeDesignator": "liver_template_terms",
                "codingSchemeVersion": "1.0"
              },
              {
                "codeValue": "2",
                "codeMeaning": "LR-2: Probably benign",
                "codingSchemeDesignator": "liver_template_terms",
                "codingSchemeVersion": "1.0"
              },
              {
                "codeValue": "3",
                "codeMeaning": "LR-3: Intermediate probability for HCC",
                "codingSchemeDesignator": "liver_template_terms",
                "codingSchemeVersion": "1.0"
              },
              {
                "codeValue": "4",
                "codeMeaning": "LR-4: Probably HCC",
                "codingSchemeDesignator": "liver_template_terms",
                "codingSchemeVersion": "1.0"
              },
              {
                "codeValue": "5",
                "codeMeaning": "LR-5: Definitely HCC",
                "codingSchemeDesignator": "liver_template_terms",
                "codingSchemeVersion": "1.0"
              },
              {
                "codeValue": "6",
                "codeMeaning": "LR-M: Probably malignant, not specific for HCC",
                "codingSchemeDesignator": "liver_template_terms",
                "codingSchemeVersion": "1.0"
              },
              {
                "codeValue": "7",
                "codeMeaning": "LR-TIV: Definitely tumour in vein",
                "codingSchemeDesignator": "liver_template_terms",
                "codingSchemeVersion": "1.0"
              },
              {
                "codeValue": "8",
                "codeMeaning": "LR-TR: Treated observation",
                "codingSchemeDesignator": "liver_template_terms",
                "codingSchemeVersion": "1.0"
              },
              {
                "codeValue": "9",
                "codeMeaning": "LR-NC: Not characterizable",
                "codingSchemeDesignator": "liver_template_terms",
                "codingSchemeVersion": "1.0"
              }
            ]
          }
        ]
      }
    ]
  }
};

export var test3asdf = {
  "TemplateContainer": {
    "xmlns": "gme://caCORE.caCORE/3.2/edu.northwestern.radiology.AIMTemplate",
    "xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
    "authors": "AIM Team",
    "creationDate": "2012-12-28",
    "description": "asdfsadfasd",
    "name": "adsdf",
    "uid": "2.25.75761204952962875896072870850622745228",
    "version": "asdfadsf",
    "xsi:schemaLocation": "gme://caCORE.caCORE/3.2/edu.northwestern.radiology.AIMTemplate AIMTemplate_v2rv13.xsd",
    "Template": [
      {
        "authors": "AIM Team",
        "codeMeaning": "Non-Target Lesion Incomplete Response or Stable Disease",
        "codeValue": "112046",
        "codingSchemeDesignator": "DCM",
        "codingSchemeVersion": "1.0",
        "creationDate": "2012-12-28",
        "description": "test three",
        "modality": "CT",
        "name": "TEST 3",
        "precedingAnnotation": "RequireToSelect",
        "uid": "2.25.246328047169208880141674055331849154527",
        "version": "1.0",
        "Component": [
          {
            "authors": "AIM Team",
            "explanatoryText": "ae ONE",
            "groupLabel": "AE",
            "id": "2.25.249736992084416545275140963623879078175",
            "itemNumber": 0,
            "label": "AE - 1 ",
            "maxCardinality": 2,
            "minCardinality": 1,
            "requireComment": "true",
            "shouldDisplay": true,
            "QuestionType": {
              "codeMeaning": "Target Lesion Partial Response",
              "codeValue": "112042",
              "codingSchemeDesignator": "DCM",
              "codingSchemeVersion": "1.0"
            },
            "AnatomicEntity": {
              "annotatorConfidence": true,
              "AnatomicEntityCharacteristic": [
                {
                  "annotatorConfidence": true,
                  "authors": "AIM Team",
                  "explanatoryText": "AEC one - one",
                  "groupLabel": "AEC - 1 - 1",
                  "id": "2.25.96983863729747964833684373111073058156",
                  "itemNumber": 0,
                  "label": "AEC - 1 - 1",
                  "maxCardinality": 2,
                  "minCardinality": 1,
                  "requireComment": "true",
                  "shouldDisplay": true,
                  "AllowedTerm": [
                    {
                      "codeMeaning": "absent gastric air bubble sign",
                      "codeValue": "RID34993",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0",
                      "ValidTerm": [
                        {
                          "codeMeaning": "bone marrow edema",
                          "codeValue": "10055397",
                          "codingSchemeDesignator": "MedDRA",
                          "codingSchemeVersion": "1.0"
                        }
                      ]
                    },
                    {
                      "codeMeaning": "acute kyphosis sign",
                      "codeValue": "RID34998",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "acorn deformity",
                      "codeValue": "RID34997",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0",
                      "nextId": "2.25.144384273350738068267645406522525823311"
                    },
                    {
                      "codeMeaning": "absent liver sign",
                      "codeValue": "RID34995",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "Mickey Mouse sign of liver",
                      "codeValue": "RID34404",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0",
                      "ValidTerm": [
                        {
                          "codeMeaning": "Bone",
                          "codeValue": "MTHU002077",
                          "codingSchemeDesignator": "LOINC"
                        }
                      ]
                    },
                    {
                      "codeMeaning": "swan neck deformity",
                      "codeValue": "RID34409",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0",
                      "nextId": "2.25.264945780284452461227299362245725897438"
                    },
                    {
                      "codeMeaning": "Erlenmeyer flask deformity",
                      "codeValue": "RID34412",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    }
                  ],
                  "QuestionType": {
                    "codeMeaning": "air bronchogram sign",
                    "codeValue": "RID34999",
                    "codingSchemeDesignator": "RadLex",
                    "codingSchemeVersion": "1.0"
                  }
                },
                {
                  "annotatorConfidence": true,
                  "authors": "AIM Team",
                  "explanatoryText": "AEC one two",
                  "id": "2.25.282321381780351407137178608344539789057",
                  "itemNumber": 1,
                  "label": "AEC - 1 - 2",
                  "maxCardinality": 3,
                  "minCardinality": 1,
                  "requireComment": "true",
                  "shouldDisplay": true,
                  "AllowedTerm": [
                    {
                      "codeMeaning": "absent liver sign",
                      "codeValue": "RID34995",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0",
                      "CharacteristicQuantification": [
                        {
                          "annotatorConfidence": false,
                          "characteristicQuantificationIndex": 0,
                          "name": "Scale-1",
                          "Scale": {
                            "scaleType": "Ordinal",
                            "ScaleLevel": [
                              {
                                "value": "1",
                                "valueDescription": "1",
                                "valueLabel": "1"
                              },
                              {
                                "value": "2",
                                "valueDescription": "2",
                                "valueLabel": "two"
                              },
                              {
                                "value": "3",
                                "valueDescription": "3",
                                "valueLabel": "three"
                              }
                            ]
                          },
                          "NonQuantifiable": [
                            {
                              "codeMeaning": "Yes",
                              "codeValue": "R-0038D",
                              "codingSchemeDesignator": "SRT",
                              "codingSchemeVersion": "1.0"
                            },
                            {
                              "codeMeaning": "Complex",
                              "codeValue": "G-A540",
                              "codingSchemeDesignator": "SRT",
                              "codingSchemeVersion": "1.0"
                            },
                            {
                              "codeMeaning": "No",
                              "codeValue": "R-00339",
                              "codingSchemeDesignator": "SRT",
                              "codingSchemeVersion": "1.0"
                            }
                          ]
                        }
                      ]
                    },
                    {
                      "codeMeaning": "butterfly shadow",
                      "codeValue": "RID34400",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0",
                      "defaultAnswer": true,
                      "nextId": "2.25.316621944217354986956136852674485484897",
                      "CharacteristicQuantification": [
                        {
                          "annotatorConfidence": true,
                          "characteristicQuantificationIndex": 0,
                          "name": "scale",
                          "Scale": {
                            "scaleType": "Nominal",
                            "ScaleLevel": [
                              {
                                "value": "1",
                                "valueDescription": "1-1-1",
                                "valueLabel": "1-1"
                              },
                              {
                                "value": "2",
                                "valueDescription": "2-1-1",
                                "valueLabel": "2-1-1"
                              },
                              {
                                "value": "3",
                                "valueDescription": "3-1-1",
                                "valueLabel": "3-1-1"
                              }
                            ]
                          },
                          "NonQuantifiable": [
                            {
                              "codeMeaning": "Extrusion",
                              "codeValue": "R-4207A",
                              "codingSchemeDesignator": "SRT",
                              "codingSchemeVersion": "1.0",
                              "defaultAnswer": true
                            },
                            {
                              "codeMeaning": "marked",
                              "codeValue": "G-A429",
                              "codingSchemeDesignator": "SRT",
                              "codingSchemeVersion": "1.0"
                            }
                          ]
                        }
                      ]
                    },
                    {
                      "codeMeaning": "cobblestone pattern",
                      "codeValue": "RID34405",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0",
                      "defaultAnswer": true,
                      "ValidTerm": [
                        {
                          "codeMeaning": "Body Part",
                          "codeValue": "C0229962",
                          "codingSchemeDesignator": "NCIm",
                          "codingSchemeVersion": "1.0"
                        },
                        {
                          "codeMeaning": "Plica",
                          "codeValue": "C1204543",
                          "codingSchemeDesignator": "NCIm",
                          "codingSchemeVersion": "1.0"
                        }
                      ],
                      "CharacteristicQuantification": [
                        {
                          "annotatorConfidence": false,
                          "characteristicQuantificationIndex": 0,
                          "name": "scale-3",
                          "Scale": {
                            "scaleType": "Ratio",
                            "ScaleLevel": [
                              {
                                "value": "1",
                                "valueDescription": "1",
                                "valueLabel": "1"
                              },
                              {
                                "value": "2",
                                "valueDescription": "2",
                                "valueLabel": "2"
                              },
                              {
                                "defaultAnswer": true,
                                "value": "3",
                                "valueDescription": "3",
                                "valueLabel": "3"
                              }
                            ]
                          },
                          "NonQuantifiable": [
                            {
                              "codeMeaning": "Center/Bilateral",
                              "codeValue": "G-A102",
                              "codingSchemeDesignator": "SRT",
                              "codingSchemeVersion": "1.0"
                            },
                            {
                              "codeMeaning": "Mild",
                              "codeValue": "R-404FA",
                              "codingSchemeDesignator": "SRT",
                              "codingSchemeVersion": "1.0"
                            },
                            {
                              "codeMeaning": "Normal",
                              "codeValue": "G-A460",
                              "codingSchemeDesignator": "SRT",
                              "codingSchemeVersion": "1.0"
                            }
                          ]
                        }
                      ]
                    },
                    {
                      "codeMeaning": "swan neck deformity",
                      "codeValue": "RID34409",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0",
                      "CharacteristicQuantification": [
                        {
                          "annotatorConfidence": false,
                          "characteristicQuantificationIndex": 0,
                          "name": "numerical",
                          "Numerical": [
                            {
                              "askForInput": "false",
                              "operator": "Equal",
                              "ucumString": "cm",
                              "value": "0.0",
                              "valueDescription": "zero",
                              "valueLabel": "0"
                            },
                            {
                              "askForInput": "false",
                              "operator": "NotEqual",
                              "ucumString": "cm",
                              "value": "10.0",
                              "valueDescription": "10",
                              "valueLabel": "10"
                            },
                            {
                              "askForInput": "false",
                              "operator": "LessThan",
                              "ucumString": "cm",
                              "value": "20.0",
                              "valueDescription": "20",
                              "valueLabel": "20"
                            },
                            {
                              "askForInput": "false",
                              "operator": "GreaterThan",
                              "ucumString": "cm",
                              "value": "30.0",
                              "valueDescription": "30",
                              "valueLabel": "30"
                            },
                            {
                              "askForInput": "false",
                              "operator": "LessThanEqual",
                              "ucumString": "cm",
                              "value": "40.0",
                              "valueDescription": "40",
                              "valueLabel": "40"
                            },
                            {
                              "askForInput": "false",
                              "operator": "GreaterThanEqual",
                              "ucumString": "cm",
                              "value": "50.0",
                              "valueDescription": "50",
                              "valueLabel": "50"
                            }
                          ],
                          "NonQuantifiable": [
                            {
                              "codeMeaning": "Yes",
                              "codeValue": "R-0038D",
                              "codingSchemeDesignator": "SRT",
                              "codingSchemeVersion": "1.0"
                            },
                            {
                              "codeMeaning": "Horizontal",
                              "codeValue": "G-A142",
                              "codingSchemeDesignator": "SRT",
                              "codingSchemeVersion": "1.0"
                            },
                            {
                              "codeMeaning": "marked",
                              "codeValue": "G-A429",
                              "codingSchemeDesignator": "SRT",
                              "codingSchemeVersion": "1.0"
                            }
                          ]
                        }
                      ]
                    },
                    {
                      "codeMeaning": "Erlenmeyer flask deformity",
                      "codeValue": "RID34412",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0",
                      "defaultAnswer": true,
                      "CharacteristicQuantification": [
                        {
                          "annotatorConfidence": false,
                          "characteristicQuantificationIndex": 0,
                          "name": "Quantile",
                          "Quantile": {
                            "bins": "16",
                            "defaultBin": "2",
                            "maxValue": "500.0",
                            "minValue": "0.0",
                            "valueDescription": "500",
                            "valueLabel": "quantile"
                          },
                          "NonQuantifiable": [
                            {
                              "codeMeaning": "no",
                              "codeValue": "R-00339",
                              "codingSchemeDesignator": "SRT",
                              "codingSchemeVersion": "1.0"
                            },
                            {
                              "codeMeaning": "Yes",
                              "codeValue": "R-0038D",
                              "codingSchemeDesignator": "SRT",
                              "codingSchemeVersion": "1.0"
                            },
                            {
                              "codeMeaning": "No",
                              "codeValue": "R-00339",
                              "codingSchemeDesignator": "SRT",
                              "codingSchemeVersion": "1.0"
                            }
                          ]
                        }
                      ]
                    },
                    {
                      "codeMeaning": "bowler hat sign",
                      "codeValue": "RID34399",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0",
                      "CharacteristicQuantification": [
                        {
                          "annotatorConfidence": false,
                          "characteristicQuantificationIndex": 0,
                          "name": "Interval",
                          "Interval": [
                            {
                              "askForInput": "false",
                              "maxOperator": "LessThanEqual",
                              "maxValue": "10.0",
                              "minOperator": "GreaterThan",
                              "minValue": "0.0",
                              "ucumString": "cm",
                              "valueDescription": "valDes",
                              "valueLabel": "a0-10"
                            },
                            {
                              "askForInput": "false",
                              "maxOperator": "LessThanEqual",
                              "maxValue": "20.0",
                              "minOperator": "NotEqual",
                              "minValue": "10.0",
                              "ucumString": "cm",
                              "valueDescription": "10-20",
                              "valueLabel": "10-20"
                            },
                            {
                              "askForInput": "false",
                              "maxOperator": "LessThanEqual",
                              "maxValue": "30.0",
                              "minOperator": "GreaterThan",
                              "minValue": "20.0",
                              "ucumString": "cm",
                              "valueDescription": "20-30",
                              "valueLabel": "20-30"
                            },
                            {
                              "askForInput": "false",
                              "maxOperator": "LessThanEqual",
                              "maxValue": "40.0",
                              "minOperator": "GreaterThanEqual",
                              "minValue": "30.0",
                              "ucumString": "cm",
                              "valueDescription": "cm",
                              "valueLabel": "cm"
                            }
                          ],
                          "NonQuantifiable": [
                            {
                              "codeMeaning": "Oblique",
                              "codeValue": "G-A472",
                              "codingSchemeDesignator": "SRT",
                              "codingSchemeVersion": "1.0"
                            },
                            {
                              "codeMeaning": "No",
                              "codeValue": "R-00339",
                              "codingSchemeDesignator": "SRT",
                              "codingSchemeVersion": "1.0"
                            },
                            {
                              "codeMeaning": "Lateral",
                              "codeValue": "G-A104",
                              "codingSchemeDesignator": "SRT",
                              "codingSchemeVersion": "1.0"
                            },
                            {
                              "codeMeaning": "Complex",
                              "codeValue": "G-A540",
                              "codingSchemeDesignator": "SRT",
                              "codingSchemeVersion": "1.0"
                            }
                          ]
                        }
                      ]
                    }
                  ],
                  "QuestionType": {
                    "codeMeaning": "Normal",
                    "codeValue": "G-A460",
                    "codingSchemeDesignator": "SRT",
                    "codingSchemeVersion": "1.0"
                  }
                },
                {
                  "annotatorConfidence": false,
                  "authors": "Default User",
                  "explanatoryText": "AEC 1-3",
                  "groupLabel": "AEC - 1 - 1",
                  "id": "2.25.314136553354390144751865176243128910653",
                  "itemNumber": 2,
                  "label": "AEC - 1- 3",
                  "maxCardinality": 1,
                  "minCardinality": 0,
                  "shouldDisplay": true,
                  "AllowedTerm": [
                    {
                      "codeMeaning": "Image Nodule Lobar Location Type",
                      "codeValue": "2181666",
                      "codingSchemeDesignator": "CTEP",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "Patient Gender Category",
                      "codeValue": "62",
                      "codingSchemeDesignator": "CTEP",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "Nodule Histology Histologic Type WHO Code",
                      "codeValue": "2182326",
                      "codingSchemeDesignator": "CTEP",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "NonNodule Finding X Position Number",
                      "codeValue": "57819",
                      "codingSchemeDesignator": "CTEP",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "Nodule Histology Histologic Type WHO Code",
                      "codeValue": "2182326",
                      "codingSchemeDesignator": "CTEP",
                      "codingSchemeVersion": "1.0"
                    }
                  ]
                }
              ]
            },
            "AllowedTerm": [
              {
                "codeMeaning": "abdominal fat necrosis sign",
                "codeValue": "RID34991",
                "codingSchemeDesignator": "RadLex",
                "codingSchemeVersion": "1.0"
              },
              {
                "codeMeaning": "scotty dog sign",
                "codeValue": "RID34408",
                "codingSchemeDesignator": "RadLex",
                "codingSchemeVersion": "1.0"
              },
              {
                "codeMeaning": "Erlenmeyer flask deformity",
                "codeValue": "RID34412",
                "codingSchemeDesignator": "RadLex",
                "codingSchemeVersion": "1.0",
                "nextId": "2.25.264945780284452461227299362245725897438"
              },
              {
                "codeMeaning": "lacunar skull",
                "codeValue": "RID35333",
                "codingSchemeDesignator": "RadLex",
                "codingSchemeVersion": "1.0"
              },
              {
                "codeMeaning": "knuckle sign",
                "codeValue": "RID35330",
                "codingSchemeDesignator": "RadLex",
                "codingSchemeVersion": "1.0"
              },
              {
                "codeMeaning": "lateral femoral notch sign",
                "codeValue": "RID35337",
                "codingSchemeDesignator": "RadLex",
                "codingSchemeVersion": "1.0"
              },
              {
                "codeMeaning": "lambda sign of chest",
                "codeValue": "RID35335",
                "codingSchemeDesignator": "RadLex",
                "codingSchemeVersion": "1.0",
                "nextId": "2.25.316621944217354986956136852674485484897",
                "ValidTerm": [
                  {
                    "codeMeaning": "Right",
                    "codeValue": "C25228",
                    "codingSchemeDesignator": "NCIt",
                    "codingSchemeVersion": "1.0"
                  }
                ]
              },
              {
                "codeMeaning": "leafless tree sign",
                "codeValue": "RID35340",
                "codingSchemeDesignator": "RadLex",
                "codingSchemeVersion": "1.0"
              },
              {
                "codeMeaning": "linguine sign",
                "codeValue": "RID35346",
                "codingSchemeDesignator": "RadLex",
                "codingSchemeVersion": "1.0"
              },
              {
                "codeMeaning": "lollipop sign",
                "codeValue": "RID35349",
                "codingSchemeDesignator": "RadLex",
                "codingSchemeVersion": "1.0"
              }
            ]
          },
          {
            "authors": "AIM Team",
            "explanatoryText": "IO",
            "groupLabel": "IO",
            "id": "2.25.221240251915004149123867287125995545695",
            "itemNumber": 1,
            "label": "IO",
            "maxCardinality": 1,
            "minCardinality": 1,
            "shouldDisplay": true,
            "QuestionType": {
              "codeMeaning": "Displaced",
              "codeValue": "R-4206F",
              "codingSchemeDesignator": "SRT",
              "codingSchemeVersion": "1.0"
            },
            "ImagingObservation": {
              "annotatorConfidence": false,
              "ImagingObservationCharacteristic": [
                {
                  "annotatorConfidence": true,
                  "authors": "AIM Team",
                  "explanatoryText": "IOC",
                  "id": "2.25.262609545894946533504172503990783678900",
                  "itemNumber": 0,
                  "label": "IOC",
                  "maxCardinality": 3,
                  "minCardinality": 1,
                  "requireComment": "true",
                  "shouldDisplay": true,
                  "AllowedTerm": [
                    {
                      "codeMeaning": "accordian sign",
                      "codeValue": "RID34996",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "absent liver sign",
                      "codeValue": "RID34995",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0",
                      "defaultAnswer": true
                    },
                    {
                      "codeMeaning": "comet tail sign",
                      "codeValue": "RID34407",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "absent bow tie sign",
                      "codeValue": "RID34411",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0",
                      "ValidTerm": [
                        {
                          "codeMeaning": "Free text format",
                          "codeValue": "C70764",
                          "codingSchemeDesignator": "NCIt",
                          "codingSchemeVersion": "1.0"
                        }
                      ]
                    },
                    {
                      "codeMeaning": "bowler hat sign",
                      "codeValue": "RID34399",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "left atrial notch sign",
                      "codeValue": "RID35341",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    }
                  ],
                  "QuestionType": {
                    "codeMeaning": "Radial",
                    "codeValue": "R-409D1",
                    "codingSchemeDesignator": "SRT",
                    "codingSchemeVersion": "1.0"
                  }
                }
              ]
            },
            "AllowedTerm": [
              {
                "codeMeaning": "No",
                "codeValue": "R-00339",
                "codingSchemeDesignator": "SRT",
                "codingSchemeVersion": "1.0"
              },
              {
                "codeMeaning": "moderate",
                "codeValue": "G-A002",
                "codingSchemeDesignator": "SRT",
                "codingSchemeVersion": "1.0",
                "defaultAnswer": true
              },
              {
                "codeMeaning": "trace",
                "codeValue": "R-4076E",
                "codingSchemeDesignator": "SRT",
                "codingSchemeVersion": "1.0"
              },
              {
                "codeMeaning": "previous",
                "codeValue": "G-A176",
                "codingSchemeDesignator": "SRT",
                "codingSchemeVersion": "1.0"
              },
              {
                "codeMeaning": "cardiac output",
                "codeValue": "F-32100",
                "codingSchemeDesignator": "SRT",
                "codingSchemeVersion": "1.0"
              }
            ]
          },
          {
            "authors": "AIM Team",
            "explanatoryText": "AE-2",
            "id": "2.25.200462337283989723836761134995730139613",
            "itemNumber": 2,
            "label": "AE-2",
            "maxCardinality": 1,
            "minCardinality": 1,
            "shouldDisplay": true,
            "QuestionType": {
              "codeMeaning": "coffee bean sign",
              "codeValue": "RID34406",
              "codingSchemeDesignator": "RadLex",
              "codingSchemeVersion": "1.0"
            },
            "AnatomicEntity": {
              "annotatorConfidence": false,
              "AnatomicEntityCharacteristic": [
                {
                  "annotatorConfidence": false,
                  "authors": "AIM Team",
                  "explanatoryText": "AE-AEC",
                  "id": "2.25.4904697685331920492789743978108629689",
                  "itemNumber": 1,
                  "label": "AE-AEC",
                  "maxCardinality": 1,
                  "minCardinality": 1,
                  "shouldDisplay": true,
                  "AllowedTerm": [
                    {
                      "codeMeaning": "Minimal ",
                      "codeValue": "3227238",
                      "codingSchemeDesignator": "caDSR",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "Center/Bilateral",
                      "codeValue": "3262715",
                      "codingSchemeDesignator": "caDSR",
                      "codingSchemeVersion": "1.0",
                      "defaultAnswer": true
                    },
                    {
                      "codeMeaning": "Right",
                      "codeValue": "2574088",
                      "codingSchemeDesignator": "caDSR",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "Vision",
                      "codeValue": "C0042789",
                      "codingSchemeDesignator": "caDSR",
                      "codingSchemeVersion": "1.0",
                      "ValidTerm": [
                        {
                          "codeMeaning": "full",
                          "codeValue": "C25517",
                          "codingSchemeDesignator": "NCIt",
                          "codingSchemeVersion": "1.0"
                        }
                      ]
                    },
                    {
                      "codeMeaning": "No Contrast Injected ",
                      "codeValue": "3262720",
                      "codingSchemeDesignator": "caDSR",
                      "codingSchemeVersion": "1.0"
                    }
                  ],
                  "QuestionType": {
                    "codeMeaning": "Lesion Substance Morphology Region Type",
                    "codeValue": "2903542",
                    "codingSchemeDesignator": "caDSR",
                    "codingSchemeVersion": "1.0"
                  }
                }
              ],
              "ImagingObservationCharacteristic": [
                {
                  "annotatorConfidence": true,
                  "authors": "AIM Team",
                  "explanatoryText": "AE-IOC",
                  "id": "2.25.108530634510740764767878159000975400939",
                  "itemNumber": 0,
                  "label": "AE-IOC",
                  "maxCardinality": 2,
                  "minCardinality": 1,
                  "requireComment": "true",
                  "shouldDisplay": true,
                  "AllowedTerm": [
                    {
                      "codeMeaning": "acorn deformity",
                      "codeValue": "RID34997",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "Mickey Mouse sign of liver",
                      "codeValue": "RID34404",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0",
                      "ValidTerm": [
                        {
                          "codeMeaning": "Not Applicable",
                          "codeValue": "C48660",
                          "codingSchemeDesignator": "NCIt",
                          "codingSchemeVersion": "1.0"
                        }
                      ]
                    },
                    {
                      "codeMeaning": "swan neck deformity",
                      "codeValue": "RID34409",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "beaded ureter",
                      "codeValue": "RID34396",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0",
                      "nextId": "2.25.316621944217354986956136852674485484897"
                    },
                    {
                      "codeMeaning": "lead pipe sign",
                      "codeValue": "RID35339",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0",
                      "defaultAnswer": true
                    },
                    {
                      "codeMeaning": "lambda sign of chest",
                      "codeValue": "RID35335",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "leafless tree sign",
                      "codeValue": "RID35340",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    }
                  ],
                  "QuestionType": {
                    "codeMeaning": "Oblique",
                    "codeValue": "G-A472",
                    "codingSchemeDesignator": "SRT",
                    "codingSchemeVersion": "1.0"
                  }
                },
                {
                  "annotatorConfidence": true,
                  "authors": "AIM Team",
                  "explanatoryText": "AE-IOC2",
                  "id": "2.25.144384273350738068267645406522525823311",
                  "itemNumber": 2,
                  "label": "AE-IOC2",
                  "maxCardinality": 1,
                  "minCardinality": 1,
                  "requireComment": "true",
                  "shouldDisplay": true,
                  "AllowedTerm": [
                    {
                      "codeMeaning": "Lesion Substance Morphology Contrast-enhanced MRI Quality Type",
                      "codeValue": "2891769",
                      "codingSchemeDesignator": "caDSR",
                      "codingSchemeVersion": "1.0",
                      "defaultAnswer": true
                    },
                    {
                      "codeMeaning": "Lesion Substance Morphology Noncontrast-enhancing Tissue (nCET) Proportion Category",
                      "codeValue": "2904270",
                      "codingSchemeDesignator": "caDSR",
                      "codingSchemeVersion": "1.0",
                      "ValidTerm": [
                        {
                          "codeMeaning": "Technique",
                          "codeValue": "C16847",
                          "codingSchemeDesignator": "NCIt",
                          "codingSchemeVersion": "1.0"
                        }
                      ]
                    },
                    {
                      "codeMeaning": "Lesion Substance Morphology Enhancing Proportion Category",
                      "codeValue": "2904265",
                      "codingSchemeDesignator": "caDSR",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "Lesion Morphology Margin Thickness Category",
                      "codeValue": "2903556",
                      "codingSchemeDesignator": "caDSR",
                      "codingSchemeVersion": "1.0"
                    }
                  ],
                  "QuestionType": {
                    "codeMeaning": "Lesion Alteration Calvarial Bone Remodeling Yes No Indicator",
                    "codeValue": "2904305",
                    "codingSchemeDesignator": "caDSR",
                    "codingSchemeVersion": "1.0"
                  }
                }
              ]
            },
            "AllowedTerm": [
              {
                "codeMeaning": "C sign",
                "codeValue": "RID34402",
                "codingSchemeDesignator": "RadLex",
                "codingSchemeVersion": "1.0"
              },
              {
                "codeMeaning": "inverted Napoleon hat sign",
                "codeValue": "RID34410",
                "codingSchemeDesignator": "RadLex",
                "codingSchemeVersion": "1.0",
                "defaultAnswer": true
              },
              {
                "codeMeaning": "absent collecting duct system",
                "codeValue": "RID34992",
                "codingSchemeDesignator": "RadLex",
                "codingSchemeVersion": "1.0",
                "ValidTerm": [
                  {
                    "codeMeaning": "meniscal cyst",
                    "codeValue": "C96205",
                    "codingSchemeDesignator": "NCIt",
                    "codingSchemeVersion": "1.0"
                  }
                ]
              }
            ]
          },
          {
            "authors": "AIM Team",
            "explanatoryText": "Inference",
            "id": "2.25.264945780284452461227299362245725897438",
            "itemNumber": 3,
            "label": "Inference",
            "maxCardinality": 1,
            "minCardinality": 1,
            "shouldDisplay": true,
            "QuestionType": {
              "codeMeaning": "Right",
              "codeValue": "2574088",
              "codingSchemeDesignator": "caDSR",
              "codingSchemeVersion": "1.0"
            },
            "Inference": {
              "annotatorConfidence": false
            },
            "AllowedTerm": [
              {
                "codeMeaning": "Left",
                "codeValue": "2574089",
                "codingSchemeDesignator": "caDSR",
                "codingSchemeVersion": "1.0"
              },
              {
                "codeMeaning": "No Contrast Enhancement",
                "codeValue": "3262719",
                "codingSchemeDesignator": "caDSR",
                "codingSchemeVersion": "1.0",
                "defaultAnswer": true
              },
              {
                "codeMeaning": "Between Two Thirds and One Third ",
                "codeValue": "3262722",
                "codingSchemeDesignator": "caDSR",
                "codingSchemeVersion": "1.0"
              }
            ]
          },
          {
            "authors": "AIM Team",
            "explanatoryText": "Calculation",
            "id": "2.25.316621944217354986956136852674485484897",
            "itemNumber": 4,
            "label": "Calculation",
            "maxCardinality": 1,
            "minCardinality": 1,
            "shouldDisplay": true,
            "QuestionType": {
              "codeMeaning": "What is the anatomical position?",
              "codeValue": "QT-K09373",
              "codingSchemeDesignator": "99PRIVATEQA",
              "codingSchemeVersion": "1.0"
            },
            "Calculation": {
              "CalculationType": [
                {
                  "codeMeaning": "Algorithm Manufacturer",
                  "codeValue": "122405",
                  "codingSchemeDesignator": "DCM",
                  "codingSchemeVersion": "1.0",
                  "AlgorithmType": [
                    {
                      "algorithmName": "na",
                      "algorithmVersion": "na",
                      "codeMeaning": "Algorithm Parameters",
                      "codeValue": "111002",
                      "codingSchemeDesignator": "DCM",
                      "codingSchemeVersion": "1.0",
                      "description": "Algorithm",
                      "mathML": "na"
                    },
                    {
                      "algorithmName": "NA",
                      "algorithmVersion": "NA",
                      "codeMeaning": "Non-Target Lesion Incomplete Response or Stable Disease",
                      "codeValue": "112046",
                      "codingSchemeDesignator": "DCM",
                      "codingSchemeVersion": "1.0",
                      "description": "AL-2",
                      "mathML": "NA",
                      "uniqueIdentifier": "2.25.159918858042017011226795796657810478482"
                    }
                  ]
                }
              ]
            }
          },
          {
            "authors": "AIM Team",
            "explanatoryText": "Draw a line",
            "id": "2.25.96258620923756115961136393481188603332",
            "itemNumber": 5,
            "label": "Line",
            "maxCardinality": 1,
            "minCardinality": 1,
            "shouldDisplay": true,
            "QuestionType": {
              "codeMeaning": "What have you seen on the image?",
              "codeValue": "QT-839565",
              "codingSchemeDesignator": "99PRIVATEQA",
              "codingSchemeVersion": "1.0"
            },
            "GeometricShape": "MultiPoint"
          },
          {
            "authors": "Default User",
            "explanatoryText": "Imaging Observation II",
            "id": "2.25.331558201624197906250695550755625883257",
            "itemNumber": 6,
            "label": "IO-2",
            "maxCardinality": 1,
            "minCardinality": 1,
            "shouldDisplay": true,
            "QuestionType": {
              "codeMeaning": "What have you seen on the image?",
              "codeValue": "QT-839565",
              "codingSchemeDesignator": "99PRIVATEQA",
              "codingSchemeVersion": "1.0"
            },
            "ImagingObservation": {
              "annotatorConfidence": false
            },
            "AllowedTerm": [
              {
                "codeMeaning": "Mass",
                "codeValue": "C0577559",
                "codingSchemeDesignator": "NCIm",
                "codingSchemeVersion": "1.0"
              },
              {
                "codeMeaning": "Disease ",
                "codeValue": "C0012634 ",
                "codingSchemeDesignator": "NCIm",
                "codingSchemeVersion": "1.0"
              },
              {
                "codeMeaning": "Indeterminate",
                "codeValue": "C0205258",
                "codingSchemeDesignator": "NCIm",
                "codingSchemeVersion": "1.0"
              },
              {
                "codeMeaning": "Anteroseptal",
                "codeValue": "99PI-349877",
                "codingSchemeDesignator": "99Privt",
                "codingSchemeVersion": "1.0"
              },
              {
                "codeMeaning": "mid ascending aorta",
                "codeValue": "99PI-084624",
                "codingSchemeDesignator": "99Privt",
                "codingSchemeVersion": "1.0"
              }
            ]
          }
        ]
      }
    ],
    "Tags": {
      "Tag": [
        {
          "TagName": {
            "codeMeaning": "Estimated Dose Level Category Code",
            "codeValue": "2188618",
            "codingSchemeDesignator": "CTEP",
            "codingSchemeVersion": "1.0"
          },
          "TagValue": {
            "StringValue": "sadfsdafas"
          }
        },
        {
          "TagName": {
            "codeMeaning": "Non-Lesion at Baseline",
            "codeValue": "112076",
            "codingSchemeDesignator": "DCM",
            "codingSchemeVersion": "1.0"
          },
          "TagValue": {
            "CodedValue": {
              "codeMeaning": "Target Lesion Stable Disease",
              "codeValue": "112044",
              "codingSchemeDesignator": "DCM",
              "codingSchemeVersion": "1.0"
            }
          }
        }
      ]
    }
  }
};

export var testing_quantifiers = {
  "TemplateContainer": {
    "xmlns": "gme://caCORE.caCORE/3.2/edu.northwestern.radiology.AIMTemplate",
    "xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
    "authors": "Debra Willrett",
    "creationDate": "2013-04-23",
    "description": "group of testing templates",
    "name": "testing group",
    "uid": "2.25.253585364542409665924522900698515239688",
    "version": "1.0",
    "xsi:schemaLocation": "gme://caCORE.caCORE/3.2/edu.northwestern.radiology.AIMTemplate AIMTemplate_v2rv13.xsd",
    "Template": [
      {
        "authors": "Default User",
        "codeMeaning": "quantifiers",
        "codeValue": "RID34404",
        "codingSchemeDesignator": "RadLex",
        "codingSchemeVersion": "1.0",
        "creationDate": "2015-01-30",
        "description": "testing quantifiers",
        "modality": "CT",
        "name": "testing quantifiers",
        "templateType": "Image",
        "uid": "2.25.305950297635354055408781113620318767229",
        "version": "1",
        "Component": [
          {
            "authors": "Default User",
            "id": "2.25.16143455523208661378899388598576685824",
            "itemNumber": 2,
            "label": "below leg",
            "maxCardinality": 1,
            "minCardinality": 1,
            "shouldDisplay": true,
            "ImagingObservation": {
              "annotatorConfidence": false,
              "ImagingObservationCharacteristic": [
                {
                  "annotatorConfidence": false,
                  "authors": "Default User",
                  "id": "2.25.158753935946060284680879850983435280828",
                  "itemNumber": 0,
                  "label": "foot",
                  "maxCardinality": 1,
                  "minCardinality": 1,
                  "shouldDisplay": true,
                  "AllowedTerm": [
                    {
                      "codeMeaning": "claw foot",
                      "codeValue": "RID35083",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "first lumbrical muscle of foot",
                      "codeValue": "RID13379",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0",
                      "CharacteristicQuantification": [
                        {
                          "annotatorConfidence": false,
                          "characteristicQuantificationIndex": 0,
                          "name": "interval",
                          "Interval": [
                            {
                              "askForInput": "false",
                              "maxOperator": "Equal",
                              "maxValue": "1.0",
                              "minOperator": "Equal",
                              "minValue": "0.0",
                              "ucumString": "0-1",
                              "valueLabel": "0-1"
                            },
                            {
                              "askForInput": "false",
                              "maxOperator": "Equal",
                              "maxValue": "2.0",
                              "minOperator": "Equal",
                              "minValue": "1.0",
                              "ucumString": "1-2",
                              "valueLabel": "1-2"
                            }
                          ]
                        }
                      ]
                    }
                  ]
                }
              ]
            },
            "AllowedTerm": [
              {
                "codeMeaning": "tendon of arm",
                "codeValue": "RID2006",
                "codingSchemeDesignator": "RadLex",
                "codingSchemeVersion": "1.0"
              },
              {
                "codeMeaning": "deep skeletal muscle of volar forearm",
                "codeValue": "RID2167",
                "codingSchemeDesignator": "RadLex",
                "codingSchemeVersion": "1.0"
              }
            ]
          }
        ]
      }
    ],
    "Tags": {
      "Tag": [
        {
          "TagName": {
            "codeMeaning": "Target Lesion Progressive Disease",
            "codeValue": "112043",
            "codingSchemeDesignator": "DCM",
            "codingSchemeVersion": "1.0"
          },
          "TagValue": {
            "CodedValue": {
              "codeMeaning": "Target Lesion Progressive Disease",
              "codeValue": "112043",
              "codingSchemeDesignator": "DCM",
              "codingSchemeVersion": "1.0"
            }
          }
        },
        {
          "TagName": {
            "codeMeaning": "Non-Target Lesion Incomplete Response or Stable Disease",
            "codeValue": "112046",
            "codingSchemeDesignator": "DCM",
            "codingSchemeVersion": "1.0"
          },
          "TagValue": {
            "CodedValue": {
              "codeMeaning": "Non-Target Lesion Incomplete Response or Stable Disease",
              "codeValue": "112046",
              "codingSchemeDesignator": "DCM",
              "codingSchemeVersion": "1.0"
            }
          }
        }
      ]
    }
  }
};
export var VASARILGG42ePAD = {
  "TemplateContainer": {
    "xmlns": "gme://caCORE.caCORE/3.2/edu.northwestern.radiology.AIMTemplate",
    "xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
    "authors": "Justin Kirby",
    "creationDate": "2013-08-26",
    "description": "Baseline Glioma MR tumor assessment to include potential features for low grade glioma (LGG).",
    "name": "VASARI LGG 4.2",
    "uid": "2.25.154702496015696619913702792331772512838",
    "version": "4.2",
    "xsi:schemaLocation": "gme://caCORE.caCORE/3.2/edu.northwestern.radiology.AIMTemplate AIMTemplate_v2rv13.xsd",
    "Template": [
      {
        "authors": "Justin Kirby",
        "codeMeaning": "VASARI",
        "codeValue": "99PRI_TC_0A23",
        "codingSchemeDesignator": "99PRI_TempCode",
        "codingSchemeVersion": "1.0",
        "creationDate": "2013-08-26",
        "description": "Baseline Glioma MR tumor assessment to include potential features for low grade glioma (LGG).",
        "modality": "MR",
        "name": "VASARI 4.2 for ePAD",
        "templateType": "Image",
        "uid": "2.25.157319026500100654541531571593125855847",
        "version": "4.2",
        "Component": [
          {
            "authors": "Justin Kirby",
            "id": "2.25.150776022310855362644669615058239870060",
            "itemNumber": 0,
            "label": "Tumor",
            "maxCardinality": 1,
            "minCardinality": 1,
            "shouldDisplay": false,
            "ImagingObservation": {
              "annotatorConfidence": false,
              "ImagingObservationCharacteristic": [
                {
                  "annotatorConfidence": false,
                  "authors": "Justin Kirby",
                  "explanatoryText": "Quality assurance pre-check. Inventory of required image series including FLAIR/T2 and pre/post contrast T1WI.",
                  "id": "2.25.41762360117754513539982904068277651900",
                  "itemNumber": 0,
                  "label": "F0 - Image QA",
                  "maxCardinality": 4,
                  "minCardinality": 0,
                  "shouldDisplay": true,
                  "AllowedTerm": [
                    {
                      "codeMeaning": "Post biopsy (requires adjudication)",
                      "codeValue": "01",
                      "codingSchemeDesignator": "99VASARI",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "Post-op study (disqualified)",
                      "codeValue": "02",
                      "codingSchemeDesignator": "99VASARI",
                      "codingSchemeVersion": "1.0",
                      "noMoreQuestions": "true"
                    },
                    {
                      "codeMeaning": "No Contrast Injected (disqualified)",
                      "codeValue": "03",
                      "codingSchemeDesignator": "99VASARI",
                      "codingSchemeVersion": "1.0",
                      "noMoreQuestions": "true"
                    },
                    {
                      "codeMeaning": "No T2 AND no T2 FLAIR images (disqualified)",
                      "codeValue": "04",
                      "codingSchemeDesignator": "99VASARI",
                      "codingSchemeVersion": "1.0",
                      "noMoreQuestions": "true"
                    }
                  ]
                },
                {
                  "annotatorConfidence": false,
                  "authors": "Justin Kirby",
                  "explanatoryText": "Location of tumor geographic center (using either CET or nCET); If multiple lesions/tumor, the location of the single largest component of the tumor. ",
                  "id": "2.25.176207087037859470836228378719456039233",
                  "itemNumber": 1,
                  "label": "F1 - Anatomic Center",
                  "maxCardinality": 1,
                  "minCardinality": 1,
                  "shouldDisplay": true,
                  "AllowedTerm": [
                    {
                      "codeMeaning": "frontal lobe",
                      "codeValue": "RID6440",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "temporal lobe",
                      "codeValue": "RID6476",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "parietal lobe",
                      "codeValue": "RID6493",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "occipital lobe",
                      "codeValue": "RID6502",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "insula",
                      "codeValue": "RID6472",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "brainstem",
                      "codeValue": "RID6677",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "cerebellum",
                      "codeValue": "RID6815",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "lentiform nucleus",
                      "codeValue": "RID6549",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "caudate nucleus",
                      "codeValue": "RID6545",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "thalamus",
                      "codeValue": "RID6578",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "corpus callosum",
                      "codeValue": "RID6915",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "Posterior temporal/inferior parietal/anterior lateral occipital region",
                      "codeValue": "05",
                      "codingSchemeDesignator": "99VASARI",
                      "codingSchemeVersion": "1.0",
                      "defaultAnswer": true
                    }
                  ]
                },
                {
                  "annotatorConfidence": false,
                  "authors": "Justin Kirby",
                  "explanatoryText": "Side of tumor center irrespective of whether the tumor crosses into the contralateral hemisphere.  If multiple lesions/tumor, the location of the single largest component of the tumor. If the tumor crosses midline, select the side of greater tumor volume.",
                  "id": "2.25.232717518690915622770043036906281482401",
                  "itemNumber": 2,
                  "label": "F2 - Side of Tumor Center",
                  "maxCardinality": 1,
                  "minCardinality": 1,
                  "shouldDisplay": true,
                  "AllowedTerm": [
                    {
                      "codeMeaning": "Right",
                      "codeValue": "G-A100",
                      "codingSchemeDesignator": "SRT",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "Center/Bilateral",
                      "codeValue": "G-A102",
                      "codingSchemeDesignator": "SRT",
                      "codingSchemeVersion": "1.0",
                      "defaultAnswer": true
                    },
                    {
                      "codeMeaning": "Left",
                      "codeValue": "G-A101",
                      "codingSchemeDesignator": "SRT",
                      "codingSchemeVersion": "1.0"
                    }
                  ]
                },
                {
                  "annotatorConfidence": false,
                  "authors": "Justin Kirby",
                  "explanatoryText": "Cardinal feature assessment. Assuming that the entire abnormality (“lesion”) may be comprised of: (1) an enhancing component (CET), (2) a non-enhancing component (nCET), (3) a necrotic component and (4) a edema component;  when assessing relative proportions of the these four features through the entire volume, provide in rank order where nonenhancing tumor (nCET and not edema) would occur in relative proportion to the other cardinal features (where a response of 1 indicates that this feature comprises the majority of the tumor footprint and 4 is the minority). If the feature is not present with reasonable certainty then select None.    Non-enhancing tumor (nCET) is defined as regions of non-enhancing T2W intermediate hyperintensity (less than the intensity of cerebrospinal fluid or vasogenic edema, with corresponding T1W hypointensity) that are associated with mass effect and architectural distortion, including blurring of the gray-white interface. (This may be difficult to discern from vasogenic edema).",
                  "id": "2.25.44354855842637669359741888365294257264",
                  "itemNumber": 3,
                  "label": "F6 - Relative Proportion of nCET",
                  "maxCardinality": 1,
                  "minCardinality": 1,
                  "shouldDisplay": true,
                  "AllowedTerm": [
                    {
                      "codeMeaning": "1",
                      "codeValue": "RID5996",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "2",
                      "codeValue": "RID5998",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "3",
                      "codeValue": "RID6000",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "4",
                      "codeValue": "RID6002",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "none",
                      "codeValue": "RID28454",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0",
                      "defaultAnswer": true
                    }
                  ]
                },
                {
                  "annotatorConfidence": false,
                  "authors": "Default User",
                  "explanatoryText": "Cardinal feature assessment. Assuming that the entire abnormality (“lesion”) may be comprised of: (1) an enhancing component, (2) a non-enhancing component, (3) a necrotic component and (4) a edema component; when assessing relative proportions of the these four features through the entire lesion volume, provide in rank order where vasogenic edema would occur in relative proportion to the other cardinal features (where a response of 1 indicates that this feature comprises the majority of the tissue footprint). If the feature is not present with reasonable certainty then select None.     Edema should be greater in signal than nCET and somewhat lower in signal than CSF on T2W or T2W FLAIR. Pseudopods are characteristic of edema extending up to the subcortical white matter but not infiltrating gray matter/cortex.",
                  "id": "2.25.39965913395033787783105725303724230275",
                  "itemNumber": 4,
                  "label": "F14 - Relative Proportion of Edema",
                  "maxCardinality": 1,
                  "minCardinality": 1,
                  "shouldDisplay": true,
                  "AllowedTerm": [
                    {
                      "codeMeaning": "1",
                      "codeValue": "RID5996",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "2",
                      "codeValue": "RID5998",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "3",
                      "codeValue": "RID6000",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "4",
                      "codeValue": "RID6002",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "none",
                      "codeValue": "RID28454",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0",
                      "defaultAnswer": true
                    }
                  ]
                },
                {
                  "annotatorConfidence": false,
                  "authors": "Default User",
                  "explanatoryText": "Cardinal feature assessment. Assuming that the entire abnormality (“lesion”) may be comprised of: (1) an enhancing component, (2) a non-enhancing component, (3) a necrotic component and (4) a edema component; when assessing relative proportions of the these four features through the entire lesion volume, provide in rank order where enhancing tumor would occur in relative proportion to the other cardinal features (where a response of 1 indicates that this feature comprises the majority of the lesion footprint). If the feature is not present with reasonable certainty then select None.",
                  "id": "2.25.78683761429594522536391487074591144293",
                  "itemNumber": 5,
                  "label": "F5 - Relative Proportion of Enhancing Tissue",
                  "maxCardinality": 1,
                  "minCardinality": 1,
                  "shouldDisplay": true,
                  "AllowedTerm": [
                    {
                      "codeMeaning": "1",
                      "codeValue": "RID5996",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "2",
                      "codeValue": "RID5998",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "3",
                      "codeValue": "RID6000",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "4",
                      "codeValue": "RID6002",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "none",
                      "codeValue": "RID28454",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0",
                      "defaultAnswer": true
                    }
                  ]
                },
                {
                  "annotatorConfidence": false,
                  "authors": "Default User",
                  "explanatoryText": "Cardinal feature assessment. Assuming that the entire abnormality (“lesion”) may be comprised of: (1) an enhancing component, (2) a non-enhancing component, (3) a necrotic component and (4) a edema component; when assessing relative proportions of the these four features through the entire tissue volume, provide in rank order where necrosis would occur in relative proportion to the other cardinal features (where a response of 1 indicates that this feature comprises the majority of the tissue footprint). If the feature is not present with reasonable certainty then select None.    Necrosis is defined as a region within the tumor that does not enhance, is intermediate to hyperintense on T2WI and hypointense on T1W images, and has an irregular border).",
                  "id": "2.25.44789955006717697624977915911861534414",
                  "itemNumber": 6,
                  "label": "F7 - Relative Proportion of Necrotic Tissue ",
                  "maxCardinality": 1,
                  "minCardinality": 1,
                  "shouldDisplay": true,
                  "AllowedTerm": [
                    {
                      "codeMeaning": "1",
                      "codeValue": "RID5996",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "2",
                      "codeValue": "RID5998",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "3",
                      "codeValue": "RID6000",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "4",
                      "codeValue": "RID6002",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "none",
                      "codeValue": "RID28454",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0",
                      "defaultAnswer": true
                    }
                  ]
                },
                {
                  "annotatorConfidence": false,
                  "authors": "Justin Kirby",
                  "explanatoryText": "T2/FLAIR envelope crosses midline is defined by any T2/FLAIR signal of the lesion envelope that extends into the contralateral hemisphere through white matter commissures usually expected at the midline (exclusive of herniated ipsilateral tissue).  Unless otherwise specified, if there are multiple lesions in the same patient, the feature applies to the most aggressive-appearing lesion.  If all lesions appear equally aggressive, the feature applies to the larger/largest lesion.  Aggressiveness should be considered as the suspected area of highest-grade tumor (the area that would ideally be biopsied for accurate tumor grading, assuming injury to functional areas is not considered).",
                  "id": "2.25.122361456361381677712105130790092686431",
                  "itemNumber": 7,
                  "label": "F22 - T2/FLAIR envelope  Crosses Midline",
                  "maxCardinality": 1,
                  "minCardinality": 1,
                  "shouldDisplay": true,
                  "AllowedTerm": [
                    {
                      "codeMeaning": "no",
                      "codeValue": "RID28475",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0",
                      "defaultAnswer": true
                    },
                    {
                      "codeMeaning": "yes",
                      "codeValue": "RID28474",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    }
                  ]
                },
                {
                  "annotatorConfidence": false,
                  "authors": "Justin Kirby",
                  "explanatoryText": "Using the T2WI preferably (or T2 FLAIR if no T2WI are available) while comparing to post-contrast T1-weighted images, assess the definition of the boundary between the T2 envelope and normal parenchyma or CET.  Evaluate the proportion of the entire lesion boundary that is well-defined or poorly-defined. If most of the outside margin of the lesion is well-defined (i.e. sharply marginated) and smooth (geographic), versus if the margin is poorly-defined (fluffy or indistinct).  Unless otherwise specified, if there are multiple lesions in the same patient, the feature applies to the most aggressive-appearing lesion.  If all lesions appear equally aggressive, the feature applies to the larger/largest lesion.  Aggressiveness should be considered as the suspected area of highest-grade tumor (the area that would ideally be biopsied for accurate tumor grading, assuming injury to functional areas is not considered).",
                  "id": "2.25.106559230524219651563830084341678542715",
                  "itemNumber": 8,
                  "label": "F13 - Definition of the non-enhancing margin (e.g. Grade III)",
                  "maxCardinality": 1,
                  "minCardinality": 1,
                  "shouldDisplay": true,
                  "AllowedTerm": [
                    {
                      "codeMeaning": "Completely well-defined (100%)",
                      "codeValue": "11",
                      "codingSchemeDesignator": "99VASARI",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "Mostly well-defined (>two thirds)",
                      "codeValue": "12",
                      "codingSchemeDesignator": "99VASARI",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "Mixed (@ 50-50)",
                      "codeValue": "13",
                      "codingSchemeDesignator": "99VASARI",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "Mostly poorly-defined (> two thirds)",
                      "codeValue": "14",
                      "codingSchemeDesignator": "99VASARI",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "Completely ill-defined (100%)",
                      "codeValue": "15",
                      "codingSchemeDesignator": "99VASARI",
                      "codingSchemeVersion": "1.0",
                      "defaultAnswer": true
                    }
                  ]
                },
                {
                  "annotatorConfidence": false,
                  "authors": "Justin Kirby",
                  "explanatoryText": "Qualitative degree of contrast enhancement is defined as havingall or portions of the tumor that demonstrate significantly higher signal on the postcontrast T1W images compared to precontrast T1W images.  Mild = when barely discernible but unequivocal degree of enhancement is present relative to pre-contrast images. Marked = obvious tissue enhancement.    (If it does not appear that contrast was administered, the case should have been disqualified in feature F0.)   Unless otherwise specified, if there are multiple lesions in the same patient, the feature applies to the most aggressive-appearing lesion.  If all lesions appear equally aggressive, the feature applies to the larger/largest lesion.  Aggressiveness should be considered as the suspected area of highest-grade tumor (the area that would ideally be biopsied for accurate tumor grading, assuming injury to functional areas is not considered).",
                  "id": "2.25.183360277954448684227779109363922125763",
                  "itemNumber": 9,
                  "label": "F4 - Enhancement Quality",
                  "maxCardinality": 1,
                  "minCardinality": 1,
                  "shouldDisplay": true,
                  "AllowedTerm": [
                    {
                      "codeMeaning": "No Contrast Enhancement",
                      "codeValue": "16",
                      "codingSchemeDesignator": "99VASARI",
                      "codingSchemeVersion": "1.0",
                      "defaultAnswer": true,
                      "nextId": "2.25.26682643709598967654598600492845350904"
                    },
                    {
                      "codeMeaning": "Mild",
                      "codeValue": "RID5671",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "Marked",
                      "codeValue": "RID34299",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    }
                  ]
                },
                {
                  "annotatorConfidence": false,
                  "authors": "Justin Kirby",
                  "explanatoryText": "If most of the enhancing rim is thin, regular, and measures < 3mm in thickness and has homogenous enhancement the grade is minimal. If most of the rim demonstrates nodular and/or thick enhancement measuring 3mm or more, the grade is thick/nodular. If there is only solid enhancement and no rim, the grade is solid.  (If it does not appear that contrast was administered, the case should have been disqualified in feature F0.)   Unless otherwise specified, if there are multiple lesions in the same patient, the feature applies to the most aggressive-appearing lesion.  If all lesions appear equally aggressive, the feature applies to the larger/largest lesion.  Aggressiveness should be considered as the suspected area of highest-grade tumor (the area that would ideally be biopsied for accurate tumor grading, assuming injury to functional areas is not considered).",
                  "id": "2.25.107001996721789954075761163370350439566",
                  "itemNumber": 10,
                  "label": "F11 - Thickness of Enhancing Margin",
                  "maxCardinality": 1,
                  "minCardinality": 1,
                  "shouldDisplay": true,
                  "AllowedTerm": [
                    {
                      "codeMeaning": "No Contrast Enhancement",
                      "codeValue": "16",
                      "codingSchemeDesignator": "99VASARI",
                      "codingSchemeVersion": "1.0",
                      "defaultAnswer": true
                    },
                    {
                      "codeMeaning": "Minimal",
                      "codeValue": "RID5670",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "Thick/nodular (=> 3mm)",
                      "codeValue": "RID28672",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "Solid",
                      "codeValue": "RID5741",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    }
                  ]
                },
                {
                  "annotatorConfidence": false,
                  "authors": "Justin Kirby",
                  "explanatoryText": "Assess if most of the outside margin of the enhancement is well defined (i.e. sharply marginated) or poorly-defined (fluffy or indistinct). Are you able to easily trace the margin of enhancement? Assess the proportion of the enhancing rim that is well-defined versus poorly defined and respond accordingly. If both thicker slices and thinner slices of post-contrast images are available, use the thinner slices.  Unless otherwise specified, if there are multiple lesions in the same patient, the feature applies to the most aggressive-appearing lesion.  If all lesions appear equally aggressive, the feature applies to the larger/largest lesion.  Aggressiveness should be considered as the suspected area of highest-grade tumor (the area that would ideally be biopsied for accurate tumor grading, assuming injury to functional areas is not considered).",
                  "id": "2.25.96907076645142593218277802103517844235",
                  "itemNumber": 11,
                  "label": "F12 - Definition of the Enhancing Margin",
                  "maxCardinality": 1,
                  "minCardinality": 1,
                  "shouldDisplay": true,
                  "AllowedTerm": [
                    {
                      "codeMeaning": "No Contrast Enhancement",
                      "codeValue": "16",
                      "codingSchemeDesignator": "99VASARI",
                      "codingSchemeVersion": "1.0",
                      "defaultAnswer": true
                    },
                    {
                      "codeMeaning": "Completely well-defined (100%)",
                      "codeValue": "17",
                      "codingSchemeDesignator": "99VASARI",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "Mostly well-defined (> two thirds)",
                      "codeValue": "18",
                      "codingSchemeDesignator": "99VASARI",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "Mixed (@ 50-50)",
                      "codeValue": "19",
                      "codingSchemeDesignator": "99VASARI",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "Mostly poorly-defined (> two thirds)",
                      "codeValue": "20",
                      "codingSchemeDesignator": "99VASARI",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "Completely ill-defined (100%)",
                      "codeValue": "21",
                      "codingSchemeDesignator": "99VASARI",
                      "codingSchemeVersion": "1.0"
                    }
                  ]
                },
                {
                  "annotatorConfidence": false,
                  "authors": "Justin Kirby",
                  "explanatoryText": "Enhancing tissue crosses midline is defined by any CET that extends into the contralateral hemisphere through white matter commissures usually expected at the midline (exclusive of herniated ipsilateral tissue).",
                  "id": "2.25.200903160931839215990776770240425301421",
                  "itemNumber": 12,
                  "label": "F23 - Enhancing tumor Crosses Midline",
                  "maxCardinality": 1,
                  "minCardinality": 1,
                  "shouldDisplay": true,
                  "AllowedTerm": [
                    {
                      "codeMeaning": "No Contrast Enhancement",
                      "codeValue": "16",
                      "codingSchemeDesignator": "99VASARI",
                      "codingSchemeVersion": "1.0",
                      "defaultAnswer": true
                    },
                    {
                      "codeMeaning": "no",
                      "codeValue": "RID28475",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "yes",
                      "codeValue": "RID28474",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    }
                  ]
                },
                {
                  "annotatorConfidence": false,
                  "authors": "Justin Kirby",
                  "explanatoryText": "A satellite lesion is defined by one or more areas of CET within the region of T2/FLAIR signal abnormality surrounding the dominant lesion but not contiguous in any part with the major enhancing tumor mass.  This is in distinction from a multifocal lesion.  No enhancing tumor rather than absent should be selected if there is no enhancing tumor.",
                  "id": "2.25.250254746072336007090635407167613459133",
                  "itemNumber": 13,
                  "label": "F24 - Satellites",
                  "maxCardinality": 1,
                  "minCardinality": 1,
                  "shouldDisplay": true,
                  "AllowedTerm": [
                    {
                      "codeMeaning": "absent",
                      "codeValue": "RID28473",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0",
                      "defaultAnswer": true
                    },
                    {
                      "codeMeaning": "present",
                      "codeValue": "RID28472",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "No enhancing tumor",
                      "codeValue": "RID6056",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    }
                  ]
                },
                {
                  "annotatorConfidence": false,
                  "authors": "Justin Kirby",
                  "explanatoryText": "When assessing the complexity of the internal architecture of the tumor on FLAIR or T2WI overall grade the uniformity of the tumor matrix (exclusive of what appears to clearly be edema and exclusive of cysts/necrosis).  Select completely homogeneous when the tumor matrix is completely uniform in consistency; mostly homogeneous when more than 2/3 of the tumor matrix is uniform; mixed when about half of the tumor is homogeneous; mostly heterogeneous when more than 2/3 of the tumor volume is non-uniform; completely heterogeneous when all of the tumor matrix is non-uniform.  FLAIR should be used primarily.  T2WI can be used when FLAIR images are not included.",
                  "id": "2.25.26682643709598967654598600492845350904",
                  "itemNumber": 14,
                  "label": "F31 - Heterogeneity",
                  "maxCardinality": 1,
                  "minCardinality": 1,
                  "shouldDisplay": true,
                  "AllowedTerm": [
                    {
                      "codeMeaning": "Completely homogeneous (100%)",
                      "codeValue": "22",
                      "codingSchemeDesignator": "99VASARI",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "Mostly homogeneous (> two thirds)",
                      "codeValue": "23",
                      "codingSchemeDesignator": "99VASARI",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "Mixed (@ 50-50)",
                      "codeValue": "24",
                      "codingSchemeDesignator": "99VASARI",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "Mostly heterogeneous (> two thirds)",
                      "codeValue": "25",
                      "codingSchemeDesignator": "99VASARI",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "Completely heterogeneous (100%)",
                      "codeValue": "26",
                      "codingSchemeDesignator": "99VASARI",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "Indeterminate",
                      "codeValue": "27",
                      "codingSchemeDesignator": "99VASARI",
                      "codingSchemeVersion": "1.0",
                      "defaultAnswer": true
                    }
                  ]
                },
                {
                  "annotatorConfidence": false,
                  "authors": "Justin Kirby",
                  "explanatoryText": "Shape is defined as the overall contour of the abnormal tissue that you would characterize as a tumor boundary. Which descriptor best defines the shape of the entire mass: round, ovoid, lobulated or irregular.  Consider the overall boundaries of the CET primarily.  If there is no CET, then consider the shape of the nCET exclusive of edema.  If neither seem to apply, select none apply.",
                  "id": "2.25.89697414760266572521897673992093043420",
                  "itemNumber": 15,
                  "label": "F32 - Shape",
                  "maxCardinality": 1,
                  "minCardinality": 1,
                  "shouldDisplay": true,
                  "AllowedTerm": [
                    {
                      "codeMeaning": "Round/Circular/Spherical",
                      "codeValue": "RID29173",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "Ovoid",
                      "codeValue": "RID29223",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "Lobulated",
                      "codeValue": "RID29174",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "Irregular",
                      "codeValue": "RID29215",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "None Apply",
                      "codeValue": "RID28454",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0",
                      "defaultAnswer": true
                    }
                  ]
                },
                {
                  "annotatorConfidence": false,
                  "authors": "Justin Kirby",
                  "explanatoryText": "Cysts are well defined, rounded, often eccentric regions of very bright T2W signal and low T1W signal essentially matching CSF signal intensity, with very thin, regular, smooth, nonenhancing or regularly enhancing walls, possibly with thin, regular, internal septations.  Differentiate from a necrotic enhancing tumor cavity with thick irregular walls and complex internal fluid.",
                  "id": "2.25.36798094312158401784401963599403502954",
                  "itemNumber": 16,
                  "label": "F8 - Cyst(s)",
                  "maxCardinality": 1,
                  "minCardinality": 1,
                  "shouldDisplay": true,
                  "AllowedTerm": [
                    {
                      "codeMeaning": "absent",
                      "codeValue": "RID28473",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0",
                      "defaultAnswer": true
                    },
                    {
                      "codeMeaning": "present",
                      "codeValue": "RID28472",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    }
                  ]
                },
                {
                  "annotatorConfidence": false,
                  "authors": "Justin Kirby",
                  "explanatoryText": "Multiple separate lesions without continuity of the T2/FLAIR envelope.  Gliomatosis refers to generalized neoplastic transformation of the white matter of at least 3 lobes.",
                  "id": "2.25.122848646282931218782733302616118513507",
                  "itemNumber": 17,
                  "label": "F9 - Multiple lesions",
                  "maxCardinality": 1,
                  "minCardinality": 1,
                  "shouldDisplay": true,
                  "AllowedTerm": [
                    {
                      "codeMeaning": "Multiple lesions in the same hemisphere",
                      "codeValue": "37",
                      "codingSchemeDesignator": "99VASARI",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "Multiple lesions in different hemispheres or above and below the tentorium",
                      "codeValue": "38",
                      "codingSchemeDesignator": "99VASARI",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "Gliomatosis Cerebri",
                      "codeValue": "28",
                      "codingSchemeDesignator": "99VASARI",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "Solitary Lesion",
                      "codeValue": "39",
                      "codingSchemeDesignator": "99VASARI",
                      "codingSchemeVersion": "1.0",
                      "defaultAnswer": true
                    }
                  ]
                },
                {
                  "annotatorConfidence": false,
                  "authors": "Justin Kirby",
                  "explanatoryText": "T1/FLAIR ratio is a gross comparison in the overall lesion size between pre-contrast T1 and FLAIR (in the same plane).  Select T1~FLAIR when pre-contrast T1 abnormality (exclusive of signal intensity) approximates size of FLAIR abnormality; Select T1<FLAIR when the size of T1 abnormality is moderately smaller than the surrounding FLAIR envelope;  or select T1<<FLAIR when the size of the pre-contrast T1 abnormality is much smaller than size of FLAIR abnormality. (If no FLAIR images were provided select No FLAIR images).",
                  "id": "2.25.192557928867048244599609691480357185195",
                  "itemNumber": 18,
                  "label": "F10 - T1/FLAIR Ratio",
                  "maxCardinality": 1,
                  "minCardinality": 1,
                  "shouldDisplay": true,
                  "AllowedTerm": [
                    {
                      "codeMeaning": "T1 ~ FLAIR",
                      "codeValue": "29",
                      "codingSchemeDesignator": "99VASARI",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "T1 < FLAIR",
                      "codeValue": "30",
                      "codingSchemeDesignator": "99VASARI",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "T1 << FLAIR",
                      "codeValue": "31",
                      "codingSchemeDesignator": "99VASARI",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "No FLAIR",
                      "codeValue": "RID28454",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0",
                      "defaultAnswer": true
                    }
                  ]
                },
                {
                  "annotatorConfidence": false,
                  "authors": "Justin Kirby",
                  "explanatoryText": "Intrinsic hemorrhage anywhere in the tumor matrix. Any intrinsic foci of low signal on T2WI (or gradient echo) or high signal on T1WI.  Proportion is not a discriminating factor. Select cannot determine if findings are indistinct or may actually represent mineral instead of hemorrhage.",
                  "id": "2.25.244477578050994548304476816368493665785",
                  "itemNumber": 19,
                  "label": "F16 - Hemorrhage",
                  "maxCardinality": 1,
                  "minCardinality": 1,
                  "shouldDisplay": true,
                  "AllowedTerm": [
                    {
                      "codeMeaning": "no",
                      "codeValue": "RID28475",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "yes",
                      "codeValue": "RID28474",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "Indeterminate",
                      "codeValue": "27",
                      "codingSchemeDesignator": "99VASARI",
                      "codingSchemeVersion": "1.0",
                      "defaultAnswer": true
                    }
                  ]
                },
                {
                  "annotatorConfidence": false,
                  "authors": "Justin Kirby",
                  "explanatoryText": "Proportion of any of the entire lesion (total T2/FLAIR envelope, which includes edema, nCET, CET and necrosis) demonstrating ADC below or same as the ADC of normal-appearing white matter. The remainder of the abnormality is assumed to demonstrate increased ADC relative to normal-appearing whiate matter. (Based on ADC map only). Select equivocal when findings are equivocal.   (Select no ADC images if ADC images were not provided)",
                  "id": "2.25.195794272294395372341575500719340322354",
                  "itemNumber": 20,
                  "label": "F17 - Diffusion",
                  "maxCardinality": 1,
                  "minCardinality": 1,
                  "shouldDisplay": true,
                  "AllowedTerm": [
                    {
                      "codeMeaning": "No ADC images",
                      "codeValue": "C48660",
                      "codingSchemeDesignator": "NCIt",
                      "codingSchemeVersion": "1.0",
                      "defaultAnswer": true
                    },
                    {
                      "codeMeaning": "> 2/3",
                      "codeValue": "32",
                      "codingSchemeDesignator": "99VASARI",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "1/3 - 2/3",
                      "codeValue": "33",
                      "codingSchemeDesignator": "99VASARI",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "< 1/3",
                      "codeValue": "34",
                      "codingSchemeDesignator": "99VASARI",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "Minimal (<5%)",
                      "codeValue": "35",
                      "codingSchemeDesignator": "99VASARI",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "None",
                      "codeValue": "RID28454",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "Equivocal",
                      "codeValue": "36",
                      "codingSchemeDesignator": "99VASARI",
                      "codingSchemeVersion": "1.0"
                    }
                  ]
                },
                {
                  "annotatorConfidence": false,
                  "authors": "Justin Kirby",
                  "explanatoryText": "For non-enhancing, use T2 FLAIR preferably (or T2WI if T2 FLAIR are not available). Cortical involvement is defined by non-enhancing or enhancing tumor that extends into the cortical mantle, or if the cortex is no longer distinguishable relative to tumor.",
                  "id": "2.25.167777512011251856249859492928947268475",
                  "itemNumber": 21,
                  "label": "F20 - Cortical involvement",
                  "maxCardinality": 1,
                  "minCardinality": 1,
                  "shouldDisplay": true,
                  "AllowedTerm": [
                    {
                      "codeMeaning": "Enhancing only",
                      "codeValue": "40",
                      "codingSchemeDesignator": "99VASARI",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "Non-enhancing only",
                      "codeValue": "41",
                      "codingSchemeDesignator": "99VASARI",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "Both enhanging and non-enhancing",
                      "codeValue": "42",
                      "codingSchemeDesignator": "99VASARI",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "None",
                      "codeValue": "RID28473",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0",
                      "defaultAnswer": true
                    }
                  ]
                },
                {
                  "annotatorConfidence": false,
                  "authors": "Justin Kirby",
                  "explanatoryText": "Leptomeningeal reaction is defined by enhancement of the overlying pia/arachnoid in continuity with enhancing or non-enhancing tumor or sulcal hyperintensity on T2 FLAIR. This should be selected to capture reactive leptomeninges and/or invaded leptomeninges.  If no enhancement of the overlying pia/arachnoid in contiguity with the lesion AND no T2 FLAIR images are available, select No T2 FLAIR; do not score using standard T2W. If there IS enhancement, but no T2 FLAIR, select “present.”",
                  "id": "2.25.108391085698639462771043090863419726717",
                  "itemNumber": 22,
                  "label": "F18 - Leptomeningeal reaction",
                  "maxCardinality": 1,
                  "minCardinality": 1,
                  "shouldDisplay": true,
                  "AllowedTerm": [
                    {
                      "codeMeaning": "absent",
                      "codeValue": "RID28473",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "present",
                      "codeValue": "RID28472",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "No T2 FLAIR",
                      "codeValue": "C48660",
                      "codingSchemeDesignator": "NCIt",
                      "codingSchemeVersion": "1.0",
                      "defaultAnswer": true
                    }
                  ]
                },
                {
                  "annotatorConfidence": false,
                  "authors": "Justin Kirby",
                  "explanatoryText": "Ependymal contact is defined by any portion of the lesion abutting any adjacent ependymal surface.  This this includes any portion of the T2 envelope or any portion of CET.",
                  "id": "2.25.139645378053990855460137174034728343184",
                  "itemNumber": 23,
                  "label": "F19 - Ependymal contact",
                  "maxCardinality": 1,
                  "minCardinality": 1,
                  "shouldDisplay": true,
                  "AllowedTerm": [
                    {
                      "codeMeaning": "absent",
                      "codeValue": "RID28473",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0",
                      "defaultAnswer": true
                    },
                    {
                      "codeMeaning": "present",
                      "codeValue": "RID28472",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    }
                  ]
                },
                {
                  "annotatorConfidence": false,
                  "authors": "Justin Kirby",
                  "explanatoryText": "Deep white matter invasion is defined by enhancing or nCET tumor extending into the internal capsule, corpus callosum or brainstem. (multiple choices allowed)",
                  "id": "2.25.158474128294561234684698963176949745267",
                  "itemNumber": 24,
                  "label": "F21 - Deep WM Invasion",
                  "maxCardinality": 3,
                  "minCardinality": 1,
                  "shouldDisplay": true,
                  "AllowedTerm": [
                    {
                      "codeMeaning": "none",
                      "codeValue": "RID28454",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0",
                      "defaultAnswer": true
                    },
                    {
                      "codeMeaning": "corpus callosum",
                      "codeValue": "RID6915",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "internal capsule",
                      "codeValue": "RID6941",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "brainstem",
                      "codeValue": "RID6677",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    }
                  ]
                },
                {
                  "annotatorConfidence": false,
                  "authors": "Justin Kirby",
                  "explanatoryText": "Calvarial remodeling is defined as visible erosion/remodeling of inner table of skull (possibly a secondary sign of slow growth).",
                  "id": "2.25.232585054265451406016857784730316000640",
                  "itemNumber": 25,
                  "label": "F25 - Calvarial remodeling",
                  "maxCardinality": 1,
                  "minCardinality": 1,
                  "shouldDisplay": true,
                  "AllowedTerm": [
                    {
                      "codeMeaning": "absent",
                      "codeValue": "RID28473",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0",
                      "defaultAnswer": true
                    },
                    {
                      "codeMeaning": "present",
                      "codeValue": "RID28472",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    }
                  ]
                }
              ]
            },
            "AllowedTerm": [
              {
                "codeMeaning": "glioma",
                "codeValue": "RID4026",
                "codingSchemeDesignator": "RadLex",
                "codingSchemeVersion": "1.0",
                "defaultAnswer": true
              }
            ]
          },
          {
            "authors": "Default User",
            "explanatoryText": "Lesion size is defined as the largest perpendicular (x-y) cross- sectional diameter of entire T2 or FLAIR signal abnormality (longest dimension x perpendicular dimension) measured the single axial image that reveals the largest cross-sectional area of the lesion.  If possible, normal structures should be excluded.",
            "id": "2.25.64789457130859259574713435581518899790",
            "itemNumber": 1,
            "label": "Lesion Size (measure using the Normals tool)",
            "maxCardinality": 1,
            "minCardinality": 1,
            "shouldDisplay": true,
            "GeometricShape": "MultiPoint"
          },
          {
            "authors": "Default User",
            "explanatoryText": "Lesion size is defined as the largest perpendicular (x-y) cross- sectional diameter of entire T2 or FLAIR signal abnormality (longest dimension x perpendicular dimension) measured the single axial image that reveals the largest cross-sectional area of the lesion.  If possible, normal structures should be excluded.",
            "id": "2.25.220490962946921260789645988124320688569",
            "itemNumber": 2,
            "label": "Lesion Size (measure using the Normals tool)",
            "maxCardinality": 1,
            "minCardinality": 1,
            "shouldDisplay": false,
            "GeometricShape": "MultiPoint"
          }
        ]
      }
    ]
  }
};

//epad build templates above


//epad public templates below

export var brain_hemorrhage2 = {
  "TemplateContainer": {
    "xmlns": "gme://caCORE.caCORE/3.2/edu.northwestern.radiology.AIMTemplate",
    "xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
    "authors": "Emel Alkim",
    "creationDate": "2019-03-12",
    "description": "Brain Hemorrhage",
    "name": "Brain Hemorrhage2",
    "uid": "2.25.45334634637354734577567537",
    "version": "1.0",
    "xsi:schemaLocation": "gme://caCORE.caCORE/3.2/edu.northwestern.radiology.AIMTemplate AIMTemplate_v2rv13.xsd",
    "Template": [
      {
        "authors": "Emel Alkim",
        "codeMeaning": "Hemorrhage brain",
        "codeValue": "10019529_2",
        "codingSchemeDesignator": "MedDRA",
        "codingSchemeVersion": "1.0",
        "creationDate": "2019-03-12",
        "description": "Brain Hemorrhage Template",
        "name": "Brain Hemorrhage2",
        "uid": "2.25.7654838364537845373573733",
        "version": "1.0",
        "Component": [
          {
            "authors": "Emel Alkim",
            "explanatoryText": "Anatomical location of the hemorrhage",
            "id": "2.25.262294851361777296196529249188633480224",
            "itemNumber": 0,
            "label": "Location",
            "maxCardinality": 1,
            "minCardinality": 1,
            "shouldDisplay": true,
            "AnatomicEntity": {
              "annotatorConfidence": false,
              "AnatomicEntityCharacteristic": [
                {
                  "annotatorConfidence": false,
                  "authors": "Emel Alkim",
                  "id": "2.25.12278559737666944589750984950485394445",
                  "itemNumber": 0,
                  "label": "Laterality",
                  "maxCardinality": 1,
                  "minCardinality": 0,
                  "shouldDisplay": true,
                  "AllowedTerm": [
                    {
                      "codeMeaning": "Left",
                      "codeValue": "G-A101",
                      "codingSchemeDesignator": "SRT",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "Right",
                      "codeValue": "G-A100",
                      "codingSchemeDesignator": "SRT",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "midline",
                      "codeValue": "RID5826",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    }
                  ]
                }
              ]
            },
            "AllowedTerm": [
              {
                "codeMeaning": "intracranial",
                "codeValue": "RID6383",
                "codingSchemeDesignator": "RadLex",
                "codingSchemeVersion": "1.0"
              },
              {
                "codeMeaning": "intraparenchymal",
                "codeValue": "RID6264",
                "codingSchemeDesignator": "RadLex",
                "codingSchemeVersion": "1.0"
              },
              {
                "codeMeaning": "subarachnoid",
                "codeValue": "RID6386",
                "codingSchemeDesignator": "RadLex",
                "codingSchemeVersion": "1.0"
              },
              {
                "codeMeaning": "subdural",
                "codeValue": "RID6388",
                "codingSchemeDesignator": "RadLex",
                "codingSchemeVersion": "1.0"
              },
              {
                "codeMeaning": "intraventricular",
                "codeValue": "RID11163",
                "codingSchemeDesignator": "RadLex",
                "codingSchemeVersion": "1.0"
              }
            ]
          }
        ]
      }
    ]
  }
};

export var ICRradiogenomics = {
  "TemplateContainer": {
    "xmlns": "gme://caCORE.caCORE/3.2/edu.northwestern.radiology.AIMTemplate",
    "xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
    "authors": "Default User",
    "creationDate": "2015-10-12",
    "description": "Template used for radiogenomics project",
    "name": "ICR-radiogenomics",
    "uid": "2.25.20996590218409948140861027149860784979",
    "version": "1",
    "xsi:schemaLocation": "gme://caCORE.caCORE/3.2/edu.northwestern.radiology.AIMTemplate AIMTemplate_v2rv13.xsd",
    "Template": [
      {
        "authors": "Default User",
        "codeMeaning": "Test template",
        "codeValue": "99PRI_TT_A0489",
        "codingSchemeDesignator": "99PRI_TemplateCode",
        "codingSchemeVersion": "1.0",
        "creationDate": "2015-10-12",
        "description": "Template used for radiogenomics project at ICR",
        "name": "ICR-radiogenomics",
        "uid": "2.25.175712358270214770610308695401050481266",
        "version": "1",
        "Component": [
          {
            "authors": "Default User",
            "id": "2.25.140987056102587374744549635675754006739",
            "itemNumber": 0,
            "label": "Primary tumor",
            "maxCardinality": 1,
            "minCardinality": 1,
            "shouldDisplay": true,
            "QuestionType": {
              "codeMeaning": "Select the term that best describes the lesion",
              "codeValue": "Q1",
              "codingSchemeDesignator": "BI-RADS",
              "codingSchemeVersion": "1"
            },
            "ImagingObservation": {
              "annotatorConfidence": false
            },
            "AllowedTerm": [
              {
                "codeMeaning": "focus",
                "codeValue": "RID34301",
                "codingSchemeDesignator": "RadLex",
                "codingSchemeVersion": "1.0",
                "nextId": "2.25.212263085792332314995914180361310741168"
              },
              {
                "codeMeaning": "foci",
                "codeValue": "RID34302",
                "codingSchemeDesignator": "RadLex",
                "codingSchemeVersion": "1.0",
                "nextId": "2.25.212263085792332314995914180361310741168"
              },
              {
                "codeMeaning": "mass",
                "codeValue": "RID3874",
                "codingSchemeDesignator": "RadLex",
                "codingSchemeVersion": "1.0"
              },
              {
                "codeMeaning": "non-mass-like enhancement",
                "codeValue": "RID34342",
                "codingSchemeDesignator": "RadLex",
                "codingSchemeVersion": "1.0",
                "nextId": "2.25.62292052941835711178784778863596470830"
              }
            ]
          },
          {
            "authors": "Default User",
            "id": "2.25.300867384621652943957813647765618401605",
            "itemNumber": 1,
            "label": "Shape mass lesion",
            "maxCardinality": 1,
            "minCardinality": 1,
            "shouldDisplay": true,
            "QuestionType": {
              "codeMeaning": "Select the term that best describes the shape of the mass",
              "codeValue": "Q18",
              "codingSchemeDesignator": "BI-RADS",
              "codingSchemeVersion": "1"
            },
            "AnatomicEntity": {
              "annotatorConfidence": false
            },
            "AllowedTerm": [
              {
                "codeMeaning": "round",
                "codeValue": "RID5799",
                "codingSchemeDesignator": "RadLex",
                "codingSchemeVersion": "1.0"
              },
              {
                "codeMeaning": "oval",
                "codeValue": "RID5800",
                "codingSchemeDesignator": "RadLex",
                "codingSchemeVersion": "1.0"
              },
              {
                "codeMeaning": "lobular",
                "codeValue": "RID5801",
                "codingSchemeDesignator": "RadLex",
                "codingSchemeVersion": "1.0"
              },
              {
                "codeMeaning": "irregular",
                "codeValue": "RID5809",
                "codingSchemeDesignator": "RadLex",
                "codingSchemeVersion": "1.0"
              },
              {
                "codeMeaning": "none",
                "codeValue": "RID28454",
                "codingSchemeDesignator": "RadLex",
                "codingSchemeVersion": "1.0",
                "defaultAnswer": true
              }
            ]
          },
          {
            "authors": "Default User",
            "id": "2.25.135510590910114519444069661291861539080",
            "itemNumber": 2,
            "label": "Margin mass lesion",
            "maxCardinality": 1,
            "minCardinality": 1,
            "shouldDisplay": true,
            "QuestionType": {
              "codeMeaning": "Select the term that best describes the Margin of the mass",
              "codeValue": "Q19",
              "codingSchemeDesignator": "BI-RADS",
              "codingSchemeVersion": "1"
            },
            "AnatomicEntity": {
              "annotatorConfidence": false
            },
            "AllowedTerm": [
              {
                "codeMeaning": "smooth margin",
                "codeValue": "RID5714",
                "codingSchemeDesignator": "RadLex",
                "codingSchemeVersion": "1.0"
              },
              {
                "codeMeaning": "irregular margin",
                "codeValue": "RID5715",
                "codingSchemeDesignator": "RadLex",
                "codingSchemeVersion": "1.0"
              },
              {
                "codeMeaning": "spiculated margin",
                "codeValue": "RID5713",
                "codingSchemeDesignator": "RadLex",
                "codingSchemeVersion": "1.0"
              },
              {
                "codeMeaning": "none",
                "codeValue": "RID28454",
                "codingSchemeDesignator": "RadLex",
                "codingSchemeVersion": "1.0",
                "defaultAnswer": true
              }
            ]
          },
          {
            "authors": "Default User",
            "id": "2.25.2175622957363374588372922132343641381",
            "itemNumber": 3,
            "label": "Mass enhancement",
            "maxCardinality": 1,
            "minCardinality": 1,
            "shouldDisplay": true,
            "QuestionType": {
              "codeMeaning": "Select the term that best describes the lesion feature",
              "codeValue": "Q1",
              "codingSchemeDesignator": "BI-RADS",
              "codingSchemeVersion": "1"
            },
            "ImagingObservation": {
              "annotatorConfidence": false
            },
            "AllowedTerm": [
              {
                "codeMeaning": "homogeneous mass enhancement",
                "codeValue": "RID34304",
                "codingSchemeDesignator": "RadLex",
                "codingSchemeVersion": "1.0"
              },
              {
                "codeMeaning": "rim enhancement",
                "codeValue": "RID34303",
                "codingSchemeDesignator": "RadLex",
                "codingSchemeVersion": "1.0"
              },
              {
                "codeMeaning": "heterogeneous mass enhancement",
                "codeValue": "RID34305",
                "codingSchemeDesignator": "RadLex",
                "codingSchemeVersion": "1.0"
              },
              {
                "codeMeaning": "dark internal septation",
                "codeValue": "RID34306",
                "codingSchemeDesignator": "RadLex",
                "codingSchemeVersion": "1.0"
              },
              {
                "codeMeaning": "enhancing internal septation",
                "codeValue": "RID34307",
                "codingSchemeDesignator": "RadLex",
                "codingSchemeVersion": "1.0"
              },
              {
                "codeMeaning": "central enhancement",
                "codeValue": "RID34308",
                "codingSchemeDesignator": "RadLex",
                "codingSchemeVersion": "1.0"
              },
              {
                "codeMeaning": "none",
                "codeValue": "RID28454",
                "codingSchemeDesignator": "RadLex",
                "codingSchemeVersion": "1.0",
                "defaultAnswer": true
              }
            ]
          },
          {
            "authors": "Default User",
            "id": "2.25.62292052941835711178784778863596470830",
            "itemNumber": 4,
            "label": "Non-mass-like enhancement distribution modifiers",
            "maxCardinality": 1,
            "minCardinality": 1,
            "shouldDisplay": true,
            "QuestionType": {
              "codeMeaning": "Select the term that best describes the distribution modifiers of the non-mass-like enhancement",
              "codeValue": "Q21",
              "codingSchemeDesignator": "BI-RADS",
              "codingSchemeVersion": "1"
            },
            "ImagingObservation": {
              "annotatorConfidence": false
            },
            "AllowedTerm": [
              {
                "codeMeaning": "ductal enhancement",
                "codeValue": "RID34337",
                "codingSchemeDesignator": "RadLex",
                "codingSchemeVersion": "1.0"
              },
              {
                "codeMeaning": "focal enhancement",
                "codeValue": "RID34335",
                "codingSchemeDesignator": "RadLex",
                "codingSchemeVersion": "1.0"
              },
              {
                "codeMeaning": "linear enhancement",
                "codeValue": "RID34336",
                "codingSchemeDesignator": "RadLex",
                "codingSchemeVersion": "1.0"
              },
              {
                "codeMeaning": "segmental enhancement",
                "codeValue": "RID34338",
                "codingSchemeDesignator": "RadLex",
                "codingSchemeVersion": "1.0"
              },
              {
                "codeMeaning": "regional enhancement",
                "codeValue": "RID34339",
                "codingSchemeDesignator": "RadLex",
                "codingSchemeVersion": "1.0"
              },
              {
                "codeMeaning": "multiple regions enhancement",
                "codeValue": "RID34340",
                "codingSchemeDesignator": "RadLex",
                "codingSchemeVersion": "1.0"
              },
              {
                "codeMeaning": "none",
                "codeValue": "RID28454",
                "codingSchemeDesignator": "RadLex",
                "codingSchemeVersion": "1.0",
                "defaultAnswer": true
              }
            ]
          },
          {
            "authors": "Default User",
            "id": "2.25.261820129703985965331464807792885939231",
            "itemNumber": 5,
            "label": "non-mass-like enhancement internal enhancement",
            "maxCardinality": 1,
            "minCardinality": 1,
            "shouldDisplay": true,
            "QuestionType": {
              "codeMeaning": "Select the term that best describes the internal enhancemen of the non-mass like enhancement",
              "codeValue": "Q22",
              "codingSchemeDesignator": "BI-RADS",
              "codingSchemeVersion": "1"
            },
            "ImagingObservation": {
              "annotatorConfidence": false
            },
            "AllowedTerm": [
              {
                "codeMeaning": "homogeneous internal enhancement",
                "codeValue": "RID34421",
                "codingSchemeDesignator": "RadLex",
                "codingSchemeVersion": "1.0"
              },
              {
                "codeMeaning": "heterogeneous internal enhancement",
                "codeValue": "RID34422",
                "codingSchemeDesignator": "RadLex",
                "codingSchemeVersion": "1.0"
              },
              {
                "codeMeaning": "stippled enhancement",
                "codeValue": "RID34309",
                "codingSchemeDesignator": "RadLex",
                "codingSchemeVersion": "1.0"
              },
              {
                "codeMeaning": "clumped enhancement",
                "codeValue": "RID34310",
                "codingSchemeDesignator": "RadLex",
                "codingSchemeVersion": "1.0"
              },
              {
                "codeMeaning": "reticular enhancement",
                "codeValue": "RID34311",
                "codingSchemeDesignator": "RadLex",
                "codingSchemeVersion": "1.0"
              },
              {
                "codeMeaning": "none",
                "codeValue": "RID28454",
                "codingSchemeDesignator": "RadLex",
                "codingSchemeVersion": "1.0",
                "defaultAnswer": true
              }
            ]
          },
          {
            "authors": "Default User",
            "id": "2.25.212263085792332314995914180361310741168",
            "itemNumber": 6,
            "label": "Bilateral scan",
            "maxCardinality": 1,
            "minCardinality": 1,
            "shouldDisplay": true,
            "QuestionType": {
              "codeMeaning": "Is the scan bilateral?",
              "codeValue": "Q2",
              "codingSchemeDesignator": "BI-RADS",
              "codingSchemeVersion": "1"
            },
            "AnatomicEntity": {
              "annotatorConfidence": false
            },
            "AllowedTerm": [
              {
                "codeMeaning": "yes",
                "codeValue": "RID28474",
                "codingSchemeDesignator": "RadLex",
                "codingSchemeVersion": "1.0",
                "defaultAnswer": true
              },
              {
                "codeMeaning": "no",
                "codeValue": "RID28475",
                "codingSchemeDesignator": "RadLex",
                "codingSchemeVersion": "1.0",
                "nextId": "2.25.130113394707079981256583024933667792392"
              }
            ]
          },
          {
            "authors": "Default User",
            "id": "2.25.239403627461219343328037784107459782014",
            "itemNumber": 7,
            "label": "Symmetry image",
            "maxCardinality": 1,
            "minCardinality": 1,
            "shouldDisplay": true,
            "QuestionType": {
              "codeMeaning": "Is the scan symmetric of assymmeteric?",
              "codeValue": "Q3",
              "codingSchemeDesignator": "BI-RADS",
              "codingSchemeVersion": "1"
            },
            "AnatomicEntity": {
              "annotatorConfidence": false
            },
            "AllowedTerm": [
              {
                "codeMeaning": "symmetrical",
                "codeValue": "RID5807",
                "codingSchemeDesignator": "RadLex",
                "codingSchemeVersion": "1.0"
              },
              {
                "codeMeaning": "asymmetrical",
                "codeValue": "RID5808",
                "codingSchemeDesignator": "RadLex",
                "codingSchemeVersion": "1.0"
              },
              {
                "codeMeaning": "none",
                "codeValue": "RID28454",
                "codingSchemeDesignator": "RadLex",
                "codingSchemeVersion": "1.0",
                "defaultAnswer": true
              }
            ]
          },
          {
            "authors": "Default User",
            "id": "2.25.130113394707079981256583024933667792392",
            "itemNumber": 8,
            "label": "Other findings",
            "maxCardinality": 13,
            "minCardinality": 1,
            "shouldDisplay": true,
            "QuestionType": {
              "codeMeaning": "What are other findings?",
              "codeValue": "Q4",
              "codingSchemeDesignator": "BI-RADS",
              "codingSchemeVersion": "1"
            },
            "ImagingObservation": {
              "annotatorConfidence": false
            },
            "AllowedTerm": [
              {
                "codeMeaning": "none",
                "codeValue": "RID28454",
                "codingSchemeDesignator": "RadLex",
                "codingSchemeVersion": "1.0"
              },
              {
                "codeMeaning": "nipple retraction",
                "codeValue": "RID34269",
                "codingSchemeDesignator": "RadLex",
                "codingSchemeVersion": "1.0"
              },
              {
                "codeMeaning": "pre-contrast high ductal signal",
                "codeValue": "RID34315",
                "codingSchemeDesignator": "RadLex",
                "codingSchemeVersion": "1.0"
              },
              {
                "codeMeaning": "focal skin thickening",
                "codeValue": "RID34316",
                "codingSchemeDesignator": "RadLex",
                "codingSchemeVersion": "1.0"
              },
              {
                "codeMeaning": "diffuse skin thickening",
                "codeValue": "RID34317",
                "codingSchemeDesignator": "RadLex",
                "codingSchemeVersion": "1.0"
              },
              {
                "codeMeaning": "skin invasion",
                "codeValue": "RID34318",
                "codingSchemeDesignator": "RadLex",
                "codingSchemeVersion": "1.0"
              },
              {
                "codeMeaning": "edema",
                "codeValue": "RID4865",
                "codingSchemeDesignator": "RadLex",
                "codingSchemeVersion": "1.0"
              },
              {
                "codeMeaning": "lymphadenopathy",
                "codeValue": "RID3798",
                "codingSchemeDesignator": "RadLex",
                "codingSchemeVersion": "1.0"
              },
              {
                "codeMeaning": "pectoralis muscle invasion",
                "codeValue": "RID34319",
                "codingSchemeDesignator": "RadLex",
                "codingSchemeVersion": "1.0"
              },
              {
                "codeMeaning": "chest wall invasion",
                "codeValue": "RID34320",
                "codingSchemeDesignator": "RadLex",
                "codingSchemeVersion": "1.0"
              },
              {
                "codeMeaning": "hematoma/blood signal",
                "codeValue": "RID34322",
                "codingSchemeDesignator": "RadLex",
                "codingSchemeVersion": "1.0"
              },
              {
                "codeMeaning": "abnormal signal void",
                "codeValue": "RID34321",
                "codingSchemeDesignator": "RadLex",
                "codingSchemeVersion": "1.0"
              },
              {
                "codeMeaning": "set of cysts",
                "codeValue": "RID34370",
                "codingSchemeDesignator": "RadLex",
                "codingSchemeVersion": "1.0"
              },
              {
                "codeMeaning": "Nipple invasion",
                "codeValue": "RID49703",
                "codingSchemeDesignator": "RadLex"
              }
            ]
          },
          {
            "authors": "Default User",
            "id": "2.25.268261808145632745425493176231138744267",
            "itemNumber": 9,
            "label": "Background enhancement",
            "maxCardinality": 1,
            "minCardinality": 1,
            "shouldDisplay": true,
            "QuestionType": {
              "codeMeaning": "Select the term that best describes the background parenchymal enhancement (BPE) in the image",
              "codeValue": "Q5",
              "codingSchemeDesignator": "BI-RADS",
              "codingSchemeVersion": "1"
            },
            "ImagingObservation": {
              "annotatorConfidence": false
            },
            "AllowedTerm": [
              {
                "codeMeaning": "minimal",
                "codeValue": "RID5670",
                "codingSchemeDesignator": "RadLex",
                "codingSchemeVersion": "1.0"
              },
              {
                "codeMeaning": "mild",
                "codeValue": "RID5671",
                "codingSchemeDesignator": "RadLex",
                "codingSchemeVersion": "1.0"
              },
              {
                "codeMeaning": "moderate",
                "codeValue": "RID5672",
                "codingSchemeDesignator": "RadLex",
                "codingSchemeVersion": "1.0"
              },
              {
                "codeMeaning": "marked",
                "codeValue": "RID34299",
                "codingSchemeDesignator": "RadLex",
                "codingSchemeVersion": "1.0"
              }
            ]
          },
          {
            "authors": "Default User",
            "id": "2.25.125953272632656454716906769179257021159",
            "itemNumber": 10,
            "label": "Whole breast density",
            "maxCardinality": 1,
            "minCardinality": 1,
            "shouldDisplay": true,
            "QuestionType": {
              "codeMeaning": "Select the term that best describes the breast density",
              "codeValue": "Q6",
              "codingSchemeDesignator": "BI-RADS",
              "codingSchemeVersion": "1"
            },
            "ImagingObservation": {
              "annotatorConfidence": false
            },
            "AllowedTerm": [
              {
                "codeMeaning": "predominantly fatty",
                "codeValue": "RID34273",
                "codingSchemeDesignator": "RadLex",
                "codingSchemeVersion": "1.0"
              },
              {
                "codeMeaning": "scattered fibroglandular densities",
                "codeValue": "RID34274",
                "codingSchemeDesignator": "RadLex",
                "codingSchemeVersion": "1.0"
              },
              {
                "codeMeaning": "heterogeneously dense",
                "codeValue": "RID34275",
                "codingSchemeDesignator": "RadLex",
                "codingSchemeVersion": "1.0"
              },
              {
                "codeMeaning": "extremely dense",
                "codeValue": "RID34276",
                "codingSchemeDesignator": "RadLex",
                "codingSchemeVersion": "1.0"
              }
            ]
          },
          {
            "authors": "Default User",
            "id": "2.25.253251367227537580921607479526136176003",
            "itemNumber": 11,
            "label": "Tumor location",
            "maxCardinality": 1,
            "minCardinality": 1,
            "shouldDisplay": true,
            "QuestionType": {
              "codeMeaning": "Select the term that best describes the location characteristics of the tumor",
              "codeValue": "Q12",
              "codingSchemeDesignator": "BI-RADS",
              "codingSchemeVersion": "1"
            },
            "AnatomicEntity": {
              "annotatorConfidence": false
            },
            "AllowedTerm": [
              {
                "codeMeaning": "Unifocal",
                "codeValue": "TL1",
                "codingSchemeDesignator": "BI-RADS",
                "codingSchemeVersion": "1"
              },
              {
                "codeMeaning": "Multifocal",
                "codeValue": "TL2",
                "codingSchemeDesignator": "BI-RADS",
                "codingSchemeVersion": "1"
              },
              {
                "codeMeaning": "Multicentric",
                "codeValue": "TL3",
                "codingSchemeDesignator": "BI-RADS",
                "codingSchemeVersion": "1"
              }
            ]
          },
          {
            "authors": "Default User",
            "id": "2.25.249165002221194601217975676958793616532",
            "itemNumber": 12,
            "label": "Tumor location quadrants",
            "maxCardinality": 1,
            "minCardinality": 1,
            "shouldDisplay": true,
            "QuestionType": {
              "codeMeaning": "Where is the tumor located?",
              "codeValue": "Q11",
              "codingSchemeDesignator": "BI-RADS",
              "codingSchemeVersion": "1"
            },
            "AnatomicEntity": {
              "annotatorConfidence": false
            },
            "AllowedTerm": [
              {
                "codeMeaning": "upper inner quadrant of breast",
                "codeValue": "RID29931",
                "codingSchemeDesignator": "RadLex",
                "codingSchemeVersion": "1.0"
              },
              {
                "codeMeaning": "lower outer quadrant of breast",
                "codeValue": "RID29934",
                "codingSchemeDesignator": "RadLex",
                "codingSchemeVersion": "1.0"
              },
              {
                "codeMeaning": "lower inner quadrant of breast",
                "codeValue": "RID29937",
                "codingSchemeDesignator": "RadLex",
                "codingSchemeVersion": "1.0"
              },
              {
                "codeMeaning": "upper outer quadrant of breast",
                "codeValue": "RID29928",
                "codingSchemeDesignator": "RadLex",
                "codingSchemeVersion": "1.0"
              }
            ]
          },
          {
            "authors": "Default User",
            "id": "2.25.179073004443771871417337848440435696805",
            "itemNumber": 13,
            "label": "Tumor volume",
            "maxCardinality": 1,
            "minCardinality": 1,
            "shouldDisplay": true,
            "ImagingObservation": {
              "annotatorConfidence": false,
              "ImagingObservationCharacteristic": [
                {
                  "annotatorConfidence": false,
                  "authors": "Default User",
                  "id": "2.25.96072701948996387609911368578923688888",
                  "itemNumber": 0,
                  "label": "Region growing estimation",
                  "maxCardinality": 1,
                  "minCardinality": 1,
                  "shouldDisplay": true,
                  "AllowedTerm": [
                    {
                      "codeMeaning": "Volume quantification",
                      "codeValue": "RID35968",
                      "codingSchemeDesignator": "RadLex",
                      "CharacteristicQuantification": [
                        {
                          "annotatorConfidence": false,
                          "characteristicQuantificationIndex": 0,
                          "name": "estimation tumor volume",
                          "Quantile": {
                            "bins": "10",
                            "defaultBin": "10",
                            "maxValue": "1500.0",
                            "minValue": "100.0"
                          }
                        }
                      ]
                    }
                  ],
                  "QuestionType": {
                    "codeMeaning": "Give the estimation of tumor volume calculated by the region growing algorithm",
                    "codeValue": "Q15",
                    "codingSchemeDesignator": "BI-RADS",
                    "codingSchemeVersion": "1"
                  }
                }
              ]
            },
            "AllowedTerm": [
              {
                "codeMeaning": "volume",
                "codeValue": "RID28668",
                "codingSchemeDesignator": "RadLex",
                "codingSchemeVersion": "1.0"
              }
            ]
          },
          {
            "authors": "Default User",
            "id": "2.25.196187722755853276853476536135020334589",
            "itemNumber": 14,
            "label": "DWI findings",
            "maxCardinality": 1,
            "minCardinality": 1,
            "shouldDisplay": true,
            "ImagingObservation": {
              "annotatorConfidence": false,
              "ImagingObservationCharacteristic": [
                {
                  "annotatorConfidence": false,
                  "authors": "Default User",
                  "id": "2.25.261974527665452749190888010837919705192",
                  "itemNumber": 0,
                  "label": "Signal distribution tumor at high b-value DWI",
                  "maxCardinality": 1,
                  "minCardinality": 1,
                  "shouldDisplay": true,
                  "AllowedTerm": [
                    {
                      "codeMeaning": "distribution pattern",
                      "codeValue": "RID5958",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0",
                      "CharacteristicQuantification": [
                        {
                          "annotatorConfidence": false,
                          "characteristicQuantificationIndex": 0,
                          "name": "Signal distribution at high b-value",
                          "Quantile": {
                            "bins": "4",
                            "defaultBin": "4",
                            "maxValue": "1000.0",
                            "minValue": "0.0"
                          }
                        }
                      ]
                    }
                  ],
                  "QuestionType": {
                    "codeMeaning": "Indicate the quartile representing the distribution of the signal in the tumor at the high b-value image ",
                    "codeValue": "Q23",
                    "codingSchemeDesignator": "BI-RADS",
                    "codingSchemeVersion": "1"
                  }
                },
                {
                  "annotatorConfidence": false,
                  "authors": "Default User",
                  "id": "2.25.138842334177314658009365411616964372070",
                  "itemNumber": 1,
                  "label": "Distribution ADC value",
                  "maxCardinality": 1,
                  "minCardinality": 1,
                  "shouldDisplay": true,
                  "AllowedTerm": [
                    {
                      "codeMeaning": "distribution pattern",
                      "codeValue": "RID5958",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0",
                      "CharacteristicQuantification": [
                        {
                          "annotatorConfidence": false,
                          "characteristicQuantificationIndex": 0,
                          "name": "Distribution ADC value",
                          "Quantile": {
                            "bins": "4",
                            "defaultBin": "4",
                            "maxValue": "1000.0",
                            "minValue": "0.0"
                          }
                        }
                      ]
                    }
                  ],
                  "QuestionType": {
                    "codeMeaning": "Indicate the quartile representing the distribution of the ADC-value of the tumor",
                    "codeValue": "Q24",
                    "codingSchemeDesignator": "BI-RADS",
                    "codingSchemeVersion": "1"
                  }
                }
              ]
            },
            "AllowedTerm": [
              {
                "codeMeaning": "yes",
                "codeValue": "RID28474",
                "codingSchemeDesignator": "RadLex",
                "codingSchemeVersion": "1.0",
                "defaultAnswer": true
              },
              {
                "codeMeaning": "no",
                "codeValue": "RID28475",
                "codingSchemeDesignator": "RadLex",
                "codingSchemeVersion": "1.0"
              }
            ]
          },
          {
            "authors": "Default User",
            "id": "2.25.162930486255335786011048349278396788460",
            "itemNumber": 15,
            "label": "tumor ROI",
            "maxCardinality": 5,
            "minCardinality": 1,
            "shouldDisplay": true,
            "GeometricShape": "Polyline"
          },
          {
            "authors": "Default User",
            "id": "2.25.271316379867515356636489727701439824030",
            "itemNumber": 16,
            "label": "size tumor anterior-posterior",
            "maxCardinality": 1,
            "minCardinality": 1,
            "shouldDisplay": true,
            "QuestionType": {
              "codeMeaning": "Indicate the size of the tumor by drawing a line from anterior to posterior",
              "codeValue": "Q12",
              "codingSchemeDesignator": "BI-RADS",
              "codingSchemeVersion": "1"
            },
            "GeometricShape": "MultiPoint"
          },
          {
            "authors": "Default User",
            "id": "2.25.265256743023989012984577284452482670264",
            "itemNumber": 17,
            "label": "size cranial-cordial",
            "maxCardinality": 1,
            "minCardinality": 1,
            "shouldDisplay": true,
            "QuestionType": {
              "codeMeaning": "Indicate the size of the tumor by drawing a line form cranial to cordial",
              "codeValue": "Q13",
              "codingSchemeDesignator": "BI-RADS",
              "codingSchemeVersion": "1"
            },
            "GeometricShape": "MultiPoint"
          },
          {
            "authors": "Default User",
            "id": "2.25.325322165150557359435507234940289454986",
            "itemNumber": 18,
            "label": "size left-right",
            "maxCardinality": 1,
            "minCardinality": 1,
            "shouldDisplay": true,
            "QuestionType": {
              "codeMeaning": "Indicate the size of the tumor by drawing a line form left to right",
              "codeValue": "Q14",
              "codingSchemeDesignator": "BI-RADS",
              "codingSchemeVersion": "1"
            },
            "GeometricShape": "MultiPoint"
          },
          {
            "authors": "Default User",
            "id": "2.25.299429544608611359258113335560102177272",
            "itemNumber": 19,
            "label": "Distance to nipple",
            "maxCardinality": 1,
            "minCardinality": 1,
            "shouldDisplay": true,
            "QuestionType": {
              "codeMeaning": "Draw a line from the centre of the tumor to nipple",
              "codeValue": "Q16",
              "codingSchemeDesignator": "BI-RADS",
              "codingSchemeVersion": "1"
            },
            "GeometricShape": "MultiPoint"
          },
          {
            "authors": "Default User",
            "id": "2.25.134778238316505864961882643527701073145",
            "itemNumber": 20,
            "label": "Presence of implant",
            "maxCardinality": 1,
            "minCardinality": 1,
            "shouldDisplay": true,
            "QuestionType": {
              "codeMeaning": "Is there an implant?",
              "codeValue": "Q7",
              "codingSchemeDesignator": "BI-RADS",
              "codingSchemeVersion": "1"
            },
            "AnatomicEntity": {
              "annotatorConfidence": false
            },
            "AllowedTerm": [
              {
                "codeMeaning": "yes",
                "codeValue": "RID28474",
                "codingSchemeDesignator": "RadLex",
                "codingSchemeVersion": "1.0"
              },
              {
                "codeMeaning": "no",
                "codeValue": "RID28475",
                "codingSchemeDesignator": "RadLex",
                "codingSchemeVersion": "1.0",
                "nextId": "2.25.97589513511886567303933174297800671452"
              }
            ]
          },
          {
            "authors": "Default User",
            "id": "2.25.97514329268716163773873319023293443840",
            "itemNumber": 21,
            "label": "Lumen type implant",
            "maxCardinality": 1,
            "minCardinality": 1,
            "shouldDisplay": true,
            "QuestionType": {
              "codeMeaning": "What is the lumen type of the implant?",
              "codeValue": "Q27",
              "codingSchemeDesignator": "BI-RADS",
              "codingSchemeVersion": "1"
            },
            "AnatomicEntity": {
              "annotatorConfidence": false
            },
            "AllowedTerm": [
              {
                "codeMeaning": "single-lumen",
                "codeValue": "I1",
                "codingSchemeDesignator": "BI-RADS",
                "codingSchemeVersion": "1"
              },
              {
                "codeMeaning": "double-lumen",
                "codeValue": "I2",
                "codingSchemeDesignator": "BI-RADS",
                "codingSchemeVersion": "1"
              },
              {
                "codeMeaning": "none",
                "codeValue": "RID28454",
                "codingSchemeDesignator": "RadLex",
                "codingSchemeVersion": "1.0",
                "defaultAnswer": true
              }
            ]
          },
          {
            "authors": "Default User",
            "id": "2.25.1265855935776273784782254051149261804",
            "itemNumber": 22,
            "label": "Material implant",
            "maxCardinality": 1,
            "minCardinality": 1,
            "shouldDisplay": true,
            "QuestionType": {
              "codeMeaning": "What is the material of the implant?",
              "codeValue": "Q27",
              "codingSchemeDesignator": "BI-RADS",
              "codingSchemeVersion": "1"
            },
            "AnatomicEntity": {
              "annotatorConfidence": false
            },
            "AllowedTerm": [
              {
                "codeMeaning": "Silicone breast implant",
                "codeValue": "RID35968",
                "codingSchemeDesignator": "RadLex"
              },
              {
                "codeMeaning": "Saline breast implant",
                "codeValue": "RID49712",
                "codingSchemeDesignator": "RadLex"
              },
              {
                "codeMeaning": "Other breast implant",
                "codeValue": "RID49713",
                "codingSchemeDesignator": "RadLex"
              },
              {
                "codeMeaning": "none",
                "codeValue": "RID28454",
                "codingSchemeDesignator": "RadLex",
                "codingSchemeVersion": "1.0",
                "defaultAnswer": true
              }
            ]
          },
          {
            "authors": "Default User",
            "id": "2.25.97589513511886567303933174297800671452",
            "itemNumber": 23,
            "label": "Presence DCIS",
            "maxCardinality": 1,
            "minCardinality": 1,
            "shouldDisplay": true,
            "QuestionType": {
              "codeMeaning": "Are there DCIS present?",
              "codeValue": "Q17",
              "codingSchemeDesignator": "BI-RADS",
              "codingSchemeVersion": "1"
            },
            "ImagingObservation": {
              "annotatorConfidence": false
            },
            "AllowedTerm": [
              {
                "codeMeaning": "yes",
                "codeValue": "RID28474",
                "codingSchemeDesignator": "RadLex",
                "codingSchemeVersion": "1.0"
              },
              {
                "codeMeaning": "no",
                "codeValue": "RID28475",
                "codingSchemeDesignator": "RadLex",
                "codingSchemeVersion": "1.0"
              }
            ]
          },
          {
            "authors": "Default User",
            "id": "2.25.219424290975900652054607718944206614414",
            "itemNumber": 24,
            "label": "Lymph node status",
            "maxCardinality": 1,
            "minCardinality": 1,
            "shouldDisplay": true,
            "QuestionType": {
              "codeMeaning": "Select the term that best describes the lymph node status?",
              "codeValue": "Q8",
              "codingSchemeDesignator": "BI-RADS",
              "codingSchemeVersion": "1"
            },
            "ImagingObservation": {
              "annotatorConfidence": false,
              "ImagingObservationCharacteristic": [
                {
                  "annotatorConfidence": false,
                  "authors": "Default User",
                  "id": "2.25.250187995497032254628641828450682518647",
                  "itemNumber": 0,
                  "label": "Number of lymph nodes",
                  "maxCardinality": 1,
                  "minCardinality": 1,
                  "shouldDisplay": true,
                  "AllowedTerm": [
                    {
                      "codeMeaning": "lymph node group",
                      "codeValue": "RID28847",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0",
                      "CharacteristicQuantification": [
                        {
                          "annotatorConfidence": false,
                          "characteristicQuantificationIndex": 0,
                          "name": "Number of lymph nodes",
                          "Quantile": {
                            "bins": "20",
                            "defaultBin": "20",
                            "maxValue": "20.0",
                            "minValue": "0.0"
                          }
                        }
                      ]
                    }
                  ],
                  "QuestionType": {
                    "codeMeaning": "Indicate the number of lymph nodes",
                    "codeValue": "Q25",
                    "codingSchemeDesignator": "BI-RADS",
                    "codingSchemeVersion": "1"
                  }
                }
              ]
            },
            "AllowedTerm": [
              {
                "codeMeaning": "minimal",
                "codeValue": "RID5670",
                "codingSchemeDesignator": "RadLex",
                "codingSchemeVersion": "1.0"
              },
              {
                "codeMeaning": "mild",
                "codeValue": "RID5671",
                "codingSchemeDesignator": "RadLex",
                "codingSchemeVersion": "1.0"
              },
              {
                "codeMeaning": "moderate",
                "codeValue": "RID5672",
                "codingSchemeDesignator": "RadLex",
                "codingSchemeVersion": "1.0"
              },
              {
                "codeMeaning": "marked",
                "codeValue": "RID34299",
                "codingSchemeDesignator": "RadLex",
                "codingSchemeVersion": "1.0"
              }
            ]
          },
          {
            "authors": "Default User",
            "id": "2.25.293374084615250043246419777476624654092",
            "itemNumber": 25,
            "label": "Locaton lymph node status",
            "maxCardinality": 1,
            "minCardinality": 1,
            "shouldDisplay": true,
            "QuestionType": {
              "codeMeaning": "What is location of the lymph nodes?",
              "codeValue": "Q9",
              "codingSchemeDesignator": "BI-RADS",
              "codingSchemeVersion": "1"
            },
            "AnatomicEntity": {
              "annotatorConfidence": false
            },
            "AllowedTerm": [
              {
                "codeMeaning": "Level 1: lower axillary nodes, located lateral to the pectoralis minor muscle",
                "codeValue": "LN1",
                "codingSchemeDesignator": "BI-RADS",
                "codingSchemeVersion": "1"
              },
              {
                "codeMeaning": "Level 2: midaxillary nodes, located eneath the pectoralis minor muscle",
                "codeValue": "LN2",
                "codingSchemeDesignator": "BI-RADS",
                "codingSchemeVersion": "1"
              },
              {
                "codeMeaning": "Level 3: apical axillary nodes",
                "codeValue": "LN3",
                "codingSchemeDesignator": "BI-RADS",
                "codingSchemeVersion": "1"
              }
            ]
          },
          {
            "authors": "Default User",
            "id": "2.25.38991069393471382581041455425733274646",
            "itemNumber": 26,
            "label": "Kinetic curve assessment",
            "maxCardinality": 1,
            "minCardinality": 1,
            "shouldDisplay": true,
            "ImagingObservation": {
              "annotatorConfidence": false,
              "ImagingObservationCharacteristic": [
                {
                  "annotatorConfidence": false,
                  "authors": "Default User",
                  "id": "2.25.250211380412155343038501248895772268597",
                  "itemNumber": 0,
                  "label": "Initial rise",
                  "maxCardinality": 1,
                  "minCardinality": 1,
                  "shouldDisplay": true,
                  "AllowedTerm": [
                    {
                      "codeMeaning": "slow",
                      "codeValue": "RID34328",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "rapid",
                      "codeValue": "RID34329",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "medium",
                      "codeValue": "RID5775",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    }
                  ]
                },
                {
                  "annotatorConfidence": false,
                  "authors": "Default User",
                  "id": "2.25.132996604439478199354892072993563489304",
                  "itemNumber": 1,
                  "label": "Delayed phase",
                  "maxCardinality": 1,
                  "minCardinality": 1,
                  "shouldDisplay": true,
                  "AllowedTerm": [
                    {
                      "codeMeaning": "persistent delayed phase",
                      "codeValue": "RID34331",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "plateau delayed phase",
                      "codeValue": "RID34332",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "washout delayed phase",
                      "codeValue": "RID34333",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    }
                  ]
                },
                {
                  "annotatorConfidence": false,
                  "authors": "Default User",
                  "id": "2.25.119738939829977970842171932728674735696",
                  "itemNumber": 2,
                  "label": "Maximum signal intensity",
                  "maxCardinality": 1,
                  "minCardinality": 1,
                  "shouldDisplay": true,
                  "AllowedTerm": [
                    {
                      "codeMeaning": "Maximum signal intensity",
                      "codeValue": "KC1",
                      "codingSchemeDesignator": "BI-RADS",
                      "codingSchemeVersion": "1",
                      "CharacteristicQuantification": [
                        {
                          "annotatorConfidence": false,
                          "characteristicQuantificationIndex": 0,
                          "name": "Maximum signal intensity",
                          "Quantile": {
                            "bins": "10",
                            "defaultBin": "10",
                            "maxValue": "100.0",
                            "minValue": "0.0"
                          }
                        }
                      ]
                    }
                  ]
                },
                {
                  "annotatorConfidence": false,
                  "authors": "Default User",
                  "id": "2.25.141415264875590125175393637512439210770",
                  "itemNumber": 3,
                  "label": "Time to maximum signal in seconds",
                  "maxCardinality": 1,
                  "minCardinality": 1,
                  "shouldDisplay": true,
                  "AllowedTerm": [
                    {
                      "codeMeaning": "Time to maximum signal",
                      "codeValue": "KC2",
                      "codingSchemeDesignator": "BI-RADS",
                      "codingSchemeVersion": "1",
                      "CharacteristicQuantification": [
                        {
                          "annotatorConfidence": false,
                          "characteristicQuantificationIndex": 0,
                          "name": "Time to maximum signal in seconds",
                          "Quantile": {
                            "bins": "10",
                            "defaultBin": "10",
                            "maxValue": "10.0",
                            "minValue": "0.0"
                          }
                        }
                      ]
                    }
                  ]
                }
              ]
            },
            "AllowedTerm": [
              {
                "codeMeaning": "yes",
                "codeValue": "RID28474",
                "codingSchemeDesignator": "RadLex",
                "codingSchemeVersion": "1.0",
                "defaultAnswer": true
              },
              {
                "codeMeaning": "no",
                "codeValue": "RID28475",
                "codingSchemeDesignator": "RadLex",
                "codingSchemeVersion": "1.0"
              }
            ]
          },
          {
            "authors": "Default User",
            "id": "2.25.31099028588784974042522120675370007165",
            "itemNumber": 27,
            "label": "Assessment category",
            "maxCardinality": 1,
            "minCardinality": 1,
            "shouldDisplay": true,
            "ImagingObservation": {
              "annotatorConfidence": false
            },
            "AllowedTerm": [
              {
                "codeMeaning": "Bi-rads 0: incomplete - need additional imaging evaluation",
                "codeValue": "RID36029",
                "codingSchemeDesignator": "RadLex"
              },
              {
                "codeMeaning": "Bi-rads 1: negative",
                "codeValue": "RID36028",
                "codingSchemeDesignator": "RadLex"
              },
              {
                "codeMeaning": "Bi-rads 2: benign findings",
                "codeValue": "RID36029",
                "codingSchemeDesignator": "RadLex"
              },
              {
                "codeMeaning": "Bi-rads 3: probably benign",
                "codeValue": "RID36041",
                "codingSchemeDesignator": "RadLex"
              },
              {
                "codeMeaning": "Bi-rads 4A: low susicion for malignancy",
                "codeValue": "RID36031",
                "codingSchemeDesignator": "RadLex"
              },
              {
                "codeMeaning": "Bi-rads 4B: moderate suspicion of malignancy",
                "codeValue": "RID 36032",
                "codingSchemeDesignator": "RadLex"
              },
              {
                "codeMeaning": "Bi-rads 4C: high suspicion for malignancy",
                "codeValue": "RID 36033",
                "codingSchemeDesignator": "RadLex"
              },
              {
                "codeMeaning": "Bi-rads 5: highly suggestive of malignancy",
                "codeValue": "RID36034",
                "codingSchemeDesignator": "RadLex"
              },
              {
                "codeMeaning": "Bi-rads 6: known biopsy-proven malignancy",
                "codeValue": "RID36035",
                "codingSchemeDesignator": "RadLex"
              }
            ]
          }
        ]
      }
    ]
  }
}

export var kircenhancement = {
  "TemplateContainer": {
    "xmlns": "gme://caCORE.caCORE/3.2/edu.northwestern.radiology.AIMTemplate",
    "xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
    "authors": "kirbyju",
    "creationDate": "2012-04-24",
    "description": "Template for TCGA Renal Research Group image features",
    "name": "TCGA Renal",
    "uid": "2.25.215225874603011604925810042375269318605",
    "version": "1.0",
    "xsi:schemaLocation": "gme://caCORE.caCORE/3.2/edu.northwestern.radiology.AIMTemplate AIMTemplate_v2rv13.xsd",
    "Template": [
      {
        "authors": "kirbyju",
        "codeMeaning": "TCGA-KIRC Enhancement",
        "codeValue": "99_CIP_KIRC-02",
        "codingSchemeDesignator": "99_NCI_CIP",
        "codingSchemeVersion": "1.0",
        "creationDate": "2012-04-27",
        "description": "For evaluation of enhancement related measurements and features in TCGA-KIRC subjects by the TCGA Renal Phenotype Research Group.",
        "name": "KIRC Enhancement",
        "uid": "2.25.151804757954783958321164431197955256999",
        "version": "1.0",
        "Component": [
          {
            "explanatoryText": "Measure the area of enhancement using the ellipitical ROI tool. Hounsfield Units (CT) or Mean Signal Intensity (MR) will be automatically recorded.  Skip this form if there is no contrast enhancement series for this subject.",
            "id": "2.25.473378911523.143503203277.231237945040",
            "itemNumber": 0,
            "label": "Enhancement measurement",
            "maxCardinality": 1,
            "minCardinality": 1,
            "shouldDisplay": true,
            "GeometricShape": "Ellipse"
          },
          {
            "authors": "kirbyju",
            "id": "2.25.473378911611.143503203366.231237945091",
            "itemNumber": 1,
            "label": "Enhancement",
            "maxCardinality": 1,
            "minCardinality": 1,
            "shouldDisplay": false,
            "ImagingObservation": {
              "annotatorConfidence": false,
              "ImagingObservationCharacteristic": [
                {
                  "annotatorConfidence": false,
                  "authors": "kirbyju",
                  "id": "2.25.473378911700.143503203456.231237945142",
                  "itemNumber": 0,
                  "label": "Modality",
                  "maxCardinality": 1,
                  "minCardinality": 1,
                  "shouldDisplay": true,
                  "AllowedTerm": [
                    {
                      "codeMeaning": "CT",
                      "codeValue": "KIRC-36",
                      "codingSchemeDesignator": "99_NCI_CIP",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "MR",
                      "codeValue": "KIRC-37",
                      "codingSchemeDesignator": "99_NCI_CIP",
                      "codingSchemeVersion": "1.0"
                    }
                  ]
                },
                {
                  "annotatorConfidence": false,
                  "authors": "kirbyju",
                  "id": "2.25.473378911791.143503203547.231237945193",
                  "itemNumber": 1,
                  "label": "Enhancement Phase",
                  "maxCardinality": 1,
                  "minCardinality": 1,
                  "shouldDisplay": true,
                  "AllowedTerm": [
                    {
                      "codeMeaning": "Precontrast",
                      "codeValue": "KIRC-14",
                      "codingSchemeDesignator": "99_NCI_CIP",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "Corticomedullary",
                      "codeValue": "KIRC-39",
                      "codingSchemeDesignator": "99_NCI_CIP",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "Nephrographic",
                      "codeValue": "KIRC-16",
                      "codingSchemeDesignator": "99_NCI_CIP",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "Excretion",
                      "codeValue": "KIRC-17",
                      "codingSchemeDesignator": "99_NCI_CIP",
                      "codingSchemeVersion": "1.0"
                    }
                  ]
                },
                {
                  "annotatorConfidence": false,
                  "authors": "kirbyju",
                  "explanatoryText": "Enhancement area of cortex",
                  "id": "2.25.473378911883.143503203639.231237945244",
                  "itemNumber": 2,
                  "label": "Enhancing Entity",
                  "maxCardinality": 1,
                  "minCardinality": 1,
                  "shouldDisplay": true,
                  "AllowedTerm": [
                    {
                      "codeMeaning": "Tumor",
                      "codeValue": "KIRC-19",
                      "codingSchemeDesignator": "99_NCI_CIP",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "Aorta",
                      "codeValue": "KIRC-20",
                      "codingSchemeDesignator": "99_NCI_CIP",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "Normal Renal Cortex",
                      "codeValue": "KIRC-21",
                      "codingSchemeDesignator": "99_NCI_CIP",
                      "codingSchemeVersion": "1.0"
                    }
                  ]
                }
              ]
            },
            "AllowedTerm": [
              {
                "codeMeaning": "enhancement characteristic",
                "codeValue": "RID6054",
                "codingSchemeDesignator": "RadLex",
                "codingSchemeVersion": "1.0"
              }
            ]
          }
        ]
      },
      {
        "authors": "kirbyju",
        "codeMeaning": "TCGA-KIRC Tumor",
        "codeValue": "99_CIP_KIRC-01",
        "codingSchemeDesignator": "99_NCI_CIP",
        "codingSchemeVersion": "1.0",
        "creationDate": "2012-04-24",
        "description": "For evaluation of tumor related measurements and features in TCGA-KIRC subjects by the TCGA Renal Phenotype Research Group.",
        "name": "KIRC Tumor",
        "uid": "2.25.186635936167022339612701317810251153127",
        "version": "1.0",
        "Component": [
          {
            "authors": "kirbyju",
            "id": "2.25.473378910035.143503201787.231237944020",
            "itemNumber": 0,
            "label": "Image Acquisitions",
            "maxCardinality": 1,
            "minCardinality": 1,
            "shouldDisplay": false,
            "ImagingObservation": {
              "annotatorConfidence": false,
              "ImagingObservationCharacteristic": [
                {
                  "annotatorConfidence": false,
                  "authors": "kirbyju",
                  "id": "2.25.473378910097.143503201850.231237944071",
                  "itemNumber": 0,
                  "label": "Modality",
                  "maxCardinality": 1,
                  "minCardinality": 1,
                  "shouldDisplay": true,
                  "AllowedTerm": [
                    {
                      "codeMeaning": "CT",
                      "codeValue": "KIRC-36",
                      "codingSchemeDesignator": "99_NCI_CIP",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "MR",
                      "codeValue": "KIRC-37",
                      "codingSchemeDesignator": "99_NCI_CIP",
                      "codingSchemeVersion": "1.0"
                    }
                  ]
                },
                {
                  "annotatorConfidence": false,
                  "authors": "kirbyju",
                  "explanatoryText": "Check all available scans for this subject.",
                  "id": "2.25.473378910161.143503201914.231237944122",
                  "itemNumber": 1,
                  "label": "Contrast Enhanced Phases Available",
                  "maxCardinality": 4,
                  "minCardinality": 0,
                  "shouldDisplay": true,
                  "AllowedTerm": [
                    {
                      "codeMeaning": "Precontrast",
                      "codeValue": "KIRC-38",
                      "codingSchemeDesignator": "99_NCI_CIP",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "Corticomedullary",
                      "codeValue": "KIRC-39",
                      "codingSchemeDesignator": "99_NCI_CIP",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "Nephrographic",
                      "codeValue": "KIRC-40",
                      "codingSchemeDesignator": "99_NCI_CIP",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "Excretory",
                      "codeValue": "KIRC-41",
                      "codingSchemeDesignator": "99_NCI_CIP",
                      "codingSchemeVersion": "1.0"
                    }
                  ]
                }
              ]
            },
            "AllowedTerm": [
              {
                "codeMeaning": "Acquisition Protocol",
                "codeValue": "KIRC-35",
                "codingSchemeDesignator": "99_NCI_CIP",
                "codingSchemeVersion": "1.0"
              }
            ]
          },
          {
            "authors": "kirbyju",
            "id": "2.25.473378910226.143503201979.231237944173",
            "itemNumber": 1,
            "label": "Tumor Characteristics",
            "maxCardinality": 1,
            "minCardinality": 1,
            "shouldDisplay": false,
            "ImagingObservation": {
              "annotatorConfidence": false,
              "ImagingObservationCharacteristic": [
                {
                  "annotatorConfidence": false,
                  "authors": "kirbyju",
                  "groupLabel": "Location",
                  "id": "2.25.473378910292.143503202045.231237944224",
                  "itemNumber": 0,
                  "label": "Tumor Side",
                  "maxCardinality": 1,
                  "minCardinality": 1,
                  "shouldDisplay": true,
                  "AllowedTerm": [
                    {
                      "codeMeaning": "Right",
                      "codeValue": "G-A100",
                      "codingSchemeDesignator": "SRT"
                    },
                    {
                      "codeMeaning": "Left",
                      "codeValue": "G-A101",
                      "codingSchemeDesignator": "SRT"
                    },
                    {
                      "codeMeaning": "bilateral",
                      "codeValue": "RID5771",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    }
                  ]
                },
                {
                  "annotatorConfidence": false,
                  "authors": "kirbyju",
                  "explanatoryText": "Review in nephrographic phase.",
                  "groupLabel": "Morphology",
                  "id": "2.25.473378910359.143503202112.231237944275",
                  "itemNumber": 1,
                  "label": "Tumor Margin",
                  "maxCardinality": 1,
                  "minCardinality": 1,
                  "shouldDisplay": true,
                  "AllowedTerm": [
                    {
                      "codeMeaning": "well-defined",
                      "codeValue": "KIRC-02",
                      "codingSchemeDesignator": "99_NCI_CIP",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "ill-defined",
                      "codeValue": "KIRC-03",
                      "codingSchemeDesignator": "99_NCI_CIP",
                      "codingSchemeVersion": "1.0"
                    }
                  ]
                },
                {
                  "annotatorConfidence": false,
                  "authors": "kirbyju",
                  "explanatoryText": "Cystic are masses with no measurable solid component.",
                  "groupLabel": "Morphology",
                  "id": "2.25.473378910427.143503202180.231237944326",
                  "itemNumber": 2,
                  "label": "Tumor Composition",
                  "maxCardinality": 1,
                  "minCardinality": 1,
                  "shouldDisplay": true,
                  "AllowedTerm": [
                    {
                      "codeMeaning": "Solid - Homogeneous enhancement",
                      "codeValue": "KIRC-04",
                      "codingSchemeDesignator": "99_NCI_CIP",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "Solid - Heterogeneous enhancement",
                      "codeValue": "KIRC-05",
                      "codingSchemeDesignator": "99_NCI_CIP",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "Mixed - Predominantly solid (>50%) with cystic elements",
                      "codeValue": "KIRC-06",
                      "codingSchemeDesignator": "99_NCI_CIP",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "Mixed - Predominantly cystic (>50%) with solid elements",
                      "codeValue": "KIRC-07",
                      "codingSchemeDesignator": "99_NCI_CIP",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "Cystic - Unilocular",
                      "codeValue": "KIRC-08",
                      "codingSchemeDesignator": "99_NCI_CIP",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "Cystic - Multilocular",
                      "codeValue": "KIRC-32",
                      "codingSchemeDesignator": "99_NCI_CIP",
                      "codingSchemeVersion": "1.0"
                    }
                  ]
                },
                {
                  "annotatorConfidence": false,
                  "authors": "kirbyju",
                  "groupLabel": "Morphology",
                  "id": "2.25.473378910496.143503202249.231237944377",
                  "itemNumber": 3,
                  "label": "Calcification",
                  "maxCardinality": 1,
                  "minCardinality": 1,
                  "shouldDisplay": true,
                  "AllowedTerm": [
                    {
                      "codeMeaning": "yes",
                      "codeValue": "RID28474",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "no",
                      "codeValue": "RID28475",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "Required Images Not Available",
                      "codeValue": "KIRC-34",
                      "codingSchemeDesignator": "99_NCI_CIP",
                      "codingSchemeVersion": "1.0"
                    }
                  ]
                },
                {
                  "annotatorConfidence": false,
                  "authors": "kirbyju",
                  "explanatoryText": "Assess the nephrographic and delayed phases.",
                  "groupLabel": "Morphology",
                  "id": "2.25.473378910567.143503202320.231237944428",
                  "itemNumber": 4,
                  "label": "Tumor Necrosis",
                  "maxCardinality": 1,
                  "minCardinality": 1,
                  "shouldDisplay": true,
                  "AllowedTerm": [
                    {
                      "codeMeaning": "yes",
                      "codeValue": "RID28474",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "no",
                      "codeValue": "RID28475",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "Required Images Not Available",
                      "codeValue": "KIRC-34",
                      "codingSchemeDesignator": "99_NCI_CIP",
                      "codingSchemeVersion": "1.0"
                    }
                  ]
                },
                {
                  "annotatorConfidence": false,
                  "authors": "kirbyju",
                  "explanatoryText": "Transparenchymal includes both endophytic and exophytic growth.  Intraparenchymal includes cortex only.",
                  "groupLabel": "Morphology",
                  "id": "2.25.473378910639.143503202392.231237944479",
                  "itemNumber": 5,
                  "label": "Tumor Growth Pattern",
                  "maxCardinality": 1,
                  "minCardinality": 1,
                  "shouldDisplay": true,
                  "AllowedTerm": [
                    {
                      "codeMeaning": "exophytic",
                      "codeValue": "RID6263",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "intraparenchymal",
                      "codeValue": "RID6264",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "endophytic",
                      "codeValue": "KIRC-09",
                      "codingSchemeDesignator": "99_NCI_CIP",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "transparenchymal",
                      "codeValue": "KIRC-10",
                      "codingSchemeDesignator": "99_NCI_CIP",
                      "codingSchemeVersion": "1.0"
                    }
                  ]
                },
                {
                  "annotatorConfidence": false,
                  "authors": "kirbyju",
                  "explanatoryText": "Select N/A if the required images were not available for assessment. ",
                  "groupLabel": "Morphology",
                  "id": "2.25.473378910712.143503202465.231237944530",
                  "itemNumber": 6,
                  "label": "Increased Vascularity",
                  "maxCardinality": 1,
                  "minCardinality": 1,
                  "shouldDisplay": true,
                  "AllowedTerm": [
                    {
                      "codeMeaning": "intratumoral",
                      "codeValue": "KIRC-12",
                      "codingSchemeDesignator": "99_NCI_CIP",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "peritumoral",
                      "codeValue": "KIRC-11",
                      "codingSchemeDesignator": "99_NCI_CIP",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "none",
                      "codeValue": "RID28454",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "Required Images Not Available",
                      "codeValue": "KIRC-34",
                      "codingSchemeDesignator": "99_NCI_CIP",
                      "codingSchemeVersion": "1.0"
                    }
                  ]
                },
                {
                  "annotatorConfidence": false,
                  "authors": "kirbyju",
                  "explanatoryText": "Select N/A if the required images were not available for assessment. ",
                  "groupLabel": "Invasion",
                  "id": "2.25.473378910786.143503202540.231237944581",
                  "itemNumber": 7,
                  "label": "Renal Hilar Fat Invasion",
                  "maxCardinality": 1,
                  "minCardinality": 1,
                  "shouldDisplay": true,
                  "AllowedTerm": [
                    {
                      "codeMeaning": "yes",
                      "codeValue": "RID28474",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "no",
                      "codeValue": "RID28475",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "Indeterminate",
                      "codeValue": "KIRC-33",
                      "codingSchemeDesignator": "99_NCI_CIP",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "Required Images Not Available",
                      "codeValue": "KIRC-34",
                      "codingSchemeDesignator": "99_NCI_CIP",
                      "codingSchemeVersion": "1.0"
                    }
                  ]
                },
                {
                  "annotatorConfidence": false,
                  "authors": "kirbyju",
                  "explanatoryText": "Select N/A if the required images were not available for assessment.",
                  "groupLabel": "Invasion",
                  "id": "2.25.473378910862.143503202616.231237944632",
                  "itemNumber": 8,
                  "label": "Liver Invasion",
                  "maxCardinality": 1,
                  "minCardinality": 1,
                  "shouldDisplay": true,
                  "AllowedTerm": [
                    {
                      "codeMeaning": "yes",
                      "codeValue": "RID28474",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "no",
                      "codeValue": "RID28475",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "Indeterminate",
                      "codeValue": "KIRC-33",
                      "codingSchemeDesignator": "99_NCI_CIP",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "Required Images Not Available",
                      "codeValue": "KIRC-34",
                      "codingSchemeDesignator": "99_NCI_CIP",
                      "codingSchemeVersion": "1.0"
                    }
                  ]
                },
                {
                  "annotatorConfidence": false,
                  "authors": "kirbyju",
                  "explanatoryText": "Select N/A if the required images were not available for assessment.",
                  "groupLabel": "Invasion",
                  "id": "2.25.473378910940.143503202694.231237944683",
                  "itemNumber": 9,
                  "label": "Adrenal Invasion",
                  "maxCardinality": 1,
                  "minCardinality": 1,
                  "shouldDisplay": true,
                  "AllowedTerm": [
                    {
                      "codeMeaning": "yes",
                      "codeValue": "RID28474",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "no",
                      "codeValue": "RID28475",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "Indeterminate",
                      "codeValue": "KIRC-33",
                      "codingSchemeDesignator": "99_NCI_CIP",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "Required Images Not Available",
                      "codeValue": "KIRC-34",
                      "codingSchemeDesignator": "99_NCI_CIP",
                      "codingSchemeVersion": "1.0"
                    }
                  ]
                },
                {
                  "annotatorConfidence": false,
                  "authors": "kirbyju",
                  "explanatoryText": "Select N/A if the required images were not available for assessment.",
                  "groupLabel": "Invasion",
                  "id": "2.25.473378911020.143503202774.231237944734",
                  "itemNumber": 10,
                  "label": "Renal Vein Invasion",
                  "maxCardinality": 1,
                  "minCardinality": 1,
                  "shouldDisplay": true,
                  "AllowedTerm": [
                    {
                      "codeMeaning": "Tumor Thrombus",
                      "codeValue": "KIRC-22",
                      "codingSchemeDesignator": "99_NCI_CIP",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "No Renal vein invasion",
                      "codeValue": "KIRC-44",
                      "codingSchemeDesignator": "99_NCI_CIP",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "Indeterminate",
                      "codeValue": "KIRC-33",
                      "codingSchemeDesignator": "99_NCI_CIP",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "Required Images Not Available",
                      "codeValue": "KIRC-34",
                      "codingSchemeDesignator": "99_NCI_CIP",
                      "codingSchemeVersion": "1.0"
                    }
                  ]
                },
                {
                  "annotatorConfidence": false,
                  "authors": "kirbyju",
                  "explanatoryText": "Select N/A if the required images were not available for assessment.",
                  "groupLabel": "Invasion",
                  "id": "2.25.473378911101.143503202855.231237944785",
                  "itemNumber": 11,
                  "label": "Collection System Invasion",
                  "maxCardinality": 1,
                  "minCardinality": 1,
                  "shouldDisplay": true,
                  "AllowedTerm": [
                    {
                      "codeMeaning": "yes",
                      "codeValue": "RID28474",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "no",
                      "codeValue": "RID28475",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "Indeterminate",
                      "codeValue": "KIRC-33",
                      "codingSchemeDesignator": "99_NCI_CIP",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "Required Images Not Available",
                      "codeValue": "KIRC-34",
                      "codingSchemeDesignator": "99_NCI_CIP",
                      "codingSchemeVersion": "1.0"
                    }
                  ]
                },
                {
                  "annotatorConfidence": false,
                  "authors": "kirbyju",
                  "explanatoryText": "Select N/A if the required images were not available for assessment.",
                  "groupLabel": "Invasion",
                  "id": "2.25.473378911183.143503202937.231237944836",
                  "itemNumber": 12,
                  "label": "IVC invasion",
                  "maxCardinality": 1,
                  "minCardinality": 1,
                  "shouldDisplay": true,
                  "AllowedTerm": [
                    {
                      "codeMeaning": "Infrarenal",
                      "codeValue": "KIRC-24",
                      "codingSchemeDesignator": "99_NCI_CIP",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "Infrahepatic",
                      "codeValue": "KIRC-25",
                      "codingSchemeDesignator": "99_NCI_CIP",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "Suprahepatic",
                      "codeValue": "KIRC-26",
                      "codingSchemeDesignator": "99_NCI_CIP",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "Right Atrium",
                      "codeValue": "KIRC-27",
                      "codingSchemeDesignator": "99_NCI_CIP",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "Intrahepatic",
                      "codeValue": "KIRC-42",
                      "codingSchemeDesignator": "99_NCI_CIP",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "No IVC",
                      "codeValue": "KIRC-43",
                      "codingSchemeDesignator": "99_NCI_CIP",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "Indeterminate",
                      "codeValue": "KIRC-33",
                      "codingSchemeDesignator": "99_NCI_CIP",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "Required Images Not Available",
                      "codeValue": "KIRC-34",
                      "codingSchemeDesignator": "99_NCI_CIP",
                      "codingSchemeVersion": "1.0"
                    }
                  ]
                },
                {
                  "annotatorConfidence": false,
                  "authors": "kirbyju",
                  "explanatoryText": ">=1cm on short axis is metastasis.",
                  "groupLabel": "Metastasis",
                  "id": "2.25.473378911266.143503203020.231237944887",
                  "itemNumber": 13,
                  "label": "Regional Lymph Node Metastasis",
                  "maxCardinality": 1,
                  "minCardinality": 1,
                  "shouldDisplay": true,
                  "AllowedTerm": [
                    {
                      "codeMeaning": "yes",
                      "codeValue": "RID28474",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "no",
                      "codeValue": "RID28475",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    }
                  ]
                },
                {
                  "annotatorConfidence": false,
                  "authors": "kirbyju",
                  "groupLabel": "Metastasis",
                  "id": "2.25.473378911350.143503203104.231237944938",
                  "itemNumber": 14,
                  "label": "Distant Metastases Locations",
                  "maxCardinality": 7,
                  "minCardinality": 1,
                  "shouldDisplay": true,
                  "AllowedTerm": [
                    {
                      "codeMeaning": "adrenal",
                      "codeValue": "RID28722",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "Bone",
                      "codeValue": "KIRC-31",
                      "codingSchemeDesignator": "99_NCI_CIP",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "Contralateral Adrenal",
                      "codeValue": "KIRC-29",
                      "codingSchemeDesignator": "99_NCI_CIP",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "Distant Lymph Node",
                      "codeValue": "KIRC-33",
                      "codingSchemeDesignator": "99_NCI_CIP",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "liver",
                      "codeValue": "RID58",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "lung",
                      "codeValue": "RID1301",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "Psoas",
                      "codeValue": "KIRC-30",
                      "codingSchemeDesignator": "99_NCI_CIP",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "Other",
                      "codeValue": "C17649",
                      "codingSchemeDesignator": "NCIT"
                    },
                    {
                      "codeMeaning": "none",
                      "codeValue": "RID28454",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    }
                  ]
                }
              ]
            },
            "AllowedTerm": [
              {
                "codeMeaning": "Neoplasm",
                "codeValue": "C3262",
                "codingSchemeDesignator": "NCIT"
              }
            ]
          },
          {
            "authors": "kirbyju",
            "explanatoryText": "Measure the longest diameter of the tumor with the ruler tool.  Then measure the longest perpendicular axis with the ruler tool.  Measure only the largest tumor in each case in the Nephrographic(?) phase.",
            "id": "2.25.473378911436.143503203190.231237944989",
            "itemNumber": 2,
            "label": "Tumor measurement",
            "maxCardinality": 2,
            "minCardinality": 2,
            "shouldDisplay": true,
            "GeometricShape": "Polyline"
          }
        ]
      }
    ]
  }
};
export var LungNoduleTemplate = {
  "TemplateContainer": {
    "xmlns": "gme://caCORE.caCORE/3.2/edu.northwestern.radiology.AIMTemplate",
    "xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
    "authors": "Ann Leung and Deni Aberle",
    "creationDate": "2013-11-01",
    "description": "Template describing features of lung nodules",
    "name": "Lung Nodule V2",
    "uid": "2.25.226786059025611331467166333882529892626",
    "version": "1.0",
    "xsi:schemaLocation": "gme://caCORE.caCORE/3.2/edu.northwestern.radiology.AIMTemplate AIMTemplate_v2rv13.xsd",
    "Template": [
      {
        "authors": "Ann Leung, Deni Aberle, Daniel Rubin",
        "codeMeaning": "Lung Template",
        "codeValue": "LT1",
        "codingSchemeDesignator": "LungTemplate",
        "creationDate": "2013-10-31",
        "description": "Lung cancer tameplate for descibing lung cancers",
        "modality": "CT",
        "name": "Lung Nodule Features V2",
        "precedingAnnotation": "DoNotOffer",
        "uid": "2.25.311771886067220576653079335404869365125",
        "version": "1.0",
        "Component": [
          {
            "authors": "Default User",
            "id": "2.25.140176464195137397956100227930935538072",
            "itemNumber": 0,
            "label": "Anatomic Location",
            "maxCardinality": 1,
            "minCardinality": 1,
            "shouldDisplay": true,
            "AnatomicEntity": {
              "annotatorConfidence": false
            },
            "AllowedTerm": [
              {
                "codeMeaning": "upper lobe of right lung",
                "codeValue": "RID1303",
                "codingSchemeDesignator": "RadLex",
                "codingSchemeVersion": "1.0"
              },
              {
                "codeMeaning": "middle lobe of right lung",
                "codeValue": "RID1310",
                "codingSchemeDesignator": "RadLex_3.9.1"
              },
              {
                "codeMeaning": "lower lobe of right lung",
                "codeValue": "RID1315",
                "codingSchemeDesignator": "RadLex_3.9.1"
              },
              {
                "codeMeaning": "upper lobe of left lung",
                "codeValue": "RID1327",
                "codingSchemeDesignator": "RadLex_3.9.1"
              },
              {
                "codeMeaning": "lingula",
                "codeValue": "RID1333",
                "codingSchemeDesignator": "RadLex_3.9.1"
              },
              {
                "codeMeaning": "lower lobe of left lung",
                "codeValue": "RID1338",
                "codingSchemeDesignator": "RadLex_3.9.1"
              },
              {
                "codeMeaning": "right bronchial tree",
                "codeValue": "RID46006",
                "codingSchemeDesignator": "RadLex3.9.1"
              },
              {
                "codeMeaning": "left bronchial tree",
                "codeValue": "RID46005",
                "codingSchemeDesignator": "RadLex3.9.1"
              },
              {
                "codeMeaning": "right side",
                "codeValue": "RID46055",
                "codingSchemeDesignator": "RadLex_3.9.1"
              },
              {
                "codeMeaning": "left side",
                "codeValue": "RID46054",
                "codingSchemeDesignator": "RadLex_3.9.1"
              },
              {
                "codeMeaning": "unable to determine",
                "codeValue": "RID39110",
                "codingSchemeDesignator": "RadLex_3.9.1"
              }
            ]
          },
          {
            "authors": "Default User",
            "id": "2.25.87157590103780976172344716887617624858",
            "itemNumber": 1,
            "label": "Lung Nodule",
            "maxCardinality": 1,
            "minCardinality": 1,
            "shouldDisplay": true,
            "ImagingObservation": {
              "annotatorConfidence": false,
              "ImagingObservationCharacteristic": [
                {
                  "annotatorConfidence": false,
                  "authors": "Default User",
                  "id": "2.25.237962337540884656877012377106352564200",
                  "itemNumber": 0,
                  "label": "Axial Location",
                  "maxCardinality": 1,
                  "minCardinality": 1,
                  "shouldDisplay": true,
                  "AllowedTerm": [
                    {
                      "codeMeaning": "central",
                      "codeValue": "RID5827",
                      "codingSchemeDesignator": "RadLex_3.9.1"
                    },
                    {
                      "codeMeaning": "peripheral",
                      "codeValue": "RID5828",
                      "codingSchemeDesignator": "RadLex_3.9.1"
                    }
                  ]
                },
                {
                  "annotatorConfidence": false,
                  "authors": "Default User",
                  "id": "2.25.14296178658435596975218217235280517220",
                  "itemNumber": 1,
                  "label": "Nodule Attenuation",
                  "maxCardinality": 1,
                  "minCardinality": 1,
                  "shouldDisplay": true,
                  "AllowedTerm": [
                    {
                      "codeMeaning": "solid",
                      "codeValue": "RID5741",
                      "codingSchemeDesignator": "RadLex.3.10"
                    },
                    {
                      "codeMeaning": "ground glass",
                      "codeValue": "RID45726",
                      "codingSchemeDesignator": "RadLex.3.10"
                    },
                    {
                      "codeMeaning": "semi-consolidation",
                      "codeValue": "RID46009",
                      "codingSchemeDesignator": "RadLex.3.10"
                    },
                    {
                      "codeMeaning": "partially solid",
                      "codeValue": "RID46011",
                      "codingSchemeDesignator": "RadLex.3.10",
                      "ValidTerm": [
                        {
                          "codeMeaning": "Solid lessOrEqual 5mm",
                          "codeValue": "LT2",
                          "codingSchemeDesignator": "LungTemplate"
                        }
                      ]
                    },
                    {
                      "codeMeaning": "partially solid",
                      "codeValue": "RID46011",
                      "codingSchemeDesignator": "RadLex.3.10",
                      "ValidTerm": [
                        {
                          "codeMeaning": "Solid greaterThan 5mm",
                          "codeValue": "LT3",
                          "codingSchemeDesignator": "LungTemplate"
                        }
                      ]
                    }
                  ]
                },
                {
                  "annotatorConfidence": false,
                  "authors": "Default User",
                  "id": "2.25.35741647376747435228941990394228816488",
                  "itemNumber": 2,
                  "label": "Nodule Internal Features",
                  "maxCardinality": 5,
                  "minCardinality": 0,
                  "shouldDisplay": true,
                  "AllowedTerm": [
                    {
                      "codeMeaning": "reticulation",
                      "codeValue": "RID38794",
                      "codingSchemeDesignator": "RadLex3.9.1"
                    },
                    {
                      "codeMeaning": "internal air bronchogram sign",
                      "codeValue": "RID46015",
                      "codingSchemeDesignator": "RadLex3.9.1"
                    },
                    {
                      "codeMeaning": "necrosis",
                      "codeValue": "RID5171",
                      "codingSchemeDesignator": "RadLex3.9.1"
                    },
                    {
                      "codeMeaning": "cavitated",
                      "codeValue": "RID46014",
                      "codingSchemeDesignator": "RadLex3.9.1"
                    },
                    {
                      "codeMeaning": "nodule cysts",
                      "codeValue": "LT4",
                      "codingSchemeDesignator": "LungTemplate"
                    }
                  ]
                },
                {
                  "annotatorConfidence": false,
                  "authors": "Default User",
                  "id": "2.25.183099523845672751539777412085619223302",
                  "itemNumber": 3,
                  "label": "Nodule Margins-Primary Pattern",
                  "maxCardinality": 1,
                  "minCardinality": 1,
                  "shouldDisplay": true,
                  "AllowedTerm": [
                    {
                      "codeMeaning": "smooth",
                      "codeValue": "RID5912",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "irregular",
                      "codeValue": "RID5809",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "lobulated",
                      "codeValue": "RID5801",
                      "codingSchemeDesignator": "RadLex.3.10"
                    },
                    {
                      "codeMeaning": "spiculated",
                      "codeValue": "RID34284",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "poorly defined",
                      "codeValue": "RID34283",
                      "codingSchemeDesignator": "RadLex.3.10"
                    }
                  ]
                },
                {
                  "annotatorConfidence": false,
                  "authors": "Default User",
                  "id": "2.25.274004174861007766345536611609722648729",
                  "itemNumber": 4,
                  "label": "Nodule Margins-Secondary Pattern",
                  "maxCardinality": 1,
                  "minCardinality": 1,
                  "shouldDisplay": true,
                  "AllowedTerm": [
                    {
                      "codeMeaning": "smooth",
                      "codeValue": "RID5912",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "irregular",
                      "codeValue": "RID5809",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "lobulated",
                      "codeValue": "RID5801",
                      "codingSchemeDesignator": "RadLex.3.10"
                    },
                    {
                      "codeMeaning": "spiculated",
                      "codeValue": "RID34284",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "poorly defined",
                      "codeValue": "RID34283",
                      "codingSchemeDesignator": "RadLex.3.10"
                    }
                  ]
                },
                {
                  "annotatorConfidence": false,
                  "authors": "Default User",
                  "id": "2.25.210192685152885213289122028983951587405",
                  "itemNumber": 5,
                  "label": "Nodule Shape",
                  "maxCardinality": 1,
                  "minCardinality": 1,
                  "shouldDisplay": true,
                  "AllowedTerm": [
                    {
                      "codeMeaning": "round",
                      "codeValue": "RID5799",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "oval",
                      "codeValue": "RID5800",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "complex",
                      "codeValue": "RID5757",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "polygonal",
                      "codeValue": "RID34291",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    }
                  ]
                },
                {
                  "annotatorConfidence": false,
                  "authors": "Default User",
                  "id": "2.25.91578940853568465168607658611838451559",
                  "itemNumber": 6,
                  "label": "Nodule Calcification",
                  "maxCardinality": 1,
                  "minCardinality": 1,
                  "shouldDisplay": true,
                  "AllowedTerm": [
                    {
                      "codeMeaning": "none",
                      "codeValue": "RID28454",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "central",
                      "codeValue": "RID5827",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "peripheral",
                      "codeValue": "RID5828",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    }
                  ]
                },
                {
                  "annotatorConfidence": false,
                  "authors": "Default User",
                  "id": "2.25.86591728618943540706650681612583222798",
                  "itemNumber": 7,
                  "label": "Nodule Associated Findings",
                  "maxCardinality": 8,
                  "minCardinality": 0,
                  "shouldDisplay": true,
                  "AllowedTerm": [
                    {
                      "codeMeaning": "attachment to pleura",
                      "codeValue": "RID46018",
                      "codingSchemeDesignator": "RadLex.3.10"
                    },
                    {
                      "codeMeaning": "attachment to vessel",
                      "codeValue": "RID46052",
                      "codingSchemeDesignator": "RadLex.3.10"
                    },
                    {
                      "codeMeaning": "attachment to bronchus",
                      "codeValue": "RID46019",
                      "codingSchemeDesignator": "RadLex.3.10"
                    },
                    {
                      "codeMeaning": "pleural retraction",
                      "codeValue": "RID46034",
                      "codingSchemeDesignator": "RadLex.3.10"
                    },
                    {
                      "codeMeaning": "entering airway",
                      "codeValue": "RID46035",
                      "codingSchemeDesignator": "RadLex.3.10"
                    },
                    {
                      "codeMeaning": "bronchovascular bundle",
                      "codeValue": "RID46020",
                      "codingSchemeDesignator": "RadLex.3.10",
                      "ValidTerm": [
                        {
                          "codeMeaning": "thickened",
                          "codeValue": "RID5914",
                          "codingSchemeDesignator": "RadLex3.10_NS"
                        }
                      ]
                    },
                    {
                      "codeMeaning": "vascular convergence",
                      "codeValue": "RID46036",
                      "codingSchemeDesignator": "RadLex.3.10"
                    },
                    {
                      "codeMeaning": "septal thickening",
                      "codeValue": "RID46021",
                      "codingSchemeDesignator": "RadLex.3.10"
                    }
                  ]
                },
                {
                  "annotatorConfidence": false,
                  "authors": "Default User",
                  "id": "2.25.337873076505794771639407232761357500198",
                  "itemNumber": 8,
                  "label": "Nodule Periphery",
                  "maxCardinality": 1,
                  "minCardinality": 1,
                  "shouldDisplay": true,
                  "AllowedTerm": [
                    {
                      "codeMeaning": "emphysema",
                      "codeValue": "RID4799",
                      "codingSchemeDesignator": "RadLex3.10_NS"
                    },
                    {
                      "codeMeaning": "fibrosis",
                      "codeValue": "RID3820",
                      "codingSchemeDesignator": "RadLex3.10_NS",
                      "ValidTerm": [
                        {
                          "codeMeaning": "diffuse",
                          "codeValue": "RID5701",
                          "codingSchemeDesignator": "RadLex3.10_NS"
                        }
                      ]
                    },
                    {
                      "codeMeaning": "normal",
                      "codeValue": "RID13173",
                      "codingSchemeDesignator": "RadLex3.10_NS"
                    },
                    {
                      "codeMeaning": "scar",
                      "codeValue": "RID3829",
                      "codingSchemeDesignator": "RadLex3.10_NS",
                      "ValidTerm": [
                        {
                          "codeMeaning": "focal",
                          "codeValue": "RID5702",
                          "codingSchemeDesignator": "RadLex3.10_NS"
                        }
                      ]
                    }
                  ]
                },
                {
                  "annotatorConfidence": false,
                  "authors": "Default User",
                  "id": "2.25.56874292711129473332146919471556731934",
                  "itemNumber": 9,
                  "label": "Satellite Nodules in Primary Lesion Lobe (greater than 4mm noncalcified)",
                  "maxCardinality": 1,
                  "minCardinality": 1,
                  "shouldDisplay": true,
                  "AllowedTerm": [
                    {
                      "codeMeaning": "absent",
                      "codeValue": "RID28473",
                      "codingSchemeDesignator": "RadLex3.10_NS"
                    },
                    {
                      "codeMeaning": "solid",
                      "codeValue": "RID5741",
                      "codingSchemeDesignator": "RadLex3.10_NS"
                    },
                    {
                      "codeMeaning": "non-solid",
                      "codeValue": "RID46016",
                      "codingSchemeDesignator": "RadLex3.10_NS"
                    },
                    {
                      "codeMeaning": "semi-consolidation",
                      "codeValue": "RID46009",
                      "codingSchemeDesignator": "RadLex3.10_NS"
                    },
                    {
                      "codeMeaning": "partially solid",
                      "codeValue": "RID46011",
                      "codingSchemeDesignator": "RadLex3.10_NS"
                    }
                  ]
                },
                {
                  "annotatorConfidence": false,
                  "authors": "Default User",
                  "id": "2.25.164648481688704170072251256968019225088",
                  "itemNumber": 10,
                  "label": "Nodules in Non-Lesion Lobe Same Lung (greater than 4mm noncalcified)",
                  "maxCardinality": 1,
                  "minCardinality": 1,
                  "shouldDisplay": true,
                  "AllowedTerm": [
                    {
                      "codeMeaning": "absent",
                      "codeValue": "RID28473",
                      "codingSchemeDesignator": "RadLex3.10_NS"
                    },
                    {
                      "codeMeaning": "solid",
                      "codeValue": "RID5741",
                      "codingSchemeDesignator": "RadLex3.10_NS"
                    },
                    {
                      "codeMeaning": "non-solid",
                      "codeValue": "RID46016",
                      "codingSchemeDesignator": "RadLex3.10_NS"
                    },
                    {
                      "codeMeaning": "semi-consolidation",
                      "codeValue": "RID46009",
                      "codingSchemeDesignator": "RadLex3.10_NS"
                    },
                    {
                      "codeMeaning": "partially solid",
                      "codeValue": "RID46011",
                      "codingSchemeDesignator": "RadLex3.10_NS"
                    }
                  ]
                },
                {
                  "annotatorConfidence": false,
                  "authors": "Default User",
                  "id": "2.25.33923803346582189330047535303230692411",
                  "itemNumber": 11,
                  "label": "Nodules in Contralateral Lung (gretater than 4mm noncalcified)",
                  "maxCardinality": 1,
                  "minCardinality": 1,
                  "shouldDisplay": true,
                  "AllowedTerm": [
                    {
                      "codeMeaning": "absent",
                      "codeValue": "RID28473",
                      "codingSchemeDesignator": "RadLex3.10_NS"
                    },
                    {
                      "codeMeaning": "solid",
                      "codeValue": "RID5741",
                      "codingSchemeDesignator": "RadLex3.10_NS"
                    },
                    {
                      "codeMeaning": "non-solid",
                      "codeValue": "RID46016",
                      "codingSchemeDesignator": "RadLex3.10_NS"
                    },
                    {
                      "codeMeaning": "semi-consolidation",
                      "codeValue": "RID46009",
                      "codingSchemeDesignator": "RadLex3.10_NS"
                    },
                    {
                      "codeMeaning": "partially solid",
                      "codeValue": "RID46011",
                      "codingSchemeDesignator": "RadLex3.10_NS"
                    }
                  ]
                },
                {
                  "annotatorConfidence": false,
                  "authors": "Default User",
                  "id": "2.25.180475864236240257350664551875509074349",
                  "itemNumber": 12,
                  "label": "Centrilobular Nodules - Diffuse (RB type nodules)",
                  "maxCardinality": 1,
                  "minCardinality": 1,
                  "shouldDisplay": true,
                  "AllowedTerm": [
                    {
                      "codeMeaning": "absent",
                      "codeValue": "RID28473",
                      "codingSchemeDesignator": "RadLex3.10_NS"
                    },
                    {
                      "codeMeaning": "present",
                      "codeValue": "RID28472",
                      "codingSchemeDesignator": "RadLex3.10_NS"
                    }
                  ]
                },
                {
                  "annotatorConfidence": false,
                  "authors": "Default User",
                  "id": "2.25.85167896134846854745150364271756901116",
                  "itemNumber": 13,
                  "label": "Emphysema",
                  "maxCardinality": 1,
                  "minCardinality": 1,
                  "shouldDisplay": true,
                  "AllowedTerm": [
                    {
                      "codeMeaning": "absent",
                      "codeValue": "RID28473",
                      "codingSchemeDesignator": "RadLex3.10_NS",
                      "nextId": "2.25.196629001251905554888034863981784506133"
                    },
                    {
                      "codeMeaning": "present",
                      "codeValue": "RID28472",
                      "codingSchemeDesignator": "RadLex3.10_NS"
                    }
                  ]
                },
                {
                  "annotatorConfidence": false,
                  "authors": "Default User",
                  "id": "2.25.48209778667419927995403117943578362888",
                  "itemNumber": 14,
                  "label": "Primary Emphysema Pattern",
                  "maxCardinality": 1,
                  "minCardinality": 0,
                  "shouldDisplay": true,
                  "AllowedTerm": [
                    {
                      "codeMeaning": "centrilobular",
                      "codeValue": "RID28505",
                      "codingSchemeDesignator": "RadLex3.10_NS"
                    },
                    {
                      "codeMeaning": "panacinar",
                      "codeValue": "RID46023",
                      "codingSchemeDesignator": "RadLex3.10_NS"
                    },
                    {
                      "codeMeaning": "paraseptal",
                      "codeValue": "RID46024",
                      "codingSchemeDesignator": "RadLex3.10_NS"
                    },
                    {
                      "codeMeaning": "paracicatricial",
                      "codeValue": "RID46025",
                      "codingSchemeDesignator": "RadLex3.10_NS"
                    },
                    {
                      "codeMeaning": "not applicable",
                      "codeValue": "RID46056",
                      "codingSchemeDesignator": "RadLex3.10_NS"
                    }
                  ]
                },
                {
                  "annotatorConfidence": false,
                  "authors": "Default User",
                  "id": "2.25.87497229868117253568605741682731038702",
                  "itemNumber": 15,
                  "label": "Primary Distribution",
                  "maxCardinality": 1,
                  "minCardinality": 0,
                  "shouldDisplay": true,
                  "AllowedTerm": [
                    {
                      "codeMeaning": "upper predominant",
                      "codeValue": "T28",
                      "codingSchemeDesignator": "LungTemplate"
                    },
                    {
                      "codeMeaning": "middle predominant",
                      "codeValue": "T29",
                      "codingSchemeDesignator": "LungTemplate"
                    },
                    {
                      "codeMeaning": "lower predominant",
                      "codeValue": "T30",
                      "codingSchemeDesignator": "LungTemplate"
                    },
                    {
                      "codeMeaning": "diffuse, no predominance",
                      "codeValue": "T31",
                      "codingSchemeDesignator": "LungTemplate"
                    },
                    {
                      "codeMeaning": "patchy, no predominance",
                      "codeValue": "T32",
                      "codingSchemeDesignator": "LungTemplate"
                    },
                    {
                      "codeMeaning": "unable to determin predominance or NA",
                      "codeValue": "T33",
                      "codingSchemeDesignator": "LungTemplate"
                    }
                  ]
                },
                {
                  "annotatorConfidence": false,
                  "authors": "Default User",
                  "id": "2.25.22412018022639277396146875668346172866",
                  "itemNumber": 16,
                  "label": "Primary Emphysema Laterality",
                  "maxCardinality": 1,
                  "minCardinality": 0,
                  "shouldDisplay": true,
                  "AllowedTerm": [
                    {
                      "codeMeaning": "right",
                      "codeValue": "RID5825",
                      "codingSchemeDesignator": "RadLex3.10_NS"
                    },
                    {
                      "codeMeaning": "left",
                      "codeValue": "RID5824",
                      "codingSchemeDesignator": "RadLex3.10_NS"
                    },
                    {
                      "codeMeaning": "both",
                      "codeValue": "RID5770",
                      "codingSchemeDesignator": "RadLex3.10_NS"
                    }
                  ]
                },
                {
                  "annotatorConfidence": false,
                  "authors": "Default User",
                  "id": "2.25.302457310194949316717802766802040777742",
                  "itemNumber": 17,
                  "label": "Secondary Emmphysema Pattern",
                  "maxCardinality": 1,
                  "minCardinality": 0,
                  "shouldDisplay": true,
                  "AllowedTerm": [
                    {
                      "codeMeaning": "centrilobular",
                      "codeValue": "RID28505",
                      "codingSchemeDesignator": "RadLex3.10_NS"
                    },
                    {
                      "codeMeaning": "panacinar",
                      "codeValue": "RID46023",
                      "codingSchemeDesignator": "RadLex3.10_NS"
                    },
                    {
                      "codeMeaning": "paraseptal",
                      "codeValue": "RID46024",
                      "codingSchemeDesignator": "RadLex3.10_NS"
                    },
                    {
                      "codeMeaning": "paracicatricial",
                      "codeValue": "RID46025",
                      "codingSchemeDesignator": "RadLex3.10_NS"
                    },
                    {
                      "codeMeaning": "not applicable",
                      "codeValue": "RID46056",
                      "codingSchemeDesignator": "RadLex3.10_NS"
                    }
                  ]
                },
                {
                  "annotatorConfidence": false,
                  "authors": "Default User",
                  "id": "2.25.126554497157909901085611395913043926817",
                  "itemNumber": 18,
                  "label": "Secondary Emhysema Distribution",
                  "maxCardinality": 1,
                  "minCardinality": 0,
                  "shouldDisplay": true,
                  "AllowedTerm": [
                    {
                      "codeMeaning": "upper predominant",
                      "codeValue": "T28",
                      "codingSchemeDesignator": "LungTemplate"
                    },
                    {
                      "codeMeaning": "middle predominant",
                      "codeValue": "T29",
                      "codingSchemeDesignator": "LungTemplate"
                    },
                    {
                      "codeMeaning": "lower predominant",
                      "codeValue": "T30",
                      "codingSchemeDesignator": "LungTemplate"
                    },
                    {
                      "codeMeaning": "diffuse, no predominance",
                      "codeValue": "T31",
                      "codingSchemeDesignator": "LungTemplate"
                    },
                    {
                      "codeMeaning": "patchy, no predominance",
                      "codeValue": "T32",
                      "codingSchemeDesignator": "LungTemplate"
                    },
                    {
                      "codeMeaning": "unable to determin predominance or NA",
                      "codeValue": "T33",
                      "codingSchemeDesignator": "LungTemplate"
                    }
                  ]
                },
                {
                  "annotatorConfidence": false,
                  "authors": "Default User",
                  "id": "2.25.79576331108465773610712356090472423453",
                  "itemNumber": 19,
                  "label": "Secondary Emphysema Laterality",
                  "maxCardinality": 1,
                  "minCardinality": 0,
                  "shouldDisplay": true,
                  "AllowedTerm": [
                    {
                      "codeMeaning": "right",
                      "codeValue": "RID5825",
                      "codingSchemeDesignator": "RadLex3.10_NS"
                    },
                    {
                      "codeMeaning": "left",
                      "codeValue": "RID5824",
                      "codingSchemeDesignator": "RadLex3.10_NS"
                    },
                    {
                      "codeMeaning": "both",
                      "codeValue": "RID5770",
                      "codingSchemeDesignator": "RadLex3.10_NS"
                    }
                  ]
                },
                {
                  "annotatorConfidence": false,
                  "authors": "Default User",
                  "id": "2.25.289810694927622330644816270675737408632",
                  "itemNumber": 20,
                  "label": "Overall Emmphysema Severity",
                  "maxCardinality": 1,
                  "minCardinality": 0,
                  "shouldDisplay": true,
                  "AllowedTerm": [
                    {
                      "codeMeaning": "zero severity",
                      "codeValue": "T35",
                      "codingSchemeDesignator": "LungTemplate"
                    },
                    {
                      "codeMeaning": "low severity (1-25%)",
                      "codeValue": "T36",
                      "codingSchemeDesignator": "LungTemplate"
                    },
                    {
                      "codeMeaning": "moderate severity (26-50%)",
                      "codeValue": "T37",
                      "codingSchemeDesignator": "LungTemplate"
                    },
                    {
                      "codeMeaning": "moderately high severity (51-75%)",
                      "codeValue": "T38",
                      "codingSchemeDesignator": "LungTemplate"
                    },
                    {
                      "codeMeaning": "high severity (greaterThan 75%)",
                      "codeValue": "T39",
                      "codingSchemeDesignator": "LungTemplate"
                    }
                  ]
                },
                {
                  "annotatorConfidence": false,
                  "authors": "Default User",
                  "id": "2.25.196629001251905554888034863981784506133",
                  "itemNumber": 21,
                  "label": "Lung Parencyma Features",
                  "maxCardinality": 8,
                  "minCardinality": 0,
                  "shouldDisplay": true,
                  "AllowedTerm": [
                    {
                      "codeMeaning": "airway abnormality",
                      "codeValue": "RID46026",
                      "codingSchemeDesignator": "RadLex3.10_NS"
                    },
                    {
                      "codeMeaning": "bronchial wall thickening",
                      "codeValue": "RID46027",
                      "codingSchemeDesignator": "RadLex3.10_NS"
                    },
                    {
                      "codeMeaning": "airway ectasia",
                      "codeValue": "RID46028",
                      "codingSchemeDesignator": "RadLex3.10_NS"
                    },
                    {
                      "codeMeaning": "bronchiectasis",
                      "codeValue": "RID28496",
                      "codingSchemeDesignator": "RadLex3.10_NS"
                    },
                    {
                      "codeMeaning": "luminal narrowing",
                      "codeValue": "RID46029",
                      "codingSchemeDesignator": "RadLex3.10_NS"
                    },
                    {
                      "codeMeaning": "bronchiolar prominence",
                      "codeValue": "RID46037",
                      "codingSchemeDesignator": "RadLex3.10_NS"
                    },
                    {
                      "codeMeaning": "tree-in-bud sign",
                      "codeValue": "RID35654",
                      "codingSchemeDesignator": "RadLex3.10_NS"
                    },
                    {
                      "codeMeaning": "mosaic oligemia",
                      "codeValue": "RID46030",
                      "codingSchemeDesignator": "RadLex3.10_NS"
                    }
                  ]
                },
                {
                  "annotatorConfidence": false,
                  "authors": "Default User",
                  "id": "2.25.168011863615558355498009510206396497638",
                  "itemNumber": 22,
                  "label": "Fibrosis",
                  "maxCardinality": 1,
                  "minCardinality": 1,
                  "shouldDisplay": true,
                  "AllowedTerm": [
                    {
                      "codeMeaning": "present",
                      "codeValue": "RID28472",
                      "codingSchemeDesignator": "RadLex3.10_NS"
                    },
                    {
                      "codeMeaning": "absent",
                      "codeValue": "RID28473",
                      "codingSchemeDesignator": "RadLex3.10_NS",
                      "noMoreQuestions": "true"
                    }
                  ]
                },
                {
                  "annotatorConfidence": false,
                  "authors": "Default User",
                  "id": "2.25.279492598017048490216876260893969565992",
                  "itemNumber": 23,
                  "label": "Anatomic Fibrosis Distribution",
                  "maxCardinality": 1,
                  "minCardinality": 0,
                  "shouldDisplay": true,
                  "AllowedTerm": [
                    {
                      "codeMeaning": "apical",
                      "codeValue": "RID5833",
                      "codingSchemeDesignator": "RadLex3.10_NS"
                    },
                    {
                      "codeMeaning": "upper predominant",
                      "codeValue": "T28",
                      "codingSchemeDesignator": "LungTemplate"
                    },
                    {
                      "codeMeaning": "middle predominant",
                      "codeValue": "T29",
                      "codingSchemeDesignator": "LungTemplate"
                    },
                    {
                      "codeMeaning": "lower predominant",
                      "codeValue": "T30",
                      "codingSchemeDesignator": "LungTemplate"
                    },
                    {
                      "codeMeaning": "diffuse, no predominance",
                      "codeValue": "T31",
                      "codingSchemeDesignator": "LungTemplate"
                    },
                    {
                      "codeMeaning": "patchy, no predominance",
                      "codeValue": "T32",
                      "codingSchemeDesignator": "LungTemplate"
                    },
                    {
                      "codeMeaning": "unable to determin predominance or NA",
                      "codeValue": "T33",
                      "codingSchemeDesignator": "LungTemplate"
                    }
                  ]
                },
                {
                  "annotatorConfidence": false,
                  "authors": "Default User",
                  "id": "2.25.56159694178652268995459589930935196338",
                  "itemNumber": 24,
                  "label": "Axial Fibrosis Distribution",
                  "maxCardinality": 1,
                  "minCardinality": 0,
                  "shouldDisplay": true,
                  "AllowedTerm": [
                    {
                      "codeMeaning": "subpleural",
                      "codeValue": "RID46032",
                      "codingSchemeDesignator": "RadLex3.10_NS"
                    },
                    {
                      "codeMeaning": "bronchovascular",
                      "codeValue": "RID46051",
                      "codingSchemeDesignator": "RadLex3.10_NS"
                    },
                    {
                      "codeMeaning": "subpleural & bronchovascular",
                      "codeValue": "T46",
                      "codingSchemeDesignator": "LungTemplate"
                    },
                    {
                      "codeMeaning": "random",
                      "codeValue": "RID46031",
                      "codingSchemeDesignator": "RadLex3.10_NS"
                    }
                  ]
                },
                {
                  "annotatorConfidence": false,
                  "authors": "Default User",
                  "id": "2.25.302323631874731272639500154344855572660",
                  "itemNumber": 25,
                  "label": "Fibrosis Type",
                  "maxCardinality": 1,
                  "minCardinality": 0,
                  "shouldDisplay": true,
                  "AllowedTerm": [
                    {
                      "codeMeaning": "usual interstitial pneumonia",
                      "codeValue": "RID5333",
                      "codingSchemeDesignator": "RadLex3.10_NS"
                    },
                    {
                      "codeMeaning": "nonspecific interstitial pneumonia",
                      "codeValue": "RID5341",
                      "codingSchemeDesignator": "RadLex3.10_NS"
                    },
                    {
                      "codeMeaning": "hypersensitivity pneumonitis",
                      "codeValue": "T41",
                      "codingSchemeDesignator": "LungTemplate"
                    },
                    {
                      "codeMeaning": "sarcoidosis",
                      "codeValue": "RID34662",
                      "codingSchemeDesignator": "RadLex3.10_NS"
                    },
                    {
                      "codeMeaning": "smoking-related fibrosis",
                      "codeValue": "T42",
                      "codingSchemeDesignator": "LungTemplate"
                    },
                    {
                      "codeMeaning": "post-infectious fibrosis (including OGD)",
                      "codeValue": "T43",
                      "codingSchemeDesignator": "LungTemplate"
                    },
                    {
                      "codeMeaning": "other fibrosis",
                      "codeValue": "T44",
                      "codingSchemeDesignator": "LungTemplate"
                    },
                    {
                      "codeMeaning": "indeterminate",
                      "codeValue": "RID39110",
                      "codingSchemeDesignator": "RadLex3.10_NS"
                    }
                  ]
                }
              ]
            },
            "AllowedTerm": [
              {
                "codeMeaning": " lung mass",
                "codeValue": "RID39056",
                "codingSchemeDesignator": "RadLex3.8",
                "defaultAnswer": true
              }
            ]
          }
        ]
      }
    ]
  }
};

export var pheumothrax = {
  "TemplateContainer": {
    "xmlns": "gme://caCORE.caCORE/3.2/edu.northwestern.radiology.AIMTemplate",
    "xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
    "authors": "The AIM team",
    "creationDate": "2018-02-13",
    "description": "This template is used to collect annotations for Pneumothorax evaluation",
    "name": "VK Template",
    "uid": "2.25.34624583697487865432567896543",
    "version": "2.0",
    "xsi:schemaLocation": "gme://caCORE.caCORE/3.2/edu.northwestern.radiology.AIMTemplate AIMTemplate_v2rv13.xsd",
    "Template": [
      {
        "authors": "epaduser",
        "codeMeaning": "Pneumothorax",
        "codeValue": "Pneumothorax",
        "codingSchemeDesignator": "99EPAD",
        "codingSchemeVersion": "1.0",
        "creationDate": "2019-06-24",
        "description": "Template used for Pneumothorax",
        "name": "Pneumothorax",
        "uid": "2.25.158009232454643678844005670982612161979",
        "version": "2.0",
        "Component": [
          {
            "authors": "epaduser",
            "explanatoryText": "Observation",
            "id": "2.25.4369054531658.1305416223742.217635712095",
            "itemNumber": 2,
            "label": "Observation",
            "maxCardinality": 1,
            "minCardinality": 1,
            "shouldDisplay": true,
            "ImagingObservation": {
              "annotatorConfidence": false,
              "ImagingObservationCharacteristic": [
                {
                  "annotatorConfidence": false,
                  "authors": "epaduser",
                  "explanatoryText": "Pneumothorax Detection",
                  "id": "2.25.4369054532228.1305416224313.217635712143",
                  "itemNumber": 1,
                  "label": "Pneumothorax Detection",
                  "maxCardinality": 1,
                  "minCardinality": 1,
                  "shouldDisplay": true,
                  "AllowedTerm": [
                    {
                      "codeMeaning": "Pneumothorax Detection",
                      "codeValue": "RDE249",
                      "codingSchemeDesignator": "http://radelement.org"
                    }
                  ]
                }
              ]
            },
            "AllowedTerm": [
              {
                "codeMeaning": "Pneumothorax",
                "codeValue": "RDES44",
                "codingSchemeDesignator": "http://radelement.org"
              }
            ]
          }
        ]
      }
    ]
  }
};

export var testing_quantifiers_minnie = {
  "TemplateContainer": {
    "xmlns": "gme://caCORE.caCORE/3.2/edu.northwestern.radiology.AIMTemplate",
    "xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
    "authors": "Debra Willrett",
    "creationDate": "2013-04-23",
    "description": "group of testing templates",
    "name": "testing group",
    "uid": "2.25.2535853645424096659245229006985152396887",
    "version": "1.0",
    "xsi:schemaLocation": "gme://caCORE.caCORE/3.2/edu.northwestern.radiology.AIMTemplate AIMTemplate_v2rv13.xsd",
    "Template": [
      {
        "authors": "Default User",
        "codeMeaning": "Minnie Mouse",
        "codeValue": "RID344045",
        "codingSchemeDesignator": "RadLex",
        "codingSchemeVersion": "1.0",
        "creationDate": "2015-01-30",
        "description": "testing quantifiers",
        "modality": "CT",
        "name": "minnie",
        "uid": "2.25.3059502976353540554087811136203187672299",
        "version": "1",
        "Component": [
          {
            "authors": "Default User",
            "id": "2.25.294253544717129986553974839657379990656",
            "itemNumber": 0,
            "label": "polygon",
            "maxCardinality": 1,
            "minCardinality": 1,
            "shouldDisplay": true,
            "GeometricShape": "Polyline"
          },
          {
            "authors": "Default User",
            "explanatoryText": "text",
            "id": "2.25.85043170596924078719738306041925392318",
            "itemNumber": 1,
            "label": "head",
            "maxCardinality": 1,
            "minCardinality": 1,
            "shouldDisplay": true,
            "AnatomicEntity": {
              "annotatorConfidence": false,
              "AnatomicEntityCharacteristic": [
                {
                  "annotatorConfidence": false,
                  "authors": "Default User",
                  "id": "2.25.96222470059914333012293749203319505848",
                  "itemNumber": 0,
                  "label": "leg",
                  "maxCardinality": 1,
                  "minCardinality": 1,
                  "shouldDisplay": true,
                  "AllowedTerm": [
                    {
                      "codeMeaning": "dog leg sign",
                      "codeValue": "RID35158",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "skeletal muscle of leg",
                      "codeValue": "RID2910",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    }
                  ]
                }
              ]
            },
            "AllowedTerm": [
              {
                "codeMeaning": "headcheese sign",
                "codeValue": "RID35264",
                "codingSchemeDesignator": "RadLex",
                "codingSchemeVersion": "1.0"
              },
              {
                "codeMeaning": "CT arrowhead sign",
                "codeValue": "RID35128",
                "codingSchemeDesignator": "RadLex",
                "codingSchemeVersion": "1.0"
              }
            ]
          }
        ]
      }
    ],
    "Tags": {
      "Tag": [
        {
          "TagName": {
            "codeMeaning": "Target Lesion Progressive Disease",
            "codeValue": "112043",
            "codingSchemeDesignator": "DCM",
            "codingSchemeVersion": "1.0"
          },
          "TagValue": {
            "CodedValue": {
              "codeMeaning": "Target Lesion Progressive Disease",
              "codeValue": "112043",
              "codingSchemeDesignator": "DCM",
              "codingSchemeVersion": "1.0"
            }
          }
        },
        {
          "TagName": {
            "codeMeaning": "Non-Target Lesion Incomplete Response or Stable Disease",
            "codeValue": "112046",
            "codingSchemeDesignator": "DCM",
            "codingSchemeVersion": "1.0"
          },
          "TagValue": {
            "CodedValue": {
              "codeMeaning": "Non-Target Lesion Incomplete Response or Stable Disease",
              "codeValue": "112046",
              "codingSchemeDesignator": "DCM",
              "codingSchemeVersion": "1.0"
            }
          }
        }
      ]
    }
  }
};
// epad public templates  above

//epad prod templates below
export var HGG_v2 = {
  "TemplateContainer": {
    "xmlns": "gme://caCORE.caCORE/3.2/edu.northwestern.radiology.AIMTemplate",
    "xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
    "authors": "Mike Iv",
    "creationDate": "2015-03-31",
    "description": "Semantic terms for pediatric HGGs",
    "name": "HGG",
    "uid": "2.25.292461366878279827312443839278593281416",
    "version": "2.0",
    "xsi:schemaLocation": "gme://caCORE.caCORE/3.2/edu.northwestern.radiology.AIMTemplate AIMTemplate_v2rv13.xsd",
    "Template": [
      {
        "authors": "Default User",
        "codeMeaning": "Glioblastoma",
        "codeValue": "01",
        "codingSchemeDesignator": "GBM",
        "codingSchemeVersion": "1.0",
        "creationDate": "2015-03-31",
        "description": "Semantic terms for pediatric HGGs",
        "name": "HGG_v2",
        "uid": "2.25.35555502409557334406164235032149491993",
        "version": "1.0",
        "Component": [
          {
            "id": "2.25.204692226805273335967159439601030917067",
            "itemNumber": 0,
            "label": "Tumor",
            "maxCardinality": 1,
            "minCardinality": 1,
            "shouldDisplay": true,
            "ImagingObservation": {
              "annotatorConfidence": false,
              "ImagingObservationCharacteristic": [
                {
                  "annotatorConfidence": false,
                  "authors": "Mike Iv",
                  "explanatoryText": "Location of tumor center",
                  "id": "2.25.17583250072459671737254011229002212043",
                  "itemNumber": 0,
                  "label": "Tumor Center",
                  "maxCardinality": 1,
                  "minCardinality": 1,
                  "shouldDisplay": true,
                  "AllowedTerm": [
                    {
                      "codeMeaning": "Frontal",
                      "codeValue": "01",
                      "codingSchemeDesignator": "GBM"
                    },
                    {
                      "codeMeaning": "Temporal",
                      "codeValue": "02",
                      "codingSchemeDesignator": "GBM"
                    },
                    {
                      "codeMeaning": "Insular",
                      "codeValue": "03",
                      "codingSchemeDesignator": "GBM"
                    },
                    {
                      "codeMeaning": "Parietal",
                      "codeValue": "04",
                      "codingSchemeDesignator": "GBM"
                    },
                    {
                      "codeMeaning": "Occipital",
                      "codeValue": "05",
                      "codingSchemeDesignator": "GBM"
                    },
                    {
                      "codeMeaning": "Cerebellar",
                      "codeValue": "06",
                      "codingSchemeDesignator": "GBM"
                    },
                    {
                      "codeMeaning": "Brainstem",
                      "codeValue": "07",
                      "codingSchemeDesignator": "GBM"
                    }
                  ]
                },
                {
                  "annotatorConfidence": false,
                  "authors": "Mike Iv",
                  "explanatoryText": "Side of tumor center",
                  "id": "2.25.86151012391565077938841230233548504092",
                  "itemNumber": 1,
                  "label": "Side of Tumor Center",
                  "maxCardinality": 1,
                  "minCardinality": 1,
                  "shouldDisplay": true,
                  "AllowedTerm": [
                    {
                      "codeMeaning": "Right",
                      "codeValue": "08",
                      "codingSchemeDesignator": "GBM"
                    },
                    {
                      "codeMeaning": "Midline",
                      "codeValue": "10",
                      "codingSchemeDesignator": "GBM"
                    },
                    {
                      "codeMeaning": "Left",
                      "codeValue": "09",
                      "codingSchemeDesignator": "GBM"
                    }
                  ]
                },
                {
                  "annotatorConfidence": false,
                  "authors": "Default User",
                  "id": "2.25.75616177333377176094332056481951357617",
                  "itemNumber": 2,
                  "label": "Necrosis or cysts",
                  "maxCardinality": 1,
                  "minCardinality": 1,
                  "shouldDisplay": true,
                  "AllowedTerm": [
                    {
                      "codeMeaning": "No",
                      "codeValue": "11",
                      "codingSchemeDesignator": "GBM"
                    },
                    {
                      "codeMeaning": "Yes",
                      "codeValue": "12",
                      "codingSchemeDesignator": "GBM"
                    }
                  ]
                },
                {
                  "annotatorConfidence": false,
                  "authors": "Default User",
                  "id": "2.25.211059636739945103537763509004325876780",
                  "itemNumber": 3,
                  "label": "Multifocal?",
                  "maxCardinality": 1,
                  "minCardinality": 1,
                  "shouldDisplay": true,
                  "AllowedTerm": [
                    {
                      "codeMeaning": "Solitary",
                      "codeValue": "13",
                      "codingSchemeDesignator": "GBM"
                    },
                    {
                      "codeMeaning": "Multifocal",
                      "codeValue": "14",
                      "codingSchemeDesignator": "GBM"
                    },
                    {
                      "codeMeaning": "Gliomatosis",
                      "codeValue": "15",
                      "codingSchemeDesignator": "GBM"
                    }
                  ]
                },
                {
                  "annotatorConfidence": false,
                  "authors": "Default User",
                  "id": "2.25.2525942748026323346937680437486930100",
                  "itemNumber": 4,
                  "label": "Definition of enhancing margin",
                  "maxCardinality": 1,
                  "minCardinality": 1,
                  "shouldDisplay": true,
                  "AllowedTerm": [
                    {
                      "codeMeaning": "Well-defined",
                      "codeValue": "16",
                      "codingSchemeDesignator": "GBM"
                    },
                    {
                      "codeMeaning": "Poorly defined",
                      "codeValue": "17",
                      "codingSchemeDesignator": "GBM"
                    },
                    {
                      "codeMeaning": "Mixed",
                      "codeValue": "18",
                      "codingSchemeDesignator": "GBM"
                    }
                  ]
                },
                {
                  "annotatorConfidence": false,
                  "authors": "Default User",
                  "id": "2.25.204177506167972713951865230703452270351",
                  "itemNumber": 5,
                  "label": "Definition of non-enhancing margin",
                  "maxCardinality": 1,
                  "minCardinality": 1,
                  "shouldDisplay": true,
                  "AllowedTerm": [
                    {
                      "codeMeaning": "Well-defined",
                      "codeValue": "16",
                      "codingSchemeDesignator": "GBM"
                    },
                    {
                      "codeMeaning": "Poorly defined",
                      "codeValue": "17",
                      "codingSchemeDesignator": "GBM"
                    },
                    {
                      "codeMeaning": "Mixed",
                      "codeValue": "18",
                      "codingSchemeDesignator": "GBM"
                    }
                  ]
                },
                {
                  "annotatorConfidence": false,
                  "authors": "Default User",
                  "id": "2.25.168940394339575711696652619289491096501",
                  "itemNumber": 6,
                  "label": "Hemorrhage",
                  "maxCardinality": 1,
                  "minCardinality": 1,
                  "shouldDisplay": true,
                  "AllowedTerm": [
                    {
                      "codeMeaning": "No",
                      "codeValue": "11",
                      "codingSchemeDesignator": "GBM"
                    },
                    {
                      "codeMeaning": "Yes",
                      "codeValue": "12",
                      "codingSchemeDesignator": "GBM"
                    }
                  ]
                },
                {
                  "annotatorConfidence": false,
                  "authors": "Default User",
                  "id": "2.25.260621351255732148376608304767088165553",
                  "itemNumber": 7,
                  "label": "Pial invasion/leptomeningeal spread",
                  "maxCardinality": 1,
                  "minCardinality": 1,
                  "shouldDisplay": true,
                  "AllowedTerm": [
                    {
                      "codeMeaning": "No",
                      "codeValue": "11",
                      "codingSchemeDesignator": "GBM"
                    },
                    {
                      "codeMeaning": "Yes",
                      "codeValue": "12",
                      "codingSchemeDesignator": "GBM"
                    }
                  ]
                },
                {
                  "annotatorConfidence": false,
                  "authors": "Default User",
                  "id": "2.25.126367460354275764333933724343508812656",
                  "itemNumber": 8,
                  "label": "Dural contact or invasion",
                  "maxCardinality": 1,
                  "minCardinality": 1,
                  "shouldDisplay": true,
                  "AllowedTerm": [
                    {
                      "codeMeaning": "No",
                      "codeValue": "11",
                      "codingSchemeDesignator": "GBM"
                    },
                    {
                      "codeMeaning": "Yes",
                      "codeValue": "12",
                      "codingSchemeDesignator": "GBM"
                    }
                  ]
                },
                {
                  "annotatorConfidence": false,
                  "authors": "Default User",
                  "id": "2.25.272788417479384429049325051899515343300",
                  "itemNumber": 9,
                  "label": "Ependymal contact or invasion",
                  "maxCardinality": 1,
                  "minCardinality": 1,
                  "shouldDisplay": true,
                  "AllowedTerm": [
                    {
                      "codeMeaning": "No",
                      "codeValue": "11",
                      "codingSchemeDesignator": "GBM"
                    },
                    {
                      "codeMeaning": "Yes",
                      "codeValue": "12",
                      "codingSchemeDesignator": "GBM"
                    }
                  ]
                },
                {
                  "annotatorConfidence": false,
                  "authors": "Default User",
                  "id": "2.25.297458053817299542885758289892326561125",
                  "itemNumber": 10,
                  "label": "Cortical involvement",
                  "maxCardinality": 1,
                  "minCardinality": 1,
                  "shouldDisplay": true,
                  "AllowedTerm": [
                    {
                      "codeMeaning": "No",
                      "codeValue": "11",
                      "codingSchemeDesignator": "GBM"
                    },
                    {
                      "codeMeaning": "Yes",
                      "codeValue": "12",
                      "codingSchemeDesignator": "GBM"
                    }
                  ]
                },
                {
                  "annotatorConfidence": false,
                  "authors": "Default User",
                  "explanatoryText": "Including internal capsule, brainstem, corpus callosum",
                  "id": "2.25.240854165636317216145546949446921129940",
                  "itemNumber": 11,
                  "label": "Deep white matter invasion",
                  "maxCardinality": 1,
                  "minCardinality": 1,
                  "shouldDisplay": true,
                  "AllowedTerm": [
                    {
                      "codeMeaning": "No",
                      "codeValue": "11",
                      "codingSchemeDesignator": "GBM"
                    },
                    {
                      "codeMeaning": "Yes",
                      "codeValue": "12",
                      "codingSchemeDesignator": "GBM"
                    }
                  ]
                },
                {
                  "annotatorConfidence": false,
                  "authors": "Default User",
                  "id": "2.25.38126204114941755587541017884225024862",
                  "itemNumber": 12,
                  "label": "Any tumor crosses midline",
                  "maxCardinality": 1,
                  "minCardinality": 1,
                  "shouldDisplay": true,
                  "AllowedTerm": [
                    {
                      "codeMeaning": "No",
                      "codeValue": "11",
                      "codingSchemeDesignator": "GBM"
                    },
                    {
                      "codeMeaning": "Yes",
                      "codeValue": "12",
                      "codingSchemeDesignator": "GBM"
                    }
                  ]
                },
                {
                  "annotatorConfidence": false,
                  "authors": "Default User",
                  "id": "2.25.16236420866833726716143422280886880552",
                  "itemNumber": 13,
                  "label": "Satellite lesions",
                  "maxCardinality": 1,
                  "minCardinality": 1,
                  "shouldDisplay": true,
                  "AllowedTerm": [
                    {
                      "codeMeaning": "No",
                      "codeValue": "11",
                      "codingSchemeDesignator": "GBM"
                    },
                    {
                      "codeMeaning": "Yes",
                      "codeValue": "12",
                      "codingSchemeDesignator": "GBM"
                    }
                  ]
                }
              ]
            },
            "AllowedTerm": [
              {
                "codeMeaning": "High grade glioma",
                "codeValue": "01",
                "codingSchemeDesignator": "GBM",
                "codingSchemeVersion": "1.0",
                "defaultAnswer": true
              }
            ]
          }
        ]
      }
    ]
  }
};

export var HIRADS = {
  "TemplateContainer": {
    "xmlns": "gme://caCORE.caCORE/3.2/edu.northwestern.radiology.AIMTemplate",
    "xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
    "authors": "Joshua Reicher, Daniel Rubin, Max Wintermark",
    "creationDate": "2014-05-08",
    "description": "Section for the HI-RADS template.",
    "name": "HI-RADS",
    "uid": "2.25.314979511266804042753445020815915384222",
    "version": "1.0",
    "xsi:schemaLocation": "gme://caCORE.caCORE/3.2/edu.northwestern.radiology.AIMTemplate AIMTemplate_v2rv13.xsd",
    "Template": [
      {
        "authors": "Default User",
        "codeMeaning": "HIRADSQuestions",
        "codeValue": "HIRADS-00006",
        "codingSchemeDesignator": "HIRADS",
        "creationDate": "2014-05-08",
        "description": "Head injury template",
        "name": "HI-RADS",
        "uid": "2.25.431086808846631822872686337266426442",
        "version": "1.0",
        "Component": [
          {
            "authors": "Default User",
            "explanatoryText": "Normal versus abnormal",
            "id": "2.25.92528516994983014975080985490502839074",
            "itemNumber": 0,
            "label": "Any abnormality?",
            "maxCardinality": 1,
            "minCardinality": 1,
            "shouldDisplay": true,
            "QuestionType": {
              "codeMeaning": "Are there any abnormalities?",
              "codeValue": "HIRADS-00006A",
              "codingSchemeDesignator": "HIRADS"
            },
            "ImagingObservation": {
              "annotatorConfidence": false
            },
            "AllowedTerm": [
              {
                "codeMeaning": "AbnormaltiesPresent",
                "codeValue": "HIRADS-00004",
                "codingSchemeDesignator": "HIRADS"
              },
              {
                "codeMeaning": "AbnormalitiesAbsent",
                "codeValue": "HIRADS-00005",
                "codingSchemeDesignator": "HIRADS",
                "noMoreQuestions": "true"
              }
            ]
          },
          {
            "authors": "Default User",
            "id": "2.25.233606034989558816243942074090623000744",
            "itemNumber": 1,
            "label": "LesionPathology",
            "maxCardinality": 0,
            "minCardinality": 0,
            "shouldDisplay": false,
            "ImagingObservation": {
              "annotatorConfidence": false,
              "ImagingObservationCharacteristic": [
                {
                  "annotatorConfidence": false,
                  "authors": "Default User",
                  "id": "2.25.157277143189430389487525690908180651362",
                  "itemNumber": 0,
                  "label": "FractureLaterality",
                  "maxCardinality": 1,
                  "minCardinality": 0,
                  "shouldDisplay": true,
                  "AllowedTerm": [
                    {
                      "codeMeaning": "left side",
                      "codeValue": "RID46054",
                      "codingSchemeDesignator": "RadLex3.10_NS"
                    },
                    {
                      "codeMeaning": "right side",
                      "codeValue": "RID46055",
                      "codingSchemeDesignator": "RadLex3.10_NS"
                    }
                  ]
                },
                {
                  "annotatorConfidence": false,
                  "authors": "Default User",
                  "id": "2.25.5735647123795655816019312831464843221",
                  "itemNumber": 1,
                  "label": "FractureType",
                  "maxCardinality": 3,
                  "minCardinality": 0,
                  "shouldDisplay": true,
                  "AllowedTerm": [
                    {
                      "codeMeaning": "fracture",
                      "codeValue": "RID4650",
                      "codingSchemeDesignator": "RadLex3.10_NS",
                      "ValidTerm": [
                        {
                          "codeMeaning": "linear",
                          "codeValue": "RID5811",
                          "codingSchemeDesignator": "RadLex3.10_NS"
                        }
                      ]
                    },
                    {
                      "codeMeaning": "depression fracture",
                      "codeValue": "RID6344",
                      "codingSchemeDesignator": "RadLex3.10_NS"
                    },
                    {
                      "codeMeaning": "fracture",
                      "codeValue": "RID4650",
                      "codingSchemeDesignator": "RadLex3.10_NS",
                      "ValidTerm": [
                        {
                          "codeMeaning": "complex",
                          "codeValue": "RID5757",
                          "codingSchemeDesignator": "RadLex3.10_NS"
                        }
                      ]
                    }
                  ]
                },
                {
                  "annotatorConfidence": false,
                  "authors": "Default User",
                  "id": "2.25.130456233589176973648472352328340032092",
                  "itemNumber": 2,
                  "label": "HematomaLaterality",
                  "maxCardinality": 1,
                  "minCardinality": 0,
                  "shouldDisplay": true,
                  "AllowedTerm": [
                    {
                      "codeMeaning": "right side",
                      "codeValue": "RID46055",
                      "codingSchemeDesignator": "RadLex3.10_NS"
                    },
                    {
                      "codeMeaning": "left side",
                      "codeValue": "RID46054",
                      "codingSchemeDesignator": "RadLex3.10_NS"
                    }
                  ]
                },
                {
                  "annotatorConfidence": false,
                  "authors": "Default User",
                  "id": "2.25.332604812383123939056378817459679571682",
                  "itemNumber": 3,
                  "label": "HematomaThickness",
                  "maxCardinality": 1,
                  "minCardinality": 1,
                  "shouldDisplay": true,
                  "AllowedTerm": [
                    {
                      "codeMeaning": "LessThan5mm",
                      "codeValue": "HIRADS-00007A",
                      "codingSchemeDesignator": "HIRADS",
                      "defaultAnswer": true
                    },
                    {
                      "codeMeaning": "5-10mm",
                      "codeValue": "HIRADS-00007B",
                      "codingSchemeDesignator": "HIRADS"
                    },
                    {
                      "codeMeaning": "11-15mm",
                      "codeValue": "HIRADS-00007C",
                      "codingSchemeDesignator": "HIRADS"
                    },
                    {
                      "codeMeaning": "GreaterThan15mm",
                      "codeValue": "HIRADS-00007D",
                      "codingSchemeDesignator": "HIRADS"
                    }
                  ]
                }
              ]
            },
            "AllowedTerm": [
              {
                "codeMeaning": "not applicable",
                "codeValue": "RID46056",
                "codingSchemeDesignator": "RadLex3.10_NS"
              }
            ]
          }
        ]
      }
    ]
  }
};

export var LIDC_CR_DR = {
  "TemplateContainer": {
    "xmlns": "gme://caCORE.caCORE/3.2/edu.northwestern.radiology.AIMTemplate",
    "xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
    "authors": "The AIM team",
    "creationDate": "2011-07-10",
    "description": "This template is used by an application program to present readers and adjudicators with available option for evaluating lung tumor studies.",
    "name": "VK Template",
    "uid": "2.25.3996559650141.1194316969797.204033480008",
    "version": "1",
    "xsi:schemaLocation": "gme://caCORE.caCORE/3.2/edu.northwestern.radiology.AIMTemplate AIMTemplate_v2rv13.xsd",
    "Template": [
      {
        "authors": "AIM Team",
        "codeMeaning": "Lung Tumor Measurement CR DR",
        "codeValue": "LIDC-2",
        "codingSchemeDesignator": "Private_LIDC",
        "creationDate": "2010-02-15",
        "description": "This is a LIDC template version 2 revision 22.",
        "modality": "CR",
        "name": "LIDC_CR_DR",
        "precedingAnnotation": "DoNotOffer",
        "uid": "2.25.3996559650658.1194316970315.204033480053",
        "version": "1.0",
        "Component": [
          {
            "explanatoryText": "Location of lesion geographic center.",
            "id": "2.25.3996559651177.1194316970834.204033480098",
            "itemNumber": 1,
            "label": "Tumor Location",
            "maxCardinality": 1,
            "minCardinality": 1,
            "shouldDisplay": true,
            "QuestionType": {
              "codeMeaning": "Where is the tumor location?",
              "codeValue": "WTL-100",
              "codingSchemeDesignator": "Private"
            },
            "AnatomicEntity": {
              "annotatorConfidence": true,
              "AnatomicEntityCharacteristic": [
                {
                  "annotatorConfidence": false,
                  "explanatoryText": "Side of lesion center only",
                  "id": "2.25.3996559651697.1194316971354.204033480143",
                  "itemNumber": 1,
                  "label": "Side of Tumor Center",
                  "maxCardinality": 1,
                  "minCardinality": 1,
                  "shouldDisplay": true,
                  "AllowedTerm": [
                    {
                      "codeMeaning": "Right",
                      "codeValue": "G-A100",
                      "codingSchemeDesignator": "SRT"
                    },
                    {
                      "codeMeaning": "Left",
                      "codeValue": "G-A101",
                      "codingSchemeDesignator": "SRT"
                    }
                  ],
                  "QuestionType": {
                    "codeMeaning": "Where is the side of tumor center?",
                    "codeValue": "PRTC1",
                    "codingSchemeDesignator": "Private"
                  }
                }
              ]
            },
            "AllowedTerm": [
              {
                "codeMeaning": "Upper lobe of left lung",
                "codeValue": "RID1327",
                "codingSchemeDesignator": "RadLex"
              },
              {
                "codeMeaning": "Lower lobe of left lung",
                "codeValue": "RID1315",
                "codingSchemeDesignator": "RadLex"
              },
              {
                "codeMeaning": "Middle lobe of right lung",
                "codeValue": "RID1310",
                "codingSchemeDesignator": "RadLex"
              },
              {
                "codeMeaning": "Upper lobe of right lung",
                "codeValue": "RID1303",
                "codingSchemeDesignator": "RadLex"
              },
              {
                "codeMeaning": "Lower lobe of left lung",
                "codeValue": "RadLex",
                "codingSchemeDesignator": "RID1338"
              }
            ]
          },
          {
            "explanatoryText": "Select the type of lesion",
            "groupLabel": "Component Label 1",
            "id": "2.25.3996559652219.1194316971876.204033480188",
            "itemNumber": 2,
            "label": "Lesion",
            "maxCardinality": 1,
            "minCardinality": 1,
            "shouldDisplay": true,
            "QuestionType": {
              "codeMeaning": "What is the type of lesion?",
              "codeValue": "PRLS1",
              "codingSchemeDesignator": "Private"
            },
            "ImagingObservation": {
              "annotatorConfidence": true,
              "ImagingObservationCharacteristic": [
                {
                  "annotatorConfidence": false,
                  "explanatoryText": " ",
                  "id": "2.25.3996559652742.1194316972399.204033480233",
                  "itemNumber": 1,
                  "label": "Morphologic characteristic",
                  "maxCardinality": 1,
                  "minCardinality": 1,
                  "shouldDisplay": true,
                  "AllowedTerm": [
                    {
                      "codeMeaning": "Micronodular",
                      "codeValue": "RID5803",
                      "codingSchemeDesignator": "RadLex",
                      "CharacteristicQuantification": [
                        {
                          "annotatorConfidence": false,
                          "characteristicQuantificationIndex": 1,
                          "name": "Characteristic Quantification",
                          "NonQuantifiable": [
                            {
                              "codeMeaning": "None",
                              "codeValue": "R-40775",
                              "codingSchemeDesignator": "SRT"
                            },
                            {
                              "codeMeaning": "Indeterminate",
                              "codeValue": "C48658",
                              "codingSchemeDesignator": "NCI"
                            }
                          ]
                        }
                      ]
                    },
                    {
                      "codeMeaning": "Macronodular",
                      "codeValue": "RID5804",
                      "codingSchemeDesignator": "RadLex",
                      "CharacteristicQuantification": [
                        {
                          "annotatorConfidence": false,
                          "characteristicQuantificationIndex": 1,
                          "name": "Enhancement Quality Characteristic Quantification",
                          "NonQuantifiable": [
                            {
                              "codeMeaning": "None",
                              "codeValue": "R-40775",
                              "codingSchemeDesignator": "SRT"
                            },
                            {
                              "codeMeaning": "Mild",
                              "codeValue": "R-404FA",
                              "codingSchemeDesignator": "SRT"
                            }
                          ]
                        }
                      ]
                    }
                  ],
                  "QuestionType": {
                    "codeMeaning": "What is the type of lesion?",
                    "codeValue": "PRLS1",
                    "codingSchemeDesignator": "Private"
                  }
                }
              ]
            },
            "AllowedTerm": [
              {
                "codeMeaning": "mass",
                "codeValue": "RID3874",
                "codingSchemeDesignator": "RadLex"
              }
            ]
          }
        ],
        "Tags": {
          "Tag": [
            {
              "TagName": {
                "codeMeaning": "Disease",
                "codeValue": "64572001",
                "codingSchemeDesignator": "SRT"
              },
              "TagValue": {
                "CodedValue": {
                  "codeMeaning": "Lung Carcinoma",
                  "codeValue": "C4878",
                  "codingSchemeDesignator": "NCIt"
                }
              }
            },
            {
              "TagName": {
                "codeMeaning": "Disease",
                "codeValue": "64572001",
                "codingSchemeDesignator": "SRT"
              },
              "TagValue": {
                "CodedValue": {
                  "codeMeaning": "Suspected lung cancer",
                  "codeValue": "R-F344B",
                  "codingSchemeDesignator": "SRT"
                }
              }
            }
          ]
        }
      },
      {
        "authors": "AIM Team",
        "codeMeaning": "Lung Tumor Measurement CT",
        "codeValue": "LIDC-1",
        "codingSchemeDesignator": "LIDC",
        "creationDate": "2011-07-10",
        "description": "This is a LIDC template version 2 revision 23.",
        "modality": "CT",
        "name": "LIDC CT",
        "precedingAnnotation": "RequireToSelect",
        "uid": "2.25.3996559653266.1194316972923.204033480278",
        "version": "1.1",
        "Component": [
          {
            "explanatoryText": "Location of lesion geographic center (not all areas of involvement).",
            "id": "2.25.3996559653791.1194316973449.204033480323",
            "itemNumber": 1,
            "label": "Tumor Location",
            "maxCardinality": 1,
            "minCardinality": 0,
            "shouldDisplay": true,
            "QuestionType": {
              "codeMeaning": "Where is the tumor location?",
              "codeValue": "WTL-100",
              "codingSchemeDesignator": "Private"
            },
            "AnatomicEntity": {
              "annotatorConfidence": true,
              "AnatomicEntityCharacteristic": [
                {
                  "annotatorConfidence": false,
                  "explanatoryText": "Side of lesion center",
                  "id": "2.25.3996559654318.1194316973976.204033480368",
                  "itemNumber": 1,
                  "label": "Side of Tumor Center",
                  "maxCardinality": 1,
                  "minCardinality": 1,
                  "shouldDisplay": true,
                  "AllowedTerm": [
                    {
                      "codeMeaning": "Right",
                      "codeValue": "G-A100",
                      "codingSchemeDesignator": "SRT"
                    },
                    {
                      "codeMeaning": "Left",
                      "codeValue": "G-A101",
                      "codingSchemeDesignator": "SRT"
                    }
                  ]
                }
              ]
            },
            "AllowedTerm": [
              {
                "codeMeaning": "Upper lobe of left lung",
                "codeValue": "RID1327",
                "codingSchemeDesignator": "RadLex"
              },
              {
                "codeMeaning": "Upper lobe of right lung",
                "codeValue": "RID1303",
                "codingSchemeDesignator": "RadLex"
              },
              {
                "codeMeaning": "Lower lobe of left lung",
                "codeValue": "RadLex",
                "codingSchemeDesignator": "RID1338"
              }
            ]
          },
          {
            "authors": "The AIM Team",
            "explanatoryText": "Please put an arrow to identify the tumor location.",
            "groupLabel": "Creating an arrow ",
            "id": "2.25.3996559654846.1194316974504.204033480413",
            "itemNumber": 2,
            "label": "Arrow",
            "maxCardinality": 1,
            "minCardinality": 0,
            "shouldDisplay": true,
            "QuestionType": {
              "codeMeaning": "Place an arrow an a tumor",
              "codeValue": "PA1",
              "codingSchemeDesignator": "Private"
            },
            "GeometricShape": "Point"
          },
          {
            "id": "2.25.3996559655375.1194316975034.204033480458",
            "itemNumber": 7,
            "label": "RECIST Calculation",
            "maxCardinality": 1,
            "minCardinality": 0,
            "shouldDisplay": true,
            "QuestionType": {
              "codeMeaning": "Perform RECIST calculation ",
              "codeValue": "PRCAL1",
              "codingSchemeDesignator": "Private"
            },
            "Calculation": {
              "CalculationType": [
                {
                  "codeMeaning": "RECIST Calculation",
                  "codeValue": "REC-C",
                  "codingSchemeDesignator": "Private-RECIST",
                  "ValidTerm": [
                    {
                      "codeMeaning": "RECIST 1.0",
                      "codeValue": "REC-C-1.0",
                      "codingSchemeDesignator": "Private-RECIST"
                    },
                    {
                      "codeMeaning": "RECIST 1.1",
                      "codeValue": "REC-C-1.1",
                      "codingSchemeDesignator": "Private-RECIST"
                    }
                  ],
                  "AlgorithmType": [
                    {
                      "algorithmName": "Longest Diameter for Recist",
                      "algorithmVersion": "1.0",
                      "codeMeaning": "Longest Diameter",
                      "codeValue": "REC-LD-0264",
                      "codingSchemeDesignator": "Private-RECIST",
                      "description": "Calculation the logest diameter of a lesion.",
                      "uniqueIdentifier": "7880.3455756.67856.343412.13567"
                    }
                  ]
                }
              ]
            }
          }
        ],
        "Tags": {
          "Tag": [
            {
              "TagName": {
                "codeMeaning": "Disease",
                "codeValue": "64572001",
                "codingSchemeDesignator": "SRT"
              },
              "TagValue": {
                "CodedValue": {
                  "codeMeaning": "Lung Carcinoma",
                  "codeValue": "C4878",
                  "codingSchemeDesignator": "NCIt"
                }
              }
            },
            {
              "TagName": {
                "codeMeaning": "Body Part",
                "codeValue": "C32221",
                "codingSchemeDesignator": "NCI"
              },
              "TagValue": {
                "CodedValue": {
                  "codeMeaning": "Lung",
                  "codeValue": "C12468",
                  "codingSchemeDesignator": "NCI"
                }
              }
            }
          ]
        }
      }
    ]
  }
};

export var LiverSegmentationsample = {
  "TemplateContainer": {
    "uid": "2.25.149171012594699922138664758902748641740",
    "name": "Liver_template_lucence",
    "authors": "Default User",
    "version": "1.0",
    "creationDate": "2019-04-16",
    "description": "Liver template for liver segmentation",
    "xsi:schemaLocation": "gme://caCORE.caCORE/3.2/edu.northwestern.radiology.AIMTemplate AIMTemplate_v2rv13.xsd",
    "xmlns": "gme://caCORE.caCORE/3.2/edu.northwestern.radiology.AIMTemplate",
    "xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
    "Template": [
      {
        "uid": "2.25.300703222468344151910046600451770312756",
        "name": "Liver segmentation template",
        "authors": "Default User",
        "version": "1.0",
        "creationDate": "2019-04-16",
        "description": "Segmentation of the liver with in CT images with phase information",
        "codingSchemeDesignator": "99PRI_TemplateCode",
        "codingSchemeVersion": "1.0",
        "codeMeaning": "Liver segmentation Lucence",
        "codeValue": "Liv_Seg_Lucence",
        "Component": [
          {
            "label": "Liver",
            "itemNumber": 0,
            "authors": "Default User",
            "explanatoryText": "segmentation of liver",
            "minCardinality": 1,
            "maxCardinality": 1,
            "shouldDisplay": true,
            "id": "2.25.204220046558674560408074926946752436027",
            "AnatomicEntity": {
              "annotatorConfidence": false
            },
            "AllowedTerm": [
              {
                "codeValue": "RID58",
                "codeMeaning": "liver",
                "codingSchemeDesignator": "RadLex",
                "codingSchemeVersion": "1.0"
              },
              {
                "codeValue": "RID4",
                "codeMeaning": "blood vessel",
                "codingSchemeDesignator": "RadLex",
                "codingSchemeVersion": "1.0"
              },
              {
                "codeValue": "RID4271",
                "codeMeaning": "hepatocellular carcinoma",
                "codingSchemeDesignator": "RadLex",
                "codingSchemeVersion": "1.0"
              },
              {
                "codeValue": "RID4215",
                "codeMeaning": "hepatocellular adenoma",
                "codingSchemeDesignator": "RadLex",
                "codingSchemeVersion": "1.0"
              }
            ]
          },
          {
            "label": "Contrast Agent",
            "itemNumber": 1,
            "explanatoryText": "Was a contrast agent used in this scan?",
            "minCardinality": 1,
            "maxCardinality": 1,
            "shouldDisplay": true,
            "id": "2.25.108753530214229171603892742922211947245",
            "ImagingObservation": {
              "annotatorConfidence": false,
              "ImagingObservationCharacteristic": [
                {
                  "label": "Phase of scan",
                  "itemNumber": 0,
                  "authors": "Default User",
                  "explanatoryText": "Arterial, venous or delayed?",
                  "minCardinality": 1,
                  "maxCardinality": 1,
                  "shouldDisplay": true,
                  "id": "2.25.193241399082108145641600889345951623178",
                  "annotatorConfidence": false,
                  "AllowedTerm": [
                    {
                      "codeValue": "RID11080",
                      "codeMeaning": "arterial phase",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeValue": "RID11084",
                      "codeMeaning": "late venous phase",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeValue": "RID11081",
                      "codeMeaning": "delayed phase",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    }
                  ]
                }
              ]
            },
            "AllowedTerm": [
              {
                "codeValue": "C390",
                "codeMeaning": "Contrast agent",
                "codingSchemeDesignator": "NCIt",
                "codingSchemeVersion": "1.0"
              }
            ]
          }
        ]
      }
    ]
  }
};

export var mammography = {
  "TemplateContainer": {
    "xmlns": "gme://caCORE.caCORE/3.2/edu.northwestern.radiology.AIMTemplate",
    "xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
    "authors": "Daniel Rubin",
    "creationDate": "2013-06-08",
    "description": "Mammography BI-RADS template",
    "name": "Mammography",
    "uid": "2.25.54451223310925796038610042632877732221",
    "version": "1.0",
    "xsi:schemaLocation": "gme://caCORE.caCORE/3.2/edu.northwestern.radiology.AIMTemplate AIMTemplate_v2rv13.xsd",
    "Template": [
      {
        "authors": "Daniel Rubin",
        "codeMeaning": " mammography",
        "codeValue": "RID10357",
        "codingSchemeDesignator": "RadLex3.8",
        "creationDate": "2013-06-08",
        "description": "BI-RADS descriptors",
        "name": "Mammography",
        "uid": "2.25.48214704905077269738687439799216916030",
        "version": "1.0",
        "Component": [
          {
            "authors": "Default User",
            "id": "2.25.308189580785064254091499661626900938780",
            "itemNumber": 0,
            "label": "LesionLocation",
            "maxCardinality": 1,
            "minCardinality": 1,
            "shouldDisplay": true,
            "ImagingObservation": {
              "annotatorConfidence": false
            },
            "AllowedTerm": [
              {
                "codeMeaning": " upper inner quadrant of breast",
                "codeValue": "RID29931",
                "codingSchemeDesignator": "RadLex3.8"
              },
              {
                "codeMeaning": " upper outer quadrant of breast",
                "codeValue": "RID29928",
                "codingSchemeDesignator": "RadLex3.8"
              },
              {
                "codeMeaning": " lower inner quadrant of breast",
                "codeValue": "RID29937",
                "codingSchemeDesignator": "RadLex3.8"
              },
              {
                "codeMeaning": " lower outer quadrant of breast",
                "codeValue": "RID29934",
                "codingSchemeDesignator": "RadLex3.8"
              },
              {
                "codeMeaning": " central region of breast",
                "codeValue": "RID29949",
                "codingSchemeDesignator": "RadLex3.8"
              },
              {
                "codeMeaning": " nipple",
                "codeValue": "RID29902",
                "codingSchemeDesignator": "RadLex3.8"
              },
              {
                "codeMeaning": " subareolar region of breast",
                "codeValue": "RID29952",
                "codingSchemeDesignator": "RadLex3.8"
              }
            ]
          },
          {
            "authors": "Default User",
            "id": "2.25.335523008439547158096441950320922785977",
            "itemNumber": 1,
            "label": "BreastDensity",
            "maxCardinality": 1,
            "minCardinality": 1,
            "shouldDisplay": true,
            "ImagingObservation": {
              "annotatorConfidence": false
            },
            "AllowedTerm": [
              {
                "codeMeaning": " predominantly fatty",
                "codeValue": "RID34273",
                "codingSchemeDesignator": "RadLex3.8"
              },
              {
                "codeMeaning": " scattered fibroglandular densities",
                "codeValue": "RID34274",
                "codingSchemeDesignator": "RadLex3.8"
              },
              {
                "codeMeaning": " heterogeneously dense",
                "codeValue": "RID34275",
                "codingSchemeDesignator": "RadLex3.8"
              },
              {
                "codeMeaning": " extremely dense",
                "codeValue": "RID34276",
                "codingSchemeDesignator": "RadLex3.8"
              }
            ]
          },
          {
            "authors": "Default User",
            "id": "2.25.54269568673334344922781644485168101437",
            "itemNumber": 2,
            "label": "MassDensity",
            "maxCardinality": 1,
            "minCardinality": 1,
            "shouldDisplay": true,
            "ImagingObservation": {
              "annotatorConfidence": false
            },
            "AllowedTerm": [
              {
                "codeMeaning": " high density",
                "codeValue": "RID34240",
                "codingSchemeDesignator": "RadLex3.8"
              },
              {
                "codeMeaning": " equal density",
                "codeValue": "RID6043",
                "codingSchemeDesignator": "RadLex3.8"
              },
              {
                "codeMeaning": " low density",
                "codeValue": "RID34243",
                "codingSchemeDesignator": "RadLex3.8"
              },
              {
                "codeMeaning": " water density",
                "codeValue": "RID43336",
                "codingSchemeDesignator": "RadLex3.8"
              },
              {
                "codeMeaning": " heterogeneously dense",
                "codeValue": "RID34275",
                "codingSchemeDesignator": "RadLex3.8"
              }
            ]
          },
          {
            "authors": "Default User",
            "id": "2.25.55681200745652897105156186375179513342",
            "itemNumber": 3,
            "label": "MassShape",
            "maxCardinality": 1,
            "minCardinality": 1,
            "shouldDisplay": true,
            "ImagingObservation": {
              "annotatorConfidence": false
            },
            "AllowedTerm": [
              {
                "codeMeaning": " round",
                "codeValue": "RID5799",
                "codingSchemeDesignator": "RadLex3.8"
              },
              {
                "codeMeaning": " lobular",
                "codeValue": "RID5801",
                "codingSchemeDesignator": "RadLex3.8"
              },
              {
                "codeMeaning": " oval",
                "codeValue": "RID5800",
                "codingSchemeDesignator": "RadLex3.8"
              },
              {
                "codeMeaning": " irregular",
                "codeValue": "RID5809",
                "codingSchemeDesignator": "RadLex3.8"
              }
            ]
          },
          {
            "authors": "Default User",
            "id": "2.25.208646600352240793665145680191002985126",
            "itemNumber": 4,
            "label": "MassMargin",
            "maxCardinality": 1,
            "minCardinality": 1,
            "shouldDisplay": true,
            "ImagingObservation": {
              "annotatorConfidence": false
            },
            "AllowedTerm": [
              {
                "codeMeaning": " sharp",
                "codeValue": "RID5911",
                "codingSchemeDesignator": "RadLex3.8"
              },
              {
                "codeMeaning": " microlobulated margin",
                "codeValue": "RID5712",
                "codingSchemeDesignator": "RadLex3.8"
              },
              {
                "codeMeaning": " obscured margin",
                "codeValue": "RID5710",
                "codingSchemeDesignator": "RadLex3.8"
              },
              {
                "codeMeaning": " indistinct margin",
                "codeValue": "RID5709",
                "codingSchemeDesignator": "RadLex3.8"
              },
              {
                "codeMeaning": " irregular margin",
                "codeValue": "RID5715",
                "codingSchemeDesignator": "RadLex3.8"
              },
              {
                "codeMeaning": " lobulated margin",
                "codeValue": "RID5711",
                "codingSchemeDesignator": "RadLex3.8"
              },
              {
                "codeMeaning": " spiculated margin",
                "codeValue": "RID5713",
                "codingSchemeDesignator": "RadLex3.8"
              }
            ]
          },
          {
            "authors": "Default User",
            "id": "2.25.46870678836024858724151379092074052651",
            "itemNumber": 5,
            "label": "Calcification",
            "maxCardinality": 10,
            "minCardinality": 0,
            "shouldDisplay": true,
            "ImagingObservation": {
              "annotatorConfidence": false
            },
            "AllowedTerm": [
              {
                "codeMeaning": " skin calcification",
                "codeValue": "RID34252",
                "codingSchemeDesignator": "RadLex3.8"
              },
              {
                "codeMeaning": " vascular calcification",
                "codeValue": "RID34253",
                "codingSchemeDesignator": "RadLex3.8"
              },
              {
                "codeMeaning": " coarse calcification",
                "codeValue": "RID29213",
                "codingSchemeDesignator": "RadLex3.8"
              },
              {
                "codeMeaning": " large rod-like calcification",
                "codeValue": "RID34248",
                "codingSchemeDesignator": "RadLex3.8"
              },
              {
                "codeMeaning": " round calcification",
                "codeValue": "RID34251",
                "codingSchemeDesignator": "RadLex3.8"
              },
              {
                "codeMeaning": " eggshell calcification",
                "codeValue": "RID29212",
                "codingSchemeDesignator": "RadLex3.8"
              },
              {
                "codeMeaning": " milk of calcium calcification",
                "codeValue": "RID34249",
                "codingSchemeDesignator": "RadLex3.8"
              },
              {
                "codeMeaning": " suture calcification",
                "codeValue": "RID34296",
                "codingSchemeDesignator": "RadLex3.8"
              },
              {
                "codeMeaning": " dystrophic calcification",
                "codeValue": "RID34246",
                "codingSchemeDesignator": "RadLex3.8"
              },
              {
                "codeMeaning": " amorphous calcification",
                "codeValue": "RID29214",
                "codingSchemeDesignator": "RadLex3.8"
              },
              {
                "codeMeaning": " coarse heterogeneous calcification",
                "codeValue": "RID34256",
                "codingSchemeDesignator": "RadLex3.8"
              },
              {
                "codeMeaning": " fine pleomorphic calcification",
                "codeValue": "RID34257",
                "codingSchemeDesignator": "RadLex3.8"
              },
              {
                "codeMeaning": " lucent-centered calcification",
                "codeValue": "RID34250",
                "codingSchemeDesignator": "RadLex3.8"
              },
              {
                "codeMeaning": " fine linear calcification",
                "codeValue": "RID34255",
                "codingSchemeDesignator": "RadLex3.8"
              },
              {
                "codeMeaning": " microcalcifications",
                "codeValue": "RID34388",
                "codingSchemeDesignator": "RadLex3.8"
              },
              {
                "codeMeaning": "calcification",
                "codeValue": "RID5196",
                "codingSchemeDesignator": "RadLex",
                "codingSchemeVersion": "1.0",
                "nextId": "2.25.262482459401526980676681913816996563158",
                "ValidTerm": [
                  {
                    "codeMeaning": "no",
                    "codeValue": "RID28475",
                    "codingSchemeDesignator": "RadLex",
                    "codingSchemeVersion": "1.0"
                  }
                ]
              }
            ]
          },
          {
            "authors": "Default User",
            "id": "2.25.306959133201987312293713082103611614614",
            "itemNumber": 6,
            "label": "CalificatioonDistribution",
            "maxCardinality": 1,
            "minCardinality": 0,
            "shouldDisplay": true,
            "ImagingObservation": {
              "annotatorConfidence": false
            },
            "AllowedTerm": [
              {
                "codeMeaning": " diffuse",
                "codeValue": "RID5701",
                "codingSchemeDesignator": "RadLex3.8"
              },
              {
                "codeMeaning": "regional",
                "codeValue": "RID34260",
                "codingSchemeDesignator": "RadLex",
                "codingSchemeVersion": "1.0"
              },
              {
                "codeMeaning": "grouped",
                "codeValue": "RID5700",
                "codingSchemeDesignator": "RadLex",
                "codingSchemeVersion": "1.0"
              },
              {
                "codeMeaning": "linear",
                "codeValue": "RID5811",
                "codingSchemeDesignator": "RadLex",
                "codingSchemeVersion": "1.0"
              },
              {
                "codeMeaning": "patchy",
                "codeValue": "RID5704",
                "codingSchemeDesignator": "RadLex",
                "codingSchemeVersion": "1.0"
              }
            ]
          },
          {
            "authors": "Default User",
            "id": "2.25.262482459401526980676681913816996563158",
            "itemNumber": 7,
            "label": "AssociatedFindings",
            "maxCardinality": 10,
            "minCardinality": 0,
            "shouldDisplay": true,
            "ImagingObservation": {
              "annotatorConfidence": false
            },
            "AllowedTerm": [
              {
                "codeMeaning": "skin retraction",
                "codeValue": "RID34383",
                "codingSchemeDesignator": "RadLex",
                "codingSchemeVersion": "1.0"
              },
              {
                "codeMeaning": "skin lesion",
                "codeValue": "RID34267",
                "codingSchemeDesignator": "RadLex",
                "codingSchemeVersion": "1.0"
              },
              {
                "codeMeaning": "skin thickening",
                "codeValue": "RID34270",
                "codingSchemeDesignator": "RadLex",
                "codingSchemeVersion": "1.0"
              },
              {
                "codeMeaning": "nipple retraction",
                "codeValue": "RID34269",
                "codingSchemeDesignator": "RadLex",
                "codingSchemeVersion": "1.0"
              },
              {
                "codeMeaning": "trabecular thickening",
                "codeValue": "RID34271",
                "codingSchemeDesignator": "RadLex",
                "codingSchemeVersion": "1.0"
              },
              {
                "codeMeaning": "axillary adenopathy",
                "codeValue": "RID34272",
                "codingSchemeDesignator": "RadLex",
                "codingSchemeVersion": "1.0"
              },
              {
                "codeMeaning": "architectural distortion",
                "codeValue": "RID34261",
                "codingSchemeDesignator": "RadLex",
                "codingSchemeVersion": "1.0"
              },
              {
                "codeMeaning": "hematoma",
                "codeValue": "RID4705",
                "codingSchemeDesignator": "RadLex",
                "codingSchemeVersion": "1.0"
              },
              {
                "codeMeaning": "scar",
                "codeValue": "RID3829",
                "codingSchemeDesignator": "RadLex",
                "codingSchemeVersion": "1.0"
              },
              {
                "codeMeaning": "radial scar",
                "codeValue": "RID3830",
                "codingSchemeDesignator": "RadLex",
                "codingSchemeVersion": "1.0"
              }
            ]
          },
          {
            "authors": "Default User",
            "id": "2.25.129125625523971082945956048385137348165",
            "itemNumber": 8,
            "label": "OtherFindings",
            "maxCardinality": 1,
            "minCardinality": 0,
            "shouldDisplay": true,
            "ImagingObservation": {
              "annotatorConfidence": false
            },
            "AllowedTerm": [
              {
                "codeMeaning": "focal asymmetry",
                "codeValue": "RID34264",
                "codingSchemeDesignator": "RadLex",
                "codingSchemeVersion": "1.0"
              },
              {
                "codeMeaning": "Intramammary lymph node",
                "codeValue": "RID34263",
                "codingSchemeDesignator": "RadLex",
                "codingSchemeVersion": "1.0"
              },
              {
                "codeMeaning": "asymmetric tubular structure",
                "codeValue": "RID34262",
                "codingSchemeDesignator": "RadLex",
                "codingSchemeVersion": "1.0"
              }
            ]
          }
        ]
      }
    ]
  }
};

export var TNMLiverTemplates = {
  "TemplateContainer": {
    "xmlns": "gme://caCORE.caCORE/3.2/edu.northwestern.radiology.AIMTemplate",
    "xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
    "authors": "Default User",
    "creationDate": "2016-04-05",
    "description": "template for TNM classification",
    "name": "TNM Liver Template",
    "uid": "2.25.324623754256230546193305819660169850602",
    "version": "0.1",
    "xsi:schemaLocation": "gme://caCORE.caCORE/3.2/edu.northwestern.radiology.AIMTemplate AIMTemplate_v2rv13.xsd",
    "Template": [
      {
        "authors": "Default User",
        "codeMeaning": "liver",
        "codeValue": "RID58",
        "codingSchemeDesignator": "RadLex",
        "codingSchemeVersion": "1.0",
        "creationDate": "2016-04-06",
        "description": "tnm liver classification",
        "name": "TNM Template",
        "uid": "2.25.327403735011742463595362115653921565170",
        "version": "0.1",
        "Component": [
          {
            "authors": "Default User",
            "explanatoryText": "location of lesion",
            "id": "2.25.213433161351441128686488933935254458568",
            "itemNumber": 0,
            "label": "Location",
            "maxCardinality": 1,
            "minCardinality": 1,
            "shouldDisplay": true,
            "AnatomicEntity": {
              "annotatorConfidence": false
            },
            "AllowedTerm": [
              {
                "codeMeaning": "liver",
                "codeValue": "RID58",
                "codingSchemeDesignator": "RadLex",
                "codingSchemeVersion": "1.0"
              },
              {
                "codeMeaning": "right lung",
                "codeValue": "RID1302",
                "codingSchemeDesignator": "RadLex",
                "codingSchemeVersion": "1.0"
              },
              {
                "codeMeaning": "left lung",
                "codeValue": "RID1326",
                "codingSchemeDesignator": "RadLex",
                "codingSchemeVersion": "1.0"
              },
              {
                "codeMeaning": "pancreas",
                "codeValue": "RID170",
                "codingSchemeDesignator": "RadLex",
                "codingSchemeVersion": "1.0"
              },
              {
                "codeMeaning": "bone organ",
                "codeValue": "RID13197",
                "codingSchemeDesignator": "RadLex",
                "codingSchemeVersion": "1.0"
              },
              {
                "codeMeaning": "lymph node",
                "codeValue": "RID13296",
                "codingSchemeDesignator": "RadLex",
                "codingSchemeVersion": "1.0"
              },
              {
                "codeMeaning": "gallbladder",
                "codeValue": "RID187",
                "codingSchemeDesignator": "RadLex",
                "codingSchemeVersion": "1.0"
              },
              {
                "codeMeaning": "duodenum",
                "codeValue": "RID134",
                "codingSchemeDesignator": "RadLex",
                "codingSchemeVersion": "1.0"
              },
              {
                "codeMeaning": "spleen",
                "codeValue": "RID86",
                "codingSchemeDesignator": "RadLex",
                "codingSchemeVersion": "1.0"
              },
              {
                "codeMeaning": "uterus",
                "codeValue": "RID302",
                "codingSchemeDesignator": "RadLex",
                "codingSchemeVersion": "1.0"
              },
              {
                "codeMeaning": "prostate",
                "codeValue": "RID343",
                "codingSchemeDesignator": "RadLex",
                "codingSchemeVersion": "1.0"
              },
              {
                "codeMeaning": "hepatic lymph node group",
                "codeValue": "RID31940",
                "codingSchemeDesignator": "RadLex",
                "codingSchemeVersion": "1.0"
              }
            ]
          },
          {
            "authors": "Default User",
            "id": "2.25.197387899405181296050370028889318374134",
            "itemNumber": 1,
            "label": "Lesion type",
            "maxCardinality": 1,
            "minCardinality": 1,
            "shouldDisplay": true,
            "ImagingObservation": {
              "annotatorConfidence": false,
              "ImagingObservationCharacteristic": [
                {
                  "annotatorConfidence": false,
                  "authors": "Default User",
                  "explanatoryText": "Choose up to 3 additional features about how the lesion affects the liver.",
                  "id": "2.25.287803499113429427595594793411795140528",
                  "itemNumber": 0,
                  "label": "Lesion effects on liver",
                  "maxCardinality": 1,
                  "minCardinality": 1,
                  "shouldDisplay": true,
                  "AllowedTerm": [
                    {
                      "codeMeaning": "thrombosis",
                      "codeValue": "RID34624",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "perforation",
                      "codeValue": "RID4944",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0",
                      "ValidTerm": [
                        {
                          "codeMeaning": "visceral peritoneum",
                          "codeValue": "RID31173",
                          "codingSchemeDesignator": "RadLex",
                          "codingSchemeVersion": "1.0"
                        }
                      ]
                    },
                    {
                      "codeMeaning": "none",
                      "codeValue": "RID28454",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "enlarged",
                      "codeValue": "RID5791",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    }
                  ]
                },
                {
                  "annotatorConfidence": false,
                  "authors": "Default User",
                  "explanatoryText": "tumor has grown into the blood vessel",
                  "id": "2.25.215963016172905330350953273317585192718",
                  "itemNumber": 1,
                  "label": "Lesion involves the blood vessel",
                  "maxCardinality": 1,
                  "minCardinality": 1,
                  "shouldDisplay": true,
                  "AllowedTerm": [
                    {
                      "codeMeaning": "none",
                      "codeValue": "RID28454",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "hepatic portal vein",
                      "codeValue": "RID34467",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "left portal vein",
                      "codeValue": "RID34470",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "right portal vein",
                      "codeValue": "RID34469",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "subdivision of left hepatic portal vein",
                      "codeValue": "RID38269",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "subdivision of right hepatic portal vein",
                      "codeValue": "RID38261",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "hepatic vein",
                      "codeValue": "RID1179",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "left hepatic vein",
                      "codeValue": "RID1180",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "right hepatic vein",
                      "codeValue": "RID1182",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "middle hepatic vein",
                      "codeValue": "RID1181",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    }
                  ]
                }
              ]
            },
            "AllowedTerm": [
              {
                "codeMeaning": "target",
                "codeValue": "S71",
                "codingSchemeDesignator": "99EPAD",
                "codingSchemeVersion": "1"
              },
              {
                "codeMeaning": "new lesion",
                "codeValue": "S73",
                "codingSchemeDesignator": "99EPAD",
                "codingSchemeVersion": "1"
              },
              {
                "codeMeaning": "resolved lesion",
                "codeValue": "S74",
                "codingSchemeDesignator": "99EPAD",
                "codingSchemeVersion": "1"
              }
            ]
          }
        ]
      }
    ]
  }
};

export var Vasari_41 = {
  "TemplateContainer": {
    "xmlns": "gme://caCORE.caCORE/3.2/edu.northwestern.radiology.AIMTemplate",
    "xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
    "authors": "ATS 1.1",
    "creationDate": "2014-04-29",
    "description": "Template container generated by ATS 1.1",
    "name": "ATS Template",
    "uid": "2.25.260612195458598981242308119790058304974",
    "version": "1",
    "xsi:schemaLocation": "gme://caCORE.caCORE/3.2/edu.northwestern.radiology.AIMTemplate AIMTemplate_v2rv13.xsd",
    "Template": [
      {
        "authors": "Justin Kirby",
        "codeMeaning": "VASARI",
        "codeValue": "99PRI_TC_0A23",
        "codingSchemeDesignator": "99PRI_TempCode",
        "codingSchemeVersion": "1.0",
        "creationDate": "2013-08-26",
        "description": "Baseline Glioma MR tumor assessment to include potential features for low grade glioma (LGG).",
        "modality": "MR",
        "name": "VASARI 4.1",
        "uid": "2.25.78144447119639723322342387224335529350",
        "version": "4.1",
        "Component": [
          {
            "authors": "Justin Kirby",
            "id": "2.25.150776022310855362644669615058239870060",
            "itemNumber": 0,
            "label": "Tumor",
            "maxCardinality": 1,
            "minCardinality": 1,
            "shouldDisplay": false,
            "ImagingObservation": {
              "annotatorConfidence": false,
              "ImagingObservationCharacteristic": [
                {
                  "annotatorConfidence": false,
                  "authors": "Justin Kirby",
                  "explanatoryText": "Quality assurance pre-check. Inventory of required image series including FLAIR/T2 and pre/post contrast T1WI.",
                  "id": "2.25.41762360117754513539982904068277651900",
                  "itemNumber": 0,
                  "label": "F0 - Image QA",
                  "maxCardinality": 4,
                  "minCardinality": 0,
                  "shouldDisplay": true,
                  "AllowedTerm": [
                    {
                      "codeMeaning": "Post biopsy (requires adjudication)",
                      "codeValue": "01",
                      "codingSchemeDesignator": "99VASARI",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "Post-op study (disqualified)",
                      "codeValue": "02",
                      "codingSchemeDesignator": "99VASARI",
                      "codingSchemeVersion": "1.0",
                      "noMoreQuestions": "true"
                    },
                    {
                      "codeMeaning": "No Contrast Injected (disqualified)",
                      "codeValue": "03",
                      "codingSchemeDesignator": "99VASARI",
                      "codingSchemeVersion": "1.0",
                      "noMoreQuestions": "true"
                    },
                    {
                      "codeMeaning": "No T2/FLAIR images (disqualified)",
                      "codeValue": "04",
                      "codingSchemeDesignator": "99VASARI",
                      "codingSchemeVersion": "1.0",
                      "noMoreQuestions": "true"
                    }
                  ]
                },
                {
                  "annotatorConfidence": false,
                  "authors": "Justin Kirby",
                  "explanatoryText": "Location of tumor geographic center (using either CET or nCET); If multiple lesions/tumor, the location of the single largest component of the tumor.  (multiple selections acceptable – choose up to two)",
                  "id": "2.25.176207087037859470836228378719456039233",
                  "itemNumber": 1,
                  "label": "F1 - Anatomic Center",
                  "maxCardinality": 2,
                  "minCardinality": 1,
                  "shouldDisplay": true,
                  "AllowedTerm": [
                    {
                      "codeMeaning": "frontal lobe",
                      "codeValue": "RID6440",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "temporal lobe",
                      "codeValue": "RID6476",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "parietal lobe",
                      "codeValue": "RID6493",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "occipital lobe",
                      "codeValue": "RID6502",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "insula",
                      "codeValue": "RID6472",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "brainstem",
                      "codeValue": "RID6677",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "cerebellum",
                      "codeValue": "RID6815",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "lentiform nucleus",
                      "codeValue": "RID6549",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "caudate nucleus",
                      "codeValue": "RID6545",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "thalamus",
                      "codeValue": "RID6578",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "corpus callosum",
                      "codeValue": "RID6915",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0",
                      "defaultAnswer": true
                    }
                  ]
                },
                {
                  "annotatorConfidence": false,
                  "authors": "Justin Kirby",
                  "explanatoryText": "Side of lesion center irrespective of whether the tumor crosses into the contralateral hemisphere.",
                  "id": "2.25.232717518690915622770043036906281482401",
                  "itemNumber": 2,
                  "label": "F2 - Side of Tumor Center",
                  "maxCardinality": 1,
                  "minCardinality": 1,
                  "shouldDisplay": true,
                  "AllowedTerm": [
                    {
                      "codeMeaning": "Right",
                      "codeValue": "G-A100",
                      "codingSchemeDesignator": "SRT",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "Center/Bilateral",
                      "codeValue": "G-A102",
                      "codingSchemeDesignator": "SRT",
                      "codingSchemeVersion": "1.0",
                      "defaultAnswer": true
                    },
                    {
                      "codeMeaning": "Left",
                      "codeValue": "G-A101",
                      "codingSchemeDesignator": "SRT",
                      "codingSchemeVersion": "1.0"
                    }
                  ]
                },
                {
                  "annotatorConfidence": false,
                  "authors": "Justin Kirby",
                  "explanatoryText": "Does any component of the CET or nCET abnormality involve eloquent brain, determined on the basis of suspicion that resection would result in a significant neurologic deficit (motor, language, vision)? Assume that the left hemisphere is dominant for language.  (multiple selections acceptable)",
                  "id": "2.25.63383747108317542557506782710595448657",
                  "itemNumber": 3,
                  "label": "F3 - Functional Brain at Risk with Resection",
                  "maxCardinality": 4,
                  "minCardinality": 1,
                  "shouldDisplay": true,
                  "AllowedTerm": [
                    {
                      "codeMeaning": "No specific functional area involved",
                      "codeValue": "05",
                      "codingSchemeDesignator": "99VASARI",
                      "codingSchemeVersion": "1.0",
                      "defaultAnswer": true
                    },
                    {
                      "codeMeaning": "Speech expressive",
                      "codeValue": "06",
                      "codingSchemeDesignator": "99VASARI",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "Speech Receptive",
                      "codeValue": "07",
                      "codingSchemeDesignator": "99VASARI",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "Motor",
                      "codeValue": "08",
                      "codingSchemeDesignator": "99VASARI",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "Vision",
                      "codeValue": "09",
                      "codingSchemeDesignator": "99VASARI",
                      "codingSchemeVersion": "1.0"
                    }
                  ]
                },
                {
                  "annotatorConfidence": false,
                  "authors": "Justin Kirby",
                  "explanatoryText": "Cardinal feature assessment. Assuming that the entire abnormality (“lesion”) may be comprised of: (1) an enhancing component (CET), (2) a non-enhancing component (nCET), (3) a necrotic component and (4) a edema component;  when assessing relative proportions of the these four features through the entire volume, provide in rank order where each would occur in relative proportion to the other cardinal features (where a response of 1 indicates that this feature comprises the majority of the tumor footprint and 4 is the minority). If the feature is not present with reasonable certainty then select None.    Non-enhancing tumor (nCET) is defined as regions of T2W intermediate hyperintensity (less than the intensity of cerebrospinal fluid or vasogenic edema, with corresponding T1W hypointensity) that are associated with mass effect and architectural distortion, including blurring of the gray-white interface. (This may be difficult to discern from vasogenic edema).  Edema should be greater in signal than nCET and somewhat lower in signal than CSF on T2W or T2W FLAIR. Pseudopods are characteristic of edema extending up to the subcortical white matter but not infiltrating gray matter/cortex.  Necrosis is defined as a region within the tumor that does not enhance, is intermediate to hyperintense on T2WI and hypointense on T1W images, and has an irregular border). ",
                  "id": "2.25.44354855842637669359741888365294257264",
                  "itemNumber": 4,
                  "label": "Cardinal Feature Assessments",
                  "maxCardinality": 1,
                  "minCardinality": 1,
                  "shouldDisplay": true,
                  "AllowedTerm": [
                    {
                      "codeMeaning": "Cardinal Features",
                      "codeValue": "16",
                      "codingSchemeDesignator": "caDSR",
                      "codingSchemeVersion": "1.0",
                      "defaultAnswer": true,
                      "CharacteristicQuantification": [
                        {
                          "annotatorConfidence": false,
                          "characteristicQuantificationIndex": 0,
                          "name": "F6 - Relative Proportion of nCET",
                          "Scale": {
                            "scaleType": "Ordinal",
                            "ScaleLevel": [
                              {
                                "value": "1"
                              },
                              {
                                "value": "2"
                              },
                              {
                                "value": "3"
                              },
                              {
                                "value": "4"
                              },
                              {
                                "defaultAnswer": true,
                                "value": "None"
                              }
                            ]
                          }
                        },
                        {
                          "annotatorConfidence": false,
                          "characteristicQuantificationIndex": 1,
                          "name": "F14 - Relative Proportion of Edema",
                          "Scale": {
                            "scaleType": "Ordinal",
                            "ScaleLevel": [
                              {
                                "value": "1"
                              },
                              {
                                "value": "2"
                              },
                              {
                                "value": "3"
                              },
                              {
                                "value": "4"
                              },
                              {
                                "defaultAnswer": true,
                                "value": "None"
                              }
                            ]
                          }
                        },
                        {
                          "annotatorConfidence": false,
                          "characteristicQuantificationIndex": 2,
                          "name": "F5 - Relative Proportion of Enhancing Tissue",
                          "Scale": {
                            "scaleType": "Ordinal",
                            "ScaleLevel": [
                              {
                                "value": "1"
                              },
                              {
                                "value": "2"
                              },
                              {
                                "value": "3"
                              },
                              {
                                "value": "4"
                              },
                              {
                                "defaultAnswer": true,
                                "value": "None"
                              }
                            ]
                          }
                        },
                        {
                          "annotatorConfidence": false,
                          "characteristicQuantificationIndex": 3,
                          "name": "F7 - Relative Proportion of Necrotic Tissue ",
                          "Scale": {
                            "scaleType": "Ordinal",
                            "ScaleLevel": [
                              {
                                "value": "1"
                              },
                              {
                                "value": "2"
                              },
                              {
                                "value": "3"
                              },
                              {
                                "value": "4"
                              },
                              {
                                "defaultAnswer": true,
                                "value": "None"
                              }
                            ]
                          }
                        }
                      ]
                    }
                  ]
                },
                {
                  "annotatorConfidence": false,
                  "authors": "Justin Kirby",
                  "explanatoryText": "nCET tumor crosses midline is defined by any nCET tumor that extends into the contralateral hemisphere through white matter commissures usually expected at the midline (exclusive of herniated ipsilateral tissue).",
                  "id": "2.25.122361456361381677712105130790092686431",
                  "itemNumber": 5,
                  "label": "F22 - nCET tumor Crosses Midline",
                  "maxCardinality": 1,
                  "minCardinality": 1,
                  "shouldDisplay": true,
                  "AllowedTerm": [
                    {
                      "codeMeaning": "No nCET",
                      "codeValue": "10",
                      "codingSchemeDesignator": "99VASARI",
                      "codingSchemeVersion": "1.0",
                      "defaultAnswer": true,
                      "nextId": "2.25.183360277954448684227779109363922125763"
                    },
                    {
                      "codeMeaning": "no",
                      "codeValue": "RID28475",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "yes",
                      "codeValue": "RID28474",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    }
                  ]
                },
                {
                  "annotatorConfidence": false,
                  "authors": "Justin Kirby",
                  "explanatoryText": "Using the T2WI preferably (or T2 FLAIR if no T2WI are available) assess the definition of the boundary between the nCET and normal parenchyma or CET.  Select no nCET if there is no identifiable nCET in the tumor matrix.  Do not include vasogenic edema in your assessment.  Evaluate the proportion of the tumor boundary that is well-defined or poorly-defined. If most of the outside non-enhancing (nCET) margin of the tumor is well-defined (i.e. sharply marginated) and smooth (geographic), versus if the margin is poorly-defined (fluffy or indistinct).",
                  "id": "2.25.106559230524219651563830084341678542715",
                  "itemNumber": 6,
                  "label": "F13 - Definition of the non-enhancing margin (e.g. Grade III)",
                  "maxCardinality": 1,
                  "minCardinality": 1,
                  "shouldDisplay": true,
                  "AllowedTerm": [
                    {
                      "codeMeaning": "Completely well-defined (100%)",
                      "codeValue": "11",
                      "codingSchemeDesignator": "99VASARI",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "Mostly well-defined (>two thirds)",
                      "codeValue": "12",
                      "codingSchemeDesignator": "99VASARI",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "Mixed (@ 50-50)",
                      "codeValue": "13",
                      "codingSchemeDesignator": "99VASARI",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "Mostly poorly-defined (> two thirds)",
                      "codeValue": "14",
                      "codingSchemeDesignator": "99VASARI",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "Completely ill-defined (100%)",
                      "codeValue": "15",
                      "codingSchemeDesignator": "99VASARI",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "No nCET",
                      "codeValue": "10",
                      "codingSchemeDesignator": "99VASARI",
                      "codingSchemeVersion": "1.0",
                      "defaultAnswer": true
                    }
                  ]
                },
                {
                  "annotatorConfidence": false,
                  "authors": "Justin Kirby",
                  "explanatoryText": "Qualitative degree of contrast enhancement is defined as havingall or portions of the tumor that demonstrate significantly higher signal on the postcontrast T1W images compared to precontrast T1W images.  Mild = when barely discernible but unequivocal degree of enhancement is present relative to pre-contrast images. Marked = obvious tissue enhancement.",
                  "id": "2.25.183360277954448684227779109363922125763",
                  "itemNumber": 7,
                  "label": "F4 - Enhancement Quality",
                  "maxCardinality": 1,
                  "minCardinality": 1,
                  "shouldDisplay": true,
                  "AllowedTerm": [
                    {
                      "codeMeaning": "No Contrast Enhancement",
                      "codeValue": "16",
                      "codingSchemeDesignator": "99VASARI",
                      "codingSchemeVersion": "1.0",
                      "defaultAnswer": true,
                      "nextId": "2.25.26682643709598967654598600492845350904"
                    },
                    {
                      "codeMeaning": "Mild",
                      "codeValue": "RID5671",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "Marked",
                      "codeValue": "RID34299",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    }
                  ]
                },
                {
                  "annotatorConfidence": false,
                  "authors": "Justin Kirby",
                  "explanatoryText": "If most of the enhancing rim is thin, regular, and measures < 3mm in thickness and has homogenous enhancement the grade is minimal. If most of the rim demonstrates nodular and/or thick enhancement measuring 3mm or more, the grade is thick/nodular. If there is only solid enhancement and no rim, the grade is solid. ",
                  "id": "2.25.107001996721789954075761163370350439566",
                  "itemNumber": 8,
                  "label": "F11 - Thickness of Enhancing Margin",
                  "maxCardinality": 1,
                  "minCardinality": 1,
                  "shouldDisplay": true,
                  "AllowedTerm": [
                    {
                      "codeMeaning": "No Contrast Enhancement",
                      "codeValue": "16",
                      "codingSchemeDesignator": "99VASARI",
                      "codingSchemeVersion": "1.0",
                      "defaultAnswer": true
                    },
                    {
                      "codeMeaning": "Minimal",
                      "codeValue": "RID5670",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "Thick/nodular (=> 3mm)",
                      "codeValue": "RID28672",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "Solid",
                      "codeValue": "RID5741",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    }
                  ]
                },
                {
                  "annotatorConfidence": false,
                  "authors": "Justin Kirby",
                  "explanatoryText": "Assess if most of the outside margin of the enhancement is well defined (i.e. sharply marginated) or poorly-defined (fluffy or indistinct). Are you able to easily trace the margin of enhancement? Assess the proportion of the enhancing rim that is well-defined versus poorly defined and respond accordingly. If both thicker slices and thinner slices of post-contrast images are available, use the thinner slices.",
                  "id": "2.25.96907076645142593218277802103517844235",
                  "itemNumber": 9,
                  "label": "F12 - Definition of the Enhancing Margin",
                  "maxCardinality": 1,
                  "minCardinality": 1,
                  "shouldDisplay": true,
                  "AllowedTerm": [
                    {
                      "codeMeaning": "No Contrast Enhancement",
                      "codeValue": "16",
                      "codingSchemeDesignator": "99VASARI",
                      "codingSchemeVersion": "1.0",
                      "defaultAnswer": true
                    },
                    {
                      "codeMeaning": "Completely well-defined (100%)",
                      "codeValue": "17",
                      "codingSchemeDesignator": "99VASARI",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "Mostly well-defined (> two thirds)",
                      "codeValue": "18",
                      "codingSchemeDesignator": "99VASARI",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "Mixed (@ 50-50)",
                      "codeValue": "19",
                      "codingSchemeDesignator": "99VASARI",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "Mostly poorly-defined (> two thirds)",
                      "codeValue": "20",
                      "codingSchemeDesignator": "99VASARI",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "Completely ill-defined (100%)",
                      "codeValue": "21",
                      "codingSchemeDesignator": "99VASARI",
                      "codingSchemeVersion": "1.0"
                    }
                  ]
                },
                {
                  "annotatorConfidence": false,
                  "authors": "Justin Kirby",
                  "explanatoryText": "Enhancing tissue crosses midline is defined by any CET that extends into the contralateral hemisphere through white matter commissures usually expected at the midline (exclusive of herniated ipsilateral tissue).",
                  "id": "2.25.200903160931839215990776770240425301421",
                  "itemNumber": 10,
                  "label": "F23 - Enhancing tumor Crosses Midline",
                  "maxCardinality": 1,
                  "minCardinality": 1,
                  "shouldDisplay": true,
                  "AllowedTerm": [
                    {
                      "codeMeaning": "No Contrast Enhancement",
                      "codeValue": "16",
                      "codingSchemeDesignator": "99VASARI",
                      "codingSchemeVersion": "1.0",
                      "defaultAnswer": true
                    },
                    {
                      "codeMeaning": "no",
                      "codeValue": "RID28475",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "yes",
                      "codeValue": "RID28474",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    }
                  ]
                },
                {
                  "annotatorConfidence": false,
                  "authors": "Justin Kirby",
                  "explanatoryText": "When assessing the complexity of the internal architecture of the tumor on FLAIR or T2WI overall grade the uniformity of the tumor matrix (exclusive of what appears to clearly be edema).  Select completely homogeneous when the tumor matrix is completely uniform in consistency; mostly homogeneous when more than 2/3 of the tumor matrix is uniform; mixed when about half of the tumor is homogeneous; mostly heterogeneous when more than half of the tumor volume is non-uniform; completely heterogeneous when all of the tumor matrix is non-uniform.  FLAIR should be used primarily.  T2WI can be used when FLAIR images are not included.",
                  "id": "2.25.26682643709598967654598600492845350904",
                  "itemNumber": 11,
                  "label": "F31 - Heterogeneity",
                  "maxCardinality": 1,
                  "minCardinality": 1,
                  "shouldDisplay": true,
                  "AllowedTerm": [
                    {
                      "codeMeaning": "Completely homogeneous (100%)",
                      "codeValue": "22",
                      "codingSchemeDesignator": "99VASARI",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "Mostly homogeneous (> two thirds)",
                      "codeValue": "23",
                      "codingSchemeDesignator": "99VASARI",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "Mixed (@ 50-50)",
                      "codeValue": "24",
                      "codingSchemeDesignator": "99VASARI",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "Mostly heterogeneous (> two thirds)",
                      "codeValue": "25",
                      "codingSchemeDesignator": "99VASARI",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "Completely heterogeneous (100%)",
                      "codeValue": "26",
                      "codingSchemeDesignator": "99VASARI",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "Indeterminate",
                      "codeValue": "27",
                      "codingSchemeDesignator": "99VASARI",
                      "codingSchemeVersion": "1.0",
                      "defaultAnswer": true
                    }
                  ]
                },
                {
                  "annotatorConfidence": false,
                  "authors": "Justin Kirby",
                  "explanatoryText": "Shape is defined as the overall contour of the abnormal tissue that you would characterize as a tumor boundary. Which descriptor best defines the shape of the entire mass: round, ovoid, lobulated or irregular.  Consider the overall boundaries of the CET primarily.  If there is no CET, then consider the shape of the nCET exclusive of edema.  If neither seem to apply, select none apply.",
                  "id": "2.25.89697414760266572521897673992093043420",
                  "itemNumber": 12,
                  "label": "F32 - Shape",
                  "maxCardinality": 1,
                  "minCardinality": 1,
                  "shouldDisplay": true,
                  "AllowedTerm": [
                    {
                      "codeMeaning": "Round/Circular/Spherical",
                      "codeValue": "RID29173",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "Ovoid",
                      "codeValue": "RID29223",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "Lobulated",
                      "codeValue": "RID29174",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "Irregular",
                      "codeValue": "RID29215",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "None Apply",
                      "codeValue": "RID28454",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0",
                      "defaultAnswer": true
                    }
                  ]
                },
                {
                  "annotatorConfidence": false,
                  "authors": "Justin Kirby",
                  "explanatoryText": "Cysts are well defined, rounded, often eccentric regions of very bright T2W signal and low T1W signal essentially matching CSF signal intensity, with very thin, regular, smooth, nonenhancing or regularly enhancing walls, possibly with thin, regular, internal septations.  Differentiate from a necrotic enhancing tumor cavity with thick irregular walls and complex internal fluid.",
                  "id": "2.25.36798094312158401784401963599403502954",
                  "itemNumber": 13,
                  "label": "F8 - Cyst(s)",
                  "maxCardinality": 1,
                  "minCardinality": 1,
                  "shouldDisplay": true,
                  "AllowedTerm": [
                    {
                      "codeMeaning": "absent",
                      "codeValue": "RID28473",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0",
                      "defaultAnswer": true
                    },
                    {
                      "codeMeaning": "present",
                      "codeValue": "RID28472",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    }
                  ]
                },
                {
                  "annotatorConfidence": false,
                  "authors": "Justin Kirby",
                  "explanatoryText": "A satellite lesion is defined by one or more areas of nCET or CET within the region of signal abnormality surrounding the dominant lesion but not contiguous in any part with the major tumor mass.  This is in distinction from a multifocal lesion.",
                  "id": "2.25.250254746072336007090635407167613459133",
                  "itemNumber": 14,
                  "label": "F24 - Satellites",
                  "maxCardinality": 1,
                  "minCardinality": 1,
                  "shouldDisplay": true,
                  "AllowedTerm": [
                    {
                      "codeMeaning": "absent",
                      "codeValue": "RID28473",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0",
                      "defaultAnswer": true
                    },
                    {
                      "codeMeaning": "present",
                      "codeValue": "RID28472",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    }
                  ]
                },
                {
                  "annotatorConfidence": false,
                  "authors": "Justin Kirby",
                  "explanatoryText": "Multifocal is defined as having at least one region of abnormal tissue, either enhancing or nonenhancing, which is not contiguous with the dominant lesion and is outside the region of signal abnormality (edema) surrounding the dominant mass. This can be defined as those resulting from dissemination or growth by an established route, spread via commissural or other pathways, or via CSF channels or local metastases, whereas Multicentric are widely separated lesions in different lobes or different hemispheres that cannot be attributed to one of the previously mentioned pathways. Gliomatosis refers to generalized neoplastic transformation of the white matter of most of a hemisphere.",
                  "id": "2.25.122848646282931218782733302616118513507",
                  "itemNumber": 15,
                  "label": "F9 - Multifocal or Multicentric",
                  "maxCardinality": 1,
                  "minCardinality": 1,
                  "shouldDisplay": true,
                  "AllowedTerm": [
                    {
                      "codeMeaning": "Focal",
                      "codeValue": "RID5702",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "Multifocal or Multicentric",
                      "codeValue": "RID5703",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0",
                      "defaultAnswer": true
                    },
                    {
                      "codeMeaning": "Gliomatosis Cerebri",
                      "codeValue": "28",
                      "codingSchemeDesignator": "99VASARI",
                      "codingSchemeVersion": "1.0"
                    }
                  ]
                },
                {
                  "annotatorConfidence": false,
                  "authors": "Justin Kirby",
                  "explanatoryText": "T1/FLAIR ratio is a gross comparison in the overall lesion size between pre-contrast T1 and FLAIR (in the same plane).  Select T1~FLAIR when pre-contrast T1 abnormality (exclusive of signal intensity) approximates size of FLAIR abnormality; Select T1<FLAIR when the size of T1 abnormality is moderately smaller than the surrounding FLAIR envelope;  or select T1<<FLAIR when the size of the pre-contrast T1 abnormality is much smaller than size of FLAIR abnormality. (If no FLAIR images were provided select No FLAIR images).",
                  "id": "2.25.192557928867048244599609691480357185195",
                  "itemNumber": 16,
                  "label": "F10 - T1/FLAIR Ratio",
                  "maxCardinality": 1,
                  "minCardinality": 1,
                  "shouldDisplay": true,
                  "AllowedTerm": [
                    {
                      "codeMeaning": "T1 ~ FLAIR",
                      "codeValue": "29",
                      "codingSchemeDesignator": "99VASARI",
                      "codingSchemeVersion": "1.0",
                      "defaultAnswer": true
                    },
                    {
                      "codeMeaning": "T1 < FLAIR",
                      "codeValue": "30",
                      "codingSchemeDesignator": "99VASARI",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "T1 << FLAIR",
                      "codeValue": "31",
                      "codingSchemeDesignator": "99VASARI",
                      "codingSchemeVersion": "1.0"
                    }
                  ]
                },
                {
                  "annotatorConfidence": false,
                  "authors": "Justin Kirby",
                  "explanatoryText": "Intrinsic hemorrhage anywhere in the tumor matrix. Any intrinsic foci of low signal on T2WI (or gradient echo) or high signal on T1WI.  Proportion is not a discriminating factor. Select cannot determine if findings are indistinct or may actually represent mineral instead of hemorrhage.",
                  "id": "2.25.244477578050994548304476816368493665785",
                  "itemNumber": 17,
                  "label": "F16 - Hemorrhage",
                  "maxCardinality": 1,
                  "minCardinality": 1,
                  "shouldDisplay": true,
                  "AllowedTerm": [
                    {
                      "codeMeaning": "no",
                      "codeValue": "RID28475",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "yes",
                      "codeValue": "RID28474",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "Indeterminate",
                      "codeValue": "27",
                      "codingSchemeDesignator": "99VASARI",
                      "codingSchemeVersion": "1.0",
                      "defaultAnswer": true
                    }
                  ]
                },
                {
                  "annotatorConfidence": false,
                  "authors": "Justin Kirby",
                  "explanatoryText": "Proportion of CET and nCET demonstrating ADC below or same as the ADC of normal-appearing brain. The remainder of the abnormality is assumed to demonstrate increased ADC relative to normal brain. (Based on ADC map only). Select equivocal when findings are equivocal.   (Select no ADC images if ADC images were not provided)",
                  "id": "2.25.195794272294395372341575500719340322354",
                  "itemNumber": 18,
                  "label": "F17 - Diffusion",
                  "maxCardinality": 1,
                  "minCardinality": 1,
                  "shouldDisplay": true,
                  "AllowedTerm": [
                    {
                      "codeMeaning": "No ADC images",
                      "codeValue": "C48660",
                      "codingSchemeDesignator": "NCIt",
                      "codingSchemeVersion": "1.0",
                      "defaultAnswer": true
                    },
                    {
                      "codeMeaning": "> 2/3",
                      "codeValue": "32",
                      "codingSchemeDesignator": "99VASARI",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "1/3 - 2/3",
                      "codeValue": "33",
                      "codingSchemeDesignator": "99VASARI",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "< 1/3",
                      "codeValue": "34",
                      "codingSchemeDesignator": "99VASARI",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "Minimal (<5%)",
                      "codeValue": "35",
                      "codingSchemeDesignator": "99VASARI",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "None",
                      "codeValue": "RID28454",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "Equivocal",
                      "codeValue": "36",
                      "codingSchemeDesignator": "99VASARI",
                      "codingSchemeVersion": "1.0"
                    }
                  ]
                },
                {
                  "annotatorConfidence": false,
                  "authors": "Justin Kirby",
                  "explanatoryText": "Leptomeningeal reaction is defined by enhancement of the overlying pia/arachnoid in continuity with enhancing or non-enhancing tumor or sulcal hyperintensity on T2 FLAIR. This should be selected to capture reactive leptomeninges and/or invaded leptomeninges.",
                  "id": "2.25.108391085698639462771043090863419726717",
                  "itemNumber": 19,
                  "label": "F18 - Leptomeningeal reaction",
                  "maxCardinality": 1,
                  "minCardinality": 1,
                  "shouldDisplay": true,
                  "AllowedTerm": [
                    {
                      "codeMeaning": "absent",
                      "codeValue": "RID28473",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0",
                      "defaultAnswer": true
                    },
                    {
                      "codeMeaning": "present",
                      "codeValue": "RID28472",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    }
                  ]
                },
                {
                  "annotatorConfidence": false,
                  "authors": "Justin Kirby",
                  "explanatoryText": "Ependymal contact is defined by tumor abutting any adjacent ependymal surface in continuity with enhancing or non-enhancing tumor matrix.  If there is CET in contact with the ependyma, select enhancing. If there is nCET in contact with the ependyma, select non-enhancing.  If nCET and CET are in contact with the ependymal, select both. Enhancement of the ependyma is not necessary if abutted by nCET; if abutted by CET, ependymal enhancement is necessary.",
                  "id": "2.25.139645378053990855460137174034728343184",
                  "itemNumber": 20,
                  "label": "F19 - Ependymal contact",
                  "maxCardinality": 1,
                  "minCardinality": 1,
                  "shouldDisplay": true,
                  "AllowedTerm": [
                    {
                      "codeMeaning": "absent",
                      "codeValue": "RID28473",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0",
                      "defaultAnswer": true
                    },
                    {
                      "codeMeaning": "enhancing",
                      "codeValue": "RID6055",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "nonenhancing",
                      "codeValue": "RID6056",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "Both",
                      "codeValue": "37",
                      "codingSchemeDesignator": "99VASARI",
                      "codingSchemeVersion": "1.0"
                    }
                  ]
                },
                {
                  "annotatorConfidence": false,
                  "authors": "Justin Kirby",
                  "explanatoryText": "Using T2 FLAIR preferably (or T2WI if T2 FLAIR are not available). Cortical involvement is defined by non-enhancing or enhancing tumor that extends into the cortical mantle, or if the cortex is no longer distinguishable relative to tumor.",
                  "id": "2.25.167777512011251856249859492928947268475",
                  "itemNumber": 21,
                  "label": "F20 - Cortical involvement",
                  "maxCardinality": 1,
                  "minCardinality": 1,
                  "shouldDisplay": true,
                  "AllowedTerm": [
                    {
                      "codeMeaning": "absent",
                      "codeValue": "RID28473",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0",
                      "defaultAnswer": true
                    },
                    {
                      "codeMeaning": "present",
                      "codeValue": "RID28472",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    }
                  ]
                },
                {
                  "annotatorConfidence": false,
                  "authors": "Justin Kirby",
                  "explanatoryText": "Deep white matter invasion is defined by enhancing or nCET tumor extending into the internal capsule, corpus callosum or brainstem. (multiple choices allowed)",
                  "id": "2.25.158474128294561234684698963176949745267",
                  "itemNumber": 22,
                  "label": "F21 - Deep WM Invasion",
                  "maxCardinality": 3,
                  "minCardinality": 1,
                  "shouldDisplay": true,
                  "AllowedTerm": [
                    {
                      "codeMeaning": "none",
                      "codeValue": "RID28454",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0",
                      "defaultAnswer": true
                    },
                    {
                      "codeMeaning": "corpus callosum",
                      "codeValue": "RID6915",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "internal capsule",
                      "codeValue": "RID6941",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    },
                    {
                      "codeMeaning": "brainstem",
                      "codeValue": "RID6677",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    }
                  ]
                },
                {
                  "annotatorConfidence": false,
                  "authors": "Justin Kirby",
                  "explanatoryText": "Calvarial remodeling is defined as visible erosion/remodeling of inner table of skull (possibly a secondary sign of slow growth).",
                  "id": "2.25.232585054265451406016857784730316000640",
                  "itemNumber": 23,
                  "label": "F25 - Calvarial remodeling",
                  "maxCardinality": 1,
                  "minCardinality": 1,
                  "shouldDisplay": true,
                  "AllowedTerm": [
                    {
                      "codeMeaning": "absent",
                      "codeValue": "RID28473",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0",
                      "defaultAnswer": true
                    },
                    {
                      "codeMeaning": "present",
                      "codeValue": "RID28472",
                      "codingSchemeDesignator": "RadLex",
                      "codingSchemeVersion": "1.0"
                    }
                  ]
                }
              ]
            },
            "AllowedTerm": [
              {
                "codeMeaning": "glioma",
                "codeValue": "RID4026",
                "codingSchemeDesignator": "RadLex",
                "codingSchemeVersion": "1.0",
                "defaultAnswer": true
              }
            ]
          },
          {
            "authors": "Justin Kirby",
            "id": "2.25.314331443843585035410609477037874999702",
            "itemNumber": 1,
            "label": "Lesion Size: Longest Diameter - Lesion size is defined as the largest perpendicular (x-y) cross- sectional diameter of entire T2 or FLAIR signal abnormality (longest dimension x perpendicular dimension) measured the single axial image that reveals the largest cross-sectional area of the lesion. Measurement should incorporate all cardinal imaging features of CET, nCET, necrosis and edema. (Measurement lines may cross cystic or necrotic components of the signal abnormality but should not cross through the ventricles).",
            "maxCardinality": 1,
            "minCardinality": 1,
            "shouldDisplay": true,
            "GeometricShape": "MultiPoint"
          },
          {
            "authors": "Default User",
            "id": "2.25.172261015044643220638473649057008890583",
            "itemNumber": 2,
            "label": "Lesion Size: Longest Perpendicular - Lesion size is defined as the largest perpendicular (x-y) cross- sectional diameter of entire T2 or FLAIR signal abnormality (longest dimension x perpendicular dimension) measured the single axial image that reveals the largest cross-sectional area of the lesion. Measurement should incorporate all cardinal imaging features of CET, nCET, necrosis and edema. (Measurement lines may cross cystic or necrotic components of the signal abnormality but should not cross through the ventricles).",
            "maxCardinality": 1,
            "minCardinality": 1,
            "shouldDisplay": false,
            "GeometricShape": "MultiPoint"
          }
        ]
      }
    ]
  }
};

 export var templateArray = [
   {value : Recist_v2 },
   {value : Recist},
   {value : AcLivTempBealieuLiver_Template_ePad_CFB_rev18},
   {value : coordinationTest},
   {value : Desmoid_Tumor_Template_Rev1_1},
   {value : lungnodulefeaturesv2},
   {value : medulloblastoma},
   {value : segmentation_templatev2_1},
   {value : test3asdf},
   {value : testing_quantifiers},
   {value : VASARILGG42ePAD},
   {value : brain_hemorrhage2},
   {value : ICRradiogenomics},
   {value : kircenhancement},
   {value : LungNoduleTemplate},
   {value : pheumothrax},
   {value : testing_quantifiers_minnie},
   {value : HGG_v2},
   {value : HIRADS},
   {value : LIDC_CR_DR},
   {value : LiverSegmentationsample},
   {value : mammography},
   {value : TNMLiverTemplates},
   {value : Vasari_41}

];

/*
   { key: "Lung Template", value: TempLungNoduleV2 },
   { key: "liver15", value: TempBeaulieuBoneTemplaterev18 },
   { key: "Test 3-1", value: TempAsdf },
   { key: "Coordination Template", value: TempCoordinationTest },
   { key: "Test 3", value: TempTest3 },
   { key: "ROI Only", value: roiOnly },
   { key : "Any_Shape", value :anyShapeTemplate},
*/

//new AimEditor(div as parameter)

//example form validation handler should be passed by aimeditor instance creator 

function formCheckCall(myvar){

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