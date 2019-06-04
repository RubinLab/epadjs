

// uncomment 2 imports below for react

import $  from "jquery/dist/jquery.js"
import "semantic-ui/dist/semantic.min.css"
import "semantic-ui/dist/semantic.js"


//export next variable for react
export  var AimEditor = function (userWindow, varformCheckHandler){
  		
	 var self = this;
	 	this.formCheckHandler = varformCheckHandler;
 	 	this.userWindow = userWindow;
 	 	this.arrayTemplates = [];
 	 	this.arrayTemplatesJsonObjects =[];
 	 	this.json ="";
 	 	this.jsonTemplateCopy="";
		this.mainWindowDiv="";
		this.primitiveJson="";
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

		var selectid = 0;
		var mathOperators = new Map();
		mathOperators.set("Equal","=");
		mathOperators.set("NotEqual","!=");
		mathOperators.set("LessThan","<");
		mathOperators.set("GreaterThan",">");
		mathOperators.set("LessThanEqual","<=");
		mathOperators.set("GreaterThanEqual",">=");

 	function constructor (){
 		if (self.arrayTemplates === "undefined")
 			self.arrayTemplates = [];

 	}

 	this.loadTemplates = function(templateList){
 		
 		self.arrayTemplatesJsonObjects = templateList;
 		if (self.arrayTemplatesJsonObjects.length>0){
	 		for (var i = 0; i<self.arrayTemplatesJsonObjects.length; i++){
	 			var object = self.arrayTemplatesJsonObjects[i];
	 			object.codeValue = self.arrayTemplatesJsonObjects[0].value.Template["codeValue"];
	 			object.arrayIndex = i;
	 			self.mapTemplateCodeValueByIndex.set(object.codeValue,i);
	 			
	 		}
 		}
 		
 	}

 	this.createTemplatesFromListToJson = function(){
 		/*

 		templateSelect.onchange = function (){

		
		        $.getJSON("jsons/"+this.value, function(json) {
		        	this.arrayTemplatesJsonObjects.push=json;

		    
		        });
           
    	};
		*/
 	}

 	this.createViewerWindow = function(){


		
		//var x = document.createElement("INPUT");
		//x.setAttribute("type", "file");
		//x.addEventListener('change', self.readx, false);
		

 		self.mainWindowDiv = document.createElement('div');
 		self.mainWindowDiv.style = " color: inherit;";
 		self.mainButtonsDiv = document.createElement('div');
 		//this.addButtons(this.mainWindowDiv);
		//this.mainWindowDiv.appendChild(x);
 		self.templateListDiv = document.createElement('div');
 		self.templateListDiv.id = "tlist";
 		 
 		self.shapeDiv = document.createElement('div');
 		self.shapeDiv.id = "shape";
 		 
 		self.accordion1Div = document.createElement('div');
 		self.accordion1Div.id = "accordion1";
 		self.accordion1Div.class = "ui accordion";
 		self.accordion1Div.style = " width:400px; color:gray;";
 		 
 		var accordion2Div = document.createElement('div');
 		accordion2Div.id = "accordion2";
 		accordion2Div.class = "ui accordion";
 		accordion2Div.style = " width:400px; color:inherit;";

 		self.mainWindowDiv.appendChild(self.templateListDiv);
 		self.mainWindowDiv.appendChild(self.shapeDiv);
 		self.mainWindowDiv.appendChild(self.accordion1Div);
 		//self.mainWindowDiv.appendChild(accordion2Div);
 		self.mainWindowDiv.appendChild(self.mainButtonsDiv);

 		//creating template select drop down
	    self.arrayTemplates = ["Select ","short.json","multiImage.json","short1.json","test3.json","ATS_Template.json","BeaulieuBoneTemplate_rev13.json","coordinationTest.json","Liver_Template_ePad_CFB_rev15.json","LT.json","asdf.json","BeaulieuBoneTemplate_rev18.json","LungNoduleFeaturesV2LT1.json","meduloblastoma.json"];
	    var templateDiv = document.createElement('div');
	    self.templateSelect = document.createElement('select');
	    templateDiv.id='Temp';
	    self.templateSelect.id="S1";

	    self.templateSelect.className = 'ui dropdown';
	    templateDiv.appendChild(self.templateSelect);
	    var i=0;
	    var templateOption = document.createElement("option");
	    templateOption.value = "-1";
		templateOption.text = "Select";
		 self.templateSelect.appendChild(templateOption);

	    for ( i = 0; i < self.arrayTemplatesJsonObjects.length; i++) {
			
			  var templateOption = document.createElement("option");
			  templateOption.value = i;
			  templateOption.text = self.arrayTemplatesJsonObjects[i].key;
			  //templateOption.innerHTML = this.arrayTemplatesJsonObjects[i].key;
			  self.templateSelect.appendChild(templateOption);
		  
	    }
	    
	   // var lblTxt = document.createTextNode("Select template:");


	    self.templateListDiv.appendChild(self.templateSelect);
 		self.userWindow.appendChild(self.mainWindowDiv);

 		
		self.templateSelect.onchange = function (){
					
					self.aimComment = "";
					self.aimName = "";
					self.aimType = "";
		       		let templateSelectedIndex = this.value;
		       		//if (templateSelectedIndex == -1){
		       			self.accordion1Div.innerHTML='';
		              	self.shapeDiv.innerHTML='';
		              	self.mainButtonsDiv.innerHTML = "";
		       		//}else{
			        	self.jsonTemplateCopy = self.arrayTemplatesJsonObjects[this.value].value;
		              	self.accordion1Div.innerHTML='';
		              	self.shapeDiv.innerHTML='';
		            	
			            self.mapCardinalitiesToCheckId = new Map();
			            self.mapStatusAllowedTermBlocks = new Map();
			            self.extractTemplate(self.jsonTemplateCopy);
		       		//}
           
    	};
    	$('select[class^="ui dropdown"]').dropdown();


 	}


 		this.extractTemplate = function(json){
			var a =0;

					  
					  var subObject = null;
					  var arrayLength = -1;
					  if (Array.isArray(json.Template.Component))
						 arrayLength = json.Template.Component.length;
					  else
						arrayLength = 1;
					  
					  var component = null;
					  					//adding comment textarea for the template 
					  					var commentDiv = document.createElement("div");
					  					var labelDiv = document.createElement("div");
					  					var annotationNameDiv = document.createElement("div");
					  					var annotationNameLabelDiv = document.createElement("div");
					  					
					  					var labelAnnotationName=document.createElement('label');

					  					labelAnnotationName.textContent = "Name";
					  					var labelAnnotationNameInput = document.createElement("INPUT");
					  					labelAnnotationNameInput.onkeyup = function(){
						
										
											self.aimName = this.value;
										}
										labelAnnotationNameInput.setAttribute("type", "text");
										labelAnnotationNameInput.id = 'annotationName';
					  					
					  					annotationNameDiv.appendChild(labelAnnotationName);
					  					annotationNameDiv.appendChild(labelAnnotationNameInput);
					  					annotationNameLabelDiv.appendChild(labelAnnotationName);
					  					annotationNameDiv.className = 'comment ui input';
										
										var label=document.createElement('label');
										annotationNameLabelDiv.className = 'comment';
										label.textContent = "comment";
										labelDiv.className = 'comment';
										commentDiv.className = 'comment';

										var textareaDomObject = document.createElement("textarea");
										labelDiv.appendChild(label);
										textareaDomObject.id='comment';
										commentDiv.appendChild(textareaDomObject);
										textareaDomObject.onkeyup = function(){
						
										
											self.aimComment = this.value;
										}


										
										
										document.getElementById("accordion1").appendChild(annotationNameLabelDiv); 
										document.getElementById("accordion1").appendChild(annotationNameDiv); 
										 document.getElementById("accordion1").appendChild(labelDiv);  
										 document.getElementById("accordion1").appendChild(commentDiv);  
										//end adding comment textarea for the template 
										var a = 0;
						for (var i = 0 ; i<arrayLength;i++ ){
							a++;
						  if (arrayLength>1)
							  component = json.Template.Component[i];
						  else
							  component = json.Template.Component;

									 var cmplabel =component.label;
									 var ComponentDivId = (cmplabel).replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>/ /\{\}\[\]\\\/]/gi, '');
									
									 var componentDivLabel = document.createTextNode(cmplabel);
									 var componentDiv = document.createElement('div');
									 componentDiv.className = 'ui accordion mylbl';
									 componentDiv.style = "color:gray;";
									 componentDiv.disabled = 'true';

									 
									  var headerDiv = document.createElement('div');
									  headerDiv.className = 'title active';
									  headerDiv.style = "color:gray;";
									  headerDiv.id = a;

									  
									  var headerArrowIcon = document.createElement('i');
									  headerArrowIcon.className = 'dropdown icon';
									  
									  var headerCheckIcon = document.createElement('i');
									  headerCheckIcon.className="red check circle outline icon";
									  //  headerCheckIcon.id = (component.id).replace(/[.*+?^${}()|[\]\\]/g, '');
									  headerCheckIcon.id=component.id;
									   document.getElementById("accordion1").appendChild(componentDiv);  

									  var incontentDiv = document.createElement('div');
									  incontentDiv.className = 'content active';
									  incontentDiv.id=ComponentDivId;
									 
										componentDiv.appendChild(headerDiv);
										//icon cav
										headerDiv.appendChild(headerCheckIcon);
										headerDiv.appendChild(headerArrowIcon);
										headerDiv.appendChild(componentDivLabel);
										self.checkIfCommentRequired(component,componentDiv);
										componentDiv.appendChild(incontentDiv);


						 //end -----------------------------------------------------
						 
						  	if (component.hasOwnProperty("GeometricShape")){
							self.GeometricShape(component,component,incontentDiv,this.maptag,'component');
							}
							var components = [];
							
							let compObj = {
								type: 'component',
								id: component.id,
								label: component.label,
								itemNumber:component.itemNumber,
								subTag:[]
								};
							
							components.push({
											component: compObj
							});

							var keyorder = Object.keys(component);
							var fix =-1;
							for (var z = 0 ; z< keyorder.length ; z++){
								if (keyorder[z] == "AllowedTerm"){
									fix = z;
									break;
								}
							}

							keyorder[fix] = keyorder[0];
							keyorder[0] = "AllowedTerm";
							
							var counter = 0;
							

							for (counter  ; counter < keyorder.length ; counter++) {
								
								if (typeof(component[keyorder[counter]])=="object"){
										
								  	

								  	self[keyorder[counter]](component,component[keyorder[counter]], incontentDiv ,compObj.subTag,"Component");
								  
								}
								
								  
							}
						
						
						
						   
						}
			
						
						self.mainButtonsDiv.innerHTML = "";
						//self.addButtons(self.mainButtonsDiv);
						$('select[class^="ui dropdown"]').dropdown();
						 $('.ui.accordion').accordion();
						self.formCheckHandler(self.checkFormSaveReady());
						
		}

			this.QuestionType = function(parent, object, parentDiv,mapTagArray , parentTagTypeFromJson){


			}

			this.Calculation = function(parent, object, parentDiv,mapTagArray,parentTagTypeFromJson){


			}
			this.CalculationType = function(parent, object, parentDiv,mapTagArray,parentTagTypeFromJson){


			}

			this.Inference = function(parent, object, parentDiv,mapTagArray,parentTagTypeFromJson){


			}

			this.textFreeInput = function(parent, object, parentDiv,mapTagArray,parentTagTypeFromJson){
			
 			
 				//var textareaDomObject = document.createElement("textarea");
				//parentDiv.appendChild(textareaDomObject);
			

			}

			this.ValidTerm = function(parent, object, parentDiv ,mapTagArray,parentTagTypeFromJson, optionElement , paramContentDiv,validTermButtonClass,ATparent,ATobject,ATallowedTermObj){	


			  		  var arrayLength = -1;
						if (Array.isArray(object)){
							
							arrayLength = object.length;

						}else{

							arrayLength = 1;
						}

					
					//checkAnnotatorConfidence(parentDiv,object);
					var ValidTerm = [];
					var i=0;
					 for ( i = 0 ; i<arrayLength;i++ ){
					 	var subEObject= null;
						if (arrayLength>1)
						  subEObject =object[i];
						else
						 subEObject = object;
				  
					  		var ValidTermObj = {
								type: 'ValidTerm',
								codeValue : subEObject.codeValue,
								codeMeaning : subEObject.codeMeaning,
								primitiveObj : subEObject,
								primitiveObjATSparent : ATparent,
								primitiveObjATS : ATobject,
								syntheticObjATS : ATallowedTermObj,
								changeOnSelect: function(newValue,callback) {  
									
									this.select = newValue;
									this.primitiveObj.select = newValue;
									
								},
								callParentObj: function(){
									
									return this.ATparent;
								},
								getPrimitive:function(){
									return this.primitiveObj;
								},
								id : subEObject.id,
								subTag:[],
								select:'0'
								
							};
							
							 ValidTerm.push({
											ValidTerm: ValidTermObj
										}
								  );

						var control = "";
						if ( (ATparent.minCardinality==1) && (ATparent.maxCardinality==1)){
							control = "radioBtn";
						 }	
						var allowTermText =parent.codeMeaning;
						var selectHolder;
						if ((control != "radioBtn") ){
							if (validTermButtonClass != "ui"){
								var ar=new self.createCheckboxVT(parent,subEObject.codeValue, ATparent.label, "ui checkbox mylbl", false , allowTermText + " "+ subEObject.codeMeaning,ATallowedTermObj,ValidTermObj,ATparent);
								parentDiv.appendChild(ar.getelementHtml());
							}else{
								self.subOrderLabelTracking = self.subOrderLabelTracking +1;
								var ar=new self.createOptionVT(parent,subEObject.codeValue, ATparent.label, "ui ", false , allowTermText+"  "+subEObject.codeMeaning,ATallowedTermObj,ValidTermObj,ATparent);
	   	
								selectHolder = paramContentDiv.getElementsByTagName("select")[0]	;				  	
								selectHolder.appendChild(ar.getelementHtml());
							}

						}else{
							

								var ar=new self.createRadioVT(parent,subEObject.codeValue, ATparent.label, "ui radio checkbox mylbl", false , allowTermText + " "+ subEObject.codeMeaning,ATallowedTermObj,ValidTermObj,ATparent);
								parentDiv.appendChild(ar.getelementHtml());
						}

							  for (var key in subEObject) {
										if (typeof(subEObject[key])=="object"){

										}
										  
									}
				
					}


			}

			this.GeometricShape = function(parent, object, parentDiv ,mapTagArray,parentTagTypeFromJson){
					var GeometricShape = [];
							let Obj = {
								type: 'GeometricShape',
								shape : object.GeometricShape,
								subTag:[]
							};
								  mapTagArray.push({
											GeometricShape : Obj
										}
								  );
								  
						
						var GSDiv = document.createElement('div');
						GSDiv.id = 'block';

						GSDiv.className = 'mylbl';
						GSDiv.style.width = '200px';
						GSDiv.style.height = '20px';
						GSDiv.style.backgroundColor= 'white';
						GSDiv.style.color= 'black';
						GSDiv.innerHTML="Required shape : "+object.GeometricShape;
						parentDiv.appendChild(GSDiv);
						

			}


			this.AllowedTerm = function(parent, object,parentDiv ,mapTagArray,parentTagTypeFromJson){

					 
					var athis = this;
					athis.parent = parent;
					
					athis.obj = object;
					  
					  var control;
					  var ar="";
					  var validTermButtonClass="";
					  var validTermButtonClassDiv="";
					  var validTermInputType="";

					  var txt =parent.label;
					  var maindiv = (txt).replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>/ /\{\}\[\]\\\/]/gi, '');
					  var lblTxt = document.createTextNode(parent.label);
					  var uiAccordionDiv = document.createElement('div');
					  uiAccordionDiv.className = ' accordion allowedTermlbl';
					  var titleDiv = document.createElement('div');
					  titleDiv.className = 'title active';
					   titleDiv.style = "color:gray;";

					 


					  var titleI = document.createElement('i');
					  titleI.className = 'dropdown icon';
					  var contentDiv = document.createElement('div');
					  //iconcav
					  var iconI = document.createElement('i');
					  iconI.id=parent.id;
					  if (parent.minCardinality <= '0'){
					  		iconI.className="green check circle outline icon";
					  		var varOk = "true";
					  }else{
					  		iconI.className="red check circle outline icon";
					  		var varOk = "false";
					  }
					   
					  
					  parentDiv.appendChild(uiAccordionDiv);

					  contentDiv.className = 'content active';
					  contentDiv.id="allowedTerm"+maindiv;
					  
					 
						
						if (parentTagTypeFromJson != "Component")
						uiAccordionDiv.appendChild(titleDiv);
						
						//icon cav
						titleDiv.appendChild(iconI);
						titleDiv.appendChild(titleI);
						titleDiv.appendChild(lblTxt);
						uiAccordionDiv.appendChild(contentDiv);
						uiAccordionDiv.style.marginLeft="20px";

						var mainSelectDiv = document.createElement('div');
						mainSelectDiv.className = "ui container";
						mainSelectDiv.id="Drop"+maindiv;
					   
						var selectDiv = document.createElement('select');
						selectDiv.className = "ui fluid multiple dropdown";
						//selectDiv.multiple=true;
						selectDiv.id='select'+maindiv;




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
								max:parent.maxCardinality,
								label:parent.label,
								actualSelected:0,
								ok:varOk
								};

							self.mapCardinalitiesToCheckId.set(parent.id,compObj);
						

						var arrayLength = -1;
						if (Array.isArray(object)){
							
							arrayLength = object.length;

						}else{

							arrayLength = 1;
						}

						var subEObject= null;
						self.checkAnnotatorConfidence(parentDiv,object);
						  if ( (parent.minCardinality==1) && (parent.maxCardinality==1)){

						 			control = "radioBtn";
						 			if (arrayLength>10){
									mainSelectDiv.appendChild(selectDiv)
									contentDiv.appendChild(mainSelectDiv);
						  			}
						  }else{
							 	if (arrayLength>4){
									mainSelectDiv.appendChild(selectDiv)
									contentDiv.appendChild(mainSelectDiv);
						  		}
						  }

						 let AllowedTerm = [];
						 var i=0;
						
						 for ( i = 0 ; i<arrayLength;i++ ){
						 	var subEObject= null;
						 	
						 	self.subOrderLabelTracking=self.subOrderLabelTracking+1;
												  if (arrayLength>1)
													subEObject =object[i];
												  else
													subEObject = object;
												  var ar;
												  self.ids++;
												//add global array
												var NextId = '0';
												
												//subEObject.cavit = "added by"
												if (typeof subEObject.nextId !="undefined"){
													NextId = subEObject.nextId;  
													
												}
												

												
												
												var allowedTermObj = {
													type: 'AllowedTerm',
													codeValue: subEObject.codeValue,
													codeMeaning: subEObject.codeMeaning,
													codingSchemeDesignator:subEObject.codingSchemeDesignator,
													codingSchemeVersion : subEObject.codingSchemeVersion,
													nextId : NextId,
													primitiveObj : subEObject,
													parentObj : parent,
													changeOnSelect: function(newValue,callback) {  
																			
																			this.select = newValue;
																			this.primitiveObj.select = newValue;
																			
													},
													callParentObj: function(){
														
														return this.parentObj;
													},
													getPrimitive:function(){
														return this.primitiveObj;
													},
													select:'0',
													subTag:[]
													
												};
												
												let unionPrntAlwtermObj = {
													parant: parent,
													allowterm : allowedTermObj
												}
												this.mapAllowedTermCollectionByCodeValue.set(allowedTermObj.codeValue,unionPrntAlwtermObj);
												AllowedTerm.push({
																AllowedTerm: allowedTermObj
															}
													  );
												  
					 								//add global array
												 //mapTagArray.push( subEObject.codeMeaning);
												
												  if ( control != "radioBtn"){
													if (arrayLength>4){
														
														validTermInputType = "select"
													  	validTermButtonClass = "ui";
													  	ar=new self.createOption(parent,subEObject.codeValue, parent.label, "ui ", false , subEObject.codeMeaning,allowedTermObj);
													   	
													  	selectDiv.multiple = "true";
													  	if (!subEObject.hasOwnProperty("ValidTerm"))
													  	selectDiv.appendChild(ar.getelementHtml());
														validTermButtonClassDiv = selectDiv;

													}else{
														validTermInputType = "checkbox"
														validTermButtonClass = "ui checkbox mylbl";
														ar = new self.createCheckbox(parent,subEObject.codeValue, parent.label, "ui checkbox mylbl", subEObject.codeMeaning , subEObject.codeMeaning,allowedTermObj);
														if (!subEObject.hasOwnProperty("ValidTerm"))
														contentDiv.appendChild(ar.getelementHtml());
														validTermButtonClassDiv = contentDiv;
													}

												  }else{
												  	if (arrayLength>10){
												  		//select from drop down it adds to input box
												  		validTermInputType = "select"
													  	validTermButtonClass = "ui";
													  	ar=new self.createOption(parent,subEObject.codeValue, parent.label, "ui ", false , subEObject.codeMeaning,allowedTermObj);
													   	
													  	selectDiv.multiple = "false";
													  	if (!subEObject.hasOwnProperty("ValidTerm"))
													  	selectDiv.appendChild(ar.getelementHtml());
														validTermButtonClassDiv = selectDiv;
												  	}
												  	else{

												  		validTermInputType = "radio"
												  		validTermButtonClass = "ui radio checkbox mylbl";
												  		
														ar=new self.createRadio(parent,subEObject.codeValue, 	parent.label, "ui radio checkbox mylbl", false , subEObject.codeMeaning,allowedTermObj);
														
														if (!subEObject.hasOwnProperty("ValidTerm"))
														contentDiv.appendChild(ar.getelementHtml());
														validTermButtonClassDiv = contentDiv;
													}
														
												  }
												
												 
												  var el = domelements[domelements.length-1];
												  for (var key in subEObject) {
															if (typeof(subEObject[key])=="object"){
																if (key == "ValidTerm"){

																	
																	self[key](subEObject,subEObject[key],contentDiv,allowedTermObj.subTag,"ValidTerm",ar.getelementHtml(),contentDiv,validTermButtonClass,parent,object,allowedTermObj);

																}else{

																	
															  		self[key](subEObject,subEObject[key],contentDiv,allowedTermObj.subTag,"AllowedTerm");
																}
															}
														
												  }


						  }
						  self.subOrderLabelTracking = 64;

						  var preselected="";
						  $("#"+selectDiv.id).dropdown({
    								onChange: function (val, text) {
        							
        							
        							
	        							if (text[0] == '<'){
	        								var words = text.split("<label>");
	        								var words = words[1].split("</label>");
	        									
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
						  
						 

			}


		this.ImagingObservation = function(parent, object , parentDiv,mapTagArray,parentTagTypeFromJson){
			var _self = this;
							self.checkAnnotatorConfidence(parentDiv,object);
					self.checkIfCommentRequired(object,parentDiv);
						 	//add global array
					var arrayLength = -1;
						if (Array.isArray(object)){
							
							arrayLength = object.length;

						}else{

							arrayLength = 1;
						}
					
					if (object.hasOwnProperty("ImagingObservationCharacteristic")){

					var subEObject = object["ImagingObservationCharacteristic"];
					self.checkAnnotatorConfidence(parentDiv,object);
					
							var ImagingObservation = [];
							
							
							
							
							let ImagingObservationObj = {
								type: 'ImagingObservation',
								subTag:[]
							};

								 ImagingObservation.push({
											ImagingObservation: ImagingObservationObj
										}
								  );
							
					
							var obj = object["ImagingObservation"];
								self.ImagingObservationCharacteristic(object,subEObject,parentDiv,ImagingObservation[ImagingObservation.length-1].ImagingObservation.subTag,ImagingObservation[ImagingObservation.length-1].ImagingObservation.type);
							mapTagArray.push({
											ImagingObservation: ImagingObservation
									}
							  );
				}

		}
				
		this.ImagingObservationCharacteristic = function(parent, object , parentDiv,mapTagArray,parentTagTypeFromJson){

		  	var _self = this;
					 
					  var arrayLength = -1;
						if (Array.isArray(object)){
							
							arrayLength = object.length;

						}else{

							arrayLength = 1;
						}
					

					var ImagingObservationCharacteristic = [];
					var i=0;
					 for (i = 0 ; i<arrayLength;i++ ){
						var subEObject = null;
						if (arrayLength>1)
							subEObject =object[i];
						else
							subEObject = object;

						
				  
					  		let ImagingObservationCharacteristicObj = {
								type: 'ImagingObservationCharacteristic',
								label: subEObject.label,
								itemNumber: subEObject.itemNumber,
								authors: subEObject.authors,
								explanatoryText : subEObject.explanatoryText,
								minCardinality : subEObject.minCardinality,
								maxCardinality : subEObject.maxCardinality,
								id : subEObject.id,
								subTag:[],
								selected:0
								
							};
							
							 ImagingObservationCharacteristic.push({
											ImagingObservationCharacteristic: ImagingObservationCharacteristicObj
										}
								  );
												  
							  for (var key in subEObject) {
										if (typeof(subEObject[key])=="object"){

										  self[key](subEObject,subEObject[key],parentDiv,ImagingObservationCharacteristicObj.subTag,ImagingObservationCharacteristicObj.type);
										}
										  
									}
									self.checkAnnotatorConfidence(parentDiv,subEObject);
									self.checkIfCommentRequired(subEObject,parentDiv);
					
					}
				
					mapTagArray.push({
											ImagingObservationCharacteristic: ImagingObservationCharacteristic
										}
								  );


		}

		this.CharacteristicQuantification = function(parent, object, parentDiv,mapTagArray,parentTagTypeFromJson, subOrderLabel){


					var arrayLength = -1;
					if (Array.isArray(object)){
						
						arrayLength = object.length;

					}else{

						arrayLength = 1;
					}
					var subEObject= null;
					
					
					
					
				var CharacteristicQuantification = [];
				var i=0;
				  for ( i = 0 ; i<arrayLength;i++ ){
					if (arrayLength>1)
					  subEObject =object[i];
					else
					  subEObject = object;
				  

					var scaleHolderDiv = document.createElement('div');
					scaleHolderDiv.className="mylbl";
					var label=document.createElement('label');
					
					var aHref = document.createElement('div');
					aHref.className = "ui label blue tiny";
				
					var _subOrderLabel =  String.fromCharCode(self.subOrderLabelTracking);
						 var aHrefText = document.createTextNode(_subOrderLabel);
					label.textContent = _subOrderLabel+'--'+subEObject.name;

					scaleHolderDiv.appendChild(aHref);
					aHref.appendChild(aHrefText);
					scaleHolderDiv.appendChild(label);

					parentDiv.appendChild(scaleHolderDiv);

				  	
				  	
				  	var suborder = self.subOrderLabelTracking;


					  		let CharacteristicQuantificationObj = {
								type: 'CharacteristicQuantification',
								label: subEObject.label,
								itemNumber: subEObject.itemNumber,
								authors:subEObject.authors,
								explanatoryText : subEObject.explanatoryText,
								minCardinality : subEObject.minCardinality,
								maxCardinality : subEObject.maxCardinality,
								id : subEObject.explanatoryText,
								subTag:[],
								selected:0
								
							};
							CharacteristicQuantification.push({
										
										CharacteristicQuantification: CharacteristicQuantificationObj
							});
		
						  for (var key in subEObject) {
						  	
									if (typeof(subEObject[key])=="object"){

									  self[key](subEObject,subEObject[key],scaleHolderDiv,CharacteristicQuantification[CharacteristicQuantification.length-1].CharacteristicQuantification.subTag,CharacteristicQuantification[CharacteristicQuantification.length-1].CharacteristicQuantification.type,suborder);
									}
									  
						  }
						  		self.checkAnnotatorConfidence(parentDiv,object);							
									mapTagArray.push({
											CharacteristicQuantification: CharacteristicQuantification
										}
								  );

				  }

				 
		}

		this.AnatomicEntity = function(parent, object , parentDiv,mapTagArray,parentTagTypeFromJson){


						var arrayLength = -1;
					if (Array.isArray(object)){
						
						arrayLength = object.length;

					}else{

						arrayLength = 1;
					}
					
					self.checkAnnotatorConfidence(parentDiv,object);
					var i=0;
				  for ( i = 0 ; i<arrayLength;i++ ){
				  	var subEObject= null;
					if (arrayLength>1)
					  subEObject =object[i];
					else
					  subEObject = object;
				  
						  for (var key in subEObject) {
									if (typeof(subEObject[key])=="object"){
									
									  self[key](subEObject,subEObject[key],parentDiv,mapTagArray,null);
									}
									  
								}
						
						
						 var clabel=document.createElement('label');
						 
						 parentDiv.appendChild(clabel);
					self.checkAnnotatorConfidence(parentDiv,object);
					self.checkIfCommentRequired(object,parentDiv);
						
								


						 
				  }
					
		}

		this.AnatomicEntityCharacteristic = function(parent, object, parentDiv,mapTagArray,parentTagTypeFromJson){


						  var arrayLength = -1;
					if (Array.isArray(object)){
						
						arrayLength = object.length;

					}else{

						arrayLength = 1;
					}
					


					var i=0;
				  for (i = 0 ; i<arrayLength;i++ ){
				  	var subEObject= null;
					if (arrayLength>1)
					  subEObject =object[i];
					else
					  subEObject = object;
					
						  for (var key in subEObject) {
									if (typeof(subEObject[key])=="object"){
									  
									 
									  self[key](subEObject,subEObject[key],parentDiv,mapTagArray,null);

									}
									  
								}
										self.checkAnnotatorConfidence(parentDiv,subEObject);
										self.checkIfCommentRequired(subEObject,parentDiv);

						 
				  }
				  
				
		}

		this.annotatorConfidence = function(parent, object, parentDiv,mapTagArray,parentTagTypeFromJson){
				  
					  var arrayLength = -1;
					if (Array.isArray(object)){
						
						arrayLength = object.length;

					}else{

						arrayLength = 1;
					}
					var subEObject= null;
					var i=0;
				  for (i = 0 ; i<arrayLength;i++ ){
					if (arrayLength>1)
					  subEObject =object[i];
					else
					  subEObject = object;


						  for (var key in subEObject) {
									if (typeof(subEObject[key])=="object"){
							
									  self[key](subEObject,subEObject[key], parentDiv,mapTagArray,null);
									}
									  
								}
					 
				  }
			
		}



this.Scale = function(parent, object, parentDiv,mapTagArray,parentTagTypeFromJson,subOrderLabel){
				  

					var _subOrderLabel =  String.fromCharCode(subOrderLabel);

					  var arrayLength = -1;
					if (Array.isArray(object)){
						
						arrayLength = object.length;

					}else{

						arrayLength = 1;
					}
					var subEObject= null;
					
					var i =0;
				  for (i = 0 ; i<arrayLength;i++ ){
					if (arrayLength>1)
					  subEObject =object[i];
					else
					  subEObject = object;

					var scaleHolderDiv = document.createElement('div');
					scaleHolderDiv.className="mylbl";
					var label=document.createElement('label');
					label.textContent =  _subOrderLabel+'-'+parent.name;

					parentDiv.appendChild(scaleHolderDiv);

						  for (var key in subEObject) {

									if (typeof(subEObject[key])=="object"){

									  self[key](subEObject,subEObject[key], scaleHolderDiv,mapTagArray,null,"Select"+parent.name);
									}
									  
								}
					 self.checkAnnotatorConfidence(parentDiv,object);
				  }


				
		}

		this.ScaleLevel = function(parent, object, parentDiv,mapTagArray,parentTagTypeFromJson,subOrderLabel){
					  

							var arrayLength = -1;
							var quantileDiv = document.createElement('div');
							var quantileSelect = document.createElement('select');
							selectid++;
							quantileSelect.id = subOrderLabel;
							quantileSelect.addEventListener("change", function(){
								
								var i=0;
								var scaleArraysize = object.length;
								for ( i = 0 ; i<scaleArraysize;i++ ){
									if (object[i].valueLabel == this.value)
									{
										object[i].select='1';
										  self.mapHtmlSelectObjectsKeyValue.set(this.value,quantileSelect.id);
									}else{
										object[i].select='0';
									}
								}

							}); 
							quantileSelect.className = 'ui dropdown mylbl';
							quantileDiv.appendChild(quantileSelect);
							parentDiv.appendChild(quantileDiv);
						if (Array.isArray(object)){
							
							arrayLength = object.length;

						}else{

							arrayLength = 1;
						}
						var subEObject= null;
						//self.checkAnnotatorConfidence(parentDiv,object);
					  for (var i = 0 ; i<arrayLength;i++ ){
						if (arrayLength>1)
						  subEObject =object[i];
						else
						  subEObject = object;
							  for (var key in subEObject) {
										if (typeof(subEObject[key])=="object"){
									
										  self[key](subEObject,subEObject[key], parentDiv,mapTagArray,null);
										}
										  
									}

							var quantileOption = document.createElement('option');

								quantileOption.innerHTML = subEObject.valueLabel  ;
								quantileSelect.appendChild(quantileOption);


					  }

				
		}
		this.followSubAllowed = function(){



		};

		this.Numerical = function(parent, object, parentDiv,mapTagArray,parentTagTypeFromJson){
		  



					var arrayLength = -1;
						var quantileDiv = document.createElement('div');
						quantileDiv.className="mylbl";
						var quantileSelect = document.createElement('select');
						quantileSelect.className = 'ui dropdown mylbl';
						selectid++;
						quantileSelect.id = selectid;
						quantileSelect.addEventListener("change", function(){


								var i=0;
								var scaleArraysize = object.length;
								for (i = 0 ; i<scaleArraysize;i++ ){
									var createFormValue =mathOperators.get(object[i].operator) + " "+object[i].valueLabel + " " +object[i].ucumString ;
									
									if (createFormValue == this.value)
										object[i].select='1';
									else
										object[i].select='0';
								}


							}); 
						quantileDiv.appendChild(quantileSelect);
						parentDiv.appendChild(quantileDiv);
					if (Array.isArray(object)){
						
						arrayLength = object.length;

					}else{

						arrayLength = 1;
					}
					var subEObject= null;
					self.checkAnnotatorConfidence(parentDiv,object);
				  for (var i = 0 ; i<arrayLength;i++ ){
					if (arrayLength>1)
					  subEObject =object[i];
					else
					  subEObject = object;
						  for (var key in subEObject) {
									if (typeof(subEObject[key])=="object"){
								
									  self[key](subEObject,subEObject[key],parentDiv,mapTagArray,null);
									}
									  
								}
						
						var quantileOption = document.createElement('option');
						quantileOption.innerHTML = mathOperators.get(subEObject.operator) + " "+subEObject.valueLabel + " " +subEObject.ucumString ;
						quantileSelect.appendChild(quantileOption);
						
				  }
			

		}

		this.Quantile = function(parent, object, parentDiv,mapTagArray,parentTagTypeFromJson){
				  
				
				  
			

					var arrayLength = -1;
					if (Array.isArray(object)){
						
						arrayLength = object.length;

					}else{

						arrayLength = 1;
					}
					var subEObject= null;
					self.checkAnnotatorConfidence(parentDiv,object);
				  for (var i = 0 ; i<arrayLength;i++ ){
					if (arrayLength>1)
					  subEObject =object[i];
					else
					  subEObject = object;
						  for (var key in subEObject) {
									if (typeof(subEObject[key])=="object"){

									  self[key](subEObject,subEObject[key], parentDiv,mapTagArray,null);
									}
									  
								}
								var quantileDiv = document.createElement('div');
									quantileDiv.className="mylbl";
								var quantileSelect = document.createElement('select');
								quantileSelect.className = 'ui dropdown mylbl';
								quantileDiv.appendChild(quantileSelect);
								parentDiv.appendChild(quantileDiv);
								var max = parseFloat(subEObject.maxValue);
								var min = parseFloat(subEObject.minValue);
								var bins = parseFloat(subEObject.bins);
								var net = max-min;
								var step = net/bins;
								var minValue=min;
								for (i=0 ; i<bins; i++){

									let quantileOption = document.createElement('option');
									quantileSelect.appendChild(quantileOption);
									quantileOption.innerHTML = minValue +" - "+ parseFloat(parseFloat(minValue)+parseFloat(step)) ;
									minValue = minValue+step;
							}

				  }


		}

		this.Interval = function(parent, object, parentDiv , mapTagArray,parentTagTypeFromJson){


					var arrayLength = -1;
					if (Array.isArray(object)){
						
						arrayLength = object.length;

					}else{

						arrayLength = 1;
					}
					var subEObject= null;
					self.checkAnnotatorConfidence(parentDiv,object);
					var intervalDiv = document.createElement('div');
					intervalDiv.className="mylbl";
					var intervalSelect = document.createElement('select');
					intervalSelect.className = 'ui dropdown mylbl';


						selectid++;
						intervalSelect.id = selectid;
						intervalSelect.addEventListener("change", function(){

								var i=0;
								var scaleArraysize = object.length;
								for (i = 0 ; i<scaleArraysize;i++ ){
									
									
									if (object[i].valueLabel == this.value)
										object[i].select='1';
									else
										object[i].select='0';
								}

							}); 

					
				   
					intervalDiv.appendChild(intervalSelect);
					for (var i = 0 ; i<arrayLength;i++ ){
					  if (arrayLength>1)
						subEObject =object[i];
					  else
						subEObject = object;
							for (var key in subEObject) {
									  if (typeof(subEObject[key])=="object"){

										self[key](subEObject,subEObject[key],parentDiv,mapTagArray,null);
									  }
										
								  }
								  var intervalOption = document.createElement('option');
								  intervalOption.innerHTML = subEObject.valueLabel;
								  intervalSelect.appendChild(intervalOption);

					}
					parentDiv.appendChild(intervalDiv);
		
		}

		this.NonQuantifiable = function(parent, object, parentDiv , mapTagArray,parentTagTypeFromJson,subOrderLabel){
		  

					var _subOrderLabel =  String.fromCharCode(subOrderLabel);
					var arrayLength = -1;
						var quantileDiv = document.createElement('div');
						quantileDiv.className="mylbl";
						var quantileSelect = document.createElement('select');
						quantileSelect.className = 'ui dropdown mylbl';
						selectid++;
						quantileSelect.id = selectid;
						quantileSelect.addEventListener("change", function(){

								var i=0;
								var scaleArraysize = object.length;
								for (i = 0 ; i<scaleArraysize;i++ ){
									
									
									if (object[i].codeMeaning == this.value)
										object[i].select='1';
									else
										object[i].select='0';
								}

							}); 
						quantileDiv.appendChild(quantileSelect);
						parentDiv.appendChild(quantileDiv);
					if (Array.isArray(object)){
						
						arrayLength = object.length;

					}else{

						arrayLength = 1;
					}
					var subEObject= null;
					self.checkAnnotatorConfidence(parentDiv,object);
				  for (var i = 0 ; i<arrayLength;i++ ){
					if (arrayLength>1)
					  subEObject =object[i];
					else
					  subEObject = object;
						  for (var key in subEObject) {
									if (typeof(subEObject[key])=="object"){

									  self[key](subEObject,subEObject[key],parentDiv,mapTagArray,null);
									}
									  
								}
						var quantileOption = document.createElement('option');
						quantileOption.innerHTML = subEObject.codeMeaning   ;
						quantileSelect.appendChild(quantileOption);
						  
				  }
				

		}





		this.createRadio = function(prObject, id, name, className, checked , lbl,allowedTermObj){

					  var _self = this;
					  _self.par = prObject;
					  _self.id= id;
					  _self.name = name;
					  _self.checked = checked;
					  _self.className = className;
					  _self.lbl = lbl;
					  var div = document.createElement('div');
					  div.className = _self.className;
					  div.style="color:gray;";
					  var label=document.createElement('label');
					  label.textContent =  _self.lbl;
					  label.style = "color:gray;";
					  var radioInput = document.createElement('input');
					  radioInput.type = "radio";
					  radioInput.className = "ui radio checkbox";
					  radioInput.id = _self.id;
					  radioInput.name = _self.name;
					  radioInput.checked = _self.checked;
					  radioInput.style="margin-left:0px";
					  
					  div.appendChild(radioInput);
					  div.appendChild(label);
					  
						radioInput.onclick = function() {
							
						
							var getAllowTGroup = prObject;
							var getAllowTGroupSize = getAllowTGroup.AllowedTerm.length;
							var i=0;

							for (i=0; i<getAllowTGroupSize; i++){
								if (getAllowTGroup.AllowedTerm[i].codeValue !==allowedTermObj.codeValue)
									getAllowTGroup.AllowedTerm[i].select = '0';
								else
									getAllowTGroup.AllowedTerm[i].select = '1';
							}

							
							


							allowedTermObj.select ='1';
							allowedTermObj.changeOnSelect('1',self.AfterClick(allowedTermObj.callParentObj()));
							var checkmarkObj = self.mapCardinalitiesToCheckId.get(prObject.id);
							checkmarkObj.ok = 'true';
							checkmarkObj.actualSelected++;

							self.mapCardinalitiesToCheckId.set(checkmarkObj.id,checkmarkObj);

							if (checkmarkObj.actualSelected >= checkmarkObj.min)
								document.getElementById(checkmarkObj.id).className = "green check circle outline icon";
							if (allowedTermObj.nextId != '0'){

								self.DisableTillNext(_self.par.id,allowedTermObj.nextId,self.callDisable);

							}else if (typeof (self.mapStatusAllowedTermBlocks.get(checkmarkObj.id)) !== 'undefined'){
								var statusCheckAllowTermObject = self.mapStatusAllowedTermBlocks.get(checkmarkObj.id);
								if ( statusCheckAllowTermObject.status == 'disabled' )
								self.EnableTillNext(statusCheckAllowTermObject.startid,statusCheckAllowTermObject.endid);
							}

							self.formCheckHandler(self.checkFormSaveReady());
						};
					 
					  this.getelementHtml = function(){
						
						 return div;
					  };
					  self.mapHtmlObjects.set(allowedTermObj.codeValue,radioInput);
		};
		this.createRadioVT = function(prObject, id, name, className, checked , lbl,allowedTermObj, validTermObj, vtPrObject){

					  var _self = this;
					  _self.allowedTermObj = validTermObj;
					  _self.par = prObject;
					  _self.id= id+allowedTermObj.codeValue;
					  _self.name = name;
					  _self.checked = checked;
					  _self.className = className;
					  _self.lbl = lbl;
					  var div = document.createElement('div');
					  div.className = _self.className;
					  div.style="color:gray;";
					  var label=document.createElement('label');
					  label.textContent =  _self.lbl;
					  label.style = "color:gray;";
					  var radioInput = document.createElement('input');
					  radioInput.type = "radio";
					  radioInput.className = "ui radio checkbox";
					  radioInput.id = _self.id;
					  radioInput.name = _self.name;
					  radioInput.checked = _self.checked;
					   radioInput.style="margin-left:0px";
					 
					  
					  
					  div.appendChild(radioInput);
					  div.appendChild(label);

						radioInput.onclick = function() {


							prObject.select = "1";
							var getAllowTGroup = validTermObj.primitiveObjATSparent;
							var getAllowTGroupSize = getAllowTGroup.AllowedTerm.length;
							var i=0;
							for (i=0; i<getAllowTGroupSize; i++){
								if (getAllowTGroup.AllowedTerm[i].codeValue !== validTermObj.primitiveObjATS.codeValue)
									getAllowTGroup.AllowedTerm[i].select = '0';
								else
									getAllowTGroup.AllowedTerm[i].select = '1';
							}

							allowedTermObj.select ='1';
							allowedTermObj.changeOnSelect('1',self.AfterClick(allowedTermObj.callParentObj()));



							var checkmarkObj = self.mapCardinalitiesToCheckId.get(validTermObj.primitiveObjATSparent.id);
							checkmarkObj.ok = 'true';
							checkmarkObj.actualSelected++;

							self.mapCardinalitiesToCheckId.set(checkmarkObj.id,checkmarkObj);

							if (checkmarkObj.actualSelected >= checkmarkObj.min)
								document.getElementById(checkmarkObj.id).className = "green check circle outline icon";
							if (allowedTermObj.nextId != '0'){

								self.DisableTillNext(prObject.id,allowedTermObj.nextId,self.callDisable);

							}else if (typeof (self.mapStatusAllowedTermBlocks.get(checkmarkObj.id)) !== 'undefined'){
								var statusCheckAllowTermObject = self.mapStatusAllowedTermBlocks.get(checkmarkObj.id);
								if ( statusCheckAllowTermObject.status == 'disabled' )

								self.EnableTillNext(statusCheckAllowTermObject.startid,statusCheckAllowTermObject.endid);
							}



							self.formCheckHandler(self.checkFormSaveReady());
						};


					  
					  //document.addEventListener('click', this.check.bind(this) );

					 
					  this.getelementHtml = function(){

						 return div;
					  };

					  self.mapHtmlObjects.set(_self.allowedTermObj.codeValue,radioInput);
		};

		this.createOption = function(prObject, id, name, className, checked , lbl,allowedTermObj){
				//drop down select and add input box object
				 var _self = this;
				  _self.allowedTermObj =allowedTermObj;
				  _self.par = prObject;
				  //this.id = id.replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, '');
				  _self.id= id;
				  _self.name = name;
				  _self.value = name;
				  _self.checked = checked;
				  _self.className = className;
				  _self.lbl = lbl;
				  var div = document.createElement('div');
				  
				  div.className = _self.className;
				  div.style="color:gray;";
				  var labelHolder = document.createElement('label');
				  var label=document.createTextNode(_self.lbl);
				  label.style = "color:gray;";
				  
				  var square = document.createElement('div');
				  square.className = "ui mini Tiny blue label";
				   var lab=document.createTextNode(String.fromCharCode(self.subOrderLabelTracking)+"-");
				   square.appendChild(lab);

				  var optionInput = document.createElement('option');
				  optionInput.id = _self.id;
				  optionInput.name = _self.name;
				  optionInput.checked = _self.checked;
				  optionInput.value = _self.lbl;
				  optionInput.style="margin-left:0px";
				  //div.appendChild(radioInput);

				  div.appendChild(optionInput);
				  optionInput.appendChild(square);
				  optionInput.appendChild(labelHolder);
				   labelHolder.appendChild(label);

					optionInput.addEventListener ("click", function() { 
	
							var checkmarkObj = self.mapCardinalitiesToCheckId.get(prObject.id);
							checkmarkObj.ok = 'true';
							
							if (allowedTermObj.getPrimitive().select == '1'){
								
								allowedTermObj.getPrimitive().select ='0';
								allowedTermObj.changeOnSelect('0',self.AfterClick(allowedTermObj));
								checkmarkObj.actualSelected--;
							}else{
								allowedTermObj.getPrimitive().select ='1';
								allowedTermObj.changeOnSelect('1',self.AfterClick(allowedTermObj));
								checkmarkObj.actualSelected++;
								
							}
							
							
							self.mapCardinalitiesToCheckId.set(prObject.id,checkmarkObj);
								if ((checkmarkObj.actualSelected >= checkmarkObj.min) && (checkmarkObj.actualSelected <= checkmarkObj.max) )
									document.getElementById(prObject.id).className = "green check circle outline icon";
							else 
									document.getElementById(prObject.id).className = "red check circle outline icon";
							
							self.formCheckHandler(self.checkFormSaveReady());
					});


				  

				 
					this.getelementHtml = function(){
							
							 return optionInput;
					};
				 
		};

				this.createOptionVT = function(prObject, id, name, className, checked , lbl,allowedTermObj,validTermObj,vtPrObject){
					//drop down multiple selectable list
				 var _self = this;
				  _self.allowedTermObj =validTermObj;
				  _self.par = prObject;
				  //this.id = id.replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, '');
				  _self.id= id;
				  _self.name = name;
				  _self.value = name;
				  _self.checked = checked;
				  _self.className = className;
				  _self.lbl = lbl;
				  var div = document.createElement('div');
				   div.style="color:gray;";
				  div.className = _self.className;
				  var labelHolder = document.createElement('label');
				  var label=document.createTextNode(_self.lbl);
				  label.style = "color:gray;";
				  
				  var square = document.createElement('div');
				  square.className = "ui mini Tiny blue label";
				   var lab=document.createTextNode(String.fromCharCode(self.subOrderLabelTracking)+"-");
				   square.appendChild(lab);

				  var optionInput = document.createElement('option');
				  optionInput.id = _self.id;
				  optionInput.name = _self.name;
				  optionInput.checked = _self.checked;
				  optionInput.value = _self.lbl;
				  //div.appendChild(radioInput);
				   optionInput.style="margin-left:0px";
				  div.appendChild(optionInput);
				  optionInput.appendChild(square);
				  optionInput.appendChild(labelHolder);
				   labelHolder.appendChild(label);

					optionInput.addEventListener ("click", function() { 

							
							var checkmarkObj = self.mapCardinalitiesToCheckId.get(vtPrObject.id);
							checkmarkObj.ok = 'true';


							if (validTermObj.getPrimitive().select == '1'){
								prObject.select = "0";
								//allowedTermObj.getPrimitive().select ='0';
								validTermObj.getPrimitive().select ='0';
								//allowedTermObj.changeOnSelect('0',self.AfterClick(allowedTermObj));
								checkmarkObj.actualSelected--;
							}else{
								prObject.select = "1";
								//allowedTermObj.getPrimitive().select ='1';
								validTermObj.getPrimitive().select ='1';
								//allowedTermObj.changeOnSelect('1',self.AfterClick(allowedTermObj));
								checkmarkObj.actualSelected++;
								
							}

							
							
							
							
							
							self.mapCardinalitiesToCheckId.set(vtPrObject.id,checkmarkObj);
								if ((checkmarkObj.actualSelected >= checkmarkObj.min) && (checkmarkObj.actualSelected <= checkmarkObj.max) )
									document.getElementById(vtPrObject.id).className = "green check circle outline icon";
							else 
									document.getElementById(vtPrObject.id).className = "red check circle outline icon";
								self.formCheckHandler(self.checkFormSaveReady());
							
					});


				 
				 
					this.getelementHtml = function(){
							
							 return optionInput;
					};
				
		};


		this.createCheckbox = function(prObject,id, name, className, value , lbl,allowedTermObj){
					var _self = this;
					_self.allowedTermObj = allowedTermObj;
					this.par = prObject;
					  //this.id = id.replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, '');
					  this.allowedTermObj = allowedTermObj;
					  this.id= id;
					  this.name = name;
					  this.className = className;
					  this.value = value;
					  this.lbl = lbl;
					  var div = document.createElement('div');
					  div.className = this.className;
					   div.style="color:gray;";
					  var label=document.createElement('label');
					  label.textContent=  this.lbl;
					  label.style = "color:gray;";
					  var checkbox = document.createElement('input');
					  checkbox.type = "checkbox";
					  checkbox.className = "ui checkbox";
					  checkbox.name =  this.name;
					  checkbox.value =  this.value;
					  checkbox.id = this.id;
					   checkbox.style="margin-left:0px";
					  div.appendChild(checkbox);
					  div.appendChild(label);
					  // document.getElementById(this.par).appendChild(div);
					  this.getelementHtml = function(){

						  return div;
					  };


					   checkbox.onclick = function (){

						 	allowedTermObj.changeOnSelect('1',self.AfterClick);
						 	
							
						 	
							
						 	var checkmarkObj = self.mapCardinalitiesToCheckId.get(prObject.id);
							if (this.checked == true){

								allowedTermObj.getPrimitive().select ='1';
								checkmarkObj.ok = 'true';
								checkmarkObj.actualSelected++;
							}else{
								allowedTermObj.getPrimitive().select ='0';
								checkmarkObj.ok = 'false';
								checkmarkObj.actualSelected--;
							}

							var getAllowTGroup = allowedTermObj.callParentObj();
							
							
							self.mapCardinalitiesToCheckId.set(prObject.id,checkmarkObj);
							
							if ((checkmarkObj.actualSelected >= checkmarkObj.min) && (checkmarkObj.actualSelected <= checkmarkObj.max) )
									document.getElementById(prObject.id).className = "green check circle outline icon";
							else 
									document.getElementById(prObject.id).className = "red check circle outline icon";

					  self.formCheckHandler(self.checkFormSaveReady());
					  };

		}

		this.createCheckboxVT = function(prObject,id, name, className, value , lbl,allowedTermObj,validTermObj,vtPrObject){
					//var _self = this;
					//_self.allowedTermObj = validTermObj;
					this.par = prObject;
					  //this.id = id.replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, '');
					  this.allowedTermObj = validTermObj;
					  this.id= id;
					  this.name = name;
					  this.className = className;
					  this.value = value;
					  this.lbl = lbl;
					  var div = document.createElement('div');

					  div.className = this.className;
					  div.style="color:gray;";
					  var label=document.createElement('label');
					  label.textContent=  this.lbl;
					  label.style = "color:gray;";
					  var checkbox = document.createElement('input');
					  checkbox.type = "checkbox";
					  checkbox.className = "ui checkbox";
					  checkbox.name =  this.name;
					  checkbox.value =  this.value;
					  checkbox.id = this.id;
					   checkbox.style="margin-left:0px";
					  div.appendChild(checkbox);
					  div.appendChild(label);
					  // document.getElementById(this.par).appendChild(div);
					  this.getelementHtml = function(){

						  return div;
					  };


					   checkbox.onclick = function (){

						 	validTermObj.changeOnSelect('1',self.AfterClick);
						 	
							
						 	
						 	
						 	var checkmarkObj = self.mapCardinalitiesToCheckId.get(vtPrObject.id);
							if (this.checked == true){
								prObject.select = "1";
								validTermObj.getPrimitive().select ='1';
								checkmarkObj.ok = 'true';
								checkmarkObj.actualSelected++;
							}else{
								prObject.select = "0";
								validTermObj.getPrimitive().select ='0';
								checkmarkObj.ok = 'false';
								checkmarkObj.actualSelected--;
							}

							var getAllowTGroup = allowedTermObj.callParentObj();
							
							self.mapCardinalitiesToCheckId.set(vtPrObject.id,checkmarkObj);
							
							if ((checkmarkObj.actualSelected >= checkmarkObj.min) && (checkmarkObj.actualSelected <= checkmarkObj.max) )
									document.getElementById(vtPrObject.id).className = "green check circle outline icon";
							else 
									document.getElementById(vtPrObject.id).className = "red check circle outline icon";

					  self.formCheckHandler(self.checkFormSaveReady());
					  };

		}

		this.checkValidationTosave = function(){
					  
					  for (var property1 in domelements) {

	
					  if  (domelements[property1]['selectVerification'] == true)
						console.log('true');
					  else
						console.log('false');
					}
		}
		this.checkAnnotatorConfidence = function(prentDiv, objectToCheckAnnConf){
				
				if(typeof objectToCheckAnnConf.annotatorConfidence != "undefined"){

 					   // Assign value to the property here
 					   if ( (objectToCheckAnnConf.hasOwnProperty("label")) || (objectToCheckAnnConf.hasOwnProperty("name")) ){
	 					   if (objectToCheckAnnConf.annotatorConfidence == "true"){
	 					   		//console.log("after selecting template"+objectToCheckAnnConf.label);
	 					   	
	 					   		if (objectToCheckAnnConf.hasOwnProperty("label")){
	 					    		var rangeid = objectToCheckAnnConf.label.replace(/[`~!@# $%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, '');
	 					    	}else if(objectToCheckAnnConf.hasOwnProperty("name")){
	 					    		var rangeid = objectToCheckAnnConf.name.replace(/[`~!@# $%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, '');
	 					    	}
	 					  
	 					    	self.mapLabelAnnotatorConfidence.set(rangeid,"inputRange"+rangeid);
	 					    	self.mapLabelAnnotConfJson.set(rangeid,objectToCheckAnnConf);
	 					  		//console.log(rangeid);
				    			var annotConfDiv = document.createElement('div');
								var annotConfInput = document.createElement('input');
								annotConfInput.setAttribute("id", "range"+rangeid);
								annotConfInput.setAttribute("type", "range");
								annotConfInput.setAttribute("min", "0");
								annotConfInput.setAttribute("max", "100");
								annotConfInput.setAttribute("start", "0");
								annotConfInput.setAttribute("input", "inputRange"+rangeid);
								annotConfInput.value=0;

								annotConfInput.onchange = function(){

									annotConfShowValueInput.value = this.value;
									objectToCheckAnnConf.selectac = this.value /100;
									
								};
								annotConfDiv.className = 'ui range';

								var annotConfShowValueInput = document.createElement('input');
								annotConfShowValueInput.style.width  = "52px";
								annotConfShowValueInput.style.height  = "28px";
								//annotConfShowValueInput.style.float = "left";
								annotConfShowValueInput.setAttribute("type", "text");
								annotConfShowValueInput.setAttribute("class", "ui  input");
								annotConfShowValueInput.setAttribute("id", "inputRange"+rangeid);
								annotConfShowValueInput.value=0;
								
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



		this.print = function(){

		}
		var disabledefined = [];
		this.DisableTillNext = function(actualid ,nextid, call){
				let nextControl =0;
				for (var [key, value] of self.mapCardinalitiesToCheckId) {
					if (key == actualid){
						nextControl = 1;
  						let object = {
								startid : key,
								endid : nextid,
								status : 'disabled'
							}
							self.mapStatusAllowedTermBlocks.set(key,object);
					} else 	if (nextControl == 1){
						if ( (key != nextid)  ){
							disabledefined.push(key);
							document.getElementById(key).className = "blue check circle outline icon";
							let ely = document.getElementById(key).parentNode;
							
							//$(ely.parentNode).dropdown({action: 'hide'});
							$(ely.parentNode).dropdown().hide();
							
						}else
							nextControl = 0;
					}
				}
				call();

		}
		this.EnableTillNext = function(actualid ,nextid){
				let nextControl =0;
				for (var [key, value] of self.mapCardinalitiesToCheckId) {
					if (key == actualid){
						nextControl = 1;
  						let object = {
								startid : key,
								endid : nextid,
								status : 'active'
							}
							self.mapStatusAllowedTermBlocks.set(key,object);
					}else if (nextControl == 1){
						if (key != nextid){
							disabledefined.push(key);
							document.getElementById(key).className = "green check circle outline icon";
							let ely = document.getElementById(key).parentNode;
							
							$(ely.parentNode).dropdown().show();
							
						}else
							nextControl = 0;
					}
				}
				self.callDisable();

		}
		this.callDisable = function(){

				for (var [key, value] of self.mapStatusAllowedTermBlocks) {
  						console.log("mapStatusAllowedTermBlocks"+ key + ' = ' + JSON.stringify(value));
				}
		}

		this.solveAim = function(object,son){
				//extracts components from object (maptag) 
				let componentSize = object.length
				var i
				for (i = 0; i < componentSize; i++) {
							
							self.solveAimCompnent(object[i][0])
						
				}
				

		}

		this.solveAimCompnent = function(object ){

				
		}

		this.AfterClick = function(obj){



		}

		this.printXmlAim = function(data,xmlArray){
		var oSerializer = new XMLSerializer();
		var sXML = oSerializer.serializeToString(data);

			console.log("..................................................aim Saved data"+(JSON.stringify(sXML)));
			for (var i =0 ; i<xmlArray.length; i++){
				var arrayXML = oSerializer.serializeToString(xmlArray[i].value);
				console.log("..................................................xml array data"+(JSON.stringify(arrayXML)));
			}
		}
//load aim
		this.loadAim = function(aimFileXml){
				
 
			
			//document.getElementById("S1").selectedIndex = 11;
			// $('#S1').trigger("change");
			 $('document').ready(function(){
			if (aimFileXml == ""){
				aimFileXml = self.textXml;
			
			}else{
				self.textXml = aimFileXml;
				
			}


			var evObj = document.createEvent('Events');
    			evObj.initEvent("click", true, true);

			
			var parser = new window.DOMParser();
			var xmlDoc = parser.parseFromString(self.textXml,"text/xml");

			//get Template code value to select the correct template for the aim
			var templateNameImageAnnotations= xmlDoc.getElementsByTagName("imageAnnotations");
			var templateNameImageAnnotation=templateNameImageAnnotations[0].getElementsByTagName("typeCode");
			var templateCodeValue = templateNameImageAnnotation[0].getAttribute("code");


			//end check codevalue from aim
			var templateIndex= self.mapTemplateCodeValueByIndex.get(templateCodeValue);
			
			self.templateSelect.selectedIndex = templateIndex+1;
			self.extractTemplate(self.arrayTemplatesJsonObjects[templateIndex].value);
			
			var typeCodeCollection= xmlDoc.getElementsByTagName("typeCode");
			for (var i = 0 ; i < typeCodeCollection.length ; i++){

				let codeValue = typeCodeCollection[i].getAttribute("code");
				let allowedTermObj =  self.mapAllowedTermCollectionByCodeValue.get(codeValue);


				var docElement = document.getElementById(codeValue);
				if (docElement != null){
					var parentDiv = docElement.parentNode;

					if (typeof parentDiv[0] != "undefined"){
						

						var crop = parentDiv[0].name;
						crop = (crop).replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>/ /\{\}\[\]\\\/]/gi, '');

						var prDiv = document.getElementById("Drop"+crop);
						var subDivs = prDiv.getElementsByTagName("div");

						var splittedLabel = docElement.label.split("-");
						$(subDivs[0]).dropdown({ allowLabels:true});
						
						$(subDivs[0]).dropdown('set selected',[splittedLabel[1]]);


						
					}else{
						docElement.checked = true;
			

					}
				}

			}
			

			//self.checkSaveReady();
			});
		}

//load aim end
this.readx = function readx(evt){

		return self.readFile(evt);
	}
	

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
  }
    		
		
// Save Aim
		this.savetextFreeInput = function(parentArray,parentObject, itself, Entitytype, jsonInner){

		}


		this.saveQuestionType = function(parentArray,parentObject, itself, Entitytype, jsonInner){

		}

		this.saveAlgorithmType = function(parentArray,parentObject, itself, Entitytype, jsonInner){

		}

		this.saveCalculationType = function(parentArray,parentObject, itself, Entitytype, jsonInner){
				
		}

		this.saveCalculation = function(parentArray,parentObject, itself, Entitytype,jsonInner){
			
		}

		this.saveInference = function(parentArray,parentObject, itself, Entitytype,jsonInner){
			
		}

		this.saveComponent = function(parentArray,parentObject, itself, Entitytype,jsonInner){
			
			
		}

//****************** used components *********************************** 


		this.saveInterval = function(parentArray,parentObject, itself, Entitytype, jsonInner){
			

			var _inself = this;
			var parentHolder = [];
			var prntObject = null;
			parentHolder = JSON.parse(JSON.stringify(parentArray));
			
			var Intervals = itself.value;

			var arraySize = -1;
			var arrayCheck = false;
			if (Array.isArray(Intervals)){
				arraySize = Intervals.length;
				arrayCheck = true;
			}else{
				arraySize = 1;
			}

			
			var defaultMaxOperator = "";
			var defaultMinOperator = "";
			var defaultMinValue = "";
			var defaultMaxValue = "";
			var defaultUcumString = "";
			var defaultValue = "" ;
         var parser = new window.DOMParser();
         var xmldoc = parser.parseFromString(self.textXml,"text/xml");
			var xmlCharacteristicQuantification = xmldoc.createElement("CharacteristicQuantification");
			
			
			var xmlAnnotatorConfidence = xmldoc.createElement("annotatorConfidence");
			xmlAnnotatorConfidence.setAttribute("value", parentObject.value.selectac);
			
			var xmlLabel = xmldoc.createElement("label");
			
			var xmlMinValue = xmldoc.createElement("minValue");
			var xmlMaxValue = xmldoc.createElement("maxValue");
			var xmlUcumString = xmldoc.createElement("ucumString");
			
			xmlCharacteristicQuantification.appendChild(xmlAnnotatorConfidence);



			var i =0;
			for (i = 0 ; i < arraySize ; i++){

								if (arrayCheck == true){
									var instanceObject = Intervals[i];
								}else{
									var instanceObject = Intervals;
								}
								
								var prntObject = {
									type  : "Intervals",
									value : instanceObject
								}
								if (i == 0){
									
									defaultMaxOperator = instanceObject.maxOperator;
									defaultMinOperator = instanceObject.minOperator;
									defaultMinValue = instanceObject.minValue;
									defaultMaxValue = instanceObject.maxValue;
									defaultUcumString = instanceObject.ucumString;
									defaultValue = instanceObject.valueLabel;

								}else{
									if (instanceObject.hasOwnProperty("select")){
										if (instanceObject.select == "1"){

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
			xmlCharacteristicQuantification.setAttribute("maxOperator",defaultMaxOperator);
			xmlCharacteristicQuantification.setAttribute("minOperator",defaultMinOperator);
			xmlCharacteristicQuantification.setAttribute("xsi:type", "Interval");
			xmlLabel.setAttribute("value",defaultValue);
			xmlMinValue.setAttribute("value",defaultMinValue);
			xmlMaxValue.setAttribute("value",defaultMaxValue);
			xmlUcumString.setAttribute("value",defaultUcumString);
			
			xmlCharacteristicQuantification.appendChild(xmlLabel);
			xmlCharacteristicQuantification.appendChild(xmlMinValue);
			xmlCharacteristicQuantification.appendChild(xmlMaxValue);
			xmlCharacteristicQuantification.appendChild(xmlUcumString);
			//xmlParent.appendChild(xmlCharacteristicQuantification);


		}

		this.saveNonQuantifiable = function(parentArray,parentObject, itself, Entitytype,jsonInner){


			var _inself = this;
			var parentHolder = [];
			var prntObject = null;
			parentHolder = JSON.parse(JSON.stringify(parentArray));
			
			var NonQuantifiables = itself.value;
			
			var arraySize = -1;
			var arrayCheck = false;
			if (Array.isArray(NonQuantifiables)){
				arraySize = NonQuantifiables.length;
				arrayCheck = true;
			}else{
				arraySize = 1;
			}

			var defaultCode = "";
			var defaultCodeSystem = "";
			var defaultCodeSystemName = "";
			var defaultCodeSystemVersion = "";
         var parser = new window.DOMParser();
         var xmldoc = parser.parseFromString(self.textXml,"text/xml");
			var xmlCharacteristicQuantification = xmldoc.createElement("CharacteristicQuantification");
			xmlCharacteristicQuantification.setAttribute("xsi:type", "NonQuantifiable");
			
			var xmlAnnotatorConfidence = xmldoc.createElement("annotatorConfidence");
			xmlAnnotatorConfidence.setAttribute("value", parentObject.value.selectac);
			
			var xmlLabel = xmldoc.createElement("label");
			xmlLabel.setAttribute("value", parentObject.value.name);
			
			xmlCharacteristicQuantification.appendChild(xmlAnnotatorConfidence);
			xmlCharacteristicQuantification.appendChild(xmlLabel);

			var xmlTypeCode = xmldoc.createElement("typeCode");
			var xmlIsodisplayName = xmldoc.createElement("iso:displayName");
			xmlIsodisplayName.setAttribute("xmlns:iso", "uri:iso.org:21090");
			var i =0;
			
			for (i = 0 ; i < arraySize ; i++){

								if (arrayCheck == true){
									var instanceObject = NonQuantifiables[i];
								}else{
									var instanceObject = NonQuantifiables;
								}
								
								var prntObject = {
									type  : "NonQuantifiable",
									value : instanceObject
								}

								if (i == 0){
									
									defaultCode = instanceObject.codeValue;
									defaultCodeSystem = instanceObject.codeMeaning;
									defaultCodeSystemName = instanceObject.codingSchemeDesignator;
									defaultCodeSystemVersion = instanceObject.codingSchemeVersion;

								}else{
									if (instanceObject.hasOwnProperty("select")){
										if (instanceObject.select == "1"){

											defaultCode = instanceObject.codeValue;
											defaultCodeSystem = instanceObject.codeMeaning;
											defaultCodeSystemName = instanceObject.codingSchemeDesignator;
											defaultCodeSystemVersion = instanceObject.codingSchemeVersion;
										}
									}
								}

			}
			xmlTypeCode.setAttribute("code",defaultCode);
			xmlTypeCode.setAttribute("codeSystem",defaultCodeSystem);
			xmlTypeCode.setAttribute("codeSystemName",defaultCodeSystemName);
			xmlTypeCode.setAttribute("codeSystemVersion",defaultCodeSystemVersion);
			xmlIsodisplayName.setAttribute("value",defaultCodeSystem);
			xmlTypeCode.appendChild(xmlIsodisplayName);
			xmlCharacteristicQuantification.appendChild(xmlTypeCode);
			//xmlParent.appendChild(xmlCharacteristicQuantification);


		}

		this.saveQuantile = function(parentArray,parentObject, itself, Entitytype, jsonInner){


			let parentHolder = [];
			let prntObject = null;
			parentHolder = JSON.parse(JSON.stringify(parentArray));
			
			let Quantiles = itself.value;
			let i =0;
			let arraySize = -1;
			let arrayCheck = false;
			let instanceObject = null;
			if (Array.isArray(Quantiles)){
				arraySize = Quantiles.length;
				arrayCheck = true;
			}else{
				arraySize = 1;
			}

			

			for (i = 0 ; i < arraySize ; i++){

								if (arrayCheck === true){
									instanceObject = Quantiles[i];
								}else{
									instanceObject = Quantiles;
								}

								let prntObject = {
									type  : "Quantile",
									value : instanceObject
								}


								
								for (var key in instanceObject) {

									if (typeof instanceObject[key] === "object"){
									parentHolder.push(prntObject);
									
										let subObject = {
											type  : key,
											value : instanceObject[key]
										}
										

										
										//parentHolder -> each component creates it's own copy of the array and passes to the next object
										//componentOpject is the parent object for the callee
										//is the callee object
										//Entitytype should be null from this point 
										self["save"+key](parentHolder,prntObject,subObject, Entitytype,jsonInner);
									}
								}
			}

		}

		this.saveNumerical = function(parentArray,parentObject, itself, Entitytype ,jsonInner){

			
			let parentHolder = [];
			let prntObject = null;
			parentHolder = JSON.parse(JSON.stringify(parentArray));
		
			let Numericals = itself.value;
			let i =0;
			let arraySize = -1;
			let arrayCheck = false;
			let instanceObject = null;

			if (Array.isArray(Numericals)){
				arraySize = Numericals.length;
				arrayCheck = true;
			}else{
				arraySize = 1;
			}

			

			for (i = 0 ; i < arraySize ; i++){

								if (arrayCheck === true){
									 instanceObject = Numericals[i];
								}else{
									 instanceObject = Numericals;
								}

								let prntObject = {
									type  : "Numerical",
									value : instanceObject
								}


								
								for (var key in instanceObject) {

									if (typeof instanceObject[key] === "object"){
									parentHolder.push(prntObject);
									
										let subObject = {
											type  : key,
											value : instanceObject[key]
										}
										

										
										
										//parentHolder -> each component creates it's own copy of the array and passes to the next object
										//componentOpject is the parent object for the callee
										//is the callee object
										//Entitytype should be null from this point 
										self["save"+key](parentHolder,prntObject,subObject, Entitytype,jsonInner);
									}
								}
			}

		}


		this.saveScaleLevel = function(parentArray,parentObject, itself, Entitytype,jsonInner){

			
			let parentHolder = [];
			let prntObject = null;
			parentHolder = JSON.parse(JSON.stringify(parentArray));
			
			let ScaleLevels = itself.value;
			
			let arraySize = -1;
			let arrayCheck = false;
			let instanceObject = null;
			if (Array.isArray(ScaleLevels)){
				arraySize = ScaleLevels.length;
				arrayCheck = true;
			}else{
				arraySize = 1;
			}

			
			let i =0;
			let defaultSelectedValue = "";
			let defaultSelectedValueLabel = "";

			for (i = 0 ; i < arraySize ; i++){


								if (arrayCheck === true){
									 instanceObject = ScaleLevels[i];
								}else{
									 instanceObject = ScaleLevels;
								}
								if (i == 0){
									
									defaultSelectedValue = instanceObject.value;
									defaultSelectedValueLabel = instanceObject.valueLabel;

								}else{
									if (instanceObject.hasOwnProperty("select")){
										if (instanceObject.select === "1"){
											defaultSelectedValue = instanceObject.value;
											defaultSelectedValueLabel = instanceObject.valueLabel;
										}
									}
								}
								jsonInner.valueLabel = defaultSelectedValueLabel;
								jsonInner.value = defaultSelectedValue;
								
								prntObject = {
									type  : "ScaleLevel",
									value : instanceObject
								}

			}

		}

		this.saveScale = function(parentArray,parentObject, itself, Entitytype,jsonInner){



			let parentHolder = [];
			let prntObject = null;
			parentHolder = JSON.parse(JSON.stringify(parentArray));
			
			let Scales = itself.value;
			let i =0;
			let arraySize = -1;
			let arrayCheck = false;
			let instanceObject = null;

			if (Array.isArray(Scales)){
				arraySize = Scales.length;
				arrayCheck = true;
			}else{
				arraySize = 1;
			}
								
								

			let jsonCharacteristicQuantification = {
					
						"type": "Scale",
						"annotatorConfidence" : { "value": parentObject.value.selectac},
						"label" : { "value":parentObject.value.name}, 
						"valueLabel" : {
							"value":""												
						},
						"value":{
							"value":""
						}
						

			};	
			for (i = 0 ; i < arraySize ; i++){

								if (arrayCheck === true){
									 instanceObject = Scales[i];
								}else{
									 instanceObject = Scales;
								}

								let prntObject = {
									type  : "Scale",
									value : instanceObject
								}
								



								for (var key in instanceObject) {
									
									if (typeof instanceObject[key] === "object"){
										
										parentHolder.push(prntObject);
									
										let subObject = {
											type  : key,
											value : instanceObject[key]
										}

										//parentHolder -> each component creates it's own copy of the array and passes to the next object
										//componentOpject is the parent object for the callee
										//is the callee object
										//Entitytype should be null from this point 
										self["save"+key](parentHolder,prntObject,subObject, Entitytype,jsonCharacteristicQuantification);
										jsonInner.CharacteristicQuantification = jsonCharacteristicQuantification;
									}
								}

			}

		}



		this.saveCharacteristicQuantification = function(parentArray,parentObject, itself, Entitytype,jsonInner){
		

			var parentHolder = [];
			var prntObject = null;

			parentHolder = JSON.parse(JSON.stringify(parentArray));
			
			let CharacteristicQuantifications = itself.value;
			let i =0;
			let arraySize = -1;
			let arrayCheck = false;
			let instanceObject = null;

			if (Array.isArray(CharacteristicQuantifications)){
				arraySize = CharacteristicQuantifications.length;
				arrayCheck = true;
			}else{
				arraySize = 1;
			}

			jsonInner.characteristicQuantificationCollection = [];
			var jsoncharacteristicQuantification = {};

			for (i = 0 ; i < arraySize ; i++){

								if (arrayCheck === true){
									instanceObject = CharacteristicQuantifications[i];
								}else{
									instanceObject = CharacteristicQuantifications;
								}

								let prntObject = {
									type  : "CharacteristicQuantification",
									value : instanceObject
								}
								
							

								
								for (var key in instanceObject) {

									if (typeof instanceObject[key] === "object"){
									parentHolder.push(prntObject);
									
										let subObject = {
											type  : key,
											value : instanceObject[key]
										}
										

										//console.log("@@@@@@@@ car quant : "+key);
										
										//parentHolder -> each component creates it's own copy of the array and passes to the next object
										//componentOpject is the parent object for the callee
										//is the callee object
										//Entitytype should be null from this point 
										self["save"+key](parentHolder,prntObject,subObject, Entitytype,jsoncharacteristicQuantification);
										if (Object.keys(jsoncharacteristicQuantification).length>0)
										jsonInner.characteristicQuantificationCollection.push(jsoncharacteristicQuantification);
									}
								}
			}
			

			
		}

		this.saveImagingObservation = function( parentArray,parentObject, itself, Entitytype,jsonInner){
			
	
			jsonInner.imagingObservationEntityCollection=[];
			let jsonImagingObservationEntity = {};
			self["saveImagingObservationCharacteristic"](parentArray,parentObject,itself.value["ImagingObservationCharacteristic"],Entitytype,jsonImagingObservationEntity);

			if (Object.keys(jsonImagingObservationEntity).length>0){
				//console.log("--------uniqie identifier :"+JSON.stringify(jsonImagingObservationEntity));
				jsonInner.imagingObservationEntityCollection.push(jsonImagingObservationEntity);
				//console.log("_______________img ob ent save "+JSON.stringify(jsonImagingObservationEntity));
			}

		}

		this.saveImagingObservationCharacteristic = function( parentArray,parentObject, itself, Entitytype,jsonInner){
			
			let parentHolder = [];
			let prntObject = null;
			let ImagingObservationCharacteristics = itself;
			let arraySize = -1;
			let arrayCheck = false;
			let instanceObject = null;
			if (Array.isArray(ImagingObservationCharacteristics)){
				arraySize = ImagingObservationCharacteristics.length;
				arrayCheck = true;
			}else{
				arraySize = 1;
			}
			
			jsonInner.imagingObservationCharacteristicCollection = [];
			var i = 0;
			for (i = 0 ; i < arraySize ; i++){
				
								if (arrayCheck === true){
									instanceObject = ImagingObservationCharacteristics[i];
								}else{
									instanceObject = ImagingObservationCharacteristics;
								}

								let prntObject = {
									type  : "ImagingObservationCharacteristic",
									value : instanceObject
								}

								let commentvalue = "";
								if (instanceObject.hasOwnProperty("commentSelect")){
									commentvalue =  instanceObject.commentSelect;
									//console.log("commment on save "+JSON.stringify(instanceObject));
									

								}
								for (var key in instanceObject) {
										if (key != "QuestionType"){

												if (typeof instanceObject[key] === "object"){
													
												parentHolder.push(prntObject);
												
													let subObject = {
														type  : key,
														value : instanceObject[key]
													}

													let jsonAllowedTerms = {};
													self["save"+key](parentHolder,prntObject,subObject, Entitytype, jsonAllowedTerms);
													if (Object.keys(jsonAllowedTerms.allowedterms).length>0){
														for (let k = 0; k<jsonAllowedTerms.allowedterms.length; k++){
															jsonInner.imagingObservationCharacteristicCollection.push(jsonAllowedTerms.allowedterms[k]);
														}
													}
													
																
												}
										}
								}
								if (commentvalue !==""){
									let lastImObCharColl = jsonInner.imagingObservationCharacteristicCollection[jsonInner.imagingObservationCharacteristicCollection.length-1];
									lastImObCharColl['comment'] = {"value" : commentvalue};
									commentvalue = "";
								}
								//after for loop

										
			}

		
		}


		this.saveAnatomicEntity = function(parentArray,parentObject, itself, Entitytype,jsonInner){


			jsonInner.imagingPhysicalEntityCollection=[];
			let jsonImagingPhysicalEntity = {};
			self["saveAnatomicEntityCharacteristic"](parentArray,parentObject,itself.value["AnatomicEntityCharacteristic"],Entitytype, jsonImagingPhysicalEntity);
			console.log("return from  a e c : "+JSON.stringify(jsonImagingPhysicalEntity));
			if (Object.keys(jsonImagingPhysicalEntity).length>0){
				jsonInner.imagingPhysicalEntityCollection.push(jsonImagingPhysicalEntity);
				//console.log("------physical entity "+JSON.stringify(jsonImagingPhysicalEntity));
			}


		}

		this.saveAnatomicEntityCharacteristic = function( parentArray,parentObject, itself, Entitytype,jsonInner){
		
			let parentHolder = [];
			let prntObject = null;
			parentHolder = JSON.parse(JSON.stringify(parentArray));
			
			let AnatomicEntityCharacteristics = itself;
			let i =0;
			let arraySize = -1;
			let arrayCheck = false;
			let instanceObject = null;
			if (Array.isArray(AnatomicEntityCharacteristics)){
				arraySize = AnatomicEntityCharacteristics.length;
				arrayCheck = true;
			}else{
				arraySize = 1;
			}


			
			jsonInner.imagingPhysicalEntityCharacteristicCollection = [];
			for (i = 0 ; i < arraySize ; i++){
								let jsonAllowedTerms = {};

								if (arrayCheck === true){
									 instanceObject = AnatomicEntityCharacteristics[i];
								}else{
									 instanceObject = AnatomicEntityCharacteristics;
								}

								let prntObject = {
									type  : "AnatomicEntityCharacteristic",
									value : instanceObject
								}								

								let commentvalue = "";

								if (instanceObject.hasOwnProperty("commentSelect")){
									commentvalue =  instanceObject.commentSelect;
									//console.log("commment on save "+JSON.stringify(instanceObject));
									

								}
								for (var key in instanceObject) {

									if (typeof instanceObject[key] === "object"){
										if (key != "QuestionType"){

											alert(key);
												let subObject = {
													type  : key,
													value : instanceObject[key]
												}
												
												
											
												self["save"+key](parentHolder,prntObject,subObject, Entitytype,jsonAllowedTerms);
												console.log("a e c + AllowedTerms"+JSON.stringify(jsonAllowedTerms));
												if (Object.keys(jsonAllowedTerms.allowedterms).length>0){
														//for (let k = 0; k<jsonAllowedTerms.allowedterms.length; k++){

															jsonInner.imagingPhysicalEntityCharacteristicCollection.push(jsonAllowedTerms);
														//}
												}
	
													
										}
									}
								}
								if (commentvalue !==""){
									var lastPhyObCharColl = jsonInner.imagingPhysicalEntityCharacteristicCollection[jsonInner.imagingPhysicalEntityCharacteristicCollection.length-1];
									lastPhyObCharColl['comment'] = {"value" : commentvalue};
									commentvalue = "";
								}
	
			}			
			
		}


		this.saveAllowedTerm = function( parentArray,parentObject, itself, Entitytype , jsonInner){
			
			
			let parentHolder = [];
			parentHolder = JSON.parse(JSON.stringify(parentArray));
			
			var AllowedTerms = itself.value;
			let i =0;
			let arraySizeforAllowedTerms = -1;
			let arrayCheckForAllowedTerms = false;
			let objectFromDirectComponent = "";
			let instanceAllowedTerms = null;

			if (Array.isArray(AllowedTerms)){
				arraySizeforAllowedTerms = AllowedTerms.length;
				arrayCheckForAllowedTerms = true;
			}else{
				arraySizeforAllowedTerms = 1;
			}


			if (parentObject.type == "Component"){
				
				if (parentObject.value.hasOwnProperty("ImagingObservation")){
					
					objectFromDirectComponent = "ImagingObservationEntity";
				
				}
				if (parentObject.value.hasOwnProperty("AnatomicEntity")){
					
					objectFromDirectComponent = "ImagingPhysicalEntity";
					
				}
				
			}
			

			let jsonAllowedTerms = [];

			let xmlDecideCategory = "";
			for (i = 0 ; i < arraySizeforAllowedTerms ; i++){
				//xmlInner = "";

				
								if (arrayCheckForAllowedTerms == true){
									 instanceAllowedTerms = AllowedTerms[i];
								}else{
									 instanceAllowedTerms = AllowedTerms;
								}

								let prntObject = {
									type  : "AllowedTerm",
									value : instanceAllowedTerms
								}
								
								if (instanceAllowedTerms.hasOwnProperty("select")){
									if (instanceAllowedTerms.select == "1"){
										
										alert(parentObject.type);
										let jsonAllowedTerm = {
											"typeCode": {
											"code": instanceAllowedTerms.codeValue,
											"codeSystemName" : instanceAllowedTerms.codingSchemeDesignator ,
											"codeSystemVersion" : instanceAllowedTerms.codingSchemeVersion, 
											"iso:displayName" : {
												"value" : instanceAllowedTerms.codeMeaning,
												"xmlns:iso": "uri:iso.org:21090"
												}
											},
											"annotatorConfidence" :{
												"value" : parentObject.value.selectac
											},
											"label":{
												"value" : parentObject.value.label
											}

										};


										
										
										for (var key in instanceAllowedTerms) {

											if (typeof instanceAllowedTerms[key] == "object"){
											parentHolder.push(prntObject);
											
												var subObject = {
													type  : key,
													value : instanceAllowedTerms[key]
												}
												
												
												
												
												//parentHolder -> each component creates it's own copy of the array and passes to the next object
												//componentOpject is the parent object for the callee
												//is the callee object
												//Entitytype should be null from this point 
										
													self["save"+key](parentHolder,prntObject,subObject, Entitytype ,jsonAllowedTerm);

											}
										}
										jsonAllowedTerms.push( jsonAllowedTerm);
										if (parentObject.type === "Component"){
											jsonInner.allowedterms = jsonAllowedTerms;
										}else{
											jsonInner[parentObject.type] = jsonAllowedTerms;
										}
									}
								
								}
			}
			
			
			
		}


		this.saveValidTerm = function(parentArray,parentObject, itself, Entitytype, jsonInner){
			
			
		
			let parentHolder = [];
			let prntObject = null;

			let ValidTerms = itself.value;
			let defaultCodeValue = "";
			let defaultCodingSchemeDesignator = "";
			let defaultCodingSchemeVersion = "";
			let defaultCodeMeaning = "";
			let arraySize = -1;
			let arrayCheck = false;
			let instanceObject =null;
			if (Array.isArray(ValidTerms)){
				arraySize = ValidTerms.length;
				arrayCheck = true;
			}else{
				arraySize = 1;
			}


			let i =0;
			
			let tempTypecode = jsonInner.typeCode;
			jsonInner.typeCode = [];
			jsonInner.typeCode.push(tempTypecode);
			
			for (i = 0 ; i < arraySize ; i++){
				
								if (arrayCheck == true){
									 instanceObject = ValidTerms[i];
								}else{
									 instanceObject = ValidTerms;
								}
								
								let prntObject = {
									type  : "ValidTerm",
									value : instanceObject
								}
								if ( (i == 0)  && (arraySize == 1)){
									
									defaultCodeValue = instanceObject.codeValue;
									defaultCodingSchemeDesignator = instanceObject.codingSchemeDesignator;
									defaultCodingSchemeVersion = instanceObject.codingSchemeVersion;
									defaultCodeMeaning = instanceObject.codeMeaning;
									

								}else{
									if (instanceObject.hasOwnProperty("select")){
										if (instanceObject.select == "1"){

										defaultCodeValue = instanceObject.codeValue;
										defaultCodingSchemeDesignator = instanceObject.codingSchemeDesignator;
										defaultCodingSchemeVersion = instanceObject.codingSchemeVersion;
										defaultCodeMeaning = instanceObject.codeMeaning;

										}
									}
								}

								if( defaultCodeMeaning !==""){
									let jsonValidTerm = {
											
												"code": defaultCodeMeaning,
												"codeSystemName" : defaultCodingSchemeDesignator,
												"codeSystemVersion" : defaultCodingSchemeVersion, 
												"iso:displayName" : {
													"value" : defaultCodeMeaning,
													"xmlns:iso": "uri:iso.org:21090"
												}
												

									};		
									jsonInner.typeCode.push(jsonValidTerm);
									defaultCodeMeaning = "";
								}


			}

			
		
		}
		
		this.traverseComponentsToSave = function(o,jsonComponents) {
			
			
			let validTagListToCheck = ["QuestionType","AnatomicEntity","AllowedTerm"];
			let parentHolder = [];
			let Template = o["Template"];
			let Components = Template["Component"];
			let arraySizeforComponents = 0;
			let arrayCheckForComponents = false;
			let jsonParent = {innerjsons:[]};
			let jsonInner = {};
			let instanceComponent;
			if (Array.isArray(Components)){
				arraySizeforComponents = Components.length;
				arrayCheckForComponents = true;
				
			}else{
				arraySizeforComponents = 1;
			}
						let i =0;
					

						for (i = 0 ; i < arraySizeforComponents ; i++){
							jsonInner = {};
							if (arrayCheckForComponents === true)
								instanceComponent = Components[i];
							else
								instanceComponent = Components;
								
								let componentObject = {
									type  : "Component",
									value : instanceComponent
								}
								parentHolder = [];
								parentHolder.push(instanceComponent);
								
								let Entitytype = null;
								if (instanceComponent.hasOwnProperty("ImagingObservation")){
									Entitytype = "ImagingObservation";
									
								}
								if (instanceComponent.hasOwnProperty("AnatomicEntity")){
									
									Entitytype = "AnatomicEntity";

								}
	
							//changin key order to capture Allowed terms first	
							let keyorder = Object.keys(instanceComponent);
							let fix =-1;
							let z = 0;
							for (z = 0 ; z< keyorder.length ; z++){
								if (keyorder[z] === "AllowedTerm"){
									fix = z;
									break;
								}
							}

							keyorder[fix] = keyorder[0];
							keyorder[0] = "AllowedTerm";
							
							let counter = 0;		

								for (counter  ; counter < keyorder.length ; counter++) {
							
										if (typeof(instanceComponent[keyorder[counter]])=="object"){
												
											let subObject = {
												type  : keyorder[counter],
												value : instanceComponent[keyorder[counter]]
											}		
													
										//parentHolder -> each component creates it's own copy of the array and passes to the next object
										//componentOpject is the parent object for the callee
										//is the callee object
										//Entitytype is used if the allowed term is connected directly to the component to define image or physical entity etc..
										
											try {

											    self["save"+keyorder[counter]](parentHolder,componentObject,subObject, Entitytype ,jsonInner);
											    
											}
											catch(err) {
											    //Block of code to handle errors
											} 											

										
										
									}
									  
								}
								//if (Object.keys(jsonInner).length>0){
								//				jsonParent.innerjsons.push(jsonInner);
								//				jsonInner = {};
								//}
								console.log("____each comp json:"+JSON.stringify(jsonInner));

						}


 						jsonComponents.innerjsons = jsonParent.innerjsons;

 						//console.log("beforechanging afer json:");
		
		}

	
		this.saveAim = function(){

			//console.log("____________save aim : self.jsonTemplateCopy"+JSON.stringify(self.jsonTemplateCopy));
			var jsonComponents = {};
			var finaljson = [];
			var mainHolder = [];

			self.traverseComponentsToSave(self.jsonTemplateCopy,jsonComponents);
			//console.log("____________save aim jsonComponents :"+JSON.stringify(jsonComponents));
			
			/* rules : if there are more than 1 allowed terms directly connected to the components one of them goes under characteristic quantification, the rest goes as 
				entity elements.
			*/
			var innerJsonCount = jsonComponents.innerjsons.length;
			var nextComptype = "";
			var nextInnerCompCount = -1;
			var index = 0 ;
			var mergeJson = [];
			
			finaljson.push({ name :{value:self.aimName}});
			finaljson.push({ comment :{value:self.aimComment}});
			finaljson.push({ modlity :{value:self.aimType}});

				for ( index = 0 ; index <innerJsonCount; index++ ){
					var eachInnerJson = jsonComponents.innerjsons[index];
					var keys = Object.keys(eachInnerJson);
						if (keys.length >= 2){
							//findout next component
							switch(keys[1]) {
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

							if (directATlength > 0){
								if (directATlength >= 1){

									//add allowed terms to the next component
									if (eachInnerJson[ nextComptype ].length>0){
										var n ;
										for (n = 0 ; n <directATlength ; n++){
											//directATlength-1 means last allowed term will be added inner component ex:characteristics
													
												
													
													if (n <directATlength-1){
														eachInnerJson[ nextComptype].push(eachInnerJson[ "allowedterms" ][n]);
													}else{
															var innerkeys = Object.keys(eachInnerJson[ nextComptype ][0]);
															
															if (innerkeys.length == 0){
																
															}else{
																if ((innerkeys[0] == "ImagingPhysicalEntityCharacteristicCollection") || ("imagingObservationCharacteristicCollection") ){
																	var tempMergeJsons ={};
																	tempMergeJsons = eachInnerJson[ nextComptype ][0];
																	Object.assign(tempMergeJsons,eachInnerJson[ "allowedterms" ][directATlength-1]);
																}else{
																	eachInnerJson[ nextComptype].push(eachInnerJson[ "allowedterms" ][directATlength-1]);
																}
															}
													}

										}
										delete eachInnerJson[ "allowedterms" ];
										nextInnerCompCount = 1;
									}else{
										
									}


								}else{

								}
								if (nextInnerCompCount == -1){

									eachInnerJson[ nextComptype] = eachInnerJson[ "allowedterms" ];
									delete eachInnerJson[ "allowedterms" ];
								}
							}else{
								keys.forEach(function(eachkey){
									
  									if (eachInnerJson[eachkey].length == 0){
										delete eachInnerJson[eachkey];
									}
								});
							}

						}else{

						}
						var eachImOB ="";
						var eachImPhy ="";
						if (eachInnerJson.hasOwnProperty("imagingObservationEntityCollection")){
							eachImOB = eachInnerJson['imagingObservationEntityCollection'];
							
						}
						if (eachInnerJson.hasOwnProperty("imagingPhysicalEntityCollection")){
							
							eachImPhy = eachInnerJson['imagingPhysicalEntityCollection'];
						}
						
						if (finaljson.length > 3){
							
							
							for (var k =3 ; k< finaljson.length; k++){
								
								
									if (finaljson[k].hasOwnProperty("imagingPhysicalEntityCollection")){
										
										if (eachImPhy != ""){
											var mergeJson={};
											mergeJson = finaljson[k]['imagingPhysicalEntityCollection'].concat(eachImPhy);
											finaljson[k]['imagingPhysicalEntityCollection'] = mergeJson;
											eachImPhy ="";
										}

									}else{
										//var temp 
										if (eachImPhy != ""){
											finaljson.push({imagingPhysicalEntityCollection: eachInnerJson['imagingPhysicalEntityCollection']});
											eachImPhy ="";
										}
										
									}
									if (finaljson[k].hasOwnProperty("imagingObservationEntityCollection")){
										if (eachImOB != ""){
											var mergeJson={};
											mergeJson = finaljson[k]['imagingObservationEntityCollection'].concat(eachImOB);
											finaljson[k]['imagingObservationEntityCollection'] = mergeJson;
											eachImOB ="";
										}
									}else{
										if (eachImOB != ""){
											finaljson.push({imagingObservationEntityCollection:eachInnerJson['imagingObservationEntityCollection']});
											eachImOB ="";
										}
									}
									
							}
							
						}else{
							if (eachImOB != ""){
								finaljson.push({imagingObservationEntityCollection: eachInnerJson['imagingObservationEntityCollection']});
								eachImOB ="";
							}
							if (eachImPhy != ""){
								finaljson.push({imagingPhysicalEntityCollection:eachInnerJson['imagingPhysicalEntityCollection']});
								eachImPhy ="";
							}
						}
				}

			
			self.addUid(finaljson);
			return finaljson;
			
		}
		this.addButtonsDiv = function(divforbuttons){

			self.divHolderForButtons = divforbuttons;


		}
		this.addButtons = function(parentDiv){
			
			let saveButton =  document.createElement('Button');
			let saveButtonText = document.createTextNode("save");      
			saveButton.appendChild(saveButtonText);  
			saveButton.onclick = function(){
				
				var savedAimJson = self.saveAim();
				//console.log("  Returning json  :"+(JSON.stringify(savedAimJson)));
			}
			let loadButton =  document.createElement('Button');
			let loadButtonText = document.createTextNode("load");   
			loadButton.appendChild(loadButtonText); 
			loadButton.onclick = function(){
				/*presaved aims variables
					recistSavedAim
					aimjsonBeauLieuBoneTemplate_rev18
				*/
				self.loadAimJson(recistSavedAim);

			}
			
			parentDiv.appendChild(saveButton);
			parentDiv.appendChild(loadButton);
			
			if (self.divHolderForButtons != null)
				parentDiv.appendChild(self.divHolderForButtons);

		};

		this.turnAllRedtoGreencheck = function(){
			
			var objs = document.getElementsByTagName("i");
			
				for (var i = 0 ; i < objs.length ; i++) {
					
					if (objs[i].className == "red check circle outline icon")
					objs[i].className = "green check circle outline icon"

				}

		}
		this.checkFormSaveReady = function(){
			var countRedCircle = 0;
			var objs = document.getElementsByTagName("i");
			
				for (var i = 0 ; i < objs.length ; i++) {
					
					if (objs[i].className == "red check circle outline icon")
					countRedCircle++;

				}
				return countRedCircle;
		}

		this.setAim = function(aimValue){
			self.textXml = aimValue;
		}

		this.checkIfCommentRequired = function(object,parentDiv){
			if (object.hasOwnProperty("requireComment"))	{
				if (object.requireComment == "true"){
					let annoCommentDomid = (object.label).replace(/[`~!@# $%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, '');
					 self.mapLabelSubComment.set(annoCommentDomid,annoCommentDomid);
					 self.mapLabelCommentJson.set(annoCommentDomid,object);//changing
					//console.log("comment true"+object.label);
				
					var req=document.createElement('div');
					var label=document.createElement('label');
					label.textContent = "component comment";

					//console.log("coment for subs"+JSON.stringify(object));
					let textaDomObject = document.createElement("textarea");
					textaDomObject.id='comment'+object.label;
					textaDomObject.onkeyup = function(){
						alert('c');
						object.commentSelect = this.value;
						
					}
					
					
					req.appendChild(textaDomObject);
					parentDiv.appendChild(req);
					req.className='requiredcomment';


				}

			}	
		}

	this.traverseJsonOnLoad = function(jsonObj) {

		    if( jsonObj !== null && typeof jsonObj == "object" ) {
		        Object.entries(jsonObj).forEach(([key, value]) => {
		        	
		        	if (key === "CharacteristicQuantification"){

						
							$('#Select'+value.label.value).dropdown('set selected',[value.valueLabel.value]);

		        	}
		            if (key === "typeCode"){
		            	

		            			
								var docElement = document.getElementById(value.code);
								
								if (docElement != null){
									var parentDiv = docElement.parentNode;

									if (typeof parentDiv[0] != "undefined"){
										

										var crop = parentDiv[0].name;
										crop = (crop).replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>/ /\{\}\[\]\\\/]/gi, '');

										var prDiv = document.getElementById("Drop"+crop);
										var subDivs = prDiv.getElementsByTagName("div");

										var splittedLabel = docElement.label.split("-");
										$(subDivs[0]).addClass("disabled");
										$(subDivs[0]).dropdown('set selected',[splittedLabel[1]]);
										$(subDivs[0]).removeClass("disabled");
										

										
									}else{
										if (docElement.checked != true){
											docElement.click();
											//docElement.checked = true;
										}
							

									}
								}


		            
		            	
		        	}
		        	if (key === "annotatorConfidence"){
		        		if (jsonObj.hasOwnProperty("label"))	{
		        				
		        					let annotatorConflabel = (jsonObj['label']['value']).replace(/[`~!@# $%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, '');
				        			let returnAnnotConfDomId = self.mapLabelAnnotatorConfidence.get(annotatorConflabel);

					        		if (typeof returnAnnotConfDomId != "undefined"){
					        			//console.log("Annotator condifidence section:"+annotatorConflabel);
		        						//console.log("Annotator condifidence value:"+jsonObj['annotatorConfidence']['value']);
					        			let showannoConfDomid ="range"+annotatorConflabel;
					        			document.getElementById(returnAnnotConfDomId).value= value.value*100;
					        			document.getElementById(showannoConfDomid).value= value.value*100;
					        			let annotconfJson = self.mapLabelAnnotConfJson.get(annotatorConflabel);
					        			annotconfJson.selectac = value.value ;
				        			}
				        		
				        		

			        	}

		        	}
		        	if (key === "comment"){
		        		if (jsonObj.hasOwnProperty("label"))	{

		        			let commentLabel = (jsonObj['label']['value']).replace(/[`~!@# $%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, '');
		        			let returnCommentLabel = self.mapLabelSubComment.get(commentLabel);
		        			if (typeof returnCommentLabel != "undefined"){
		        				let commentJson = self.mapLabelCommentJson.get(commentLabel);
		        				document.getElementById("comment"+jsonObj['label']['value']).value = value.value;
		        				commentJson.commentSelect = value.value;
		        			}
		        		
		        		}
		        	}

		        	if (key === "uniqueIdentifier"){
		        		//alert("uid"+jsonObj['label']['value']);
		        		//alert(jsonObj['typeCode']['code']);
		        		let uid = value.root;
		        		let code = jsonObj['typeCode']['code'];
		        		let label = jsonObj['label']['value'];
		        		let commentLabel = (label).replace(/[`~!@# $%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, '');
		        		self.mapLabelUid.set(code,{"uid" :uid , "label":label });
		        		
		        	}

		        	self.traverseJsonOnLoad(value);
		        });
		    }
		    else {
		        
		    }

	}

this.loadAimJson = function (aimjson) {
      console.log("____________load aim json :"+JSON.stringify(aimjson));
      

               /*var ImageAnnotation = aimjson.imageAnnotations.ImageAnnotationCollection.imageAnnotations.ImageAnnotation;
                  rectified for json aim 
               */
               var ImageAnnotation = aimjson.imageAnnotations.ImageAnnotation;
               let templatecodeMeaning = ImageAnnotation.typeCode["iso:displayName"].value;
               console.log("templatecodeMeaning : "+templatecodeMeaning);
               let found = -1;
               
               for (let k = 0 ; k<templateArray.length ;k++){
                 
                     if (templateArray[k]["key"] === templatecodeMeaning ){
                        found = k;

                        break;
                     }

               }
                
               if (found >-1){
                  document.getElementById("S1").selectedIndex =  found + 1;
                  $('#S1').trigger("change");
                  
                  var imagingObservationEntityCollection = ImageAnnotation.imagingObservationEntityCollection;
                  var imagingPhysicalEntityCollection = ImageAnnotation.imagingPhysicalEntityCollection
                  /*
                  var comment = aimjson.imageAnnotations.ImageAnnotationCollection.imageAnnotations.ImageAnnotation.comment.value;
                  var annotationName = aimjson.imageAnnotations.ImageAnnotationCollection.imageAnnotations.ImageAnnotation.name.value;
                     rectified for json aim
                  */
                  var comment = aimjson.imageAnnotations.ImageAnnotation.comment.value;
                  var annotationName = aimjson.imageAnnotations.ImageAnnotation.name.value;
                  
                  

                  var commentArray = comment.split("~~");
                  document.getElementById("comment").value = comment;
                  self.aimComment = commentArray[1];

                  var annotationNameArray = annotationName.split("~");
                  document.getElementById("annotationName").value = annotationName;
                  self.aimName = annotationNameArray[0];

                  var modality = commentArray[0].split("/");
                  self.aimType = modality[0];


                  self.traverseJsonOnLoad(imagingPhysicalEntityCollection);
                  self.traverseJsonOnLoad(imagingObservationEntityCollection);
                  console.log(" found");
                  found = -1;
                  aimjson = null;
                  return 0 ;
               }else{
                  console.log("not found");
                  return 1;
               }
               //self.printMap(self.mapLabelAnnotatorConfidence);
               //self.printMap(self.mapLabelAnnotConfJson);
               //self.printMap(self.mapLabelCommentJson);

   }

	this.addUid = function(jsonobj){
		let objcounter = 3;
		let jsonlength = jsonobj.length;
		if (jsonlength >= 3){
			for (objcounter ; objcounter< jsonlength ; objcounter++){
				//console.log("xx___add uid :"+JSON.stringify(jsonobj[objcounter]));
				for (var key in jsonobj[objcounter]) {
	  					let innerjsonlength = jsonobj[objcounter][key].length;
	  					if (innerjsonlength > 0){
	  						let inobjcounter = 0;
	  						for (inobjcounter ; inobjcounter< innerjsonlength ; inobjcounter++){
	  							if ( (jsonobj[objcounter][key][inobjcounter].hasOwnProperty("label")) ){
	  								
	  									//alert(jsonobj[objcounter][key][inobjcounter]['typeCode']['code']);
	  									
	  									
		        						let valueJson = self.mapLabelUid.get(jsonobj[objcounter][key][inobjcounter]['typeCode']['code']);
		        						if ( (typeof valueJson !== "undefined") ){
		        							jsonobj[objcounter][key][inobjcounter].uniqueIdentifier = {"root": valueJson.uid};
		        						}else{
		        							jsonobj[objcounter][key][inobjcounter].uniqueIdentifier = {"root": uid()};
		        						}
	  									
	  								
	  							}	
	  						}
	  					}
	   					
				}
			}
		}

	}



	this.printMap = function(varmap){
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
 
//export next variable for react
export  var TempBeaulieuBoneTemplaterev18 = {
   "authors": "Default User",
   "creationDate": "2013-08-15",
   "description": "Current liver template",
   "name": "Active Liver Template",
   "uid": "2.25.262327926267685184074584276827607514851",
   "version": "Active Liver 16",
   "schemaLocation": "gme://caCORE.caCORE/3.2/edu.northwestern.radiology.AIMTemplate AIMTemplate_v2rv13.xsd",
   "Template": {
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
            "groupLabel": "",
            "id": "2.25.1800391920089.536979722668.204033480007",
            "itemNumber": "1",
            "label": "Lobar Location",
            "maxCardinality": "1",
            "minCardinality": "1",
            "shouldDisplay": "true",
            "AnatomicEntity": {
               "annotatorConfidence": "false"
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
            "groupLabel": "",
            "id": "2.25.1800391920324.536979722903.204033480052",
            "itemNumber": "2",
            "label": "Segmental Location",
            "maxCardinality": "2",
            "minCardinality": "1",
            "shouldDisplay": "true",
            "AnatomicEntity": {
               "annotatorConfidence": "false"
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
            "groupLabel": "",
            "id": "2.25.1800391920560.536979723139.204033480097",
            "itemNumber": "3",
            "label": "Lesion Type",
            "maxCardinality": "1",
            "minCardinality": "1",
            "shouldDisplay": "true",
            "ImagingObservation": {
               "annotatorConfidence": "false",
               "ImagingObservationCharacteristic": [
                  {
                     "annotatorConfidence": "false",
                     "authors": "cfbeaulieu",
                     "explanatoryText": "What is the etiology of the lesion or its presumed etiology?",
                     "groupLabel": "",
                     "id": "2.25.1800391920798.536979723377.204033480142",
                     "itemNumber": "0",
                     "label": "Diagnosis",
                     "maxCardinality": "1",
                     "minCardinality": "1",
                     "shouldDisplay": "true",
                     "requireComment" : "true",
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
                           "codingSchemeDesignator": "ISIS_LIVER",
                           "codingSchemeVersion": ""
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
                     "annotatorConfidence": "false",
                     "authors": "cfbeaulieu",
                     "explanatoryText": "What is the phase of intravenous contrast enhancement, or is it a noncontrast scan?",
                     "groupLabel": "",
                     "id": "2.25.1800391921038.536979723617.204033480187",
                     "itemNumber": "1",
                     "label": "Imaging Phase",
                     "maxCardinality": "1",
                     "minCardinality": "1",
                     "shouldDisplay": "true",
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
                     "annotatorConfidence": "false",
                     "authors": "cfbeaulieu",
                     "explanatoryText": "How many lesions with a given diagnosis? Are there also more complex distribution patterns?  Up to 2 responses.",
                     "groupLabel": "",
                     "id": "2.25.1800391921279.536979723858.204033480232",
                     "itemNumber": "2",
                     "label": "Focality of Lesion",
                     "maxCardinality": "2",
                     "minCardinality": "1",
                     "shouldDisplay": "true",
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
                     "annotatorConfidence": "false",
                     "authors": "cfbeaulieu",
                     "explanatoryText": "What is the overall shape or shapes associated with the lesion?  Up to 3 responses.",
                     "groupLabel": "",
                     "id": "2.25.1800391921521.536979724100.204033480277",
                     "itemNumber": "3",
                     "label": "Shape Descriptors",
                     "maxCardinality": "3",
                     "minCardinality": "1",
                     "shouldDisplay": "true",
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
                     "annotatorConfidence": "true",
                     "authors": "cfbeaulieu",
                     "explanatoryText": "How smooth or irregular is the outer lesion contour or boundary?  Do not confuse with border *defnition*.  Quantify from smooth (1) to irregular (100)",
                     "groupLabel": "",
                     "id": "2.25.1800391922007.536979724586.204033480367",
                     "itemNumber": "5",
                     "label": "Margin Contours: Smooth to Irregular",
                     "maxCardinality": "1",
                     "minCardinality": "1",
                     "shouldDisplay": "true",
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
                     "annotatorConfidence": "false",
                     "authors": "cfbeaulieu",
                     "explanatoryText": "Estimate the overall lesion density given all internal components.  For the current imaging phase only.",
                     "groupLabel": "",
                     "id": "2.25.1800391922251.536979724830.204033480412",
                     "itemNumber": "6",
                     "label": "Average Lesion Density: Hypo to Hyperdense",
                     "maxCardinality": "1",
                     "minCardinality": "1",
                     "shouldDisplay": "true",
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
                     "annotatorConfidence": "false",
                     "authors": "cfbeaulieu",
                     "explanatoryText": "Is the lesion uniform (homogeneous) or nonuniform (heterogeneous) internally?",
                     "groupLabel": "",
                     "id": "2.25.1800391922496.536979725075.204033480457",
                     "itemNumber": "7",
                     "label": "Density - Homogeneous or Heterogeneous",
                     "maxCardinality": "1",
                     "minCardinality": "1",
                     "shouldDisplay": "true",
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
                     "annotatorConfidence": "false",
                     "authors": "cfbeaulieu",
                     "explanatoryText": "Does the lesion enhance with intravenous contrast?",
                     "groupLabel": "",
                     "id": "2.25.1800391922742.536979725321.204033480502",
                     "itemNumber": "8",
                     "label": "Enhancement",
                     "maxCardinality": "1",
                     "minCardinality": "1",
                     "shouldDisplay": "true",
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
                     "annotatorConfidence": "false",
                     "authors": "cfbeaulieu",
                     "explanatoryText": "Only if enhancing, is the enhancement homogeneous or heterogeneous?",
                     "groupLabel": "",
                     "id": "2.25.1800391922988.536979725567.204033480547",
                     "itemNumber": "9",
                     "label": "Enhancement Uniformity",
                     "maxCardinality": "2",
                     "minCardinality": "0",
                     "shouldDisplay": "true",
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
                     "annotatorConfidence": "false",
                     "authors": "cfbeaulieu",
                     "explanatoryText": "If enhancing, what pattern(s) are observed? Choose up to 3 features.",
                     "groupLabel": "",
                     "id": "2.25.1800391923235.536979725814.204033480592",
                     "itemNumber": "10",
                     "label": "Specific Enhancement Pattern(s)",
                     "maxCardinality": "3",
                     "minCardinality": "0",
                     "shouldDisplay": "true",
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
                     "annotatorConfidence": "false",
                     "authors": "cfbeaulieu",
                     "explanatoryText": "On multiphasic imaging, what happens to enhancement over time?",
                     "groupLabel": "",
                     "id": "2.25.1800391923732.536979726311.204033480682",
                     "itemNumber": "11",
                     "label": "Temporal Enhancement (if known)",
                     "maxCardinality": "1",
                     "minCardinality": "0",
                     "shouldDisplay": "true",
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
                     "annotatorConfidence": "false",
                     "authors": "cfbeaulieu",
                     "explanatoryText": "If septations are present, how thick are they?  Note \"septated\" may be included as a Shape Descriptor above.",
                     "groupLabel": "",
                     "id": "2.25.1800391923483.536979726062.204033480637",
                     "itemNumber": "12",
                     "label": "Septation Thickness",
                     "maxCardinality": "1",
                     "minCardinality": "0",
                     "shouldDisplay": "true",
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
                     "annotatorConfidence": "false",
                     "authors": "cfbeaulieu",
                     "explanatoryText": "Is the perilesional tissue normal, or is there a THAD or similar effect?",
                     "groupLabel": "",
                     "id": "2.25.1800391923982.536979726561.204033480727",
                     "itemNumber": "13",
                     "label": "Perilesional Tissue",
                     "maxCardinality": "1",
                     "minCardinality": "1",
                     "shouldDisplay": "true",
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
                     "annotatorConfidence": "false",
                     "authors": "cfbeaulieu",
                     "explanatoryText": "Is there calcification, necrosis, central scar or other special feature(s)?  Up to 3 responses.",
                     "groupLabel": "",
                     "id": "2.25.1800391924232.536979726811.204033480772",
                     "itemNumber": "14",
                     "label": "Special Features",
                     "maxCardinality": "3",
                     "minCardinality": "0",
                     "shouldDisplay": "true",
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
                     "annotatorConfidence": "false",
                     "authors": "cfbeaulieu",
                     "explanatoryText": "Choose up to 3 additional features about how the lesion affects the liver.",
                     "groupLabel": "",
                     "id": "2.25.1800391924483.536979727062.204033480817",
                     "itemNumber": "15",
                     "label": "Lesion Effects on Liver",
                     "maxCardinality": "3",
                     "minCardinality": "0",
                     "shouldDisplay": "true",
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
                     "annotatorConfidence": "false",
                     "authors": "cfbeaulieu",
                     "explanatoryText": "For lesions that are metastases, what is the primary?",
                     "groupLabel": "",
                     "id": "2.25.1800391924735.536979727314.204033480862",
                     "itemNumber": "16",
                     "label": "Primary Malignancy if Metastatic Disease",
                     "maxCardinality": "1",
                     "minCardinality": "1",
                     "shouldDisplay": "true",
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
            "AllowedTerm": {
               "codeMeaning": "liver mass",
               "codeValue": "RID39466",
               "codingSchemeDesignator": "RadLex",
               "codingSchemeVersion": "1.0"
            }
         },
         {
            "authors": "Default User",
            "explanatoryText": "",
            "groupLabel": "",
            "id": "2.25.260407454693500192885566124937158854189",
            "itemNumber": "3",
            "label": "Spline ROI",
            "maxCardinality": "1",
            "minCardinality": "1",
            "shouldDisplay": "true",
            "GeometricShape": "Point"
         }
      ]
   }
}

//export next variable for react
export	var TempAsdf= {	
   "uid": "2.25.75761204952962875896072870850622745228",
   "name": "adsdf",
   "authors": "AIM Team",
   "version": "asdfadsf",
   "creationDate": "2012-12-28",
   "description": "asdfsadfasd",
   "schemaLocation": "gme://caCORE.caCORE/3.2/edu.northwestern.radiology.AIMTemplate AIMTemplate_v2rv13.xsd",
   "Template": {
      "uid": "2.25.246328047169208880141674055331849154527",
      "name": "TEST 3",
      "authors": "AIM Team",
      "version": "1.0",
      "creationDate": "2012-12-28",
      "description": "test three",
      "modality": "CT",
      "precedingAnnotation": "RequireToSelect",
      "codeMeaning": "Test 3-1",
      "codeValue": "112046",
      "codingSchemeDesignator": "DCM",
      "codingSchemeVersion": "1.0",
      "Component": [
         {
            "label": "free text",
            "itemNumber": "0",
            "authors": "AIM Team",
            "explanatoryText": "ae ONE",
            "minCardinality": "1",
            "maxCardinality": "2",
            "shouldDisplay": "true",
            "id": "2.25.249736992084416545275140963623879078777",
            "requireComment": "false",
            "textFreeInput": {
               "codeValue": "112042",
               "codeMeaning": "Target Lesion Partial Response",
               "codingSchemeDesignator": "DCM",
               "codingSchemeVersion": "1.0"
               
            }
         },
         {
            "label": "AE - 1",
            "itemNumber": "0",
            "authors": "AIM Team",
            "explanatoryText": "ae ONE",
            "minCardinality": "1",
            "maxCardinality": "2",
            "shouldDisplay": "true",
            "groupLabel": "AE",
            "id": "2.25.249736992084416545275140963623879078175",
            "requireComment": "false",
            "QuestionType": {
               "codeValue": "112042",
               "codeMeaning": "Target Lesion Partial Response",
               "codingSchemeDesignator": "DCM",
               "codingSchemeVersion": "1.0"
            },
            "AnatomicEntity": {
               "annotatorConfidence": "true",
               "AnatomicEntityCharacteristic": [
                  {
                     "label": "AEC - 1 - 1",
                     "itemNumber": "0",
                     "authors": "AIM Team",
                     "explanatoryText": "AEC one - one",
                     "minCardinality": "1",
                     "maxCardinality": "1",
                     "shouldDisplay": "true",
                     "groupLabel": "AEC - 1 - 1",
                     "id": "2.25.96983863729747964833684373111073058156",
                     "requireComment": "true",
                     "annotatorConfidence": "true",
                      "AllowedTerm": [
                        {
                           "codeValue": "RID34993",
                           "codeMeaning": "absent gastric air bubble sign",
                           "codingSchemeDesignator": "RadLex",
                           "codingSchemeVersion": "1.0",
                           "ValidTerm": {
                              "codeValue": "10055397",
                              "codeMeaning": "bone marrow edema",
                              "codingSchemeDesignator": "MedDRA",
                              "codingSchemeVersion": "1.0"
                           }
                        },
                        {
                           "codeValue": "RID34998",
                           "codeMeaning": "acute kyphosis sign",
                           "codingSchemeDesignator": "RadLex",
                           "codingSchemeVersion": "1.0"
                        },
                        {
                           "codeValue": "RID34997",
                           "codeMeaning": "acorn deformity",
                           "codingSchemeDesignator": "RadLex",
                           "codingSchemeVersion": "1.0",
                           "nextId": "2.25.144384273350738068267645406522525823311"
                        },
                        {
                           "codeValue": "RID34995",
                           "codeMeaning": "absent liver sign",
                           "codingSchemeDesignator": "RadLex",
                           "codingSchemeVersion": "1.0"
                        },
                        {
                           "codeValue": "RID34404",
                           "codeMeaning": "Mickey Mouse sign of liver",
                           "codingSchemeDesignator": "RadLex",
                           "codingSchemeVersion": "1.0",
                           "ValidTerm": {
                              "codeValue": "MTHU002077",
                              "codeMeaning": "Bone",
                              "codingSchemeDesignator": "LOINC",
                              "codingSchemeVersion": ""
                           }
                        },
                        {
                           "codeValue": "RID34409",
                           "codeMeaning": "swan neck deformity",
                           "codingSchemeDesignator": "RadLex",
                           "codingSchemeVersion": "1.0",
                           "nextId": "2.25.264945780284452461227299362245725897438"
                        },
                        {
                           "codeValue": "RID34412",
                           "codeMeaning": "Erlenmeyer flask deformity",
                           "codingSchemeDesignator": "RadLex",
                           "codingSchemeVersion": "1.0"
                        }
                     ],
                     "QuestionType": {
                        "codeValue": "RID34999",
                        "codeMeaning": "air bronchogram sign",
                        "codingSchemeDesignator": "RadLex",
                        "codingSchemeVersion": "1.0"
                     }
                  },
                  {
                     "label": "AEC - 1 - 2",
                     "itemNumber": "1",
                     "authors": "AIM Team",
                     "explanatoryText": "AEC one two",
                     "minCardinality": "1",
                     "maxCardinality": "3",
                     "shouldDisplay": "true",
                     "groupLabel": "",
                     "id": "2.25.282321381780351407137178608344539789057",
                     "requireComment": "true",
                     "annotatorConfidence": "true",
                     "AllowedTerm": [
                        {
                           "codeValue": "RID34995",
                           "codeMeaning": "absent liver sign",
                           "codingSchemeDesignator": "RadLex",
                           "codingSchemeVersion": "1.0",
                           "CharacteristicQuantification": {
                              "name": "Scale-1",
                              "annotatorConfidence": "false",
                              "characteristicQuantificationIndex": "0",
                              "Scale": {
                                 "scaleType": "Ordinal",
                                 "ScaleLevel": [
                                    {
                                       "value": "1",
                                       "valueLabel": "1",
                                       "valueDescription": "1"
                                    },
                                    {
                                       "value": "2",
                                       "valueLabel": "two",
                                       "valueDescription": "2"
                                    },
                                    {
                                       "value": "3",
                                       "valueLabel": "three",
                                       "valueDescription": "3"
                                    }
                                 ]
                              },
                              "NonQuantifiable": [
                                 {
                                    "codeValue": "R-0038D",
                                    "codeMeaning": "Yes",
                                    "codingSchemeDesignator": "SRT",
                                    "codingSchemeVersion": "1.0"
                                 },
                                 {
                                    "codeValue": "G-A540",
                                    "codeMeaning": "Complex",
                                    "codingSchemeDesignator": "SRT",
                                    "codingSchemeVersion": "1.0"
                                 },
                                 {
                                    "codeValue": "R-00339",
                                    "codeMeaning": "No",
                                    "codingSchemeDesignator": "SRT",
                                    "codingSchemeVersion": "1.0"
                                 }
                              ]
                           }
                        },
                        {
                           "codeValue": "RID34400",
                           "codeMeaning": "butterfly shadow",
                           "codingSchemeDesignator": "RadLex",
                           "codingSchemeVersion": "1.0",
                           "defaultAnswer": "true",
                           "nextId": "2.25.316621944217354986956136852674485484897",
                           "CharacteristicQuantification": {
                              "name": "scale",
                              "annotatorConfidence": "true",
                              "characteristicQuantificationIndex": "0",
                              "Scale": {
                                 "scaleType": "Nominal",
                                 "ScaleLevel": [
                                    {
                                       "value": "1",
                                       "valueLabel": "1-1",
                                       "valueDescription": "1-1-1"
                                    },
                                    {
                                       "value": "2",
                                       "valueLabel": "2-1-1",
                                       "valueDescription": "2-1-1"
                                    },
                                    {
                                       "value": "3",
                                       "valueLabel": "3-1-1",
                                       "valueDescription": "3-1-1"
                                    }
                                 ]
                              },
                              "NonQuantifiable": [
                                 {
                                    "codeValue": "R-4207A",
                                    "codeMeaning": "Extrusion",
                                    "codingSchemeDesignator": "SRT",
                                    "codingSchemeVersion": "1.0",
                                    "defaultAnswer": "true"
                                 },
                                 {
                                    "codeValue": "G-A429",
                                    "codeMeaning": "marked",
                                    "codingSchemeDesignator": "SRT",
                                    "codingSchemeVersion": "1.0"
                                 }
                              ]
                           }
                        },
                        {
                           "codeValue": "RID34405",
                           "codeMeaning": "cobblestone pattern",
                           "codingSchemeDesignator": "RadLex",
                           "codingSchemeVersion": "1.0",
                           "defaultAnswer": "true",
                           "ValidTerm": [
                              {
                                 "codeValue": "C0229962",
                                 "codeMeaning": "Body Part",
                                 "codingSchemeDesignator": "NCIm",
                                 "codingSchemeVersion": "1.0"
                              },
                              {
                                 "codeValue": "C1204543",
                                 "codeMeaning": "Plica",
                                 "codingSchemeDesignator": "NCIm",
                                 "codingSchemeVersion": "1.0"
                              }
                           ],
                           "CharacteristicQuantification": {
                              "name": "scale-3",
                              "annotatorConfidence": "false",
                              "characteristicQuantificationIndex": "0",
                              "Scale": {
                                 "scaleType": "Ratio",
                                 "ScaleLevel": [
                                    {
                                       "value": "1",
                                       "valueLabel": "1",
                                       "valueDescription": "1"
                                    },
                                    {
                                       "value": "2",
                                       "valueLabel": "2",
                                       "valueDescription": "2"
                                    },
                                    {
                                       "value": "3",
                                       "valueLabel": "3",
                                       "valueDescription": "3",
                                       "defaultAnswer": "true"
                                    }
                                 ]
                              },
                              "NonQuantifiable": [
                                 {
                                    "codeValue": "G-A102",
                                    "codeMeaning": "Center/Bilateral",
                                    "codingSchemeDesignator": "SRT",
                                    "codingSchemeVersion": "1.0"
                                 },
                                 {
                                    "codeValue": "R-404FA",
                                    "codeMeaning": "Mild",
                                    "codingSchemeDesignator": "SRT",
                                    "codingSchemeVersion": "1.0"
                                 },
                                 {
                                    "codeValue": "G-A460",
                                    "codeMeaning": "Normal",
                                    "codingSchemeDesignator": "SRT",
                                    "codingSchemeVersion": "1.0"
                                 }
                              ]
                           }
                        },
                        {
                           "codeValue": "RID34409",
                           "codeMeaning": "swan neck deformity",
                           "codingSchemeDesignator": "RadLex",
                           "codingSchemeVersion": "1.0",
                           "CharacteristicQuantification": {
                              "name": "numerical",
                              "annotatorConfidence": "false",
                              "characteristicQuantificationIndex": "0",
                              "Numerical": [
                                 {
                                    "value": "0.0",
                                    "ucumString": "cm",
                                    "operator": "Equal",
                                    "valueLabel": "0",
                                    "valueDescription": "zero",
                                    "askForInput": "false"
                                 },
                                 {
                                    "value": "10.0",
                                    "ucumString": "cm",
                                    "operator": "NotEqual",
                                    "valueLabel": "10",
                                    "valueDescription": "10",
                                    "askForInput": "false"
                                 },
                                 {
                                    "value": "20.0",
                                    "ucumString": "cm",
                                    "operator": "LessThan",
                                    "valueLabel": "20",
                                    "valueDescription": "20",
                                    "askForInput": "false"
                                 },
                                 {
                                    "value": "30.0",
                                    "ucumString": "cm",
                                    "operator": "GreaterThan",
                                    "valueLabel": "30",
                                    "valueDescription": "30",
                                    "askForInput": "false"
                                 },
                                 {
                                    "value": "40.0",
                                    "ucumString": "cm",
                                    "operator": "LessThanEqual",
                                    "valueLabel": "40",
                                    "valueDescription": "40",
                                    "askForInput": "false"
                                 },
                                 {
                                    "value": "50.0",
                                    "ucumString": "cm",
                                    "operator": "GreaterThanEqual",
                                    "valueLabel": "50",
                                    "valueDescription": "50",
                                    "askForInput": "false"
                                 }
                              ],
                              "NonQuantifiable": [
                                 {
                                    "codeValue": "R-0038D",
                                    "codeMeaning": "Yes",
                                    "codingSchemeDesignator": "SRT",
                                    "codingSchemeVersion": "1.0"
                                 },
                                 {
                                    "codeValue": "G-A142",
                                    "codeMeaning": "Horizontal",
                                    "codingSchemeDesignator": "SRT",
                                    "codingSchemeVersion": "1.0"
                                 },
                                 {
                                    "codeValue": "G-A429",
                                    "codeMeaning": "marked",
                                    "codingSchemeDesignator": "SRT",
                                    "codingSchemeVersion": "1.0"
                                 }
                              ]
                           }
                        },
                        {
                           "codeValue": "RID34412",
                           "codeMeaning": "Erlenmeyer flask deformity",
                           "codingSchemeDesignator": "RadLex",
                           "codingSchemeVersion": "1.0",
                           "defaultAnswer": "true",
                           "CharacteristicQuantification": {
                              "name": "Quantile",
                              "annotatorConfidence": "false",
                              "characteristicQuantificationIndex": "0",
                              "Quantile": {
                                 "minValue": "0.0",
                                 "maxValue": "500.0",
                                 "bins": "16",
                                 "valueLabel": "quantile",
                                 "valueDescription": "500",
                                 "defaultBin": "2"
                              },
                              "NonQuantifiable": [
                                 {
                                    "codeValue": "R-00339",
                                    "codeMeaning": "no",
                                    "codingSchemeDesignator": "SRT",
                                    "codingSchemeVersion": "1.0"
                                 },
                                 {
                                    "codeValue": "R-0038D",
                                    "codeMeaning": "Yes",
                                    "codingSchemeDesignator": "SRT",
                                    "codingSchemeVersion": "1.0"
                                 },
                                 {
                                    "codeValue": "R-00339",
                                    "codeMeaning": "No",
                                    "codingSchemeDesignator": "SRT",
                                    "codingSchemeVersion": "1.0"
                                 }
                              ]
                           }
                        },
                        {
                           "codeValue": "RID34399",
                           "codeMeaning": "bowler hat sign",
                           "codingSchemeDesignator": "RadLex",
                           "codingSchemeVersion": "1.0",
                           "ValidTerm": {
                              "codeValue": "C66832",
                              "codeMeaning": "one",
                              "codingSchemeDesignator": "NCIt",
                              "codingSchemeVersion": "1.0"
                           },
                           "CharacteristicQuantification": {
                              "name": "Interval",
                              "annotatorConfidence": "false",
                              "characteristicQuantificationIndex": "0",
                              "Interval": [
                                 {
                                    "minValue": "0.0",
                                    "maxValue": "10.0",
                                    "minOperator": "GreaterThan",
                                    "maxOperator": "LessThanEqual",
                                    "ucumString": "cm",
                                    "valueLabel": "0-10",
                                    "valueDescription": "0-10",
                                    "askForInput": "false"
                                 },
                                 {
                                    "minValue": "10.0",
                                    "maxValue": "20.0",
                                    "minOperator": "NotEqual",
                                    "maxOperator": "LessThanEqual",
                                    "ucumString": "cm",
                                    "valueLabel": "10-20",
                                    "valueDescription": "10-20",
                                    "askForInput": "false"
                                 },
                                 {
                                    "minValue": "20.0",
                                    "maxValue": "30.0",
                                    "minOperator": "GreaterThan",
                                    "maxOperator": "LessThanEqual",
                                    "ucumString": "cm",
                                    "valueLabel": "20-30",
                                    "valueDescription": "20-30",
                                    "askForInput": "false"
                                 },
                                 {
                                    "minValue": "30.0",
                                    "maxValue": "40.0",
                                    "minOperator": "GreaterThanEqual",
                                    "maxOperator": "LessThanEqual",
                                    "ucumString": "cm",
                                    "valueLabel": "cm",
                                    "valueDescription": "cm",
                                    "askForInput": "false"
                                 }
                              ],
                              "NonQuantifiable": [
                                 {
                                    "codeValue": "G-A472",
                                    "codeMeaning": "Oblique",
                                    "codingSchemeDesignator": "SRT",
                                    "codingSchemeVersion": "1.0"
                                 },
                                 {
                                    "codeValue": "R-00339",
                                    "codeMeaning": "No",
                                    "codingSchemeDesignator": "SRT",
                                    "codingSchemeVersion": "1.0"
                                 },
                                 {
                                    "codeValue": "G-A104",
                                    "codeMeaning": "Lateral",
                                    "codingSchemeDesignator": "SRT",
                                    "codingSchemeVersion": "1.0"
                                 },
                                 {
                                    "codeValue": "G-A540",
                                    "codeMeaning": "Complex",
                                    "codingSchemeDesignator": "SRT",
                                    "codingSchemeVersion": "1.0"
                                 }
                              ]
                           }
                        }
                     ],
                     "QuestionType": {
                        "codeValue": "G-A460",
                        "codeMeaning": "Normal",
                        "codingSchemeDesignator": "SRT",
                        "codingSchemeVersion": "1.0"
                     }
                  },
                  {
                     "label": "AEC - 1- 3",
                     "itemNumber": "2",
                     "authors": "Default User",
                     "explanatoryText": "AEC 1-3",
                     "minCardinality": "0",
                     "maxCardinality": "1",
                     "shouldDisplay": "true",
                     "groupLabel": "AEC - 1 - 1",
                     "id": "2.25.314136553354390144751865176243128910653",
                     "annotatorConfidence": "false",
                     "AllowedTerm": [
                        {
                           "codeValue": "2181666",
                           "codeMeaning": "Image Nodule Lobar Location Type",
                           "codingSchemeDesignator": "CTEP",
                           "codingSchemeVersion": "1.0"
                        },
                        {
                           "codeValue": "62",
                           "codeMeaning": "Patient Gender Category",
                           "codingSchemeDesignator": "CTEP",
                           "codingSchemeVersion": "1.0"
                        },
                        {
                           "codeValue": "2182326",
                           "codeMeaning": "Nodule Histology Histologic Type WHO Code",
                           "codingSchemeDesignator": "CTEP",
                           "codingSchemeVersion": "1.0"
                        },
                        {
                           "codeValue": "57819",
                           "codeMeaning": "NonNodule Finding X Position Number",
                           "codingSchemeDesignator": "CTEP",
                           "codingSchemeVersion": "1.0"
                        },
                        {
                           "codeValue": "2182326",
                           "codeMeaning": "Nodule Histology Histologic Type WHO Code",
                           "codingSchemeDesignator": "CTEP",
                           "codingSchemeVersion": "1.0"
                        }
                     ]
                  }
               ]
            },
            "AllowedTerm": [
               {
                  "codeValue": "RID35335",
                  "codeMeaning": "lambda sign of chest",
                  "codingSchemeDesignator": "RadLex",
                  "codingSchemeVersion": "1.0",
                  "nextId": "2.25.316621944217354986956136852674485484897",
                  "ValidTerm": {
                     "codeValue": "C25228",
                     "codeMeaning": "Right",
                     "codingSchemeDesignator": "NCIt",
                     "codingSchemeVersion": "1.0"
                  }
               },
               {
                  "codeValue": "RID35340",
                  "codeMeaning": "leafless tree sign",
                  "codingSchemeDesignator": "RadLex",
                  "codingSchemeVersion": "1.0"
               },
               {
                  "codeValue": "RID35346",
                  "codeMeaning": "linguine sign",
                  "codingSchemeDesignator": "RadLex",
                  "codingSchemeVersion": "1.0"
               },
               {
                  "codeValue": "RID35349",
                  "codeMeaning": "lollipop sign",
                  "codingSchemeDesignator": "RadLex",
                  "codingSchemeVersion": "1.0"
               }
            ]
         },
         {
            "label": "IO",
            "itemNumber": "1",
            "authors": "AIM Team",
            "explanatoryText": "IO",
            "minCardinality": "1",
            "maxCardinality": "1",
            "shouldDisplay": "true",
            "groupLabel": "IO",
            "id": "2.25.221240251915004149123867287125995545695",
            "QuestionType": {
               "codeValue": "R-4206F",
               "codeMeaning": "Displaced",
               "codingSchemeDesignator": "SRT",
               "codingSchemeVersion": "1.0"
            },
            "ImagingObservation": {
               "annotatorConfidence": "true",
               "ImagingObservationCharacteristic": {
                  "label": "IOC",
                  "itemNumber": "0",
                  "authors": "AIM Team",
                  "explanatoryText": "IOC",
                  "minCardinality": "1",
                  "maxCardinality": "3",
                  "shouldDisplay": "true",
                  "groupLabel": "",
                  "id": "2.25.262609545894946533504172503990783678900",
                  "requireComment": "false",
                  "annotatorConfidence": "true",
                  "AllowedTerm": [
                     {
                        "codeValue": "RID34996",
                        "codeMeaning": "accordian sign",
                        "codingSchemeDesignator": "RadLex",
                        "codingSchemeVersion": "1.0"
                     },
                     {
                        "codeValue": "RID34995",
                        "codeMeaning": "absent liver sign",
                        "codingSchemeDesignator": "RadLex",
                        "codingSchemeVersion": "1.0",
                        "defaultAnswer": "true"
                     },
                     {
                        "codeValue": "RID34407",
                        "codeMeaning": "comet tail sign",
                        "codingSchemeDesignator": "RadLex",
                        "codingSchemeVersion": "1.0"
                     },
                     {
                        "codeValue": "RID34411",
                        "codeMeaning": "absent bow tie sign",
                        "codingSchemeDesignator": "RadLex",
                        "codingSchemeVersion": "1.0",
                        "ValidTerm": {
                           "codeValue": "C70764",
                           "codeMeaning": "Free text format",
                           "codingSchemeDesignator": "NCIt",
                           "codingSchemeVersion": "1.0"
                        }
                     },
                     {
                        "codeValue": "RID34399",
                        "codeMeaning": "bowler hat sign",
                        "codingSchemeDesignator": "RadLex",
                        "codingSchemeVersion": "1.0"
                     },
                     {
                        "codeValue": "RID35341",
                        "codeMeaning": "left atrial notch sign",
                        "codingSchemeDesignator": "RadLex",
                        "codingSchemeVersion": "1.0"
                     }
                  ],
                  "QuestionType": {
                     "codeValue": "R-409D1",
                     "codeMeaning": "Radial",
                     "codingSchemeDesignator": "SRT",
                     "codingSchemeVersion": "1.0"
                  }
               }
            },
            "AllowedTerm": [
               {
                  "codeValue": "R-00339",
                  "codeMeaning": "No",
                  "codingSchemeDesignator": "SRT",
                  "codingSchemeVersion": "1.0"
               },
               {
                  "codeValue": "G-A002",
                  "codeMeaning": "moderate",
                  "codingSchemeDesignator": "SRT",
                  "codingSchemeVersion": "1.0",
                  "defaultAnswer": "true"
               },
               {
                  "codeValue": "R-4076E",
                  "codeMeaning": "trace",
                  "codingSchemeDesignator": "SRT",
                  "codingSchemeVersion": "1.0"
               },
               {
                  "codeValue": "G-A176",
                  "codeMeaning": "previous",
                  "codingSchemeDesignator": "SRT",
                  "codingSchemeVersion": "1.0"
               },
               {
                  "codeValue": "F-32100",
                  "codeMeaning": "cardiac output",
                  "codingSchemeDesignator": "SRT",
                  "codingSchemeVersion": "1.0"
               }
            ]
         },
         {
            "label": "AE-2",
            "itemNumber": "2",
            "authors": "AIM Team",
            "explanatoryText": "AE-2",
            "minCardinality": "1",
            "maxCardinality": "1",
            "shouldDisplay": "true",
            "groupLabel": "",
            "id": "2.25.200462337283989723836761134995730139613",
            "QuestionType": {
               "codeValue": "RID34406",
               "codeMeaning": "coffee bean sign",
               "codingSchemeDesignator": "RadLex",
               "codingSchemeVersion": "1.0"
            },
            "AnatomicEntity": {
               "annotatorConfidence": "false",
               "AnatomicEntityCharacteristic": {
                  "label": "AE-AEC",
                  "itemNumber": "1",
                  "authors": "AIM Team",
                  "explanatoryText": "AE-AEC",
                  "minCardinality": "1",
                  "maxCardinality": "1",
                  "shouldDisplay": "true",
                  "groupLabel": "",
                  "id": "2.25.4904697685331920492789743978108629689",
                  "annotatorConfidence": "false",
                  "AllowedTerm": [
                     {
                        "codeValue": "3227238",
                        "codeMeaning": "Minimal",
                        "codingSchemeDesignator": "caDSR",
                        "codingSchemeVersion": "1.0"
                     },
                     {
                        "codeValue": "3262715",
                        "codeMeaning": "Center/Bilateral",
                        "codingSchemeDesignator": "caDSR",
                        "codingSchemeVersion": "1.0",
                        "defaultAnswer": "true"
                     },
                     {
                        "codeValue": "2574088",
                        "codeMeaning": "Right",
                        "codingSchemeDesignator": "caDSR",
                        "codingSchemeVersion": "1.0"
                     },
                     {
                        "codeValue": "C0042789",
                        "codeMeaning": "Vision",
                        "codingSchemeDesignator": "caDSR",
                        "codingSchemeVersion": "1.0",
                        "ValidTerm": {
                           "codeValue": "C25517",
                           "codeMeaning": "full",
                           "codingSchemeDesignator": "NCIt",
                           "codingSchemeVersion": "1.0"
                        }
                     },
                     {
                        "codeValue": "3262720",
                        "codeMeaning": "No Contrast Injected",
                        "codingSchemeDesignator": "caDSR",
                        "codingSchemeVersion": "1.0"
                     }
                  ],
                  "QuestionType": {
                     "codeValue": "2903542",
                     "codeMeaning": "Lesion Substance Morphology Region Type",
                     "codingSchemeDesignator": "caDSR",
                     "codingSchemeVersion": "1.0"
                  }
               },
               "ImagingObservationCharacteristic": [
                  {
                     "label": "AE-IOC",
                     "itemNumber": "900",
                     "authors": "AIM Team",
                     "explanatoryText": "AE-IOC",
                     "minCardinality": "1",
                     "maxCardinality": "2",
                     "shouldDisplay": "true",
                     "groupLabel": "",
                     "id": "2.25.108530634510740764767878159000975400939",
                     "requireComment": "false",
                     "annotatorConfidence": "true",
                     "AllowedTerm": [
                        {
                           "codeValue": "RID34997",
                           "codeMeaning": "acorn deformity",
                           "codingSchemeDesignator": "RadLex",
                           "codingSchemeVersion": "1.0"
                        },
                        {
                           "codeValue": "RID34404",
                           "codeMeaning": "Mickey Mouse sign of liver",
                           "codingSchemeDesignator": "RadLex",
                           "codingSchemeVersion": "1.0",
                           "ValidTerm": {
                              "codeValue": "C48660",
                              "codeMeaning": "Not Applicable",
                              "codingSchemeDesignator": "NCIt",
                              "codingSchemeVersion": "1.0"
                           }
                        },
                        {
                           "codeValue": "RID34409",
                           "codeMeaning": "swan neck deformity",
                           "codingSchemeDesignator": "RadLex",
                           "codingSchemeVersion": "1.0"
                        },
                        {
                           "codeValue": "RID34396",
                           "codeMeaning": "beaded ureter",
                           "codingSchemeDesignator": "RadLex",
                           "codingSchemeVersion": "1.0",
                           "nextId": "2.25.316621944217354986956136852674485484897"
                        },
                        {
                           "codeValue": "RID35339",
                           "codeMeaning": "lead pipe sign",
                           "codingSchemeDesignator": "RadLex",
                           "codingSchemeVersion": "1.0",
                           "defaultAnswer": "true"
                        },
                        {
                           "codeValue": "RID35335",
                           "codeMeaning": "lambda sign of chest",
                           "codingSchemeDesignator": "RadLex",
                           "codingSchemeVersion": "1.0"
                        },
                        {
                           "codeValue": "RID35340",
                           "codeMeaning": "leafless tree sign",
                           "codingSchemeDesignator": "RadLex",
                           "codingSchemeVersion": "1.0"
                        }
                     ],
                     "QuestionType": {
                        "codeValue": "G-A472",
                        "codeMeaning": "Oblique",
                        "codingSchemeDesignator": "SRT",
                        "codingSchemeVersion": "1.0"
                     }
                  },
                  {
                     "label": "AE-IOC2",
                     "itemNumber": "2",
                     "authors": "AIM Team",
                     "explanatoryText": "AE-IOC2",
                     "minCardinality": "1",
                     "maxCardinality": "1",
                     "shouldDisplay": "true",
                     "groupLabel": "",
                     "id": "2.25.144384273350738068267645406522525823311",
                     "requireComment": "false",
                     "annotatorConfidence": "true",
                     "AllowedTerm": [
                        {
                           "codeValue": "2891769",
                           "codeMeaning": "Lesion Substance Morphology Contrast-enhanced MRI Quality Type",
                           "codingSchemeDesignator": "caDSR",
                           "codingSchemeVersion": "1.0",
                           "defaultAnswer": "true"
                        },
                        {
                           "codeValue": "2904270",
                           "codeMeaning": "Lesion Substance Morphology Noncontrast-enhancing Tissue (nCET) Proportion Category",
                           "codingSchemeDesignator": "caDSR",
                           "codingSchemeVersion": "1.0",
                           "ValidTerm": {
                              "codeValue": "C16847",
                              "codeMeaning": "Technique",
                              "codingSchemeDesignator": "NCIt",
                              "codingSchemeVersion": "1.0"
                           }
                        },
                        {
                           "codeValue": "2904265",
                           "codeMeaning": "Lesion Substance Morphology Enhancing Proportion Category",
                           "codingSchemeDesignator": "caDSR",
                           "codingSchemeVersion": "1.0"
                        },
                        {
                           "codeValue": "2903556",
                           "codeMeaning": "Lesion Morphology Margin Thickness Category",
                           "codingSchemeDesignator": "caDSR",
                           "codingSchemeVersion": "1.0"
                        }
                     ],
                     "QuestionType": {
                        "codeValue": "2904305",
                        "codeMeaning": "Lesion Alteration Calvarial Bone Remodeling Yes No Indicator",
                        "codingSchemeDesignator": "caDSR",
                        "codingSchemeVersion": "1.0"
                     }
                  }
               ]
            },
            "AllowedTerm": [
               {
                  "codeValue": "RID34402",
                  "codeMeaning": "C sign",
                  "codingSchemeDesignator": "RadLex",
                  "codingSchemeVersion": "1.0"
               },
               {
                  "codeValue": "RID34410",
                  "codeMeaning": "inverted Napoleon hat sign",
                  "codingSchemeDesignator": "RadLex",
                  "codingSchemeVersion": "1.0",
                  "defaultAnswer": "true"
               },
               {
                  "codeValue": "RID34992",
                  "codeMeaning": "absent collecting duct system",
                  "codingSchemeDesignator": "RadLex",
                  "codingSchemeVersion": "1.0",
                  "ValidTerm": {
                     "codeValue": "C96205",
                     "codeMeaning": "meniscal cyst",
                     "codingSchemeDesignator": "NCIt",
                     "codingSchemeVersion": "1.0"
                  }
               }
            ]
         },
         {
            "label": "Inference",
            "itemNumber": "3",
            "authors": "AIM Team",
            "explanatoryText": "Inference",
            "minCardinality": "1",
            "maxCardinality": "1",
            "shouldDisplay": "true",
            "groupLabel": "",
            "id": "2.25.264945780284452461227299362245725897438",
            "QuestionType": {
               "codeValue": "2574088",
               "codeMeaning": "Right",
               "codingSchemeDesignator": "caDSR",
               "codingSchemeVersion": "1.0"
            },
            "Inference": {
               "annotatorConfidence": "false"
            },
            "AllowedTerm": [
               {
                  "codeValue": "2574089",
                  "codeMeaning": "Left",
                  "codingSchemeDesignator": "caDSR",
                  "codingSchemeVersion": "1.0"
               },
               {
                  "codeValue": "3262719",
                  "codeMeaning": "No Contrast Enhancement",
                  "codingSchemeDesignator": "caDSR",
                  "codingSchemeVersion": "1.0",
                  "defaultAnswer": "true"
               },
               {
                  "codeValue": "3262722",
                  "codeMeaning": "Between Two Thirds and One Third",
                  "codingSchemeDesignator": "caDSR",
                  "codingSchemeVersion": "1.0"
               }
            ]
         },
         {
            "label": "Calculation",
            "itemNumber": "4",
            "authors": "AIM Team",
            "explanatoryText": "Calculation",
            "minCardinality": "1",
            "maxCardinality": "1",
            "shouldDisplay": "true",
            "groupLabel": "",
            "id": "2.25.316621944217354986956136852674485484897",
            "QuestionType": {
               "codeValue": "QT-K09373",
               "codeMeaning": "What is the anatomical position?",
               "codingSchemeDesignator": "99PRIVATEQA",
               "codingSchemeVersion": "1.0"
            },
            "Calculation": {
               "CalculationType": {
                  "codeValue": "122405",
                  "codeMeaning": "Algorithm Manufacturer",
                  "codingSchemeDesignator": "DCM",
                  "codingSchemeVersion": "1.0",
                  "AlgorithmType": [
                     {
                        "codeValue": "111002",
                        "codeMeaning": "Algorithm Parameters",
                        "codingSchemeDesignator": "DCM",
                        "codingSchemeVersion": "1.0",
                        "description": "Algorithm",
                        "uniqueIdentifier": "",
                        "algorithmName": "na",
                        "algorithmVersion": "na",
                        "mathML": "na"
                     },
                     {
                        "codeValue": "112046",
                        "codeMeaning": "Non-Target Lesion Incomplete Response or Stable Disease",
                        "codingSchemeDesignator": "DCM",
                        "codingSchemeVersion": "1.0",
                        "description": "AL-2",
                        "uniqueIdentifier": "2.25.159918858042017011226795796657810478482",
                        "algorithmName": "NA",
                        "algorithmVersion": "NA",
                        "mathML": "NA"
                     }
                  ]
               }
            }
         },
         {
            "label": "Line",
            "itemNumber": "5",
            "authors": "AIM Team",
            "explanatoryText": "Draw a line",
            "minCardinality": "1",
            "maxCardinality": "1",
            "shouldDisplay": "true",
            "groupLabel": "",
            "id": "2.25.96258620923756115961136393481188603332",
            "QuestionType": {
               "codeValue": "QT-839565",
               "codeMeaning": "What have you seen on the image?",
               "codingSchemeDesignator": "99PRIVATEQA",
               "codingSchemeVersion": "1.0"
            },
            "GeometricShape": "MultiPoint"
         },
         {
            "label": "IO-2",
            "itemNumber": "6",
            "authors": "Default User",
            "explanatoryText": "Imaging Observation II",
            "minCardinality": "1",
            "maxCardinality": "1",
            "shouldDisplay": "true",
            "groupLabel": "",
            "id": "2.25.331558201624197906250695550755625883257",
            "QuestionType": {
               "codeValue": "QT-839565",
               "codeMeaning": "What have you seen on the image?",
               "codingSchemeDesignator": "99PRIVATEQA",
               "codingSchemeVersion": "1.0"
            },
            "ImagingObservation": {
               "annotatorConfidence": "false"
            },
            "AllowedTerm": [
               {
                  "codeValue": "C0577559",
                  "codeMeaning": "Mass",
                  "codingSchemeDesignator": "NCIm",
                  "codingSchemeVersion": "1.0"
               },
               {
                  "codeValue": "C0012634",
                  "codeMeaning": "Disease",
                  "codingSchemeDesignator": "NCIm",
                  "codingSchemeVersion": "1.0"
               },
               {
                  "codeValue": "C0205258",
                  "codeMeaning": "Indeterminate",
                  "codingSchemeDesignator": "NCIm",
                  "codingSchemeVersion": "1.0"
               },
               {
                  "codeValue": "99PI-349877",
                  "codeMeaning": "Anteroseptal",
                  "codingSchemeDesignator": "99Privt",
                  "codingSchemeVersion": "1.0"
               },
               {
                  "codeValue": "99PI-084624",
                  "codeMeaning": "mid ascending aorta",
                  "codingSchemeDesignator": "99Privt",
                  "codingSchemeVersion": "1.0"
               }
            ]
         }
      ]
   }
}

//export next variable for react
export  var TempCoordinationTest = {
   "uid": "2.25.226786059025611331467166333882529892626777",
   "name": "Coordination Test",
   "authors": "willrett",
   "version": "1.0",
   "creationDate": "2013-11-01",
   "description": "Testing Coordiantions",
   "schemaLocation": "gme://caCORE.caCORE/3.2/edu.northwestern.radiology.AIMTemplate AIMTemplate_v2rv13.xsd",
   "Template": {
      "templateType": "Image",
      "uid": "2.25.3117718860672205766530793354048693651257777",
      "name": "Coordiantion Test",
      "authors": "willrett",
      "version": "1.0",
      "creationDate": "2013-10-31",
      "description": "Coordination Test",
      "modality": "CT",
      "precedingAnnotation": "DoNotOffer",
      "codeMeaning": "Coordination Template",
      "codeValue": "LTC",
      "codingSchemeDesignator": "CoordinationTemplate",
      "codingSchemeVersion": "",
      "Component": {
         "label": "Lung Nodule",
         "itemNumber": "1",
         "authors": "Default User",
         "explanatoryText": "",
         "minCardinality": "1",
         "maxCardinality": "1",
         "shouldDisplay": "true",
         "groupLabel": "",
         "id": "2.25.87157590103780976172344716887617624858",
         "ImagingObservation": {
            "annotatorConfidence": "false",
            "ImagingObservationCharacteristic": {
               "label": "Nodule Attenuation",
               "itemNumber": "1",
               "authors": "Default User",
               "explanatoryText": "",
               "minCardinality": "1",
               "maxCardinality": "1",
               "shouldDisplay": "true",
               "groupLabel": "",
               "id": "2.25.14296178658435596975218217235280517220",
               "annotatorConfidence": "false",
               "AllowedTerm": [
                  {
                     "codeValue": "RID5741",
                     "codeMeaning": "solid",
                     "codingSchemeDesignator": "RadLex.3.10"
                  },
                  {
                     "codeValue": "RID45726",
                     "codeMeaning": "ground glass",
                     "codingSchemeDesignator": "RadLex.3.10"
                  },
                  {
                     "codeValue": "RID46009",
                     "codeMeaning": "semi-consolidation",
                     "codingSchemeDesignator": "RadLex.3.10"
                  },
                  {
                     "codeValue": "RID46011",
                     "codeMeaning": "partially solid",
                     "codingSchemeDesignator": "RadLex.3.10",
                     "ValidTerm": {
                        "codeValue": "LT2",
                        "codeMeaning": "greaterThan 5mm",
                        "codingSchemeDesignator": "LungTemplate"
                     }
                  },
                  {
                     "codeValue": "RID46011",
                     "codeMeaning": "partially solid",
                     "codingSchemeDesignator": "RadLex.3.10",
                     "ValidTerm": [
                        {
                           "codeValue": "LT3",
                           "codeMeaning": "greaterThan 10mm",
                           "codingSchemeDesignator": "LungTemplate"
                        },
                        {
                           "codeValue": "LT5",
                           "codeMeaning": "square",
                           "codingSchemeDesignator": "LungTemplate"
                        }
                     ]
                  },
                  {
                     "codeValue": "RID46011",
                     "codeMeaning": "partially solid",
                     "codingSchemeDesignator": "RadLex.3.10",
                     "codingSchemeVersion": "",
                     "ValidTerm": [
                        {
                           "codeValue": "LT4",
                           "codeMeaning": "greaterThan 5mm",
                           "codingSchemeDesignator": "LungTemplate"
                        },
                        {
                           "codeValue": "LT6",
                           "codeMeaning": "round",
                           "codingSchemeDesignator": "LungTemplate"
                        }
                     ]
                  },
                  {
                     "codeValue": "RID46011",
                     "codeMeaning": "partially solid",
                     "codingSchemeDesignator": "RadLex.3.10",
                     "codingSchemeVersion": "",
                     "ValidTerm": [
                        {
                           "codeValue": "LT7",
                           "codeMeaning": "green",
                           "codingSchemeDesignator": "LungTemplate"
                        },
                        {
                           "codeValue": "LT3",
                           "codeMeaning": "greaterThan 10mm",
                           "codingSchemeDesignator": "LungTemplate"
                        }
                     ]
                  }
               ]
            }
         },
         "AllowedTerm": [
            {
               "codeValue": "RID39056",
               "codeMeaning": "lung mass",
               "codingSchemeDesignator": "RadLex3.8",
               "codingSchemeVersion": "",
               "defaultAnswer": "true",
               "ValidTerm": [
                  {
                     "codeValue": "LT4",
                     "codeMeaning": "greaterThan 5mm",
                     "codingSchemeDesignator": "LungTemplate"
                  },
                  {
                     "codeValue": "LT6",
                     "codeMeaning": "round",
                     "codingSchemeDesignator": "LungTemplate"
                  }
               ]
            },
            {
               "codeValue": "RID39057",
               "codeMeaning": "other",
               "codingSchemeDesignator": "debra",
               "codingSchemeVersion": "",
               "defaultAnswer": "false",
               "ValidTerm": [
                  {
                     "codeValue": "LT4",
                     "codeMeaning": "greaterThan 5mm",
                     "codingSchemeDesignator": "LungTemplate"
                  },
                  {
                     "codeValue": "LT6",
                     "codeMeaning": "round",
                     "codingSchemeDesignator": "LungTemplate"
                  }
               ]
            }
         ]
      }
   }
}

//export next variable for react
 export var TempTest3 = {
   "authors": "AIM Team",
   "creationDate": "2012-12-28",
   "description": "asdfsadfasd",
   "name": "adsdf",
   "uid": "2.25.75761204952962875896072870850622745228",
   "version": "asdfadsf",
   "schemaLocation": "gme://caCORE.caCORE/3.2/edu.northwestern.radiology.AIMTemplate AIMTemplate_v2rv13.xsd",
   "Template": {
      "authors": "AIM Team",
      "codeMeaning": "Test 3",
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
            "itemNumber": "0",
            "label": "AE - 1",
            "maxCardinality": "2",
            "minCardinality": "1",
            "requireComment": "false",
            "shouldDisplay": "true",
            "QuestionType": {
               "codeMeaning": "Target Lesion Partial Response",
               "codeValue": "112042",
               "codingSchemeDesignator": "DCM",
               "codingSchemeVersion": "1.0"
            },
            "AnatomicEntity": {
               "annotatorConfidence": "true",
               "AnatomicEntityCharacteristic": [
                  {
                     "annotatorConfidence": "true",
                     "authors": "AIM Team",
                     "explanatoryText": "AEC one - one",
                     "groupLabel": "AEC - 1 - 1",
                     "id": "2.25.96983863729747964833684373111073058156",
                     "itemNumber": "0",
                     "label": "AEC - 1 - 1",
                     "maxCardinality": "5",
                     "minCardinality": "1",
                     "requireComment": "false",
                     "shouldDisplay": "true",
                     "AllowedTerm": [
                        {
                           "codeMeaning": "absent gastric air bubble sign",
                           "codeValue": "RID34993",
                           "codingSchemeDesignator": "RadLex",
                           "codingSchemeVersion": "1.0",
                           "ValidTerm": {
                              "codeMeaning": "bone marrow edema",
                              "codeValue": "10055397",
                              "codingSchemeDesignator": "MedDRA",
                              "codingSchemeVersion": "1.0"
                           }
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
                           "ValidTerm": {
                              "codeMeaning": "Bone",
                              "codeValue": "MTHU002077",
                              "codingSchemeDesignator": "LOINC",
                              "codingSchemeVersion": ""
                           }
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
                     "annotatorConfidence": "true",
                     "authors": "AIM Team",
                     "explanatoryText": "AEC one two",
                     "groupLabel": "",
                     "id": "2.25.282321381780351407137178608344539789057",
                     "itemNumber": "1",
                     "label": "AEC - 1 - 2",
                     "maxCardinality": "3",
                     "minCardinality": "1",
                     "requireComment": "false",
                     "shouldDisplay": "true",
                     "AllowedTerm": [
                        {
                           "codeMeaning": "absent liver sign",
                           "codeValue": "RID34995",
                           "codingSchemeDesignator": "RadLex",
                           "codingSchemeVersion": "1.0",
                           "CharacteristicQuantification": {
                              "annotatorConfidence": "false",
                              "characteristicQuantificationIndex": "0",
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
                        },
                        {
                           "codeMeaning": "butterfly shadow",
                           "codeValue": "RID34400",
                           "codingSchemeDesignator": "RadLex",
                           "codingSchemeVersion": "1.0",
                           "defaultAnswer": "true",
                           "nextId": "2.25.316621944217354986956136852674485484897",
                           "CharacteristicQuantification": {
                              "annotatorConfidence": "true",
                              "characteristicQuantificationIndex": "0",
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
                                    "defaultAnswer": "true"
                                 },
                                 {
                                    "codeMeaning": "marked",
                                    "codeValue": "G-A429",
                                    "codingSchemeDesignator": "SRT",
                                    "codingSchemeVersion": "1.0"
                                 }
                              ]
                           }
                        },
                        {
                           "codeMeaning": "cobblestone pattern",
                           "codeValue": "RID34405",
                           "codingSchemeDesignator": "RadLex",
                           "codingSchemeVersion": "1.0",
                           "defaultAnswer": "true",
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
                           "CharacteristicQuantification": {
                              "annotatorConfidence": "false",
                              "characteristicQuantificationIndex": "0",
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
                                       "defaultAnswer": "true",
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
                        },
                        {
                           "codeMeaning": "swan neck deformity",
                           "codeValue": "RID34409",
                           "codingSchemeDesignator": "RadLex",
                           "codingSchemeVersion": "1.0",
                           "CharacteristicQuantification": {
                              "annotatorConfidence": "false",
                              "characteristicQuantificationIndex": "0",
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
                        },
                        {
                           "codeMeaning": "Erlenmeyer flask deformity",
                           "codeValue": "RID34412",
                           "codingSchemeDesignator": "RadLex",
                           "codingSchemeVersion": "1.0",
                           "defaultAnswer": "true",
                           "CharacteristicQuantification": {
                              "annotatorConfidence": "false",
                              "characteristicQuantificationIndex": "0",
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
                        },
                        {
                           "codeMeaning": "bowler hat sign",
                           "codeValue": "RID34399",
                           "codingSchemeDesignator": "RadLex",
                           "codingSchemeVersion": "1.0",
                           "CharacteristicQuantification": {
                              "annotatorConfidence": "false",
                              "characteristicQuantificationIndex": "0",
                              "name": "Interval",
                              "Interval": [
                                 {
                                    "askForInput": "false",
                                    "maxOperator": "LessThanEqual",
                                    "maxValue": "10.0",
                                    "minOperator": "GreaterThan",
                                    "minValue": "0.0",
                                    "ucumString": "cm",
                                    "valueDescription": "0-10",
                                    "valueLabel": "0-10"
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
                     "annotatorConfidence": "false",
                     "authors": "Default User",
                     "explanatoryText": "AEC 1-3",
                     "groupLabel": "AEC - 1 - 1",
                     "id": "2.25.314136553354390144751865176243128910653",
                     "itemNumber": "2",
                     "label": "AEC - 1- 3",
                     "maxCardinality": "1",
                     "minCardinality": "0",
                     "shouldDisplay": "true",
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
                  "ValidTerm": {
                     "codeMeaning": "Right",
                     "codeValue": "C25228",
                     "codingSchemeDesignator": "NCIt",
                     "codingSchemeVersion": "1.0"
                  }
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
            "itemNumber": "1",
            "label": "IO",
            "maxCardinality": "1",
            "minCardinality": "1",
            "shouldDisplay": "true",
            "QuestionType": {
               "codeMeaning": "Displaced",
               "codeValue": "R-4206F",
               "codingSchemeDesignator": "SRT",
               "codingSchemeVersion": "1.0"
            },
            "ImagingObservation": {
               "annotatorConfidence": "false",
               "ImagingObservationCharacteristic": {
                  "annotatorConfidence": "true",
                  "authors": "AIM Team",
                  "explanatoryText": "IOC",
                  "groupLabel": "",
                  "id": "2.25.262609545894946533504172503990783678900",
                  "itemNumber": "0",
                  "label": "IOC",
                  "maxCardinality": "3",
                  "minCardinality": "1",
                  "requireComment": "false",
                  "shouldDisplay": "true",
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
                        "defaultAnswer": "true"
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
                        "ValidTerm": {
                           "codeMeaning": "Free text format",
                           "codeValue": "C70764",
                           "codingSchemeDesignator": "NCIt",
                           "codingSchemeVersion": "1.0"
                        }
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
                  "defaultAnswer": "true"
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
            "groupLabel": "",
            "id": "2.25.200462337283989723836761134995730139613",
            "itemNumber": "2",
            "label": "AE-2",
            "maxCardinality": "1",
            "minCardinality": "1",
            "shouldDisplay": "true",
            "QuestionType": {
               "codeMeaning": "coffee bean sign",
               "codeValue": "RID34406",
               "codingSchemeDesignator": "RadLex",
               "codingSchemeVersion": "1.0"
            },
            "AnatomicEntity": {
               "annotatorConfidence": "false",
               "AnatomicEntityCharacteristic": {
                  "annotatorConfidence": "false",
                  "authors": "AIM Team",
                  "explanatoryText": "AE-AEC",
                  "groupLabel": "",
                  "id": "2.25.4904697685331920492789743978108629689",
                  "itemNumber": "1",
                  "label": "AE-AEC",
                  "maxCardinality": "1",
                  "minCardinality": "1",
                  "shouldDisplay": "true",
                  "AllowedTerm": [
                     {
                        "codeMeaning": "Minimal",
                        "codeValue": "3227238",
                        "codingSchemeDesignator": "caDSR",
                        "codingSchemeVersion": "1.0"
                     },
                     {
                        "codeMeaning": "Center/Bilateral",
                        "codeValue": "3262715",
                        "codingSchemeDesignator": "caDSR",
                        "codingSchemeVersion": "1.0",
                        "defaultAnswer": "true"
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
                        "ValidTerm": {
                           "codeMeaning": "full",
                           "codeValue": "C25517",
                           "codingSchemeDesignator": "NCIt",
                           "codingSchemeVersion": "1.0"
                        }
                     },
                     {
                        "codeMeaning": "No Contrast Injected",
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
               },
               "ImagingObservationCharacteristic": [
                  {
                     "annotatorConfidence": "true",
                     "authors": "AIM Team",
                     "explanatoryText": "AE-IOC",
                     "groupLabel": "",
                     "id": "2.25.108530634510740764767878159000975400939",
                     "itemNumber": "0",
                     "label": "AE-IOC",
                     "maxCardinality": "2",
                     "minCardinality": "1",
                     "requireComment": "false",
                     "shouldDisplay": "true",
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
                           "ValidTerm": {
                              "codeMeaning": "Not Applicable",
                              "codeValue": "C48660",
                              "codingSchemeDesignator": "NCIt",
                              "codingSchemeVersion": "1.0"
                           }
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
                           "defaultAnswer": "true"
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
                     "annotatorConfidence": "true",
                     "authors": "AIM Team",
                     "explanatoryText": "AE-IOC2",
                     "groupLabel": "",
                     "id": "2.25.144384273350738068267645406522525823311",
                     "itemNumber": "2",
                     "label": "AE-IOC2",
                     "maxCardinality": "1",
                     "minCardinality": "1",
                     "requireComment": "false",
                     "shouldDisplay": "true",
                     "AllowedTerm": [
                        {
                           "codeMeaning": "Lesion Substance Morphology Contrast-enhanced MRI Quality Type",
                           "codeValue": "2891769",
                           "codingSchemeDesignator": "caDSR",
                           "codingSchemeVersion": "1.0",
                           "defaultAnswer": "true"
                        },
                        {
                           "codeMeaning": "Lesion Substance Morphology Noncontrast-enhancing Tissue (nCET) Proportion Category",
                           "codeValue": "2904270",
                           "codingSchemeDesignator": "caDSR",
                           "codingSchemeVersion": "1.0",
                           "ValidTerm": {
                              "codeMeaning": "Technique",
                              "codeValue": "C16847",
                              "codingSchemeDesignator": "NCIt",
                              "codingSchemeVersion": "1.0"
                           }
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
                  "defaultAnswer": "true"
               },
               {
                  "codeMeaning": "absent collecting duct system",
                  "codeValue": "RID34992",
                  "codingSchemeDesignator": "RadLex",
                  "codingSchemeVersion": "1.0",
                  "ValidTerm": {
                     "codeMeaning": "meniscal cyst",
                     "codeValue": "C96205",
                     "codingSchemeDesignator": "NCIt",
                     "codingSchemeVersion": "1.0"
                  }
               }
            ]
         },
         {
            "authors": "AIM Team",
            "explanatoryText": "Inference",
            "groupLabel": "",
            "id": "2.25.264945780284452461227299362245725897438",
            "itemNumber": "3",
            "label": "Inference",
            "maxCardinality": "1",
            "minCardinality": "1",
            "shouldDisplay": "true",
            "QuestionType": {
               "codeMeaning": "Right",
               "codeValue": "2574088",
               "codingSchemeDesignator": "caDSR",
               "codingSchemeVersion": "1.0"
            },
            "Inference": {
               "annotatorConfidence": "false"
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
                  "defaultAnswer": "true"
               },
               {
                  "codeMeaning": "Between Two Thirds and One Third",
                  "codeValue": "3262722",
                  "codingSchemeDesignator": "caDSR",
                  "codingSchemeVersion": "1.0"
               }
            ]
         },
         {
            "authors": "AIM Team",
            "explanatoryText": "Calculation",
            "groupLabel": "",
            "id": "2.25.316621944217354986956136852674485484897",
            "itemNumber": "4",
            "label": "Calculation",
            "maxCardinality": "1",
            "minCardinality": "1",
            "shouldDisplay": "true",
            "QuestionType": {
               "codeMeaning": "What is the anatomical position?",
               "codeValue": "QT-K09373",
               "codingSchemeDesignator": "99PRIVATEQA",
               "codingSchemeVersion": "1.0"
            },
            "Calculation": {
               "CalculationType": {
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
                        "mathML": "na",
                        "uniqueIdentifier": ""
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
            }
         },
         {
            "authors": "AIM Team",
            "explanatoryText": "Draw a line",
            "groupLabel": "",
            "id": "2.25.96258620923756115961136393481188603332",
            "itemNumber": "5",
            "label": "Line",
            "maxCardinality": "1",
            "minCardinality": "1",
            "shouldDisplay": "true",
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
            "groupLabel": "",
            "id": "2.25.331558201624197906250695550755625883257",
            "itemNumber": "6",
            "label": "IO-2",
            "maxCardinality": "1",
            "minCardinality": "1",
            "shouldDisplay": "true",
            "QuestionType": {
               "codeMeaning": "What have you seen on the image?",
               "codeValue": "QT-839565",
               "codingSchemeDesignator": "99PRIVATEQA",
               "codingSchemeVersion": "1.0"
            },
            "ImagingObservation": {
               "annotatorConfidence": "false"
            },
            "AllowedTerm": [
               {
                  "codeMeaning": "Mass",
                  "codeValue": "C0577559",
                  "codingSchemeDesignator": "NCIm",
                  "codingSchemeVersion": "1.0"
               },
               {
                  "codeMeaning": "Disease",
                  "codeValue": "C0012634",
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
   },
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

//export next variable for react
export  var TempLungNoduleV2= {
   "authors": "Ann Leung and Deni Aberle",
   "creationDate": "2013-11-01",
   "description": "Template describing features of lung nodules",
   "name": "Lung Nodule V2",
   "uid": "2.25.226786059025611331467166333882529892626",
   "version": "1.0",
   "schemaLocation": "gme://caCORE.caCORE/3.2/edu.northwestern.radiology.AIMTemplate AIMTemplate_v2rv13.xsd",
   "Template": {
      "authors": "Ann Leung, Deni Aberle, Daniel Rubin",
      "codeMeaning": "Lung Template",
      "codeValue": "LT1",
      "codingSchemeDesignator": "LungTemplate",
      "codingSchemeVersion": "",
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
            "explanatoryText": "",
            "groupLabel": "",
            "id": "2.25.140176464195137397956100227930935538072",
            "itemNumber": "0",
            "label": "Anatomic Location",
            "maxCardinality": "1",
            "minCardinality": "1",
            "shouldDisplay": "true",
            "AnatomicEntity": {
               "annotatorConfidence": "false"
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
            "explanatoryText": "",
            "groupLabel": "",
            "id": "2.25.87157590103780976172344716887617624858",
            "itemNumber": "1",
            "label": "Lung Nodule",
            "maxCardinality": "1",
            "minCardinality": "1",
            "shouldDisplay": "true",
            "ImagingObservation": {
               "annotatorConfidence": "false",
               "ImagingObservationCharacteristic": [
                  {
                     "annotatorConfidence": "false",
                     "authors": "Default User",
                     "explanatoryText": "",
                     "groupLabel": "",
                     "id": "2.25.237962337540884656877012377106352564200",
                     "itemNumber": "0",
                     "label": "Axial Location",
                     "maxCardinality": "1",
                     "minCardinality": "1",
                     "shouldDisplay": "true",
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
                     "annotatorConfidence": "false",
                     "authors": "Default User",
                     "explanatoryText": "",
                     "groupLabel": "",
                     "id": "2.25.14296178658435596975218217235280517220",
                     "itemNumber": "1",
                     "label": "Nodule Attenuation",
                     "maxCardinality": "1",
                     "minCardinality": "1",
                     "shouldDisplay": "true",
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
                           "ValidTerm": {
                              "codeMeaning": "Solid lessOrEqual 5mm",
                              "codeValue": "LT2",
                              "codingSchemeDesignator": "LungTemplate"
                           }
                        },
                        {
                           "codeMeaning": "partially solid",
                           "codeValue": "RID46011",
                           "codingSchemeDesignator": "RadLex.3.10",
                           "codingSchemeVersion": "",
                           "ValidTerm": {
                              "codeMeaning": "Solid greaterThan 5mm",
                              "codeValue": "LT3",
                              "codingSchemeDesignator": "LungTemplate"
                           }
                        }
                     ]
                  },
                  {
                     "annotatorConfidence": "false",
                     "authors": "Default User",
                     "explanatoryText": "",
                     "groupLabel": "",
                     "id": "2.25.35741647376747435228941990394228816488",
                     "itemNumber": "2",
                     "label": "Nodule Internal Features",
                     "maxCardinality": "5",
                     "minCardinality": "0",
                     "shouldDisplay": "true",
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
                     "annotatorConfidence": "false",
                     "authors": "Default User",
                     "explanatoryText": "",
                     "groupLabel": "",
                     "id": "2.25.183099523845672751539777412085619223302",
                     "itemNumber": "3",
                     "label": "Nodule Margins-Primary Pattern",
                     "maxCardinality": "1",
                     "minCardinality": "1",
                     "shouldDisplay": "true",
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
                     "annotatorConfidence": "false",
                     "authors": "Default User",
                     "explanatoryText": "",
                     "groupLabel": "",
                     "id": "2.25.274004174861007766345536611609722648729",
                     "itemNumber": "4",
                     "label": "Nodule Margins-Secondary Pattern",
                     "maxCardinality": "1",
                     "minCardinality": "1",
                     "shouldDisplay": "true",
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
                     "annotatorConfidence": "false",
                     "authors": "Default User",
                     "explanatoryText": "",
                     "groupLabel": "",
                     "id": "2.25.210192685152885213289122028983951587405",
                     "itemNumber": "5",
                     "label": "Nodule Shape",
                     "maxCardinality": "1",
                     "minCardinality": "1",
                     "shouldDisplay": "true",
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
                     "annotatorConfidence": "false",
                     "authors": "Default User",
                     "explanatoryText": "",
                     "groupLabel": "",
                     "id": "2.25.91578940853568465168607658611838451559",
                     "itemNumber": "6",
                     "label": "Nodule Calcification",
                     "maxCardinality": "1",
                     "minCardinality": "1",
                     "shouldDisplay": "true",
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
                     "annotatorConfidence": "false",
                     "authors": "Default User",
                     "explanatoryText": "",
                     "groupLabel": "",
                     "id": "2.25.86591728618943540706650681612583222798",
                     "itemNumber": "7",
                     "label": "Nodule Associated Findings",
                     "maxCardinality": "8",
                     "minCardinality": "0",
                     "shouldDisplay": "true",
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
                           "codingSchemeVersion": "",
                           "ValidTerm": {
                              "codeMeaning": "thickened",
                              "codeValue": "RID5914",
                              "codingSchemeDesignator": "RadLex3.10_NS"
                           }
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
                     "annotatorConfidence": "false",
                     "authors": "Default User",
                     "explanatoryText": "",
                     "groupLabel": "",
                     "id": "2.25.337873076505794771639407232761357500198",
                     "itemNumber": "8",
                     "label": "Nodule Periphery",
                     "maxCardinality": "1",
                     "minCardinality": "1",
                     "shouldDisplay": "true",
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
                           "ValidTerm": {
                              "codeMeaning": "diffuse",
                              "codeValue": "RID5701",
                              "codingSchemeDesignator": "RadLex3.10_NS"
                           }
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
                           "ValidTerm": {
                              "codeMeaning": "focal",
                              "codeValue": "RID5702",
                              "codingSchemeDesignator": "RadLex3.10_NS"
                           }
                        }
                     ]
                  },
                  {
                     "annotatorConfidence": "false",
                     "authors": "Default User",
                     "explanatoryText": "",
                     "groupLabel": "",
                     "id": "2.25.56874292711129473332146919471556731934",
                     "itemNumber": "9",
                     "label": "Satellite Nodules in Primary Lesion Lobe (greater than 4mm noncalcified)",
                     "maxCardinality": "1",
                     "minCardinality": "1",
                     "shouldDisplay": "true",
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
                     "annotatorConfidence": "false",
                     "authors": "Default User",
                     "explanatoryText": "",
                     "groupLabel": "",
                     "id": "2.25.164648481688704170072251256968019225088",
                     "itemNumber": "10",
                     "label": "Nodules in Non-Lesion Lobe Same Lung (greater than 4mm noncalcified)",
                     "maxCardinality": "1",
                     "minCardinality": "1",
                     "shouldDisplay": "true",
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
                     "annotatorConfidence": "false",
                     "authors": "Default User",
                     "explanatoryText": "",
                     "groupLabel": "",
                     "id": "2.25.33923803346582189330047535303230692411",
                     "itemNumber": "11",
                     "label": "Nodules in Contralateral Lung (gretater than 4mm noncalcified)",
                     "maxCardinality": "1",
                     "minCardinality": "1",
                     "shouldDisplay": "true",
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
                     "annotatorConfidence": "false",
                     "authors": "Default User",
                     "explanatoryText": "",
                     "groupLabel": "",
                     "id": "2.25.180475864236240257350664551875509074349",
                     "itemNumber": "12",
                     "label": "Centrilobular Nodules - Diffuse (RB type nodules)",
                     "maxCardinality": "1",
                     "minCardinality": "1",
                     "shouldDisplay": "true",
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
                     "annotatorConfidence": "false",
                     "authors": "Default User",
                     "explanatoryText": "",
                     "groupLabel": "",
                     "id": "2.25.85167896134846854745150364271756901116",
                     "itemNumber": "13",
                     "label": "Emphysema",
                     "maxCardinality": "1",
                     "minCardinality": "1",
                     "shouldDisplay": "true",
                     "AllowedTerm": [
                        {
                           "codeMeaning": "absent",
                           "codeValue": "RID28473",
                           "codingSchemeDesignator": "RadLex3.10_NS",
                           "codingSchemeVersion": "",
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
                     "annotatorConfidence": "false",
                     "authors": "Default User",
                     "explanatoryText": "",
                     "groupLabel": "",
                     "id": "2.25.48209778667419927995403117943578362888",
                     "itemNumber": "14",
                     "label": "Primary Emphysema Pattern",
                     "maxCardinality": "1",
                     "minCardinality": "0",
                     "shouldDisplay": "true",
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
                     "annotatorConfidence": "false",
                     "authors": "Default User",
                     "explanatoryText": "",
                     "groupLabel": "",
                     "id": "2.25.87497229868117253568605741682731038702",
                     "itemNumber": "15",
                     "label": "Primary Distribution",
                     "maxCardinality": "1",
                     "minCardinality": "0",
                     "shouldDisplay": "true",
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
                     "annotatorConfidence": "false",
                     "authors": "Default User",
                     "explanatoryText": "",
                     "groupLabel": "",
                     "id": "2.25.22412018022639277396146875668346172866",
                     "itemNumber": "16",
                     "label": "Primary Emphysema Laterality",
                     "maxCardinality": "1",
                     "minCardinality": "0",
                     "shouldDisplay": "true",
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
                     "annotatorConfidence": "false",
                     "authors": "Default User",
                     "explanatoryText": "",
                     "groupLabel": "",
                     "id": "2.25.302457310194949316717802766802040777742",
                     "itemNumber": "17",
                     "label": "Secondary Emmphysema Pattern",
                     "maxCardinality": "1",
                     "minCardinality": "0",
                     "shouldDisplay": "true",
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
                     "annotatorConfidence": "false",
                     "authors": "Default User",
                     "explanatoryText": "",
                     "groupLabel": "",
                     "id": "2.25.126554497157909901085611395913043926817",
                     "itemNumber": "18",
                     "label": "Secondary Emhysema Distribution",
                     "maxCardinality": "1",
                     "minCardinality": "0",
                     "shouldDisplay": "true",
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
                     "annotatorConfidence": "false",
                     "authors": "Default User",
                     "explanatoryText": "",
                     "groupLabel": "",
                     "id": "2.25.79576331108465773610712356090472423453",
                     "itemNumber": "19",
                     "label": "Secondary Emphysema Laterality",
                     "maxCardinality": "1",
                     "minCardinality": "0",
                     "shouldDisplay": "true",
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
                     "annotatorConfidence": "false",
                     "authors": "Default User",
                     "explanatoryText": "",
                     "groupLabel": "",
                     "id": "2.25.289810694927622330644816270675737408632",
                     "itemNumber": "20",
                     "label": "Overall Emmphysema Severity",
                     "maxCardinality": "1",
                     "minCardinality": "0",
                     "shouldDisplay": "true",
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
                     "annotatorConfidence": "false",
                     "authors": "Default User",
                     "explanatoryText": "",
                     "groupLabel": "",
                     "id": "2.25.196629001251905554888034863981784506133",
                     "itemNumber": "21",
                     "label": "Lung Parencyma Features",
                     "maxCardinality": "8",
                     "minCardinality": "0",
                     "shouldDisplay": "true",
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
                     "annotatorConfidence": "false",
                     "authors": "Default User",
                     "explanatoryText": "",
                     "groupLabel": "",
                     "id": "2.25.168011863615558355498009510206396497638",
                     "itemNumber": "22",
                     "label": "Fibrosis",
                     "maxCardinality": "1",
                     "minCardinality": "1",
                     "shouldDisplay": "true",
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
                           "codingSchemeVersion": "",
                           "noMoreQuestions": "true"
                        }
                     ]
                  },
                  {
                     "annotatorConfidence": "false",
                     "authors": "Default User",
                     "explanatoryText": "",
                     "groupLabel": "",
                     "id": "2.25.279492598017048490216876260893969565992",
                     "itemNumber": "23",
                     "label": "Anatomic Fibrosis Distribution",
                     "maxCardinality": "1",
                     "minCardinality": "0",
                     "shouldDisplay": "true",
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
                     "annotatorConfidence": "false",
                     "authors": "Default User",
                     "explanatoryText": "",
                     "groupLabel": "",
                     "id": "2.25.56159694178652268995459589930935196338",
                     "itemNumber": "24",
                     "label": "Axial Fibrosis Distribution",
                     "maxCardinality": "1",
                     "minCardinality": "0",
                     "shouldDisplay": "true",
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
                           "codingSchemeDesignator": "LungTemplate",
                           "codingSchemeVersion": ""
                        },
                        {
                           "codeMeaning": "random",
                           "codeValue": "RID46031",
                           "codingSchemeDesignator": "RadLex3.10_NS"
                        }
                     ]
                  },
                  {
                     "annotatorConfidence": "false",
                     "authors": "Default User",
                     "explanatoryText": "",
                     "groupLabel": "",
                     "id": "2.25.302323631874731272639500154344855572660",
                     "itemNumber": "25",
                     "label": "Fibrosis Type",
                     "maxCardinality": "1",
                     "minCardinality": "0",
                     "shouldDisplay": "true",
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
                           "codingSchemeDesignator": "RadLex3.10_NS",
                           "codingSchemeVersion": ""
                        }
                     ]
                  }
               ]
            },
            "AllowedTerm": {
               "codeMeaning": "lung mass",
               "codeValue": "RID39056",
               "codingSchemeDesignator": "RadLex3.8",
               "codingSchemeVersion": "",
               "defaultAnswer": "true"
            }
         }
      ]
   }
}

//export next variable for react
 export var RECIST_v2= {
   "authors": "The AIM team",
   "creationDate": "2011-07-10",
   "description": "This template is used to collect annotations for RECIST evaluation",
   "name": "VK Template",
   "uid": "2.25.5886507345423505656941688371593170234",
   "version": "1",
   "schemaLocation": "gme://caCORE.caCORE/3.2/edu.northwestern.radiology.AIMTemplate AIMTemplate_v2rv13.xsd",
   "Template": {
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
            "groupLabel": "",
            "id": "2.25.4369054531089.1305416223173.217635712047",
            "itemNumber": "1",
            "label": "Location",
            "maxCardinality": "1",
            "minCardinality": "1",
            "shouldDisplay": "true",
            "AnatomicEntity": {
               "annotatorConfidence": "false"
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
            "explanatoryText": "",
            "groupLabel": "",
            "id": "2.25.4369054531658.1305416223742.217635712095",
            "itemNumber": "2",
            "label": "Lesion Quality",
            "maxCardinality": "2",
            "minCardinality": "1",
            "shouldDisplay": "true",
            "ImagingObservation": {
               "annotatorConfidence": "false",
               "ImagingObservationCharacteristic": [
                  {
                     "annotatorConfidence": "false",
                     "authors": "epaduser",
                     "explanatoryText": "Timepoint of lesion",
                     "groupLabel": "",
                     "id": "2.25.4369054532228.1305416224313.217635712143",
                     "itemNumber": "1",
                     "label": "Timepoint",
                     "maxCardinality": "1",
                     "minCardinality": "1",
                     "shouldDisplay": "true",
                     "AllowedTerm": {
                        "codeMeaning": "FU Number (0=Baseline)",
                        "codeValue": "S90",
                        "codingSchemeDesignator": "99EPAD",
                        "codingSchemeVersion": "1",
                        "CharacteristicQuantification": {
                           "annotatorConfidence": "false",
                           "characteristicQuantificationIndex": "0",
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
                     }
                  },
                  {
                     "annotatorConfidence": "false",
                     "authors": "epaduser",
                     "explanatoryText": "Type of lesion",
                     "groupLabel": "",
                     "id": "2.25.4369054532228.1305416224313.217635712143",
                     "itemNumber": "2",
                     "label": "Type",
                     "maxCardinality": "1",
                     "minCardinality": "1",
                     "shouldDisplay": "true",
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
                     "annotatorConfidence": "false",
                     "authors": "epaduser",
                     "explanatoryText": "Status of lesion",
                     "groupLabel": "",
                     "id": "2.25.436905441089.13054168484973.21324571207",
                     "itemNumber": "3",
                     "label": "Lesion Status",
                     "maxCardinality": "1",
                     "minCardinality": "1",
                     "shouldDisplay": "true",
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
                     "annotatorConfidence": "false",
                     "authors": "epaduser",
                     "explanatoryText": "Enhancement state of lesion",
                     "groupLabel": "",
                     "id": "2.25.436905441089.13054164543173.217634571207",
                     "itemNumber": "3",
                     "label": "Lesion Enhancement",
                     "maxCardinality": "1",
                     "minCardinality": "0",
                     "shouldDisplay": "true",
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
                  "defaultAnswer": "true"
               },
               {
                  "codeMeaning": "Nonevaluable",
                  "codeValue": "RID39225",
                  "codingSchemeDesignator": "Radlex"
               }
            ]
         }
      ]
   }
}

//export next variable for react
export var roiOnly ={
   "authors": "The AIM team",
   "creationDate": "2012-06-10",
   "description": "This template is used to collect ROI only from readers.",
   "name": "ROI Only Template",
   "uid": "2.25.1210608360076.368016275498.58943005335",
   "version": "1",
   "schemaLocation": "gme://caCORE.caCORE/3.2/edu.northwestern.radiology.AIMTemplate AIMTemplate_v2rv13.xsd",
   "Template": {
      "authors": "amsnyder",
      "codeMeaning": "ROI Only",
      "codeValue": "ROI",
      "codingSchemeDesignator": "99EPAD",
      "codingSchemeVersion": "1",
      "creationDate": "2011-11-16",
      "description": "Template used for collecting only ROIs",
      "name": "ROIOnly",
      "templateType": "Image",
      "uid": "2.25.158009446295858919844005670982612161979",
      "version": "1.1",
      "Component": {
         "authors": "Default User",
         "explanatoryText": "",
         "groupLabel": "",
         "id": "2.25.160559461531180601689784456811019731675",
         "itemNumber": "0",
         "label": "Label",
         "maxCardinality": "1",
         "minCardinality": "1",
         "shouldDisplay": "true",
         "Label": "Label"
      }
   }
}


//export next variable for react
export  var recistSavedAim = {
  "imageAnnotations": {
    "ImageAnnotationCollection": {
      "aimVersion": "AIMv4_2",
      "dateTime": {
        "value": 20190325213047
      },
      "seriesInstanceUid": {
        "root": "2.25.334231683807698931577184134537404568165"
      },
      "studyInstanceUid": {
        "root": "1.2.840.113704.1.111.1916.1223561896.1"
      },
      "imageAnnotations": {
        "ImageAnnotation": {
          "dateTime": {
            "value": "03.26.2019T04:30:48AM.Zone:GMT"
          },
          "imageAnnotationStatementCollection": {
            "ImageAnnotationStatement": [
              {
                "xsi:type": "CalculationEntityReferencesMarkupEntityStatement",
                "objectUniqueIdentifier": {
                  "root": "2.25.125240810751101929350243081775661506324"
                },
                "subjectUniqueIdentifier": {
                  "root": "2.25.219158624455432134392374565972215836738"
                }
              },
              {
                "xsi:type": "CalculationEntityReferencesMarkupEntityStatement",
                "objectUniqueIdentifier": {
                  "root": "2.25.125240810751101929350243081775661506324"
                },
                "subjectUniqueIdentifier": {
                  "root": "2.25.211115486419840759298611091420374789953"
                }
              },
              {
                "xsi:type": "CalculationEntityReferencesMarkupEntityStatement",
                "objectUniqueIdentifier": {
                  "root": "2.25.125240810751101929350243081775661506324"
                },
                "subjectUniqueIdentifier": {
                  "root": "2.25.104024133390620480019901314394315048375"
                }
              },
              {
                "xsi:type": "CalculationEntityReferencesMarkupEntityStatement",
                "objectUniqueIdentifier": {
                  "root": "2.25.125240810751101929350243081775661506324"
                },
                "subjectUniqueIdentifier": {
                  "root": "2.25.258230350062787458979437484716824994596"
                }
              },
              {
                "xsi:type": "CalculationEntityReferencesMarkupEntityStatement",
                "objectUniqueIdentifier": {
                  "root": "2.25.125240810751101929350243081775661506324"
                },
                "subjectUniqueIdentifier": {
                  "root": "2.25.200049922669616618654018433134043355211"
                }
              }
            ]
          },
          "imageReferenceEntityCollection": {
            "ImageReferenceEntity": {
              "imageStudy": {
                "imageSeries": {
                  "modality": {
                    "code": "CT",
                    "codeSystemName": "DCM",
                    "iso:displayName": {
                      "xmlns:iso": "uri:iso.org:21090",
                      "value": "Computed Tomography"
                    },
                    "codeSystemVersion": 20121129
                  },
                  "imageCollection": {
                    "Image": {
                      "sopClassUid": {
                        "root": "1.2.840.10008.5.1.4.1.1.2"
                      },
                      "sopInstanceUid": {
                        "root": "1.2.840.113704.7.1.1.676.1223562009.2"
                      }
                    }
                  },
                  "instanceUid": {
                    "root": "1.2.840.113704.1.111.1916.1223561968.3"
                  }
                },
                "startTime": {
                  "value": "091816"
                },
                "instanceUid": {
                  "root": "1.2.840.113704.1.111.1916.1223561896.1"
                },
                "startDate": {
                  "value": 20081009
                },
                "accessionNumber": {
                  "value": 0
                }
              },
              "xsi:type": "DicomImageReferenceEntity",
              "uniqueIdentifier": {
                "root": "2.25.104197003089487875590237720368214852763"
              }
            }
          },
          "trackingUniqueIdentifier": {
            "root": "2.25.203442060542821561932666725682425693199"
          },
          "imagingObservationEntityCollection": {
            "ImagingObservationEntity": [
              {
                "annotatorConfidence": {
                  "value": 0
                },
                "label": {
                  "value": "Lesion Quality"
                },
                "uniqueIdentifier": {
                  "root": "2.25.258306934801559844534718278486670205243"
                },
                "typeCode": {
                  "code": "S86",
                  "codeSystemName": "99EPAD",
                  "iso:displayName": {
                    "xmlns:iso": "uri:iso.org:21090",
                    "value": "Evaluable"
                  },
                  "codeSystemVersion": 1
                }
              },
              {
                "annotatorConfidence": {
                  "value": 0
                },
                "label": {
                  "value": "Lesion Quality"
                },
                "uniqueIdentifier": {
                  "root": "2.25.184658424719797542383415350278087260626"
                },
                "typeCode": {
                  "code": "RID39225",
                  "codeSystemName": "Radlex",
                  "iso:displayName": {
                    "xmlns:iso": "uri:iso.org:21090",
                    "value": "Nonevaluable"
                  }
                }
              },
              {
                "imagingObservationCharacteristicCollection": {
                  "ImagingObservationCharacteristic": [
                    {
                      "annotatorConfidence": {
                        "value": 0
                      },
                      "label": {
                        "value": "Timepoint"
                      },
                      "characteristicQuantificationCollection": {
                        "CharacteristicQuantification": {
                          "valueLabel": {
                            "value": "FU2"
                          },
                          "xsi:type": "Scale",
                          "annotatorConfidence": {
                            "value": 0
                          },
                          "label": {
                            "value": "Timepoint"
                          },
                          "type": "Nominal",
                          "value": {
                            "value": 2
                          }
                        }
                      },
                      "typeCode": {
                        "code": "S90",
                        "codeSystemName": "99EPAD",
                        "iso:displayName": {
                          "xmlns:iso": "uri:iso.org:21090",
                          "value": "FU Number (0=Baseline)"
                        },
                        "codeSystemVersion": 1
                      }
                    },
                    {
                      "annotatorConfidence": {
                        "value": 0
                      },
                      "label": {
                        "value": "Type"
                      },
                      "typeCode": {
                        "code": "S71",
                        "codeSystemName": "99EPAD",
                        "iso:displayName": {
                          "xmlns:iso": "uri:iso.org:21090",
                          "value": "Target Lesion"
                        },
                        "codeSystemVersion": 1
                      }
                    },
                    {
                      "annotatorConfidence": {
                        "value": 0
                      },
                      "label": {
                        "value": "Lesion Status"
                      },
                      "typeCode": {
                        "code": "RID28472",
                        "codeSystemName": "RadLex",
                        "iso:displayName": {
                          "xmlns:iso": "uri:iso.org:21090",
                          "value": "Present Lesion"
                        }
                      }
                    },
                    {
                      "annotatorConfidence": {
                        "value": 0
                      },
                      "label": {
                        "value": "Lesion Enhancement"
                      },
                      "typeCode": {
                        "code": "RID6055",
                        "codeSystemName": "RadLex",
                        "iso:displayName": {
                          "xmlns:iso": "uri:iso.org:21090",
                          "value": "Enhancing"
                        }
                      }
                    },
                    {
                      "annotatorConfidence": {
                        "value": 0
                      },
                      "label": {
                        "value": "Lesion Enhancement"
                      },
                      "typeCode": {
                        "code": "RID6056",
                        "codeSystemName": "RadLex",
                        "iso:displayName": {
                          "xmlns:iso": "uri:iso.org:21090",
                          "value": "Nonenhancing"
                        }
                      }
                    }
                  ]
                },
                "annotatorConfidence": {
                  "value": 0
                },
                "label": {
                  "value": "Lesion Quality"
                },
                "uniqueIdentifier": {
                  "root": "2.25.95086752229066622316267596475382549176"
                },
                "typeCode": {
                  "code": "RID39220",
                  "codeSystemName": "Radlex",
                  "iso:displayName": {
                    "xmlns:iso": "uri:iso.org:21090",
                    "value": "added test"
                  }
                }
              }
            ]
          },
          "markupEntityCollection": {
            "MarkupEntity": {
              "includeFlag": {
                "value": true
              },
              "shapeIdentifier": {
                "value": 1
              },
              "referencedFrameNumber": {
                "value": 1
              },
              "xsi:type": "TwoDimensionMultiPoint",
              "twoDimensionSpatialCoordinateCollection": {
                "TwoDimensionSpatialCoordinate": [
                  {
                    "x": {
                      "value": 151.36633663366337
                    },
                    "coordinateIndex": {
                      "value": 0
                    },
                    "y": {
                      "value": 422.56435643564356
                    }
                  },
                  {
                    "x": {
                      "value": 318.950495049505
                    },
                    "coordinateIndex": {
                      "value": 1
                    },
                    "y": {
                      "value": 327.96039603960395
                    }
                  }
                ]
              },
              "uniqueIdentifier": {
                "root": "2.25.125240810751101929350243081775661506324"
              },
              "imageReferenceUid": {
                "root": "1.2.840.113704.7.1.1.676.1223562009.2"
              }
            }
          },
          "imagingPhysicalEntityCollection": {
            "ImagingPhysicalEntity": {
              "annotatorConfidence": {
                "value": 0
              },
              "label": {
                "value": "Location"
              },
              "uniqueIdentifier": {
                "root": "2.25.41610212052259392209446371003392354983"
              },
              "typeCode": {
                "code": "RID58",
                "codeSystemName": "RadLex",
                "iso:displayName": {
                  "xmlns:iso": "uri:iso.org:21090",
                  "value": "liver"
                }
              }
            }
          },
          "name": {
            "value": "kkkkkkkk~sp1~-~sp1~-1~sp1~#FFFFFF"
          },
          "comment": {
            "value": "CT / SCOUT / 1 / 9100~~kkkkk"
          },
          "calculationEntityCollection": {
            "CalculationEntity": [
              {
                "calculationResultCollection": {
                  "CalculationResult": {
                    "unitOfMeasure": {
                      "value": "cm"
                    },
                    "dataType": {
                      "code": "C48870",
                      "codeSystemName": "NCI",
                      "iso:displayName": {
                        "xmlns:iso": "uri:iso.org:21090",
                        "value": "Double"
                      }
                    },
                    "xsi:type": "CompactCalculationResult",
                    "dimensionCollection": {
                      "Dimension": {
                        "size": {
                          "value": 1
                        },
                        "index": {
                          "value": 0
                        },
                        "label": {
                          "value": "LineLength"
                        }
                      }
                    },
                    "type": "Scalar",
                    "value": {
                      "value": 18.793275952339172
                    }
                  }
                },
                "description": {
                  "value": "Length"
                },
                "uniqueIdentifier": {
                  "root": "2.25.219158624455432134392374565972215836738"
                },
                "typeCode": {
                  "code": "G-D7FE",
                  "codeSystemName": "SRT",
                  "iso:displayName": {
                    "xmlns:iso": "uri:iso.org:21090",
                    "value": "Length"
                  }
                }
              },
              {
                "calculationResultCollection": {
                  "CalculationResult": {
                    "unitOfMeasure": {
                      "value": "[hnsf'U]"
                    },
                    "dataType": {
                      "code": "C48870",
                      "codeSystemName": "NCI",
                      "iso:displayName": {
                        "xmlns:iso": "uri:iso.org:21090",
                        "value": "Double"
                      }
                    },
                    "xsi:type": "CompactCalculationResult",
                    "dimensionCollection": {
                      "Dimension": {
                        "size": {
                          "value": 1
                        },
                        "index": {
                          "value": 0
                        },
                        "label": {
                          "value": "Mean"
                        }
                      }
                    },
                    "type": "Scalar",
                    "value": {
                      "value": 339.3098958333333
                    }
                  }
                },
                "description": {
                  "value": "Mean"
                },
                "uniqueIdentifier": {
                  "root": "2.25.211115486419840759298611091420374789953"
                },
                "typeCode": [
                  {
                    "code": 112031,
                    "codeSystemName": "DCM",
                    "iso:displayName": {
                      "xmlns:iso": "uri:iso.org:21090",
                      "value": "Attenuation Coefficient"
                    }
                  },
                  {
                    "code": "R-00317",
                    "codeSystemName": "SRT",
                    "iso:displayName": {
                      "xmlns:iso": "uri:iso.org:21090",
                      "value": "Mean"
                    }
                  }
                ]
              },
              {
                "calculationResultCollection": {
                  "CalculationResult": {
                    "unitOfMeasure": {
                      "value": "[hnsf'U]"
                    },
                    "dataType": {
                      "code": "C48870",
                      "codeSystemName": "NCI",
                      "iso:displayName": {
                        "xmlns:iso": "uri:iso.org:21090",
                        "value": "Double"
                      }
                    },
                    "xsi:type": "CompactCalculationResult",
                    "dimensionCollection": {
                      "Dimension": {
                        "size": {
                          "value": 1
                        },
                        "index": {
                          "value": 0
                        },
                        "label": {
                          "value": "Standard Deviation"
                        }
                      }
                    },
                    "type": "Scalar",
                    "value": {
                      "value": 104.59570132374374
                    }
                  }
                },
                "description": {
                  "value": "Standard Deviation"
                },
                "uniqueIdentifier": {
                  "root": "2.25.104024133390620480019901314394315048375"
                },
                "typeCode": [
                  {
                    "code": 112031,
                    "codeSystemName": "DCM",
                    "iso:displayName": {
                      "xmlns:iso": "uri:iso.org:21090",
                      "value": "Attenuation Coefficient"
                    }
                  },
                  {
                    "code": "R-10047",
                    "codeSystemName": "SRT",
                    "iso:displayName": {
                      "xmlns:iso": "uri:iso.org:21090",
                      "value": "Standard Deviation"
                    }
                  }
                ]
              },
              {
                "calculationResultCollection": {
                  "CalculationResult": {
                    "unitOfMeasure": {
                      "value": "[hnsf'U]"
                    },
                    "dataType": {
                      "code": "C48870",
                      "codeSystemName": "NCI",
                      "iso:displayName": {
                        "xmlns:iso": "uri:iso.org:21090",
                        "value": "Double"
                      }
                    },
                    "xsi:type": "CompactCalculationResult",
                    "dimensionCollection": {
                      "Dimension": {
                        "size": {
                          "value": 1
                        },
                        "index": {
                          "value": 0
                        },
                        "label": {
                          "value": "Minimum"
                        }
                      }
                    },
                    "type": "Scalar",
                    "value": {
                      "value": 69
                    }
                  }
                },
                "description": {
                  "value": "Minimum"
                },
                "uniqueIdentifier": {
                  "root": "2.25.258230350062787458979437484716824994596"
                },
                "typeCode": [
                  {
                    "code": 112031,
                    "codeSystemName": "DCM",
                    "iso:displayName": {
                      "xmlns:iso": "uri:iso.org:21090",
                      "value": "Attenuation Coefficient"
                    }
                  },
                  {
                    "code": "R-404FB",
                    "codeSystemName": "SRT",
                    "iso:displayName": {
                      "xmlns:iso": "uri:iso.org:21090",
                      "value": "Minimum"
                    }
                  }
                ]
              },
              {
                "calculationResultCollection": {
                  "CalculationResult": {
                    "unitOfMeasure": {
                      "value": "[hnsf'U]"
                    },
                    "dataType": {
                      "code": "C48870",
                      "codeSystemName": "NCI",
                      "iso:displayName": {
                        "xmlns:iso": "uri:iso.org:21090",
                        "value": "Double"
                      }
                    },
                    "xsi:type": "CompactCalculationResult",
                    "dimensionCollection": {
                      "Dimension": {
                        "size": {
                          "value": 1
                        },
                        "index": {
                          "value": 0
                        },
                        "label": {
                          "value": "Maximum"
                        }
                      }
                    },
                    "type": "Scalar",
                    "value": {
                      "value": 646
                    }
                  }
                },
                "description": {
                  "value": "Maximum"
                },
                "uniqueIdentifier": {
                  "root": "2.25.200049922669616618654018433134043355211"
                },
                "typeCode": [
                  {
                    "code": 112031,
                    "codeSystemName": "DCM",
                    "iso:displayName": {
                      "xmlns:iso": "uri:iso.org:21090",
                      "value": "Attenuation Coefficient"
                    }
                  },
                  {
                    "code": "G-A437",
                    "codeSystemName": "SRT",
                    "iso:displayName": {
                      "xmlns:iso": "uri:iso.org:21090",
                      "value": "Maximum"
                    }
                  }
                ]
              }
            ]
          },
          "uniqueIdentifier": {
            "root": "2.25.180134556409074638433196061157972646305"
          },
          "typeCode": {
            "code": "RECIST_v2",
            "codeSystemName": "99EPAD",
            "iso:displayName": {
              "xmlns:iso": "uri:iso.org:21090",
              "value": "Tumor assessment"
            }
          }
        }
      },
      "xsi:schemaLocation": "gme://caCORE.caCORE/4.4/edu.northwestern.radiology.AIM AIM_v4.2_rv2_XML.xsd",
      "equipment": {
        "manufacturerName": {
          "value": "Philips"
        },
        "manufacturerModelName": {
          "value": "Mx8000 IDT 10"
        },
        "softwareVersion": {
          "value": "3.2.0"
        }
      },
      "xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
      "xmlns:rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
      "accessionNumber": {
        "value": 0
      },
      "xmlns": "gme://caCORE.caCORE/4.4/edu.northwestern.radiology.AIM",
      "person": {
        "sex": {
          "value": "M"
        },
        "name": {
          "value": "7^3225^4503"
        },
        "id": {
          "value": 7
        },
        "birthDate": {
          "value": 18001101000000
        }
      },
      "user": {
        "loginName": {
          "value": "admin"
        },
        "name": {
          "value": "admin"
        }
      },
      "uniqueIdentifier": {
        "root": "2.25.328584860413181161672130030015753962915"
      }
    }
  }
}

//export next variable for react
export  var aimjsonBeauLieuBoneTemplate_rev18 ={
  "imageAnnotations": {
    "ImageAnnotationCollection": {
      "aimVersion": "AIMv4_2",
      "dateTime": {
        "value": 20190330133243
      },
      "seriesInstanceUid": {
        "root": "2.25.202502222771878707397830872861721661288"
      },
      "studyInstanceUid": {
        "root": "1.2.840.113619.2.294.3.2819264857.824.1349214491.691"
      },
      "imageAnnotations": {
        "ImageAnnotation": {
          "dateTime": {
            "value": "03.30.2019T08:32:47PM.Zone:GMT"
          },
          "imageAnnotationStatementCollection": {
            "ImageAnnotationStatement": [
              {
                "xsi:type": "CalculationEntityReferencesMarkupEntityStatement",
                "objectUniqueIdentifier": {
                  "root": "2.25.263880245585606430730142288540757288952"
                },
                "subjectUniqueIdentifier": {
                  "root": "2.25.326327674643861274511449998288215857542"
                }
              },
              {
                "xsi:type": "CalculationEntityReferencesMarkupEntityStatement",
                "objectUniqueIdentifier": {
                  "root": "2.25.263880245585606430730142288540757288952"
                },
                "subjectUniqueIdentifier": {
                  "root": "2.25.212998686717849596829439450656600875754"
                }
              },
              {
                "xsi:type": "CalculationEntityReferencesMarkupEntityStatement",
                "objectUniqueIdentifier": {
                  "root": "2.25.263880245585606430730142288540757288952"
                },
                "subjectUniqueIdentifier": {
                  "root": "2.25.44370075759058498580517835445578375801"
                }
              },
              {
                "xsi:type": "CalculationEntityReferencesMarkupEntityStatement",
                "objectUniqueIdentifier": {
                  "root": "2.25.263880245585606430730142288540757288952"
                },
                "subjectUniqueIdentifier": {
                  "root": "2.25.338237817306755724650145232157420239729"
                }
              },
              {
                "xsi:type": "CalculationEntityReferencesMarkupEntityStatement",
                "objectUniqueIdentifier": {
                  "root": "2.25.263880245585606430730142288540757288952"
                },
                "subjectUniqueIdentifier": {
                  "root": "2.25.286072653405190280596289046430130873076"
                }
              }
            ]
          },
          "imageReferenceEntityCollection": {
            "ImageReferenceEntity": {
              "imageStudy": {
                "imageSeries": {
                  "modality": {
                    "code": "CT",
                    "codeSystemName": "DCM",
                    "iso:displayName": {
                      "xmlns:iso": "uri:iso.org:21090",
                      "value": "Computed Tomography"
                    },
                    "codeSystemVersion": 20121129
                  },
                  "imageCollection": {
                    "Image": {
                      "sopClassUid": {
                        "root": "1.2.840.10008.5.1.4.1.1.2"
                      },
                      "sopInstanceUid": {
                        "root": "1.2.840.113619.2.294.3.2819264857.824.1349214491.775.1"
                      }
                    }
                  },
                  "instanceUid": {
                    "root": "1.2.840.113619.2.294.3.2819264857.824.1349214491.698.5"
                  }
                },
                "startTime": {
                  "value": 115510
                },
                "instanceUid": {
                  "root": "1.2.840.113619.2.294.3.2819264857.824.1349214491.691"
                },
                "startDate": {
                  "value": 20121003
                },
                "accessionNumber": {
                  "value": "EA1E6DE5"
                }
              },
              "xsi:type": "DicomImageReferenceEntity",
              "uniqueIdentifier": {
                "root": "2.25.163131118582228407467274495436789359787"
              }
            }
          },
          "imagingObservationEntityCollection": {
            "ImagingObservationEntity": {
              "imagingObservationCharacteristicCollection": {
                "ImagingObservationCharacteristic": [
                  {
                    "annotatorConfidence": {
                      "value": 0
                    },
                    "label": {
                      "value": "Diagnosis"
                    },
                    "typeCode": {
                      "code": "RID3711",
                      "codeSystemName": "RadLex",
                      "iso:displayName": {
                        "xmlns:iso": "uri:iso.org:21090",
                        "value": "abscess"
                      },
                      
                      "codeSystemVersion": 1
                    },
                    "comment":{"value":"diagno"}
                  },
                  {
                    "annotatorConfidence": {
                      "value": 0
                    },
                    "label": {
                      "value": "Imaging Phase"
                    },
                    "typeCode": {
                      "code": "RID11082",
                      "codeSystemName": "RadLex",
                      "iso:displayName": {
                        "xmlns:iso": "uri:iso.org:21090",
                        "value": "early arterial phase"
                      },
                      "codeSystemVersion": 1
                    }
                  },
                  {
                    "annotatorConfidence": {
                      "value": 0
                    },
                    "label": {
                      "value": "Focality of Lesion"
                    },
                    "typeCode": {
                      "code": "RID43312",
                      "codeSystemName": "RadLex",
                      "iso:displayName": {
                        "xmlns:iso": "uri:iso.org:21090",
                        "value": "solitary lesion"
                      },
                      "codeSystemVersion": 1
                    }
                  },
                  {
                    "annotatorConfidence": {
                      "value": 0
                    },
                    "label": {
                      "value": "Shape Descriptors"
                    },
                    "typeCode": {
                      "code": "RID5799",
                      "codeSystemName": "RadLex",
                      "iso:displayName": {
                        "xmlns:iso": "uri:iso.org:21090",
                        "value": "round"
                      },
                      "codeSystemVersion": 1
                    }
                  },
                  {
                    "annotatorConfidence": {
                      "value": 0.76
                    },
                    "label": {
                      "value": "Margin Contours: Smooth to Irregular"
                    },
                    "typeCode": {
                      "code": "RID5714",
                      "codeSystemName": "ISIS_LIVER",
                      "iso:displayName": {
                        "xmlns:iso": "uri:iso.org:21090",
                        "value": "smooth margin"
                      },
                      "codeSystemVersion": 1
                    }
                  },
                  {
                    "annotatorConfidence": {
                      "value": 0
                    },
                    "label": {
                      "value": "Average Lesion Density: Hypo to Hyperdense"
                    },
                    "typeCode": {
                      "code": "RID6042",
                      "codeSystemName": "RadLex",
                      "iso:displayName": {
                        "xmlns:iso": "uri:iso.org:21090",
                        "value": "hypodense"
                      },
                      "codeSystemVersion": 1
                    }
                  },
                  {
                    "annotatorConfidence": {
                      "value": 0
                    },
                    "label": {
                      "value": "Density - Homogeneous or Heterogeneous"
                    },
                    "typeCode": {
                      "code": "RID6059",
                      "codeSystemName": "RadLex",
                      "iso:displayName": {
                        "xmlns:iso": "uri:iso.org:21090",
                        "value": "homogeneous"
                      },
                      "codeSystemVersion": 1
                    }
                  },
                  {
                    "annotatorConfidence": {
                      "value": 0
                    },
                    "label": {
                      "value": "Enhancement"
                    },
                    "typeCode": {
                      "code": "RID6056",
                      "codeSystemName": "RadLex",
                      "iso:displayName": {
                        "xmlns:iso": "uri:iso.org:21090",
                        "value": "nonenhancing"
                      },
                      "codeSystemVersion": 1
                    }
                  },
                  {
                    "annotatorConfidence": {
                      "value": 0
                    },
                    "label": {
                      "value": "Enhancement Uniformity"
                    },
                    "typeCode": {
                      "code": "RID39563",
                      "codeSystemName": "RadLex",
                      "iso:displayName": {
                        "xmlns:iso": "uri:iso.org:21090",
                        "value": "homogeneous enhancement"
                      },
                      "codeSystemVersion": 1
                    }
                  },
                  {
                    "annotatorConfidence": {
                      "value": 0
                    },
                    "label": {
                      "value": "Specific Enhancement Pattern(s)"
                    },
                    "typeCode": {
                      "code": "RID34421",
                      "codeSystemName": "RadLex",
                      "iso:displayName": {
                        "xmlns:iso": "uri:iso.org:21090",
                        "value": "homogeneous internal enhancement"
                      },
                      "codeSystemVersion": 1
                    }
                  },
                  {
                    "annotatorConfidence": {
                      "value": 0
                    },
                    "label": {
                      "value": "Temporal Enhancement (if known)"
                    },
                    "typeCode": {
                      "code": "RID43338",
                      "codeSystemName": "RadLex",
                      "iso:displayName": {
                        "xmlns:iso": "uri:iso.org:21090",
                        "value": "homogeneous retention"
                      },
                      "codeSystemVersion": 1
                    }
                  },
                  {
                    "annotatorConfidence": {
                      "value": 0
                    },
                    "label": {
                      "value": "Septation Thickness"
                    },
                    "typeCode": {
                      "code": "RID45676",
                      "codeSystemName": "ISIS_LIVER",
                      "iso:displayName": {
                        "xmlns:iso": "uri:iso.org:21090",
                        "value": "thick septae"
                      },
                      "codeSystemVersion": 1
                    }
                  },
                  {
                    "annotatorConfidence": {
                      "value": 0
                    },
                    "label": {
                      "value": "Perilesional Tissue"
                    },
                    "typeCode": {
                      "code": "RID43300",
                      "codeSystemName": "RadLex",
                      "iso:displayName": {
                        "xmlns:iso": "uri:iso.org:21090",
                        "value": "perilesional perfusion alteration"
                      },
                      "codeSystemVersion": 1
                    }
                  },
                  {
                    "annotatorConfidence": {
                      "value": 0
                    },
                    "label": {
                      "value": "Special Features"
                    },
                    "typeCode": {
                      "code": "RID5196",
                      "codeSystemName": "RadLex",
                      "iso:displayName": {
                        "xmlns:iso": "uri:iso.org:21090",
                        "value": "calcification"
                      },
                      "codeSystemVersion": 1
                    }
                  },
                  {
                    "annotatorConfidence": {
                      "value": 0
                    },
                    "label": {
                      "value": "Special Features"
                    },
                    "typeCode": {
                      "code": "RID43346",
                      "codeSystemName": "RadLex",
                      "iso:displayName": {
                        "xmlns:iso": "uri:iso.org:21090",
                        "value": "blood products (lesion)"
                      },
                      "codeSystemVersion": 1
                    }
                  },
                  {
                    "annotatorConfidence": {
                      "value": 0
                    },
                    "label": {
                      "value": "Lesion Effects on Liver"
                    },
                    "typeCode": {
                      "code": "RID43327",
                      "codeSystemName": "RadLex",
                      "iso:displayName": {
                        "xmlns:iso": "uri:iso.org:21090",
                        "value": "abuts capsule of liver"
                      },
                      "codeSystemVersion": 1
                    }
                  },
                  {
                    "annotatorConfidence": {
                      "value": 0
                    },
                    "label": {
                      "value": "Primary Malignancy if Metastatic Disease"
                    },
                    "typeCode": {
                      "code": "RID28454",
                      "codeSystemName": "RadLex",
                      "iso:displayName": {
                        "xmlns:iso": "uri:iso.org:21090",
                        "value": "none"
                      },
                      "codeSystemVersion": 1
                    }
                  }
                ]
              },
              "annotatorConfidence": {
                "value": 0
              },
              "comment": {
                "value": ""
              },
              "label": {
                "value": "Lesion Type"
              },
              "uniqueIdentifier": {
                "root": "2.25.192004766015721505824247264535984180591"
              },
              "typeCode": {
                "code": "RID39466",
                "codeSystemName": "RadLex",
                "iso:displayName": {
                  "xmlns:iso": "uri:iso.org:21090",
                  "value": "liver mass"
                },
                "codeSystemVersion": 1
              }
            }
          },
          "markupEntityCollection": {
            "MarkupEntity": {
              "includeFlag": {
                "value": true
              },
              "shapeIdentifier": {
                "value": 1
              },
              "referencedFrameNumber": {
                "value": 1
              },
              "xsi:type": "TwoDimensionMultiPoint",
              "twoDimensionSpatialCoordinateCollection": {
                "TwoDimensionSpatialCoordinate": [
                  {
                    "x": {
                      "value": 116.03080308030802
                    },
                    "coordinateIndex": {
                      "value": 0
                    },
                    "y": {
                      "value": 339.08030803080305
                    }
                  },
                  {
                    "x": {
                      "value": 194.32343234323432
                    },
                    "coordinateIndex": {
                      "value": 1
                    },
                    "y": {
                      "value": 334.57425742574253
                    }
                  }
                ]
              },
              "uniqueIdentifier": {
                "root": "2.25.263880245585606430730142288540757288952"
              },
              "imageReferenceUid": {
                "root": "1.2.840.113619.2.294.3.2819264857.824.1349214491.775.1"
              }
            }
          },
          "imagingPhysicalEntityCollection": {
            "ImagingPhysicalEntity": [
              {
                "annotatorConfidence": {
                  "value": 0
                },
                "comment": {
                  "value": ""
                },
                "label": {
                  "value": "Lobar Location"
                },
                "uniqueIdentifier": {
                  "root": "2.25.297662255074915629442154505030440846704"
                },
                "typeCode": {
                  "code": "RID58",
                  "codeSystemName": "RadLex",
                  "iso:displayName": {
                    "xmlns:iso": "uri:iso.org:21090",
                    "value": "liver"
                  },
                  "codeSystemVersion": 1
                }
              },
              {
                "annotatorConfidence": {
                  "value": 0
                },
                "comment": {
                  "value": ""
                },
                "label": {
                  "value": "Segmental Location"
                },
                "uniqueIdentifier": {
                  "root": "2.25.172559799788508493603514544397076275106"
                },
                "typeCode": {
                  "code": "RID62",
                  "codeSystemName": "RadLex",
                  "iso:displayName": {
                    "xmlns:iso": "uri:iso.org:21090",
                    "value": "hepatovenous segment II"
                  },
                  "codeSystemVersion": 1
                }
              }
            ]
          },
          "name": {
            "value": "bbbb~sp1~-~sp1~-1~sp1~#FFFFFF"
          },
          "comment": {
            "value": "CT / THIN LUNG WINDOW / 1 / 5~~bbbbb"
          },
          "calculationEntityCollection": {
            "CalculationEntity": [
              {
                "calculationResultCollection": {
                  "CalculationResult": {
                    "unitOfMeasure": {
                      "value": "cm"
                    },
                    "dataType": {
                      "code": "C48870",
                      "codeSystemName": "NCI",
                      "iso:displayName": {
                        "xmlns:iso": "uri:iso.org:21090",
                        "value": "Double"
                      }
                    },
                    "xsi:type": "CompactCalculationResult",
                    "dimensionCollection": {
                      "Dimension": {
                        "size": {
                          "value": 1
                        },
                        "index": {
                          "value": 0
                        },
                        "label": {
                          "value": "LineLength"
                        }
                      }
                    },
                    "type": "Scalar",
                    "value": {
                      "value": 5.514060080051422
                    }
                  }
                },
                "description": {
                  "value": "Length"
                },
                "uniqueIdentifier": {
                  "root": "2.25.326327674643861274511449998288215857542"
                },
                "typeCode": {
                  "code": "G-D7FE",
                  "codeSystemName": "SRT",
                  "iso:displayName": {
                    "xmlns:iso": "uri:iso.org:21090",
                    "value": "Length"
                  }
                }
              },
              {
                "calculationResultCollection": {
                  "CalculationResult": {
                    "unitOfMeasure": {
                      "value": "[hnsf'U]"
                    },
                    "dataType": {
                      "code": "C48870",
                      "codeSystemName": "NCI",
                      "iso:displayName": {
                        "xmlns:iso": "uri:iso.org:21090",
                        "value": "Double"
                      }
                    },
                    "xsi:type": "CompactCalculationResult",
                    "dimensionCollection": {
                      "Dimension": {
                        "size": {
                          "value": 1
                        },
                        "index": {
                          "value": 0
                        },
                        "label": {
                          "value": "Mean"
                        }
                      }
                    },
                    "type": "Scalar",
                    "value": {
                      "value": -32.89808917197452
                    }
                  }
                },
                "description": {
                  "value": "Mean"
                },
                "uniqueIdentifier": {
                  "root": "2.25.212998686717849596829439450656600875754"
                },
                "typeCode": [
                  {
                    "code": 112031,
                    "codeSystemName": "DCM",
                    "iso:displayName": {
                      "xmlns:iso": "uri:iso.org:21090",
                      "value": "Attenuation Coefficient"
                    }
                  },
                  {
                    "code": "R-00317",
                    "codeSystemName": "SRT",
                    "iso:displayName": {
                      "xmlns:iso": "uri:iso.org:21090",
                      "value": "Mean"
                    }
                  }
                ]
              },
              {
                "calculationResultCollection": {
                  "CalculationResult": {
                    "unitOfMeasure": {
                      "value": "[hnsf'U]"
                    },
                    "dataType": {
                      "code": "C48870",
                      "codeSystemName": "NCI",
                      "iso:displayName": {
                        "xmlns:iso": "uri:iso.org:21090",
                        "value": "Double"
                      }
                    },
                    "xsi:type": "CompactCalculationResult",
                    "dimensionCollection": {
                      "Dimension": {
                        "size": {
                          "value": 1
                        },
                        "index": {
                          "value": 0
                        },
                        "label": {
                          "value": "Standard Deviation"
                        }
                      }
                    },
                    "type": "Scalar",
                    "value": {
                      "value": 79.21101260962222
                    }
                  }
                },
                "description": {
                  "value": "Standard Deviation"
                },
                "uniqueIdentifier": {
                  "root": "2.25.44370075759058498580517835445578375801"
                },
                "typeCode": [
                  {
                    "code": 112031,
                    "codeSystemName": "DCM",
                    "iso:displayName": {
                      "xmlns:iso": "uri:iso.org:21090",
                      "value": "Attenuation Coefficient"
                    }
                  },
                  {
                    "code": "R-10047",
                    "codeSystemName": "SRT",
                    "iso:displayName": {
                      "xmlns:iso": "uri:iso.org:21090",
                      "value": "Standard Deviation"
                    }
                  }
                ]
              },
              {
                "calculationResultCollection": {
                  "CalculationResult": {
                    "unitOfMeasure": {
                      "value": "[hnsf'U]"
                    },
                    "dataType": {
                      "code": "C48870",
                      "codeSystemName": "NCI",
                      "iso:displayName": {
                        "xmlns:iso": "uri:iso.org:21090",
                        "value": "Double"
                      }
                    },
                    "xsi:type": "CompactCalculationResult",
                    "dimensionCollection": {
                      "Dimension": {
                        "size": {
                          "value": 1
                        },
                        "index": {
                          "value": 0
                        },
                        "label": {
                          "value": "Minimum"
                        }
                      }
                    },
                    "type": "Scalar",
                    "value": {
                      "value": -287
                    }
                  }
                },
                "description": {
                  "value": "Minimum"
                },
                "uniqueIdentifier": {
                  "root": "2.25.338237817306755724650145232157420239729"
                },
                "typeCode": [
                  {
                    "code": 112031,
                    "codeSystemName": "DCM",
                    "iso:displayName": {
                      "xmlns:iso": "uri:iso.org:21090",
                      "value": "Attenuation Coefficient"
                    }
                  },
                  {
                    "code": "R-404FB",
                    "codeSystemName": "SRT",
                    "iso:displayName": {
                      "xmlns:iso": "uri:iso.org:21090",
                      "value": "Minimum"
                    }
                  }
                ]
              },
              {
                "calculationResultCollection": {
                  "CalculationResult": {
                    "unitOfMeasure": {
                      "value": "[hnsf'U]"
                    },
                    "dataType": {
                      "code": "C48870",
                      "codeSystemName": "NCI",
                      "iso:displayName": {
                        "xmlns:iso": "uri:iso.org:21090",
                        "value": "Double"
                      }
                    },
                    "xsi:type": "CompactCalculationResult",
                    "dimensionCollection": {
                      "Dimension": {
                        "size": {
                          "value": 1
                        },
                        "index": {
                          "value": 0
                        },
                        "label": {
                          "value": "Maximum"
                        }
                      }
                    },
                    "type": "Scalar",
                    "value": {
                      "value": 165
                    }
                  }
                },
                "description": {
                  "value": "Maximum"
                },
                "uniqueIdentifier": {
                  "root": "2.25.286072653405190280596289046430130873076"
                },
                "typeCode": [
                  {
                    "code": 112031,
                    "codeSystemName": "DCM",
                    "iso:displayName": {
                      "xmlns:iso": "uri:iso.org:21090",
                      "value": "Attenuation Coefficient"
                    }
                  },
                  {
                    "code": "G-A437",
                    "codeSystemName": "SRT",
                    "iso:displayName": {
                      "xmlns:iso": "uri:iso.org:21090",
                      "value": "Maximum"
                    }
                  }
                ]
              }
            ]
          },
          "uniqueIdentifier": {
            "root": "2.25.249331087460873983023898760793240965141"
          },
          "typeCode": {
            "code": "RID58-2",
            "codeSystemName": "RadLex",
            "iso:displayName": {
              "xmlns:iso": "uri:iso.org:21090",
              "value": "liver15"
            }
          },
          "precedentReferencedAnnotationUid": {
            "root": "2.25.25631147013691758744960947886987941140"
          }
        }
      },
      "xsi:schemaLocation": "gme://caCORE.caCORE/4.4/edu.northwestern.radiology.AIM AIM_v4.2_rv2_XML.xsd",
      "equipment": {
        "manufacturerName": {
          "value": "GE MEDICAL SYSTEMS"
        },
        "manufacturerModelName": {
          "value": "Discovery CT750 HD"
        },
        "softwareVersion": {
          "value": "gsi_mict_plus.145"
        }
      },
      "xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
      "xmlns:rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
      "accessionNumber": {
        "value": "EA1E6DE5"
      },
      "xmlns": "gme://caCORE.caCORE/4.4/edu.northwestern.radiology.AIM",
      "person": {
        "sex": {
          "value": "M"
        },
        "name": {
          "value": "BARTON^LOGAN^G"
        },
        "id": {
          "value": "BD5B6BC8"
        },
        "birthDate": {
          "value": 19400512000000
        }
      },
      "user": {
        "loginName": {
          "value": "admin"
        },
        "name": {
          "value": "admin"
        }
      },
      "uniqueIdentifier": {
        "root": "2.25.226726782562660051516205522021729011282"
      }
    }
  }
};
export var anyShapeTemplate = {
   "authors": "The AIM team",
   "creationDate": "2014-10-10",
   "description": "This template is used to collect ROI Line only from readers.",
   "name": "Any Shape Container",
   "uid": "2.25.7139485200343.2147918891082.145090474679.2",
   "version": "1",
   "schemaLocation": "gme://caCORE.caCORE/3.2/edu.northwestern.radiology.AIMTemplate AIMTemplate_v2rv13.xsd",
   "Template": {
      "authors": "Daniel Rubin",
      "codeMeaning": "Any_Shape",
      "codeValue": "AnyShape",
      "codingSchemeDesignator": "RECIST",
      "codingSchemeVersion": "1.0",
      "creationDate": "2014-10-24",
      "description": "Template used for collecting only ROIs",
      "name": "Any Shape Template",
      "uid": "2.25.158009446295858919844005670982612161979.2",
      "version": "1.1",
      "Component": {
         "authors": "Daniel Rubin",
         "explanatoryText": "Draw a shape",
         "groupLabel": "",
         "id": "2.25.7139485201281.2147918892020.145090474711",
         "itemNumber": "0",
         "label": "Geomtric shape",
         "maxCardinality": "1",
         "minCardinality": "1",
         "shouldDisplay": "true",
         "GeometricShape": "AnyShape"
      }
   }
}



//export next variable for react
export  var annotationSavedXml='<?xml version="1.0" encoding="UTF-8"?><ImageAnnotationCollection xmlns="gme://caCORE.caCORE/4.4/edu.northwestern.radiology.AIM" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" aimVersion="AIMv4_2" xsi:schemaLocation="gme://caCORE.caCORE/4.4/edu.northwestern.radiology.AIM AIM_v4.2_rv2_XML.xsd"><uniqueIdentifier root="2.25.315158392848160637748108868094921498589"/><studyInstanceUid root="1.2.826.0.1.3680043.8.420.12307316984239077022721560039253479548"/><seriesInstanceUid root="2.25.276318872129538412910538591647326685134"/><accessionNumber value="5287533"/><dateTime value="20181102022712"/><user><name value="admin"/><loginName value="admin"/></user><equipment><manufacturerName value=""/><manufacturerModelName value=""/><softwareVersion value="syngo CT 2008G"/></equipment><person><name value="AM-1-251-129771"/><id value="129771061547608292133092105219228867067"/><birthDate value="19570214000000"/><sex value="F"/></person><imageAnnotations><ImageAnnotation><uniqueIdentifier root="2.25.304161604230927612403303669594261238112"/><typeCode code="RID58-2" codeSystemName="RadLex"><iso:displayName xmlns:iso="uri:iso.org:21090" value="liver15"/></typeCode><dateTime value="20181112021827"/><name value="rev_18~sp1~-~sp1~-1~sp1~#FFFFFF"/><comment value="CT / ARTERIAL PHASE  2.0  B25F / 0 / 4"/><imagingPhysicalEntityCollection><ImagingPhysicalEntity><uniqueIdentifier root="2.25.252610726732504134576747466742004255886"/><typeCode code="RID58" codeSystemName="RadLex" codeSystemVersion="1.0"><iso:displayName xmlns:iso="uri:iso.org:21090" value="liver"/></typeCode><annotatorConfidence value="0.0"/><label value="Lobar Location"/></ImagingPhysicalEntity><ImagingPhysicalEntity><uniqueIdentifier root="2.25.319098259893188982957419575568011073682"/><typeCode code="RID62" codeSystemName="RadLex" codeSystemVersion="1.0"><iso:displayName xmlns:iso="uri:iso.org:21090" value="hepatovenous segment II"/></typeCode><annotatorConfidence value="0.0"/><label value="Segmental Location"/></ImagingPhysicalEntity></imagingPhysicalEntityCollection><calculationEntityCollection><CalculationEntity><uniqueIdentifier root="2.25.139966971363069929048599894823256468905"/><typeCode code="G-D7FE" codeSystemName="SRT"><iso:displayName xmlns:iso="uri:iso.org:21090" value="Length"/></typeCode><description value="Length"/><calculationResultCollection><CalculationResult type="Scalar" xsi:type="CompactCalculationResult"><unitOfMeasure value="cm"/><dataType code="C48870" codeSystemName="NCI"><iso:displayName xmlns:iso="uri:iso.org:21090" value="Double"/></dataType><dimensionCollection><Dimension><index value="0"/><size value="1"/><label value="LineLength"/></Dimension></dimensionCollection><value value="6.1396812200546265"/></CalculationResult></calculationResultCollection></CalculationEntity><CalculationEntity><uniqueIdentifier root="2.25.98233874665002735164435464823758320746"/><typeCode code="112031" codeSystemName="DCM"><iso:displayName xmlns:iso="uri:iso.org:21090" value="Attenuation Coefficient"/></typeCode><typeCode code="R-00317" codeSystemName="SRT"><iso:displayName xmlns:iso="uri:iso.org:21090" value="Mean"/></typeCode><description value="Mean"/><calculationResultCollection><CalculationResult type="Scalar" xsi:type="CompactCalculationResult"><unitOfMeasure value="[hnsfU]"/><dataType code="C48870" codeSystemName="NCI"><iso:displayName xmlns:iso="uri:iso.org:21090" value="Double"/></dataType><dimensionCollection><Dimension><index value="0"/><size value="1"/><label value="Mean"/></Dimension></dimensionCollection><value value="105.30434782608695"/></CalculationResult></calculationResultCollection></CalculationEntity><CalculationEntity><uniqueIdentifier root="2.25.160783227489918149482523203070132715378"/><typeCode code="112031" codeSystemName="DCM"><iso:displayName xmlns:iso="uri:iso.org:21090" value="Attenuation Coefficient"/></typeCode><typeCode code="R-10047" codeSystemName="SRT"><iso:displayName xmlns:iso="uri:iso.org:21090" value="Standard Deviation"/></typeCode><description value="Standard Deviation"/><calculationResultCollection><CalculationResult type="Scalar" xsi:type="CompactCalculationResult"><unitOfMeasure value="[hnsfU]"/><dataType code="C48870" codeSystemName="NCI"><iso:displayName xmlns:iso="uri:iso.org:21090" value="Double"/></dataType><dimensionCollection><Dimension><index value="0"/><size value="1"/><label value="Standard Deviation"/></Dimension></dimensionCollection><value value="16.744719563800444"/></CalculationResult></calculationResultCollection></CalculationEntity><CalculationEntity><uniqueIdentifier root="2.25.268998517181098610140898258606586565120"/><typeCode code="112031" codeSystemName="DCM"><iso:displayName xmlns:iso="uri:iso.org:21090" value="Attenuation Coefficient"/></typeCode><typeCode code="R-404FB" codeSystemName="SRT"><iso:displayName xmlns:iso="uri:iso.org:21090" value="Minimum"/></typeCode><description value="Minimum"/><calculationResultCollection><CalculationResult type="Scalar" xsi:type="CompactCalculationResult"><unitOfMeasure value="[hnsfU]"/><dataType code="C48870" codeSystemName="NCI"><iso:displayName xmlns:iso="uri:iso.org:21090" value="Double"/></dataType><dimensionCollection><Dimension><index value="0"/><size value="1"/><label value="Minimum"/></Dimension></dimensionCollection><value value="57"/></CalculationResult></calculationResultCollection></CalculationEntity><CalculationEntity><uniqueIdentifier root="2.25.234089010419326141142289307624966597723"/><typeCode code="112031" codeSystemName="DCM"><iso:displayName xmlns:iso="uri:iso.org:21090" value="Attenuation Coefficient"/></typeCode><typeCode code="G-A437" codeSystemName="SRT"><iso:displayName xmlns:iso="uri:iso.org:21090" value="Maximum"/></typeCode><description value="Maximum"/><calculationResultCollection><CalculationResult type="Scalar" xsi:type="CompactCalculationResult"><unitOfMeasure value="[hnsfU]"/><dataType code="C48870" codeSystemName="NCI"><iso:displayName xmlns:iso="uri:iso.org:21090" value="Double"/></dataType><dimensionCollection><Dimension><index value="0"/><size value="1"/><label value="Maximum"/></Dimension></dimensionCollection><value value="149"/></CalculationResult></calculationResultCollection></CalculationEntity></calculationEntityCollection><imagingObservationEntityCollection><ImagingObservationEntity><uniqueIdentifier root="2.25.224037540631763904743113714148100365563"/><typeCode code="RID39466" codeSystemName="RadLex" codeSystemVersion="1.0"><iso:displayName xmlns:iso="uri:iso.org:21090" value="liver mass"/></typeCode><annotatorConfidence value="0.0"/><label value="Lesion Type"/><imagingObservationCharacteristicCollection><ImagingObservationCharacteristic><typeCode code="RID3711" codeSystemName="RadLex" codeSystemVersion="1.0"><iso:displayName xmlns:iso="uri:iso.org:21090" value="abscess"/></typeCode><annotatorConfidence value="0.0"/><label value="Diagnosis"/></ImagingObservationCharacteristic><ImagingObservationCharacteristic><typeCode code="RID11082" codeSystemName="RadLex" codeSystemVersion="1.0"><iso:displayName xmlns:iso="uri:iso.org:21090" value="early arterial phase"/></typeCode><annotatorConfidence value="0.0"/><label value="Imaging Phase"/></ImagingObservationCharacteristic><ImagingObservationCharacteristic><typeCode code="RID43312" codeSystemName="RadLex" codeSystemVersion="1.0"><iso:displayName xmlns:iso="uri:iso.org:21090" value="solitary lesion"/></typeCode><annotatorConfidence value="0.0"/><label value="Focality of Lesion"/></ImagingObservationCharacteristic><ImagingObservationCharacteristic><typeCode code="RID5799" codeSystemName="RadLex" codeSystemVersion="1.0"><iso:displayName xmlns:iso="uri:iso.org:21090" value="round"/></typeCode><annotatorConfidence value="0.0"/><label value="Shape Descriptors"/></ImagingObservationCharacteristic><ImagingObservationCharacteristic><typeCode code="RID5714" codeSystemName="ISIS_LIVER" codeSystemVersion="1.0"><iso:displayName xmlns:iso="uri:iso.org:21090" value="smooth margin"/></typeCode><annotatorConfidence value="0.05"/><label value="Margin Contours: Smooth to Irregular"/></ImagingObservationCharacteristic><ImagingObservationCharacteristic><typeCode code="RID6042" codeSystemName="RadLex" codeSystemVersion="1.0"><iso:displayName xmlns:iso="uri:iso.org:21090" value="hypodense"/></typeCode><annotatorConfidence value="0.0"/><label value="Average Lesion Density: Hypo to Hyperdense"/></ImagingObservationCharacteristic><ImagingObservationCharacteristic><typeCode code="RID6059" codeSystemName="RadLex" codeSystemVersion="1.0"><iso:displayName xmlns:iso="uri:iso.org:21090" value="homogeneous"/></typeCode><annotatorConfidence value="0.0"/><label value="Density - Homogeneous or Heterogeneous"/></ImagingObservationCharacteristic><ImagingObservationCharacteristic><typeCode code="RID6056" codeSystemName="RadLex" codeSystemVersion="1.0"><iso:displayName xmlns:iso="uri:iso.org:21090" value="nonenhancing"/></typeCode><annotatorConfidence value="0.0"/><label value="Enhancement"/></ImagingObservationCharacteristic><ImagingObservationCharacteristic><typeCode code="RID39563" codeSystemName="RadLex" codeSystemVersion="1.0"><iso:displayName xmlns:iso="uri:iso.org:21090" value="homogeneous enhancement"/></typeCode><annotatorConfidence value="0.0"/><label value="Enhancement Uniformity"/></ImagingObservationCharacteristic><ImagingObservationCharacteristic><typeCode code="RID34421" codeSystemName="RadLex" codeSystemVersion="1.0"><iso:displayName xmlns:iso="uri:iso.org:21090" value="homogeneous internal enhancement"/></typeCode><annotatorConfidence value="0.0"/><label value="Specific Enhancement Pattern(s)"/></ImagingObservationCharacteristic><ImagingObservationCharacteristic><typeCode code="RID43338" codeSystemName="RadLex" codeSystemVersion="1.0"><iso:displayName xmlns:iso="uri:iso.org:21090" value="homogeneous retention"/></typeCode><annotatorConfidence value="0.0"/><label value="Temporal Enhancement (if known)"/></ImagingObservationCharacteristic><ImagingObservationCharacteristic><typeCode code="RID45676" codeSystemName="ISIS_LIVER" codeSystemVersion="1.0"><iso:displayName xmlns:iso="uri:iso.org:21090" value="thick septae"/></typeCode><annotatorConfidence value="0.0"/><label value="Septation Thickness"/></ImagingObservationCharacteristic><ImagingObservationCharacteristic><typeCode code="RID43300" codeSystemName="RadLex" codeSystemVersion="1.0"><iso:displayName xmlns:iso="uri:iso.org:21090" value="perilesional perfusion alteration"/></typeCode><annotatorConfidence value="0.0"/><label value="Perilesional Tissue"/></ImagingObservationCharacteristic><ImagingObservationCharacteristic><typeCode code="RID43346" codeSystemName="RadLex" codeSystemVersion="1.0"><iso:displayName xmlns:iso="uri:iso.org:21090" value="blood products (lesion)"/></typeCode><annotatorConfidence value="0.0"/><label value="Special Features"/></ImagingObservationCharacteristic><ImagingObservationCharacteristic><typeCode code="RID43327" codeSystemName="RadLex" codeSystemVersion="1.0"><iso:displayName xmlns:iso="uri:iso.org:21090" value="abuts capsule of liver"/></typeCode><annotatorConfidence value="0.0"/><label value="Lesion Effects on Liver"/></ImagingObservationCharacteristic><ImagingObservationCharacteristic><typeCode code="RID28454" codeSystemName="RadLex" codeSystemVersion="1.0"><iso:displayName xmlns:iso="uri:iso.org:21090" value="none"/></typeCode><annotatorConfidence value="0.0"/><label value="Primary Malignancy if Metastatic Disease"/></ImagingObservationCharacteristic></imagingObservationCharacteristicCollection></ImagingObservationEntity></imagingObservationEntityCollection><markupEntityCollection><MarkupEntity xsi:type="TwoDimensionMultiPoint"><uniqueIdentifier root="2.25.171279248602543582770806938873370239560"/><shapeIdentifier value="1"/><includeFlag value="true"/><imageReferenceUid root="1.2.826.0.1.3680043.8.420.31093973183104747672136176388142683243"/><referencedFrameNumber value="1"/><twoDimensionSpatialCoordinateCollection><TwoDimensionSpatialCoordinate><coordinateIndex value="0"/><x value="130.67546754675467"/><y value="268.6732673267327"/></TwoDimensionSpatialCoordinate><TwoDimensionSpatialCoordinate><coordinateIndex value="1"/><x value="221.35973597359734"/><y value="257.4081408140814"/></TwoDimensionSpatialCoordinate></twoDimensionSpatialCoordinateCollection></MarkupEntity></markupEntityCollection><imageAnnotationStatementCollection><ImageAnnotationStatement xsi:type="CalculationEntityReferencesMarkupEntityStatement"><subjectUniqueIdentifier root="2.25.139966971363069929048599894823256468905"/><objectUniqueIdentifier root="2.25.171279248602543582770806938873370239560"/></ImageAnnotationStatement><ImageAnnotationStatement xsi:type="CalculationEntityReferencesMarkupEntityStatement"><subjectUniqueIdentifier root="2.25.98233874665002735164435464823758320746"/><objectUniqueIdentifier root="2.25.171279248602543582770806938873370239560"/></ImageAnnotationStatement><ImageAnnotationStatement xsi:type="CalculationEntityReferencesMarkupEntityStatement"><subjectUniqueIdentifier root="2.25.160783227489918149482523203070132715378"/><objectUniqueIdentifier root="2.25.171279248602543582770806938873370239560"/></ImageAnnotationStatement><ImageAnnotationStatement xsi:type="CalculationEntityReferencesMarkupEntityStatement"><subjectUniqueIdentifier root="2.25.268998517181098610140898258606586565120"/><objectUniqueIdentifier root="2.25.171279248602543582770806938873370239560"/></ImageAnnotationStatement><ImageAnnotationStatement xsi:type="CalculationEntityReferencesMarkupEntityStatement"><subjectUniqueIdentifier root="2.25.234089010419326141142289307624966597723"/><objectUniqueIdentifier root="2.25.171279248602543582770806938873370239560"/></ImageAnnotationStatement></imageAnnotationStatementCollection><imageReferenceEntityCollection><ImageReferenceEntity xsi:type="DicomImageReferenceEntity"><uniqueIdentifier root="2.25.294891800358651262491806518464955515943"/><imageStudy><instanceUid root="1.2.826.0.1.3680043.8.420.12307316984239077022721560039253479548"/><startDate value="20090129"/><startTime value="081924"/><accessionNumber value="5287533"/><imageSeries><instanceUid root="1.2.826.0.1.3680043.8.420.19308572646164920912587366848473840270"/><modality code="CT" codeSystemName="DCM" codeSystemVersion="20121129"><iso:displayName xmlns:iso="uri:iso.org:21090" value="Computed Tomography"/></modality><imageCollection><Image><sopClassUid root="1.2.840.10008.5.1.4.1.1.2"/><sopInstanceUid root="1.2.826.0.1.3680043.8.420.31093973183104747672136176388142683243"/></Image></imageCollection></imageSeries></imageStudy></ImageReferenceEntity></imageReferenceEntityCollection></ImageAnnotation></imageAnnotations></ImageAnnotationCollection>';




/*
myjson variable check line 1988. This is the example json object needs to be converted from ATS_Template.xml
	mya, is an example array which contains
	key: template name ,
	value : template json
*/
//export next variable for react
//key is codeMeaning
export var templateArray = [
   // { key: "Tumor assessment", value: RECIST_v2 },
   // { key: "Lung Template", value: TempLungNoduleV2 },
   // { key: "liver15", value: TempBeaulieuBoneTemplaterev18 },
   // { key: "Test 3-1", value: TempAsdf },
   // { key: "Coordination Template", value: TempCoordinationTest },
   // { key: "Test 3", value: TempTest3 },
   { key: "ROI Only", value: roiOnly },
   // { key : "Any_Shape", value :anyShapeTemplate}

];

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
		-parameter: divid // div id in which aimeditor window wil be created
		-parameter: formCheckCall // function to be passed to aimeditor to pass back the number of required field.
			ex: divid = document.getElementById("cont");
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


