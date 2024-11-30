import "./style.css";
import OBR from "@owlbear-rodeo/sdk";
import { setupRecordingMenu } from "./recordingMenu.js";
import { renderList } from "./recordingLists.js";
import { setupOnItemEvent } from "./onItemEvent";


document.querySelector("#app").innerHTML = `
  <div>
    <h1 id="titlePath">Path recorders</h1>
    <div id="initiative-list"></div>
  </div>
`;

OBR.onReady(() => {
  setupRecordingMenu();
  setupOnItemEvent();
  renderList();
});
