export function convertDataToJsonSchema(data: any): any {
  if (data === null) {
    return { type: 'null' };
  }

  if (Array.isArray(data)) {
    if (data.length === 0) {
      return { type: 'array', items: {} };
    }

    // const itemType = convertDataToJsonSchema(data[0]);

    // // Check if all items have the same schema type
    // const allSameType = data.every(
    //   (item) =>
    //     JSON.stringify(convertDataToJsonSchema(item)) ===
    //     JSON.stringify(itemType)
    // );

    const value = data.reduce((acc: any, item: any) => {
      if (typeof item === 'object') {
        return { ...acc, ...item };
      }
      return acc;
    });

    const itemType = convertDataToJsonSchema(value);

    return { type: 'array', items: itemType };
  }

  if (typeof data === 'object') {
    const properties: { [key: string]: any } = {};
    const required: string[] = [];

    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        properties[key] = convertDataToJsonSchema(data[key]);
        required.push(key);
      }
    }

    return {
      type: 'object',
      properties,
      required,
    };
  }

  return { type: typeof data };
}
