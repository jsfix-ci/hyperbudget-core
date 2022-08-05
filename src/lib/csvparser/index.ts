import parse from 'csv-parse';

export class CSVParser {
  protected txnMap: {[key: string]: string} = {};
  protected srcName: string = 'Generic Parser';

  parseCSVRecords(records: any[]): any[] {
    records.forEach((record: any) => {
      Object.keys(record).forEach((key: string) => {
        if (this.txnMap[key]) {
          let name: string = this.txnMap[key];
          record[name] = record[key];
        }
        // bahahha, nice bug
        if (key !== this.txnMap[key]) {
          delete record[key];
        }
      });
      record.source = this.srcName;
    });

    return records;
  }

  parseCSVFile(input: string): Promise<any[]> {
    return new Promise((resolve, reject) => {
      this.sanitiseInput(input).then((csv_text: string) => {
        parse.parse(csv_text, { columns: true }, (err: Error, records: any[]) => {
          if (err) {
            reject(err);
          }

          resolve(this.parseCSVRecords(records));
        });
      });
    });
  }

  protected sanitiseInput(input: string): Promise<any> {
    input = input.replace(/,\n/,"\n");
    input = input.replace(/,\r\n/,"\r\n");
    input = input.replace(/'/g,'');

    return new Promise((resolve, reject) => resolve(input));
  }
}
