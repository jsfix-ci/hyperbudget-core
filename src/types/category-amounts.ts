export type CategoryAmounts =  {
  [key:string]: {
    total: number | string,
    count: number,
    id?: string,
    name: string,
    className: string,
  }
};
