import { Suspense } from "react";
import { getProjectSummaries } from "@/lib/projects";
import { readLogs } from "@/lib/logger";
import { RunButton } from "@/components/RunButton";

function Projects() {
  const projects = getProjectSummaries();

  if (!projects.length) {
    return (
      <div className="card">
        <h2>No projects yet</h2>
        <p>Run the automation to generate the first motivational upload.</p>
      </div>
    );
  }

  return (
    <div className="card">
      <h2>Recent Projects</h2>
      <div className="project-grid">
        {projects.map((project) => (
          <div className="project" key={project.id}>
            <h3>{project.script.title}</h3>
            <p>{new Date(project.createdAt).toLocaleString()}</p>
            <p>{project.script.description}</p>
            {project.youtubeVideoId && (
              <a
                href={`https://youtube.com/watch?v=${project.youtubeVideoId}`}
                target="_blank"
                rel="noreferrer"
              >
                Watch on YouTube →
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function Logs() {
  const logs = readLogs(100);
  return (
    <div className="card">
      <h2>Recent Logs</h2>
      <div className="log-list">
        {logs.map((log) => (
          <div key={log.id} className={`log log-${log.level}`}>
            <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
            <span>[{log.stage}]</span>
            <p>{log.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <main>
      <header>
        <div>
          <h1>Agentic Motivation Studio</h1>
          <p>
            Autonomous pipeline that sources stock footage, writes motivational
            scripts, produces narrated edits, and publishes directly to YouTube.
          </p>
        </div>
        <RunButton />
      </header>

      <Suspense fallback={<div className="card">Loading projects…</div>}>
        <Projects />
      </Suspense>

      <Suspense fallback={<div className="card">Loading logs…</div>}>
        <Logs />
      </Suspense>
    </main>
  );
}
