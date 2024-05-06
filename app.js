let nodes = new vis.DataSet([]);
let edges = new vis.DataSet([]);

const container = document.getElementById("mynetwork");
const data = {
  nodes: nodes,
  edges: edges,
};
const options = {};
const network = new vis.Network(container, data, options);

document
  .getElementById("inputForm")
  .addEventListener("submit", function (event) {
    event.preventDefault(); //prevent refresh
    addParticipant();
  });

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
