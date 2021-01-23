export class GoogleSheet {
    [x: string]: any;
    id: number;
    name: string;
    sheetid: string;
    status: number;
    sourcecode: string;
    target_companyid: number;
    sheet_url: string;

    constructor() {
        this.id = -1;
        this.name = '';
        this.sheetid = '';
        this.status = 0;
        this.sourcecode = '';
        this.target_companyid = -1;
        this.sheet_url = '';
    }
}