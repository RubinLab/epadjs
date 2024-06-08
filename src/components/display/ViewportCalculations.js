const getVPDimensions = (numSeries) => {
  const navbar = document.getElementsByClassName("navbar")[0].clientHeight;
  // let navbar = document.getElementsByClassName("navbar")
  // navbar = navbar && navbar[0] ? navbar[0].clientHeight : 0;
  let toolbarHeight =
    document.getElementsByClassName("toolbar")[0]?.clientHeight || 0;
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
