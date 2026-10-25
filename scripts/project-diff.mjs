import { resolveSourceAlias } from "./project-id.mjs";

/**
 * Compare the previous project fixture with the current one.
 * A record is not "disappeared" when its source resolves through an alias,
 * its Hugging Face internal id matches another current record, or its old id
 * already has a legacy redirect to a current id.
 */
export function diffProjects(
  previousProjects,
  currentProjects,
  aliases,
  legacyIds
) {
  const currentIds = new Set(currentProjects.map((project) => project.id));
  const currentBySource = new Map(
    currentProjects.map((project) => [project.sourceId, project])
  );
  const currentByInternalId = new Map(
    currentProjects
      .filter((project) => project.hfInternalId)
      .map((project) => [project.hfInternalId, project])
  );
  const aliasesAdded = [];
  const disappeared = [];

  for (const previous of previousProjects) {
    if (!previous?.id || !previous?.sourceId) continue;
    const resolvedSource = resolveSourceAlias(previous.sourceId, aliases);
    const current =
      currentBySource.get(resolvedSource) ??
      (previous.hfInternalId
        ? currentByInternalId.get(previous.hfInternalId)
        : null);

    if (current && current.sourceId !== previous.sourceId) {
      aliases[previous.sourceId] = current.sourceId;
      aliasesAdded.push({
        oldSourceId: previous.sourceId,
        newSourceId: current.sourceId,
      });
    }
    if (current && current.id !== previous.id) {
      legacyIds[previous.id] = current.id;
    }

    const legacyTarget = legacyIds[previous.id];
    if (!current && !(legacyTarget && currentIds.has(legacyTarget))) {
      disappeared.push({
        id: previous.id,
        sourceId: previous.sourceId,
        hfInternalId: previous.hfInternalId ?? null,
        title: previous.title,
        category: previous.projectCategories?.[1]?.name ?? null,
      });
    }
  }

  return { aliasesAdded, disappeared };
}
