import OBR from "@owlbear-rodeo/sdk";
import {ID, pathCreations} from "./globalVariables";
import {renderList} from "./recordingLists.js";

// Function to check if a variable is a dictionary (object)
function isDict(variable) {
  return variable && typeof variable === 'object' && !Array.isArray(variable);
}

// Function to set up the recording menu in the context menu
export function setupRecordingMenu() {
  OBR.contextMenu.create({
    id: `${ID}/recordingMenu`,
    icons: [
      {
        icon: "/add.svg",
        label: "Start recording",
        filter: {
          every: [
            { key: "layer", value: "CHARACTER" },
            { key: ["metadata", `${ID}/recording`], value: undefined },
          ],
        },
      },
      {
        icon: "/remove.svg",
        label: "Stop recording",
        filter: {
          every: [{ key: "layer", value: "CHARACTER" }],
        },
      },
    ],
    // Function to handle clicks on the context menu items
    onClick(context) {
      // Check if all items are not currently being recorded
      const addToInitiative = context.items.every(
          (item) => item.metadata[`${ID}/recording`] === undefined
      );
      if (addToInitiative) {
        // Start recording for all items
        OBR.scene.items.updateItems(context.items, (items) => {
          for (let item of items) {
            item.metadata[`${ID}/recording`] = {
              recording: true
            };
            // Initialize path creation data for the item
            pathCreations[item.id] = [{
              x: item.position.x,
              y: item.position.y,
              rotation: item.rotation,
              time: 0
            }]
          }
        });
      } else {
        // Stop recording for all items
        OBR.scene.items.updateItems(context.items, (items) => {
          for (let item of items) {
            delete item.metadata[`${ID}/recording`];
            try {
              // Prompt the user for the time to return in milliseconds
              const ms = parseInt(window.prompt("Time return (ms): "));
              pathCreations[item.id][pathCreations[item.id].length - 1].time = ms;
              // Prompt the user for the name of the recording
              const name = window.prompt("Name recording: ");
              if (!isDict(item.metadata[`${ID}/path`])) {
                item.metadata[`${ID}/path`] = {}
              }
              // Save the path creation data under the given name
              item.metadata[`${ID}/path`][name] = pathCreations[item.id];
              console.log(name)
            } catch (e) {
              console.log(e)
            }
          }
        });
        // Render the updated list of recordings
        renderList()
      }
    },
  });
}