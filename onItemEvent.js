import OBR from "@owlbear-rodeo/sdk";
import {ID, pathCreations} from "./globalVariables";

let idValues = {}

// Function to set up event listeners for item changes
export function setupOnItemEvent() {
    // Get all items of type "IMAGE" and store their initial positions and rotations
    OBR.scene.items.getItems(e => e.type === "IMAGE").then((items) => {
        for (let item of items) {
            idValues[item.id] = {
                x: item.position.x,
                y: item.position.y,
                rotation: item.rotation
            }
        }
    });

    // Set up a listener for changes to items
    OBR.scene.items.onChange((items) => {
        // Iterate through all changed items
        for (let item of items) {
            if (item.type !== "IMAGE") continue // Skip non-image items
            if (Object.keys(idValues).includes(item.id)) {
                // Check if the item's position or rotation has changed
                if (item.position.x !== idValues[item.id].x || item.position.y !== idValues[item.id].y || item.rotation !== idValues[item.id].rotation) {
                    // Update the stored position and rotation
                    idValues[item.id] = {
                        x: item.position.x,
                        y: item.position.y,
                        rotation: item.rotation
                    }
                    // If the item is being recorded, update the path creation data
                    if (item.metadata[`${ID}/recording`]) {
                        // Prompt the user for the time in milliseconds
                        pathCreations[item.id][pathCreations[item.id].length - 1].time = parseInt(window.prompt("Time: (MS)"));

                        // Add the new position and rotation to the path creation data
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
                // Store the initial position and rotation for new items
                idValues[item.id] = {
                    x: item.position.x,
                    y: item.position.y,
                    rotation: item.rotation
                }
            }
        }
    })
}