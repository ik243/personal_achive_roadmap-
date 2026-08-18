import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

const root = join(import.meta.dirname, "..");
const dataDir = join(root, "data");

const CURRICULUM = [
  {
    project: "RabbitMQ",
    sections: [
      { title: "Core Concepts", lines: [1, 17] },
      { title: "Messaging Patterns", lines: [18, 26] },
      { title: "Acknowledgements", lines: [27, 33] },
      { title: "Durability & Delivery", lines: [34, 45] },
      { title: "Retry, DLQ & TTL", lines: [46, 58] },
      { title: "Performance & Ordering", lines: [59, 69] },
      { title: "Message Design", lines: [70, 82] },
      { title: "Distributed Architecture", lines: [83, 97] },
      { title: "Load & Flow Control", lines: [98, 102] },
      { title: "High Availability", lines: [103, 117] },
      { title: "Connections & Lifecycle", lines: [118, 127] },
      { title: "Security", lines: [128, 137] },
      { title: "Monitoring", lines: [138, 157] },
      { title: "Node.js & Testing", lines: [158, 175] },
      { title: "Use Cases", lines: [176, 180] },
    ],
    file: "RabbitMQ.txt",
  },
  {
    project: "Redis",
    sections: [
      { title: "Foundations", lines: [1, 3] },
      { title: "Data Types & Keys", lines: [4, 10] },
      { title: "Caching Patterns", lines: [11, 20] },
      { title: "Pub/Sub & Streams", lines: [21, 24] },
      { title: "Atomicity & Locks", lines: [25, 31] },
      { title: "Persistence & Memory", lines: [32, 38] },
      { title: "Replication & Cluster", lines: [39, 45] },
      { title: "Reliability & Operations", lines: [46, 52] },
      { title: "Monitoring", lines: [53, 58] },
      { title: "Security", lines: [59, 63] },
      { title: "Comparisons", lines: [64, 68] },
      { title: "Node.js & Use Cases", lines: [69, 75] },
    ],
    file: "Redis.txt",
  },
  {
    project: "System Design",
    sections: [
      { title: "Foundations", lines: [1, 6] },
      { title: "Scaling & Edge", lines: [7, 14] },
      { title: "Databases", lines: [15, 22] },
      { title: "CAP & Consistency", lines: [23, 27] },
      { title: "Messaging & Events", lines: [28, 38] },
      { title: "Resilience Patterns", lines: [39, 47] },
      { title: "HA & Fault Tolerance", lines: [48, 56] },
      { title: "Distributed Data", lines: [57, 67] },
      { title: "APIs & Architecture", lines: [68, 77] },
      { title: "Storage & Search", lines: [78, 84] },
      { title: "Jobs, Auth & Security", lines: [85, 94] },
      { title: "Observability", lines: [95, 103] },
      { title: "Bottlenecks & Problems", lines: [104, 111] },
      { title: "DR & Multi-Region", lines: [112, 119] },
      { title: "Deployment & Trade-offs", lines: [120, 130] },
    ],
    file: "SystemDesign.txt",
  },
];

function weightFor(title, sectionTitle) {
  if (title.startsWith("Реальний use case")) return 4;
  if (/testing|Test|Mock|Integration test|Contract test/i.test(title)) return 3;
  if (
    /Pattern|Saga|Outbox|Inbox|Quorum|Cluster|Tracing|Monitoring|Security|Failover|Idempot/i.test(
      title,
    ) ||
    /Pattern|Saga|Outbox|Inbox/i.test(sectionTitle)
  )
    return 3;
  if (/Що таке|базово|концептуально|high-level|базове/i.test(title)) return 2;
  return 2;
}

const output = { projects: [] };

for (const spec of CURRICULUM) {
  const raw = readFileSync(join(dataDir, spec.file), "utf8");
  const lines = raw.split(/\r?\n/).filter((l) => l.trim().length > 0);

  const project = { title: spec.project, sections: [] };
  for (const sec of spec.sections) {
    const topics = lines.slice(sec.lines[0] - 1, sec.lines[1]).map((title) => ({
      title,
      weight: weightFor(title, sec.title),
    }));
    project.sections.push({ title: sec.title, topics });
  }
  output.projects.push(project);
}

const totalSteps = output.projects.reduce(
  (sum, p) => sum + p.sections.reduce((s, sec) => s + sec.topics.length, 0),
  0,
);

writeFileSync(
  join(root, "lib/seed/curriculum-topics.json"),
  JSON.stringify(output, null, 2),
  "utf8",
);

console.log(
  `Generated curriculum: ${output.projects.length} projects, ${totalSteps} steps`,
);
