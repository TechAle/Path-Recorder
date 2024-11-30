import "./style.css";
import OBR from "@owlbear-rodeo/sdk";
import { setupRecordingMenu } from "./recordingMenu.js";
import { setupMovingMenu } from "./movingMenu.js";
import { setupMenuList } from "./recordingLists.js";
import { setupOnItemEvent } from "./onItemEvent";


document.querySelector("#app").innerHTML = `
  <div>
    <h1 id="titlePath">Path recorders</h1>
    <ul id="initiative-list"></ul>
  </div>
`;

OBR.onReady(() => {
  setupRecordingMenu();
  setupMovingMenu();
  setupMenuList(document.querySelector("#initiative-list"));
  setupOnItemEvent();
});
