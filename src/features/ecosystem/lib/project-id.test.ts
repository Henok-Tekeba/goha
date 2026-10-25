import assert from "node:assert/strict";
import test from "node:test";

import {
  projectIdForSource,
  resolveSourceAlias,
} from "../../../../scripts/project-id.mjs";
import projectsJson from "../../../../src/mocks/fixtures/projects.mock.json";

interface FixtureProject {
  id?: string;
  sourceId?: string;
}

test("project ids are derived only from the source id", () => {
  const source = "hf:owner/name";
  assert.equal(projectIdForSource(source), projectIdForSource(source));
  assert.match(projectIdForSource(source), /^pjt_[a-f0-9]{32}$/);
  assert.notEqual(
    projectIdForSource(source),
    projectIdForSource("hf:owner/other")
  );
});

test("ids stay stable when two scrapes return the same records in a different order", () => {
  const firstScrape = [
    "hf:owner/one",
    "hf-dataset:org/data",
    "arxiv:2601.00001",
    "company:Example",
  ];
  const secondScrape = [...firstScrape].reverse();

  const first = new Map(
    firstScrape.map((sourceId) => [sourceId, projectIdForSource(sourceId)])
  );
  const second = new Map(
    secondScrape.map((sourceId) => [sourceId, projectIdForSource(sourceId)])
  );

  assert.deepEqual(first, second);
});

test("source aliases resolve renames and transfers", () => {
  const aliases = {
    "hf:old-owner/name": "hf:new-owner/name",
    "hf:new-owner/name": "hf:final-owner/name",
  };
  assert.equal(
    resolveSourceAlias("hf:old-owner/name", aliases),
    "hf:final-owner/name"
  );
  assert.equal(
    projectIdForSource(resolveSourceAlias("hf:old-owner/name", aliases)),
    projectIdForSource("hf:final-owner/name")
  );
  assert.equal(
    resolveSourceAlias("hf:unrelated/name", aliases),
    "hf:unrelated/name"
  );
});

test("committed projects use their source-derived id", () => {
  const projects = projectsJson as unknown as FixtureProject[];
  const ids = new Set<string>();

  for (const project of projects) {
    assert.ok(project.id, "project id is missing");
    assert.ok(project.sourceId, `${project.id} has no sourceId`);
    assert.equal(
      project.id,
      projectIdForSource(project.sourceId as string),
      `${project.id} does not match its source id`
    );
    assert.ok(!ids.has(project.id as string), `duplicate id ${project.id}`);
    ids.add(project.id as string);
  }
});
