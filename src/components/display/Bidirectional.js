export const bidirectional = {
  toolType: "Bidirectional",
  isCreating: false,
  visible: true,
  active: false,
  invalidated: true,
  handles: {
    start: {
      x: "",
      y: "",
      index: 0,
      drawnIndependently: false,
      allowedOutsideImage: false,
      highlight: true,
      active: false
    },
    end: {
      x: "",
      y: "",
      index: 1,
      drawnIndependently: false,
      allowedOutsideImage: false,
      highlight: true,
      active: false
    },
    perpendicularStart: {
      x: "",
      y: "",
      index: 2,
      drawnIndependently: false,
      allowedOutsideImage: false,
      highlight: true,
      active: false,
      locked: false
    },
    perpendicularEnd: {
      x: "",
      y: "",
      index: 3,
      drawnIndependently: false,
      allowedOutsideImage: false,
      highlight: true,
      active: false
    },
    textBox: {
      x: null,
      y: null,
      index: null,
      drawnIndependently: true,
      allowedOutsideImage: true,
      highlight: false,
      active: false,
      hasMoved: false,
      movesIndependently: false,
      hasBoundingBox: true
      // boundingBox: {
      //   width: "",
      //   height: "",
      //   left: 5,
      //   top: 5
      // }
    }
  }
};
