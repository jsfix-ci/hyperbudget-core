import { CSVParser } from '../csvparser';
import { HSBCCSVParser } from '../csvparser/hsbc';
import { LloydsCSVParser } from '../csvparser/lloyds';
import { MidataCSVParser } from '../csvparser/midata';
import { FairFXCorpCSVParser } from '../csvparser/fairfxcorp';
import { RBSCSVParser } from '../csvparser/rbs';

export class CSVParserManager {
    static parseCSVFile (input: string, type: string): Promise<any> {
        let parser: CSVParser;

        switch (type) {
            case 'lloyds':
            parser = new LloydsCSVParser();
            break;
            case 'hsbc':
            parser = new HSBCCSVParser();
            break;
            case 'fairfx-corp':
            parser = new FairFXCorpCSVParser();
            break;
            case 'midata':
            parser = new MidataCSVParser();
            break;
            case 'rbs':
            parser = new RBSCSVParser();
            break;
            default:
            throw new Error(`CSV file Type ${type} unknown`);
        }

        return parser.parseCSVFile(input);
    }
}