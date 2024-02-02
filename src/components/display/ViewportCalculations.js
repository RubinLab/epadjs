const getVPDimensions = (numSeries) => {
  const navbarEls = document.getElementsByClassName("navbar");
  const toolbarEls = document.getElementsByClassName("toolbar");

  const navbar = navbarEls && navbarEls.length > 0 ? navbarEls[0].clientHeight : 0;
  let toolbarHeight = toolbarEls && toolbarEls.length > 0 ? toolbarEls[0].clientHeight : 0;

  const windowInner = window.innerHeight;
  const containerHeight = windowInner - toolbarHeight - navbar - 10;

  let width, height;
  switch (numSeries) {
    case 1:
      width = "100%";
      height = containerHeight;
      break;
    case 2:
      width = "50%";
      height = containerHeight;
      break;
    case 3:
    case 4:
      width = "50%";
      height = containerHeight / 2;
      break;
    case 5:
    case 6:
      width = "33%";
      height = containerHeight / 2;
      break;
    case 7:
    case 8:
      width = "25%";
      height = containerHeight / 2;
      break;
    default:
      width = "100%";
      height = containerHeight;
  }
  return { width, height };
};

export default getVPDimensions;
