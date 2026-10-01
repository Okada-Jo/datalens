import { englishMessages, gettext } from "./translate";

// Compile the English API templates once, rather than for each rendered error.
const templates = Object.keys(englishMessages)
  .filter(message => message.includes("{a}"))
  .map(message => {
    const fields: string[] = [];
    const pattern = message.split(/(\{\w+\})/).map(part => {
      if (/^\{\w+\}$/.test(part)) {
        fields.push(part.slice(1, -1));
        return "([\\s\\S]*?)";
      }
      return part.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    }).join("");

    // Only operation names and nested errors are translatable. Column names are data.
    const translatedFields = message.startsWith("Cannot apply")
      ? ["a", "c"]
      : message.startsWith("Cannot calculate") ? ["a"] : [];

    return { message, fields, translatedFields, pattern: new RegExp(`^${pattern}$`) };
  });

export function translateMessage(message: string): string {
  if (Object.hasOwn(englishMessages, message)) return gettext(message);

  for (const template of templates) {
    const match = message.match(template.pattern);
    if (!match) continue;

    const values = Object.fromEntries(template.fields.map((field, index) => {
      const value = match[index + 1];
      return [field, template.translatedFields.includes(field) ? translateMessage(value) : value];
    }));
    return gettext(template.message, values);
  }

  return message;
}
