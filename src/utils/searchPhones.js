export function searchPhones(query, phones) {
  if (!query.trim()) return [];

  const normalize = (text) =>
    text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  const searchTerms = normalize(query).match(/[a-z0-9]+/g) || [];

  if (searchTerms.length === 0) return [];

  return phones.filter((phone) => {
    const searchable = normalize(`${phone.brand} ${phone.model}`);
    return searchTerms.every((term) => searchable.includes(term));
  });
}