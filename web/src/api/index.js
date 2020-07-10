const apiEndpoint = process.env.REACT_APP_API_ENDPOINT;

export const getAll = async () => {
  const res = await fetch(`${apiEndpoint}/api/cells/`);
  const data = await res.json();
  return data.map((cell) => ({
    ...cell,
    id: cell.col + cell.row,
  }));
};

export const updateCellValue = async (id, newValue) => {
  const res = await fetch(`${apiEndpoint}/api/cell/${id[0]}_${id[1]}/`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      value: newValue,
    }),
  });
  const data = await res.json();
  return data.map((cell) => ({
    ...cell,
    id: cell.col + cell.row,
  }));
};
