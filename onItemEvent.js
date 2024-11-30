import OBR from "@owlbear-rodeo/sdk";
import {ID, pathCreations} from "./globalVariables";

let idValues = {}

export function setupOnItemEvent() {
    OBR.scene.items.getItems(e => e.type === "IMAGE").then((items) => {
        for (let item of items) {
            idValues[item.id] = {
                x: item.position.x,
                y: item.position.y,
                rotation: item.rotation
            }
        }
    });

    OBR.scene.items.onChange((items) => {
        // React to item changes
        for (let item of items) {
            if (item.type !== "IMAGE") continue
            if (Object.keys(idValues).includes(item.id)) {
                if (item.position.x !== idValues[item.id].x || item.position.y !== idValues[item.id].y || item.rotation !== idValues[item.id].rotation) {
                    idValues[item.id] = {
                        x: item.position.x,
                        y: item.position.y,
                        rotation: item.rotation
                    }
                    if (item.metadata[`${ID}/recording`]) {
                        pathCreations[item.id][pathCreations[item.id].length - 1].time = parseInt(window.prompt("Time: (MS)"));

                        pathCreations[item.id].push({
                            x: item.position.x,
                            y: item.position.y,
                            rotation: item.rotation,
                            time: 0
                        })
                        console.log(pathCreations)
                    }

                }
            } else {
                idValues[item.id] = {
                    x: item.position.x,
                    y: item.position.y,
                    rotation: item.rotation
                }
            }
        }
    })
}
