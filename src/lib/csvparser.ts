import parse from 'csv-parse';

export class CSVParser {
  protected txnMap = {};
  protected srcName: string = 'Generic Parser';

  parseCSVRecords(records: any[]): any[] {
    records.forEach(function(record: any) {
      Object.keys(record).forEach(function(key: string) {
        if (this.txnMap[key]) {
          let name: string = this.txnMap[key];
          record[name] = record[key];
        }
        delete record[key];
      }.bind(this));
      record.txn_src = this.srcName;
    }.bind(this));

    return records;
  }

  parseCSVFile(input: string): Promise<any> {
    return new Promise(
      function(resolve: Function, reject: Function) {
        this.sanitiseInput(input).then(function(csv_text: string) {
          parse(
            csv_text, { columns: true },
            function(err: string, records: any[]) {
              if (err) {
                throw new Error(err);
              }

              resolve(this.parseCSVRecords(records));
            }.bind(this)
          );
        }.bind(this));
      }.bind(this)
    );
  }

  protected sanitiseInput(input: string): Promise<any> {
    input = input.replace(/,\n/,"\n");
    input = input.replace(/,\r\n/,"\r\n");
    input = input.replace(/'/g,'');

    return new Promise((resolve, reject) => resolve(input));
  }
}
