import { Plugin } from 'vite';
import path from 'path';
import { createGenerator } from 'ts-json-schema-generator';

export function typeToSchemaPlugin(): Plugin {
  return {
    name: 'vite-plugin-type-to-schema',
    enforce: 'pre',
    async transform(code, id) {
      if (!id.endsWith('.ts') && !id.endsWith('.tsx')) return null;

      if (id.endsWith('json-schema-exporter.ts')) return null;

      // Look for `convertToJsonSchema<Type>()` using a regular expression
      const regex = /convertToJsonSchema<(\w+)>\(\)/g;
      const matches = [...(code.matchAll(regex) as any)];

      if (matches.length === 0) return null;

      // Path to the current TypeScript file
      const tsConfigPath = path.resolve(process.cwd(), 'tsconfig.json');

      let transformedCode = code;

      for (const match of matches) {
        const [fullMatch, typeName] = match;

        // Generate the JSON schema for the given type
        const schema = generateSchema(id, typeName, tsConfigPath);

        console.log({schema})

        // Replace the `convertToJsonSchema<Type>()` with the generated schema
        transformedCode = transformedCode.replace(
          fullMatch,
          JSON.stringify(schema)
        );
      }

      return transformedCode;
    },
  };
}

function generateSchema(
  filePath: string,
  typeName: string,
  tsConfigPath: string
) {
  const generator = createGenerator({
    path: filePath,
    tsconfig: tsConfigPath,
    type: typeName,
    expose: 'all',
  });
  return generator.createSchema(typeName);
}
