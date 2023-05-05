import pptxgen from "pptxgenjs";

export function pptWrapper() {
  let defaultSlideNotes = '';
  const slideBackgroundColor = '2E2D29';
  // The next two values are in inches. Powerpoint seems to use 96 pixels per inch.
  const slideHeight = 15;
  const slideWidth = slideHeight * 16 / 9;
  // TODO: Implement this. Should the Stella logo be shown on each slide?
  const showStellaLogo = true;
  const stellaLogo = "data:image/png;base64,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";
  // If true, empty slides are not added to the presentation.
  const ignoreEmptySlides = false;
  // let ppt = new pptxgen();
  // This part defines the slide template that all slides will use.

  let initializePpt = function () {
    const ppt = new pptxgen();
    ppt.defineLayout({ name: 'layout', height: slideHeight, width: slideWidth });
    ppt.layout = 'layout';
    ppt.defineSlideMaster({
      title: 'master', background: { color: slideBackgroundColor },
      objects: [{
        image: {
          data: stellaLogo, w: 192 / 96, h: 73 / 96,
          //x: WIDTH-192/96, y: 0, 
          x: 0, y: slideHeight - 73 / 96,
          sizing: { type: 'contain', w: 192 / 96, h: 73 / 96 }
        }
      }]
    });
    return ppt;
  }
  // A PptxGenJS object
  this.pres = initializePpt();
  // A 2d array. this.slides[i][j] gives { dataURL: ..., width: w, height: h}
  // for the jth image on the ith slide.
  this.slides = [[]];
  this.currentSlide = 0;

  /**
   * Returns true if the presentation is empty
   */
  this.isEmpty = function () {
    return (this.slides.length == 1 && this.slides[0].length == 0);
  }

  /**
   * Sets default slide notes.
   * @param {string} text
   */
  this.setSlideNotes = function (text) {
    defaultSlideNotes = text;
  }

  /**
   * Moves to the next slide, initializing it if necessary.
   */
  this.nextSlide = function () {
    this.currentSlide++;
    if (this.slides.length <= this.currentSlide) {
      this.slides.push([]);
    }
  }

  /**
   * Moves to the previous slide. Does nothing if the current slide is the first slide.
   */
  this.prevSlide = function () {
    this.currentSlide = Math.max(this.currentSlide - 1, 0);
  }

  /**
   * Adds an image to the current slide. Throws an error if that would cause there to be more
   * than maxImagesPerSlide, a value hardcoded in pptWrapper.js. In practice, you'll likely
   * want to do something like:
   * addImageToSlide(canv.toDataURL(), canv.width, canv.height);
   * @param {string} dataURL The dataURL of the image to add.
   * @param {int} width The width of the image.
   * @param {int} height The height of the image.
   * @param {string} imageNotes Slide notes to be included with the image.
   * @param {string} imageNotesSensitive Slide notes to be included that are more sensitive, eg PHI.
   */
  this.addImageToSlide = function (dataURL, width, height, imageNotes = '', imageNotesSensitive = '') {
    this.slides[this.currentSlide].push({ b64: dataURL, w: width, h: height, notes: imageNotes, notesSensitive: imageNotesSensitive });
  }

  /**
   * Removes the current slide. If this slide is the only slide, then clears this slide.
   * If the current slide is the last slide, then sets the current slide to the new last slide.
   * */
  this.removeCurrentSlide = function () {
    if (this.slides.length == 1) {
      this.slides = [[]];
      return;
    }
    this.slides.splice(this.currentSlide, 1);
    this.currentSlide = Math.min(this.currentSlide, this.slides.length - 1);
  }

  /**
   * Removes the nth image from the slide, provided that n is a valid index.
   * The images are ordered chronologically, starting at 0.
   * If n is negative or not given, then this removes the last image.
   * @param {int} n The index of the image to remove
   */
  this.removeImageFromSlide = function (n = -1) {
    let slide = this.slides[this.currentSlide];
    if (slide.length == 0) {
      return;
    }
    if (n < 0) {
      n = slide.length - 1;
    }
    if (n < this.slides[this.currentSlide].length) {
      slide.splice(n, 1);
    }
  }

  /**
   * Given the id of an HTML element, sets the innerHTML of that object to be text describing
   * the current status of the presentation.
   * @param {string} elementId
   */
  this.updateDisplayText = function (elementId) {
    let nSlides = this.currentSlide + 1;
    let x = 'Slide ' + nSlides + ' of ' + this.slides.length;
    //x += 'This slide has ' + this.slides[this.currentSlide].length + ' image';
    //if (this.slides[this.currentSlide].length != 1) {
    //  x += 's';
    //}
    //x += '.';
    document.getElementById(elementId).innerHTML = x;
  }

  /**
   * Updates the desired canvas to show a rough preview of one slide of the presentation.
   * @param {string} canvasId The id of the desired canvas
   * @param {int} slideToDisplay Defaults to the current slide. If too large, shows the last slide
   */
  this.updateCanvasPreview = function (canvasId, slideToDisplay = -1) {
    slideToDisplay = Math.min(slideToDisplay, this.slides.length - 1);
    if (slideToDisplay == -1) {
      slideToDisplay = this.currentSlide;
    }
    let canv = document.getElementById(canvasId);
    let ctx = canv.getContext('2d');
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canv.width, canv.height);
    //ctx.clearRect(0, 0, canv.width, canv.height);
    let n = this.slides[slideToDisplay].length;
    let nRows = n;
    if (n > 3) {
      nRows = Math.ceil(Math.sqrt(n));
    }
    let nCols = Math.ceil(n / nRows);
    let count = 0;
    for (let i = 0; i < this.slides[slideToDisplay].length; i++) {
      let img = new Image;
      img.onload = function () {
        let xOffset = canv.width / nRows * (count % nRows);
        let yOffset = canv.height / nCols * Math.floor(count / nRows);
        count++;
        let previewWidth = canv.width / nRows;
        let previewHeight = canv.height / nCols;
        ctx.drawImage(img, xOffset, yOffset, previewWidth, previewHeight);
      }
      img.src = this.slides[slideToDisplay][i].b64;
    }
  }

  /**
   * Exports the current presentation.
   * @param {string} nameOfFile
   */
  this.exportPresentation = function (nameOfFile = 'Stella images.pptx', includeSensitive = false) {
    for (let i = 0; i < this.slides.length; i++) {
      let slideNotes = '';
      let slideArray = this.slides[i];
      if (slideArray.length == 0 && ignoreEmptySlides) {
        continue;
      }
      let newSlide = this.pres.addSlide({ masterName: 'master' });
      // This is a reasonable way to choose the number of rows and columns.
      let n = slideArray.length;
      let nRows = n;
      if (n > 3) {
        nRows = Math.ceil(Math.sqrt(n));
      }
      let nCols = Math.ceil(n / nRows);
      for (let j = 0; j < slideArray.length; j++) {
        let picH = slideArray[j].h;
        let picW = slideArray[j].w;
        let b64 = slideArray[j].b64;
        let imgW = Math.min(slideWidth / nRows, slideHeight / nCols * picW / picH);
        let imgH = Math.min(slideHeight / nCols, slideWidth / nRows * picH / picW);
        newSlide.addImage({
          data: b64,
          w: picW, h: picH,
          x: (j % nRows) * slideWidth / nRows + (slideWidth / nRows - imgW) / 2,
          y: slideHeight / nCols * Math.floor(j / nRows) + (slideHeight / nCols - imgH) / 2,
          sizing: { type: 'contain', w: imgW, h: imgH } // Prevents stretching
        });
        if (slideArray[j].notes.length > 0 || (includeSensitive && slideArray[j].notesSensitive.length > 0)) {
          // The slide notes are in the form
          /*
          Image 1: bla bla bla
          Image 2: bla bla bla
          Image 5: bla bla bla
          */
          let x = parseInt(j) + 1;
          slideNotes += 'Image ' + x + ':\n' + slideArray[j].notes;
          if (includeSensitive) { // We don't add any PHI unless the user explicitly chooses to do so.
            slideNotes += slideArray[j].notesSensitive;
          }
        }
        
      }
      if (slideNotes.length > 0) {
        newSlide.addNotes(slideNotes);
      } else {
        newSlide.addNotes(defaultSlideNotes);
      }
    }
    this.pres.writeFile({ fileName: nameOfFile });
    this.pres = initializePpt();
  }
}