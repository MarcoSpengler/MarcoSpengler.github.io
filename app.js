let nodes = new vis.DataSet([]);
let edges = new vis.DataSet([]);

const container = document.getElementById("mynetwork");
const data = {
  nodes: nodes,
  edges: edges,
};
const options = {};
const network = new vis.Network(container, data, options);

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

function applyGreedyAlgorithm() {
  const nodesArray = nodes.getIds();
  const colors = {};
  // Define a palette of colors for simplicity. You can expand this list or generate colors dynamically.
  const colorPalette = [
    "#FF5733",
    "#33FF57",
    "#3357FF",
    "#57FFF3",
    "#F357FF",
    "#FFFF57",
    "#F3571E",
  ];

  //shuffle the nodes array to get a random order
  nodesArray.sort(() => Math.random() - 0.5);

  nodesArray.forEach((node) => {
    const connectedNodes = network.getConnectedNodes(node);
    const usedColors = connectedNodes
      .map((n) => colors[n])
      .filter((n) => n !== undefined);
    let colorIndex = 0;
    while (usedColors.includes(colorPalette[colorIndex])) {
      colorIndex++;
    }
    colors[node] = colorPalette[colorIndex];
    nodes.update({
      id: node,
      color: { background: colorPalette[colorIndex], border: "#2B7CE9" },
    });
  });

  let maxColorIndex = Math.max(
    ...Object.values(colors).map((color) => colorPalette.indexOf(color))
  );
  alert(`Greedy coloring applied. Colors used: ${maxColorIndex + 1}`);
}

function getRandomName() {
  //use faker to get a random first name
  return faker.name.firstName();
}

function generateRandomParticipants() {
  const numParticipants = parseInt(
    document.getElementById("numParticipants").value
  );
  const nonSeatingPercentage = parseInt(
    document.getElementById("nonSeatingPercentage").value
  );

  if (
    isNaN(numParticipants) ||
    isNaN(nonSeatingPercentage) ||
    numParticipants <= 0 ||
    nonSeatingPercentage < 0 ||
    nonSeatingPercentage > 100
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
  for (let i = 0; i < participants.length; i++) {
    for (let j = i + 1; j < participants.length; j++) {
      if (Math.random() < nonSeatingPercentage / 100) {
        edges.add({ from: participants[i], to: participants[j] });
      }
    }
  }

  updateDropdowns(); // Update dropdowns with new participants
  document.getElementById("relationshipForm").style.display = "block"; // Show relationship form
}
