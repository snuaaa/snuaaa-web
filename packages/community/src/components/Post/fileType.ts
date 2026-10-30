/** The type the API records for an upload (`routes/content.ts`). */
export function fileTypeFromName(name: string) {
  const ext = name.split('.').pop()?.toLowerCase() ?? '';
  if (['jpg', 'jpeg', 'png'].includes(ext)) return 'IMG';
  if (['doc', 'docx'].includes(ext)) return 'DOC';
  if (['xls', 'xlsx'].includes(ext)) return 'XLS';
  if (['ppt', 'pptx'].includes(ext)) return 'PPT';
  if (['pdf', 'hwp', 'zip'].includes(ext)) return ext.toUpperCase();
  return undefined;
}
