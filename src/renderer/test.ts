function stringInsert(originStr: string, firstInsert: string, secondInsert: string, positions: number[][]): string {
  const strLen = originStr.length;
  // const spanTagBegin = '<span className="search-match">';
  // const spanTagClosing = '</span>';

  let posArr: number[] = [];
  positions.forEach((pos) => {
    console.log(`pos ${pos}`);
    posArr = posArr.concat(pos);
  });
  let highlightFromBegin = true;
  if (posArr[0] !== 0) {
    posArr.unshift(0);
    highlightFromBegin = false;
  }
  if (posArr[strLen - 1] !== strLen - 1) { posArr.push(strLen); }

  console.log(`posArr: ${posArr}`);
  const posArrLen = posArr.length;
  const newPosArr: string[] = [];
  posArr.forEach((pos, index, arr) => {
    if (index === posArrLen - 1) { return; }
    if (highlightFromBegin) {
      if (index % 2 === 0) {
        newPosArr.push(firstInsert + originStr.slice(pos, arr[index + 1]) + secondInsert);
      } else {
        newPosArr.push(originStr.slice(pos, arr[index + 1]));
      }
    } else {
      if (index % 2 === 0) {
        newPosArr.push(originStr.slice(pos, arr[index + 1]));
      } else {
        newPosArr.push(firstInsert + originStr.slice(pos, arr[index + 1]) + secondInsert);
      }
    }
  });
  console.log(newPosArr.join(''));
  return newPosArr.join('');
}

const s = 'ItIsAStringForTesting';
const first = '<span className="search-match">';
const second = '</span>';
const p = [
  [1, 3],
  [5, 8]
];

stringInsert(s, first, second, p);