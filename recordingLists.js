import OBR from "@owlbear-rodeo/sdk";
import {ID} from "./globalVariables";

export function setupMenuList(element) {
  const renderList = (items) => {
    // Get the name and initiative of any item with
    // our initiative metadata
    const initiativeItems = {};
    for (const item of items) {
      const metadata = item.metadata[`${ID}/path`];
      if (metadata) {
        initiativeItems[item.id] = {
          image: item.image.url,
          name: item.name,
          path: metadata
        }
      }
    }

    element.innerHTML = '';
    // Iterate through the data object
    for (const id in initiativeItems) {
      const item = initiativeItems[id];

      // Create the elements for each item
      const itemDiv = document.createElement('div');
      itemDiv.classList.add('item');

      // Display the image and name
      const imageElement = document.createElement('img');
      imageElement.src = item.image;
      imageElement.alt = item.name;
      itemDiv.appendChild(imageElement);

      const nameElement = document.createElement('h3');
      nameElement.textContent = item.name;
      itemDiv.appendChild(nameElement);


      // Append the item to the container
      element.appendChild(itemDiv);

      const coordsDiv = document.createElement('div');
      coordsDiv.classList.add('coordinates');


      // Display the coordinates as editable inputs
      item.path.forEach((coord, index) => {
        const br1 = document.createElement('br');
        const br2 = document.createElement('br');
        const xSpan = document.createElement('span');
        xSpan.textContent = 'X';
        const  ySpan = document.createElement('span');
        ySpan.textContent = 'Y';
        const timeSpan = document.createElement('span');
        timeSpan.textContent = 'Time';
        const coordDiv = document.createElement('div');
        coordDiv.classList.add('coordinate');
        console.log(coord, index)

        // Create input fields for x, y, and time
        const xInput = createInput('x', coord.x, id, index);
        const yInput = createInput('y', coord.y, id, index);
        const timeInput = createInput('time', coord.time, id, index);

        // Add inputs to the div
        coordDiv.appendChild(xSpan);
        coordDiv.appendChild(xInput);
        coordDiv.appendChild(br1)
        coordDiv.appendChild(ySpan);
        coordDiv.appendChild(yInput);
        coordDiv.appendChild(br2)
        coordDiv.appendChild(timeSpan);
        coordDiv.appendChild(timeInput);

        coordsDiv.appendChild(coordDiv);
      });
      element.appendChild(coordsDiv);
    }

    // Create new list nodes for each initiative item
    /*const nodes = [];
    for (const initiativeItem of sortedItems) {
      const node = document.createElement("li");
      node.innerHTML = `${initiativeItem.name} (${initiativeItem.initiative})`;
      nodes.push(node);
    }
    element.replaceChildren(...nodes);*/
  };
  OBR.scene.items.onChange(renderList);
}

// Function to create input elements for x, y, and time
function createInput(type, value, id, index) {
  const input = document.createElement('input');
  input.type = 'text';
  input.value = value;
  input.dataset.id = id; // Store the id for reference
  input.dataset.index = index; // Store the index for reference
  input.dataset.type = type; // Store the type (x, y, time)

  // Add event listener to track when the input changes
  input.addEventListener('input', handleInputChange);

  return input;
}

// Function to handle input changes
function handleInputChange(event) {
  const input = event.target;
  const id = input.dataset.id;
  const index = input.dataset.index;
  const type = input.dataset.type;
  const newValue = input.value;

  // Update the corresponding data in the dictionary
  const item = data[id];
  if (type === 'x') {
    item.coordinates[index][0] = parseInt(newValue, 10);
  } else if (type === 'y') {
    item.coordinates[index][1] = parseInt(newValue, 10);
  } else if (type === 'time') {
    item.coordinates[index][2] = parseInt(newValue, 10);
  }
}
