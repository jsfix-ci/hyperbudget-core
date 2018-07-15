export type Breakdown = {
  [k: string]: {
      in: number,
      main_in: number,
      out: number,
      gains: number,
      main_gains: number,
      running: number,
      running_main: number,
  }
};

export type BreakdownFormatted = {
  month: string;
  in: string;
  out: string;
  gains: string;
  main_in: string;
  main_gains: string;
  running: string;
  running_main: string;
};
