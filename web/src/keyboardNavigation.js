const parseCellId = (cellId) => {
  return [cellId[0], parseInt(cellId.slice(1), 10)];
};

export const getCellDownId = (currId) => {
  const [currCol, currRow] = parseCellId(currId);

  if (currRow === 10) {
    return currCol === "J"
      ? "A1"
      : `${String.fromCharCode(currCol.charCodeAt(0) + 1)}1`;
  } else {
    return `${currCol}${currRow + 1}`;
  }
};

export const getCellUpId = (currId) => {
  const [currCol, currRow] = parseCellId(currId);

  if (currRow === 1) {
    return currCol === "A"
      ? "J10"
      : `${String.fromCharCode(currCol.charCodeAt(0) - 1)}10`;
  } else {
    return `${currCol}${currRow - 1}`;
  }
};

export const getCellLeftId = (currId) => {
  const [currCol, currRow] = parseCellId(currId);

  if (currCol === "A") {
    return `J${currRow}`;
  } else {
    return `${String.fromCharCode(currCol.charCodeAt(0) - 1)}${currRow}`;
  }
};

export const getCellRightId = (currId) => {
  const [currCol, currRow] = parseCellId(currId);

  if (currCol === "J") {
    return `A${currRow}`;
  } else {
    return `${String.fromCharCode(currCol.charCodeAt(0) + 1)}${currRow}`;
  }
};

export const eventKeysToAction = {
  ArrowDown: getCellDownId,
  Enter: getCellDownId,
  ArrowUp: getCellUpId,
  ArrowLeft: getCellLeftId,
  ArrowRight: getCellRightId,
  Tab: getCellRightId,
};
