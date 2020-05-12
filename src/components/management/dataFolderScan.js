import { scanFolder } from "../../services/dataScanService";
export function scanDataFolder() {
  const message =
    "ePAD will scan the data folder in the application directory. This may take some time. Do you want to continue?";
  var answer = window.confirm(message);
  if (!answer) return;
  scanFolder().catch(error => console.log("Error:", error));
}
