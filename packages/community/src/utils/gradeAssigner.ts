const gradeEnum = {
  1: '태양',
  3: '지구',
  4: '화성',
  5: '목성',
  6: '토성',
  7: '천왕성',
  8: '해왕성',
  9: '명왕성',
};

export function gradeAssigner(grade: number) {
  if (grade in gradeEnum) {
    return gradeEnum[grade as keyof typeof gradeEnum];
  } else {
    return;
  }
}
