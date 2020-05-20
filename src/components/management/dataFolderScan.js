import { scanFolder } from "../../services/dataScanService";
export function scanDataFolder() {
  const mode = sessionStorage.getItem("mode");
  console.log("Mode", mode);
  let projectId;
  if (mode === "lite") projectId = "lite";
  else {
    const pathName = window.location.pathname;
    console.log("Path name", pathName);
    if (!pathName.includes("/search")) {
      alert(
        "This function is only available under search view while a project is selected!"
      );
      return;
    }
    projectId = pathName.split("/search/");
    console.log("Prohect id", projectId);
    if (projectId[1] === "all") {
      alert("A project must be selected to put the data under!");
      return;
    }
  }
  const message =
    "ePAD will scan the data folder in the application directory. This may take some time. Do you want to continue?";
  var answer = window.confirm(message);
  if (!answer) return;
  scanFolder(projectId).catch((error) => console.log("Error:", error));
}
