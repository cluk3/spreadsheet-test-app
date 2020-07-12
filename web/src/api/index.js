const apiEndpoint = process.env.REACT_APP_API_ENDPOINT;

export const getAll = async () => {
  const res = await fetch(`${apiEndpoint}/api/cells/`);
  if (!res.ok) throw res;

  const data = await res.json();
  return data.map((cell) => ({
    ...cell,
    id: cell.col + cell.row,
  }));
};

export const updateCellValue = async (id, newValue) => {
  const [colId] = id;
  const rowId = id.slice(1);
  const res = await fetch(`${apiEndpoint}/api/cell/${colId}_${rowId}/`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      value: newValue,
    }),
  });
  if (!res.ok) throw res;
  const data = await res.json();
  return data.map((cell) => ({
    ...cell,
    id: cell.col + cell.row,
  }));
};
