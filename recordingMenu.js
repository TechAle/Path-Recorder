import OBR from "@owlbear-rodeo/sdk";
import {ID, pathCreations} from "./globalVariables";

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
    onClick(context) {
      const addToInitiative = context.items.every(
        (item) => item.metadata[`${ID}/recording`] === undefined
      );
      if (addToInitiative) {
        OBR.scene.items.updateItems(context.items, (items) => {
          for (let item of items) {
            item.metadata[`${ID}/recording`] = {
              recording: true
            };
            pathCreations[item.id] = [{
                x: item.position.x,
                y: item.position.y,
                rotation: item.rotation,
                time: 0
            }]
          }
        });
      } else {
        console.log("Ciao: " + pathCreations)
        OBR.scene.items.updateItems(context.items, (items) => {
          for (let item of items) {
            delete item.metadata[`${ID}/recording`];
            try {
              const ms = parseInt(window.prompt("Time return (ms): "));
              pathCreations[item.id][pathCreations[item.id].length - 1].time = ms;
              console.log(pathCreations)
              item.metadata[`${ID}/path`] = pathCreations[item.id];
              /*
              console.log(pathCreations[item.id][0])
              console.log(item.position.x + " " + item.position.y + " " + item.rotation)
              item.position = {
                x: pathCreations[item.id][0].x,
                y: pathCreations[item.id][0].y,
                rotation: pathCreations[item.id][0].rotation
              };
              console.log(item.position.x + " " + item.position.y + " " + item.rotation)*/
            } catch (e) {
              console.log(e)
            }
          }
        });
      }
    },
  });
}
