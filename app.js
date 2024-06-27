let nodes = new vis.DataSet([]);
let edges = new vis.DataSet([]);

const container = document.getElementById("mynetwork");
const data = {
  nodes: nodes,
  edges: edges,
};
const options = {};
const network = new vis.Network(container, data, options);

const colorPalette = [
  { color: "#FF5733", name: "Red" },
  { color: "#33FF57", name: "Green" },
  { color: "#3357FF", name: "Blue" },
  { color: "#57FFF3", name: "Cyan" },
  { color: "#F357FF", name: "Magenta" },
  { color: "#FFFF57", name: "Yellow" },
  { color: "#F3571E", name: "Orange" },
  { color: "#9B59B6", name: "Violet" },
  { color: "#8E44AD", name: "Purple" },
  { color: "#E74C3C", name: "Brown" },
];

function addParticipant() {
  const participantName = document
    .getElementById("participantName")
    .value.trim();
  if (participantName && !nodes.get(participantName)) {
    const newNode = { id: participantName, label: participantName };
    nodes.add(newNode);
    updateDropdowns();
    document.getElementById("participantName").value = "";
    document.getElementById("relationshipForm").style.display = "block";
  } else {
    alert("Please enter a unique valid name");
  }
}

function updateDropdowns() {
  const firstParticipant = document.getElementById("firstParticipant");
  const secondParticipant = document.getElementById("secondParticipant");
  const participants = nodes.get();
  firstParticipant.innerHTML = "";
  secondParticipant.innerHTML = "";

  participants.forEach((participant) => {
    firstParticipant.add(new Option(participant.label, participant.id));
    secondParticipant.add(new Option(participant.label, participant.id));
  });
}

function addRelationship() {
  const firstParticipant = document.getElementById("firstParticipant").value;
  const secondParticipant = document.getElementById("secondParticipant").value;
  if (
    firstParticipant &&
    secondParticipant &&
    firstParticipant !== secondParticipant
  ) {
    const newEdge = { from: firstParticipant, to: secondParticipant };
    edges.add(newEdge);
  } else {
    alert("Please select different participants");
  }
}

function getRandomName() {
  //use faker to get a random first name
  return faker.name.firstName();
}

function generateRandomParticipants() {
  const numParticipants = parseInt(
    document.getElementById("numParticipants").value
  );
  const NSRF = parseFloat(document.getElementById("NSRF").value);
  if (NSRF < 0 || NSRF > 1) {
    alert("Please enter a valid non-seating ratio between 0 and 1");
    return;
  }

  console.log("non-seating ratio:", NSRF);

  if (
    isNaN(numParticipants) ||
    isNaN(NSRF) ||
    numParticipants <= 0 ||
    NSRF < 0 ||
    NSRF > 1
  ) {
    alert(
      "Please enter valid numbers for participants and non-seating percentage."
    );
    return;
  }

  // Clear existing participants and relationships
  nodes.clear();
  edges.clear();

  // Generate random participants
  const participants = [];
  for (let i = 0; i < numParticipants; i++) {
    let randomName;
    do {
      randomName = getRandomName();
    } while (participants.includes(randomName)); // Ensure uniqueness
    participants.push(randomName);
    nodes.add({ id: randomName, label: randomName });
  }

  // Generate random non-sitting relationships
  const totalPairs = Math.round(
    NSRF * ((numParticipants * (numParticipants - 1)) / 2)
  );

  console.log(totalPairs);

  let falseHits = 0;

  while (edges.length < totalPairs) {
    let i = Math.floor(Math.random() * numParticipants);
    let j = Math.floor(Math.random() * numParticipants);
    while (i === j) {
      j = Math.floor(Math.random() * numParticipants);
    }
    console.log(i, j);
    console.log(edges);
    console.log(edges.get({ from: participants[i], to: participants[j] }));
    if (!network.getConnectedNodes(participants[i]).includes(participants[j])) {
      edges.add({ from: participants[i], to: participants[j] });
    } else {
      falseHits++;
    }
  }

  updateDropdowns(); // Update dropdowns with new participants
  steps = [];
  currentStep = 0;
  document.getElementById("relationshipForm").style.display = "block"; // Show relationship form
}

function generateWheelGraph() {
  nodes.clear();
  edges.clear();
  // generate wheel graph consising of 10 participants each with a getRandomName
  let firstParticipant = null;

  // add first participant
  const participantName = getRandomName();
  if (!firstParticipant) {
    firstParticipant = participantName;
  }
  nodes.add({ id: 0, label: participantName });

  for (let i = 1; i < 9; i++) {
    const participantName = getRandomName();
    nodes.add({ id: i, label: participantName });
    // add edges between this participant and the first participant and the previous participant
    edges.add({ from: i, to: 0 });
    if (i > 1) {
      edges.add({ from: i, to: i - 1 });
    }
  }
  //connect the first participant to the last participant
  edges.add({ from: 1, to: 8 });
}

let steps = [];
let currentStep = 0;

function applyGreedyAlgorithm(returnSteps = false) {
  let nodesArray = nodes.getIds();
  const colors = {};

  uncolorGraph();

  // Shuffle to simulate randomness in selection
  nodesArray.sort(() => Math.random() - 0.5);

  let stepIndex = 0;

  nodesArray.forEach((node) => {
    const connectedNodes = network.getConnectedNodes(node);
    const usedColors = connectedNodes
      .map((n) => colors[n])
      .filter((n) => n !== undefined);

    let colorIndex = 0;
    const conflictingColors = [];

    while (usedColors.includes(colorPalette[colorIndex].color)) {
      conflictingColors.push(colorPalette[colorIndex].name);
      colorIndex++;
    }

    colors[node] = colorPalette[colorIndex].color;

    if (conflictingColors.length > 0) {
      steps.push({
        node,
        color: colorPalette[colorIndex].color,
        description: `${node} is connected to nodes colored ${conflictingColors.join(
          " and "
        )} and thus gets the color ${colorPalette[colorIndex].name}.`,
        stepIndex: stepIndex++,
      });
    } else {
      steps.push({
        node,
        color: colorPalette[colorIndex].color,
        description: `${node} is assigned color ${colorPalette[colorIndex].name} because there are no conflicting adjacent nodes.`,
        stepIndex: stepIndex++,
      });
    }
  });

  if (returnSteps) {
    return steps;
  } else {
    // Apply the colors to the network
    nodesArray.forEach((node) => {
      nodes.update({
        id: node,
        color: { background: colors[node], border: "#2B7CE9" },
        label: `${node}`,
      });
    });

    let maxColorIndex = Math.max(
      ...Object.values(colors).map((color) =>
        colorPalette.findIndex((palette) => palette.color === color)
      )
    );
    document.getElementById("algorithmResult").textContent = `Colors used: ${
      maxColorIndex + 1
    }`;

    return maxColorIndex + 1;
  }
}

function executeStep(step) {
  nodes.update({
    id: step.node,
    color: { background: step.color, border: "#2B7CE9" },
  });
  document.getElementById("algorithmResult").textContent = step.description;
}

function startAlgorithmStepByStep() {
  currentStep = 0;
  continueAlgorithmStepByStep();
}

function continueAlgorithmStepByStep() {
  if (currentStep < steps.length) {
    console.log(currentStep);
    console.log(steps[currentStep]);
    executeStep(steps[currentStep]);
    currentStep++;
  } else {
    //check how many colors were used to color the nodes in the network
    const uniqueColors = new Set();
    nodes.forEach((node) => {
      const color = nodes.get(node).color;
      if (color && !uniqueColors.has(color)) {
        uniqueColors.add(color);
      }
    });

    document.getElementById("algorithmResult").textContent =
      "Algorithm completed. Number of colors used: " + uniqueColors.size;
  }
}

function startStepByStep() {
  uncolorGraph();
  // if dropdown value is "greedy"
  const type = document.getElementById("algorithmSelectorForStepByStep").value;
  if (type === "greedy") {
    console.log("step by step greedy");
    startAlgorithmStepByStep(applyGreedyAlgorithm(true));
  } else if (type === "dsatur") {
    startAlgorithmStepByStep(applyDsatur(true));
  }
}

function applyColorWithInterchange() {
  uncolorGraph();
  let nodesArray = nodes.getIds();
  const colors = {}; // This will hold the color assigned to each node
  // Shuffle to simulate randomness in selection
  nodesArray.sort(() => Math.random() - 0.5);

  // Initialize all nodes as uncolored
  nodesArray.forEach((node) => {
    colors[node] = 0; // '0' will denote uncolored
  });

  // Save start time
  const startTime = performance.now();
  let usedColors = new Set();

  // Attempt to color each node
  nodesArray.forEach((v) => {
    let availableColors = new Set(colorPalette); // Initialize available colors

    // Check the colors of each neighbor and remove them from availableColors
    let neighbors = network.getConnectedNodes(v);
    neighbors.forEach((u) => {
      if (colors[u] !== 0) {
        availableColors.delete(colors[u]);
      }
    });

    if (
      availableColors.size === 0 ||
      (usedColors.size < colorPalette.length &&
        !availableColors.has(Array.from(usedColors)[0]))
    ) {
      let resolved = false;
      for (let u of neighbors) {
        if (colors[u] !== 0 && !availableColors.has(colors[u])) {
          // Check if swapping colors resolves the conflict
          let otherNeighbors = network.getConnectedNodes(u);
          for (let possibleColor of colorPalette) {
            if (!otherNeighbors.some((x) => colors[x] === possibleColor)) {
              // Perform the color swap
              let tempColor = colors[u];
              colors[u] = colors[v]; // Temporarily swap colors
              colors[v] = tempColor;
              availableColors.add(tempColor);
              resolved = true;
              console.log(
                `Resolved conflict by interchanging colors between node ${v} and ${u}.`
              );
              break;
            }
          }
        }
        if (resolved) break;
      }
      if (!resolved) {
        console.log(
          `No interchange possible for vertex ${v}. Assigning new color.`
        );
        // If no color is available and no interchange is possible, use a new color
        colors[v] = Array.from(colorPalette).find(
          (color) => !usedColors.has(color)
        );
        usedColors.add(colors[v]);
      }
    } else {
      // Assign the smallest available color
      colors[v] = Array.from(availableColors)[0];
      usedColors.add(colors[v]);
      console.log(`Assigned color ${colors[v]} to vertex ${v}.`);
    }

    nodes.update({
      id: v,
      color: { background: colors[v], border: "#2B7CE9" },
      label: v,
    });
  });

  // Save end time and calculate duration
  const endTime = performance.now();
  const duration = (endTime - startTime).toFixed(2);

  // Output the unique colors used
  const uniqueColors = new Set(
    Object.values(colors).filter((color) => color !== 0)
  );
  document.getElementById(
    "algorithmResult"
  ).textContent = `Colors used: ${uniqueColors.size}. Calculation time: ${duration}ms`;

  console.log("Color-With-Interchange Algorithm applied.");
  return uniqueColors.size; // Return the number of unique colors used
}

function applyDsatur(returnSteps = false) {
  uncolorGraph();
  let nodesArray = nodes.getIds();

  // Shuffle to simulate randomness in selection
  nodesArray.sort(() => Math.random() - 0.5);

  const degrees = {};
  const saturation = {};
  nodesArray.forEach((node) => {
    degrees[node] = network.getConnectedNodes(node).length;
    saturation[node] = 0; // Initialize saturation to 0 for each node
  });

  const colors = {};

  const usedColorsByNode = {};

  let stepIndex = 0;

  // Initialize the used colors set for each node
  nodesArray.forEach((node) => {
    usedColorsByNode[node] = new Set();
  });

  // DSatur main logic
  while (Object.keys(colors).length < nodesArray.length) {
    // Select the next node with the highest saturation and, in case of ties, the highest degree
    let nextNode = nodesArray.reduce((a, b) => {
      if (!colors[a]) {
        return !colors[b]
          ? saturation[a] > saturation[b] ||
            (saturation[a] === saturation[b] && degrees[a] > degrees[b])
            ? a
            : b
          : a;
      } else {
        return b;
      }
    });

    // Find the lowest available color that has not been used by adjacent nodes
    const connectedNodes = network.getConnectedNodes(nextNode);
    connectedNodes.forEach((node) => {
      if (colors[node] !== undefined) {
        usedColorsByNode[nextNode].add(colors[node]);
      }
    });

    const availableColors = colorPalette.filter(
      (color) => !usedColorsByNode[nextNode].has(color.color)
    );
    const selectedColor = availableColors[0].color; // Select the first available color
    const colorName = availableColors[0].name;
    colors[nextNode] = selectedColor;

    // Update saturation of adjacent nodes
    connectedNodes.forEach((node) => {
      if (colors[node] === undefined) {
        // Only if the node is not yet colored
        usedColorsByNode[node].add(selectedColor);
        saturation[node] = usedColorsByNode[node].size;
      }
    });

    // Update node color in the network or push a step
    if (returnSteps) {
      steps.push({
        node: nextNode,
        color: selectedColor,
        description: `Node ${nextNode} gets the color ${colorName} because it has the highest saturation of ${saturation[nextNode]} so it is the next node to be colored.`,
        stepIndex: stepIndex++,
      });
    } else {
      nodes.update({
        id: nextNode,
        color: { background: selectedColor, border: "#2B7CE9" },
        label: `${nextNode}`,
      });
    }

    console.log(
      `Node ${nextNode} colored with ${selectedColor} (Available Colors: ${availableColors.join(
        ", "
      )})`
    );
    console.log(`Current Saturation Levels: ${JSON.stringify(saturation)}`);
    console.log("----------");
  }

  console.log("DSatur Algorithm completed.");
  let uniqueColorsUsed = new Set(Object.values(colors));
  console.log(`Unique Colors Used: ${JSON.stringify(uniqueColorsUsed)}`);
  //update algorithmResult
  document.getElementById(
    "algorithmResult"
  ).textContent = `Colors used: ${uniqueColorsUsed.size}`;
  return returnSteps ? steps : uniqueColorsUsed.size; // Return the number of unique colors used
}

function applyBacktracking() {
  // Platzhalter für den Backtracking Algorithmus
  console.log("Backtracking algorithm applied.");
}

function benchmarkAlgorithm() {
  const algo = document.getElementById("algorithmSelector").value;
  const numRuns = parseInt(document.getElementById("numRuns").value);
  if (isNaN(numRuns) || numRuns <= 0) {
    alert("Please enter a valid number of runs");
    return;
  }

  let totalTime = 0;
  let totalColorsUsed = 0;
  let result = 0;
  let minColorsUsed = 0;
  let networkData = {
    nodes: nodes.get(),
    edges: edges.get(),
  };
  let savedColors = {};

  for (let i = 0; i < numRuns; i++) {
    console.log(`Run ${i + 1}`);
    const startTime = performance.now();
    switch (algo) {
      case "greedy":
        result = applyGreedyAlgorithm();
        break;
      case "colorWithInterchange":
        result = applyColorWithInterchange();
        break;
      case "dsatur":
        result = applyDsatur();
        break;
      case "backtracking":
        result = applyBacktracking();
        break;
    }
    const endTime = performance.now();

    totalColorsUsed += result;
    if (result < minColorsUsed || minColorsUsed === 0) {
      console.log("minColorsUsed", minColorsUsed);
      minColorsUsed = result;
      //save the state of the network with the minimum colors used
      const networkData = {
        nodes: nodes.get(),
        edges: edges.get(),
      };
      // also safe the colors used for each node
      nodes.forEach((node) => {
        savedColors[node.id] = node.color.background;
      });
      console.log("colors", savedColors);
      networkData.colors = savedColors;
    }

    totalTime += endTime - startTime;
  }

  const avgTime = totalTime / numRuns;
  const avgColorsUsed = totalColorsUsed / numRuns;

  //apply saved colors
  nodes.forEach((node) => {
    nodes.update({
      id: node.id,
      color: { background: savedColors[node.id], border: "#2B7CE9" },
    });
  });

  document.getElementById(
    "algorithmResult"
  ).textContent = `Average execution time: ${avgTime.toFixed(
    2
  )} ms. Average colors used: ${avgColorsUsed.toFixed(
    2
  )}. Minimum colors used: ${minColorsUsed}`;
}

function uncolorGraph() {
  //reset network
  nodes.forEach((node) => {
    nodes.update({
      id: node.id,
      color: null,
    });
  });
}
