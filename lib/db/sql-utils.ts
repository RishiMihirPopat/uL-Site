/**
 * SQL Query Utilities for parameterization and dynamic query generation (SRP & DRY).
 */

export interface ParameterizedQuery {
  query: string;
  values: unknown[];
}

/**
 * Builds a parameterized SQL UPDATE query statement with positional placeholders ($1, $2...).
 * Safely wraps column identifiers in double quotes and tracks parameter values.
 */
export function buildParameterizedUpdate(
  tableName: string,
  id: string,
  updates: Record<string, unknown>,
  options: { setUpdatedAt?: boolean } = {}
): ParameterizedQuery | null {
  const keys = Object.keys(updates).filter(
    (k) =>
      k !== 'id' &&
      k !== 'created_at' &&
      k !== 'updated_at' &&
      updates[k] !== undefined
  );

  const setClauses: string[] = [];
  const values: unknown[] = [];

  keys.forEach((key) => {
    values.push(updates[key]);
    setClauses.push(`"${key}" = $${values.length}`);
  });

  if (options.setUpdatedAt) {
    setClauses.push(`"updated_at" = NOW()`);
  }

  if (setClauses.length === 0) return null;

  values.push(id);
  const idParamIndex = values.length;

  const query = `UPDATE ${tableName} SET ${setClauses.join(', ')} WHERE "id" = $${idParamIndex}`;
  return { query, values };
}
