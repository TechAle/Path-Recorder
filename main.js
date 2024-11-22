import "./style.css";
import OBR from "@owlbear-rodeo/sdk";
import { setupContextMenu } from "./contextMenu";
import { setupContextMenu2 } from "./contextMenu2";
import { setupInitiativeList } from "./initiativeList";
import { setupOnItemEvent } from "./onItemEvent";


document.querySelector("#app").innerHTML = `
  <div>
    <h1>Initiative Tracker</h1>
    <ul id="initiative-list"></ul>
  </div>
`;

OBR.onReady(() => {
  setupContextMenu();
  setupContextMenu2();
  setupInitiativeList(document.querySelector("#initiative-list"));
  setupOnItemEvent();
});
